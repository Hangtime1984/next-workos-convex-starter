import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    activeOrganizationId: v.optional(v.string()),
    role: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    lastSeenAt: v.number(),
  }).index("by_user_id", ["userId"]),

  workspaces: defineTable({
    organizationId: v.string(),
    name: v.string(),
    slug: v.string(),
    externalId: v.optional(v.string()),
    domain: v.optional(v.string()),
    createdByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_slug", ["slug"]),

  projects: defineTable({
    workspaceId: v.id("workspaces"),
    organizationId: v.string(),
    name: v.string(),
    slug: v.string(),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("archived"),
    ),
    createdByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_and_slug", ["workspaceId", "slug"]),
});
