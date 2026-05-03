import React, { useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { loadAllConversations, type Conversation } from "../lib/conversations.js";
import { isProjectIgnored } from "../lib/config.js";
import { useScrollControls } from "../lib/use-scroll.js";
import { dateKey, homePath, sparkline } from "../lib/format.js";
import type { PanelDef, PanelProps } from "./types.js";

interface DayDigest {
  date: string; // YYYY-MM-DD
  sessions: number;
  projects: Map<string, number>; // project cwd -> session count
  toolUses: Map<string, number>;
  totalMessages: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  topFiles: Map<string, number>; // edited paths -> edit count
}

function buildDigests(convs: Conversation[]): DayDigest[] {
  const days = new Map<string, DayDigest>();

  function get(d: string): DayDigest {
    let day = days.get(d);
    if (!day) {
      day = {
        date: d,
        sessions: 0,
        projects: new Map(),
        toolUses: new Map(),
        totalMessages: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        topFiles: new Map(),
      };
      days.set(d, day);
    }
    return day;
  }

  for (const conv of convs) {
    if (!conv.startedAt) continue;
    const sessionDate = dateKey(conv.startedAt);
    const sessionDay = get(sessionDate);
    sessionDay.sessions++;
    sessionDay.projects.set(conv.realCwd, (sessionDay.projects.get(conv.realCwd) ?? 0) + 1);

    for (const e of conv.entries) {
      if (!e.timestamp) continue;
      const day = get(dateKey(e.timestamp));
      if (e.role) day.totalMessages++;
      if (e.inputTokens) day.inputTokens += e.inputTokens;
      if (e.outputTokens) day.outputTokens += e.outputTokens;
      if (e.cacheReadTokens) day.cacheReadTokens += e.cacheReadTokens;
      if (e.toolUses) {
        for (const t of e.toolUses) {
          day.toolUses.set(t.name, (day.toolUses.get(t.name) ?? 0) + 1);
          if (t.name === "Edit" || t.name === "Write") {
            const path = String((t.input as any).file_path ?? "");
            if (path) day.topFiles.set(path, (day.topFiles.get(path) ?? 0) + 1);
          }
        }
      }
    }
  }

  const out = [...days.values()];
  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out;
}

function topN<T>(map: Map<T, number>, n: number): [T, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function DigestPanel({ active, sidebarWidth, onSidebarResize, showHiddenVersion }: PanelProps) {
  const [days, setDays] = useState<DayDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        setDays(buildDigests(loadAllConversations()));
      } finally {
        setLoading(false);
      }
    }, 16);
  }, [showHiddenVersion]);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(days.length - 1, s + 1));
  });

  const cur = days[Math.min(sel, days.length - 1)];
  const scrollRef = useScrollControls(active, cur?.date);

  const last30 = useMemo(() => days.slice(0, 30).reverse(), [days]);
  const sessionsSpark = sparkline(last30.map((d) => d.sessions));
  const messagesSpark = sparkline(last30.map((d) => d.totalMessages));

  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title={loading ? "Building digest…" : "Days"}
          width={sidebarWidth}
          items={days.map((d) => ({
            key: d.date,
            primary: d.date,
            secondary: `${d.sessions}s ${d.totalMessages}m`,
          }))}
          selected={sel}
          onSelect={setSel}
          emptyMessage={loading ? "(scanning)" : "(no conversation data)"}
        />
      }
      preview={
        <PreviewPane title={cur ? `Digest — ${cur.date}` : "Digest"} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">{loading ? "Scanning conversation logs…" : "No data"}</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#FFAA00">Last 30 days</text>
              <text>
                <span fg="#888888">  sessions  </span>
                <span fg="#00AAFF">{sessionsSpark}</span>
              </text>
              <text>
                <span fg="#888888">  messages  </span>
                <span fg="#00FFAA">{messagesSpark}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">{cur.date}</text>
              <text>
                <span fg="#888888">  sessions      </span>
                <span fg="#FFFFFF">{String(cur.sessions)}</span>
              </text>
              <text>
                <span fg="#888888">  messages      </span>
                <span fg="#FFFFFF">{String(cur.totalMessages)}</span>
              </text>
              <text>
                <span fg="#888888">  input tokens  </span>
                <span fg="#FFFFFF">{cur.inputTokens.toLocaleString()}</span>
              </text>
              <text>
                <span fg="#888888">  output tokens </span>
                <span fg="#FFFFFF">{cur.outputTokens.toLocaleString()}</span>
              </text>
              <text>
                <span fg="#888888">  cache reads   </span>
                <span fg="#FFFFFF">{cur.cacheReadTokens.toLocaleString()}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">Projects worked on</text>
              {topN(cur.projects, 10).map(([p, n]) => {
                const hidden = isProjectIgnored(p);
                return (
                  <text key={p}>
                    <span fg="#888888">  ×{String(n).padStart(2, " ")}  </span>
                    <span fg={hidden ? "#666666" : "#FFFFFF"}>{hidden ? "[REDACTED]" : homePath(p)}</span>
                  </text>
                );
              })}

              <text> </text>
              <text fg="#FFAA00">Tool usage</text>
              {topN(cur.toolUses, 10).map(([t, n]) => (
                <text key={t}>
                  <span fg="#888888">  ×{String(n).padStart(4, " ")}  </span>
                  <span fg="#FFFFFF">{t}</span>
                </text>
              ))}

              <text> </text>
              <text fg="#FFAA00">Most-edited files</text>
              {topN(cur.topFiles, 8).map(([f, n]) => {
                const hidden = isProjectIgnored(f);
                return (
                  <text key={f}>
                    <span fg="#888888">  ×{String(n).padStart(2, " ")}  </span>
                    <span fg={hidden ? "#666666" : "#FFFFFF"}>{hidden ? "[REDACTED]" : homePath(f)}</span>
                  </text>
                );
              })}
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

export const DigestDef: PanelDef = {
  name: "Digest",
  bindings: [["↑↓/jk", "day"]],
  Component: DigestPanel,
};
