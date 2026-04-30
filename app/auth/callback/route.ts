import { handleAuth } from "@workos-inc/authkit-nextjs";
import { buildAppPath } from "@/lib/routes";

export const GET = handleAuth({
  returnPathname: buildAppPath(),
});
