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

  test('refuses a document key when the email does not match the one on record', async () => {
    // Stands in for Sanity: the stored document is returned only if the query
    // filters on both values and the submitted ones match. A query that drops
    // either filter would return the document to anyone and fail this test.
    sanityClient.fetch.mockImplementation(async (query, params) => {
      const emailMatches =
        query.includes('email == $email') && params.email === 'stored@example.com';
      const keyMatches =
        query.includes('$documentKey in documents[]._key') && params.documentKey === 'abc';

      return emailMatches && keyMatches
        ? { client: 'Acme Ltd', type: 'Accounts', url: 'https://cdn.sanity.io/files/doc.pdf' }
        : null;
    });

    const refused = await post({ email: 'wrong@example.com', documentKey: 'abc' });
    const allowed = await post({ email: 'Stored@Example.com', documentKey: 'abc' });

    expect(refused.statusCode).toBe(400);
    expect(allowed.statusCode).toBe(200);
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
