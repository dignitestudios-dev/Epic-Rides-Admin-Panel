import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import useGetDrivers from "../hooks/drivers/useGetDrivers";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import {
  CheckCircle,
  Clock,
  Download,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { downloadCSV, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

const AVATAR_PALETTE = [
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
];

const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f + l || "D";
};

const getAvatarStyle = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const DriverRequests = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { drivers, loading, totalPages, totalData } = useGetDrivers(
    page,
    limit,
    debouncedSearch,
    activeTab
  );

  const handleExport = () => {
    if (!drivers || drivers.length === 0) return;

    const dataToExport = drivers.map((driver) => ({
      ID: driver._id,
      Name: [driver.firstName, driver.lastName].filter(Boolean).join(" ") || "—",
      Email: driver.email,
      Phone: formatPhoneNumber(driver.phone) || "—",
      Status: driver.requiresApproval ? "Pending Review" : "Approved",
      Vehicles: driver.vehicleCount || 0,
      "Account Status": driver.isDeactivatedByAdmin ? "Deactivated" : "Active",
    }));

    downloadCSV(dataToExport, "driver_requests_export");
  };

  const tabs = [
    { key: "pending", label: "Pending Verification", count: totalData || 0 },
    { key: "approved", label: "Approved Drivers" },
  ];

  const columns = [
    {
      key: "firstName",
      label: "Driver",
      render: (_, row) => {
        const name = [row.firstName, row.lastName].filter(Boolean).join(" ") || "Driver";
        const initials = getInitials(row.firstName, row.lastName);
        const avatarStyle = getAvatarStyle(name);
        const subId = row._id ? `#DR-${row._id.slice(-4).toUpperCase()}` : "#DR-9021";

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
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-normal truncate block">
                {subId} · {row.city || "Florida, US"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (val) => (
        <span className="text-gray-600 dark:text-slate-300 font-mono text-xs truncate max-w-[200px] block">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone Number",
      render: (val) => (
        <span className="text-gray-600 dark:text-slate-300 font-mono text-xs">
          {formatPhoneNumber(val) || "—"}
        </span>
      ),
    },
    {
      key: "requiresApproval",
      label: "Status",
      render: (val) => (
        <Badge variant={val ? "warning" : "success"} dot>
          {val ? "Pending Review" : "Approved"}
        </Badge>
      ),
    },
    {
      key: "action",
      label: "",
      render: (_, row) => (
        <button
          onClick={() => navigate(`/driver/${row._id}`)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
          title="Review driver application & documents"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Driver Requests
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {totalData || 0} pending
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Review driver onboarding applications, identity records, and vehicle compliance
          </p>
        </div>
        {hasPermission("downloadExcel") && (
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExport}
          >
            Export Requests
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(t) => { setActiveTab(t); setPage(1); }} />

      {/* Data Table */}
      <DataTable
        title="Verification Queue"
        subtitle="Driver verification submissions requiring background and vehicle check"
        data={drivers}
        columns={columns}
        loading={loading}
        totalPages={totalPages}
        totalData={totalData}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setLimit(s);
          setPage(1);
        }}
        pageSize={limit}
        searchable
        searchTerm={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by driver name, email or phone..."
        addButton={false}
      />
    </div>
  );
};

export default DriverRequests;
