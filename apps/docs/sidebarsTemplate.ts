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
      ],
    },
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/quickstart",
        "guides/building-from-template",
        "guides/creating-a-plugin",
        "guides/creating-an-adapter",
        "guides/interactive-components",
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
      ],
    },
  ],
};

export default sidebars;
