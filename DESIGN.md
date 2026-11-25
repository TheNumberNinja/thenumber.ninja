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

<!-- impeccable:design-map -->
Name: The Number Ninja
Colors: primary: teal #0d5c58; secondary: chartreuse #cfdc4f; tertiary: copper #f8dccb; neutral: ink #15172b; neutral: paper #ffffff; neutral: teal-text #cfe6e2; neutral: muted #3f5452 (+3 more in the sidecar)
Fonts: Albert Sans Variable (display, headline, title, question, lead, body, label, button)
Spacing: gutter clamp(1.25rem, 3.9vw, 3.5rem), container 83rem, column-gap 3.5rem, row 0.75rem, section-sm 4.5rem, section-lg 6.5rem
Radius: none 0px
North Star: "Your Question, Answered"
Rules:
- The Reserved Highlight Rule. Chartreuse fills only the opened question, the primary action and the closing bands that end a page. As a line it also marks the current page in the nav and the focus ring on teal and ink, where ink would vanish, and it fills selected text.
- The Five Colours Rule. Teal, chartreuse, copper, ink and white, plus the derived text and rule tones above. The one blend is the primary button's hover.
- The Whole Region Rule. Teal and chartreuse are fields, not accents: they fill full-width bands or a full question row, never small boxes or borders. Small controls on teal (the Menu button, jump links) are outlined in white instead.
- The Question Is the Heading Rule. Section headings are the visitor's questions in their own words.
- The One Family Rule. Albert Sans does everything.
- The Flat Field Rule. No box-shadow, no gradient, no blur.
Don't:
- Don't use cobalt or any blue as a default colour, or add any hue outside Emma's colours.
- Don't build a signage or wayfinding look; the owner found it too governmental.
- Don't use a serif display face.
- Don't use rounded card grids, or round any corner.
- Don't add shadows, gradients, skeuomorphic texture or busy illustration.
- Don't put small uppercase kickers or eyebrow labels above headings.
- Don't use chartreuse as decoration, a tag colour or text emphasis.
Do:
- Do fill whole regions with teal or chartreuse; let colour changes between full-width bands do the structuring.
- Do keep chartreuse for the opened question, the primary action and the closing bands.
- Do head every section with the visitor's question and answer it in the right-hand column of the 5fr / 7fr split.
- Do separate list items with hairline rules rather than boxes.
- Do end every answer and every page with one next step and a way back.
- Do set prices in tabular lining numerals, and give the one key figure poster scale.
- Do use only the drawn arrow and tick, in currentColor, decorative and hidden from assistive tech.
- (+1 more)
Full: .impeccable/design-full.md (read a section when you need its detail)
