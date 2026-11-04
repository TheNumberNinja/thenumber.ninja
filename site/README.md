# thenumber.ninja v2 (`site/`)

The next version of [thenumber.ninja](https://thenumber.ninja), built with [Astro](https://astro.build) 7 as a static site with Tailwind 4 and a few Netlify Functions. v1 (`../web/`) stays live until the switch-over.

## Setup

1. Install [mise](https://mise.jdx.dev), then run `mise install` in `site/`. It installs the pinned Node, pnpm and lychee (the link checker).
2. `pnpm install`
3. `pnpm setup:browsers` installs the Chromium that the accessibility check drives. Run it once.

## Commands

| Command               | What it does                                                                    |
| --------------------- | ------------------------------------------------------------------------------- |
| `pnpm dev`            | Runs the Astro dev server                                                       |
| `netlify dev`         | Runs the site and its functions together, as Netlify serves them                |
| `pnpm build`          | Builds the static site into `dist/`                                             |
| `pnpm check`          | Runs everything CI runs, in the same order. If it passes locally, CI should too |
| `pnpm test`           | Runs all three test suites                                                      |
| `pnpm test:checks`    | Tests the check scripts (Node's test runner)                                    |
| `pnpm test:site`      | Tests the code in `src/` (Vitest)                                               |
| `pnpm test:functions` | Tests the Netlify Functions in `netlify/` (Vitest)                              |
| `pnpm check:types`    | Runs `astro check`                                                              |
| `pnpm lint:check`     | Runs ESLint (`pnpm lint` fixes what it can)                                     |
| `pnpm format:check`   | Runs Prettier (`pnpm format` rewrites files)                                    |

Each test command fails when it finds no test files, so a moved or renamed test folder can't leave CI green.

## What each check does

`pnpm check` runs these in order. The tests and static checks stop the run at the first failure. The SEO, accessibility and link checks all run once the build succeeds, so one run reports everything.

| Check          | Catches                                                                                                                                                                                                        | Fails on                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `check:types`  | Type errors, including a page that leaves out the layout's required `title` or `description`                                                                                                                   | Any error                                                                                            |
| `lint:check`   | Code problems, and accessibility mistakes in `.astro` markup, such as an image without `alt`                                                                                                                   | Any error                                                                                            |
| `format:check` | Files Prettier would change                                                                                                                                                                                    | Any file                                                                                             |
| `check:seo`    | Every built page: title and description present and the right length, one `<h1>`, heading order, canonical URLs, internal links, redirects, structured data, the sitemap, and pages nothing links to           | Any blocking finding. Warnings, such as a long title, are reported but don't fail the run            |
| `check:a11y`   | Every built page in a real browser with [axe](https://github.com/dequelabs/axe-core): the WCAG 2.2 AA rules (contrast, labels, alt text and the rest) and axe's best-practice rules (landmarks, heading order) | Serious and critical WCAG violations. Moderate and minor ones, and best-practice rules, are warnings |
| `check:links`  | Every link in `dist/`, internal and external, with [lychee](https://lychee.cli.rs)                                                                                                                             | A broken link                                                                                        |

The SEO and accessibility reports are written to `.checks/` (gitignored) and uploaded as an artifact by CI.

A finding that can't be fixed yet can be recorded in `checks-baseline.json` with `pnpm check:baseline --accept`, run after `pnpm check`, so it no longer blocks. `pnpm check:baseline --prune` removes entries that are no longer found. The baseline starts empty. Recording a new finding needs the site owner's approval.

## CI and deployment

- `.github/workflows/site-checks.yml` runs the same steps as `pnpm check` on every pull request and every push to `main` that changes `site/`.
- `.github/workflows/site-lighthouse.yml` scores each Netlify deploy preview with Lighthouse and comments the scores on the pull request. It does nothing until the v2 Netlify site's name is set in the workflow.
- `netlify.toml` builds only when `site/` changes. Netlify runs the site and function tests, then the build, and publishes `dist/`.
