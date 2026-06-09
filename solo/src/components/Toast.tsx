import React from "react";

export type ToastKind = "info" | "success" | "warn";

interface Props {
  message: string;
  kind?: ToastKind;
}

const COLORS: Record<ToastKind, { border: string; text: string }> = {
  info: { border: "#3a7fff", text: "#cccccc" },
  success: { border: "#55ff55", text: "#cccccc" },
  warn: { border: "#FFAA00", text: "#cccccc" },
};

// Lightweight banner anchored at the top center. Lives above other content so
// it doesn't shift the layout when it appears or auto-dismisses.
export function Toast({ message, kind = "info" }: Props) {
  const { border, text } = COLORS[kind];
  return (
    <box
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
    >
      <box
        style={{
          flexDirection: "row",
          borderStyle: "rounded",
          border: true,
          borderColor: border,
          backgroundColor: "#1a1a1a",
          paddingLeft: 2,
          paddingRight: 2,
        }}
      >
        <text fg={text}>{message}</text>
      </box>
    </box>
  );
}
