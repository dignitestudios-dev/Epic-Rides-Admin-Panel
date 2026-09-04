import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Car,
  Activity,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowUpRight,
  Clock,
  FileWarning,
  Bell,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Card from "../components/ui/Card";
import StatsCard from "../components/common/StatsCard";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/services";
import toast from "react-hot-toast";
import { formatCurrency, formatPercent } from "../utils/helpers";

// ── Mini Skeleton ─────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
  />
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
    {[...Array(5)].map((_, i) => (
      <Card key={i}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </Card>
    ))}
  </div>
);

// ── Donut Chart (pure CSS) ────────────────────────────────────────────────────
const DonutSegment = ({ percentage, color, offset }) => {
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  const strokeDashoffset = 100 - offset;
  return (
    <circle
      cx="20"
      cy="20"
      r="15.9155"
      fill="transparent"
      stroke={color}
      strokeWidth="4"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      style={{ transition: "stroke-dasharray 0.6s ease" }}
    />
  );
};

const DonutChart = ({ segments }) => {
  let offset = 25; // start from top
  return (
    <svg viewBox="0 0 40 40" className="w-32 h-32">
      <circle
        cx="20"
        cy="20"
        r="15.9155"
        fill="transparent"
        stroke="#f3f4f6"
        strokeWidth="4"
      />
      {segments.map((seg, i) => {
        const el = (
          <DonutSegment
            key={i}
            percentage={seg.percentage}
            color={seg.color}
            offset={offset}
          />
        );
        offset += seg.percentage;
        return el;
      })}
    </svg>
  );
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, max, color, suffix = "" }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 font-medium capitalize">{label}</span>
        <span className="font-bold text-gray-800">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ── Pending Action Card ───────────────────────────────────────────────────────
const PendingActionCard = ({ icon, label, count, color, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:shadow-md transition-all text-left ${color}`}
  >
    <div className="p-2.5 rounded-xl bg-white/70">{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-black mt-0.5">{count}</p>
    </div>
    <ArrowUpRight className="w-5 h-5 opacity-50" />
  </button>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRideAnalytics(),
      ]);
      setStats(statsRes.data || null);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Derived values ────────────────────────────────────────────────────────
  const um = stats?.userMetrics || {};
  const rm = stats?.rideMetrics || {};
  const rev = stats?.revenueMetrics || {};
  const pa = stats?.pendingActions || {};
  const ov = analytics?.overview || {};
  const dist = analytics?.rideDistribution || [];

  const topStatsCards = [
    {
      title: "Total Drivers",
      value: um.totalDrivers?.toLocaleString() ?? "—",
      description: `+${(um.newDriverRegistrations?.last7Days ?? 0).toLocaleString()} last 7 days`,
      icon: <Car />,
      index: 1,
    },
    {
      title: "Active Drivers",
      value: um.totalActiveDrivers?.toLocaleString() ?? "—",
      icon: <Car />,
      index: 2,
    },
    {
      title: "Active Riders",
      value: um.totalActiveRiders?.toLocaleString() ?? "—",
      description: `+${(um.newRiderRegistrations?.last7Days ?? 0).toLocaleString()} last 7 days`,
      icon: <Users />,
      index: 0,
    },
    {
      title: "Subscription Revenue",
      value:
        rev.subscriptionRevenueUSD != null
          ? formatCurrency(rev.subscriptionRevenueUSD)
          : "—",
      description: "Total earned from subscriptions",
      icon: <DollarSign />,
      index: 3,
    },
    {
      title: "Commission Revenue",
      value:
        rev.withdrawalCommissionRevenueUSD != null
          ? formatCurrency(rev.withdrawalCommissionRevenueUSD)
          : "—",
      description: "Withdrawal commission fees",
      icon: <TrendingUp />,
      index: 5,
    },
  ];

  const rideColors = {
    luxury: "#6366f1",
    economy: "#10b981",
    carpool: "#f59e0b",
  };
  const donutSegments = dist.map((d) => ({
    percentage: d.percentage,
    color: rideColors[d.type] || "#9ca3af",
    label: d.type,
  }));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform overview &amp; live metrics
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/notifications")}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Bell className="w-4 h-4" /> Send Notification
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <FileWarning className="w-4 h-4" /> View Reports
          </button>
        </div>
      </div>

      {/* ── Top Stats Cards ───────────────────────────────────────────────── */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {topStatsCards.map((s) => (
            <StatsCard
              key={s.title}
              title={s.title}
              value={s.value}
              description={s.description}
              icon={s.icon}
              colored
              index={s.index}
            />
          ))}
        </div>
      )}

      {/* ── Pending Actions ───────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PendingActionCard
            icon={<Car className="w-5 h-5 text-amber-600" />}
            label="Pending Driver Requests"
            count={pa.pendingDriverRequests ?? 0}
            color="bg-amber-50 border-amber-200 text-amber-800"
            onClick={() => navigate("/driver-requests")}
          />
          <PendingActionCard
            icon={<FileWarning className="w-5 h-5 text-red-600" />}
            label="Pending Reports"
            count={pa.pendingReports ?? 0}
            color="bg-red-50 border-red-200 text-red-800"
            onClick={() => navigate("/reports")}
          />
        </div>
      )}

      {/* ── Ride Stats + Analytics ────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Skeleton className="h-48 w-full" />
          </Card>
          <Card>
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ride Completion Metrics */}
          <Card>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#39A300]" />
                <h2 className="text-base font-bold text-gray-900">
                  Ride Metrics
                </h2>
              </div>

              {/* Total / Completed / Cancelled overview */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Total",
                    value: ov.totalRides,
                    color: "bg-blue-50 text-blue-700 border-blue-200",
                  },
                  {
                    label: "Completed",
                    value: ov.completedRides,
                    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  },
                  {
                    label: "Cancelled",
                    value: ov.cancelledRides,
                    color: "bg-red-50 text-red-700 border-red-200",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-3 text-center ${item.color}`}
                  >
                    <p className="text-2xl font-black">{item.value ?? "—"}</p>
                    <p className="text-xs font-semibold mt-0.5 opacity-80">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Completion bars */}
              <div className="space-y-3">
                <ProgressBar
                  label="Completed"
                  value={ov.completedRides ?? 0}
                  max={ov.totalRides ?? 1}
                  color="#10b981"
                  suffix={` (${formatPercent(ov.completedPercentage)})`}
                />
                <ProgressBar
                  label="Cancelled"
                  value={ov.cancelledRides ?? 0}
                  max={ov.totalRides ?? 1}
                  color="#ef4444"
                  suffix={` (${formatPercent(ov.cancelledPercentage)})`}
                />
              </div>

              {/* Today / Week / Month breakdown */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 text-xs">
                {[
                  {
                    period: "Today",
                    completed: rm.totalRidesCompleted?.today,
                    cancelled: rm.totalRidesCancelled?.today,
                  },
                  {
                    period: "This Week",
                    completed: rm.totalRidesCompleted?.thisWeek,
                    cancelled: rm.totalRidesCancelled?.thisWeek,
                  },
                  {
                    period: "This Month",
                    completed: rm.totalRidesCompleted?.thisMonth,
                    cancelled: rm.totalRidesCancelled?.thisMonth,
                  },
                ].map((p) => (
                  <div
                    key={p.period}
                    className="bg-gray-50 rounded-xl p-3 space-y-1.5"
                  >
                    <p className="font-semibold text-gray-500 text-center">
                      {p.period}
                    </p>
                    <div className="flex items-center gap-1 justify-center text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="font-bold">{p.completed ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="font-bold">{p.cancelled ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Ride Type Distribution */}
          <Card>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold text-gray-900">
                  Ride Type Distribution
                </h2>
              </div>

              {donutSegments.length > 0 ? (
                <div className="flex items-center gap-8">
                  <div className="relative shrink-0">
                    <DonutChart segments={donutSegments} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xl font-black text-gray-800">
                        {ov.totalRides ?? 0}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Total
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {dist.map((d) => (
                      <div key={d.type} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  rideColors[d.type] || "#9ca3af",
                              }}
                            />
                            <span className="capitalize font-semibold text-gray-700">
                              {d.type}
                            </span>
                          </div>
                          <span className="font-bold text-gray-800">
                            {d.count}{" "}
                            <span className="text-gray-400 font-normal">
                              ({formatPercent(d.percentage)})
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${d.percentage}%`,
                              backgroundColor: rideColors[d.type] || "#9ca3af",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity className="w-10 h-10 mb-2" />
                  <p className="text-sm">No ride distribution data</p>
                </div>
              )}

              {/* Revenue summary */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-500 mb-1">
                    Subscription Revenue
                  </p>
                  <p className="text-xl font-black text-indigo-700">
                    {rev.subscriptionRevenueUSD != null
                      ? formatCurrency(rev.subscriptionRevenueUSD)
                      : "—"}
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-500 mb-1">
                    Commission Revenue
                  </p>
                  <p className="text-xl font-black text-emerald-700">
                    {rev.withdrawalCommissionRevenueUSD != null
                      ? formatCurrency(rev.withdrawalCommissionRevenueUSD)
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── User Registrations ────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              title: "New Rider Registrations",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              data: um.newRiderRegistrations,
              cardBg: "bg-blue-50 border border-blue-100",
              valueCls: "text-gray-800",
              labelCls: "text-blue-500",
            },
            {
              title: "New Driver Registrations",
              icon: <Car className="w-5 h-5 text-purple-500" />,
              data: um.newDriverRegistrations,
              cardBg: "bg-purple-50 border border-purple-100",
              valueCls: "text-gray-800",
              labelCls: "text-purple-500",
            },
          ].map((section) => (
            <Card key={section.title}>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <h3 className="font-bold text-gray-900 text-sm">
                    {section.title}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`${section.cardBg} rounded-xl p-4 text-center`}
                  >
                    <p className={`text-2xl font-black ${section.valueCls}`}>
                      {section.data?.last7Days ?? 0}
                    </p>
                    <p
                      className={`text-xs font-semibold ${section.labelCls} mt-1`}
                    >
                      Last 7 Days
                    </p>
                  </div>
                  <div
                    className={`${section.cardBg} rounded-xl p-4 text-center`}
                  >
                    <p className={`text-2xl font-black ${section.valueCls}`}>
                      {section.data?.last30Days ?? 0}
                    </p>
                    <p
                      className={`text-xs font-semibold ${section.labelCls} mt-1`}
                    >
                      Last 30 Days
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
