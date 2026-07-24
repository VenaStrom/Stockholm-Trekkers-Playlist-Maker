import type { Episode, Project } from "@/types";
import { DefaultBlockOptions } from "@/consts";
import { useEffect, useMemo, useState, useRef } from "react";
import { useDebounce } from "use-debounce";
import { IconAdd, IconArrowBack2Outline, IconEditOutline, Spinner3DotsScaleMiddle } from "@/components/icons";
import { openProject, saveProject } from "@/functions/project";
import { usePageContext, PageRoute } from "@/components/page-context";
import { generateID } from "@/functions/sha256";
import EpisodeLi from "@/components/editor/episode";
import BlockLi from "@/components/editor/block";
import ExportButton from "@/components/button/export-button";
import { parseDate } from "@/functions/project/date-parser";
import { probeEpisode } from "@/functions/project/episode-probe";
import { compileTimeline } from "@/functions/compile-timeline";

export default function Editor() {
  const { setHeaderText, projectID, setRoute } = usePageContext();
  useEffect(() => setHeaderText("Editor"), [setHeaderText]);

  const [volatileProject, setVolatileProjectInner] = useState<Project | null>(null);
  const setVolatileProject: typeof setVolatileProjectInner = (value) => {
    setVolatileProjectInner(prev => {
      const newValue = typeof value === "function" ? value(prev) : value;
      return newValue ? compileTimeline(newValue) : newValue;
    });
  };

  // Load project data on mount and projectID changes
  useEffect(() => {
    if (!projectID) return;

    openProject(projectID)
      .then((project) => {
        setVolatileProject(project);

        const episodesToBeProbed = project.episodes
          .filter((e): e is Episode & { filePath: string; } => !!e.filePath);
        if (episodesToBeProbed.length === 0) return;

        const ffprobeJobs = episodesToBeProbed.map(probeEpisode);

        Promise.all(ffprobeJobs)
          .then(probedEpisodes => {
            setVolatileProject(prev => {
              if (!prev) return prev;

              for (const probed of probedEpisodes) {
                const targetEpisodeIndex = prev.episodes.findIndex(e => e.id === probed.id);
                if (targetEpisodeIndex === -1) {
                  console.warn(`Probed episode with id ${probed.id} not found in project episodes. Skipping update for this episode.`);
                  continue;
                }
                prev.episodes[targetEpisodeIndex] = probed;
              }

              return { ...prev };
            });
          })
          .catch((err: unknown) => {
            console.error("Error running ffprobe on episodes:", err);
          });
      })
      .catch((err: unknown) => {
        console.error("Failed to open project:", err);
      });
  }, [projectID]);

  // Saving project
  const [debouncedProject] = useDebounce(volatileProject, 500);
  useEffect(() => {
    if (!debouncedProject) return;
    const start = performance.now();
    console.info("[Editor] Saving project...");

    saveProject(debouncedProject)
      .then((status) => {
        if (!status) {
          console.info(`[Editor] No changes to save. (${(performance.now() - start).toFixed(2)} ms)`);
        }
        else {
          console.info(`[Editor] Project saved. (${(performance.now() - start).toFixed(2)} ms)`);
        }
      })
      .catch((err: unknown) => {
        console.error("Error in debounced save:", err);
      });
  }, [debouncedProject]);

  // Handlers
  const navigateBack = () => {
    if (!volatileProject) {
      setRoute(PageRoute.Projects);
      return;
    };
    saveProject(volatileProject)
      .then(() => {
        setRoute(PageRoute.Projects);
      })
      .catch((err: unknown) => {
        console.error("Error saving on navigation back:", err);
      });
  };

  // Ref for the description textarea so we can recalculate height on resize
  const descRef = useRef<HTMLTextAreaElement | null>(null);

  // Recalculate textarea height when the window resizes
  useEffect(() => {
    const handler = () => {
      const el = descRef.current;
      if (!el) return;
      el.style.height = "0px";
      el.style.height = `${el.scrollHeight}px`;
    };

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  // Ensure textarea has correct styles and height when description changes (including initial load)
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.overflow = "hidden";
    el.style.resize = "none";
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [volatileProject?.description]);

  // Group episodes by block id for easier rendering
  const episodesByBlockID = useMemo<Record<string, Episode[]>>(() => {
    if (!volatileProject) return {};
    const grouped: Record<string, Episode[]> = {};
    for (const ep of volatileProject.episodes) {
      const id = ep.blockID;
      grouped[id] ??= [];
      grouped[id].push(ep);
    }
    return grouped;
  }, [volatileProject]);

  // Debug hotkey
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl + P to wipe all cached probe data (for testing purposes)
      if (e.key === "p" && e.ctrlKey) {
        setVolatileProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            episodes: prev.episodes.map(ep => ({
              ...ep,
              cachedDuration: undefined,
              cachedEncoding: undefined,
              cachedSize: undefined,
            })),
          };
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [debouncedProject, volatileProject]);

  return (
    <main className="flex flex-col lg:flex-row gap-x-8 gap-y-12 justify-center items-start pt-4 px-12 pb-10">
      {/* Side bar */}
      <aside className="min-w-1/4 not-lg:w-full flex flex-col gap-y-4 lg:sticky lg:top-6">
        {/* Header */}
        <div className="flex flex-row justify-between items-center">
          {/* Go back */}
          <button
            className="w-fit pe-3 ps-1.5 hover:bg-science-500 sticky top-5 shadow-sm"
            onClick={navigateBack}
          >
            <IconArrowBack2Outline className="inline size-6 me-1" />
            Back to Projects
          </button>

          {/* Save status */}
          <span className="text-flare-700">
            {JSON.stringify(debouncedProject) === JSON.stringify(volatileProject)
              ? "Saved"
              : "Saving..."
            }
          </span>
        </div>

        {/* Date */}
        <div className="flex flex-row justify-center items-center">
          <label className="w-fit flex flex-col">
            Date
            <span className="bg-abyss-800 rounded-sm pe-2">
              {!volatileProject ?
                <Spinner3DotsScaleMiddle className="w-fit h-9 inline-block align-middle mb-1" />
                :
                <input
                  onChange={e => setVolatileProject(prev => prev ? { ...prev, date: e.target.value } : prev)}
                  onBlur={e => setVolatileProject(prev => prev ? { ...prev, date: parseDate(e.target.value) } : prev)}
                  value={volatileProject.date}
                  name="date"
                  className="text-center text-xl"
                  type="text"
                  placeholder="e.g. 2025-11-01"
                />
              }
              <IconEditOutline className="inline-block ml-2 mb-1" />
            </span>
          </label>
        </div>

        {/* Description */}
        <label className="€no-style w-full flex flex-col">
          Description
          {!volatileProject ?
            <span className="bg-abyss-800 rounded-sm h-16 flex flex-col justify-center">
              <Spinner3DotsScaleMiddle className="w-fit h-9 inline-block align-middle mb-1" />
            </span>
            :
            <pre>
              <textarea
                onChange={(e) => {
                  setVolatileProject(prev => prev ? { ...prev, description: e.target.value } : prev);
                  const area = e.currentTarget;
                  area.style.height = "0px";
                  area.style.height = `${area.scrollHeight}px`;
                }}
                ref={descRef}
                defaultValue={volatileProject.description}
                placeholder="Optional description of project."
                className="min-h-8 w-full pb-2 px-3 pt-3 text-sm font-thin"
              />
            </pre>
          }
        </label>

        {/* Export */}
        <ExportButton projectID={volatileProject?.id ?? null} />
      </aside>

      {/* Editor area */}
      <section className="lg:flex-1 not-lg:w-full">
        <ul className="flex flex-col gap-y-5">
          {/* Blocks */}
          {Object.entries(episodesByBlockID).map(([blockID, episodes]) => (
            <BlockLi
              block={volatileProject?.blocks.find(b => b.id === blockID) ?? (() => { throw new Error("Missing block with id: " + blockID); })()}
              blockIndex={volatileProject.blocks.findIndex(b => b.id === blockID)}
              project={volatileProject}
              projectSetter={setVolatileProject}
              key={`block-${blockID}`}
            >
              {episodes.map(ep => (
                <EpisodeLi
                  key={`episode-${ep.id}`}
                  episode={ep}
                  project={volatileProject}
                  projectSetter={setVolatileProject}
                />
              ))}
            </BlockLi>
          ))}

          {/* Create block button */}
          <li
            key="add-block-button"
            className="flex flex-row justify-center items-center"
          >
            <button
              type="button"
              className={`
                bg-abyss-900 hover:bg-spore-500
                text-flare-700 hover:text-abyss-500

                w-full h-16

                flex flex-row justify-center items-center
              `}
              onClick={() => {
                setVolatileProject(prev => {
                  if (!prev) return prev;
                  const blockID = generateID();
                  return {
                    ...prev,
                    blocks: [
                      ...prev.blocks,
                      {
                        id: blockID,
                        options: { ...DefaultBlockOptions },
                      },
                    ],
                    episodes: [
                      ...prev.episodes,
                      {
                        id: generateID(),
                        blockID: blockID,
                      },
                      {
                        id: generateID(),
                        blockID: blockID,
                      },
                    ],
                  };
                });
              }}
            >
              <IconAdd className="size-12" />
            </button>
          </li>
        </ul>
      </section>
    </main>
  );
}