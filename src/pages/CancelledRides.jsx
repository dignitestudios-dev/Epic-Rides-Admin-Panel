import React, { useState } from "react";
import { Eye, MapPin, User, Car } from "lucide-react";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";

import { formatDate, formatDateTime, formatPhoneNumber } from "../utils/helpers";
import useGetRides from "../hooks/rides/useGetRides";
import useDebounce from "../hooks/global/useDebounce";

/* ─── helpers ──────────────────────────────────────────────────── */
const fullName = (obj) =>
  [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const statusBadge = (status) => {
  switch (status) {
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "ongoing":
      return <Badge variant="warning">Ongoing</Badge>;
    default:
      return <Badge variant="default">{status || "—"}</Badge>;
  }
};

const paymentBadge = (status) => {
  if (!status) return <Badge variant="default">—</Badge>;
  const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  switch (status.toLowerCase()) {
    case "paid":
      return <Badge variant="success">{formatted}</Badge>;
    case "pending":
      return <Badge variant="warning">{formatted}</Badge>;
    case "failed":
      return <Badge variant="danger">{formatted}</Badge>;
    default:
      return <Badge variant="default">{formatted}</Badge>;
  }
};

/* ─── Detail Dialog ─────────────────────────────────────────────── */
const RideDetailDialog = ({ ride, onClose }) => {
  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right break-words max-w-[60%]">
        {value ?? "—"}
      </span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );

  if (!ride) return null;

  return (
    <Modal isOpen={!!ride} onClose={onClose} title="Ride Details" size="md">
      <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
        <Section title="Ride Info">
          <Row label="Ride ID" value={<span className="font-mono text-xs">{ride._id}</span>} />
          <Row label="Status" value={statusBadge(ride.rideStatus)} />
          <Row label="Ride Type" value={ride.rideType ? ride.rideType.charAt(0).toUpperCase() + ride.rideType.slice(1) : null} />
          <Row label="Distance" value={ride.rideDistance ? `${ride.rideDistance.toFixed(2)} mi.` : null} />
          <Row label="Est. Duration" value={ride.averageTime ? `${ride.averageTime} min` : null} />
          <Row label="Pickup" value={ride.pickupPoint} />
        </Section>

        <Section title="Rider">
          <Row label="Name" value={fullName(ride.user)} />
          <Row label="Email" value={ride.user?.email} />
          <Row label="Phone" value={ride.user?.phone ? formatPhoneNumber(ride.user.phone) : null} />
        </Section>

        <Section title="Driver">
          <Row label="Name" value={fullName(ride.driver)} />
          <Row label="Email" value={ride.driver?.email} />
          <Row label="Phone" value={ride.driver?.phone ? formatPhoneNumber(ride.driver.phone) : null} />
        </Section>

        <Section title="Payment">
          <Row label="Fare" value={ride.rideFare != null ? `$${ride.rideFare.toFixed(2)}` : null} />
          <Row label="Method" value={ride.paymentMethod ? ride.paymentMethod.replace(/_/g, " ") : null} />
          <Row label="Payment Status" value={paymentBadge(ride.paymentStatus)} />
        </Section>

        <Section title="Cancellation">
          <Row label="Cancelled By" value={ride.cancelledBy ? ride.cancelledBy.charAt(0).toUpperCase() + ride.cancelledBy.slice(1) : null} />
          <Row label="Reason" value={ride.cancellationReason} />
        </Section>

        <Section title="Timestamps">
          <Row label="Booked At" value={ride.createdAt ? formatDateTime(ride.createdAt) : null} />
          <Row label="Start Time" value={ride.startTime ? formatDateTime(ride.startTime) : null} />
          <Row label="End Time" value={ride.endTime ? formatDateTime(ride.endTime) : null} />
        </Section>
      </div>
    </Modal>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────── */
const CancelledRides = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRide, setSelectedRide] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const { rides, stats, loading, totalPages, totalData } = useGetRides(
    page,
    limit,
    debouncedSearch
  );

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const columns = [
    {
      key: "pickupPoint",
      label: "Pickup Location",
      render: (val) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
            {val || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "user",
      label: "Rider",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {fullName(val)}
            </p>
            <p className="text-xs text-gray-400">{val?.phone ? formatPhoneNumber(val.phone) : ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <Car className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {fullName(val)}
            </p>
            <p className="text-xs text-gray-400">{val?.phone ? formatPhoneNumber(val.phone) : ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rideType",
      label: "Type",
      render: (val) => (
        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "rideFare",
      label: "Fare",
      render: (val) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {val != null ? `$${val.toFixed(2)}` : "—"}
        </span>
      ),
    },
    {
      key: "cancelledBy",
      label: "Cancelled By",
      render: (val) => (
        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {val ? formatDate(val) : "—"}
        </span>
      ),
    },
    {
      key: "_id",
      label: "",
      render: (_, row) => (
        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => setSelectedRide(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cancelled Rides
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View and manage all cancelled ride records
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Cancelled Rides</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalRides ?? "—"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.totalRevenue != null ? stats.totalRevenue.toFixed(2) : "0.00"}
            </p>
          </Card>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={rides}
        columns={columns}
        title="Rides"
        loading={loading}
        searchable
        searchTerm={search}
        searchPlaceholder="Search by rider or driver..."
        onSearch={handleSearchChange}
        addButton={false}
        exportable={false}
        totalPages={totalPages}
        totalData={totalData}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
      />

      {/* Detail Dialog */}
      <RideDetailDialog
        ride={selectedRide}
        onClose={() => setSelectedRide(null)}
      />
    </div>
  );
};

export default CancelledRides;
