import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

export interface CpanelConfig {
  /**
   * Project paths to hide everywhere — Dashboard, Conversations, Cost,
   * Sessions, Insights, etc. Each entry is a path prefix; a project is
   * hidden when its cwd starts with any entry. Supports `~/` for $HOME.
   *
   * Example: `["~/Code/patientprism"]` hides every conversation, session,
   * cost row, and insight tied to that project.
   */
  ignoreProjects: string[];
}

const DEFAULTS: CpanelConfig = {
  ignoreProjects: [],
};

const CONFIG_DIR = join(homedir(), ".config", "cpanel");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

let cached: CpanelConfig | null = null;
let expandedIgnores: string[] | null = null;

// Global toggle for the `.` hotkey. When true, isProjectIgnored() and
// ignoredPrefixes() pretend the ignore list is empty so panels show
// everything. State lives here (not in React) so non-React modules
// (Search's ripgrep arg builder, the conversation cache) honor it too.
let _showHidden = false;
export function getShowHidden(): boolean {
  return _showHidden;
}
export function setShowHidden(show: boolean): void {
  _showHidden = show;
}

function expandHome(p: string): string {
  if (p === "~") return homedir();
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  return p;
}

function ensureConfigFile() {
  if (existsSync(CONFIG_FILE)) return;
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULTS, null, 2) + "\n", "utf8");
}

export function loadConfig(force = false): CpanelConfig {
  if (cached && !force) return cached;
  ensureConfigFile();
  let parsed: Partial<CpanelConfig> = {};
  try {
    parsed = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  } catch {}
  cached = {
    ...DEFAULTS,
    ...parsed,
    ignoreProjects: Array.isArray(parsed.ignoreProjects) ? parsed.ignoreProjects : [],
  };
  expandedIgnores = cached.ignoreProjects.map(expandHome);
  return cached;
}

export const CONFIG_PATH = CONFIG_FILE;

/**
 * True when `cwd` is under any configured ignored prefix. Trailing-slash
 * insensitive (`~/Code/foo` matches `~/Code/foo` AND `~/Code/foo/bar`).
 *
 * Returns false unconditionally when the global show-hidden toggle is on.
 */
export function isProjectIgnored(cwd: string | undefined): boolean {
  if (_showHidden) return false;
  if (!cwd) return false;
  if (!expandedIgnores) loadConfig();
  for (const prefix of expandedIgnores!) {
    if (cwd === prefix) return true;
    if (cwd.startsWith(prefix.endsWith("/") ? prefix : prefix + "/")) return true;
  }
  return false;
}

/**
 * Expanded ignore prefixes ($HOME resolved). Returns empty when the global
 * show-hidden toggle is on so callers (Search's ripgrep glob builder) can
 * skip emitting exclusion args.
 */
export function ignoredPrefixes(): string[] {
  if (_showHidden) return [];
  if (!expandedIgnores) loadConfig();
  return expandedIgnores!;
}
