/**
 * The practice's prices, in one typed module. Shared rule 12 lists them among
 * the facts that must stay in step across pages, so every page reads them from
 * here. The figures arrive with the pages that show them; until then this
 * module holds only their shape (shared rule 9).
 */

/** An amount in pence, so sums never meet floating-point rounding. */
export type Pence = number;

/** A change to the core package's monthly price, + VAT. */
export interface PackageAdjustment {
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
