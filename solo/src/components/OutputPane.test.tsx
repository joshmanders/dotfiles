import { afterEach, expect, jest, test } from "bun:test";
import React, { act, useState } from "react";
import { testRender } from "@opentui/react/test-utils";
import { OutputPane } from "./OutputPane.js";
import type { StyledLine } from "../lib/terminal.js";

// Tells React this is a test environment, so `act` flushes updates.
const env = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
env.IS_REACT_ACT_ENVIRONMENT = true;

type Setup = Awaited<ReturnType<typeof testRender>>;
let setup: Setup | undefined;

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 2_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("timed out waiting for state");
    await Bun.sleep(10);
  }
}

afterEach(() => {
  act(() => setup?.renderer.destroy());
  setup = undefined;
});

// Row i reads "row <i + shift>": a full scrollback drops its oldest row as a
// new one arrives, so the count holds still while every row's text moves.
// With `width`, each row is padded to exactly that many cells, ending in "|".
async function mount(count: number, height = 12) {
  let state: { count: number; shift: number; width?: number } = {
    count,
    shift: 0,
  };
  let update!: (next: typeof state) => void;
  const reads: number[] = [];
  const sizes: [number, number][] = [];
  const read = (start: number, n: number): StyledLine[] => {
    reads.push(n);
    const end = Math.min(state.count, start + n);
    return Array.from({ length: Math.max(0, end - start) }, (_, i) => {
      const text = `row ${start + i + state.shift}`;
      const padded = state.width
        ? text.padEnd(state.width - 1, ".") + "|"
        : text;
      return [{ text: padded }];
    });
  };
  const onResize = (cols: number, rows: number) => sizes.push([cols, rows]);
  function Host() {
    const [s, set] = useState(state);
    update = (next) => {
      state = next;
      set(next);
    };
    return (
      <OutputPane
        lineCount={s.count}
        revision={s.count + s.shift + (s.width ?? 0)}
        read={read}
        onResize={onResize}
      />
    );
  }
  await act(async () => {
    setup = await testRender(<Host />, { width: 60, height });
  });
  const t = setup!;
  // Two passes: layout moves the scroll, and the pane re-renders from that.
  const frame = async () => {
    for (let i = 0; i < 2; i++)
      await act(async () => {
        await t.renderOnce();
      });
    return t.captureCharFrame();
  };
  const rows = async () =>
    (await frame()).match(/row \d+/g)?.map((r) => Number(r.slice(4))) ?? [];
  const scroll = async (dir: "up" | "down", times: number) => {
    for (let i = 0; i < times; i++)
      await act(async () => {
        await t.mockMouse.scroll(10, 5, dir);
      });
  };
  const set = async (next: Partial<typeof state>) => {
    await act(async () => update({ ...state, ...next }));
  };
  return { rows, frame, scroll, set, reads, sizes };
}

test("follows the tail as output grows", async () => {
  const pane = await mount(500);
  expect((await pane.rows()).at(-1)).toBe(499);

  await pane.set({ count: 520 });
  expect((await pane.rows()).at(-1)).toBe(519);
});

test("scrolling up stops following; the bottom resumes it", async () => {
  const pane = await mount(500);
  await pane.rows();

  await pane.scroll("up", 3);
  const held = await pane.rows();
  expect(held.at(-1)).toBeLessThan(499);

  await pane.set({ count: 540 });
  expect(await pane.rows()).toEqual(held);

  await pane.scroll("down", 60);
  expect((await pane.rows()).at(-1)).toBe(539);

  await pane.set({ count: 560 });
  expect((await pane.rows()).at(-1)).toBe(559);
});

test("one wheel notch up stops following", async () => {
  const pane = await mount(500);
  await pane.rows();

  await pane.scroll("up", 1);
  const held = await pane.rows();

  await pane.set({ count: 540 });
  expect(await pane.rows()).toEqual(held);

  // The tail moved on 40 rows while held, so it takes more than one notch.
  await pane.scroll("down", 60);
  await pane.rows();
  await pane.set({ count: 560 });
  expect((await pane.rows()).at(-1)).toBe(559);
});

test("keeps showing the newest rows once the scrollback is full", async () => {
  const pane = await mount(500);
  await pane.rows();

  await pane.set({ shift: 40 });
  expect((await pane.rows()).at(-1)).toBe(539);
});

test("the top of the scrollback is reachable", async () => {
  const pane = await mount(300);
  await pane.rows();

  await pane.scroll("up", 400);
  expect((await pane.rows())[0]).toBe(0);
});

test("converts only the rows around the viewport", async () => {
  const pane = await mount(5000);
  await pane.rows();
  await pane.scroll("up", 50);
  await pane.rows();

  expect(pane.reads.length).toBeGreaterThan(0);
  // 10 visible rows at this size, plus the pane's margin on either side.
  for (const n of pane.reads) expect(n).toBeLessThanOrEqual(50);
});

test("reports the text area's size: full rows fit, rows fill it", async () => {
  const pane = await mount(500);
  await pane.rows();
  await waitFor(() => pane.sizes.length > 0);
  const [cols, rows] = pane.sizes.at(-1)!;

  expect(await pane.rows()).toHaveLength(rows);

  await pane.set({ width: cols });
  const last = "row 499".padEnd(cols - 1, ".") + "|";
  expect((await pane.frame()).split("\n")).toContainEqual(
    expect.stringContaining(last),
  );
});

test("switching between a short tab and a long one keeps a size", async () => {
  // Fake timers make each debounced report fire before the next switch, so a
  // size that changed with the scrollbar can't hide behind a late timer.
  jest.useFakeTimers();
  try {
    const pane = await mount(500);
    await pane.rows();
    jest.advanceTimersByTime(1_000);
    expect(pane.sizes.length).toBeGreaterThan(0);

    // A short tab has no scrollbar; a long one does.
    for (const count of [3, 500, 3, 500]) {
      await pane.set({ count });
      await pane.rows();
      jest.advanceTimersByTime(1_000);
    }

    expect(new Set(pane.sizes.map(String)).size).toBe(1);
  } finally {
    jest.useRealTimers();
  }
});
