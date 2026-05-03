import React, { useEffect, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { join } from "node:path";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { listDir, paths, pidAlive, projectKeyForPath, readJson } from "../lib/claude.js";
import { isProjectIgnored } from "../lib/config.js";
import { dateStr, homePath, relTime, truncate } from "../lib/format.js";
import { useScrollControls } from "../lib/use-scroll.js";
import type { PanelDef, PanelProps } from "./types.js";

interface SessionInfo {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
  kind?: string;
  alive: boolean;
}

interface LiveSession extends SessionInfo {
  jsonlPath?: string;
  lastEntry?: ParsedTail;
  jsonlMtime?: number;
}

interface ParsedTail {
  type: string;
  role?: "user" | "assistant";
  timestamp: number;
  text?: string;
  toolName?: string;
  toolInput?: string;
}

function findJsonl(sessionId: string, cwd: string): string | undefined {
  const candidates: string[] = [];
  const direct = join(paths.projects, projectKeyForPath(cwd), `${sessionId}.jsonl`);
  if (existsSync(direct)) candidates.push(direct);
  // Fallback: scan all projects for a file with this sessionId.
  if (candidates.length === 0 && existsSync(paths.projects)) {
    for (const projectKey of readdirSync(paths.projects)) {
      const candidate = join(paths.projects, projectKey, `${sessionId}.jsonl`);
      if (existsSync(candidate)) {
        candidates.push(candidate);
        break;
      }
    }
  }
  return candidates[0];
}

function tail(filePath: string, bytes = 8192): string[] {
  try {
    const stat = statSync(filePath);
    const start = Math.max(0, stat.size - bytes);
    const fd = require("node:fs").openSync(filePath, "r");
    const buf = Buffer.alloc(stat.size - start);
    require("node:fs").readSync(fd, buf, 0, buf.length, start);
    require("node:fs").closeSync(fd);
    return buf.toString("utf8").split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function parseTail(line: string): ParsedTail | null {
  try {
    const d = JSON.parse(line);
    const ts = typeof d.timestamp === "string" ? Date.parse(d.timestamp) : 0;
    const out: ParsedTail = { type: d.type, timestamp: ts };
    if (d.message?.role === "assistant" || d.message?.role === "user") {
      out.role = d.message.role;
      const content = d.message.content;
      if (typeof content === "string") out.text = content;
      else if (Array.isArray(content)) {
        const textParts: string[] = [];
        for (const c of content) {
          if (c?.type === "text" && typeof c.text === "string") textParts.push(c.text);
          else if (c?.type === "tool_use") {
            out.toolName = c.name;
            out.toolInput = JSON.stringify(c.input).slice(0, 200);
          }
        }
        if (textParts.length) out.text = textParts.join("\n");
      }
    }
    return out;
  } catch {
    return null;
  }
}

function loadLive(): LiveSession[] {
  const files = listDir(paths.sessions, { ext: ".json" });
  const out: LiveSession[] = [];
  for (const f of files) {
    const data = readJson<SessionInfo>(f.path);
    if (!data) continue;
    if (isProjectIgnored(data.cwd)) continue;
    const alive = pidAlive(data.pid);
    const jsonlPath = data.sessionId && data.cwd ? findJsonl(data.sessionId, data.cwd) : undefined;
    let lastEntry: ParsedTail | undefined;
    let mtime: number | undefined;
    if (jsonlPath) {
      try {
        mtime = statSync(jsonlPath).mtimeMs;
        const lines = tail(jsonlPath, 16 * 1024);
        // Walk backward, find the last entry with role/text/tool info
        for (let i = lines.length - 1; i >= 0; i--) {
          const p = parseTail(lines[i]!);
          if (p && (p.text || p.toolName)) {
            lastEntry = p;
            break;
          }
        }
      } catch {}
    }
    out.push({ ...data, alive, jsonlPath, lastEntry, jsonlMtime: mtime });
  }
  // Alive sessions first, then most recently updated.
  out.sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    return (b.jsonlMtime ?? 0) - (a.jsonlMtime ?? 0);
  });
  return out;
}

function LivePanel({ active, sidebarWidth, onSidebarResize, showHiddenVersion }: PanelProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [sel, setSel] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setSessions(loadLive());
    if (paused) return;
    const id = setInterval(() => setSessions(loadLive()), 2000);
    return () => clearInterval(id);
  }, [paused, showHiddenVersion]);

  const cur = sessions[Math.min(sel, sessions.length - 1)];
  const scrollRef = useScrollControls(active, cur?.sessionId);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(sessions.length - 1, s + 1));
    else if (n === "p") setPaused((p) => !p);
  });

  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title={paused ? "Live (paused)" : "Live sessions"}
          width={sidebarWidth}
          items={sessions.map((s) => ({
            key: s.sessionId,
            primary: `${s.alive ? "● " : "○ "}${homePath(s.cwd) || "(unknown)"}`,
            secondary: s.jsonlMtime ? relTime(s.jsonlMtime) : "—",
          }))}
          selected={sel}
          onSelect={setSel}
          emptyMessage="(no sessions found)"
        />
      }
      preview={
        <PreviewPane title={cur?.sessionId} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">No active sessions.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text>
                <span fg="#888888">status     </span>
                <span fg={cur.alive ? "#88FFAA" : "#FF6666"}>{cur.alive ? "● alive" : "○ ended"}</span>
              </text>
              <text>
                <span fg="#888888">pid        </span>
                <span fg="#FFFFFF">{String(cur.pid)}</span>
              </text>
              <text>
                <span fg="#888888">cwd        </span>
                <span fg="#FFFFFF">{homePath(cur.cwd)}</span>
              </text>
              <text>
                <span fg="#888888">started    </span>
                <span fg="#FFFFFF">{cur.startedAt ? dateStr(cur.startedAt) : "—"}</span>
              </text>
              <text>
                <span fg="#888888">kind       </span>
                <span fg="#FFFFFF">{cur.kind ?? "—"}</span>
              </text>
              <text>
                <span fg="#888888">log        </span>
                <span fg="#cccccc">{homePath(cur.jsonlPath) || "(not found)"}</span>
              </text>
              {cur.jsonlMtime ? (
                <text>
                  <span fg="#888888">last write </span>
                  <span fg="#FFFFFF">{relTime(cur.jsonlMtime)}</span>
                </text>
              ) : null}

              <text> </text>
              <text fg="#FFAA00">Latest activity</text>
              {!cur.lastEntry ? (
                <text fg="#666666">(no parsed entries)</text>
              ) : (
                <>
                  <text>
                    <span fg="#888888">at         </span>
                    <span fg="#FFFFFF">{cur.lastEntry.timestamp ? dateStr(cur.lastEntry.timestamp) : "—"}</span>
                  </text>
                  <text>
                    <span fg="#888888">role       </span>
                    <span fg={cur.lastEntry.role === "assistant" ? "#88FFAA" : "#FFAA00"}>
                      {cur.lastEntry.role ?? cur.lastEntry.type}
                    </span>
                  </text>
                  {cur.lastEntry.toolName ? (
                    <text>
                      <span fg="#888888">tool       </span>
                      <span fg="#FFFFFF">{cur.lastEntry.toolName}</span>
                      <span fg="#666666">{`  ${truncate(cur.lastEntry.toolInput ?? "", 100)}`}</span>
                    </text>
                  ) : null}
                  {cur.lastEntry.text ? (
                    <>
                      <text fg="#888888">text</text>
                      <text fg="#cccccc">{truncate(cur.lastEntry.text, 1000)}</text>
                    </>
                  ) : null}
                </>
              )}
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

export const LiveDef: PanelDef = {
  name: "Live",
  bindings: [
    ["↑↓/jk", "navigate"],
    ["p", "pause refresh"],
  ],
  Component: LivePanel,
};
