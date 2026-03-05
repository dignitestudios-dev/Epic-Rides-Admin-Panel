// pages/DriverDetails.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/services";
import { formatDateTime, handleError } from "../utils/helpers";
import useGetDocuments from "../hooks/Docs/useGetDocuments";
import toast from "react-hot-toast";

// ── helpers ───────────────────────────────────────────────────────────────────

const statusBadge = (status) => {
  const map = {
    approved:
      "bg-emerald-100 capitalize text-emerald-700 border border-emerald-200",
    rejected: "bg-red-100 capitalize text-red-700 border border-red-200",
    pending: "bg-amber-100 capitalize text-amber-700 border border-amber-200",
  };
  return (
    map[status] ?? "bg-gray-100 capitalize text-gray-600 border border-gray-200"
  );
};

const statusDot = (status) => {
  const map = {
    approved: "bg-emerald-500 capitalize",
    rejected: "bg-red-500 capitalize",
    pending: "bg-amber-400 capitalize",
  };
  return map[status] ?? "bg-gray-400 capitalize";
};

// ── skeleton loaders ──────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const DocCardSkeleton = () => (
  <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-28 w-full rounded-xl" />
    <div className="flex gap-2">
      <Skeleton className="h-8 flex-1 rounded-lg" />
      <Skeleton className="h-8 flex-1 rounded-lg" />
    </div>
  </div>
);

// ── sub-components ────────────────────────────────────────────────────────────

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-3">
    {icon && <span className="text-gray-400 text-base">{icon}</span>}
    <div className="flex flex-col min-w-0">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-800 font-semibold truncate">
        {value ?? "—"}
      </span>
    </div>
  </div>
);

const Detail = ({ label, value }) => (
  <div className="flex justify-between items-center text-xs py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right max-w-[55%] truncate">
      {value || "—"}
    </span>
  </div>
);

// ── DocCard ───────────────────────────────────────────────────────────────────

const DocCard = ({ doc, bulkRejectMode, bulkReasons, setBulkReasons }) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(doc.status);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [imgError, setImgError] = useState({});
  const navigate = useNavigate();

  const respond = async (status) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.updateDocs([
        {
          id: doc._id,
          status,
          rejectReason: status === "rejected" ? reason : null,
        },
        [],
      ]);
      setLocalStatus(status);
      setShowReject(false);
      navigate(-1);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyProcessed = localStatus !== "pending";
  const showBulkRejectBox = bulkRejectMode && localStatus === "pending";
  return (
    <div
      className={`border rounded-2xl p-4 bg-white shadow-sm flex flex-col gap-3 transition-all duration-200 ${isAlreadyProcessed ? "opacity-75" : "hover:shadow-md"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📄</span>
          <span className="font-semibold capitalize text-sm text-gray-800">
            {doc.type}
          </span>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusBadge(localStatus)}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusDot(localStatus)}`}
          />
          {localStatus}
        </span>
      </div>

      {/* Images */}
      <div className="space-y-2">
        {doc.frontImage && (
          <div className="relative">
            {!imgError.front ? (
              <img
                src={doc.frontImage}
                alt="Document front"
                className="w-full h-28 object-cover rounded-xl bg-gray-100"
                onError={() => setImgError((p) => ({ ...p, front: true }))}
              />
            ) : (
              <div className="w-full h-28 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Image unavailable
              </div>
            )}
            <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded-md">
              Front
            </span>
          </div>
        )}
        {doc.backImage && (
          <div className="relative">
            {!imgError.back ? (
              <img
                src={doc.backImage}
                alt="Document back"
                className="w-full h-28 object-cover rounded-xl bg-gray-100"
                onError={() => setImgError((p) => ({ ...p, back: true }))}
              />
            ) : (
              <div className="w-full h-28 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Image unavailable
              </div>
            )}
            <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded-md">
              Back
            </span>
          </div>
        )}
      </div>

      {doc.metadata?.expiryDate && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span>📅</span> Expires: {formatDateTime(doc.metadata.expiryDate)}
        </p>
      )}

      {showBulkRejectBox && (
        <div className="space-y-2 pt-2">
          <textarea
            placeholder="Enter reject reason..."
            className="w-full border border-gray-200 rounded-xl p-2.5 text-xs resize-none"
            rows={3}
            value={bulkReasons[doc._id] || ""}
            onChange={(e) =>
              setBulkReasons((prev) => ({
                ...prev,
                [doc._id]: e.target.value,
              }))
            }
          />
        </div>
      )}

      {/* Actions */}
      {!isAlreadyProcessed ? (
        <>
          {!bulkRejectMode && (
            <>
              <div className="flex gap-2">
                <button
                  disabled={loading}
                  onClick={() => respond("approved")}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="emerald" />
                  ) : (
                    "✓ Approve"
                  )}
                </button>
                <button
                  disabled={loading}
                  onClick={() => setShowReject((v) => !v)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕ Reject
                </button>
              </div>

              {showReject && (
                <div className="space-y-2 pt-1">
                  <textarea
                    placeholder="Enter reject reason (required)…"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReject(false)}
                      className="flex-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={loading || !reason.trim()}
                      onClick={() => respond("rejected")}
                      className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-xs hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        "Confirm Reject"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div
          className={`text-center text-xs py-1.5 rounded-lg font-medium ${localStatus === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
        >
          {localStatus === "approved" ? "✓ Approved" : "✕ Rejected"}
        </div>
      )}
    </div>
  );
};

// ── VehicleCard ───────────────────────────────────────────────────────────────

const VehicleCard = ({ vehicle }) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(vehicle.status);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const respond = async (status) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.updateDocs(
        [],
        [
          {
            id: vehicle._id,
            status,
            rejectReason: status === "rejected" ? reason : null,
          },
        ],
      );
      setLocalStatus(status);
      setShowReject(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      {/* Vehicle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚗</span>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{vehicle.make}</h3>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusBadge(localStatus)}`}
        >
          <span
            className={`w-1.5 h-1.5 capitalize rounded-full ${statusDot(localStatus)}`}
          />
          {localStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
        {/* Vehicle Details */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Vehicle Info
          </p>
          <div className="bg-gray-50 rounded-xl p-3">
            <Detail label="Model" value={vehicle.model} />
            <Detail label="Color" value={vehicle.color} />
            <Detail label="VIN" value={vehicle.vehicleIdentificationNumber} />
            <Detail label="Registration #" value={vehicle.registrationNumber} />
            <Detail
              label="License Plate #"
              value={vehicle.licensePlateNumber}
            />
            <Detail label="Region" value={vehicle.regionOfRegistration} />
            <Detail
              label="Year of Manufacture"
              value={vehicle.yearOfManufacture}
            />
            <Detail label="Vehicle Type" value={vehicle.vehicleType} />
            <Detail
              label="Expiry Date"
              value={formatDate(vehicle.expiryDate)}
            />
            <Detail label="Created At" value={formatDate(vehicle.createdAt)} />
          </div>
        </div>

        {/* Driver Details */}
        {vehicle.driver && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Driver Info
            </p>
            <div className="bg-gray-50 rounded-xl p-3">
              <Detail label="Name" value={vehicle.driver.name} />
              <Detail label="Email" value={vehicle.driver.email} />
              <Detail label="Phone" value={vehicle.driver.phone} />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {localStatus === "pending" ? (
        <div className="space-y-2 pt-1 border-t border-gray-50">
          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={() => respond("approved")}
              className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="emerald" />
              ) : (
                "✓ Approve Vehicle"
              )}
            </button>
            <button
              disabled={loading}
              onClick={() => setShowReject((v) => !v)}
              className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
            >
              ✕ Reject Vehicle
            </button>
          </div>
          {showReject && (
            <div className="space-y-2">
              <textarea
                placeholder="Enter reject reason…"
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReject(false)}
                  className="flex-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={loading || !reason.trim()}
                  onClick={() => respond("rejected")}
                  className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-xs hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    "Confirm Reject"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`text-center text-xs py-2 rounded-lg font-medium ${localStatus === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
        >
          {localStatus === "approved"
            ? "✓ Vehicle Approved"
            : "✕ Vehicle Rejected"}
        </div>
      )}
    </div>
  );
};

// ── LoadingSpinner ────────────────────────────────────────────────────────────

const LoadingSpinner = ({ size = "md", color = "gray" }) => {
  const sizeMap = { sm: "w-3 h-3 border-[1.5px]", md: "w-4 h-4 border-2" };
  const colorMap = {
    gray: "border-gray-300 border-t-gray-600",
    emerald: "border-emerald-300 border-t-emerald-700",
    white: "border-white/30 border-t-white",
  };
  return (
    <span
      className={`inline-block rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`}
    />
  );
};

// ── StatBadge ─────────────────────────────────────────────────────────────────

const StatBadge = ({ count, label, color }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-600 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <div
      className={`flex  items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colorMap[color]}`}
    >
      <span className="font-bold">{count}</span>
      <span className="capitalize">{label}</span>
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────

const DriverDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [bulkRejectMode, setBulkRejectMode] = useState(false);
  const [bulkReasons, setBulkReasons] = useState({});
  const { driver, documents, vehicles } = state;
  const { bulkDone, bulkLoading, bulkRespond } = useGetDocuments(
    "",
    "pending",
    1,
    100,
  );

  const pendingDocs = documents.filter((d) => d.status === "pending");
  const approvedDocs = documents.filter((d) => d.status === "approved");
  const rejectedDocs = documents.filter((d) => d.status === "rejected");

  const handleBulkSubmit = async () => {
    const docsToReject = pendingDocs.map((doc) => ({
      _id: doc._id,
      status: "rejected",
      rejectReason: bulkReasons[doc._id] || "",
    }));

    if (docsToReject.some((d) => !d.rejectReason.trim())) {
      toast.error("All reject reasons are required.");
      return;
    }

    bulkRespond(docsToReject, [], "rejected");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <div className=" bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            <span className="text-base">←</span> Back to Drivers
          </button>
          <span className="text-xs text-gray-400 hidden sm:block">
            Driver ID: {driver._id}
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 space-y-5">
        {/* Driver Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/30 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 flex items-center justify-center text-2xl font-bold uppercase shadow-inner shrink-0">
              {driver.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{driver.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                ID: {driver._id}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatBadge
                  count={documents.length}
                  label="Total"
                  color="gray"
                />
                {pendingDocs.length > 0 && (
                  <StatBadge
                    count={pendingDocs.length}
                    label="Pending"
                    color="amber"
                  />
                )}
                {approvedDocs.length > 0 && (
                  <StatBadge
                    count={approvedDocs.length}
                    label="Approved"
                    color="emerald"
                  />
                )}
                {rejectedDocs.length > 0 && (
                  <StatBadge
                    count={rejectedDocs.length}
                    label="Rejected"
                    color="red"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 mt-5">
            <InfoRow label="Email" value={driver.email} icon="✉️" />
            <InfoRow label="Phone" value={driver.phone} icon="📞" />
            <InfoRow
              label="Vehicles"
              value={`${vehicles?.length ?? 0} registered`}
              icon="🚗"
            />
          </div>
        </div>
        {/* Documents Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-bold text-gray-800">Documents</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                submitted
                {pendingDocs.length > 0 &&
                  ` · ${pendingDocs.length} awaiting review`}
              </p>
            </div>
            {pendingDocs.length > 0 && (
              <div className="flex gap-2 shrink-0">
                {!bulkRejectMode ? (
                  <>
                    <button
                      disabled={bulkLoading}
                      onClick={() => bulkRespond(pendingDocs, "approved")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700"
                    >
                      ✓ Approve All
                    </button>

                    <button
                      disabled={bulkLoading}
                      onClick={() => setBulkRejectMode(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-600"
                    >
                      ✕ Reject All
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setBulkRejectMode(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={bulkLoading}
                      onClick={handleBulkSubmit}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white"
                    >
                      Submit
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {bulkDone && (
            <div
              className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${bulkDone === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}
            >
              <span>{bulkDone === "approved" ? "✓" : "✕"}</span>
              All documents have been {bulkDone}.
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📂</p>
              <p className="text-sm">No documents submitted yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocCard
                  key={doc._id}
                  doc={doc}
                  bulkRejectMode={bulkRejectMode}
                  bulkReasons={bulkReasons}
                  setBulkReasons={setBulkReasons}
                />
              ))}
            </div>
          )}
        </div>

        {/* Vehicles */}
        {vehicles?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-800">Vehicles</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {vehicles.length}
              </span>
            </div>
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDetails;
