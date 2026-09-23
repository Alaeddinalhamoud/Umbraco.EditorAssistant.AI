import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../wwwroot/App_Plugins/EditorAssistantAIUmbraco", // your web component will be saved in this location
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        "editor-assistant-ai-umbraco": "src/bundle.manifests.ts",
        "editor-assistant-frontend": "src/frontend.ts",
      },
      preserveEntrySignatures: "strict",
      output: { format: "es", entryFileNames: "[name].js" },
      external: [/^@umbraco/],
    },
  },
});
