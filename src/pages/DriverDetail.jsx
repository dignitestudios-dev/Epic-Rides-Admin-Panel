import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  MapPin,
  Car,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  History,
  ExternalLink,
  AlertTriangle,
  Hash,
  TrendingUp,
  Wallet,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Fuel,
  Users as UsersIcon,
  Award,
  CircleDollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
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
  formatPhoneNumber,
  maskEmail,
  maskPhone,
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

const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { details, loading, refresh } = useGetUserDetails(id, "driver");

  const [activeTab, setActiveTab] = usePersistentState(`driver_${id}_tab`, "overview");
  const [copiedField, setCopiedField] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [subHistoryLoading, setSubHistoryLoading] = useState(false);
  const [subPage, setSubPage] = usePersistentState(`driver_${id}_subPage`, 1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subTotal, setSubTotal] = useState(0);
  const SUB_LIMIT = 10;

  React.useEffect(() => {
    if (!id) return;
    setSubHistoryLoading(true);
    api
      .getDriverTransactions(id, subPage, SUB_LIMIT)
      .then((res) => {
        setSubscriptionHistory(res?.data?.transactions || []);
        setSubTotalPages(res?.data?.pagination?.totalPages || 1);
        setSubTotal(res?.data?.totalTransactions ?? 0);
      })
      .catch(() => setSubscriptionHistory([]))
      .finally(() => setSubHistoryLoading(false));
  }, [id, subPage]);

  const editInitialData = useMemo(
    () => ({
      firstName: details?.fullDetails?.firstName || details?.personalInfo?.firstName || "",
      lastName: details?.fullDetails?.lastName || details?.personalInfo?.lastName || "",
      email: details?.personalInfo?.email || details?.fullDetails?.email || "",
      subscriptionStatus: details?.fullDetails?.subscriptionStatus || details?.subscriptionStatus || "",
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
      const response = await api.deleteUser(id, "driver");
      handleSuccess(response?.message, "Driver deleted successfully");
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
          <Car className="w-5 h-5 text-[#61CB08] absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Loading driver profile...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-2xl shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Driver not found</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">
          The requested driver could not be located or has already been removed.
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
    vehicleDetails = {},
    approvedDocuments = {},
    rideHistory = [],
    ratingAndFeedback = {},
    subscriptionStatus = "Inactive",
    walletBalance = 0,
    rewardedBalance = null,
    revenue = {},
    referralInfo = {},
    carpoolHistory = [],
    activityLogs = {},
    transactionHistory = [],
  } = details;

  const fullName = [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") || "Unnamed Driver";
  const avatar = getAvatarColors(fullName);
  const isActive = personalInfo?.status?.toLowerCase() === "active";
  const isSubActive = subscriptionStatus?.toLowerCase() === "active";
  const ratingValue = ratingAndFeedback?.rating != null ? Number(ratingAndFeedback.rating).toFixed(2) : "0.00";
  const reviewsCount = ratingAndFeedback?.reviewsCount || ratingAndFeedback?.recentReviews?.length || 0;

  // Tabs configuration
  const tabsList = [
    { key: "overview", label: "Overview & Specs", icon: <Layers className="w-3.5 h-3.5" /> },
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
      label: "Ledger & Subscriptions",
      icon: <Wallet className="w-3.5 h-3.5" />,
      count: (transactionHistory?.length ?? 0) + (subTotal > 0 ? 1 : 0),
    },
    {
      key: "documents",
      label: "Verification Documents",
      icon: <FileText className="w-3.5 h-3.5" />,
      count: Object.keys(approvedDocuments || {}).length,
    },
    {
      key: "reviews",
      label: "Reviews & Feedback",
      icon: <Star className="w-3.5 h-3.5" />,
      count: reviewsCount,
    },
    {
      key: "referrals",
      label: "Referrals",
      icon: <Award className="w-3.5 h-3.5" />,
      count: referralInfo?.totalReferrals || referralInfo?.referrals?.length || 0,
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
      key: "user",
      label: "Rider",
      render: (user) => {
        const rName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Rider";
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0">
              {getInitials(rName)}
            </div>
            <span className="font-medium text-gray-900 dark:text-white truncate">{rName}</span>
          </div>
        );
      },
    },
    {
      key: "pickupPoint",
      label: "Pickup Location",
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
      label: "Drop-off Location",
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
      label: "Driver Earnings",
      render: (val) => (
        <span className="font-bold text-gray-900 dark:text-white text-xs">
          {formatCurrency(val || 0)}
        </span>
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
      render: (val) => (
        <span className="font-bold text-gray-900 dark:text-white text-xs">
          {formatCurrency(val || 0)}
        </span>
      ),
    },
    {
      key: "status",
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
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-[#61CB08] border border-[#61CB08]/20 uppercase tracking-wider">
            Driver Partner
          </span>
          <span className="text-gray-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate max-w-[180px]">
            {fullName}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link to={`/driver/${id}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 dark:border-[#1f242b] hover:border-[#61CB08] text-xs font-medium"
              icon={<ShieldCheck className="w-3.5 h-3.5 text-[#61CB08]" />}
            >
              Document Verification Hub
            </Button>
          </Link>

          {hasPermission("manageUsers") && (
            <>
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
                Delete Driver
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── PROFILE HERO HEADER CARD ── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative gradient glow behind header */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#61CB08]/10 via-[#61CB08]/5 to-transparent pointer-events-none rounded-tr-2xl" />

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
              {/* Online / Active Badge Dot */}
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
                  {personalInfo?.status || "Unknown"}
                </Badge>
                <Badge
                  variant={isSubActive ? "primary" : "default"}
                  className="text-[11px] font-semibold px-2 py-0.5"
                >
                  Sub: {subscriptionStatus || "Inactive"}
                </Badge>
              </div>

              {/* ID & Rating Row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCopy(id, "Driver ID")}
                  className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#181d24] text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                  title="Click to copy ID"
                >
                  <Hash className="w-3 h-3 text-gray-400" />
                  {id?.slice(0, 10)}...
                  {copiedField === "Driver ID" ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400 opacity-60" />
                  )}
                </button>

                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{ratingValue}</span>
                  <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
                    ({reviewsCount} reviews)
                  </span>
                </div>

                {vehicleDetails?.make && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-[#181d24] px-2 py-0.5 rounded border border-gray-200/50 dark:border-[#1f242b]">
                    <Car className="w-3.5 h-3.5 text-[#61CB08]" />
                    <span>
                      {vehicleDetails.make} {vehicleDetails.model} ({vehicleDetails.yearOfManufacture || vehicleDetails.year || "—"})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact & Meta Row */}
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
              <span>Joined: {formatDate(details?.activityLogs?.accountCreationDate || details?.fullDetails?.createdAt)}</span>
            </div>

            {(personalInfo?.address || details?.fullDetails?.address) && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{personalInfo?.address || details?.fullDetails?.address}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Last Login: {formatDate(details?.activityLogs?.lastLogin)}</span>
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
        {rewardedBalance != null ? (
          <StatsCard
            title="Rewarded Balance"
            value={formatCurrency(rewardedBalance || 0)}
            icon={<CircleDollarSign />}
            index={1}
            sparkline
          />
        ) : (
          <StatsCard
            title="Admin Commission (3%)"
            value={formatCurrency(revenue?.adminCommission || 0)}
            icon={<TrendingUp />}
            index={1}
            sparkline
          />
        )}
        <StatsCard
          title="Completed Rides"
          value={rideStats?.totalCompleted || 0}
          icon={<Car />}
          index={2}
          sparkline
        />
        <StatsCard
          title="Cancelled Rides"
          value={rideStats?.totalCancelled || 0}
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
          {/* TAB 1: OVERVIEW & SPECS */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Specifications Card */}
              <div className="lg:col-span-1 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#61CB08]" />
                    Vehicle Specifications
                  </h3>
                  <Badge variant="default" className="text-[10px] uppercase font-mono">
                    {vehicleDetails?.vehicleType || "Standard"}
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                    <span className="text-gray-500 dark:text-slate-400">Make & Model</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {vehicleDetails?.make || "—"} {vehicleDetails?.model || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                    <span className="text-gray-500 dark:text-slate-400">Model Year</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicleDetails?.yearOfManufacture || vehicleDetails?.year || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                    <span className="text-gray-500 dark:text-slate-400">License Plate</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {vehicleDetails?.licensePlateNumber || vehicleDetails?.plateNumber || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-[#1f242b]">
                    <span className="text-gray-500 dark:text-slate-400">Exterior Color</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: (vehicleDetails?.color || "gray").toLowerCase() }}
                      />
                      {vehicleDetails?.color || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-slate-400">Seating Capacity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicleDetails?.seatingCapacity || "4"} Seats
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Checklist & Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Document Verification Snapshot */}
                <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#61CB08]" />
                      Document Compliance Checklist
                    </h3>
                    <Link
                      to={`/driver/${id}`}
                      className="text-xs font-semibold text-[#61CB08] hover:underline flex items-center gap-1"
                    >
                      Open Verification Hub
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(approvedDocuments || {}).length > 0 ? (
                      Object.entries(approvedDocuments || {}).map(([key, doc], idx) => {
                        const isApp = doc?.status === "approved";
                        const isRej = doc?.status === "rejected";
                        return (
                          <div
                            key={idx}
                            className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b] flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-white capitalize truncate">
                                {key.replace(/_/g, " ")}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                Status: <span className="font-semibold capitalize">{doc?.status || "pending"}</span>
                              </p>
                            </div>
                            {isApp ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : isRej ? (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-400 py-3 col-span-2 text-center">
                        No verification documents registered yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Activity & Engagement Summary */}
                <div className="bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200/60 dark:border-[#1f242b]">
                    <Clock className="w-4 h-4 text-[#61CB08]" />
                    Activity & Engagement Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400 block mb-1">Account Created</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(details?.activityLogs?.accountCreationDate || details?.fullDetails?.createdAt)}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400 block mb-1">Last Trip Taken</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(details?.activityLogs?.lastRideTaken)}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#13161a] rounded-lg border border-gray-200/70 dark:border-[#1f242b]">
                      <span className="text-gray-500 dark:text-slate-400 block mb-1">Last System Login</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(details?.activityLogs?.lastLogin)}
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
                  <p className="text-[11px] text-gray-400">This driver has not taken any on-demand private trips yet.</p>
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
                  <p className="text-[11px] text-gray-400">This driver has not published or completed any carpool journeys.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WALLET & SUBSCRIPTION LEDGER */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              {/* Wallet Transactions Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Wallet Transaction Ledger</span>
                  <span className="text-xs font-normal text-gray-400">
                    Current Balance: {formatCurrency(walletBalance || 0)}
                  </span>
                </h3>

                {details?.transactionHistory && details.transactionHistory.length > 0 ? (
                  <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                    <Table
                      data={details.transactionHistory}
                      columns={[
                        {
                          key: "createdAt",
                          label: "Date & Time",
                          render: (val, row) => (
                            <span className="font-mono text-[11px]">{formatDate(val || row.date)}</span>
                          ),
                        },
                        {
                          key: "description",
                          label: "Description",
                          render: (val) => <span className="text-xs font-medium">{val || "—"}</span>,
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
                            const isCredit = row.type === "credit";
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
                  <p className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                    No wallet transactions recorded.
                  </p>
                )}
              </div>

              {/* Driver Subscription Payments History */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#1f242b]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Driver Subscription Payments ({subTotal})
                  </h3>
                  <Badge variant={isSubActive ? "success" : "danger"} dot className="text-[10px]">
                    Current Status: {subscriptionStatus || "Inactive"}
                  </Badge>
                </div>

                {subHistoryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#61CB08]" />
                  </div>
                ) : subscriptionHistory.length > 0 ? (
                  <>
                    <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                      <Table
                        data={subscriptionHistory}
                        columns={[
                          {
                            key: "createdAt",
                            label: "Date",
                            render: (val) => <span className="font-mono text-[11px]">{formatDate(val)}</span>,
                          },
                          {
                            key: "amount",
                            label: "Amount Paid",
                            render: (val) => <span className="font-bold text-xs">{formatCurrency(val ?? 0)}</span>,
                          },
                          {
                            key: "purpose",
                            label: "Purpose",
                            render: (val) => (
                              <span className="capitalize text-xs text-gray-700 dark:text-slate-300">
                                {val?.replace(/_/g, " ") || "—"}
                              </span>
                            ),
                          },
                          {
                            key: "status",
                            label: "Status",
                            render: (val) => (
                              <Badge
                                variant={val?.toLowerCase() === "success" ? "success" : "danger"}
                                dot
                                className="capitalize text-[10px]"
                              >
                                {val}
                              </Badge>
                            ),
                          },
                          {
                            key: "isActivationTransaction",
                            label: "Billing Type",
                            render: (val) => (
                              <Badge variant={val ? "primary" : "default"} className="text-[10px]">
                                {val ? "Initial Activation" : "Recurring Renewal"}
                              </Badge>
                            ),
                          },
                        ]}
                      />
                    </div>

                    {subTotalPages > 1 && (
                      <div className="flex items-center justify-end gap-1 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={subPage === 1 || subHistoryLoading}
                          onClick={() => setSubPage((p) => p - 1)}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        {Array.from({ length: subTotalPages }, (_, i) => i + 1).map((p) => (
                          <Button
                            key={p}
                            variant={subPage === p ? "primary" : "outline"}
                            size="sm"
                            disabled={subHistoryLoading}
                            onClick={() => setSubPage(p)}
                          >
                            {p}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={subPage === subTotalPages || subHistoryLoading}
                          onClick={() => setSubPage((p) => p + 1)}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                    No subscription payments found.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: VERIFICATION DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Compliance & Regulatory Documents ({Object.keys(approvedDocuments || {}).length})
                </h3>
                <Link to={`/driver/${id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Document Inspector
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(approvedDocuments || {}).map(([key, doc], idx) => {
                  const isApp = doc?.status === "approved";
                  const isRej = doc?.status === "rejected";
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50/70 dark:bg-[#181d24]/60 border border-gray-200/80 dark:border-[#1f242b] rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#61CB08]/15 text-[#61CB08] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white capitalize">
                              {key.replace(/_/g, " ")}
                            </h4>
                            <p className="text-[10px] text-gray-400">Driver Document</p>
                          </div>
                        </div>

                        <Badge
                          variant={isApp ? "success" : isRej ? "danger" : "warning"}
                          dot
                          className="capitalize text-[10px]"
                        >
                          {doc?.status || "Pending"}
                        </Badge>
                      </div>

                      {doc?.url && (
                        <div className="pt-2 border-t border-gray-200/60 dark:border-[#1f242b]">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-[#61CB08] hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Attached File
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS & FEEDBACK */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Rating Overview Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-2xl font-bold">
                    ★
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{ratingValue} / 5.00</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Based on {reviewsCount} total verified customer reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {ratingAndFeedback?.recentReviews && ratingAndFeedback.recentReviews.length > 0 ? (
                  ratingAndFeedback.recentReviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50/70 dark:bg-[#181d24]/60 rounded-xl border border-gray-200/80 dark:border-[#1f242b] space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {review.reviewerType === "User" ? "Verified Rider" : "Driver"}
                        </span>
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{review.stars}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                        {review.description || "No written comment provided."}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">{formatDate(review.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-8 text-center border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                    No customer reviews recorded for this driver yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REFERRALS */}
          {activeTab === "referrals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Referral Network ({referralInfo?.totalReferrals || 0})
                </h3>
              </div>

              {referralInfo?.referrals && referralInfo.referrals.length > 0 ? (
                <div className="border border-gray-200/80 dark:border-[#1f242b] rounded-xl overflow-hidden">
                  <Table
                    data={referralInfo.referrals}
                    columns={[
                      {
                        key: "firstName",
                        label: "Referred Driver Name",
                        render: (_, row) => (
                          <span className="font-semibold text-gray-900 dark:text-white text-xs">
                            {[row.firstName, row.lastName].filter(Boolean).join(" ") || "N/A"}
                          </span>
                        ),
                      },
                      {
                        key: "id",
                        label: "Action",
                        render: (val) => (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#61CB08] hover:text-[#52ad06] font-semibold text-xs"
                            onClick={() => navigate(`/user-management/driver/${val}`)}
                          >
                            View Profile
                          </Button>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-[#1f242b] rounded-xl">
                  <Award className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">No driver referrals yet</p>
                  <p className="text-[11px] text-gray-400">This driver has not referred any new drivers to the platform.</p>
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
        type="driver"
        initialData={editInitialData}
        onSuccess={refresh}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Driver Account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Are you sure you want to delete this driver?
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                This action is permanent and cannot be undone. All fleet records, verification documents, and ride history associated with this driver will be removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#1f242b]">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Yes, Delete Driver
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DriverDetail;
