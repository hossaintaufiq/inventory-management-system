# Stockly — Frontend

> **A product by Softlligence Technologies**

The web app for Stockly, an inventory management SaaS. It's built with Next.js 16, React 19, TypeScript and Tailwind CSS v4, and every screen works on desktop, tablet and mobile in light and dark mode.

The app currently runs on an **in-memory mock backend** with realistic sample data (39 products, 3 warehouses, 10 suppliers, 15 customers, ~240 orders). Changes you make (new products, adjustments, orders) persist until the page reloads.

See the [root README](../README.md) for the product overview, modules, plans and roadmap.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000 (or the next free port)
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack, hot reload) |
| `npm run build` | Production build, including type checking |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without building |

Requirements: Node.js 20.9 or newer (developed on Node 24).

---

## Technology stack

| Concern | Package | Version | Notes |
|---|---|---|---|
| Framework | `next` | 16.4 | App Router, Turbopack. `cacheComponents` and `partialPrefetching` are enabled in `next.config.ts` |
| UI runtime | `react`, `react-dom` | 19.3 | |
| Language | `typescript` | 5 | `strict` mode, `@/*` → `src/*` path alias |
| Styling | `tailwindcss`, `@tailwindcss/turbopack` | 4.3 | CSS-first config in `src/app/globals.css` (no `tailwind.config`) |
| Animation | `tw-animate-css` | 1.4 | Enter/exit animations for dialogs and menus |
| Components | `shadcn` (CLI) | 4 | Style `base-nova`, base color neutral; config in `components.json` |
| Primitives | `@base-ui/react` | 1.9 | Accessible headless primitives under the shadcn components (**not Radix**) |
| Variants | `class-variance-authority` | 0.7 | Component variants (button, badge, …) |
| Class merging | `cn` | 0.5 | shadcn's compiled replacement for `clsx` + `tailwind-merge` |
| Icons | `lucide-react` | 1.x | |
| Server state | `@tanstack/react-query` | 5 | Caching, loading states, invalidation after mutations |
| Tables | `@tanstack/react-table` | 9 | Sorting, global search, pagination (**v9 API**, see below) |
| Forms | `react-hook-form` | 7 | |
| Validation | `zod` | 4 | Schemas shared between forms and (later) API payloads |
| Form ↔ Zod bridge | `@hookform/resolvers` | 7 | |
| Charts | `recharts` | 3 | Wrapped by `components/ui/chart.tsx` |
| Command palette | `cmdk` | 1 | Ctrl+K / ⌘K search |
| Toasts | `sonner` | 2 | |
| Theme | `next-themes` | 0.4 | Light / dark / system, class strategy |
| Dates | `date-fns` | 4 | |
| Client state | `zustand` | 5 | Installed, not used yet. For future UI-only state |
| Fonts | `next/font/google` | — | Geist Sans and Geist Mono |
| Linting | `eslint`, `eslint-config-next` | 9 / 16 | Includes React Compiler (`react-hooks`) rules |

---

## Project structure

```
frontend/
├── components.json            shadcn/ui configuration
├── next.config.ts             Next.js config (Cache Components, Turbopack CSS loader)
├── eslint.config.mjs
├── tsconfig.json
├── public/                    static assets
└── src/
    ├── app/                   ROUTES (App Router)
    │   ├── layout.tsx         root layout: fonts, metadata, <Providers>
    │   ├── globals.css        Tailwind v4 theme: colors, chart palette, status colors
    │   ├── page.tsx           marketing landing page  →  /
    │   ├── not-found.tsx      404 page
    │   │
    │   ├── (auth)/            sign-in screens, split-screen layout
    │   │   ├── layout.tsx
    │   │   ├── login/              /login
    │   │   ├── register/           /register
    │   │   ├── forgot-password/    /forgot-password
    │   │   └── onboarding/         /onboarding  (3-step setup wizard)
    │   │
    │   └── (app)/             signed-in app, sidebar + header layout
    │       ├── layout.tsx
    │       ├── dashboard/          /dashboard
    │       ├── reports/            /reports
    │       ├── products/           /products
    │       │   ├── new/            /products/new
    │       │   └── [id]/           /products/:id
    │       │       └── edit/       /products/:id/edit
    │       ├── categories/         /categories
    │       ├── inventory/          /inventory  (stock levels)
    │       │   ├── layout.tsx      section header + tabs
    │       │   ├── adjustments/    /inventory/adjustments
    │       │   ├── transfers/      /inventory/transfers
    │       │   └── movements/      /inventory/movements
    │       ├── warehouses/         /warehouses
    │       ├── purchase-orders/    /purchase-orders, /new, /:id
    │       ├── suppliers/          /suppliers
    │       ├── sales-orders/       /sales-orders, /new, /:id
    │       ├── customers/          /customers
    │       └── settings/           /settings  (general)
    │           ├── layout.tsx      section header + tabs
    │           ├── team/           /settings/team
    │           ├── billing/        /settings/billing
    │           └── integrations/   /settings/integrations
    │
    ├── components/
    │   ├── providers.tsx      ThemeProvider, QueryClientProvider, TooltipProvider, Toaster
    │   ├── ui/                shadcn/ui components (generated, editable)
    │   │                      alert, alert-dialog, avatar, badge, breadcrumb, button, card,
    │   │                      chart, checkbox, collapsible, command, dialog, dropdown-menu,
    │   │                      field, input, input-group, label, popover, progress,
    │   │                      radio-group, scroll-area, select, separator, sheet, sidebar,
    │   │                      skeleton, sonner, switch, table, tabs, textarea, tooltip
    │   ├── layout/
    │   │   ├── app-sidebar.tsx    collapsible sidebar: org switcher, nav, usage, user menu
    │   │   ├── site-header.tsx    breadcrumbs, Ctrl+K command menu, notifications, theme toggle
    │   │   ├── sub-nav.tsx        underlined section tabs (inventory, settings)
    │   │   └── logo.tsx
    │   └── shared/            app-specific building blocks
    │       ├── data-table.tsx     TanStack Table v9 table: search, sort, paginate, skeletons
    │       ├── page-header.tsx    title + description + actions
    │       ├── stat-card.tsx      KPI tile with % change
    │       ├── status-badge.tsx   one place mapping every status → label + color
    │       ├── simple-select.tsx  value/options wrapper around the Base UI select
    │       ├── empty-state.tsx
    │       └── detail-states.tsx  detail page skeleton + "not found" state
    │
    ├── features/              BUSINESS MODULES (UI + logic, one folder each)
    │   ├── auth/              auth-forms (login/register/forgot), onboarding-wizard
    │   ├── dashboard/         dashboard-view, charts (trend, value by category, stock health)
    │   ├── products/          product-list, product-form, product-detail, edit-product, category-list
    │   ├── inventory/         stock-levels, adjustment-list, adjust-stock-dialog,
    │   │                      transfer-list (+ transfer dialog), movement-list, movement-quantity
    │   ├── warehouses/        warehouse-list (+ add dialog)
    │   ├── orders/            config (statuses, actions, filters), order-list, order-form, order-detail
    │   │                      shared by purchase orders AND sales orders
    │   ├── contacts/          contact-list, shared by suppliers AND customers
    │   ├── reports/           reports-view
    │   └── settings/          general-, team-, billing-, integrations-settings
    │
    ├── lib/
    │   ├── api/
    │   │   ├── mock-db.ts     async API functions over in-memory data (swap for fetch later)
    │   │   └── queries.ts     TanStack Query hooks + query keys + mutations
    │   ├── mock/seed.ts       deterministic seed data (fixed random seed + fixed "today")
    │   ├── format.ts          currency, number, date, stock status helpers
    │   ├── nav.ts             sidebar groups, section tabs, breadcrumb labels
    │   ├── plans.ts           SaaS plan definitions (Free / Starter / Business / Enterprise)
    │   ├── csv.ts             client-side CSV export
    │   └── utils.ts           cn()
    │
    ├── hooks/
    │   └── use-mobile.ts      viewport breakpoint hook (useSyncExternalStore)
    │
    └── types/
        ├── index.ts           domain model: Product, Warehouse, StockMovement, orders, …
        └── tanstack-table.d.ts  column meta typing (className per column)
```

### How a page is put together

```
app/(app)/products/page.tsx        thin route file: metadata + one component
        │
        ▼
features/products/product-list.tsx client component: UI for the module
        │  uses
        ▼
lib/api/queries.ts                 useProducts(), useArchiveProduct(), …
        │  calls
        ▼
lib/api/mock-db.ts                 productsApi.list() → later: fetch("/api/products")
        │  reads/writes
        ▼
lib/mock/seed.ts                   in-memory data (removed once the backend exists)
```

Route files stay small. All behavior lives in `features/`, and all data access goes through `lib/api/`.

---

## Conventions

### Data and the backend contract

- `src/types/index.ts` is the **API contract**: the backend should return these shapes.
- `src/lib/api/mock-db.ts` is the **only file to replace** when the backend is ready. Each function (`productsApi.list`, `purchaseOrdersApi.setStatus`, …) maps 1:1 to a future REST endpoint.
- Stock is never edited directly. Every change goes through a movement (purchase, sale, adjustment, transfer in/out). Current quantities are derived from those movements, which gives a full audit trail.
- After a mutation, `queries.ts` invalidates every affected query. For example, receiving a purchase order refreshes products, stock, warehouses and analytics.

### Next.js 16 specifics

- **Cache Components is on.** Anything that reads runtime data must render inside `<Suspense>`. That includes `usePathname()`, route `params`, `crypto.randomUUID()` and `Date.now()`.
  - Sidebar, breadcrumbs and section tabs wrap `usePathname()` in `Suspense`, with a fallback that renders the same nav without an active item.
  - Dynamic pages (`[id]`) await `params` inside a `Suspense`-wrapped server component, then render a client component with the `id`.
  - Forms using `useFieldArray` start with empty arrays. Field-array row ids use `crypto.randomUUID()`, which must not run during prerender.
- `LayoutProps<"/route">` and `PageProps<"/route">` are global types generated by Next.js.
- Bundled Next.js docs are in `node_modules/next/dist/docs/` (see `AGENTS.md`).

### shadcn/ui on Base UI (not Radix)

- Use `render` instead of `asChild`:
  `<DropdownMenuTrigger render={<Button variant="ghost" />}>…</DropdownMenuTrigger>`
- For links styled as buttons, use `buttonVariants`:
  `<Link href="/x" className={buttonVariants()}>…</Link>`
- `DropdownMenuLabel` must sit inside a `DropdownMenuGroup`.
- Add components with `npx shadcn@latest add <name>`.

### TanStack Table v9

- One shared feature registry (`tableFeatureSet` in `data-table.tsx`) enables sorting, global filtering and pagination.
- Type columns with `Columns<Row>` and render them with `<DataTable columns={…} data={…} />`.
- Use `meta: { className: "hidden md:table-cell" }` to hide columns on small screens.
- Hidden columns, such as `sku` with `className: "hidden"`, still take part in search.

### Forms

- Each form has a Zod schema, `useForm({ resolver: zodResolver(schema) })`, and the `Field` / `FieldLabel` / `FieldError` components from `components/ui/field.tsx`.
- Use `useWatch` rather than `form.watch()`, which the React Compiler lint rule flags.
- Number inputs use `register(name, { valueAsNumber: true })`.

### Design system

- Theme tokens live in `src/app/globals.css` (oklch colors, `--radius`, sidebar tokens).
- **Chart palette:** `--chart-1…5` use a colorblind-validated categorical palette, with separate light and dark values. Charts with one series use `--chart-1`. Charts with two series use `--chart-1` and `--chart-2`. Every multi-series chart has a single shared y-axis and a legend.
- **Status colors** (`--success`, `--warning`, `--critical`) are reserved for state. They always appear with a label or icon, never color alone (see `status-badge.tsx`).
- Numbers in tables use the `tabular` class for aligned digits.
- Responsive approach: mobile first, with less important table columns hidden at small breakpoints and forms that stack into one column.

---

## Main screens

| Route | Screen |
|---|---|
| `/` | Landing page: hero, features, pricing, FAQ |
| `/login`, `/register`, `/forgot-password` | Authentication |
| `/onboarding` | Workspace setup wizard |
| `/dashboard` | Key figures, charts, reorder list, recent orders |
| `/products`, `/products/new`, `/products/:id`, `/products/:id/edit` | Catalog |
| `/categories` | Categories with product counts and stock value |
| `/inventory` (+ `/adjustments`, `/transfers`, `/movements`) | Stock levels and stock operations |
| `/warehouses` | Locations with capacity and value |
| `/purchase-orders` (+ `/new`, `/:id`) | Purchasing with receive workflow |
| `/sales-orders` (+ `/new`, `/:id`) | Sales with confirm → pack → ship → deliver |
| `/suppliers`, `/customers` | Contacts |
| `/reports` | Sales, products and inventory reports |
| `/settings` (+ `/team`, `/billing`, `/integrations`) | Organization settings |

Keyboard: **Ctrl/⌘ + K** opens search, **Ctrl/⌘ + B** toggles the sidebar.

---

## Not yet implemented

These parts of the UI work, but the action behind them waits for the backend:

- Real authentication (any password signs in; "Continue with Google" goes straight to the dashboard)
- Persistence (data resets on reload)
- Plan changes, payment methods and invoice downloads
- Integration connections and the API key
- Multiple organizations (the org switcher is visual only)

---

© 2026 Softlligence Technologies. All rights reserved.
