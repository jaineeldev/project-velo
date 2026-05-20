# velo

A client workflow platform for freelance developers and dev agencies. Replaces Notion + Google Docs + Xero with one platform.

> Private build — not open for external contributions.

## what it does

Velo handles the full client engagement lifecycle. An agency creates a proposal with line items, GST, and deposit percentage — sends it to the client via a branded email containing a cryptographic share token. The client approves (or requests changes) via a public link with no login required. On approval, a project, milestones, and deposit invoice are automatically created. The client tracks progress through a shareable portal. The agency logs time, marks milestones complete, and attaches deliverable links. A final invoice is generated and the project is marked delivered.

## status

Early beta. Core workflow is fully functional. Not yet publicly launched. Payments and multi-user workspaces are v2.

## stack

```
Next.js 14        TypeScript          Tailwind CSS
shadcn/ui         Framer Motion       Neon (PostgreSQL 17, Sydney)
Clerk             Resend              React-PDF
Vercel
```

## what's built

- auth (Clerk) with GitHub OAuth and webhook user sync
- onboarding flow — welcome and business profile steps
- clients — add, list, delete with active project guard
- proposal builder — line items, GST (10%), deposit %, real-time totals
- edit and delete proposals (draft and changes_requested only)
- send to client — branded Resend email with cryptographic share token
- client approval flow — public share page, approve or request changes
- change log — all events logged, visible to both sides
- auto project, milestone, and invoice creation on approval
- project tracker — milestone status, time logging, deliverable links
- change request management — clients submit, agency approves or rejects
- invoice management — deposit and final types, mark as paid, PDF export
- project status lifecycle — active → completed → delivered
- dashboard — real stats, recent activity feed, loading skeletons
- settings — appearance toggle, business profile, account deletion
- PDF export — proposals and invoices
- client portal — public shareable project progress page
- marketing homepage — hero, how it works, features, pricing, FAQ, CTA
- privacy policy (/privacy) — Australian Privacy Act compliant
- terms of service (/terms)
- security hardening — OWASP Top 10, rate limiting, HTTP headers, security logging

## what's coming

- Stripe payments (v2)
- multi-user workspaces (v2)
- PWA setup via next-pwa
- Upstash Redis for production-grade rate limiting
- Next.js 15 upgrade (5 current vulnerabilities documented)
- nonces for CSP (replacing unsafe-inline)

## team

- [@jaineeldev](https://github.com/jaineeldev) — lead
- [@JuiceM00n](https://github.com/JuiceM00n)
- [@Rockmancheese](https://github.com/Rockmancheese)

## licence

Copyright (c) 2026. All rights reserved.  
Proprietary and confidential. Unauthorised use or distribution is strictly prohibited.
