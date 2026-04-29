import type { MutationCtx, QueryCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";

type AuthContext = QueryCtx | MutationCtx;
export type AppRole = "owner" | "admin" | "member";

export async function requireIdentity(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Not authenticated.");
  }

  return identity;
}

export function getOrganizationId(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  return (identity.org_id as string | undefined) ?? null;
}

export async function requireOrganizationId(ctx: AuthContext) {
  const identity = await requireIdentity(ctx);
  const organizationId = getOrganizationId(identity);

  if (!organizationId) {
    throw new ConvexError("An active organization is required.");
  }

  return { identity, organizationId };
}

export function getRole(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  return (identity.role as string | undefined) ?? null;
}

export function getPermissions(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  return ((identity.permissions as string[] | undefined) ?? []).filter(Boolean);
}

export function normalizeRole(
  role?: string | null,
  roles?: string[] | null,
): AppRole {
  const available = new Set([role, ...(roles ?? [])].filter(Boolean));

  if (available.has("owner")) {
    return "owner";
  }

  if (available.has("admin")) {
    return "admin";
  }

  return "member";
}

export function roleCanApprove(role: AppRole) {
  return role === "owner" || role === "admin";
}

export function requireApprover(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  const role = normalizeRole(
    getRole(identity),
    (identity as { roles?: string[] }).roles,
  );

  if (!roleCanApprove(role)) {
    throw new ConvexError("Only owners and admins can approve or archive outputs.");
  }

  return role;
}

export async function requireWorkspaceAccess(
  ctx: AuthContext,
  workspaceId: Id<"workspaces">,
) {
  const { identity, organizationId } = await requireOrganizationId(ctx);
  const workspace = await ctx.db.get(workspaceId);

  if (!workspace || workspace.organizationId !== organizationId) {
    throw new ConvexError("Workspace access denied.");
  }

  return { identity, organizationId, workspace };
}

export async function requireProjectAccess(
  ctx: AuthContext,
  projectId: Id<"projects">,
) {
  const { identity, organizationId } = await requireOrganizationId(ctx);
  const project = await ctx.db.get(projectId);

  if (!project || project.organizationId !== organizationId) {
    throw new ConvexError("Project access denied.");
  }

  return { identity, organizationId, project };
}
