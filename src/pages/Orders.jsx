import { useEffect, useMemo, useState, useRef } from "react";
import Select from "../components/ui/Select";
import {
  Eye,
  Edit,
  Truck,
  User,
  MapPin,
  Loader2,
  Package,
  Clock,
  ShieldX,
  PackageSearch,
  PackageCheck,
  DollarSign,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatPhoneNumber } from "../utils/helpers";
import { ORDER_STATUS, PAGINATION_CONFIG } from "../config/constants";
import useOrderActions from "../hooks/orders/useOrderActions";
import useDebounce from "../hooks/global/useDebounce";
import FilterBar from "../components/ui/FilterBar";
import { useApp } from "../contexts/AppContext";
import StatsCard from "../components/common/StatsCard";
import { usePersistentState } from "../hooks/global/usePersistentState";

const AVATAR_PALETTE = [
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
];

const getInitials = (firstName, lastName, email) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  if (f || l) return f + l;
  return (email || "U").slice(0, 2).toUpperCase();
};

const getAvatarStyle = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const Orders = () => {
  const [currentPage, setCurrentPage] = usePersistentState("orders_currentPage", 1);
  const [pageSize, setPageSize] = usePersistentState("orders_pageSize", PAGINATION_CONFIG.defaultPageSize);
  const { appConfigs } = useApp();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState("");

  const [search, setSearch] = usePersistentState("orders_search", "");
  const searchDebounce = useDebounce(search);

  const defaultFilters = {
    paymentStatus: "",
    orderStatus: "",
    orderType: "",
    startDate: "",
    endDate: "",
  };
  const [filters, setFilters] = usePersistentState("orders_filters", defaultFilters);
  const [apiFilters, setApiFilters] = useState(defaultFilters);

  const formattedFilters = [
    {
      key: "paymentStatus",
      label: "Payment Status",
      type: "select",
      value: filters.paymentStatus,
      onChange: (value) => setFilters({ ...filters, paymentStatus: value }),
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      key: "orderStatus",
      label: "Order Status",
      type: "select",
      value: filters.orderStatus,
      onChange: (value) => setFilters({ ...filters, orderStatus: value }),
      options: [
        { value: "delivered", label: "Delivered" },
        { value: "shipped", label: "Shipped" },
        { value: "processing", label: "Processing" },
        { value: "confirmed", label: "Confirmed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "orderType",
      label: "Order Type",
      type: "select",
      value: filters.orderType,
      onChange: (value) => setFilters({ ...filters, orderType: value }),
      options: [
        { value: "delivery", label: "Delivery" },
        { value: "pickup", label: "Pickup" },
      ],
    },
    {
      key: "startDate",
      label: "Start Date",
      type: "date",
      value: filters.startDate,
      onChange: (value) => setFilters({ ...filters, startDate: value }),
    },
    {
      key: "endDate",
      label: "End Date",
      type: "date",
      value: filters.endDate,
      onChange: (value) => setFilters({ ...filters, endDate: value }),
    },
  ];

  const {
    orders,
    stats,
    totalPages,
    totalData,
    loading,
    loadingActions,
    updateOrder,
    getOrders,
  } = useOrderActions(
    apiFilters.paymentStatus,
    apiFilters.orderStatus,
    apiFilters.orderType,
    apiFilters.startDate,
    apiFilters.endDate,
    searchDebounce,
    currentPage,
    pageSize
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
    setApiFilters(filters);
  }, [filters]);

  const columns = [
    {
      key: "shortCode",
      label: "Order ID",

      render: (value) => (
        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: "contact",
      label: "Customer",

      render: (value, order) => {
        const customerName =
          order?.orderType === "delivery" && order?.delivery?.firstName
            ? `${order?.delivery?.firstName} ${order?.delivery?.lastName}`
            : value?.email?.split("@")[0] || "Customer";
        const initials = getInitials(
          order?.delivery?.firstName,
          order?.delivery?.lastName,
          value?.email
        );
        const avatarStyle = getAvatarStyle(customerName);

        return (
          <div className="flex items-center gap-3 min-w-0" title={customerName}>
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarStyle}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                {customerName}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 font-normal truncate">
                {value?.email || "—"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "products",
      label: "Items",
      render: (value) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {value?.length} item{value?.length !== 1 ? "s" : ""}
          </p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {value
              ?.map((item) => `${item?.product?.title} (${item.quantity})`)
              .join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",

      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "shippingCost",
      label: "Shipping Cost",

      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "orderType",
      label: "Type",
      render: (value) => (
        <Badge
          variant={
            value === "delivery"
              ? "warning"
              : value === "pickup"
              ? "info"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "pending"
              ? "warning"
              : value === "completed"
              ? "success"
              : value === "delivered"
              ? "success"
              : value === "shipped"
              ? "info"
              : value === "processing"
              ? "warning"
              : value === "confirmed"
              ? "info"
              : value === "cancelled"
              ? "danger"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (value) => (
        <Badge
          variant={
            value === "paid"
              ? "success"
              : value === "failed"
              ? "danger"
              : "warning"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Order Date",

      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, order) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(order)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdateStatus(order)}
            icon={<Edit className="w-4 h-4" />}
            title="Update Status"
          />
        </div>
      ),
    },
  ];

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (order) => {
    setEditingOrder(order);
    setNewOrderStatus(order.orderStatus); // Set current status as default
  };

  const handleStatusChange = async () => {
    if (editingOrder && newOrderStatus) {
      const success = await updateOrder(editingOrder._id, {
        orderStatus: newOrderStatus,
      });
      if (success) {
        setEditingOrder(null);
        getOrders(); // Refresh the orders list
      }
    }
  };

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const handleSearch = (search) => {
    setCurrentPage(1);
    setSearch(search);
  };

  const handleOrdersExport = (data) => {
    return data.map((order) => {
      // Efficiently format products with single iteration
      let productsText = "No products";
      let totalItems = 0;

      if (order.products?.length > 0) {
        const productStrings = [];

        for (const item of order.products) {
          totalItems += item.quantity || 0;

          const name = item.product?.title || "Unknown";
          const qty = item.quantity || 0;
          const specs = [];

          if (item.selectedColor) specs.push(item.selectedColor);
          if (item.selectedSize) specs.push(item.selectedSize);

          productStrings.push(
            `${name} x${qty}${specs.length ? ` (${specs.join(", ")})` : ""}`
          );
        }

        productsText = productStrings.join(" | ");
      }

      return {
        "Order ID": order.shortCode || "",
        Customer: order.contact?.email || "",
        Products: productsText,
        "Total Items": totalItems,
        Total: formatCurrency(order.totalAmount) || "N/A",
        "Shipping Cost": formatCurrency(order.shippingCost),
        "Order Type": order.orderType || "",
        "Order Status": order.orderStatus || "",
        "Payment Status": order.paymentStatus || "",
        Created: formatDate(order.createdAt),
      };
    });
  };

  const orderStats = useMemo(
    () => [
      {
        title: "Total Orders",
        value: formatNumber(stats?.totalOrders || 0),
        icon: Package,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
      {
        title: "Pending Orders",
        value: formatNumber(stats?.pendingOrders || 0),
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-600/20",
      },
      {
        title: "Processing Orders",
        value: formatNumber(stats?.processingOrders || 0),
        icon: PackageSearch,
        color: "text-orange-600",
        bgColor: "bg-orange-600/20",
      },
      {
        title: "Shipped Orders",
        value: formatNumber(stats?.shippedOrders || 0),
        icon: Truck,
        color: "text-secondary-600",
        bgColor: "bg-secondary-600/20",
      },
      {
        title: "Delivered Orders",
        value: formatNumber(stats?.deliveredOrders || 0),
        icon: PackageCheck,
        color: "text-green-600",
        bgColor: "bg-green-600/20",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Orders Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
              Fulfillment Ops
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Track customer merchandise orders, shipping rates, and fulfillment lifecycle
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {orderStats?.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon ? <stat.icon className="w-4 h-4" /> : null}
            index={index}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-4">
        <FilterBar
          filters={formattedFilters}
          onClear={() => {
            setFilters(defaultFilters);
            setSearch("");
          }}
        />
      </div>

      {/* Orders Table */}
      <DataTable
        title="Merchandise Orders"
        subtitle="Chronological list of store orders and fulfillment tracking"
        data={orders}
        columns={columns}
        onExport={handleOrdersExport}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalData={totalData}
        searchTerm={search}
        onSearch={(value) => handleSearch(value)}
        searchable
        exportable
      />

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Order Details`}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order {selectedOrder?.shortCode}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Placed on {formatDateTime(selectedOrder?.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    selectedOrder?.orderStatus === "pending"
                      ? "warning"
                      : selectedOrder?.orderStatus === "completed"
                      ? "success"
                      : selectedOrder?.orderStatus === "delivered"
                      ? "success"
                      : selectedOrder?.orderStatus === "shipped"
                      ? "info"
                      : selectedOrder?.orderStatus === "processing"
                      ? "warning"
                      : selectedOrder?.orderStatus === "confirmed"
                      ? "info"
                      : selectedOrder?.orderStatus === "cancelled"
                      ? "danger"
                      : "default"
                  }
                >
                  {selectedOrder?.orderStatus}
                </Badge>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder?.orderType === "delivery" &&
                      selectedOrder?.delivery?.firstName
                        ? `${selectedOrder?.delivery?.firstName} ${selectedOrder?.delivery?.lastName}`
                        : "---"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      <a href={`mailto:${selectedOrder?.contact?.email}`}>
                        {selectedOrder?.contact?.email || "---"}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatPhoneNumber(selectedOrder?.delivery?.phoneNumber) || "---"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedOrder?.orderType === "delivery"
                    ? "Shipping Address"
                    : "Pickup Address"}
                </h4>
                {selectedOrder?.orderType === "delivery" ? (
                  <div className="space-y-1 text-gray-900 dark:text-white">
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        Address:
                      </span>{" "}
                      {selectedOrder?.delivery?.address}
                    </p>
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        City:
                      </span>{" "}
                      {selectedOrder?.delivery?.city}
                    </p>
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        Country:
                      </span>{" "}
                      {selectedOrder?.delivery?.country}
                    </p>
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        Apartment:
                      </span>{" "}
                      {selectedOrder?.delivery?.apartment}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 text-gray-900 dark:text-white">
                    <p>{appConfigs?.pickupAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Order Items
              </h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedOrder?.products?.map((item) => (
                      <tr key={item.id}>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate"
                          title={item.product.title}
                        >
                          <div className="truncate">{item.product.title}</div>
                          <p className="text-gray-400 truncate">
                            ID: {item.product._id}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.selectedSize || "---"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.selectedColor || "---"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Order Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(
                      selectedOrder?.totalAmount -
                        (appConfigs?.shippingCost || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(appConfigs?.shippingCost || 0)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedOrder?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Order Status Modal */}
      {editingOrder && (
        <Modal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          title="Update Order Status"
        >
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
              Select a new status for the order:
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Order ID:{" "}
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {editingOrder?.shortCode}
              </span>
            </p>

            <Select
              value={newOrderStatus}
              onChange={(value) => setNewOrderStatus(value)}
              options={[
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              disabled={loadingActions}
              error={!newOrderStatus && "Order status is required"}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStatusChange}
                className="h-10 flex items-center gap-2"
              >
                {loadingActions ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Updating...</span>
                  </div>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
