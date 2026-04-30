import { WorkspaceSectionPlaceholder } from "@/components/app/workspace-section-placeholder";
import { requireWorkspaceRouteContext } from "@/lib/server/auth";

export default async function WorkspaceTemplatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const context = await requireWorkspaceRouteContext(slug);

  return (
    <WorkspaceSectionPlaceholder
      workspace={context.routeWorkspace}
      role={context.role}
      eyebrow="Workspace templates"
      title="Templates"
      description="Reusable procurement and intake templates will live here after the core project dashboard is in place."
      emptyTitle="Template library is not built yet"
      emptyDescription="Phase 2A only proves navigation and tenant context for this section."
    />
  );
}
