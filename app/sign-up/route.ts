import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { normalizeReturnTo } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  redirect(await getSignUpUrl({ returnTo }));
}
