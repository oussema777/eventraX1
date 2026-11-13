// Shared by immediate registration and the durable background retry worker.
// Never expose provider/database diagnostics to the participant.
export async function resolveRegistrationAccess(db: any, details: any) {
  const { email, full_name, phone, company_name, company_description, interests, sector, social_url, b2b_opt_in } = details;
  try {
    // --- Resolve identity ---
    // Always look up an existing profile so registered members get linked
    // regardless of b2b_opt_in. New account creation is gated on b2b_opt_in.
    let userId: string | null = null;
    let isNewUser = false;

    const { data: existingProfile, error: profileError } = await db
      .from('profiles')
      .select('id, full_name, phone_number, company, company_description, industry, sector, social_url')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (profileError) throw new Error('ACCESS_TEMPORARY');

    if (existingProfile) {
      // Case 1 & 2: existing member — always link
      userId = existingProfile.id;

      // A legacy profile can exist while its auth account cannot sign in.
      // Resolve against the AUTH email before enriching or linking this profile.
      const { data: readyAccount, error: accountError } = await db
        .rpc('ensure_registration_auth_account', { p_user_id: userId, p_email: email });
      if (accountError || readyAccount !== userId) {
        console.warn('Registration account integrity failed', { code: accountError?.code });
        throw new Error(accountError?.message || 'ACCESS_TEMPORARY');
      }
      const { data: authAccount, error: authLookupError } = await db.auth.admin.getUserById(userId);
      if (authLookupError || authAccount?.user?.id !== userId
          || authAccount.user.email?.toLowerCase() !== email || !authAccount.user.identities?.length) {
        throw new Error('ACCESS_TEMPORARY');
      }

      if (b2b_opt_in) {
        // Enrich profile — fill empty fields only
        const updates: Record<string, any> = {};
        if (!existingProfile.full_name) updates.full_name = full_name;
        if (!existingProfile.phone_number) updates.phone_number = phone;
        if (!existingProfile.company) updates.company = company_name;
        if (!existingProfile.company_description) updates.company_description = company_description;
        if (!existingProfile.industry) updates.industry = sector;
        if (!existingProfile.sector) updates.sector = sector;
        if (!existingProfile.social_url) updates.social_url = social_url;
        // Note: interests is intentionally not written to profiles — there is no
        // profiles.interests column. Interests are persisted in event_attendees.meta
        // (below), which is where B2B matching reads them.

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await db.from('profiles').update(updates).eq('id', userId);
          if (updateError) throw new Error('ACCESS_TEMPORARY');
        }
      }
    } else if (b2b_opt_in) {
      // Case 3: no existing profile + opted in → create a new guest account
      const { data: newUser, error: createError } = await db.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name, phone, company: company_name, created_via: 'event_b2b' },
        app_metadata: { account_type: 'event_guest' },
      });

      if (createError || !newUser?.user) {
        throw new Error('ACCESS_TEMPORARY');
      }

      userId = newUser.user.id;
      isNewUser = true;

      const { data: readyAccount, error: accountError } = await db
        .rpc('ensure_registration_auth_account', { p_user_id: userId, p_email: email });
      if (accountError || readyAccount !== userId) {
        throw new Error(accountError?.message || 'ACCESS_TEMPORARY');
      }
      const { data: authAccount, error: authLookupError } = await db.auth.admin.getUserById(userId);
      if (authLookupError || authAccount?.user?.id !== userId
          || authAccount.user.email?.toLowerCase() !== email || !authAccount.user.identities?.length) {
        throw new Error('ACCESS_TEMPORARY');
      }

      // Upsert so profile prefill works even if the auth trigger is still pending.
      const { error: seedError } = await db.from('profiles').upsert({
        id: userId,
        email,
        full_name,
        phone_number: phone,
        company: company_name,
        company_description,
        industry: sector,
        sector,
        social_url,
        account_type: 'event_guest',
      }, { onConflict: 'id' });
      if (seedError) throw new Error('ACCESS_TEMPORARY');
    }
    // Case 4: no existing profile + not opted in → userId stays null, no account created

    return { userId, isNewUser, state: 'ready' as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const review = ['REGISTRATION_AUTH_ACCOUNT_MISMATCH', 'REGISTRATION_AUTH_ACCOUNT_UNAVAILABLE',
      'REGISTRATION_AUTH_IDENTITY_UNAVAILABLE', 'REGISTRATION_AUTH_IDENTITY_CONFLICT'].includes(message);
    return { userId: null, isNewUser: false, state: review ? 'review' as const : 'pending' as const };
  }
}
