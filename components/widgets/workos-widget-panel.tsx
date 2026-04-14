"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { WorkOsWidgets } from "@workos-inc/widgets";
import type { WidgetKey } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const UserProfileWidget = dynamic(
  () => import("@workos-inc/widgets").then((module) => module.UserProfile),
  { ssr: false },
);

const UsersManagementWidget = dynamic(
  () => import("@workos-inc/widgets").then((module) => module.UsersManagement),
  { ssr: false },
);

const AdminPortalSsoConnectionWidget = dynamic(
  () =>
    import("@workos-inc/widgets").then(
      (module) => module.AdminPortalSsoConnection,
    ),
  { ssr: false },
);

function WidgetSurface({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="page-surface">
      <CardHeader className="gap-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function WorkosWidgetPanel({
  widget,
  title,
  description,
}: {
  widget: WidgetKey;
  title: string;
  description: string;
}) {
  const tokenQuery = useQuery({
    queryKey: ["workos-widget-token", widget],
    queryFn: async () => {
      const response = await fetch(`/api/workos/widget-token/${widget}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as
        | { authToken: string }
        | { error: string };

      if (!response.ok || !("authToken" in payload)) {
        throw new Error(
          "error" in payload ? payload.error : "Unable to load widget token.",
        );
      }

      return payload.authToken;
    },
    staleTime: 1000 * 60 * 30,
  });

  const Widget =
    widget === "user-profile"
      ? UserProfileWidget
      : widget === "users-management"
        ? UsersManagementWidget
        : AdminPortalSsoConnectionWidget;

  return (
    <WidgetSurface title={title} description={description}>
      {tokenQuery.isPending ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/70">
          <Spinner className="size-5" />
        </div>
      ) : tokenQuery.error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {tokenQuery.error.message}
        </div>
      ) : (
        <WorkOsWidgets
          theme={{
            accentColor: "teal",
            grayColor: "sand",
            radius: "large",
            fontFamily: "var(--font-sans)",
            appearance: "light",
          }}
        >
          <Widget authToken={tokenQuery.data} />
        </WorkOsWidgets>
      )}
    </WidgetSurface>
  );
}
