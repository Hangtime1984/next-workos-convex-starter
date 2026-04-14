import { refreshSession, withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import {
  buildSignInPath,
  normalizeReturnTo,
} from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));
  const auth = await withAuth();

  if (!auth.user) {
    redirect(buildSignInPath(returnTo));
  }

  if (!organizationId) {
    redirect(returnTo);
  }

  try {
    await refreshSession({
      organizationId,
      ensureSignedIn: true,
    });
  } catch {
    redirect(buildSignInPath(returnTo));
  }

  redirect(returnTo);
}
