import type React from "react";

export interface PanelProps {
  active: boolean;
  requestConfirm: (message: string, detail: string | undefined, onConfirm: () => void) => void;
  sidebarWidth: number;
  onSidebarResize: (terminalX: number) => void;
  // Bumped by the App's `.` hotkey. Panels include this in their
  // useMemo/useEffect deps so filtered data recomputes on toggle.
  showHiddenVersion: number;
}

export interface PanelDef {
  name: string;
  bindings: ReadonlyArray<[string, string]>;
  Component: React.ComponentType<PanelProps>;
}
