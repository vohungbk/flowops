# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build — run this to catch all errors before shipping
npm run lint      # ESLint (Next.js core-web-vitals + TypeScript rules)
npx tsc --noEmit  # Type-check without emitting — use this to verify types
```

No test framework is configured yet.

## Architecture

**FlowOps** is a CRM & Business Management SaaS built on Next.js 16 App Router, Supabase (PostgreSQL + Auth + Realtime), TypeScript, Tailwind CSS, and shadcn/ui.

### Route groups

- `(auth)` — unauthenticated pages (`/login`, `/reset-password`). Minimal layout, no sidebar.
- `(dashboard)` — all protected pages. Layout in `src/app/(dashboard)/layout.tsx` fetches the user profile server-side and passes it to `<Header>`.
- `src/app/auth/callback/route.ts` — handles Magic Link redirects from Supabase.

All dashboard routes are protected by `src/proxy.ts` (Next.js 16 calls this file `proxy.ts`, not `middleware.ts` — the export must be named `proxy`, not `middleware`).

### Supabase client split

There are **three separate Supabase client files** — use the right one for each context:

| File | Use in |
|---|---|
| `src/lib/supabase/client.ts` | Client Components (`"use client"`) |
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| `src/lib/supabase/middleware.ts` | `src/proxy.ts` only |

Both `createClient()` functions are async on the server side (they `await cookies()`).

### Data flow pattern

Pages are Server Components that fetch data directly via `src/lib/queries/` (not yet built — create query files here). Mutations go through Server Actions in `src/lib/actions/` which call `revalidatePath` after writes. Client Components use `"use client"` only when needed for interactivity, forms, or realtime.

### Server Actions

All Server Actions follow the `useActionState`-compatible signature:
```ts
async function action(prevState: ActionResult, formData: FormData): Promise<ActionResult>
```

`ActionResult` is defined in `src/types/index.ts` — a discriminated union `{ success: true, data: T } | { success: false, error: string }`.

### UI component library

Components in `src/components/ui/` are shadcn/ui built on **`@base-ui/react`**, not Radix UI. Critical differences:

- `TooltipTrigger`, `DropdownMenuTrigger`, `DropdownMenuItem` — **do not accept `asChild`**. Use `onClick` with `useRouter().push()` for navigation inside menu items.
- `DropdownMenuItem` does not render as an anchor — handle navigation in `onClick`.

### TypeScript types

- `src/types/database.ts` — Supabase schema types (manually maintained; regenerate with `supabase gen types typescript --project-id <id>` after schema changes).
- `src/types/index.ts` — App-level types: `Profile`, `Customer`, `Lead`, `Deal`, extended join types, `ActionResult`, `PaginatedResult`.

### Zod v4

This project uses Zod v4. Use `error.issues[0].message`, **not** `error.errors[0].message` (`.errors` does not exist in v4's TypeScript types).

### Environment variables

Copy `.env.example` → `.env.local` and fill in values from Supabase Dashboard → Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (used for Magic Link redirect URL)

### Database schema

Migration file: `supabase/migrations/20260621000000_initial_schema.sql`

**To apply**: Go to Supabase Dashboard → SQL Editor → paste the file content → Run.

**Tables**: `profiles`, `tags`, `customers`, `customer_tags`, `leads`, `pipeline_stages`, `deals`, `activities`, `audit_logs`.

**Key design decisions**:
- `profiles` is 1:1 with `auth.users`, created automatically by the `trg_on_auth_user_created` trigger via `handle_new_user()`.
- `current_user_role()` is a `SECURITY DEFINER` helper function used by all RLS policies — it reads the role from `profiles` bypassing RLS, avoiding infinite recursion.
- `pipeline_stages.order_index` is intentionally **not UNIQUE** — allows atomic reordering of multiple stages in a single UPDATE batch.
- `audit_logs` has no UPDATE or DELETE policies — immutable by design.
- First user signed up gets `employee` role. Promote to admin via `supabase/promote_first_admin.sql`.

**Seed data included in migration**: 6 default pipeline stages (New → Qualified → Proposal → Negotiation → Closed Won → Closed Lost) + 6 default tags.

### Constants & validation

- `src/lib/constants.ts` — all status enums, source lists, route paths (`ROUTES`), `PAGINATION_PAGE_SIZE`.
- `src/lib/validations/` — Zod schemas per domain (currently `auth.ts`; add `customer.ts`, `lead.ts`, `deal.ts` as those features are built).

### Planned but not yet built

`src/lib/queries/`, `src/lib/actions/` (only `auth.ts` exists), `src/hooks/`, `src/components/dashboard/`, `src/components/customers/`, `src/components/pipeline/`, `src/components/analytics/`, `src/components/shared/`. The design spec lives at `/Users/er-mb-276/.claude/plans/t-i-mu-n-x-y-d-ng-serialized-eagle.md`.
