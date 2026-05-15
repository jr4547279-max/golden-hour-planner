# Nexus — Golden Window Planner

Find the perfect time and place for your group. No polls. No chaos. Just the Golden Window.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/nexus run dev` — run the frontend (assigned PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Required Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-provisioned by Replit) |
| `SESSION_SECRET` or `JWT_SECRET` | Yes | Signs session JWTs — any strong random string |
| `VITE_GOOGLE_CLIENT_ID` | For calendar | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For calendar | Google OAuth client secret |
| `VITE_APP_URL` | Production | Canonical app URL used in OAuth redirect URIs |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui (dark theme)
- API: Express 5 + tRPC v11 + superjson
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT sessions via `jose` (email/password)
- Calendar: Google OAuth 2.0 + Calendar API

## Where things live

- `artifacts/nexus/src/` — React frontend (pages, components, hooks)
- `artifacts/nexus/src/pages/` — route-level page components
- `artifacts/nexus/src/lib/trpc.ts` — tRPC React client
- `artifacts/api-server/src/app.ts` — Express app wiring
- `artifacts/api-server/src/routers.ts` — all tRPC procedures (auth + calendar)
- `artifacts/api-server/src/oauth.ts` — Google Calendar OAuth callback route
- `artifacts/api-server/src/cookies.ts` — session cookie options (maxAge fix)
- `lib/db/src/schema/index.ts` — PostgreSQL table definitions (source of truth)

## Architecture decisions

- tRPC v11 (not REST) — type-safe end-to-end without codegen for the API layer
- Session cookies with `maxAge: ONE_YEAR_MS` — original bug was omitting maxAge, making cookies session-only
- `app.set('trust proxy', 1)` — required for `Secure` cookie flag behind Replit's reverse proxy
- CORS origin allowlist built at startup from `REPLIT_DEV_DOMAIN` env var — avoids broad suffix matching with `credentials: true`
- Vite dev proxy `/api → localhost:8080` — keeps tRPC URL relative (`/api/trpc`) so the same code works in dev and production

## Product

- **Auth**: email/password sign-up and login with persistent JWT session cookies
- **Calendar Sync**: connect Google Calendar via OAuth to share availability with a group
- **Circles**: groups of friends who want to find overlapping free time (UI scaffolded)
- **Golden Window**: find the time slot that works for everyone in a circle

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes in `lib/db/src/schema/index.ts`
- `SESSION_SECRET` is the fallback if `JWT_SECRET` is not set — both sign the same JWT
- Google Calendar OAuth redirect URI must exactly match `{origin}/api/oauth/calendar/callback` in the Google Cloud Console

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
