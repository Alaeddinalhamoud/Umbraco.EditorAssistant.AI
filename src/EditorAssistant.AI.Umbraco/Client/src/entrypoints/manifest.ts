export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Editor Assistant AIUmbraco Entrypoint",
    alias: "EditorAssistant.AI.Umbraco.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
  {
    name: "Editor Assistant AI Section",
    alias: "EditorAssistant.AI.Umbraco.Section",
    type: "section",
    meta: {
      label: "AI Assistant",
      pathname: "ai-assistant",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionUserPermission",
        match: "EditorAssistant.AI.Umbraco.Section",
      },
    ],
  },
  {
    name: "Editor Assistant AI Setup",
    alias: "EditorAssistant.AI.Umbraco.Setup",
    type: "sectionView",
    element: () => import("./ai-assistant.js"),
    meta: {
      label: "Setup",
      pathname: "setup",
      icon: "icon-settings",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "EditorAssistant.AI.Umbraco.Section",
      },
    ],
  },
];
