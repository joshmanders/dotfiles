import React from "react";
import type { ProcSnapshot } from "../lib/process.js";

interface Props {
  snapshots: ProcSnapshot[];
}

// Full-screen overlay shown during pm.shutdown(). Listing each process
// with its live/done status makes the wait feel intentional instead of
// frozen — and reveals which child is the slow one if the 2s hard
// timeout ever fires.
export function Quitting({ snapshots }: Props) {
  const live = snapshots.filter((s) => s.status === "running");
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
      {live.length > 0 ? (
        <text fg="#888888">
          stopping {live.length} process{live.length === 1 ? "" : "es"}
        </text>
      ) : (
        <text fg="#888888">all processes stopped</text>
      )}
      <box style={{ flexDirection: "column", paddingTop: 1 }}>
        {snapshots.map((s) => (
          <text key={s.name}>
            <span fg={s.status === "running" ? "#FFAA00" : "#55FF55"}>
              {s.status === "running" ? "● " : "✓ "}
            </span>
            <span fg="#cccccc">{s.name}</span>
          </text>
        ))}
      </box>
    </box>
  );
}
