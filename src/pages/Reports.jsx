import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, Users, Eye } from "lucide-react";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { api } from "../lib/services";
import toast from "react-hot-toast";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getReports(
        pagination.currentPage,
        pageSize,
        statusFilter,
        sortOrder
      );
      if (response.success) {
        setReports(response.data.results);
        setStats(response.data.stats);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
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
  }, [pagination.currentPage, pageSize, statusFilter, sortOrder]);

  const columns = [
    {
      key: "reporterName",
      label: "Reporter Name",
      render: (value, row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {value}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {row?.reporterType}
          </span>
        </div>
      ),
    },
    {
      key: "reportedPersonName",
      label: "Reported Person",
      render: (value, row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {value}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {row?.reportedPersonType}
          </span>
        </div>
      ),
    },
    {
      key: "reportReason",
      label: "Reason / Type",
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={value === "pending" ? "warning" : "success"}
          className="capitalize"
        >
          {value || "reported"}
        </Badge>
      ),
    },
    {
      key: "_id",
      label: "Actions",
      render: (value) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/reports-detail/${value}`)}
          icon={<Eye className="w-4 h-4" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  const mostReported = stats?.mostReportedEntities?.[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports Management
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reports Received"
          value={stats?.totalReportsReceived || 0}
          icon={<AlertTriangle />}
          index={0}
        />
        <StatsCard
          title="Pending Reports"
          value={stats?.pendingReports || 0}
          icon={<Clock />}
          index={1}
          colored
        />
        <StatsCard
          title="Resolved Reports"
          value={stats?.resolvedReports || 0}
          icon={<CheckCircle />}
          index={2}
          colored
        />
        <StatsCard
          title="Most Reported"
          value={mostReported ? mostReported.name : "N/A"}
          description={
            mostReported
              ? `${mostReported.reportCount} reports (${mostReported.type})`
              : "No reported entities"
          }
          icon={<Users />}
          index={3}
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-end gap-4 border border-gray-100 dark:border-gray-700">
        <div className="flex-1 max-w-xs">
          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All " },
              { value: "pending", label: "Pending" },
              { value: "resolved", label: "Resolved" },
            ]}
          />
        </div>
        <div className="flex-1 max-w-xs">
          <Select
            label="Sort by Date"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: "desc", label: "Newest First" },
              { value: "asc", label: "Oldest First" },
            ]}
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white p-6 dark:bg-gray-800 rounded-lg shadow-sm">
        <DataTable
          title="All Reports"
          columns={columns}
          data={reports}
          loading={loading}
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          totalData={pagination.total}
          onPageChange={(page) => setPagination({ ...pagination, currentPage: page })}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          addButton={false}
        />
      </div>
    </div>
  );
};

export default Reports;
