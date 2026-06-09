import React, { useEffect, useRef, useState } from "react";
import type { ProcSnapshot } from "../lib/process.js";

interface Props {
  snapshots: ProcSnapshot[];
  onDone?: () => void;
}

// Minimum gap between visually "marking" successive processes as stopped.
// Kills go out in parallel; if everything dies in 50ms the queue spaces the
// orb transitions out so the user can see each one. A slow process still
// gates the queue — its kill latency becomes the leader for that orb.
const VISUAL_GAP_MS = 400;

// Extra pause after the final orb flips so the eye can register the
// completed state before the overlay closes.
const FINAL_HOLD_MS = 900;

// Full-screen overlay shown during pm.shutdown(). Lists each process with
// a live/done orb, paced so each transition is perceivable.
export function Quitting({ snapshots, onDone }: Props) {
  // Snapshot the set of processes we're waiting on at mount — new ones added
  // after we start quitting (shouldn't happen, but be safe) are ignored.
  const [tracked] = useState(() => snapshots.map((s) => s.name));
  const [shownStopped, setShownStopped] = useState<Set<string>>(
    () =>
      new Set(
        snapshots.filter((s) => s.status !== "running").map((s) => s.name),
      ),
  );

  const queueRef = useRef<string[]>([]);

  // Watch incoming snapshots — when a tracked process flips out of "running",
  // enqueue it. Dedupe against the queue and already-shown set.
  useEffect(() => {
    for (const s of snapshots) {
      if (!tracked.includes(s.name)) continue;
      if (s.status === "running") continue;
      if (shownStopped.has(s.name)) continue;
      if (queueRef.current.includes(s.name)) continue;
      queueRef.current.push(s.name);
    }
  }, [snapshots, tracked, shownStopped]);

  // Drain the queue at exactly one item per VISUAL_GAP_MS. Single interval
  // (no racing setTimeouts) so the spacing is consistent.
  useEffect(() => {
    const id = setInterval(() => {
      const next = queueRef.current.shift();
      if (!next) return;
      setShownStopped((prev) => {
        if (prev.has(next)) return prev;
        const out = new Set(prev);
        out.add(next);
        return out;
      });
    }, VISUAL_GAP_MS);
    return () => clearInterval(id);
  }, []);

  // All tracked procs have visually transitioned — pause briefly so the
  // last orb's flip is perceivable before the overlay closes.
  useEffect(() => {
    if (tracked.length === 0 || tracked.every((n) => shownStopped.has(n))) {
      const t = setTimeout(() => onDone?.(), FINAL_HOLD_MS);
      return () => clearTimeout(t);
    }
  }, [shownStopped, tracked, onDone]);

  const liveCount = tracked.filter((n) => !shownStopped.has(n)).length;

  return (
    <box
      style={{
        flexGrow: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <text fg="#FFAA00">Quitting solo…</text>
      {liveCount > 0 ? (
        <text fg="#888888">
          stopping {liveCount} process{liveCount === 1 ? "" : "es"}
        </text>
      ) : (
        <text fg="#888888">all processes stopped</text>
      )}
      <box style={{ flexDirection: "column", paddingTop: 1 }}>
        {snapshots.map((s) => {
          const stopped = shownStopped.has(s.name);
          return (
            <text key={s.name}>
              <span fg={stopped ? "#55FF55" : "#FFAA00"}>
                {stopped ? "✓ " : "● "}
              </span>
              <span fg="#cccccc">{s.name}</span>
            </text>
          );
        })}
      </box>
    </box>
  );
}
