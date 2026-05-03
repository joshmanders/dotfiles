import React, { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { paths, projectPathFromKey } from "../lib/claude.js";
import { useScrollControls } from "../lib/use-scroll.js";
import { dateStr, homePath, truncate } from "../lib/format.js";
import type { PanelDef, PanelProps } from "./types.js";

interface Hit {
  filePath: string;
  lineNumber: number;
  preview: string; // raw matched line snippet
}

interface ParsedHit extends Hit {
  projectCwd: string;
  role?: "user" | "assistant" | "tool";
  fullText?: string;
  timestamp?: number;
}

function runSearch(query: string): Hit[] {
  if (!query.trim()) return [];
  const args = [
    "--no-config",
    "--no-ignore",
    "--hidden",
    "--no-heading",
    "--with-filename",
    "--line-number",
    "--smart-case",
    "--max-count",
    "5",
    "--type-add",
    "jsonl:*.jsonl",
    "-tjsonl",
  ];
  // Exclude ignored project directories at the ripgrep level so the
  // process never even reads those files. We need both the exact key glob
  // and a `<key>-*` glob because subdirs of an ignored path get encoded as
  // `<parent-key>-<child>` (e.g. `~/Code/foo` → `-Users-josh-Code-foo`,
  // `~/Code/foo/bar` → `-Users-josh-Code-foo-bar`).
  for (const prefix of ignoredPrefixes()) {
    const key = projectKeyForPath(prefix);
    // Two globs: exact-name dir + any sibling key encoded as <key>-<child>.
    // Anchored to keep `~/Code/foo` from accidentally matching
    // `~/Code/foobar` (no `<key>*` wildcard).
    args.push("--glob", `!${key}`);
    args.push("--glob", `!${key}-*`);
  }
  args.push("--", query, paths.projects);
  const res = spawnSync("rg", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (res.status !== 0 && !res.stdout) return [];

  const hits: Hit[] = [];
  for (const line of res.stdout.split("\n")) {
    if (!line) continue;
    const m = line.match(/^([^:]+):(\d+):(.*)$/);
    if (!m) continue;
    const filePath = m[1]!;
    // Defense-in-depth: even if a glob slipped, drop hits whose project is ignored.
    const projectCwd = projectCwdForFile(filePath);
    if (projectCwd && isProjectIgnored(projectCwd)) continue;
    hits.push({
      filePath,
      lineNumber: parseInt(m[2]!, 10),
      preview: m[3]!.slice(0, 200),
    });
  }
  return hits.slice(0, 500);
}

function projectCwdForFile(filePath: string): string | null {
  const segments = filePath.split("/");
  const idx = segments.findIndex((s) => s === "projects");
  if (idx < 0 || !segments[idx + 1]) return null;
  return projectPathFromKey(segments[idx + 1]!);
}

function parseHit(h: Hit): ParsedHit {
  let parsed: ParsedHit = { ...h, projectCwd: "" };
  // Project key is the parent directory under projects/.
  const segments = h.filePath.split("/");
  const projectIdx = segments.findIndex((s) => s === "projects");
  if (projectIdx >= 0 && segments[projectIdx + 1]) {
    parsed.projectCwd = projectPathFromKey(segments[projectIdx + 1]!);
  }
  try {
    const lines = readFileSync(h.filePath, "utf8").split("\n");
    const raw = lines[h.lineNumber - 1] ?? "";
    const d = JSON.parse(raw);
    if (typeof d.timestamp === "string") parsed.timestamp = Date.parse(d.timestamp);
    if (d.message?.role === "assistant" || d.message?.role === "user") parsed.role = d.message.role;
    const content = d.message?.content;
    if (typeof content === "string") parsed.fullText = content;
    else if (Array.isArray(content)) {
      const parts: string[] = [];
      for (const c of content) {
        if (c?.type === "text" && typeof c.text === "string") parts.push(c.text);
        else if (c?.type === "tool_use") parts.push(`[tool_use ${c.name}: ${JSON.stringify(c.input).slice(0, 300)}]`);
        else if (c?.type === "tool_result") {
          parsed.role = "tool";
          parts.push(typeof c.content === "string" ? c.content : JSON.stringify(c.content).slice(0, 1000));
        }
      }
      parsed.fullText = parts.join("\n");
    }
  } catch {}
  return parsed;
}

function SearchPanel({ active, sidebarWidth, onSidebarResize }: PanelProps) {
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [sel, setSel] = useState(0);
  const [searching, setSearching] = useState(false);
  const [focusInput, setFocusInput] = useState(true);

  const cur = hits[Math.min(sel, hits.length - 1)];
  const parsed = cur ? parseHit(cur) : null;
  const scrollRef = useScrollControls(active && !focusInput, `${cur?.filePath}-${cur?.lineNumber}`);

  const submit = (q: string) => {
    setCommittedQuery(q);
    setSearching(true);
    setSel(0);
    setTimeout(() => {
      try {
        setHits(runSearch(q));
      } finally {
        setSearching(false);
      }
    }, 16);
  };

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (focusInput) {
      if (n === "escape") setFocusInput(false);
      return;
    }
    if (n === "i" || n === "/") setFocusInput(true);
    else if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(hits.length - 1, s + 1));
  });

  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <box
        style={{
          flexDirection: "row",
          height: 3,
          paddingLeft: 1,
          paddingRight: 1,
          borderStyle: "rounded",
          border: true,
          borderColor: focusInput ? "#FFAA00" : "#333333",
          gap: 1,
        }}
      >
        <text fg="#888888">search:</text>
        <input
          style={{ flexGrow: 1 }}
          placeholder="type to search all conversations… (enter to submit, esc to leave input)"
          value={query}
          focused={focusInput && active}
          onInput={setQuery}
          onSubmit={(v) => {
            submit(v);
            setFocusInput(false);
          }}
        />
      </box>
      <SidebarLayout
        onResize={onSidebarResize}
        list={
          <ListPane
            title={searching ? "Searching…" : committedQuery ? `Results for "${truncate(committedQuery, 30)}"` : "Results"}
            width={sidebarWidth}
            items={hits.map((h, i) => ({
              key: `${i}`,
              primary: truncate(h.preview, 60),
              secondary: `${h.filePath.split("/").pop()}:${h.lineNumber}`,
            }))}
            selected={sel}
            onSelect={setSel}
            emptyMessage={committedQuery ? "(no matches)" : "(type a query, then press enter)"}
          />
        }
        preview={
          <PreviewPane title={parsed?.role ?? "Match"} ref={scrollRef}>
            {!parsed ? (
              <text fg="#666666">Select a result.</text>
            ) : (
              <box style={{ flexDirection: "column", gap: 1 }}>
                <text>
                  <span fg="#888888">file     </span>
                  <span fg="#cccccc">{homePath(parsed.filePath)}</span>
                </text>
                <text>
                  <span fg="#888888">line     </span>
                  <span fg="#FFFFFF">{String(parsed.lineNumber)}</span>
                </text>
                {parsed.timestamp ? (
                  <text>
                    <span fg="#888888">when     </span>
                    <span fg="#FFFFFF">{dateStr(parsed.timestamp)}</span>
                  </text>
                ) : null}
                {parsed.projectCwd ? (
                  <text>
                    <span fg="#888888">project  </span>
                    <span fg="#FFFFFF">{homePath(parsed.projectCwd)}</span>
                  </text>
                ) : null}
                <text> </text>
                <text fg={parsed.role === "assistant" ? "#88FFAA" : parsed.role === "user" ? "#FFAA00" : "#888888"}>
                  {parsed.role ?? "raw"}
                </text>
                <text fg="#cccccc">{parsed.fullText ?? parsed.preview}</text>
              </box>
            )}
          </PreviewPane>
        }
      />
    </box>
  );
}

export const SearchDef: PanelDef = {
  name: "Search",
  bindings: [
    ["i / /", "focus input"],
    ["esc", "leave input"],
    ["⏎", "search"],
    ["↑↓/jk", "navigate"],
  ],
  Component: SearchPanel,
};
