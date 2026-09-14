import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, Users, ArrowRight } from "lucide-react";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import { api } from "../lib/services";
import toast from "react-hot-toast";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { formatDate } from "../utils/helpers";

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
  return f + l || "R";
};

const getAvatarStyle = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = usePersistentState("reports_statusFilter", "");
  const [pageSize, setPageSize] = usePersistentState("reports_pageSize", 10);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getReports(
        pagination.currentPage,
        pageSize,
        statusFilter
      );
      if (response.success) {
        setReports(response.data?.results || []);
        setStats(response.data?.stats || null);
        setPagination({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          total: response.pagination?.total || 0,
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pagination.currentPage, pageSize, statusFilter]);

  const tabs = [
    { key: "", label: "All Incidents", count: stats?.totalReportsReceived ?? pagination.total },
    { key: "pending", label: "Pending Investigation", count: stats?.pendingReports ?? 0 },
    { key: "resolved", label: "Resolved", count: stats?.resolvedReports ?? 0 },
  ];

  const columns = [
    {
      key: "reporterName",
      label: "Reporter",
      render: (_, row) => {
        const name = `${row?.reporterFirstName || ""} ${row?.reporterLastName || ""}`.trim() || "Anonymous";
        const initials = getInitials(row?.reporterFirstName, row?.reporterLastName);
        const avatarStyle = getAvatarStyle(name);

        return (
          <div className="flex items-center gap-3 min-w-0" title={name}>
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarStyle}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-gray-900 dark:text-white truncate block">
                {name}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-normal capitalize truncate block">
                {row?.reporterType || "Rider"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "reportedPersonName",
      label: "Reported Subject",
      render: (_, row) => {
        const name = `${row?.reportedPersonFirstName || ""} ${row?.reportedPersonLastName || ""}`.trim() || "N/A";
        return (
          <div className="min-w-0">
            <span className="font-semibold text-xs text-gray-900 dark:text-white truncate block">
              {name}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-normal capitalize truncate block">
              {row?.reportedPersonType || "Driver"}
            </span>
          </div>
        );
      },
    },
    {
      key: "reportReason",
      label: "Reason / Category",
      render: (value) => (
        <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
          {value || "Dispute / Complaint"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Report Date",
      render: (value) => (
        <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Resolution Status",
      render: (value) => (
        <Badge
          variant={value === "pending" ? "warning" : "success"}
          dot
          className="capitalize"
        >
          {value === "pending" ? "Under Review" : value || "Resolved"}
        </Badge>
      ),
    },
    {
      key: "_id",
      label: "",
      render: (value) => (
        <button
          onClick={() => navigate(`/reports-detail/${value}`)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
          title="Investigate report details"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const mostReported = stats?.mostReportedEntities?.[0];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Reports &amp; Safety Incidents
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              {stats?.pendingReports ?? 0} open
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Investigate rider disputes, driver misconduct, fare discrepancies and safety logs
          </p>
        </div>
      </div>

      {/* Stats Cards (Real API metrics only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reports Received"
          value={stats?.totalReportsReceived != null ? stats.totalReportsReceived.toString() : (pagination.total || 0).toString()}
          icon={<AlertTriangle className="w-4 h-4" />}
          index={0}
        />
        <StatsCard
          title="Pending Investigation"
          value={stats?.pendingReports != null ? stats.pendingReports.toString() : "0"}
          change={stats?.pendingReports > 0 ? `${stats.pendingReports} Action required` : "Cleared"}
          changeType={stats?.pendingReports > 0 ? "negative" : "positive"}
          icon={<Clock className="w-4 h-4" />}
          index={1}
        />
        <StatsCard
          title="Resolved Reports"
          value={stats?.resolvedReports != null ? stats.resolvedReports.toString() : "0"}
          change="Completed"
          changeType="positive"
          icon={<CheckCircle className="w-4 h-4" />}
          index={2}
        />
        <StatsCard
          title="Most Reported"
          value={mostReported ? `${mostReported.firstName || ""} ${mostReported.lastName || ""}`.trim() || "N/A" : "None"}
          targetLabel={mostReported ? `${mostReported.reportCount} complaints (${mostReported.type})` : "Zero repeat offenders"}
          icon={<Users className="w-4 h-4" />}
          index={3}
        />
      </div>

      {/* Standard Segment Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={statusFilter}
        onChange={(tab) => {
          setStatusFilter(tab);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
      />

      {/* Reports Table */}
      <DataTable
        title="Incident Directory"
        subtitle="Chronological list of reported disputes and resolution statuses"
        columns={columns}
        data={reports}
        loading={loading}
        totalPages={pagination.totalPages}
        currentPage={pagination.currentPage}
        totalData={pagination.total}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        addButton={false}
      />
    </div>
  );
};

export default Reports;
