import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock external dependencies before importing the module
vi.mock('../../config/utils/sanityClient.js', () => ({
  default: { fetch: vi.fn() },
}));

vi.mock('@sentry/serverless', () => ({
  default: {
    AWSLambda: {
      init: vi.fn(),
      wrapHandler: (fn) => fn,
    },
    captureException: vi.fn(),
  },
}));

vi.mock('../../config/functions/index.js', () => ({
  getCommitRef: () => 'test-commit',
  isProduction: () => false,
}));

import { validateRequest, isBlockedExtension, isValidUUID } from './sign-upload-url.js';

describe('isBlockedExtension', () => {
  it('blocks executable files', () => {
    expect(isBlockedExtension('.exe')).toBe(true);
    expect(isBlockedExtension('.bat')).toBe(true);
    expect(isBlockedExtension('.msi')).toBe(true);
  });

  it('blocks script files', () => {
    expect(isBlockedExtension('.js')).toBe(true);
    expect(isBlockedExtension('.ps1')).toBe(true);
    expect(isBlockedExtension('.sh')).toBe(true);
  });

  it('allows document files', () => {
    expect(isBlockedExtension('.pdf')).toBe(false);
    expect(isBlockedExtension('.xlsx')).toBe(false);
    expect(isBlockedExtension('.docx')).toBe(false);
  });

  it('allows image files', () => {
    expect(isBlockedExtension('.jpg')).toBe(false);
    expect(isBlockedExtension('.png')).toBe(false);
    expect(isBlockedExtension('.gif')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isBlockedExtension('.EXE')).toBe(true);
    expect(isBlockedExtension('.PDF')).toBe(false);
  });
});

describe('isValidUUID', () => {
  it('accepts valid UUIDs', () => {
    expect(isValidUUID('a1b2c3d4-e5f6-7890-abcd-1234567890ab')).toBe(true);
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('../../etc/passwd')).toBe(false);
    expect(isValidUUID('')).toBe(false);
  });
});

describe('validateRequest', () => {
  const validRequest = {
    clientId: 'client123',
    batchId: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    filename: 'document.pdf',
    contentType: 'application/pdf',
  };

  it('passes for valid request', () => {
    const result = validateRequest(validRequest);
    expect(result.valid).toBe(true);
  });

  it('fails for missing clientId', () => {
    const result = validateRequest({ ...validRequest, clientId: undefined });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('clientId');
  });

  it('fails for missing batchId', () => {
    const result = validateRequest({ ...validRequest, batchId: undefined });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('batchId');
  });

  it('fails for invalid batchId format', () => {
    const result = validateRequest({ ...validRequest, batchId: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('batch ID');
  });

  it('fails for blocked file extension', () => {
    const result = validateRequest({ ...validRequest, filename: 'virus.exe' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('.exe');
  });
});
