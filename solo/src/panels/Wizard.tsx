import React, { useEffect, useMemo, useRef, useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { ScrollBoxRenderable } from "@opentui/core";
import type {
  CommandConfig,
  RestartPolicy,
  TailConfig,
} from "../lib/config.js";

const RESTART_VALUES: RestartPolicy[] = ["never", "on-fail", "always"];
const TYPE_VALUES = ["command", "tail"] as const;
type EntryType = (typeof TYPE_VALUES)[number];

interface Props {
  initial?: CommandConfig;
  onSubmit: (cfg: CommandConfig, replaceName?: string) => void;
  // Called with `true` when the user is discarding edits, `false` for a clean
  // cancel. Parent decides what UI feedback (if any) to show.
  onCancel: (wasDirty: boolean) => void;
  // Lets the wizard ask the parent for a confirm dialog (used for the
  // "discard changes?" prompt). Optional — if omitted, dirty cancels go
  // through immediately.
  requestConfirm?: (
    message: string,
    detail: string | undefined,
    onConfirm: () => void,
  ) => void;
  active: boolean;
}

type FieldKey =
  | "name"
  | "type"
  | "command"
  | "file"
  | "lines"
  | "retry"
  | "cwd"
  | "autostart"
  | "restart"
  | "interactive";

const TEXT_FIELDS: ReadonlySet<FieldKey> = new Set([
  "name",
  "command",
  "file",
  "lines",
  "cwd",
]);

// Each row in the form box has height 3 (set in the `row` helper). Used to
// compute scroll position for keeping the focused field in view.
const ROW_HEIGHT = 3;

export function Wizard({
  initial,
  onSubmit,
  onCancel,
  requestConfirm,
  active,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<EntryType>(
    initial?.tail ? "tail" : "command",
  );
  const [command, setCommand] = useState(initial?.command ?? "");
  const [file, setFile] = useState(initial?.tail?.file ?? "");
  const [lines, setLines] = useState(
    initial?.tail?.lines !== undefined ? String(initial.tail.lines) : "",
  );
  const [retry, setRetry] = useState(initial?.tail?.retry ?? false);
  const [cwd, setCwd] = useState(initial?.cwd ?? "");
  const [autostart, setAutostart] = useState(initial?.autostart ?? false);
  const [restart, setRestart] = useState<RestartPolicy>(
    initial?.restart ?? "never",
  );
  const [interactive, setInteractive] = useState(initial?.interactive ?? false);
  const [focus, setFocus] = useState<FieldKey>("name");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollBoxRenderable | null>(null);

  // True when any field has diverged from `initial`. For "add" (no initial),
  // empty fields are considered clean — non-empty means dirty.
  const dirty = useMemo(() => {
    const initType: EntryType = initial?.tail ? "tail" : "command";
    if (name !== (initial?.name ?? "")) return true;
    if (type !== initType) return true;
    if (cwd !== (initial?.cwd ?? "")) return true;
    if (autostart !== (initial?.autostart ?? false)) return true;
    if (restart !== (initial?.restart ?? "never")) return true;
    if (interactive !== (initial?.interactive ?? false)) return true;
    if (type === "command") {
      if (command !== (initial?.command ?? "")) return true;
    } else {
      if (file !== (initial?.tail?.file ?? "")) return true;
      const initLines =
        initial?.tail?.lines !== undefined ? String(initial.tail.lines) : "";
      if (lines !== initLines) return true;
      if (retry !== (initial?.tail?.retry ?? false)) return true;
    }
    return false;
  }, [
    initial,
    name,
    type,
    command,
    file,
    lines,
    retry,
    cwd,
    autostart,
    restart,
    interactive,
  ]);

  const requestCancel = () => {
    if (!dirty || !requestConfirm) {
      onCancel(dirty);
      return;
    }
    requestConfirm("Discard changes?", "Your edits will be lost.", () =>
      onCancel(true),
    );
  };

  // The visible field list depends on the selected type: command-mode shows
  // command + interactive, tail-mode shows file/lines/retry instead.
  const fields = useMemo<FieldKey[]>(() => {
    const base: FieldKey[] = ["name", "type"];
    if (type === "command") base.push("command");
    else base.push("file", "lines", "retry");
    base.push("cwd", "autostart", "restart");
    if (type === "command") base.push("interactive");
    return base;
  }, [type]);

  // Keep the focused row visible inside the scrollable container by computing
  // its absolute Y offset (index × ROW_HEIGHT) and nudging scroll when it
  // falls outside the viewport. Only fires after layout — viewport.height is
  // 0 on first paint.
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const idx = fields.indexOf(focus);
    if (idx < 0) return;
    const top = idx * ROW_HEIGHT;
    const bottom = top + ROW_HEIGHT;
    const viewTop = box.scrollTop;
    const viewHeight = box.viewport.height;
    if (viewHeight === 0) return;
    if (top < viewTop) {
      box.scrollTo({ x: 0, y: top });
    } else if (bottom > viewTop + viewHeight) {
      box.scrollTo({ x: 0, y: bottom - viewHeight });
    }
  }, [focus, fields]);

  const submit = () => {
    if (!name.trim()) {
      setError("name is required");
      setFocus("name");
      return;
    }
    if (type === "command") {
      if (!command.trim()) {
        setError("command is required");
        setFocus("command");
        return;
      }
    } else {
      if (!file.trim()) {
        setError("file is required");
        setFocus("file");
        return;
      }
      if (lines.trim() && !/^\d+$/.test(lines.trim())) {
        setError("lines must be a positive integer");
        setFocus("lines");
        return;
      }
    }
    const tail: TailConfig | undefined =
      type === "tail"
        ? {
            file: file.trim(),
            ...(lines.trim() ? { lines: parseInt(lines.trim(), 10) } : {}),
            ...(retry ? { retry: true } : {}),
          }
        : undefined;
    const cfg: CommandConfig = {
      name: name.trim(),
      ...(type === "command" ? { command: command.trim() } : {}),
      ...(tail ? { tail } : {}),
      ...(cwd.trim() ? { cwd: cwd.trim() } : {}),
      ...(autostart ? { autostart: true } : {}),
      ...(restart !== "never" ? { restart } : {}),
      ...(type === "command" && interactive ? { interactive: true } : {}),
      ...(initial?.env ? { env: initial.env } : {}),
    };
    onSubmit(cfg, initial?.name);
  };

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "tab") {
      const i = fields.indexOf(focus);
      const next = k.shift
        ? (i - 1 + fields.length) % fields.length
        : (i + 1) % fields.length;
      setFocus(fields[next]!);
      return;
    }
    if (n === "escape") {
      requestCancel();
      return;
    }
    // Text fields handle their own input. Only ctrl-s reaches us.
    if (TEXT_FIELDS.has(focus)) {
      if (k.ctrl && n === "s") submit();
      return;
    }
    // Non-text fields: space/return/enter toggles or cycles.
    if (n === "space" || n === "return" || n === "enter") {
      if (focus === "type") {
        const i = TYPE_VALUES.indexOf(type);
        setType(TYPE_VALUES[(i + 1) % TYPE_VALUES.length]!);
      } else if (focus === "autostart") setAutostart((v) => !v);
      else if (focus === "interactive") setInteractive((v) => !v);
      else if (focus === "retry") setRetry((v) => !v);
      else if (focus === "restart") {
        const i = RESTART_VALUES.indexOf(restart);
        setRestart(RESTART_VALUES[(i + 1) % RESTART_VALUES.length]!);
      }
      return;
    }
    if (n === "left" || n === "right") {
      const cycle = <T,>(values: readonly T[], current: T): T => {
        const i = values.indexOf(current);
        const next =
          n === "right"
            ? (i + 1) % values.length
            : (i - 1 + values.length) % values.length;
        return values[next]!;
      };
      if (focus === "type") setType(cycle(TYPE_VALUES, type));
      else if (focus === "restart") setRestart(cycle(RESTART_VALUES, restart));
      return;
    }
    if ((k.ctrl && n === "s") || (n === "return" && k.shift)) {
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
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <box
        style={{
          paddingLeft: 1,
          paddingBottom: 1,
          marginBottom: 1,
          borderStyle: "single",
          border: ["bottom"],
          borderColor: "#333333",
        }}
      >
        <text fg="#FFAA00">{initial ? "Edit command" : "Add command"}</text>
      </box>
      <scrollbox
        ref={(el: ScrollBoxRenderable | null) => {
          scrollRef.current = el;
        }}
        style={{ flexGrow: 1 }}
        scrollY
      >
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
          "type",
          "type",
          <text fg="#cccccc">
            {TYPE_VALUES.map((v) => (v === type ? `[${v}]` : ` ${v} `)).join(
              "  ",
            )}
            {focus === "type" ? "   ←/→ or space" : ""}
          </text>,
        )}
        {type === "command"
          ? row(
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
            )
          : null}
        {type === "tail"
          ? row(
              "file",
              "file",
              <input
                style={{ flexGrow: 1 }}
                placeholder="e.g. laravel.log (relative to cwd)"
                value={file}
                focused={focus === "file" && active}
                onInput={(v) => {
                  setFile(v);
                  setError(null);
                }}
                onSubmit={submit}
              />,
            )
          : null}
        {type === "tail"
          ? row(
              "lines",
              "lines",
              <input
                style={{ flexGrow: 1 }}
                placeholder="initial lines, blank = tail default"
                value={lines}
                focused={focus === "lines" && active}
                onInput={(v) => {
                  setLines(v);
                  setError(null);
                }}
                onSubmit={submit}
              />,
            )
          : null}
        {type === "tail"
          ? row(
              "retry",
              "retry",
              <text fg={retry ? "#55FF55" : "#888888"}>
                {retry
                  ? "[x] yes (--retry: keep trying if file is missing)"
                  : "[ ] no"}
                {focus === "retry" ? "   space to toggle" : ""}
              </text>,
            )
          : null}
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
        {type === "command"
          ? row(
              "interactive",
              "interactive",
              <text fg={interactive ? "#55FF55" : "#888888"}>
                {interactive
                  ? "[x] yes (line input forwarded to stdin)"
                  : "[ ] no"}
                {focus === "interactive" ? "   space to toggle" : ""}
              </text>,
            )
          : null}
        {error ? (
          <box style={{ paddingLeft: 1, paddingTop: 1 }}>
            <text fg="#FF5555">{error}</text>
          </box>
        ) : null}
      </scrollbox>
    </box>
  );
}
