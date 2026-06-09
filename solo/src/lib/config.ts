import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse, stringify } from "yaml";

export type RestartPolicy = "never" | "on-fail" | "always";

export interface TailConfig {
  // File to tail. Resolved relative to the command's cwd if not absolute.
  file: string;
  // -n flag. Omitted from the tail invocation if not set.
  lines?: number;
  // --retry: keep trying if the file doesn't exist yet.
  retry?: boolean;
}

export interface CommandConfig {
  name: string;
  // Exactly one of command / tail is required. Validated on load.
  command?: string;
  tail?: TailConfig;
  cwd?: string;
  autostart?: boolean;
  env?: Record<string, string>;
  restart?: RestartPolicy;
  interactive?: boolean;
}

export interface SoloConfig {
  directory: string;
  commands: CommandConfig[];
}

const CONFIG_DIR = join(homedir(), ".config", "solo");

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function configDir(): string {
  return CONFIG_DIR;
}

export function pathForCwd(cwd: string): string {
  const slug = createHash("sha1").update(cwd).digest("hex");
  return join(CONFIG_DIR, `${slug}.yaml`);
}

export function loadConfig(cwd: string): SoloConfig | null {
  const path = pathForCwd(cwd);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  const parsed = parse(raw) as Partial<SoloConfig> | null;
  if (!parsed || !Array.isArray(parsed.commands)) {
    return { directory: cwd, commands: [] };
  }
  return {
    directory: parsed.directory ?? cwd,
    commands: parsed.commands.filter(
      (c): c is CommandConfig =>
        !!c &&
        typeof c.name === "string" &&
        // exactly one of command / tail.file must be present
        (typeof c.command === "string") !==
          (!!c.tail && typeof c.tail.file === "string"),
    ),
  };
}

// Build the shell-ready command line for an entry. `tail` config is expanded
// to a `tail` invocation; otherwise the raw `command` string is used.
export function resolveCommand(cfg: CommandConfig): string {
  if (cfg.tail) return buildTailCommand(cfg.tail);
  return cfg.command ?? "";
}

export function buildTailCommand(t: TailConfig): string {
  // -F is always used: it follows by name and reopens on rotation/truncate,
  // which is what you want for log tailing in every realistic scenario.
  const parts = ["tail", "-F"];
  if (typeof t.lines === "number") parts.push("-n", String(t.lines));
  if (t.retry) parts.push("--retry");
  // Quote the file path defensively in case of spaces.
  parts.push(shellQuote(t.file));
  return parts.join(" ");
}

function shellQuote(s: string): string {
  if (/^[A-Za-z0-9_./-]+$/.test(s)) return s;
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

export function saveConfig(config: SoloConfig): void {
  ensureConfigDir();
  const path = pathForCwd(config.directory);
  writeFileSync(path, stringify(config), "utf8");
}

export function upsertCommand(
  config: SoloConfig,
  cmd: CommandConfig,
  replaceName?: string,
): SoloConfig {
  const key = replaceName ?? cmd.name;
  const next = config.commands.filter((c) => c.name !== key);
  next.push(cmd);
  return { ...config, commands: next };
}

export function removeCommand(config: SoloConfig, name: string): SoloConfig {
  return {
    ...config,
    commands: config.commands.filter((c) => c.name !== name),
  };
}

export function isLazy(cmd: CommandConfig): boolean {
  return !cmd.autostart;
}
