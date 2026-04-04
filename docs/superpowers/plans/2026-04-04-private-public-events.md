# Private/Public Event Visibility — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow organizers to mark events as Private (requiring an access code to register) or Public, with visual badges and a registration gate.

**Architecture:** Use `access_code` column as the source of truth — if `access_code IS NOT NULL`, the event is private. The existing `is_public` boolean continues to serve its admin-approval role unchanged. This avoids breaking the existing moderation flow while cleanly separating "private/public" (organizer choice) from "approved/pending" (admin choice).

**Tech Stack:** React, TypeScript, Supabase, Lucide icons, i18n (EN/FR/AR)

**Spec:** `docs/superpowers/specs/2026-04-04-private-public-events-design.md`

---

## Important Design Note

The codebase uses `is_public` for admin approval visibility (set to `true` when admin approves). Repurposing it for "private vs public" would break the moderation flow. Instead, `access_code` presence is the private/public indicator:
- `access_code IS NOT NULL` → Private event (badge shown, registration gated)
- `access_code IS NULL` → Public event (normal flow)

This means:
- **AdminDashboard.tsx does NOT need changes** — `handleModeration` sets `is_public = true` on approval, which means "visible in browse." This is orthogonal to `access_code` (which gates registration). Admin approving a private event makes it visible in browse (correct) while the access code still gates registration (correct). Neither `handleModeration` nor `fixPublicStatus` touches the `access_code` column.
- **Browse filtering stays the same** — private events still appear in browse (per user requirement), distinguished only by a badge

---

## Task 1: Create shared access code generator utility

**Files:**
- Create: `src/utils/codeGenerator.ts`

- [ ] **Step 1: Create the utility file**

```typescript
// src/utils/codeGenerator.ts
const UNAMBIGUOUS_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateAccessCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += UNAMBIGUOUS_CHARS[Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length)];
  }
  return code;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/codeGenerator.ts
git commit -m "feat: add shared access code generator utility"
```

---

## Task 2: Update EventDraft interface and event storage types

**Files:**
- Modify: `src/hooks/useEventWizard.ts` (line 33, add `access_code` field)
- Modify: `src/utils/eventStorage.ts` (lines 6-20, add fields to interface)

- [ ] **Step 1: Add `access_code` to EventDraft interface**

In `src/hooks/useEventWizard.ts`, after line 33 (`seo_keywords?: string[];`), add:

```typescript
  access_code?: string | null;
```

The `is_public` field already exists at line 28. `access_code` will be included in the Supabase payload automatically via the spread operator at line 111 (`...data`).

- [ ] **Step 2: Add fields to EventBasicDetails interface**

In `src/utils/eventStorage.ts`, after line 19 (`waitlistCapacity?: number;`), add:

```typescript
  isPrivateEvent?: boolean;
  accessCode?: string;
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useEventWizard.ts src/utils/eventStorage.ts
git commit -m "feat: add access_code to EventDraft and storage types"
```

---

## Task 3: Add visibility toggle and access code to Wizard Step 1

**Files:**
- Modify: `src/components/wizard/EventDetailsForm.tsx`

- [ ] **Step 1: Add state variables**

After the existing state declarations (after line 53, `const [enableWaitlist, setEnableWaitlist] = useState(false);`), add:

```typescript
  const [isPrivateEvent, setIsPrivateEvent] = useState(false);
  const [accessCode, setAccessCode] = useState('');
```

- [ ] **Step 2: Import generateAccessCode**

Add to imports at top of file:

```typescript
import { generateAccessCode } from '../../utils/codeGenerator';
```

Also add `Copy, RefreshCw, Users, Eye` to the lucide-react import (Lock is already imported):

```typescript
import {
  Calendar, MapPin, Video, Globe, DollarSign, Gift, Infinity,
  ChevronDown, Check, AlertCircle, Palette, Lightbulb, FileText,
  ArrowRight, Lock, Copy, RefreshCw, Users, Eye
} from 'lucide-react';
```

- [ ] **Step 3: Load stored visibility state**

In the initialization `useEffect` (around line 124-168), after `setWaitlistCapacity(...)` (line 162), add:

```typescript
    setIsPrivateEvent(stored.isPrivateEvent ?? !!eventData.access_code);
    setAccessCode(stored.accessCode || eventData.access_code || '');
```

- [ ] **Step 4: Save visibility state to localStorage**

In the auto-save `useEffect` (around line 170-202), add `isPrivateEvent` and `accessCode` to the `saveEventBasicDetails` call:

```typescript
    saveEventBasicDetails({
      eventName, tagline, eventType, otherEventType, eventStatus, eventFormat,
      venueAddress, startDate, endDate,
      maxAttendees: hasCapacityLimit ? parseInt(maxAttendees || '0', 10) : undefined,
      hasCapacityLimit, enableWaitlist,
      waitlistCapacity: enableWaitlist ? parseInt(waitlistCapacity || '0', 10) : undefined,
      isPrivateEvent,
      accessCode
    }, eventId);
```

Also add `isPrivateEvent` and `accessCode` to the useEffect dependency array.

- [ ] **Step 5: Add access_code to buildPayload**

In `buildPayload` (around line 236-253), add to the returned object:

```typescript
      access_code: isPrivateEvent && accessCode.length >= 4 ? accessCode : null,
```

Note: If private is selected but code is too short (<4 chars), `access_code` is `null` (treated as public). The UI validation warning in Step 6 guides the user to fix this.

- [ ] **Step 6: Add the visibility section UI**

After the Event Format section closing `</div>` (line 715) and before `{/* Pro Tip */}` (line 717), insert the visibility toggle section:

```tsx
        {/* Event Visibility */}
        <div>
          <label className="block text-sm mb-4" style={{ fontWeight: 500, color: '#6B7280' }}>
            {t('event.visibility', { defaultValue: 'Event Visibility' })} <span style={{ color: '#EF4444' }}>*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Public Option */}
            <button
              onClick={() => setIsPrivateEvent(false)}
              className="p-4 rounded-lg border-2 transition-all text-center"
              style={{
                borderColor: !isPrivateEvent ? '#3B82F6' : '#E5E7EB',
                backgroundColor: !isPrivateEvent ? '#F0F9FF' : 'white',
                cursor: 'pointer'
              }}
            >
              <Eye size={24} className="mx-auto mb-2" style={{ color: !isPrivateEvent ? '#3B82F6' : '#6B7280' }} />
              <div className="text-sm mb-1" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('event.public', { defaultValue: 'Public' })}
              </div>
              <div className="text-xs" style={{ color: '#6B7280' }}>
                {t('event.publicDescription', { defaultValue: 'Anyone can find and register' })}
              </div>
            </button>

            {/* Private Option */}
            <button
              onClick={() => {
                setIsPrivateEvent(true);
                if (!accessCode) setAccessCode(generateAccessCode());
              }}
              className="p-4 rounded-lg border-2 transition-all text-center"
              style={{
                borderColor: isPrivateEvent ? '#3B82F6' : '#E5E7EB',
                backgroundColor: isPrivateEvent ? '#F0F9FF' : 'white',
                cursor: 'pointer'
              }}
            >
              <Lock size={24} className="mx-auto mb-2" style={{ color: isPrivateEvent ? '#3B82F6' : '#6B7280' }} />
              <div className="text-sm mb-1" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('event.private', { defaultValue: 'Private' })}
              </div>
              <div className="text-xs" style={{ color: '#6B7280' }}>
                {t('event.privateDescription', { defaultValue: 'Requires access code to register' })}
              </div>
            </button>
          </div>

          {/* Access Code Field (shown when Private) */}
          {isPrivateEvent && (
            <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
              <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#6B7280' }}>
                {t('event.accessCode', { defaultValue: 'Access Code' })}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                    placeholder="e.g. VIP2026"
                    maxLength={10}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border outline-none transition-colors font-mono text-sm tracking-wider"
                    style={{ borderColor: '#E5E7EB', color: '#0B2641', textTransform: 'uppercase' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(accessCode);
                    toast.success(t('event.codeCopied', { defaultValue: 'Code copied!' }));
                  }}
                  className="h-10 px-3 rounded-lg border transition-colors hover:bg-gray-100"
                  style={{ borderColor: '#E5E7EB' }}
                  title={t('event.copyCode', { defaultValue: 'Copy Code' })}
                >
                  <Copy size={16} style={{ color: '#6B7280' }} />
                </button>
                <button
                  type="button"
                  onClick={() => setAccessCode(generateAccessCode())}
                  className="h-10 px-3 rounded-lg border transition-colors hover:bg-gray-100"
                  style={{ borderColor: '#E5E7EB' }}
                  title={t('event.regenerateCode', { defaultValue: 'Regenerate' })}
                >
                  <RefreshCw size={16} style={{ color: '#6B7280' }} />
                </button>
              </div>
              {accessCode.length > 0 && accessCode.length < 4 && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                  {t('event.accessCodeMinLength', { defaultValue: 'Access code must be at least 4 characters' })}
                </p>
              )}
            </div>
          )}
        </div>
```

- [ ] **Step 7: Build and verify**

Run: `npx vite build`
Expected: Build succeeds (check for "built in" in output)

- [ ] **Step 8: Commit**

```bash
git add src/components/wizard/EventDetailsForm.tsx
git commit -m "feat: add Private/Public visibility toggle to wizard Step 1"
```

---

## Task 4: Wire PrivacySection in Step 4 to real state

**Files:**
- Modify: `src/components/wizard/PrivacySection.tsx` (rewrite with props, keep existing toggles as placeholders)
- Modify: `src/pages/06_Wizard_Step4_Launch.tsx` (pass props, ensure access_code in publish payload)

- [ ] **Step 1: Rewrite PrivacySection.tsx**

Replace the entire file with a functional component that accepts props:

```tsx
import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Lock, Eye, Copy, RefreshCw } from 'lucide-react';
import { generateAccessCode } from '../../utils/codeGenerator';
import { toast } from 'sonner';

interface PrivacySectionProps {
  isPrivateEvent: boolean;
  accessCode: string;
  onVisibilityChange: (isPrivate: boolean) => void;
  onAccessCodeChange: (code: string) => void;
}

export default function PrivacySection({ isPrivateEvent, accessCode, onVisibilityChange, onAccessCodeChange }: PrivacySectionProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('event.visibility', { defaultValue: 'Event Visibility' })}
      </h3>

      {/* Current Status */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        {isPrivateEvent ? (
          <Lock size={20} style={{ color: '#F59E0B' }} />
        ) : (
          <Eye size={20} style={{ color: '#10B981' }} />
        )}
        <div>
          <div className="text-sm font-medium text-white">
            {isPrivateEvent
              ? t('event.private', { defaultValue: 'Private' })
              : t('event.public', { defaultValue: 'Public' })}
          </div>
          <div className="text-xs" style={{ color: '#9CA3AF' }}>
            {isPrivateEvent
              ? t('event.privateDescription', { defaultValue: 'Requires access code to register' })
              : t('event.publicDescription', { defaultValue: 'Anyone can find and register' })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const newIsPrivate = !isPrivateEvent;
            onVisibilityChange(newIsPrivate);
            if (newIsPrivate && !accessCode) {
              onAccessCodeChange(generateAccessCode());
            }
          }}
          className="ml-auto px-3 py-1.5 text-xs rounded-lg border transition-colors"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#9CA3AF' }}
        >
          {isPrivateEvent
            ? t('event.switchToPublic', { defaultValue: 'Switch to Public' })
            : t('event.switchToPrivate', { defaultValue: 'Switch to Private' })}
        </button>
      </div>

      {/* Access Code Display (private only) */}
      {isPrivateEvent && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <label className="block text-xs mb-2" style={{ color: '#9CA3AF' }}>
            {t('event.accessCode', { defaultValue: 'Access Code' })}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={accessCode}
              onChange={(e) => onAccessCodeChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              maxLength={10}
              className="flex-1 h-9 px-3 rounded-lg border outline-none font-mono text-sm tracking-wider"
              style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(accessCode);
                toast.success(t('event.codeCopied', { defaultValue: 'Code copied!' }));
              }}
              className="h-9 px-2.5 rounded-lg border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <Copy size={14} style={{ color: '#9CA3AF' }} />
            </button>
            <button
              type="button"
              onClick={() => onAccessCodeChange(generateAccessCode())}
              className="h-9 px-2.5 rounded-lg border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <RefreshCw size={14} style={{ color: '#9CA3AF' }} />
            </button>
          </div>
        </div>
      )}

      {/* Existing placeholder toggles — local-only, not wired to DB (out of scope) */}
      <div className="mt-4 space-y-3">
        {[
          { id: 'requireRegistration', label: t('wizard.step4.privacy.requireRegistration', { defaultValue: 'Require registration' }), defaultOn: true },
          { id: 'showAttendeeList', label: t('wizard.step4.privacy.showAttendeeList', { defaultValue: 'Show attendee list' }), defaultOn: false },
          { id: 'allowSocialSharing', label: t('wizard.step4.privacy.allowSocialSharing', { defaultValue: 'Allow social sharing' }), defaultOn: true },
        ].map((item) => (
          <PlaceholderToggle key={item.id} label={item.label} defaultOn={item.defaultOn} />
        ))}
      </div>
    </div>
  );
}

function PlaceholderToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: '#9CA3AF' }}>{label}</span>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className="w-10 h-5 rounded-full transition-colors relative"
        style={{ backgroundColor: on ? '#0684F5' : '#374151' }}
      >
        <div
          className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform"
          style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Update Step 4 to pass props to PrivacySection**

In `src/pages/06_Wizard_Step4_Launch.tsx`:

Replace the `<PrivacySection />` call (line 177) with:

```tsx
            <PrivacySection
              isPrivateEvent={!!eventData.access_code}
              accessCode={eventData.access_code || ''}
              onVisibilityChange={(isPrivate) => {
                if (isPrivate) {
                  const code = eventData.access_code || generateAccessCode();
                  saveDraft({ access_code: code });
                } else {
                  saveDraft({ access_code: null });
                }
              }}
              onAccessCodeChange={(code) => saveDraft({ access_code: code || null })}
            />
```

Add import for `generateAccessCode` at the top:

```typescript
import { generateAccessCode } from '../utils/codeGenerator';
```

- [ ] **Step 3: Ensure handlePublish preserves the access_code**

In `handlePublish` (line 36-41), `is_public: false` is correct (events await admin approval before appearing in browse). However, we must ensure the current `access_code` value is preserved at publish time. The PrivacySection's `onVisibilityChange` already saves `access_code` via `saveDraft()`, but as a safety measure, read the current event's `access_code` and include it in the publish payload:

Replace the `saveDraft` call in `handlePublish`:

```typescript
        await saveDraft({
          status: 'published',
          is_public: false,          // correct: awaits admin approval
          is_approved: false,
          moderation_status: 'pending',
          access_code: eventData.access_code || null  // preserve organizer's choice
        });
```

- [ ] **Step 4: Build and verify**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard/PrivacySection.tsx src/pages/06_Wizard_Step4_Launch.tsx
git commit -m "feat: wire PrivacySection to real state, add access code management"
```

---

## Task 5: Add Private badge to browse event cards

**Files:**
- Modify: `src/components/discovery/BrowseEventsDiscovery.tsx`

- [ ] **Step 1: Add `isPrivate` to EventCard interface**

In the `EventCard` interface (around line 17-32), add after `isLiked?: boolean;`:

```typescript
  isPrivate?: boolean;
```

- [ ] **Step 2: Add `access_code` to the Supabase select query**

At line 118, add `access_code` to the select column list:

```typescript
.select('id, name, description, event_type, event_format, event_status, start_date, location_address, cover_image_url, branding_settings, is_approved, status, access_code')
```

- [ ] **Step 3: Map `isPrivate` in the event card object**

In the mapped event object (around lines 188-202), add after `popularity: 0`:

```typescript
            isPrivate: !!event.access_code,
```

- [ ] **Step 4: Add Private badge to card rendering**

Find the card rendering section where existing badges (format, category) are shown. Add a "Private" badge. Look for the event card JSX — there should be badges for format/type. Add before/after those:

```tsx
{card.isPrivate && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
    style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
    <Lock size={10} />
    {t('event.private', { defaultValue: 'Private' })}
  </span>
)}
```

Add `Lock` to the lucide-react imports at the top of the file.

- [ ] **Step 5: Build and verify**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/components/discovery/BrowseEventsDiscovery.tsx
git commit -m "feat: show Private badge on browse event cards"
```

---

## Task 6: Add access code gate on event landing page registration

**Files:**
- Modify: `src/components/events/DesignStudioLanding.tsx`

- [ ] **Step 1: Add fields to EventRecord interface**

In the `EventRecord` interface (lines 23-37), add after `branding_settings?: any;`:

```typescript
  access_code?: string | null;
```

- [ ] **Step 2: Add access code state**

In the component state section, add:

```typescript
const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
const [enteredCode, setEnteredCode] = useState('');
const [codeError, setCodeError] = useState('');
```

- [ ] **Step 3: Modify handleRegister to check for private events**

Replace `handleRegister` (around line 147-151) with:

```typescript
  const handleRegister = () => {
    if (!eventId) return;
    if (event?.access_code) {
      setShowAccessCodeModal(true);
      setEnteredCode('');
      setCodeError('');
    } else {
      navigate(`/event/${eventId}/register`);
    }
  };

  const handleAccessCodeSubmit = () => {
    if (enteredCode.toUpperCase() === (event?.access_code || '').toUpperCase()) {
      setShowAccessCodeModal(false);
      navigate(`/event/${eventId}/register`, { state: { accessCodeVerified: true } });
    } else {
      setCodeError(t('event.invalidAccessCode', { defaultValue: 'Invalid access code' }));
    }
  };
```

- [ ] **Step 4: Add access code modal JSX**

Before the closing `</>` or `</div>` of the component's return, add the modal:

```tsx
      {/* Access Code Modal */}
      {showAccessCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl p-6" style={{ backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                <Lock size={20} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {t('event.accessCodeModalTitle', { defaultValue: 'Private Event' })}
                </h3>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  {t('event.enterAccessCode', { defaultValue: 'Enter Access Code' })}
                </p>
              </div>
            </div>

            <input
              type="text"
              value={enteredCode}
              onChange={(e) => {
                setEnteredCode(e.target.value.toUpperCase());
                setCodeError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
              placeholder="e.g. VIP2026"
              maxLength={10}
              autoFocus
              className="w-full h-11 px-4 rounded-lg border outline-none font-mono text-sm tracking-wider mb-2"
              style={{
                borderColor: codeError ? '#EF4444' : 'rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                textTransform: 'uppercase'
              }}
            />

            {codeError && (
              <p className="text-xs mb-3" style={{ color: '#EF4444' }}>{codeError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAccessCodeModal(false)}
                className="flex-1 h-10 rounded-lg border text-sm"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#9CA3AF' }}
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
              <button
                onClick={handleAccessCodeSubmit}
                disabled={enteredCode.length < 4}
                className="flex-1 h-10 rounded-lg text-sm font-medium text-white transition-colors"
                style={{
                  backgroundColor: enteredCode.length >= 4 ? '#0684F5' : '#374151',
                  cursor: enteredCode.length >= 4 ? 'pointer' : 'not-allowed'
                }}
              >
                {t('event.submitCode', { defaultValue: 'Submit' })}
              </button>
            </div>
          </div>
        </div>
      )}
```

Add `Lock` to the lucide-react imports if not already present. Add `useState` if not already imported.

- [ ] **Step 5: Add Private Event badge near event title**

Find where the event name/title is displayed in the landing page rendering. Add a badge nearby:

```tsx
{event?.access_code && (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
    style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
    <Lock size={12} />
    {t('event.private', { defaultValue: 'Private' })}
  </span>
)}
```

- [ ] **Step 6: Build and verify**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/components/events/DesignStudioLanding.tsx
git commit -m "feat: add access code gate and Private badge on event landing page"
```

---

## Task 7: Guard registration flow against direct URL access

**Files:**
- Modify: `src/pages/32_Event_Registration_Flow.tsx`

- [ ] **Step 1: Add access code verification state**

In the component state section, add:

```typescript
const [needsAccessCode, setNeedsAccessCode] = useState(false);
const [enteredCode, setEnteredCode] = useState('');
const [codeError, setCodeError] = useState('');
```

Also get the navigation state for verified access codes:

```typescript
const location = useLocation();
const accessCodeVerified = (location.state as any)?.accessCodeVerified;
```

- [ ] **Step 2: Add access check after event fetch**

In `fetchEventData`, after `setEvent(eventData)` (around line 119), add:

```typescript
        // Check if private event requires access code
        if (eventData.access_code && !accessCodeVerified) {
          setNeedsAccessCode(true);
          setIsLoading(false);
          return; // Don't fetch remaining data until access is verified
        }
```

- [ ] **Step 3: Add access code gate UI**

Before the main return JSX, add a guard:

```tsx
  if (needsAccessCode) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B2641' }}>
        <div className="w-full max-w-sm mx-4 rounded-2xl p-6" style={{ backgroundColor: '#0D243B', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              <Lock size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {t('event.accessCodeModalTitle', { defaultValue: 'Private Event' })}
              </h3>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {t('event.enterAccessCode', { defaultValue: 'Enter Access Code' })}
              </p>
            </div>
          </div>

          <input
            type="text"
            value={enteredCode}
            onChange={(e) => { setEnteredCode(e.target.value.toUpperCase()); setCodeError(''); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && enteredCode.length >= 4) {
                if (enteredCode.toUpperCase() === (event?.access_code || '').toUpperCase()) {
                  setNeedsAccessCode(false);
                } else {
                  setCodeError(t('event.invalidAccessCode', { defaultValue: 'Invalid access code' }));
                }
              }
            }}
            placeholder="e.g. VIP2026"
            maxLength={10}
            autoFocus
            className="w-full h-11 px-4 rounded-lg border outline-none font-mono text-sm tracking-wider mb-2"
            style={{
              borderColor: codeError ? '#EF4444' : 'rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              textTransform: 'uppercase'
            }}
          />

          {codeError && <p className="text-xs mb-3" style={{ color: '#EF4444' }}>{codeError}</p>}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate(`/event/${eventId}/landing`)}
              className="flex-1 h-10 rounded-lg border text-sm"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#9CA3AF' }}
            >
              {t('common.back', { defaultValue: 'Back' })}
            </button>
            <button
              onClick={() => {
                if (enteredCode.toUpperCase() === (event?.access_code || '').toUpperCase()) {
                  setNeedsAccessCode(false);
                } else {
                  setCodeError(t('event.invalidAccessCode', { defaultValue: 'Invalid access code' }));
                }
              }}
              disabled={enteredCode.length < 4}
              className="flex-1 h-10 rounded-lg text-sm font-medium text-white"
              style={{
                backgroundColor: enteredCode.length >= 4 ? '#0684F5' : '#374151',
                cursor: enteredCode.length >= 4 ? 'pointer' : 'not-allowed'
              }}
            >
              {t('event.submitCode', { defaultValue: 'Submit' })}
            </button>
          </div>
        </div>
      </div>
    );
  }
```

Add `Lock` to lucide-react imports. Add `useLocation` to react-router-dom imports.

- [ ] **Step 4: Refactor generateConfirmationCode to use shared utility**

Replace the local `generateConfirmationCode` function (lines 87-94) with an import:

```typescript
import { generateAccessCode } from '../utils/codeGenerator';
```

Then update the usage:

```typescript
const generateConfirmationCode = () => 'EV-' + generateAccessCode(6);
```

- [ ] **Step 5: Build and verify**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/pages/32_Event_Registration_Flow.tsx
git commit -m "feat: guard registration flow with access code for private events"
```

---

## Task 8: Handle event duplication for private events

**Files:**
- Modify: `src/components/dashboard/EventsGrid.tsx`

- [ ] **Step 1: Reset access_code on duplication**

In the `onDuplicate` handler (around lines 92-112), add `access_code: null` to the payload object, after `is_public: false` (line 110):

```typescript
              access_code: null,
```

This ensures duplicated events always start as public drafts. The organizer can set them to private in the wizard.

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/EventsGrid.tsx
git commit -m "feat: reset access_code when duplicating events"
```

---

## Task 9: Add i18n translations

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add English translations**

Find the English translations section and add these keys under an appropriate location (near existing event-related keys):

```typescript
'event.visibility': 'Event Visibility',
'event.public': 'Public',
'event.private': 'Private',
'event.publicDescription': 'Anyone can find and register',
'event.privateDescription': 'Requires access code to register',
'event.accessCode': 'Access Code',
'event.enterAccessCode': 'Enter Access Code',
'event.invalidAccessCode': 'Invalid access code',
'event.copyCode': 'Copy Code',
'event.codeCopied': 'Code copied!',
'event.regenerateCode': 'Regenerate',
'event.accessCodeModalTitle': 'Private Event',
'event.submitCode': 'Submit',
'event.switchToPublic': 'Switch to Public',
'event.switchToPrivate': 'Switch to Private',
'event.accessCodeMinLength': 'Access code must be at least 4 characters',
```

- [ ] **Step 2: Add French translations**

```typescript
'event.visibility': 'Visibilité de l\'événement',
'event.public': 'Public',
'event.private': 'Privé',
'event.publicDescription': 'Tout le monde peut s\'inscrire',
'event.privateDescription': 'Code d\'accès requis pour s\'inscrire',
'event.accessCode': 'Code d\'accès',
'event.enterAccessCode': 'Entrer le code d\'accès',
'event.invalidAccessCode': 'Code d\'accès invalide',
'event.copyCode': 'Copier le code',
'event.codeCopied': 'Code copié !',
'event.regenerateCode': 'Régénérer',
'event.accessCodeModalTitle': 'Événement privé',
'event.submitCode': 'Soumettre',
'event.switchToPublic': 'Passer en public',
'event.switchToPrivate': 'Passer en privé',
'event.accessCodeMinLength': 'Le code d\'accès doit contenir au moins 4 caractères',
```

- [ ] **Step 3: Add Arabic translations**

```typescript
'event.visibility': 'رؤية الحدث',
'event.public': 'عام',
'event.private': 'خاص',
'event.publicDescription': 'يمكن لأي شخص التسجيل',
'event.privateDescription': 'يتطلب رمز وصول للتسجيل',
'event.accessCode': 'رمز الوصول',
'event.enterAccessCode': 'أدخل رمز الوصول',
'event.invalidAccessCode': 'رمز الوصول غير صالح',
'event.copyCode': 'نسخ الرمز',
'event.codeCopied': 'تم نسخ الرمز!',
'event.regenerateCode': 'إعادة إنشاء',
'event.accessCodeModalTitle': 'حدث خاص',
'event.submitCode': 'إرسال',
'event.switchToPublic': 'التبديل إلى عام',
'event.switchToPrivate': 'التبديل إلى خاص',
'event.accessCodeMinLength': 'يجب أن يحتوي رمز الوصول على 4 أحرف على الأقل',
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat: add Private/Public event i18n translations (EN/FR/AR)"
```

---

## Task 10: Final build verification and cleanup

- [ ] **Step 1: Run full build**

Run: `npx vite build`
Expected: Build succeeds with "built in" message

- [ ] **Step 2: Verify all changes are committed**

Run: `git status`
Expected: clean working tree

- [ ] **Step 3: Review all commits**

Run: `git log --oneline -10`
Verify the commit history shows all feature commits.
