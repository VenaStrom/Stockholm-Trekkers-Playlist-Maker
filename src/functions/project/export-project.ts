import { openProject } from "@/functions/project";

export async function exportProject(projectID: string): Promise<void> {

  const project = await openProject(projectID);
  console.info(`Exporting project ${project.date ?? project.id}...`);

  console.log(project);

  return;
}