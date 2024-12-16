// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'test_key';
process.env.SENTRY_DSN = 'test_dsn';
process.env.ENV = 'test';

// Mock Stripe as a constructor function
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'test_session_id' })
      }
    },
    customers: {
      list: jest.fn().mockResolvedValue([])
    },
    taxRates: {
      list: jest.fn().mockResolvedValue([])
    },
    coupons: {
      create: jest.fn().mockResolvedValue({ id: 'test_coupon_id' })
    }
  }));
});

jest.mock('@sentry/serverless', () => ({
  AWSLambda: {
    init: jest.fn(),
    wrapHandler: jest.fn(handler => handler)
  },
  captureException: jest.fn()
}));

jest.mock('../../../config/utils/sanityClient', () => ({
  fetch: jest.fn()
}));

jest.mock('../../../config/functions/index', () => ({
  generateDummyEmail: jest.fn(),
  getCommitRef: jest.fn(),
  isProduction: jest.fn()
}));
