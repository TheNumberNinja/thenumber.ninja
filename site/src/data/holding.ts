/**
 * Titles and descriptions for the holding pages (src/pages/[holding].astro):
 * routes the menu and footer link to before their real pages exist. Remove an
 * entry when its real page arrives.
 */
export const holdingPages: Record<
  string,
  { title: string; description: string }
> = {
  "e-commerce": {
    title: "Accounts for online retailers",
    description:
      "Accounts, tax and bookkeeping for established online retailers, priced individually. This page is being written for the new site.",
  },
  "how-we-work": {
    title: "How we work",
    description:
      "How getting started works, what happens through the year, and our working hours. This page is being written for the new site.",
  },
  about: {
    title: "About Emma and Stuart",
    description:
      "Who runs The Number Ninja: Emma, the accountant, and Stuart, the technical director. This page is being written for the new site.",
  },
  "get-started": {
    title: "Get started",
    description:
      "Tell us about your business and book a free introductory call by video. This page is being written for the new site.",
  },
  "power-hour": {
    title: "Power Hour: an hour with Emma",
    description:
      "An hour with Emma on a video call, with a recording to refer back to. This page is being written for the new site.",
  },
  "client-area": {
    title: "Client area",
    description:
      "The client dashboard, forms, step by step guides and client call bookings. This page is being written for the new site.",
  },
  glossary: {
    title: "Glossary of accounting terms",
    description:
      "Plain explanations of the accounting and tax terms we use. This page is being written for the new site.",
  },
  privacy: {
    title: "Privacy policy",
    description:
      "How The Number Ninja handles personal information. This page is being written for the new site.",
  },
  cookies: {
    title: "Cookie policy",
    description:
      "Which cookies this site uses and why. This page is being written for the new site.",
  },
  terms: {
    title: "Website terms of use",
    description:
      "The terms that apply to using this site. This page is being written for the new site.",
  },
};
