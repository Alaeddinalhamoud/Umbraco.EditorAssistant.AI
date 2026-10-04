import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Exercise the actual TipTap commands without loading Umbraco's browser shell.
  resolve: { alias: { '@umbraco-cms/backoffice/tiptap': '@tiptap/core' } },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
