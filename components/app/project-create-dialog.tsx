"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  createEmptyProjectDraft,
  isCreateProjectDraftValid,
  normalizeAppError,
  normalizeCreateProjectDraft,
  projectTemplateOptions,
  projectTypeOptions,
  validateCreateProjectDraft,
  type CreateProjectDraft,
  type CreateProjectValidationErrors,
} from "@/lib/frontend-contracts";
import { buildProjectPath } from "@/lib/routes";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type TouchedFields = Partial<Record<keyof CreateProjectValidationErrors, boolean>>;

function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  invalid?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid || undefined}
      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function ProjectField({
  id,
  label,
  error,
  touched,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  touched?: boolean;
  children: ReactNode;
}) {
  const showError = Boolean(touched && error);

  return (
    <Field data-invalid={showError || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        {children}
        {showError ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}

export function ProjectCreateDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
}) {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);
  const [draft, setDraft] = useState<CreateProjectDraft>(
    createEmptyProjectDraft,
  );
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const validationErrors = validateCreateProjectDraft(draft);
  const createDisabled = isCreating || !isCreateProjectDraftValid(draft);

  function updateDraft<Key extends keyof CreateProjectDraft>(
    key: Key,
    value: CreateProjectDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setCreateError(null);
  }

  function touchField(field: keyof CreateProjectValidationErrors) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function resetCreateForm() {
    setDraft(createEmptyProjectDraft());
    setTouched({});
    setCreateError(null);
    setIsCreating(false);
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({
      name: true,
      programDepartment: true,
      location: true,
      projectType: true,
    });

    if (!isCreateProjectDraftValid(draft)) {
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const normalized = normalizeCreateProjectDraft(draft);
      const project = await createProject({
        workspaceId,
        ...normalized,
      });

      if (!project) {
        throw new Error("The created project could not be loaded.");
      }

      toast.success(`Created ${project.name}`);
      onOpenChange(false);
      resetCreateForm();
      router.push(
        buildProjectPath({
          workspaceSlug,
          projectSlug: project.slug,
          section: "intake",
        }),
      );
    } catch (error) {
      const normalizedError = normalizeAppError(error);
      setCreateError(normalizedError.message);
      toast.error(normalizedError.message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
          resetCreateForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Start with enough project context to route the work toward intake.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleCreateProject}>
          <FieldGroup>
            <ProjectField
              id="project-name"
              label="Project Name"
              error={validationErrors.name}
              touched={touched.name}
            >
              <InputGroup>
                <InputGroupInput
                  id="project-name"
                  value={draft.name}
                  onBlur={() => touchField("name")}
                  onChange={(event) => updateDraft("name", event.target.value)}
                  placeholder="Riverfront community center"
                  aria-invalid={Boolean(touched.name && validationErrors.name)}
                />
              </InputGroup>
            </ProjectField>

            <ProjectField
              id="program-department"
              label="Program / Department"
              error={validationErrors.programDepartment}
              touched={touched.programDepartment}
            >
              <InputGroup>
                <InputGroupInput
                  id="program-department"
                  value={draft.programDepartment}
                  onBlur={() => touchField("programDepartment")}
                  onChange={(event) =>
                    updateDraft("programDepartment", event.target.value)
                  }
                  placeholder="Parks and recreation"
                  aria-invalid={Boolean(
                    touched.programDepartment &&
                      validationErrors.programDepartment,
                  )}
                />
              </InputGroup>
            </ProjectField>

            <ProjectField
              id="project-location"
              label="Location"
              error={validationErrors.location}
              touched={touched.location}
            >
              <InputGroup>
                <InputGroupInput
                  id="project-location"
                  value={draft.location}
                  onBlur={() => touchField("location")}
                  onChange={(event) => updateDraft("location", event.target.value)}
                  placeholder="Portland, OR"
                  aria-invalid={Boolean(
                    touched.location && validationErrors.location,
                  )}
                />
              </InputGroup>
            </ProjectField>

            <ProjectField
              id="project-type"
              label="Project Type"
              error={validationErrors.projectType}
              touched={touched.projectType}
            >
              <SelectField
                id="project-type"
                value={draft.projectType}
                onChange={(value) => {
                  updateDraft("projectType", value);
                  touchField("projectType");
                }}
                options={projectTypeOptions}
                placeholder="Select type"
                invalid={Boolean(
                  touched.projectType && validationErrors.projectType,
                )}
              />
            </ProjectField>

            <Field>
              <FieldLabel htmlFor="project-template">Template (optional)</FieldLabel>
              <FieldContent>
                <SelectField
                  id="project-template"
                  value={draft.templateKey}
                  onChange={(value) => updateDraft("templateKey", value)}
                  options={projectTemplateOptions}
                  placeholder="Choose a template"
                />
              </FieldContent>
            </Field>

            <label className="flex items-start gap-3 rounded-lg border border-[color:var(--cpl-soft-border)] bg-muted/35 p-3 text-sm focus-within:ring-3 focus-within:ring-ring/50">
              <input
                type="checkbox"
                checked={draft.createAsDraft}
                onChange={(event) =>
                  updateDraft("createAsDraft", event.target.checked)
                }
                className="mt-0.5 size-4 rounded border-input accent-[color:var(--cpl-navy)]"
              />
              <span className="grid gap-1">
                <span className="font-medium text-[color:var(--cpl-navy)]">
                  Create as draft
                </span>
                <span className="text-muted-foreground">
                  Draft projects stay in setup until intake is ready.
                </span>
              </span>
            </label>
          </FieldGroup>

          {createError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {createError}
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createDisabled}>
              {isCreating ? <Spinner data-icon="inline-start" /> : null}
              {isCreating ? "Creating" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
