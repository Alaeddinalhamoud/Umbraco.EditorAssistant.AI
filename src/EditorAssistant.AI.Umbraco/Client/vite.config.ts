import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

// Keep the backoffice footer in sync with the NuGet package metadata.
const project = readFileSync(new URL("../EditorAssistant.AI.Umbraco.csproj", import.meta.url), "utf8");
const packageVersion = project.match(/<Version>([^<]+)<\/Version>/)?.[1];
const repositoryUrl = project.match(/<RepositoryUrl>([^<]+)<\/RepositoryUrl>/)?.[1];
if (!packageVersion || !repositoryUrl) throw new Error("Package version and repository URL are required.");

export default defineConfig({
  define: {
    __EDITOR_ASSISTANT_VERSION__: JSON.stringify(packageVersion),
    __EDITOR_ASSISTANT_REPOSITORY_URL__: JSON.stringify(repositoryUrl),
  },
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
