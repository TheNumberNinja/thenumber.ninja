import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DateTime, Settings } from 'luxon';

// Mock external dependencies before importing the module
vi.mock('../../../../config/utils/sanityClient.js', () => ({
  default: { fetch: vi.fn() },
}));

vi.mock('@sentry/serverless', () => ({
  default: {
    AWSLambda: {
      init: vi.fn(),
      wrapHandler: fn => fn,
    },
    captureException: vi.fn(),
  },
}));

vi.mock('../../../../config/functions/index.js', () => ({
  getCommitRef: () => 'test-commit',
  isProduction: () => false,
  generateDummyEmail: () => 'test@example.com',
}));

vi.mock('stripe', () => {
  return {
    default: class Stripe {
      constructor() {
        this.checkout = { sessions: { create: vi.fn() } };
        this.taxRates = { list: vi.fn() };
      }
    },
  };
});

import {
  calculateNumberOfCatchUpMonths,
  generateAccountsLineItems,
  calculateRemainingContractMonths,
} from '../../create-checkout-session.js';

describe('Time-based calculations', () => {
  const fixedTimestamp = new Date('2024-01-15T00:00:00.000Z').getTime();

  beforeEach(() => {
    // Fix the date to make tests deterministic
    Settings.now = () => fixedTimestamp;
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  describe('calculateRemainingContractMonths', () => {
    test('should calculate full year remaining', () => {
      const months = calculateRemainingContractMonths('2024-12-31');
      expect(months).toBe(12);
    });

    test('should calculate partial year remaining', () => {
      const months = calculateRemainingContractMonths('2024-06-30');
      expect(months).toBe(6);
    });

    test('should handle past end date', () => {
      const months = calculateRemainingContractMonths('2023-12-31');
      expect(months).toBe(-0); // The calculation results in a negative value but that doesn't matter
    });

    test('should round up partial months', () => {
      const months = calculateRemainingContractMonths('2024-03-20');
      expect(months).toBe(3); // Should round up from 2.X months
    });
  });

  describe('calculateNumberOfCatchUpMonths', () => {
    test('should return 12 for past year end', () => {
      expect(calculateNumberOfCatchUpMonths('2023-12-31')).toBe(12);
    });

    test('should return 0 for future financial year', () => {
      expect(calculateNumberOfCatchUpMonths('2025-01-01')).toBe(0);
    });

    test('should calculate partial year correctly', () => {
      expect(calculateNumberOfCatchUpMonths('2024-06-30')).toBe(6);
    });

    test('should handle edge case near month boundary', () => {
      // For date 2024-01-15, a year-end of 2024-02-01 should give us 11 months
      expect(calculateNumberOfCatchUpMonths('2024-02-01')).toBe(11);
    });

    test('should handle exact month boundaries', () => {
      // Mock the current date to the start of a month
      Settings.now = () => new Date('2024-01-01T00:00:00.000Z').getTime();
      expect(calculateNumberOfCatchUpMonths('2024-12-31')).toBe(0);
    });
  });
});

describe('generateAccountsLineItems', () => {
  beforeEach(() => {
    Settings.now = () => new Date('2024-01-15T00:00:00.000Z').getTime();
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  test('should handle empty products array', () => {
    const result = generateAccountsLineItems([], '2024-12-31');
    expect(result).toEqual([]);
  });

  test('should generate subscription without alignment fee when yearEnd is far in future', () => {
    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: 10000, // £100 in pence
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2024-12-31',
      },
    ];

    const result = generateAccountsLineItems(products, '2024-12-31');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      price: 'price_123',
      quantity: 1,
    });
  });

  test('should calculate alignment fee spread over remaining contract months', () => {
    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: 10000, // £100 in pence
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2024-06-30', // 5.5 months away from mock date
      },
    ];

    // Contract ends in 12 months
    const result = generateAccountsLineItems(products, '2024-12-31');

    expect(result).toHaveLength(2);
    // Regular subscription
    expect(result[0]).toEqual({
      price: 'price_123',
      quantity: 1,
    });
    // Alignment fee
    const alignmentFee = result[1];
    expect(alignmentFee.price_data.unit_amount).toBe(5000); // (6 months * £100) / 12 remaining months = £50
    expect(alignmentFee.price_data.recurring.interval).toBe('month');
    expect(alignmentFee.price_data.product_data.name).toContain('6 months alignment fee');
    expect(alignmentFee.price_data.product_data.name).toContain('12 months');
  });

  test('should handle the 11-month edge case by converting to full year', () => {
    Settings.now = () => new Date('2024-01-31T00:00:00.000Z').getTime();
    const productAmount = 10000;
    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: productAmount,
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2024-02-28', // Just 1 month away
      },
    ];

    const result = generateAccountsLineItems(products, '2024-02-28');

    // Should convert to 12 months to avoid single payment
    expect(result).toHaveLength(1);
    expect(result[0].price_data.unit_amount).toBe(productAmount * 12);
    expect(result[0].price_data.product_data.name).toBe('Basic Accounts (12 months alignment fee)');
  });

  test('should handle agreement end date in past', () => {
    Settings.now = () => new Date('2024-01-31T00:00:00.000Z').getTime();
    const productAmount = 10000;
    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: productAmount,
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2023-06-30',
      },
    ];

    // Agreement already ended
    const result = generateAccountsLineItems(products, '2023-06-30');

    expect(result).toHaveLength(1);
    // 12 months of catch-up should be spread over 1 month (minimum)
    expect(result[0].price_data.unit_amount).toBe(12 * productAmount);
    // Verify the description mentions it's paid over 1 month
    expect(result[0].price_data.product_data.name).toBe('Basic Accounts (12 months alignment fee)');
  });

  test('should default to 1 month when contract end date is over 1 year ago', () => {
    Settings.now = () => new Date('2024-01-15T00:00:00.000Z').getTime();

    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: 10000,
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2024-06-30',
      },
    ];

    // Set agreement end date to 2 years in the past
    const result = generateAccountsLineItems(products, '2022-01-15');

    expect(result).toHaveLength(2);
    const alignmentFee = result[1];

    // Verify that the full 6 months of catch-up (6 * 10000 = 60000)
    // is being charged in a single month
    expect(alignmentFee.price_data.unit_amount).toBe(60000);

    // Verify the description indicates it's being paid over 1 month
    expect(alignmentFee.price_data.product_data.name).toContain(
      '6 months alignment fee paid over 1 month'
    );
  });

  test('should handle multiple products with different year ends', () => {
    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: 10000,
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2024-12-31',
      },
      {
        _type: 'accountsProduct',
        name: 'Payroll',
        amount: 5000,
        priceId: 'price_456',
        quantity: 1,
        yearEnd: '2024-06-30',
      },
    ];

    const result = generateAccountsLineItems(products, '2024-12-31');

    expect(result).toHaveLength(3); // Basic Accounts subscription + Payroll subscription + Payroll alignment fee

    // Verify alignment fee calculation for second product
    const alignmentFee = result[2];
    expect(alignmentFee.price_data.unit_amount).toBe(2500); // (6 months * £50) / 12 remaining months
  });

  test('should only process accountsProduct type', () => {
    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: 10000,
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2024-12-31',
      },
      {
        _type: 'monthlyProduct',
        name: 'Support',
        amount: 5000,
        priceId: 'price_456',
      },
    ];

    const result = generateAccountsLineItems(products, '2024-12-31');

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe('price_123');
  });

  test('should charge full catch-up fee for previous years accounts when agreement ends in future', () => {
    Settings.now = () => new Date('2024-10-31T00:00:00.000Z').getTime();

    const productAmount = 10000;
    const products = [
      {
        _type: 'accountsProduct',
        name: 'Basic Accounts',
        amount: productAmount,
        priceId: 'price_123',
        quantity: 1,
        yearEnd: '2024-09-30',
      },
    ];

    const result = generateAccountsLineItems(products, '2024-12-31');

    expect(result).toHaveLength(1);
    expect(result[0].price_data.unit_amount).toBe(productAmount * 12);
    expect(result[0].price_data.product_data.name).toBe('Basic Accounts (12 months alignment fee)');
  });
});
