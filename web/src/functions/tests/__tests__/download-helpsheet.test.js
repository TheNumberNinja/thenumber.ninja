import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../config/utils/sanityClient.js', () => ({
  default: { fetch: vi.fn() },
}));

vi.mock('@sentry/serverless', () => ({
  default: {
    AWSLambda: {
      init: vi.fn(),
      wrapHandler: fn => fn,
    },
  },
}));

vi.mock('../../../../config/functions/index.js', () => ({
  getCommitRef: () => 'test-commit',
  isProduction: () => false,
}));

import sanityClient from '../../../../config/utils/sanityClient.js';
import { handler } from '../../download-helpsheet.js';

const post = body => handler({ httpMethod: 'POST', body: JSON.stringify(body) });

describe('download-helpsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  test('passes email and document key as query parameters, never in the query text', async () => {
    sanityClient.fetch.mockResolvedValue(null);
    const email = 'Someone@Example.com" || true || "';
    const documentKey = 'key" || true || "';

    await post({ email, documentKey });

    const [query, params] = sanityClient.fetch.mock.calls[0];
    expect(query).not.toContain(email.toLowerCase());
    expect(query).not.toContain(documentKey);
    expect(params).toEqual({ email: email.toLowerCase(), documentKey });
  });

  test('returns the download link when the email matches', async () => {
    sanityClient.fetch.mockResolvedValue({
      client: 'Acme Ltd',
      type: 'Year end accounts',
      url: 'https://cdn.sanity.io/files/doc.pdf',
    });

    const response = await post({ email: 'a@example.com', documentKey: 'abc' });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).url).toBe(
      'https://cdn.sanity.io/files/doc.pdf?dl=Year-end-accounts-for-Acme-Ltd.pdf'
    );
  });

  test('returns 400 when no document matches the email', async () => {
    sanityClient.fetch.mockResolvedValue(null);

    const response = await post({ email: 'a@example.com', documentKey: 'abc' });

    expect(response.statusCode).toBe(400);
  });

  test.each([
    [{ documentKey: 'abc' }],
    [{ email: 'a@example.com' }],
    [{ email: ['a@example.com'], documentKey: 'abc' }],
    [{ email: 'a@example.com', documentKey: { $ne: '' } }],
  ])('returns 400 without querying Sanity for invalid input %j', async body => {
    const response = await post(body);

    expect(response.statusCode).toBe(400);
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });

  test('rejects methods other than POST', async () => {
    const response = await handler({ httpMethod: 'GET' });

    expect(response.statusCode).toBe(405);
  });
});
