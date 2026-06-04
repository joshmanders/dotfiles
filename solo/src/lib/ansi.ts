// Minimal ANSI parser. Tracks SGR (color/bold/etc.) state across chunks
// and emits styled runs split into lines. Cursor/screen escapes are
// consumed and discarded — solo's output pane is append-only scrollback,
// not a real terminal emulator, so motion sequences would do more harm
// than good. `\r` clears the current partial line (handles progress bars
// that overwrite with `\r`).

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
// colors stay legible.
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

function applyCodes(style: Style, codes: number[]): Style {
  let s: Style = { ...style };
  for (let i = 0; i < codes.length; i++) {
    const c = codes[i]!;
    if (c === 0) {
      s = {};
      continue;
    }
    if (c === 1) s.bold = true;
    else if (c === 2) s.dim = true;
    else if (c === 3) s.italic = true;
    else if (c === 4) s.underline = true;
    else if (c === 22) {
      s.bold = false;
      s.dim = false;
    } else if (c === 23) s.italic = false;
    else if (c === 24) s.underline = false;
    else if (c >= 30 && c <= 37) s.fg = STD16[c - 30];
    else if (c === 38) {
      if (codes[i + 1] === 5) {
        s.fg = color256(codes[i + 2] ?? 0);
        i += 2;
      } else if (codes[i + 1] === 2) {
        s.fg = rgb(codes[i + 2] ?? 0, codes[i + 3] ?? 0, codes[i + 4] ?? 0);
        i += 4;
      }
    } else if (c === 39) s.fg = undefined;
    else if (c >= 40 && c <= 47) s.bg = STD16[c - 40];
    else if (c === 48) {
      if (codes[i + 1] === 5) {
        s.bg = color256(codes[i + 2] ?? 0);
        i += 2;
      } else if (codes[i + 1] === 2) {
        s.bg = rgb(codes[i + 2] ?? 0, codes[i + 3] ?? 0, codes[i + 4] ?? 0);
        i += 4;
      }
    } else if (c === 49) s.bg = undefined;
    else if (c >= 90 && c <= 97) s.fg = STD16[c - 90 + 8];
    else if (c >= 100 && c <= 107) s.bg = STD16[c - 100 + 8];
  }
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

export class AnsiStream {
  private style: Style = {};
  private partial: StyledLine = [];
  private prepend = ""; // bytes from previous feed() that ended mid-sequence

  feed(chunk: string): StyledLine[] {
    const data = this.prepend + chunk;
    this.prepend = "";
    const out: StyledLine[] = [];
    let buf = "";
    let i = 0;

    const flush = () => {
      if (!buf) return;
      const last = this.partial[this.partial.length - 1];
      if (last && styleEq(last, this.style)) last.text += buf;
      else this.partial.push({ text: buf, ...this.style });
      buf = "";
    };

    while (i < data.length) {
      const c = data[i]!;
      if (c === "\x1b") {
        flush();
        const next = data[i + 1];
        if (next === "[") {
          // CSI: ESC [ params final-byte
          let j = i + 2;
          while (j < data.length) {
            const code = data.charCodeAt(j);
            if (code >= 0x40 && code <= 0x7e) break;
            j++;
          }
          if (j >= data.length) {
            this.prepend = data.slice(i);
            break;
          }
          const final = data[j];
          if (final === "m") {
            const params = data.slice(i + 2, j);
            const codes =
              params === ""
                ? [0]
                : params.split(";").map((s) => parseInt(s, 10) || 0);
            this.style = applyCodes(this.style, codes);
          }
          i = j + 1;
        } else if (next === "]") {
          // OSC: ESC ] ... (BEL | ESC \)
          let j = i + 2;
          while (j < data.length) {
            if (data[j] === "\x07") break;
            if (data[j] === "\x1b" && data[j + 1] === "\\") break;
            j++;
          }
          if (j >= data.length) {
            this.prepend = data.slice(i);
            break;
          }
          i = j + (data[j] === "\x07" ? 1 : 2);
        } else if (next === undefined) {
          this.prepend = data.slice(i);
          break;
        } else {
          // Two-byte escape (ESC = > 7 8 c M etc.) — skip both.
          i += 2;
        }
      } else if (c === "\n") {
        flush();
        out.push(this.partial);
        this.partial = [];
        i++;
      } else if (c === "\r") {
        // Two cases:
        //   \r\n — just a line ending. Skip the \r; the \n handler emits.
        //   \r alone — progress-bar overwrite. Clear the in-progress line so
        //   the next overwrite frame replaces it instead of stacking.
        if (data[i + 1] === "\n") {
          i++;
          continue;
        }
        flush();
        this.partial = [];
        i++;
      } else if (c === "\x08") {
        // Backspace — strip last char of last run.
        flush();
        const last = this.partial[this.partial.length - 1];
        if (last && last.text.length > 0) {
          last.text = last.text.slice(0, -1);
          if (last.text === "") this.partial.pop();
        }
        i++;
      } else {
        buf += c;
        i++;
      }
    }
    flush();
    return out;
  }

  partialLine(): StyledLine {
    return this.partial;
  }
}
