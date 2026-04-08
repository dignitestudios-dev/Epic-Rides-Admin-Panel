import { useState, useEffect, useCallback } from "react";
import {
  Send,
  Bell,
  Users,
  UserCheck,
  Download,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  CheckCircle,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";
import { useForm } from "react-hook-form";
import { formatDateTime, downloadCSV } from "../utils/helpers";
import { api } from "../lib/services";
import toast from "react-hot-toast";
import { usePersistentState } from "../hooks/global/usePersistentState";

// ── Status Badge Helper ───────────────────────────────────────────────────────

const statusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "sent": return "success";
    case "scheduled": return "info";
    case "failed": return "danger";
    default: return "warning";
  }
};

const recipientIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "driver": return <UserCheck className="w-3 h-3" />;
    case "rider":
    case "user": return <Users className="w-3 h-3" />;
    default: return <Bell className="w-3 h-3" />;
  }
};

// ── Main Component ────────────────────────────────────────────────────────────

const Notifications = () => {
  // Data state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = usePersistentState("notifications_page", 1);
  const [limit, setLimit] = usePersistentState("notifications_limit", 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // Filters
  const [search, setSearch] = usePersistentState("notifications_search", "");
  const [sort, setSort] = usePersistentState("notifications_sort", "desc"); // asc | desc

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      audienceType: "both",
      title: "",
      message: "",
      deliveryType: "immediate",
      scheduledFor: "",
    },
  });

  const watchTitle = watch("title") || "";
  const watchMessage = watch("message") || "";
  const watchAudienceType = watch("audienceType");
  const watchDeliveryType = watch("deliveryType");
  const watchScheduledFor = watch("scheduledFor");

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications(page, limit, search, sort);
      const data = res.data || {};
      setNotifications(data.notifications || []);
      const pagination = data.pagination || {};
      setTotalPages(pagination.totalPages || 1);
      setTotalData(pagination.total || 0);
    } catch (err) {
      toast.error(err.message || "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!notifications.length) return;
    const rows = notifications.map((n) => ({
      ID: n.id,
      Title: n.title,
      "Message Preview": n.messagePreview,
      "Recipient Type": n.recipientType,
      "Date & Time": formatDateTime(n.dateAndTime),
      Status: n.status,
    }));
    downloadCSV(rows, "notifications_export");
  };

  const handleView = (n) => {
    setSelectedNotification(n);
    setShowDetailModal(true);
  };

  const handlePreview = (formValues) => {
    setPreviewData(formValues);
    setShowPreviewModal(true);
  };

  const handleConfirmSend = async () => {
    if (!previewData) return;
    setSending(true);
    try {
      const payload = {
        title: previewData.title,
        message: previewData.message,
        recipientType: previewData.audienceType, // already lowercase: both/riders/drivers
      };
      // Only include scheduledFor when scheduling is requested
      if (previewData.deliveryType === "scheduled" && previewData.scheduledFor) {
        payload.scheduledFor = new Date(previewData.scheduledFor).toISOString();
      }
      await api.sendNotification(payload);
      toast.success("Notification sent successfully!");
      setShowPreviewModal(false);
      setShowCreateModal(false);
      setPreviewData(null);
      reset();
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const toggleSort = () => {
    setSort((s) => (s === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  // ── Table Columns ────────────────────────────────────────────────────────────

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (val, row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{val}</p>
          <p className="text-xs text-gray-500 truncate max-w-[260px] mt-0.5">{row.messagePreview}</p>
        </div>
      ),
    },
    {
      key: "recipientType",
      label: "Recipient Type",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {recipientIcon(val)}
          {val || "—"}
        </div>
      ),
    },
    {
      key: "dateAndTime",
      label: (
        <button
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          onClick={toggleSort}
        >
          Date &amp; Time
          {sort === "desc" ? (
            <ArrowDown className="w-3.5 h-3.5" />
          ) : (
            <ArrowUp className="w-3.5 h-3.5" />
          )}
        </button>
      ),
      render: (val) => (
        <div className="text-sm text-gray-600">
          {val ? formatDateTime(val) : "—"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={statusVariant(val)}>
          {val || "Unknown"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleView(row)}
        >
          View
        </Button>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send and manage push notifications to riders and drivers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => { reset(); setShowCreateModal(true); }}
          >
            Send Notification
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          searchable
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          searchPlaceholder="Search by title..."
          onClear={() => { setSearch(""); setPage(1); }}
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <DataTable
          title="Notification History"
          data={notifications}
          columns={columns}
          loading={loading}
          totalPages={totalPages}
          totalData={totalData}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
          pageSize={limit}
          addButton={false}
        />
      </Card>

      {/* ── Create / Send Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Send Push Notification"
        size="md"
      >
        <form
          onSubmit={handleSubmit(handlePreview)}
          className="space-y-5"
        >
          {/* Recipient Type */}
          <Select
            label="Recipient Type"
            value={watchAudienceType}
            options={[
              { value: "both", label: "Both (Riders & Drivers)" },
              { value: "drivers", label: "Drivers only" },
              { value: "riders", label: "Riders only" },
            ]}
            {...register("audienceType", { required: "Recipient type is required" })}
            error={errors.audienceType?.message}
            placeholder="Select recipient type"
          />

          {/* Title */}
          <div>
            <Input
              label="Notification Title"
              {...register("title", {
                required: "Title is required",
                maxLength: { value: 60, message: "Max 60 characters" },
              })}
              error={errors.title?.message}
              placeholder="e.g., New ride available near you"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{watchTitle.length}/60</p>
          </div>

          {/* Message */}
          <div>
            <TextArea
              label="Message"
              {...register("message", {
                required: "Message is required",
                maxLength: { value: 200, message: "Max 200 characters" },
              })}
              rows={4}
              placeholder="Enter the notification message..."
              error={errors.message?.message}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{watchMessage.length}/200</p>
          </div>

          {/* Delivery Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="immediate" {...register("deliveryType")} />
                <span className="text-sm">Send Immediately</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="scheduled" {...register("deliveryType")} />
                <span className="text-sm">Schedule</span>
              </label>
            </div>
            {watchDeliveryType === "scheduled" && (
              <div className="mt-3">
                <Input
                 min={new Date().toISOString().slice(0, 16)}
                  label="Scheduled Date & Time"
                  type="datetime-local"
                  {...register("scheduledFor", {
                    required: watchDeliveryType === "scheduled"
                      ? "Schedule date/time is required"
                      : false,
                  })}
                  error={errors.scheduledFor?.message}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Send className="w-4 h-4" />}>
              Preview &amp; Send
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Preview / Confirm Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Preview Notification"
        size="md"
      >
        {previewData && (
          <div className="space-y-5">
            {/* Phone mockup preview */}
           <div className="mx-auto w-full max-w-sm bg-gray-900 rounded-3xl p-4 shadow-2xl">
  <div className="bg-white rounded-2xl p-4 space-y-2">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-[#39A300] flex items-center justify-center">
        <Bell className="w-4 h-4 text-white" />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Epic Rides
      </p>
    </div>

    <p className="text-sm font-bold text-gray-900 break-words">
      {previewData.title}
    </p>

    <p className="text-xs text-gray-600 leading-relaxed break-words whitespace-normal">
      {previewData.message}
    </p>
  </div>
</div>

            {/* Preview phone summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Recipients</span>
                <span className="font-semibold text-gray-800 capitalize">{previewData.audienceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-semibold text-gray-800">
                  {previewData.deliveryType === "scheduled" ? "Scheduled" : "Immediate"}
                </span>
              </div>
              {previewData.deliveryType === "scheduled" && previewData.scheduledFor && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled For</span>
                  <span className="font-semibold text-gray-800">
                    {formatDateTime(previewData.scheduledFor)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowPreviewModal(false)}>
                Back
              </Button>
              <Button
                variant="success"
                icon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                onClick={handleConfirmSend}
                loading={sending}
                disabled={sending}
              >
                Confirm &amp; Send
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Detail Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Notification Details"
        size="md"
      >
        {selectedNotification && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-gray-900">{selectedNotification.title}</h3>
                <Badge variant={statusVariant(selectedNotification.status)}>
                  {selectedNotification.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedNotification.messagePreview}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1 font-medium">Recipient Type</p>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  {recipientIcon(selectedNotification.recipientType)}
                  {selectedNotification.recipientType || "—"}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1 font-medium">Date &amp; Time</p>
                <p className="font-semibold text-gray-800">
                  {selectedNotification.dateAndTime ? formatDateTime(selectedNotification.dateAndTime) : "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;
