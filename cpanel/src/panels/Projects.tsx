import React, { useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { dirSize, listDir, projectPathFromKey, rmPath, paths } from "../lib/claude.js";
import { isProjectIgnored } from "../lib/config.js";
import { bytes, homePath, relTime } from "../lib/format.js";
import { useScrollControls } from "../lib/use-scroll.js";
import { loadAllConversations } from "../lib/conversations.js";
import type { PanelDef, PanelProps } from "./types.js";

interface ProjectInfo {
  key: string;
  path: string;
  realPath: string;
  size: number;
  mtimeMs: number;
  conversations: number;
}

interface ProjectTokens {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreateTokens: number;
  messages: number;
  topModels: Map<string, number>;
}

function loadProjects(): ProjectInfo[] {
  const dirs = listDir(paths.projects).filter((e) => e.isDir);
  const out: ProjectInfo[] = [];
  for (const d of dirs) {
    const realPath = projectPathFromKey(d.name);
    if (isProjectIgnored(realPath)) continue;
    const conversations = listDir(d.path, { ext: ".jsonl" }).length;
    out.push({
      key: d.name,
      path: d.path,
      realPath,
      size: dirSize(d.path),
      mtimeMs: d.mtimeMs,
      conversations,
    });
  }
  return out.sort((a, b) => b.size - a.size);
}

function loadTokensByProject(): Map<string, ProjectTokens> {
  const out = new Map<string, ProjectTokens>();
  for (const conv of loadAllConversations()) {
    let bucket = out.get(conv.projectKey);
    if (!bucket) {
      bucket = {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreateTokens: 0,
        messages: 0,
        topModels: new Map(),
      };
      out.set(conv.projectKey, bucket);
    }
    for (const e of conv.entries) {
      if (e.role) bucket.messages++;
      if (e.inputTokens) bucket.inputTokens += e.inputTokens;
      if (e.outputTokens) bucket.outputTokens += e.outputTokens;
      if (e.cacheReadTokens) bucket.cacheReadTokens += e.cacheReadTokens;
      if (e.cacheCreateTokens) bucket.cacheCreateTokens += e.cacheCreateTokens;
      if (e.model) bucket.topModels.set(e.model, (bucket.topModels.get(e.model) ?? 0) + 1);
    }
  }
  return out;
}

function ProjectsPanel({ active, requestConfirm, sidebarWidth, onSidebarResize, showHiddenVersion }: PanelProps) {
  const [reload, setReload] = useState(0);
  const items = useMemo(() => loadProjects(), [reload, showHiddenVersion]);
  const [tokens, setTokens] = useState<Map<string, ProjectTokens> | null>(null);
  const [sel, setSel] = useState(0);
  const cur = items[Math.min(sel, items.length - 1)];
  const curTokens = cur && tokens ? tokens.get(cur.key) : undefined;
  const scrollRef = useScrollControls(active, cur?.key);

  useEffect(() => {
    // Lazy: build the token aggregate after the panel is open.
    if (tokens) return;
    setTimeout(() => setTokens(loadTokensByProject()), 16);
  }, [tokens]);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(items.length - 1, s + 1));
    else if (n === "d" && cur) {
      const target = cur;
      requestConfirm(
        `Delete all conversation history for ${target.realPath}?`,
        `${target.path} (${bytes(target.size)}, ${target.conversations} conversations)`,
        () => {
          rmPath(target.path);
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
          title="Projects"
          width={sidebarWidth}
          items={items.map((p) => ({
            key: p.key,
            primary: homePath(p.realPath),
            secondary: bytes(p.size),
          }))}
          selected={sel}
          onSelect={setSel}
        />
      }
      preview={
        <PreviewPane title={homePath(cur?.realPath) || undefined} ref={scrollRef}>
          {cur ? (
            <box style={{ flexDirection: "column", gap: 1 }}>
              <text>
                <span fg="#888888">path          </span>
                <span fg="#FFFFFF">{homePath(cur.realPath)}</span>
              </text>
              <text>
                <span fg="#888888">size          </span>
                <span fg="#FFFFFF">{bytes(cur.size)}</span>
              </text>
              <text>
                <span fg="#888888">conversations </span>
                <span fg="#FFFFFF">{String(cur.conversations)}</span>
              </text>
              <text>
                <span fg="#888888">last activity </span>
                <span fg="#FFFFFF">{relTime(cur.mtimeMs)}</span>
              </text>

              <text> </text>
              <text fg="#FFAA00">{tokens ? "Token usage" : "Token usage (loading…)"}</text>
              {curTokens ? (
                <>
                  <text>
                    <span fg="#888888">  messages       </span>
                    <span fg="#FFFFFF">{curTokens.messages.toLocaleString()}</span>
                  </text>
                  <text>
                    <span fg="#888888">  input tokens   </span>
                    <span fg="#FFFFFF">{curTokens.inputTokens.toLocaleString()}</span>
                  </text>
                  <text>
                    <span fg="#888888">  output tokens  </span>
                    <span fg="#FFFFFF">{curTokens.outputTokens.toLocaleString()}</span>
                  </text>
                  <text>
                    <span fg="#888888">  cache reads    </span>
                    <span fg="#FFFFFF">{curTokens.cacheReadTokens.toLocaleString()}</span>
                  </text>
                  <text>
                    <span fg="#888888">  cache creates  </span>
                    <span fg="#FFFFFF">{curTokens.cacheCreateTokens.toLocaleString()}</span>
                  </text>
                  <text> </text>
                  <text fg="#888888">  models</text>
                  {[...curTokens.topModels.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([m, n]) => (
                      <text key={m}>
                        <span fg="#888888">    ×{String(n).padStart(4, " ")}  </span>
                        <span fg="#FFFFFF">{m}</span>
                      </text>
                    ))}
                </>
              ) : (
                <text fg="#666666">  (no token data for this project yet)</text>
              )}

              <text> </text>
              <text fg="#888888">internal key</text>
              <text fg="#cccccc">{cur.key}</text>
            </box>
          ) : (
            <text fg="#666666">No projects found.</text>
          )}
        </PreviewPane>
      }
    />
  );
}

export const ProjectsDef: PanelDef = {
  name: "Projects",
  bindings: [
    ["↑↓/jk", "navigate"],
    ["d", "delete history"],
  ],
  Component: ProjectsPanel,
};
