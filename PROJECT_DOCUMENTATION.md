# Epic Rides Admin Panel - Comprehensive Project Documentation

## 1. Overview
The **Epic Rides Admin Panel** is a modern React single-page application (SPA) built with **Vite**, **React 18**, **Tailwind CSS**, and **Radix UI primitives**. It provides platform administrators with tools to manage ride hailing operations, riders, drivers, document verifications, vehicle categories, dynamic pricing (ride rates & peak windows), promotional codes, revenue streams, real-time vehicle locations (Bird's Eye View), customer support, and system notifications.

---

## 2. Technical Stack & Key Dependencies

- **Build Tool / Framework**: Vite 6.0 + React 18
- **Routing**: `react-router-dom` v6
- **Styling**: Tailwind CSS v3 + CSS Variables (Dynamic Theme System)
- **UI Components**: Radix UI Primitives (`@radix-ui/react-*`), Lucide Icons (`lucide-react`), React Icons (`react-icons`)
- **State Management & Contexts**: React Context API (`AuthContext`, `ThemeContext`, `AppContext`)
- **HTTP Client**: Axios (with custom request/response interceptors & centralized error handling)
- **Forms & Validation**: `react-hook-form` + `@hookform/resolvers` + `zod`
- **Charts & Maps**: Recharts, Chart.js (`react-chartjs-2`), Google Maps API (`@react-google-maps/api`)
- **Notifications**: `react-hot-toast`

---

## 3. Directory Structure

```
Epic-Rides-Admin-Panel/
├── public/                 # Static assets (logos, icons, images)
├── src/
│   ├── components/
│   │   ├── auth/          # ProtectedRoute wrapper
│   │   ├── common/        # Table, Pagination, Filters, StatCards, ConfirmModal
│   │   ├── global/        # Global notifications, quick search
│   │   ├── layout/        # Layout, Header, Sidebar
│   │   ├── loader/        # Loaders & spinners
│   │   └── ui/            # Reusable UI primitives (Button, Modal, Input, Badge, etc.)
│   ├── config/
│   │   └── constants.js   # APP_CONFIG, COLOR_CONFIG, API_CONFIG, MENU_ITEMS, SECURITY_CONFIG
│   ├── contexts/
│   │   ├── AppContext.jsx # Global app state (notifications, sidebar toggle)
│   │   ├── AuthContext.jsx# User authentication, auto-logout on inactivity, lockouts
│   │   └── ThemeContext.jsx# Light/Dark mode & dynamic primary/secondary color system
│   ├── hooks/             # Custom domain hooks (users, drivers, rides, revenue, etc.)
│   │   └── useApi.js      # Fetch wrapper utility
│   ├── lib/
│   │   └── services.js    # Centralized Axios API service methods
│   ├── pages/             # Route page views (Dashboard, Users, Rides, Rates, Revenue, etc.)
│   │   └── auth/          # Login, ForgotPassword, VerifyOTP, ResetPassword
│   ├── utils/
│   │   └── helpers.js     # Date/Currency/Phone formatters, CSV download, toast wrappers
│   ├── App.jsx            # Application root router & provider tree
│   ├── App.css            # Base styles & theme utility overrides
│   └── main.jsx           # Application entry point
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 4. Architecture & Core Concepts

### 4.1 Routing & Protection (`src/App.jsx` & `ProtectedRoute.jsx`)
- Public routes: `/auth/login`, `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password`, `/terms-conditions`, `/privacy-policy`.
- Protected routes wrapped with `<ProtectedRoute>` and `<Layout>`:
  - `/dashboard`: Analytics dashboard overview.
  - `/user-management`: Riders and drivers management.
  - `/user-management/rider/:id` & `/user-management/driver/:id`: Detailed profile views.
  - `/driver-requests` & `/driver/:id`: Driver registration verification and document inspection.
  - `/vehicle-category`: Vehicle category & type management.
  - `/ride-rates`: Distance/time-based pricing matrix per vehicle category.
  - `/peak-windows`: Dynamic multiplier pricing rules by schedule.
  - `/cancelled-rides` & `/completed-rides`: Historical ride tracking.
  - `/birds-eye-view`: Live interactive map showing active driver locations.
  - `/revenue`: Financial analytics (subscriptions & withdrawals).
  - `/promo-codes`: Marketing discount code management.
  - `/reports`: Incident and safety issue reports.
  - `/notifications`: Targeted push notification builder.

### 4.2 Authentication & Security (`AuthContext.jsx`)
- **Token Management**: `authToken` stored in `localStorage`. Automatically attached as `Authorization: Bearer <token>` header on API requests.
- **Session Timeout**: Listens to user interactions (`mousemove`, `mousedown`, `keypress`, `scroll`, `touchstart`). If inactive for 5 minutes (configurable via `SECURITY_CONFIG.sessionTimeout`), triggers auto-logout and displays the `SessionTimeoutModal`.
- **Lockout Mechanism**: Tracks failed login attempts in `localStorage`. Locks authentication after maximum login attempts (`SECURITY_CONFIG.maxLoginAttempts`) for a set lockout duration (`SECURITY_CONFIG.lockoutDuration`).
- **Device Headers**: Device headers (`deviceuniqueid`, `devicemodel`) generated and passed upon login.

### 4.3 API Service Layer (`src/lib/services.js`)
- Axios instance configured with base URL `https://api.epicridesapp.com/api/admin/` (or via `VITE_BASE_URL`).
- **Interceptors**:
  - Request interceptor attaches token from `localStorage`.
  - Response interceptor checks for HTTP status `401`, clears token, and redirects to `/auth/login`.
- **Response Handling (`handleApiResponse`)**: Unpacks JSON responses and verifies `responseData.success === true`. Throws errors formatted with `responseData.message`.
- Centralized `api` object exposing endpoints for Auth, Dashboard, Users, Drivers, Documents, Vehicle Types, Rides, Promo Codes, Rates, Peak Windows, Reports, Notifications, and Financials.

### 4.4 Theme & Color System (`ThemeContext.jsx` & `src/config/constants.js`)
- Supports **Light Mode** and **Dark Mode**, persisting preference in `localStorage`.
- Dynamic color themes via custom CSS variables (`--color-primary-rgb`, `--color-secondary-rgb`) driven by `COLOR_CONFIG` in `constants.js`.

---

## 5. Domain Modules & Features

| Module | Route / Page | Description |
| :--- | :--- | :--- |
| **Dashboard** | `/dashboard` | Key performance stats (total rides, revenue, active drivers, riders) and ride analytics charts. |
| **User Management** | `/user-management` | Paginated lists for Riders & Drivers. Allows searching, date filtering, CSV export, status updates (Active/Inactive), and account deletion. |
| **Driver Verification** | `/driver-requests`, `/driver/:id` | Review driver registration applications, inspect uploaded documents (License, Registration, Insurance), and approve/reject with feedback reasons (`updateDocs`). |
| **Vehicle Category** | `/vehicle-category` | Manage vehicle categories and capacity specs. |
| **Ride Rates** | `/ride-rates` | Configure base fare, rate per mile/km, rate per minute, and minimum fare across ride types. |
| **Peak Windows** | `/peak-windows` | Set surge pricing timeframes with dynamic fare multipliers. |
| **Rides Tracking** | `/completed-rides`, `/cancelled-rides` | View ride details, pickup/drop-off addresses, driver/rider info, trip duration, fares, and reasons for cancellation. Export ride data to CSV. |
| **Bird's Eye View** | `/birds-eye-view` | Interactive Google Map tracking driver positions in real-time. |
| **Revenue & Financials** | `/revenue` | Subscription revenue logs and driver withdrawal request processing. |
| **Promo Codes** | `/promo-codes` | Create and manage discount codes (fixed amount or percentage, usage limits, expiration dates). |
| **Reports & Safety** | `/reports`, `/reports-detail/:id` | Review flagged safety reports, rider/driver complaints, and resolve incidents with admin notes. |
| **Notifications** | `/notifications` | Broadcast or targeted push notifications to riders or drivers. |

---

## 6. How to Run & Build

### Development Mode
```bash
npm run dev
# or
pnpm dev
```
Starts Vite dev server on `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Generates production build in `dist/`.

### Linting
```bash
npm run lint
```
Runs ESLint check.

---

## 7. Useful Guidelines for Developers
1. **Adding New API Services**: Add the endpoint function in `src/lib/services.js` using `apiHandler` wrapper and expose it in the exported `api` object.
2. **Creating Custom Hooks**: Place domain-specific data-fetching hooks under `src/hooks/<domain>/` following existing patterns (using `useState`, `useEffect`, `useCallback`, and importing `api` from `src/lib/services.js`).
3. **UI Components**: Use Radix UI primitives with Tailwind styles in `src/components/ui/`.
4. **Toast Feedback**: Always use `handleSuccess()` or `handleError()` from `src/utils/helpers.js` for consistent notification messages.
