import { preloadQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectWorkspacePanel } from "@/components/app/project-workspace-panel";
import { getAppContext } from "@/lib/server/auth";
import type { WorkspaceSummary } from "@/lib/types";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const context = await getAppContext();

  if (slug !== context.activeWorkspace.slug) {
    const isKnownWorkspace = context.workspaces.some(
      (workspace: WorkspaceSummary) => workspace.slug === slug,
    );

    if (!isKnownWorkspace) {
      notFound();
    }

    redirect("/app");
  }

  const preloadedProjects = await preloadQuery(
    api.projects.listProjects,
    {
      workspaceId: context.activeWorkspace.id,
      organizationId: context.activeWorkspace.organizationId,
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
