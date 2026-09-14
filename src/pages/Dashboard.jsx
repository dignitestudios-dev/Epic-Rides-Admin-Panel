import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Car,
  Activity,
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowUpRight,
  Clock,
  TrendingUp,
  ChevronRight,
  Send,
  FileText,
  Sliders,
  AlertTriangle,
  RefreshCcw,
  UserCheck,
  UserPlus,
  ShieldAlert,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import StatsCard from "../components/common/StatsCard";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/services";
import toast from "react-hot-toast";
import { formatCurrency, formatPercent } from "../utils/helpers";

// ── Donut Chart (SVG) ────────────────────────────────────────────────────────
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
      strokeWidth="4.2"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      strokeLinecap="round"
      style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
    />
  );
};

const DonutChart = ({ segments }) => {
  let offset = 25;
  return (
    <svg viewBox="0 0 40 40" className="w-36 h-36 transform -rotate-90">
      <circle
        cx="20"
        cy="20"
        r="15.9155"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="4.2"
        className="text-gray-100 dark:text-[#1f242b]"
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

// ── Color Map for Ride Distribution Categories ──────────────────────────────
const CATEGORY_STYLES = {
  carpool: { color: "#61CB08", label: "Carpool", badge: "bg-[#61CB08]/10 text-[#61CB08] border-[#61CB08]/20" },
  economy: { color: "#38bdf8", label: "Economy", badge: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  luxury: { color: "#a855f7", label: "Luxury", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  private: { color: "#f59e0b", label: "Private", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

// ── Main Dashboard (Command Center) ──────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      };
      setCurrentTime(
        now
          .toLocaleDateString("en-US", options)
          .toUpperCase()
          .replace(/,/g, " ·")
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAll = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRideAnalytics(),
      ]);
      setStats(statsRes.data || null);
      setAnalytics(analyticsRes.data || null);
      if (isManualRefresh) {
        toast.success("Dashboard metrics updated.");
      }
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  // If initial load, render dedicated shimmer skeleton
  if (loading && !stats && !analytics) {
    return <DashboardSkeleton />;
  }

  // Derived real API data values
  const um = stats?.userMetrics || {};
  const rm = stats?.rideMetrics || {};
  const rev = stats?.revenueMetrics || {};
  const pa = stats?.pendingActions || {};
  const ov = analytics?.overview || {};
  const dist = analytics?.rideDistribution || [];

  // Total Revenue Calculation
  const subscriptionRevenue = Number(rev.subscriptionRevenueUSD || 0);
  const withdrawalCommissionRevenue = Number(rev.withdrawalCommissionRevenueUSD || 0);
  const totalRevenue = subscriptionRevenue + withdrawalCommissionRevenue;

  const subscriptionShare = totalRevenue > 0
    ? ((subscriptionRevenue / totalRevenue) * 100).toFixed(1)
    : "0";
  const commissionShare = totalRevenue > 0
    ? ((withdrawalCommissionRevenue / totalRevenue) * 100).toFixed(1)
    : "0";

  // Distribution Donut Segments
  const donutSegments = dist.map((d) => ({
    percentage: d.percentage || 0,
    color: CATEGORY_STYLES[d.type?.toLowerCase()]?.color || "#94a3b8",
    label: CATEGORY_STYLES[d.type?.toLowerCase()]?.label || d.type,
  }));

  // Target Key Metric Card Values
  const totalRevenueFormatted = formatCurrency(totalRevenue);
  const completedRidesVal = ov.completedRides != null ? ov.completedRides.toLocaleString() : "0";
  const activeDriversVal = um.totalActiveDrivers != null ? um.totalActiveDrivers.toLocaleString() : "0";
  const totalRidersVal = um.totalActiveRiders != null ? um.totalActiveRiders.toLocaleString() : "0";

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* ── 1. COMMAND CENTER HEADER & TELEMETRY PILLS ──────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-slate-400 uppercase">
            {currentTime || new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase()}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Command Center
            </h1>
            <button
              onClick={() => fetchAll(true)}
              disabled={isRefreshing}
              title="Refresh live metrics"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#2a313c] transition-all shadow-xs"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#61CB08]" : ""}`} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Realtime operations, fleet capacity and dispatch performance
          </p>
        </div>

        {/* Top Status Telemetry Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-xs font-semibold text-gray-700 dark:text-slate-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#61CB08] animate-pulse" />
            <span className="text-gray-400 uppercase text-[10px] tracking-wider font-bold">Network</span>
            <span className="text-gray-900 dark:text-white font-bold">Online</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-xs font-semibold text-gray-700 dark:text-slate-300 shadow-xs">
            <span className="text-gray-400 uppercase text-[10px] tracking-wider font-bold">Total Trips</span>
            <span className="text-gray-900 dark:text-white font-bold">
              {ov.totalRides != null ? ov.totalRides.toLocaleString() : "0"}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-xs font-semibold text-gray-700 dark:text-slate-300 shadow-xs">
            <span className="text-gray-400 uppercase text-[10px] tracking-wider font-bold">Completion</span>
            <span className="text-[#61CB08] font-bold">
              {ov.completedPercentage != null ? `${ov.completedPercentage}%` : "0%"}
            </span>
          </div>

          <button
            onClick={() => navigate("/driver-requests")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-xs font-semibold text-gray-700 dark:text-slate-300 hover:border-amber-500/40 transition-colors shadow-xs"
          >
            <span className="text-gray-400 uppercase text-[10px] tracking-wider font-bold">Driver Queue</span>
            <span className={pa.pendingDriverRequests > 0 ? "text-amber-500 font-bold" : "text-gray-700 dark:text-slate-300"}>
              {pa.pendingDriverRequests ?? 0}
            </span>
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-xs font-semibold text-gray-700 dark:text-slate-300 hover:border-rose-500/40 transition-colors shadow-xs"
          >
            <span className="text-gray-400 uppercase text-[10px] tracking-wider font-bold">Reports</span>
            <span className={pa.pendingReports > 0 ? "text-rose-500 font-bold" : "text-gray-700 dark:text-slate-300"}>
              {pa.pendingReports ?? 0}
            </span>
          </button>
        </div>
      </div>

      {/* ── 2. LIVE FLEET TELEMETRY STREAM BAR ──────────────────────────────── */}
      <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 transition-all shadow-xs">
        {/* Stream Bar Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1f242b] pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#61CB08] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#61CB08]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Live Fleet Telemetry
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-400 font-medium hidden sm:inline">
              streaming real-time operational capacity
            </span>
          </div>

          <button
            onClick={() => navigate("/birds-eye-view")}
            className="text-xs font-semibold text-[#61CB08] hover:underline inline-flex items-center gap-1"
          >
            Live Radar <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Operational Grid Items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-[#1f242b]">
          <div className="pt-2 sm:pt-0 sm:px-2 first:px-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Active Riders
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalRidersVal}
            </p>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-[#61CB08] mt-0.5">
              +{um.newRiderRegistrations?.last30Days ?? 0} in last 30d
            </p>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Active Drivers
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {activeDriversVal}
            </p>
            <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">
              of {um.totalDrivers?.toLocaleString() ?? "0"} total registered
            </p>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Completed Rides
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {completedRidesVal}
            </p>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-[#61CB08] mt-0.5">
              {ov.completedPercentage != null ? `${ov.completedPercentage}% completion rate` : "0% rate"}
            </p>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Cancelled Rides
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {ov.cancelledRides != null ? ov.cancelledRides.toLocaleString() : "0"}
            </p>
            <p className="text-[11px] font-medium text-rose-500 mt-0.5">
              {ov.cancelledPercentage != null ? `${ov.cancelledPercentage}% cancellation rate` : "0% rate"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. FOUR KEY TARGET METRICS CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={totalRevenueFormatted}
          change={`${subscriptionShare}% Subscriptions`}
          changeType="positive"
          targetLabel="Subscription Share"
          targetProgress={Math.round(Number(subscriptionShare))}
          index={0}
        />
        <StatsCard
          title="Completed Rides"
          value={completedRidesVal}
          change={`${ov.completedPercentage || 0}% Completed`}
          changeType="positive"
          targetLabel="Of Total System Rides"
          targetProgress={Math.round(ov.completedPercentage || 0)}
          index={1}
        />
        <StatsCard
          title="Active Riders"
          value={totalRidersVal}
          change={`+${um.newRiderRegistrations?.last7Days ?? 0} (7d)`}
          changeType="positive"
          targetLabel="30-Day Growth"
          targetProgress={um.totalActiveRiders ? Math.min(100, Math.round(((um.newRiderRegistrations?.last30Days || 0) / um.totalActiveRiders) * 100)) : 0}
          index={2}
        />
        <StatsCard
          title="Active Drivers"
          value={activeDriversVal}
          change={`+${um.newDriverRegistrations?.last7Days ?? 0} (7d)`}
          changeType="positive"
          targetLabel="Fleet Activation"
          targetProgress={um.totalDrivers ? Math.round(((um.totalActiveDrivers || 0) / um.totalDrivers) * 100) : 0}
          index={3}
        />
      </div>

      {/* ── 4. MAIN SPLIT: REVENUE ARCHITECTURE + REGISTRATION VELOCITY & QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left (2/3): Revenue Architecture & Registration Breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#1f242b] pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Revenue Architecture &amp; User Velocity
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Direct revenue stream breakdown and rider/driver acquisition rates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/revenue")}
                  className="text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] inline-flex items-center gap-1 transition-colors hover:border-gray-300 dark:hover:border-[#2a313c]"
                >
                  Revenue Center <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Revenue Streams Real Data Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              {/* Subscription Revenue Card */}
              <div className="p-4 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/60 dark:bg-[#181d24] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#61CB08]/10 border border-[#61CB08]/20 flex items-center justify-center text-[#61CB08] shadow-xs">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Subscription Revenue
                      </span>
                      <span className="text-[10px] text-gray-400">Driver recurring plans</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
                    {subscriptionShare}%
                  </span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(subscriptionRevenue)}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Primary recurring revenue stream
                  </p>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-[#222831] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#61CB08] transition-all duration-700"
                    style={{ width: `${subscriptionShare}%` }}
                  />
                </div>
              </div>

              {/* Withdrawal Commission Revenue Card */}
              <div className="p-4 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/60 dark:bg-[#181d24] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-xs">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Withdrawal Commission
                      </span>
                      <span className="text-[10px] text-gray-400">Payout processing fees</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {commissionShare}%
                  </span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(withdrawalCommissionRevenue)}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Transactional commission revenue
                  </p>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-[#222831] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-all duration-700"
                    style={{ width: `${commissionShare}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Registration Growth Breakdown (Real Data) */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1f242b]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    New Registrations Growth
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-gray-400">Past 7 vs 30 Days</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rider Registrations */}
                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-white dark:bg-[#101317] hover:border-gray-200 dark:hover:border-[#2a313c] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <UserPlus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800 dark:text-slate-200 block">
                          Rider Registrations
                        </span>
                        <span className="text-[10px] text-gray-400">{um.totalActiveRiders ?? 0} active total</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#1a1f26]">
                      {um.newRiderRegistrations?.last30Days ?? 0} <span className="text-[10px] text-gray-400 font-normal">/ 30d</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-1.5 border-t border-gray-50 dark:border-[#181d24]">
                    <span>Last 7 Days</span>
                    <span className="font-bold text-emerald-600 dark:text-[#61CB08] inline-flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{um.newRiderRegistrations?.last7Days ?? 0} riders
                    </span>
                  </div>
                </div>

                {/* Driver Registrations */}
                <div className="p-3.5 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-white dark:bg-[#101317] hover:border-gray-200 dark:hover:border-[#2a313c] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                        <Car className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800 dark:text-slate-200 block">
                          Driver Registrations
                        </span>
                        <span className="text-[10px] text-gray-400">{um.totalDrivers ?? 0} total fleet</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#1a1f26]">
                      {um.newDriverRegistrations?.last30Days ?? 0} <span className="text-[10px] text-gray-400 font-normal">/ 30d</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-1.5 border-t border-gray-50 dark:border-[#181d24]">
                    <span>Last 7 Days</span>
                    <span className="font-bold text-sky-500 inline-flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{um.newDriverRegistrations?.last7Days ?? 0} drivers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-gray-100 dark:border-[#1f242b] flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#61CB08]" /> Subscription (${subscriptionRevenue.toLocaleString()})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Commission (${withdrawalCommissionRevenue.toLocaleString()})
              </span>
            </div>
            <span>Live Sync</span>
          </div>
        </div>

        {/* Right (1/3): Quick Actions & Action Queue Card */}
        <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="border-b border-gray-100 dark:border-[#1f242b] pb-3 mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Pending operational queues &amp; fast links
              </p>
            </div>

            {/* Action Queue Items */}
            <div className="space-y-2">
              {[
                {
                  title: "Review Driver Applications",
                  desc: `${pa.pendingDriverRequests ?? 0} pending verification in queue`,
                  icon: <UserCheck className="w-4 h-4 text-amber-500" />,
                  badge: pa.pendingDriverRequests > 0 ? `${pa.pendingDriverRequests} Pending` : null,
                  badgeStyle: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  action: () => navigate("/driver-requests"),
                },
                {
                  title: "Investigate Safety Reports",
                  desc: `${pa.pendingReports ?? 0} open user incident reports`,
                  icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
                  badge: pa.pendingReports > 0 ? `${pa.pendingReports} Open` : null,
                  badgeStyle: "bg-rose-500/10 text-rose-500 border-rose-500/20",
                  action: () => navigate("/reports"),
                },
                {
                  title: "Fleet Live Radar",
                  desc: "Interactive map with live driver coordinates",
                  icon: <Compass className="w-4 h-4 text-emerald-500" />,
                  action: () => navigate("/birds-eye-view"),
                },
                {
                  title: "Configure Pricing & Rates",
                  desc: "City bracket fares and peak surcharge windows",
                  icon: <Sliders className="w-4 h-4 text-purple-500" />,
                  action: () => navigate("/ride-rates"),
                },
                {
                  title: "Push Notifications",
                  desc: "Broadcast custom notifications to users",
                  icon: <Send className="w-4 h-4 text-sky-500" />,
                  action: () => navigate("/notifications"),
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#101317] hover:bg-gray-100 dark:hover:bg-[#181d24] text-left transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#181d24] border border-gray-200 dark:border-[#222831] flex items-center justify-center shrink-0 shadow-xs">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${item.badgeStyle}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#1f242b] text-center">
            <button
              onClick={() => navigate("/birds-eye-view")}
              className="text-xs font-semibold text-[#61CB08] hover:underline inline-flex items-center gap-1"
            >
              Open Live Operational Radar →
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. SECONDARY ROW: REDESIGNED RIDE OPERATIONS & FLEET CATEGORY DISTRIBUTION ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ride Operations & Velocity (Redesigned & Elevated) */}
        <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1f242b] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Ride Operations &amp; Velocity
                  </h2>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#61CB08] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#61CB08]" />
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Completed vs cancelled trip distribution across temporal windows
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
                Live Feed
              </span>
            </div>

            {/* 3 Temporal Window Cards (Today / This Week / This Month) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {[
                {
                  period: "Today",
                  completed: rm.totalRidesCompleted?.today ?? 0,
                  cancelled: rm.totalRidesCancelled?.today ?? 0,
                  icon: <Clock className="w-3.5 h-3.5 text-gray-400" />,
                },
                {
                  period: "This Week",
                  completed: rm.totalRidesCompleted?.thisWeek ?? 0,
                  cancelled: rm.totalRidesCancelled?.thisWeek ?? 0,
                  icon: <Calendar className="w-3.5 h-3.5 text-gray-400" />,
                },
                {
                  period: "This Month",
                  completed: rm.totalRidesCompleted?.thisMonth ?? 0,
                  cancelled: rm.totalRidesCancelled?.thisMonth ?? 0,
                  icon: <Layers className="w-3.5 h-3.5 text-gray-400" />,
                },
              ].map((p) => {
                const periodTotal = p.completed + p.cancelled;
                const compPct = periodTotal > 0 ? Math.round((p.completed / periodTotal) * 100) : 0;
                const cancPct = periodTotal > 0 ? Math.round((p.cancelled / periodTotal) * 100) : 0;

                return (
                  <div
                    key={p.period}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#101317] hover:border-gray-200 dark:hover:border-[#2a313c] transition-all space-y-3"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {p.icon}
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {p.period}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-[#181d24] text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-[#222831]">
                        {periodTotal} trips
                      </span>
                    </div>

                    {/* Counters */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#61CB08]" /> Completed
                        </span>
                        <span className="text-xs font-bold text-[#61CB08]">
                          {p.completed} <span className="text-[10px] font-normal text-gray-400">({compPct}%)</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-500" /> Cancelled
                        </span>
                        <span className="text-xs font-bold text-rose-500">
                          {p.cancelled} <span className="text-[10px] font-normal text-gray-400">({cancPct}%)</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Proportion Track */}
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-[#222831] rounded-full overflow-hidden flex">
                      {periodTotal > 0 ? (
                        <>
                          <div
                            className="h-full bg-[#61CB08]"
                            style={{ width: `${compPct}%` }}
                          />
                          <div
                            className="h-full bg-rose-500"
                            style={{ width: `${cancPct}%` }}
                          />
                        </>
                      ) : (
                        <div className="h-full w-full bg-gray-200 dark:bg-[#222831]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lifetime Performance Summary Box */}
            <div className="mt-4 p-3.5 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-white dark:bg-[#101317] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-gray-900 dark:text-white">
                  Lifetime Operations Summary
                </span>
                <span className="text-gray-500 dark:text-slate-400 font-medium">
                  {ov.totalRides?.toLocaleString() ?? 0} Total Logged Rides
                </span>
              </div>

              {/* Dual-color Segmented Progress Bar */}
              <div className="h-2 w-full bg-gray-100 dark:bg-[#1f242b] rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-[#61CB08] transition-all duration-700"
                  style={{ width: `${ov.completedPercentage || 0}%` }}
                  title={`Completed: ${ov.completedPercentage}%`}
                />
                <div
                  className="h-full bg-rose-500 transition-all duration-700"
                  style={{ width: `${ov.cancelledPercentage || 0}%` }}
                  title={`Cancelled: ${ov.cancelledPercentage}%`}
                />
              </div>

              {/* Legend with exact numbers */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#61CB08]" />
                  <span>Completed: <strong className="text-gray-900 dark:text-white">{ov.completedRides?.toLocaleString() ?? 0}</strong> ({ov.completedPercentage}%)</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Cancelled: <strong className="text-gray-900 dark:text-white">{ov.cancelledRides?.toLocaleString() ?? 0}</strong> ({ov.cancelledPercentage}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Share & Ride Categories (Elevated) */}
        <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1f242b] pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Fleet Share &amp; Ride Distribution
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Distribution by service class across all {ov.totalRides?.toLocaleString() ?? 0} rides
                </p>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#181d24] border border-gray-200 dark:border-[#222831]">
                {dist.length} Service Classes
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-3">
              {/* Donut Chart with Center Trip Count */}
              <div className="relative shrink-0 flex items-center justify-center">
                <DonutChart
                  segments={
                    donutSegments.length > 0
                      ? donutSegments
                      : [{ percentage: 100, color: "#61CB08" }]
                  }
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {ov.totalRides ?? 0}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    Trips
                  </span>
                </div>
              </div>

              {/* Category Breakdown Progress Meters */}
              <div className="flex-1 w-full space-y-3">
                {dist.map((item) => {
                  const conf = CATEGORY_STYLES[item.type?.toLowerCase()] || {
                    color: "#94a3b8",
                    label: item.type,
                  };
                  return (
                    <div key={item.type} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: conf.color }}
                          />
                          <span className="font-bold text-gray-800 dark:text-slate-200 capitalize">
                            {conf.label}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.count?.toLocaleString()} <span className="text-gray-400 font-normal">({item.percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-[#1f242b] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: conf.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-[#1f242b] flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <button
              onClick={() => navigate("/private-rides")}
              className="text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-1"
            >
              Private Rides <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/carpool-rides")}
              className="text-xs font-semibold text-[#61CB08] hover:underline inline-flex items-center gap-1"
            >
              Carpool Rides <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
