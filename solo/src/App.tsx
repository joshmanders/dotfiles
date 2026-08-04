import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { StatusBar } from "./components/StatusBar.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { Quitting } from "./components/Quitting.js";
import { Toast, type ToastKind } from "./components/Toast.js";
import { Dashboard } from "./panels/Dashboard.js";
import { Wizard } from "./panels/Wizard.js";
import {
  loadConfig,
  saveConfig,
  upsertCommand,
  removeCommand,
  ensureConfigDir,
  type CommandConfig,
  type SoloConfig,
} from "./lib/config.js";
import { ProcessManager, type ProcSnapshot } from "./lib/process.js";

type View = { kind: "dashboard" } | { kind: "wizard"; initial?: CommandConfig };

interface ConfirmState {
  message: string;
  detail?: string;
  onConfirm: () => void;
}

const WIZARD_BINDINGS: ReadonlyArray<[string, string]> = [
  ["tab", "Next field"],
  ["space", "Toggle"],
  ["←/→", "Cycle"],
  ["ctrl-s", "Save"],
  ["esc", "Cancel"],
];

export function App() {
  const renderer = useRenderer();
  const cwd = useMemo(() => process.cwd(), []);
  const [config, setConfig] = useState<SoloConfig>(() => {
    ensureConfigDir();
    return loadConfig(cwd) ?? { directory: cwd, commands: [] };
  });
  const pm = useMemo(
    () => new ProcessManager(config.directory),
    [config.directory],
  );
  const [view, setView] = useState<View>(() =>
    config.commands.length === 0 ? { kind: "wizard" } : { kind: "dashboard" },
  );
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [runningCount, setRunningCount] = useState(0);
  const [dashboardBindings, setDashboardBindings] = useState<
    ReadonlyArray<[string, string]>
  >([]);
  const [quitting, setQuitting] = useState(false);
  const [quitSnapshots, setQuitSnapshots] = useState<ProcSnapshot[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    kind: ToastKind;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const showToast = useCallback(
    (message: string, kind: ToastKind = "info", durationMs = 2000) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ message, kind });
      toastTimerRef.current = setTimeout(() => setToast(null), durationMs);
    },
    [],
  );

  useEffect(() => {
    const known = new Set<string>();
    const sync = () => {
      const seen = new Set<string>();
      for (const cfg of config.commands) {
        seen.add(cfg.name);
        const isNew = !known.has(cfg.name);
        pm.register(cfg);
        known.add(cfg.name);
        if (isNew && cfg.autostart) pm.start(cfg.name);
      }
      for (const name of known) {
        if (!seen.has(name)) pm.unregister(name);
      }
    };
    sync();
  }, [pm, config.commands]);

  useEffect(() => {
    const update = () => setRunningCount(pm.runningCount());
    pm.on("change", update);
    update();
    return () => {
      pm.off("change", update);
    };
  }, [pm]);

  const requestConfirm = useCallback(
    (message: string, detail: string | undefined, onConfirm: () => void) => {
      setConfirm({ message, detail, onConfirm });
    },
    [],
  );

  const reloadConfig = useCallback(() => {
    setConfig(loadConfig(cwd) ?? { directory: cwd, commands: [] });
  }, [cwd]);

  const handleWizardSubmit = useCallback(
    (cfg: CommandConfig, replaceName?: string) => {
      setConfig((prev) => {
        const next = upsertCommand(prev, cfg, replaceName);
        saveConfig(next);
        return next;
      });
      setView({ kind: "dashboard" });
      showToast(
        replaceName ? `Updated ${cfg.name}` : `Added ${cfg.name}`,
        "success",
      );
    },
    [showToast],
  );

  const handleDelete = useCallback(
    (name: string) => {
      pm.unregister(name);
      setConfig((prev) => {
        const next = removeCommand(prev, name);
        saveConfig(next);
        return next;
      });
    },
    [pm],
  );

  const quit = useCallback(() => {
    // Switch to the Quitting overlay BEFORE awaiting shutdown so the user
    // sees feedback immediately instead of staring at a frozen dashboard.
    setQuitSnapshots(pm.snapshot());
    setQuitting(true);
  }, [pm]);

  const handleWizardCancel = useCallback(
    (wasDirty: boolean) => {
      if (config.commands.length === 0) quit();
      else setView({ kind: "dashboard" });
      // Only surface a toast when something was actually discarded. A clean
      // cancel needs no announcement — the form closing is feedback enough.
      if (wasDirty) showToast("Changes discarded", "warn");
    },
    [config.commands.length, quit, showToast],
  );

  const exitedRef = useRef(false);
  const finishQuit = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    try {
      renderer?.destroy();
    } catch {}
    setImmediate(() => process.exit(0));
  }, [renderer]);

  useEffect(() => {
    if (!quitting) return;
    const sync = () => setQuitSnapshots(pm.snapshot());
    pm.on("change", sync);
    pm.shutdown();
    // Hard backstop — if a process refuses to die and stays in "running"
    // forever, the visual queue can't drain. Exit anyway after 5s.
    const hardTimeout = setTimeout(finishQuit, 5000);
    return () => {
      clearTimeout(hardTimeout);
      pm.off("change", sync);
    };
  }, [quitting, pm, finishQuit]);

  useKeyboard((k) => {
    if (confirm || quitting) return;
    const n = k.name?.toLowerCase();
    if (view.kind === "wizard") {
      if (k.ctrl && n === "c") quit();
      return;
    }
    if (n === "q" || (k.ctrl && n === "c")) {
      if (runningCount > 0) {
        requestConfirm(
          `Quit? ${runningCount} process${runningCount === 1 ? "" : "es"} will be stopped.`,
          undefined,
          quit,
        );
      } else {
        quit();
      }
    }
  });

  if (quitting) {
    return (
      <box style={{ flexDirection: "column", width: "100%", height: "100%" }}>
        <Quitting snapshots={quitSnapshots} onDone={finishQuit} />
      </box>
    );
  }

  return (
    <box style={{ flexDirection: "column", width: "100%", height: "100%" }}>
      {view.kind === "dashboard" ? (
        <Dashboard
          active={!confirm}
          config={config}
          pm={pm}
          requestConfirm={requestConfirm}
          onAdd={() => setView({ kind: "wizard" })}
          onEdit={(cmd) => setView({ kind: "wizard", initial: cmd })}
          onDelete={handleDelete}
          onReloadConfig={reloadConfig}
          onBindingsChange={setDashboardBindings}
        />
      ) : (
        <Wizard
          active={!confirm}
          initial={view.initial}
          onSubmit={handleWizardSubmit}
          onCancel={handleWizardCancel}
          requestConfirm={requestConfirm}
        />
      )}
      <StatusBar
        bindings={
          view.kind === "dashboard" ? dashboardBindings : WIZARD_BINDINGS
        }
      />
      {confirm ? (
        <ConfirmDialog
          message={confirm.message}
          detail={confirm.detail}
          onConfirm={() => {
            const fn = confirm.onConfirm;
            setConfirm(null);
            fn();
          }}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
      {toast ? <Toast message={toast.message} kind={toast.kind} /> : null}
    </box>
  );
}
