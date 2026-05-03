import React, { useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { existsSync } from "node:fs";
import { PreviewPane } from "../components/PreviewPane.js";
import { DISK_TARGETS, dirSize, listDir, paths, pidAlive, readJson } from "../lib/claude.js";
import { isProjectIgnored } from "../lib/config.js";
import { bytes, dateKey, homePath, relTime, sparkline, truncate } from "../lib/format.js";
import { loadAllConversations, visibleConversations, type Conversation } from "../lib/conversations.js";
import {
  findCorrections,
  findStuckLoops,
  findToolPatterns,
  findWastedWork,
  type CorrectionGroup,
  type PatternFinding,
  type StuckLoopFinding,
  type WastedWorkFinding,
} from "../lib/insights/index.js";
import { useScrollControls } from "../lib/use-scroll.js";
import type { PanelDef, PanelProps } from "./types.js";

interface SessionRow {
  pid: number;
  cwd: string;
  alive: boolean;
  startedAt: number;
}

interface DashboardData {
  conversations: number;
  totalMessages: number;
  totalSessions: number;
  firstSessionDate?: string;
  todayMessages: number;
  todaySessions: number;
  todayTools: number;
  active: SessionRow[];
  recentMessages: number[]; // last 30 days
  recentSessions: number[];
  hourCounts?: number[]; // 24-hour distribution
  topCorrections: CorrectionGroup[];
  topPatterns: PatternFinding[];
  recentLoops: StuckLoopFinding[];
  recentWasted: WastedWorkFinding[];
  topProjects: { cwd: string; sessions: number; messages: number; lastActivity: number }[];
  diskBreakdown: { name: string; bytes: number }[];
  diskTotal: number;
}

const DAY = 24 * 60 * 60 * 1000;

function loadActive(): SessionRow[] {
  const out: SessionRow[] = [];
  for (const f of listDir(paths.sessions, { ext: ".json" })) {
    const d = readJson<{ pid?: number; cwd?: string; startedAt?: number }>(f.path);
    if (!d) continue;
    if (isProjectIgnored(d.cwd)) continue;
    out.push({
      pid: d.pid ?? 0,
      cwd: d.cwd ?? "(unknown)",
      alive: pidAlive(d.pid ?? 0),
      startedAt: d.startedAt ?? 0,
    });
  }
  return out;
}

function bucketByDay(convs: Conversation[]): { messages: Map<string, number>; sessions: Map<string, number>; tools: Map<string, number> } {
  const messages = new Map<string, number>();
  const sessions = new Map<string, number>();
  const tools = new Map<string, number>();
  for (const conv of convs) {
    if (conv.startedAt) {
      const k = dateKey(conv.startedAt);
      sessions.set(k, (sessions.get(k) ?? 0) + 1);
    }
    for (const e of conv.entries) {
      if (!e.timestamp) continue;
      const k = dateKey(e.timestamp);
      if (e.role) messages.set(k, (messages.get(k) ?? 0) + 1);
      if (e.toolUses) tools.set(k, (tools.get(k) ?? 0) + e.toolUses.length);
    }
  }
  return { messages, sessions, tools };
}

function last30(map: Map<string, number>): number[] {
  const out: number[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(map.get(d.toISOString().slice(0, 10)) ?? 0);
  }
  return out;
}

function buildTopProjects(convs: Conversation[]) {
  // List shown in the UI — filter ignored projects.
  const map = new Map<string, { cwd: string; sessions: number; messages: number; lastActivity: number }>();
  for (const conv of visibleConversations(convs)) {
    let bucket = map.get(conv.realCwd);
    if (!bucket) {
      bucket = { cwd: conv.realCwd, sessions: 0, messages: 0, lastActivity: 0 };
      map.set(conv.realCwd, bucket);
    }
    bucket.sessions++;
    bucket.messages += conv.entries.filter((e) => e.role).length;
    if (conv.endedAt > bucket.lastActivity) bucket.lastActivity = conv.endedAt;
  }
  const list = [...map.values()];
  list.sort((a, b) => b.lastActivity - a.lastActivity);
  return list.slice(0, 10);
}

interface StatsCache {
  totalSessions?: number;
  totalMessages?: number;
  firstSessionDate?: string;
  hourCounts?: number[];
}

function compute(): DashboardData {
  const convs = loadAllConversations();
  // Findings are project-attributable lists displayed in cards — filter.
  const visibleConvs = visibleConversations(convs);
  const stats = readJson<StatsCache>(paths.stats);
  // Aggregates (sparklines, today/all-time totals) include everything.
  const buckets = bucketByDay(convs);
  const today = dateKey(Date.now());
  const top = buildTopProjects(convs);

  const diskBreakdown: { name: string; bytes: number }[] = [];
  let diskTotal = 0;
  for (const t of DISK_TARGETS) {
    if (!existsSync(t.path)) continue;
    const sz = dirSize(t.path);
    diskBreakdown.push({ name: t.name, bytes: sz });
    diskTotal += sz;
  }
  diskBreakdown.sort((a, b) => b.bytes - a.bytes);

  return {
    conversations: convs.length,
    totalMessages: stats?.totalMessages ?? convs.reduce((a, c) => a + c.entries.filter((e) => e.role).length, 0),
    totalSessions: stats?.totalSessions ?? convs.length,
    firstSessionDate: stats?.firstSessionDate,
    todayMessages: buckets.messages.get(today) ?? 0,
    todaySessions: buckets.sessions.get(today) ?? 0,
    todayTools: buckets.tools.get(today) ?? 0,
    active: loadActive(),
    recentMessages: last30(buckets.messages),
    recentSessions: last30(buckets.sessions),
    hourCounts: stats?.hourCounts && stats.hourCounts.length === 24 ? stats.hourCounts : undefined,
    topCorrections: findCorrections(visibleConvs).slice(0, 5),
    topPatterns: findToolPatterns(visibleConvs).slice(0, 5),
    recentLoops: findStuckLoops(visibleConvs).slice(0, 5),
    recentWasted: findWastedWork(visibleConvs).slice(0, 5),
    topProjects: top,
    diskBreakdown,
    diskTotal,
  };
}

function bar(value: number, max: number, width = 20): string {
  if (max <= 0) return "";
  const fill = Math.round((value / max) * width);
  return "█".repeat(Math.max(0, fill)) + "░".repeat(Math.max(0, width - fill));
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <box
      style={{
        flexDirection: "column",
        borderStyle: "rounded",
        border: true,
        borderColor: "#333333",
        padding: 1,
        marginBottom: 1,
      }}
      title={` ${title} `}
    >
      {children}
    </box>
  );
}

function DashboardPanel({ active, sidebarWidth: _sw, onSidebarResize: _r, showHiddenVersion }: PanelProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useScrollControls(active);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        setData(compute());
      } finally {
        setLoading(false);
      }
    }, 16);
  };

  useEffect(() => {
    refresh();
  }, [showHiddenVersion]);

  useKeyboard((k) => {
    if (!active) return;
    if (k.name?.toLowerCase() === "r") refresh();
  });

  if (!data) {
    return (
      <PreviewPane title={loading ? "Dashboard — loading…" : "Dashboard"} ref={scrollRef}>
        <text fg="#FFAA00">Scanning conversation logs…</text>
      </PreviewPane>
    );
  }

  const aliveActive = data.active.filter((a) => a.alive);
  const maxRecent = Math.max(1, ...data.recentMessages, ...data.recentSessions);
  const maxDisk = Math.max(1, ...data.diskBreakdown.map((d) => d.bytes));

  return (
    <PreviewPane title={loading ? "Dashboard — refreshing…" : "Dashboard"} ref={scrollRef}>
      <box style={{ flexDirection: "column" }}>
        {/* Hero row: today + active sessions */}
        <box style={{ flexDirection: "row", gap: 1 }}>
          <box style={{ flexGrow: 1 }}>
            <Card title="Today">
              <text>
                <span fg="#888888">  sessions  </span>
                <span fg="#FFFFFF">{String(data.todaySessions)}</span>
              </text>
              <text>
                <span fg="#888888">  messages  </span>
                <span fg="#FFFFFF">{String(data.todayMessages)}</span>
              </text>
              <text>
                <span fg="#888888">  tool calls</span>
                <span fg="#FFFFFF">{`  ${data.todayTools}`}</span>
              </text>
            </Card>
          </box>
          <box style={{ flexGrow: 1 }}>
            <Card title={`Active sessions (${aliveActive.length}/${data.active.length})`}>
              {aliveActive.length === 0 ? (
                <text fg="#666666">  no live Claude Code processes</text>
              ) : (
                aliveActive.slice(0, 5).map((s) => (
                  <text key={s.pid}>
                    <span fg="#88FFAA">  ● </span>
                    <span fg="#FFFFFF">{truncate(homePath(s.cwd), 40)}</span>
                    <span fg="#666666">{`  pid ${s.pid}`}</span>
                  </text>
                ))
              )}
              {aliveActive.length > 5 ? (
                <text fg="#666666">{`  … +${aliveActive.length - 5} more`}</text>
              ) : null}
            </Card>
          </box>
          <box style={{ flexGrow: 1 }}>
            <Card title="All time">
              <text>
                <span fg="#888888">  sessions  </span>
                <span fg="#FFFFFF">{data.totalSessions.toLocaleString()}</span>
              </text>
              <text>
                <span fg="#888888">  messages  </span>
                <span fg="#FFFFFF">{data.totalMessages.toLocaleString()}</span>
              </text>
              <text>
                <span fg="#888888">  first     </span>
                <span fg="#FFFFFF">{data.firstSessionDate ?? "—"}</span>
              </text>
            </Card>
          </box>
        </box>

        <Card title="Last 30 days">
          <text>
            <span fg="#888888">  messages  </span>
            <span fg="#00FFAA">{sparkline(data.recentMessages)}</span>
            <span fg="#FFFFFF">{`  ${data.recentMessages.reduce((a, b) => a + b, 0).toLocaleString()}`}</span>
          </text>
          <text>
            <span fg="#888888">  sessions  </span>
            <span fg="#00AAFF">{sparkline(data.recentSessions)}</span>
            <span fg="#FFFFFF">{`  ${data.recentSessions.reduce((a, b) => a + b, 0).toLocaleString()}`}</span>
          </text>
        </Card>

        {data.hourCounts ? (
          <Card title="Hour-of-day distribution (all time)">
            <text>
              <span fg="#888888">  </span>
              <span fg="#AA88FF">{sparkline(data.hourCounts)}</span>
            </text>
            <text fg="#666666">  0h                                          23h</text>
          </Card>
        ) : null}

        <box style={{ flexDirection: "row", gap: 1 }}>
          <box style={{ flexGrow: 1 }}>
            <Card title={`Top corrections (${data.topCorrections.reduce((a, g) => a + g.count, 0)} total)`}>
              {data.topCorrections.length === 0 ? (
                <text fg="#666666">  none detected</text>
              ) : (
                data.topCorrections.map((g) => (
                  <text key={g.marker}>
                    <span fg="#FFAA00">  ×{String(g.count).padStart(3, " ")}  </span>
                    <span fg="#FFFFFF">{g.marker}</span>
                  </text>
                ))
              )}
            </Card>
          </box>
          <box style={{ flexGrow: 1 }}>
            <Card title="Top tool patterns">
              {data.topPatterns.length === 0 ? (
                <text fg="#666666">  none detected</text>
              ) : (
                data.topPatterns.map((p, i) => (
                  <text key={i}>
                    <span fg="#FFAA00">  ×{String(p.occurrences).padStart(3, " ")}  </span>
                    <span fg="#FFFFFF">{truncate(p.sequence.join(" → "), 60)}</span>
                  </text>
                ))
              )}
            </Card>
          </box>
        </box>

        <Card title="Recent stuck loops">
          {data.recentLoops.length === 0 ? (
            <text fg="#666666">  none detected — clean!</text>
          ) : (
            data.recentLoops.map((l, i) => (
              <text key={i}>
                <span fg="#FF6666">  ▸ </span>
                <span fg="#888888">{l.kind.padEnd(14, " ")}</span>
                <span fg="#FFFFFF">{truncate(l.signal, 60)}</span>
                <span fg="#666666">{`  ${relTime(l.timestamp)}`}</span>
              </text>
            ))
          )}
        </Card>

        {data.recentWasted.length > 0 ? (
          <Card title="Recent wasted edits">
            {data.recentWasted.map((w, i) => (
              <text key={i}>
                <span fg="#FFAA00">  ×{String(w.edits).padStart(2, " ")}  </span>
                <span fg="#888888">{w.reason.padEnd(14, " ")}</span>
                <span fg="#FFFFFF">{homePath(w.filePath)}</span>
                <span fg="#666666">{`  ${relTime(w.timestamp)}`}</span>
              </text>
            ))}
          </Card>
        ) : null}

        <Card title="Top projects (by recent activity)">
          {data.topProjects.length === 0 ? (
            <text fg="#666666">  no projects</text>
          ) : (
            data.topProjects.map((p) => (
              <text key={p.cwd}>
                <span fg="#FFFFFF">  {truncate(homePath(p.cwd), 50).padEnd(52, " ")}</span>
                <span fg="#888888">{`${String(p.sessions).padStart(3, " ")}s  `}</span>
                <span fg="#888888">{`${String(p.messages).padStart(5, " ")}m  `}</span>
                <span fg="#666666">{relTime(p.lastActivity)}</span>
              </text>
            ))
          )}
        </Card>

        <Card title={`Disk usage (${bytes(data.diskTotal)})`}>
          {data.diskBreakdown.map((d) => (
            <text key={d.name}>
              <span fg="#FFFFFF">  {d.name.padEnd(20, " ")}</span>
              <span fg="#00AAFF">{bar(d.bytes, maxDisk, 20)}</span>
              <span fg="#FFFFFF">{`  ${bytes(d.bytes)}`}</span>
            </text>
          ))}
        </Card>

        <text fg="#555555">  press r to refresh · all data sourced from ~/.claude/</text>
      </box>
    </PreviewPane>
  );
}

export const DashboardDef: PanelDef = {
  name: "Dashboard",
  bindings: [["r", "refresh"]],
  Component: DashboardPanel,
};
