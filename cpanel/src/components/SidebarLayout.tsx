import React, { useState } from "react";
import type { MouseEvent } from "@opentui/core";
import { Splitter } from "./Splitter.js";

interface Props {
  onResize: (terminalX: number) => void;
  list: React.ReactNode;
  preview: React.ReactNode;
}

// Wraps a list+preview pair with a draggable splitter between them.
//
// Why this lives in a wrapper: opentui captures the renderable currently
// under the cursor on the first mouse-drag event. Once the cursor moves off
// the 1-column splitter the captured target becomes the preview pane, and
// the splitter stops receiving drag events. Mouse events bubble up to
// parents though, so we attach the drag/up handlers here on the row
// container and gate them on a local "dragging" flag set by the splitter's
// mousedown.
export function SidebarLayout({ onResize, list, preview }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrag = (e: MouseEvent) => {
    if (!dragging) return;
    e.preventDefault();
    onResize(e.x);
  };

  return (
    <box
      style={{ flexDirection: "row", flexGrow: 1 }}
      onMouseDrag={handleDrag}
      onMouseDragEnd={() => setDragging(false)}
      onMouseUp={() => setDragging(false)}
    >
      {list}
      <Splitter onDragStart={() => setDragging(true)} />
      {preview}
    </box>
  );
}
