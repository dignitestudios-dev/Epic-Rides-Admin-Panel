import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
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
  formatPhoneNumber,
  handleError,
  handleSuccess,
  maskEmail,
  maskPhone,
} from "../utils/helpers";
import { api } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";
import { usePersistentState } from "../hooks/global/usePersistentState";

const SUB_LIMIT = 10;

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const placeCell = (point) => (
  <span className="block max-w-[180px] truncate" title={point?.placeName}>
    {point?.placeName || "—"}
  </span>
);

const rideStatusBadge = (value) => (
  <Badge
    className="capitalize"
    variant={value?.toLowerCase() === "completed" ? "success" : "danger"}
  >
    {value || "—"}
  </Badge>
);

const DOC_TONE = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
};

const Panel = ({ title, count, action, children }) => (
  <Card padding="p-0" className="overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="text-lg font-semibold text-ink truncate">{title}</h2>
        {count != null && (
          <span className="tnum text-caption text-ink-subtle shrink-0">{count}</span>
        )}
      </div>
      {action}
    </div>
    {children}
  </Card>
);

const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { details, loading, refresh } = useGetUserDetails(id, "driver");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [subHistoryLoading, setSubHistoryLoading] = useState(false);
  const [subPage, setSubPage] = usePersistentState(`driver_${id}_subPage`, 1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subTotal, setSubTotal] = useState(0);

  useEffect(() => {
    if (!id) return;
    setSubHistoryLoading(true);
    api
      .getDriverTransactions(id, subPage, SUB_LIMIT)
      .then((res) => {
        setSubscriptionHistory(res?.data?.transactions || []);
        setSubTotalPages(res?.data?.pagination?.totalPages || 1);
        setSubTotal(res?.data?.totalTransactions ?? 0);
      })
      .catch(() => setSubscriptionHistory([]))
      .finally(() => setSubHistoryLoading(false));
  }, [id, subPage]);

  const editInitialData = useMemo(
    () => ({
      firstName:
        details?.fullDetails?.firstName || details?.personalInfo?.firstName || "",
      lastName:
        details?.fullDetails?.lastName || details?.personalInfo?.lastName || "",
      email: details?.personalInfo?.email || details?.fullDetails?.email || "",
      subscriptionStatus:
        details?.fullDetails?.subscriptionStatus ||
        details?.subscriptionStatus ||
        "",
      balance: 0,
    }),
    [details]
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await api.deleteUser(id, "driver");
      handleSuccess(response?.message, "Driver deleted");
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
          <div className="skeleton h-96 w-full" />
          <div className="skeleton h-96 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <Card className="text-center py-14">
        <h2 className="text-xl font-semibold text-ink">Driver not found</h2>
        <p className="mt-1 text-sm text-ink-muted">
          This account may have been deleted.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          icon={<ArrowLeft />}
          onClick={() => navigate("/user-management")}
        >
          Back to drivers
        </Button>
      </Card>
    );
  }

  const {
    personalInfo,
    rideStats,
    vehicleDetails,
    approvedDocuments,
    rideHistory = [],
    ratingAndFeedback,
    subscriptionStatus,
    revenue,
    referralInfo,
    carpoolHistory = [],
    transactionHistory = [],
    activityLogs,
  } = details;

  const fullName =
    [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") ||
    "Unnamed driver";
  const isActive = personalInfo?.status?.toLowerCase() === "active";
  const subscribed = subscriptionStatus?.toLowerCase() === "active";
  const canSeeSensitive = hasPermission("seeSensitiveData");
  const phone = personalInfo?.phone || personalInfo?.phoneNumber;
  const documents = Object.entries(approvedDocuments || {});

  const metrics = [
    { label: "Wallet balance", value: money(details?.walletBalance) },
    ...(details?.rewardedBalance != null
      ? [{ label: "Rewarded balance", value: money(details.rewardedBalance) }]
      : []),
    { label: "Rides completed", value: rideStats?.totalCompleted ?? 0 },
    { label: "Rides cancelled", value: rideStats?.totalCancelled ?? 0 },
    {
      label: "Admin commission",
      value: money(revenue?.adminCommission),
      context: "3% of earnings",
    },
  ];

  const rideColumns = [
    { key: "createdAt", label: "Date", render: (value) => formatDate(value) },
    {
      key: "user",
      label: "Rider",
      render: (rider) =>
        [rider?.firstName, rider?.lastName].filter(Boolean).join(" ") || "—",
    },
    { key: "pickupPoint", label: "Pickup", render: placeCell },
    { key: "dropOffPointRequested", label: "Drop-off", render: placeCell },
    {
      key: "rideFare",
      label: "Earnings",
      numeric: true,
      render: (value) => money(value),
    },
    { key: "rideStatus", label: "Status", render: rideStatusBadge },
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
    { key: "status", label: "Status", render: rideStatusBadge },
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

  const subscriptionColumns = [
    { key: "createdAt", label: "Date", render: (value) => formatDate(value) },
    {
      key: "amount",
      label: "Amount",
      numeric: true,
      render: (value) => money(value),
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (value) => (
        <span className="capitalize">{value?.replace(/_/g, " ") || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          className="capitalize"
          variant={value?.toLowerCase() === "success" ? "success" : "danger"}
        >
          {value || "—"}
        </Badge>
      ),
    },
    {
      key: "isActivationTransaction",
      label: "Type",
      render: (value) => (
        <Badge variant={value ? "primary" : "default"}>
          {value ? "Activation" : "Renewal"}
        </Badge>
      ),
    },
  ];

  const referralColumns = [
    {
      key: "firstName",
      label: "Referred driver",
      render: (_, row) => (
        <span className="font-medium text-ink">
          {[row.firstName, row.lastName].filter(Boolean).join(" ") || "—"}
        </span>
      ),
    },
    {
      key: "id",
      label: "",
      align: "right",
      render: (value) => (
        <Button
          variant="ghost"
          size="sm"
          iconRight={<ChevronRight />}
          onClick={() => navigate(`/user-management/driver/${value}`)}
        >
          Profile
        </Button>
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
        Drivers
      </Button>

      <PageHeader
        title={fullName}
        summary={`Driver · joined ${formatDate(
          activityLogs?.accountCreationDate
        )}`}
        actions={
          <>
            <Badge variant={subscribed ? "success" : "danger"} size="lg">
              {subscribed ? "Subscribed" : "Unsubscribed"}
            </Badge>
            {hasPermission("manageUsers") && (
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
            )}
          </>
        }
      />

      <MetricStrip metrics={metrics} columns={metrics.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left column */}
        <div className="space-y-4">
          <Card>
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
                  value: canSeeSensitive
                    ? personalInfo?.email
                    : maskEmail(personalInfo?.email),
                },
                {
                  label: "Phone",
                  icon: Phone,
                  mono: true,
                  value: canSeeSensitive
                    ? formatPhoneNumber(phone)
                    : maskPhone(phone),
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
                  value: formatDate(activityLogs?.accountCreationDate),
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

          <Card>
            <Card.Header divided>
              <Card.Title className="flex items-center gap-2">
                <Car className="w-4 h-4 text-ink-faint" aria-hidden="true" />
                Vehicle
              </Card.Title>
            </Card.Header>
            <DetailList
              columns={2}
              items={[
                {
                  label: "Make & model",
                  value: [vehicleDetails?.make, vehicleDetails?.model]
                    .filter(Boolean)
                    .join(" "),
                  span: 2,
                },
                {
                  label: "Year",
                  mono: true,
                  value:
                    vehicleDetails?.yearOfManufacture || vehicleDetails?.year,
                },
                {
                  label: "Color",
                  value: vehicleDetails?.color,
                },
                {
                  label: "Plate",
                  mono: true,
                  value:
                    vehicleDetails?.licensePlateNumber ||
                    vehicleDetails?.plateNumber,
                },
                {
                  label: "Type",
                  value: vehicleDetails?.vehicleType && (
                    <span className="capitalize">
                      {vehicleDetails.vehicleType}
                    </span>
                  ),
                },
              ]}
            />
          </Card>

          <Card>
            <Card.Header divided>
              <Card.Title>Documents</Card.Title>
              <Link
                to={`/driver/${id}`}
                className="inline-flex items-center gap-1.5 h-7 px-2 rounded text-caption font-medium text-ink-muted border border-line hover:bg-surface-hover hover:text-ink transition-colors"
              >
                Review all
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Card.Header>

            {documents.length > 0 ? (
              <ul className="space-y-1.5">
                {documents.slice(0, 4).map(([key, doc]) => (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-3 py-1.5"
                  >
                    <span className="text-sm text-ink capitalize truncate">
                      {key.replace(/_/g, " ")}
                    </span>
                    <Badge
                      size="sm"
                      className="capitalize"
                      variant={DOC_TONE[doc?.status?.toLowerCase()] ?? "neutral"}
                    >
                      {doc?.status || "unknown"}
                    </Badge>
                  </li>
                ))}
                {documents.length > 4 && (
                  <li className="pt-1.5 text-caption text-ink-subtle border-t border-line-subtle">
                    +{documents.length - 4} more
                  </li>
                )}
              </ul>
            ) : (
              <p className="py-4 text-sm text-ink-subtle">
                No documents submitted.
              </p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Recent rides" count={rideHistory.length}>
            <Table
              data={rideHistory}
              columns={rideColumns}
              maxHeight="360px"
              emptyMessage="No rides yet"
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
            />
          </Panel>

          <Panel
            title="Reviews"
            action={
              <span className="flex items-center gap-1.5 shrink-0">
                <Star
                  className="w-3.5 h-3.5 text-accent-400 fill-accent-400"
                  aria-hidden="true"
                />
                <span className="tnum text-lg font-semibold text-ink">
                  {ratingAndFeedback?.rating ?? 0}
                </span>
                <span className="tnum text-caption text-ink-subtle">
                  ({ratingAndFeedback?.reviewsCount ?? 0})
                </span>
              </span>
            }
          >
            {ratingAndFeedback?.recentReviews?.length > 0 ? (
              <ul className="divide-y divide-line-subtle max-h-[360px] overflow-y-auto">
                {ratingAndFeedback.recentReviews.map((review, index) => (
                  <li key={index} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-caption font-medium text-ink">
                        {review.reviewerType === "User" ? "Rider" : "Driver"}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Star
                          className="w-3 h-3 text-accent-400 fill-accent-400"
                          aria-hidden="true"
                        />
                        <span className="tnum text-caption font-medium text-ink">
                          {review.stars}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted">{review.description}</p>
                    <p className="tnum mt-1 text-micro text-ink-faint">
                      {formatDate(review.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-10 text-center text-sm text-ink-subtle">
                No reviews yet.
              </p>
            )}
          </Panel>

          <Panel
            title="Referrals"
            count={referralInfo?.totalReferrals ?? 0}
          >
            <Table
              data={referralInfo?.referrals ?? []}
              columns={referralColumns}
              maxHeight="300px"
              emptyMessage="No referrals yet"
              emptyHint="Drivers this account brought onto the platform will appear here."
            />
          </Panel>

          <Panel title="Subscription history" count={subTotal}>
            <Table
              data={subscriptionHistory}
              columns={subscriptionColumns}
              loading={subHistoryLoading}
              skeletonRows={4}
              maxHeight="360px"
              emptyMessage="No subscription history"
            />

            {subTotalPages > 1 && (
              <nav
                className="flex items-center justify-end gap-1 px-4 py-2.5 border-t border-line"
                aria-label="Subscription history pages"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft />}
                  aria-label="Previous page"
                  disabled={subPage === 1 || subHistoryLoading}
                  onClick={() => setSubPage((page) => page - 1)}
                />
                <span className="tnum px-2 text-caption text-ink-muted">
                  {subPage} / {subTotalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  aria-label="Next page"
                  disabled={subPage === subTotalPages || subHistoryLoading}
                  onClick={() => setSubPage((page) => page + 1)}
                />
              </nav>
            )}
          </Panel>
        </div>
      </div>

      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={id}
        type="driver"
        initialData={editInitialData}
        onSuccess={refresh}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete this driver?"
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
              Delete driver
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink">
          <span className="font-medium">{fullName}</span>, along with their
          vehicle, documents and ride history, will be permanently removed.
        </p>
        <p className="mt-2 text-caption text-ink-muted">
          This can&rsquo;t be undone.
        </p>
      </Modal>
    </div>
  );
};

export default DriverDetail;
