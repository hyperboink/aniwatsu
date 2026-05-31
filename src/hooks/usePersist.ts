"use client";

import { useState, useEffect } from "react";

export function usePersist<T>(key: string, def: T) {
  const [val, setVal] = useState<T>(def);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s !== null) setVal(JSON.parse(s));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = (v: T) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  };
  return [val, set] as const;
}
