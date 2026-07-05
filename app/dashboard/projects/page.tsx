import { FolderKanban } from "lucide-react";
import { getProjects } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectsList } from "./projects-list";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Projects
        </h1>
      </header>

      {projects.length === 0 ? (
        <Card className="mt-10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FolderKanban aria-hidden className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No projects yet. Projects are created automatically when a client
              approves a proposal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProjectsList projects={projects} />
      )}
    </div>
  );
}
