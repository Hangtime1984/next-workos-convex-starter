import { ProjectDashboard } from "@/components/app/project-workspace-panel";
import { requireWorkspaceRouteContext } from "@/lib/server/auth";

export default async function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const context = await requireWorkspaceRouteContext(slug);

  return (
    <ProjectDashboard
      workspaceId={context.routeWorkspace.id}
      workspaceName={context.routeWorkspace.name}
      workspaceSlug={context.routeWorkspace.slug}
    />
  );
}
