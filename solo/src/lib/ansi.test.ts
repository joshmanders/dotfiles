import { expect, test } from "bun:test";
import { AnsiStream, type StyledLine } from "./ansi.js";

function text(lines: StyledLine[]): string[] {
  return lines.map((line) => line.map((run) => run.text).join(""));
}

test("a \\r\\n split across chunks still emits the line", () => {
  const s = new AnsiStream();
  expect(text(s.feed("490\r\n491\r"))).toEqual(["490"]);
  expect(text(s.feed("\n492\r\n"))).toEqual(["491", "492"]);
});

// ptys emit \r\r\n for a plain newline once the line discipline has already
// returned the carriage, which is what a read boundary exposes.
test("a \\r\\r\\n line ending keeps the line", () => {
  const s = new AnsiStream();
  expect(text(s.feed("432\r\r\n433\r\r\n"))).toEqual(["432", "433"]);
});

test("a bare \\r makes the next text overwrite the line", () => {
  const s = new AnsiStream();
  expect(text(s.feed("50%\rdone\r\n"))).toEqual(["done"]);
});

test("a trailing \\r overwrites once the next chunk brings text", () => {
  const s = new AnsiStream();
  expect(text(s.feed("50%\r"))).toEqual([]);
  expect(text([s.partialLine()])).toEqual(["50%"]);
  expect(text(s.feed("100%\r\n"))).toEqual(["100%"]);
});

test("an SGR sequence split across chunks keeps its color", () => {
  const s = new AnsiStream();
  s.feed("\x1b[3");
  const lines = s.feed("1mred\x1b[0m\r\n");
  expect(text(lines)).toEqual(["red"]);
  expect(lines[0]![0]!.fg).toBe("#cd0000");
});

test("the in-progress line is readable before its newline arrives", () => {
  const s = new AnsiStream();
  expect(text(s.feed("partial"))).toEqual([]);
  expect(text([s.partialLine()])).toEqual(["partial"]);
  expect(text(s.feed(" line\r\n"))).toEqual(["partial line"]);
  expect(s.partialLine()).toEqual([]);
});
