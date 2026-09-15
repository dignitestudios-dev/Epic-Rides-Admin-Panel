import React, { useRef, useEffect } from "react";
import { Eye, MapPin, Users, Car, Download, XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Tabs from "../components/ui/Tabs";
import StatsCard from "../components/common/StatsCard";

import { formatDate, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import useGetCarpoolRides from "../hooks/rides/useGetCarpoolRides";
import useDebounce from "../hooks/global/useDebounce";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { api } from "../lib/services";
import toast from "react-hot-toast";

const fullName = (obj) => [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const CarpoolRides = () => {
  const { hasPermission } = useAuth();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = usePersistentState("carpoolrides_activeTab", "completed");
  const effectiveTab = activeTab === "cancelled" ? "cancelled" : "completed";
  const [search, setSearch] = usePersistentState("carpoolrides_search", "");
  const [page, setPage] = usePersistentState("carpoolrides_page", 1);
  const [limit, setLimit] = usePersistentState("carpoolrides_limit", 10);
  const [startDate, setStartDate] = usePersistentState("carpoolrides_startDate", "");
  const [endDate, setEndDate] = usePersistentState("carpoolrides_endDate", "");
  const [isExporting, setIsExporting] = React.useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const handleViewRide = (id) => {
    navigate(`/carpool-rides/${id}`);
  };

  const { rides, stats, loading, totalPages, totalData } = useGetCarpoolRides(
    page,
    limit,
    debouncedSearch,
    effectiveTab,
    startDate,
    endDate
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, startDate, endDate, effectiveTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const tabs = [
    {
      key: "completed",
      id: "completed",
      label: "Completed Rides",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#61CB08]" />,
    },
    {
      key: "cancelled",
      id: "cancelled",
      label: "Cancelled Rides",
      icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
    },
  ];

  const handleExport = async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error("Please select both start and end dates for export.");
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.exportCarpoolRides(effectiveTab, startDate, endDate);
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${effectiveTab.charAt(0).toUpperCase() + effectiveTab.slice(1)}_Carpool_Rides_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      key: "startingPoint",
      label: "Pickup Location",
      render: (val) => (
        <div className="flex items-center gap-2 max-w-[220px]">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate text-xs font-semibold text-gray-800 dark:text-slate-200">
            {val || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "destination",
      label: "Dropoff Location",
      render: (val) => (
        <div className="flex items-center gap-2 max-w-[220px]">
          <MapPin className="w-3.5 h-3.5 text-[#61CB08] shrink-0" />
          <span className="truncate text-xs text-gray-700 dark:text-slate-300">
            {val || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Car className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {fullName(val)}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">
              {val?.phone ? formatPhoneNumber(val.phone) : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "seats",
      label: "Passengers",
      render: (_, row) => (
        <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
          {row.maxPassengers - row.availableSeats} / {row.maxPassengers}
        </span>
      ),
    },
    {
      key: "distance",
      label: "Distance",
      render: (val) => (
        <span className="text-xs text-gray-700 dark:text-slate-300 font-mono">
          {val != null ? `${val.toFixed(2)} km` : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => (
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {val ? formatDate(val) : "—"}
        </span>
      ),
    },
    {
      key: "_id",
      label: "",
      render: (_, row) => (
        <button 
          onClick={() => handleViewRide(row._id)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
          title="View ride route"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Carpool Rides
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            View and manage all active, completed and cancelled carpool routes
          </p>
        </div>

        {hasPermission("downloadExcel") && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            loading={isExporting}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        )}
      </div>

      {/* Segment Tabs */}
      <Tabs tabs={tabs} activeTab={effectiveTab} onChange={handleTabChange} />

      {/* Stats Cards (Standardized with StatsCard component) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title={`Total ${effectiveTab === "completed" ? "Completed" : "Cancelled"}`}
          value={stats?.totalRides != null ? stats.totalRides.toLocaleString() : "0"}
          loading={loading}
          index={0}
        />
        <StatsCard
          title="Revenue"
          value={stats?.totalRevenue != null ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00"}
          loading={loading}
          index={1}
        />
      </div>

      {/* Data Table with embedded date filters */}
      <DataTable
        data={rides}
        columns={columns}
        title={`${effectiveTab === "cancelled" ? "Cancelled" : "Completed"} Carpool Rides`}
        subtitle="Route itineraries, pickup points, and passenger occupancies"
        loading={loading}
        searchable
        searchTerm={search}
        searchPlaceholder="Search by driver or location..."
        onSearch={handleSearchChange}
        addButton={false}
        exportable={false}
        totalPages={totalPages}
        totalData={totalData}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
      >
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-[#2d3748] bg-white dark:bg-[#141a24] text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#61CB08]"
            title="Start date"
          />
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-[#2d3748] bg-white dark:bg-[#141a24] text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#61CB08]"
            title="End date"
          />
          {(startDate || endDate || search) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSearch("");
                setPage(1);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white px-1.5 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </DataTable>
    </div>
  );
};

export default CarpoolRides;
