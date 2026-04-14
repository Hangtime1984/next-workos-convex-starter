# Next WorkOS Convex Starter

Enterprise SaaS starter built with Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Convex, WorkOS AuthKit, and WorkOS Widgets.

The starter is opinionated in a few ways:

- WorkOS is the source of truth for identity, organizations, and role claims.
- Convex stores only app-specific data: `profiles`, `workspaces`, and `projects`.
- The app is server-first. Client components are limited to auth bridging, widget surfaces, and realtime project interactions.
- Admin routes are protected both in navigation and on the server.

## Included

- Public marketing page at `/`
- Hosted WorkOS auth routes: `/sign-in`, `/sign-up`, `/callback`
- Protected application shell at `/app`
- Org-scoped workspace route at `/w/[slug]`
- First-login workspace onboarding at `/onboarding/workspace`
- WorkOS User Profile widget at `/settings/profile`
- WorkOS User Management widget at `/admin/users`
- WorkOS Admin Portal SSO Connection widget at `/admin/sso`
- Server-issued widget tokens at `/api/workos/widget-token/[widget]`

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Convex
- WorkOS AuthKit for session handling
- WorkOS Widgets for profile, user admin, and SSO setup

## AI Agent Build Guide

These helper names come from one Codex environment, but the workflow is intentionally portable. If you are using Claude Code, Cursor, Windsurf, Continue, Cline, or another coding agent, use the equivalent framework expert, docs integration, deployment workflow, or browser verification tool for the same domain. Where there is a public upstream repository, the official GitHub source is linked inline.

| Domain | Recommended helper | Source | Why it applies here | Equivalent in other agents |
| --- | --- | --- | --- | --- |
| Next.js / App Router | `vercel-plugin:nextjs` | Plugin skill from `Vercel-plugin`; public upstreams: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin) and [`vercel-labs/next-skills`](https://github.com/vercel-labs/next-skills) | The app uses Next.js 16 App Router, server-first routes, route handlers, layouts, and protected app shells. | A Next.js or App Router specialist with current framework docs and repo rules |
| Convex backend / data | `convex` | Standalone skill; official GitHub: [`get-convex/convex-backend`](https://github.com/get-convex/convex-backend) | The backend lives in `convex/` and handles schema, queries, mutations, auth validation, codegen, and deploy flows. | A Convex-aware backend/data helper or agent connected to Convex docs |
| WorkOS auth | `workos` | Standalone skill; official GitHub: [`workos/authkit-nextjs`](https://github.com/workos/authkit-nextjs) and [`workos/workos-node`](https://github.com/workos/workos-node) | Hosted AuthKit routes, callback handling, org-aware sessions, and role checks are central to the template. | An auth/identity integration specialist for hosted auth, orgs, RBAC, and session flows |
| WorkOS widgets | `workos-widgets` | Standalone skill; official GitHub examples: [`workos/widgets-examples`](https://github.com/workos/widgets-examples) | The app embeds profile, user management, and SSO widgets with server-issued widget tokens. | A widget/embed integration helper for admin surfaces and token-backed UI widgets |
| shadcn/ui | `shadcn` | Standalone skill; official GitHub: [`shadcn-ui/ui`](https://github.com/shadcn-ui/ui) | The UI layer uses a configured shadcn registry and component conventions in `components/ui`. | A component-library or design-system helper that understands local UI primitives |
| Deployment | `vercel-plugin:deployments-cicd` | Plugin skill from `Vercel-plugin`; public upstream: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin) | Preview and production deployment behavior matters because WorkOS callback URLs and `pnpm convex:deploy` need to stay aligned. | A deployment expert for your platform with preview/prod environment awareness |
| Environment / config | `vercel-plugin:env-vars` | Plugin skill from `Vercel-plugin`; public upstreams: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin) and [`vercel/vercel`](https://github.com/vercel/vercel) | The starter depends on coordinated local and hosted env vars across WorkOS, Convex, and Vercel. | A secrets and environment configuration helper for local, preview, and production setups |
| Verification | `vercel-plugin:verification` | Plugin skill from `Vercel-plugin`; public upstream: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin) | The template needs end-to-end checks for auth, onboarding, role-gated admin routes, and widget rendering. | A QA or browser automation workflow that can verify real user flows end to end |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required values:

```env
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_COOKIE_PASSWORD=
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
CONVEX_DEPLOY_KEY=
```

Notes:

- Placeholder WorkOS values are valid for smoke testing the template itself. They are expected to fail at the hosted WorkOS screen until real credentials are configured.
- `WORKOS_COOKIE_PASSWORD` should be a strong 32+ character secret.
- `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` are populated automatically after `convex dev` or `convex deploy`.
- `CONVEX_DEPLOY_KEY` is only needed for CI or production deploy automation.

## Local Development

Install dependencies with `pnpm`:

```bash
pnpm install
```

Start the web app and Convex together:

```bash
pnpm dev
```

Or run them separately:

```bash
pnpm dev:web
pnpm dev:convex
```

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:unit
pnpm test:smoke
pnpm test
pnpm convex:codegen
pnpm convex:deploy
```

The first time you run the smoke suite locally, install the Playwright browser:

```bash
pnpm exec playwright install chromium
```

## Auth Setup

This starter uses hosted WorkOS AuthKit flows, not custom sign-in pages.

Protected routes are enforced in `proxy.ts` for:

- `/app`
- `/w`
- `/settings`
- `/admin`
- `/onboarding`
- `/api/workos/widget-token`

Public routes remain available for:

- `/`
- `/sign-in`
- `/sign-up`
- `/callback`

## Convex + WorkOS Configuration

`convex.json` is configured to use Convex-managed AuthKit defaults across environments:

- Local development uses `http://localhost:3000/callback`
- Preview deployments use `https://${VERCEL_BRANCH_URL}/callback`
- Production uses `https://${VERCEL_PROJECT_PRODUCTION_URL}/callback`

`convex/auth.config.ts` validates WorkOS-issued JWTs in Convex. That allows:

- authenticated Convex queries and mutations
- org-scoped realtime project data
- server-side profile syncing for the current viewer

If you prefer to manage WorkOS configuration manually, keep the same redirect URI pattern and ensure the WorkOS client matches the Convex JWT settings.

## Tenancy Model

WorkOS organizations are the tenancy authority. Convex mirrors each active organization into a `workspaces` record so the app can attach internal metadata and query by slug.

The data model is intentionally minimal:

- `profiles`: cached app profile for the signed-in user
- `workspaces`: mirrored organization metadata
- `projects`: example org-scoped business records

There is no membership table in Convex. Membership and role data stay in WorkOS.

## Roles And Widgets

The starter expects these WorkOS roles:

- `owner`
- `admin`
- `member`

Access rules:

- `owner`: full app access plus widget admin scopes
- `admin`: app admin access plus widget admin scopes
- `member`: standard app access only

Widget scopes used by the starter:

- User Profile: no extra scope
- User Management: `widgets:users-table:manage`
- SSO Connection: `widgets:sso:manage`

Make sure your WorkOS roles grant the matching permissions, or the admin pages and widget token endpoint will correctly reject access.

## Deployment

Deploy on Vercel with the same environment variables used locally.

At minimum:

1. Set the WorkOS and Convex environment variables in Vercel.
2. Keep the preview and production callback URLs aligned with `convex.json`.
3. Run `pnpm convex:deploy` during deployment so the backend schema and functions are published alongside the Next.js app.

## Project Structure

```text
app/
  (marketing)/           public marketing shell
  (app)/                 authenticated app shell
  onboarding/workspace/  first-org provisioning flow
  api/workos/            server-issued widget tokens
components/
  app/                   sidebar shell and workspace UI
  forms/                 onboarding forms
  widgets/               WorkOS widget client islands
convex/
  schema.ts              profiles, workspaces, projects
  users.ts               viewer and profile sync
  workspaces.ts          workspace mirror queries/mutations
  projects.ts            sample realtime domain
lib/server/
  auth.ts                app context and route guards
  workos.ts              WorkOS client, role checks, widget token helpers
```

## Placeholder Smoke Validation

These checks should pass with placeholder WorkOS credentials:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:unit`
- `pnpm test:smoke`

Expected placeholder behavior:

- `/` renders the marketing shell without browser runtime errors.
- `/app` redirects to `/sign-in?returnTo=%2Fapp`.
- `/onboarding/workspace` redirects to `/sign-in?returnTo=%2Fonboarding%2Fworkspace`.
- `/api/workos/widget-token/user-profile` returns `401` JSON when signed out.
- `/sign-in` and `/sign-up` still hand off to WorkOS and may end on an invalid-client page until real credentials are configured.

## Live WorkOS Integration Validation

Once real WorkOS credentials are configured, manually verify:

- sign-up, sign-in, callback, and sign-out
- first-workspace creation
- active organization switching
- project create and rename flows
- member vs admin access to `/admin/users` and `/admin/sso`
- widget rendering with server-issued tokens

## Appendix: Codex Helper Inventory

This appendix lists the Codex-specific helpers that map well to this template. They are examples, not requirements.

### Core Build Helpers

- `convex` — Standalone skill for Convex schema design, queries, mutations, realtime patterns, codegen, and backend evolution in the `convex/` directory. Official GitHub: [`get-convex/convex-backend`](https://github.com/get-convex/convex-backend).
- `workos` — Standalone skill for WorkOS AuthKit, hosted auth flows, organization handling, roles, permissions, and backend SDK integration. Official GitHub references: [`workos/authkit-nextjs`](https://github.com/workos/authkit-nextjs) and [`workos/workos-node`](https://github.com/workos/workos-node).
- `workos-widgets` — Standalone skill for embedding and debugging WorkOS widgets such as User Profile, User Management, and Admin Portal SSO. Official GitHub examples: [`workos/widgets-examples`](https://github.com/workos/widgets-examples).
- `shadcn` — Standalone skill for working with the repo's `components.json` configuration, shadcn/ui primitives, and component composition patterns. Official GitHub: [`shadcn-ui/ui`](https://github.com/shadcn-ui/ui).
- `vercel-plugin:nextjs` — Plugin skill from `Vercel-plugin` for App Router architecture, route handlers, server/client boundaries, and runtime behavior. Public plugin repo: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin). Upstream skill repo: [`vercel-labs/next-skills`](https://github.com/vercel-labs/next-skills).
- `vercel-plugin:next-best-practices` — Plugin skill from `Vercel-plugin` for current Next.js implementation guidance and safer framework-specific patterns. Upstream skill repo: [`vercel-labs/next-skills`](https://github.com/vercel-labs/next-skills).
- `vercel-plugin:next-cache-components` — Plugin skill from `Vercel-plugin` for modern Next.js caching, partial prerendering, and cache migration guidance when the app grows. Public plugin repo: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin). Upstream skill repo: [`vercel-labs/next-skills`](https://github.com/vercel-labs/next-skills).

### Deployment And Platform Helpers

- `vercel-plugin:deployments-cicd` — Plugin skill from `Vercel-plugin` for preview deployments, production promotion, and CI/CD workflows around Vercel. Public plugin repo: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin).
- `vercel-plugin:vercel-cli` — Plugin skill from `Vercel-plugin` for linking projects, inspecting logs, pulling env vars, and handling common platform tasks from the CLI. Public plugin repo: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin). Upstream skill repo: [`vercel/vercel`](https://github.com/vercel/vercel).
- `vercel-plugin:env-vars` — Plugin skill from `Vercel-plugin` for keeping WorkOS, Convex, and Vercel environment variables aligned across environments. Public plugin repo: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin). Related CLI repo: [`vercel/vercel`](https://github.com/vercel/vercel).
- `vercel-plugin:vercel-functions` — Plugin skill from `Vercel-plugin` for route handlers, server-side execution behavior, streaming, and runtime configuration concerns. Public plugin repo: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin).

### Verification And QA Helpers

- `vercel-plugin:verification` — Plugin skill from `Vercel-plugin` for full-story verification across browser flows, API behavior, and data-backed responses. Public plugin repo: [`vercel/vercel-plugin`](https://github.com/vercel/vercel-plugin).
- `browse` — Standalone skill for fast browser testing, screenshots, responsive checks, and confirming route or widget behavior in a running app.
- `qa` — Standalone skill for structured QA passes that test the app, fix defects, and re-verify critical flows.
- `qa-only` — Standalone skill for report-only QA when you want a bug list and evidence without automatic fixes.
- `setup-browser-cookies` — Standalone skill for importing real browser cookies into a test session when auth-protected routes need realistic verification.

### Repo / Publishing Helpers

- `github:github` — Plugin skill from `GitHub` for repository triage, pull request context, and issue-oriented collaboration. Public GitHub agent integration repo: [`github/github-mcp-server`](https://github.com/github/github-mcp-server).
- `github:yeet` — Plugin skill from `GitHub` for intentional commit, push, and draft PR workflows when changes from the starter are ready to share. Public GitHub agent integration repo: [`github/github-mcp-server`](https://github.com/github/github-mcp-server).
- `github:gh-address-comments` — Plugin skill from `GitHub` for resolving review feedback on pull requests opened from this template. Public GitHub agent integration repo: [`github/github-mcp-server`](https://github.com/github/github-mcp-server).
- `review` — Standalone skill for a pre-landing review of diffs before merging or shipping changes built on top of the starter.
- `document-release` — Standalone skill for syncing docs such as the README after significant feature work or release prep.
