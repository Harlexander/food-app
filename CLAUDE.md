# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

Laravel 12 (PHP 8.2+) backend with React 19 + TypeScript frontend, connected via Inertia.js. Styling with Tailwind CSS v4 and shadcn/ui (Radix primitives). Zustand for client-side cart state. SQLite database by default. Vite 7 for bundling.

## Common Commands

```bash
# Development (starts PHP server, queue worker, log tail, and Vite concurrently)
composer run dev

# Development with SSR
composer run dev:ssr

# Build frontend for production
npm run build

# Run tests (Pest)
composer test

# PHP code formatting
./vendor/bin/pint

# Frontend linting & formatting
npm run lint          # ESLint fix
npm run format        # Prettier format
npm run types         # TypeScript type checking

# Database
php artisan migrate
php artisan db:seed   # Seeds 60+ food items via FoodSeeder
```

## Architecture

### Backend (Laravel)

- **Controllers**: `app/Http/Controllers/` — FoodController (menu CRUD), OrderController (order processing), DashboardController (analytics/stats), CustomerController
- **Models**: `app/Models/` — Key relationships: User→Orders, Order→OrderItems, Foods→FoodPortionSize. The `Foods` model (not `Food`) uses plural naming.
- **Routes**: `routes/web.php` — Public routes (menu at `/`, order submission) and authenticated admin routes under `/dashboard`
- **Mail**: OrderConfirmationAdmin and OrderConfirmationCustomer for order notifications

### Frontend (React + Inertia)

- **Pages**: `resources/js/pages/` — Inertia page components mapped to routes. Home page is `index.tsx`, admin pages under `dashboard/`
- **Components**: `resources/js/components/` — App-specific components (navbar, cart, food dialogs) plus `ui/` directory with 30+ shadcn/ui primitives
- **Cart**: `resources/js/lib/cart-store.ts` — Zustand store managing client-side cart (add/remove/update, duplicate merging)
- **Layouts**: `resources/js/layouts/` — Separate layout wrappers for app, auth, and settings sections
- **Path aliases**: `@/*` maps to `resources/js/*` (configured in tsconfig.json)
- **Wayfinder**: `resources/js/actions/` — Auto-generated type-safe route helpers from Laravel routes

### Key Business Logic

- Guest checkout creates a user automatically; orders support pickup, delivery, and reservation types
- Foods have multiple portion sizes with independent pricing via FoodPortionSize
- Food categories: Rice, Fufu, Soup, Meat, Sides
- Order statuses: pending → confirmed → preparing → ready → completed (or cancelled)
- Tax: 10% default; delivery fee: $5 for delivery orders
- Food images uploaded to `public/food/`

## Code Style

- **PHP**: Laravel Pint for formatting
- **TypeScript/React**: ESLint + Prettier (semicolons enabled, single quotes, 2-space indent, Tailwind class sorting)
- **CSS**: Tailwind utility classes; use `cn()` helper from `resources/js/lib/utils.ts` for conditional class merging
