import "@/global.tw.css";
import { PowerKey } from "@/global";
import { IconLightDarkMode, IconLightModeOutline, IconSettingsOutline } from "@/components/icons";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { setTheme } from "@tauri-apps/api/app";
import { Toaster } from "@/components/toast/toast";
import { useEffect, useState } from "react";
import { usePageContext, PageRoute } from "@/components/page-context";
import { getUserDefaultBlockOptions, resetUserDefaultBlockOptions, setUserDefaultBlockOptions } from "@/functions/block-options";
import BlockOptionsEditor from "@/components/editor/block-options-editor";
import Dialog from "@/components/dialog";
import Editor from "@/pages/editor";
import Projects from "@/pages/projects";
import UpdateChecker from "@/components/update-checker";

export default function App() {
  const [lightMode, setLightMode] = useState(() => {
    // Read local storage for theme preference
    const prefersLight = localStorage.getItem("lightMode");
    if (prefersLight !== null) {
      return prefersLight === "true";
    }

    // If no preference, use system preference
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  });

  const { headerText, route, setRoute, projectID, isPowerMode, autosave, setAutosave, warnOnNonH264, setWarnOnNonH264 } = usePageContext();

  // Settings panel
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [defaultBlockOptions, setDefaultBlockOptions] = useState(getUserDefaultBlockOptions);

  // Set up keyboard shortcuts
  useEffect(() => {
    // Close program
    const closeListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "w" || e.key === "q")) {
        e.preventDefault();
        // Request a close instead of exiting directly so the editor's
        // close-requested listener can flush any pending save first
        getCurrentWindow().close()
          .catch((err: unknown) => {
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

    // Forward navigation; Alt+ArrowLeft (back) is handled by the editor itself
    // so its save/confirm-leave logic always runs
    const backListener = (e: KeyboardEvent) => {
      // Forward to editor if project id is set
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (route === PageRoute.Projects && projectID) {
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
  }, [projectID, route, setRoute]);

  // Apply light/dark mode
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("light");
      setTheme("light")
        .catch((err: unknown) => {
          console.error("Failed to set light theme:", err);
        });
      localStorage.setItem("lightMode", "true");
    } else {
      document.body.classList.remove("light");
      setTheme("dark")
        .catch((err: unknown) => {
          console.error("Failed to set dark theme:", err);
        });
      localStorage.setItem("lightMode", "false");
    }
  }, [lightMode]);

  return (<>
    <header
      className={`
        p-2 px-5
        flex flex-row items-center gap-x-2
        h-(--header-height)
        ${route === PageRoute.Editor ? "bg-abyss-800" : "bg-abyss-900"}
      `}
    >
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

      {/* Settings */}
      <button
        className="h-full px-3 €icon"
        onClick={() => setSettingsVisible(true)}
        title="Settings"
      >
        <IconSettingsOutline className="size-8" />
      </button>

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
      <div className="flex flex-row gap-x-4 leading-5 text-sm">
        <p className="flex flex-col items-end gap-x-6 text-flare-500/60 italic">
          {__VERSION__ && <span>{`Version ${__VERSION__}`}</span>}
          <span>Built {new Date(__BUILD_DATE__).toLocaleDateString("en-SE", { year: "numeric", month: "2-digit", day: "2-digit" })}</span>
        </p>

        {__AUTHOR__ &&
          <p className="flex flex-col items-end">
            <span>Made by <a href={__AUTHOR__.url} target="_blank" rel="noreferrer">{__AUTHOR__.name}</a></span>
            <span>
              <a href={`mailto:${__AUTHOR__.email}?subject=Playlist%20Maker`} target="_blank" rel="noreferrer">
                {__AUTHOR__.email.replace(/\+\w*?(?=@)/, "")}
              </a>
            </span>
          </p>
        }
      </div>
    </header>

    {(() => {
      switch (route) {
        case PageRoute.Editor:
          return <Editor />;
        case PageRoute.Projects:
          return <Projects />;
      }
    })()}

    {/* Settings dialog */}
    <Dialog
      visible={settingsVisible}
      setVisible={setSettingsVisible}
      dialogHeader={<p className="text-lg">Settings</p>}
      dialogContent={<div>
        <p className="pb-2">Default options for new blocks</p>
        <BlockOptionsEditor
          options={defaultBlockOptions}
          onToggle={(key, checked) => {
            setDefaultBlockOptions(prev => {
              const next = { ...prev, [key]: checked };
              setUserDefaultBlockOptions(next);
              return next;
            });
          }}
        />
        <p className="text-sm text-flare-500/60 pt-2">
          Applies to blocks you create from now on. Existing blocks keep their own options.
        </p>

        <p className="pb-2 pt-4">Editor</p>
        <label
          className="flex flex-row items-center gap-x-2 text-sm font-thin cursor-pointer select-none ps-2"
          title="Saves the open project shortly after every change. When off, save with Ctrl+S — the project is also saved when leaving the editor or closing the app."
        >
          <span>Autosave while editing</span>
          <span className="flex-1 min-w-4"></span>
          <input
            type="checkbox"
            checked={autosave}
            onChange={(e) => setAutosave(e.target.checked)}
          />
        </label>

        <p className="pb-2 pt-4">Warnings</p>
        <label
          className="flex flex-row items-center gap-x-2 text-sm font-thin cursor-pointer select-none ps-2"
          title="The current playback computer only has hardware acceleration for H.264, so episodes in any other codec may stutter. Disable this after upgrading the computer."
        >
          <span>Warn about episodes that are not H.264</span>
          <span className="flex-1 min-w-4"></span>
          <input
            type="checkbox"
            className="[--checkbox-color:var(--color-command-300)]"
            checked={warnOnNonH264}
            onChange={(e) => setWarnOnNonH264(e.target.checked)}
          />
        </label>
      </div>}
      buttons={[
        <button
          key="reset-button"
          onClick={() => {
            resetUserDefaultBlockOptions();
            setDefaultBlockOptions(getUserDefaultBlockOptions());
          }}
          title="Go back to the built-in defaults"
          className="bg-red-alert-700 hover:bg-red-alert-500"
        >
          Reset
        </button>,
        <button data-focus="true" key="close-button" onClick={() => setSettingsVisible(false)}>
          Close
        </button>,
      ]}
    />

    <UpdateChecker />

    <Toaster />
  </>);
}