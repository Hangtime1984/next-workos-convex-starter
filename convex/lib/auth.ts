import type { MutationCtx, QueryCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

type AuthContext = QueryCtx | MutationCtx;

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

export function getRole(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  return (identity.role as string | undefined) ?? null;
}

export function getPermissions(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  return ((identity.permissions as string[] | undefined) ?? []).filter(Boolean);
}
