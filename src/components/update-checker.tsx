import { useEffect, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useToast } from "@/components/toast";
import Dialog from "@/components/dialog";

type UpdatePhase =
  | { kind: "idle"; }
  | { kind: "available"; update: Update; }
  | { kind: "downloading"; update: Update; downloaded: number; total: number | null; }
  | { kind: "ready"; }
  | { kind: "error"; message: string; };

function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Checks GitHub for a newer release on launch and walks the user through
 * downloading and installing it over the air.
 */
export default function UpdateChecker() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<UpdatePhase>({ kind: "idle" });

  useEffect(() => {
    check()
      .then((update) => {
        if (update) {
          console.info(`Update available: ${update.version} (current ${update.currentVersion}).`);
          setPhase({ kind: "available", update });
        }
        else {
          console.info("No update available.");
        }
      })
      .catch((err: unknown) => {
        // Offline, or a dev build with no published release yet — don't bother the user
        console.warn("Update check failed:", err);
      });
  }, []);

  const install = (update: Update) => {
    setPhase({ kind: "downloading", update, downloaded: 0, total: null });

    // Note: on Windows the installer may exit the app on its own when the download finishes
    update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          setPhase(prev => prev.kind === "downloading" ? { ...prev, total: event.data.contentLength ?? null } : prev);
          break;
        case "Progress":
          setPhase(prev => prev.kind === "downloading" ? { ...prev, downloaded: prev.downloaded + event.data.chunkLength } : prev);
          break;
        case "Finished":
          break;
      }
    })
      .then(() => setPhase({ kind: "ready" }))
      .catch((err: unknown) => {
        console.error("Failed to download and install update:", err);
        setPhase({ kind: "error", message: err instanceof Error ? err.message : String(err) });
      });
  };

  const restart = () => {
    relaunch()
      .catch((err: unknown) => {
        console.error("Failed to relaunch app:", err);
        toast("Failed to restart. Please close and reopen the app manually.");
      });
  };

  const dialogVisible = phase.kind !== "idle";
  const setDialogVisible = (visible: boolean) => {
    if (visible) return;
    // The download can't be aborted midway; the dialog stays until it settles
    if (phase.kind === "downloading") return;
    setPhase({ kind: "idle" });
  };

  const dialogHeader = (() => {
    switch (phase.kind) {
      case "available": return <p className="text-lg">Update Available</p>;
      case "downloading": return <p className="text-lg">Downloading Update</p>;
      case "ready": return <p className="text-lg">Update Installed</p>;
      case "error": return <p className="text-lg">Update Failed</p>;
      case "idle": return null;
    }
  })();

  const dialogContent = (() => {
    switch (phase.kind) {
      case "available":
        return <div>
          <p>
            Version {phase.update.version} is available (you have {phase.update.currentVersion}).
          </p>
          {phase.update.body?.trim() && (
            <pre className="text-sm text-flare-500/80 mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap">{phase.update.body}</pre>
          )}
        </div>;
      case "downloading":
        return <div>
          <p>
            {formatMB(phase.downloaded)}{phase.total !== null ? ` of ${formatMB(phase.total)}` : ""}
          </p>
          <div className="w-full h-2 mt-3 rounded-full bg-abyss-500 overflow-hidden">
            {phase.total === null
              ? <div className="h-full w-full bg-spore-500 animate-pulse" />
              : <div className="h-full bg-spore-500 transition-all" style={{ width: `${Math.round(phase.downloaded / phase.total * 100)}%` }} />
            }
          </div>
        </div>;
      case "ready":
        return <p>The update is installed. Restart the app to start using it.</p>;
      case "error":
        return <p>
          The update could not be installed: {phase.message}
          <br />
          You can also download the latest version from GitHub.
        </p>;
      case "idle":
        return null;
    }
  })();

  const dialogButtons = (() => {
    switch (phase.kind) {
      case "available":
        return [
          <button key="later-button" onClick={() => setDialogVisible(false)}>
            Later
          </button>,
          <button data-focus="true" key="update-button" className="hover:bg-science-500" onClick={() => install(phase.update)}>
            Update Now
          </button>,
        ];
      case "downloading":
        return [
          <button key="wait-button" disabled>
            Downloading...
          </button>,
        ];
      case "ready":
        return [
          <button key="later-button" onClick={() => setDialogVisible(false)}>
            Later
          </button>,
          <button data-focus="true" key="restart-button" className="hover:bg-science-500" onClick={restart}>
            Restart Now
          </button>,
        ];
      case "error":
        return [
          <button data-focus="true" key="close-button" onClick={() => setDialogVisible(false)}>
            Close
          </button>,
        ];
      case "idle":
        return [];
    }
  })();

  return (
    <Dialog
      visible={dialogVisible}
      setVisible={setDialogVisible}
      dialogHeader={dialogHeader}
      dialogContent={dialogContent}
      buttons={dialogButtons}
    />
  );
}
