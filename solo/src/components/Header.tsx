import React from "react";
import type { ProcSnapshot } from "../lib/process.js";
import type { CommandConfig } from "../lib/config.js";

interface Props {
  items: { cfg: CommandConfig; proc: ProcSnapshot }[];
  selected: number;
  onSelect: (index: number) => void;
}

function dotColor(proc: ProcSnapshot): string {
  switch (proc.status) {
    case "running":
      return "#55FF55";
    case "failed":
      return "#FF5555";
    case "exited":
      return "#888888";
    case "idle":
    default:
      return "#666666";
  }
}

export function Header({ items, selected, onSelect }: Props) {
  return (
    <box
      style={{
        flexDirection: "row",
        height: 1,
        paddingLeft: 1,
        paddingRight: 1,
        gap: 1,
      }}
    >
      {items.map((item, i) => {
        const isActive = i === selected;
        const dot = dotColor(item.proc);
        return (
          <box
            key={item.cfg.name}
            style={{ flexDirection: "row" }}
            onMouseDown={() => onSelect(i)}
          >
            {isActive ? (
              <text>
                <span fg="#000000" bg="#dddddd">{` ${item.cfg.name} `}</span>
              </text>
            ) : (
              <text>
                <span fg={dot}>•</span>
                <span fg="#888888">{item.cfg.name}</span>
              </text>
            )}
          </box>
        );
      })}
    </box>
  );
}
