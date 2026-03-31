import { useState, useEffect } from "react";
import { Users as UsersIcon, UserCheck, Eye, Loader2, Download } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { formatDate, downloadCSV } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useGetUsers from "../hooks/users/useGetUsers";
import useUserActions from "../hooks/users/useUserActions";
import useDebounce from "../hooks/global/useDebounce";
import { useNavigate } from "react-router-dom";
import FilterBar from "../components/ui/FilterBar";

const Users = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rider"); // 'rider' or 'driver'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { users, loading, totalPages, totalData, refresh } = useGetUsers(
    activeTab,
    currentPage,
    pageSize,
    debouncedSearch,
    startDate,
    endDate
  );

  const { loading: loadingAction, updateStatus } = useUserActions();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
  };

  // Reset page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status?.toLowerCase() === "active" ? "deactivated" : "active";
    const success = await updateStatus(user.id, activeTab, newStatus);
    if (success) {
      refresh();
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {value?.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value) => <span className="text-gray-600">{value || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Badge variant={value?.toLowerCase() === "active" ? "success" : "danger"}>
            {value}
          </Badge>
          <button
            onClick={() => handleStatusToggle(row)}
            disabled={loadingAction}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              value?.toLowerCase() === "active" ? "bg-[#39A300]" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                value?.toLowerCase() === "active" ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/user-management/${activeTab}/${row.id}`)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    if (!users || users.length === 0) return;
    
    const dataToExport = users.map(user => ({
      ID: user._id || user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phoneNumber || user.phone || "—",
      Status: user.status,
      Registered: formatDate(user.createdAt)
    }));

    downloadCSV(dataToExport, `${activeTab}s_export`);
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your riders and drivers across the platform
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange("rider")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "rider"
              ? "text-[#39A300] border-b-2 border-[#39A300]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <UsersIcon className="w-4 h-4" />
            Riders
          </div>
        </button>
        <button
          onClick={() => handleTabChange("driver")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "driver"
              ? "text-[#39A300] border-b-2 border-[#39A300]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <UserCheck className="w-4 h-4" />
            Drivers
          </div>
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          searchable
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, email or phone..."
          filters={[
            {
              key: "startDate",
              label: "Start Date",
              type: "date",
              value: startDate,
              onChange: setStartDate,
            },
            {
              key: "endDate",
              label: "End Date",
              type: "date",
              value: endDate,
              onChange: setEndDate,
            },
          ]}
          onClear={() => {
            setSearch("");
            setStartDate("");
            setEndDate("");
          }}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          title={activeTab === "rider" ? "Riders List" : "Drivers List"}
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
          addButton={false}
        />
      </Card>

      {loadingAction && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#39A300]" />
            <span className="font-medium text-gray-700">Updating status...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
