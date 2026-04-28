# Next WorkOS Convex Starter

Enterprise SaaS starter built with Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Convex, WorkOS AuthKit, and WorkOS Widgets.

The starter is opinionated in a few ways:

- WorkOS is the source of truth for identity, organizations, and role claims.
- Convex stores only app-specific data: `profiles`, `workspaces`, and `projects`.
- The app is server-first. Client components are limited to auth bridging, widget surfaces, and realtime project interactions.
- Admin routes are protected both in navigation and on the server.

## Included

- Public marketing page at `/`
- Hosted WorkOS auth routes: `/sign-in`, `/sign-up`, `/auth/callback`
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
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
CONVEX_DEPLOY_KEY=
```

Notes:

- WorkOS values must come from your WorkOS environment. The CLI can confirm active environment metadata, but do not scrape or print secrets while setting up `.env.local`.
- `WORKOS_COOKIE_PASSWORD` should be a strong 32+ character secret.
- `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` are populated automatically after `convex dev` or `convex deploy`.
- `CONVEX_DEPLOY_KEY` is only needed for CI or production deploy automation.

## Local Development

Install dependencies with `corepack pnpm`:

```bash
corepack pnpm install
```

Start the web app and Convex together:

```bash
corepack pnpm dev
```

Or run them separately:

```bash
corepack pnpm dev:web
corepack pnpm dev:convex
```

Useful commands:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test:unit
corepack pnpm test:smoke
corepack pnpm test
corepack pnpm convex:codegen
corepack pnpm convex:deploy
```

The first time you run the smoke suite locally, install the Playwright browser:

```bash
corepack pnpm exec playwright install chromium
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
- `/auth/callback`

## Convex + WorkOS Configuration

`convex.json` is configured to use Convex-managed AuthKit defaults across environments:

- Local development uses `http://localhost:3000/auth/callback`
- Preview deployments use `https://${VERCEL_BRANCH_URL}/auth/callback`
- Production uses `https://${VERCEL_PROJECT_PRODUCTION_URL}/auth/callback`

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
3. Run `corepack pnpm convex:deploy` during deployment so the backend schema and functions are published alongside the Next.js app.

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

## Smoke Validation

These checks should pass after `.env.local` has real WorkOS values:

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- `corepack pnpm test:unit`
- `corepack pnpm test:smoke`

Expected signed-out behavior:

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
