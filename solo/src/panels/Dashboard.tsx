import React, { useEffect, useMemo, useState } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { Header } from "../components/Header.js";
import { OutputPane } from "../components/OutputPane.js";
import type { CommandConfig, SoloConfig } from "../lib/config.js";
import type { ProcessManager, ProcSnapshot } from "../lib/process.js";
import { openInEditor } from "../lib/editor.js";
import { pathForCwd, resolveCommand } from "../lib/config.js";

interface Props {
  active: boolean;
  config: SoloConfig;
  pm: ProcessManager;
  requestConfirm: (
    message: string,
    detail: string | undefined,
    onConfirm: () => void,
  ) => void;
  onAdd: () => void;
  onEdit: (cmd: CommandConfig) => void;
  onDelete: (name: string) => void;
  onReloadConfig: () => void;
  onBindingsChange: (bindings: ReadonlyArray<[string, string]>) => void;
}

const QUIT_BINDING: [string, string] = ["q", "Quit"];

export function Dashboard({
  active,
  config,
  pm,
  requestConfirm,
  onAdd,
  onEdit,
  onDelete,
  onReloadConfig,
  onBindingsChange,
}: Props) {
  const renderer = useRenderer();
  const [snapshots, setSnapshots] = useState<ProcSnapshot[]>(() =>
    pm.snapshot(),
  );
  const [selected, setSelected] = useState(0);
  const [stdinValue, setStdinValue] = useState("");
  const [stdinFocused, setStdinFocused] = useState(false);

  useEffect(() => {
    const sync = () => setSnapshots(pm.snapshot());
    pm.on("change", sync);
    return () => {
      pm.off("change", sync);
    };
  }, [pm]);

  const items = useMemo(
    () =>
      config.commands.map((cfg) => {
        const proc = snapshots.find((p) => p.name === cfg.name) ?? {
          name: cfg.name,
          status: "idle" as const,
          lines: [],
          restarts: 0,
        };
        return { cfg, proc };
      }),
    [config.commands, snapshots],
  );

  const cur = items[Math.min(selected, Math.max(0, items.length - 1))];
  const isRunning = cur?.proc.status === "running";

  // Build the bottom-bar bindings to match the screenshot: a focused set
  // that swaps Start/Stop based on state. Less-used actions (add/edit/
  // delete/yaml/interactive) stay keyboard-only.
  useEffect(() => {
    const bindings: [string, string][] = [];
    if (!cur) {
      bindings.push(["a", "Add"], QUIT_BINDING);
    } else if (isRunning) {
      bindings.push(
        ["tab", "Next"],
        ["c", "Clear"],
        ["s", "Stop"],
        ["r", "Restart"],
        QUIT_BINDING,
      );
    } else {
      bindings.push(
        ["tab", "Next"],
        ["s", "Start"],
        ["c", "Clear"],
        ["e", "Edit"],
        ["d", "Delete"],
        ["a", "Add"],
        QUIT_BINDING,
      );
    }
    onBindingsChange(bindings);
  }, [cur, isRunning, onBindingsChange]);

  useKeyboard((k) => {
    if (!active) return;
    if (stdinFocused) {
      if (k.name?.toLowerCase() === "escape") setStdinFocused(false);
      return;
    }
    const n = k.name?.toLowerCase();
    if (n === "tab") {
      if (items.length === 0) return;
      setSelected((s) => {
        if (k.shift) return (s - 1 + items.length) % items.length;
        return (s + 1) % items.length;
      });
      return;
    }
    if (n === "left") setSelected((s) => Math.max(0, s - 1));
    else if (n === "right")
      setSelected((s) => Math.min(items.length - 1, s + 1));
    else if (n === "a") onAdd();
    else if (!cur) return;
    else if (n === "return" || n === "enter" || n === "space") {
      if (isRunning && cur.cfg.interactive) setStdinFocused(true);
    } else if (n === "s") {
      if (isRunning) pm.stop(cur.cfg.name);
      else pm.start(cur.cfg.name);
    } else if (n === "r") {
      pm.restart(cur.cfg.name);
    } else if (n === "c") {
      pm.clear(cur.cfg.name);
    } else if (n === "e") {
      onEdit(cur.cfg);
    } else if (n === "y") {
      openInEditor(renderer, pathForCwd(config.directory));
      onReloadConfig();
    } else if (n === "d") {
      const target = cur.cfg;
      const detail = isRunning
        ? "Process is running — it will be stopped first."
        : undefined;
      requestConfirm(`Remove "${target.name}" from config?`, detail, () =>
        onDelete(target.name),
      );
    } else if (n === "i" && isRunning) {
      setStdinFocused(true);
    }
  });

  if (items.length === 0) {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 2 }}>
        <text fg="#888888">No commands configured for {config.directory}.</text>
        <text fg="#888888">
          Press <span fg="#FFAA00">a</span> to add one.
        </text>
      </box>
    );
  }

  const statusLine = (() => {
    if (!cur) return "";
    if (cur.proc.spawnError) return `Spawn failed: ${cur.proc.spawnError}`;
    const display = resolveCommand(cur.cfg);
    switch (cur.proc.status) {
      case "running":
        return `Running: ${display}`;
      case "exited":
        return `Stopped (exit ${cur.proc.exitCode ?? 0}): ${display}`;
      case "failed":
        return `Failed (exit ${cur.proc.exitCode ?? "?"}): ${display}`;
      case "idle":
      default:
        return `Stopped: ${display}`;
    }
  })();

  const statusColor =
    cur?.proc.status === "running"
      ? "#cccccc"
      : cur?.proc.status === "failed"
        ? "#FF8888"
        : "#888888";

  const titleParts: string[] = [];
  if (cur?.proc.lines.length) titleParts.push(`${cur.proc.lines.length} lines`);
  if (cur?.proc.restarts) titleParts.push(`restarts ${cur.proc.restarts}`);
  const outputTitle = titleParts.join(" · ");

  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <Header items={items} selected={selected} onSelect={setSelected} />
      <box style={{ paddingLeft: 1, paddingRight: 1, height: 1 }}>
        <text fg={statusColor}>{statusLine}</text>
      </box>
      <OutputPane title={outputTitle} lines={cur?.proc.lines ?? []} />
      {cur?.cfg.interactive && isRunning ? (
        <box
          style={{
            flexDirection: "row",
            height: 3,
            borderStyle: "rounded",
            border: true,
            borderColor: stdinFocused ? "#FFAA00" : "#333333",
            paddingLeft: 1,
            paddingRight: 1,
            gap: 1,
          }}
        >
          <text fg="#888888">stdin:</text>
          <input
            style={{ flexGrow: 1 }}
            placeholder={
              stdinFocused
                ? "type a line, enter to send, esc to leave"
                : "press i to focus"
            }
            value={stdinValue}
            focused={stdinFocused && active}
            onInput={setStdinValue}
            onSubmit={(v) => {
              pm.writeStdin(cur.cfg.name, v + "\n");
              setStdinValue("");
            }}
          />
        </box>
      ) : null}
    </box>
  );
}
