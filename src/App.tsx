import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./global.tw.css";

export default function App() {
  const [hasSetListeners, setHasSetListeners] = useState(false);

  useEffect(() => {
    if (hasSetListeners) return;
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && (e.key === "w" || e.key === "q")) {
        e.preventDefault();
        invoke("close");
      }
    });

    setHasSetListeners(true);
  });

  return (
    <main className="">

    </main>
  );
}