import { useState, useEffect, useMemo } from "react";
import {
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Shield,
  ShieldOff,
  MessageSquare,
  Calendar,
  Filter,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";
import Card from "../components/ui/Card";
import { useForm } from "react-hook-form";
import { formatDate, formatDateTime } from "../utils/helpers";
import { USER_ROLES, USER_STATUS } from "../config/constants";
import useGetAllUsers from "../hooks/users/useGetAllUsers";
import StatsCard from "../components/common/StatsCard";
import { useApp } from "../contexts/AppContext";
import ConfirmModal from "../components/global/ConfirmModal";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    dateRange: { start: "", end: "" },
  });
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      profilePicture: "",
      role: "rider",
      status: "active",
      isBlocked: false,
      createdAt: "2025-01-10T10:00:00Z",
      lastLogin: "2025-11-23T08:30:00Z",
      trips: [
        { date: "2025-11-20", amount: 25.5, status: "completed" },
        { date: "2025-11-21", amount: 15.0, status: "completed" },
        { date: "2025-11-22", amount: 12.5, status: "cancelled" },
        { date: "2025-11-23", amount: 20.0, status: "completed" },
      ],
      paymentMethods: [
        { type: "Visa", last4: "4242" },
        { type: "MasterCard", last4: "5521" },
      ],
      ratings: {
        average: 4.5,
        count: 12,
        comments: ["Great rider", "Paid on time", "Friendly behavior"],
      },
      documents: [],
      recentPayments: [
        { type: "Ride Fare", amount: 25.5, date: "2025-11-20" },
        { type: "Wallet Top-up", amount: 50, date: "2025-11-18" },
      ],
      reportedIssues: ["Late cancellation on 2025-11-22"],
    },

    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "987-654-3210",
      profilePicture: "",
      role: "driver",
      status: "active",
      isBlocked: false,
      createdAt: "2025-02-05T11:30:00Z",
      lastLogin: "2025-11-22T14:45:00Z",
      trips: [
        { date: "2025-11-15", amount: 0, status: "completed" },
        { date: "2025-11-17", amount: 0, status: "completed" },
        { date: "2025-11-20", amount: 0, status: "completed" },
      ],
      paymentMethods: [{ type: "Bank Transfer", last4: "1022" }],
      ratings: {
        average: 4.8,
        count: 25,
        comments: ["Professional driver", "Vehicle clean", "Smooth driving"],
      },
      documents: [
        {
          type: "License",
          expiry: "2025-06-10",
          vehicle: "Honda Civic 2018",
          image: "https://yourcdn.com/docs/license123.jpg",
        },
        {
          type: "Insurance",
          expiry: "2024-12-29",
          vehicle: "Honda Civic 2018",
          image: "https://yourcdn.com/docs/insurance456.jpg",
        },
      ],
      recentPayments: [
        { type: "Ride Fare", amount: 15, date: "2025-11-17" },
        { type: "Ride Fare", amount: 20, date: "2025-11-20" },
      ],
      reportedIssues: [],
    },

    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "555-666-7777",
      profilePicture: "",
      role: "rider",
      status: "suspended",
      isBlocked: true,
      createdAt: "2025-03-20T09:00:00Z",
      lastLogin: null,
      trips: [
        { date: "2025-04-01", amount: 10, status: "completed" },
        { date: "2025-04-10", amount: 15, status: "completed" },
        { date: "2025-05-05", amount: 15, status: "cancelled" },
      ],
      paymentMethods: [{ type: "Visa", last4: "0821" }],
      ratings: {
        average: 3.2,
        count: 5,
        comments: ["Suspicious behavior", "Late payments"],
      },
      documents: [],
      recentPayments: [{ type: "Ride Fare", amount: 15, date: "2025-04-10" }],
      reportedIssues: ["Reported for inappropriate behavior on 2025-04-05"],
    },
  ]);

  const totalData = users.length;
  const totalPages = 1;
  const loading = false;
  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      if (filters.role && user.role !== filters.role) return false;
      if (filters.status && user.status !== filters.status) return false;
      if (
        filters.dateRange.start &&
        new Date(user.createdAt) < new Date(filters.dateRange.start)
      )
        return false;
      if (
        filters.dateRange.end &&
        new Date(user.createdAt) > new Date(filters.dateRange.end)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      // Place Riders first, Drivers second, others later
      const roleOrder = { rider: 1, driver: 2 };
      return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const columns = [
    {
      key: "select",
      label: "",
      render: (_, user) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
            }
          }}
        />
      ),
    },
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Name",

      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge
          variant={
            value === "admin"
              ? "danger"
              : value === "manager"
              ? "warning"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              user.isBlocked
                ? "danger"
                : value === "active"
                ? "success"
                : "default"
            }
          >
            {user.isBlocked ? "Blocked" : value}
          </Badge>
        </div>
      ),
    },
    //  {
    //   key: "totalPayments",
    //   label: "Payments",
    //   render: (_, user) => (
    //     <Badge variant="success">{user.recentPayments?.length || 0}</Badge>
    //   ),
    // },

    {
      key: "lastLogin",
      label: "Last Login",

      render: (value) => (
        <div>
          <p className="text-sm">{formatDate(value)}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",

      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(`/user-detail/${user.id}`, { state: { user } })
            }
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(user)}
            icon={<Trash2 className="w-4 h-4" />}
            title="Delete User"
          />
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    reset();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset(user);
    setShowModal(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleToggleBlock = (user) => {
    const action = user.isBlocked ? "unsuspend" : "suspend";

    setConfirmTitle(action === "suspend" ? "Suspend User" : "Unsuspend User");
    setConfirmMessage(`Are you sure you want to ${action} ${user.name}?`);

    setConfirmAction(() => () => {
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
    });

    setConfirmModalOpen(true);
  };

  const handleChat = (user) => {
    // Navigate to chat or open chat modal
    alert(`Starting chat with ${user.name}`);
  };

  const handleDelete = (user) => {
    setConfirmTitle("Delete User");
    setConfirmMessage(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    setConfirmAction(() => () => {
      setUsers(users.filter((u) => u.id !== user.id));
    });

    setConfirmModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u))
      );
    } else {
      const newUser = {
        ...data,
        id: Math.max(...users.map((u) => u.id)) + 1,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        totalTransactions: 0,
        totalSpent: 0,
        isBlocked: false,
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  // // Filter users based on current filters
  // const filteredUsers = users.filter((user) => {
  //   if (filters.role && user.role !== filters.role) return false;
  //   if (filters.status && user.status !== filters.status) return false;
  //   if (
  //     filters.dateRange.start &&
  //     new Date(user.createdAt) < new Date(filters.dateRange.start)
  //   )
  //     return false;
  //   if (
  //     filters.dateRange.end &&
  //     new Date(user.createdAt) > new Date(filters.dateRange.end)
  //   )
  //     return false;
  //   return true;
  // });

  const { dashboardAnalytics } = useApp();

  const userStats = useMemo(
    () => [
      {
        title: "Total Users",
        value: dashboardAnalytics?.userStats?.total || 0,
        icon: <Users />,
      },
      {
        title: "Active Users",
        value: dashboardAnalytics?.userStats?.active || 0,
        icon: <UserCheck />,
      },
      {
        title: "Inactive Users",
        value: dashboardAnalytics?.userStats?.inactive || 0,
        icon: <UserX />,
      },
      {
        title: "New Signups Today",
        value: dashboardAnalytics?.userStats?.today || 0,
        icon: <UserCheck />,
      },
    ],
    [dashboardAnalytics]
  );
  const sections = [{ title: "User Management", stats: userStats }];
  const handleBulkSuspend = () => {
    setUsers(
      users.map((u) =>
        selectedUsers.includes(u.id)
          ? { ...u, isBlocked: true, status: "suspended" }
          : u
      )
    );
    setSelectedUsers([]);
  };

  const handleBulkUnsuspend = () => {
    setUsers(
      users.map((u) =>
        selectedUsers.includes(u.id)
          ? { ...u, isBlocked: false, status: "active" }
          : u
      )
    );
    setSelectedUsers([]);
  };

  const handleExportCSV = () => {
    const csv = [
      ["ID", "Name", "Email", "Role", "Status"],
      ...users.map((u) => [u.id, u.name, u.email, u.role, u.status]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {sections.map((section, secIndex) => (
        <div key={secIndex}>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {section.stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                colored
                index={index}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Filters */}
      <Button
        onClick={() => setShowFilterDrawer((prev) => !prev)}
        className="flex items-center space-x-2"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </Button>
      {showFilterDrawer && (
        <div className="relative">
          <div className="w-[500px] h-[300px] overflow-auto absolute z-50 bg-white dark:bg-gray-800 shadow p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Filters
            </h3>
            <Select
              label="User Type"
              options={[
                { value: "", label: "All" },
                { value: "rider", label: "Rider" },
                { value: "driver", label: "Driver" },
              ]}
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
            />

            <Select
              label="Status"
              options={[
                { value: "", label: "All" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
                { value: "pending", label: "Pending Verification" },
              ]}
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            />

            <Input
              label="Start Date"
              type="date"
              value={filters.dateRange?.start || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value },
                }))
              }
            />

            <Input
              label="End Date"
              type="date"
              value={filters.dateRange?.end || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value },
                }))
              }
            />

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setFilters({
                  search: "",
                  role: "",
                  status: "",
                  dateRange: { start: "", end: "" },
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        loading={loading}
        onAdd={handleAdd}
        columns={columns}
        totalData={totalData}
        totalPages={totalPages}
        currentPage={currentPage}
        exportBTn={true}
        pageSize={pageSize}
        searchTerm={searchTerm}
        searchable={true}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        exportable={true}
        addButton={false}
        handleBulkSuspend={handleBulkSuspend}
        handleExportCSV={handleExportCSV}
        selectedUsers={selectedUsers}
        handleBulkUnsuspend={handleBulkUnsuspend}
      />

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
          />

          <Select
            label="Role"
            options={[
              { value: "", label: "Select Role" },
              { value: "user", label: "User" },
              { value: "rider", label: "Rider" },
              { value: "driver", label: "Driver" },
              { value: "manager", label: "Manager" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role", { required: "Role is required" })}
            error={errors.role?.message}
          />

          <Select
            label="Status"
            options={[
              { value: "", label: "Select Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "suspended", label: "Suspended" },
            ]}
            {...register("status", { required: "Status is required" })}
            error={errors.status?.message}
          />

          <Input label="Document" type="file" {...register("profilePicture")} />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Detail Modal */}
      {/* User Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6 overflow-y-auto h-[500px]">
            {/* Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                {selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 font-bold text-xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>

                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    variant={
                      selectedUser.isBlocked
                        ? "danger"
                        : selectedUser.status === "active"
                        ? "success"
                        : "default"
                    }
                  >
                    {selectedUser.isBlocked ? "Blocked" : selectedUser.status}
                  </Badge>

                  <Badge
                    variant={
                      selectedUser.role === "admin"
                        ? "danger"
                        : selectedUser.role === "manager"
                        ? "warning"
                        : "default"
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h4>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone || "Not provided"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedUser.address || "Not provided"}
                </p>
                <p>
                  <strong>City:</strong> {selectedUser.city}
                </p>
                <p>
                  <strong>State:</strong> {selectedUser.state}
                </p>
                <p>
                  <strong>Registration Date:</strong>{" "}
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>

              {/* Account Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Account Statistics
                </h4>
                <p>
                  <strong>Total Trips:</strong>{" "}
                  {selectedUser.trips?.length || 0}
                </p>
                <p>
                  <strong>Total Spent:</strong> $
                  {/* {selectedUser.totalSpent.toFixed(2)} */}
                </p>
                <p>
                  <strong>Last Login:</strong>{" "}
                  {selectedUser.lastLogin
                    ? formatDateTime(selectedUser.lastLogin)
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h4>
              {selectedUser.paymentMethods?.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {selectedUser.paymentMethods.map((pm, index) => (
                    <li key={index}>
                      {pm.type} • **** **** **** {pm.last4}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No payment methods available</p>
              )}
            </div>

            {/* Ratings & Feedback */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Ratings & Feedback
              </h4>

              {selectedUser.ratings ? (
                <>
                  <p>
                    <strong>Average Rating:</strong>{" "}
                    {selectedUser.ratings.average} ⭐ (
                    {selectedUser.ratings.count} reviews)
                  </p>

                  <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
                    {selectedUser.ratings.comments?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>No feedback found</p>
              )}
            </div>

            {/* Driver Documents */}
            {selectedUser.role === "driver" && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Driver Documents
                </h4>

                {selectedUser.documents?.length ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedUser.documents.map((doc, idx) => (
                      <li key={idx}>
                        {doc.type}: Expiry {formatDate(doc.expiry)}
                        {doc.vehicle && ` — Vehicle: ${doc.vehicle}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No documents uploaded</p>
                )}
              </div>
            )}

            {/* Trip History */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Ride / Trip History
              </h4>

              {selectedUser.trips?.length ? (
                <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
                  {selectedUser.trips.map((trip, idx) => (
                    <li key={idx}>
                      {formatDate(trip.date)} — ${trip.amount} — {trip.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No trips found</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmTitle}
        message={confirmMessage}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmModalOpen(false);
        }}
        confirmText="Yes, Continue"
        cancelText="Cancel"
      />
    </div>
  );
};

export default UserManagement;
