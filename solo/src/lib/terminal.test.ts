import { expect, test } from "bun:test";
import { TerminalEmulator, type StyledLine } from "./terminal.js";

function text(lines: StyledLine[]): string[] {
  return lines.map((line) => line.map((run) => run.text).join(""));
}

function all(t: TerminalEmulator): StyledLine[] {
  return t.renderRange(0, t.lineCount());
}

test("plain lines render in order", () => {
  const t = new TerminalEmulator(20, 5);
  t.write("one\r\ntwo\r\nthree\r\n");
  expect(text(all(t))).toEqual(["one", "two", "three"]);
});

// The whole point of the emulator: a cursor-up redraw overwrites the earlier
// frame in place instead of appending a second copy of the block.
test("a cursor-up redraw collapses to the final frame", () => {
  const t = new TerminalEmulator(20, 5);
  t.write("a: 1\r\nb: 1\r\nc: 1\r\n");
  t.write("\x1b[3Aa: 2\r\nb: 2\r\nc: 2\r\n");
  expect(text(all(t))).toEqual(["a: 2", "b: 2", "c: 2"]);
});

test("a bare \\r overwrites the current line", () => {
  const t = new TerminalEmulator(20, 5);
  t.write("50%\rdone\r\n");
  expect(text(all(t))).toEqual(["done"]);
});

test("trailing blank padding is trimmed off each line", () => {
  const t = new TerminalEmulator(20, 5);
  t.write("hi\r\n");
  expect(all(t)[0]).toHaveLength(1);
  expect(text(all(t))).toEqual(["hi"]);
});

test("renderRange returns just the requested window", () => {
  const t = new TerminalEmulator(20, 5, 5000);
  for (let i = 1; i <= 200; i++) t.write(`line ${i}\r\n`);
  expect(t.lineCount()).toBe(200);
  const out = text(t.renderRange(150, 20));
  expect(out).toHaveLength(20);
  expect(out[0]).toBe("line 151");
  expect(out.at(-1)).toBe("line 170");
  expect(text(t.renderRange(190, 50))).toHaveLength(10);
});

test("reset clears the buffer", () => {
  const t = new TerminalEmulator(20, 5);
  t.write("gone\r\n");
  t.reset();
  expect(all(t)).toEqual([]);
});

test("SGR colors map to the palette and truecolor hexes", () => {
  const t = new TerminalEmulator(20, 5);
  // palette red (31), 256-color 196, and truecolor 10,20,30
  t.write("\x1b[31mA\x1b[0m\x1b[38;5;196mB\x1b[0m\x1b[38;2;10;20;30mC\x1b[0m\r\n");
  const runs = all(t)[0]!;
  const byText = Object.fromEntries(runs.map((r) => [r.text, r]));
  expect(byText["A"]!.fg).toBe("#cd0000");
  expect(byText["B"]!.fg).toBe("#ff0000");
  expect(byText["C"]!.fg).toBe("#0a141e");
});

test("bold, dim, italic and underline attributes are carried through", () => {
  const t = new TerminalEmulator(20, 5);
  t.write("\x1b[1mA\x1b[0m\x1b[2mB\x1b[0m\x1b[3mC\x1b[0m\x1b[4mD\x1b[0m\r\n");
  const runs = all(t)[0]!;
  const byText = Object.fromEntries(runs.map((r) => [r.text, r]));
  expect(byText["A"]!.bold).toBe(true);
  expect(byText["B"]!.dim).toBe(true);
  expect(byText["C"]!.italic).toBe(true);
  expect(byText["D"]!.underline).toBe(true);
});

test("wide glyphs keep their width-0 continuation cell out of the text", () => {
  const t = new TerminalEmulator(20, 5);
  t.write("A世B\r\n");
  expect(text(all(t))).toEqual(["A世B"]);
});
