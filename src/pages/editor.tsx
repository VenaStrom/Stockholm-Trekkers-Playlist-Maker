import { useCallback, useEffect, useState } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import { PageRoute } from "../components/page-context/page.internal";
import { Project } from "@/types";
import { IconArrowBack2Outline, IconEditOutline, Spinner3DotsScaleMiddle } from "../components/icons";
import { useDebounce } from "use-debounce";
import EpisodeLi from "../components/editor/episode";
import { openProject } from "@/functions/project/open-project";
import { saveProject } from "@/functions/project/save-project";

export default function Editor() {
  const { setHeaderText, projectId, setRoute } = usePageContext();
  useEffect(() => setHeaderText("Editor"), [setHeaderText]);

  const [volatileProject, setVolatileProject] = useState<Project | null>(null);
  const [SHOW_DEBUG, setSHOW_DEBUG] = useState(false);

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

  // DEBUG register ctrl+D to toggle debug info
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "d") {
        setSHOW_DEBUG(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Save project data to file when changed
  const save = useCallback(async () => {
    if (!volatileProject) return;
    await saveProject(volatileProject)
      .catch(err => {
        console.error("Error saving project:", err);
      });
  }, [volatileProject]);

  // Debouncing
  const debouncedProjectData = useDebounce(volatileProject, 500);
  useEffect(() => {
    if (!debouncedProjectData[0]) return;
    save()
      .catch(err => {
        console.error("Error in debounced save:", err);
      });
  }, [debouncedProjectData, save]);

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
    save()
      .then(() => {
        setRoute(PageRoute.Projects);
      })
      .catch(err => {
        console.error("Error navigating back:", err);
      });
  };

  return (
    <main className="flex flex-col lg:flex-row gap-x-8 gap-y-12 justify-center items-start pt-4 px-12">
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
              className="min-h-8 w-full pb-2"
            />
          }
        </label>

        {/* DEBUG TODO - remove */}
        {SHOW_DEBUG &&
          <pre className="opacity-50 text-xs mt-10 w-0">
            {JSON.stringify(debouncedProjectData[0]) === JSON.stringify(volatileProject) ? "Saved" : "Saving..."}
            <br />
            {JSON.stringify(volatileProject, null, 2)}
          </pre>
        }
      </aside>

      <section className="lg:flex-1 not-lg:w-full">
        <ul>
          {volatileProject?.episodes.map(ep => (
            <EpisodeLi
              key={`episode-${ep.id}`}
              episode={ep}
              project={volatileProject}
              projectSetter={setVolatileProject}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}