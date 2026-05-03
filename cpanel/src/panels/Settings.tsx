import React, { useMemo, useState } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { existsSync, statSync, readdirSync, copyFileSync } from "node:fs";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { listDir, readText, rmPath, paths } from "../lib/claude.js";
import { bytes, dateStr, relTime } from "../lib/format.js";
import { openInEditor } from "../lib/editor.js";
import { useScrollControls } from "../lib/use-scroll.js";
import type { PanelDef, PanelProps } from "./types.js";

interface Entry {
  label: string;
  path: string;
  kind: "file" | "dir" | "backup";
  size?: number;
  mtimeMs?: number;
}

function loadItems(): Entry[] {
  const out: Entry[] = [];
  const fileTargets: Entry[] = [
    { label: "settings.json", path: paths.settings, kind: "file" },
    { label: "keybindings.json", path: paths.keybindings, kind: "file" },
    { label: "CLAUDE.md", path: paths.claudeMd, kind: "file" },
    { label: "agents/", path: paths.agents, kind: "dir" },
    { label: "skills/", path: paths.skills, kind: "dir" },
    { label: "rules/", path: paths.rules, kind: "dir" },
  ];
  for (const t of fileTargets) {
    if (!existsSync(t.path)) continue;
    try {
      const s = statSync(t.path);
      out.push({ ...t, size: s.size, mtimeMs: s.mtimeMs });
    } catch {
      out.push(t);
    }
  }
  // Backups appear at the bottom as their own entries.
  const backups = listDir(paths.backups).filter((e) => !e.isDir && e.name.startsWith(".claude.json.backup"));
  for (const b of backups) {
    out.push({
      label: `backup ${b.name.replace(/^\.claude\.json\.backup\.?/, "") || "(latest)"}`,
      path: b.path,
      kind: "backup",
      size: b.size,
      mtimeMs: b.mtimeMs,
    });
  }
  return out;
}

function SettingsPanel({ active, requestConfirm, sidebarWidth, onSidebarResize }: PanelProps) {
  const renderer = useRenderer();
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const items = useMemo(() => loadItems(), [reload]);
  const [sel, setSel] = useState(0);
  const cur = items[Math.min(sel, items.length - 1)];
  const scrollRef = useScrollControls(active, cur?.path);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(items.length - 1, s + 1));
    else if ((n === "e" || n === "return" || n === "enter") && cur && cur.kind === "file") {
      openInEditor(renderer, cur.path);
    } else if (n === "r" && cur?.kind === "backup") {
      const target = cur;
      const dest = paths.claudeJson;
      const safety = `${dest}.before-restore.${Date.now()}`;
      requestConfirm(
        `Restore ${target.label} → ${dest}?`,
        existsSync(dest) ? `Current ${dest} will be saved as ${safety}` : `${dest} does not currently exist`,
        () => {
          if (existsSync(dest)) copyFileSync(dest, safety);
          copyFileSync(target.path, dest);
          setReload((r) => r + 1);
          setNotice(`Restored from ${target.label}`);
          setTimeout(() => setNotice(null), 3000);
        },
      );
    } else if (n === "d" && cur?.kind === "backup") {
      const target = cur;
      requestConfirm(`Delete ${target.label}?`, `${target.path} (${bytes(target.size ?? 0)})`, () => {
        rmPath(target.path);
        setReload((r) => r + 1);
      });
    }
  });

  let previewBody: React.ReactNode;
  if (!cur) {
    previewBody = <text fg="#666666">Nothing to show.</text>;
  } else if (cur.kind === "file") {
    previewBody = <text fg="#cccccc">{readText(cur.path, 16 * 1024)}</text>;
  } else if (cur.kind === "backup") {
    previewBody = (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text>
          <span fg="#888888">created   </span>
          <span fg="#FFFFFF">{cur.mtimeMs ? dateStr(cur.mtimeMs) : "—"}</span>
        </text>
        <text>
          <span fg="#888888">size      </span>
          <span fg="#FFFFFF">{bytes(cur.size ?? 0)}</span>
        </text>
        <text> </text>
        <text fg="#888888">first 4 KB</text>
        <text fg="#cccccc">{readText(cur.path, 4 * 1024)}</text>
      </box>
    );
  } else {
    let entries: string[] = [];
    try {
      entries = readdirSync(cur.path);
    } catch {}
    previewBody = (
      <box style={{ flexDirection: "column" }}>
        <text fg="#888888">{`${entries.length} entries:`}</text>
        {entries.slice(0, 50).map((e) => (
          <text key={e} fg="#cccccc">{`  ${e}`}</text>
        ))}
        {entries.length > 50 ? <text fg="#666666">{`  … +${entries.length - 50} more`}</text> : null}
      </box>
    );
  }

  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Settings & Backups"
          width={sidebarWidth}
          items={items.map((t) => ({
            key: t.path,
            primary: t.label,
            secondary: t.kind === "backup" ? relTime(t.mtimeMs ?? 0) : t.kind === "file" ? bytes(t.size ?? 0) : "",
          }))}
          selected={sel}
          onSelect={setSel}
        />
      }
      preview={
        <PreviewPane title={cur?.label} ref={scrollRef}>
          {previewBody}
          {notice ? (
            <>
              <text> </text>
              <text fg="#88FFAA">{notice}</text>
            </>
          ) : null}
        </PreviewPane>
      }
    />
  );
}

export const SettingsDef: PanelDef = {
  name: "Settings",
  bindings: [
    ["↑↓/jk", "navigate"],
    ["e/⏎", "edit"],
    ["r", "restore backup"],
    ["d", "delete backup"],
  ],
  Component: SettingsPanel,
};
