# CLAUDE.md

Working notes for this repo. Full detail lives in [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

## What it is

Epic Rides admin panel — React 18 + Vite 6 SPA, JSX (no TypeScript), Tailwind + Radix UI.
Frontend only; it consumes the Epic Rides admin REST API. No tests, no CI.

```bash
npm run dev      # http://localhost:3001
npm run build    # -> dist/
npm run lint     # currently FAILS: no ESLint config file exists in the repo
```

Review any screen without a backend or login:
`http://localhost:3001/preview.html?route=/dashboard` (dev-only, never built).

## Non-negotiable patterns

- **All backend calls live in `src/lib/services.js`.** Add a function wrapped in `apiHandler`,
  export it on the `api` object. No other file imports axios.
- **Pages never fetch directly.** Add a hook in `src/hooks/<domain>/`:
  `useGet*` returns `{ data, loading, totalPages, totalData, refresh }`;
  `use*Actions` returns `{ loading, ...mutationFns }`.
- **Toasts** go through `handleSuccess` / `handleError` in `src/utils/helpers.js`, never `toast` directly.
- **Forms** use `react-hook-form` + `zod` via `zodResolver`. See `src/pages/RideRates.jsx`.
- **Config** belongs in `src/config/constants.js`.

## Design system

`src/App.css` is the single source of colour. Two layers:

- **Scales** — `--brand-*` (green `#61CB08`), `--accent-*` (yellow `#EBC501`), `--neutral-0…950`.
  The neutral scale is **absolute** (0 lightest, 950 darkest) in *both* themes.
- **Semantic tokens** — `--canvas`, `--surface*`, `--line*`, `--ink*`, `--interactive*`,
  `--success/warning/danger/info*`, `--chart-1…3`. **Only these flip light↔dark.**

Rules:

- Use token utilities: `bg-surface`, `text-ink-muted`, `border-line`, `bg-interactive`,
  `text-danger`, `bg-chart-2`. **Never a raw hex**, and prefer tokens over `gray-*`.
- Do **not** invert the neutral scale in dark mode — ~40 pages rely on `bg-gray-50 dark:bg-gray-900`
  meaning what it says. Tailwind's `gray-*` is mapped onto the absolute neutral scale on purpose.
- Primary buttons are **dark ink on brand green** — white on that green fails AA.
- Brand green = primary actions, active nav, focus. Accent yellow = attention (pending, peak,
  rewards). Success is a cooler emerald so status never reads as brand.
- Type: Geist (UI, 13px base) + Geist Mono for data, self-hosted in `public/fonts/`.
  Any number a person scans or compares gets `.tnum`; table columns take `numeric: true`.
- Charts: `--chart-1/2/3` in fixed order, never cycled. Light and dark steps were validated
  separately for CVD separation — re-run the dataviz validator before changing them.
- Page shape: `<PageHeader>` → optional `<MetricStrip>` → `<Card>` panels.
  `DataTable` renders borderless; wrap it in `<Card padding="p-0">`.

Revamped so far: shell (Layout/Sidebar/Header), all shared primitives, and Dashboard, Users,
RiderDetail, DriverDetail. Other pages inherit tokens and primitives but keep old layout idioms.

## Theming

Three-way preference (system / light / dark) via `<ThemeToggle>` in the header, persisted in
`localStorage.theme`. `index.html` has an inline pre-paint script that mirrors `ThemeContext` —
**change both together**. `THEME_OPTIONS.forceTheme` (null) pins a single theme if ever needed.

## Adding a route

1. Register it in `src/App.jsx` inside the protected `<Layout>` block.
2. Wrap in `<ProtectedRoute requiredPermission="…">` or `requiredRole={…}` if gated.
3. Add a `MENU_ITEMS` entry in `constants.js` — `icon` must be a real `lucide-react` export, and
   `section` must match a `MENU_SECTIONS` id (the sidebar groups by it).
4. If gated, add the item `id` to the `switch` in `AppContext.getFilteredMenuItems()`,
   otherwise it shows for every role and then dead-ends on "Access Denied".

## Gotchas

- `apiHandler` returns the whole envelope: payload is `response.data`, paging is
  `response.pagination?.totalPages`. It throws when `success` is falsy.
- Blob endpoints (`exportUsers`, `exportRides`, `exportCarpoolRides`) bypass `apiHandler` and
  return the raw axios response.
- The API base URL is hardcoded in `services.js`; `VITE_BASE_URL` is not used.
  `VITE_GOOGLE_MAPS_API_KEY` is the only env var that matters at runtime.
- Session auto-logs-out after 5 minutes of inactivity (`SECURITY_CONFIG.sessionTimeout`).
- A large e-commerce module (Products / Categories / Orders / Transactions / ChatSupport /
  SendEmail / Analytics) is dead template leftovers — check before touching or reusing it.

See section 10 of PROJECT_DOCUMENTATION.md for the full known-issues list.
