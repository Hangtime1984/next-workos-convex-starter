import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { missingRequiredIntakeFields } from "./lib/projectRules";
import { requireProjectAccess } from "./lib/auth";

const profilePatch = {
  projectType: v.optional(v.string()),
  facilityType: v.optional(v.string()),
  budgetRange: v.optional(v.string()),
  projectSize: v.optional(v.string()),
  schedulePressure: v.optional(v.string()),
  scopeDefinition: v.optional(v.string()),
  phasingNeeds: v.optional(v.string()),
  ownerType: v.optional(v.string()),
  ownerCapability: v.optional(v.string()),
  deliveryExperience: v.optional(v.string()),
  ownerInvolvementPreference: v.optional(v.string()),
  topPriority: v.optional(v.string()),
  riskTolerance: v.optional(v.string()),
  changeOrderSensitivity: v.optional(v.string()),
  statutoryConstraints: v.optional(v.string()),
  marketConditions: v.optional(v.string()),
  laborRequirements: v.optional(v.string()),
  sustainabilityRequirements: v.optional(v.string()),
  bimRequirements: v.optional(v.string()),
  bondingInsuranceRequirements: v.optional(v.string()),
  shortlistCount: v.optional(v.number()),
  stipendRequirements: v.optional(v.string()),
};

export const getProjectProfile = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    return ctx.db
      .query("projectProfiles")
      .withIndex("by_project_id", (query) => query.eq("projectId", args.projectId))
      .unique();
  },
});

export const saveProjectProfile = mutation({
  args: {
    projectId: v.id("projects"),
    profile: v.object(profilePatch),
  },
  handler: async (ctx, args) => {
    const { identity, organizationId } = await requireProjectAccess(
      ctx,
      args.projectId,
    );
    const existing = await ctx.db
      .query("projectProfiles")
      .withIndex("by_project_id", (query) => query.eq("projectId", args.projectId))
      .unique();
    const patch = {
      ...args.profile,
      updatedByUserId: identity.subject,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return await ctx.db.get(existing._id);
    }

    const profileId = await ctx.db.insert("projectProfiles", {
      projectId: args.projectId,
      organizationId,
      ...patch,
    });

    return await ctx.db.get(profileId);
  },
});

export const validateRequiredIntake = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);
    const profile = await ctx.db
      .query("projectProfiles")
      .withIndex("by_project_id", (query) => query.eq("projectId", args.projectId))
      .unique();

    return {
      ready: missingRequiredIntakeFields(profile).length === 0,
      missingFields: missingRequiredIntakeFields(profile),
    };
  },
});
