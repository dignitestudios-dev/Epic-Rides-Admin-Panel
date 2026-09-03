import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import useGetUserDetails from "../hooks/users/useGetUserDetails";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Avatar from "../components/ui/Avatar";
import PageHeader from "../components/common/PageHeader";
import MetricStrip from "../components/common/MetricStrip";
import DetailList from "../components/common/DetailList";
import EditProfileModal from "../components/common/EditProfileModal";
import {
  formatDate,
  handleError,
  handleSuccess,
  maskEmail,
  maskPhone,
} from "../utils/helpers";
import { api } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const placeCell = (point) => (
  <span className="block max-w-[180px] truncate" title={point?.placeName}>
    {point?.placeName || "—"}
  </span>
);

const statusBadge = (value) => (
  <Badge
    className="capitalize"
    variant={value?.toLowerCase() === "completed" ? "success" : "danger"}
  >
    {value || "—"}
  </Badge>
);

const Panel = ({ title, count, children }) => (
  <Card padding="p-0" className="overflow-hidden">
    <div className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-line">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {count != null && (
        <span className="tnum text-caption text-ink-subtle">{count}</span>
      )}
    </div>
    {children}
  </Card>
);

const RiderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { details, loading, refresh } = useGetUserDetails(id, "rider");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const editInitialData = useMemo(
    () => ({
      firstName: details?.fullDetails?.firstName || "",
      lastName: details?.fullDetails?.lastName || "",
      email: details?.personalInfo?.email || details?.fullDetails?.email || "",
      subscriptionStatus: details?.fullDetails?.subscriptionStatus || "",
      balance: 0,
    }),
    [details]
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await api.deleteUser(id, "rider");
      handleSuccess(response?.message, "Rider deleted");
      setDeleteModalOpen(false);
      navigate("/user-management");
    } catch (error) {
      handleError(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="skeleton h-72 w-full" />
          <div className="skeleton h-72 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <Card className="text-center py-14">
        <h2 className="text-xl font-semibold text-ink">Rider not found</h2>
        <p className="mt-1 text-sm text-ink-muted">
          This account may have been deleted.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          icon={<ArrowLeft />}
          onClick={() => navigate("/user-management")}
        >
          Back to riders
        </Button>
      </Card>
    );
  }

  const {
    personalInfo,
    rideStats,
    rideHistory = [],
    activityLogs,
    transactionHistory = [],
    walletBalance,
    carpoolHistory = [],
  } = details;

  const fullName =
    [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") ||
    "Unnamed rider";
  const isActive = personalInfo?.status?.toLowerCase() === "active";
  const canSeeSensitive = hasPermission("seeSensitiveData");
  const email = personalInfo?.email;
  const phone = personalInfo?.phone || personalInfo?.phoneNumber;

  const metrics = [
    { label: "Wallet balance", value: money(walletBalance) },
    ...(details?.rewardedBalance != null
      ? [{ label: "Rewarded balance", value: money(details.rewardedBalance) }]
      : []),
    { label: "Rides completed", value: rideStats?.totalCompleted ?? 0 },
    { label: "Rides cancelled", value: rideStats?.totalCancelled ?? 0 },
    {
      label: "Average rating",
      value: Number.isFinite(Number(details?.averageRating))
        ? Number(details.averageRating).toFixed(1)
        : "—",
    },
  ];

  const rideColumns = [
    { key: "createdAt", label: "Date", render: (value) => formatDate(value) },
    {
      key: "driver",
      label: "Driver",
      render: (driver) =>
        [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "—",
    },
    { key: "pickupPoint", label: "Pickup", render: placeCell },
    { key: "dropOffPointRequested", label: "Drop-off", render: placeCell },
    {
      key: "rideFare",
      label: "Fare",
      numeric: true,
      render: (value) => money(value),
    },
    { key: "rideStatus", label: "Status", render: statusBadge },
  ];

  const carpoolColumns = [
    { key: "createdAt", label: "Date", render: (value) => formatDate(value) },
    {
      key: "driver",
      label: "Driver",
      render: (driver) =>
        [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "—",
    },
    { key: "startingPoint", label: "Pickup", render: placeCell },
    { key: "destination", label: "Drop-off", render: placeCell },
    {
      key: "fareCharged",
      label: "Fare",
      numeric: true,
      render: (value) => money(value),
    },
    { key: "status", label: "Status", render: statusBadge },
  ];

  const transactionColumns = [
    {
      key: "createdAt",
      label: "Date",
      render: (value, row) => formatDate(value || row.date),
    },
    { key: "description", label: "Description" },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const state = value?.toLowerCase();
        return (
          <Badge
            className="capitalize"
            variant={
              state === "success"
                ? "success"
                : state === "failed"
                ? "danger"
                : "warning"
            }
          >
            {value || "—"}
          </Badge>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      numeric: true,
      render: (value, row) => (
        <span className={row.type === "credit" ? "text-success" : "text-ink"}>
          {row.type === "credit" ? "+" : "−"}
          {money(Math.abs(value))}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft />}
        onClick={() => navigate("/user-management")}
        className="-ml-2"
      >
        Riders
      </Button>

      <PageHeader
        title={fullName}
        summary={`Rider · joined ${formatDate(details.fullDetails?.createdAt)}`}
        actions={
          hasPermission("manageUsers") && (
            <>
              <Button
                variant="secondary"
                icon={<Pencil />}
                onClick={() => setEditModalOpen(true)}
              >
                Edit profile
              </Button>
              <Button
                variant="danger-ghost"
                icon={<Trash2 />}
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </>
          )
        }
      />

      <MetricStrip metrics={metrics} columns={metrics.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Identity */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-line">
            <Avatar
              name={fullName}
              src={personalInfo?.profilePicture}
              size="xl"
            />
            <div className="min-w-0">
              <p className="font-semibold text-ink truncate">{fullName}</p>
              <Badge
                variant={isActive ? "success" : "neutral"}
                className="mt-1.5"
              >
                {isActive ? "Active" : personalInfo?.status || "Disabled"}
              </Badge>
            </div>
          </div>

          <DetailList
            items={[
              {
                label: "Email",
                icon: Mail,
                value: canSeeSensitive ? email : maskEmail(email),
              },
              {
                label: "Phone",
                icon: Phone,
                mono: true,
                value: canSeeSensitive ? phone : maskPhone(phone),
              },
              {
                label: "Address",
                icon: MapPin,
                value: personalInfo?.address || details?.fullDetails?.address,
              },
              {
                label: "Joined",
                icon: Calendar,
                mono: true,
                value: formatDate(details.fullDetails?.createdAt),
              },
            ]}
          />

          <div className="mt-4 pt-4 border-t border-line">
            <h3 className="eyebrow mb-2.5">Activity</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-muted">Last login</dt>
                <dd className="tnum text-ink">
                  {activityLogs?.lastLogin
                    ? formatDate(activityLogs.lastLogin)
                    : "Never"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-muted">Last ride</dt>
                <dd className="tnum text-ink">
                  {activityLogs?.lastRideTaken
                    ? formatDate(activityLogs.lastRideTaken)
                    : "No rides yet"}
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Ride history" count={rideHistory.length}>
            <Table
              data={rideHistory}
              columns={rideColumns}
              maxHeight="360px"
              emptyMessage="No rides yet"
              emptyHint="Completed and cancelled rides will appear here."
            />
          </Panel>

          <Panel title="Carpool history" count={carpoolHistory.length}>
            <Table
              data={carpoolHistory}
              columns={carpoolColumns}
              maxHeight="360px"
              emptyMessage="No carpool rides yet"
            />
          </Panel>

          <Panel title="Transactions" count={transactionHistory.length}>
            <Table
              data={transactionHistory}
              columns={transactionColumns}
              maxHeight="360px"
              emptyMessage="No transactions yet"
              emptyHint="Top-ups and ride payments will appear here."
            />
          </Panel>
        </div>
      </div>

      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={id}
        type="rider"
        initialData={editInitialData}
        onSuccess={refresh}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete this rider?"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Delete rider
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink">
          <span className="font-medium">{fullName}</span> and all associated ride
          and transaction data will be permanently removed.
        </p>
        <p className="mt-2 text-caption text-ink-muted">
          This can&rsquo;t be undone.
        </p>
      </Modal>
    </div>
  );
};

export default RiderDetail;
