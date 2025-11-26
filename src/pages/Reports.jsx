import { useState } from "react";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import DataTable from "../components/common/DataTable";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("user");

  // Global Filters
  const [dateFilter, setDateFilter] = useState("30days");
  const [cityFilter, setCityFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [rideTypeFilter, setRideTypeFilter] = useState("all");

  // ----------------------------
  // Dummy Data (Replace with API)
  // ----------------------------

  const userReports = [
    {
      id: 1,
      name: "John Doe",
      email: "john@gmail.com",
      phone: "123456789",
      signupDate: "2025-01-12",
      lastLogin: "2025-02-05",
      status: "Active",
      userType: "Rider",
      city: "New York",
      state: "NY",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@gmail.com",
      phone: "987654321",
      signupDate: "2025-01-02",
      lastLogin: "2024-12-01",
      status: "Inactive",
      userType: "Driver",
      city: "Los Angeles",
      state: "CA",
    },
  ];

  const driverReports = [
    { id: 1, name: "Driver A", status: "Licensed", vehicle: "Sedan" },
    { id: 2, name: "Driver B", status: "Suspended", vehicle: "SUV" },
    {
      id: 3,
      name: "Driver C",
      status: "Pending Verification",
      vehicle: "Hatchback",
    },
  ];

  const rideReports = [
    {
      id: 1,
      rider: "John Doe",
      driver: "Driver A",
      type: "Economic",
      fare: 15,
      completed: 1,
      cancelled: 0,
      cancelledBy: "",
      rating: 4.5,
      date: "2025-02-07",
    },
    {
      id: 2,
      rider: "Jane Smith",
      driver: "Driver B",
      type: "Luxury",
      fare: 50,
      completed: 0,
      cancelled: 1,
      cancelledBy: "User",
      rating: null,
      date: "2025-02-07",
    },
  ];

  const revenueReports = [
    {
      id: 1,
      date: "2025-02-06",
      ridePayments: 500,
      withdrawalFees: 20,
      refunds: 30,
      netEarnings: 490,
    },
    {
      id: 2,
      date: "2025-02-07",
      ridePayments: 800,
      withdrawalFees: 40,
      refunds: 10,
      netEarnings: 830,
    },
  ];

  // ----------------------------
  // TABLE COLUMNS
  // ----------------------------

  const userColumns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "signupDate", label: "Signup Date" },
    { key: "lastLogin", label: "Last Login" },
    { key: "userType", label: "User Type" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
  ];

  const driverColumns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Driver Name" },
    { key: "status", label: "Status" },
    { key: "vehicle", label: "Vehicle Type" },
  ];

  const rideColumns = [
    { key: "id", label: "Ride ID" },
    { key: "rider", label: "Rider" },
    { key: "driver", label: "Driver" },
    { key: "type", label: "Ride Type" },
    { key: "fare", label: "Fare ($)" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "cancelledBy", label: "Cancelled By" },
    { key: "rating", label: "Rating" },
    { key: "date", label: "Date" },
  ];

  const revenueColumns = [
    { key: "date", label: "Date" },
    { key: "ridePayments", label: "Ride Payments" },
    { key: "withdrawalFees", label: "Withdrawal Fees" },
    { key: "refunds", label: "Refunds/Chargebacks" },
    { key: "netEarnings", label: "Net Earnings" },
  ];

  // ----------------------------
  // FILTERS UI
  // ----------------------------

  const Filters = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-4">
      <Select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        options={[
          { value: "today", label: "Today" },
          { value: "7days", label: "Last 7 Days" },
          { value: "30days", label: "Last 30 Days" },
          { value: "custom", label: "Custom" },
        ]}
        label="Date Range"
      />
      <Select
        value={cityFilter}
        onChange={(e) => setCityFilter(e.target.value)}
        options={[
          { value: "all", label: "All Cities" },
          { value: "new york", label: "New York" },
          { value: "los angeles", label: "Los Angeles" },
        ]}
        label="City"
      />
      <Select
        value={stateFilter}
        onChange={(e) => setStateFilter(e.target.value)}
        options={[
          { value: "all", label: "All States" },
          { value: "ny", label: "NY" },
          { value: "ca", label: "CA" },
        ]}
        label="State"
      />
      <Select
        value={userTypeFilter}
        onChange={(e) => setUserTypeFilter(e.target.value)}
        options={[
          { value: "all", label: "All Types" },
          { value: "rider", label: "Rider" },
          { value: "driver", label: "Driver" },
        ]}
        label="User Type"
      />
      <Select
        value={rideTypeFilter}
        onChange={(e) => setRideTypeFilter(e.target.value)}
        options={[
          { value: "all", label: "All Ride Types" },
          { value: "economic", label: "Economic" },
          { value: "luxury", label: "Luxury" },
          { value: "carpool", label: "Carpool" },
        ]}
        label="Ride Type"
      />
    </div>
  );

  // ----------------------------
  // EXPORT HANDLER (CSV)
  // ----------------------------
  const handleExport = () => {
    alert("CSV Exported (connect backend later)");
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Report Generation</h2>

      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        {["user", "driver", "ride", "revenue"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab
                ? "border-b-4 border-green-600 text-green-600"
                : "text-gray-600"
            }`}
          >
            {tab === "user"
              ? "User Reports"
              : tab === "driver"
              ? "Driver Reports"
              : tab === "ride"
              ? "Ride Reports"
              : "Revenue Reports"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Filters />

      {/* USER REPORTS */}
      {activeTab === "user" && (
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">User Reports</h3>
            <Button onClick={handleExport}>Export CSV</Button>
          </div>
          <DataTable columns={userColumns} data={userReports} />
        </Card>
      )}

      {/* DRIVER REPORTS */}
      {activeTab === "driver" && (
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Driver Reports</h3>
            <Button onClick={handleExport}>Export CSV</Button>
          </div>
          <DataTable columns={driverColumns} data={driverReports} />
        </Card>
      )}

      {/* RIDE REPORTS */}
      {activeTab === "ride" && (
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Ride Reports</h3>
            <Button onClick={handleExport}>Export CSV</Button>
          </div>
          <DataTable columns={rideColumns} data={rideReports} />
        </Card>
      )}

      {/* REVENUE REPORTS */}
      {activeTab === "revenue" && (
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Revenue Reports</h3>
            <Button onClick={handleExport}>Export CSV</Button>
          </div>
          <DataTable columns={revenueColumns} data={revenueReports} />
        </Card>
      )}
    </div>
  );
};

export default Reports;
