import { useState, useCallback } from "react";

const MIN_WIDTH = 16;
const MAX_WIDTH = 120;

/**
 * Sidebar width state with a drag-handler that takes the absolute terminal X
 * coord (from a mouse drag event) and clamps it to [MIN, MAX]. Each panel
 * keeps its own width — resizing one panel doesn't affect others.
 */
export function useSidebarWidth(initial = 48): [number, (terminalX: number) => void] {
  const [width, setWidth] = useState(initial);
  const onDrag = useCallback((terminalX: number) => {
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, terminalX));
    setWidth(next);
  }, []);
  return [width, onDrag];
}
