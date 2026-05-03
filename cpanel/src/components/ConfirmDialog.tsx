import React from "react";
import { useKeyboard } from "@opentui/react";

interface Props {
  message: string;
  detail?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, detail, onConfirm, onCancel }: Props) {
  useKeyboard((k) => {
    const name = k.name?.toLowerCase();
    if (name === "y" || name === "return" || name === "enter") onConfirm();
    else if (name === "n" || name === "escape" || name === "q") onCancel();
  });

  return (
    <box
      style={{
        position: "absolute",
        top: 4,
        left: 4,
        right: 4,
        flexDirection: "column",
        borderStyle: "double",
        border: true,
        borderColor: "#FF5555",
        backgroundColor: "#1a0000",
        padding: 2,
        zIndex: 100,
      }}
      title=" Confirm "
    >
      <text fg="#FFFFFF">{message}</text>
      {detail ? <text fg="#cccccc">{detail}</text> : null}
      <text> </text>
      <text>
        <span fg="#FFAA00">y</span>
        <span fg="#888888"> confirm   </span>
        <span fg="#FFAA00">n</span>
        <span fg="#888888"> cancel</span>
      </text>
    </box>
  );
}
