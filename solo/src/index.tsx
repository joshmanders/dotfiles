import { constants as osConstants } from "node:os";
import type { ProcessManager } from "./lib/process.js";

const argv = process.argv.slice(2);
const cmd = argv[0];

// Subcommands run synchronously and exit before any TUI bootstrap. The
// TUI imports a native Zig module and grabs the terminal — neither of
// which we want when the user just asked for a one-shot maintenance op.
if (cmd === "rekey") {
  const { rekey } = await import("./commands/rekey.js");
  process.exit(rekey(argv.slice(1)));
}

if (cmd === "help" || cmd === "--help" || cmd === "-h") {
  console.log(
    "usage: solo                 launch the TUI for the current directory",
  );
  console.log(
    "       solo rekey [hash]    rename configs to match their `directory:` field",
  );
  console.log(
    "                              omit <hash> to rekey every config",
  );
  process.exit(0);
}

if (cmd && !cmd.startsWith("-")) {
  console.error(`solo: unknown command "${cmd}". Try \`solo help\`.`);
  process.exit(1);
}

const { createCliRenderer } = await import("@opentui/core");
const { createRoot } = await import("@opentui/react");
const { App } = await import("./App.js");

// OpenTUI's default exit signals. Its own listener for them only destroys the
// renderer, which cancels the default terminate action and leaves solo alive
// with its children (SIGHUP is what closing the tmux pane sends). solo takes
// them all over instead and stops every child before exiting.
const EXIT_SIGNALS: NodeJS.Signals[] = [
  "SIGHUP",
  "SIGINT",
  "SIGTERM",
  "SIGQUIT",
  "SIGABRT",
  "SIGPIPE",
  "SIGBUS",
];

const renderer = await createCliRenderer({
  exitSignals: [],
  exitOnCtrlC: false,
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

// Children run in their own sessions, so exiting alone orphans them. These
// handlers live outside the React tree and stay registered until exit, so a
// repeat signal mid-shutdown is ignored rather than killing solo early.
let pm: ProcessManager | undefined;
let exiting = false;
for (const sig of EXIT_SIGNALS) {
  process.on(sig, () => {
    if (exiting) return;
    exiting = true;
    (pm?.shutdown() ?? Promise.resolve()).finally(() => {
      cleanup();
      process.exit(128 + osConstants.signals[sig]);
    });
  });
}

createRoot(renderer).render(<App onManager={(m) => (pm = m)} />);
