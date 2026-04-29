import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { nextAvailableSlug } from "./lib/projectRules";
import {
  requireProjectAccess,
  requireWorkspaceAccess,
} from "./lib/auth";
import type { Id } from "./_generated/dataModel";

function slugifyProject(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function availableProjectSlug(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  name: string,
  excludeProjectId?: Id<"projects">,
) {
  const baseSlug = slugifyProject(name) || `project-${Date.now().toString().slice(-5)}`;
  const existingProjects = await ctx.db
    .query("projects")
    .withIndex("by_workspace_id", (query) => query.eq("workspaceId", workspaceId))
    .collect();

  return nextAvailableSlug(
    baseSlug,
    existingProjects
      .filter((project) => project._id !== excludeProjectId)
      .map((project) => project.slug),
  );
}

export const listProjects = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId);

    return ctx.db
      .query("projects")
      .withIndex("by_workspace_id", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .collect();
  },
});

export const getProjectBySlug = query({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAccess(ctx, args.workspaceId);

    return ctx.db
      .query("projects")
      .withIndex("by_workspace_and_slug", (query) =>
        query.eq("workspaceId", args.workspaceId).eq("slug", args.slug),
      )
      .unique();
  },
});

export const createProject = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();

    if (name.length < 2) {
      throw new ConvexError("Project names should be at least 2 characters long.");
    }

    const { identity, workspace } = await requireWorkspaceAccess(
      ctx,
      args.workspaceId,
    );
    const projectId = await ctx.db.insert("projects", {
      workspaceId: workspace._id,
      organizationId: workspace.organizationId,
      name,
      slug: await availableProjectSlug(ctx, workspace._id, name),
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
    const name = args.name.trim();

    if (name.length < 2) {
      throw new ConvexError("Project names should be at least 2 characters long.");
    }

    const { project } = await requireProjectAccess(ctx, args.projectId);

    await ctx.db.patch(project._id, {
      name,
      slug: await availableProjectSlug(ctx, project.workspaceId, name, project._id),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(project._id);
  },
});
