import { withAuth } from "@workos-inc/authkit-nextjs";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { api } from "@/convex/_generated/api";
import type { Role, WorkspaceSummary } from "@/lib/types";
import {
  buildAppPath,
  buildProjectPath,
  buildWorkspacePath,
  buildWorkspaceProjectsPath,
} from "@/lib/routes";
import { buildActivateOrganizationPath, buildSignInPath } from "@/lib/utils";
import {
  canAccessAdmin,
  listAccessibleWorkspaces,
  normalizeRole,
  widgetPermissionFor,
} from "@/lib/server/workos";

export const getAppContext = cache(async () => {
  const auth = await withAuth();

  if (!auth.user || !auth.accessToken) {
    redirect(buildSignInPath("/app"));
  }

  await fetchMutation(api.users.syncViewerProfile, {}, { token: auth.accessToken });

  const workspaces = await listAccessibleWorkspaces({
    activeOrganizationId: auth.organizationId,
    accessToken: auth.accessToken,
    userId: auth.user.id,
  });

  if (workspaces.length === 0) {
    redirect("/onboarding/workspace");
  }

  const activeWorkspace =
    workspaces.find(
      (workspace: WorkspaceSummary) => workspace.organizationId === auth.organizationId,
    ) ?? workspaces[0];

  if (!auth.organizationId || auth.organizationId !== activeWorkspace.organizationId) {
    redirect(
      buildActivateOrganizationPath({
        organizationId: activeWorkspace.organizationId,
        returnTo: buildWorkspacePath(activeWorkspace.slug),
      }),
    );
  }

  const viewer = await fetchQuery(api.users.viewer, {}, { token: auth.accessToken });
  const role = normalizeRole(auth.role, auth.roles);

  return {
    auth,
    viewer,
    workspaces,
    activeWorkspace,
    role,
    permissions: auth.permissions ?? [],
  };
});

export type AppContext = Awaited<ReturnType<typeof getAppContext>>;

export async function requireWorkspaceRouteContext(
  slug: string,
  options: { returnTo?: string } = {},
) {
  const context = await getAppContext();

  if (slug === context.activeWorkspace.slug) {
    return {
      ...context,
      routeWorkspace: context.activeWorkspace,
    };
  }

  const requestedWorkspace = context.workspaces.find(
    (workspace: WorkspaceSummary) => workspace.slug === slug,
  );

  if (!requestedWorkspace) {
    notFound();
  }

  redirect(
    buildActivateOrganizationPath({
      organizationId: requestedWorkspace.organizationId,
      returnTo: options.returnTo ?? buildWorkspaceProjectsPath(requestedWorkspace.slug),
    }),
  );
}

export async function requireProjectRouteContext(input: {
  workspaceSlug: string;
  projectSlug: string;
}) {
  const context = await requireWorkspaceRouteContext(input.workspaceSlug, {
    returnTo: buildProjectPath(input),
  });
  const project = await fetchQuery(
    api.projects.getProjectBySlug,
    {
      workspaceId: context.activeWorkspace.id,
      slug: input.projectSlug,
    },
    { token: context.auth.accessToken },
  );

  if (!project) {
    notFound();
  }

  return {
    ...context,
    project,
  };
}

export async function requireAdminContext() {
  const context = await getAppContext();

  if (!canAccessAdmin(context.role)) {
    redirect(buildAppPath());
  }

  return context;
}

export function ensureWidgetAccess(input: {
  role: Role;
  permissions: string[];
  widget: "user-profile" | "users-management" | "admin-portal-sso-connection";
}) {
  if (input.widget === "user-profile") {
    return true;
  }

  if (!canAccessAdmin(input.role)) {
    return false;
  }

  const requiredPermission = widgetPermissionFor(input.widget);

  return requiredPermission ? input.permissions.includes(requiredPermission) : true;
}
