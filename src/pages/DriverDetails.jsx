// pages/DriverDetails.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/services";
import { handleError } from "../utils/helpers";
import useGetDocuments from "../hooks/Docs/useGetDocuments";

// ── helpers ──────────────────────────────────────────────────────────────────

const statusBadge = (status) => {
  const map = {
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
};

// ── sub-components ────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="w-24 text-gray-400 font-medium shrink-0">{label}</span>
    <span className="text-gray-800 font-semibold">{value ?? "—"}</span>
  </div>
);

const DocCard = ({ doc, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(doc.status);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const respond = async (status) => {
    setLoading(true);
    try {
      await api.updateDocs([
        {
          id: doc._id,
          status,
          rejectReason: status === "rejected" ? reason : null,
        },
      ]);

      setLocalStatus(status);
      //   refresh();

      setShowReject(false);
      navigate(-1); // Navigate back to the previous page (driver list)
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-2xl p-4 bg-white shadow-sm flex flex-col gap-3">
      <div className="flex justify-between">
        <span className="font-semibold capitalize text-sm">{doc.type}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(localStatus)}`}
        >
          {localStatus}
        </span>
      </div>

      <img
        src={doc.frontImage}
        className="w-full h-28 object-cover rounded-xl"
      />

      {doc.backImage && (
        <img
          src={doc.backImage}
          className="w-full h-28 object-cover rounded-xl"
        />
      )}

      {doc.metadata?.expiryDate && (
        <p className="text-xs text-gray-500">
          Expiry: {doc.metadata.expiryDate}
        </p>
      )}

      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => respond("approved")}
          className="flex-1 py-1.5 rounded-lg text-xs bg-emerald-50 text-emerald-700"
        >
          Approve
        </button>

        <button
          disabled={loading}
          onClick={() => setShowReject(true)}
          className="flex-1 py-1.5 rounded-lg text-xs bg-red-50 text-red-600"
        >
          Reject
        </button>
      </div>

      {showReject && (
        <div className="mt-2">
          <textarea
            placeholder="Enter reject reason"
            className="w-full border rounded-lg p-2 text-xs"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            onClick={() => respond("rejected")}
            className="mt-2 w-full bg-red-600 text-white py-1.5 rounded-lg text-xs"
          >
            Confirm Reject
          </button>
        </div>
      )}
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────

const DriverDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { driver, documents, vehicles } = state;
  const { bulkDone, bulkLoading, bulkRespond } = useGetDocuments(
    "",
    "pending",
    1,
    100,
  );
  // Bulk action state

  return (
    <div className="min-h-screen bg-gray-50 p-2 font-sans">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
      >
        ← Back to Drivers
      </button>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Driver Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/30 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 flex items-center justify-center text-2xl font-bold uppercase shadow-inner">
              {driver.name?.[0] ?? "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{driver.name}</h1>
              <p className="text-sm text-gray-400">Driver ID: {driver._id}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
            <InfoRow label="Email" value={driver.email} />
            <InfoRow label="Phone" value={driver.phone} />
            <InfoRow label="Documents" value={`${documents.length} uploaded`} />
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-800">Documents</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {documents.length} document(s) submitted
              </p>
            </div>
            {/* Bulk actions */}
            <div className="flex gap-2">
              <button
                disabled={bulkLoading}
                onClick={() =>
                  bulkRespond(
                    documents.filter((d) => d.status === "pending"),
                    "approved",
                  )
                }
              >
                Approve All
              </button>

              <button
                disabled={bulkLoading}
                onClick={() => {
                  const reason = prompt("Enter reject reason:");
                  if (!reason) return;

                  bulkRespond(
                    documents.filter((d) => d.status === "pending"),
                    "rejected",
                    reason,
                  );
                }}
              >
                Reject All
              </button>
            </div>
          </div>

          {bulkDone && (
            <div
              className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${bulkDone === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
            >
              All documents have been {bulkDone}.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocCard key={doc._id} doc={doc} />
            ))}
          </div>
        </div>

        {/* Vehicles */}
        {vehicles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="border border-gray-100 rounded-2xl p-4 bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      {vehicle.make} {vehicle.model}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary-500/30 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300">
                      {vehicle.vehicleType}
                    </span>
                  </div>
                  <InfoRow label="Plate" value={vehicle.licensePlateNumber} />
                  <InfoRow label="Expiry" value={vehicle.expiryDate} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDetails;
