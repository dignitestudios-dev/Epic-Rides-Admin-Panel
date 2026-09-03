import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Flag, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import MetricStrip from "../components/common/MetricStrip";
import { api } from "../lib/services";

const nf = new Intl.NumberFormat("en-US");
const money = (value, decimals = 0) =>
  value == null
    ? "—"
    : `$${value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
const count = (value) => (value == null ? "—" : nf.format(value));
const pct = (value) => (value == null ? "—" : `${value.toFixed(1)}%`);

/* ── Needs-attention row ──────────────────────────────────────────────────
   Only rendered when there is something to act on. An empty queue shows a
   single quiet line instead of two zeroed-out cards demanding attention. */
const AttentionRow = ({ icon: Icon, tone, label, value, hint, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-center gap-3 w-full px-4 py-3 bg-surface border border-line rounded-lg text-left transition-colors hover:bg-surface-hover hover:border-line-strong"
  >
    <span
      className={`shrink-0 w-7 h-7 rounded flex items-center justify-center ${
        tone === "warning"
          ? "bg-warning-bg text-warning-fg"
          : "bg-danger-bg text-danger-fg"
      }`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
    </span>

    <span className="flex-1 min-w-0">
      <span className="block text-sm font-medium text-ink">{label}</span>
      <span className="block text-caption text-ink-subtle">{hint}</span>
    </span>

    <span className="tnum text-xl font-semibold text-ink">{count(value)}</span>
    <ArrowRight className="w-4 h-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
  </button>
);

/* ── Meter ────────────────────────────────────────────────────────────────
   A horizontal magnitude bar. Every value is directly labelled, so identity
   never rests on color alone. */
const Meter = ({ label, value, total, colorClass, sublabel }) => {
  const share = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-sm shrink-0 ${colorClass}`}
            aria-hidden="true"
          />
          <span className="text-ink truncate">{label}</span>
        </span>
        <span className="shrink-0">
          <span className="tnum font-medium text-ink">{count(value)}</span>
          <span className="tnum ml-1.5 text-caption text-ink-subtle">
            {sublabel ?? pct(share)}
          </span>
        </span>
      </div>

      <div
        className="h-1.5 rounded-full bg-surface-active overflow-hidden"
        role="img"
        aria-label={`${label}: ${count(value)}, ${pct(share)} of total`}
        title={`${label} — ${count(value)} (${pct(share)})`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${colorClass}`}
          style={{ width: `${Math.min(share, 100)}%` }}
        />
      </div>
    </div>
  );
};

const PanelTitle = ({ children, note }) => (
  <div className="flex items-baseline justify-between gap-3 mb-4">
    <h2 className="text-lg font-semibold text-ink">{children}</h2>
    {note && <span className="text-caption text-ink-subtle shrink-0">{note}</span>}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRideAnalytics(),
      ]);
      setStats(statsRes.data || null);
      setAnalytics(analyticsRes.data || null);
      if (showToast) toast.success("Dashboard refreshed");
    } catch {
      toast.error("Couldn't load dashboard data. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const um = stats?.userMetrics ?? {};
  const rm = stats?.rideMetrics ?? {};
  const rev = stats?.revenueMetrics ?? {};
  const pa = stats?.pendingActions ?? {};
  const ov = analytics?.overview ?? {};
  const distribution = analytics?.rideDistribution ?? [];

  const metrics = [
    {
      label: "Active riders",
      value: count(um.totalActiveRiders),
      context: `+${count(um.newRiderRegistrations?.last7Days ?? 0)} in last 7 days`,
      tone: um.newRiderRegistrations?.last7Days > 0 ? "positive" : "default",
    },
    {
      label: "Active drivers",
      value: count(um.totalActiveDrivers),
      context: `+${count(um.newDriverRegistrations?.last7Days ?? 0)} in last 7 days`,
      tone: um.newDriverRegistrations?.last7Days > 0 ? "positive" : "default",
    },
    {
      label: "Subscription revenue",
      value: money(rev.subscriptionRevenueUSD),
      context: "Lifetime, from driver plans",
    },
    {
      label: "Commission revenue",
      value: money(rev.withdrawalCommissionRevenueUSD, 2),
      context: "Fees on driver withdrawals",
    },
  ];

  const pendingDrivers = pa.pendingDriverRequests ?? 0;
  const pendingReports = pa.pendingReports ?? 0;
  const hasAttention = pendingDrivers > 0 || pendingReports > 0;

  // Fixed series order — a series keeps its color regardless of ranking.
  const SERIES = ["bg-chart-1", "bg-chart-2", "bg-chart-3"];
  const seriesOrder = ["economy", "luxury", "carpool"];
  const orderedDistribution = [...distribution].sort(
    (a, b) => seriesOrder.indexOf(a.type) - seriesOrder.indexOf(b.type)
  );

  const periods = [
    { label: "Today", completed: rm.totalRidesCompleted?.today, cancelled: rm.totalRidesCancelled?.today },
    { label: "This week", completed: rm.totalRidesCompleted?.thisWeek, cancelled: rm.totalRidesCancelled?.thisWeek },
    { label: "This month", completed: rm.totalRidesCompleted?.thisMonth, cancelled: rm.totalRidesCancelled?.thisMonth },
  ];

  const registrations = [
    { label: "Riders", data: um.newRiderRegistrations },
    { label: "Drivers", data: um.newDriverRegistrations },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        summary={
          loading
            ? "Loading platform metrics…"
            : `${count(ov.totalRides)} rides · ${count(
                um.totalActiveDrivers
              )} active drivers · ${count(um.totalActiveRiders)} active riders`
        }
        actions={
          <>
            <Button
              variant="ghost"
              size="md"
              icon={<RefreshCcw />}
              onClick={() => fetchAll(true)}
              loading={loading}
              aria-label="Refresh dashboard"
            />
            <Button
              variant="secondary"
              size="md"
              icon={<Flag />}
              onClick={() => navigate("/reports")}
            >
              Reports
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Bell />}
              onClick={() => navigate("/notifications")}
            >
              Send notification
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} loading={loading} />

      {/* Needs attention */}
      {!loading && (
        <section aria-labelledby="attention-heading" className="space-y-2">
          <h2 id="attention-heading" className="eyebrow">
            Needs attention
          </h2>
          {hasAttention ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingDrivers > 0 && (
                <AttentionRow
                  icon={Bell}
                  tone="warning"
                  label="Driver requests"
                  hint="Waiting on document review"
                  value={pendingDrivers}
                  onClick={() => navigate("/driver-requests")}
                />
              )}
              {pendingReports > 0 && (
                <AttentionRow
                  icon={Flag}
                  tone="danger"
                  label="Open reports"
                  hint="Safety and conduct reports"
                  value={pendingReports}
                  onClick={() => navigate("/reports")}
                />
              )}
            </div>
          ) : (
            <Card padding="px-4 py-3">
              <p className="text-sm text-ink-muted">
                Nothing waiting — driver requests and reports are all cleared.
              </p>
            </Card>
          )}
        </section>
      )}

      {/* Ride performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <PanelTitle note={`${count(ov.totalRides)} total`}>
            Ride completion
          </PanelTitle>

          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-2 w-full" />
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ) : (
            <>
              {/* Stacked magnitude bar. A 2px surface gap separates the two
                  segments so they never blur into one another. */}
              <div className="flex h-2 w-full rounded-full overflow-hidden bg-surface-active gap-[2px] mb-4">
                <div
                  className="bg-success h-full rounded-l-full transition-[width] duration-500"
                  style={{ width: `${ov.completedPercentage ?? 0}%` }}
                  title={`Completed — ${count(ov.completedRides)} (${pct(ov.completedPercentage)})`}
                />
                <div
                  className="bg-danger h-full rounded-r-full transition-[width] duration-500"
                  style={{ width: `${ov.cancelledPercentage ?? 0}%` }}
                  title={`Cancelled — ${count(ov.cancelledRides)} (${pct(ov.cancelledPercentage)})`}
                />
              </div>

              <div className="space-y-3">
                <Meter
                  label="Completed"
                  value={ov.completedRides}
                  total={ov.totalRides}
                  colorClass="bg-success"
                  sublabel={pct(ov.completedPercentage)}
                />
                <Meter
                  label="Cancelled"
                  value={ov.cancelledRides}
                  total={ov.totalRides}
                  colorClass="bg-danger"
                  sublabel={pct(ov.cancelledPercentage)}
                />
              </div>

              {/* The same numbers as a table — the accessible read of the bar. */}
              <table className="w-full mt-5 pt-4 border-t border-line">
                <caption className="sr-only">
                  Rides completed and cancelled by period
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="eyebrow text-left pb-1.5">Period</th>
                    <th scope="col" className="eyebrow text-right pb-1.5">Completed</th>
                    <th scope="col" className="eyebrow text-right pb-1.5">Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr key={period.label} className="border-t border-line-subtle">
                      <th scope="row" className="py-1.5 text-sm font-normal text-ink-muted text-left">
                        {period.label}
                      </th>
                      <td className="tnum py-1.5 text-sm text-ink text-right">
                        {count(period.completed ?? 0)}
                      </td>
                      <td className="tnum py-1.5 text-sm text-ink text-right">
                        {count(period.cancelled ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Card>

        <Card>
          <PanelTitle note={`${count(ov.totalRides)} total`}>Ride mix</PanelTitle>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-1.5 w-full" />
                </div>
              ))}
            </div>
          ) : orderedDistribution.length > 0 ? (
            <div className="space-y-3.5">
              {orderedDistribution.map((item, index) => (
                <Meter
                  key={item.type}
                  label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  value={item.count}
                  total={ov.totalRides}
                  colorClass={SERIES[index % SERIES.length]}
                  sublabel={pct(item.percentage)}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-ink-subtle">
              No rides recorded yet.
            </p>
          )}

          {/* New registrations */}
          <div className="mt-5 pt-4 border-t border-line">
            <table className="w-full">
              <caption className="eyebrow text-left mb-2">
                New registrations
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="sr-only">Audience</th>
                  <th scope="col" className="eyebrow text-right pb-1.5">Last 7 days</th>
                  <th scope="col" className="eyebrow text-right pb-1.5">Last 30 days</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row) => (
                  <tr key={row.label} className="border-t border-line-subtle">
                    <th scope="row" className="py-1.5 text-sm font-normal text-ink-muted text-left">
                      {row.label}
                    </th>
                    <td className="tnum py-1.5 text-sm text-ink text-right">
                      {count(row.data?.last7Days ?? 0)}
                    </td>
                    <td className="tnum py-1.5 text-sm text-ink text-right">
                      {count(row.data?.last30Days ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
