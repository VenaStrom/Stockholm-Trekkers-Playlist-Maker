import { useEffect, useMemo, useState } from "react";
import { usePageContext } from "@/components/page-context/use-page-context";
import { PageRoute } from "@/components/page-context/page.internal";
import { Episode, Project } from "@/types";
import { IconArrowBack2Outline, IconEditOutline, Spinner3DotsScaleMiddle } from "@/components/icons";
import { useDebounce } from "use-debounce";
import EpisodeLi from "@/components/editor/episode";
import { openProject } from "@/functions/project/open-project";
import { saveProject } from "@/functions/project/save-project";
import BlockLi from "@/components/editor/block";

export default function Editor() {
  const { setHeaderText, projectId, setRoute } = usePageContext();
  useEffect(() => setHeaderText("Editor"), [setHeaderText]);

  const [volatileProject, setVolatileProject] = useState<Project | null>(null);

  // Load project data on mount and projectId changes
  useEffect(() => {
    if (!projectId) return;

    openProject(projectId)
      .then((project) => {
        setVolatileProject(project);
      })
      .catch((err) => {
        console.error("Failed to open project:", err);
      });
  }, [projectId]);

  // Debouncing
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
      .catch(err => {
        console.error("Error in debounced save:", err);
      });
  }, [debouncedProject]);

  // Handlers
  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setVolatileProject(prev => prev ? { ...prev, date: newDate } : prev);
  };
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setVolatileProject(prev => prev ? { ...prev, description: newDescription } : prev);
  };
  const navigateBack = () => {
    if (!volatileProject) {
      setRoute(PageRoute.Projects);
      return;
    };
    saveProject(volatileProject)
      .then(() => {
        setRoute(PageRoute.Projects);
      })
      .catch(err => {
        console.error("Error saving on navigation back:", err);
      });
  };

  // Group episodes by block id for easier rendering
  const episodesByBlockId = useMemo<Record<string, Episode[]>>(() => {
    if (!volatileProject) return {};
    const grouped: Record<string, Episode[]> = {};
    for (const ep of volatileProject.episodes) {
      const id = ep.blockId;
      grouped[id] ??= [];
      grouped[id].push(ep);
    }
    return grouped;
  }, [volatileProject]);

  return (
    <main className="flex flex-col lg:flex-row gap-x-8 gap-y-12 justify-center items-start pt-4 px-12 pb-10">
      {/* Side bar */}
      <aside className="min-w-1/4 not-lg:w-full flex flex-col gap-y-4">
        {/* Go back */}
        <button
          className="w-fit pe-3 ps-1.5 hover:bg-science-500 sticky top-5 shadow-sm"
          onClick={navigateBack}
        >
          <IconArrowBack2Outline className="inline size-6 me-1" />
          Back to Projects
        </button>

        {/* Date */}
        <div className="flex flex-row justify-center items-center">
          <label className="w-fit flex flex-col">
            Date
            <span className="bg-abyss-800 rounded-sm pe-2">
              {!volatileProject ?
                <Spinner3DotsScaleMiddle className="w-fit h-9 inline-block align-middle mb-1" />
                :
                <input
                  onChange={onDateChange}
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
                  onDescriptionChange(e);
                  const area = e.currentTarget;
                  area.style.height = "0px";
                  area.style.height = `${area.scrollHeight}px`;
                }}
                ref={(el) => {
                  if (!el) return;
                  el.style.overflow = "hidden";
                  el.style.resize = "none";
                  el.style.height = "0px";
                  el.style.height = `${el.scrollHeight}px`;
                }}
                defaultValue={volatileProject.description ?? ""}
                placeholder="Optional description of project."
                className="min-h-8 w-full pb-2 px-3 pt-3 text-sm font-thin"
              />
            </pre>
          }
        </label>
      </aside>


      {/* Editor area */}
      <section className="lg:flex-1 not-lg:w-full">
        <ul className="flex flex-col gap-y-3">
          {Object.entries(episodesByBlockId).map(([blockId, episodes]) => (
            <BlockLi
              block={volatileProject?.blocks.find(b => b.id === blockId) ?? (() => { throw new Error("Missing block with id: " + blockId) })()}
              blockIndex={volatileProject.blocks.findIndex(b => b.id === blockId)}
              key={`block-${blockId}`}
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
        </ul>
      </section>
    </main>
  );
}