export const outputStatuses = ["draft", "reviewed", "approved", "archived"] as const;

export type OutputStatus = (typeof outputStatuses)[number];

export const requiredIntakeFields = [
  "projectType",
  "facilityType",
  "budgetRange",
  "projectSize",
  "schedulePressure",
  "scopeDefinition",
  "ownerType",
  "ownerCapability",
  "topPriority",
  "riskTolerance",
  "statutoryConstraints",
  "marketConditions",
] as const;

export type RequiredIntakeField = (typeof requiredIntakeFields)[number];

export type IntakeDraft = Partial<Record<RequiredIntakeField, string | null | undefined>>;

export function missingRequiredIntakeFields(profile: IntakeDraft | null | undefined) {
  return requiredIntakeFields.filter((field) => {
    const value = profile?.[field];
    return typeof value !== "string" || value.trim().length === 0;
  });
}

export function assertOutputEditable(status: OutputStatus) {
  if (status === "approved") {
    throw new Error("Approved outputs are immutable. Duplicate into a new draft first.");
  }
}

export function nextAvailableSlug(
  baseSlug: string,
  existingSlugs: Iterable<string>,
) {
  const existing = new Set(existingSlugs);
  const base = baseSlug || "project";

  if (!existing.has(base)) {
    return base;
  }

  let suffix = 2;
  let candidate = `${base}-${suffix}`;

  while (existing.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}
