import type { Conversation, ConversationEntry } from "../conversations.js";

export type StuckLoopKind = "file-thrash" | "repeated-error" | "try-cycle";

export interface StuckLoopFinding {
  kind: StuckLoopKind;
  signal: string;
  sessionId: string;
  projectCwd: string;
  timestamp: number;
  filePath: string;
  detail?: string;
}

const FILE_THRASH_MIN_EDITS = 5;
const FILE_THRASH_WINDOW_MS = 10 * 60 * 1000; // 10 min

const TRY_CYCLE_MIN = 3;
const TRY_CYCLE_REGEX = /^(?:let me try|let me check|let's try|let me look|trying again|maybe|perhaps)/i;

const ERROR_HINTS = [
  /\bError:\s*([^\n]{8,200})/,
  /\bTypeError:\s*([^\n]{8,200})/,
  /\bSyntaxError:\s*([^\n]{8,200})/,
  /\b(?:failed|cannot|unable to)[^\n]{8,200}/i,
];

function detectFileThrash(conv: Conversation, out: StuckLoopFinding[]) {
  // edit_events: list of { path, ts } from Edit/Write tool_use input.
  const events: { path: string; ts: number }[] = [];
  for (const e of conv.entries) {
    if (e.role !== "assistant" || !e.toolUses) continue;
    for (const t of e.toolUses) {
      if (t.name !== "Edit" && t.name !== "Write") continue;
      const path = String((t.input as any).file_path ?? "");
      if (!path) continue;
      events.push({ path, ts: e.timestamp });
    }
  }
  // Group by path, sort by time, then look for windows with >= MIN edits.
  const byPath = new Map<string, number[]>();
  for (const e of events) {
    if (!byPath.has(e.path)) byPath.set(e.path, []);
    byPath.get(e.path)!.push(e.ts);
  }
  for (const [path, times] of byPath) {
    if (times.length < FILE_THRASH_MIN_EDITS) continue;
    times.sort((a, b) => a - b);
    let bestStart = 0;
    let bestCount = 0;
    let l = 0;
    for (let r = 0; r < times.length; r++) {
      while (times[r]! - times[l]! > FILE_THRASH_WINDOW_MS) l++;
      const count = r - l + 1;
      if (count > bestCount) {
        bestCount = count;
        bestStart = l;
      }
    }
    if (bestCount >= FILE_THRASH_MIN_EDITS) {
      const startTs = times[bestStart]!;
      const endTs = times[bestStart + bestCount - 1]!;
      const minutes = Math.max(1, Math.round((endTs - startTs) / 60000));
      const short = path.split("/").slice(-2).join("/");
      out.push({
        kind: "file-thrash",
        signal: `${short} edited ${bestCount}× in ${minutes}m`,
        sessionId: conv.sessionId,
        projectCwd: conv.realCwd,
        timestamp: startTs,
        filePath: conv.filePath,
        detail: path,
      });
    }
  }
}

function normalizeError(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 200);
}

function detectRepeatedError(conv: Conversation, out: StuckLoopFinding[]) {
  const counts = new Map<string, { count: number; firstTs: number }>();
  for (const e of conv.entries) {
    const text = e.toolResultText || (e.role === "user" && e.toolResultFor ? e.text : undefined);
    if (!text) continue;
    for (const re of ERROR_HINTS) {
      const m = text.match(re);
      if (m) {
        const key = normalizeError(m[1] ?? m[0]);
        if (!counts.has(key)) counts.set(key, { count: 0, firstTs: e.timestamp });
        counts.get(key)!.count++;
        break;
      }
    }
  }
  for (const [errText, { count, firstTs }] of counts) {
    if (count < 3) continue;
    out.push({
      kind: "repeated-error",
      signal: `error ×${count}: ${errText.slice(0, 80)}…`,
      sessionId: conv.sessionId,
      projectCwd: conv.realCwd,
      timestamp: firstTs,
      filePath: conv.filePath,
      detail: errText,
    });
  }
}

function detectTryCycles(conv: Conversation, out: StuckLoopFinding[]) {
  let consecutive = 0;
  let runStart = 0;
  for (const e of conv.entries) {
    if (e.role !== "assistant" || !e.text) continue;
    const firstLine = e.text.trim().split(/\n/, 1)[0] ?? "";
    if (TRY_CYCLE_REGEX.test(firstLine)) {
      if (consecutive === 0) runStart = e.timestamp;
      consecutive++;
    } else {
      if (consecutive >= TRY_CYCLE_MIN) {
        out.push({
          kind: "try-cycle",
          signal: `${consecutive} consecutive "let me try…" turns`,
          sessionId: conv.sessionId,
          projectCwd: conv.realCwd,
          timestamp: runStart,
          filePath: conv.filePath,
        });
      }
      consecutive = 0;
    }
  }
  if (consecutive >= TRY_CYCLE_MIN) {
    out.push({
      kind: "try-cycle",
      signal: `${consecutive} consecutive "let me try…" turns`,
      sessionId: conv.sessionId,
      projectCwd: conv.realCwd,
      timestamp: runStart,
      filePath: conv.filePath,
    });
  }
}

export function findStuckLoops(conversations: Conversation[]): StuckLoopFinding[] {
  const out: StuckLoopFinding[] = [];
  for (const conv of conversations) {
    detectFileThrash(conv, out);
    detectRepeatedError(conv, out);
    detectTryCycles(conv, out);
  }
  out.sort((a, b) => b.timestamp - a.timestamp);
  return out;
}
