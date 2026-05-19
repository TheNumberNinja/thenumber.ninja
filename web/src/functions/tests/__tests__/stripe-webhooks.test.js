import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Sanity mock — factory uses only vi.fn() (no external references, safe to hoist).
vi.mock('../../../../config/utils/sanityClient.js', () => {
  const commit = vi.fn().mockResolvedValue({ _rev: 'rev1' });
  const patchChain = {
    set: vi.fn().mockReturnValue({ commit }),
    unset: vi.fn().mockReturnValue({ commit }),
  };
  return {
    default: {
      fetch: vi.fn(),
      withConfig: vi.fn().mockReturnValue({ patch: vi.fn().mockReturnValue(patchChain) }),
    },
  };
});

vi.mock('@sentry/serverless', () => ({
  default: {
    AWSLambda: {
      init: vi.fn(),
      wrapHandler: fn => fn,
    },
    captureException: vi.fn(),
  },
}));

// Stripe mock — stores the constructed instance in globalThis so tests can
// configure and inspect stripe.setupIntents / stripe.subscriptions without hoisting.
vi.mock('stripe', () => ({
  default: class Stripe {
    constructor() {
      this.webhooks = {
        generateTestHeaderString: vi.fn().mockReturnValue('t=1,v1=abc'),
        constructEvent: vi.fn().mockImplementation(body => JSON.parse(body)),
      };
      this.setupIntents = { retrieve: vi.fn() };
      this.subscriptions = { update: vi.fn() };
      globalThis.__mockStripe = this;
    }
  },
}));

import sanityClient from '../../../../config/utils/sanityClient.js';
import { handler } from '../../stripe-webhooks.js';

// stripe-webhooks.js calls readClient.withConfig() once at module load time.
// Capture writeClient here — before any vi.clearAllMocks() in afterEach wipes mock.results.
const writeClient = sanityClient.withConfig.mock.results[0].value;

function makeEvent(stripeEventType, dataObject) {
  const stripeEvent = { type: stripeEventType, data: { object: dataObject } };
  return {
    httpMethod: 'POST',
    headers: { 'stripe-signature': 'test-sig' },
    body: JSON.stringify(stripeEvent),
  };
}

beforeEach(() => {
  process.env.ENV = 'test';
  process.env.STRIPE_WEBHOOK_SIGNING_SECRET = 'whsec_test';
  process.env.STRIPE_WEBHOOK_BUILD_HOOK = 'https://example.test/hook';
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.ENV;
  delete process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
  delete process.env.STRIPE_WEBHOOK_BUILD_HOOK;
});

describe('handler — HTTP method guard', () => {
  test('returns 405 for non-POST requests', async () => {
    const res = await handler({ httpMethod: 'GET', headers: {}, body: '' }, {});
    expect(res.statusCode).toBe(405);
  });
});

describe('handler — unknown event type', () => {
  test('returns 202 and does not touch Sanity or the build hook', async () => {
    const res = await handler(makeEvent('invoice.paid', {}), {});
    expect(res.statusCode).toBe(202);
    expect(sanityClient.fetch).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('customer.subscription.created', () => {
  test('sets customerId + subscriptionId in Sanity and triggers build hook', async () => {
    sanityClient.fetch.mockResolvedValue({ id: 'sanity-doc-abc' });

    const res = await handler(
      makeEvent('customer.subscription.created', {
        id: 'sub_x',
        customer: 'cus_x',
        metadata: { client_id: 'client-abc' },
      }),
      {}
    );

    const wc = writeClient;
    expect(res.statusCode).toBe(200);
    expect(wc.patch).toHaveBeenCalledWith('sanity-doc-abc');
    expect(wc.patch.mock.results[0].value.set).toHaveBeenCalledWith({
      'subscription.customerId': 'cus_x',
      'subscription.subscriptionId': 'sub_x',
    });
    expect(globalThis.fetch).toHaveBeenCalledWith('https://example.test/hook', { method: 'POST' });
  });
});

describe('checkout.session.expired', () => {
  test('nulls out customerId + subscriptionId in Sanity and triggers build hook', async () => {
    sanityClient.fetch.mockResolvedValue({ id: 'sanity-doc-abc' });

    const res = await handler(
      makeEvent('checkout.session.expired', {
        metadata: { client_id: 'client-abc' },
      }),
      {}
    );

    const wc = writeClient;
    expect(res.statusCode).toBe(200);
    expect(wc.patch).toHaveBeenCalledWith('sanity-doc-abc');
    expect(wc.patch.mock.results[0].value.set).toHaveBeenCalledWith({
      'subscription.customerId': null,
      'subscription.subscriptionId': null,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith('https://example.test/hook', { method: 'POST' });
  });
});

describe('checkout.session.completed', () => {
  test('updates subscription default_payment_method when setup_intent present', async () => {
    globalThis.__mockStripe.setupIntents.retrieve.mockResolvedValue({
      metadata: { subscription_id: 'sub_x' },
      payment_method: 'pm_x',
    });

    const res = await handler(
      makeEvent('checkout.session.completed', { setup_intent: 'si_abc' }),
      {}
    );

    expect(res.statusCode).toBe(200);
    expect(globalThis.__mockStripe.setupIntents.retrieve).toHaveBeenCalledWith('si_abc');
    expect(globalThis.__mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_x', {
      default_payment_method: 'pm_x',
    });
  });

  test('returns 200 and skips Stripe calls when setup_intent is absent', async () => {
    const res = await handler(
      makeEvent('checkout.session.completed', { setup_intent: null }),
      {}
    );

    expect(res.statusCode).toBe(200);
    expect(globalThis.__mockStripe.setupIntents.retrieve).not.toHaveBeenCalled();
    expect(globalThis.__mockStripe.subscriptions.update).not.toHaveBeenCalled();
  });
});

// ── Task 2: customer.subscription.deleted ─────────────────────────────────

const EXPECTED_UNSET_PATHS = [
  'subscription.type',
  'subscription.subscriptionId',
  'subscription.agreement',
  'subscription.proposalId',
  'subscription.proposalNumber',
  'subscription.products',
  'subscription.discount',
];

describe('customer.subscription.deleted', () => {
  test('clears 7 subscription fields (not customerId), triggers build hook, returns 200', async () => {
    sanityClient.fetch.mockResolvedValue([{ id: 'client-id-x' }]);

    const res = await handler(
      makeEvent('customer.subscription.deleted', { id: 'sub_x', customer: 'cus_x' }),
      {}
    );

    expect(res.statusCode).toBe(200);
    // GROQ filter must exclude drafts
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('!(_id in path("drafts.**"))'),
      { subscriptionId: 'sub_x' }
    );
    // patch called with the matched doc id
    expect(writeClient.patch).toHaveBeenCalledWith('client-id-x');
    // unset called with exactly the 7 paths (subscription.customerId must be absent)
    const patchChain = writeClient.patch.mock.results[0].value;
    expect(patchChain.unset).toHaveBeenCalledWith(EXPECTED_UNSET_PATHS);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://example.test/hook', { method: 'POST' });
  });

  test('logs + captures to Sentry and returns 200 when no matching doc found', async () => {
    sanityClient.fetch.mockResolvedValue([]);

    const res = await handler(
      makeEvent('customer.subscription.deleted', { id: 'sub_missing' }),
      {}
    );

    expect(res.statusCode).toBe(200);
    // Sentry should be notified but Sanity should not be mutated
    const { captureException } = (await import('@sentry/serverless')).default;
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(writeClient.patch).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('triggers build (not clear) when subscriptionId gone but customerId still present — retry recovery', async () => {
    // Simulates a Stripe retry after a partial failure:
    // prior attempt cleared subscription.subscriptionId but the build hook failed.
    // The lookup by subscriptionId returns []; fallback by customerId finds the doc.
    sanityClient.fetch
      .mockResolvedValueOnce([])                  // getMatchingPublishedClientDocsForSubscriptionId → no match
      .mockResolvedValueOnce({ id: 'doc-abc' });  // getMatchingPublishedClientDocByCustomerId → found

    const res = await handler(
      makeEvent('customer.subscription.deleted', { id: 'sub_cleared', customer: 'cus_x' }),
      {}
    );

    expect(res.statusCode).toBe(200);
    expect(writeClient.patch).not.toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledWith('https://example.test/hook', { method: 'POST' });
    const { captureException } = (await import('@sentry/serverless')).default;
    expect(captureException).not.toHaveBeenCalled();
  });

  test('logs + captures to Sentry and returns 200 when multiple docs match (ambiguity guard)', async () => {
    sanityClient.fetch.mockResolvedValue([{ id: 'doc-a' }, { id: 'doc-b' }]);

    const res = await handler(
      makeEvent('customer.subscription.deleted', { id: 'sub_dup' }),
      {}
    );

    expect(res.statusCode).toBe(200);
    const { captureException } = (await import('@sentry/serverless')).default;
    expect(captureException).toHaveBeenCalledTimes(1);
    // The captured error message must contain both doc IDs
    const capturedError = captureException.mock.calls[0][0];
    expect(capturedError.message).toContain('doc-a');
    expect(capturedError.message).toContain('doc-b');
    expect(writeClient.patch).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('handler — hardened outer catch', () => {
  test('returns 500 (not undefined) when dispatched handler throws a plain Error', async () => {
    // Make the Sanity fetch succeed (one match) but the write throw a plain Error.
    sanityClient.fetch.mockResolvedValue([{ id: 'doc-id' }]);
    writeClient.patch.mockImplementation(() => { throw new Error('write failure'); });

    const res = await handler(
      makeEvent('customer.subscription.deleted', { id: 'sub_x' }),
      {}
    );

    // Before the fix: respond(undefined) → statusCode undefined.
    // After the fix:  respond(err.statusCode ?? 500) → statusCode 500.
    expect(res.statusCode).toBe(500);
  });
});
