// A headless terminal emulator wrapping @xterm/headless. It keeps a cell grid,
// so a redraw frame (`docker compose up` progress, spinners that reprint with
// `\x1b[A`) overwrites the old frame in place rather than appending a copy.
//
// Rows of the grid are read back as `StyledLine`s — runs of text sharing one
// style — which is the shape OutputPane draws.

import { Terminal } from "@xterm/headless";

// @xterm/headless only exports a subset of its interfaces; the buffer/cell
// types aren't among them, so derive them from Terminal's public surface.
type Buffer = Terminal["buffer"]["active"];
type IBufferLine = NonNullable<ReturnType<Buffer["getLine"]>>;
type IBufferCell = ReturnType<Buffer["getNullCell"]>;

export interface StyledRun {
  text: string;
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export type StyledLine = StyledRun[];

interface Style {
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

// Standard xterm-ish palette for the 16 ANSI colors. Tuned for dark
// backgrounds — slightly brighter than the spec defaults so the dimmer
// colors stay legible. xterm reports the palette *index* for a cell, not a
// color, so mapping the index through this table keeps colors identical to
// the old parser instead of adopting xterm's own defaults.
const STD16 = [
  "#000000",
  "#cd0000",
  "#00cd00",
  "#cdcd00",
  "#0000ee",
  "#cd00cd",
  "#00cdcd",
  "#e5e5e5",
  "#7f7f7f",
  "#ff5555",
  "#55ff55",
  "#ffff55",
  "#5c5cff",
  "#ff55ff",
  "#55ffff",
  "#ffffff",
];

function color256(n: number): string {
  if (n < 16) return STD16[n] ?? "#cccccc";
  if (n < 232) {
    const i = n - 16;
    const cube = [0, 95, 135, 175, 215, 255];
    const r = cube[Math.floor(i / 36)]!;
    const g = cube[Math.floor((i % 36) / 6)]!;
    const b = cube[i % 6]!;
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
  const v = 8 + (n - 232) * 10;
  const h = hex(v);
  return `#${h}${h}${h}`;
}
function hex(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
}
function rgb(r: number, g: number, b: number): string {
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// xterm exposes a cell's color three ways: default (use the UI's fallback),
// palette (an index into the 256-color table), or RGB (a packed 0xRRGGBB
// truecolor). Default returns undefined so OutputPane falls back to #cccccc,
// matching how the old parser left fg/bg unset.
function fgColor(cell: IBufferCell): string | undefined {
  if (cell.isFgDefault()) return undefined;
  if (cell.isFgRGB()) {
    const n = cell.getFgColor();
    return rgb((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
  }
  return color256(cell.getFgColor());
}
function bgColor(cell: IBufferCell): string | undefined {
  if (cell.isBgDefault()) return undefined;
  if (cell.isBgRGB()) {
    const n = cell.getBgColor();
    return rgb((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
  }
  return color256(cell.getBgColor());
}

// The cell attribute predicates return a bitmask number (0 when unset), so
// coerce to a real boolean before storing it on the run.
function cellStyle(cell: IBufferCell): Style {
  const s: Style = {};
  const fg = fgColor(cell);
  if (fg) s.fg = fg;
  const bg = bgColor(cell);
  if (bg) s.bg = bg;
  if (cell.isBold()) s.bold = true;
  if (cell.isDim()) s.dim = true;
  if (cell.isItalic()) s.italic = true;
  if (cell.isUnderline()) s.underline = true;
  return s;
}

function styleEq(a: Style, b: Style): boolean {
  return (
    a.fg === b.fg &&
    a.bg === b.bg &&
    !!a.bold === !!b.bold &&
    !!a.dim === !!b.dim &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline
  );
}

// A cell with no printable glyph and no painted background contributes nothing
// but right-padding, so we trim those off the end of each line.
function isBlank(cell: IBufferCell): boolean {
  const chars = cell.getChars();
  return (chars === "" || chars === " ") && cell.isBgDefault();
}

// @xterm/headless queues bytes from the public `write()` and only reflects
// them in the buffer once an internal task drains — a synchronous read right
// after `write()` sees stale cells. `writeSync` on the internal write buffer
// drains immediately, so a read at any point after a write reflects it. It's
// not on the public typings, so it's reached through this shape and kept
// behind the wrapper; a future xterm change only breaks this one spot.
interface XtermCore {
  _core: { _writeBuffer: { writeSync(data: string): void } };
}

export class TerminalEmulator {
  private term: Terminal;

  constructor(cols = 120, rows = 30, scrollback = 5000) {
    // allowProposedApi is required to reach the buffer and the sync write path.
    this.term = new Terminal({ cols, rows, scrollback, allowProposedApi: true });
  }

  write(data: string): void {
    (this.term as unknown as XtermCore)._core._writeBuffer.writeSync(data);
  }

  resize(cols: number, rows: number): void {
    this.term.resize(cols, rows);
  }

  // Full reset (RIS) — clears both the grid and scrollback, so a restart or an
  // explicit clear starts from an empty buffer.
  reset(): void {
    this.term.reset();
  }

  // Rows of the buffer (scrollback + viewport) up to the last one with
  // content. Blank rows at the bottom of the viewport are unused padding, so
  // they aren't counted and don't render as a blank tail. Only the viewport
  // (from `baseY` down) is scanned: rows above it are scrollback, which is
  // content by definition, so the cost is bounded by the viewport height
  // however full the buffer is.
  lineCount(): number {
    const buf = this.term.buffer.active;
    for (let y = buf.length - 1; y >= buf.baseY; y--) {
      const line = buf.getLine(y);
      if (line && line.translateToString(true).length > 0) return y + 1;
    }
    return buf.baseY;
  }

  // Styled rows [start, start + count), clamped to the content. Converting a
  // row walks every cell, so callers ask only for the rows on screen. The
  // region can be rewritten in place by a redraw, so read it fresh after
  // writes rather than accumulating it.
  renderRange(start: number, count: number): StyledLine[] {
    const buf = this.term.buffer.active;
    const from = Math.max(0, start);
    const to = Math.min(this.lineCount(), start + count);
    const cell = buf.getNullCell();
    const out: StyledLine[] = [];
    for (let y = from; y < to; y++) {
      const line = buf.getLine(y);
      out.push(line ? this.lineToStyled(line, cell) : []);
    }
    return out;
  }

  // Walk a buffer line's cells, coalescing runs of identical style, dropping
  // trailing blank padding and the zero-width continuation cells that follow a
  // wide glyph (CJK, emoji).
  private lineToStyled(line: IBufferLine, cell: IBufferCell): StyledLine {
    const cols = line.length;
    let last = -1;
    for (let x = cols - 1; x >= 0; x--) {
      const c = line.getCell(x, cell);
      if (!c || c.getWidth() === 0) continue;
      if (!isBlank(c)) {
        last = x;
        break;
      }
    }
    if (last < 0) return [];

    const runs: StyledLine = [];
    let cur: StyledRun | undefined;
    for (let x = 0; x <= last; x++) {
      const c = line.getCell(x, cell);
      if (!c || c.getWidth() === 0) continue;
      const style = cellStyle(c);
      // A blank cell mid-line renders as a space; the wide grid has no gaps.
      const text = c.getChars() || " ";
      if (cur && styleEq(cur, style)) cur.text += text;
      else {
        cur = { text, ...style };
        runs.push(cur);
      }
    }
    return runs;
  }
}
