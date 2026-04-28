import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

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
