const path = "/?section=ai&ai=terminal";
const clip = (name) => `[data-specimen="${name}"]`;
export default [
  ...["light", "dark"].flatMap((theme) => [
    ...["terminal", "stack-trace", "test-results"].map((name) => ({
      name: `ai-${name}-${theme}`,
      path,
      theme,
      clip: clip(name),
      viewport: { width: 1100, height: 1000 },
    })),
    {
      name: `ai-terminal-mobile-${theme}`,
      path,
      theme,
      viewport: { width: 390, height: 844 },
      fullPage: true,
    },
  ]),
  {
    name: "ai-test-error-expanded",
    path,
    clip: clip("test-results"),
    prepare: async (page) => {
      await page.getByRole("button", { name: "Error details", exact: true }).click();
    },
  },
  {
    name: "ai-terminal-streaming",
    path,
    clip: clip("terminal"),
    video: {
      trigger: async (page) => {
        await page.getByRole("button", { name: "Replay test run", exact: true }).click();
      },
      duration: 3400,
    },
  },
  {
    name: "ai-stack-trace-disclosure",
    path,
    clip: clip("stack-trace"),
    filmstrip: {
      frames: [0, 60, 140, 240, 400],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Collapse TypeError stack frames", exact: true }).click();
      },
    },
  },
  {
    name: "ai-terminal-reduced-motion",
    path,
    reduced: true,
    clip: clip("terminal"),
    prepare: async (page) => {
      await page.getByRole("button", { name: "Replay test run", exact: true }).click();
    },
  },
];
