import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganizationId, requireIdentity } from "./lib/auth";

export const syncWorkspaceFromOrganization = mutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    slug: v.string(),
    externalId: v.optional(v.string()),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_organization_id", (query) =>
        query.eq("organizationId", args.organizationId),
      )
      .unique();

    const patch = {
      name: args.name,
      slug: args.slug,
      externalId: args.externalId,
      domain: args.domain,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return await ctx.db.get(existing._id);
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      ...patch,
      organizationId: args.organizationId,
      createdByUserId: identity.subject,
    });

    return await ctx.db.get(workspaceId);
  },
});

export const activeWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const organizationId = getOrganizationId(identity);

    if (!organizationId) {
      return null;
    }

    return ctx.db
      .query("workspaces")
      .withIndex("by_organization_id", (query) =>
        query.eq("organizationId", organizationId),
      )
      .unique();
  },
});

export const workspaceBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const organizationId = getOrganizationId(identity);

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .unique();

    if (!workspace) {
      return null;
    }

    if (organizationId !== workspace.organizationId) {
      throw new ConvexError("Workspace access denied.");
    }

    return workspace;
  },
});
