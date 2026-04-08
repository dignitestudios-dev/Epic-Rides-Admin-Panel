import React, { useState, useEffect } from "react";
import {
  BadgeDollarSign,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import DataTable from "../components/common/DataTable";
import StatsCard from "../components/common/StatsCard";
import FilterBar from "../components/ui/FilterBar";
import CommissionTrendChart from "../components/ui/CommissionTrendChart";
import { formatDate, formatCurrency, downloadCSV } from "../utils/helpers";
import useGetSubscriptionRevenue from "../hooks/revenue/useGetSubscriptionRevenue";
import useGetWithdrawalRevenue from "../hooks/revenue/useGetWithdrawalRevenue";
import useDebounce from "../hooks/global/useDebounce";

const Revenue = () => {
  const [activeTab, setActiveTab] = useState("subscription"); // 'subscription' or 'withdrawal'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  // Subscription Data
  const {
    data: subData,
    stats: subStats,
    loading: subLoading,
    totalPages: subTotalPages,
    totalData: subTotalData,
  } = useGetSubscriptionRevenue(
    currentPage,
    pageSize,
    debouncedSearch,
    startDate,
    endDate,
    status?.target?.value,
  );

  // Withdrawal Data
  const {
    data: withData,
    stats: withStats,
    loading: withLoading,
    totalPages: withTotalPages,
    totalData: withTotalData,
  } = useGetWithdrawalRevenue(
    currentPage,
    pageSize,
    debouncedSearch,
    startDate,
    endDate,
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
    setStartDate("");
    setEndDate("");
    setStatus("");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate, status, activeTab]);

  const handleExport = () => {
    if (activeTab === "subscription") {
      if (!subData || subData.length === 0) return;
      const formattedData = subData.map(item => ({
        "Driver Name": item.driverName,
        "Email": item.email,
        "Status": item.subscriptionStatus,
        "Purchase Date": formatDate(item.purchaseDate),
        "Expiry Date": formatDate(item.expiryDate),
        "Amount": `$${item.amount || 0}`
      }));
      downloadCSV(formattedData, "subscription_revenue_export");
    } else {
      if (!withData || withData.length === 0) return;
      const formattedData = withData.map(item => ({
        "Driver Name": item.driverName,
        "Withdrawal Amount": `$${item.withdrawalAmount}`,
        "Date": formatDate(item.date),
        "Admin Commission (3%)": `$${item.adminCommission}`
      }));
      downloadCSV(formattedData, "withdrawal_commission_export");
    }
  };

  const subColumns = [
    {
      key: "driverName",
      label: "Driver Name",
      render: (val) => (
        <span className="font-semibold text-gray-900">{val}</span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "subscriptionStatus",
      label: "Status",
      render: (val) => (
        <Badge className="capitalize" variant={val?.toLowerCase() === "active" ? "success" : "danger"}>
          {val}
        </Badge>
      ),
    },
    {
      key: "purchaseDate",
      label: "Purchase Date",
      render: (val) => formatDate(val),
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (val) => (
        <span className="font-medium text-gray-700">{formatDate(val)}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val) => (
        <span className="font-bold text-green-600">${val || 0}</span>
      ),
    },
  ];

  const withColumns = [
    {
      key: "driverName",
      label: "Driver Name",
      render: (val) => (
        <span className="font-semibold text-gray-900">{val}</span>
      ),
    },
    {
      key: "withdrawalAmount",
      label: "Withdrawal Amount",
      render: (val) => (
        <span className="font-medium text-gray-700">${val}</span>
      ),
    },
    {
      key: "adminCommission",
      label: "Admin Commission (3%)",
      render: (val) => (
        <span className="font-bold text-primary-600">${val}</span>
      ),
    },
    { 
      key: "date", 
      label: "Date", 
      render: (val) => formatDate(val) 
    },
  ];

  return (
    <div className=" space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Revenue Management
          </h1>
          <p className="text-gray-500 mt-1  text-sm">
            Track your platform earnings and financial performance
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExport}
          className="shadow-lg shadow-primary-500/20"
        >
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange("subscription")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "subscription"
              ? "text-[#39A300] border-b-2 border-[#39A300]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <BadgeDollarSign className="w-4 h-4" />
            Subscription Revenue
          </div>
        </button>
        <button
          onClick={() => handleTabChange("withdrawal")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "withdrawal"
              ? "text-[#39A300] border-b-2 border-[#39A300]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <Wallet className="w-4 h-4" />
            Withdrawal Commission
          </div>
        </button>
      </div>

      {/* Stats Section */}
      {activeTab === "subscription" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Subscriptions"
            value={subStats?.totalSubscriptionsPurchased || 0}
            icon={<TrendingUp />}
            colored
            index={2}
          />
          <StatsCard
            title="Active Subscriptions"
            value={subStats?.totalActiveSubscriptions || 0}
            icon={<CheckCircle2 />}
            colored
            index={3}
          />
          <StatsCard
            title="Expired Subscriptions"
            value={subStats?.totalExpiredSubscriptions || 0}
            icon={<AlertCircle />}
            colored
            index={5}
          />
          <StatsCard
            title="Total Revenue (USD)"
            value={`$${subStats?.totalRevenue || 0}`}
            icon={<Wallet />}
            colored
            index={3}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
          <StatsCard
            title="Total Withdrawals Processed"
            value={withStats?.totalWithdrawalsProcessed || 0}
            icon={<TrendingUp />}
            colored
            index={2}
          />
          <StatsCard
            title="Total Commission Revenue"
            value={`$${withStats?.totalCommissionRevenue.toFixed(2) || 0}`}
            icon={<Wallet />}
            description="3% on every withdrawal"
            colored
            index={3}
          />
        </div>
      )}

      {/* Charts Section */}
      {/* <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-xl shadow-gray-200/50 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === "subscription"
                ? "Subscription Revenue Trend"
                : "Commission Earnings Trend"}
            </h2>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% from last week</span>
            </div>
          </div>
          <CommissionTrendChart />
        </Card>
      </div> */}

      {/* Main Table Section */}
      <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden rounded-3xl">
        <div className="p-6 border-b border-gray-100">
          <FilterBar
            searchable
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by driver name..."
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
              ...(activeTab === "subscription"
                ? [
                    {
                      key: "status",
                      label: "Status",
                      type: "select",
                      value: status?.target?.value,
                      onChange: setStatus,
                      options: [
                        { value: "active", label: "Active" },
                        { value: "expired", label: "Expired" },
                      ],
                    },
                  ]
                : []),
            ]}
            onClear={() => {
              setSearch("");
              setStartDate("");
              setEndDate("");
              setStatus("");
            }}
          />
        </div>

        <DataTable
          title={
            activeTab === "subscription"
              ? "Subscription History"
              : "Withdrawal Earnings"
          }
          data={activeTab === "subscription" ? subData : withData}
          columns={activeTab === "subscription" ? subColumns : withColumns}
          loading={activeTab === "subscription" ? subLoading : withLoading}
          totalPages={
            activeTab === "subscription" ? subTotalPages : withTotalPages
          }
          totalData={
            activeTab === "subscription" ? subTotalData : withTotalData
          }
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
    </div>
  );
};


export default Revenue;
