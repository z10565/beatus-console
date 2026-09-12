# BeATUS Console

Internal CRM & operations app for SIA BeATUS ("Laimes Bļoda"). Replaces the
patchwork of a partial CRM, Google Drive spreadsheets, the website's own
database, WhatsApp, and Gmail with one place to look up clients, book
sessions, invoice, track specialist/vendor contracts, and manage the
warm-grain equipment register.

## Tech stack

- **Next.js 15 (App Router) + TypeScript** — frontend and backend in one app.
- **PostgreSQL + Prisma** — relational data fits this domain (clients,
  specialists, sessions, invoices, contracts, and equipment all reference
  each other).
- **Auth.js (NextAuth v5) with email/password credentials** — two roles,
  `owner` and `staff`. JWT sessions, no external identity provider needed.
- **Tailwind CSS + shadcn/ui (Radix primitives)** for the interface.
- **Zod** for input validation on every mutating API route.

This is intentionally boring, cheap-to-run technology: everything here runs
on Vercel's and Neon's/Supabase's free or hobby tiers at this scale, with no
recurring database license.

## Local setup

Prerequisites: Node.js 20+, a local PostgreSQL server (or a free Neon/Supabase
database — anything reachable via a `DATABASE_URL`).

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and AUTH_SECRET
npx prisma migrate dev
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with one of the
seeded accounts (see below).

Generate a real `AUTH_SECRET` for anything beyond local development with:

```bash
openssl rand -base64 32
```

### Seeded accounts

| Role  | Email                        | Password      |
| ----- | ---------------------------- | ------------- |
| Owner | ilze@demo.beatus.local       | password123   |
| Staff | marta@demo.beatus.local      | password123   |
| Staff | oksana@demo.beatus.local     | password123   |

The seed script (`prisma/seed.ts`) also creates specialists across Latvia and
Ukraine, clients with session histories, a mix of paid/sent/overdue invoices,
contracts at various stages of expiry, and equipment with a spread of
grain-change due dates — all under the `@demo.beatus.local` domain so it's
obviously sample data.

`npm run seed` clears and re-seeds the four tables it manages, so it's safe
to re-run on a dev database whenever you want a clean demo state.

## Environment variables

See `.env.example`. In short:

- `DATABASE_URL` — PostgreSQL connection string.
- `AUTH_SECRET` — random secret used to sign session tokens.
- `NEXTAUTH_URL` — the app's own URL (`http://localhost:3000` locally).

## Deploying to Vercel + Neon (or Supabase)

1. **Database**: create a free Postgres database on
   [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy its
   connection string.
2. **Push to GitHub** and import the repo into
   [Vercel](https://vercel.com/new).
3. In the Vercel project's **Environment Variables**, set:
   - `DATABASE_URL` — the connection string from step 1.
   - `AUTH_SECRET` — output of `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — your production URL (e.g. `https://console.beatus.lv`).
4. Set the **Build Command** to `npx prisma migrate deploy && next build` (or
   add it as a `postinstall`/build step) so migrations apply automatically on
   each deploy.
5. After the first deploy, run the seed script once against the production
   database if you want starter data — otherwise start from an empty
   database and create real records through the app.
6. Deploy. Vercel's hobby tier and Neon's/Supabase's free tier comfortably
   cover a ~200-specialist operation like this one.

## What this app does

- **Client lookup** — live name search, full session history, equipment
  purchased, last specialist seen, and outstanding invoices on one page.
- **Booking** — pick a client and specialist (filterable by region,
  specialty, location), see the specialist's upcoming schedule to avoid
  double-booking, and optionally generate a draft invoice immediately.
- **Invoicing** — manual or session-based invoices, status filtering
  (draft/sent/paid/overdue), with overdue invoices auto-derived from the due
  date rather than requiring anyone to flag them.
- **Contracts** — specialist/vendor/partner agreements with a derived status
  (active / expiring soon within 60 days / expired), expiring ones surfaced
  first, and a renew action that extends the expiry date and logs the old one
  to history.
- **Equipment register** — location, type, and grain-change schedule, with
  units due in the next 14 days flagged.
- **Owner dashboard** — sessions and revenue this month (by service line),
  outstanding payments, active specialist count by region, specialist
  workload ranking, and the same overdue/due-soon lists surfaced elsewhere in
  the app. Blocked for `staff` accounts both in navigation and server-side.
- **Global search** — header search across clients and specialists by name.

## What's next (deliberately out of scope for v1)

- **Real email delivery.** "Mark as sent" only updates the invoice's status
  and timestamp — it doesn't send anything. The invoice-sending code path
  (`PATCH /api/invoices/[id]`) is isolated specifically so wiring in a
  provider like [Resend](https://resend.com) later is a small, contained
  change: build the email template, call the provider inside that same
  handler, and log the send.
- **Calendar sync.** Sessions are tracked as fields in this app only; there's
  no two-way sync with Google Calendar or similar.
- **True booking-conflict prevention.** The booking flow shows a specialist's
  existing upcoming sessions so a scheduler can eyeball overlaps, but it does
  not block a double-booking outright — there's no time-slot/availability
  engine.
- **File uploads for contracts.** `Contract.fileUrl` exists in the schema for
  linking a PDF, but there's no upload UI yet — paste a link (e.g. to a
  Drive file) if needed today.
- **Multi-currency.** All amounts are treated as EUR.

## Project structure notes

- `src/app/(app)/` — the authenticated app shell (sidebar, header, global
  search) and all feature pages. Pages read data directly from Prisma as
  React Server Components; mutations go through `src/app/api/*` Route
  Handlers called from Client Components.
- `src/lib/derived.ts` — the single source of truth for status logic that
  must never be manually set: invoice overdue status, contract
  active/expiring/expired status, and equipment grain-change-due flags.
- `src/lib/auth.ts` / `src/middleware.ts` — authentication. Role checks for
  owner-only pages happen again inside the page itself
  (`src/app/(app)/dashboard/page.tsx`), not just in navigation, so hitting
  the URL directly as `staff` also redirects away.
- `prisma/schema.prisma` — the data model; `prisma/seed.ts` — sample data.
