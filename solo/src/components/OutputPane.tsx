import React, { memo, useEffect, useRef, useState } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import type { StyledLine } from "../lib/terminal.js";

interface Props {
  title?: string;
  lineCount: number;
  // Moves only when this process's state or output changes, so memo bails out
  // when a chatty background tab is what triggered the render. Rows can be
  // rewritten in place without the count moving, so this is also what tells
  // the pane to re-read the window.
  revision: number;
  // Converts rows [start, start + count). Only the window on screen is asked
  // for; converting the whole scrollback per frame is what this pane avoids.
  read: (start: number, count: number) => StyledLine[];
  // The text area's size in cells, so processes wrap where the pane does.
  onResize: (cols: number, rows: number) => void;
}

// Rows converted above and below the viewport. The window is picked from the
// last scroll position React saw, and the scrollbox can move a frame ahead of
// it (a wheel flick, the tail growing), so this keeps that frame filled.
const MARGIN = 20;
// Terminal resizes arrive in bursts while a window is dragged; each one
// reflows every process's scrollback and signals every pty.
const RESIZE_DEBOUNCE_MS = 100;
// The scrollbox's padding, per side, which the text area loses.
const PADDING = 1;
// Columns the vertical scrollbar takes once content overflows.
const SCROLLBAR_WIDTH = 1;

// A virtual list: spacer boxes stand in for the rows off screen, so the
// scrollbox's height, scrollbar, and wheel handling cover the whole
// scrollback while only the visible window is converted and drawn. Sticky
// scroll follows the tail; scrolling up stops following, and scrolling back to
// the bottom resumes it.
export const OutputPane = memo(function OutputPane({
  title,
  lineCount,
  read,
  onResize,
}: Props) {
  const boxRef = useRef<ScrollBoxRenderable | null>(null);
  const [view, setView] = useState({ top: 0, height: 0, following: true });
  // Read by the layout listeners, which run outside React's render.
  const following = useRef(true);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const sync = () => {
      // Exactly the bottom, as OpenTUI's own sticky check judges it: a wheel
      // notch moves one row, so any slack would swallow a one-notch scroll.
      const max = box.scrollHeight - box.viewport.height;
      following.current = box.scrollTop >= max;
      setView({
        top: box.scrollTop,
        height: box.viewport.height,
        following: following.current,
      });
    };
    // Sticky scroll alone doesn't resume after the wheel reaches the bottom:
    // every wheel event marks the scroll manual, and it only re-engages if
    // the old bottom is still the bottom once the content has grown. Pinning
    // on growth while at the bottom covers it, and the setter clears that
    // manual mark so sticky scroll takes over again.
    const pin = () => {
      if (following.current)
        box.scrollTop = box.scrollHeight - box.viewport.height;
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const resized = () => {
      pin();
      sync();
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Measured off the scrollbox, not its viewport, with the scrollbar's
        // column always reserved: the viewport narrows when the scrollbar
        // appears, and a size that followed it would flip on every switch
        // between a short tab and a long one, reflowing every process. At the
        // tail the bottom padding stays on screen and the top has scrolled
        // away, so one row of padding is lost.
        onResize(
          box.width - SCROLLBAR_WIDTH - PADDING * 2,
          box.height - PADDING,
        );
      }, RESIZE_DEBOUNCE_MS);
    };
    box.verticalScrollBar.on("change", sync);
    box.viewport.on("resize", resized);
    box.content.on("resize", pin);
    resized();
    return () => {
      clearTimeout(timer);
      box.verticalScrollBar.off("change", sync);
      box.viewport.off("resize", resized);
      box.content.off("resize", pin);
    };
  }, [onResize]);

  // While following, anchor the window to the tail rather than the last
  // scroll position: the scrollbox jumps to the new bottom only after layout,
  // and a burst of output can outrun the margin before React hears about it.
  const rowsTop = Math.max(0, view.top - PADDING);
  const start = view.following
    ? Math.max(0, lineCount - view.height - MARGIN)
    : Math.max(0, rowsTop - MARGIN);
  const end = Math.min(lineCount, start + view.height + MARGIN * 2);
  const rows = end > start ? read(start, end - start) : [];

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
      <scrollbox
        ref={boxRef}
        style={{ flexGrow: 1, padding: PADDING }}
        scrollY
        stickyScroll
        stickyStart="bottom"
      >
        {lineCount === 0 ? (
          <text fg="#666666">(no output)</text>
        ) : (
          <>
            <box style={{ height: start, flexShrink: 0 }} />
            {/* Keyed by slot, not row: moving the window then updates these
                in place instead of replacing them, so a wheel event aimed
                at a row drawn last frame still lands on a live renderable. */}
            {rows.map((line, i) => (
              <text key={i} wrapMode="none">
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
            ))}
            <box style={{ height: lineCount - end, flexShrink: 0 }} />
          </>
        )}
      </scrollbox>
    </box>
  );
});
