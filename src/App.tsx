import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./global.tw.css";

export default function App() {
  const [hasSetListeners, setHasSetListeners] = useState(false);

  useEffect(() => {
    if (hasSetListeners) return;
    if (typeof window === "undefined") return;

    // Close program
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && (e.key === "w" || e.key === "q")) {
        e.preventDefault();
        invoke("close");
      }
    });

    // Toggle light/dark mode
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        document.body.classList.toggle("light");
      }
    });

    setHasSetListeners(true);
  });

  return (<>
    <header className="bg-abyss-800 p-2 px-5 flex flex-row items-center gap-x-2">
      <img className="size-14" src="/icon/org/stockholm-trekkers-256x256.png" alt="Stockholm Trekkers Logo" />
      <p className="h-full flex flex-col leading-3 justify-center">
        <span className="text-xl font-normal">Stockholm Trekkers</span>
        <span>Playlist Maker</span>
      </p>
    </header>

    <main className="">
      {isDarkModeDebounced ? "True" : "False"}
    </main>

    <footer className="flex flex-row justify-center items-center">
      <p className="flex flex-col items-center">
        <span>Made by <a href="https://venastrom.se" target="_blank" rel="noreferrer">Vena Ström</a></span>
        <span>Contact: <a href="mailto:strom.vena+playlistmaker@gmail.com?subject=Playlist%20Maker" target="_blank" rel="noreferrer">strom.vena@gmail.com</a></span>
      </p>
    </footer>
  </>
  );
}