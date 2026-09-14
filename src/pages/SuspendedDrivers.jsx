import React, { useState, useRef, useEffect } from "react";
import { UserX, ShieldOff, Clock, RotateCcw, AlertTriangle, List, ArrowRight } from "lucide-react";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Tabs from "../components/ui/Tabs";

import { formatDateTime } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import useGetSuspendedDrivers from "../hooks/users/useGetSuspendedDrivers";
import useDebounce from "../hooks/global/useDebounce";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { api } from "../lib/services";
import toast from "react-hot-toast";

const fullName = (obj) => [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const AVATAR_PALETTE = [
  "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
];

const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f + l || "D";
};

const typeBadge = (type) => {
  switch (type) {
    case "cancellation":
      return <Badge variant="warning" dot>Auto (Cancellations)</Badge>;
    case "admin_manual":
      return <Badge variant="danger" dot>Admin (Timed)</Badge>;
    case "admin_permanent":
      return <Badge variant="danger" dot>Permanent</Badge>;
    default:
      return <Badge variant="default" dot>{type || "—"}</Badge>;
  }
};

const formatRemainingTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "Indefinite";
  if (seconds <= 0) return "Expired";

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  
  return parts.join(" ") || "< 1m";
};

const SuspensionDetailDialog = ({ selectedData, onClose, onRefresh }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [confirmUnsuspend, setConfirmUnsuspend] = useState(false);

  useEffect(() => {
    if (selectedData?.driverId) {
      fetchDetails();
    }
  }, [selectedData]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getDriverSuspensionDetails(selectedData.driverId);
      setDetails(res.data);
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = () => {
    setConfirmUnsuspend(true);
  };

  const confirmUnsuspendAction = async () => {
    setUnsuspendLoading(true);
    try {
      await api.unsuspendDriver(selectedData.driverId);
      toast.success("Driver unsuspended successfully");
      onRefresh();
      setConfirmUnsuspend(false);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to unsuspend driver");
    } finally {
      setUnsuspendLoading(false);
    }
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-[#1f242b] last:border-0 text-xs">
      <span className="text-gray-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white text-right break-words max-w-[65%]">
        {value ?? "—"}
      </span>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={!!selectedData}
        onClose={onClose}
        title="Suspension Record Details"
        size="md"
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Loading suspension details...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 dark:border-[#1f242b] p-3 bg-gray-50/50 dark:bg-[#101317]">
              <Row label="Driver Name" value={details?.driverName || fullName(selectedData?.driver)} />
              <Row label="Driver Email" value={details?.driverEmail || selectedData?.driver?.email} />
              <Row label="Suspension Type" value={typeBadge(details?.suspensionType || selectedData?.suspensionType)} />
              <Row label="Reason" value={details?.reason || selectedData?.reason} />
              <Row label="Time Remaining" value={formatRemainingTime(details?.remainingSeconds ?? selectedData?.remainingSeconds)} />
              <Row label="Suspended At" value={formatDateTime(details?.suspendedAt || selectedData?.suspendedAt)} />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-[#1f242b]">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleUnsuspend}
                disabled={unsuspendLoading}
              >
                Unsuspend Driver
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={confirmUnsuspend}
        onClose={() => setConfirmUnsuspend(false)}
        title="Confirm Unsuspend"
        size="sm"
      >
        <p className="text-xs text-gray-600 dark:text-slate-300 mb-5">
          Are you sure you want to lift the suspension for this driver? Their platform access will be restored immediately.
        </p>
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={() => setConfirmUnsuspend(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            loading={unsuspendLoading}
            onClick={confirmUnsuspendAction}
          >
            Confirm Unsuspend
          </Button>
        </div>
      </Modal>
    </>
  );
};

const SuspendedDrivers = () => {
  const [activeTab, setActiveTab] = usePersistentState("suspended_drivers_activeTab", "all");
  const [search, setSearch] = usePersistentState("suspended_drivers_search", "");
  const [page, setPage] = usePersistentState("suspended_drivers_page", 1);
  const [limit, setLimit] = usePersistentState("suspended_drivers_limit", 10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [confirmUnsuspend, setConfirmUnsuspend] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const { drivers, loading, totalPages, totalData, refresh } = useGetSuspendedDrivers(
    page,
    limit,
    debouncedSearch,
    activeTab
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleUnsuspendQuick = (driverId) => {
    setConfirmUnsuspend(driverId);
  };

  const confirmUnsuspendAction = async () => {
    if (!confirmUnsuspend) return;
    setUnsuspendLoading(true);
    try {
      await api.unsuspendDriver(confirmUnsuspend);
      toast.success("Driver unsuspended successfully");
      refresh();
      setConfirmUnsuspend(null);
    } catch (err) {
      toast.error(err.message || "Failed to unsuspend driver");
    } finally {
      setUnsuspendLoading(false);
    }
  };

  const tabs = [
    { key: "all", label: "All Suspensions", count: totalData || 0 },
    { key: "cancellation", label: "Auto (Cancellations)" },
    { key: "admin_permanent", label: "Permanent" },
  ];

  const columns = [
    {
      key: "driver",
      label: "Driver",
      render: (val) => {
        const name = fullName(val);
        const initials = getInitials(val?.firstName, val?.lastName);

        return (
          <div className="flex items-center gap-3 min-w-0" title={name}>
            <div className="w-7 h-7 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center font-bold text-[11px] text-rose-400 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-gray-900 dark:text-white truncate block">
                {name}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-mono truncate block">
                {val?.email || "—"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "suspensionType",
      label: "Type",
      render: (val) => typeBadge(val),
    },
    {
      key: "reason",
      label: "Reason",
      render: (val) => (
        <span className="text-xs text-gray-700 dark:text-slate-300 max-w-[200px] truncate block" title={val}>
          {val === "admin_deactivated" ? "Deactivated by Admin" : val === "ride_cancellations" ? "Ride Cancelled" : (val || "—")}
        </span>
      ),
    },
    {
      key: "remainingSeconds",
      label: "Time Left",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          {formatRemainingTime(val)}
        </div>
      ),
    },
    {
      key: "suspendedAt",
      label: "Suspended Date",
      render: (val) => (
        <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
          {val ? formatDateTime(val) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleUnsuspendQuick(row.driverId)}
            disabled={unsuspendLoading}
            className="px-2 py-1 rounded-md text-xs font-semibold text-emerald-600 dark:text-[#61CB08] hover:bg-emerald-50 dark:hover:bg-[#181d24] transition-colors"
            title="Unsuspend driver"
          >
            Unsuspend
          </button>
          <button
            onClick={() => setSelectedRecord(row)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
            title="View full suspension details"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Suspended Drivers
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              {totalData || 0} suspended
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Monitor cancellation infractions, safety suspensions, and reinstate driver access
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* Data Table */}
      <DataTable
        title="Suspended Accounts"
        subtitle="Active and permanent driver suspension records"
        data={drivers}
        columns={columns}
        loading={loading || unsuspendLoading}
        searchable
        searchTerm={search}
        onSearch={setSearch}
        searchPlaceholder="Search by driver name or email..."
        addButton={false}
        exportable={false}
        totalPages={totalPages}
        totalData={totalData}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
      />

      {/* Detail Dialog */}
      <SuspensionDetailDialog
        selectedData={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onRefresh={refresh}
      />

      {/* Unsuspend Confirmation Modal */}
      <Modal
        isOpen={!!confirmUnsuspend}
        onClose={() => setConfirmUnsuspend(null)}
        title="Confirm Unsuspend"
        size="sm"
      >
        <p className="text-xs text-gray-600 dark:text-slate-300 mb-5">
          Are you sure you want to unsuspend this driver? Their platform access will be restored immediately.
        </p>
        <div className="flex justify-end gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmUnsuspend(null)}
            disabled={unsuspendLoading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            loading={unsuspendLoading}
            disabled={unsuspendLoading}
            onClick={confirmUnsuspendAction}
          >
            Yes, Unsuspend
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SuspendedDrivers;
