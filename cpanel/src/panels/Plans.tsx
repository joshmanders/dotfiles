import React, { useMemo, useState } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { ListPane } from "../components/ListPane.js";
import { PreviewPane } from "../components/PreviewPane.js";
import { SidebarLayout } from "../components/SidebarLayout.js";
import { listDir, readText, rmPath, paths } from "../lib/claude.js";
import { bytes, relTime } from "../lib/format.js";
import { openInEditor } from "../lib/editor.js";
import { markdownSyntaxStyle } from "../lib/markdown-style.js";
import { useScrollControls } from "../lib/use-scroll.js";
import type { PanelDef, PanelProps } from "./types.js";

function PlansPanel({ active, requestConfirm, sidebarWidth, onSidebarResize }: PanelProps) {
  const renderer = useRenderer();
  const [reload, setReload] = useState(0);
  const items = useMemo(() => listDir(paths.plans, { ext: ".md" }), [reload]);
  const [sel, setSel] = useState(0);
  const cur = items[Math.min(sel, items.length - 1)];
  const content = cur ? readText(cur.path) : "";
  const syntaxStyle = useMemo(() => markdownSyntaxStyle(), []);
  const scrollRef = useScrollControls(active, cur?.path);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    if (n === "up" || n === "k") setSel((s) => Math.max(0, s - 1));
    else if (n === "down" || n === "j") setSel((s) => Math.min(items.length - 1, s + 1));
    else if (n === "g") setSel(0);
    else if (n === "e" && cur) {
      openInEditor(renderer, cur.path);
      setReload((r) => r + 1);
    } else if (n === "d" && cur) {
      const target = cur;
      requestConfirm(`Delete plan: ${target.name}?`, `${target.path} (${bytes(target.size)})`, () => {
        rmPath(target.path);
        setReload((r) => r + 1);
        setSel((s) => Math.max(0, Math.min(s, items.length - 2)));
      });
    }
  });

  return (
    <SidebarLayout
      onResize={onSidebarResize}
      list={
        <ListPane
          title="Plans"
          width={sidebarWidth}
          items={items.map((f) => ({ key: f.path, primary: f.name.replace(/\.md$/, ""), secondary: relTime(f.mtimeMs) }))}
          selected={sel}
          onSelect={setSel}
        />
      }
      preview={
        <PreviewPane title={cur?.name} ref={scrollRef}>
          {cur ? <markdown content={content} syntaxStyle={syntaxStyle} /> : <text fg="#666666">No plans found.</text>}
        </PreviewPane>
      }
    />
  );
}

export const PlansDef: PanelDef = {
  name: "Plans",
  bindings: [
    ["↑↓/jk", "navigate"],
    ["e", "edit"],
    ["d", "delete"],
  ],
  Component: PlansPanel,
};
