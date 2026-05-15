# Registration Form Redesign + Auto-Account Creation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign event registration to always show 8 mandatory fields + B2B toggle, auto-create Supabase auth accounts for guest registrants, and send magic links for B2B access.

**Architecture:** Frontend renders hardcoded system fields before custom form fields. On submit, a Supabase Edge Function handles user lookup/creation (admin API), profile enrichment, attendee insertion, and magic link generation. Existing users are auto-linked. Email sending stays client-side for now (uses existing `sendEmail` + `generateRegistrationEmailHtml` utilities).

**Tech Stack:** React + TypeScript, Supabase (auth admin API, Edge Functions with Deno), existing i18n system, existing email utilities.

**Spec:** `docs/superpowers/specs/2026-05-15-registration-form-auto-account-design.md`

**Note on rate limiting:** The spec mentions rate limiting (5 registrations/email/hour). This is descoped from the initial implementation and will be added as a follow-up once the core flow is working.

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/constants/platformFields.ts` | Predefined PLATFORM_INTERESTS and PLATFORM_SECTORS lists |
| Create | `database/scripts/sql_add_profile_registration_fields.txt` | SQL migration for new profile columns |
| Create | `supabase/functions/create-event-registration/index.ts` | Edge Function: user creation, profile enrichment, attendee insert, magic link |
| Modify | `src/types/profile.ts` | Add sector, company_description, social_url to Profile interface |
| Modify | `src/contexts/AuthContext.tsx:6` | Add new columns to PROFILE_COLUMNS |
| Modify | `src/pages/32_Event_Registration_Flow.tsx` | Replace form field logic with system fields, call Edge Function on submit |
| Modify | `src/lib/email.ts:33` | Add optional `magicLink` param to `generateRegistrationEmailHtml` |
| Modify | `src/components/wizard/CustomFormsTab.tsx:750` | Update info banner text about mandatory default fields |
| Modify | `src/i18n/locales/en.ts` | Add English translation keys for system fields |
| Modify | `src/i18n/locales/fr.ts` | Add French translation keys for system fields |
| Modify | `src/i18n/locales/ar.ts` | Add Arabic translation keys for system fields |

---

## Task 1: Create Platform Constants File

**Files:**
- Create: `src/constants/platformFields.ts`

- [ ] **Step 1: Create the constants file**

```ts
// src/constants/platformFields.ts

export const PLATFORM_INTERESTS = [
  'AI/ML',
  'FinTech',
  'CleanTech',
  'AgriTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'IoT',
  'Blockchain',
  'Cybersecurity',
  'Marketing',
  'Investment',
  'Export',
  'Partnership',
  'Sustainability',
  'Digital Transformation',
  'Supply Chain',
  'Human Resources',
  'Legal/Compliance',
] as const;

export const PLATFORM_SECTORS = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Agriculture',
  'Education',
  'Energy & Utilities',
  'Manufacturing',
  'Retail & Commerce',
  'Tourism & Hospitality',
  'Creative Industries',
  'Logistics & Transport',
  'Real Estate',
  'Telecommunications',
  'Food & Beverage',
  'Mining & Resources',
  'Government & Public Sector',
  'Non-Profit & NGO',
] as const;

export type PlatformInterest = typeof PLATFORM_INTERESTS[number];
export type PlatformSector = typeof PLATFORM_SECTORS[number];
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/platformFields.ts
git commit -m "feat: add platform-wide interests and sectors constants"
```

---

## Task 2: Database Migration + Profile Type Updates

**Files:**
- Create: `database/scripts/sql_add_profile_registration_fields.txt`
- Modify: `src/types/profile.ts` (lines 1-22)
- Modify: `src/contexts/AuthContext.tsx` (line 6)

**Important:** The DB migration MUST be run on Supabase BEFORE deploying the Edge Function (Task 3). Run it in Supabase SQL Editor.

- [ ] **Step 1: Create the migration SQL file**

```sql
-- Add new profile columns for registration system fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_url TEXT;

-- Note: interests column already exists as text[] in profiles table
-- No change needed for interests

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('sector', 'company_description', 'social_url', 'interests');
```

- [ ] **Step 2: Run migration on Supabase**

Run the SQL above in the Supabase SQL Editor (dashboard) to add the columns. Verify the SELECT returns 4 rows.

- [ ] **Step 3: Add new fields to Profile interface**

In `src/types/profile.ts`, add these 3 fields before the `created_at` line:

```ts
  sector: string | null;
  company_description: string | null;
  social_url: string | null;
```

The full interface after `interests`:
```ts
  interests: string[] | null;
  sector: string | null;
  company_description: string | null;
  social_url: string | null;
  created_at: string;
  updated_at: string;
```

- [ ] **Step 4: Update PROFILE_COLUMNS in AuthContext**

In `src/contexts/AuthContext.tsx` line 6, update the string to include the 3 new columns:

```ts
const PROFILE_COLUMNS = 'id, email, full_name, avatar_url, role, plan, language, job_title, company, location, bio, phone, website, linkedin_url, professional_data, b2b_profile, industry, interests, sector, company_description, social_url, created_at, updated_at';
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors related to Profile type

- [ ] **Step 6: Commit**

```bash
git add database/scripts/sql_add_profile_registration_fields.txt src/types/profile.ts src/contexts/AuthContext.tsx
git commit -m "feat: add sector, company_description, social_url to profile"
```

---

## Task 3: Create Edge Function — `create-event-registration`

**Files:**
- Create: `supabase/functions/create-event-registration/index.ts`

Reference existing Edge Function pattern: `supabase/functions/send-signup-invitation/index.ts`

- [ ] **Step 1: Create the Edge Function**

```ts
// supabase/functions/create-event-registration/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RegistrationPayload {
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  company_description: string;
  interests: string[];
  sector: string;
  social_url: string;
  b2b_opt_in: boolean;
  custom_fields?: Record<string, any>;
  ticket_type?: string;
  ticket_color?: string;
  price?: number;
  selected_sessions?: string[];
}

function jsonResponse(body: Record<string, any>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const payload: RegistrationPayload = await req.json();
    const { event_id, email, full_name, phone, company_name, company_description,
            interests, sector, social_url, b2b_opt_in, custom_fields,
            ticket_type, ticket_color, price, selected_sessions } = payload;

    // --- Validate event exists and is active ---
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, name, status, date, max_capacity, owner_id')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return jsonResponse({ error: 'Event not found' }, 404);
    }

    // --- Check/create user (lookup via profiles table, not listUsers) ---
    let userId: string;
    let isNewUser = false;

    // Look up existing user by email in profiles table (indexed, scalable)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, phone, company, company_description, sector, social_url, interests')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;

      // Enrich profile — fill empty fields only
      const updates: Record<string, any> = {};
      if (!existingProfile.phone) updates.phone = phone;
      if (!existingProfile.company) updates.company = company_name;
      if (!existingProfile.company_description) updates.company_description = company_description;
      if (!existingProfile.sector) updates.sector = sector;
      if (!existingProfile.social_url) updates.social_url = social_url;
      if (!existingProfile.interests || existingProfile.interests.length === 0) updates.interests = interests;

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from('profiles').update(updates).eq('id', userId);
      }
    } else {
      // Create new user via admin API
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name, phone, company: company_name },
        app_metadata: { account_type: 'event_guest' },
      });

      if (createError || !newUser?.user) {
        return jsonResponse({ error: 'Failed to create user', details: createError?.message }, 500);
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Wait briefly for DB trigger to create profile row, then enrich
      await new Promise(resolve => setTimeout(resolve, 500));

      await supabaseAdmin.from('profiles').update({
        full_name,
        phone,
        company: company_name,
        company_description,
        sector,
        social_url,
        interests,
      }).eq('id', userId);
    }

    // --- Generate confirmation code ---
    const confirmationCode = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // --- Build meta (all form data for audit + B2B matching) ---
    const meta: Record<string, any> = {
      fullName: full_name,
      email,
      phone,
      companyName: company_name,
      companyDescription: company_description,
      interests,
      sector,
      socialUrl: social_url,
      b2bOptIn: b2b_opt_in,
      confirmation_code: confirmationCode,
      ...custom_fields,
    };

    // --- Insert event_attendees ---
    const { data: attendee, error: attendeeError } = await supabaseAdmin
      .from('event_attendees')
      .insert({
        event_id,
        profile_id: userId,
        email,
        name: full_name,
        ticket_type: ticket_type || 'General',
        ticket_color: ticket_color || null,
        price: price || 0,
        status: 'registered',
        meta,
      })
      .select('id')
      .single();

    // Handle duplicate registration (unique constraint on email + event_id)
    if (attendeeError?.code === '23505') {
      const { data: existing } = await supabaseAdmin
        .from('event_attendees')
        .select('id, meta')
        .eq('event_id', event_id)
        .eq('email', email)
        .single();

      return jsonResponse({
        success: true,
        attendee_id: existing?.id,
        confirmation_code: existing?.meta?.confirmation_code || confirmationCode,
        already_registered: true,
        user_id: userId,
      });
    }

    if (attendeeError) {
      return jsonResponse({ error: 'Failed to register', details: attendeeError.message }, 500);
    }

    // --- Insert session selections ---
    if (selected_sessions && selected_sessions.length > 0) {
      const sessionRows = selected_sessions.map(sessionId => ({
        attendee_id: attendee.id,
        session_id: sessionId,
        event_id,
      }));
      await supabaseAdmin.from('event_attendee_sessions').insert(sessionRows);
    }

    // --- Generate magic link if B2B opted in ---
    let magicLink: string | null = null;
    if (b2b_opt_in) {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `/event-auth?redirect=/b2b/${event_id}` },
      });
      magicLink = linkData?.properties?.action_link || null;
    }

    // --- Return success ---
    return jsonResponse({
      success: true,
      attendee_id: attendee.id,
      confirmation_code: confirmationCode,
      already_registered: false,
      is_new_user: isNewUser,
      magic_link: magicLink,
      user_id: userId,
    });

  } catch (err) {
    return jsonResponse({ error: 'Internal error', details: String(err) }, 500);
  }
});
```

- [ ] **Step 2: Verify file structure matches existing Edge Function pattern**

Run: `ls supabase/functions/`
Expected: See both `send-signup-invitation/` and `create-event-registration/`

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/create-event-registration/index.ts
git commit -m "feat: add create-event-registration Edge Function"
```

---

## Task 4: Add i18n Translation Keys

**Files:**
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/fr.ts`
- Modify: `src/i18n/locales/ar.ts`

The translation files use **nested object** structure, NOT flat dot-notation strings. Add a `registration` key at the top level of each locale object (alongside existing top-level keys like `wizard`, `b2b`, etc.).

- [ ] **Step 1: Add English translation keys to `src/i18n/locales/en.ts`**

Find the end of the top-level object (before the final `}`) and add:

```ts
  registration: {
    systemFields: {
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      companyName: 'Company Name',
      companyDescription: 'Short Company Description',
      companyDescriptionPlaceholder: 'Briefly describe what your company does (10-500 characters)',
      interests: 'Interests',
      interestsPlaceholder: 'Select your interests',
      sector: 'Sector',
      sectorPlaceholder: 'Select your sector',
      socialUrl: 'Social / Website URL',
      socialUrlPlaceholder: 'https://linkedin.com/in/yourprofile',
      b2bOptIn: 'Want B2B Matching?',
      b2bOptInDescription: 'Get matched with relevant attendees for business networking',
    },
    additionalFields: 'Additional Information',
    customFormsInfo: 'Every registration form includes 8 mandatory fields (name, email, phone, company, etc.) by default. Custom fields appear after these.',
  },
```

- [ ] **Step 2: Add French translation keys to `src/i18n/locales/fr.ts`**

Same structure:

```ts
  registration: {
    systemFields: {
      fullName: 'Nom complet',
      phone: 'Numéro de téléphone',
      email: 'Adresse e-mail',
      companyName: "Nom de l'entreprise",
      companyDescription: "Brève description de l'entreprise",
      companyDescriptionPlaceholder: "Décrivez brièvement ce que fait votre entreprise (10-500 caractères)",
      interests: 'Intérêts',
      interestsPlaceholder: 'Sélectionnez vos intérêts',
      sector: 'Secteur',
      sectorPlaceholder: 'Sélectionnez votre secteur',
      socialUrl: 'URL sociale / site web',
      socialUrlPlaceholder: 'https://linkedin.com/in/votreprofil',
      b2bOptIn: 'Souhaitez-vous le matching B2B ?',
      b2bOptInDescription: 'Soyez mis en relation avec des participants pertinents pour le réseautage professionnel',
    },
    additionalFields: 'Informations complémentaires',
    customFormsInfo: "Chaque formulaire d'inscription comprend 8 champs obligatoires par défaut. Les champs personnalisés apparaissent après.",
  },
```

- [ ] **Step 3: Add Arabic translation keys to `src/i18n/locales/ar.ts`**

Same structure:

```ts
  registration: {
    systemFields: {
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      companyName: 'اسم الشركة',
      companyDescription: 'وصف مختصر للشركة',
      companyDescriptionPlaceholder: 'صف بإيجاز ما تقوم به شركتك (10-500 حرف)',
      interests: 'الاهتمامات',
      interestsPlaceholder: 'اختر اهتماماتك',
      sector: 'القطاع',
      sectorPlaceholder: 'اختر قطاعك',
      socialUrl: 'رابط التواصل الاجتماعي / الموقع',
      socialUrlPlaceholder: 'https://linkedin.com/in/ملفك',
      b2bOptIn: 'هل تريد المطابقة B2B؟',
      b2bOptInDescription: 'احصل على مطابقة مع المشاركين ذوي الصلة للتواصل التجاري',
    },
    additionalFields: 'معلومات إضافية',
    customFormsInfo: 'يتضمن كل نموذج تسجيل 8 حقول إلزامية بشكل افتراضي. تظهر الحقول المخصصة بعدها.',
  },
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales/en.ts src/i18n/locales/fr.ts src/i18n/locales/ar.ts
git commit -m "feat: add i18n keys for registration system fields (EN/FR/AR)"
```

---

## Task 5: Refactor Registration Form — System Fields

**Files:**
- Modify: `src/pages/32_Event_Registration_Flow.tsx` (lines 62-358 for types/state/fetch, lines 1042-1440 for render)

This is the largest task. It modifies the registration page to:
1. Render 8 system fields + B2B toggle before custom fields
2. Add new field types (multi-select for interests, sector dropdown)
3. Auto-fill system fields from profile

- [ ] **Step 1: Add imports**

At the top of `32_Event_Registration_Flow.tsx` (around line 30), add:

```ts
import { PLATFORM_INTERESTS, PLATFORM_SECTORS } from '../constants/platformFields';
```

- [ ] **Step 2: Add system field state**

After the existing `formFields` state (around line 93), add dedicated state for the 8 system fields + B2B toggle. These are separate from custom `formFields`:

```ts
// System fields state (mandatory, always present)
const [systemFields, setSystemFields] = useState({
  fullName: '',
  phone: '',
  phoneCountryCode: '+216',
  email: '',
  companyName: '',
  companyDescription: '',
  interests: [] as string[],
  sector: '',
  socialUrl: '',
  b2bOptIn: false,
});
const [isInterestsOpen, setIsInterestsOpen] = useState(false);
const [isSectorOpen, setIsSectorOpen] = useState(false);
const [isPhoneCountryOpen, setIsPhoneCountryOpen] = useState(false);
```

- [ ] **Step 3: Auto-fill system fields from profile**

Inside `fetchEventData` (around line 212-229 where `defaultFields` is built), add auto-fill logic for system fields when user is logged in. Also fix the existing bug where `profile.phone_number` is referenced instead of `profile.phone`:

```ts
// Auto-fill system fields from profile
if (profile) {
  setSystemFields(prev => ({
    ...prev,
    fullName: profile.full_name || prev.fullName,
    email: user?.email || profile.email || prev.email,
    phone: profile.phone || prev.phone,
    companyName: profile.company || prev.companyName,
    companyDescription: profile.company_description || prev.companyDescription,
    interests: profile.interests || prev.interests,
    sector: profile.sector || prev.sector,
    socialUrl: profile.social_url || profile.linkedin_url || prev.socialUrl,
  }));
}
```

- [ ] **Step 4: Build system fields JSX — `renderSystemFields()` function**

Add this function before the component's return statement. It renders all 8 mandatory fields + B2B toggle using the same styling as existing form fields (dark theme: `#0D243B` bg, `#0684F5` accent). The phone field reuses the country-code picker pattern from lines 1182-1251.

```tsx
const renderSystemFields = () => {
  const isReadOnly = !!profile; // Lock fields if logged in
  const fieldStyle = {
    backgroundColor: '#0D243B',
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#FFFFFF',
  };

  const updateSystemField = (key: string, value: any) => {
    setSystemFields(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* 1. Full Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.fullName', { defaultValue: 'Full Name' })} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={systemFields.fullName}
          onChange={e => updateSystemField('fullName', e.target.value)}
          readOnly={isReadOnly && !!systemFields.fullName}
          className="w-full px-3 py-2.5 rounded-lg border text-sm"
          style={fieldStyle}
          placeholder="John Doe"
        />
      </div>

      {/* 2. Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.email', { defaultValue: 'Email Address' })} <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={systemFields.email}
          onChange={e => updateSystemField('email', e.target.value)}
          readOnly={isReadOnly && !!systemFields.email}
          className="w-full px-3 py-2.5 rounded-lg border text-sm"
          style={fieldStyle}
          placeholder="john@company.com"
        />
      </div>

      {/* 3. Phone with country code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.phone', { defaultValue: 'Phone Number' })} <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <div className="relative" style={{ minWidth: '110px' }}>
            <button
              type="button"
              onClick={() => setIsPhoneCountryOpen(!isPhoneCountryOpen)}
              className="w-full flex items-center gap-1.5 px-2 py-2.5 rounded-lg border text-sm"
              style={fieldStyle}
            >
              <span>{countries.find(c => c.dialCode === systemFields.phoneCountryCode)?.flag || '🌍'}</span>
              <span className="text-white/70 text-xs">{systemFields.phoneCountryCode}</span>
              <ChevronDown size={12} className="ml-auto text-white/50" />
            </button>
            {isPhoneCountryOpen && (
              <div className="absolute z-50 mt-1 w-64 max-h-48 overflow-y-auto rounded-lg border shadow-xl"
                style={{ backgroundColor: '#0D243B', borderColor: 'rgba(255,255,255,0.15)' }}>
                {countries.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { updateSystemField('phoneCountryCode', c.dialCode); setIsPhoneCountryOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                    <span className="ml-auto text-white/50">{c.dialCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="tel"
            value={systemFields.phone}
            onChange={e => updateSystemField('phone', e.target.value)}
            readOnly={isReadOnly && !!systemFields.phone}
            className="flex-1 px-3 py-2.5 rounded-lg border text-sm"
            style={fieldStyle}
            placeholder="12345678"
          />
        </div>
      </div>

      {/* 4. Company Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.companyName', { defaultValue: 'Company Name' })} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={systemFields.companyName}
          onChange={e => updateSystemField('companyName', e.target.value)}
          readOnly={isReadOnly && !!systemFields.companyName}
          className="w-full px-3 py-2.5 rounded-lg border text-sm"
          style={fieldStyle}
          placeholder="Acme Corp"
        />
      </div>

      {/* 5. Short Company Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.companyDescription', { defaultValue: 'Short Company Description' })} <span className="text-red-400">*</span>
        </label>
        <textarea
          value={systemFields.companyDescription}
          onChange={e => updateSystemField('companyDescription', e.target.value)}
          readOnly={isReadOnly && !!systemFields.companyDescription}
          className="w-full px-3 py-2.5 rounded-lg border text-sm resize-none"
          style={fieldStyle}
          rows={3}
          maxLength={500}
          placeholder={t('registration.systemFields.companyDescriptionPlaceholder', { defaultValue: 'Briefly describe what your company does (10-500 characters)' })}
        />
        <p className="text-xs mt-1" style={{ color: systemFields.companyDescription.length < 10 ? '#EF4444' : 'rgba(255,255,255,0.4)' }}>
          {systemFields.companyDescription.length}/500
        </p>
      </div>

      {/* 6. Interests (multi-select) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.interests', { defaultValue: 'Interests' })} <span className="text-red-400">*</span>
        </label>
        {/* Selected chips */}
        {systemFields.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {systemFields.interests.map(interest => (
              <span key={interest} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: 'rgba(6,132,245,0.2)', color: '#0684F5', border: '1px solid rgba(6,132,245,0.3)' }}>
                {interest}
                <button type="button" onClick={() => updateSystemField('interests', systemFields.interests.filter(i => i !== interest))}
                  className="ml-0.5 hover:text-white">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        {/* Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsInterestsOpen(!isInterestsOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm"
            style={fieldStyle}
          >
            <span className="text-white/50">
              {t('registration.systemFields.interestsPlaceholder', { defaultValue: 'Select your interests' })}
            </span>
            <ChevronDown size={14} className="text-white/50" />
          </button>
          {isInterestsOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border shadow-xl"
              style={{ backgroundColor: '#0D243B', borderColor: 'rgba(255,255,255,0.15)' }}>
              {PLATFORM_INTERESTS.map(interest => {
                const isSelected = systemFields.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        updateSystemField('interests', systemFields.interests.filter(i => i !== interest));
                      } else {
                        updateSystemField('interests', [...systemFields.interests, interest]);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10"
                  >
                    <div className="w-4 h-4 rounded border flex items-center justify-center"
                      style={{ borderColor: isSelected ? '#0684F5' : 'rgba(255,255,255,0.3)', backgroundColor: isSelected ? '#0684F5' : 'transparent' }}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                    {interest}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 7. Sector (single-select) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.sector', { defaultValue: 'Sector' })} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSectorOpen(!isSectorOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm"
            style={fieldStyle}
          >
            <span className={systemFields.sector ? 'text-white' : 'text-white/50'}>
              {systemFields.sector || t('registration.systemFields.sectorPlaceholder', { defaultValue: 'Select your sector' })}
            </span>
            <ChevronDown size={14} className="text-white/50" />
          </button>
          {isSectorOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border shadow-xl"
              style={{ backgroundColor: '#0D243B', borderColor: 'rgba(255,255,255,0.15)' }}>
              {PLATFORM_SECTORS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { updateSystemField('sector', s); setIsSectorOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 ${systemFields.sector === s ? 'text-[#0684F5]' : 'text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 8. Social URL */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1.5">
          {t('registration.systemFields.socialUrl', { defaultValue: 'Social / Website URL' })} <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          value={systemFields.socialUrl}
          onChange={e => updateSystemField('socialUrl', e.target.value)}
          readOnly={isReadOnly && !!systemFields.socialUrl}
          className="w-full px-3 py-2.5 rounded-lg border text-sm"
          style={fieldStyle}
          placeholder={t('registration.systemFields.socialUrlPlaceholder', { defaultValue: 'https://linkedin.com/in/yourprofile' })}
        />
      </div>

      {/* B2B Toggle */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(6,132,245,0.08)', border: '1px solid rgba(6,132,245,0.2)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              {t('registration.systemFields.b2bOptIn', { defaultValue: 'Want B2B Matching?' })}
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              {t('registration.systemFields.b2bOptInDescription', { defaultValue: 'Get matched with relevant attendees for business networking' })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateSystemField('b2bOptIn', !systemFields.b2bOptIn)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ backgroundColor: systemFields.b2bOptIn ? '#0684F5' : 'rgba(255,255,255,0.2)' }}
          >
            <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: systemFields.b2bOptIn ? 'translateX(20px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>
    </>
  );
};
```

**Note:** This uses `ChevronDown`, `X`, `Check` from lucide-react — verify these are already imported at the top of the file. If `Check` is not imported, add it.

- [ ] **Step 5: Insert `renderSystemFields()` call in JSX**

Find the form render area where `{formFields.map((field) => (` starts (around line 1053 inside `{currentStep === 1 && (`). Insert the system fields call **before** the existing `formFields.map()` loop:

```tsx
{/* System fields (mandatory, always present) */}
{renderSystemFields()}

{/* Divider between system fields and custom fields */}
{formFields.length > 0 && (
  <div className="border-t border-white/10 my-6 pt-4">
    <p className="text-sm text-white/50 mb-4">
      {t('registration.additionalFields', { defaultValue: 'Additional Information' })}
    </p>
  </div>
)}

{/* Custom fields from event form builder */}
{formFields.map((field) => (
```

- [ ] **Step 6: Update validation in `canProceed` function**

Find the `canProceed` function (around line 660). Add system field validation so the Next button is disabled until all system fields pass:

```ts
// Add system field validation
const systemValid =
  systemFields.fullName.trim().length >= 2 &&
  systemFields.email.trim().length > 0 && /\S+@\S+\.\S+/.test(systemFields.email) &&
  systemFields.phone.trim().length > 0 &&
  systemFields.companyName.trim().length >= 2 &&
  systemFields.companyDescription.trim().length >= 10 &&
  systemFields.companyDescription.trim().length <= 500 &&
  systemFields.interests.length > 0 &&
  systemFields.sector.trim().length > 0 &&
  /^https?:\/\/.+/.test(systemFields.socialUrl);
```

Include `systemValid` in the return condition of `canProceed` for step 1.

- [ ] **Step 7: Verify build compiles**

Run: `npx vite build 2>&1 | tail -5`
Expected: "built in" success message (exit code 1 is false alarm on Windows)

- [ ] **Step 8: Commit**

```bash
git add src/pages/32_Event_Registration_Flow.tsx
git commit -m "feat: add 8 mandatory system fields to registration form"
```

---

## Task 6: Update Email Utility — Add Magic Link Support

**Files:**
- Modify: `src/lib/email.ts` (line 33, `generateRegistrationEmailHtml`)

- [ ] **Step 1: Update `generateRegistrationEmailHtml` signature**

The current signature (line 33 of `src/lib/email.ts`) is:

```ts
export function generateRegistrationEmailHtml(eventName: string, attendeeName: string, qrCodeUrl: string, sessions: any[], isAnonymous: boolean = false) {
```

Add an optional `magicLink` parameter at the end:

```ts
export function generateRegistrationEmailHtml(eventName: string, attendeeName: string, qrCodeUrl: string, sessions: any[], isAnonymous: boolean = false, magicLink?: string | null) {
```

- [ ] **Step 2: Add magic link button to email HTML**

Inside the function body, find where the HTML template is built (after the sessions list, before the closing tags). Add a conditional B2B magic link section:

```ts
const b2bSection = magicLink ? `
  <div style="margin-top: 24px; padding: 20px; background: #f0f7ff; border-radius: 8px; text-align: center;">
    <p style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">B2B Networking Access</p>
    <p style="font-size: 14px; color: #666; margin-bottom: 16px;">You opted in for B2B matchmaking. Click below to access your networking dashboard.</p>
    <a href="${magicLink}" style="background: #0684F5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
      Access B2B Networking
    </a>
  </div>
` : '';
```

Insert `${b2bSection}` into the HTML template at the appropriate location.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: add magic link support to registration confirmation email"
```

---

## Task 7: Refactor Registration Form — Edge Function Submission

**Files:**
- Modify: `src/pages/32_Event_Registration_Flow.tsx` (lines 412-615, `handleCompleteRegistration`)

Replace the direct Supabase inserts with an Edge Function call. Keep capacity alert and notification logic.

- [ ] **Step 1: Replace `handleCompleteRegistration` logic**

The function currently builds `attendeePayload` and inserts directly into `event_attendees` (lines 463-531). Replace the core insertion with an Edge Function call, but **keep** the capacity alert, email sending, and notification logic:

```ts
const handleCompleteRegistration = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    // Build custom fields from formFields
    const customFields: Record<string, any> = {};
    formFields.forEach(field => {
      if (field.type === 'phone') {
        customFields[field.label] = `${field.phoneCountryCode || ''} ${field.phoneNumber || field.value}`.trim();
      } else if (field.type === 'country') {
        customFields[field.label] = field.value;
      } else {
        customFields[field.label] = field.value;
      }
    });

    // Call Edge Function for registration + account creation
    const { data, error } = await supabase.functions.invoke('create-event-registration', {
      body: {
        event_id: eventId,
        full_name: systemFields.fullName,
        email: systemFields.email,
        phone: `${systemFields.phoneCountryCode} ${systemFields.phone}`.trim(),
        company_name: systemFields.companyName,
        company_description: systemFields.companyDescription,
        interests: systemFields.interests,
        sector: systemFields.sector,
        social_url: systemFields.socialUrl,
        b2b_opt_in: systemFields.b2bOptIn,
        custom_fields: customFields,
        ticket_type: selectedTicket?.name || 'General',
        ticket_color: selectedTicket?.color || null,
        price: selectedTicket?.price || 0,
        selected_sessions: Array.from(selectedSessions),
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    // Store confirmation data
    setRegisteredAttendeeId(data.attendee_id);

    // Increment ticket sold (use correct RPC param names: tid, qty)
    if (freeTicketId) {
      try {
        await supabase.rpc('increment_ticket_sold', { tid: freeTicketId, qty: 1 });
      } catch (err) {
        console.warn('Failed to update ticket count (RPC missing?):', err);
      }
    }

    // Capacity alert email to organizer (carry over from existing code)
    try {
      if (event?.owner_id && freeTicketId) {
        const { data: ticketInfo } = await supabase
          .from('event_tickets')
          .select('quantitySold, quantityTotal')
          .eq('id', freeTicketId)
          .maybeSingle();
        if (ticketInfo && ticketInfo.quantityTotal > 0) {
          const pct = Math.round(((ticketInfo.quantitySold || 0) / ticketInfo.quantityTotal) * 100);
          if (pct >= 80) {
            const { data: ownerProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', event.owner_id)
              .maybeSingle();
            if (ownerProfile?.email) {
              sendCapacityAlertEmail({
                organizerName: ownerProfile.full_name || 'Organizer',
                organizerEmail: ownerProfile.email,
                eventName: event.name || 'Event',
                currentCount: ticketInfo.quantitySold || 0,
                totalCapacity: ticketInfo.quantityTotal,
                percentFull: pct,
                eventId: eventId || ''
              }).catch(() => {});
            }
          }
        }
      }
    } catch { /* non-blocking */ }

    // Send confirmation email (client-side, uses existing utilities)
    if (regNotifSettings.is_email_enabled) {
      const mySessions = sessions.filter(s => selectedSessions.has(s.id));
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.attendee_id}`;
      const emailHtml = generateRegistrationEmailHtml(
        event?.name || 'Event',
        systemFields.fullName || 'Attendee',
        qrUrl,
        mySessions,
        !user,
        data.magic_link || null  // Pass magic link if B2B opted in
      );
      await sendEmail({
        to: systemFields.email,
        subject: data.magic_link
          ? `Registration Confirmed + B2B Access: ${event?.name}`
          : `Registration Confirmed: ${event?.name}`,
        html: emailHtml,
      });
    }

    // Create notification for organizer (keep existing logic)
    try {
      if (event?.owner_id && regNotifSettings.is_bell_enabled) {
        await createNotification({
          recipient_id: event.owner_id,
          actor_id: user?.id || null,
          title: 'New event registration',
          body: `${systemFields.email || 'An attendee'} registered for ${event.name || 'your event'}.`,
          type: 'action',
          action_url: `/event/${eventId}`
        });
      }
    } catch (err) { console.error(err); }

    setCurrentStep(3);
  } catch (error: any) {
    console.error('Registration error:', error);
    toast.error(sanitizeError(error, 'Registration failed. Please try again.'));
  } finally {
    setIsSubmitting(false);
  }
};
```

**Key differences from old code:**
- Uses Edge Function instead of direct `event_attendees` insert
- Uses `systemFields` instead of extracting from `formFields`
- Uses correct RPC params `{ tid: freeTicketId, qty: 1 }` (not `{ ticket_id }`)
- Keeps capacity alert email block (lines 539-569 of original)
- Passes `data.magic_link` to `generateRegistrationEmailHtml`

- [ ] **Step 2: Verify build compiles**

Run: `npx vite build 2>&1 | tail -5`
Expected: "built in" success message

- [ ] **Step 3: Commit**

```bash
git add src/pages/32_Event_Registration_Flow.tsx
git commit -m "feat: registration submits via Edge Function with magic link support"
```

---

## Task 8: Update CustomFormsTab Info Banner

**Files:**
- Modify: `src/components/wizard/CustomFormsTab.tsx` (line 750)

- [ ] **Step 1: Update the registration form info note**

In `CustomFormsTab.tsx` line 750, the current code is:
```ts
infoNote: t('wizard.step3.customForms.defaults.registration.info'),
```

Update to use the new key with a defaultValue fallback (the old key didn't exist in translations anyway — it was just relying on the key string itself):

```ts
infoNote: t('registration.customFormsInfo', { defaultValue: 'Every registration form includes 8 mandatory fields (name, email, phone, company, etc.) by default. Custom fields appear after these.' }),
```

- [ ] **Step 2: Verify build compiles**

Run: `npx vite build 2>&1 | tail -5`
Expected: "built in" success message

- [ ] **Step 3: Commit**

```bash
git add src/components/wizard/CustomFormsTab.tsx
git commit -m "feat: update CustomFormsTab banner about mandatory registration fields"
```

---

## Task 9: Deploy Edge Function + Run Migration

- [ ] **Step 1: Verify DB migration was run (from Task 2)**

In Supabase SQL Editor, run:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('sector', 'company_description', 'social_url');
```
Expected: 3 rows returned.

- [ ] **Step 2: Deploy the Edge Function to Supabase**

Run: `npx supabase functions deploy create-event-registration --project-ref <project-ref>`

Or deploy via Supabase Dashboard > Edge Functions > Deploy.

- [ ] **Step 3: Verify the function is accessible**

Test with curl:
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/create-event-registration \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"event_id":"test","email":"test@test.com","full_name":"Test"}'
```
Expected: `{"error":"Event not found"}` with 404 status — confirms function is running.

---

## Task 10: End-to-End Manual Testing

- [ ] **Step 1: Test new user registration with B2B opt-in**
1. Open `/register/<eventId>` while logged out
2. Fill all 8 fields + toggle B2B on
3. Submit — verify success screen with confirmation code
4. Check Supabase `auth.users`: new user with `app_metadata.account_type = 'event_guest'`
5. Check `profiles` table: all fields populated (company_description, sector, social_url, interests)
6. Check `event_attendees`: row with `profile_id` set, `meta` contains all data including `b2bOptIn: true`
7. Check email: confirmation with "Access B2B Networking" button

- [ ] **Step 2: Test magic link access**
1. Click magic link in email
2. Verify redirect to `/event-auth` then to B2B center for the event
3. Verify full B2B access (suggestions, meetings, etc.)

- [ ] **Step 3: Test existing user registration**
1. Log in with an existing account
2. Go to `/register/<eventId>`
3. Verify system fields auto-filled from profile (name, email, phone, company)
4. Verify auto-filled fields are read-only with lock icon
5. Submit — verify no duplicate user created in `auth.users`
6. Check `event_attendees.profile_id` matches existing user

- [ ] **Step 4: Test duplicate registration**
1. Try registering same email for same event again
2. Verify "already registered" response with existing confirmation code
3. Verify no duplicate rows in `event_attendees`

- [ ] **Step 5: Test registration without B2B**
1. Register with B2B toggle off
2. Verify no magic link in confirmation email
3. Verify account still created (check `auth.users`)

- [ ] **Step 6: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix: address issues found during registration flow testing"
```
