import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectWorkspacePanel } from "@/components/app/project-workspace-panel";
import { requireWorkspaceRouteContext } from "@/lib/server/auth";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const context = await requireWorkspaceRouteContext(slug);

  const preloadedProjects = await preloadQuery(
    api.projects.listProjects,
    {
      workspaceId: context.activeWorkspace.id,
    },
    { token: context.auth.accessToken },
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="page-surface">
        <CardHeader>
          <CardTitle className="text-3xl">Workspace projects</CardTitle>
          <CardDescription>
            This panel is the sample domain for the starter: org-scoped projects backed by Convex queries and mutations.
          </CardDescription>
        </CardHeader>
      </Card>

      <ProjectWorkspacePanel
        workspaceId={context.activeWorkspace.id}
        preloadedProjects={preloadedProjects}
      />
    </div>
  );
}
