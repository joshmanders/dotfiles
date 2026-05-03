import React, { forwardRef } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";

interface Props {
  title?: string;
  children: React.ReactNode;
}

export const PreviewPane = forwardRef<ScrollBoxRenderable, Props>(function PreviewPane({ title, children }, ref) {
  return (
    <box
      style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        flexDirection: "column",
        borderStyle: "rounded",
        border: true,
        borderColor: "#333333",
        overflow: "hidden",
      }}
      title={title ? ` ${title} ` : undefined}
    >
      <scrollbox
        ref={ref}
        style={{
          flexGrow: 1,
          padding: 1,
        }}
        scrollY
      >
        {children}
      </scrollbox>
    </box>
  );
});
