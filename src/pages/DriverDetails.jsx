// pages/DriverDetails.jsx
import { useState, useEffect } from "react";
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

// ── ImageViewer ───────────────────────────────────────────────────────────────

const ImageViewer = ({ images, initialIndex = 0, onClose }) => {
  const [idx, setIdx] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const reset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const goTo = (i) => {
    setIdx(i);
    reset();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo((idx + 1) % images.length);
      if (e.key === "ArrowLeft")
        goTo((idx - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, images.length]);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(5, Math.max(0.3, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  };

  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => {
    setDragging(false);
    setDragStart(null);
  };

  const img = images[idx];

  const ToolBtn = ({ onClick, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32,
        height: 32,
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        color: "rgba(255,255,255,0.55)",
        border: "none",
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,0.55)";
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        background: "rgba(4,6,14,0.97)",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "monospace",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            {img.label}
          </span>
          {images.length > 1 && (
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.2)",
                fontFamily: "monospace",
              }}
            >
              {idx + 1} / {images.length}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Zoom Out */}
          <ToolBtn
            title="Zoom Out"
            onClick={() =>
              setZoom((z) => Math.max(0.3, +(z - 0.25).toFixed(2)))
            }
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </ToolBtn>

          {/* Zoom % */}
          <button
            onClick={reset}
            title="Reset to 100%"
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.45)",
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 6,
              padding: "3px 8px",
              cursor: "pointer",
              minWidth: 44,
              textAlign: "center",
            }}
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <ToolBtn
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </ToolBtn>

          <div
            style={{
              width: 1,
              height: 18,
              background: "rgba(255,255,255,0.1)",
              margin: "0 4px",
            }}
          />

          {/* Rotate Left */}
          <ToolBtn
            title="Rotate Left 90°"
            onClick={() => setRotation((r) => r - 90)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </ToolBtn>

          {/* Rotate Right */}
          <ToolBtn
            title="Rotate Right 90°"
            onClick={() => setRotation((r) => r + 90)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </ToolBtn>

          <div
            style={{
              width: 1,
              height: 18,
              background: "rgba(255,255,255,0.1)",
              margin: "0 4px",
            }}
          />

          {/* Reset */}
          <ToolBtn title="Reset View" onClick={reset}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5" />
            </svg>
          </ToolBtn>

          <div
            style={{
              width: 1,
              height: 18,
              background: "rgba(255,255,255,0.1)",
              margin: "0 4px",
            }}
          />

          {/* Close */}
          <ToolBtn title="Close (Esc)" onClick={onClose}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ToolBtn>
        </div>
      </div>

      {/* Image area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
      >
        {images.length > 1 && (
          <button
            onClick={() => goTo((idx - 1 + images.length) % images.length)}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            ‹
          </button>
        )}

        <img
          src={img.src}
          alt={img.label}
          draggable={false}
          style={{
            maxWidth: "88vw",
            maxHeight: "74vh",
            objectFit: "contain",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: dragging
              ? "none"
              : "transform 0.2s cubic-bezier(0.34,1.4,0.64,1)",
            borderRadius: 8,
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {images.length > 1 && (
          <button
            onClick={() => goTo((idx + 1) % images.length)}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            ›
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: "8px 0",
            flexShrink: 0,
          }}
        >
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                padding: 0,
                border: "none",
                borderRadius: 7,
                overflow: "hidden",
                cursor: "pointer",
                outline:
                  i === idx
                    ? "2px solid rgba(255,255,255,0.5)"
                    : "2px solid transparent",
                outlineOffset: 2,
                opacity: i === idx ? 1 : 0.35,
                transition: "all 0.15s",
              }}
            >
              <img
                src={im.src}
                alt={im.label}
                style={{
                  width: 60,
                  height: 38,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          paddingBottom: 8,
          fontSize: 10,
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.04em",
        }}
      >
        Scroll to zoom · Drag to pan
        {images.length > 1 ? " · ← → to navigate" : ""} · Esc to close
      </div>
    </div>
  );
};

// ── DocCard ───────────────────────────────────────────────────────────────────

const DocCard = ({ doc, bulkRejectMode, bulkReasons, setBulkReasons }) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(doc.status);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [imgError, setImgError] = useState({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
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

  // Build images array for viewer (only available images)
  const docImages = [
    doc.frontImage && !imgError.front
      ? { src: doc.frontImage, label: `${doc.type} — Front` }
      : null,
    doc.backImage && !imgError.back
      ? { src: doc.backImage, label: `${doc.type} — Back` }
      : null,
  ].filter(Boolean);

  const openViewer = (index) => {
    if (docImages.length === 0) return;
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const isAlreadyProcessed = localStatus !== "pending";
  const showBulkRejectBox = bulkRejectMode && localStatus === "pending";

  return (
    <>
      {viewerOpen && docImages.length > 0 && (
        <ImageViewer
          images={docImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

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
            <div
              className="relative group cursor-pointer"
              onClick={() => openViewer(0)}
            >
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
              {/* Hover overlay */}
              {!imgError.front && (
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-semibold flex items-center gap-1.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </span>
                </div>
              )}
              <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded-md">
                Front
              </span>
            </div>
          )}
          {doc.backImage && (
            <div
              className="relative group cursor-pointer"
              onClick={() =>
                openViewer(doc.frontImage && !imgError.front ? 1 : 0)
              }
            >
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
              {!imgError.back && (
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-semibold flex items-center gap-1.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </span>
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
    </>
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
      await api.updateDocs([
        {
          id: vehicle._id,
          status,
          rejectReason: status === "rejected" ? reason : null,
          metadata: {
            vehicleIdentificationNumber: vehicle?.vehicleIdentificationNumber,
            registrationNumber: vehicle?.registrationNumber,
          },
        },
      ]);
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
