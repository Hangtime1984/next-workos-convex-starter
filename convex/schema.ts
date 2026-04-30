import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const outputStatus = v.union(
  v.literal("draft"),
  v.literal("reviewed"),
  v.literal("approved"),
  v.literal("archived"),
);

const contentSection = v.object({
  title: v.string(),
  content: v.string(),
});

const scoringItem = v.object({
  label: v.string(),
  score: v.optional(v.number()),
  rationale: v.optional(v.string()),
});

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
    .index("by_slug", ["slug"])
    .index("by_organization_and_slug", ["organizationId", "slug"]),

  projects: defineTable({
    workspaceId: v.id("workspaces"),
    organizationId: v.string(),
    name: v.string(),
    slug: v.string(),
    programDepartment: v.optional(v.string()),
    location: v.optional(v.string()),
    projectType: v.optional(v.string()),
    templateKey: v.optional(v.string()),
    createAsDraft: v.optional(v.boolean()),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("archived"),
    ),
    createdByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_and_slug", ["workspaceId", "slug"])
    .index("by_organization_and_slug", ["organizationId", "slug"]),

  projectProfiles: defineTable({
    projectId: v.id("projects"),
    organizationId: v.string(),
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
    updatedByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_organization_id", ["organizationId"]),

  deliveryAnalyses: defineTable({
    projectId: v.id("projects"),
    organizationId: v.string(),
    scoringSummary: v.array(scoringItem),
    recommendation: v.string(),
    rationale: v.string(),
    risks: v.array(v.string()),
    alternative: v.optional(v.string()),
    procurementApproach: v.string(),
    nextSteps: v.array(v.string()),
    status: outputStatus,
    createdByUserId: v.string(),
    updatedByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_project_and_status", ["projectId", "status"])
    .index("by_organization_id", ["organizationId"]),

  procurementPackages: defineTable({
    projectId: v.id("projects"),
    organizationId: v.string(),
    documentType: v.union(
      v.literal("RFQ"),
      v.literal("RFP"),
      v.literal("scoring_matrix"),
      v.literal("interview_rubric"),
      v.literal("selection_committee_packet"),
    ),
    deliveryMethod: v.string(),
    selectionApproach: v.union(
      v.literal("QBS"),
      v.literal("Best Value"),
      v.literal("Low Bid"),
    ),
    sections: v.array(contentSection),
    scoringMatrix: v.optional(v.array(scoringItem)),
    status: outputStatus,
    createdByUserId: v.string(),
    updatedByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_project_and_status", ["projectId", "status"])
    .index("by_organization_id", ["organizationId"]),

  generationEvents: defineTable({
    organizationId: v.string(),
    projectId: v.id("projects"),
    promptType: v.string(),
    sourceRecord: v.string(),
    generatedContentSummary: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_project_id", ["projectId"])
    .index("by_organization_id", ["organizationId"]),
});
