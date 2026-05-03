import type { Conversation, ConversationEntry } from "../conversations.js";

export interface CorrectionFinding {
  marker: string;
  userText: string;
  precedingAssistant?: string;
  sessionId: string;
  projectCwd: string;
  timestamp: number;
  filePath: string;
}

export interface CorrectionGroup {
  marker: string;
  count: number;
  findings: CorrectionFinding[];
}

// Phrases indicating Josh is correcting / pushing back. Ordered most-specific
// first so we attribute each match to the strongest signal.
const MARKERS: { regex: RegExp; label: string }[] = [
  { regex: /\bi (?:already )?told you\b/i, label: "i told you" },
  { regex: /\byou keep\b/i, label: "you keep" },
  { regex: /\bstop (?:doing|trying)\b/i, label: "stop doing" },
  { regex: /\bdon'?t (?:do|use|add|create|make|change|touch|forget|just)\b/i, label: "don't ..." },
  { regex: /\bwhy (?:did|are|do) you\b/i, label: "why did you" },
  { regex: /\bnot (?:like )?that\b/i, label: "not that" },
  { regex: /\binstead of\b/i, label: "instead of" },
  { regex: /\bthat'?s (?:not |the )?(?:wrong|right|correct)\b/i, label: "that's wrong/right" },
  { regex: /\bagain\b/i, label: "again" },
  { regex: /\bsame thing\b/i, label: "same thing" },
  { regex: /^no[,. ]/i, label: "no," },
  { regex: /^stop\b/i, label: "stop" },
  { regex: /\bwait[,.]?\s+(?:why|what|no)\b/i, label: "wait, why" },
  { regex: /\bplease (?:stop|don'?t)\b/i, label: "please stop" },
];

const MAX_USER_LEN = 800;
const MAX_ASSISTANT_LEN = 600;

function trim(s: string | undefined, max: number): string | undefined {
  if (!s) return s;
  const cleaned = s.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1) + "…";
}

function findPrecedingAssistant(entries: ConversationEntry[], idx: number): string | undefined {
  for (let i = idx - 1; i >= 0; i--) {
    const e = entries[i];
    if (!e) continue;
    if (e.role === "assistant" && e.text) return e.text;
  }
  return undefined;
}

// User messages may include long pasted/system content. We only treat a user
// turn as a "real" message if it's a direct text message (not a tool_result
// and not framework-injected metadata).
function isUserPrompt(e: ConversationEntry): boolean {
  if (e.role !== "user") return false;
  if (e.toolResultFor) return false;
  if (!e.text) return false;
  if (e.text.length > 4000) return false; // skip giant pasted blobs
  return true;
}

export function findCorrections(conversations: Conversation[]): CorrectionGroup[] {
  const byMarker = new Map<string, CorrectionFinding[]>();

  for (const conv of conversations) {
    for (let i = 0; i < conv.entries.length; i++) {
      const e = conv.entries[i]!;
      if (!isUserPrompt(e)) continue;
      const text = e.text!;
      // Match the FIRST applicable marker so each correction is counted once.
      for (const { regex, label } of MARKERS) {
        if (regex.test(text)) {
          const finding: CorrectionFinding = {
            marker: label,
            userText: trim(text, MAX_USER_LEN)!,
            precedingAssistant: trim(findPrecedingAssistant(conv.entries, i), MAX_ASSISTANT_LEN),
            sessionId: conv.sessionId,
            projectCwd: conv.realCwd,
            timestamp: e.timestamp,
            filePath: conv.filePath,
          };
          if (!byMarker.has(label)) byMarker.set(label, []);
          byMarker.get(label)!.push(finding);
          break;
        }
      }
    }
  }

  const groups: CorrectionGroup[] = [];
  for (const [marker, findings] of byMarker) {
    findings.sort((a, b) => b.timestamp - a.timestamp);
    groups.push({ marker, count: findings.length, findings });
  }
  groups.sort((a, b) => b.count - a.count);
  return groups;
}
