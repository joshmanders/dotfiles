import React, { useEffect, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { loadAllConversations, clearConversationCache, visibleConversations, type Conversation } from "../lib/conversations.js";
import {
  findCorrections,
  findToolPatterns,
  findStuckLoops,
  findWastedWork,
  type CorrectionGroup,
  type PatternFinding,
  type StuckLoopFinding,
  type WastedWorkFinding,
} from "../lib/insights/index.js";
import { useScrollControls } from "../lib/use-scroll.js";
import { dateStr, homePath, relTime, truncate } from "../lib/format.js";
import { scaffoldFeedback, scaffoldSkill, writeScaffold } from "../lib/scaffolds.js";
import type { PanelDef, PanelProps } from "./types.js";

interface InsightsData {
  conversations: number;
  corrections: CorrectionGroup[];
  patterns: PatternFinding[];
  stuckLoops: StuckLoopFinding[];
  wastedWork: WastedWorkFinding[];
}

const SUB_TABS = ["Corrections", "Patterns", "Stuck Loops", "Wasted Work"] as const;

function compute(convs: Conversation[]): InsightsData {
  // Insights are project-attributable findings — filter ignored projects
  // out of the input so we don't surface them as actionable signals.
  const visible = visibleConversations(convs);
  return {
    conversations: visible.length,
    corrections: findCorrections(visible),
    patterns: findToolPatterns(visible),
    stuckLoops: findStuckLoops(visible),
    wastedWork: findWastedWork(visible),
  };
}

function InsightsPanel({ active, requestConfirm, sidebarWidth, onSidebarResize, showHiddenVersion }: PanelProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState(0);
  const [sel, setSel] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 });
  const [notice, setNotice] = useState<string | null>(null);

  const load = (force: boolean) => {
    setLoading(true);
    // Defer the heavy work so the loading state actually renders first.
    setTimeout(() => {
      try {
        if (force) clearConversationCache();
        const convs = loadAllConversations({ force });
        setData(compute(convs));
      } finally {
        setLoading(false);
      }
    }, 16);
  };

  useEffect(() => {
    load(false);
  }, [showHiddenVersion]);

  const currentList: unknown[] = data
    ? subTab === 0
      ? data.corrections
      : subTab === 1
      ? data.patterns
      : subTab === 2
      ? data.stuckLoops
      : data.wastedWork
    : [];

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "left" || n === "h") setSubTab((t) => (t - 1 + SUB_TABS.length) % SUB_TABS.length);
    else if (n === "right" || n === "l") setSubTab((t) => (t + 1) % SUB_TABS.length);
    else if (n === "up" || n === "k") setSel((s) => ({ ...s, [subTab]: Math.max(0, (s[subTab] ?? 0) - 1) }));
    else if (n === "down" || n === "j") setSel((s) => ({ ...s, [subTab]: Math.min(currentList.length - 1, (s[subTab] ?? 0) + 1) }));
    else if (n === "r") load(true);
    else if (n === "s" && data) {
      if (subTab === 0) {
        const group = data.corrections[sel[0] ?? 0];
        if (!group) return;
        const sc = scaffoldFeedback(group);
        requestConfirm(
          sc.exists ? `Overwrite ${sc.path}?` : `Write feedback rule to ${sc.path}?`,
          `${group.count} occurrences of "${group.marker}". File will need editing — placeholders inside.`,
          () => {
            writeScaffold(sc);
            setNotice(`Wrote ${sc.path}`);
            setTimeout(() => setNotice(null), 4000);
          },
        );
      } else if (subTab === 1) {
        const pattern = data.patterns[sel[1] ?? 0];
        if (!pattern) return;
        const sc = scaffoldSkill(pattern);
        requestConfirm(
          sc.exists ? `Overwrite ${sc.path}?` : `Scaffold skill at ${sc.path}?`,
          `${pattern.occurrences}× across ${pattern.sessions} sessions. Edit the SKILL.md to fill in description / workflow.`,
          () => {
            writeScaffold(sc);
            setNotice(`Wrote ${sc.path}`);
            setTimeout(() => setNotice(null), 4000);
          },
        );
      }
    }
  });

  const setSelFor = (tab: number) => (i: number) => setSel((s) => ({ ...s, [tab]: i }));

  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <SubTabBar tabs={SUB_TABS} active={subTab} onSelect={setSubTab} />
      {loading && !data ? (
        <LoadingView />
      ) : !data ? (
        <NoData />
      ) : subTab === 0 ? (
        <CorrectionsView
          groups={data.corrections}
          selected={sel[0] ?? 0}
          onSelect={setSelFor(0)}
          active={active}
          sidebarWidth={sidebarWidth}
          onSidebarResize={onSidebarResize}
        />
      ) : subTab === 1 ? (
        <PatternsView
          patterns={data.patterns}
          selected={sel[1] ?? 0}
          onSelect={setSelFor(1)}
          active={active}
          sidebarWidth={sidebarWidth}
          onSidebarResize={onSidebarResize}
        />
      ) : subTab === 2 ? (
        <StuckLoopsView
          loops={data.stuckLoops}
          selected={sel[2] ?? 0}
          onSelect={setSelFor(2)}
          active={active}
          sidebarWidth={sidebarWidth}
          onSidebarResize={onSidebarResize}
        />
      ) : (
        <WastedWorkView
          items={data.wastedWork}
          selected={sel[3] ?? 0}
          onSelect={setSelFor(3)}
          active={active}
          sidebarWidth={sidebarWidth}
          onSidebarResize={onSidebarResize}
        />
      )}
      <Footer data={data} loading={loading} notice={notice} />
    </box>
  );
}

function SubTabBar({ tabs, active, onSelect }: { tabs: readonly string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <box
      style={{
        flexDirection: "row",
        height: 1,
        paddingLeft: 1,
        paddingRight: 1,
        backgroundColor: "#1a1a1a",
        gap: 1,
      }}
    >
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

function Footer({ data, loading, notice }: { data: InsightsData | null; loading: boolean; notice: string | null }) {
  if (notice) {
    return (
      <box style={{ height: 1, paddingLeft: 1, paddingRight: 1 }}>
        <text fg="#88FFAA">{notice}</text>
      </box>
    );
  }
  return (
    <box style={{ height: 1, paddingLeft: 1, paddingRight: 1 }}>
      <text fg="#555555">
        {loading
          ? data
            ? `${data.conversations} conversations · refreshing…`
            : "scanning conversation logs…"
          : data
          ? `${data.conversations} conversations · ${data.corrections.reduce((a, g) => a + g.count, 0)} corrections · ${data.patterns.length} patterns · ${data.stuckLoops.length} stuck loops · ${data.wastedWork.length} wasted edits · press r to refresh, s to scaffold`
          : "no data"}
      </text>
    </box>
  );
}

function LoadingView() {
  return (
    <box style={{ flexGrow: 1, padding: 2 }}>
      <text fg="#FFAA00">Scanning conversation logs…</text>
      <text fg="#666666">First scan parses every JSONL in ~/.claude/projects/. Cached after.</text>
    </box>
  );
}

function NoData() {
  return (
    <box style={{ flexGrow: 1, padding: 2 }}>
      <text fg="#666666">No conversations found.</text>
    </box>
  );
}

interface SubViewProps {
  selected: number;
  onSelect: (i: number) => void;
  active: boolean;
  sidebarWidth: number;
  onSidebarResize: (x: number) => void;
}

function CorrectionsView({ groups, selected, onSelect, active, sidebarWidth, onSidebarResize }: { groups: CorrectionGroup[] } & SubViewProps) {
  const cur = groups[Math.min(selected, groups.length - 1)];
  const scrollRef = useScrollControls(active, cur?.marker);
  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Corrections"
          width={sidebarWidth}
          items={groups.map((g) => ({ key: g.marker, primary: g.marker, secondary: `×${g.count}` }))}
          selected={selected}
          onSelect={onSelect}
          emptyMessage="(no corrections found)"
        />
      }
      preview={
        <PreviewPane title={cur ? `${cur.marker} (${cur.count})` : undefined} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">No corrections detected — congratulations.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#888888">Most recent {Math.min(20, cur.findings.length)} occurrences (newest first):</text>
              {cur.findings.slice(0, 20).map((f, i) => (
                <box key={i} style={{ flexDirection: "column", gap: 0 }}>
                  <text>
                    <span fg="#FFAA00">▸ </span>
                    <span fg="#cccccc">{relTime(f.timestamp)}</span>
                    <span fg="#666666">{`  ${homePath(f.projectCwd)}`}</span>
                  </text>
                  {f.precedingAssistant ? (
                    <text>
                      <span fg="#888888">  claude: </span>
                      <span fg="#999999">{truncate(f.precedingAssistant, 200)}</span>
                    </text>
                  ) : null}
                  <text>
                    <span fg="#FFAA00">  you: </span>
                    <span fg="#FFFFFF">{truncate(f.userText, 240)}</span>
                  </text>
                  <text> </text>
                </box>
              ))}
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

function PatternsView({ patterns, selected, onSelect, active, sidebarWidth, onSidebarResize }: { patterns: PatternFinding[] } & SubViewProps) {
  const cur = patterns[Math.min(selected, patterns.length - 1)];
  const scrollRef = useScrollControls(active, cur?.sequence.join("|"));
  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Tool patterns"
          width={sidebarWidth}
          items={patterns.map((p, i) => ({
            key: `${i}`,
            primary: p.sequence.join(" → "),
            secondary: `×${p.occurrences}/${p.sessions}s`,
          }))}
          selected={selected}
          onSelect={onSelect}
          emptyMessage="(no recurring patterns found)"
        />
      }
      preview={
        <PreviewPane title={cur ? `${cur.sequence.length}-step pattern` : undefined} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">Select a pattern.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text fg="#FFAA00">Sequence</text>
              {cur.sequence.map((s, i) => (
                <text key={i}>
                  <span fg="#666666">{`  ${i + 1}. `}</span>
                  <span fg="#FFFFFF">{s}</span>
                </text>
              ))}
              <text> </text>
              <text>
                <span fg="#888888">occurrences  </span>
                <span fg="#FFFFFF">{String(cur.occurrences)}</span>
              </text>
              <text>
                <span fg="#888888">sessions     </span>
                <span fg="#FFFFFF">{String(cur.sessions)}</span>
              </text>
              <text> </text>
              <text fg="#FFAA00">Recent examples</text>
              {cur.examples.map((ex, i) => (
                <text key={i}>
                  <span fg="#666666">  · </span>
                  <span fg="#cccccc">{relTime(ex.timestamp)}</span>
                  <span fg="#666666">{`  ${homePath(ex.projectCwd)}`}</span>
                </text>
              ))}
              <text> </text>
              <text fg="#666666">Hint: high-occurrence cross-session patterns are good candidates for a skill or bin script.</text>
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

function StuckLoopsView({ loops, selected, onSelect, active, sidebarWidth, onSidebarResize }: { loops: StuckLoopFinding[] } & SubViewProps) {
  const cur = loops[Math.min(selected, loops.length - 1)];
  const scrollRef = useScrollControls(active, cur?.timestamp);
  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Stuck loops"
          width={sidebarWidth}
          items={loops.map((l, i) => ({
            key: `${i}`,
            primary: l.signal,
            secondary: relTime(l.timestamp),
          }))}
          selected={selected}
          onSelect={onSelect}
          emptyMessage="(no stuck loops detected)"
        />
      }
      preview={
        <PreviewPane title={cur?.kind} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">Select a stuck-loop signal.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text>
                <span fg="#888888">kind     </span>
                <span fg="#FFFFFF">{cur.kind}</span>
              </text>
              <text>
                <span fg="#888888">when     </span>
                <span fg="#FFFFFF">{dateStr(cur.timestamp)}</span>
              </text>
              <text>
                <span fg="#888888">project  </span>
                <span fg="#FFFFFF">{homePath(cur.projectCwd)}</span>
              </text>
              <text>
                <span fg="#888888">session  </span>
                <span fg="#FFFFFF">{cur.sessionId}</span>
              </text>
              <text>
                <span fg="#888888">signal   </span>
                <span fg="#FFFFFF">{cur.signal}</span>
              </text>
              {cur.detail ? (
                <>
                  <text> </text>
                  <text fg="#888888">detail</text>
                  <text fg="#cccccc">{cur.detail}</text>
                </>
              ) : null}
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

function WastedWorkView({ items, selected, onSelect, active, sidebarWidth, onSidebarResize }: { items: WastedWorkFinding[] } & SubViewProps) {
  const cur = items[Math.min(selected, items.length - 1)];
  const scrollRef = useScrollControls(active, `${cur?.sessionId}-${cur?.filePath}`);
  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Wasted edits"
          width={sidebarWidth}
          items={items.map((w, i) => ({
            key: `${i}`,
            primary: homePath(w.filePath),
            secondary: `${w.edits}× ${w.reason.replace("git-", "")}`,
          }))}
          selected={selected}
          onSelect={onSelect}
          emptyMessage="(no obvious wasted work found)"
        />
      }
      preview={
        <PreviewPane title={homePath(cur?.filePath) || undefined} ref={scrollRef}>
          {!cur ? (
            <text fg="#666666">Select an entry.</text>
          ) : (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text>
                <span fg="#888888">file      </span>
                <span fg="#FFFFFF">{homePath(cur.filePath)}</span>
              </text>
              <text>
                <span fg="#888888">edits     </span>
                <span fg="#FFFFFF">{String(cur.edits)}</span>
              </text>
              <text>
                <span fg="#888888">reverted  </span>
                <span fg="#FFFFFF">{cur.reason}</span>
              </text>
              <text>
                <span fg="#888888">when      </span>
                <span fg="#FFFFFF">{dateStr(cur.timestamp)}</span>
              </text>
              <text>
                <span fg="#888888">project   </span>
                <span fg="#FFFFFF">{homePath(cur.projectCwd)}</span>
              </text>
              <text>
                <span fg="#888888">session   </span>
                <span fg="#FFFFFF">{cur.sessionId}</span>
              </text>
              <text> </text>
              <text fg="#666666">High edits-then-revert often signals miscommunication or missing context worth capturing in CLAUDE.md.</text>
            </box>
          )}
        </PreviewPane>
      }
    />
  );
}

export const InsightsDef: PanelDef = {
  name: "Insights",
  bindings: [
    ["←→/hl", "sub-tab"],
    ["↑↓/jk", "navigate"],
    ["s", "scaffold"],
    ["r", "refresh"],
  ],
  Component: InsightsPanel,
};
