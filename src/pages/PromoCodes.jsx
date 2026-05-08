import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Tag,

  CalendarClock,
  Percent,
  Ticket,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import StatsCard from "../components/common/StatsCard";
import { formatDate } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import usePromoCodes from "../hooks/promo-codes/usePromoCodes";

const EMPTY_FORM = {
  code: "",
  description: "",
  discountPercent: "",
  targetAge: "",
  expiresAt: "",
  isActive: true,
};

const PromoCodeFormModal = ({ isOpen, onClose, initial, onSubmit, loading }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Sync when initial changes (opening edit) or modal closes
  useEffect(() => {
    if (isOpen) {
      setForm(initial || EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, initial]);

  // Min datetime string for today (future dates only)
  const minDatetime = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Strip spaces from code field as user types
    const sanitized = name === "code" ? value.replace(/\s/g, "") : value;
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = "Code is required.";
    else if (/\s/.test(form.code)) newErrors.code = "Code must not contain spaces.";
    else if (form.code.length > 15) newErrors.code = "Code must be 15 characters or less.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    else if (form.description.length > 200) newErrors.description = "Description must be 200 characters or less.";
    if (!form.discountPercent) newErrors.discountPercent = "Discount is required.";
    if (!form.targetAge) newErrors.targetAge = "Target age is required.";
    if (!form.expiresAt) {
      newErrors.expiresAt = "Expiry date is required.";
    } else {
      const selected = new Date(form.expiresAt);
      if (selected <= new Date()) newErrors.expiresAt = "Expiry date must be in the future.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountPercent: Number(form.discountPercent),
      targetAge: Number(form.targetAge),
      expiresAt: new Date(form.expiresAt).toISOString(),
      isActive: form.isActive,
    });
  };

  // Format ISO date to datetime-local input value
  const toDatetimeLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Promo Code" : "Create Promo Code"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Input
            label="Code"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="e.g. SAVE10"
            error={errors.code}
            maxLength={15}
            className="uppercase"
          />
          <p className="text-xs text-gray-400 text-right">{form.code.length}/15</p>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Flat 10% discount for users of age 18"
            maxLength={200}
            rows={3}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm text-black dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none ${
              errors.description ? "border-red-300" : "border-gray-300 dark:border-gray-600"
            }`}
          />
          <div className="flex justify-between">
            {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : <span />}
            <p className="text-xs text-gray-400">{form.description.length}/200</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Discount (%)"
            name="discountPercent"
            type="number"
            min="1"
            max="100"
            value={form.discountPercent}
            onChange={handleChange}
            placeholder="10"
            error={errors.discountPercent}
          />
          <Input
            label="Target Age"
            name="targetAge"
            type="number"
            min="1"
            max="100"
            value={form.targetAge}
            onChange={handleChange}
            placeholder="18"
            error={errors.targetAge}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Expires At
          </label>
          <input
            type="datetime-local"
            name="expiresAt"
            value={isEdit ? toDatetimeLocal(form.expiresAt) : form.expiresAt}
            onChange={handleChange}
            min={minDatetime()}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm text-black dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.expiresAt
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {errors.expiresAt && (
            <p className="text-sm text-red-600">{errors.expiresAt}</p>
          )}
        </div>

        {/* isActive Toggle */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Active Status
          </span>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              form.isActive ? "bg-[#39A300]" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                form.isActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} disabled={loading}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ViewModal = ({ isOpen, onClose, promo }) => {
  if (!promo) return null;
  const rows = [
    { label: "Code", value: promo.code },
    { label: "Discount", value: `${promo.discountPercent}%` },
    { label: "Target Age", value: `${promo.targetAge}+` },
    { label: "Expires At", value: formatDate(promo.expiresAt) },
    {
      label: "Status",
      value: (
        <Badge variant={promo.isActive ? "success" : "danger"}>
          {promo.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Promo Code Details" size="sm">
      <div className="space-y-1">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white ml-4 text-right">
              {value}
            </span>
          </div>
        ))}
        {/* Description full text below */}
        <div className="pt-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white break-words whitespace-pre-wrap">
            {promo.description || "—"}
          </p>
        </div>
      </div>
    </Modal>
  );
};

const DeleteModal = ({ isOpen, onClose, promo, onConfirm, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete Promo Code" size="sm">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Are you sure you want to delete promo code{" "}
      <strong className="text-gray-900 dark:text-white">{promo?.code}</strong>? This
      action cannot be undone.
    </p>
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm} loading={loading} disabled={loading}>
        Delete
      </Button>
    </div>
  </Modal>
);

const PromoCodes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);

  const {
    promoCodes,
    redeemedCodesCount,
    loading,
    actionLoading,
    totalPages,
    totalData,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
  } = usePromoCodes(currentPage, pageSize);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = async (payload) => {
    const ok = await createPromoCode(payload);
    if (ok) setCreateOpen(false);
  };

  const handleEdit = async (payload) => {
    const ok = await updatePromoCode(editTarget._id, payload);
    if (ok) setEditTarget(null);
  };

  const handleDelete = async () => {
    const ok = await deletePromoCode(deleteTarget._id);
    if (ok) setDeleteTarget(null);
  };

  const handleToggleActive = async (row) => {
    await updatePromoCode(row._id, { isActive: !row.isActive });
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (value) => (
        <span className="font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs tracking-wider">
          {value}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 max-w-[220px]">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "discountPercent",
      label: "Discount",
      render: (value) => (
        <span className="font-semibold text-primary-600">{value}%</span>
      ),
    },
    {
      key: "targetAge",
      label: "Target Age",
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">{value}+</span>
      ),
    },
    {
      key: "expiresAt",
      label: "Expires At",
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Badge variant={value ? "success" : "danger"}>
            {value ? "Active" : "Inactive"}
          </Badge>
          <button
            onClick={() => handleToggleActive(row)}
            disabled={actionLoading}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
              value ? "bg-[#39A300]" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                value ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => setViewTarget(row)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => setEditTarget(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4 text-red-500" />}
            onClick={() => setDeleteTarget(row)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Promo Codes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage discount promo codes for your platform
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Create Promo Code
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Promo Codes"
          value={totalData}
          icon={<Tag />}
          index={0}
        />
        <StatsCard
          title="Redeemed Codes"
          value={redeemedCodesCount}
          icon={<Ticket />}
          index={1}
        />
        <StatsCard
          title="Active Codes"
          value={promoCodes.filter((p) => p.isActive).length}
          icon={<Percent />}
          index={2}
        />
        {/* <StatsCard
          title="Expired / Inactive"
          value={promoCodes.filter((p) => !p.isActive).length}
          icon={<CalendarClock />}
          index={3}
        /> */}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <DataTable
          title="Promo Codes List"
          data={promoCodes}
          columns={columns}
          loading={loading}
          totalPages={totalPages}
          totalData={totalData}
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

      {/* Create Modal */}
      <PromoCodeFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        initial={null}
        onSubmit={handleCreate}
        loading={actionLoading}
      />

      {/* Edit Modal */}
      <PromoCodeFormModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        initial={editTarget}
        onSubmit={handleEdit}
        loading={actionLoading}
      />

      {/* View Modal */}
      <ViewModal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        promo={viewTarget}
      />

      {/* Delete Confirm Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        promo={deleteTarget}
        onConfirm={handleDelete}
        loading={actionLoading}
      />

      {/* Global action loader */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Processing...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodes;
