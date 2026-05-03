import React, { useEffect, useMemo, useState } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { loadAllConversations, visibleConversations, type Conversation, type ConversationEntry } from "../lib/conversations.js";
import { useScrollControls } from "../lib/use-scroll.js";
import { dateStr, homePath, relTime, truncate } from "../lib/format.js";
import { markdownSyntaxStyle } from "../lib/markdown-style.js";
import { openInEditor } from "../lib/editor.js";
import { costOf, formatUSD } from "../lib/pricing.js";
import type { PanelDef, PanelProps } from "./types.js";

interface ConvSummary {
  conv: Conversation;
  title: string;
  messageCount: number;
  cost: number;
}

function summarize(c: Conversation): ConvSummary {
  let title = c.title?.trim();
  if (!title) {
    // Fall back to first user prompt's first line.
    for (const e of c.entries) {
      if (e.role === "user" && !e.toolResultFor && e.text) {
        title = e.text.trim().split(/\n/)[0]!.slice(0, 80);
        break;
      }
    }
  }
  if (!title) title = c.sessionId.slice(0, 8);
  let cost = 0;
  let msgs = 0;
  for (const e of c.entries) {
    if (e.role) msgs++;
    cost += costOf(e);
  }
  return { conv: c, title, messageCount: msgs, cost };
}

const RENDER_LIMIT = 200;

function ConversationsPanel({ active, sidebarWidth, onSidebarResize, showHiddenVersion }: PanelProps) {
  const renderer = useRenderer();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<ConvSummary[]>([]);
  const [sel, setSel] = useState(0);
  const [filter, setFilter] = useState("");
  const [filterFocused, setFilterFocused] = useState(false);
  const syntaxStyle = useMemo(() => markdownSyntaxStyle(), []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const convs = visibleConversations(loadAllConversations());
        const all = convs.map(summarize);
        all.sort((a, b) => b.conv.endedAt - a.conv.endedAt);
        setSummaries(all);
      } finally {
        setLoading(false);
      }
    }, 16);
  }, [showHiddenVersion]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return summaries;
    const q = filter.toLowerCase();
    return summaries.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.conv.realCwd.toLowerCase().includes(q) ||
        s.conv.sessionId.toLowerCase().includes(q),
    );
  }, [summaries, filter]);

  const cur = filtered[Math.min(sel, filtered.length - 1)];
  const scrollRef = useScrollControls(active && !filterFocused, cur?.conv.sessionId);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (filterFocused) {
      if (n === "escape" || n === "return" || n === "enter") setFilterFocused(false);
      return;
    }
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(filtered.length - 1, s + 1));
    else if (n === "/" || n === "f") {
      setFilterFocused(true);
    } else if (n === "e" && cur) {
      openInEditor(renderer, cur.conv.filePath);
    }
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
          borderColor: filterFocused ? "#FFAA00" : "#333333",
          gap: 1,
        }}
      >
        <text fg="#888888">filter:</text>
        <input
          style={{ flexGrow: 1 }}
          placeholder="filter by title / project / session… (/ or f to focus, esc to leave)"
          value={filter}
          focused={filterFocused && active}
          onInput={setFilter}
          onSubmit={() => setFilterFocused(false)}
        />
      </box>
      <SidebarLayout
        onResize={onSidebarResize}
        list={
          <ListPane
            title={loading ? "Loading…" : `Conversations${filter ? ` (${filtered.length})` : ""}`}
            width={sidebarWidth}
            items={filtered.map((s) => ({
              key: s.conv.sessionId,
              primary: s.title,
              secondary: relTime(s.conv.endedAt),
            }))}
            selected={sel}
            onSelect={setSel}
            emptyMessage={loading ? "(scanning)" : "(no matches)"}
          />
        }
        preview={
          <PreviewPane title={cur?.title} ref={scrollRef}>
            {!cur ? (
              <text fg="#666666">{loading ? "Scanning conversation logs…" : "Select a conversation."}</text>
            ) : (
              <ConversationView summary={cur} syntaxStyle={syntaxStyle} />
            )}
          </PreviewPane>
        }
      />
    </box>
  );
}

interface ConversationViewProps {
  summary: ConvSummary;
  syntaxStyle: ReturnType<typeof markdownSyntaxStyle>;
}

function ConversationView({ summary, syntaxStyle }: ConversationViewProps) {
  const { conv, messageCount, cost } = summary;
  // Cap rendered turns so opening an enormous session is still snappy.
  const visible = useMemo(() => conv.entries.slice(-RENDER_LIMIT), [conv]);
  const omitted = conv.entries.length - visible.length;
  const models = useMemo(() => {
    const set = new Set<string>();
    for (const e of conv.entries) if (e.model) set.add(e.model);
    return [...set];
  }, [conv]);

  return (
    <box style={{ flexDirection: "column" }}>
      <box style={{ flexDirection: "column", gap: 0, marginBottom: 1 }}>
        <text>
          <span fg="#888888">project   </span>
          <span fg="#FFFFFF">{homePath(conv.realCwd)}</span>
        </text>
        <text>
          <span fg="#888888">session   </span>
          <span fg="#FFFFFF">{conv.sessionId}</span>
        </text>
        <text>
          <span fg="#888888">messages  </span>
          <span fg="#FFFFFF">{String(messageCount)}</span>
          <span fg="#888888">   cost  </span>
          <span fg="#FFFFFF">{formatUSD(cost)}</span>
        </text>
        <text>
          <span fg="#888888">started   </span>
          <span fg="#FFFFFF">{conv.startedAt ? dateStr(conv.startedAt) : "—"}</span>
          <span fg="#888888">   ended  </span>
          <span fg="#FFFFFF">{conv.endedAt ? dateStr(conv.endedAt) : "—"}</span>
        </text>
        {models.length ? (
          <text>
            <span fg="#888888">models    </span>
            <span fg="#FFFFFF">{models.join(", ")}</span>
          </text>
        ) : null}
      </box>

      {omitted > 0 ? (
        <text fg="#666666">{`… omitted ${omitted} earlier turn(s); showing last ${RENDER_LIMIT}`}</text>
      ) : null}

      {visible.map((e, i) => (
        <Turn key={`${conv.sessionId}-${i}`} entry={e} syntaxStyle={syntaxStyle} />
      ))}
    </box>
  );
}

function Turn({ entry, syntaxStyle }: { entry: ConversationEntry; syntaxStyle: ReturnType<typeof markdownSyntaxStyle> }) {
  const role = entry.role;
  if (role === "user" && !entry.toolResultFor && entry.text) {
    return (
      <box
        style={{
          flexDirection: "column",
          marginBottom: 1,
          paddingLeft: 1,
          border: ["left"],
          borderColor: "#FFAA00",
        }}
      >
        <text fg="#FFAA00">you</text>
        <text fg="#FFFFFF">{truncate(entry.text, 4000)}</text>
      </box>
    );
  }
  if (role === "assistant") {
    return (
      <box
        style={{
          flexDirection: "column",
          marginBottom: 1,
          paddingLeft: 1,
          border: ["left"],
          borderColor: "#88FFAA",
        }}
      >
        <text fg="#88FFAA">{`claude${entry.model ? ` (${entry.model})` : ""}`}</text>
        {entry.text ? <markdown content={truncate(entry.text, 8000)} syntaxStyle={syntaxStyle} /> : null}
        {entry.toolUses?.map((t) => (
          <text key={t.id} fg="#88AAFF">
            {`  → ${t.name}(${truncate(JSON.stringify(t.input), 200)})`}
          </text>
        ))}
      </box>
    );
  }
  if (entry.toolResultFor && entry.toolResultText) {
    return (
      <text fg="#666666">{`  ⤺ ${truncate(entry.toolResultText.replace(/\s+/g, " "), 200)}`}</text>
    );
  }
  return null;
}

export const ConversationsDef: PanelDef = {
  name: "Conversations",
  bindings: [
    ["↑↓/jk", "navigate"],
    ["/ or f", "filter"],
    ["e", "open jsonl"],
  ],
  Component: ConversationsPanel,
};
