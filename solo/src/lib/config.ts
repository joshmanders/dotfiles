import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse, stringify } from "yaml";

export type RestartPolicy = "never" | "on-fail" | "always";

export interface CommandConfig {
  name: string;
  command: string;
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
        !!c && typeof c.name === "string" && typeof c.command === "string",
    ),
  };
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
