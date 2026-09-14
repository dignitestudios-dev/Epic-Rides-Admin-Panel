import React, { useState } from "react";
import { Plus, ShieldAlert, Edit, Trash2 } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import useAdminUsers from "../hooks/admin/useAdminUsers";
import { api } from "../lib/services";
import { handleError, formatDate } from "../utils/helpers";
import toast from "react-hot-toast";
import AdminUserModal from "../components/admin/AdminUserModal";
import ConfirmModal from "../components/global/ConfirmModal";
import useDebounce from "../hooks/global/useDebounce";

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { admins, loading, pagination, refresh } = useAdminUsers(
    page,
    limit,
    debouncedSearch,
    "",
    "desc"
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageSizeChange = (size) => {
    setLimit(size);
    setPage(1);
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editingAdmin) {
        await api.updateAdminUser(editingAdmin._id || editingAdmin.id, data);
        toast.success("Admin user updated successfully");
      } else {
        await api.createAdminUser(data);
        toast.success("Admin user created successfully");
      }
      setIsModalOpen(false);
      refresh();
    } catch (error) {
      handleError(error);
    }
  };

  const confirmDelete = (admin) => {
    setAdminToDelete(admin);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;
    try {
      await api.deleteAdminUser(adminToDelete._id || adminToDelete.id);
      toast.success("Admin user deleted successfully");
      setDeleteModalOpen(false);
      refresh();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (value, row) => (
        <div className="flex items-center gap-3 min-w-0" title={value}>
          <div className="w-7 h-7 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
            {value?.charAt(0).toUpperCase() || "A"}
          </div>
          <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
            {value}
          </span>
        </div>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (value) => (
        <span className="text-gray-600 dark:text-slate-300 font-mono text-xs">
          {value || "—"}
        </span>
      ),
    },
    {
      label: "Role",
      key: "role",
      render: (value) => {
        const roleColors = {
          super_admin: "danger",
          admin: "primary",
          general: "default",
        };
        return (
          <Badge
            variant={roleColors[value] || "default"}
            className="capitalize text-xs font-semibold"
          >
            {value?.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      label: "Status",
      key: "isActive",
      render: (value) => (
        <Badge variant={value !== false ? "success" : "danger"} dot>
          {value !== false ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      label: "Joined Date",
      key: "createdAt",
      render: (value) => (
        <span className="text-gray-600 dark:text-slate-400 text-xs">
          {formatDate(value)}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (_, row) => {
        if (row.role === "super_admin") return null;

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditAdmin(row)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => confirmDelete(row)}
              className="p-1.5 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Admin Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
              {pagination.totalData || 0} admins
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Manage system administrators, security clearance, and access roles
          </p>
        </div>
        <Button
          onClick={handleAddAdmin}
          icon={<Plus className="w-3.5 h-3.5" />}
          size="sm"
        >
          Add Admin
        </Button>
      </div>

      <DataTable
        title="Administrators"
        subtitle="System administrative accounts and access privileges"
        columns={columns}
        data={admins}
        loading={loading}
        totalPages={pagination.totalPages}
        totalData={pagination.totalData}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        searchable
        searchTerm={search}
        onSearch={handleSearchChange}
        searchPlaceholder="Search admins by name or email..."
        addButton={false}
      />

      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingAdmin={editingAdmin}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Admin User"
        message={`Are you sure you want to delete ${adminToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminUsers;
