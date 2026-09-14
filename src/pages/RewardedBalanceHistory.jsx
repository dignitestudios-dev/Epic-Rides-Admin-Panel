import React, { useRef, useEffect, useState } from "react";
import { Clock, Search, History, CheckCircle2, User, Coins, ShieldCheck, Mail, ArrowUpRight, ArrowDownRight } from "lucide-react";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import FilterBar from "../components/ui/FilterBar";
import Tabs from "../components/ui/Tabs";

import { formatDate, formatDateTime, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import useGetRewardedBalanceHistory from "../hooks/users/useGetRewardedBalanceHistory";
import useDebounce from "../hooks/global/useDebounce";
import { usePersistentState } from "../hooks/global/usePersistentState";

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

const fullName = (obj) => [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const RewardedBalanceHistory = () => {
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = usePersistentState("rewardedbalance_activeTab", "all");
  const [search, setSearch] = usePersistentState("rewardedbalance_search", "");
  const [page, setPage] = usePersistentState("rewardedbalance_page", 1);
  const [limit, setLimit] = usePersistentState("rewardedbalance_limit", 10);
  const [startDate, setStartDate] = usePersistentState("rewardedbalance_startDate", "");
  const [endDate, setEndDate] = usePersistentState("rewardedbalance_endDate", "");
  const [sortBy, setSortBy] = usePersistentState("rewardedbalance_sortBy", "createdAt");
  const [order, setOrder] = usePersistentState("rewardedbalance_order", "desc");

  const debouncedSearch = useDebounce(search, 500);

  const { history, loading, totalPages, totalData } = useGetRewardedBalanceHistory(
    page,
    limit,
    activeTab, // "all", "rider", "driver", "user"
    debouncedSearch,
    startDate,
    endDate,
    sortBy?.target?.value || sortBy,
    order?.target?.value || order
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, startDate, endDate, activeTab, sortBy, order]);

  const tabs = [
    { id: "all", label: "All Rewards" },
    { id: "driver", label: "Drivers Only" },
    { id: "rider", label: "Riders Only" },
  ];

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (_, row) => (
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {row.createdAt || row.date ? formatDateTime(row.createdAt || row.date) : "—"}
        </span>
      ),
    },
    {
      key: "user",
      label: "User / Driver",
      render: (val, row) => {
        const userData = row.user || row.driver || row.rider || val;
        const name = fullName(userData);
        const avatar = getAvatarColors(name);
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${avatar.bg} ${avatar.text} ${avatar.border}`}
            >
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userData?.email || (userData?.phone ? formatPhoneNumber(userData.phone) : "")}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "userType",
      label: "User Type",
      render: (val, row) => (
        <Badge
          variant={val === "driver" ? "primary" : val === "rider" ? "success" : "default"}
          dot
          className="capitalize text-[11px]"
        >
          {val || row.role || "User"}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val) => (
        <div className="flex items-center gap-1 font-semibold text-[#61CB08] text-sm">
          <ArrowUpRight className="w-4 h-4" />
          <span>${val != null ? Number(val).toFixed(2) : "0.00"}</span>
        </div>
      ),
    },
    {
      key: "admin",
      label: "Rewarded By",
      render: (val, row) => {
        const adminData = row.admin || val;
        const adminName = fullName(adminData) !== "—" ? fullName(adminData) : "Admin";
        return (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-gray-900 dark:text-gray-200 truncate">
                {adminName}
              </span>
              <span className="text-[11px] text-gray-400 truncate">
                {adminData?.email || ""}
              </span>
            </div>
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#61CB08]" />
            Rewarded Balance History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complete audit log of manual balance credits and promotional rewards distributed.
          </p>
        </div>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setPage(1);
        }}
      />

      <div className="bg-white dark:bg-[#13161a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242b]">
        <FilterBar
          searchable
          searchValue={search}
          searchPlaceholder="Search by name, email, phone..."
          onSearchChange={setSearch}
          filters={[
            {
              key: "startDate",
              label: "Start Date",
              type: "date",
              value: startDate,
              onChange: (val) => { setStartDate(val); setPage(1); },
            },
            {
              key: "endDate",
              label: "End Date",
              type: "date",
              value: endDate,
              onChange: (val) => { setEndDate(val); setPage(1); },
            },
            {
              key: "sortBy",
              label: "Sort By",
              type: "select",
              options: [
                { label: "Date Created", value: "createdAt" },
                { label: "Reward Date", value: "date" },
                { label: "Amount", value: "amount" },
              ],
              value: sortBy?.target?.value || sortBy,
              onChange: (val) => { setSortBy(val?.value || val); setPage(1); },
            },
            {
              key: "order",
              label: "Order",
              type: "select",
              options: [
                { label: "Descending", value: "desc" },
                { label: "Ascending", value: "asc" },
              ],
              value: order?.target?.value || order,
              onChange: (val) => { setOrder(val?.value || val); setPage(1); },
            },
          ]}
          onClear={() => {
            setSearch("");
            setStartDate("");
            setEndDate("");
            setSortBy("createdAt");
            setOrder("desc");
            setPage(1);
          }}
        />
      </div>

      <DataTable
        data={history}
        columns={columns}
        title="Reward Transactions"
        loading={loading}
        addButton={false}
        exportable={false}
        totalPages={totalPages}
        totalData={totalData}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
      />
    </div>
  );
};

export default RewardedBalanceHistory;
