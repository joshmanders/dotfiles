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

const renderer = await createCliRenderer({
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
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

createRoot(renderer).render(<App />);
