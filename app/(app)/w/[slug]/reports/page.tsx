import { WorkspaceSectionPlaceholder } from "@/components/app/workspace-section-placeholder";
import { requireWorkspaceRouteContext } from "@/lib/server/auth";

export default async function WorkspaceReportsPage({
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
      eyebrow="Portfolio reports"
      title="Reports"
      description="Reporting will summarize project setup, delivery recommendations, package status, and approval readiness after live project data is available."
      emptyTitle="Reports are not built yet"
      emptyDescription="This section currently exists to validate protected navigation and workspace routing only."
    />
  );
}
