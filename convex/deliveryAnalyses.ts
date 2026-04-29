import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  assertOutputEditable,
  missingRequiredIntakeFields,
} from "./lib/projectRules";
import {
  requireApprover,
  requireIdentity,
  requireProjectAccess,
} from "./lib/auth";

const status = v.union(
  v.literal("draft"),
  v.literal("reviewed"),
  v.literal("approved"),
  v.literal("archived"),
);

const scoringItem = v.object({
  label: v.string(),
  score: v.optional(v.number()),
  rationale: v.optional(v.string()),
});

async function requireCompleteIntake(
  ctx: MutationCtx,
  projectId: Id<"projects">,
) {
  const profile = await ctx.db
    .query("projectProfiles")
    .withIndex("by_project_id", (query) => query.eq("projectId", projectId))
    .unique();
  const missingFields = missingRequiredIntakeFields(profile);

  if (missingFields.length > 0) {
    throw new ConvexError(`Missing required intake fields: ${missingFields.join(", ")}`);
  }
}

export const listDeliveryAnalyses = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    return ctx.db
      .query("deliveryAnalyses")
      .withIndex("by_project_id", (query) => query.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const createDeliveryAnalysis = mutation({
  args: {
    projectId: v.id("projects"),
    scoringSummary: v.array(scoringItem),
    recommendation: v.string(),
    rationale: v.string(),
    risks: v.array(v.string()),
    alternative: v.optional(v.string()),
    procurementApproach: v.string(),
    nextSteps: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity, organizationId } = await requireProjectAccess(
      ctx,
      args.projectId,
    );
    await requireCompleteIntake(ctx, args.projectId);

    const analysisId = await ctx.db.insert("deliveryAnalyses", {
      projectId: args.projectId,
      organizationId,
      scoringSummary: args.scoringSummary,
      recommendation: args.recommendation,
      rationale: args.rationale,
      risks: args.risks,
      alternative: args.alternative,
      procurementApproach: args.procurementApproach,
      nextSteps: args.nextSteps,
      status: "draft",
      createdByUserId: identity.subject,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(analysisId);
  },
});

export const updateDeliveryAnalysis = mutation({
  args: {
    analysisId: v.id("deliveryAnalyses"),
    recommendation: v.optional(v.string()),
    rationale: v.optional(v.string()),
    risks: v.optional(v.array(v.string())),
    alternative: v.optional(v.string()),
    procurementApproach: v.optional(v.string()),
    nextSteps: v.optional(v.array(v.string())),
    scoringSummary: v.optional(v.array(scoringItem)),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new ConvexError("Delivery analysis not found.");
    }

    await requireProjectAccess(ctx, analysis.projectId);
    assertOutputEditable(analysis.status);

    await ctx.db.patch(analysis._id, {
      recommendation: args.recommendation ?? analysis.recommendation,
      rationale: args.rationale ?? analysis.rationale,
      risks: args.risks ?? analysis.risks,
      alternative: args.alternative ?? analysis.alternative,
      procurementApproach: args.procurementApproach ?? analysis.procurementApproach,
      nextSteps: args.nextSteps ?? analysis.nextSteps,
      scoringSummary: args.scoringSummary ?? analysis.scoringSummary,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(analysis._id);
  },
});

export const updateDeliveryAnalysisStatus = mutation({
  args: {
    analysisId: v.id("deliveryAnalyses"),
    status,
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new ConvexError("Delivery analysis not found.");
    }

    const { identity } = await requireProjectAccess(ctx, analysis.projectId);

    if (args.status === "approved" || args.status === "archived") {
      requireApprover(identity);
    }

    if (analysis.status === "approved" && args.status !== "archived") {
      throw new ConvexError("Approved outputs are immutable.");
    }

    await ctx.db.patch(analysis._id, {
      status: args.status,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(analysis._id);
  },
});

export const duplicateApprovedDeliveryAnalysis = mutation({
  args: {
    analysisId: v.id("deliveryAnalyses"),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new ConvexError("Delivery analysis not found.");
    }

    if (analysis.status !== "approved") {
      throw new ConvexError("Only approved outputs can be duplicated.");
    }

    const { identity } = await requireProjectAccess(ctx, analysis.projectId);
    const analysisId = await ctx.db.insert("deliveryAnalyses", {
      projectId: analysis.projectId,
      organizationId: analysis.organizationId,
      scoringSummary: analysis.scoringSummary,
      recommendation: analysis.recommendation,
      rationale: analysis.rationale,
      risks: analysis.risks,
      alternative: analysis.alternative,
      procurementApproach: analysis.procurementApproach,
      nextSteps: analysis.nextSteps,
      status: "draft",
      createdByUserId: identity.subject,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(analysisId);
  },
});
