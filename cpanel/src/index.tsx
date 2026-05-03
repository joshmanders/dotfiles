import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App.js";

// useKittyKeyboard: null disables the kitty keyboard protocol entirely.
// Otherwise opentui sends the enable sequence on startup, and if the disable
// sequence isn't received by the terminal on exit (e.g. process.exit beats
// the flush), the terminal keeps emitting CSI ... u sequences for keypresses.
const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
  useKittyKeyboard: null,
  useMouse: true,
});

const cleanup = () => {
  try {
    renderer.destroy();
  } catch {}
};
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

createRoot(renderer).render(<App />);
