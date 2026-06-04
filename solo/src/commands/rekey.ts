import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, renameSync } from "node:fs";
import { basename, join } from "node:path";
import { parse } from "yaml";
import { configDir } from "../lib/config.js";

interface Result {
  renamed: number;
  correct: number;
  skipped: number;
  collisions: number;
}

// Rename a config file (or every config file, if no hash given) so its
// sha1-hash filename matches its current `directory:` field. Use this
// after editing a config's `directory:` value — e.g. you renamed the
// project on disk.
export function rekey(args: string[]): number {
  const dir = configDir();
  if (!existsSync(dir)) {
    console.error(`solo rekey: ${dir} does not exist`);
    return 1;
  }

  const hash = args[0];
  let targets: string[];
  if (hash) {
    const path = join(dir, `${hash}.yaml`);
    if (!existsSync(path)) {
      console.error(`solo rekey: ${path} does not exist`);
      return 1;
    }
    targets = [path];
  } else {
    targets = readdirSync(dir)
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => join(dir, f));
    if (targets.length === 0) {
      console.log(`solo rekey: no configs in ${dir}`);
      return 0;
    }
  }

  const result: Result = { renamed: 0, correct: 0, skipped: 0, collisions: 0 };
  for (const path of targets) rekeyOne(path, dir, result);

  if (!hash) {
    const parts = [
      `${result.renamed} renamed`,
      `${result.correct} already correct`,
    ];
    if (result.skipped > 0) parts.push(`${result.skipped} skipped`);
    if (result.collisions > 0) parts.push(`${result.collisions} collisions`);
    console.log(`\nDone. ${parts.join(", ")}.`);
  }

  return result.collisions > 0 || result.skipped > 0 ? 1 : 0;
}

function rekeyOne(path: string, dir: string, result: Result): void {
  const name = basename(path);
  let directory: string | undefined;
  try {
    const parsed = parse(readFileSync(path, "utf8")) as {
      directory?: unknown;
    } | null;
    if (parsed && typeof parsed.directory === "string")
      directory = parsed.directory;
  } catch (err) {
    console.warn(`${name}: parse error — ${(err as Error).message}`);
    result.skipped++;
    return;
  }

  if (!directory) {
    console.warn(`${name}: missing or invalid \`directory:\` field`);
    result.skipped++;
    return;
  }

  const expected = createHash("sha1").update(directory).digest("hex") + ".yaml";
  if (name === expected) {
    console.log(`already correct: ${name} → ${directory}`);
    result.correct++;
    return;
  }

  const target = join(dir, expected);
  if (existsSync(target)) {
    console.warn(
      `${name}: target ${expected} already exists (would overwrite a different config) — skipped`,
    );
    result.collisions++;
    return;
  }

  renameSync(path, target);
  console.log(`${name} → ${expected}  (${directory})`);
  result.renamed++;
}
