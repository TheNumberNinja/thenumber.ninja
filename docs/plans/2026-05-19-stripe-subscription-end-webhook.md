# Stripe Subscription End Webhook Implementation Plan

Created: 2026-05-19
Author: stuart@withotto.app
Status: VERIFIED
Approved: Yes
Iterations: 0
Worktree: Yes
Type: Feature

## Summary

**Goal:** When Stripe sends `customer.subscription.deleted`, locate the Sanity client document by its stored `subscription.subscriptionId`, unset every `subscription.*` field except `customerId`, then trigger a Netlify rebuild so the website reflects the ended subscription.

## Approach

**Chosen:** Add a `customer.subscription.deleted` handler to `web/src/functions/stripe-webhooks.js:90` alongside the existing `customerSubscriptionCreated` and `checkoutSessionExpired` handlers, with a new `getMatchingPublishedClientDocsForSubscriptionId` lookup helper (draft-excluding, returns array for ambiguity detection) and a new `clearSanitySubscriptionDetails` patch helper that uses `writeClient.patch(id).unset([...])`.
**Why:** Mirrors the existing handler pattern at `stripe-webhooks.js:166-212` (find doc → mutate Sanity → trigger Netlify build → respond 200), which keeps the diff small and the cognitive overhead low; cost is two new local helpers instead of overloading the existing `updateSanityClientDocument` (`set`-based) with an `unset`-based path that would conflate two distinct semantics.

## Context for Implementer

The webhook handler is dispatched via the `eventTypesToProcess` map at `web/src/functions/stripe-webhooks.js:90-94`. Unknown event types return `202` (silently ignored). Test signatures are auto-generated outside production at `stripe-webhooks.js:68-76`, so locally and in staging the existing harness already verifies signature handling — the new handler does NOT need to re-implement signature logic. The `STRIPE_WEBHOOK_BUILD_HOOK` env var (used by `triggerNetlifyBuild` at `stripe-webhooks.js:138`) is the Netlify build hook URL; the function fire-and-forgets a POST.

The Sanity `subscription` object (`studio/objects/subscription.js`) carries: `type` (required, 'stripe'|'invoice'), `agreement` (date range), `proposalId`, `proposalNumber`, `customerId` (`cus_...`), `subscriptionId` (`sub_...`), `products` (array of oneOff/monthly/accounts), `discount`. Sanity Studio's `Rule.required()` is UI-only — the write API accepts `unset` on `type`, which is the desired behavior (a missing `type` flags "this subscription has ended" when the doc is opened in Studio).

GROQ filter strings must use parameterised queries (see `web/src/functions/sign-upload-url.js:75-82`). The existing `getSanityDocumentIdForClientId` at `stripe-webhooks.js:114` uses string interpolation — do NOT replicate that pattern in the new helper.

**Drafts MUST be excluded** from every read used by this handler. Sanity's draft/published model means a client doc with unsaved edits has an additional `drafts.<id>` document; the website build (`web/src/_data/clients.js:32`) reads ONLY published docs via `!(_id in path("drafts.**"))`. The same pattern is used in `web/src/functions/sign-upload-url.js:79`, `web/src/functions/create-checkout-session.js:263`, and `web/src/functions/download-helpsheet.js:27`. If the new lookup matches a draft and patches it, the rebuilt site still shows the old subscription. Always include the draft-exclusion clause in the new filter.

**Stripe API version pinning.** The `Stripe` client at `web/src/functions/stripe-webhooks.js:5` initialises without an explicit `apiVersion` option, so the SDK falls back to the account's pinned API version (the one set in the Stripe Dashboard for this account). The `customer.subscription.deleted` payload shape used in this plan (`event.data.object.id` for the `sub_*` identifier) has been stable across Stripe API versions ≥ 2020-08-27. If the implementer needs to confirm, check the Stripe Dashboard → Developers → API version, and the [event schema docs](https://docs.stripe.com/api/events/types#event_types-customer.subscription.deleted) for the pinned version.

## Out of Scope

- Backfilling parameterised GROQ in the existing `getSanityDocumentIdForClientId` helper — that's a separate hardening task; the new helper sets the pattern but does not refactor existing call sites.
- Handling `customer.subscription.updated` with `cancel_at_period_end: true` — clearing on cancel scheduled is premature because the subscription is still active until period end.
- Handling `customer.subscription.paused` or `subscription.trial_will_end` — these are not "subscription ended" events.
- Backfilling Sanity for historical Stripe subscriptions that were deleted before this code shipped — manual data clean-up only.

## Assumptions

- The Stripe `customer.subscription.deleted` event payload includes the subscription ID at `event.data.object.id` (e.g. `sub_abc123`). This is true for the Stripe API version in use (`stripe@^20.0.0`). — Tasks 1, 2 depend on this.
- Every Sanity `client` document has at most one matching `subscription.subscriptionId`. The schema embeds `subscription` as a single object on the `client` document, so this holds by construction. — Task 1 depends on this.
- Unsetting required fields (`subscription.type`) via the write API does not error; the validation lives in Studio only. Confirmed by the [Sanity js-client unset docs](https://www.sanity.io/docs/apis-and-sdks/js-client-mutations) — `unset` removes the field and returns the updated revision. — Task 1 depends on this.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Stripe sends `customer.subscription.deleted` twice (retry / replay) | Medium | Low (idempotent: unsetting already-unset fields is a no-op; one extra Netlify build) | Accept idempotent re-runs; no dedup needed |
| Multiple published Sanity client docs end up sharing the same `subscriptionId` (data corruption) | Low | Medium (silently mutating one of several documents and leaving the others stale) | Task 2 fetches ALL matching published documents (no `[0]`), checks `length`: `0` → no-match path; `1` → patch it; `>1` → Sentry-capture an ambiguity error and return 200 without mutating anything (see Task 2 Key Decisions) |
| Draft client document shadowing the published one (Sanity draft/published split) | Medium | High (handler patches draft, website rebuilds from unchanged published doc, goal silently violated) | Task 2 GROQ filter MUST include `!(_id in path("drafts.**"))` — see Context for Implementer |
| `STRIPE_WEBHOOK_BUILD_HOOK` env var unset in some environment | Low | Medium (Sanity is cleared but site shows stale data until next deploy) | Existing `triggerNetlifyBuild` swallows the failure; the new handler inherits that behaviour and any exception escapes to the outer handler try/catch — Task 2 hardens that catch to `respond(err.statusCode ?? 500)` so Sentry sees a deterministic status |
| Outer catch `respond(err.statusCode)` passes `undefined` to Netlify when helpers throw plain `Error` | Medium | Medium (Stripe sees a non-2xx, retries the webhook 3+ times, plan's idempotency claim becomes false-positive) | Task 2 changes line 110 to `respond(err.statusCode ?? 500)` so unhandled exceptions yield a deterministic 500 — fixes existing handlers as a side-effect |

## Goal Verification

### Truths

1. After Stripe emits `customer.subscription.deleted` for a subscription whose `sub_*` ID is stored on a Sanity client document, every `subscription.*` field on that client document is absent in the next Sanity read EXCEPT `customerId`, which retains its prior value.

## Progress Tracking

- [x] Task 1: Backfill vitest test file for `stripe-webhooks.js` covering the existing dispatch + handlers (regression baseline)
- [x] Task 2: Add `customer.subscription.deleted` handler with draft-excluding lookup, ambiguity guard, hardened error path, and clear-via-unset; driven by failing tests

## Implementation Tasks

### Task 1: Backfill regression tests for the existing stripe-webhooks dispatch and handlers

**Objective:** Establish the test scaffold for `web/src/functions/stripe-webhooks.js` by adding a new vitest file that mocks Sanity (`readClient`/`writeClient`), Sentry, Stripe, and `fetch`, then asserts the existing dispatch behaviour for `customer.subscription.created`, `checkout.session.completed`, `checkout.session.expired`, and "unknown event type → 202". No production code changes — these tests must pass against `main`. This task creates the harness Task 2 will extend with the new handler tests.

**Files:**

- Create: `web/src/functions/tests/__tests__/stripe-webhooks.test.js`

**Key Decisions / Notes:**

- Follow the mock pattern from `create-checkout-session.test.js:5-34`: `vi.mock('../../../../config/utils/sanityClient.js', () => ({ default: { fetch: vi.fn(), withConfig: vi.fn(() => ({ patch: vi.fn(() => ({ set: vi.fn().mockReturnThis(), unset: vi.fn().mockReturnThis(), commit: vi.fn().mockResolvedValue({ _rev: 'rev1' }) })) })) } }))`. The `withConfig` call at `stripe-webhooks.js:7` returns the write client — mock chain must cover both `set` (used by existing code) and `unset` (used by Task 2).
- Mock `stripe` so `stripe.webhooks.constructEvent` returns the payload object passed in (bypass signature verification; the handler already auto-generates a test signature outside production via `isProduction: false`). Mock `stripe.subscriptions.update` and `stripe.setupIntents.retrieve` for `checkoutSessionCompleted`.
- Mock `globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })` to satisfy `triggerNetlifyBuild` at `stripe-webhooks.js:138`.
- Mock `@sentry/serverless` the same way `create-checkout-session.test.js:9-17` does (`AWSLambda.wrapHandler: fn => fn`) so the handler runs through unchanged.
- Each test builds a synthetic Stripe event object (e.g. `{ type: 'customer.subscription.created', data: { object: { customer: 'cus_x', id: 'sub_x', metadata: { client_id: 'abc' } } } }`) and invokes `handler({ httpMethod: 'POST', headers: {}, body: JSON.stringify(event) }, {})`.
- Test cases to include (one `describe` per dispatched event type):
  - `customer.subscription.created` → reads client by `clientId` metadata, calls `writeClient.patch(...).set(...)` with `subscription.customerId` and `subscription.subscriptionId`, triggers `fetch(STRIPE_WEBHOOK_BUILD_HOOK, { method: 'POST' })`, returns 200.
  - `checkout.session.expired` → same lookup, calls `set` with `customerId: null, subscriptionId: null`, triggers build hook, returns 200.
  - `checkout.session.completed` with `setup_intent` → calls `stripe.subscriptions.update(subId, { default_payment_method })`, returns 200.
  - `checkout.session.completed` without `setup_intent` → returns 200 (inner function returns early but outer `checkoutSessionCompleted` always returns 200).
  - Unknown event type (e.g. `invoice.paid`) → returns 202 without touching Sanity or fetch.
  - GET request (`httpMethod !== 'POST'`) → returns 405.
- Set `process.env.ENV = 'test'` and `process.env.STRIPE_WEBHOOK_BUILD_HOOK = 'https://example.test/hook'` in `beforeEach`; restore in `afterEach`.
- Aim for ≤ 6 tests in THIS task (Task 2 will add 3 more — total 9 in this file). Each asserts ONE observable outcome (mock call + status code). No multi-assertion grab-bags.

**Definition of Done:**

- [ ] New file `web/src/functions/tests/__tests__/stripe-webhooks.test.js` exists with the test cases above.
- [ ] Every test asserts observable mock interactions (e.g. `expect(writeClient.patch).toHaveBeenCalledWith('client-id-abc')`), not internal control flow.
- [ ] Verify: `cd web && pnpm test -- --silent stripe-webhooks` exits 0 with all tests passing against unchanged production code.

### Task 2: Add `customer.subscription.deleted` handler with lookup-by-subscription-id and field clear

**Objective:** Following TDD, write one failing test in `stripe-webhooks.test.js` that synthesises a `customer.subscription.deleted` event, then add the production code in `web/src/functions/stripe-webhooks.js` to (1) look up the Sanity client document by the subscription ID via parameterised GROQ, (2) unset every `subscription.*` field except `customerId`, (3) trigger the Netlify build hook, (4) return 200. Verified by TS-001 (acceptance scenario) and by the new vitest cases.

**Files:**

- Modify: `web/src/functions/stripe-webhooks.js`
- Modify: `web/src/functions/tests/__tests__/stripe-webhooks.test.js`

**Key Decisions / Notes:**

- Register `'customer.subscription.deleted': customerSubscriptionDeleted` in the `eventTypesToProcess` map at `stripe-webhooks.js:90-94`.
- **Harden outer catch first**: change `stripe-webhooks.js:110` from `return respond(err.statusCode);` to `return respond(err.statusCode ?? 500);`. This is a one-character fix that prevents undefined statusCode being returned when the new helpers throw plain `Error` objects. Confirm existing handlers still pass after this change (the Task 1 regression tests cover them).
- Implement `getMatchingPublishedClientDocsForSubscriptionId(subscriptionId)` using parameterised GROQ that excludes drafts (mirror `sign-upload-url.js:75-82` AND `_data/clients.js:32`); return an ARRAY of matches (no `[0]`):
  ```js
  const filter = `*[
    _type == "client" &&
    !(_id in path("drafts.**")) &&
    subscription.subscriptionId == $subscriptionId
  ] { "id": _id }`;
  return await readClient.fetch(filter, { subscriptionId }).catch(err => {
    Sentry.captureException(err);
    console.error('💣 Sanity get client by subscriptionId error:', err);
    return [];
  });
  ```
- Implement `clearSanitySubscriptionDetails(id)` using `unset` (do NOT extend `updateSanityClientDocument` — semantics differ):
  ```js
  const paths = [
    'subscription.type',
    'subscription.subscriptionId',
    'subscription.agreement',
    'subscription.proposalId',
    'subscription.proposalNumber',
    'subscription.products',
    'subscription.discount',
  ];
  const doc = await writeClient.patch(id).unset(paths).commit();
  console.info(`✏️ Cleared Sanity client document ${id} (rev ${doc._rev}); unset paths: ${JSON.stringify(paths)}`);
  ```
  `subscription.customerId` is INTENTIONALLY omitted — the customer relationship survives subscription end.
- `customerSubscriptionDeleted(event)` body — branches on match count, ALWAYS returns 200 (no Stripe retries):
  ```js
  const subscriptionId = event.data.object.id;
  const matches = await getMatchingPublishedClientDocsForSubscriptionId(subscriptionId);

  if (matches.length === 0) {
    const msg = `💣 No published Sanity client document found for subscription ID ${subscriptionId}`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return respond(200);
  }

  if (matches.length > 1) {
    const ids = matches.map(m => m.id);
    const msg = `💣 Ambiguous match: ${matches.length} published Sanity client documents share subscription ID ${subscriptionId}: ${JSON.stringify(ids)}. Not mutating any — manual cleanup required.`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return respond(200);
  }

  await clearSanitySubscriptionDetails(matches[0].id);
  await triggerNetlifyBuild();
  return respond(200);
  ```
- New vitest cases in `stripe-webhooks.test.js` (3 cases):
  - `customer.subscription.deleted` with exactly one matching published doc → `readClient.fetch` called with `{ subscriptionId: 'sub_x' }` and the filter contains `!(_id in path("drafts.**"))` (assert with `expect.stringContaining`), `writeClient.patch('client-id-x').unset([...7 paths...]).commit()` called with EXACTLY those seven paths (deep-equal assertion), fetch to build hook called once, returns 200.
  - `customer.subscription.deleted` with empty match array → `Sentry.captureException` called once, `writeClient.patch` NOT called, build-hook fetch NOT called, returns 200.
  - `customer.subscription.deleted` with two-element match array → `Sentry.captureException` called once with a message containing both document IDs, `writeClient.patch` NOT called, build-hook fetch NOT called, returns 200.
- Do NOT refactor the existing `getSanityDocumentIdForClientId` helper to use parameterised GROQ or draft exclusion in this task — that's noted as Out of Scope.

**Definition of Done:**

- [ ] `customer.subscription.deleted` appears as a key in `eventTypesToProcess`.
- [ ] The two new helpers (`getMatchingPublishedClientDocsForSubscriptionId`, `clearSanitySubscriptionDetails`) and the new handler (`customerSubscriptionDeleted`) exist in `stripe-webhooks.js`.
- [ ] The GROQ filter literally contains `!(_id in path("drafts.**"))` so drafts are excluded; verified by a vitest assertion using `expect.stringContaining`.
- [ ] Outer handler catch reads `respond(err.statusCode ?? 500)`; verified by a vitest case that forces the dispatched handler to throw a plain `Error` and asserts the response is `{ statusCode: 500 }`.
- [ ] The new vitest cases assert the seven unset paths exactly (no more, no less; `subscription.customerId` absent).
- [ ] The ambiguity branch (`matches.length > 1`) Sentry-captures and does NOT mutate Sanity nor trigger Netlify; verified by a vitest case.
- [ ] Sending a synthetic `customer.subscription.deleted` event with a known `sub_*` to a local netlify dev (`pnpm netlify:dev`) results in: matching client's Sanity doc has `subscription.customerId` unchanged, all other `subscription.*` fields absent, and the `STRIPE_WEBHOOK_BUILD_HOOK` URL receives a POST.
- [ ] Verify: `cd web && pnpm test -- --silent stripe-webhooks` exits 0; `cd web && pnpm lint:check` exits 0.

## E2E Test Scenarios

> Runtime profile is Minimal (server-side webhook handler, no UI). One scripted acceptance scenario is included because the user-visible outcome (Sanity record state + rebuild trigger) cannot be fully proven by unit tests alone.

### TS-001: customer.subscription.deleted clears all subscription fields except customerId and triggers Netlify build

**Priority:** Critical
**Preconditions:**
- A Sanity `client` document exists with `subscription.subscriptionId = 'sub_test_e2e_001'`, `subscription.customerId = 'cus_test_e2e_001'`, plus non-empty `subscription.products` (≥1 entry) and a non-empty `subscription.agreement`.
- `pnpm netlify:dev` running locally with `STRIPE_WEBHOOK_BUILD_HOOK` set to a request-capture URL (e.g. webhook.site).
- Stripe CLI installed and authenticated: `stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhooks`.
**Mapped Tasks:** Task 2

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `stripe trigger customer.subscription.deleted` then patch the resulting event payload so `data.object.id === 'sub_test_e2e_001'` (or pre-create a real test subscription with that ID and trigger via `stripe subscriptions cancel sub_test_e2e_001`) | Stripe CLI prints `→ POST /.netlify/functions/stripe-webhooks` and Netlify dev logs `🖥 Processing customer.subscription.deleted` followed by `✏️ Cleared Sanity client document ...` |
| 2 | Re-fetch the Sanity client document via `npx sanity documents get <doc-id>` (or Vision) | `subscription.customerId === 'cus_test_e2e_001'` (unchanged); `subscription.subscriptionId`, `subscription.type`, `subscription.agreement`, `subscription.proposalId`, `subscription.proposalNumber`, `subscription.products`, `subscription.discount` are all absent from the document |
| 3 | Check the webhook.site (or equivalent) build-hook capture URL | One POST request received with no body, content-type `application/octet-stream` or empty, matching the `STRIPE_WEBHOOK_BUILD_HOOK` value |
| 4 | Re-send the same `customer.subscription.deleted` event via `stripe events resend <event_id>` | Handler runs again, Sanity doc state is unchanged (idempotent), a second POST hits the build-hook URL — confirms idempotent re-runs are safe |
| 5 | Before step 1, create a Sanity draft of the test client doc by opening it in Studio and making any small edit (don't publish). Then run step 1 again with a different `sub_test_e2e_001b` ID first set via Studio. The draft now carries the new sub_id; the published doc still carries the old one. Stripe is set to send `deleted` for the published doc's sub_id (`sub_test_e2e_001`). | Handler logs `✏️ Cleared Sanity client document <published-id>` (NOT the `drafts.<id>` variant). Verify by fetching `*[_type == 'client' && !(_id in path('drafts.**'))][...]` — only the published doc has `subscription.subscriptionId` cleared. The draft retains its values. This confirms the draft-exclusion clause works. |
