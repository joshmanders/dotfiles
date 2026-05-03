import { useEffect, useRef } from "react";
import { useKeyboard } from "@opentui/react";
import type { ScrollBoxRenderable } from "@opentui/core";

const PAGE_DELTA = 10;
const LINE_DELTA = 2;

/**
 * Wires standard scroll keys (PageUp/PageDown/space, Ctrl-D/Ctrl-U,
 * Home/End) to a ScrollBoxRenderable ref. Returns the ref to attach to
 * <PreviewPane ref={ref} /> or <scrollbox ref={ref} />.
 *
 * `resetKey` is a value that, when it changes, scrolls back to the top —
 * use the currently-selected item's id so switching items resets scroll.
 */
export function useScrollControls(active: boolean, resetKey?: unknown) {
  const ref = useRef<ScrollBoxRenderable>(null);

  useEffect(() => {
    ref.current?.scrollTo(0);
  }, [resetKey]);

  useKeyboard((k) => {
    if (!active) return;
    const n = k.name?.toLowerCase();
    const sb = ref.current;
    if (!sb) return;
    if (n === "pagedown" || n === "space") sb.scrollBy(PAGE_DELTA);
    else if (n === "pageup") sb.scrollBy(-PAGE_DELTA);
    else if (k.ctrl && n === "d") sb.scrollBy(PAGE_DELTA);
    else if (k.ctrl && n === "u") sb.scrollBy(-PAGE_DELTA);
    else if (k.shift && n === "down") sb.scrollBy(LINE_DELTA);
    else if (k.shift && n === "up") sb.scrollBy(-LINE_DELTA);
    else if (n === "home") sb.scrollTo(0);
    else if (n === "end") sb.scrollTo(sb.scrollHeight);
  });

  return ref;
}
