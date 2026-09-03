# Epic Rides Admin Panel — Project Documentation

_Last verified against the codebase: 2026-09-03 (branch `feat/ui-revamp`)._

---

## 1. What this is

A React 18 + Vite single-page application: the internal admin console for the **Epic Rides**
ride-hailing platform. It is a pure frontend — there is no backend in this repo. Every screen
talks to the Epic Rides admin REST API.

Admins use it to manage riders and drivers, review driver document/vehicle submissions,
configure city-based fare pricing and peak-hour surge windows, track private and carpool rides,
watch live driver positions on a map, run promo campaigns, review safety reports, send push
notifications, and inspect subscription and withdrawal revenue.

---

## 2. Stack

| Concern | Choice |
| :--- | :--- |
| Build / dev server | Vite 6 (`vite.config.js`, dev port **3001**, `open: true`, sourcemaps on in build) |
| UI | React 18 (JSX, **no TypeScript** — `typescript` is a dev dep but only `useDebounce.tsx` is TS) |
| Routing | `react-router-dom` v6, all routes declared inline in `src/App.jsx` |
| Styling | Tailwind CSS 3 + CSS custom properties for brand colors |
| Component primitives | Radix UI (`@radix-ui/react-*`), icons from `lucide-react` and `react-icons` |
| HTTP | Axios, one shared instance in `src/lib/services.js` |
| Forms | `react-hook-form` + `zod` via `@hookform/resolvers` |
| Charts | Recharts + Chart.js (`react-chartjs-2`) |
| Maps | `@react-google-maps/api` (Bird's Eye View) |
| Toasts | `react-hot-toast` (`<Toaster position="bottom-right" />` mounted in `App.jsx`) |
| State | React Context only — **no Redux/Zustand/React Query** |
| Deploy | Vercel; `vercel.json` rewrites all paths to `/` for SPA routing |

There is **no test suite** and no test runner configured.

---

## 3. Commands

```bash
npm install
npm run dev       # Vite dev server on http://localhost:3001 (auto-opens browser)
npm run build     # production build -> dist/
npm run preview   # serve the built dist/
npm run lint      # BROKEN — see section 10
```

Design preview (no backend or login needed):

```
http://localhost:3001/preview.html?route=/dashboard
```

### Environment

Only one variable is actually consumed at runtime:

- `VITE_GOOGLE_MAPS_API_KEY` — required by `src/pages/BirdsEyeView.jsx`. Present in the local
  `.env`, which is gitignored and not tracked.

Two more are referenced in `src/config/constants.js` but are effectively inert:

- `VITE_BASE_URL` — read into `API_CONFIG.baseURL`, but `API_CONFIG.baseURL` is only used by the
  unused `src/hooks/useApi.js`. **The real API base URL is hardcoded** in `src/lib/services.js`.
- `VITE_STRIPE_PUBLIC_KEY` / `VITE_STRIPE_WEBHOOK_SECRET` — read into `API_CONFIG.stripe`, never used.

---

## 4. Directory map

```
public/fonts/               # self-hosted Geist + Geist Mono (variable woff2)
preview.html                # dev-only design preview entry (never built)

src/
├── App.jsx                 # provider tree + every route + SessionTimeoutModal
├── main.jsx                # ReactDOM root (StrictMode is commented out)
├── App.css                 # THE token layer: @font-face, light/dark tokens, base styles
├── preview/                # dev-only: fixture data + axios adapter for preview.html
├── config/constants.js     # THE config file: app/API/theme config, MENU_ITEMS,
│                           # USER_ROLES, PERMISSIONS, FLORIDA_CITIES, status enums,
│                           # SECURITY_CONFIG, plus leftover RIDERS/DRIVERS mock data
├── contexts/
│   ├── AuthContext.jsx     # user, login/logout, OTP + password flows, lockout,
│   │                       # inactivity auto-logout, hasPermission/hasRole
│   ├── AppContext.jsx      # sidebar state, permission-filtered menuItems, appConfigs
│   └── ThemeContext.jsx    # light/dark + hex -> CSS custom property palette generation
├── lib/services.js         # the ONLY module that talks to the backend
├── hooks/<domain>/         # one folder per domain; useGet* (queries) + use*Actions (mutations)
├── pages/                  # one file per route; auth pages under pages/auth/
├── components/
│   ├── auth/ProtectedRoute.jsx
│   ├── layout/             # Layout (sidebar + header + <main>), Header, Sidebar
│   ├── common/             # DataTable, PageHeader, MetricStrip, DetailList,
│   │                       # StatsCard, Calender, EditProfileModal
│   ├── global/             # ConfirmModal, Drawer, GlobalFilter
│   ├── ui/                 # Button, Card, Input, Select, Modal, Table, Badge,
│   │                       # Tabs, Avatar, Switch, ThemeToggle, MultiSelect,
│   │                       # TagInput, ImageUploader, chart wrappers…
│   └── loader/DashboardLoader.jsx
└── utils/helpers.js        # formatters, masking, storage wrapper, handleError/handleSuccess,
                            # downloadCSV, validators
```

---

## 5. Architecture

### 5.1 Provider tree

`ThemeProvider → AuthProvider → AppProvider → Router` (see `src/App.jsx`).
Order matters: `AppContext` calls `useAuth()` to filter the sidebar menu by role.

### 5.2 The two-layer data flow

Every network call goes through the same path — **do not deviate from it**:

1. **`src/lib/services.js`** — a single axios instance plus one exported `api` object.
   - Base URL is `https://api.epicridesapp.com/api/admin/`, hardcoded as `STAGING_BASE_URL`
     (the commented-out "production" line above it is the identical URL).
   - **Request interceptor** attaches `authorization: Bearer <localStorage.authToken>`.
   - **Response interceptor** catches HTTP 401 → clears `authToken` → hard-redirects to
     `/auth/login` (skipped if the current path already contains `/login`).
   - `apiHandler(fn)` wraps each call: it runs `handleApiResponse` (throws if
     `response.data.success` is falsy, otherwise returns the whole
     `{ success, message, data, pagination }` envelope) and funnels axios errors through
     `handleApiError`, which rethrows a plain `Error` carrying `response.data.message`.
   - **Exceptions to `apiHandler`:** the CSV/blob exports (`exportUsers`, `exportRides`,
     `exportCarpoolRides`) return the raw axios response because the body is a blob, not JSON.
   - `formatStartDateForApi` / `formatEndDateForApi` normalize a `YYYY-MM-DD` date into
     `…T00:00:00.000Z` / `…T23:59:59.999Z` before it reaches the query string.

2. **`src/hooks/<domain>/`** — thin custom hooks. Two shapes:
   - `useGet*` — fetches inside a `useCallback` + `useEffect`, returns
     `{ <data>, loading, totalPages, totalData, refresh }`.
   - `use*Actions` — imperative mutations, returns `{ loading, <actionFns> }`; each action
     toasts on success and calls `handleError` on failure, returning a boolean.

3. **`src/pages/`** — pages import hooks (and occasionally `api` directly, e.g. the export dialog
   in `Users.jsx`) and render. Pagination/search/filter state lives in page-local `useState`,
   often persisted via `usePersistentState` and debounced with `useDebounce`.

### 5.3 Auth & session

- Login posts `{ email, password }` to `login` with `deviceuniqueid` and `devicemodel` headers
  generated client-side from `Date.now()` + `navigator.userAgent`.
- On success, `authToken` and `userData` go into `localStorage`; `user` into context.
- **Inactivity logout:** listeners on `mousemove`, `mousedown`, `keypress`, `scroll`,
  `touchstart` reset a `SECURITY_CONFIG.sessionTimeout` (**5 minutes**) timer. On expiry the
  provider logs out and raises `showTimeoutModal`, rendered by `SessionTimeoutModal` in `App.jsx`.
- **Lockout:** `SECURITY_CONFIG.maxLoginAttempts` (5) failures → locked for
  `SECURITY_CONFIG.lockoutDuration` (2 minutes). Both `loginAttempts` and `lockedUntil` live in
  `localStorage`; a 1s interval ticks `remainingLockTime` down and clears the lock.
- **Logout is local only** — it clears storage; `api.logout()` exists in `services.js` but is
  never called.
- Password flows: `forgotPassword` → `verifyOTP` (stores the returned short-lived token) →
  `resetPassword`. Separately, `updatePassword` and `updatePasswordAuth` (the latter forces a
  re-login by clearing storage).

### 5.4 RBAC

Three roles in `USER_ROLES`: `super_admin`, `admin`, `general`. `PERMISSIONS` maps each role to
boolean flags (`financials`, `promos`, `sendNotifications`, `birdsEye`, `vehicleCategory`,
`viewDriverRequests`, `downloadExcel`, `seeSensitiveData`, `manageUsers`, …).

Enforcement happens in three places:

| Layer | Mechanism |
| :--- | :--- |
| Route | `<ProtectedRoute requiredPermission="…">` / `requiredRole={USER_ROLES.SUPER_ADMIN}` renders an "Access Denied" panel instead of the page |
| Navigation | `AppContext.getFilteredMenuItems()` filters `MENU_ITEMS` by the same flags |
| Inline UI | Pages call `hasPermission(...)` / `hasRole(...)` from `useAuth()` to hide controls (e.g. CSV export) |

Note this is **UI-level only**; the backend is the real authority.

### 5.5 Theme system

Three-state: **system / light / dark**, chosen from the `<ThemeToggle>` in the header.

- `ThemeContext` stores the *preference* (`"system" | "light" | "dark"`) in `localStorage` under
  `theme`, and separately tracks the *resolved* theme actually painted. While the preference is
  `"system"` it listens to `prefers-color-scheme` and follows the OS live.
- The resolved theme toggles a `dark` / `light` class on `<html>`.
- A small inline script in `index.html` resolves the theme **before first paint**, so the app
  never flashes the wrong one. It mirrors the context's logic — change both together.
- `THEME_OPTIONS.forceTheme` is `null`. Set it to `"light"` or `"dark"` to pin one theme and hide
  the toggle.

See §7 for the token layer the themes are built from.

---

## 6. Routes

Public (no auth): `/auth/login`, `/auth/forgot-password`, `/auth/verify-otp`,
`/auth/reset-password`, `/terms-conditions`, `/privacy-policy`, `/d/docs`.

Everything else is nested under a catch-all `/*` wrapped in `<ProtectedRoute>` + `<Layout>`.
`/` redirects to `/dashboard`.

| Route | Page | Gate |
| :--- | :--- | :--- |
| `/dashboard` | `Dashboard.jsx` | auth |
| `/user-management` | `Users.jsx` — riders & drivers, search, date filter, CSV export dialog | auth |
| `/user-management/rider/:id` | `RiderDetail.jsx` | auth |
| `/user-management/driver/:id` | `DriverDetail.jsx` | auth |
| `/driver-requests` | `DriverRequests.jsx` | `viewDriverRequests` |
| `/driver/:id` | `DriverDetails.jsx` — document & vehicle approve/reject | `viewDriverRequests` |
| `/suspended-drivers` | `SuspendedDrivers.jsx` | `viewDriverRequests` |
| `/rewarded-balance-history` | `RewardedBalanceHistory.jsx` | `viewDriverRequests` |
| `/admin-users` | `AdminUsers.jsx` — CRUD over admin accounts | role `super_admin` |
| `/change-password`, `/settings/change-password` | `ChangePassword.jsx` | role `super_admin` |
| `/vehicle-category` | `VehicleCategory.jsx` | `vehicleCategory` |
| `/ride-rates` | `RideRates.jsx` — global + per-city fare config | `financials` |
| `/peak-windows` | `PeakWindows.jsx` — surge multiplier windows | `financials` |
| `/revenue` | `Revenue.jsx` — subscriptions & withdrawals | `financials` |
| `/campaigns`, `/campaigns/:id` | `Campaigns.jsx`, `CampaignDetail.jsx` | `promos` |
| `/notifications` | `Notifications.jsx` | `sendNotifications` |
| `/private-rides` | `PrivateRides.jsx` | auth |
| `/carpool-rides`, `/carpool-rides/:id` | `CarpoolRides.jsx`, `CarpoolRideDetail.jsx` | auth |
| `/birds-eye-view` | `BirdsEyeView.jsx` — live driver map | auth |
| `/reports`, `/reports-detail/:id` | `Reports.jsx`, `ReportDetail.jsx` | auth |
| `/reports-management` | `SupportTickets.jsx` | auth (not in menu) |
| `/content-management` | `ContentManagement.jsx` | auth (not in menu) |
| `/orders` | `Orders.jsx` | auth (not in menu; see section 9) |
| `/history` | `Emergencie.jsx` | auth (not in menu) |
| `/user-detail/:id` | `UserDetailPage.jsx` | auth (not in menu) |
| `/settings`, `/settings/configs` | inline stub, `Configurations.jsx` | auth (not in menu) |
| `/docs`, `/d/docs` | `Documentation.jsx` | `/docs` auth, `/d/docs` public |

`MENU_ITEMS` in `constants.js` drives the sidebar. Several entries are commented out
(Content Management, Reports Management, History, Products, Orders, Settings).

---

## 7. Design system

The UI was rebuilt in 2026-09 to a precision-SaaS aesthetic: flat surfaces, hairline rules,
near-zero shadow, dense 13px type, and color used only where it carries meaning.

### 7.1 Tokens

**`src/App.css` is the single source of colour.** It defines two layers as CSS custom properties:

1. **Scales** — `--brand-*` (Epic Rides green, 500 = `#61CB08`), `--accent-*` (Epic Rides yellow,
   400 = `#EBC501`), and `--neutral-0…950`. The neutral scale is **absolute**: 0 is always the
   lightest and 950 the darkest, in *both* themes.
2. **Semantic tokens** — `--canvas`, `--surface{,-raised,-sunken,-hover,-active}`,
   `--line{,-strong,-subtle}`, `--ink{,-muted,-subtle,-faint,-inverted}`, `--interactive*`,
   the status sets (`--success*`, `--warning*`, `--danger*`, `--info*`) and `--chart-1…3`.
   **Only these flip between light and dark.**

That split is deliberate: Tailwind's `gray-*` is remapped onto the absolute neutral scale, so
pages still written as `bg-gray-50 dark:bg-gray-900` keep behaving exactly as authored. Inverting
the neutral scale in dark mode would silently break every one of them.

`tailwind.config.js` exposes the tokens as utilities — `bg-surface`, `text-ink-muted`,
`border-line`, `bg-interactive`, `text-danger`, `bg-chart-2`, and so on. `primary-*` and
`secondary-*` remain as aliases of `brand-*` / `accent-*` so older pages still compile.

**Never hardcode a hex in a component.** Change `App.css`.

### 7.2 Brand colour

Brand green is bright enough that white text on it fails WCAG AA, so primary buttons use
**dark ink on green** (`--interactive-ink`), which clears AA in both themes. Brand green is
reserved for primary actions, the active nav rail, focus rings and selection; the Epic Rides
yellow marks *attention* states (pending counts, peak windows, rewards).

Success is a deliberately cooler emerald, distinct from brand green, so an "Active" chip is never
confused with a button or the brand accent.

### 7.3 Typography

**Geist** (UI) and **Geist Mono** (data), self-hosted from `public/fonts/` as variable woff2 and
preloaded — no external font request. Base UI size is 13px.

Every number is data: amounts, counts, ids, phone numbers and timestamps carry the `.tnum` class
(Geist Mono + tabular figures) so columns align and digits don't jitter as values update. Mark a
table column `numeric: true` and `Table` applies right-alignment and tabular figures for you.

### 7.4 Charts

`--chart-1/2/3` is a fixed categorical order (blue → orange → fuchsia), **never cycled**. Light and
dark steps were chosen separately and validated, not flipped: adjacent-pair separation is
ΔE 24.4 (deuteranope) in light and ΔE 28.1 in dark. The hues deliberately avoid brand green,
success emerald, warning amber and danger red so a data series is never mistaken for a status.

Every series is directly labelled and has a table equivalent, so identity never depends on colour.

### 7.5 Components

Primitives live in `src/components/ui/`, page furniture in `src/components/common/`.

| Component | Notes |
| :--- | :--- |
| `Button` | `primary` (brand), `secondary`, `outline`, `ghost`, `subtle`, `danger`, `danger-ghost`, `success`, `warning`; sizes `xs`–`xl`; `icon`, `iconRight`, `loading`, `fullWidth`. Icon-only renders square. |
| `Card` | Flat surface + hairline border. `Card.Header/Title/Description/Content/Footer`. |
| `Input` / `TextArea` | Label, error, helper text, left/right icons, wired-up `aria-describedby`. |
| `Select` | Existing searchable/keyboard behaviour, restyled onto tokens. |
| `Badge` | Status vocabulary. Semantic variants carry a leading dot, so state never rests on colour alone. |
| `Table` | Sticky header, hairline rows, skeleton loading, empty state, `numeric` columns. |
| `Modal` | Portalled, focus-trapped, Escape to close, scroll-locked, optional `footer`. |
| `Tabs`, `Avatar`, `Switch`, `ThemeToggle` | Added in the revamp. |
| `DataTable` | Toolbar + `Table` + pagination. Renders **borderless** — callers wrap it in a `Card`. |
| `PageHeader` | Title + one line of live context + actions. |
| `MetricStrip` | Headline numbers in one hairline-divided strip. Stat tiles, not charts. |
| `DetailList` | Label/value pairs for a record. |

### 7.6 Revamp status

Fully reworked: the app shell (`Layout`, `Sidebar`, `Header`), every shared primitive above, and
the pages **Dashboard**, **Users**, **RiderDetail**, **DriverDetail**.

The remaining pages were not redesigned, but they inherit the new tokens, fonts and primitives, and
a codemod re-pointed 289 light-only gray text classes at theme-aware tokens across 35 files so they
are legible in dark mode. They still use the old layout idioms (`text-2xl font-bold` headings,
pastel status blocks) and are the natural next pass.

### 7.7 Design preview harness (dev only)

`preview.html` + `src/preview/` runs the real app against fixture data, so any screen can be
reviewed without a backend or a signed-in session:

```
http://localhost:3001/preview.html?route=/dashboard
```

It installs an axios adapter that answers from `src/preview/fixtures.js` before importing `App`,
and seeds a fake `authToken`/`userData`. Vite only builds `index.html`, so **none of it ships** —
confirm with `ls dist/*.html`.

---

## 8. API surface (`src/lib/services.js`)

All paths are relative to `https://api.epicridesapp.com/api/admin/`.

| Domain | Functions |
| :--- | :--- |
| Auth | `login`, `forgotPassword`, `verifyOTP`, `resetPassword`, `updatePassword`, `updatePasswordAuth`, `logout` |
| Dashboard | `getDashboardStats`, `getRideAnalytics` |
| App config | `getAppConfigs`, `updateAppConfigs` (`/global/config`) |
| Users | `getUsers(type, …)`, `getUserDetail`, `updateUser`, `updateUserStatus`, `deleteUser`, `exportUsers` (blob) |
| Drivers | `getDrivers`, `getRequestsCount`, `getDriverTransactions`, `getSuspendedDrivers`, `getDriverSuspensionDetails`, `suspendDriver`, `unsuspendDriver` |
| Documents | `getAllDocs`, `getDriverDocs`, `getDriverVehicles`, `updateDocs` (merges documents + vehicles into one `PUT /docs/respond`) |
| Vehicle types | `getAllVehicleTypes`, `createVehicleType`, `updateVehicleType`, `deleteVehicleType` |
| Admin users | `getAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser` |
| Rides | `getRides`, `exportRides` (blob), `getCarpoolRides`, `getCarpoolRideById`, `exportCarpoolRides` (blob) |
| Pricing | `getRideRates(cityName?)`, `updateRideRate`, `createCityRideRate`, `updateCityRideRate`, `deleteCityRideRate`, `getPeakWindows`, `createPeakWindow`, `updatePeakWindow`, `deletePeakWindow` |
| Campaigns | `getCampaigns`, `getCampaignById`, `createCampaign`, `updateCampaign`, `updateCampaignStatus`, `deleteCampaign`, `getCampaignStats`, `getCampaignRedemptions`, `getGeneratedCodes`, `getUserRedemptionHistory` |
| Revenue | `getSubscriptionRevenue`, `getWithdrawalRevenue` |
| Reports | `getReports`, `getReportById`, `resolveReport` |
| Notifications | `getNotifications`, `sendNotification`, `getAdminNotifications`, `getNotificationById`, `updateNotification`, `deleteNotification` |
| Map | `getBirdsEyeView` |
| Rewards | `getRewardedBalanceHistory` |
| Legacy / unused | product CRUD, category CRUD, `getOrders`, `getOrdersByContact`, `getOrderById`, `updateOrder` |

Pagination convention: paginated getters take
`(…filters, page = 1, limit = PAGINATION_CONFIG.defaultPageSize)` and the response carries
`pagination.totalPages` / `pagination.total`. Default page size is 20.

**City-based pricing** has its own detailed spec with request/response examples and the fare
formula: see [`city-based-pricing-api.md`](city-based-pricing-api.md).

---

## 9. Conventions to follow

1. **New endpoint** → add a function in `src/lib/services.js` wrapped in `apiHandler`, then add it
   to the exported `api` object. Nothing outside this file may import axios.
2. **New data need** → add a hook under `src/hooks/<domain>/`, matching the `useGet*` /
   `use*Actions` shape above. Do not fetch directly inside a page component.
3. **Feedback** → always `handleSuccess(message)` / `handleError(error)` from
   `src/utils/helpers.js` rather than calling `toast` directly, so messages stay uniform.
4. **New route** → register it in `App.jsx` inside the protected `<Layout>` block, wrap it in a
   nested `<ProtectedRoute>` if it needs a permission, and add a `MENU_ITEMS` entry in
   `constants.js` (the `icon` string must be a valid `lucide-react` export — `Sidebar.jsx`
   resolves it via `Icons[item.icon]`). If the entry is permission-gated, also add its `id` to
   the `switch` in `AppContext.getFilteredMenuItems()`.
5. **Forms** → `react-hook-form` + a `zod` schema through `zodResolver`. `RideRates.jsx` is the
   best reference for a complex form (field arrays, coercion, conditional validation).
6. **Tables** → reuse `components/common/DataTable.jsx` (toolbar, search, page-size select,
   ellipsis pagination) inside a `<Card padding="p-0">`, instead of hand-rolling a table. Mark
   numeric columns `numeric: true`.
7. **Colors** → semantic token utilities (`bg-surface`, `text-ink-muted`, `border-line`,
   `bg-interactive`, `text-danger`, `bg-chart-1`). Never a raw hex, and prefer tokens over
   `gray-*` in anything you touch. See §7.
8. **Page structure** → `<PageHeader>` for the title and actions, `<MetricStrip>` for headline
   numbers, `<Card>` for panels. Don't repeat the page title inside `DataTable`.
9. **Numbers** → any figure a person compares or scans gets `.tnum`.
10. **Config** → constants belong in `src/config/constants.js`, not inline in pages.

---

## 10. Known issues & tech debt

Roughly in priority order. These are **open**; items fixed during the UI revamp are listed in
§10.1 below.

1. **`npm run lint` is broken.** ESLint 8 expects a legacy `.eslintrc*` config but none exists
   anywhere in the repo, and because `dist/` isn't ignored ESLint starts resolving from
   `dist/assets`. Needs an `.eslintrc.cjs` (or a migration to flat `eslint.config.js`) plus an
   `.eslintignore` covering `dist`.
2. **`getOrders` will throw.** `src/lib/services.js:193` defaults `limit` to
   `API_CONFIG.pagination.defaultPageSize`, but `API_CONFIG` has no `pagination` key — a
   `TypeError` the moment `/orders` loads. Should be `PAGINATION_CONFIG.defaultPageSize`.
3. **`src/hooks/useApi.js` is dead and broken.** It is imported nowhere, and it destructures
   `addNotification` from `useApp()`, which `AppContext` no longer provides. Safe to delete.
4. **Login-attempt counter can produce `NaN`.** In `AuthContext.login`'s catch block,
   `localStorage.getItem("loginAttempts")` is `null` on a fresh browser, so `null + 1` yields
   `NaN`, which never satisfies `>= maxLoginAttempts` — the lockout silently never engages until
   that key has been written once. Default to `0` before incrementing.
5. **Base URL is hardcoded.** `STAGING_BASE_URL` in `services.js` ignores `VITE_BASE_URL`, and the
   "production" and "development" constants point at the same host. Switching environments
   requires a code edit.
6. **Mock data ships to production.** The `RIDERS` and `DRIVERS` fixtures (~400 lines) live at the
   bottom of `src/config/constants.js` and are bundled into every build.
7. **Dead e-commerce module.** `Products`, `Categories`, `Orders`, `Transactions`, `SendEmail`,
   `ChatSupport`, and `Analytics` pages, plus the product/category/order hooks and API functions,
   are leftovers from the admin-panel template this project started from. Most are imported in
   `App.jsx` (so they are bundled) but unrouted or unlinked.
8. **`React.StrictMode` is commented out** in `src/main.jsx`, so effect double-invocation bugs
   won't surface during development.
9. **No tests, no CI.** `.github/` contains only `copilot-instructions.md`.
10. **Console noise.** `services.js` logs on every request/response (`"API response run"`, error
    dumps) — noisy, and it leaks response shapes in production.
11. **Very large page components.** `DriverDetails.jsx` (1250 lines), `BirdsEyeView.jsx` (1193),
    and `RideRates.jsx` (1143) mix data fetching, schemas, modals, and presentation in one file.
12. **Package identity is still the template's** — `package.json` `name` is `admin-panel-template`.
13. **Typos baked into filenames** — `pages/Emergencie.jsx`, `pages/TermCondtion.jsx`,
    `components/common/Calender.jsx`.
14. **Four deliberate light-only text spots remain** (2 in `BirdsEyeView.jsx`, 1 each in
    `UserDetailPage.jsx` and `DriverDetails.jsx`) — dark text on fixed light chips such as the
    map overlay pills. Correct as-is; listed so a future audit doesn't "fix" them.
15. **Pages outside the revamp scope still use the old layout idioms** — see §7.6.

### 10.1 Fixed during the UI revamp

- `COLOR_CONFIG` no longer misdescribes the brand (it was named "Pink"/"Yellow" with `rgb` values
  that didn't match the hexes). It is now reference-only; the rendered palette lives in `App.css`.
- `AppContext.getFilteredMenuItems()` had no `case` for `campaigns`, `private-rides`,
  `carpool-rides`, `suspended-drivers` or `rewarded-balance-history`, so those links showed for
  every role and then hit "Access Denied". All gated items are now handled, and the stale
  `promo-codes` / `cancelled-rides` cases were retargeted.
- `THEME_OPTIONS.forceTheme` no longer pins the app to light; dark mode is live.
- The header imported `Moon`/`Sun`/`toggleTheme` but never rendered a control — there is now a
  real three-way `ThemeToggle`.

---

## 11. Related documents

- [`city-based-pricing-api.md`](city-based-pricing-api.md) — full API guide for city ride rates and
  peak windows: setup, endpoint summary, fare-calculation flow, the city fare formula, worked
  request/response examples, and validation rules.
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — condensed conventions for
  AI assistants (largely consistent with this document; its stated staging URL differs from what
  `services.js` actually uses).
