import type { Doc } from "@/convex/_generated/dataModel";
import {
  outputStatuses,
  requiredIntakeFields,
  type OutputStatus,
  type RequiredIntakeField,
} from "@/convex/lib/projectRules";
import type { Role, WidgetKey } from "@/lib/types";

export const projectStatuses = ["planning", "active", "archived"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export const projectTypeOptions = [
  "Civic / municipal",
  "Education",
  "Healthcare",
  "Infrastructure",
  "Public safety",
  "Workplace",
] as const;

export const projectTemplateOptions = [
  "Standard capital project",
  "Public owner procurement",
  "Higher education renewal",
  "Healthcare facility upgrade",
] as const;

export type ProjectTypeOption = (typeof projectTypeOptions)[number];
export type ProjectTemplateOption = (typeof projectTemplateOptions)[number];

export type ProjectStage = "draft" | "intake" | "active" | "archived";

export type {
  OutputStatus,
  RequiredIntakeField,
};

export type WorkspaceRecord = Doc<"workspaces">;
export type ProjectRecord = Doc<"projects">;
export type ProjectProfileRecord = Doc<"projectProfiles">;
export type DeliveryAnalysisRecord = Doc<"deliveryAnalyses">;
export type ProcurementPackageRecord = Doc<"procurementPackages">;
export type GenerationEventRecord = Doc<"generationEvents">;

export type ScoringItem = {
  label: string;
  score?: number;
  rationale?: string;
};

export type ContentSection = {
  title: string;
  content: string;
};

export const intakeFields = [
  ...requiredIntakeFields,
  "phasingNeeds",
  "deliveryExperience",
  "ownerInvolvementPreference",
  "changeOrderSensitivity",
  "laborRequirements",
  "sustainabilityRequirements",
  "bimRequirements",
  "bondingInsuranceRequirements",
  "shortlistCount",
  "stipendRequirements",
] as const;

export type IntakeField = (typeof intakeFields)[number];

export type ProjectProfileDraft = Partial<
  Record<Exclude<IntakeField, "shortlistCount">, string | null | undefined> & {
    shortlistCount: number | null | undefined;
  }
>;

export const documentTypes = [
  "RFQ",
  "RFP",
  "scoring_matrix",
  "interview_rubric",
  "selection_committee_packet",
] as const;

export type ProcurementDocumentType = (typeof documentTypes)[number];

export const selectionApproaches = ["QBS", "Best Value", "Low Bid"] as const;

export type SelectionApproach = (typeof selectionApproaches)[number];

export const projectStatusLabels = {
  planning: "Planning",
  active: "Active",
  archived: "Archived",
} satisfies Record<ProjectStatus, string>;

export const projectStageLabels = {
  draft: "Draft",
  intake: "Intake",
  active: "Active",
  archived: "Archived",
} satisfies Record<ProjectStage, string>;

export const outputStatusLabels = {
  draft: "Draft",
  reviewed: "Reviewed",
  approved: "Approved",
  archived: "Archived",
} satisfies Record<OutputStatus, string>;

export const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
} satisfies Record<Role, string>;

export function getProjectStatusLabel(status: ProjectStatus) {
  return projectStatusLabels[status];
}

export function getProjectStage(input: {
  status: ProjectStatus;
  createAsDraft?: boolean;
}): ProjectStage {
  if (input.status === "archived") {
    return "archived";
  }

  if (input.status === "active") {
    return "active";
  }

  return input.createAsDraft === false ? "intake" : "draft";
}

export function getProjectStageLabel(input: {
  status: ProjectStatus;
  createAsDraft?: boolean;
}) {
  return projectStageLabels[getProjectStage(input)];
}

export function getOutputStatusLabel(status: OutputStatus) {
  return outputStatusLabels[status];
}

export function getRoleLabel(role: Role) {
  return roleLabels[role];
}

export function canAccessAdminUi(role: Role) {
  return role === "owner" || role === "admin";
}

export function canApproveOutputs(role: Role) {
  return canAccessAdminUi(role);
}

export function hasPermission(permissions: readonly string[], permission: string) {
  return permissions.includes(permission);
}

export function canUseWidget(input: {
  role: Role;
  permissions: readonly string[];
  widget: WidgetKey;
}) {
  if (input.widget === "user-profile") {
    return true;
  }

  if (!canAccessAdminUi(input.role)) {
    return false;
  }

  if (input.widget === "users-management") {
    return hasPermission(input.permissions, "widgets:users-table:manage");
  }

  return hasPermission(input.permissions, "widgets:sso:manage");
}

export type CreateProjectDraft = {
  name: string;
  programDepartment: string;
  location: string;
  projectType: string;
  templateKey: string;
  createAsDraft: boolean;
};

export type CreateProjectValidationErrors = Partial<
  Record<keyof Omit<CreateProjectDraft, "templateKey" | "createAsDraft">, string>
>;

export function createEmptyProjectDraft(): CreateProjectDraft {
  return {
    name: "",
    programDepartment: "",
    location: "",
    projectType: "",
    templateKey: "",
    createAsDraft: true,
  };
}

export function normalizeCreateProjectDraft(draft: CreateProjectDraft) {
  return {
    name: draft.name.trim(),
    programDepartment: draft.programDepartment.trim(),
    location: draft.location.trim(),
    projectType: draft.projectType.trim(),
    templateKey: draft.templateKey.trim() || undefined,
    createAsDraft: draft.createAsDraft,
  };
}

export function validateCreateProjectDraft(
  draft: CreateProjectDraft,
): CreateProjectValidationErrors {
  const normalized = normalizeCreateProjectDraft(draft);
  const errors: CreateProjectValidationErrors = {};

  if (normalized.name.length < 2) {
    errors.name = "Project name must be at least 2 characters.";
  }

  if (!normalized.programDepartment) {
    errors.programDepartment = "Program or department is required.";
  }

  if (!normalized.location) {
    errors.location = "Location is required.";
  }

  if (!normalized.projectType) {
    errors.projectType = "Project type is required.";
  }

  return errors;
}

export function isCreateProjectDraftValid(draft: CreateProjectDraft) {
  return Object.keys(validateCreateProjectDraft(draft)).length === 0;
}

export type ProjectListFilter = {
  search: string;
  status: "all" | ProjectStatus;
};

export type FilterableProject = Pick<
  ProjectRecord,
  | "name"
  | "slug"
  | "status"
  | "programDepartment"
  | "location"
  | "projectType"
>;

export function filterProjects<TProject extends FilterableProject>(
  projects: readonly TProject[],
  filter: ProjectListFilter,
) {
  const query = filter.search.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesStatus =
      filter.status === "all" || project.status === filter.status;

    if (!matchesStatus) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      project.name,
      project.slug,
      project.programDepartment,
      project.location,
      project.projectType,
    ]
      .filter((value): value is string => typeof value === "string")
      .some((value) => value.toLowerCase().includes(query));
  });
}

export type NormalizedAppErrorKind =
  | "auth"
  | "organization"
  | "permission"
  | "notFound"
  | "validation"
  | "unknown";

export type NormalizedAppError = {
  kind: NormalizedAppErrorKind;
  message: string;
};

const normalizedErrorMessages = {
  auth: "Sign in to continue.",
  organization: "Choose an active organization to continue.",
  permission: "Your current role does not grant access to this action.",
  notFound: "The requested record could not be found.",
  validation: "Some required information is missing or invalid.",
  unknown: "Something went wrong. Try again.",
} satisfies Record<NormalizedAppErrorKind, string>;

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "";
}

export function normalizeAppError(error: unknown): NormalizedAppError {
  const text = getErrorText(error).toLowerCase();

  if (text.includes("not authenticated") || text.includes("must be signed in")) {
    return { kind: "auth", message: normalizedErrorMessages.auth };
  }

  if (
    text.includes("active organization") ||
    text.includes("inactive organization")
  ) {
    return {
      kind: "organization",
      message: normalizedErrorMessages.organization,
    };
  }

  if (
    text.includes("access denied") ||
    text.includes("permission") ||
    text.includes("current role") ||
    text.includes("only owners and admins")
  ) {
    return { kind: "permission", message: normalizedErrorMessages.permission };
  }

  if (text.includes("not found")) {
    return { kind: "notFound", message: normalizedErrorMessages.notFound };
  }

  if (
    text.includes("missing required intake") ||
    text.includes("at least 2 characters")
  ) {
    return { kind: "validation", message: normalizedErrorMessages.validation };
  }

  return { kind: "unknown", message: normalizedErrorMessages.unknown };
}

export { outputStatuses, requiredIntakeFields };
