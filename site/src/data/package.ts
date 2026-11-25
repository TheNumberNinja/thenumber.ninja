/**
 * What the core package includes and who it isn't for (shared rules sections
 * 3 and 9), in one place so the home page and the Service businesses page
 * can't drift apart (shared rule 12).
 */

export interface IncludedItem {
  text: string;
  /** A sentence more, shown only on the Service businesses page. */
  more?: string;
}

export const coreIncludes: IncludedItem[] = [
  { text: "Xero, on the Grow plan" },
  {
    text: "Bookkeeping, kept up to date each month",
    more: "Send us receipts by email or snap them in the app.",
  },
  {
    text: "Annual accounts and corporation tax return",
    more: "We confirm the tax bill in plenty of time.",
  },
  { text: "Your confirmation statement, with the Companies House fee" },
  { text: "Director payroll" },
  { text: "A secure client dashboard with your key dates" },
];

/** "We're probably not right for you if…" Each item completes that sentence. */
export interface NotForItem {
  text: string;
  /** The alternative, where there is one. */
  detail?: string;
  link?: { label: string; href: string; after: string };
}

export const notFor: NotForItem[] = [
  {
    text: "you'd rather talk things through by phone",
    detail:
      "We work by email and video call, and you book calls straight into our calendar.",
  },
  {
    text: "you're just starting out and a monthly fee would be a stretch",
    link: {
      label: "A Power Hour",
      href: "/power-hour/",
      after: " might suit you better.",
    },
  },
  { text: "you'd like an accountant who visits you in person" },
  {
    text: "you'd rather not send receipts electronically or link your bank account to Xero",
  },
];
