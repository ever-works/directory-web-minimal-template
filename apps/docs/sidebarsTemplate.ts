import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  templateSidebar: [
    "index",
    "overview",
    {
      type: "category",
      label: "Architecture",
      items: [
        "architecture/overview",
        "architecture/data-layer",
        "architecture/plugin-system",
        "architecture/adapter-system",
        "architecture/component-system",
        "architecture/content-sync",
      ],
    },
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/quickstart",
        "guides/getting-started",
        "guides/building-from-template",
        "guides/customizing",
        "guides/creating-a-plugin",
        "guides/creating-an-adapter",
        "guides/interactive-components",
        "guides/content-sync",
        "guides/deployment",
        "guides/troubleshooting",
      ],
    },
    {
      type: "category",
      label: "Specifications",
      items: [
        "specs/data-schema",
        "specs/plugin-interface",
        "specs/adapter-interface",
        "specs/component-catalog",
      ],
    },
    {
      type: "category",
      label: "Plans",
      items: [
        "plans/phase-1-foundation",
        "plans/phase-2-components",
        "plans/phase-3-web-app",
        "plans/phase-4-plugins",
        "plans/phase-5-sample",
        "plans/phase-5-sample-detail",
        "plans/phase-6-deployment",
        "plans/phase-7-sample-events",
        "plans/phase-8-sample-real-estate",
      ],
    },
    {
      type: "category",
      label: "Reference",
      items: [
        "questions",
        "log",
      ],
    },
  ],
};

export default sidebars;
