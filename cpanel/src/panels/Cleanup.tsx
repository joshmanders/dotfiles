import React, { useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { dirSize, listDir, rmPath, paths } from "../lib/claude.js";
import { bytes } from "../lib/format.js";
import { useScrollControls } from "../lib/use-scroll.js";
import type { PanelDef, PanelProps } from "./types.js";

const DAY = 24 * 60 * 60 * 1000;

interface Sweep {
  key: string;
  label: string;
  describe: () => string;
  collect: () => string[];
}

function olderThan(dir: string, days: number): string[] {
  if (!existsSync(dir)) return [];
  const cutoff = Date.now() - days * DAY;
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    try {
      if (statSync(p).mtimeMs < cutoff) out.push(p);
    } catch {}
  }
  return out;
}

function emptyChildren(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    try {
      const s = statSync(p);
      if (s.isFile() && s.size <= 2) out.push(p);
      else if (s.isDirectory() && readdirSync(p).length === 0) out.push(p);
    } catch {}
  }
  return out;
}

function keepLatestN(dir: string, n: number, prefix?: string): string[] {
  if (!existsSync(dir)) return [];
  const items = listDir(dir).filter((e) => !prefix || e.name.startsWith(prefix));
  return items.slice(n).map((e) => e.path);
}

function totalBytes(paths: string[]): number {
  let total = 0;
  for (const p of paths) {
    try {
      const s = statSync(p);
      total += s.isDirectory() ? dirSize(p) : s.size;
    } catch {}
  }
  return total;
}

const SWEEPS: Sweep[] = [
  {
    key: "todos-empty",
    label: "Empty todos/ files",
    describe: () => "Files in ~/.claude/todos/ that are empty (≤2 bytes)",
    collect: () => emptyChildren(paths.todos),
  },
  {
    key: "paste-cache",
    label: "All paste-cache",
    describe: () => "Everything in ~/.claude/paste-cache/",
    collect: () => listDir(paths.pasteCache).map((e) => e.path),
  },
  {
    key: "shell-snapshots-old",
    label: "Shell snapshots > 30 days",
    describe: () => "Files in ~/.claude/shell-snapshots/ older than 30 days",
    collect: () => olderThan(paths.shellSnapshots, 30),
  },
  {
    key: "backups-keep5",
    label: "Backups beyond newest 5",
    describe: () => "All but the 5 most recent .claude.json.backup files",
    collect: () => keepLatestN(paths.backups, 5, ".claude.json.backup"),
  },
  {
    key: "telemetry-old",
    label: "Telemetry > 14 days",
    describe: () => "Telemetry files in ~/.claude/telemetry/ older than 14 days",
    collect: () => olderThan(paths.telemetry, 14),
  },
];

function CleanupPanel({ active, requestConfirm, sidebarWidth, onSidebarResize }: PanelProps) {
  const [reload, setReload] = useState(0);
  const sweeps = useMemo(
    () =>
      SWEEPS.map((s) => {
        const targets = s.collect();
        return { ...s, targets, bytes: totalBytes(targets) };
      }),
    [reload],
  );
  const [sel, setSel] = useState(0);
  const cur = sweeps[Math.min(sel, sweeps.length - 1)];
  const scrollRef = useScrollControls(active, cur?.key);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(sweeps.length - 1, s + 1));
    else if ((n === "return" || n === "enter") && cur && cur.targets.length > 0) {
      const target = cur;
      requestConfirm(
        `${target.label}: delete ${target.targets.length} item(s)?`,
        `${bytes(target.bytes)} total — first: ${target.targets[0]}`,
        () => {
          for (const p of target.targets) rmPath(p);
          setReload((r) => r + 1);
        },
      );
    }
  });

  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Cleanup sweeps"
          width={sidebarWidth}
          items={sweeps.map((s) => ({
            key: s.key,
            primary: s.label,
            secondary: s.targets.length === 0 ? "clean" : `${s.targets.length} · ${bytes(s.bytes)}`,
          }))}
          selected={sel}
          onSelect={setSel}
        />
      }
      preview={
        <PreviewPane title={cur?.label} ref={scrollRef}>
        {cur ? (
          <box style={{ flexDirection: "column", gap: 1 }}>
            <text fg="#cccccc">{cur.describe()}</text>
            <text>
              <span fg="#888888">items   </span>
              <span fg="#FFFFFF">{String(cur.targets.length)}</span>
            </text>
            <text>
              <span fg="#888888">total   </span>
              <span fg="#FFFFFF">{bytes(cur.bytes)}</span>
            </text>
            <text> </text>
            <text fg="#888888">first 15:</text>
            {cur.targets.slice(0, 15).map((p) => (
              <text key={p} fg="#cccccc">{`  ${p}`}</text>
            ))}
            {cur.targets.length > 15 ? (
              <text fg="#666666">{`  … +${cur.targets.length - 15} more`}</text>
            ) : null}
          </box>
        ) : (
          <text fg="#666666">No sweeps available.</text>
        )}
      </PreviewPane>
      }
    />
  );
}

export const CleanupDef: PanelDef = {
  name: "Cleanup",
  bindings: [
    ["↑↓/jk", "navigate"],
    ["⏎", "run sweep"],
  ],
  Component: CleanupPanel,
};
