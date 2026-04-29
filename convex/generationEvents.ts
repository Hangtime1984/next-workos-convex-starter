import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireProjectAccess } from "./lib/auth";

export const listGenerationEvents = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    return ctx.db
      .query("generationEvents")
      .withIndex("by_project_id", (query) => query.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const createGenerationEvent = mutation({
  args: {
    projectId: v.id("projects"),
    promptType: v.string(),
    sourceRecord: v.string(),
    generatedContentSummary: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity, organizationId } = await requireProjectAccess(
      ctx,
      args.projectId,
    );
    const eventId = await ctx.db.insert("generationEvents", {
      organizationId,
      projectId: args.projectId,
      promptType: args.promptType,
      sourceRecord: args.sourceRecord,
      generatedContentSummary: args.generatedContentSummary,
      userId: identity.subject,
      createdAt: Date.now(),
    });

    return await ctx.db.get(eventId);
  },
});
