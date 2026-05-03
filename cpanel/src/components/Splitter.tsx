import React from "react";

interface Props {
  onDragStart: () => void;
}

// 1-column vertical drag handle. The actual drag tracking lives on the
// parent (see SidebarLayout) — this component just signals when the user
// starts a drag.
export function Splitter({ onDragStart }: Props) {
  return (
    <box
      style={{
        width: 1,
        flexShrink: 0,
        flexGrow: 0,
        backgroundColor: "#222222",
      }}
      selectable={false}
      onMouseDown={() => onDragStart()}
    >
      <text fg="#555555" selectable={false}>│</text>
    </box>
  );
}
