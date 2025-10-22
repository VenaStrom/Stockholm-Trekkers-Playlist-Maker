import "./global.tw.css";
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function App() {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    // Close program
    const closeListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "w" || e.key === "q")) {
        e.preventDefault();
        invoke("close");
      }
    };

    // Toggle light/dark mode
    const lightModeListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "l") {
        console.log("Hit light mode");
        e.preventDefault();
        setLightMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", closeListener);
    window.addEventListener("keydown", lightModeListener);
    return () => {
      window.removeEventListener("keydown", closeListener);
      window.removeEventListener("keydown", lightModeListener);
    };
  });

  // Apply light/dark mode
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [lightMode]);

  return (<>
    <header className="bg-abyss-800 p-2 px-5 flex flex-row items-center gap-x-2">
      <img className="size-14" src="/icon/org/stockholm-trekkers-256x256.png" alt="Stockholm Trekkers Logo" />
      <p className="h-full flex flex-col leading-3 justify-center">
        <span className="text-xl font-normal">Stockholm Trekkers</span>
        <span>Playlist Maker</span>
      </p>
    </header>

    <main className="">
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