import { withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import { ensureWidgetAccess } from "@/lib/server/auth";
import { getWidgetAuthToken, normalizeRole } from "@/lib/server/workos";
import type { WidgetKey } from "@/lib/types";

const supportedWidgets = new Set<WidgetKey>([
  "user-profile",
  "users-management",
  "admin-portal-sso-connection",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ widget: string }> },
) {
  const { widget } = await params;

  if (!supportedWidgets.has(widget as WidgetKey)) {
    return NextResponse.json({ error: "Unsupported widget." }, { status: 404 });
  }

  const auth = await withAuth();

  if (!auth.user) {
    return NextResponse.json(
      { error: "You must be signed in to load this widget." },
      { status: 401 },
    );
  }

  if (!auth.organizationId) {
    return NextResponse.json(
      { error: "An active organization is required to render this widget." },
      { status: 400 },
    );
  }

  const role = normalizeRole(auth.role, auth.roles);

  if (
    !ensureWidgetAccess({
      role,
      permissions: auth.permissions ?? [],
      widget: widget as WidgetKey,
    })
  ) {
    return NextResponse.json(
      { error: "Your current role does not grant access to this widget." },
      { status: 403 },
    );
  }

  const authToken = await getWidgetAuthToken({
    widget: widget as WidgetKey,
    organizationId: auth.organizationId,
    userId: auth.user.id,
  });

  return NextResponse.json({ authToken });
}
