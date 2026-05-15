# Event Registration Form Redesign + Auto-Account Creation

**Date:** 2026-05-15
**Status:** Draft

## Summary

Redesign the event registration form to always include 8 mandatory data fields plus a B2B opt-in toggle. When a non-registered person submits the form, auto-create a Supabase auth account for them so they can access full B2B features via magic link. Existing users are auto-linked.

## Requirements

### Mandatory Registration Fields (locked, always required)

| # | Field | Type | Validation |
|---|-------|------|------------|
| 1 | Full Name | text | Required, min 2 chars |
| 2 | Phone | phone + country code | Required, valid phone |
| 3 | Email | email | Required, valid email format |
| 4 | Company Name | text | Required, min 2 chars |
| 5 | Short Company Description | textarea | Required, min 10 chars, max 500 chars |
| 6 | Interests | multi-select dropdown | Required, min 1 selection, platform-wide list |
| 7 | Sector | single-select dropdown | Required, platform-wide list |
| 8 | Social URL (LinkedIn/Website/any) | URL input | Required, valid URL |

**B2B Opt-in Toggle** (always present, not a mandatory data field):

| Want B2B Matching? | toggle (yes/no) | Default: No |

All 8 data fields + the B2B toggle are hardcoded in the registration page. Organizers cannot remove, hide, or make them optional. Organizers can still add custom fields on top of these via CustomFormsTab.

### Predefined Lists

**PLATFORM_INTERESTS** (multi-select): AI/ML, FinTech, CleanTech, AgriTech, HealthTech, EdTech, E-commerce, SaaS, IoT, Blockchain, Cybersecurity, Marketing, Investment, Export, Partnership, Sustainability, Digital Transformation, Supply Chain, Human Resources, Legal/Compliance

**PLATFORM_SECTORS** (single-select): Technology, Finance & Banking, Healthcare, Agriculture, Education, Energy & Utilities, Manufacturing, Retail & Commerce, Tourism & Hospitality, Creative Industries, Logistics & Transport, Real Estate, Telecommunications, Food & Beverage, Mining & Resources, Government & Public Sector, Non-Profit & NGO

These lists are stored as constants in code (e.g., `src/constants/platformFields.ts`).

## Architecture

### Approach: Registration-First Account Creation

On form submit, the frontend calls a Supabase Edge Function that handles everything server-side.

### Registration Flow

```
1. Attendee fills 8 mandatory fields + optional custom fields → clicks "Register"
2. Frontend validates all fields client-side
3. Frontend calls Edge Function: `create-event-registration`

   Edge Function (server-side, admin privileges):

   a. Check if email exists in auth.users
      → EXISTS: get user_id, enrich profile with new data (fill empty fields only)
      → NOT EXISTS: create user via supabase.auth.admin.createUser({
           email,
           email_confirm: true,
           user_metadata: { full_name, phone, company, sector, ... },
           app_metadata: { account_type: 'event_guest' }
         })
         → DB trigger auto-creates profiles row
         → Update profile with all registration data

   b. Insert into event_attendees {
        event_id, profile_id: user_id, email, name,
        status: 'registered',
        meta: { all form data, b2b_opt_in, confirmation_code }
      }

   c. Handle duplicate registration (email + event_id unique constraint):
      → If duplicate detected, return existing registration

   d. If B2B opted in:
      → Generate magic link via supabase.auth.admin.generateLink({ type: 'magiclink', email })
      → Send confirmation email WITH magic link for B2B access

   e. If B2B not opted in:
      → Send standard confirmation email (no magic link)

   f. Return { success, attendee_id, confirmation_code }

4. Frontend shows success screen with confirmation code + QR code
```

### Magic Link Flow

**Immediate email (on registration):**
- Subject: "Your B2B Networking Access for [Event Name]"
- Contains: registration confirmation + "Access B2B Networking" button
- Generated via `supabase.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo: '/event-auth?redirect=/b2b/[eventId]' } })`
- Supabase handles the OTP token internally — the returned `action_link` is used directly in the email
- Clicking authenticates the user via Supabase's OTP flow, then redirects to `/event-auth` which reads the `redirect` param and sends them to the B2B center

**Reminder email (before event) — descoped to follow-up:**
- This feature requires pg_cron infrastructure setup and a dedicated Edge Function
- Will be designed and implemented in a separate spec after the core registration flow is complete
- Tracking field `last_magic_link_sent_at` on `event_attendees` to be added in that spec

### B2B Access

Once authenticated via magic link:
- Full B2B access: suggestions, accept/dismiss, schedule meetings, chat, marketplace
- No feature restrictions compared to full accounts
- AuthContext picks up the session normally

### Account Upgrade Path

- Banner in B2B center for `event_guest` accounts: "Want to use Eventra for future events? Set a password"
- Clicking opens password-set form: `supabase.auth.updateUser({ password })`
- `app_metadata.account_type` update requires server-side privileges — handled by a new Edge Function `upgrade-guest-account` (or a Postgres trigger on password change) since `app_metadata` cannot be written from the client
- No data loss — profile, registrations, B2B data all preserved

### Existing User Handling

When email already exists in auth.users:
- Auto-link: set `event_attendees.profile_id` to existing user's ID
- Enrich profile: fill empty profile fields with registration data (never overwrite existing data)
- Send magic link if B2B opted in (even existing users benefit from quick access)

## Data Model Changes

### New Profile Columns

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_url TEXT;
-- Note: `interests` column already exists as TEXT[] in profiles table
```

Existing columns already cover: `full_name`, `phone` (not phone_number), `email`, `company`, `industry`, `interests`

**Required code updates:**
- Add `sector`, `company_description`, `social_url` to `src/types/profile.ts` Profile interface
- Add these three columns to `PROFILE_COLUMNS` in `src/contexts/AuthContext.tsx`

### New Constants File

`src/constants/platformFields.ts`:
- `PLATFORM_INTERESTS: string[]`
- `PLATFORM_SECTORS: string[]`

### app_metadata Addition

`account_type: 'event_guest' | 'user'` — set on user creation, distinguishes auto-created from full accounts.

### Edge Function

New Supabase Edge Function: `supabase/functions/create-event-registration/index.ts`

Responsibilities:
1. User lookup/creation (admin API)
2. Profile enrichment
3. Event attendee insertion
4. Magic link generation
5. Email sending (confirmation + optional B2B magic link)

**Security & CORS:**
- Called from browser frontend using Supabase anon key
- CORS headers: allow origin from app domain(s), methods POST, content-type JSON
- Input validation: verify `event_id` exists and event is active (not cancelled/past)
- Rate limiting: max 5 registrations per email per hour (prevent abuse)
- All user creation uses admin API server-side only — no admin credentials exposed to client

## Impact on Existing Systems

### Registration Page (32_Event_Registration_Flow.tsx)
- Major refactor: renders 8 system fields before custom fields
- Form submission calls Edge Function instead of direct Supabase inserts
- Success screen unchanged

### CustomFormsTab (organizer form builder)
- No functional changes
- Add info banner: "Every registration form includes 8 mandatory fields by default"
- Custom fields render after system fields

### B2B Matching Engine (EventB2BMatchmakingTab.tsx)
- Since the Edge Function writes all standardized fields (interests, sector, etc.) to `event_attendees.meta` at registration time, `buildMatchProfile()` continues to read from `attendee.meta` as before — no async changes needed
- Standardized interests/sectors from predefined lists improve matching quality automatically
- No algorithm or data source changes needed

### AuthContext
- No changes — already handles magic link sessions

### Event Auth Bridge (98_Event_Auth_Bridge.tsx)
- No changes — magic link redirect handling already works

### RLS Policies
- Verify event_guest accounts can access B2B tables (event_b2b_suggestions, event_b2b_meetings)
- Should work since profile_id is always set and existing RLS checks profile_id

### Existing Anonymous Invitation System
- The `send-signup-invitation` Edge Function and `anonymous_signup_invitations` table remain active but will naturally stop triggering for new registrants since `get_eligible_anonymous_registrants` looks for attendees without `profile_id` — and the new flow always sets `profile_id`
- No immediate code changes needed, but verify the RPC query to confirm it filters correctly
- Full deprecation can happen in a follow-up cleanup

## Error Handling

| Scenario | Handling |
|----------|----------|
| Email already registered for this event | Return existing registration, show success |
| Edge Function fails | Show error, allow retry, log to monitoring |
| Magic link generation fails | Registration still succeeds, log error, send magic link via retry job |
| Profile enrichment fails | Registration still succeeds, profile update retried |
| Invalid URL in social field | Client-side validation catches before submit |

## Testing Strategy

- Unit tests for field validation logic
- Integration test for Edge Function (user creation, profile enrichment, attendee insertion)
- E2E test: full registration flow for new user with B2B opt-in
- E2E test: registration for existing user
- E2E test: duplicate registration handling
- E2E test: magic link → B2B center access
