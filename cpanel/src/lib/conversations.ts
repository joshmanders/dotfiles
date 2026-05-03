import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { paths, projectPathFromKey } from "./claude.js";
import { isProjectIgnored } from "./config.js";

// Filter helper used by panels that display project-attributable LISTS.
// Aggregates (totals, sparklines, weekly deltas) should keep using the
// unfiltered conversation set so the numbers reflect actual usage.
export function visibleConversations(convs: Conversation[]): Conversation[] {
  return convs.filter((c) => !isProjectIgnored(c.realCwd));
}

export interface ToolUse {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ConversationEntry {
  uuid: string;
  parentUuid?: string;
  type: string; // user | assistant | progress | system | attachment | ...
  role?: "user" | "assistant";
  timestamp: number;
  text?: string;
  toolUses?: ToolUse[];
  toolResultFor?: string; // tool_use_id when this entry is a tool_result
  toolResultText?: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheCreateTokens?: number;
  model?: string;
}

export interface Conversation {
  sessionId: string;
  projectKey: string; // dashed key as used in projects/
  realCwd: string; // resolved /Users/josh/...
  filePath: string;
  title?: string;
  startedAt: number;
  endedAt: number;
  size: number;
  entries: ConversationEntry[];
}

const CACHE_DIR = join(paths.root, ".cpanel-cache");
const CACHE_FILE = join(CACHE_DIR, "conversations.json");

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
}

function listJsonlFiles(): { path: string; size: number; mtimeMs: number; projectKey: string }[] {
  if (!existsSync(paths.projects)) return [];
  const out: { path: string; size: number; mtimeMs: number; projectKey: string }[] = [];
  for (const projectKey of readdirSync(paths.projects)) {
    const dir = join(paths.projects, projectKey);
    let projectStat;
    try {
      projectStat = statSync(dir);
    } catch {
      continue;
    }
    if (!projectStat.isDirectory()) continue;
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith(".jsonl")) continue;
      const p = join(dir, name);
      try {
        const s = statSync(p);
        out.push({ path: p, size: s.size, mtimeMs: s.mtimeMs, projectKey });
      } catch {}
    }
  }
  return out;
}

function parseTimestamp(ts: unknown): number {
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const n = Date.parse(ts);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function parseEntry(d: any): ConversationEntry | null {
  if (!d || typeof d !== "object" || !d.type) return null;

  const base: ConversationEntry = {
    uuid: d.uuid ?? "",
    parentUuid: d.parentUuid,
    type: d.type,
    timestamp: parseTimestamp(d.timestamp),
  };

  const msg = d.message;
  if (msg && typeof msg === "object") {
    base.role = msg.role === "assistant" || msg.role === "user" ? msg.role : undefined;
    base.model = msg.model;

    const usage = msg.usage;
    if (usage && typeof usage === "object") {
      base.inputTokens = usage.input_tokens;
      base.outputTokens = usage.output_tokens;
      base.cacheReadTokens = usage.cache_read_input_tokens;
      base.cacheCreateTokens = usage.cache_creation_input_tokens;
    }

    const content = msg.content;
    if (typeof content === "string") {
      base.text = content;
    } else if (Array.isArray(content)) {
      const textParts: string[] = [];
      const toolUses: ToolUse[] = [];
      for (const c of content) {
        if (!c || typeof c !== "object") continue;
        if (c.type === "text" && typeof c.text === "string") {
          textParts.push(c.text);
        } else if (c.type === "tool_use") {
          toolUses.push({
            id: c.id ?? "",
            name: c.name ?? "",
            input: c.input ?? {},
          });
        } else if (c.type === "tool_result") {
          base.toolResultFor = c.tool_use_id;
          if (typeof c.content === "string") {
            base.toolResultText = c.content;
          } else if (Array.isArray(c.content)) {
            base.toolResultText = c.content
              .map((p: any) => (typeof p === "string" ? p : p?.text ?? ""))
              .join("\n");
          }
        }
      }
      if (textParts.length > 0) base.text = textParts.join("\n");
      if (toolUses.length > 0) base.toolUses = toolUses;
    }
  }

  return base;
}

function loadConversation(filePath: string, projectKey: string, size: number): Conversation | null {
  let text: string;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
  const entries: ConversationEntry[] = [];
  let title: string | undefined;
  let sessionId = "";
  let startedAt = Number.POSITIVE_INFINITY;
  let endedAt = 0;

  for (const line of text.split("\n")) {
    if (!line) continue;
    let d: any;
    try {
      d = JSON.parse(line);
    } catch {
      continue;
    }
    if (d.type === "ai-title" && typeof d.aiTitle === "string") {
      title = d.aiTitle;
      continue;
    }
    if (typeof d.sessionId === "string" && !sessionId) sessionId = d.sessionId;
    const e = parseEntry(d);
    if (!e) continue;
    if (e.timestamp > 0) {
      if (e.timestamp < startedAt) startedAt = e.timestamp;
      if (e.timestamp > endedAt) endedAt = e.timestamp;
    }
    entries.push(e);
  }
  if (entries.length === 0) return null;

  return {
    sessionId,
    projectKey,
    realCwd: projectPathFromKey(projectKey),
    filePath,
    title,
    startedAt: startedAt === Number.POSITIVE_INFINITY ? 0 : startedAt,
    endedAt,
    size,
    entries,
  };
}

interface CacheManifest {
  version: number;
  builtAt: number;
  files: Record<string, { mtimeMs: number; size: number }>;
}

interface CacheData {
  manifest: CacheManifest;
  conversations: Conversation[];
}

const CACHE_VERSION = 1;

function readCache(): CacheData | null {
  if (!existsSync(CACHE_FILE)) return null;
  try {
    const raw = readFileSync(CACHE_FILE, "utf8");
    const data = JSON.parse(raw) as CacheData;
    if (data.manifest?.version !== CACHE_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: CacheData) {
  ensureCacheDir();
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch {}
}

let memoryCache: CacheData | null = null;

export function loadAllConversations(opts: { force?: boolean } = {}): Conversation[] {
  if (memoryCache && !opts.force) return memoryCache.conversations;

  const files = listJsonlFiles();
  const cached = opts.force ? null : readCache();

  const fresh: Conversation[] = [];
  const newManifest: CacheManifest = { version: CACHE_VERSION, builtAt: Date.now(), files: {} };

  if (cached) {
    const byPath = new Map(cached.conversations.map((c) => [c.filePath, c] as const));
    for (const f of files) {
      newManifest.files[f.path] = { mtimeMs: f.mtimeMs, size: f.size };
      const prev = cached.manifest.files[f.path];
      if (prev && prev.mtimeMs === f.mtimeMs && prev.size === f.size) {
        const cachedConv = byPath.get(f.path);
        if (cachedConv) {
          fresh.push(cachedConv);
          continue;
        }
      }
      const c = loadConversation(f.path, f.projectKey, f.size);
      if (c) fresh.push(c);
    }
  } else {
    for (const f of files) {
      newManifest.files[f.path] = { mtimeMs: f.mtimeMs, size: f.size };
      const c = loadConversation(f.path, f.projectKey, f.size);
      if (c) fresh.push(c);
    }
  }

  memoryCache = { manifest: newManifest, conversations: fresh };
  writeCache(memoryCache);
  return fresh;
}

export function clearConversationCache() {
  memoryCache = null;
}
