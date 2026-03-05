import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import useGetDocuments from "../hooks/Docs/useGetDocuments";

const statuses = ["all", "approved", "pending", "rejected"];

const DriverRequests = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const { docs, vehicles, loading, stats } = useGetDocuments(
    "",
    statusFilter === "all" ? "" : statusFilter,
    1,
    10,
  );

  // ✅ Group by driver and calculate aggregated status
  const groupedDrivers = Object.values(
    docs.reduce((acc, doc) => {
      const driverId = doc.driver._id;

      if (!acc[driverId]) {
        acc[driverId] = {
          driver: doc.driver,
          documents: [],
          vehicles: vehicles.filter(
            (vehicle) => vehicle.driver._id === driverId,
          ),
        };
      }

      acc[driverId].documents.push(doc);
      return acc;
    }, {}),
  );

  // 🔥 Compute aggregated status per driver
  groupedDrivers.forEach((driver) => {
    const allDocs = driver.documents;
    const allVehicles = driver.vehicles;

    // Check for any rejected
    const hasRejected =
      allDocs.some((doc) => doc.status === "rejected") ||
      allVehicles.some((vehicle) => vehicle.status === "rejected");

    // Check if all approved
    const allApproved =
      allDocs.every((doc) => doc.status === "approved") &&
      allVehicles.every((vehicle) => vehicle.status === "approved");

    driver.status = hasRejected
      ? "rejected"
      : allApproved
        ? "approved"
        : "pending";
  });

  const columns = [
    {
      key: "name",
      label: "Driver Name",
      render: (_, row) => row.driver.name,
    },
    {
      key: "email",
      label: "Email",
      render: (_, row) => row.driver.email,
    },
    {
      key: "phone",
      label: "Phone",
      render: (_, row) => row.driver.phone,
    },
    {
      key: "docs",
      label: "Documents",
      render: (_, row) => row.documents.length,
    },
    {
      key: "vehicles",
      label: "Vehicles",
      render: (_, row) => row.vehicles.length,
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${
            row.status === "approved"
              ? "bg-green-100 text-green-800"
              : row.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (_, row) => (
        <Button
          onClick={() =>
            navigate(`/driver/${row.driver._id}`, {
              state: row,
            })
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">
        Driver Document Verification
      </h2>

      {/* 🔥 Status Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200
              ${
                statusFilter === status
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 📊 Optional Stats Section */}
      {/* {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-500">Total Docs</p>
            <p className="text-xl font-semibold">{stats.totalDocs}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-500">Active Docs</p>
            <p className="text-xl font-semibold text-green-600">
              {stats.totalActiveDocs}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-500">Inactive Docs</p>
            <p className="text-xl font-semibold text-red-600">
              {stats.totalInactiveDocs}
            </p>
          </div>
        </div>
      )} */}

      <Table data={groupedDrivers} columns={columns} loading={loading} />
    </div>
  );
};

export default DriverRequests;
