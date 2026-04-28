# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Next.js 16 has breaking changes: APIs, conventions, and file structure may differ
from training data. Before any Next work, read the relevant guide in
`node_modules/next/dist/docs/` and follow deprecation notices.
<!-- END:nextjs-agent-rules -->

## Template Context
- Reusable B2B SaaS starter: Next 16, React 19, WorkOS AuthKit, Convex, Vercel,
  Tailwind v4, shadcn/ui.
- Keep template reusable. Do not hardcode project-specific org names, WorkOS IDs,
  API keys, Convex deployment names, or Vercel project names in tracked files.
- WorkOS owns identity, organizations, sessions, roles, permissions, and widgets.
- Convex stores app data only; mirror WorkOS org/user state as needed.
- Auth callback is `/auth/callback`; signed-in app lands at `/app`.
- Local secrets live in `.env.local`; placeholders live in `.env.example`.

## File Discipline
- Keep tracked source/docs files under ~500 LOC. Split or refactor before files
  become hard to review.
- Use existing patterns before adding abstractions.
- Keep docs and tests updated when behavior, routing, env vars, or APIs change.
- Public/shareable pages that expose rich metadata should use Schema.org JSON-LD.

## Agent Workflow
- Start with repo docs when they exist: `docs:list`, `bin/docs-list`, or nearby
  docs with clear `Read when` hints. Ignore missing doc helpers.
- Prefer end-to-end verification. If blocked, state the missing dependency,
  account access, secret, service, or fixture.
- Add regression tests for bugs when the behavior is testable in this repo.
- Check new dependencies for recent releases, maintenance activity, and adoption
  before adding them.
- Keep edits small and reviewable; avoid repo-wide search/replace scripts.
- Use background jobs for long non-interactive commands; use `tmux` only for
  persistent or interactive sessions.
- Never print secrets. If 1Password CLI is needed, run the full `op` command
  inside `tmux`; do not probe `op` in a normal shell.

## Next / React Rules
- Read local Next docs before touching routing, metadata, caching, middleware,
  server actions, request APIs, or build config.
- Prefer Server Components unless client state/effects/browser APIs are required.
- Use native metadata APIs where possible; use raw `<script type="application/ld+json">`
  for JSON-LD only where metadata APIs do not fit.
- Escape `<` in JSON-LD payloads with `JSON.stringify(data).replace(/</g, "\\u003c")`.
- Use Schema.org type and property names exactly as documented. Keep JSON-LD
  structure aligned with Schema.org examples and validate with Schema.org or
  Google Rich Results tools when added.

## Auth / Data Architecture
- Root provider layer owns `AuthKitProvider`; avoid nested AuthKit providers.
- Middleware/proxy should protect app routes and preserve intended return paths.
- `withAuth()`/session claims are the source for signed-in user, org, role, and
  permissions.
- App admin access is role-based (`owner` or `admin`) plus WorkOS widget
  permissions for widget token routes.
- Do not set `WORKOS_COOKIE_DOMAIN` for localhost unless the WorkOS docs require it
  for a non-localhost target.

## Commands
- Use the package manager declared in `package.json`; here that is `corepack pnpm`.
- Core gates: `corepack pnpm lint`, `corepack pnpm typecheck`,
  `corepack pnpm test:unit`, `corepack pnpm test:smoke`, `corepack pnpm test`.
- Build gate: `corepack pnpm build`.
- Dev: `corepack pnpm dev` for web + Convex, or `corepack pnpm dev:web` for web only.
- shadcn: `corepack pnpm dlx shadcn@latest <command>`.
- Playwright: `corepack pnpm exec playwright test` or targeted smoke specs.

## Installed CLIs
- Convex CLI: `convex`; verify with `convex --version`, inspect with `convex --help`.
- Vercel CLI: `vercel`; verify with `vercel --version`, auth with `vercel whoami`.
- WorkOS CLI: `workos`; verify with `workos --version`, auth with
  `workos auth status`, inspect envs with `workos env list`.
- Machine handoff details live at
  `/Users/marcusturner/Documents/Codex Projects/cli-agent-handoff.md`.
- Do not assume account access from binary presence; run harmless status commands first.

## Tool Usage
- WorkOS CLI: use for AuthKit, redirect/CORS/homepage config, auth status, env
  inspection, and dashboard-aligned diagnostics. Never print or commit secrets.
- Convex CLI: use for Convex schema/functions/deployment diagnostics and local
  app-data workflows. Do not store identity, org, role, or permission authority
  in Convex; mirror WorkOS state only when needed by app data.
- Vercel CLI: use for project/link/env/build/deploy/CI checks. Keep template
  files free of project-specific Vercel names and deployment IDs.
- Plugins/skills: use the mapped plugin before hand-rolling framework-specific
  fixes. Use Next/Vercel plugins for routing, middleware, env, deploy, and build
  behavior; use Convex/WorkOS/shadcn skills for data, auth, widgets, and UI.
- Browser verification: prefer repeatable Playwright checks first; use
  Browser/Computer Use for manual inspection, screenshots, or interactive flows.

## WorkOS Checks
- Use `workos doctor --skip-ai --json` for deterministic checks.
- Use `workos doctor` for extra analysis, but inspect output because AI analysis can
  misread template-specific structure.
- Configure local dashboard settings explicitly when needed:
  `workos config redirect add http://localhost:3000/auth/callback`,
  `workos config cors add http://localhost:3000`,
  `workos config homepage-url set http://localhost:3000`.
- Never print or commit WorkOS secrets.

## Agent Offload Map
- Next/Vercel: `vercel-plugin:nextjs`, `vercel-plugin:next-best-practices`,
  `vercel-plugin:routing-middleware`, `vercel-plugin:deployments-cicd`,
  `vercel-plugin:env-vars`, `vercel-plugin:verification`.
- Data/auth/UI: `convex`, `workos`, `workos-widgets`, `shadcn`,
  `vercel-plugin:shadcn`.
- Browser verification: Playwright first for repeatable tests; use Browser/Computer
  Use when manual browser interaction or visual inspection is needed.
- MCP options when available: Next DevTools MCP, Vercel MCP, Convex MCP,
  WorkOS docs MCP, shadcn MCP.

## Git / Safety
- Safe by default: `git status`, `git diff`, `git log`.
- Do not run destructive git/file operations unless explicitly requested.
- Do not create or switch branches, push, amend, or merge unless explicitly
  requested.
- Use Conventional Commits when committing:
  `feat|fix|refactor|build|ci|chore|docs|style|perf|test`.
- Preserve unrelated dirty changes; if they block the task, stop and ask.
- Before handoff, confirm `.env.local` is ignored and secrets are absent from tracked
  diffs.
