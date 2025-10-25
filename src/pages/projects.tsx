import { useEffect } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import ProjectCard from "../components/project-card";
import { demoProject } from "../types";

export default function Projects() {
  const { setHeaderText, projects, setProjects } = usePageContext();

  useEffect(() => setHeaderText("Projects"), [setHeaderText]);
  useEffect(() => setProjects([demoProject]), [setProjects]);

  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      <p className="p-4">Load, export or import previous projects or create entirely new ones.</p>

      <ul className="w-11/12 md:w-7/12 flex flex-col gap-y-4 h-full overflow-y-auto pe-4">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </ul>
    </main>
  );
}