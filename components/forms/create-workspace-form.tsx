"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Building2Icon } from "lucide-react";
import { createWorkspaceAction, type CreateWorkspaceState } from "@/app/onboarding/workspace/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const initialState: CreateWorkspaceState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? "Provisioning workspace..." : "Create workspace"}
    </Button>
  );
}

export function CreateWorkspaceForm() {
  const [state, action] = useActionState(createWorkspaceAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(state.error)}>
          <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <Building2Icon />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="workspace-name"
                name="name"
                aria-invalid={Boolean(state.error)}
                placeholder="Acme HQ"
                required
                minLength={3}
              />
            </InputGroup>
            <FieldDescription>
              This creates the first WorkOS organization and mirrors it into Convex as your active workspace.
            </FieldDescription>
            <FieldError>{state.error}</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>
      <SubmitButton />
    </form>
  );
}
