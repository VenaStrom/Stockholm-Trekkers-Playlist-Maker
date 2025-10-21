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

  return (<>
    <header className="">
      <img className="size-18" src="/icon/org/stockholm-trekkers-256x256.png" alt="Stockholm Trekkers Logo" />
      <p className="flex flex-row gap-x-2">
        <span>Stockholm Trekkers</span>
        <span>Playlist Maker</span>
      </p>
    </header>

    <main className="">
      p
    </main>

    <footer className="flex flex-row justify-center items-center">
      <p className="flex flex-col">
        <span>Made by: <a href="https://venastrom.se" target="_blank" rel="noreferrer">Vena Ström</a></span>
        <span>Contact: <a href="mailto:strom.vena+playlistmaker@gmail.com?subject=Playlist%20Maker" target="_blank" rel="noreferrer">strom.vena@gmail.com</a></span>
      </p>
    </footer>
  </>
  );
}