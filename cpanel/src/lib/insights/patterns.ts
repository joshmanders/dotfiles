import type { Conversation, ConversationEntry } from "../conversations.js";

export interface PatternFinding {
  sequence: string[]; // human-readable steps, e.g. "Bash:git status"
  occurrences: number;
  sessions: number; // distinct sessions
  examples: { sessionId: string; projectCwd: string; timestamp: number }[];
}

const MIN_LEN = 3;
const MAX_LEN = 5;
const MIN_OCCURRENCES = 3;

function stepLabel(t: { name: string; input: Record<string, unknown> }): string {
  const name = t.name || "?";
  const input = t.input || {};
  // Add a discriminator for tools where the action keyword matters.
  if (name === "Bash") {
    const cmd = String((input as any).command ?? "").trim().split(/\s+/).slice(0, 2).join(" ");
    return `Bash:${cmd || "?"}`;
  }
  if (name === "Edit" || name === "Write" || name === "Read" || name === "Grep" || name === "Glob") {
    const target = String((input as any).file_path ?? (input as any).pattern ?? "");
    const ext = target.match(/\.([a-zA-Z0-9]+)$/)?.[1];
    return ext ? `${name}:${ext}` : name;
  }
  if (name === "Agent") {
    const sub = (input as any).subagent_type ?? "?";
    return `Agent:${sub}`;
  }
  if (name === "Skill") {
    const skill = (input as any).skill ?? "?";
    return `Skill:${skill}`;
  }
  return name;
}

function extractToolSequence(entries: ConversationEntry[]): string[] {
  const out: string[] = [];
  for (const e of entries) {
    if (e.role !== "assistant" || !e.toolUses) continue;
    for (const t of e.toolUses) out.push(stepLabel(t));
  }
  return out;
}

export function findToolPatterns(conversations: Conversation[]): PatternFinding[] {
  // Map from sequence-key -> occurrences and example sessions.
  const counts = new Map<string, { steps: string[]; total: number; sessions: Set<string>; examples: PatternFinding["examples"] }>();

  for (const conv of conversations) {
    const seq = extractToolSequence(conv.entries);
    if (seq.length < MIN_LEN) continue;

    for (let len = MIN_LEN; len <= MAX_LEN; len++) {
      for (let i = 0; i + len <= seq.length; i++) {
        const sub = seq.slice(i, i + len);
        // Skip n-grams with a repeating single tool (just noise like Read,Read,Read).
        if (sub.every((s) => s === sub[0])) continue;
        const key = sub.join(" → ");
        let bucket = counts.get(key);
        if (!bucket) {
          bucket = { steps: sub, total: 0, sessions: new Set(), examples: [] };
          counts.set(key, bucket);
        }
        bucket.total++;
        bucket.sessions.add(conv.sessionId);
        if (bucket.examples.length < 5) {
          bucket.examples.push({
            sessionId: conv.sessionId,
            projectCwd: conv.realCwd,
            timestamp: conv.startedAt,
          });
        }
      }
    }
  }

  const findings: PatternFinding[] = [];
  for (const { steps, total, sessions, examples } of counts.values()) {
    if (total < MIN_OCCURRENCES) continue;
    if (sessions.size < 2) continue; // must recur across sessions, not just within one
    findings.push({ sequence: steps, occurrences: total, sessions: sessions.size, examples });
  }
  // Rank by total occurrences × cross-session breadth, with a bonus for length.
  findings.sort((a, b) => {
    const sa = a.occurrences * a.sessions * a.sequence.length;
    const sb = b.occurrences * b.sessions * b.sequence.length;
    return sb - sa;
  });
  return findings.slice(0, 50);
}
