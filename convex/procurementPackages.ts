import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOutputEditable } from "./lib/projectRules";
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

const documentType = v.union(
  v.literal("RFQ"),
  v.literal("RFP"),
  v.literal("scoring_matrix"),
  v.literal("interview_rubric"),
  v.literal("selection_committee_packet"),
);

const selectionApproach = v.union(
  v.literal("QBS"),
  v.literal("Best Value"),
  v.literal("Low Bid"),
);

const section = v.object({
  title: v.string(),
  content: v.string(),
});

const scoringItem = v.object({
  label: v.string(),
  score: v.optional(v.number()),
  rationale: v.optional(v.string()),
});

export const listProcurementPackages = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    return ctx.db
      .query("procurementPackages")
      .withIndex("by_project_id", (query) => query.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const createProcurementPackage = mutation({
  args: {
    projectId: v.id("projects"),
    documentType,
    deliveryMethod: v.string(),
    selectionApproach,
    sections: v.array(section),
    scoringMatrix: v.optional(v.array(scoringItem)),
  },
  handler: async (ctx, args) => {
    const { identity, organizationId } = await requireProjectAccess(
      ctx,
      args.projectId,
    );
    const packageId = await ctx.db.insert("procurementPackages", {
      projectId: args.projectId,
      organizationId,
      documentType: args.documentType,
      deliveryMethod: args.deliveryMethod,
      selectionApproach: args.selectionApproach,
      sections: args.sections,
      scoringMatrix: args.scoringMatrix,
      status: "draft",
      createdByUserId: identity.subject,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(packageId);
  },
});

export const updateProcurementPackage = mutation({
  args: {
    packageId: v.id("procurementPackages"),
    documentType: v.optional(documentType),
    deliveryMethod: v.optional(v.string()),
    selectionApproach: v.optional(selectionApproach),
    sections: v.optional(v.array(section)),
    scoringMatrix: v.optional(v.array(scoringItem)),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const procurementPackage = await ctx.db.get(args.packageId);

    if (!procurementPackage) {
      throw new ConvexError("Procurement package not found.");
    }

    await requireProjectAccess(ctx, procurementPackage.projectId);
    assertOutputEditable(procurementPackage.status);

    await ctx.db.patch(procurementPackage._id, {
      documentType: args.documentType ?? procurementPackage.documentType,
      deliveryMethod: args.deliveryMethod ?? procurementPackage.deliveryMethod,
      selectionApproach:
        args.selectionApproach ?? procurementPackage.selectionApproach,
      sections: args.sections ?? procurementPackage.sections,
      scoringMatrix: args.scoringMatrix ?? procurementPackage.scoringMatrix,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(procurementPackage._id);
  },
});

export const updateProcurementPackageStatus = mutation({
  args: {
    packageId: v.id("procurementPackages"),
    status,
  },
  handler: async (ctx, args) => {
    const procurementPackage = await ctx.db.get(args.packageId);

    if (!procurementPackage) {
      throw new ConvexError("Procurement package not found.");
    }

    const { identity } = await requireProjectAccess(
      ctx,
      procurementPackage.projectId,
    );

    if (args.status === "approved" || args.status === "archived") {
      requireApprover(identity);
    }

    if (procurementPackage.status === "approved" && args.status !== "archived") {
      throw new ConvexError("Approved outputs are immutable.");
    }

    await ctx.db.patch(procurementPackage._id, {
      status: args.status,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(procurementPackage._id);
  },
});

export const duplicateApprovedProcurementPackage = mutation({
  args: {
    packageId: v.id("procurementPackages"),
  },
  handler: async (ctx, args) => {
    const procurementPackage = await ctx.db.get(args.packageId);

    if (!procurementPackage) {
      throw new ConvexError("Procurement package not found.");
    }

    if (procurementPackage.status !== "approved") {
      throw new ConvexError("Only approved outputs can be duplicated.");
    }

    const { identity } = await requireProjectAccess(
      ctx,
      procurementPackage.projectId,
    );
    const packageId = await ctx.db.insert("procurementPackages", {
      projectId: procurementPackage.projectId,
      organizationId: procurementPackage.organizationId,
      documentType: procurementPackage.documentType,
      deliveryMethod: procurementPackage.deliveryMethod,
      selectionApproach: procurementPackage.selectionApproach,
      sections: procurementPackage.sections,
      scoringMatrix: procurementPackage.scoringMatrix,
      status: "draft",
      createdByUserId: identity.subject,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(packageId);
  },
});
