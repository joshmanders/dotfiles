import React, { forwardRef, memo, useEffect, useRef } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import type { StyledLine } from "../lib/ansi.js";

interface Props {
  title?: string;
  lines: StyledLine[];
  // The manager appends to `lines` in place, so its identity never moves.
  // This is what tells memo the visible process actually produced something —
  // without it, a chatty background tab would re-reconcile every line here.
  revision: number;
}

const VISIBLE_TAIL = 1000;

// Sticky-to-bottom only kicks in once content exceeds the viewport. While
// the buffer is shorter than the visible area, default flex layout keeps
// the lines stacked from the top with empty space below, which is what
// you want when output has barely started. After overflow, we pin scroll
// to the bottom so the latest line stays visible.
export const OutputPane = memo(
  forwardRef<ScrollBoxRenderable, Props>(function OutputPane(
    { title, lines },
    ref,
  ) {
    const localRef = useRef<ScrollBoxRenderable | null>(null);

    useEffect(() => {
      const box = localRef.current;
      if (!box) return;
      const overflow = box.scrollHeight - box.viewport.height;
      if (overflow > 0) box.scrollTo({ x: 0, y: overflow });
    }, [lines.length]);

    const setRef = (el: ScrollBoxRenderable | null) => {
      localRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<ScrollBoxRenderable | null>).current =
          el;
    };

    const display =
      lines.length > VISIBLE_TAIL ? lines.slice(-VISIBLE_TAIL) : lines;

    return (
      <box
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          flexDirection: "column",
          borderStyle: "rounded",
          border: true,
          borderColor: "#333333",
          overflow: "hidden",
        }}
        title={title ? ` ${title} ` : undefined}
      >
        <scrollbox ref={setRef} style={{ flexGrow: 1, padding: 1 }} scrollY>
          {display.length === 0 ? (
            <text fg="#666666">(no output)</text>
          ) : (
            display.map((line, i) => (
              <text key={i}>
                {line.length === 0 ? (
                  <span> </span>
                ) : (
                  line.map((run, j) => (
                    <span
                      key={j}
                      fg={run.fg ?? "#cccccc"}
                      bg={run.bg}
                      attributes={
                        (run.bold ? 1 : 0) |
                        (run.dim ? 2 : 0) |
                        (run.italic ? 4 : 0) |
                        (run.underline ? 8 : 0)
                      }
                    >
                      {run.text}
                    </span>
                  ))
                )}
              </text>
            ))
          )}
        </scrollbox>
      </box>
    );
  }),
);
