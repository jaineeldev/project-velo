# project-velo

A client workflow PWA for freelance developers and dev agencies.

> Velo is the working directory name — the product brand is TBD.

## What it does

Send a proposal. The client opens a shareable link (no login), reviews scope, milestones and pricing, and clicks approve. The moment they do, the platform spins up a project with milestones, generates a deposit invoice, and gives the client a live portal to track progress.

One product. One link. No copy-pasting between Notion, Google Docs and Xero.

## Core flow

```
[ Proposal builder ] → [ Shareable link ] → [ Client approves ]
                                                   │
                          ┌────────────────────────┼────────────────────────┐
                          ▼                        ▼                        ▼
                    [ Project ]              [ Milestones ]         [ Deposit invoice ]
                          │
                          ▼
                  [ Client portal ] ← progress, invoices, feedback
```

## Features

- **Proposal builder** — scope, milestones, pricing, GST, deposit %.
- **Public approval link** — no client login. Approve or request changes.
- **Auto project creation** — project + milestones + deposit invoice on approval.
- **Project tracker** — milestone status, manual time logging, per-milestone billing.
- **Invoicing** — auto-generated, GST support, mark as paid.
- **Client portal** — per-project share link, live progress, invoices, feedback channel.
- **Clients** — contact records with linked proposals, projects and invoices.
- **PWA** — installable, dark, developer-native UI.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Neon (Postgres) — `DATABASE_URL` (in-memory store fallback for dev)
- Clerk (auth) — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- Vercel (hosting)
- `next-pwa`-compatible service worker bundled in `public/sw.js`

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>. Seeded data includes:

- An approved proposal (`Acme Dashboard v2`) with a live project, milestones, time entries, and a paid deposit invoice.
- A sent proposal (`Lumen Marketing Site`) — visit it from the Proposals list and copy the share link to test the client approval flow.
- A draft proposal (`Ridgeline Booking Flow`).

## Project layout

```
src/
├── app/
│   ├── (app)/                   # Authenticated workspace
│   │   ├── dashboard/
│   │   ├── proposals/{,new,[id]}/
│   │   ├── projects/{,[id]}/
│   │   ├── invoices/{,[id]}/
│   │   ├── clients/{,[id]}/
│   │   └── settings/
│   ├── share/                   # Public, no-login routes
│   │   ├── proposal/[token]/    # Client approval flow
│   │   └── project/[token]/     # Client portal
│   ├── page.tsx                 # Landing
│   ├── layout.tsx
│   └── globals.css
├── components/{layout,ui}/
└── lib/
    ├── store.ts                 # In-memory data store + seed
    ├── types.ts                 # Domain types
    ├── totals.ts                # Tax + deposit math
    └── format.ts                # Currency / date helpers
```

## Replacing the in-memory store with Neon

`src/lib/store.ts` is a single module exposing all reads/writes. Each function (`createProposal`, `approveProposal`, `markInvoicePaid`, etc.) maps cleanly onto a SQL query or Drizzle/Prisma call. Drop in a real adapter behind the same module surface and the rest of the app is unchanged.

## Status

Phase 1 — Foundation. Working end-to-end with seeded data.

## Team

- [@lostastr0](https://github.com/lostastr0)
- [@JuiceM00n](https://github.com/JuiceM00n)
- [@Rockmancheese](https://github.com/Rockmancheese)

## License

Copyright (c) 2025. All rights reserved. Proprietary and confidential.
