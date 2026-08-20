import { afterEach, expect, test } from "bun:test";
import { tmpdir } from "node:os";
import {
  MAX_LINES,
  ProcessManager,
  type ProcessManagerOptions,
  type ProcSnapshot,
  type ProcStatus,
} from "./process.js";
import type { StyledLine } from "./terminal.js";

// Commands run under `$SHELL -lc`. Pin bash so a slow or exotic login profile
// can't skew the timing assertions below.
process.env.SHELL = "/bin/bash";

let manager: ProcessManager | undefined;

afterEach(async () => {
  if (!manager) return;
  manager.removeAllListeners();
  await manager.shutdown();
  manager = undefined;
});

function makeManager(options: ProcessManagerOptions = {}): ProcessManager {
  manager = new ProcessManager(tmpdir(), options);
  return manager;
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 10_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("timed out waiting for state");
    await Bun.sleep(10);
  }
}

function proc(pm: ProcessManager, name: string): ProcSnapshot {
  const snap = pm.get(name);
  if (!snap) throw new Error(`no process named ${name}`);
  return snap;
}

function settled(pm: ProcessManager, name: string): boolean {
  const status = proc(pm, name).status;
  return status === "exited" || status === "failed";
}

function text(lines: StyledLine[]): string[] {
  return lines.map((line) => line.map((run) => run.text).join(""));
}

test("surfaces the child's real exit code", async () => {
  const pm = makeManager();
  pm.register({ name: "boom", command: "exit 7" });
  pm.start("boom");
  await waitFor(() => settled(pm, "boom"));

  expect(proc(pm, "boom").exitCode).toBe(7);
  expect(proc(pm, "boom").status).toBe("failed");
});

test("a zero exit is not a failure and does not trigger on-fail restart", async () => {
  const pm = makeManager({ restartBaseMs: 20 });
  pm.register({ name: "ok", command: "exit 0", restart: "on-fail" });
  pm.start("ok");
  await waitFor(() => settled(pm, "ok"));
  await Bun.sleep(300);

  expect(proc(pm, "ok").exitCode).toBe(0);
  expect(proc(pm, "ok").status).toBe("exited");
  expect(proc(pm, "ok").restarts).toBe(0);
});

test("a signal death reports a non-zero code and counts as failure", async () => {
  const pm = makeManager();
  pm.register({ name: "killed", command: "kill -TERM $$" });
  pm.start("killed");
  await waitFor(() => settled(pm, "killed"));

  expect(proc(pm, "killed").exitCode).toBe(143);
  expect(proc(pm, "killed").status).toBe("failed");
});

test("a crash loop gives up at the attempt cap instead of respawning forever", async () => {
  const pm = makeManager({
    restartBaseMs: 20,
    restartMaxMs: 40,
    restartMaxAttempts: 3,
  });
  pm.register({ name: "loop", command: "exit 1", restart: "on-fail" });
  pm.start("loop");

  await waitFor(() => proc(pm, "loop").restarts === 3);
  await waitFor(() => settled(pm, "loop"));
  // Well past the point where an uncapped restarter would have gone again.
  await Bun.sleep(1000);

  expect(proc(pm, "loop").restarts).toBe(3);
  expect(proc(pm, "loop").status).toBe("failed");
  expect(text(proc(pm, "loop").lines)).toContain(
    "solo: giving up after 3 restart attempts",
  );
}, 20_000);

test("each restart waits longer than the last", async () => {
  const pm = makeManager({
    restartBaseMs: 250,
    restartMaxMs: 5_000,
    restartMaxAttempts: 3,
  });
  const spawns: number[] = [];
  let last: ProcStatus | undefined;
  pm.on("change", () => {
    const status = pm.get("slow")?.status;
    if (status === "running" && last !== "running") spawns.push(Date.now());
    last = status;
  });
  pm.register({ name: "slow", command: "exit 1", restart: "on-fail" });
  pm.start("slow");

  await waitFor(() => spawns.length === 4, 20_000);
  const gaps = spawns.slice(1).map((t, i) => t - spawns[i]!);

  expect(gaps[1]! - gaps[0]!).toBeGreaterThan(150);
  expect(gaps[2]! - gaps[1]!).toBeGreaterThan(350);
}, 30_000);

test("stopping during the backoff window cancels the pending restart", async () => {
  const pm = makeManager({ restartBaseMs: 1_000, restartMaxAttempts: 5 });
  pm.register({ name: "waiting", command: "exit 1", restart: "on-fail" });
  pm.start("waiting");

  await waitFor(() => proc(pm, "waiting").restarts === 1);
  pm.stop("waiting");
  await Bun.sleep(1_500);

  expect(proc(pm, "waiting").status).toBe("exited");
  expect(proc(pm, "waiting").restarts).toBe(1);
}, 20_000);

test("a manual stop suppresses an always-restart policy", async () => {
  const pm = makeManager({ restartBaseMs: 20 });
  pm.register({ name: "forever", command: "sleep 30", restart: "always" });
  pm.start("forever");
  await waitFor(() => proc(pm, "forever").status === "running");

  pm.stop("forever");
  await waitFor(() => settled(pm, "forever"));
  await Bun.sleep(500);

  expect(proc(pm, "forever").status).toBe("exited");
  expect(proc(pm, "forever").exitCode).toBe(0);
  expect(proc(pm, "forever").restarts).toBe(0);
}, 20_000);

test("output arrives complete and in order", async () => {
  const pm = makeManager();
  pm.register({ name: "seq", command: "seq 1 500" });
  pm.start("seq");
  await waitFor(() => settled(pm, "seq"));

  const emitted = text(proc(pm, "seq").lines).filter((l) => l.length > 0);
  expect(emitted.slice(0, 500)).toEqual(
    Array.from({ length: 500 }, (_, i) => String(i + 1)),
  );
}, 20_000);

test("change events coalesce instead of firing per output chunk", async () => {
  const pm = makeManager({ flushIntervalMs: 200 });
  let changes = 0;
  pm.on("change", () => changes++);
  pm.register({
    name: "chatty",
    command: "for i in $(seq 1 40); do echo line $i; sleep 0.01; done",
  });
  pm.start("chatty");
  await waitFor(() => settled(pm, "chatty"));

  // Output streams over ~400ms, which is ~27 poll ticks. Emitting per chunk
  // would put `changes` in that range; one flush per 200ms window cannot.
  expect(changes).toBeLessThan(12);
  expect(text(proc(pm, "chatty").lines)).toContain("line 40");
}, 20_000);

test("the last chunk of output still lands after the burst ends", async () => {
  const pm = makeManager({ flushIntervalMs: 200 });
  let lastSeen: string[] = [];
  pm.on("change", () => {
    lastSeen = text(proc(pm, "tail").lines);
  });
  pm.register({ name: "tail", command: "seq 1 200" });
  pm.start("tail");
  await waitFor(() => settled(pm, "tail"));

  expect(lastSeen).toContain("200");
}, 20_000);

test("snapshots keep their identity while nothing changes", async () => {
  const pm = makeManager();
  pm.register({ name: "quiet", command: "sleep 30" });
  pm.register({ name: "noisy", command: "seq 1 200" });

  expect(pm.snapshot()).toBe(pm.snapshot());

  const before = pm.snapshot();
  const quietBefore = before.find((s) => s.name === "quiet")!;
  pm.start("noisy");
  await waitFor(() => settled(pm, "noisy"));
  const after = pm.snapshot();

  expect(after).not.toBe(before);
  expect(after.find((s) => s.name === "quiet")).toBe(quietBefore);
  expect(after.find((s) => s.name === "noisy")!.revision).toBeGreaterThan(
    before.find((s) => s.name === "noisy")!.revision,
  );
}, 20_000);

test("runningCount tracks live processes", async () => {
  const pm = makeManager();
  pm.register({ name: "a", command: "sleep 30" });
  pm.register({ name: "b", command: "sleep 30" });
  expect(pm.runningCount()).toBe(0);

  pm.start("a");
  await waitFor(() => proc(pm, "a").status === "running");
  expect(pm.runningCount()).toBe(1);

  pm.start("b");
  await waitFor(() => proc(pm, "b").status === "running");
  expect(pm.runningCount()).toBe(2);

  pm.stop("a");
  await waitFor(() => settled(pm, "a"));
  expect(pm.runningCount()).toBe(1);
}, 20_000);

test("scrollback stays bounded and keeps the newest lines", async () => {
  const pm = makeManager();
  pm.register({ name: "flood", command: "seq 1 20000" });
  pm.start("flood");
  await waitFor(() => settled(pm, "flood"));

  const lines = text(proc(pm, "flood").lines).filter((l) => l.length > 0);
  expect(lines.length).toBeLessThanOrEqual(MAX_LINES + 512);
  expect(lines.length).toBeGreaterThan(MAX_LINES - 512);
  expect(lines.at(-1)).toBe("20000");
}, 30_000);

test("clearing wipes the buffer of a running process", async () => {
  const pm = makeManager();
  pm.register({ name: "clearable", command: "seq 1 100; sleep 30" });
  pm.start("clearable");
  await waitFor(() => proc(pm, "clearable").lines.length > 0);

  pm.clear("clearable");
  expect(proc(pm, "clearable").lines.length).toBe(0);
}, 20_000);
