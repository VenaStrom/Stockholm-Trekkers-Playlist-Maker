import "./global.tw.css";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Projects from "./pages/projects";
import { usePageContext } from "./components/page-context/use-page-context";
import { PageRoute } from "./components/page-context/page.internal";
import { setTheme } from "@tauri-apps/api/app";
import { IconLightDarkMode, IconLightModeOutline } from "./components/icons";
import { Toaster } from "./components/toast/toast";
import Editor from "./pages/editor";

export default function App() {
  const [lightMode, setLightMode] = useState(() => {
    // Read local storage for theme preference
    const prefersLight = localStorage.getItem("lightMode");
    if (prefersLight !== null) {
      return prefersLight === "true";
    }

    // If no preference, use system preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  });

  const { headerText, route } = usePageContext();

  // Set up keyboard shortcuts
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
      setTheme("light");
      localStorage.setItem("lightMode", "true");
    } else {
      document.body.classList.remove("light");
      setTheme("dark");
      localStorage.setItem("lightMode", "false");
    }
  }, [lightMode]);

  return (<>
    <header className="bg-abyss-800 p-2 px-5 flex flex-row items-center gap-x-2">
      {/* Logo */}
      <img className="size-14" src="/icon/org/stockholm-trekkers-256x256.png" alt="Stockholm Trekkers Logo" />
      {/* App name */}
      <p className="h-full flex flex-col leading-3 justify-center">
        <span className="text-xl font-normal">Stockholm Trekkers</span>
        <span>Playlist Maker</span>
      </p>

      {/* Spacer and header text */}
      <span className="flex-1">
        {/* Outer absolute positioner with no pointer events */}
        <span className="w-full h-18 pointer-events-none absolute top-0 left-0 flex flex-row justify-center items-center">
          {/* Inner styled text */}
          <span className="w-fit text-2xl font-normal pointer-events-auto">
            {headerText}
          </span>
        </span>
      </span>

      {/* Light mode toggle */}
      <button
        className="h-full px-3 €icon"
        onClick={() => setLightMode((prev) => !prev)}
        title="Toggle light/dark mode (Ctrl+L)"
      >
        {lightMode ?
          <IconLightDarkMode className="size-8" />
          :
          <IconLightModeOutline className="size-8" />
        }
      </button>

      {/* Credit */}
      <p className="flex flex-col items-end leading-5 text-sm">
        <span>Made by <a href="https://venastrom.se" target="_blank" rel="noreferrer">Vena Ström</a></span>
        <span><a href="mailto:strom.vena+playlistmaker@gmail.com?subject=Playlist%20Maker" target="_blank" rel="noreferrer">strom.vena@gmail.com</a></span>
      </p>
    </header>

    {(() => {
      switch (route) {
        case PageRoute.Editor:
          return <Editor />;
        case PageRoute.Projects:
          return <Projects />;
      }
    })()}

    <Toaster />
  </>);
}