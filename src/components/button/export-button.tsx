import { useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  estimateExportSize,
  ExportCancelledError,
  ExportOverwriteRequiredError,
  ExportValidationError,
  exportProject,
  openProject,
  validateProjectForExport,
  type EncodingStrategy,
  type ExportProgress,
} from "@/functions/project";
import { IconFileExportOutline } from "@/components/icons";
import { useToast } from "@/components/toast";
import { usePageContext } from "@/components/page-context";
import type { Project } from "@/types";
import Dialog from "@/components/dialog";
import ProjectSummary from "@/components/project-summary";

type ExportPhase =
  | { kind: "idle"; }
  | { kind: "confirm"; project: Project; }
  | { kind: "confirm-overwrite"; saveLocation: string; saveDir: string; }
  | { kind: "running"; progress: ExportProgress; cancelRequested: boolean; }
  | { kind: "success"; saveDir: string; exportedBytes: number; }
  | { kind: "error"; problems: string[]; };

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${Math.max(1, Math.round(bytes / 1024 ** 2))} MB`;
}

export default function ExportButton({
  projectID,
}: {
  projectID: string | null;
}) {
  const { toast } = useToast();

  const [phase, setPhase] = useState<ExportPhase>({ kind: "idle" });
  const [estimatedBytes, setEstimatedBytes] = useState<number | null>(null);
  const [zipOutput, setZipOutput] = useState(true);
  const { exportEncoding: encoding, setExportEncoding: setEncoding } = usePageContext();
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
      zip: zipOutput,
      encoding,
      signal: abortController.signal,
      onProgress: (progress) => {
        setPhase(prev => prev.kind === "running" ? { ...prev, progress } : prev);
      },
    })
      .then(({ saveDir, exportedBytes }) => {
        setPhase({ kind: "success", saveDir, exportedBytes });
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

    // Validate before anything else, so problems surface immediately
    openProject(projectID)
      .then(async (project) => {
        const problems = await validateProjectForExport(project);
        if (problems.length > 0) {
          setPhase({ kind: "error", problems });
          return;
        }

        // Size estimate resolves in the background while the confirmation shows
        setEstimatedBytes(null);
        estimateExportSize(project)
          .then(setEstimatedBytes)
          .catch((err: unknown) => {
            console.warn("Failed to estimate export size:", err);
          });

        // Last confirmation with the playlist rundown before picking a destination
        setPhase({ kind: "confirm", project });
      })
      .catch((err: unknown) => {
        console.error("Error starting export:", err);
        toast("Failed to start export. Please try again.");
      });
  };

  const pickLocationAndExport = () => {
    open({
      directory: true,
      title: "Select export location. A folder with the project's name will be created here.",
      canCreateDirectories: true,
      recursive: true, // Needed to mkdir and copy things here
    })
      .then((path) => {
        if (!path) {
          toast("Export cancelled.");
          setPhase({ kind: "idle" });
          return;
        }
        runExport(path, false);
      })
      .catch((err: unknown) => {
        console.error("Error opening save dialog:", err);
        toast("Failed to open save dialog. Please try again.");
        setPhase({ kind: "idle" });
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
      case "confirm": return <p className="text-lg">Export {phase.project.date.trim() ? phase.project.date : "Playlist"}?</p>;
      case "confirm-overwrite": return <p className="text-lg">Replace Existing Export?</p>;
      case "running": return <p className="text-lg">Exporting Project</p>;
      case "success": return <p className="text-lg">Export Complete</p>;
      case "error": return <p className="text-lg">Cannot Export Project</p>;
      case "idle": return null;
    }
  })();

  const dialogContent = (() => {
    switch (phase.kind) {
      case "confirm":
        return <div>
          <div className="max-h-72 overflow-y-auto text-sm border-s-2 border-abyss-500 ps-2">
            <ProjectSummary project={phase.project} />
          </div>
          <p className="pt-2">
            Estimated size: {estimatedBytes !== null ? formatBytes(estimatedBytes) : "calculating..."}
          </p>

          <label
            className="flex flex-row items-center gap-x-2 pt-3 w-fit select-none"
            title="Episodes not already in the chosen codec are re-encoded on export. The event computer only hardware-decodes H.264."
          >
            <span>Encoding</span>
            <select
              className="bg-abyss-900 rounded-sm px-2 py-1 cursor-pointer"
              value={encoding}
              onChange={(e) => setEncoding(e.target.value as EncodingStrategy)}
            >
              <option value="h264">Re-encode to H.264 (recommended)</option>
              <option value="preserve">Keep original encodings</option>
              <option value="hevc">Re-encode to HEVC (H.265)</option>
            </select>
          </label>
          {(() => {
            if (encoding === "preserve") return null;
            const transcodeCount = phase.project.episodes
              .filter(e => e.filePath && e.cachedEncoding !== encoding).length;
            if (transcodeCount === 0) {
              return <p className="text-sm text-flare-700 pt-1">All episodes are already {encoding === "h264" ? "H.264" : "H.265"} - nothing to re-encode.</p>;
            }
            return <p className="text-sm text-flare-700 pt-1">
              {transcodeCount === 1 ? "1 episode" : `${transcodeCount} episodes`} will be re-encoded - this can take a long time.
            </p>;
          })()}

          <label
            className="flex flex-row items-center gap-x-2 pt-2 cursor-pointer select-none w-fit"
            title="Packs the whole bundle into a single .zip file for easier transport. Extract it on the playback computer before playing."
          >
            <input
              type="checkbox"
              className="[--checkbox-color:var(--color-spore-500)]"
              checked={zipOutput}
              onChange={(e) => setZipOutput(e.target.checked)}
            />
            <span>Zip the output into a single file</span>
          </label>
        </div>;
      case "confirm-overwrite":
        return <p>
          There is already an export at <span className="italic break-all">{phase.saveDir}</span>.
          <br />
          Replacing it deletes the existing export.
        </p>;
      case "running":
        return <div>
          <p>{phase.cancelRequested ? "Cancelling... The file being copied has to finish first." : phase.progress.message}</p>
          {estimatedBytes !== null && (
            <p className="text-sm text-flare-700 pt-1">Estimated size: {formatBytes(estimatedBytes)}</p>
          )}
          <div className="w-full h-2 mt-3 rounded-full bg-abyss-500 overflow-hidden">
            {phase.progress.fraction === null
              ? <div className="h-full w-full bg-spore-500 animate-pulse" />
              : <div className="h-full bg-spore-500 transition-all" style={{ width: `${Math.round(phase.progress.fraction * 100)}%` }} />
            }
          </div>
        </div>;
      case "success":
        return <p>
          The playlist ({formatBytes(phase.exportedBytes)}) was exported to <span className="italic break-all">{phase.saveDir}</span>.
          {phase.saveDir.endsWith(".zip") && (
            <span className="block text-sm text-flare-700 pt-2">
              Extract the archive on the playback computer before playing.
            </span>
          )}
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
      case "confirm":
        return [
          <button key="cancel-button" onClick={() => setDialogVisible(false)}>
            Cancel
          </button>,
          <button
            data-focus="true"
            key="choose-location-button"
            className="hover:bg-spore-500"
            onClick={pickLocationAndExport}
          >
            Choose Location...
          </button>,
        ];
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
              // For a zip, show the file in its folder instead of opening the archive
              (phase.saveDir.endsWith(".zip") ? revealItemInDir(phase.saveDir) : openPath(phase.saveDir))
                .catch((err: unknown) => {
                  console.error("Failed to open export location:", err);
                  toast("Failed to open the export location.");
                });
            }}
          >
            {phase.saveDir.endsWith(".zip") ? "Show File" : "Open Folder"}
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

    <button
      className="pe-1.5 ps-3 hover:bg-spore-500"
      onClick={onExport}
    >
      Export
      <span className="flex-1"></span>
      <IconFileExportOutline className="inline size-6" />
    </button>
  </>);
}
