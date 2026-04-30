import { WorkspaceSectionPlaceholder } from "@/components/app/workspace-section-placeholder";
import { requireWorkspaceRouteContext } from "@/lib/server/auth";

export default async function WorkspaceSettingsPage({
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
      eyebrow="Workspace settings"
      title="Settings"
      description="Workspace-level configuration will stay aligned with WorkOS organization, role, and permission boundaries."
      emptyTitle="Workspace settings are not built yet"
      emptyDescription="Profile and admin WorkOS widget routes remain available from the user menu for this phase."
    />
  );
}
