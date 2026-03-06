import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import useGetDocuments from "../hooks/Docs/useGetDocuments";
import { formatDate } from "../utils/helpers";

const statuses = ["all", "approved", "pending", "rejected"];

const DriverRequests = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const { docs, vehicles, loading } = useGetDocuments(
    "",
    statusFilter === "all" ? "" : statusFilter,
    1,
    10,
  );

  // 🔥 Process Data (Group + Status + Search + Sort)
  const driversData = useMemo(() => {
    if (!docs) return [];

    const grouped = Object.values(
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

    // Aggregate Status
    grouped.forEach((driver) => {
      const hasRejected =
        driver.documents.some((d) => d.status === "rejected") ||
        driver.vehicles.some((v) => v.status === "rejected");

      const allApproved =
        driver.documents.every((d) => d.status === "approved") &&
        driver.vehicles.every((v) => v.status === "approved");

      driver.status = hasRejected
        ? "rejected"
        : allApproved
          ? "approved"
          : "pending";
    });

    // 🔎 Search
    let filtered = grouped.filter((driver) => {
      const keyword = search.toLowerCase();

      return (
        driver.driver.name.toLowerCase().includes(keyword) ||
        driver.driver.email.toLowerCase().includes(keyword) ||
        driver.driver.phone?.toLowerCase().includes(keyword)
      );
    });

    // 🔃 Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.documents[0]?.createdAt);
      const dateB = new Date(b.documents[0]?.createdAt);

      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [docs, vehicles, search, sortOrder]);

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
      key: "createdAt",
      label: "Created",
      render: (_, row) => formatDate(row?.documents[0]?.createdAt),
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
      {/* Status Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-3 mb-6">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize
              ${
                statusFilter === status
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        {/* 🔍 Search + Sort */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search name / email / phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 focus:outline-none rounded-md w-64"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-3 py-2 w-40 focus:outline-none rounded-md"
          >
            <option value="desc">Latest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <Table data={driversData} columns={columns} loading={loading} />
    </div>
  );
};

export default DriverRequests;
