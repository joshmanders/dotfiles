import { spawnSync } from "node:child_process";
import type { CliRenderer } from "@opentui/core";

export function openInEditor(renderer: CliRenderer | null, path: string): void {
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  try {
    renderer?.suspend();
    spawnSync(editor, [path], { stdio: "inherit" });
  } finally {
    renderer?.resume();
  }
}
