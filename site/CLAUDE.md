# site/: v2 of thenumber.ninja

An Astro 7 static site, built to replace v1 (`../web/`, Eleventy) at a later switch-over. Until then v1 keeps deploying from `web/`: never change anything in `../web/` or `../studio/` from work here.

## Commands

Run from `site/`. Tools come from `mise.toml` (`mise install`), then `pnpm install` and, once, `pnpm setup:browsers` for the accessibility check.

| Command                                       | What it does                                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                    | Astro dev server                                                                                                                                                                      |
| `pnpm build`                                  | Static build to `dist/`                                                                                                                                                               |
| `pnpm check`                                  | Everything CI runs, in CI's order: the three test suites, `check:types`, `lint:check`, `format:check`, the build, then the SEO, accessibility and link checks. Run it before every PR |
| `pnpm test`                                   | `test:checks` (the check scripts, Node's test runner), `test:site` (`src/`, Vitest), `test:functions` (`netlify/`, Vitest). Each fails when it finds no test files                    |
| `pnpm check:types`                            | `astro check`: type errors, including a page that leaves out the layout's required `title` or `description`                                                                           |
| `pnpm lint:check` / `pnpm lint`               | ESLint, including the accessibility rules for `.astro` markup / the same with fixes                                                                                                   |
| `pnpm format:check` / `pnpm format`           | Prettier                                                                                                                                                                              |
| `pnpm check:seo`, `check:a11y`, `check:links` | One check against the current `dist/`                                                                                                                                                 |
| `netlify dev`                                 | The site and its functions together, as Netlify serves them                                                                                                                           |

## Layout

- `src/pages/`: one file per route. Every page uses `src/layouts/BaseLayout.astro`, passing `title` (without the site name: the layout adds it) and `description`.
- `src/layouts/`, `src/components/`, `src/styles/global.css` (Tailwind 4).
- `src/lib/`: shared code, such as `seo.ts`, which builds titles and canonicals.
- `src/data/prices.ts`: every price on the site, typed. Pages read prices from here, never type them in (shared rules sections 9 and 12).
- `src/content.config.ts` and `src/content/`: content collections for Markdown and MDX, each with a Zod schema.
- `netlify/functions/<name>/<name>.ts`: Netlify Functions in the modern format (`export default async (req: Request, context: Context)` plus `export const config`), each in its own folder with its test beside it. Never put a test at the top level of `netlify/functions/`: Netlify deploys every file there as a function.
- `scripts/checks/`: the SEO, accessibility and link checks, copied from withotto.app. Site settings live in `checks.config.mjs`, not in the scripts.

Tests sit next to the code they cover (`foo.ts`, `foo.test.ts`). Use `tests/` only for a test with no obvious home.

## Constraints

- **The repo is public.** Commit no search research (target queries, keyword lists, Search Console figures), nothing from `shared-rules/rules/internal/`, and no secret: not in code, comments, commit messages, branch names or PR text. Code reads secrets from environment variables; list each new variable's name, without its value, in the example environment file in `site/`.
- **No analytics**, no tracking script, and no third-party script that sets cookies.
- **No UI framework** (React, Svelte, Vue) unless a task justifies one. Interactivity is `<script>` tags in `.astro` components, in TypeScript.
- **No Astro adapter yet.** The site is `output: "static"`. Add the Netlify adapter only when a route needs on-demand rendering.
- **URLs end in a slash** (`trailingSlash: "always"`), matching v1, so existing links keep working at the switch-over.
- **Where this site departs from withotto.app**, a one-line comment in the config says why. Keep doing that.
- **TypeScript stays on 6.0.x** until `@astrojs/check` and typescript-eslint support 7 (Renovate holds it).
- **Markdown:** Astro 7 uses the Sätteri processor by default. remark and rehype plugins need `@astrojs/markdown-remark` and `markdown.processor: unified()` in `astro.config.mjs`.

## The checks baseline

`pnpm check` fails on any blocking finding not recorded in `checks-baseline.json`. The baseline starts empty, and there is no file until something is recorded. Shrinking it (fixing a recorded finding) needs no approval. Growing it needs the user's approval: fix the finding instead wherever you can.

## Preview site: remove at the switch-over

While v2 runs as a second Netlify site, every response carries `X-Robots-Tag: noindex`, from `netlify.toml` and, for functions, from each function itself. When this site becomes thenumber.ninja, remove all of them in the same change, or the whole site drops out of search results.
