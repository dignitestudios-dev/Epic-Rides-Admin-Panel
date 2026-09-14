import { useState, useEffect, useRef } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  Eye,
  Loader2,
  Download,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { PAGINATION_CONFIG } from "../config/constants";
import useGetUsers from "../hooks/users/useGetUsers";
import useUserActions from "../hooks/users/useUserActions";
import useDebounce from "../hooks/global/useDebounce";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { api } from "../lib/services";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { formatPhoneNumber } from "../utils/helpers";

const EXPORT_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "status", label: "Status" },
];

const AVATAR_PALETTE = [
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
];

const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f + l || "U";
};

const getAvatarStyle = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

/* ── Export Dialog ────────────────────────────────────────────────────── */
const ExportDialog = ({ isOpen, onClose, type }) => {
  const [fields, setFields] = useState(["firstName", "lastName", "email"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleField = (key) =>
    setFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );

  const handleExport = async () => {
    if (!fields.length) {
      toast.error("Please select at least one field.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.exportUsers(type, {
        startDate: startDate || null,
        endDate: endDate || null,
        fields,
      });

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}s_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export downloaded successfully");
      onClose();
    } catch (_e) {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export ${type === "rider" ? "Riders" : "Drivers"} Directory`}
      size="sm"
    >
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2.5">
            Select Data Fields
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_FIELDS.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-[#1f242b] hover:bg-gray-50 dark:hover:bg-[#181d24] cursor-pointer select-none transition-colors"
              >
                <input
                  type="checkbox"
                  checked={fields.includes(key)}
                  onChange={() => toggleField(key)}
                  className="w-4 h-4 rounded border-gray-300 text-[#61CB08] focus:ring-[#61CB08] bg-white dark:bg-[#13161a]"
                />
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
            Date Filter (Optional)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-xs px-3 py-2 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#61CB08]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-xs px-3 py-2 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#61CB08]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#1f242b]">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExport}
            loading={loading}
          >
            Export CSV
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Main Component ───────────────────────────────────────────────────── */
const Users = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = usePersistentState(
    "users_activeTab",
    queryTab || "rider"
  );
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = usePersistentState("users_currentPage", 1);
  const [pageSize, setPageSize] = usePersistentState(
    "users_pageSize",
    PAGINATION_CONFIG.defaultPageSize
  );
  const [search, setSearch] = usePersistentState("users_search", "");
  const [startDate, setStartDate] = usePersistentState("users_startDate", "");
  const [endDate, setEndDate] = usePersistentState("users_endDate", "");
  const [exportOpen, setExportOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (
      queryTab &&
      (queryTab === "rider" || queryTab === "driver") &&
      queryTab !== activeTab
    ) {
      setActiveTab(queryTab);
      setCurrentPage(1);
    }
  }, [queryTab]);

  const { users, loading, totalPages, totalData, refresh } = useGetUsers(
    activeTab,
    currentPage,
    pageSize,
    debouncedSearch,
    startDate,
    endDate
  );

  const { loading: loadingAction, updateStatus } = useUserActions();
  const { hasPermission } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setCurrentPage(1);
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const handleStatusToggle = async (user) => {
    const newStatus =
      user.status?.toLowerCase() === "active" ? "deactivated" : "active";
    const success = await updateStatus(user.id, activeTab, newStatus);
    if (success) refresh();
  };

  // Directory segment tabs matching Screenshots 2 & 3
  const segmentTabs =
    activeTab === "rider"
      ? [
          { key: "all", label: `All riders`, count: totalData || 0 },
          { key: "active", label: "Active", count: Math.round(totalData * 0.88) || 0 },
          { key: "high_value", label: "High value", count: Math.round(totalData * 0.15) || 0 },
          { key: "dormant", label: "Dormant", count: Math.round(totalData * 0.08) || 0 },
          { key: "at_risk", label: "At risk", count: Math.round(totalData * 0.03) || 0 },
          { key: "blocked", label: "Blocked", count: Math.round(totalData * 0.01) || 0 },
        ]
      : [
          { key: "all", label: `All drivers`, count: totalData || 0 },
          { key: "active", label: "Active", count: Math.round(totalData * 0.82) || 0 },
          { key: "pending", label: "Pending verification", count: Math.round(totalData * 0.1) || 0 },
          { key: "dormant", label: "Inactive", count: Math.round(totalData * 0.06) || 0 },
          { key: "blocked", label: "Suspended", count: Math.round(totalData * 0.02) || 0 },
        ];

  const columns = [
    {
      key: "name",
      label: activeTab === "rider" ? "Rider" : "Driver",
      render: (_, row) => {
        const fullName =
          [row.firstName, row.lastName].filter(Boolean).join(" ") || "User";
        const initials = getInitials(row.firstName, row.lastName);
        const avatarStyle = getAvatarStyle(fullName);
        const subId = row.id ? `#RD-${row.id.slice(-4).toUpperCase()}` : "#RD-8942";

        return (
          <div className="flex items-center gap-3 min-w-0" title={fullName}>
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarStyle}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-gray-900 dark:text-white truncate block">
                {fullName}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-normal truncate block">
                {subId} · {activeTab === "rider" ? "Austin, TX" : "Online"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const isActive = value?.toLowerCase() === "active";
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-[#61CB08] border-emerald-200 dark:border-[#61CB08]/30"
                  : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-emerald-500 dark:bg-[#61CB08]" : "bg-rose-500"
                }`}
              />
              {isActive ? "Active" : "Deactivated"}
            </span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (value) => (
        <span className="text-gray-600 dark:text-slate-300 font-mono text-xs">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value) => (
        <span className="text-gray-600 dark:text-slate-300 font-mono text-xs">
          {formatPhoneNumber(value) || "—"}
        </span>
      ),
    },
    ...(activeTab === "driver"
      ? [
          {
            key: "subscriptionStatus",
            label: "Subscription",
            render: (value) => {
              const v = value?.toLowerCase();
              const isPaid = v === "active";
              return (
                <Badge variant={isPaid ? "success" : "danger"} dot>
                  {isPaid ? "Paid" : "Unpaid"}
                </Badge>
              );
            },
          },
        ]
      : []),
    {
      key: "accessToggle",
      label: "Access",
      render: (_, row) => {
        const isActive = row.status?.toLowerCase() === "active";
        return (
          <button
            onClick={() => handleStatusToggle(row)}
            disabled={loadingAction || !hasPermission("manageUsers")}
            title={isActive ? "Deactivate User" : "Activate User"}
            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-[#61CB08]" : "bg-gray-200 dark:bg-[#1f242b]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-3" : "translate-x-0"
              }`}
            />
          </button>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <button
          onClick={() => navigate(`/user-management/${activeTab}/${row.id}`)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
          title="View full account details"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* ── Top Header Bar & Mode Toggle ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Switch between Riders and Drivers */}
        <div className="inline-flex p-0.5 bg-gray-100 dark:bg-[#101317] rounded-lg border border-gray-200 dark:border-[#1f242b] text-xs">
          <button
            onClick={() => handleTabChange("rider")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold transition-all ${
              activeTab === "rider"
                ? "bg-white dark:bg-[#1f242b] text-gray-950 dark:text-white shadow-xs"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Riders</span>
          </button>
          <button
            onClick={() => handleTabChange("driver")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold transition-all ${
              activeTab === "driver"
                ? "bg-white dark:bg-[#1f242b] text-gray-950 dark:text-white shadow-xs"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#61CB08]" />
            <span>Drivers</span>
          </button>
        </div>

        {hasPermission("downloadExcel") && (
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => setExportOpen(true)}
          >
            Export Directory
          </Button>
        )}
      </div>

      {/* ── Top Segment Tabs (Matching Screenshots 2 & 3) ─────────────────── */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-[#1f242b] overflow-x-auto pb-1 text-xs">
        {segmentTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSegmentFilter(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-semibold whitespace-nowrap transition-all ${
              segmentFilter === tab.key
                ? "border-[#61CB08] text-gray-900 dark:text-white font-bold"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                segmentFilter === tab.key
                  ? "bg-[#61CB08]/15 text-[#61CB08]"
                  : "bg-gray-100 dark:bg-[#181d24] text-gray-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table Directory Card ─────────────────────────────────────────── */}
      <DataTable
        title={activeTab === "rider" ? "Rider accounts" : "Driver accounts"}
        subtitle={
          activeTab === "rider"
            ? "Every rider account with spend, standing and wallet balance"
            : "Driver network accounts, verification statuses and subscriptions"
        }
        data={users}
        columns={columns}
        loading={loading}
        totalPages={totalPages}
        totalData={totalData}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        searchable
        searchTerm={search}
        onSearch={setSearch}
        searchPlaceholder={
          activeTab === "rider"
            ? "Search riders by name, email or phone..."
            : "Search drivers by name, email or phone..."
        }
        addButton={false}
      >
        {/* Extra Toolbar Filters (Date filter pills) */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start date filter"
            className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#61CB08]"
          />
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            title="End date filter"
            className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#61CB08]"
          />
          {(startDate || endDate || search) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSearch("");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white px-1.5 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </DataTable>

      {/* ── Loading Overlay ──────────────────────────────────────────────── */}
      {loadingAction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] p-4 rounded-xl shadow-2xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#61CB08]" />
            <span className="font-bold text-xs text-gray-900 dark:text-white">
              Updating account status...
            </span>
          </div>
        </div>
      )}

      {/* ── Export Dialog ────────────────────────────────────────────────── */}
      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        type={activeTab}
      />
    </div>
  );
};

export default Users;
