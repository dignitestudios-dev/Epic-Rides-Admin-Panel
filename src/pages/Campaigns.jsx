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
import MultiSelect from "../components/ui/MultiSelect";
import StatsCard from "../components/common/StatsCard";
import { formatDate } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useCampaigns from "../hooks/campaigns/useCampaigns";
import { api } from "../lib/services";
import toast from "react-hot-toast";

const US_CITIES = [
  { value: "New York", label: "New York, NY" },
  { value: "Los Angeles", label: "Los Angeles, CA" },
  { value: "Chicago", label: "Chicago, IL" },
  { value: "Houston", label: "Houston, TX" },
  { value: "Phoenix", label: "Phoenix, AZ" },
  { value: "Philadelphia", label: "Philadelphia, PA" },
  { value: "San Antonio", label: "San Antonio, TX" },
  { value: "San Diego", label: "San Diego, CA" },
  { value: "Dallas", label: "Dallas, TX" },
  { value: "San Jose", label: "San Jose, CA" },
  { value: "Austin", label: "Austin, TX" },
  { value: "Jacksonville", label: "Jacksonville, FL" },
  { value: "San Francisco", label: "San Francisco, CA" },
  { value: "Columbus", label: "Columbus, OH" },
  { value: "Charlotte", label: "Charlotte, NC" },
  { value: "Indianapolis", label: "Indianapolis, IN" },
  { value: "Seattle", label: "Seattle, WA" },
  { value: "Denver", label: "Denver, CO" },
  { value: "Washington", label: "Washington, DC" },
  { value: "Boston", label: "Boston, MA" },
  { value: "El Paso", label: "El Paso, TX" },
  { value: "Nashville", label: "Nashville, TN" },
  { value: "Detroit", label: "Detroit, MI" },
  { value: "Oklahoma City", label: "Oklahoma City, OK" },
  { value: "Portland", label: "Portland, OR" },
  { value: "Las Vegas", label: "Las Vegas, NV" },
  { value: "Memphis", label: "Memphis, TN" },
  { value: "Louisville", label: "Louisville, KY" },
  { value: "Baltimore", label: "Baltimore, MD" },
  { value: "Milwaukee", label: "Milwaukee, WI" },
];

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
  quantity: "",
  eligibility: {
    rideTypes: "private,carpool",
    cities: [],
  },
};

const toDatetimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CampaignFormModal = ({ isOpen, onClose, initial, onSubmit, loading }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  React.useEffect(() => {
    if (isOpen && isEdit && initial?.codeMode === "unique") {
      const fetchCodes = async () => {
        setLoadingCodes(true);
        try {
          const res = await api.getGeneratedCodes(initial.id || initial._id, 1, 20);
          setGeneratedCodes(res.data?.codes || []);
        } catch (err) {
          toast.error("Failed to load generated codes.");
        } finally {
          setLoadingCodes(false);
        }
      };
      fetchCodes();
    } else {
      setGeneratedCodes([]);
    }
  }, [isOpen, isEdit, initial]);

  React.useEffect(() => {
    if (isOpen) {
      if (initial) {
        setForm({
          ...initial,
          codeMode: initial.codeMode || (initial.code ? "public" : "unique"),
          code: initial.code || "",
          prefix: initial.prefix || "",
          quantity: "",
          startDate: initial.startDate ? toDatetimeLocal(initial.startDate) : "",
          expiresAt: initial.expiresAt ? toDatetimeLocal(initial.expiresAt) : "",
          eligibility: {
            rideTypes: initial.eligibility?.rideTypes?.join(",") || "",
            cities: initial.eligibility?.cities || [],
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
    else if (form.name.length > 50) newErrors.name = "Name cannot exceed 50 characters.";
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
      if (form.startDate && d <= new Date(form.startDate)) {
        newErrors.expiresAt = "Expiry date of campaign should be future of start date.";
      } else if (d < now) {
        if (!isEdit || (isEdit && new Date(initial.expiresAt).getTime() !== d.getTime())) {
          newErrors.expiresAt = "Expiry date cannot be in the past.";
        }
      }
    }

    if (!form.eligibility.rideTypes) {
      newErrors.rideTypes = "At least one ride type must be selected.";
    }
    
    if (form.codeMode === "public") {
      if (!form.code.trim()) newErrors.code = "Code is required for public mode.";
      else if (form.code.length > 20) newErrors.code = "Code cannot exceed 20 characters.";
    }
    if (form.codeMode === "unique") {
      if (!form.prefix.trim()) newErrors.prefix = "Prefix is required for unique mode.";
      else if (form.prefix.length > 10) newErrors.prefix = "Prefix cannot exceed 10 characters.";
      if (!isEdit && (!form.quantity || Number(form.quantity) < 1)) newErrors.quantity = "Quantity must be at least 1.";
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
        cities: form.eligibility.cities || [],
      }
    };

    if (form.codeMode === "public") payload.code = form.code.trim();
    if (form.codeMode === "unique") {
      payload.prefix = form.prefix.trim();
      if (!isEdit) payload.quantity = Number(form.quantity);
    }

    onSubmit(payload);
  };

  const minStartDate = isEdit && initial?.startDate && new Date(initial.startDate) < new Date() 
    ? toDatetimeLocal(initial.startDate) 
    : toDatetimeLocal(new Date().toISOString());

  const minExpiresAt = form.startDate
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
          <Input label="Campaign Name" name="name" value={form.name} onChange={handleChange} error={errors.name} maxLength={50} />
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
          <Input label="Public Code" name="code" value={form.code} onChange={handleChange} error={errors.code} placeholder="e.g. SUMMER10" maxLength={20} />
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Code Prefix" name="prefix" value={form.prefix} onChange={handleChange} error={errors.prefix} placeholder="e.g. SUM" maxLength={10} />
              {!isEdit && (
                <Input label="Quantity" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} error={errors.quantity} placeholder="e.g. 50" />
              )}
            </div>
            {isEdit && initial?.codeMode === "unique" && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Generated Codes</p>
                {loadingCodes ? (
                  <p className="text-xs text-gray-500">Loading codes...</p>
                ) : generatedCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {generatedCodes.map((c, i) => (
                      <span key={i} className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 shadow-sm">
                        {typeof c === "string" ? c : c.code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No codes generated yet.</p>
                )}
              </div>
            )}
          </div>
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
              value={form.startDate}
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
              value={form.expiresAt}
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
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Ride Types</label>
            <div className="flex gap-4 h-[42px] items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.eligibility.rideTypes.includes("private")}
                  onChange={(e) => {
                    const current = form.eligibility.rideTypes ? form.eligibility.rideTypes.split(",") : [];
                    let newRideTypes;
                    if (e.target.checked) {
                      newRideTypes = [...current.filter(t => t !== "private"), "private"];
                    } else {
                      newRideTypes = current.filter(t => t !== "private");
                    }
                    setForm(prev => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, rideTypes: newRideTypes.join(",") }
                    }));
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                />
                Private
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.eligibility.rideTypes.includes("carpool")}
                  onChange={(e) => {
                    const current = form.eligibility.rideTypes ? form.eligibility.rideTypes.split(",") : [];
                    let newRideTypes;
                    if (e.target.checked) {
                      newRideTypes = [...current.filter(t => t !== "carpool"), "carpool"];
                    } else {
                      newRideTypes = current.filter(t => t !== "carpool");
                    }
                    setForm(prev => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, rideTypes: newRideTypes.join(",") }
                    }));
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                />
                Carpool
              </label>
            </div>
            {errors.rideTypes && <p className="text-sm text-red-600">{errors.rideTypes}</p>}
          </div>
          <MultiSelect
            label="Cities"
            name="eligibility.cities"
            value={form.eligibility.cities}
            onChange={handleChange}
            options={US_CITIES}
            searchable={true}
            placeholder="Select Cities..."
          />
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
  const [fetchingEdit, setFetchingEdit] = useState(false);

  const handleEditClick = async (row) => {
    setFetchingEdit(true);
    try {
      const id = row.id || row._id;
      const res = await api.getCampaignById(id);
      const data = res.data?.campaign || res.data || row;

      let publicCode = row.code;
      if (data.codeMode === "public" || row.codeMode === "public") {
        try {
          const codesRes = await api.getGeneratedCodes(id, 1, 1);
          if (codesRes.data?.codes?.length > 0) {
            const firstCode = codesRes.data.codes[0];
            publicCode = typeof firstCode === "string" ? firstCode : firstCode.code;
          }
        } catch (codeErr) {
          console.error("Failed to fetch public code", codeErr);
        }
      }

      setEditTarget({ ...row, ...data, code: publicCode });
    } catch (err) {
      toast.error("Failed to fetch full campaign details.");
      setEditTarget(row);
    } finally {
      setFetchingEdit(false);
    }
  };

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
              {value ? value.charAt(0).toUpperCase() + value.slice(1) : value}
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
          <Button variant="ghost" size="sm" icon={<Pencil className="w-4 h-4" />} onClick={() => handleEditClick(row)} disabled={fetchingEdit}>
            {fetchingEdit ? "Loading..." : "Edit"}
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
