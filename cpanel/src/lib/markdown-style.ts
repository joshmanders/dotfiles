import { SyntaxStyle } from "@opentui/core";

let cached: SyntaxStyle | null = null;

// Default style for the <markdown> renderer. Without registered styles for these
// scope names, headings/bold/italic/etc. fall back to plain text.
// Scope names discovered from @opentui/core/index-d07rkqtc.js.
export function markdownSyntaxStyle(): SyntaxStyle {
  if (cached) return cached;
  cached = SyntaxStyle.fromStyles({
    "markup.heading": { fg: "#FFAA00", bold: true },
    "markup.strong": { fg: "#FFFFFF", bold: true },
    "markup.italic": { fg: "#FFFFFF", italic: true },
    "markup.strikethrough": { fg: "#888888", dim: true },
    "markup.raw": { fg: "#00FFAA" },
    "markup.link": { fg: "#5599FF", underline: true },
    "markup.link.label": { fg: "#5599FF" },
    "markup.link.url": { fg: "#5599FF", underline: true },
  });
  return cached;
}
