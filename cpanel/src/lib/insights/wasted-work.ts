import type { Conversation, ConversationEntry } from "../conversations.js";

export interface WastedWorkFinding {
  filePath: string;
  edits: number;
  reason: "git-restore" | "git-checkout" | "user-undo" | "overwritten";
  sessionId: string;
  projectCwd: string;
  timestamp: number; // when revert happened
}

const REVERT_BASH = [
  /\bgit\s+restore\s+(\S+)/,
  /\bgit\s+checkout\s+(?:--\s+)?(\S+)/,
  /\bgit\s+checkout\s+HEAD\s+--\s+(\S+)/,
  /\bgit\s+reset\s+--hard\b/,
];

const USER_UNDO = /\b(?:undo|revert|throw away|start over)\b/i;

function fileEditCounts(entries: ConversationEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of entries) {
    if (e.role !== "assistant" || !e.toolUses) continue;
    for (const t of e.toolUses) {
      if (t.name !== "Edit" && t.name !== "Write") continue;
      const path = String((t.input as any).file_path ?? "");
      if (path) counts.set(path, (counts.get(path) ?? 0) + 1);
    }
  }
  return counts;
}

export function findWastedWork(conversations: Conversation[]): WastedWorkFinding[] {
  const out: WastedWorkFinding[] = [];

  for (const conv of conversations) {
    const counts = fileEditCounts(conv.entries);
    if (counts.size === 0) continue;

    // Walk the conversation chronologically. When we see a revert, attribute
    // it to the file it touched (or all edited files if a hard reset).
    for (const e of conv.entries) {
      if (e.role !== "assistant" || !e.toolUses) continue;
      for (const t of e.toolUses) {
        if (t.name === "Bash") {
          const cmd = String((t.input as any).command ?? "");
          for (const re of REVERT_BASH) {
            const m = cmd.match(re);
            if (m) {
              if (re.source.includes("reset --hard")) {
                for (const [path, edits] of counts) {
                  out.push({
                    filePath: path,
                    edits,
                    reason: "git-checkout",
                    sessionId: conv.sessionId,
                    projectCwd: conv.realCwd,
                    timestamp: e.timestamp,
                  });
                }
              } else if (m[1]) {
                const target = m[1];
                for (const [path, edits] of counts) {
                  if (path.endsWith(target) || target === path || path.includes(target)) {
                    out.push({
                      filePath: path,
                      edits,
                      reason: re.source.includes("restore") ? "git-restore" : "git-checkout",
                      sessionId: conv.sessionId,
                      projectCwd: conv.realCwd,
                      timestamp: e.timestamp,
                    });
                  }
                }
              }
              break;
            }
          }
        }
      }
      // User-initiated undo phrases
      if (e.role === "user" && e.text && !e.toolResultFor && USER_UNDO.test(e.text)) {
        for (const [path, edits] of counts) {
          out.push({
            filePath: path,
            edits,
            reason: "user-undo",
            sessionId: conv.sessionId,
            projectCwd: conv.realCwd,
            timestamp: e.timestamp,
          });
        }
      }
    }
  }

  // Dedupe per (file, sessionId, reason) keeping the highest edit count.
  const dedup = new Map<string, WastedWorkFinding>();
  for (const f of out) {
    const key = `${f.sessionId}::${f.filePath}::${f.reason}`;
    const prev = dedup.get(key);
    if (!prev || f.edits > prev.edits) dedup.set(key, f);
  }
  const final = [...dedup.values()];
  final.sort((a, b) => b.edits - a.edits || b.timestamp - a.timestamp);
  return final.slice(0, 100);
}
