import { mutation, query } from "./_generated/server";
import { getOrganizationId, getPermissions, getRole, requireIdentity } from "./lib/auth";

export const syncViewerProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (query) => query.eq("userId", identity.subject))
      .unique();

    const patch = {
      email: identity.email ?? undefined,
      name: identity.name ?? undefined,
      firstName: identity.givenName ?? undefined,
      lastName: identity.familyName ?? undefined,
      pictureUrl: identity.pictureUrl ?? undefined,
      activeOrganizationId: getOrganizationId(identity) ?? undefined,
      role: getRole(identity) ?? undefined,
      permissions: getPermissions(identity),
      lastSeenAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return ctx.db.insert("profiles", {
      userId: identity.subject,
      ...patch,
    });
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (query) => query.eq("userId", identity.subject))
      .unique();

    return {
      userId: identity.subject,
      email: profile?.email ?? identity.email ?? null,
      name: profile?.name ?? identity.name ?? null,
      firstName: profile?.firstName ?? identity.givenName ?? null,
      lastName: profile?.lastName ?? identity.familyName ?? null,
      pictureUrl: profile?.pictureUrl ?? identity.pictureUrl ?? null,
      activeOrganizationId:
        profile?.activeOrganizationId ?? getOrganizationId(identity),
      role: profile?.role ?? getRole(identity),
      permissions: profile?.permissions ?? getPermissions(identity),
    };
  },
});
