// Anthropic pricing per million tokens. Rates are best-effort and may drift —
// adjust here when models or pricing change. Costs are approximate and meant
// for relative comparison, not billing reconciliation.

export interface ModelRate {
  input: number; // $ per 1M input tokens
  output: number; // $ per 1M output tokens
  cacheRead: number; // $ per 1M cache-read tokens (typically ~10% of input)
  cacheWrite: number; // $ per 1M cache-creation tokens (5m TTL by default)
}

const RATES: { match: RegExp; rate: ModelRate }[] = [
  { match: /opus/i, rate: { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 } },
  { match: /sonnet/i, rate: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 } },
  { match: /haiku/i, rate: { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1.25 } },
];

export function rateFor(model: string | undefined): ModelRate | null {
  if (!model) return null;
  for (const { match, rate } of RATES) if (match.test(model)) return rate;
  return null;
}

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheCreateTokens?: number;
  model?: string;
}

export function costOf(usage: TokenUsage): number {
  const r = rateFor(usage.model);
  if (!r) return 0;
  return (
    (usage.inputTokens ?? 0) * r.input / 1_000_000 +
    (usage.outputTokens ?? 0) * r.output / 1_000_000 +
    (usage.cacheReadTokens ?? 0) * r.cacheRead / 1_000_000 +
    (usage.cacheCreateTokens ?? 0) * r.cacheWrite / 1_000_000
  );
}

export function formatUSD(n: number): string {
  if (n < 0.01) return "<$0.01";
  if (n < 1) return `$${n.toFixed(2)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  if (n < 10_000) return `$${n.toFixed(0)}`;
  return `$${(n / 1000).toFixed(1)}k`;
}
