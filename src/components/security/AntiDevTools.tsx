"use client";

import { useEffect } from "react";

// Save native console methods BEFORE any overrides - the image trap depends on these
const nativeConsoleLog = typeof window !== "undefined" ? console.log.bind(console) : () => {};
const nativeConsoleClear = typeof window !== "undefined" ? console.clear.bind(console) : () => {};

export default function AntiDevTools() {
  useEffect(() => {
    if (window.location.pathname === "/blocked") return;

    let locked = false;

    function lockdown() {
      if (locked) return;
      locked = true;
      window.location.href = "/blocked";
    }

    // Window size (docked DevTools)
    function checkWindowSize() {
      const wDiff = window.outerWidth - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      if (wDiff > 200 || hDiff > 200) lockdown();
    }

    // Image getter trap (open console panel)
    // Chrome reads enumerable properties of logged objects when the
    // console panel is open and visible — the getter fires only then.
    const img = new Image();
    let imgTriggered = false;
    Object.defineProperty(img, "id", {
      get() {
        if (!imgTriggered) {
          imgTriggered = true;
          lockdown();
        }
        return "";
      },
    });

    let rafId: number;
    function imageTrapLoop() {
      nativeConsoleLog(img);
      nativeConsoleClear();
      rafId = requestAnimationFrame(imageTrapLoop);
    }
    rafId = requestAnimationFrame(imageTrapLoop);

    // Debugger timing — uses Function constructor to survive production minification
    // (direct `debugger` statements get stripped by SWC/Terser in prod builds)
    const _dbg = new Function("debugger");
    function checkDebuggerTiming() {
      const start = performance.now();
      try { _dbg(); } catch {}
      if (performance.now() - start > 100) lockdown();
    }

    // Periodic checks
    checkWindowSize();
    checkDebuggerTiming();
    const interval = setInterval(() => {
      checkWindowSize();
      checkDebuggerTiming();
    }, 1000);
    const clearConsole = setInterval(nativeConsoleClear, 500);

    // Suppress console output
    const noop = () => undefined;
    const methods = [
      "log","warn","error","info","debug","table","dir","dirxml",
      "group","groupCollapsed","groupEnd","trace","assert",
      "count","countReset","time","timeLog","timeEnd",
    ] as const;
    methods.forEach((m) => {
      try { (console as unknown as Record<string, unknown>)[m] = noop; } catch {}
    });

    // Block DevTools shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.key === "F12") { e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i","j","c","k"].includes(key)) { e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && key === "u") { e.preventDefault(); return; }
    };

    // Disable text selection
    document.documentElement.style.userSelect = "none";
    (document.documentElement.style as CSSStyleDeclaration & { webkitUserSelect: string }).webkitUserSelect = "none";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
      clearInterval(clearConsole);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.userSelect = "";
    };
  }, []);

  return null;
}
