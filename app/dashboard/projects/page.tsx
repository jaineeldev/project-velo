import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { getProjects } from "./actions";
import { dateShortFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

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
        <Card className="mt-10 border-dashed shadow-none">
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
        <Card className="mt-10 overflow-hidden">
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent",
                    focusRing,
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {p.title}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {p.client_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={p.status} />
                    <p className="w-28 text-right text-xs text-muted-foreground">
                      {dateShortFmt.format(new Date(p.created_at))}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
