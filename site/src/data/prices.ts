/**
 * The practice's prices, in one typed module. Shared rule 12 lists them among
 * the facts that must stay in step across pages, so every page reads them from
 * here. The figures are shared rule section 9's; change them there and here in
 * the same session.
 */

/** An amount in pence, so sums never meet floating-point rounding. */
export type Pence = number;

/** A change to the core package's monthly price, + VAT. */
export interface PackageAdjustment {
  /** Stable key, so a page can pick one adjustment out by name. */
  id: "vat" | "director" | "multiCurrency" | "ownXero" | "singleShop";
  label: string;
  /** Positive adds to the monthly price; negative takes off. */
  monthly: Pence;
}

/** The core package: a monthly price + VAT, and its additions and reductions. */
export interface CorePackage {
  monthly: Pence;
  adjustments: PackageAdjustment[];
}

/** Directors' self assessment, a month + VAT. */
export interface SelfAssessment {
  monthly: Pence;
  /** Added for each source of income beyond salary and dividends. */
  perOtherIncomeSource: Pence;
}

/** A one-off service with a price including VAT. */
export interface OneOffService {
  label: string;
  priceIncVat: Pence;
}

export interface Prices {
  corePackage: CorePackage;
  selfAssessment: SelfAssessment;
  powerHour: OneOffService;
  /** "From around" figure for established online retailers, a month + VAT. */
  ecommerceFrom: Pence;
}

export const prices: Prices = {
  corePackage: {
    monthly: 24500,
    adjustments: [
      {
        id: "vat",
        label: "VAT registered (quarterly VAT returns)",
        monthly: 3675,
      },
      { id: "director", label: "Each additional director", monthly: 1500 },
      {
        id: "multiCurrency",
        label: "Bank accounts in more than one currency (Xero Comprehensive)",
        monthly: 1500,
      },
      { id: "ownXero", label: "You already pay for Xero", monthly: -3500 },
      {
        id: "singleShop",
        label: "Products through a single online shop",
        monthly: 3000,
      },
    ],
  },
  selfAssessment: { monthly: 1500, perOtherIncomeSource: 625 },
  powerHour: { label: "Power Hour", priceIncVat: 18000 },
  ecommerceFrom: 60000,
};

/** One core package adjustment by its key. */
export function adjustment(id: PackageAdjustment["id"]): PackageAdjustment {
  const found = prices.corePackage.adjustments.find((a) => a.id === id);
  if (!found) throw new Error(`No package adjustment "${id}".`);
  return found;
}
