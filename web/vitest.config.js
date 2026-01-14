import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/functions/**/*.test.js'],
    exclude: ['node_modules', '.netlify'],
  },
});
