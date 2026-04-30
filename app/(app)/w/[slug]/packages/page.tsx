import { WorkspaceSectionPlaceholder } from "@/components/app/workspace-section-placeholder";
import { requireWorkspaceRouteContext } from "@/lib/server/auth";

export default async function WorkspacePackagesPage({
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
      eyebrow="Procurement packages"
      title="Packages"
      description="Generated RFQ/RFP packages, scoring matrices, rubrics, and committee packets will be surfaced here in a later phase."
      emptyTitle="Package workspace is not built yet"
      emptyDescription="No procurement generation, editing, review, approval, or export workflows are included in Phase 2A."
    />
  );
}
