/**
 * Design preview harness — DEV ONLY.
 *
 * Serves the real app against fixture data so screens can be reviewed without
 * a live backend or a signed-in session. Reached at /preview.html; it is a
 * separate Vite entry, so none of this is part of the production bundle.
 */
import axios from "axios";
import ReactDOM from "react-dom/client";
import "../App.css";
import {
  adminUser,
  dashboardStats,
  driverDetail,
  driverTransactions,
  makeUsers,
  notifications,
  requestsCount,
  rideAnalytics,
  riderDetail,
} from "./fixtures";

// --- Pretend we're signed in -----------------------------------------------
localStorage.setItem("authToken", "preview-token");
localStorage.setItem("userData", JSON.stringify(adminUser));

// --- Put the router on a real route ----------------------------------------
// The app's Router has no route for /preview.html, so hand it the route named
// in ?route= (default /dashboard) before React mounts.
const requestedRoute =
  new URLSearchParams(window.location.search).get("route") || "/dashboard";
window.history.replaceState({}, "", requestedRoute);

// --- Route API calls to fixtures -------------------------------------------
const envelope = (data, pagination) => ({
  success: true,
  message: "ok",
  data,
  ...(pagination ? { pagination } : {}),
});

const paged = (items, page, limit, total) =>
  envelope(items, {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });

const routes = [
  [/dashboard-stats/, () => envelope(dashboardStats)],
  [/ride-analytics/, () => envelope(rideAnalytics)],
  [/requests-count/, () => envelope(requestsCount)],
  [/notifications\/mine/, () => paged(notifications, 1, 10, notifications.length)],
  [/\/drivers\/[^/]+\/transactions/, () => envelope(driverTransactions)],
  [
    /\/users\/[^/?]+\?type=/,
    (url) =>
      envelope(url.includes("type=driver") ? driverDetail : riderDetail),
  ],
  [
    /\/users\?/,
    (url) => {
      const params = new URLSearchParams(url.split("?")[1]);
      const type = params.get("type") || "rider";
      const page = Number(params.get("page") || 1);
      const limit = Number(params.get("limit") || 20);
      const search = (params.get("search") || "").toLowerCase();

      let rows = makeUsers(type, limit, page);
      if (search) {
        rows = rows.filter((r) =>
          `${r.name} ${r.email} ${r.phoneNumber}`.toLowerCase().includes(search)
        );
      }
      return paged(rows, page, limit, type === "driver" ? 1284 : 18432);
    },
  ],
];

const previewAdapter = (config) => {
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const match = routes.find(([pattern]) => pattern.test(url));
  const body = match ? match[1](url) : envelope([], { page: 1, limit: 20, total: 0, totalPages: 1 });

  // A touch of latency so loading and skeleton states are actually visible.
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          data: body,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          request: {},
        }),
      220
    )
  );
};

axios.defaults.adapter = previewAdapter;

// Import the app only after the adapter is installed, so the axios instance
// created inside services.js inherits it.
const { default: App } = await import("../App.jsx");

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
