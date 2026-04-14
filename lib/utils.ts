import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function formatTimestamp(value: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(value);
}

export function normalizeReturnTo(
  value: string | null | undefined,
  fallback = "/app",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function buildSignInPath(returnTo = "/app") {
  const searchParams = new URLSearchParams({
    returnTo: normalizeReturnTo(returnTo),
  });

  return `/sign-in?${searchParams.toString()}`;
}

export function buildActivateOrganizationPath(input: {
  organizationId: string;
  returnTo: string;
}) {
  const searchParams = new URLSearchParams({
    organizationId: input.organizationId,
    returnTo: normalizeReturnTo(input.returnTo),
  });

  return `/auth/activate-organization?${searchParams.toString()}`;
}
