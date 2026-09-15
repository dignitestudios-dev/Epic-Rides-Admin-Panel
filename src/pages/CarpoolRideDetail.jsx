import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Car,
  Clock,
  Star,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle2,
  Navigation,
  Activity,
  FileText,
  RotateCcw,
  ExternalLink,
  Users as UsersIcon,
  Copy,
  Check,
  AlertTriangle,
  CircleDollarSign,
  Layers,
  CreditCard,
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
  const s = status?.toLowerCase()?.trim();
  switch (s) {
    case "cancelled":
    case "canceled":
      return <Badge variant="danger" dot>Cancelled</Badge>;
    case "rejected":
      return <Badge variant="danger" dot>Rejected</Badge>;
    case "completed":
      return <Badge variant="success" dot>Completed</Badge>;
    case "accepted":
      return <Badge variant="success" dot>Accepted</Badge>;
    case "active":
    case "started":
      return <Badge variant="warning" dot>Active</Badge>;
    case "full":
      return <Badge variant="primary" dot>Full</Badge>;
    case "pending":
      return <Badge variant="default" dot>Pending</Badge>;
    default:
      return <Badge variant="default" dot>{formatTitleCase(status)}</Badge>;
  }
};

const formatMinutes = (totalMinutes) => {
  if (totalMinutes === null || totalMinutes === undefined) return "—";
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const CarpoolRideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const isDev = location.pathname.startsWith("/dev");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rideData, setRideData] = useState(null);
  const [activeTab, setActiveTab] = usePersistentState(`carpool_${id}_tab`, "overview");
  const [copiedField, setCopiedField] = useState(null);

  const fetchRideDetail = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await api.getCarpoolRideById(id);
      setRideData(res.data);
      if (isManual) toast.success("Carpool details refreshed");
    } catch (error) {
      toast.error(error.message || "Failed to fetch carpool ride details.");
      if (!isManual) navigate(isDev ? "/dev" : "/carpool-rides");
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
          <UsersIcon className="w-5 h-5 text-[#61CB08] absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Loading carpool journey...</p>
      </div>
    );
  }

  if (!rideData || !rideData.carpoolDetails) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-2xl shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Carpool not found</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">
          The requested carpool ride could not be located.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(isDev ? "/dev" : "/carpool-rides")} className="mx-auto">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Carpool Rides
        </Button>
      </div>
    );
  }

  const { carpoolDetails: ride, carpoolBookingDetails: bookings = [] } = rideData;
  const { driver, startingPoint, destination, routes = [], vehicleDetails } = ride;

  const totalCompletedFare = (bookings || [])
    .filter((b) => b.status?.toLowerCase() === "completed")
    .reduce((sum, b) => sum + (b.fareCharged || 0), 0);

  const bookedSeats = ride.maxPassengers - ride.availableSeats;

  // Clean tabs without timeline map
  const tabsList = [
    { key: "overview", label: "Route Stops & Waypoints", icon: <Navigation className="w-3.5 h-3.5" /> },
    {
      key: "bookings",
      label: "Passenger Bookings",
      icon: <UsersIcon className="w-3.5 h-3.5" />,
      count: bookings?.length ?? 0,
    },
    { key: "driver", label: "Host Driver & Vehicle", icon: <Car className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* ── TOP NAV BAR & BREADCRUMBS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(isDev ? "/dev" : "/carpool-rides")}
            className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {isDev ? "Back to Dev Hub" : "Back to Carpool Rides"}
          </Button>
          <span className="text-gray-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase tracking-wider">
            Carpool Journey
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

      {/* ── CARPOOL HERO HEADER CARD ── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-purple-500/10 via-purple-500/5 to-transparent pointer-events-none rounded-tr-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Carpool Ride Details
              </h1>
            </div>

            {/* Clear, Explicitly-Labeled Status Badges */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#181d24] px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-[#1f242b]">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Carpool Status:</span>
                {statusBadge(ride.status)}
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#181d24] px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-[#1f242b]">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Seat Capacity:</span>
                <Badge variant="primary" className="text-[10px] font-semibold">
                  {ride.availableSeats} / {ride.maxPassengers} Seats Left
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#181d24] px-2.5 py-1 rounded-lg border border-gray-200/60 dark:border-[#1f242b]">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Booked Seats:</span>
                <span className="font-bold text-gray-900 dark:text-white text-xs">{bookedSeats} Booked</span>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => handleCopy(id, "Carpool ID")}
                className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-[#181d24] text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                title="Click to copy Carpool ID"
              >
                <span>ID: {id?.slice(0, 10)}...</span>
                {copiedField === "Carpool ID" ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 opacity-60" />
                )}
              </button>

              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Published: {formatDateTime(ride.createdAt)}</span>
              </div>

              {ride.graceTime && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Grace Window: {formatDateTime(ride.graceTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Pill */}
          <div className="flex items-center gap-4 lg:border-l lg:border-gray-100 dark:lg:border-[#1f242b] lg:pl-6">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Total Booked Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#61CB08] tracking-tight">
                {formatCurrency(totalCompletedFare || ride.fareCharged || 0)}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {bookings.filter((b) => b.status === "completed").length} Completed Bookings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Trip Earnings"
          value={formatCurrency(totalCompletedFare || ride.fareCharged || 0)}
          icon={<CircleDollarSign />}
          index={0}
          sparkline
        />
        <StatsCard
          title="Seats Booked"
          value={`${bookedSeats} / ${ride.maxPassengers}`}
          icon={<UsersIcon />}
          index={3}
          sparkline
        />
        <StatsCard
          title="Route Distance"
          value={ride.distance ? `${ride.distance.toFixed(2)} km` : "—"}
          icon={<Navigation />}
          index={1}
          sparkline
        />
        <StatsCard
          title="Estimated Time"
          value={formatMinutes(ride.avgTime)}
          icon={<Clock />}
          index={2}
          sparkline
        />
      </div>

      {/* ── SEGMENTED NAVIGATION TABS ── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] rounded-2xl p-4 sm:p-5 shadow-xs space-y-6">
        <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />

        {/* ── TAB CONTENT ── */}
        <div>
          {/* TAB 1: ROUTE STOPS & WAYPOINTS */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stops Trajectory Timeline */}
              <div className="lg:col-span-2 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#61CB08]" />
                    Multi-Stop Carpool Trajectory
                  </h3>
                  <Badge variant="default" className="text-[10px]">
                    {routes.length ? `${routes.length} Recorded Stops` : "Direct Carpool"}
                  </Badge>
                </div>

                {/* Trajectory Stops */}
                <div className="relative pl-6 space-y-6 before:absolute before:inset-y-3 before:left-[11px] before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500 before:to-rose-500">
                  {/* Origin */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#13161a] shadow-sm flex items-center justify-center" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Pickup Origin (Start Point)
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {startingPoint?.placeName || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Waypoints / Intermediate Stops */}
                  {routes &&
                    routes.slice(1, -1).map((stop, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-[#13161a] shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                            Intermediate Stop #{idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                            {stop?.placeName || "—"}
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* Destination */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-[#13161a] shadow-sm flex items-center justify-center" />
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                        Final Dropoff Destination
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {destination?.placeName || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Highlights & Capacity */}
              <div className="space-y-4">
                <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                    <Activity className="w-4 h-4 text-[#61CB08]" />
                    Journey Details
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Total Distance</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {ride.distance ? `${ride.distance.toFixed(2)} km` : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Estimated Duration</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMinutes(ride.avgTime)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Max Passenger Capacity</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {ride.maxPassengers} Seats
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Available Seats Left</span>
                      <span className="font-bold text-[#61CB08]">
                        {ride.availableSeats} Available
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 dark:text-slate-400">Published At</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {formatDateTime(ride.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASSENGER BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Passenger Bookings & Assigned Stops ({bookings?.length || 0})
                </h3>
              </div>

              {bookings && bookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map((booking) => {
                    const pName = fullName(booking.passenger);
                    return (
                      <div
                        key={booking._id}
                        className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-4 space-y-3.5"
                      >
                        {/* Header: Passenger & Fare */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-xs overflow-hidden border border-blue-500/30 shrink-0">
                              {booking.passenger?.profilePicture ? (
                                <img src={booking.passenger.profilePicture} alt={pName} className="w-full h-full object-cover" />
                              ) : (
                                getInitials(pName)
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {pName}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>{booking.passenger?.rating != null ? Number(booking.passenger.rating).toFixed(1) : "New"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-sm text-[#61CB08] block">
                              {formatCurrency(booking.fareCharged || 0)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {booking.requiredSeats || 1} seat(s)
                            </span>
                          </div>
                        </div>

                        {/* Route for this passenger */}
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                              Pickup Stop
                            </span>
                            <p className="text-gray-900 dark:text-white font-medium truncate" title={booking.pickupStop?.placeName}>
                              {booking.pickupStop?.placeName || "—"}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                              Dropoff Stop
                            </span>
                            <p className="text-gray-900 dark:text-white font-medium truncate" title={booking.dropOffStop?.placeName}>
                              {booking.dropOffStop?.placeName || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Explicitly-Labeled Status Badges */}
                        <div className="pt-3 border-t border-gray-200/60 dark:border-[#1f242b] flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 bg-white dark:bg-[#13161a] px-2 py-0.5 rounded border border-gray-200/60 dark:border-[#1f242b] text-[10px]">
                              <span className="text-gray-400 font-medium">Booking:</span>
                              {statusBadge(booking.status)}
                            </div>

                            <div className="flex items-center gap-1 bg-white dark:bg-[#13161a] px-2 py-0.5 rounded border border-gray-200/60 dark:border-[#1f242b] text-[10px]">
                              <span className="text-gray-400 font-medium">Payment:</span>
                              <span className="font-semibold capitalize text-gray-700 dark:text-slate-300">
                                {booking.paymentStatus || "Pending"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 bg-white dark:bg-[#13161a] px-2 py-0.5 rounded border border-gray-200/60 dark:border-[#1f242b] text-[10px]">
                              <span className="text-gray-400 font-medium">Method:</span>
                              <span className="capitalize text-gray-700 dark:text-slate-300">
                                {booking.paymentMethod?.replace(/_/g, " ") || "Card"}
                              </span>
                            </div>
                          </div>

                          {booking.passenger?._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/user-management/rider/${booking.passenger._id}`)}
                              className="text-[11px] text-[#61CB08] hover:text-[#52ad06] p-0 h-auto font-medium"
                            >
                              Profile <ExternalLink className="w-3 h-3 ml-0.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                  <UsersIcon className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">No passenger bookings yet</p>
                  <p className="text-[11px] text-gray-400">This carpool ride does not have any passenger bookings recorded.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOST DRIVER & VEHICLE */}
          {activeTab === "driver" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Host Driver Profile */}
              <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    Carpool Host Driver
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
                      <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold text-base overflow-hidden border border-purple-500/30 shrink-0">
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
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">No driver information available.</p>
                )}
              </div>

              {/* Vehicle Specifications */}
              <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#61CB08]" />
                    Vehicle Information
                  </h3>
                  <Badge variant="default" className="text-[10px] uppercase">
                    {ride?.driver?.vehicleDetails?.vehicleType || "Sedan"}
                  </Badge>
                </div>

                {ride?.driver?.vehicleDetails ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Make & Model</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {ride.driver.vehicleDetails.make} {ride.driver.vehicleDetails.model}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">License Plate</span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {ride.driver.vehicleDetails.licensePlateNumber}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Color & Year</span>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {ride.driver.vehicleDetails.color} • {ride.driver.vehicleDetails.yearOfManufacture}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 dark:text-slate-400">Vehicle Type</span>
                      <span className="font-semibold capitalize text-gray-900 dark:text-white">
                        {ride.driver.vehicleDetails.vehicleType}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">No vehicle details recorded.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarpoolRideDetail;
