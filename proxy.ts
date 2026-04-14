import { authkitProxy } from "@workos-inc/authkit-nextjs";

export default authkitProxy({
  signUpPaths: ["/sign-up"],
});

export const config = {
  matcher: [
    "/app/:path*",
    "/w/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/onboarding/:path*",
    "/api/workos/widget-token/:path*",
  ],
};
