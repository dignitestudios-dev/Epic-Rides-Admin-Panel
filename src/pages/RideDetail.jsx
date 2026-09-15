import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Car,
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle2,
  Navigation,
  Activity,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  Percent,
  Star,
  FileText,
  Tag,
  ListOrdered,
  Layers,
  Sparkles,
  Copy,
  Check,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Users as UsersIcon,
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Tabs from "../components/ui/Tabs";
import StatsCard from "../components/common/StatsCard";
import Table from "../components/ui/Table";
import { api } from "../lib/services";
import {
  formatDateTime,
  formatDate,
  formatPhoneNumber,
  formatCurrency,
  maskEmail,
  maskPhone,
} from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import { usePersistentState } from "../hooks/global/usePersistentState";
import toast from "react-hot-toast";

const fullName = (obj) =>
  [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const formatTitleCase = (str) => {
  if (!str) return "—";
  return String(str)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] || "?").slice(0, 2).toUpperCase();
};

const statusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "cancelled":
    case "canceled":
      return <Badge variant="danger" dot>Cancelled</Badge>;
    case "completed":
      return <Badge variant="success" dot>Completed</Badge>;
    case "active":
    case "started":
    case "ongoing":
      return <Badge variant="warning" dot>Ongoing</Badge>;
    case "accepted":
      return <Badge variant="primary" dot>Accepted</Badge>;
    case "arrived":
    case "driver_arrived":
      return <Badge variant="info" dot>Driver Arrived</Badge>;
    case "pending":
      return <Badge variant="default" dot>Pending</Badge>;
    default:
      return <Badge variant="default" dot>{formatTitleCase(status)}</Badge>;
  }
};

const paymentBadge = (status) => {
  if (!status) return <Badge variant="default">—</Badge>;
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
    case "succeeded":
    case "success":
      return <Badge variant="success" dot>{formatTitleCase(status)}</Badge>;
    case "pending":
    case "processing":
      return <Badge variant="warning" dot>{formatTitleCase(status)}</Badge>;
    case "failed":
    case "declined":
    case "cancelled":
    case "canceled":
      return <Badge variant="danger" dot>{formatTitleCase(status)}</Badge>;
    case "refunded":
    case "reversed":
      return <Badge variant="info" dot>{formatTitleCase(status)}</Badge>;
    default:
      return <Badge variant="default" dot>{formatTitleCase(status)}</Badge>;
  }
};

const transactionStatusBadge = (status) => {
  if (!status) return <Badge variant="default">—</Badge>;
  const s = String(status).toLowerCase();
  switch (s) {
    case "paid":
    case "completed":
    case "succeeded":
    case "success":
      return <Badge variant="success" dot>{formatTitleCase(status)}</Badge>;
    case "pending":
    case "processing":
    case "in_escrow":
    case "hold":
    case "held":
      return <Badge variant="warning" dot>{formatTitleCase(status)}</Badge>;
    case "failed":
    case "declined":
    case "cancelled":
    case "canceled":
      return <Badge variant="danger" dot>{formatTitleCase(status)}</Badge>;
    case "refunded":
    case "refund":
    case "partial_refund":
    case "reversed":
      return <Badge variant="info" dot>{formatTitleCase(status)}</Badge>;
    default:
      return <Badge variant="default" dot>{formatTitleCase(status)}</Badge>;
  }
};

const RideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const isDev = location.pathname.startsWith("/dev");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [activeTab, setActiveTab] = usePersistentState(`ride_${id}_tab`, "overview");
  const [copiedField, setCopiedField] = useState(null);

  const fetchRideDetail = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await api.getRideById(id);
      const data = res?.data || res;
      setRawData(data);
      if (isManual) toast.success("Ride details refreshed");
    } catch (error) {
      toast.error(error.message || "Failed to fetch ride details.");
      if (!isManual) navigate(isDev ? "/dev" : "/private-rides");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, navigate, isDev]);

  useEffect(() => {
    fetchRideDetail();
  }, [fetchRideDetail]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#61CB08]/20 border-t-[#61CB08] animate-spin" />
          <Car className="w-5 h-5 text-[#61CB08] absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Loading ride details...</p>
      </div>
    );
  }

  const ride = rawData?.rideDetails || rawData;
  const offers = rawData?.offers || ride?.offers || [];
  const transactions = rawData?.transactions || ride?.transactions || [];

  if (!ride) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-2xl shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ride not found</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">
          The requested private ride could not be located.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(isDev ? "/dev" : "/private-rides")} className="mx-auto">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Private Rides
        </Button>
      </div>
    );
  }

  const {
    user: rider,
    driver,
    vehicle,
    pickupPoint,
    dropOffPointRequested,
    dropOffPoint,
    rideFare,
    economyRideFare,
    luxuryRideFare,
    driverFare,
    rideStatus,
    paymentStatus,
    paymentMethod,
    rideDistance,
    averageTime,
    rideType,
    specialRequest,
    cancellationReason,
    cancelledBy,
    cancelledAt,
    requestedAt,
    createdAt,
    updatedAt,
    acceptedAt,
    driverArrivedAt,
    passengerComingAt,
    startedAt,
    completedAt,
    endTime,
  } = ride;

  const pickup = pickupPoint;
  const dropoff = dropOffPointRequested || dropOffPoint;
  const pickupAddress = pickup?.placeName || (typeof pickup === "string" ? pickup : "—");
  const pickupCoords = pickup?.location?.coordinates || pickup?.coordinates || null;
  const dropoffAddress = dropoff?.placeName || (typeof dropoff === "string" ? dropoff : "—");
  const dropoffCoords = dropoff?.location?.coordinates || dropoff?.coordinates || null;

  const isCancelled = (rideStatus || "").toLowerCase() === "cancelled" || (rideStatus || "").toLowerCase() === "canceled";

  // Tab configuration without timeline map
  const tabsList = [
    { key: "overview", label: "Trip & Route Details", icon: <Navigation className="w-3.5 h-3.5" /> },
    { key: "participants", label: "Rider & Driver Profiles", icon: <UsersIcon className="w-3.5 h-3.5" /> },
    {
      key: "financials",
      label: "Fare & Transactions",
      icon: <DollarSign className="w-3.5 h-3.5" />,
      count: transactions.length || undefined,
    },
    {
      key: "offers",
      label: "Driver Offers",
      icon: <ListOrdered className="w-3.5 h-3.5" />,
      count: offers.length || undefined,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* ── TOP NAV BAR & BREADCRUMBS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(isDev ? "/dev" : "/private-rides")}
            className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {isDev ? "Back to Dev Hub" : "Back to Private Rides"}
          </Button>
          <span className="text-gray-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20 uppercase tracking-wider">
            Private Ride
          </span>
          <span className="text-gray-300 dark:text-slate-700">/</span>
          <span className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-300">
            #{id?.slice(0, 8)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRideDetail(true)}
            disabled={refreshing}
            className="border-gray-200 dark:border-[#1f242b] text-xs font-medium"
            icon={<RotateCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#61CB08]" : ""}`} />}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* ── RIDE HERO HEADER CARD ── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#61CB08]/10 via-[#61CB08]/5 to-transparent pointer-events-none rounded-tr-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Private Ride Order
              </h1>
            </div>

            {/* Clear, Explicitly-Labeled Status Badges */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#181d24] px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-[#1f242b]">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Ride Status:</span>
                {statusBadge(rideStatus)}
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#181d24] px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-[#1f242b]">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Service Class:</span>
                <Badge variant="primary" className="capitalize text-[10px] font-semibold">
                  {rideType || "Private"} Class
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#181d24] px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-[#1f242b]">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Payment Status:</span>
                {paymentBadge(paymentStatus)}
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => handleCopy(id, "Ride ID")}
                className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#181d24] text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                title="Click to copy Ride ID"
              >
                <span>ID: {id?.slice(0, 10)}...</span>
                {copiedField === "Ride ID" ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 opacity-60" />
                )}
              </button>

              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Requested: {formatDateTime(requestedAt || createdAt)}</span>
              </div>

              {completedAt && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed: {formatDateTime(completedAt || endTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prominent Price & Fare Pill */}
          <div className="flex items-center gap-4 lg:border-l lg:border-gray-100 dark:lg:border-[#1f242b] lg:pl-6">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Total Ride Fare
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#61CB08] tracking-tight">
                {formatCurrency(rideFare || driverFare || 0)}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400 capitalize">
                Paid via {formatTitleCase(paymentMethod || "Card")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CANCELLATION ALERT (IF CANCELLED) ── */}
      {isCancelled && (
        <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              This ride was cancelled
            </h4>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-rose-800 dark:text-rose-300">
              <div>
                <span className="text-rose-600/80 dark:text-rose-400/80 block">Cancelled By:</span>
                <span className="font-bold capitalize">{cancelledBy || "Unknown"}</span>
              </div>
              <div>
                <span className="text-rose-600/80 dark:text-rose-400/80 block">Cancellation Reason:</span>
                <span className="font-bold">{cancellationReason || "No reason specified"}</span>
              </div>
              <div>
                <span className="text-rose-600/80 dark:text-rose-400/80 block">Cancelled At:</span>
                <span className="font-mono">{formatDateTime(cancelledAt || updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI METRICS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Customer Fare"
          value={formatCurrency(rideFare || 0)}
          icon={<CircleDollarSign />}
          index={0}
          sparkline
        />
        <StatsCard
          title="Driver Earnings"
          value={formatCurrency(driverFare || rideFare || 0)}
          icon={<DollarSign />}
          index={1}
          sparkline
        />
        <StatsCard
          title="Route Distance"
          value={rideDistance != null ? `${Number(rideDistance).toFixed(2)} mi` : "—"}
          icon={<Navigation />}
          index={2}
          sparkline
        />
        <StatsCard
          title="Trip Duration"
          value={averageTime != null ? `${averageTime} min` : "—"}
          icon={<Clock />}
          index={3}
          sparkline
        />
      </div>

      {/* ── SEGMENTED NAVIGATION TABS ── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] rounded-2xl p-4 sm:p-5 shadow-xs space-y-6">
        <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />

        {/* ── TAB CONTENT ── */}
        <div>
          {/* TAB 1: TRIP & ROUTE DETAILS */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Route Trajectory & Stops */}
              <div className="lg:col-span-2 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#61CB08]" />
                    Route Trajectory & Waypoints
                  </h3>
                  <Badge variant="default" className="text-[10px]">
                    {rideDistance != null ? `${Number(rideDistance).toFixed(2)} miles` : "Direct Route"}
                  </Badge>
                </div>

                {/* Visual Route Stop Line */}
                <div className="relative pl-6 space-y-6 before:absolute before:inset-y-3 before:left-[11px] before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gray-300 dark:before:via-gray-600 before:to-rose-500">
                  {/* Origin */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#13161a] shadow-sm flex items-center justify-center" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Pickup Location
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {pickupAddress}
                      </p>
                      {pickupCoords && (
                        <span className="inline-block text-[10px] font-mono text-gray-400 mt-1 bg-white dark:bg-[#13161a] px-2 py-0.5 rounded border border-gray-200/60 dark:border-[#1f242b]">
                          Lat: {pickupCoords[1]?.toFixed(5)}, Lng: {pickupCoords[0]?.toFixed(5)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-[#13161a] shadow-sm flex items-center justify-center" />
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                        Drop-off Location
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {dropoffAddress}
                      </p>
                      {dropoffCoords && (
                        <span className="inline-block text-[10px] font-mono text-gray-400 mt-1 bg-white dark:bg-[#13161a] px-2 py-0.5 rounded border border-gray-200/60 dark:border-[#1f242b]">
                          Lat: {dropoffCoords[1]?.toFixed(5)}, Lng: {dropoffCoords[0]?.toFixed(5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Request */}
                {specialRequest && (
                  <div className="pt-4 border-t border-gray-200/60 dark:border-[#1f242b]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Passenger Special Instructions
                    </span>
                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b] text-xs text-gray-700 dark:text-slate-300">
                      "{specialRequest}"
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Trip Timeline & Specs */}
              <div className="space-y-4">
                <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                    <Clock className="w-4 h-4 text-[#61CB08]" />
                    Lifecycle Timeline
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Order Requested</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {formatDateTime(requestedAt || createdAt)}
                      </span>
                    </div>

                    {acceptedAt && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                        <span className="text-gray-500 dark:text-slate-400">Driver Accepted</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                          {formatDateTime(acceptedAt)}
                        </span>
                      </div>
                    )}

                    {driverArrivedAt && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                        <span className="text-gray-500 dark:text-slate-400">Driver Arrived</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                          {formatDateTime(driverArrivedAt)}
                        </span>
                      </div>
                    )}

                    {startedAt && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                        <span className="text-gray-500 dark:text-slate-400">Trip Started</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                          {formatDateTime(startedAt)}
                        </span>
                      </div>
                    )}

                    {completedAt && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                        <span className="text-gray-500 dark:text-slate-400">Trip Completed</span>
                        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          {formatDateTime(completedAt)}
                        </span>
                      </div>
                    )}

                    {cancelledAt && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-rose-500 font-medium">Trip Cancelled</span>
                        <span className="font-mono font-medium text-rose-500">
                          {formatDateTime(cancelledAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS (RIDER & DRIVER) */}
          {activeTab === "participants" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rider Profile Card */}
              <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Rider Passenger
                  </h3>
                  {rider?._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/user-management/rider/${rider._id}`)}
                      className="text-xs text-[#61CB08] hover:text-[#52ad06]"
                    >
                      View Profile <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>

                {rider ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-base overflow-hidden border border-blue-500/30 shrink-0">
                        {rider.profilePicture ? (
                          <img src={rider.profilePicture} alt={fullName(rider)} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(fullName(rider))
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {fullName(rider)}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {rider.rating != null ? Number(rider.rating).toFixed(1) : "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs pt-2">
                      <div className="flex items-center gap-2.5 text-gray-600 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {hasPermission("seeSensitiveData") ? rider.email : maskEmail(rider.email)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-gray-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-mono">
                          {hasPermission("seeSensitiveData")
                            ? formatPhoneNumber(rider.phone) || "—"
                            : maskPhone(rider.phone)}
                        </span>
                      </div>
                      {rider.address && (
                        <div className="flex items-start gap-2.5 text-gray-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span className="truncate">
                            {[rider.address, rider.city, rider.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">No passenger record attached.</p>
                )}
              </div>

              {/* Driver & Vehicle Profile Card */}
              <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#61CB08]" />
                    Assigned Driver & Vehicle
                  </h3>
                  {driver?._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/user-management/driver/${driver._id}`)}
                      className="text-xs text-[#61CB08] hover:text-[#52ad06]"
                    >
                      View Profile <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>

                {driver ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-[#61CB08] flex items-center justify-center font-bold text-base overflow-hidden border border-[#61CB08]/30 shrink-0">
                        {driver.profilePicture ? (
                          <img src={driver.profilePicture} alt={fullName(driver)} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(fullName(driver))
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {fullName(driver)}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {driver.rating != null ? Number(driver.rating).toFixed(1) : "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs pt-2">
                      <div className="flex items-center gap-2.5 text-gray-600 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {hasPermission("seeSensitiveData") ? driver.email : maskEmail(driver.email)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-gray-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-mono">
                          {hasPermission("seeSensitiveData")
                            ? formatPhoneNumber(driver.phone) || "—"
                            : maskPhone(driver.phone)}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Specifications Chip */}
                    {(vehicle || driver.vehicleDetails) && (
                      <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b] text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vehicle:</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {[vehicle?.make || driver.vehicleDetails?.make, vehicle?.model || driver.vehicleDetails?.model].filter(Boolean).join(" ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plate:</span>
                          <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                            {vehicle?.licensePlate || driver.vehicleDetails?.licensePlateNumber || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Color / Year:</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {[vehicle?.color || driver.vehicleDetails?.color, vehicle?.yearOfManufacture || driver.vehicleDetails?.yearOfManufacture].filter(Boolean).join(" • ") || "—"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 dark:border-[#1f242b] rounded-lg">
                    <p className="text-xs text-gray-400">No driver assigned to this ride.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIALS & TRANSACTIONS */}
          {activeTab === "financials" && (
            <div className="space-y-6">
              {/* Fare Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl">
                  <span className="text-xs text-gray-400 block mb-1">Final Fare Billed</span>
                  <span className="text-xl font-bold text-[#61CB08]">
                    {formatCurrency(rideFare || 0)}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl">
                  <span className="text-xs text-gray-400 block mb-1">Economy Option</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(economyRideFare || 0)}
                  </span>
                </div>
                <div className="p-4 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl">
                  <span className="text-xs text-gray-400 block mb-1">Luxury Option</span>
                  <span className="text-xl font-bold text-purple-500">
                    {formatCurrency(luxuryRideFare || 0)}
                  </span>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Transaction Ledger ({transactions.length})
                </h3>

                {transactions.length > 0 ? (
                  <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                    <Table
                      data={transactions}
                      columns={[
                        {
                          key: "createdAt",
                          label: "Date & Time",
                          render: (val, row) => <span className="font-mono text-[11px]">{formatDateTime(val || row.date)}</span>,
                        },
                        {
                          key: "amount",
                          label: "Amount",
                          render: (val) => <span className="font-bold text-xs">{formatCurrency(val || 0)}</span>,
                        },
                        {
                          key: "type",
                          label: "Type",
                          render: (val) => <span className="capitalize text-xs">{formatTitleCase(val || "Payment")}</span>,
                        },
                        {
                          key: "status",
                          label: "Status",
                          render: (val) => transactionStatusBadge(val),
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                    No transactions recorded for this order yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DRIVER OFFERS */}
          {activeTab === "offers" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Driver Bidding & Counter Offers ({offers.length})
              </h3>

              {offers.length > 0 ? (
                <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                  <Table
                    data={offers}
                    columns={[
                      {
                        key: "driver",
                        label: "Driver",
                        render: (drv) => <span className="font-semibold text-xs text-gray-900 dark:text-white">{fullName(drv)}</span>,
                      },
                      {
                        key: "fare",
                        label: "Offered Fare",
                        render: (val, row) => (
                          <span className="font-bold text-xs text-[#61CB08]">
                            {formatCurrency(val || row.offeredFare || 0)}
                          </span>
                        ),
                      },
                      {
                        key: "status",
                        label: "Status",
                        render: (val) => (
                          <Badge variant={val === "accepted" ? "success" : "default"} className="capitalize text-[10px]">
                            {val || "Offered"}
                          </Badge>
                        ),
                      },
                      {
                        key: "createdAt",
                        label: "Timestamp",
                        render: (val) => <span className="font-mono text-[11px]">{formatDateTime(val)}</span>,
                      },
                    ]}
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-8 text-center border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                  No driver offers registered for this request.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetail;
