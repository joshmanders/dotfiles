import React, { useRef, useState } from "react";
import type { BoxRenderable } from "@opentui/core";
import { truncate } from "../lib/format.js";

export interface ListItem {
  key: string;
  primary: string;
  secondary?: string;
}

interface Props {
  items: ListItem[];
  selected: number;
  title?: string;
  width?: number;
  emptyMessage?: string;
  onSelect?: (index: number) => void;
}

export function ListPane({ items, selected, title, width = 48, emptyMessage = "(empty)", onSelect }: Props) {
  const boxRef = useRef<BoxRenderable>(null);
  const [visible, setVisible] = useState(24);

  // Window of items around the selection. `visible` is set from the box's
  // measured height (chrome = 2 border + 2 padding). Auto-shrinks/expands
  // when the terminal resizes.
  const half = Math.floor(visible / 2);
  let start = Math.max(0, selected - half);
  const end = Math.min(items.length, start + visible);
  start = Math.max(0, end - visible);
  const window = items.slice(start, end);

  // Inner width = box width minus border (2) and padding (2).
  const INNER = width - 4;
  const ARROW = 2;
  const SECONDARY_W = 12;
  const PRIMARY_W = Math.max(8, INNER - ARROW - SECONDARY_W);

  const titleStr = title
    ? items.length > 0
      ? ` ${title} (${selected + 1}/${items.length}) `
      : ` ${title} `
    : undefined;

  const measure = () => {
    const h = boxRef.current?.height ?? 0;
    if (h <= 0) return;
    const inner = Math.max(1, h - 4);
    setVisible((v) => (v === inner ? v : inner));
  };

  return (
    <box
      ref={boxRef}
      style={{
        width,
        flexShrink: 0,
        flexGrow: 0,
        flexDirection: "column",
        borderStyle: "rounded",
        border: true,
        borderColor: "#333333",
        padding: 1,
      }}
      title={titleStr}
      onSizeChange={measure}
      onMouseScroll={(e) => {
        if (!onSelect || items.length === 0) return;
        const dir = e.scroll?.direction;
        if (dir === "up") onSelect(Math.max(0, selected - 1));
        else if (dir === "down") onSelect(Math.min(items.length - 1, selected + 1));
      }}
    >
      {items.length === 0 ? (
        <text fg="#666666">{emptyMessage}</text>
      ) : (
        window.map((item, i) => {
          const idx = start + i;
          const isSel = idx === selected;
          const primary = truncate(item.primary, PRIMARY_W).padEnd(PRIMARY_W, " ");
          const secondary = item.secondary
            ? truncate(item.secondary, SECONDARY_W).padStart(SECONDARY_W, " ")
            : " ".repeat(SECONDARY_W);
          const bg = isSel ? "#FFAA00" : undefined;
          return (
            <text
              key={item.key}
              onMouseDown={onSelect ? () => onSelect(idx) : undefined}
            >
              <span fg={isSel ? "#000000" : "#cccccc"} bg={bg}>
                {isSel ? "▶ " : "  "}
                {primary}
              </span>
              <span fg={isSel ? "#000000" : "#666666"} bg={bg}>{secondary}</span>
            </text>
          );
        })
      )}
    </box>
  );
}
