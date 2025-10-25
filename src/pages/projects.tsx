import ProjectCard from "../components/project-card";

export default function Projects() {
  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      <ul className="w-7/12 flex flex-col gap-y-4 py-6 h-full overflow-y-auto pe-3">
        {new Array(10).fill(0).map((_, i) => (
          <ProjectCard projectId="" key={i} />
        ))}
      </ul>
    </main>
  );
}