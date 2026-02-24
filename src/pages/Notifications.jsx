import { useState, useMemo } from "react";
import {
  Send,
  Users,
  UserCheck,
  Bell,
  Calendar,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import { useForm } from "react-hook-form";
import { formatDateTime } from "../utils/helpers";

const COUNTRIES = [
  { value: "uae", label: "UAE" },
  { value: "saudi_arabia", label: "Saudi Arabia" },
  { value: "usa", label: "United States" },
  { value: "uk", label: "United Kingdom" },
];

const CITIES = {
  uae: [
    { value: "dubai", label: "Dubai" },
    { value: "sharjah", label: "Sharjah" },
  ],
};

const AREAS = {
  karachi: [
    { value: "dha", label: "DHA" },
    { value: "gulshan", label: "Gulshan" },
  ],
  lahore: [
    { value: "gulberg", label: "Gulberg" },
    { value: "dharampura", label: "Dharampura" },
  ],
  dubai: [
    { value: "marina", label: "Marina" },
    { value: "deira", label: "Deira" },
  ],
  sharjah: [
    { value: "alqasba", label: "Al Qasba" },
    { value: "aljada", label: "Aljada" },
  ],
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: "NOTIF001",
      title: "Welcome to Premium!",
      message:
        "Thank you for upgrading to our premium plan. Enjoy all the new features!",
      // old "type" becomes audienceType; we add notificationType
      notificationType: "system_update",
      audienceType: "all_users",
      targetAudience: "All Users",
      recipientCount: 12543,
      sentCount: 12543,
      deliveredCount: 12340,
      openedCount: 8765,
      status: "sent",
      createdAt: "2024-01-20T10:30:00Z",
      sentAt: "2024-01-20T10:35:00Z",
      createdBy: "Admin User",
    },
    {
      id: "NOTIF002",
      title: "System Maintenance Notice",
      message:
        "We will be performing scheduled maintenance on Sunday from 2-4 AM EST.",
      notificationType: "system_update",
      audienceType: "role_based",
      targetAudience: "Riders",
      recipientCount: 3456,
      sentCount: 3456,

      status: "sent",
      createdAt: "2024-01-19T14:15:00Z",
      sentAt: "2024-01-19T14:20:00Z",
      createdBy: "Admin User",
    },
    {
      id: "NOTIF003",
      title: "New Feature: Dark Mode",
      message: "We've added dark mode! Toggle it in your settings.",
      notificationType: "custom",
      audienceType: "specific_users",
      targetAudience: "Both",
      recipientCount: 150,
      sentCount: 0,

      status: "draft",
      createdAt: "2024-01-20T16:45:00Z",
      sentAt: null,
      createdBy: "Admin User",
    },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Preview / confirmation modal state
  const [previewNotification, setPreviewNotification] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      notificationType: "custom", // system_update | safety_alert | custom
      audienceType: "all_users", // all_users | role_based | geo_based | specific_users
      roleTarget: "riders",
      country: "",
      city: "",
      area: "",
      deliveryType: "immediate", // immediate | scheduled
      scheduledAt: "",
      title: "",
      message: "",
      specificTarget: "",
    },
  });

  // watch fields
  const watchAudienceType = watch("audienceType");
  const notificationType = watch("notificationType");
  const watchCountry = watch("country");
  const watchCity = watch("city");
  const watchDeliveryType = watch("deliveryType");
  const watchTitle = watch("title") || "";
  const watchMessage = watch("message") || "";
  const watchArea = watch("area") || "";
  const watchRoleTarget = watch("roleTarget");

  // columns keep same styling and structure
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "title",
      label: "Title",
      render: (value, notification) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {notification.message}
          </p>
        </div>
      ),
    },
    {
      key: "targetAudience",
      label: "Audience",
      render: (value, notification) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "sent"
              ? "success"
              : value === "draft"
              ? "warning"
              : value === "scheduled"
              ? "info"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },

    {
      key: "createdAt",
      label: "Created",
      render: (value, notification) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {notification.sentAt
              ? `Sent: ${new Date(notification.sentAt).toLocaleDateString()}`
              : "Not sent"}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, notification) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(notification)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(notification)}
            icon={<Trash2 className="w-4 h-4" />}
            title="Delete"
          />
        </div>
      ),
    },
  ];

  // helpers to estimate recipient counts for sample/hardcoded filters
  const estimateRecipients = (formValues) => {
    const { audienceType, roleTarget, country, city, area } = formValues || {};
    // simple heuristics — keep same numbers you used previously
    if (audienceType === "all_users") return 12543;
    if (audienceType === "role_based") {
      if (roleTarget === "drivers") return 6000;
      if (roleTarget === "riders") return 7000;
      return 12543;
    }
    if (audienceType === "geo_based") {
      if (country && city && area) return 1200;
      if (country && city) return 3000;
      if (country) return 5000;
      return 1000;
    }
    if (audienceType === "specific_users") return 150;
    return 0;
  };

  // Create new notification (saved as draft)
  const onSubmit = (data) => {
    // validation of character limits (redundant to react-hook rules, but safe)
    const title = (data.title || "").slice(0, 60);
    const message = (data.message || "").slice(0, 200);

    const audienceLabel =
      data.audienceType === "all_users"
        ? "All Users"
        : data.audienceType === "role_based"
        ? data.roleTarget === "drivers"
          ? "Drivers"
          : data.roleTarget === "riders"
          ? "Riders"
          : "Role-based"
        : data.audienceType === "geo_based"
        ? `${data.country || "-"} / ${data.city || "-"} / ${data.area || "-"}`
        : data.specificTarget || "Selected Users";

    const newNotification = {
      id: `NOTIF${String(notifications.length + 1).padStart(3, "0")}`,
      title,
      message,
      notificationType: data.notificationType || "custom",
      audienceType: data.audienceType,
      targetAudience: audienceLabel,
      recipientCount: estimateRecipients(data),
      sentCount: 0,

      status:
        data.deliveryType === "scheduled" && data.scheduledAt
          ? "scheduled"
          : "draft",
      createdAt: new Date().toISOString(),
      sentAt: null,
      createdBy: "Admin User",
      deliveryType: data.deliveryType,
      scheduledAt: data.scheduledAt || null,
    };

    setNotifications([newNotification, ...notifications]);
    setShowCreateModal(false);
    reset(); // clear form
  };

  const handleCreate = () => {
    reset();
    setShowCreateModal(true);
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  // trigger preview modal from an existing notification (table)
  const handlePreviewFromTable = (notification) => {
    setPreviewNotification(notification);
    setShowPreviewModal(true);
  };

  // handle preview from form: show built object then confirm
  const handlePreviewFromForm = (formValues) => {
    // build temporary preview object
    const previewObj = {
      id: `NOTIF_PREVIEW`,
      title: formValues.title,
      message: formValues.message,
      notificationType: formValues.notificationType,
      audienceType: formValues.audienceType,
      targetAudience:
        formValues.audienceType === "all_users"
          ? "All Users"
          : formValues.audienceType === "role_based"
          ? formValues.roleTarget
          : formValues.audienceType === "geo_based"
          ? `${formValues.country || "-"} / ${formValues.city || "-"} / ${
              formValues.area || "-"
            }`
          : formValues.specificTarget || "Selected Users",
      recipientCount: estimateRecipients(formValues),
      deliveryType: formValues.deliveryType,
      scheduledAt: formValues.scheduledAt || null,
      status:
        formValues.deliveryType === "scheduled" && formValues.scheduledAt
          ? "scheduled"
          : "preview",
      createdAt: new Date().toISOString(),
      createdBy: "You (preview)",
    };
    setPreviewNotification(previewObj);
    setShowPreviewModal(true);
  };

  // confirmation: send the previewNotification (if it was existing, update; if preview form, create & send)
  const handleConfirmSend = (notifyObj) => {
    // if it's a preview of an existing saved notification (has real id starting NOTIF)
    if (notifyObj.id && notifyObj.id.startsWith("NOTIF")) {
      // update that notification to sent (simulate)
      const updated = notifications.map((n) =>
        n.id === notifyObj.id
          ? {
              ...n,
              status: "sent",
              sentAt: new Date().toISOString(),
              sentCount: n.recipientCount,
              deliveredCount: Math.floor(n.recipientCount * 0.98),
              openedCount: Math.floor(n.recipientCount * 0.65),
            }
          : n
      );
      setNotifications(updated);
    } else if (notifyObj.id && notifyObj.id === "NOTIF_PREVIEW") {
      // this is a form preview — create & send immediately
      const newNotification = {
        ...notifyObj,
        id: `NOTIF${String(notifications.length + 1).padStart(3, "0")}`,
        status: "sent",
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        sentCount: notifyObj.recipientCount,
        deliveredCount: Math.floor(notifyObj.recipientCount * 0.98),
        openedCount: Math.floor(notifyObj.recipientCount * 0.65),
      };
      setNotifications([newNotification, ...notifications]);
    }
    setShowPreviewModal(false);
    setPreviewNotification(null);
    setShowCreateModal(false);
  };

  const handleSend = (notification) => {
    if (
      confirm(
        `Send notification "${notification.title}" to ${notification.recipientCount} recipients?`
      )
    ) {
      const updatedNotifications = notifications.map((n) =>
        n.id === notification.id
          ? {
              ...n,
              status: "sent",
              sentAt: new Date().toISOString(),
              sentCount: n.recipientCount,
              deliveredCount: Math.floor(n.recipientCount * 0.98),
              openedCount: Math.floor(n.recipientCount * 0.65),
            }
          : n
      );
      setNotifications(updatedNotifications);
    }
  };

  const handleDelete = (notification) => {
    setDeleteTarget(notification);
    setShowDeleteModal(true);
  };
const confirmDelete = () => {
  if (deleteTarget) {
    setNotifications(notifications.filter(n => n.id !== deleteTarget.id));
  }
  setShowDeleteModal(false);
  setDeleteTarget(null);
};

  // stats
  const totalSent = notifications.filter((n) => n.status === "sent").length;
  const totalDrafts = notifications.filter((n) => n.status === "draft").length;
  const totalRecipients = notifications.reduce(
    (sum, n) => sum + (n.sentCount || 0),
    0
  );
  const totalOpened = notifications.reduce(
    (sum, n) => sum + (n.openedCount || 0),
    0
  );
  const avgOpenRate =
    totalRecipients > 0 ? Math.round((totalOpened / totalRecipients) * 100) : 0;

  // dynamic lists derived from watch
  const citiesForCountry = useMemo(
    () => CITIES[watchCountry] || [],
    [watchCountry]
  );
  const areasForCity = useMemo(() => AREAS[watchCity] || [], [watchCity]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}

      {/* Notifications Table */}
      <DataTable
        title="Push Notifications"
        data={notifications}
        columns={columns}
        onAdd={handleCreate}
        searchable={false}
        filterable={false}
        exportable={false}
        addButton={true}
      />

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Push Notification"
        size="lg"
      >
        <form
          onSubmit={handleSubmit((data) => {
            handlePreviewFromForm(data);
          })}
          className="space-y-4"
        >
          {/* Notification Type */}
          <Select
            value={notificationType}
            options={[
              { value: "system_update", label: "System Update" },
              { value: "safety_alert", label: "Safety / Emergency Alert" },
              { value: "custom", label: "Custom Message" },
            ]}
            {...register("notificationType", {
              required: "Notification type is required",
            })}
            error={errors.notificationType?.message}
            placeholder="Select Notification Type"
          />

          {/* Audience */}
          <Select
            label="Audience (Target)"
            value={watchAudienceType}
            options={[
              { value: "all_users", label: "All Users" },
              { value: "role_based", label: "By Role (Drivers/Riders)" },
              // { value: "geo_based", label: "By Geography (Country/City/Area)" },
              // { value: "specific_users", label: "Specific Users" },
            ]}
            {...register("audienceType", {
              required: "Target audience is required",
            })}
            error={errors.audienceType?.message}
            placeholder="Select Target Audience"
          />

          {/* Role target */}
          {watchAudienceType === "role_based" && (
            <Select
              value={watchRoleTarget}
              label="Select Role"
              options={[
                { value: "drivers", label: "Drivers only" },
                { value: "riders", label: "Riders only" },
                { value: "both", label: "Both drivers & riders" },
              ]}
              {...register("roleTarget")}
              placeholder="Select Role"
            />
          )}

        
          {/* {watchAudienceType === "geo_based" && (
            <>
              <Select
                value={watchCountry}
                label="Country"
                options={[{ value: "", label: "Select Country" }, ...COUNTRIES]}
                {...register("country")}
                placeholder="Country"
              />
              <Select
                value={watchCity}
                label="City"
                options={[
                  { value: "", label: "Select City" },
                  ...citiesForCountry,
                ]}
                {...register("city")}
                placeholder="City"
              />
              <Select
                value={watchArea}
                label="Area"
                options={[{ value: "", label: "Select Area" }, ...areasForCity]}
                {...register("area")}
                placeholder="Area / Service Area"
              />
            </>
          )}

        
          {watchAudienceType === "specific_users" && (
            <Input
              label="Specific Target Description"
              {...register("specificTarget")}
              placeholder="e.g., Beta Testers, VIP Users"
            />
          )} */}

        
          <div>
            <Input
              label="Notification Title"
              {...register("title", {
                required: "Title is required",
                maxLength: {
                  value: 60,
                  message: "Title must be 60 characters or less",
                },
              })}
              error={errors.title?.message}
              placeholder="Enter notification title (max 60 chars)"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(watchTitle || "").length}/60
            </p>
          </div>

          {/* Message + counter */}
          <div>
            <TextArea
              label="Message"
              {...register("message", {
                required: "Message is required",
                maxLength: {
                  value: 200,
                  message: "Message must be 200 characters or less",
                },
              })}
              rows={4}
              placeholder="Enter notification message (max 200 chars)"
              error={errors.message?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(watchMessage || "").length}/200
            </p>
          </div>

          {/* Delivery options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="immediate"
                  {...register("deliveryType")}
                  defaultChecked
                />
                <span className="text-sm">Send Immediately</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="scheduled"
                  {...register("deliveryType")}
                />
                <span className="text-sm">Schedule</span>
              </label>
            </div>

            {watchDeliveryType === "scheduled" && (
              <div className="mt-2">
                <Input
                  label="Schedule date/time"
                  type="datetime-local"
                  {...register("scheduledAt", {
                    required: "Schedule time is required",
                  })}
                />
                {errors.scheduledAt && (
                  <p className="text-xs text-red-500">
                    {errors.scheduledAt.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Leave schedule empty to save as draft.
          </p>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>

            {/* Preview button: shows preview modal where admin can confirm send */}
            <Button
              type="button"
              onClick={handleSubmit((data) => {
                // show preview (without creating in list yet)
                handlePreviewFromForm(data);
              })}
            >
              Preview
            </Button>

            {/* Create as draft */}
            <Button
              type="button"
              onClick={handleSubmit((data) => {
                // create as draft directly
                onSubmit(data);
              })}
            >
              Save Draft
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview / Confirmation Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewNotification(null);
        }}
        title="Preview Notification"
        size="md"
      >
        {previewNotification && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 uppercase mb-1">
                {previewNotification.notificationType === "safety_alert"
                  ? "SAFETY ALERT"
                  : previewNotification.notificationType === "system_update"
                  ? "SYSTEM UPDATE"
                  : "CUSTOM"}
              </p>
              <h3 className="text-lg font-semibold">
                {previewNotification.title}
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                {previewNotification.message}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                <div>Audience: {previewNotification.targetAudience}</div>
                {/* <div>
                  Recipients:{" "}
                  {previewNotification.recipientCount?.toLocaleString() || 0}
                </div> */}
                <div>
                  Delivery:{" "}
                  {previewNotification.deliveryType ||
                    previewNotification.status}
                </div>
                {previewNotification.scheduledAt && (
                  <div>
                    Scheduled at:{" "}
                    {formatDateTime(previewNotification.scheduledAt)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewNotification(null);
                }}
              >
                Cancel
              </Button>

              <Button onClick={() => handleConfirmSend(previewNotification)}>
                Confirm & Send
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Notification Detail Modal (existing behavior) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Notification Details"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-6">
            {/* Notification Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedNotification.title}
                </h3>
                <Badge
                  variant={
                    selectedNotification.status === "sent"
                      ? "success"
                      : selectedNotification.status === "draft"
                      ? "warning"
                      : "info"
                  }
                >
                  {selectedNotification.status}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {selectedNotification.message}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Target: {selectedNotification.targetAudience}</span>
                
                <span>•</span>
                <span>
                  Created: {formatDateTime(selectedNotification.createdAt)}
                </span>
              </div>
            </div>
{console.log(selectedNotification,"selectedNotification")}
            {/* Stats Grid */}
          

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Notification Created</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(selectedNotification.createdAt)}
                    </p>
                  </div>
                </div>
                {selectedNotification.sentAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Notification Sent</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(selectedNotification.sentAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              {selectedNotification.status === "draft" && (
                <Button
                  onClick={() => {
                    handleSend(selectedNotification);
                    setShowDetailModal(false);
                  }}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send Now
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Notification"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the notification
              <span className="font-semibold"> "{deleteTarget.title}" </span>?
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                No
              </Button>

              <Button variant="danger" onClick={confirmDelete}>
                Yes, Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;
