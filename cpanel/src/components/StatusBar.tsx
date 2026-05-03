import React from "react";

interface Props {
  bindings: ReadonlyArray<[string, string]>;
}

export function StatusBar({ bindings }: Props) {
  return (
    <box
      style={{
        flexDirection: "row",
        height: 1,
        paddingLeft: 1,
        paddingRight: 1,
        backgroundColor: "#1a1a1a",
      }}
    >
      {bindings.map(([key, label], i) => (
        <text key={i}>
          <span fg="#FFAA00">{key}</span>
          <span fg="#888888">{` ${label}  `}</span>
        </text>
      ))}
    </box>
  );
}
