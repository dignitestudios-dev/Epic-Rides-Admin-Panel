import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowDownCircle,
  TrendingUp,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import DataTable from "../components/common/DataTable";
import FilterBar from "../components/ui/FilterBar";
import StatsCard from "../components/common/StatsCard";

import { formatDate, downloadCSV, formatCurrency } from "../utils/helpers";
import useGetSubscriptionRevenue from "../hooks/revenue/useGetSubscriptionRevenue";
import useGetWithdrawalRevenue from "../hooks/revenue/useGetWithdrawalRevenue";
import useDebounce from "../hooks/global/useDebounce";
import { useAuth } from "../contexts/AuthContext";

const AVATAR_PALETTE = [
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
];

const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f + l || "D";
};

const getAvatarStyle = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

/* =========================
   DATE HELPERS
========================= */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

const isValidRange = (start, end) => start && end;

/* =========================
   COMPONENT
========================= */
const Revenue = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("subscription");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* =========================
     SEPARATE FILTER STATES
  ========================= */

  const [subFilters, setSubFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const [withFilters, setWithFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  const subSearch = useDebounce(subFilters.search, 500);
  const withSearch = useDebounce(withFilters.search, 500);

  /* =========================
     TAB CHANGE
  ========================= */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  /* =========================
     DATE VALIDATION (CRITICAL FIX)
  ========================= */

  const subDateFrom = isValidRange(subFilters.startDate, subFilters.endDate)
    ? startOfDay(subFilters.startDate)
    : null;

  const subDateTo = isValidRange(subFilters.startDate, subFilters.endDate)
    ? endOfDay(subFilters.endDate)
    : null;

  const withDateFrom = isValidRange(withFilters.startDate, withFilters.endDate)
    ? startOfDay(withFilters.startDate)
    : null;

  const withDateTo = isValidRange(withFilters.startDate, withFilters.endDate)
    ? endOfDay(withFilters.endDate)
    : null;

  /* =========================
     API CALLS
  ========================= */

  const {
    data: subData,
    stats: subStats,
    loading: subLoading,
    totalPages: subTotalPages,
    totalData: subTotalData,
  } = useGetSubscriptionRevenue(
    currentPage,
    pageSize,
    subSearch,
    subDateFrom,
    subDateTo,
    subFilters.status?.target?.value
  );

  const {
    data: withData,
    stats: withStats,
    loading: withLoading,
    totalPages: withTotalPages,
    totalData: withTotalData,
  } = useGetWithdrawalRevenue(
    currentPage,
    pageSize,
    withSearch,
    withDateFrom,
    withDateTo
  );

  /* =========================
     UPDATE FILTERS
  ========================= */

  const updateSub = (key, value) => {
    setSubFilters((p) => ({ ...p, [key]: value }));
    setCurrentPage(1);
  };

  const updateWith = (key, value) => {
    setWithFilters((p) => ({ ...p, [key]: value }));
    setCurrentPage(1);
  };

  /* =========================
     EXPORT
  ========================= */

  const handleExport = () => {
    if (activeTab === "subscription") {
      if (!subData?.length) return;

      const formatted = subData.map((i) => ({
        "Driver Name": i.driverName,
        Email: i.email,
        Status: i.subscriptionStatus,
        "Purchase Date": formatDate(i.purchaseDate),
        "Expiry Date": formatDate(i.expiryDate),
        Amount: `$${Number(i.amount || 0).toFixed(2)}`,
      }));

      downloadCSV(formatted, "subscription_revenue");
    } else {
      if (!withData?.length) return;

      const formatted = withData.map((i) => ({
        "Driver Name": i.driverName,
        "Withdrawal Amount": `$${Number(i.withdrawalAmount || 0).toFixed(2)}`,
        Date: formatDate(i.date),
        "Admin Commission": `$${Number(i.adminCommission || 0).toFixed(2)}`,
      }));

      downloadCSV(formatted, "withdrawal_commission");
    }
  };

  /* =========================
     UI DATA SWITCH
  ========================= */

  const tableData = activeTab === "subscription" ? subData : withData;
  const loading = activeTab === "subscription" ? subLoading : withLoading;
  const totalPages =
    activeTab === "subscription" ? subTotalPages : withTotalPages;
  const totalData =
    activeTab === "subscription" ? subTotalData : withTotalData;

  /* =========================
     COLUMNS
  ========================= */

  const subColumns = [
    {
      key: "driverFirstName",
      label: "Driver Name",
      render: (_, row) => {
        const name = [row.driverFirstName, row.driverLastName].filter(Boolean).join(" ") || "—";
        const initials = getInitials(row.driverFirstName, row.driverLastName);
        const avatarStyle = getAvatarStyle(name);
        return (
          <div className="flex items-center gap-3 min-w-0" title={name}>
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarStyle}`}
            >
              {initials}
            </div>
            <button
              onClick={() => navigate(`/user-management/driver/${row.driverId}`)}
              className="text-[#61CB08] hover:underline font-bold text-xs truncate text-left"
            >
              {name}
            </button>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (v) => (
        <span className="text-gray-600 dark:text-slate-300 font-mono text-xs">
          {v || "—"}
        </span>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Subscription Status",
      render: (v) => (
        <Badge className="capitalize" variant={v === "active" ? "success" : "danger"} dot>
          {v}
        </Badge>
      ),
    },
    {
      key: "purchaseDate",
      label: "Purchase Date",
      render: (v) => (
        <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
          {formatDate(v)}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (v) => (
        <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
          {formatDate(v)}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v) => (
        <span className="text-xs font-bold text-gray-900 dark:text-white">
          {formatCurrency(v || 0)}
        </span>
      ),
    },
  ];

  const withColumns = [
    {
      key: "driverFirstName",
      label: "Driver Name",
      render: (_, row) => {
        const name = [row.driverFirstName, row.driverLastName].filter(Boolean).join(" ") || "—";
        const initials = getInitials(row.driverFirstName, row.driverLastName);
        const avatarStyle = getAvatarStyle(name);
        return (
          <div className="flex items-center gap-3 min-w-0" title={name}>
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarStyle}`}
            >
              {initials}
            </div>
            <button
              onClick={() => navigate(`/user-management/driver/${row.driverId}`)}
              className="text-[#61CB08] hover:underline font-bold text-xs truncate text-left"
            >
              {name}
            </button>
          </div>
        );
      },
    },
    {
      key: "withdrawalAmount",
      label: "Withdrawal Amount",
      render: (v) => (
        <span className="text-xs font-bold text-gray-900 dark:text-white">
          {formatCurrency(v || 0)}
        </span>
      ),
    },
    {
      key: "adminCommission",
      label: "Admin Commission",
      render: (v) => (
        <span className="text-xs font-bold text-[#61CB08]">
          {formatCurrency(v || 0)}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (v) => (
        <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
          {formatDate(v)}
        </span>
      ),
    },
  ];

  /* =========================
     UI
  ========================= */

  /* =========================
     DATE RANGE DESCRIPTION
  ========================= */
  const getDayRangeDesc = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (days < 0) return null;
    return `Last ${days} day${days !== 1 ? "s" : ""} (${startDate} – ${endDate})`;
  };

  const subDateDesc = getDayRangeDesc(subFilters.startDate, subFilters.endDate);
  const withDateDesc = getDayRangeDesc(withFilters.startDate, withFilters.endDate);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Revenue Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
              Fiscal Ops
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Monitor driver subscriptions, card processing fees, and financial ledger
          </p>
        </div>
        {hasPermission('downloadExcel') && (
          <Button
            variant="secondary"
            icon={<Download className="w-3.5 h-3.5" />}
            size="sm"
            onClick={handleExport}
          >
            Export Ledger
          </Button>
        )}
      </div>

      {/* ── SEGMENTED TABS ───────────────────────────────────────────────── */}
      <Tabs
        tabs={[
          { key: "subscription", label: "Subscription Revenue", count: subTotalData },
          { key: "withdrawal", label: "Withdrawals & Commission", count: withTotalData },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ── STATS CARDS ──────────────────────────────────────────────────── */}
      {activeTab === "subscription" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Subscriptions"
            value={subStats?.totalSubscriptionsPurchased ?? "—"}
            description={subDateDesc || "All time active subscriptions"}
            icon={<CreditCard className="w-4 h-4" />}
            index={0}
          />
          <StatsCard
            title="Active Subscriptions"
            value={subStats?.totalActiveSubscriptions ?? "—"}
            description={subDateDesc || "Currently active tiers"}
            icon={<CheckCircle className="w-4 h-4" />}
            index={1}
          />
          <StatsCard
            title="Expired Subscriptions"
            value={subStats?.totalExpiredSubscriptions ?? "—"}
            description={subDateDesc || "Needs renewal"}
            icon={<XCircle className="w-4 h-4" />}
            index={2}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(subStats?.totalRevenue ?? 0)}
            description={subDateDesc || "Gross subscription yield"}
            icon={<DollarSign className="w-4 h-4" />}
            index={3}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Total Withdrawals Processed"
            value={withStats?.totalWithdrawalsProcessed ?? "—"}
            description={withDateDesc || "Completed driver payouts"}
            icon={<ArrowDownCircle className="w-4 h-4" />}
            index={0}
          />
          <StatsCard
            title="Total Fee Commission"
            value={formatCurrency(withStats?.totalCommissionRevenue ?? 0)}
            description={withDateDesc || "Admin commission captured"}
            icon={<TrendingUp className="w-4 h-4" />}
            index={1}
          />
        </div>
      )}

      {/* ── FILTERS ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-4">
        {activeTab === "subscription" ? (
          <FilterBar
            searchable
            searchValue={subFilters.search}
            onSearchChange={(v) => updateSub("search", v)}
            searchPlaceholder="Search by driver name or email..."
            filters={[
              {
                key: "startDate",
                label: "Start Date",
                type: "date",
                value: subFilters.startDate,
                onChange: (v) => updateSub("startDate", v),
              },
              {
                key: "endDate",
                label: "End Date",
                type: "date",
                value: subFilters.endDate,
                onChange: (v) => updateSub("endDate", v),
              },
              {
                key: "status",
                label: "Status",
                type: "select",
                value: subFilters.status?.target?.value,
                onChange: (v) => updateSub("status", v),
                options: [
                  { value: "active", label: "Active" },
                  { value: "expired", label: "Expired" },
                ],
              },
            ]}
            onClear={() =>
              setSubFilters({
                search: "",
                startDate: "",
                endDate: "",
                status: "",
              })
            }
          />
        ) : (
          <FilterBar
            searchable
            searchValue={withFilters.search}
            onSearchChange={(v) => updateWith("search", v)}
            searchPlaceholder="Search driver withdrawals..."
            filters={[
              {
                key: "startDate",
                label: "Start Date",
                type: "date",
                value: withFilters.startDate,
                onChange: (v) => updateWith("startDate", v),
              },
              {
                key: "endDate",
                label: "End Date",
                type: "date",
                value: withFilters.endDate,
                onChange: (v) => updateWith("endDate", v),
              },
            ]}
            onClear={() =>
              setWithFilters({
                search: "",
                startDate: "",
                endDate: "",
              })
            }
          />
        )}
      </div>

      {/* ── TABLE ────────────────────────────────────────────────────────── */}
      <DataTable
        title={activeTab === "subscription" ? "Subscription Ledger" : "Withdrawal Records"}
        subtitle={activeTab === "subscription" ? "Monthly & tier subscription payment ledger" : "Driver withdrawal requests & admin commission"}
        data={tableData}
        columns={activeTab === "subscription" ? subColumns : withColumns}
        loading={loading}
        totalPages={totalPages}
        totalData={totalData}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        addButton={false}
      />
    </div>
  );
};

export default Revenue;