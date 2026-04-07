import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import useGetDrivers from "../hooks/drivers/useGetDrivers";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import FilterBar from "../components/ui/FilterBar";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Download, 
  Eye, 
  AlertCircle
} from "lucide-react";
import { downloadCSV, formatDate } from "../utils/helpers";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
];

const DriverRequests = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("");
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
    statusFilter?.target?.value
  );

  const handleExport = () => {
    if (!drivers || drivers.length === 0) return;
    
    const dataToExport = drivers.map(driver => ({
      ID: driver._id,
      Name: driver.name,
      Email: driver.email,
      Phone: driver.phone || "—",
      "Registration Date": formatDate(driver.createdAt),
      Status: driver.requiresApproval ? "Pending" : "Approved",
      Vehicles: driver.vehicleCount || 0,
      "Account Status": driver.isDeactivatedByAdmin ? "Deactivated" : "Active"
    }));

    downloadCSV(dataToExport, "driver_requests_export");
  };

  const getStatusBadge = (status) => {
    console.log(status)
    switch (status) {
      case true:
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case false:
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {status || "Pending"}
          </Badge>
        );
    }
  };

  const columns = [
    {
      key: "name",
      label: "Driver Name",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
            {row.name?.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-gray-900 dark:text-white capitalize truncate max-w-[200px]">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (val) => <span className="text-gray-600 truncate max-w-[220px] block">{val}</span>,
    },
    {
      key: "phone",
      label: "Phone Number",
      render: (val) => <span className="text-gray-600">{val || "—"}</span>,
    },
    // {
    //   key: "createdAt",
    //   label: "Registration Date",
    //   render: (val) => <span className="text-gray-600">{formatDate(val)}</span>,
    // },
    {
      key: "requiresApproval",
      label: "Current Status",
      render: (val) => {
      console.log(val)  
        return(
        <div className="flex items-center gap-3">
          {getStatusBadge(val)}
        </div>
      )},
    },
    {
      key: "action",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/driver/${row._id}`)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage driver registration requests and document verification.
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

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          searchable
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search by name, email or phone..."
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              options: statuses,
              value: statusFilter?.target?.value,
              onChange: (val) => {
                setStatusFilter(val);
                setPage(1);
              },
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatusFilter("");
            setPage(1);
          }}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable 
          title="Verification Requests"
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
          addButton={false}
        />
      </Card>
    </div>
  );
};

export default DriverRequests;
