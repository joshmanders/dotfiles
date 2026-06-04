import React, { useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { CommandConfig, RestartPolicy } from "../lib/config.js";

const RESTART_VALUES: RestartPolicy[] = ["never", "on-fail", "always"];

interface Props {
  initial?: CommandConfig;
  onSubmit: (cfg: CommandConfig, replaceName?: string) => void;
  onCancel: () => void;
  active: boolean;
}

const FIELDS = [
  "name",
  "command",
  "cwd",
  "autostart",
  "restart",
  "interactive",
] as const;
type FieldKey = (typeof FIELDS)[number];

export function Wizard({ initial, onSubmit, onCancel, active }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [command, setCommand] = useState(initial?.command ?? "");
  const [cwd, setCwd] = useState(initial?.cwd ?? "");
  const [autostart, setAutostart] = useState(initial?.autostart ?? false);
  const [restart, setRestart] = useState<RestartPolicy>(
    initial?.restart ?? "never",
  );
  const [interactive, setInteractive] = useState(initial?.interactive ?? false);
  const [focus, setFocus] = useState<FieldKey>("name");
  const [error, setError] = useState<string | null>(null);

  const isText = (f: FieldKey) =>
    f === "name" || f === "command" || f === "cwd";

  const submit = () => {
    if (!name.trim()) {
      setError("name is required");
      setFocus("name");
      return;
    }
    if (!command.trim()) {
      setError("command is required");
      setFocus("command");
      return;
    }
    const cfg: CommandConfig = {
      name: name.trim(),
      command: command.trim(),
      ...(cwd.trim() ? { cwd: cwd.trim() } : {}),
      ...(autostart ? { autostart: true } : {}),
      ...(restart !== "never" ? { restart } : {}),
      ...(interactive ? { interactive: true } : {}),
      ...(initial?.env ? { env: initial.env } : {}),
    };
    onSubmit(cfg, initial?.name);
  };

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    // Tab cycles fields regardless of input focus.
    if (n === "tab") {
      const i = FIELDS.indexOf(focus);
      const next = k.shift
        ? (i - 1 + FIELDS.length) % FIELDS.length
        : (i + 1) % FIELDS.length;
      setFocus(FIELDS[next]!);
      return;
    }
    if (n === "escape") {
      onCancel();
      return;
    }
    // Non-text fields handle their own keys.
    if (!isText(focus)) {
      if (n === "space" || n === "return" || n === "enter") {
        if (focus === "autostart") setAutostart((v) => !v);
        else if (focus === "interactive") setInteractive((v) => !v);
        else if (focus === "restart") {
          const i = RESTART_VALUES.indexOf(restart);
          setRestart(RESTART_VALUES[(i + 1) % RESTART_VALUES.length]!);
        }
      } else if (n === "left" || n === "right") {
        if (focus === "restart") {
          const i = RESTART_VALUES.indexOf(restart);
          const next =
            n === "right"
              ? (i + 1) % RESTART_VALUES.length
              : (i - 1 + RESTART_VALUES.length) % RESTART_VALUES.length;
          setRestart(RESTART_VALUES[next]!);
        }
      } else if ((k.ctrl && n === "s") || (n === "return" && k.shift)) {
        submit();
      }
    } else if (k.ctrl && n === "s") {
      submit();
    }
  });

  const row = (key: FieldKey, label: string, node: React.ReactNode) => (
    <box
      style={{
        flexDirection: "row",
        height: 3,
        paddingLeft: 1,
        paddingRight: 1,
        gap: 1,
      }}
    >
      <box style={{ width: 14, flexShrink: 0 }}>
        <text fg={focus === key ? "#FFAA00" : "#888888"}>
          {focus === key ? "▶ " : "  "}
          {label}
        </text>
      </box>
      <box
        style={{
          flexGrow: 1,
          borderStyle: "rounded",
          border: true,
          borderColor: focus === key ? "#FFAA00" : "#333333",
          paddingLeft: 1,
          paddingRight: 1,
        }}
      >
        {node}
      </box>
    </box>
  );

  return (
    <box style={{ flexDirection: "column", flexGrow: 1, padding: 1 }}>
      <box style={{ paddingLeft: 1, paddingBottom: 1 }}>
        <text fg="#FFAA00">{initial ? "Edit command" : "Add command"}</text>
        <text fg="#666666">tab/S-tab move · ctrl-s save · esc cancel</text>
      </box>
      {row(
        "name",
        "name",
        <input
          style={{ flexGrow: 1 }}
          placeholder="e.g. vite"
          value={name}
          focused={focus === "name" && active}
          onInput={(v) => {
            setName(v);
            setError(null);
          }}
          onSubmit={submit}
        />,
      )}
      {row(
        "command",
        "command",
        <input
          style={{ flexGrow: 1 }}
          placeholder="e.g. npm run dev"
          value={command}
          focused={focus === "command" && active}
          onInput={(v) => {
            setCommand(v);
            setError(null);
          }}
          onSubmit={submit}
        />,
      )}
      {row(
        "cwd",
        "cwd",
        <input
          style={{ flexGrow: 1 }}
          placeholder="(optional, relative to project dir)"
          value={cwd}
          focused={focus === "cwd" && active}
          onInput={setCwd}
          onSubmit={submit}
        />,
      )}
      {row(
        "autostart",
        "autostart",
        <text fg={autostart ? "#55FF55" : "#888888"}>
          {autostart ? "[x] yes" : "[ ] no (lazy — start manually)"}
          {focus === "autostart" ? "   space to toggle" : ""}
        </text>,
      )}
      {row(
        "restart",
        "restart",
        <text fg="#cccccc">
          {RESTART_VALUES.map((v) =>
            v === restart ? `[${v}]` : ` ${v} `,
          ).join("  ")}
          {focus === "restart" ? "   ←/→ or space" : ""}
        </text>,
      )}
      {row(
        "interactive",
        "interactive",
        <text fg={interactive ? "#55FF55" : "#888888"}>
          {interactive ? "[x] yes (line input forwarded to stdin)" : "[ ] no"}
          {focus === "interactive" ? "   space to toggle" : ""}
        </text>,
      )}
      {error ? (
        <box style={{ paddingLeft: 1, paddingTop: 1 }}>
          <text fg="#FF5555">{error}</text>
        </box>
      ) : null}
    </box>
  );
}
