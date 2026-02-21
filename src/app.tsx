import "@/global.tw.css";
import { IconLightDarkMode, IconLightModeOutline } from "@/components/icons";
import { invoke } from "@tauri-apps/api/core";
import { PageRoute } from "@/components/page-context/page.internal";
import { setTheme } from "@tauri-apps/api/app";
import { Toaster } from "@/components/toast/toast";
import { useEffect, useState } from "react";
import { usePageContext } from "@/components/page-context/use-page-context";
import Editor from "@/pages/editor";
import packageJson from "../package.json" with { type: "json" };
import Projects from "@/pages/projects";
import { PowerKey } from "./global";

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

  const { headerText, route, setRoute, projectId, isPowerMode } = usePageContext();

  // Set up keyboard shortcuts
  useEffect(() => {
    // Close program
    const closeListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "w" || e.key === "q")) {
        e.preventDefault();
        invoke("close")
          .catch((err) => {
            console.error("Failed to close app:", err);
          });
      }
    };

    // Toggle light/dark mode
    const lightModeListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        setLightMode((prev) => !prev);
      }
    };

    // Back from editor to projects
    const backListener = (e: KeyboardEvent) => {
      // Back to projects
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (route === PageRoute.Editor) {
          setRoute(PageRoute.Projects);
        }
      }

      // Forward to editor if project id is set
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (route === PageRoute.Projects && projectId) {
          setRoute(PageRoute.Editor);
        }
      }
    };

    window.addEventListener("keydown", closeListener);
    window.addEventListener("keydown", lightModeListener);
    window.addEventListener("keydown", backListener);
    return () => {
      window.removeEventListener("keydown", closeListener);
      window.removeEventListener("keydown", lightModeListener);
      window.removeEventListener("keydown", backListener);
    };
  });

  // Apply light/dark mode
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light");
      setTheme("light")
        .catch((err) => {
          console.error("Failed to set light theme:", err);
        });
      localStorage.setItem("lightMode", "true");
    } else {
      document.body.classList.remove("light");
      setTheme("dark")
        .catch((err) => {
          console.error("Failed to set dark theme:", err);
        });
      localStorage.setItem("lightMode", "false");
    }
  }, [lightMode]);

  return (<>
    <header className={`
      p-2 px-5
      flex flex-row items-center gap-x-2
      h-(--header-height)
      ${route === PageRoute.Editor ? "bg-abyss-800" : "bg-abyss-900"}
    `}>
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

      {/* Power mode indicator */}
      <p
        className={`
          text-abyss-200 font-medium tracking-wide transition-opacity
          cursor-help
          opacity-0
          ${isPowerMode ? "opacity-100" : ""}
        `}
        title={`Power mode enables extra actions for power users. Triggered by holding the [${PowerKey}] key.`}
      >[power mode]</p>

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
        {packageJson.contributors?.[0] && <>
          <span>Made by <a href={packageJson.contributors[0].url} target="_blank" rel="noreferrer">{packageJson.contributors[0].name}</a></span>
          <span>
            <a href={`mailto:${packageJson.contributors[0].email}?subject=Playlist%20Maker`} target="_blank" rel="noreferrer">
              {packageJson.contributors[0].email.replace(/\+\w*?(?=@)/, "")}
            </a>
          </span>
        </>}
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