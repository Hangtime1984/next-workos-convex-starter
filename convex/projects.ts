import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganizationId, requireIdentity } from "./lib/auth";

function slugifyProject(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export const listProjects = query({
  args: {
    workspaceId: v.id("workspaces"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const currentOrganizationId = getOrganizationId(identity);

    if (currentOrganizationId !== args.organizationId) {
      throw new ConvexError("Project access denied.");
    }

    return ctx.db
      .query("projects")
      .withIndex("by_workspace_id", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .collect();
  },
});

export const createProject = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const workspace = await ctx.db.get(args.workspaceId);

    if (!workspace) {
      throw new ConvexError("Workspace not found.");
    }

    if (workspace.organizationId !== getOrganizationId(identity)) {
      throw new ConvexError("Project creation denied.");
    }

    const projectId = await ctx.db.insert("projects", {
      workspaceId: workspace._id,
      organizationId: workspace.organizationId,
      name: args.name,
      slug:
        slugifyProject(args.name) || `project-${Date.now().toString().slice(-5)}`,
      status: "planning",
      createdByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(projectId);
  },
});

export const renameProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new ConvexError("Project not found.");
    }

    if (project.organizationId !== getOrganizationId(identity)) {
      throw new ConvexError("Project rename denied.");
    }

    await ctx.db.patch(project._id, {
      name: args.name,
      slug:
        slugifyProject(args.name) || `project-${Date.now().toString().slice(-5)}`,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(project._id);
  },
});
