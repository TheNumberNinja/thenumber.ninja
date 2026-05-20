# Stripe Subscription End Date from Sanity Implementation Plan

Created: 2026-05-20
Author: stuart@withotto.app
Status: VERIFIED
Approved: Yes
Iterations: 0
Worktree: Yes
Type: Feature

## Summary

**Goal:** When a client starts a Stripe checkout session via `create-checkout-session.js`, the resulting Stripe subscription auto-cancels before the renewal that would create an (N+1)th invoice for an exact N-month contract. Concretely: `cancel_at` is set to end-of-day `Europe/London` on the day BEFORE `agreement.end`, which is strictly less than the renewal Stripe schedules at 00:00 UTC on `agreement.end`. For aligned contracts (same day-of-month start and end, exact N-month span), the customer is billed exactly N times.

## Out of Scope

- Syncing `cancel_at` for existing Stripe subscriptions when the Sanity `agreement.end` is edited after checkout — only checkout-time mapping is in scope. Future edits to the agreement do not propagate.
- Stripe Subscription Schedules / multi-phase contracts. Considered and rejected during planning — the contract has a single phase with no planned mid-term changes.
- Changes to the `customer.subscription.deleted` webhook. The existing handler in `web/src/functions/stripe-webhooks.js:261` already clears Sanity subscription details when Stripe cancels, including auto-cancel via `cancel_at`.
- Pre-existing unguarded read of `subscription.agreement.end` at `web/src/functions/create-checkout-session.js:332` (passed to `generateAccountsLineItems`). If the Sanity client doc has no `agreement` object at all, line 332 throws a `TypeError` and the handler returns 500 — this happens before the new helper runs, so the new 400 path does not protect against it. The Sanity `subscription` schema does not currently mark `agreement` as required (only the fields inside it are), so this latent crash predates the plan. Fixing it is a separate change.
- Proration / partial-month refunds for misaligned contracts. If `agreement.start` and `agreement.end` are not exact-month-spaced (e.g., start `2026-01-15`, end `2026-12-20`), the customer is still billed for the full final monthly period in which `agreement.end` falls — the contract ends mid-period but no proration refund is issued. This plan does not configure `proration_behavior`; Stripe's default for `cancel_at`-triggered cancellations applies.

## Approach

**Chosen:** Add `calculateCancelAt(endDate)` helper in `web/src/functions/create-checkout-session.js` mirroring the existing `calculateTrialEnd` pattern at line 245, and set `subscription_data.cancel_at` alongside the existing `trial_end` inside the `if ('agreement' in subscriptionConfiguration)` block at line 352.

**Why:** Single-file addition next to a near-identical sibling helper (`calculateTrialEnd`). Reuses the lambda handler's existing `err.statusCode` path (line 79) for the 400 response. Subscription Schedules were rejected because no planned mid-term plan changes justify the much larger refactor of the checkout flow.

## Implementation Tasks

### Task 1: Add `calculateCancelAt` helper and wire `cancel_at` into the Stripe checkout payload

**Objective:** Add a `calculateCancelAt(endDate)` helper next to `calculateTrialEnd` in `create-checkout-session.js`, returning the Unix timestamp of end-of-day Europe/London for `agreement.end`, throwing a `statusCode = 400` error when the date is today or in the past. Set `payload['subscription_data']['cancel_at']` from this helper inside the existing `if ('agreement' in subscriptionConfiguration)` block, so Stripe auto-cancels the subscription on the contracted end date and the customer is billed only for the contracted months.

**Files:**

- Modify: `web/src/functions/create-checkout-session.js`
- Modify: `web/src/functions/tests/__tests__/create-checkout-session.test.js`

**Key Decisions / Notes:**

- Helper signature: `function calculateCancelAt(endDate)` where `endDate` is the `yyyy-MM-dd` string from `agreement.end`. Implementation with required JSDoc:
  ```js
  /**
   * Returns the Unix timestamp at which Stripe should auto-cancel the subscription.
   *
   * The returned moment is end-of-day Europe/London on the day BEFORE endDate
   * — NOT end-of-day on endDate itself. trial_end is set to agreement.start
   * (see calculateTrialEnd), so Stripe's billing anchor is the day-of-month of
   * agreement.start. For an exact-N-month contract, the (N+1)th renewal would
   * fire at 00:00 UTC on agreement.end. Setting cancel_at to end-of-day-on-endDate
   * would let that (N+1)th invoice fire before cancellation. Cancelling at
   * end-of-day London on (endDate - 1) always fires BEFORE the 00:00 UTC
   * renewal at agreement.end, so the customer is billed exactly N times.
   */
  function calculateCancelAt(endDate) {
    const agreementEnd = DateTime.fromFormat(endDate, 'yyyy-MM-dd', { zone: 'Europe/London' });
    const today = DateTime.now().setZone('Europe/London').startOf('day');
    if (agreementEnd <= today) {
      const err = new Error(`Agreement end date ${endDate} must be after today`);
      err.statusCode = 400;
      throw err;
    }
    return agreementEnd.minus({ days: 1 }).endOf('day').toUnixInteger();
  }
  ```
  The day-level comparison (`agreementEnd <= today.startOf('day')`) is deliberate — comparing `endOf('day')` against `DateTime.now()` would silently accept today's date for most of the day. The user specified today must be rejected too.
- Call site (extend the existing `if ('agreement' in subscriptionConfiguration)` block at `create-checkout-session.js:352`):
  ```js
  payload['subscription_data']['cancel_at'] = calculateCancelAt(subscriptionConfiguration.agreement.end);
  ```
  Place this after the existing `trial_end` assignment so both date-derived fields live together.
- Export `calculateCancelAt` from the module's `export { ... }` block at line 402 so it can be unit-tested alongside the other helpers.
- The handler's existing catch block (`create-checkout-session.js:73-87`) already reads `err.statusCode` and forwards it to the response — no handler changes needed for the 400.
- Reuse existing test mocks (Stripe SDK, Sanity client, Sentry) in `create-checkout-session.test.js`. Add a new `describe('calculateCancelAt', () => { ... })` block. Use `Settings.now = () => new Date('2026-05-20T00:00:00.000Z').getTime()` for deterministic time, matching the pattern at line 47.
- Use **hard-coded Unix integers** for the timestamp-equivalence assertions, NOT a derived expected value. Re-deriving the expected via the same Luxon call the helper uses would silently pass if the zone is changed to `'UTC'` in both places. Two cases are required, one in GMT and one in BST, to prove the timezone is actually honoured:
  - `expect(calculateCancelAt('2027-12-31')).toBe(1830211199)` — cancel moment is `2027-12-30T23:59:59 GMT` (day BEFORE endDate, London zone). Verified: `date -j -u -f "%Y-%m-%d %H:%M:%S" "2027-12-30 23:59:59" +%s`.
  - `expect(calculateCancelAt('2027-06-30')).toBe(1814309999)` — cancel moment is `2027-06-29T23:59:59 BST` = `2027-06-29T22:59:59Z`. Verified: `date -j -u -f "%Y-%m-%d %H:%M:%S" "2027-06-29 22:59:59" +%s`.
  Include a code comment in the test alongside each constant naming how it was computed (`date -j -u -f ... +%s`) so a future maintainer can re-verify without trusting the helper.
- Add a regression test that asserts the billing-boundary invariant for aligned contracts: `calculateCancelAt('2027-06-30')` MUST be strictly less than `Date.UTC(2027, 5, 30, 0, 0, 0) / 1000` (the Unix timestamp of the 13th renewal at 00:00 UTC on agreement.end). This is the test Codex flagged as missing — it proves the cancel moment fires before the renewal that would over-bill.

**Definition of Done:**

- [x] `calculateCancelAt('2027-12-31')` returns `1830211199` (2027-12-30 23:59:59 GMT — day before endDate, London zone).
- [x] `calculateCancelAt('2027-06-30')` returns `1814309999` (2027-06-29 23:59:59 BST = 22:59:59 UTC) — proves the `Europe/London` zone is honoured across DST.
- [x] `calculateCancelAt('2026-05-20')` (= today under the fixed `Settings.now`) throws an `Error` with `.statusCode === 400`.
- [x] `calculateCancelAt('2026-05-19')` (= yesterday) throws an `Error` with `.statusCode === 400`.
- [x] `calculateCancelAt('2027-06-30')` is strictly less than `Date.UTC(2027, 5, 30) / 1000` (the 13th renewal moment for an aligned start=2026-06-30). Billing-boundary regression test.
- [x] In subscription mode with a Sanity client whose `subscription.agreement.end` is in the future, the call to `stripe.checkout.sessions.create` is made with `subscription_data.cancel_at` set to `calculateCancelAt(agreement.end)`. Verified by spying on the mocked `stripe.checkout.sessions.create` and inspecting the payload.
- [x] `calculateCancelAt` is exported from `create-checkout-session.js`.
- [x] Verify: `cd web && pnpm test`

## Progress Tracking

- [x] Task 1: Add `calculateCancelAt` helper, wire into checkout payload, and cover with unit + payload-assertion tests.
