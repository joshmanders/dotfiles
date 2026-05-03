import React, { useCallback, useState } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import { Header } from "./components/Header.js";
import { StatusBar } from "./components/StatusBar.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { useSidebarWidth } from "./lib/use-sidebar-width.js";
import { setShowHidden } from "./lib/config.js";
import { PANELS } from "./panels/index.js";

interface ConfirmState {
  message: string;
  detail?: string;
  onConfirm: () => void;
}

export function App() {
  const renderer = useRenderer();
  const [active, setActive] = useState(0);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [sidebarWidth, onSidebarResize] = useSidebarWidth(48);
  // Hidden by default. `.` toggles. The version counter triggers panels
  // to recompute their filtered data via useMemo/useEffect deps.
  const [showHidden, setShowHiddenState] = useState(false);
  const [showHiddenVersion, setShowHiddenVersion] = useState(0);
  const toggleHidden = useCallback(() => {
    setShowHiddenState((prev) => {
      const next = !prev;
      setShowHidden(next);
      return next;
    });
    setShowHiddenVersion((v) => v + 1);
  }, []);

  const requestConfirm = useCallback((message: string, detail: string | undefined, onConfirm: () => void) => {
    setConfirm({ message, detail, onConfirm });
  }, []);

  const quit = useCallback(() => {
    try {
      renderer?.destroy();
    } catch {}
    // Defer the exit one tick so destroy()'s terminal-restore writes flush
    // before the process tears down.
    setImmediate(() => process.exit(0));
  }, [renderer]);

  useKeyboard((k) => {
    if (confirm) return; // ConfirmDialog owns the input while open
    const n = k.name?.toLowerCase();
    if (n === "tab") {
      if (k.shift) setActive((a) => (a - 1 + PANELS.length) % PANELS.length);
      else setActive((a) => (a + 1) % PANELS.length);
    } else if (n === "q" || (k.ctrl && n === "c")) {
      quit();
    } else if (k.ctrl && n === "right") {
      setActive((a) => (a + 1) % PANELS.length);
    } else if (k.ctrl && n === "left") {
      setActive((a) => (a - 1 + PANELS.length) % PANELS.length);
    } else if (n && /^[1-9]$/.test(n)) {
      const i = parseInt(n, 10) - 1;
      if (i < PANELS.length) setActive(i);
    } else if (n === "0" && PANELS.length >= 10) {
      setActive(9);
    } else if (n === ".") {
      toggleHidden();
    }
  });

  const def = PANELS[active]!;
  const Panel = def.Component;

  const globalBindings: ReadonlyArray<[string, string]> = [
    ["space/PgDn", "scroll"],
    ["tab", "next panel"],
    [".", showHidden ? "hide ignored" : "show ignored"],
    ["q", "quit"],
  ];

  return (
    <box style={{ flexDirection: "column", width: "100%", height: "100%" }}>
      <Header panels={PANELS.map((p) => p.name)} active={active} onSelect={setActive} />
      <Panel
        active={!confirm}
        requestConfirm={requestConfirm}
        sidebarWidth={sidebarWidth}
        onSidebarResize={onSidebarResize}
        showHiddenVersion={showHiddenVersion}
      />
      <StatusBar bindings={[...def.bindings, ...globalBindings]} />
      {confirm ? (
        <ConfirmDialog
          message={confirm.message}
          detail={confirm.detail}
          onConfirm={() => {
            const fn = confirm.onConfirm;
            setConfirm(null);
            fn();
          }}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
    </box>
  );
}
