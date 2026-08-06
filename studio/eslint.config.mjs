import studio from '@sanity/eslint-config-studio'
import globals from 'globals'

// @sanity/eslint-config-studio ships no `languageOptions.globals` (checked in v5 and
// v6), so browser APIs the Studio legitimately uses (crypto, TextEncoder, console)
// are reported as no-undef. Studio is a browser app, so declare that environment here.
export default [
  ...studio,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
]
