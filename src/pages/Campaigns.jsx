import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Tag,
  Percent,
  Ticket,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import StatsCard from "../components/common/StatsCard";
import { formatDate } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useCampaigns from "../hooks/campaigns/useCampaigns";

const EMPTY_FORM = {
  name: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountCap: "",
  startDate: "",
  expiresAt: "",
  maxUsesPerUser: 1,
  totalRedemptionLimit: "",
  codeMode: "public",
  code: "",
  prefix: "",
  eligibility: {
    rideTypes: "economy,luxury",
    cities: "",
  },
};

const CampaignFormModal = ({ isOpen, onClose, initial, onSubmit, loading }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (isOpen) {
      if (initial) {
        setForm({
          ...initial,
          eligibility: {
            rideTypes: initial.eligibility?.rideTypes?.join(",") || "",
            cities: initial.eligibility?.cities?.join(",") || "",
          },
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [isOpen, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("eligibility.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        eligibility: { ...prev.eligibility, [field]: value },
      }));
    } else {
      const sanitized = (name === "code" || name === "prefix") ? value.replace(/\s/g, "").toUpperCase() : value;
      setForm((prev) => ({ ...prev, [name]: sanitized }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.discountValue) newErrors.discountValue = "Discount value is required.";
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - 5); // 5 min grace period

    if (!form.startDate) {
      newErrors.startDate = "Start date is required.";
    } else {
      const d = new Date(form.startDate);
      if (d < now) {
        if (!isEdit || (isEdit && new Date(initial.startDate).getTime() !== d.getTime())) {
          newErrors.startDate = "Start date cannot be in the past.";
        }
      }
    }

    if (!form.expiresAt) {
      newErrors.expiresAt = "Expiry date is required.";
    } else {
      const d = new Date(form.expiresAt);
      if (d < now) {
        if (!isEdit || (isEdit && new Date(initial.expiresAt).getTime() !== d.getTime())) {
          newErrors.expiresAt = "Expiry date cannot be in the past.";
        }
      }
      if (!newErrors.startDate && !newErrors.expiresAt && d <= new Date(form.startDate)) {
        newErrors.expiresAt = "Expiry date must be after start date.";
      }
    }
    
    if (form.codeMode === "public" && !form.code.trim()) newErrors.code = "Code is required for public mode.";
    if (form.codeMode === "unique" && !form.prefix.trim()) newErrors.prefix = "Prefix is required for unique mode.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountCap: form.maxDiscountCap ? Number(form.maxDiscountCap) : null,
      startDate: new Date(form.startDate).toISOString(),
      expiresAt: new Date(form.expiresAt).toISOString(),
      maxUsesPerUser: Number(form.maxUsesPerUser) || 1,
      totalRedemptionLimit: form.totalRedemptionLimit ? Number(form.totalRedemptionLimit) : null,
      codeMode: form.codeMode,
      eligibility: {
        rideTypes: form.eligibility.rideTypes ? form.eligibility.rideTypes.split(",").map(s => s.trim()) : [],
        cities: form.eligibility.cities ? form.eligibility.cities.split(",").map(s => s.trim()) : [],
      }
    };

    if (form.codeMode === "public") payload.code = form.code.trim();
    if (form.codeMode === "unique") payload.prefix = form.prefix.trim();

    onSubmit(payload);
  };

  const toDatetimeLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const minStartDate = isEdit && initial?.startDate && new Date(initial.startDate) < new Date() 
    ? toDatetimeLocal(initial.startDate) 
    : toDatetimeLocal(new Date().toISOString());

  const minExpiresAt = form.startDate && new Date(form.startDate) > new Date()
    ? toDatetimeLocal(form.startDate)
    : (isEdit && initial?.expiresAt && new Date(initial.expiresAt) < new Date()
      ? toDatetimeLocal(initial.expiresAt)
      : toDatetimeLocal(new Date().toISOString()));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Campaign" : "Create Campaign"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Campaign Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          <Select
            label="Code Mode"
            name="codeMode"
            value={form.codeMode}
            onChange={handleChange}
            options={[
              { label: "Public (Single Code)", value: "public" },
              { label: "Unique (Multiple Codes)", value: "unique" },
            ]}
          />
        </div>

        {form.codeMode === "public" ? (
          <Input label="Public Code" name="code" value={form.code} onChange={handleChange} error={errors.code} placeholder="e.g. SUMMER10" />
        ) : (
          <Input label="Code Prefix" name="prefix" value={form.prefix} onChange={handleChange} error={errors.prefix} placeholder="e.g. SUM" />
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="block w-full px-3 py-2 border rounded-md shadow-sm text-black dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Discount Type"
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            options={[
              { label: "Percentage", value: "percentage" },
              { label: "Fixed Amount", value: "fixed" },
            ]}
          />
          <Input label="Discount Value" name="discountValue" type="number" min="1" value={form.discountValue} onChange={handleChange} error={errors.discountValue} />
          <Input label="Max Cap (Optional)" name="maxDiscountCap" type="number" min="0" value={form.maxDiscountCap} onChange={handleChange} placeholder="e.g. 50" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              min={minStartDate}
              value={isEdit && !form.startDate.includes("T") && form.startDate !== "" ? toDatetimeLocal(form.startDate) : form.startDate}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm text-black dark:text-gray-200 bg-white dark:bg-gray-800 sm:text-sm ${errors.startDate ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
            />
            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Expiry Date</label>
            <input
              type="datetime-local"
              name="expiresAt"
              min={minExpiresAt}
              value={isEdit && !form.expiresAt.includes("T") && form.expiresAt !== "" ? toDatetimeLocal(form.expiresAt) : form.expiresAt}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm text-black dark:text-gray-200 bg-white dark:bg-gray-800 sm:text-sm ${errors.expiresAt ? "border-red-300" : "border-gray-300 dark:border-gray-600"}`}
            />
            {errors.expiresAt && <p className="text-sm text-red-600">{errors.expiresAt}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Max Uses Per User" name="maxUsesPerUser" type="number" min="1" value={form.maxUsesPerUser} onChange={handleChange} />
          <Input label="Total Redemption Limit" name="totalRedemptionLimit" type="number" min="1" value={form.totalRedemptionLimit} onChange={handleChange} placeholder="Unlimited if blank" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Ride Types (Comma separated)" name="eligibility.rideTypes" value={form.eligibility.rideTypes} onChange={handleChange} placeholder="economy, luxury" />
          <Input label="Cities (Comma separated)" name="eligibility.cities" value={form.eligibility.cities} onChange={handleChange} placeholder="New York, London" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" type="submit" loading={loading} disabled={loading}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteModal = ({ isOpen, onClose, campaign, onConfirm, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete Campaign" size="sm">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
      Are you sure you want to delete campaign <strong className="text-gray-900 dark:text-white">{campaign?.name}</strong>? This action cannot be undone.
    </p>
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading} disabled={loading}>Delete</Button>
    </div>
  </Modal>
);

const Campaigns = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);

  const {
    campaigns,
    loading,
    actionLoading,
    totalPages,
    totalData,
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign,
  } = useCampaigns(currentPage, pageSize, "");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = async (payload) => {
    const ok = await createCampaign(payload);
    if (ok) setCreateOpen(false);
  };

  const handleEdit = async (payload) => {
    const ok = await updateCampaign(editTarget.id || editTarget._id, payload);
    if (ok) setEditTarget(null);
  };

  const handleDelete = async () => {
    const ok = await deleteCampaign(deleteTarget.id || deleteTarget._id);
    if (ok) setDeleteTarget(null);
  };

  const handleToggleStatus = async (row) => {
    const newStatus = row.status === "active" ? "paused" : "active";
    await updateCampaignStatus(row.id || row._id, newStatus);
  };

  const columns = [
    {
      key: "name",
      label: "Campaign Info",
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{row.name}</p>
          <span className="font-mono text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded">
            {row.codeMode === "public" ? row.code : `PREFIX: ${row.prefix}`}
          </span>
        </div>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      render: (_, row) => (
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {row.discountType === "percentage" ? `${row.discountValue}%` : `$${row.discountValue}`}
        </span>
      ),
    },
    {
      key: "dates",
      label: "Duration",
      render: (_, row) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>{formatDate(row.startDate)}</div>
          <div>to {formatDate(row.expiresAt)}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const isActive = value === "active";
        return (
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "success" : value === "paused" ? "warning" : "danger"}>
              {value}
            </Badge>
            <button
              onClick={() => handleToggleStatus(row)}
              disabled={actionLoading}
              title={`Mark as ${isActive ? "Paused" : "Active"}`}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
                isActive ? "bg-[#39A300]" : "bg-gray-200"
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/campaigns/${row.id || row._id}`)}>
            View
          </Button>
          <Button variant="ghost" size="sm" icon={<Pencil className="w-4 h-4" />} onClick={() => setEditTarget(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4 text-red-500" />} onClick={() => setDeleteTarget(row)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional campaigns, public codes, and unique generated codes.</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Campaigns" value={totalData} icon={<Tag />} index={0} />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          title="Campaigns List"
          data={campaigns}
          columns={columns}
          loading={loading}
          totalPages={totalPages}
          totalData={totalData}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          addButton={false}
        />
      </Card>

      <CampaignFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} initial={null} onSubmit={handleCreate} loading={actionLoading} />
      {editTarget && (
        <CampaignFormModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} initial={editTarget} onSubmit={handleEdit} loading={actionLoading} />
      )}
      <DeleteModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} campaign={deleteTarget} onConfirm={handleDelete} loading={actionLoading} />
    </div>
  );
};

export default Campaigns;
