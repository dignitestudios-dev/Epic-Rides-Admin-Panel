import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  MapPin,
  Hash,
  Wallet,
  TrendingUp,
  XCircle,
  Pencil,
  Trash2,
  Car,
  Users as UsersIcon,
  CircleDollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  Award,
  MessageSquare,
  Sparkles,
  Cake,
  CheckCircle2,
} from "lucide-react";
import useGetUserDetails from "../hooks/users/useGetUserDetails";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import StatsCard from "../components/common/StatsCard";
import Tabs from "../components/ui/Tabs";
import Table from "../components/ui/Table";
import {
  formatDate,
  handleError,
  handleSuccess,
  maskEmail,
  maskPhone,
  formatPhoneNumber,
  formatCurrency,
} from "../utils/helpers";
import EditProfileModal from "../components/common/EditProfileModal";
import { api } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";
import { usePersistentState } from "../hooks/global/usePersistentState";
import toast from "react-hot-toast";

const AVATAR_PALETTE = [
  { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30" },
  { bg: "bg-blue-500/15", text: "text-blue-500", border: "border-blue-500/30" },
  { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30" },
  { bg: "bg-purple-500/15", text: "text-purple-500", border: "border-purple-500/30" },
  { bg: "bg-rose-500/15", text: "text-rose-500", border: "border-rose-500/30" },
  { bg: "bg-cyan-500/15", text: "text-cyan-500", border: "border-cyan-500/30" },
];

function getAvatarColors(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] || "?").slice(0, 2).toUpperCase();
}

const RiderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { details, loading, refresh } = useGetUserDetails(id, "rider");

  const [activeTab, setActiveTab] = usePersistentState(`rider_${id}_tab`, "overview");
  const [copiedField, setCopiedField] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const editInitialData = useMemo(
    () => ({
      firstName: details?.fullDetails?.firstName || details?.personalInfo?.firstName || "",
      lastName: details?.fullDetails?.lastName || details?.personalInfo?.lastName || "",
      email: details?.personalInfo?.email || details?.fullDetails?.email || "",
      subscriptionStatus: details?.fullDetails?.subscriptionStatus || "",
      balance: 0,
    }),
    [details]
  );

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await api.deleteUser(id, "rider");
      handleSuccess(response?.message, "Rider deleted successfully");
      setDeleteModalOpen(false);
      navigate("/user-management");
    } catch (error) {
      handleError(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#61CB08]/20 border-t-[#61CB08] animate-spin" />
          <User className="w-5 h-5 text-[#61CB08] absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Loading rider profile...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-2xl shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rider not found</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">
          The requested rider could not be located or has already been removed.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate("/user-management")} className="mx-auto">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Users Directory
        </Button>
      </div>
    );
  }

  const {
    personalInfo = {},
    rideStats = {},
    rideHistory = [],
    activityLogs = {},
    transactionHistory = [],
    walletBalance = 0,
    rewardedBalance = null,
    carpoolHistory = [],
    fullDetails = {},
  } = details;

  const fullName = [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") || "Unnamed Rider";
  const avatar = getAvatarColors(fullName);
  const isActive = personalInfo?.status?.toLowerCase() === "active" || (!fullDetails?.isDeactivatedByAdmin && !fullDetails?.isDeleted);

  // Rating & Review Counts from response
  const rawRating = details?.averageRating ?? fullDetails?.rating;
  const ratingValue = rawRating != null && !isNaN(parseFloat(rawRating)) ? parseFloat(rawRating).toFixed(2) : "0.00";
  const reviewsReceived = fullDetails?.reviewsReceived ?? 0;
  const reviewsGiven = fullDetails?.reviewsGiven ?? 0;

  // Tabs configuration (No reviews tab, rating is on main page)
  const tabsList = [
    { key: "overview", label: "Overview & Activity", icon: <Layers className="w-3.5 h-3.5" /> },
    {
      key: "rides",
      label: "Private Rides",
      icon: <Car className="w-3.5 h-3.5" />,
      count: rideHistory?.length ?? 0,
    },
    {
      key: "carpool",
      label: "Carpool Rides",
      icon: <UsersIcon className="w-3.5 h-3.5" />,
      count: carpoolHistory?.length ?? 0,
    },
    {
      key: "wallet",
      label: "Transaction Ledger",
      icon: <Wallet className="w-3.5 h-3.5" />,
      count: transactionHistory?.length ?? 0,
    },
  ];

  // Private Rides Table Columns
  const privateRideColumns = [
    {
      key: "createdAt",
      label: "Date & Time",
      render: (val) => (
        <span className="font-mono text-[11px] text-gray-700 dark:text-slate-300">
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: "driver",
      label: "Assigned Driver",
      render: (driver) => {
        const dName = [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "Driver";
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-[#61CB08] flex items-center justify-center text-[10px] font-bold shrink-0">
              {getInitials(dName)}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-gray-900 dark:text-white truncate block">{dName}</span>
              {driver?.vehicleDetails?.make && (
                <span className="text-[10px] text-gray-400 truncate block">
                  {driver.vehicleDetails.make} {driver.vehicleDetails.model}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "pickupPoint",
      label: "Pickup Point",
      render: (point) => (
        <div className="flex items-center gap-1.5 min-w-0" title={point?.placeName || "N/A"}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-xs text-gray-700 dark:text-slate-300 truncate max-w-[180px]">
            {point?.placeName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "dropOffPointRequested",
      label: "Drop-off Point",
      render: (point) => (
        <div className="flex items-center gap-1.5 min-w-0" title={point?.placeName || "N/A"}>
          <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className="text-xs text-gray-700 dark:text-slate-300 truncate max-w-[180px]">
            {point?.placeName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "rideFare",
      label: "Fare",
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white text-xs block">
            {formatCurrency(val || row.driverFare || 0)}
          </span>
          {row.rideType && (
            <span className="text-[10px] text-gray-400 capitalize">{row.rideType}</span>
          )}
        </div>
      ),
    },
    {
      key: "rideStatus",
      label: "Status",
      render: (val) => {
        const st = (val || "").toLowerCase();
        const variant =
          st === "completed" ? "success" : st === "cancelled" || st === "rejected" ? "danger" : "warning";
        return (
          <Badge variant={variant} dot className="capitalize text-[10px] font-semibold">
            {val || "Unknown"}
          </Badge>
        );
      },
    },
  ];

  // Carpool Table Columns
  const carpoolColumns = [
    {
      key: "createdAt",
      label: "Date & Time",
      render: (val) => (
        <span className="font-mono text-[11px] text-gray-700 dark:text-slate-300">
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: "driver",
      label: "Carpool Host",
      render: (driver) => {
        const dName = [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "Host";
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center text-[10px] font-bold shrink-0">
              {getInitials(dName)}
            </div>
            <span className="font-medium text-gray-900 dark:text-white truncate">{dName}</span>
          </div>
        );
      },
    },
    {
      key: "startingPoint",
      label: "Pickup",
      render: (point) => (
        <div className="flex items-center gap-1.5 min-w-0" title={point?.placeName || "N/A"}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-xs text-gray-700 dark:text-slate-300 truncate max-w-[180px]">
            {point?.placeName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "destination",
      label: "Drop-off",
      render: (point) => (
        <div className="flex items-center gap-1.5 min-w-0" title={point?.placeName || "N/A"}>
          <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className="text-xs text-gray-700 dark:text-slate-300 truncate max-w-[180px]">
            {point?.placeName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "fareCharged",
      label: "Fare Charged",
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white text-xs block">
            {formatCurrency(val || row.booking?.driverFare || 0)}
          </span>
          <span className="text-[10px] text-gray-400">
            {row.requiredSeats || row.booking?.requiredSeats || 1} Seat(s)
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val, row) => {
        const st = (val || row.booking?.status || "").toLowerCase();
        const variant =
          st === "completed" ? "success" : st === "cancelled" || st === "rejected" ? "danger" : "warning";
        return (
          <Badge variant={variant} dot className="capitalize text-[10px] font-semibold">
            {st || "Unknown"}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* ── TOP NAV BAR & BREADCRUMBS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/user-management")}
            className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Users Directory
          </Button>
          <span className="text-gray-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
            Rider Passenger
          </span>
          <span className="text-gray-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate max-w-[180px]">
            {fullName}
          </span>
        </div>

        {/* Action Buttons */}
        {hasPermission("manageUsers") && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="border-gray-200 dark:border-[#1f242b] text-xs font-medium"
              icon={<Pencil className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="text-xs font-medium"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Rider
            </Button>
          </div>
        )}
      </div>

      {/* ── PROFILE HERO HEADER CARD ── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-blue-500/10 via-blue-500/5 to-transparent pointer-events-none rounded-tr-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Main Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#13161a] shadow-md">
                {personalInfo?.profilePicture ? (
                  <img
                    src={personalInfo.profilePicture}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "";
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center font-bold text-xl sm:text-2xl ${avatar.bg} ${avatar.text}`}
                  >
                    {getInitials(fullName)}
                  </div>
                )}
              </div>
              {/* Active status indicator */}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#13161a] ${
                  isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
                title={isActive ? "Active Account" : "Inactive / Suspended"}
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {fullName}
                </h1>
                <Badge
                  variant={isActive ? "success" : "danger"}
                  dot
                  className="text-[11px] font-semibold px-2 py-0.5"
                >
                  {personalInfo?.status || (isActive ? "Active" : "Inactive")}
                </Badge>
              </div>

              {/* ID, Rating & Review Counts Row */}
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCopy(id, "Rider ID")}
                  className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#181d24] text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                  title="Click to copy ID"
                >
                  <Hash className="w-3 h-3 text-gray-400" />
                  {id?.slice(0, 10)}...
                  {copiedField === "Rider ID" ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400 opacity-60" />
                  )}
                </button>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{ratingValue} Rating</span>
                </div>

                {/* Reviews Received & Given Badge */}
                <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[11px] font-medium border border-blue-500/20">
                  <MessageSquare className="w-3 h-3 text-blue-500" />
                  <span>{reviewsReceived} Received</span>
                  <span>•</span>
                  <span>{reviewsGiven} Given</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact & Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 lg:pt-0 lg:border-l lg:border-gray-100 dark:lg:border-[#1f242b] lg:pl-6 text-xs text-gray-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate" title={personalInfo.email}>
                {hasPermission("seeSensitiveData") ? personalInfo.email : maskEmail(personalInfo.email)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-mono">
                {hasPermission("seeSensitiveData")
                  ? formatPhoneNumber(personalInfo.phone || personalInfo.phoneNumber) || "—"
                  : maskPhone(personalInfo.phone || personalInfo.phoneNumber)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Joined: {formatDate(fullDetails?.createdAt || details?.activityLogs?.accountCreationDate)}</span>
            </div>

            {(personalInfo?.address || fullDetails?.address) && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">
                  {personalInfo?.address || fullDetails?.address}
                  {(personalInfo?.city || personalInfo?.state) && ` (${[personalInfo.city, personalInfo.state].filter(Boolean).join(", ")})`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Last Login: {formatDate(activityLogs?.lastLogin)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Wallet Balance"
          value={formatCurrency(walletBalance || 0)}
          icon={<Wallet />}
          index={0}
          sparkline
        />
        <StatsCard
          title="Average Rating"
          value={`${ratingValue} ★`}
          icon={<Star />}
          index={2}
          sparkline
        />
        <StatsCard
          title="Completed Rides"
          value={rideStats?.totalCompleted ?? 0}
          icon={<Car />}
          index={1}
          sparkline
        />
        <StatsCard
          title="Cancelled Rides"
          value={rideStats?.totalCancelled ?? 0}
          icon={<XCircle />}
          index={5}
          sparkline
        />
      </div>

      {/* ── SEGMENTED NAVIGATION TABS ── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] rounded-2xl p-4 sm:p-5 shadow-xs space-y-6">
        <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />

        {/* ── TAB CONTENT ── */}
        <div>
          {/* TAB 1: OVERVIEW & ACTIVITY */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Rating & Reviews Metrics Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Rating Score Card */}
                <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-2xl font-bold shrink-0">
                    ★
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Overall Rating
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {ratingValue} <span className="text-sm font-normal text-gray-400">/ 5.00</span>
                    </h3>
                  </div>
                </div>

                {/* Reviews Received Metric */}
                <div className="p-5 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
                      Reviews Received
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reviewsReceived}
                    </h3>
                    <p className="text-[11px] text-gray-400">Feedback received from drivers</p>
                  </div>
                </div>

                {/* Reviews Given Metric */}
                <div className="p-5 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-[#61CB08] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
                      Reviews Given
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reviewsGiven}
                    </h3>
                    <p className="text-[11px] text-gray-400">Feedback submitted for drivers</p>
                  </div>
                </div>
              </div>

              {/* Passenger Info & Detailed Ride Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account & Profile Summary */}
                <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                    <User className="w-4 h-4 text-[#61CB08]" />
                    Passenger Profile Details
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Full Name</span>
                      <span className="font-bold text-gray-900 dark:text-white">{fullName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Email Address</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {hasPermission("seeSensitiveData") ? personalInfo.email : maskEmail(personalInfo.email)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Phone Number</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {hasPermission("seeSensitiveData")
                          ? formatPhoneNumber(personalInfo.phone || personalInfo.phoneNumber) || "—"
                          : maskPhone(personalInfo.phone || personalInfo.phoneNumber)}
                      </span>
                    </div>

                    {(personalInfo?.city || personalInfo?.state) && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                        <span className="text-gray-500 dark:text-slate-400">Location / Region</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {[personalInfo.city, personalInfo.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    {fullDetails?.dob && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                        <span className="text-gray-500 dark:text-slate-400">Date of Birth</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(fullDetails.dob)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400">Account Status</span>
                      <Badge variant={isActive ? "success" : "danger"} dot className="text-[10px]">
                        {personalInfo?.status || (isActive ? "Active" : "Inactive")}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 dark:text-slate-400">Registered Since</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(fullDetails?.createdAt || details?.activityLogs?.accountCreationDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ride Stats Breakdown & Timeline Card */}
                <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                    <Car className="w-4 h-4 text-[#61CB08]" />
                    Ride Activity & Trip Breakdown
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400 block mb-0.5">Regular Rides Done</span>
                      <span className="font-bold text-[#61CB08] text-lg">
                        {rideStats?.regularRidesCompleted ?? 0}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        ({rideStats?.regularRidesCancelled ?? 0} cancelled)
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400 block mb-0.5">Carpools Done</span>
                      <span className="font-bold text-purple-500 text-lg">
                        {rideStats?.carpoolsCompleted ?? 0}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        ({rideStats?.carpoolsCancelled ?? 0} cancelled)
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400 block mb-0.5">Last Trip Taken</span>
                      <span className="font-bold text-gray-900 dark:text-white block truncate">
                        {activityLogs?.lastRideTaken ? formatDate(activityLogs.lastRideTaken) : "No trips recorded"}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400 block mb-0.5">Last System Login</span>
                      <span className="font-bold text-gray-900 dark:text-white block truncate">
                        {activityLogs?.lastLogin ? formatDate(activityLogs.lastLogin) : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVATE RIDES */}
          {activeTab === "rides" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Private Ride History ({rideHistory?.length || 0})
                </h3>
              </div>

              {rideHistory && rideHistory.length > 0 ? (
                <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                  <Table data={rideHistory} columns={privateRideColumns} />
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                  <Car className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">No private rides recorded</p>
                  <p className="text-[11px] text-gray-400">This rider has not booked any on-demand private trips yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CARPOOL RIDES */}
          {activeTab === "carpool" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Carpool Ride History ({carpoolHistory?.length || 0})
                </h3>
              </div>

              {carpoolHistory && carpoolHistory.length > 0 ? (
                <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                  <Table data={carpoolHistory} columns={carpoolColumns} />
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                  <UsersIcon className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">No carpool rides recorded</p>
                  <p className="text-[11px] text-gray-400">This rider has not booked or joined any carpool routes yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRANSACTION HISTORY */}
          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Wallet Transactions Ledger ({transactionHistory?.length || 0})
                </h3>
                <span className="text-xs text-gray-500 font-normal">
                  Current Balance: {formatCurrency(walletBalance || 0)}
                </span>
              </div>

              {transactionHistory && transactionHistory.length > 0 ? (
                <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                  <Table
                    data={transactionHistory}
                    columns={[
                      {
                        key: "date",
                        label: "Date & Time",
                        render: (val, row) => (
                          <span className="font-mono text-[11px]">{formatDate(val || row.createdAt)}</span>
                        ),
                      },
                      {
                        key: "description",
                        label: "Description",
                        render: (val) => <span className="text-xs font-medium">{val || "Ride Payment"}</span>,
                      },
                      {
                        key: "status",
                        label: "Status",
                        render: (val) => {
                          const st = (val || "").toLowerCase();
                          const variant = st === "success" ? "success" : st === "failed" ? "danger" : "warning";
                          return (
                            <Badge variant={variant} dot className="capitalize text-[10px]">
                              {val || "N/A"}
                            </Badge>
                          );
                        },
                      },
                      {
                        key: "amount",
                        label: "Amount",
                        render: (val, row) => {
                          const isCredit = (row.type || "").toLowerCase() === "credit";
                          return (
                            <span
                              className={`font-bold text-xs flex items-center gap-0.5 ${
                                isCredit ? "text-[#61CB08]" : "text-rose-500"
                              }`}
                            >
                              {isCredit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {isCredit ? "+" : "-"}
                              {formatCurrency(Math.abs(val || 0))}
                            </span>
                          );
                        },
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                  <Wallet className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">No transactions recorded</p>
                  <p className="text-[11px] text-gray-400">No payment top-ups or ride debits found in wallet ledger.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ACTION MODALS ── */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={id}
        type="rider"
        initialData={editInitialData}
        onSuccess={refresh}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Rider Account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Are you sure you want to delete this rider?
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                This action is permanent and cannot be undone. All ride history, wallet balances, and passenger data will be removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#1f242b]">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Yes, Delete Rider
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RiderDetail;
