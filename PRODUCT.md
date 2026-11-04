# Product

<!-- impeccable:product-schema 1 -->

The authority for brand, voice, services, prices and claims is the shared rule `number-ninja`, rendered into `.claude/rules/tnn-shared/number-ninja.md` from the `shared-rules` repo. This file summarises the product truth that design work needs and points there for detail. Where the two disagree, the shared rule wins. Update it there, not here.

## Platform

web

## Users

Directors of UK limited companies with one or two directors, mostly businesses that sell time or expertise: consultants, agencies, software and games studios. Almost all arrive recommended by someone in Emma's network, so they already know the name and come to the site to check the practice out before getting in touch. They run their own business and deal with HMRC and Companies House, and many already use Xero. They are not accountants.

Secondary audiences: established online retailers (priced individually); people not ready for a package, such as those just starting out or sole traders deciding whether to incorporate, who are offered the Power Hour; and people who heard Emma speak and followed a link she shared.

Existing clients are a separate audience. They use the client area to reach their dashboard, forms, guides and call bookings.

## Product Purpose

The website for The Number Ninja, a small UK accountancy practice in Ely, Cambridgeshire, run by two directors: Emma (the accountant) and Stuart (the technical director and a software engineer). It handles accounts, tax and bookkeeping as one package for one monthly fee, for clients across the UK by email and video call.

The site's first job is vetting. A recommended reader should learn, in roughly this order: that the recommendation was right and the practice is real people; whether it's for them, including a plain statement of who it isn't for; roughly what it costs, in actual numbers; and what happens if they get in touch. A page that leaves a poor fit unsure whether to book a call has failed. Being found through search is the second job.

The client area's job is to let existing clients do what the practice needs from them (forms, uploads, card details, call bookings) and see their key dates, without phone or paper.

## Positioning

Accounts, tax and bookkeeping for UK limited companies run by one or two directors, handled as one package by a small practice with an accountant and a software engineer behind it. Three things set it apart, and every page supports at least one:

1. **Everything in one package.** Bookkeeping, accounts, tax, VAT, payroll and Xero for one monthly fee. The practice does the bookkeeping; the client doesn't.
2. **Someone who knows your business.** Clients deal with the person doing their accounts.
3. **Better systems.** A secure client dashboard, simple onboarding, and tools for sharing what the practice needs, some built in-house.

## Operating Context

- Readers usually arrive by name, from a recommendation or a talk, rather than from a search.
- Getting started: a free introductory call by video, a price on the call, a written proposal, online acceptance, a new client form, ID sent through a secure link, then Xero set up with bank feeds and a receipts email address.
- The practice works 9am to 4pm, Monday to Friday, by email and booked video calls. There is no phone support and no phone number anywhere.
- Each year the agreement is renewed and the fee reviewed.
- Client records live in Sanity (`studio/`). Payments run through Stripe.

## Capabilities and Constraints

**Surfaces.** v2 (`site/`) replaces v1 (`web/`) and must cover both before the switch-over:

- public pages: home, service businesses, online retailers, Power Hour, how we work, about, talks, Get started, legal pages, and a 404
- the client area: the client dashboard, uploads, forms, guides and helpsheets, the glossary, client call booking, and updating payment card details

The marketing pages come first. How the client dashboard renders (static or on-demand) is undecided.

**Technical.** Astro 7, static output, Tailwind 4, `astro-icon`, Netlify Functions. Interactivity is TypeScript in `<script>` tags; no UI framework unless a task justifies one. No analytics, tracking or cookie-setting third-party script. URLs end in a slash. Every price comes from `site/src/data/prices.ts`. The repo is public, so no search research and no internal rules go in it. `site/CLAUDE.md` holds the full list.

**Terminology.** Fixed by the shared rule's section 5: "client" not "customer", "client dashboard" not "portal", "core package", "Power Hour", "introductory call", "Get started".

## Brand Commitments

- **Name:** The Number Ninja. The legal name, The Number Ninjas Ltd, appears only where a legal name is needed.
- **Voice:** plain, warm and direct; confident, not reassuring; specific, not adjectival; no hard sell. Shared rule sections 6 and 7 give the full rules, including no exclamation marks in body copy, no emoji, no em dashes in sentences, and British English.
- **Ninja wordplay and imagery are rare and light.** No ninja imagery for how the work is done (stealth, speed, martial arts). A light nod in a heading or on the 404 page is fine.
- **Logo and colours: open.** v1's raster logo (`web/src/assets/images/logo-header.png`) and colours (teal `#1a9785` as the main colour, charcoal `#4b4b4b`, blues `#34c1e4` and `#59bcdb`, red `#ed5151`) are where the design starts from, not binding. The owner expects to keep the brand colours in some form, but the design work may revisit both.

## Evidence on Hand

- Emma's headshot: `web/src/assets/images/headshots/emma.jpg`.
- Badges: IAB member and Xero Silver partner, in `web/src/assets/images/seals/`. Show each only while it is current. The IAB badge's file is named "in practice", a wording the shared rule forbids in copy, so check the badge itself before reusing it.
- One testimonial: Penni Pickering of Kabo Creative. No others exist yet.
- Trading since 2016.
- Emma's printing calculator story, for the About page, in her own words.
- **Photography:** new real photos of Emma and Stuart are planned. Until they arrive, layouts use clearly marked placeholders. v1's four carousel images are not photos of the practice.
- **Absences that must not be filled with invented content:** client counts, ratings, reviews, other testimonials, response times, outcome promises, and any professional credential beyond IAB membership.

## Product Principles

1. **Help the reader decide, including deciding no.** Fit, price and next step should be easy to find. Saying who the practice isn't for is part of the design, not small print.
2. **Facts over adjectives.** Real prices, hours, inclusions and people. If a section needs an adjective to work, it needs a fact instead.
3. **The site shows the systems.** "Better systems" is one of the three claims, so the site and client area must be fast, clear, accessible and well made.
4. **True by construction.** Claims, badges, testimonials and structured data appear only where they are true and visible, and prices come from one source.
5. **Real people, not a faceless firm.** Readers should come away knowing who they'd deal with.

## Accessibility & Inclusion

WCAG 2.2 AA, enforced on every built page by `pnpm check:a11y` (axe), alongside the shared rule's section 10: heading order, link text that names its destination, alt text by image type, and plain language. Readers include people with cognitive disabilities, people reading in a second language, and busy directors skimming between jobs.
