"use client";
import { useEffect } from "react";
import { useLayoutInit } from "@/hooks/useLayoutInit";

export default function HookTestPage() {
  // Sadece hook’u çağırıyoruz
  const state = useLayoutInit();

  // Debug için sadece konsola state logla
  useEffect(() => {
    // İlk renderda veya state değiştiğinde bak
    console.log("HOOK STATE", state);
  }, [state]);

  return (
    <div>
      <h1>useLayoutInit() Hook Testi</h1>
      <pre style={{ fontSize: 12, background: "#eee", padding: 16 }}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}
