import { useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import {
  ExportCancelledError,
  ExportOverwriteRequiredError,
  ExportValidationError,
  exportProject,
  openProject,
  validateProjectForExport,
  type ExportProgress,
} from "@/functions/project";
import { IconFileExportOutline } from "@/components/icons";
import { useToast } from "@/components/toast";
import Dialog from "@/components/dialog";

type ExportPhase =
  | { kind: "idle"; }
  | { kind: "confirm-overwrite"; saveLocation: string; saveDir: string; }
  | { kind: "running"; progress: ExportProgress; cancelRequested: boolean; }
  | { kind: "success"; saveDir: string; }
  | { kind: "error"; problems: string[]; };

export default function ExportButton({
  projectID,
}: {
  projectID: string | null;
}) {
  const { toast } = useToast();

  const [phase, setPhase] = useState<ExportPhase>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const runExport = (saveLocation: string, overwrite: boolean) => {
    if (!projectID) return;

    const abortController = new AbortController();
    abortRef.current = abortController;
    setPhase({
      kind: "running",
      progress: { message: "Starting export...", fraction: null },
      cancelRequested: false,
    });

    exportProject(projectID, saveLocation, {
      overwrite,
      signal: abortController.signal,
      onProgress: (progress) => {
        setPhase(prev => prev.kind === "running" ? { ...prev, progress } : prev);
      },
    })
      .then((saveDir) => {
        setPhase({ kind: "success", saveDir });
      })
      .catch((err: unknown) => {
        if (err instanceof ExportOverwriteRequiredError) {
          setPhase({ kind: "confirm-overwrite", saveLocation, saveDir: err.saveDir });
          return;
        }
        if (err instanceof ExportCancelledError) {
          toast("Export cancelled.");
          setPhase({ kind: "idle" });
          return;
        }
        console.error("Error exporting project:", err);
        if (err instanceof ExportValidationError) {
          setPhase({ kind: "error", problems: err.problems });
          return;
        }
        setPhase({ kind: "error", problems: [err instanceof Error ? err.message : String(err)] });
      });
  };

  const onExport = () => {
    if (!projectID) {
      toast("No project data to export.");
      return;
    }

    // Validate before asking where to export, so problems surface immediately
    openProject(projectID)
      .then(validateProjectForExport)
      .then((problems) => {
        if (problems.length > 0) {
          setPhase({ kind: "error", problems });
          return;
        }

        return open({
          directory: true,
          title: "Select export location. A folder with the project's name will be created here.",
          canCreateDirectories: true,
          recursive: true, // Needed to mkdir and copy things here
        }).then((path) => {
          if (!path) {
            toast("Export cancelled.");
            return;
          }
          runExport(path, false);
        });
      })
      .catch((err: unknown) => {
        console.error("Error starting export:", err);
        toast("Failed to start export. Please try again.");
      });
  };

  const requestCancel = () => {
    abortRef.current?.abort();
    setPhase(prev => prev.kind === "running" ? { ...prev, cancelRequested: true } : prev);
  };

  const dialogVisible = phase.kind !== "idle";
  const setDialogVisible = (visible: boolean) => {
    if (visible) return;
    // While the export runs, dismissing the dialog means cancelling the export;
    // it stays open until the cancellation has cleaned up
    if (phase.kind === "running") {
      requestCancel();
      return;
    }
    if (phase.kind === "confirm-overwrite") {
      toast("Export cancelled.");
    }
    setPhase({ kind: "idle" });
  };

  const dialogHeader = (() => {
    switch (phase.kind) {
      case "confirm-overwrite": return <p className="text-lg">Replace Existing Export?</p>;
      case "running": return <p className="text-lg">Exporting Project</p>;
      case "success": return <p className="text-lg">Export Complete</p>;
      case "error": return <p className="text-lg">Cannot Export Project</p>;
      case "idle": return null;
    }
  })();

  const dialogContent = (() => {
    switch (phase.kind) {
      case "confirm-overwrite":
        return <p>
          There is already an export at <span className="italic break-all">{phase.saveDir}</span>.
          <br />
          Replacing it deletes that folder and everything in it.
        </p>;
      case "running":
        return <div>
          <p>{phase.cancelRequested ? "Cancelling... The file being copied has to finish first." : phase.progress.message}</p>
          <div className="w-full h-2 mt-3 rounded-full bg-abyss-500 overflow-hidden">
            {phase.progress.fraction === null
              ? <div className="h-full w-full bg-spore-500 animate-pulse" />
              : <div className="h-full bg-spore-500 transition-all" style={{ width: `${Math.round(phase.progress.fraction * 100)}%` }} />
            }
          </div>
        </div>;
      case "success":
        return <p>
          The playlist was exported to <span className="italic break-all">{phase.saveDir}</span>.
        </p>;
      case "error":
        return <div>
          <p>Fix the following before exporting:</p>
          <ul className="list-disc list-inside mt-2 text-sm text-flare-500/80">
            {phase.problems.map((problem) => (
              <li key={problem} className="break-all">{problem}</li>
            ))}
          </ul>
        </div>;
      case "idle":
        return null;
    }
  })();

  const dialogButtons = (() => {
    switch (phase.kind) {
      case "confirm-overwrite":
        return [
          <button data-focus="true" key="cancel-button" onClick={() => setDialogVisible(false)}>
            Cancel
          </button>,
          <button
            key="replace-button"
            className="hover:bg-red-alert-500"
            onClick={() => runExport(phase.saveLocation, true)}
          >
            Replace
          </button>,
        ];
      case "running":
        return [
          <button data-focus="true" key="cancel-button" disabled={phase.cancelRequested} onClick={requestCancel}>
            {phase.cancelRequested ? "Cancelling..." : "Cancel"}
          </button>,
        ];
      case "success":
        return [
          <button
            key="open-folder-button"
            onClick={() => {
              openPath(phase.saveDir)
                .catch((err: unknown) => {
                  console.error("Failed to open export folder:", err);
                  toast("Failed to open the export folder.");
                });
            }}
          >
            Open Folder
          </button>,
          <button data-focus="true" key="close-button" onClick={() => setDialogVisible(false)}>
            Close
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

  return (<>
    <Dialog
      visible={dialogVisible}
      setVisible={setDialogVisible}
      dialogHeader={dialogHeader}
      dialogContent={dialogContent}
      buttons={dialogButtons}
    />

    <div className="flex flex-row items-center justify-center">
      <button
        className="pe-1.5 ps-3 hover:bg-spore-500"
        onClick={onExport}
      >
        Export
        <span className="flex-1"></span>
        <IconFileExportOutline className="inline size-6" />
      </button>
    </div>
  </>);
}
