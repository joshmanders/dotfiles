import React from "react";

interface Props {
  panels: readonly string[];
  active: number;
  onSelect?: (index: number) => void;
}

export function Header({ panels, active, onSelect }: Props) {
  return (
    <box
      style={{
        flexDirection: "row",
        height: 3,
        borderStyle: "rounded",
        border: true,
        borderColor: "#444444",
        paddingLeft: 1,
        paddingRight: 1,
        gap: 0,
      }}
      title=" Claude Panel "
      titleAlignment="left"
    >
      {panels.map((name, i) => {
        const isActive = i === active;
        return (
          <box
            key={name}
            style={{
              flexDirection: "row",
              backgroundColor: isActive ? "#FFAA00" : undefined,
              paddingLeft: 1,
              paddingRight: 1,
            }}
            onMouseDown={onSelect ? () => onSelect(i) : undefined}
          >
            <text fg={isActive ? "#000000" : "#888888"} bg={isActive ? "#FFAA00" : undefined}>
              {name}
            </text>
          </box>
        );
      })}
    </box>
  );
}
