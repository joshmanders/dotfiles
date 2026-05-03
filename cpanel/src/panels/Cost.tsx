import React, { useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { loadAllConversations, type Conversation } from "../lib/conversations.js";
import { isProjectIgnored } from "../lib/config.js";
import { costOf, formatUSD, rateFor } from "../lib/pricing.js";
import { useScrollControls } from "../lib/use-scroll.js";
import { dateKey, dateStr, homePath, relTime, sparkline, truncate } from "../lib/format.js";
import type { PanelDef, PanelProps } from "./types.js";

interface DayBucket {
  date: string;
  cost: number;
  sessions: Set<string>;
  projects: Set<string>;
  byModel: Map<string, number>;
}

interface ProjectBucket {
  cwd: string;
  cost: number;
  sessions: number;
  messages: number;
  lastActivity: number;
  byModel: Map<string, number>;
}

interface SessionBucket {
  conv: Conversation;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreateTokens: number;
  byModel: Map<string, number>;
}

interface CostData {
  total: number;
  days: DayBucket[];
  projects: ProjectBucket[];
  sessions: SessionBucket[];
  thisWeek: number;
  lastWeek: number;
  unknownModels: Set<string>;
}

function startOfWeekMs(d: Date): number {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  // Treat Monday as week start
  const day = dt.getDay() || 7;
  if (day !== 1) dt.setDate(dt.getDate() - (day - 1));
  return dt.getTime();
}

function compute(): CostData {
  const convs = loadAllConversations();
  const days = new Map<string, DayBucket>();
  const projects = new Map<string, ProjectBucket>();
  let sessions: SessionBucket[] = [];
  const unknownModels = new Set<string>();
  let total = 0;

  for (const conv of convs) {
    const sb: SessionBucket = {
      conv,
      cost: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreateTokens: 0,
      byModel: new Map(),
    };
    let pb = projects.get(conv.realCwd);
    if (!pb) {
      pb = { cwd: conv.realCwd, cost: 0, sessions: 0, messages: 0, lastActivity: 0, byModel: new Map() };
      projects.set(conv.realCwd, pb);
    }
    pb.sessions++;

    for (const e of conv.entries) {
      const c = costOf(e);
      if (e.model && !rateFor(e.model)) unknownModels.add(e.model);

      sb.cost += c;
      sb.inputTokens += e.inputTokens ?? 0;
      sb.outputTokens += e.outputTokens ?? 0;
      sb.cacheReadTokens += e.cacheReadTokens ?? 0;
      sb.cacheCreateTokens += e.cacheCreateTokens ?? 0;
      if (e.model) sb.byModel.set(e.model, (sb.byModel.get(e.model) ?? 0) + c);

      pb.cost += c;
      if (e.role) pb.messages++;
      if (e.timestamp > pb.lastActivity) pb.lastActivity = e.timestamp;
      if (e.model) pb.byModel.set(e.model, (pb.byModel.get(e.model) ?? 0) + c);

      if (e.timestamp) {
        const k = dateKey(e.timestamp);
        let db = days.get(k);
        if (!db) {
          db = { date: k, cost: 0, sessions: new Set(), projects: new Set(), byModel: new Map() };
          days.set(k, db);
        }
        db.cost += c;
        db.sessions.add(conv.sessionId);
        db.projects.add(conv.realCwd);
        if (e.model) db.byModel.set(e.model, (db.byModel.get(e.model) ?? 0) + c);
      }

      total += c;
    }
    sessions.push(sb);
  }

  // Days view shows per-day totals — keep ignored cost in the daily roll-up.
  const dayList = [...days.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  // Project + session sub-tabs are lists displayed in the UI — filter ignored.
  const projectList = [...projects.values()]
    .filter((p) => !isProjectIgnored(p.cwd))
    .sort((a, b) => b.cost - a.cost);
  sessions = sessions.filter((s) => !isProjectIgnored(s.conv.realCwd));
  sessions.sort((a, b) => b.cost - a.cost);

  // This week vs last week
  const now = new Date();
  const thisWeekStart = startOfWeekMs(now);
  const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1000;
  let thisWeek = 0;
  let lastWeek = 0;
  for (const d of dayList) {
    const t = Date.parse(d.date);
    if (Number.isNaN(t)) continue;
    if (t >= thisWeekStart) thisWeek += d.cost;
    else if (t >= lastWeekStart) lastWeek += d.cost;
  }

  return { total, days: dayList, projects: projectList, sessions, thisWeek, lastWeek, unknownModels };
}

const SUB_TABS = ["Days", "Projects", "Sessions"] as const;

function CostPanel({ active, sidebarWidth, onSidebarResize, showHiddenVersion }: PanelProps) {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0 });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        setData(compute());
      } finally {
        setLoading(false);
      }
    }, 16);
  }, [showHiddenVersion]);

  const currentList: unknown[] = data
    ? tab === 0
      ? data.days
      : tab === 1
      ? data.projects
      : data.sessions
    : [];

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "left" || n === "h") setTab((t) => (t - 1 + SUB_TABS.length) % SUB_TABS.length);
    else if (n === "right" || n === "l") setTab((t) => (t + 1) % SUB_TABS.length);
    else if (n === "up" || n === "k") setSel((s) => ({ ...s, [tab]: Math.max(0, (s[tab] ?? 0) - 1) }));
    else if (n === "down" || n === "j") setSel((s) => ({ ...s, [tab]: Math.min(currentList.length - 1, (s[tab] ?? 0) + 1) }));
  });

  const setSelFor = (t: number) => (i: number) => setSel((s) => ({ ...s, [t]: i }));

  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <SubTabBar tabs={SUB_TABS} active={tab} onSelect={setTab} />
      {!data ? (
        <box style={{ flexGrow: 1, padding: 2 }}>
          <text fg="#FFAA00">{loading ? "Computing costs…" : "No data."}</text>
        </box>
      ) : tab === 0 ? (
        <DaysView
          data={data}
          selected={sel[0] ?? 0}
          onSelect={setSelFor(0)}
          active={active}
          sidebarWidth={sidebarWidth}
          onSidebarResize={onSidebarResize}
        />
      ) : tab === 1 ? (
        <ProjectsView
          data={data}
          selected={sel[1] ?? 0}
          onSelect={setSelFor(1)}
          active={active}
          sidebarWidth={sidebarWidth}
          onSidebarResize={onSidebarResize}
        />
      ) : (
        <SessionsView
          data={data}
          selected={sel[2] ?? 0}
          onSelect={setSelFor(2)}
          active={active}
          sidebarWidth={sidebarWidth}
          onSidebarResize={onSidebarResize}
        />
      )}
      <Footer data={data} />
    </box>
  );
}

function SubTabBar({ tabs, active, onSelect }: { tabs: readonly string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1, paddingRight: 1, backgroundColor: "#1a1a1a", gap: 1 }}>
      {tabs.map((t, i) => (
        <box key={t} onMouseDown={() => onSelect(i)}>
          <text fg={i === active ? "#000000" : "#888888"} bg={i === active ? "#FFAA00" : undefined}>
            {` ${t} `}
          </text>
        </box>
      ))}
    </box>
  );
}

function Footer({ data }: { data: CostData | null }) {
  if (!data) return null;
  const delta = data.thisWeek - data.lastWeek;
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  const deltaColor = delta > 0 ? "#FF6666" : "#88FFAA";
  return (
    <box style={{ height: 1, paddingLeft: 1, paddingRight: 1 }}>
      <text>
        <span fg="#888888">total </span>
        <span fg="#FFFFFF">{formatUSD(data.total)}</span>
        <span fg="#888888">  ·  this week </span>
        <span fg="#FFFFFF">{formatUSD(data.thisWeek)}</span>
        <span fg="#888888"> vs last week </span>
        <span fg="#FFFFFF">{formatUSD(data.lastWeek)}</span>
        <span fg={deltaColor}>{`  ${arrow} ${formatUSD(Math.abs(delta))}`}</span>
        {data.unknownModels.size > 0 ? (
          <span fg="#666666">{`  ·  ${data.unknownModels.size} unpriced model(s)`}</span>
        ) : null}
      </text>
    </box>
  );
}

interface SubViewProps {
  data: CostData;
  selected: number;
  onSelect: (i: number) => void;
  active: boolean;
  sidebarWidth: number;
  onSidebarResize: (x: number) => void;
}

function DaysView({ data, selected, onSelect, active, sidebarWidth, onSidebarResize }: SubViewProps) {
  const cur = data.days[Math.min(selected, data.days.length - 1)];
  const scrollRef = useScrollControls(active, cur?.date);
  const last30 = useMemo(() => data.days.slice(0, 30).reverse(), [data]);
  const spark = sparkline(last30.map((d) => d.cost));

  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Days"
          width={sidebarWidth}
          items={data.days.map((d) => ({ key: d.date, primary: d.date, secondary: formatUSD(d.cost) }))}
          selected={selected}
          onSelect={onSelect}
          emptyMessage="(no cost data)"
        />
      }
      preview={
        <PreviewPane title={cur?.date} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">Select a day.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#FFAA00">Last 30 days</text>
              <text>
                <span fg="#888888">  </span>
                <span fg="#00FFAA">{spark}</span>
                <span fg="#FFFFFF">{`   total ${formatUSD(last30.reduce((a, b) => a + b.cost, 0))}`}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">{cur.date}</text>
              <text>
                <span fg="#888888">  cost      </span>
                <span fg="#FFFFFF">{formatUSD(cur.cost)}</span>
              </text>
              <text>
                <span fg="#888888">  sessions  </span>
                <span fg="#FFFFFF">{String(cur.sessions.size)}</span>
              </text>
              <text>
                <span fg="#888888">  projects  </span>
                <span fg="#FFFFFF">{String(cur.projects.size)}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">By model</text>
              {[...cur.byModel.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([m, c]) => (
                  <text key={m}>
                    <span fg="#888888">  {m.padEnd(28, " ")}</span>
                    <span fg="#FFFFFF">{formatUSD(c)}</span>
                  </text>
                ))}
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

function ProjectsView({ data, selected, onSelect, active, sidebarWidth, onSidebarResize }: SubViewProps) {
  const cur = data.projects[Math.min(selected, data.projects.length - 1)];
  const scrollRef = useScrollControls(active, cur?.cwd);
  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Projects (by cost)"
          width={sidebarWidth}
          items={data.projects.map((p) => ({
            key: p.cwd,
            primary: homePath(p.cwd),
            secondary: formatUSD(p.cost),
          }))}
          selected={selected}
          onSelect={onSelect}
          emptyMessage="(no projects)"
        />
      }
      preview={
        <PreviewPane title={homePath(cur?.cwd) || undefined} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">Select a project.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text>
                <span fg="#888888">cwd          </span>
                <span fg="#FFFFFF">{homePath(cur.cwd)}</span>
              </text>
              <text>
                <span fg="#888888">total cost   </span>
                <span fg="#FFFFFF">{formatUSD(cur.cost)}</span>
              </text>
              <text>
                <span fg="#888888">sessions     </span>
                <span fg="#FFFFFF">{String(cur.sessions)}</span>
              </text>
              <text>
                <span fg="#888888">messages     </span>
                <span fg="#FFFFFF">{String(cur.messages)}</span>
              </text>
              <text>
                <span fg="#888888">last activity</span>
                <span fg="#FFFFFF">{`  ${relTime(cur.lastActivity)}`}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">By model</text>
              {[...cur.byModel.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([m, c]) => (
                  <text key={m}>
                    <span fg="#888888">  {m.padEnd(28, " ")}</span>
                    <span fg="#FFFFFF">{formatUSD(c)}</span>
                  </text>
                ))}
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

function SessionsView({ data, selected, onSelect, active, sidebarWidth, onSidebarResize }: SubViewProps) {
  const cur = data.sessions[Math.min(selected, data.sessions.length - 1)];
  const scrollRef = useScrollControls(active, cur?.conv.sessionId);
  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Sessions (most expensive first)"
          width={sidebarWidth}
          items={data.sessions.map((s) => ({
            key: s.conv.sessionId,
            primary: s.conv.title || homePath(s.conv.realCwd),
            secondary: formatUSD(s.cost),
          }))}
          selected={selected}
          onSelect={onSelect}
          emptyMessage="(no sessions)"
        />
      }
      preview={
        <PreviewPane title={cur?.conv.title || cur?.conv.sessionId} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">Select a session.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text>
                <span fg="#888888">project       </span>
                <span fg="#FFFFFF">{homePath(cur.conv.realCwd)}</span>
              </text>
              <text>
                <span fg="#888888">session       </span>
                <span fg="#FFFFFF">{cur.conv.sessionId}</span>
              </text>
              <text>
                <span fg="#888888">started       </span>
                <span fg="#FFFFFF">{cur.conv.startedAt ? dateStr(cur.conv.startedAt) : "—"}</span>
              </text>
              <text>
                <span fg="#888888">ended         </span>
                <span fg="#FFFFFF">{cur.conv.endedAt ? dateStr(cur.conv.endedAt) : "—"}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">Cost</text>
              <text>
                <span fg="#888888">  total       </span>
                <span fg="#FFFFFF">{formatUSD(cur.cost)}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">Tokens</text>
              <text>
                <span fg="#888888">  input       </span>
                <span fg="#FFFFFF">{cur.inputTokens.toLocaleString()}</span>
              </text>
              <text>
                <span fg="#888888">  output      </span>
                <span fg="#FFFFFF">{cur.outputTokens.toLocaleString()}</span>
              </text>
              <text>
                <span fg="#888888">  cache reads </span>
                <span fg="#FFFFFF">{cur.cacheReadTokens.toLocaleString()}</span>
              </text>
              <text>
                <span fg="#888888">  cache writes</span>
                <span fg="#FFFFFF">{cur.cacheCreateTokens.toLocaleString()}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">By model</text>
              {[...cur.byModel.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([m, c]) => (
                  <text key={m}>
                    <span fg="#888888">  {m.padEnd(28, " ")}</span>
                    <span fg="#FFFFFF">{formatUSD(c)}</span>
                  </text>
                ))}
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

export const CostDef: PanelDef = {
  name: "Cost",
  bindings: [
    ["←→/hl", "sub-tab"],
    ["↑↓/jk", "navigate"],
  ],
  Component: CostPanel,
};
