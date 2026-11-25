/**
 * The main menu and footer links (PRODUCT.md site map). Each main menu item
 * answers a prospect's question; client tools stay in the footer.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const mainMenu: NavLink[] = [
  { label: "Service businesses", href: "/service-businesses/" },
  { label: "E-commerce", href: "/e-commerce/" },
  { label: "How we work", href: "/how-we-work/" },
  { label: "About", href: "/about/" },
];

export const getStarted: NavLink = {
  label: "Get started",
  href: "/get-started/",
};

export const powerHour: NavLink = { label: "Power Hour", href: "/power-hour/" };

export const footerMenu: NavLink[] = [
  { label: "Client area", href: "/client-area/" },
  powerHour,
  { label: "Glossary", href: "/glossary/" },
];

export const legalMenu: NavLink[] = [
  { label: "Privacy", href: "/privacy/" },
  { label: "Cookies", href: "/cookies/" },
  { label: "Terms", href: "/terms/" },
];
