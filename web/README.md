# The Number Ninja Website

A modern Eleventy-powered website built with the latest web development standards.

## Prerequisites

This project uses [Mise](https://mise.jdx.dev/) for development environment management. Install it first:

```bash
curl https://mise.run | sh
```

## Development Setup

1. **Install dependencies:**
   ```bash
   mise install
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm run dev
   ```

3. **Build for production:**
   ```bash
   pnpm run build
   ```

## Version Management

This project uses exact version pinning for consistency across development and production environments.

### Current Versions

- **Node.js**: `22.17.1` (Active LTS)
- **pnpm**: `10.13.1` (Latest Stable)

### Version Configuration Files

| File | Purpose | Configuration |
|------|---------|---------------|
| `mise.toml` | Development environment | `node = "22.17.1"`, `pnpm = "10.13.1"` |
| `package.json` | Runtime requirements | `"engines": {"node": ">=22.17.1", "pnpm": ">=10.13.1"}` |
| `package.json` | Package manager lock | `"packageManager": "pnpm@10.13.1"` |
| `netlify.toml` | Deployment environment | `NODE_VERSION = "22.17.1"` |

### Updating Versions

To update Node.js and pnpm versions across the project:

1. **Check available versions:**
   ```bash
   # Check latest Node.js versions
   mise ls-remote node
   
   # Check latest pnpm versions
   mise ls-remote pnpm
   ```

2. **Update mise.toml:**
   ```toml
   [tools]
   node = "22.17.1"  # Update to desired version
   pnpm = "10.13.1"  # Update to desired version
   ```

3. **Update package.json engines:**
   ```json
   {
     "engines": {
       "node": ">=22.17.1",  # Update minimum version
       "pnpm": ">=10.13.1"   # Update minimum version
     },
     "packageManager": "pnpm@10.13.1"  # Update exact version
   }
   ```

4. **Update netlify.toml:**
   ```toml
   [build.environment]
   NODE_VERSION = "22.17.1"  # Update to match mise.toml
   ```

5. **Install new versions:**
   ```bash
   mise install
   pnpm install
   ```

6. **Verify versions:**
   ```bash
   node --version
   pnpm --version
   ```

## Available Scripts

- `pnpm run build` - Build for production
- `pnpm run dev` - Start development server
- `pnpm run serve` - Start Eleventy dev server only
- `pnpm run lint` - Run ESLint and auto-fix issues
- `pnpm run lint:check` - Check linting without fixing
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check formatting without fixing
- `pnpm run optimize` - Optimize build output with Jampack

## Technology Stack

- **Static Site Generator**: [Eleventy](https://11ty.dev) v3.1.2
- **Runtime**: Node.js 22.17.1 (Active LTS)
- **Package Manager**: pnpm 10.13.1
- **Deployment**: Netlify
- **Payments**: Stripe
- **CMS**: Sanity
- **Styling**: Custom CSS
- **Linting**: ESLint 9.x
- **Formatting**: Prettier 3.x
- **Date Library**: Luxon (modern replacement for Moment.js)

## Project Structure

```
├── config/           # Eleventy configuration
│   ├── filters/      # Custom template filters
│   ├── functions/    # Shared function utilities
│   ├── plugins/      # Eleventy plugins configuration
│   ├── shortcodes/   # Custom shortcodes
│   └── utils/        # Utility functions
├── src/
│   ├── _data/        # Global data files
│   ├── _includes/    # Reusable template components
│   ├── _layouts/     # Page layouts
│   ├── assets/       # Static assets (CSS, JS, images)
│   ├── functions/    # Netlify Functions
│   └── pages/        # Page templates
├── public/           # Static files copied to output
├── .eleventy.js      # Eleventy configuration
├── mise.toml         # Development environment versions
├── netlify.toml      # Netlify deployment configuration
└── package.json      # Project dependencies and scripts
```

## Environment Variables

Create a `.env.development` file for local development:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SANITY_PROJECT_ID=your_project_id
SANITY_READ_TOKEN=your_read_token
```

## Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch. The deployment process:

1. Netlify installs Node.js version specified in `netlify.toml`
2. Runs `pnpm install` to install dependencies
3. Executes `pnpm run netlify:build` to build the site
4. Deploys the `dist/` directory

## Contributing

1. Ensure you have the correct Node.js and pnpm versions (see Version Management)
2. Run `pnpm run lint` and `pnpm run format` before committing
3. Test your changes locally with `pnpm run dev`
4. Build and test with `pnpm run build`