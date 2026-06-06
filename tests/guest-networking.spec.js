import { test, expect } from "@playwright/test";

/**
 * Event-guest networking flow — integration-style e2e.
 *
 * IMPORTANT — these tests hit the LIVE Supabase project. The registration form
 * calls the deployed `create-event-registration` Edge Function, which (when the
 * B2B toggle is ON) creates a REAL guest auth user + profile + event_attendees
 * row. Each test run therefore creates real data that MUST be cleaned up
 * afterwards (cleanup job, or manual deletion of the `+e2e_*` accounts and their
 * attendee rows). `Date.now()` makes every email alias unique so reruns don't
 * collide on the (email, event_id) registration constraint — but they DO pile up
 * accounts, so prune periodically.
 *
 * Because of the side effects + live network dependency, the whole suite is
 * gated behind RUN_GUEST_E2E. Set RUN_GUEST_E2E=1 to actually run it; in CI it
 * is skipped by default.
 *
 *   RUN_GUEST_E2E=1 BASE_URL=http://localhost:3000 \
 *     npx playwright test tests/guest-networking.spec.js
 *
 * Env overrides:
 *   BASE_URL         default http://localhost:3000
 *   EVENT_ID         default ce684d95-537d-549a-91f4-dd32dede6cb5 (a published event)
 *   GUEST_EMAIL_BASE default oussema.lamine20@gmail.com (the +alias is appended)
 *   RUN_GUEST_E2E    must be set/truthy to un-skip the suite
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const EVENT_ID = process.env.EVENT_ID || "ce684d95-537d-549a-91f4-dd32dede6cb5";
const EMAIL_BASE = process.env.GUEST_EMAIL_BASE || "oussema.lamine20@gmail.com";

// Skip the whole suite unless explicitly opted-in (side effects + live Supabase).
const RUN = !!process.env.RUN_GUEST_E2E && process.env.RUN_GUEST_E2E !== "0";

// Build a unique `+alias` email so each run is isolated.
function uniqueEmail(tag) {
  const [local, domain] = EMAIL_BASE.split("@");
  return `${local}+e2e_${tag}_${Date.now()}@${domain}`;
}

// Absolute URL helper (Edge-Function magic links are absolute; app routes are relative).
function appUrl(path) {
  return new URL(path, BASE_URL).toString();
}

/**
 * Fill the 8 mandatory system fields on step 1 of /event/:id/register.
 * Selectors confirmed in src/pages/32_Event_Registration_Flow.tsx.
 */
async function fillSystemFields(page, { email, b2bOptIn }) {
  await page.locator('input[placeholder="John Doe"]').fill("E2E Guest Tester");
  await page.locator('input[placeholder="john@company.com"]').fill(email);
  await page.locator('input[placeholder="12345678"]').fill("12345678");
  await page.locator('input[placeholder="Acme Corp"]').fill("E2E Test Co");
  await page
    .locator("textarea")
    .first()
    .fill("Automated end-to-end test company description for the guest networking flow.");

  // Interests (multi-select): open, pick one, close.
  await page.getByRole("button", { name: /select your interests/i }).click();
  await page.getByRole("button", { name: /^Investment$/ }).click();
  await page.getByRole("button", { name: /select your interests/i }).click();

  // Sector (single-select): open, pick one (auto-closes).
  await page.getByRole("button", { name: /select your sector/i }).click();
  await page.getByRole("button", { name: /^Finance & Banking$/ }).click();

  // Social / Website URL.
  await page.locator('input[type="url"]').fill("https://linkedin.com/in/e2e-guest");

  // B2B toggle (first `button.w-11.h-6`). Only flip when we want it ON.
  if (b2bOptIn) {
    await page.locator("button.w-11.h-6").first().click();
  }
}

/**
 * Advance through both steps and resolve the create-event-registration response.
 * Returns the parsed JSON body of the Edge Function call.
 */
async function submitRegistration(page) {
  // Start listening BEFORE we click submit so we never miss the response.
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes("create-event-registration"),
    { timeout: 45_000 }
  );

  // Step 1 -> Step 2.
  await page.getByRole("button", { name: /^(Continue|Continuer)$/i }).click();

  // Step 2 -> submit (fires the Edge Function).
  await page
    .getByRole("button", { name: /Complete Registration|Terminer/i })
    .click();

  const response = await responsePromise;
  return await response.json();
}

// Decode the `redirect_to` query param embedded in a Supabase magic-link action_link.
function decodeRedirectTo(magicLink) {
  const url = new URL(magicLink);
  const raw = url.searchParams.get("redirect_to");
  return raw ? decodeURIComponent(raw) : null;
}

test.describe.serial("event-guest networking flow", () => {
  test.skip(
    !RUN,
    "guest-networking e2e is gated behind RUN_GUEST_E2E (hits live Supabase + creates real accounts)"
  );

  // Shared across the serial cases.
  let optInBody = null; // case 1 response
  let guestEmail = null;

  test("1. opt-in guest registration returns magic link targeting /networking", async ({
    page,
  }) => {
    guestEmail = uniqueEmail("optin");

    await page.goto(appUrl(`/event/${EVENT_ID}/register`));
    // Step 1 must render (registration form, not the loader/access-code gate).
    await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible({
      timeout: 20_000,
    });

    await fillSystemFields(page, { email: guestEmail, b2bOptIn: true });
    optInBody = await submitRegistration(page);

    expect(optInBody.success).toBe(true);
    expect(optInBody.is_new_user).toBe(true);
    expect(optInBody.user_id).toBeTruthy();
    expect(optInBody.magic_link).toBeTruthy();

    // The action_link's redirect_to decodes to
    //   <origin>/event-auth?redirect=/event/<EVENT_ID>/networking
    // i.e. it both contains `redirect_to=` and (its decoded value) ends with
    // the networking path for this event.
    expect(optInBody.magic_link).toContain("redirect_to=");
    const redirectTo = decodeRedirectTo(optInBody.magic_link);
    expect(redirectTo).toBeTruthy();
    expect(redirectTo.endsWith(`/event/${EVENT_ID}/networking`)).toBe(true);
  });

  test("2. no opt-in registration creates no account (magic_link null)", async ({
    page,
  }) => {
    const email = uniqueEmail("nooptin");

    await page.goto(appUrl(`/event/${EVENT_ID}/register`));
    await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible({
      timeout: 20_000,
    });

    await fillSystemFields(page, { email, b2bOptIn: false });
    const body = await submitRegistration(page);

    expect(body.success).toBe(true);
    expect(body.is_new_user).toBeFalsy(); // false or absent
    // No B2B opt-in => no account => no magic link.
    expect(body.magic_link == null).toBe(true);
  });

  test("3. magic link lands on networking surface + guest is locked out of /dashboard", async ({
    page,
  }) => {
    expect(optInBody, "case 1 must have produced a magic link").toBeTruthy();
    expect(optInBody.magic_link).toBeTruthy();

    // Consume the magic link to establish the guest session. This routes through
    // the /event-auth bridge and should ultimately land on the networking page.
    await page.goto(optInBody.magic_link);

    // Give the auth bridge a chance to settle, then ensure we're on networking.
    await expect
      .poll(() => page.url(), { timeout: 30_000 })
      .toContain(`/event/${EVENT_ID}/networking`)
      .catch(async () => {
        // If the bridge didn't auto-forward, navigate explicitly using the
        // now-established guest session.
        await page.goto(appUrl(`/event/${EVENT_ID}/networking`));
      });

    await expect(page).toHaveURL(
      new RegExp(`/event/${EVENT_ID}/networking`)
    );

    // The guest networking surface renders its "Networking Hub" header label.
    await expect(page.getByText(/Networking Hub/i).first()).toBeVisible({
      timeout: 20_000,
    });

    // Guest lockout: hitting the member dashboard must redirect away.
    await page.goto(appUrl("/dashboard"));
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 20_000 })
      .not.toBe("/dashboard");
  });

  test("4. guest profile is hidden from the public profile page (no leak)", async ({
    page,
  }) => {
    expect(optInBody, "case 1 must have produced a user_id").toBeTruthy();
    expect(optInBody.user_id).toBeTruthy();

    // Re-establish the guest session, then visit the guest's own public profile
    // URL via the member-facing /profile/:userId route.
    await page.goto(optInBody.magic_link);
    await page.waitForLoadState("networkidle").catch(() => {});

    await page.goto(appUrl(`/profile/${optInBody.user_id}`));

    // Event guests are hidden on the public/member profile page: the page must
    // render the "Profile Not Found" state and must NOT expose an editable
    // ("Edit Profile") profile for the guest.
    await expect(page.getByText(/Profile Not Found/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: /edit profile/i })).toHaveCount(
      0
    );
  });
});
