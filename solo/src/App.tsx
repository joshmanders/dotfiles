import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { StatusBar } from "./components/StatusBar.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { Quitting } from "./components/Quitting.js";
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
    const update = () => {
      setRunningCount(
        pm.snapshot().filter((s) => s.status === "running").length,
      );
    };
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
    },
    [],
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

  useEffect(() => {
    if (!quitting) return;
    const sync = () => setQuitSnapshots(pm.snapshot());
    pm.on("change", sync);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      pm.off("change", sync);
      try {
        renderer?.destroy();
      } catch {}
      setImmediate(() => process.exit(0));
    };
    pm.shutdown().finally(finish);
    return () => {
      pm.off("change", sync);
    };
  }, [quitting, pm, renderer]);

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
        <Quitting snapshots={quitSnapshots} />
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
          onCancel={() => {
            if (config.commands.length === 0) quit();
            else setView({ kind: "dashboard" });
          }}
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
    </box>
  );
}
