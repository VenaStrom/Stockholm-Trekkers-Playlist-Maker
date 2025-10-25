import { useEffect } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import ProjectCard from "../components/project-card";

export default function Projects() {
  const { setHeaderText } = usePageContext();
  useEffect(() => setHeaderText("Projects"), [setHeaderText]);

  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      <p className="p-4">Load, export or import previous projects or create entirely new ones.</p>

      <ul className="w-11/12 md:w-7/12 flex flex-col gap-y-4 h-full overflow-y-auto pe-4">
        {new Array(10).fill(0).map((_, i) => (
          <ProjectCard projectId="" key={i} />
        ))}
      </ul>
    </main>
  );
}