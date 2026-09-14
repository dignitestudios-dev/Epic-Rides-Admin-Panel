import { useState } from "react";
import {
  Eye,
  Download,
  RefreshCw,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";
import Popup from "../components/ui/Popup";
import { formatCurrency, formatDateTime } from "../utils/helpers";
import { CHART_COLORS, TRANSACTION_STATUS } from "../config/constants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { usePersistentState } from "../hooks/global/usePersistentState";
import StatsCard from "../components/common/StatsCard";

const AVATAR_PALETTE = [
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
];

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarStyle = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([
    {
      id: "TXN001",
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      amount: 299.99,
      currency: "USD",
      status: "completed",
      type: "payment",
      description: "Premium subscription",
      stripeTransactionId: "pi_1234567890",
      createdAt: "2024-01-20T14:30:00Z",
      completedAt: "2024-01-20T14:31:00Z",
      fees: 8.99,
      netAmount: 291.0,
    },
    {
      id: "TXN002",
      userId: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      amount: 149.99,
      currency: "USD",
      status: "pending",
      type: "payment",
      description: "Basic subscription",
      stripeTransactionId: "pi_0987654321",
      createdAt: "2024-01-20T13:15:00Z",
      completedAt: null,
      fees: 4.5,
      netAmount: 145.49,
    },
    {
      id: "TXN003",
      userId: 3,
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      amount: 99.99,
      currency: "USD",
      status: "failed",
      type: "payment",
      description: "One-time purchase",
      stripeTransactionId: "pi_1122334455",
      createdAt: "2024-01-20T12:00:00Z",
      completedAt: null,
      fees: 0,
      netAmount: 0,
    },
    {
      id: "TXN004",
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      amount: -50.0,
      currency: "USD",
      status: "completed",
      type: "refund",
      description: "Partial refund",
      stripeTransactionId: "re_1234567890",
      createdAt: "2024-01-19T16:45:00Z",
      completedAt: "2024-01-19T16:46:00Z",
      fees: -1.5,
      netAmount: -48.5,
    },
  ]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = usePersistentState("transactions_filters", {
    status: "",
    type: "",
    dateRange: { start: "", end: "" },
  });

  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundTransaction, setRefundTransaction] = useState(null);

  // Revenue analytics data
  const [revenueData] = useState([
    { date: "2024-01-01", revenue: 12500, transactions: 45 },
    { date: "2024-01-02", revenue: 15200, transactions: 52 },
    { date: "2024-01-03", revenue: 11800, transactions: 38 },
    { date: "2024-01-04", revenue: 18900, transactions: 67 },
    { date: "2024-01-05", revenue: 16400, transactions: 58 },
    { date: "2024-01-06", revenue: 14300, transactions: 49 },
    { date: "2024-01-07", revenue: 19800, transactions: 71 },
  ]);

  const columns = [
    {
      key: "id",
      label: "Transaction ID",

      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "userName",
      label: "Customer",
      render: (value, transaction) => {
        const initials = getInitials(value);
        const avatarStyle = getAvatarStyle(value);
        return (
          <div className="flex items-center gap-3 min-w-0" title={value}>
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarStyle}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-gray-900 dark:text-white truncate block">
                {value}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-normal truncate block">
                {transaction.userEmail}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",

      render: (value, transaction) => (
        <div className="text-right">
          <p
            className={`font-semibold ${
              value < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {formatCurrency(Math.abs(value))}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
            Net: {formatCurrency(Math.abs(transaction.netAmount))}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <Badge variant={value === "refund" ? "warning" : "info"} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const s = (value || "").toLowerCase();
        let variant = "default";
        if (s === "completed" || s === "paid" || s === "succeeded" || s === "success") {
          variant = "success";
        } else if (s === "pending" || s === "processing" || s === "hold" || s === "in_escrow") {
          variant = "warning";
        } else if (s === "failed" || s === "declined" || s === "cancelled" || s === "canceled") {
          variant = "danger";
        } else if (s === "refunded" || s === "refund" || s === "reversed") {
          variant = "info";
        }
        return (
          <Badge variant={variant} dot className="capitalize">
            {value}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value) => (
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(value).toLocaleDateString()}</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, transaction) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(transaction)}
            icon={<Eye className="w-3.5 h-3.5" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadReceipt(transaction)}
            icon={<Download className="w-3.5 h-3.5" />}
            title="Download Receipt"
          />
          {transaction.status === "completed" &&
            transaction.type === "payment" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRefund(transaction)}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                title="Process Refund"
              />
            )}
        </div>
      ),
    },
  ];

  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleDownloadReceipt = (transaction) => {
    // Generate and download receipt
    alert(`Downloading receipt for ${transaction.id}`);
  };

  const handleRefund = (transaction) => {
    setRefundTransaction(transaction);
    setShowRefundPopup(true);
  };

  const processRefund = async () => {
    setRefundLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefundLoading(false);
    setShowRefundPopup(false);
    setRefundTransaction(null);
  };

  // Calculate stats
  const totalRevenue = transactions
    .filter((t) => t.status === "completed" && t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunds = Math.abs(
    transactions
      .filter((t) => t.status === "completed" && t.type === "refund")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFees = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.fees), 0);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.status && transaction.status !== filters.status) return false;
    if (filters.type && transaction.type !== filters.type) return false;
    if (
      filters.dateRange.start &&
      new Date(transaction.createdAt) < new Date(filters.dateRange.start)
    )
      return false;
    if (
      filters.dateRange.end &&
      new Date(transaction.createdAt) > new Date(filters.dateRange.end)
    )
      return false;
    return true;
  });

  return (
    <>
      <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Transactions
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
                Ledger
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Review transaction history, settlements, customer charges, and refunds
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign className="w-4 h-4" />}
            index={0}
          />
          <StatsCard
            title="Pending Amount"
            value={formatCurrency(pendingAmount)}
            icon={<Clock className="w-4 h-4" />}
            index={1}
          />
          <StatsCard
            title="Total Refunds"
            value={formatCurrency(totalRefunds)}
            icon={<RefreshCw className="w-4 h-4" />}
            index={2}
          />
          <StatsCard
            title="Processing Fees"
            value={formatCurrency(totalFees)}
            icon={<CreditCard className="w-4 h-4" />}
            index={3}
          />
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a]">
            <Card.Header>
              <Card.Title className="text-sm font-bold text-gray-900 dark:text-white">Daily Revenue</Card.Title>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262c36" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#61CB08"
                    strokeWidth={2}
                    dot={{ fill: "#61CB08", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>

          <Card className="p-4 border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a]">
            <Card.Header>
              <Card.Title className="text-sm font-bold text-gray-900 dark:text-white">Daily Transactions</Card.Title>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262c36" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [value, "Transactions"]}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Bar dataKey="transactions" fill="#61CB08" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-4">
          <FilterBar
            filters={[
              {
                key: "status",
                label: "Status",
                type: "select",
                value: filters.status,
                onChange: (value) =>
                  setFilters((prev) => ({ ...prev, status: value })),
                options: [
                  { value: "completed", label: "Completed" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ],
              },
              {
                key: "type",
                label: "Type",
                type: "select",
                value: filters.type,
                onChange: (value) =>
                  setFilters((prev) => ({ ...prev, type: value })),
                options: [
                  { value: "payment", label: "Payment" },
                  { value: "refund", label: "Refund" },
                ],
              },
              {
                key: "startDate",
                label: "Start Date",
                type: "date",
                value: filters.dateRange.start,
                onChange: (value) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: value },
                  })),
              },
              {
                key: "endDate",
                label: "End Date",
                type: "date",
                value: filters.dateRange.end,
                onChange: (value) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: value },
                  })),
              },
            ]}
            onClear={() =>
              setFilters({
                status: "",
                type: "",
                dateRange: { start: "", end: "" },
              })
            }
          />
        </div>

        {/* Transactions Table */}
        <DataTable
          title="Transaction History"
          subtitle="Record of all customer payments, refunds, and fees"
          data={filteredTransactions}
          columns={columns}
          searchable={true}
          filterable={false}
          exportable={true}
          addButton={false}
        />

        {/* Transaction Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Transaction Details"
          size="lg"
        >
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#181d24] border border-gray-100 dark:border-[#1f242b] rounded-xl">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedTransaction.id}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {selectedTransaction.description}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedTransaction.status === "completed"
                      ? "success"
                      : selectedTransaction.status === "pending"
                      ? "warning"
                      : selectedTransaction.status === "failed"
                      ? "danger"
                      : "default"
                  }
                  dot
                  className="capitalize"
                >
                  {selectedTransaction.status}
                </Badge>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#181d24]/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        Name
                      </label>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {selectedTransaction.userName}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        Email
                      </label>
                      <p className="text-xs text-gray-700 dark:text-slate-300 font-mono">
                        {selectedTransaction.userEmail}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        User ID
                      </label>
                      <p className="text-xs text-gray-700 dark:text-slate-300 font-mono">
                        {selectedTransaction.userId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#181d24]/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                    Payment Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        Amount
                      </label>
                      <p
                        className={`text-sm font-bold ${
                          selectedTransaction.amount < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatCurrency(Math.abs(selectedTransaction.amount))}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        Processing Fee
                      </label>
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">
                        {formatCurrency(Math.abs(selectedTransaction.fees))}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        Net Amount
                      </label>
                      <p className="text-xs text-gray-900 dark:text-white font-bold font-mono">
                        {formatCurrency(
                          Math.abs(selectedTransaction.netAmount)
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        Stripe Transaction ID
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-xs">
                        {selectedTransaction.stripeTransactionId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#181d24]/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                  Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">Transaction Created</p>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
                        {formatDateTime(selectedTransaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  {selectedTransaction.completedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          Transaction Completed
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
                          {formatDateTime(selectedTransaction.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-[#1f242b]">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReceipt(selectedTransaction)}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Receipt
                </Button>
                {selectedTransaction.status === "completed" &&
                  selectedTransaction.type === "payment" && (
                    <Button
                      variant="danger"
                      onClick={() => {
                        handleRefund(selectedTransaction);
                        setShowDetailModal(false);
                      }}
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Process Refund
                    </Button>
                  )}
              </div>
            </div>
          )}
        </Modal>
      </div>

      <Popup
        open={showRefundPopup}
        onClose={() => {
          if (!refundLoading) {
            setShowRefundPopup(false);
            setRefundTransaction(null);
          }
        }}
        type="confirm"
        title="Confirm Refund"
        message={
          refundTransaction
            ? `Are you sure you want to process a refund for ${refundTransaction.id}?`
            : "Are you sure you want to process a refund?"
        }
        confirmText="Yes, Refund"
        cancelText="No"
        onConfirm={processRefund}
        showCloseButton={!refundLoading}
      />
    </>
  );
};

export default Transactions;
