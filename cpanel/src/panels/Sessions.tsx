import React, { useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { listDir, pidAlive, readJson, rmPath, paths } from "../lib/claude.js";
import { isProjectIgnored } from "../lib/config.js";
import { bytes, dateStr, homePath, relTime } from "../lib/format.js";
import { useScrollControls } from "../lib/use-scroll.js";
import { spawnTerminal } from "../lib/spawn-terminal.js";
import type { PanelDef, PanelProps } from "./types.js";

interface SessionData {
  pid?: number;
  sessionId?: string;
  cwd?: string;
  startedAt?: number;
  kind?: string;
  entrypoint?: string;
}

interface SessionRow {
  filePath: string;
  fileName: string;
  fileMtime: number;
  fileSize: number;
  data: SessionData | null;
  alive: boolean;
}

interface CommitEntry {
  hash: string;
  date: string;
  subject: string;
}

function loadSessions(): SessionRow[] {
  const files = listDir(paths.sessions, { ext: ".json" });
  const out: SessionRow[] = [];
  for (const f of files) {
    const data = readJson<SessionData>(f.path);
    if (isProjectIgnored(data?.cwd)) continue;
    out.push({
      filePath: f.path,
      fileName: f.name,
      fileMtime: f.mtimeMs,
      fileSize: f.size,
      data,
      alive: pidAlive(data?.pid),
    });
  }
  return out;
}

function gitCommitsFor(cwd: string, startedAt: number): CommitEntry[] {
  if (!cwd || !existsSync(join(cwd, ".git"))) return [];
  const since = new Date(startedAt - 60_000).toISOString();
  const until = new Date(startedAt + 24 * 60 * 60 * 1000).toISOString();
  const res = spawnSync(
    "git",
    ["log", `--since=${since}`, `--until=${until}`, "--pretty=format:%h|%aI|%s", "--no-merges"],
    { cwd, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
  );
  if (res.status !== 0 || !res.stdout) return [];
  const out: CommitEntry[] = [];
  for (const line of res.stdout.split("\n")) {
    const parts = line.split("|");
    if (parts.length < 3) continue;
    out.push({ hash: parts[0]!, date: parts[1]!, subject: parts.slice(2).join("|") });
  }
  return out;
}

function SessionsPanel({ active, requestConfirm, sidebarWidth, onSidebarResize, showHiddenVersion }: PanelProps) {
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const items = useMemo(() => loadSessions(), [reload, showHiddenVersion]);
  const [sel, setSel] = useState(0);
  const cur = items[Math.min(sel, items.length - 1)];
  const data = cur?.data ?? null;
  const commits = useMemo(
    () => (data?.cwd && data.startedAt ? gitCommitsFor(data.cwd, data.startedAt) : []),
    [data?.cwd, data?.startedAt],
  );
  const scrollRef = useScrollControls(active, cur?.filePath);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(items.length - 1, s + 1));
    else if (n === "d" && cur) {
      const target = cur;
      requestConfirm(`Delete session: ${target.fileName}?`, target.filePath, () => {
        rmPath(target.filePath);
        setReload((r) => r + 1);
      });
    } else if (n === "r" && cur && data?.sessionId && data.cwd) {
      const result = spawnTerminal(data.cwd, `claude --resume ${data.sessionId}`);
      setNotice(result.ok ? `Opened in ${result.how}` : "Could not spawn a terminal");
      setTimeout(() => setNotice(null), 3000);
    }
  });

  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Sessions"
          width={sidebarWidth}
          items={items.map((s) => ({
            key: s.filePath,
            primary: `${s.alive ? "● " : "  "}${homePath(s.data?.cwd) || "(unknown)"}`,
            secondary: relTime(s.fileMtime),
          }))}
          selected={sel}
          onSelect={setSel}
        />
      }
      preview={
        <PreviewPane title={cur?.fileName} ref={scrollRef}>
          {data ? (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text>
                <span fg="#888888">status    </span>
                <span fg={cur.alive ? "#88FFAA" : "#888888"}>{cur.alive ? "● alive" : "○ ended"}</span>
              </text>
              <text>
                <span fg="#888888">project   </span>
                <span fg="#FFFFFF">{homePath(data.cwd) || "(unknown)"}</span>
              </text>
              <text>
                <span fg="#888888">cwd       </span>
                <span fg="#FFFFFF">{homePath(data.cwd) || "—"}</span>
              </text>
              <text>
                <span fg="#888888">pid       </span>
                <span fg="#FFFFFF">{String(data.pid ?? "—")}</span>
              </text>
              <text>
                <span fg="#888888">session   </span>
                <span fg="#FFFFFF">{data.sessionId ?? "—"}</span>
              </text>
              <text>
                <span fg="#888888">started   </span>
                <span fg="#FFFFFF">{data.startedAt ? dateStr(data.startedAt) : "—"}</span>
              </text>
              <text>
                <span fg="#888888">kind      </span>
                <span fg="#FFFFFF">{data.kind ?? "—"}</span>
              </text>
              <text>
                <span fg="#888888">entry     </span>
                <span fg="#FFFFFF">{data.entrypoint ?? "—"}</span>
              </text>
              <text>
                <span fg="#888888">size      </span>
                <span fg="#FFFFFF">{bytes(cur.fileSize)}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">{`Commits in cwd within 24h (${commits.length})`}</text>
              {commits.length === 0 ? (
                <text fg="#666666">  (no commits found in this window)</text>
              ) : (
                commits.slice(0, 30).map((c) => (
                  <text key={c.hash}>
                    <span fg="#FFAA00">  {c.hash}</span>
                    <span fg="#666666">{`  ${c.date.slice(0, 19).replace("T", " ")}  `}</span>
                    <span fg="#FFFFFF">{c.subject}</span>
                  </text>
                ))
              )}

              {notice ? (
                <>
                  <text> </text>
                  <text fg="#88FFAA">{notice}</text>
                </>
              ) : null}
            </box>
          ) : (
            <text fg="#666666">No session selected.</text>
          )}
        </PreviewPane>
      }
    />
  );
}

export const SessionsDef: PanelDef = {
  name: "Sessions",
  bindings: [
    ["↑↓/jk", "navigate"],
    ["r", "resume in terminal"],
    ["d", "delete"],
  ],
  Component: SessionsPanel,
};
