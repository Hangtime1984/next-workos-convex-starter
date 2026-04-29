import {
  ArrowRightIcon,
  Building2Icon,
  DatabaseZapIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Hosted enterprise auth",
    description:
      "WorkOS AuthKit handles sign-in, sign-up, organization-aware sessions, and role claims without custom auth UI.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Realtime app data",
    description:
      "Convex powers typed queries, mutations, and instant project updates once the user is authenticated.",
    icon: DatabaseZapIcon,
  },
  {
    title: "Production UI primitives",
    description:
      "shadcn/ui and Tailwind v4 provide the sidebar, admin surfaces, form system, and widget shell foundation.",
    icon: SparklesIcon,
  },
];

export default function MarketingPage() {
  return (
    <main className="page-shell">
      <section className="hero-panel grid-noise px-6 py-8 md:px-10 md:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">CaptialProjectLaunchPad</Badge>
              <span className="text-sm text-muted-foreground">
                Next.js 16 + Convex + WorkOS + shadcn/ui
              </span>
            </div>

            <div className="flex max-w-3xl flex-col gap-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                Choose a delivery method and assemble the right procurement package faster.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                CaptialProjectLaunchPad helps construction owners evaluate capital project
                delivery options, manage org-scoped project work, and generate procurement-ready
                outputs in a secure workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Launch the workspace
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Explore the app shell
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="border-border/70 bg-background/80">
                  <CardHeader className="gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Icon />
                    </div>
                    <div className="space-y-1">
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-border/80 bg-card/95">
            <CardHeader className="gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Building2Icon />
                </div>
                Wired for admin onboarding, widget-backed profile management, and org-aware routing.
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Included out of the box</CardTitle>
                <CardDescription>
                  Public marketing shell, protected sidebar app shell, onboarding flow, `/app`,
                  `/w/[slug]`, `/settings/profile`, `/admin/users`, and `/admin/sso`.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="mb-2 font-medium text-foreground">Runtime stack</div>
                <div className="flex flex-wrap gap-2">
                  {["Next.js App Router", "React 19", "TypeScript", "Tailwind v4", "Convex", "WorkOS AuthKit", "WorkOS Widgets"].map((label) => (
                    <Badge key={label} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="mb-2 font-medium text-foreground">Product opinion</div>
                <p>
                  WorkOS owns identity and tenancy. Convex stores app-specific profile, workspace,
                  and project data. The UI only exposes admin routes when the current role and
                  permissions allow it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
