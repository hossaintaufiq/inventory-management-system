# Stockly — Inventory Management SaaS

> **A product by Softlligence Technologies**
>
> "Stockly" is a working name and may change.

Stockly is a multi-tenant SaaS for vendors of every size, from a single storeroom to a network of warehouses. It tracks stock across locations, handles purchasing from suppliers and sales to customers, and shows what's selling, what's running low and how much money is tied up in inventory.

---

## Status

| Part | Status | Location |
|---|---|---|
| Frontend (web app) | ✅ Complete UI, running on built-in sample data | [`frontend/`](frontend/README.md) |
| Backend (REST API) | 🔜 Planned, next phase | `backend/` (not created yet) |

The frontend is fully navigable today. All data comes from an in-memory mock store ([`frontend/src/lib/api/mock-db.ts`](frontend/src/lib/api/mock-db.ts)) that resets on page reload. When the backend exists, only that file needs to change to call real endpoints.

---

## Modules

| # | Module | What it covers |
|---|---|---|
| 1 | **Auth & onboarding** | Sign in, sign up, password reset, 3-step workspace setup (business → first location → plan) |
| 2 | **Dashboard** | Key figures (inventory value, revenue, orders, items to reorder), sales vs purchases trend, stock health, value by category, reorder list, recent orders |
| 3 | **Products & categories** | Catalog with SKU, barcode, unit, cost and selling price, margin, reorder point, archive/restore, opening stock |
| 4 | **Stock** | Stock levels per warehouse, manual adjustments with reasons, transfers between warehouses, full movement history |
| 5 | **Warehouses** | Multiple locations with capacity, manager, SKU count and stock value |
| 6 | **Purchasing** | Suppliers → purchase order → receive (fully or partially) → stock increases |
| 7 | **Sales** | Customers → sales order → confirm → pack → ship (stock decreases) → deliver |
| 8 | **Reports** | Revenue and gross profit, orders per month, product performance, value by warehouse, slow-moving stock, CSV export |
| 9 | **Settings** | Organization profile, currency, time zone and tax, team members and roles, billing and plans, integrations, API key |

### SaaS plans

| Plan | Price | SKUs | Locations | Users |
|---|---|---|---|---|
| Free | $0 | 100 | 1 | 2 |
| Starter | $29/mo | 1,000 | 2 | 5 |
| Business | $99/mo | 2,500 | 10 | 25 |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited |

Plan definitions live in [`frontend/src/lib/plans.ts`](frontend/src/lib/plans.ts).

### Roles

| Role | Access |
|---|---|
| Owner | Everything, including billing and deleting the organization |
| Admin | Settings, team members and all inventory data |
| Manager | Create and approve orders, adjust stock, view reports |
| Staff | Receive and fulfil orders, record stock counts |

---

## Technology

### Frontend (built)

| Concern | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, Cache Components, Partial Prefetching) |
| UI runtime | **React 19** |
| Language | **TypeScript 5** (strict mode) |
| Styling | **Tailwind CSS v4**, `tw-animate-css` |
| Component system | **shadcn/ui** (`base-nova` style) built on **Base UI** (`@base-ui/react`) |
| Icons | **lucide-react** |
| Server state / data fetching | **TanStack Query v5** |
| Tables | **TanStack Table v9** |
| Forms & validation | **React Hook Form** + **Zod v4** (via `@hookform/resolvers`) |
| Charts | **Recharts v3** through the shadcn `chart` wrapper |
| Command palette | **cmdk** |
| Toasts | **sonner** |
| Theming | **next-themes** (light / dark / system) |
| Dates | **date-fns v4** |
| Class utilities | `cn` (shadcn's class merger), `class-variance-authority` |
| Client state | **Zustand** (installed, not used yet) |
| Fonts | Geist Sans and Geist Mono via `next/font` |
| Linting | ESLint 9 with `eslint-config-next` (incl. React Compiler rules) |

Full details: [frontend/README.md](frontend/README.md).

### Backend (planned)

| Concern | Proposed technology |
|---|---|
| API framework | NestJS (TypeScript) |
| Database | PostgreSQL |
| ORM / migrations | Prisma |
| Auth | JWT access + refresh tokens, Google OAuth, role-based access control |
| Billing | Stripe subscriptions |
| Multi-tenancy | Every row scoped to an `organizationId` |
| Stock model | Append-only stock movement ledger; on-hand levels derived from it |

The API contract the frontend expects is already defined by [`frontend/src/types/index.ts`](frontend/src/types/index.ts) and the functions in [`frontend/src/lib/api/mock-db.ts`](frontend/src/lib/api/mock-db.ts).

---

## Repository structure

```
inventory-mangement-system/
├── README.md              ← you are here
├── frontend/              ← Next.js web app (see frontend/README.md)
│   ├── src/
│   │   ├── app/           routes: landing, (auth), (app)
│   │   ├── components/    ui/ (shadcn), layout/, shared/
│   │   ├── features/      one folder per business module
│   │   ├── lib/           api/, mock/, formatting, nav, plans
│   │   ├── hooks/
│   │   └── types/         domain types (the API contract)
│   └── …config files
└── backend/               ← planned: NestJS + PostgreSQL + Prisma
```

---

## Getting started

Requirements: **Node.js 20.9+** (developed on Node 24) and npm.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. If that port is taken, Next.js picks the next free one and prints it.

- Landing page: `/`
- Sign in: `/login` (sample account pre-filled; any password works)
- App: `/dashboard`

---

## Roadmap

1. ✅ Frontend foundation: design system, layout, shared components
2. ✅ All module screens on mock data
3. 🔜 Backend: data model, auth, organizations and roles
4. 🔜 Connect frontend to the API (replace `mock-db.ts`)
5. 🔜 Billing (Stripe), email notifications, low-stock alerts
6. 🔜 Integrations (Shopify, WooCommerce, QuickBooks, Xero, Slack), public API
7. 🔜 Barcode scanning, CSV import, audit logs, SSO for Enterprise

---

© 2026 Softlligence Technologies. All rights reserved.
