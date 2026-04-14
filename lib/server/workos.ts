import { WorkOS } from "@workos-inc/node";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Role, WidgetKey, WorkspaceSummary } from "@/lib/types";
import { env } from "@/lib/server/env";
import { slugify } from "@/lib/utils";

const widgetScopes = {
  "user-profile": [] as [],
  "users-management": ["widgets:users-table:manage"] as const,
  "admin-portal-sso-connection": ["widgets:sso:manage"] as const,
} satisfies Record<WidgetKey, readonly string[]>;

export function getWorkOS() {
  const { WORKOS_API_KEY, WORKOS_CLIENT_ID } = env();

  return new WorkOS(WORKOS_API_KEY, {
    clientId: WORKOS_CLIENT_ID,
  });
}

export function normalizeRole(role?: string | null, roles?: string[] | null): Role {
  const available = new Set([role, ...(roles ?? [])].filter(Boolean));

  if (available.has("owner")) {
    return "owner";
  }

  if (available.has("admin")) {
    return "admin";
  }

  return "member";
}

export function canAccessAdmin(role: Role) {
  return role === "owner" || role === "admin";
}

export function widgetPermissionFor(widget: WidgetKey) {
  return widgetScopes[widget][0] ?? null;
}

export async function getWidgetAuthToken(input: {
  widget: WidgetKey;
  organizationId: string;
  userId: string;
}) {
  return getWorkOS().widgets.getToken({
    organizationId: input.organizationId,
    userId: input.userId,
    scopes: widgetScopes[input.widget] as never,
  });
}

export async function listAccessibleWorkspaces(input: {
  accessToken: string;
  userId: string;
}) {
  const workos = getWorkOS();
  const memberships = await (
    await workos.userManagement.listOrganizationMemberships({
      userId: input.userId,
      statuses: ["active", "pending"],
    })
  ).autoPagination();

  const mirrored = await Promise.all(
    memberships.map(async (membership): Promise<WorkspaceSummary> => {
      const organization = await workos.organizations.getOrganization(
        membership.organizationId,
      );
      const workspace = await fetchMutation(
        api.workspaces.syncWorkspaceFromOrganization,
        {
          organizationId: organization.id,
          name: organization.name,
          slug:
            slugify(organization.name) ||
            `workspace-${organization.id.slice(-6).toLowerCase()}`,
          externalId: organization.externalId ?? undefined,
          domain: organization.domains[0]?.domain ?? undefined,
        },
        { token: input.accessToken },
      );

      if (!workspace) {
        throw new Error(
          `Unable to mirror WorkOS organization ${organization.id} into Convex.`,
        );
      }

      return {
        id: workspace._id,
        organizationId: workspace.organizationId,
        name: workspace.name,
        slug: workspace.slug,
        roleSlug: membership.role?.slug ?? "member",
      } satisfies WorkspaceSummary;
    }),
  );

  return mirrored.sort((left: WorkspaceSummary, right: WorkspaceSummary) =>
    left.name.localeCompare(right.name),
  );
}
