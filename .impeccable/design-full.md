---
name: The Number Ninja
description: Accounts, tax and bookkeeping for UK limited companies, told as the questions directors ask and answered in place.
colors:
  teal: "#0d5c58"
  chartreuse: "#cfdc4f"
  copper: "#f8dccb"
  ink: "#15172b"
  paper: "#ffffff"
  teal-text: "#cfe6e2"
  ink-text: "#dfe3e2"
  muted: "#3f5452"
  rule: "#15172b26"
  rule-on-teal: "#ffffff4d"
typography:
  display:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 7.4vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
    fontFeature: "lnum, tnum"
  headline:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.4vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  question:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 2.9vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "lnum"
  label:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  button:
    fontFamily: "Albert Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.25rem, 3.9vw, 3.5rem)"
  container: "83rem"
  column-gap: "3.5rem"
  row: "0.75rem"
  section-sm: "4.5rem"
  section-lg: "6.5rem"
components:
  button-primary:
    backgroundColor: "{colors.chartreuse}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.4rem"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.4rem"
  button-ink-hover:
    backgroundColor: "{colors.teal}"
  question-closed:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.paper}"
    typography: "{typography.question}"
    padding: "0.95rem 0"
  question-open:
    backgroundColor: "{colors.chartreuse}"
    textColor: "{colors.ink}"
    typography: "{typography.question}"
    rounded: "{rounded.none}"
  jump-link:
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.55rem 1rem"
  jump-link-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.teal}"
  note-copper:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1.35rem 1.5rem"
  close-band:
    backgroundColor: "{colors.chartreuse}"
    textColor: "{colors.ink}"
    padding: "4rem 0"
---

# Design System: The Number Ninja

## Overview

**Creative North Star: "Your Question, Answered"**

The site is a set of questions in the visitor's own words, each opening in place to a plain answer from Emma. The visual system serves that: a deep teal field carries whole regions edge to edge, the questions sit on it at large semibold size between hairline rules, and the one question you open turns chartreuse. Everything else is white paper and ink, laid out in a calm two-column rhythm where the left column asks and the right column answers.

It is flat, airy and square. There are no shadows, no rounded corners, no gradients and no illustration; depth comes from whole-band colour changes (teal, white, copper, chartreuse, ink) and from rules. One sans family does all the work, with weight and size carrying the hierarchy. The palette is Emma's colours, taken from her photograph, and nothing outside it.

The owner has rejected cobalt as a default colour, a signage or wayfinding look (too governmental), serif display type, rounded card grids, skeuomorphism and busy illustration.

**Key Characteristics:**
- Three colours plus ink and white; no gradients or extra hues, and no tints beyond the primary button's hover.
- Chartreuse is reserved: the opened question, the primary action and the closing bands, plus the current-page, selection and focus marks.
- Questions as headings, set large; answers at calm reading size.
- Square edges, hairline rules, drawn line arrows and ticks.
- Flat: colour bands and rules, never shadows.
- Emma's photograph as the only image; no illustration budget.

## Colors

Emma's colours: a deep teal ground, an acid chartreuse highlight and a pale copper field, held together by near-black ink and white.

### Primary
- **Emma's Teal** (teal): the field colour. Carries the header, the home hero with its questions, inner page heads and the quote band, always edge to edge as a whole region. Also the colour of drawn ticks and step numbers on white.

### Secondary
- **Opened Chartreuse** (chartreuse): the highlight. Fills the opened question, the primary Get started button, the closing bands ("Ask us yours", "Where next?"), the current-page underline in the nav, text selection, and the focus ring on teal and ink grounds.

### Tertiary
- **Pale Copper** (copper): the "not right for you" field and the aside note that says a fixed price won't fit. It marks honest limits, given the same care as the positive case. On teal it is the accent for the getting-started steps: the large numerals, the line joining them and its arrows. Also the photo placeholder background.

### Neutral
- **Ink** (ink): all text on white, copper and chartreuse; the footer ground; the secondary button; the 2-3px heavy rules that start a table.
- **Paper** (paper): page ground and text on teal and ink.
- **Teal Mist** (teal-text): secondary text on teal (captions, leads, breadcrumbs), tinted from the teal itself.
- **Ink Mist** (ink-text): secondary text on ink (the footer).
- **Muted Ink** (muted): secondary text on white and copper (sub-lines in lists, table captions).
- **Hairline** (rule) and **Hairline on Teal** (rule-on-teal): 1px dividers between list rows, questions and sections.

### Named Rules
**The Reserved Highlight Rule.** Chartreuse fills only the opened question, the primary action and the closing bands that end a page. As a line it also marks the current page in the nav and the focus ring on teal and ink, where ink would vanish, and it fills selected text. Never use it for decoration, tags, icons or emphasis in running text.

**The Five Colours Rule.** Teal, chartreuse, copper, ink and white, plus the derived text and rule tones above. No tints, gradients or new hues; a new need is met by one of these five on a different ground. The one blend is the primary button's hover, chartreuse mixed slightly toward white.

**The Whole Region Rule.** Teal and chartreuse are fields, not accents: they fill full-width bands or a full question row, never small boxes or borders. Small controls on teal (the Menu button, jump links) are outlined in white instead.

## Typography

**Display Font:** Albert Sans Variable (self-hosted via Fontsource, with ui-sans-serif, system-ui fallback)
**Body Font:** Albert Sans Variable

**Character:** One geometric-humanist sans in a range of weights, from 400 answers to 700 headings with tight negative tracking. Friendly and direct, never ornamental. Numerals are lining throughout, tabular wherever prices align.

### Hierarchy
- **Display** (700, clamp 3.5-6rem, 0.95): one fact per section at poster scale, such as the core package price. Tabular lining numerals.
- **Headline** (700, clamp 2.5-4.75rem, 1.02): inner page titles on the teal page head, max about 16ch.
- **Title** (700, clamp 1.875-3rem, 1.1): section headings, each phrased as a question ("Who would I be dealing with?"). Question-and-answer section headings on inner pages sit one notch smaller (clamp 1.75-2.625rem) and stick while the answer scrolls.
- **Question** (600, clamp 1.625-2.5rem, 1.12): the disclosure questions and the "Where next?" links.
- **Lead** (400-500, 1.375rem, 1.45): the sentence under a page title; the price's qualifying line. Max about 46ch.
- **Body** (400, 1.1875rem, 1.55): answers and running text, kept to 56-60ch. Answers inside an opened question set at 1.25rem.
- **Label** (500-600, 1rem): nav, jump links, captions, footer.
- **Button** (600, 1.0625rem, 1.2): the primary and ink buttons.

### Named Rules
**The Question Is the Heading Rule.** Section headings are the visitor's questions in their own words. They are not preceded by small uppercase labels or kickers.

**The One Family Rule.** Albert Sans does everything. No serif display face, no second family, no monospace.

## Layout

A single centred container (max 83rem) with a fluid side gutter carries every section. Sections are full-bleed colour bands with generous vertical padding (6.5rem, dropping to 4.5rem under 56rem).

The recurring structure is the **ask-and-answer split**: a 5fr / 7fr grid with a 3.5rem gap, the question on the left and the answer on the right. It is used for the price block and "Who would I be dealing with?" on the home page and for every section of inner pages, where the left heading is sticky. The home hero uses a wide question column beside a fixed 18.75rem column for Emma's photo, which sticks as the questions open.

Lists are rows, not cards: each item separated by a hairline top rule with about 0.75rem padding. Steps sit on a teal band in a four-column row: large copper numerals stand on one 2px copper line that runs through all four, with a copper arrow carrying it from each step to the next. Where scroll timelines are supported, the line draws and the steps rise in turn as the band scrolls in; with reduced motion, or without support, they are simply there.

Responsive behaviour has one main breakpoint at 56rem: every split collapses to one column, the nav becomes a disclosure menu, Emma's photo becomes a small square beside her caption above the questions, and steps stack in one column, each numeral beside its text under a 2px copper rule, with no joining line.

## Elevation & Depth

The system is completely flat. There are no shadows anywhere. Depth and grouping come from ground changes (teal band, white page, copper field, chartreuse band, ink footer) and from rules: 1px hairlines between rows, 3px ink rules to open a table, and a 2px ink outline to frame the positive "most of our clients" panel beside the filled copper one.

### Named Rules
**The Flat Field Rule.** No box-shadow, no gradient, no blur. If something needs to stand forward, it changes ground colour.

## Shapes

Every corner is square (0px radius): buttons, the opened question, jump links, the copper note, the photo. Borders are the only outlines, at 1px (hairline), 1.5-2px (outlined controls on teal, the fit panel) or 3px (heavy start rules). The drawn arrow and tick are open strokes at 3px and 2.6px on their viewBox, matched to the type weight, with square ends.

## Components

### Buttons
Solid, square and plain.
- **Shape:** square corners (0px).
- **Primary:** chartreuse ground, ink text, 600 weight, 0.75rem by 1.4rem padding. Used for Get started in the header and wherever the main action is on teal or white.
- **Hover / Focus:** primary lightens slightly toward white over 0.2s on the expo ease; focus is a 3px ink outline offset 3px (chartreuse on teal and ink grounds).
- **Ink:** ink ground, white text, hover turns teal. Used for the action that sits on a chartreuse close band, where a chartreuse button would vanish.

### Question Disclosure (signature)
Native details elements sharing one name, so one is open at a time and it works without JavaScript; in browsers from before the name attribute, a short script closes the others. On teal, each closed question is a white semibold row between hairline rules with a drawn arrow pointing down at the right. Opening one fills the row with chartreuse, bleeds it slightly past the column edges, turns text ink, flips the arrow up (0.35s), and eases the answer open to its height (0.45s, expo ease) where the browser supports it. The answer is a short paragraph followed by one to two underlined next-step links in 600 weight. Reduced motion removes every transition.

### Closing Bands
A full-width chartreuse band ends a page with its one next step. On the home page it is a title with a short paragraph and an ink button ("Ask us yours"); on inner pages it is "Where next?" with large question-size links in ruled rows, each ending in a drawn arrow, the last leading back to the home page questions.

### Price Table
Full-width rows between hairlines; labels left at regular weight, amounts right at 600 weight with tabular numerals. The base price row opens with a 3px ink rule and sets at 1.5rem bold. Caption below in muted ink.

### Fit Panels
"Most of our clients" and "We're probably not right for you if" side by side at equal weight: the first framed by a 2px ink outline on white, the second filled pale copper. Both hold ruled lists with muted sub-lines.

### Navigation
Teal header, 4.75rem tall. Wordmark in 700 at left; links in 500 weight at right, underline on hover, current page underlined 3px in chartreuse; Get started as the primary button. Under 56rem a square outlined Menu button (2px white border, fills white on hover) toggles a stacked list with hairline rules on teal. The button shows only when JavaScript runs; without it the list is simply open.

### Jump Links
On inner page heads, the page's questions repeat as square outlined links (1.5px white border on teal) that fill white with teal text on hover.

### Footer
Ink ground, three columns (legal identity, working hours, more links) collapsing to one, with chartreuse focus rings.

## Do's and Don'ts

### Do:
- **Do** fill whole regions with teal or chartreuse; let colour changes between full-width bands do the structuring.
- **Do** keep chartreuse for the opened question, the primary action and the closing bands.
- **Do** head every section with the visitor's question and answer it in the right-hand column of the 5fr / 7fr split.
- **Do** separate list items with hairline rules rather than boxes.
- **Do** end every answer and every page with one next step and a way back.
- **Do** set prices in tabular lining numerals, and give the one key figure poster scale.
- **Do** use only the drawn arrow and tick, in currentColor, decorative and hidden from assistive tech.
- **Do** brief the planned photo shoot of Emma to this palette; the current photo is a placeholder.

### Don't:
- **Don't** use cobalt or any blue as a default colour, or add any hue outside Emma's colours.
- **Don't** build a signage or wayfinding look; the owner found it too governmental.
- **Don't** use a serif display face.
- **Don't** use rounded card grids, or round any corner.
- **Don't** add shadows, gradients, skeuomorphic texture or busy illustration.
- **Don't** put small uppercase kickers or eyebrow labels above headings.
- **Don't** use chartreuse as decoration, a tag colour or text emphasis.
