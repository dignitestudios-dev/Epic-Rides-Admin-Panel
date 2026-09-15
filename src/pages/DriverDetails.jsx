// pages/DriverDetails.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/services";
import {
  formatDate,
  formatDateTime,
  handleError,
  maskEmail,
  maskPhone,
  formatPhoneNumber,
} from "../utils/helpers";
import toast from "react-hot-toast";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Tabs from "../components/ui/Tabs";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import EditProfileModal from "../components/common/EditProfileModal";
import {
  ArrowLeft,
  Car,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Pencil,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Layers,
  AlertCircle,
  Eye,
  Info,
  Users,
  Shield,
  Hash,
  Sparkles,
  Award,
} from "lucide-react";
import useGetUserDetails from "../hooks/users/useGetUserDetails";
import { useAuth } from "../contexts/AuthContext";

// ── Avatar Color Generator ───────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30" },
  { bg: "bg-blue-500/15", text: "text-blue-500", border: "border-blue-500/30" },
  { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30" },
  { bg: "bg-purple-500/15", text: "text-purple-500", border: "border-purple-500/30" },
  { bg: "bg-rose-500/15", text: "text-rose-500", border: "border-rose-500/30" },
  { bg: "bg-cyan-500/15", text: "text-cyan-500", border: "border-cyan-500/30" },
];

function getAvatarColors(name = "") {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name = "") {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] || "?").slice(0, 2).toUpperCase();
}

const formatTitleCase = (str) => {
  if (!str) return "—";
  return String(str)
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

const statusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  switch (s) {
    case "approved":
    case "active":
    case "completed":
      return <Badge variant="success" dot>Approved</Badge>;
    case "rejected":
    case "declined":
      return <Badge variant="danger" dot>Rejected</Badge>;
    case "pending":
    case "in_review":
    case "needs_review":
      return <Badge variant="warning" dot>Needs Review</Badge>;
    case "old":
    case "archived":
      return <Badge variant="default" dot>Archived</Badge>;
    default:
      return <Badge variant="default" dot>{formatTitleCase(status || "Pending")}</Badge>;
  }
};

const REJECTION_PRESETS = [
  "Scan is blurry or unreadable",
  "Document is expired",
  "Name mismatch with driver profile",
  "Incorrect document type",
  "Missing clear back scan",
  "Plate or VIN mismatch",
];

const VEHICLE_REJECTION_PRESETS = [
  "License plate mismatch with vehicle photos",
  "Invalid or unverified VIN number",
  "Vehicle year does not meet platform requirements",
  "Vehicle registration document is expired",
  "Vehicle type/class mismatch",
];

// ── Color Swatch Helper ───────────────────────────────────────────────────────

const getColorHex = (colorName = "") => {
  const c = colorName.toLowerCase().trim();
  if (c.includes("black")) return "#171717";
  if (c.includes("white")) return "#f8fafc";
  if (c.includes("silver") || c.includes("grey") || c.includes("gray")) return "#94a3b8";
  if (c.includes("blue") || c.includes("navy")) return "#2563eb";
  if (c.includes("red") || c.includes("maroon")) return "#dc2626";
  if (c.includes("green")) return "#16a34a";
  if (c.includes("yellow") || c.includes("gold")) return "#eab308";
  if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "#92400e";
  if (c.includes("orange")) return "#ea580c";
  return "#64748b";
};

// ── Interactive Lightbox Image Viewer ─────────────────────────────────────────

const ImageViewer = ({ images = [], initialIndex = 0, onClose }) => {
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
      if (e.key === "ArrowLeft") goTo((idx - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, images.length]);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(5, Math.max(0.3, z * (e.deltaY < 0 ? 1.15 : 0.85))));
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

  const img = images[idx] || {};

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-[#06080d]/95 backdrop-blur-md animate-fadeIn select-none"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#61CB08] animate-pulse" />
          <span className="text-sm text-white font-semibold tracking-wide truncate max-w-[280px] sm:max-w-md">
            {img.label || "Document Preview"}
          </span>
          {images.length > 1 && (
            <span className="text-xs font-mono text-white/60 bg-white/10 px-2.5 py-0.5 rounded-md">
              {idx + 1} / {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.3, +(z - 0.25).toFixed(2)))}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="text-xs font-mono text-white/80 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-md transition-colors"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
            title="Zoom In"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button
            onClick={() => setRotation((r) => r - 90)}
            title="Rotate Left 90°"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRotation((r) => r + 90)}
            title="Rotate Right 90°"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {img.src && (
            <a
              href={img.src}
              target="_blank"
              rel="noreferrer"
              title="Open Original in New Tab"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button
            onClick={onClose}
            title="Close Preview (Esc)"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-rose-500/40 transition-colors"
          >
            <X className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative p-4"
        style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
      >
        {images.length > 1 && (
          <button
            onClick={() => goTo((idx - 1 + images.length) % images.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg text-xl"
          >
            ‹
          </button>
        )}

        <img
          src={img.src}
          alt={img.label}
          draggable={false}
          style={{
            maxWidth: "90vw",
            maxHeight: "75vh",
            objectFit: "contain",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.2s cubic-bezier(0.34,1.4,0.64,1)",
            borderRadius: 12,
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.8)",
            pointerEvents: "none",
          }}
        />

        {images.length > 1 && (
          <button
            onClick={() => goTo((idx + 1) % images.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg text-xl"
          >
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2.5 py-3 border-t border-white/5 bg-black/40 shrink-0">
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-14 h-10 rounded-lg overflow-hidden border transition-all ${
                i === idx
                  ? "border-[#61CB08] ring-2 ring-[#61CB08]/40 scale-105 opacity-100"
                  : "border-white/10 opacity-40 hover:opacity-80"
              }`}
            >
              <img src={im.src} alt={im.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <p className="text-center pb-3 text-xs text-white/40 font-medium tracking-wide">
        Scroll to Zoom · Drag to Pan · Arrow Keys to Navigate · Esc to Close
      </p>
    </div>
  );
};

// ── Clean & Balanced Document Card ───────────────────────────────────────────

const DocumentCard = ({ doc, onApprove, onRequestReject, onOpenLightbox, isActionLoading }) => {
  const { hasPermission } = useAuth();
  const [copiedKey, setCopiedKey] = useState(null);
  const isPending = doc.status === "pending" || doc.status === "needs_review";
  const isApproved = doc.status === "approved";
  const isRejected = doc.status === "rejected";

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedKey(key);
    toast.success(`${key} copied`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const docScans = [
    doc.frontImage ? { src: doc.frontImage, label: `${formatTitleCase(doc.type)} — Front` } : null,
    doc.backImage ? { src: doc.backImage, label: `${formatTitleCase(doc.type)} — Back` } : null,
  ].filter(Boolean);

  return (
    <Card className="overflow-hidden border border-gray-200/90 dark:border-[#1f242b] shadow-xs">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-[#1f242b]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {formatTitleCase(doc.type)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Uploaded on {formatDate(doc.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {statusBadge(doc.status)}
        </div>
      </div>

      {/* Card Body (2 Columns: Left = Document Scans, Right = Document Details) */}
      <div className="py-4 space-y-4">
        {/* Rejection Alert Banner */}
        {doc.rejectReason && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-bold">Rejection Reason: </span>
              <span>{doc.rejectReason}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Document Scans Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
              Document Scans ({docScans.length} Scan{docScans.length !== 1 ? "s" : ""})
            </span>

            {docScans.length > 0 ? (
              <div className="flex items-center gap-3.5 flex-wrap">
                {docScans.map((scan, sIdx) => (
                  <div
                    key={sIdx}
                    onClick={() => onOpenLightbox(docScans, sIdx)}
                    className="relative group cursor-pointer flex-1 min-w-[180px] max-w-[260px] h-36 rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f242b] bg-gray-50 dark:bg-[#181d24] hover:border-[#61CB08] transition-all shadow-xs"
                    title="Click to view full image"
                  >
                    <img
                      src={scan.src}
                      alt={scan.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-xs font-medium">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Enlarge Scan</span>
                      </div>
                    </div>
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                      {sIdx === 0 ? "Front Side" : "Back Side"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 rounded-xl border border-dashed border-gray-200 dark:border-[#1f242b] flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 text-xs gap-1.5">
                <FileText className="w-6 h-6 opacity-40" />
                <span>No scan images attached</span>
              </div>
            )}
          </div>

          {/* Right: Document Verification Details (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
              Credential Details
            </span>

            <div className="bg-gray-50/80 dark:bg-[#181d24]/80 rounded-xl p-3.5 border border-gray-200/70 dark:border-[#1f242b] space-y-2.5 text-xs">
              {/* License Number if available */}
              {doc.metadata?.licenseNumber ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400">License Number</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {doc.metadata.licenseNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(doc.metadata.licenseNumber, "License Number")}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      title="Copy"
                    >
                      {copiedKey === "License Number" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Expiry Date if available */}
              {doc.metadata?.expiryDate ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Expiration Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(doc.metadata.expiryDate)}
                  </span>
                </div>
              ) : null}

              {/* Registration Number if available */}
              {doc.metadata?.registrationNumber ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Registration #</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {doc.metadata.registrationNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(doc.metadata.registrationNumber, "Registration #")}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      title="Copy"
                    >
                      {copiedKey === "Registration #" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Submission Date */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-slate-400">Submission Date</span>
                <span className="text-gray-700 dark:text-slate-300 font-medium">
                  {formatDate(doc.createdAt)}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-[#2d3748] pt-2">
                <span className="text-gray-500 dark:text-slate-400">Review Status</span>
                <span className="font-bold capitalize text-gray-900 dark:text-white">
                  {doc.status === "approved"
                    ? "✓ Verified & Approved"
                    : doc.status === "rejected"
                    ? "✕ Rejected"
                    : "⏳ Pending Review"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer / Actions */}
      {hasPermission("approveDriversVehicles") && (
        <div className="pt-3 border-t border-gray-100 dark:border-[#1f242b] flex items-center justify-end gap-2.5">
          {isPending ? (
            <>
              <Button
                variant="danger"
                size="sm"
                disabled={isActionLoading}
                onClick={() => onRequestReject(doc, "document")}
                icon={<XCircle className="w-4 h-4" />}
              >
                Reject Document
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isActionLoading}
                disabled={isActionLoading}
                onClick={() => onApprove(doc._id, "document")}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve Document
              </Button>
            </>
          ) : isApproved ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-600 dark:text-[#61CB08] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Approved
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => onRequestReject(doc, "document")}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 border-rose-200 dark:border-rose-900/40"
              >
                Revoke Approval
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Rejected
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => onApprove(doc._id, "document")}
                className="text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                Overturn &amp; Approve
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ── Clean Automotive Vehicle Card ─────────────────────────────────────────────

const VehicleCard = ({
  vehicle,
  onApprove,
  onRequestReject,
  isActionLoading,
}) => {
  const { hasPermission } = useAuth();
  const [copiedKey, setCopiedKey] = useState(null);

  const isPending = vehicle.status === "pending" || vehicle.status === "needs_review";
  const isApproved = vehicle.status === "approved";
  const isRejected = vehicle.status === "rejected";

  const handleCopyText = (val, keyName) => {
    if (!val) return;
    navigator.clipboard.writeText(String(val));
    setCopiedKey(keyName);
    toast.success(`${keyName} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const colorHex = getColorHex(vehicle.color || "gray");

  return (
    <Card className="overflow-hidden border border-gray-200/90 dark:border-[#1f242b] shadow-xs">
      {/* ── HEADER: Vehicle Title & Clean Plate ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-[#1f242b]">
        {/* Left: Vehicle Title with Accent Icon */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative w-13 h-13 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 shadow-xs">
            <Car className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#13161a] shadow-xs"
              style={{ backgroundColor: colorHex }}
              title={`Color: ${vehicle.color || "Standard"}`}
            />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white capitalize tracking-tight truncate">
                {vehicle.yearOfManufacture ? `${vehicle.yearOfManufacture} ` : ""}
                {vehicle.make || "Unknown Make"} {vehicle.model || "Unknown Model"}
              </h3>
              {vehicle.licensePlateNumber && (
                <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#181d24] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                  Plate: {vehicle.licensePlateNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
              <span className="capitalize font-medium text-gray-700 dark:text-slate-300">
                {vehicle.vehicleType || "Standard"} Category
              </span>
              <span>•</span>
              <span>
                {vehicle.createdAt ? `Registered ${formatDate(vehicle.createdAt)}` : "Registered Vehicle"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Status Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {statusBadge(vehicle.status)}
        </div>
      </div>

      {/* ── BODY: Specifications & Legal Information Grid ── */}
      <div className="py-5 space-y-4">
        {/* Rejection Alert Banner */}
        {vehicle.rejectReason && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-bold">Vehicle Rejection Reason: </span>
              <span>{vehicle.rejectReason}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Column 1: Vehicle Specifications */}
          <div className="bg-gray-50/80 dark:bg-[#181d24]/80 rounded-xl p-4 border border-gray-200/70 dark:border-[#1f242b] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 dark:border-[#2d3748]">
              <Car className="w-4 h-4 text-[#61CB08]" />
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Vehicle Specifications
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-slate-400">Make &amp; Model</span>
                <span className="font-bold text-gray-900 dark:text-white capitalize">
                  {vehicle.make} {vehicle.model}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-slate-400">Manufacture Year</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {vehicle.yearOfManufacture || "—"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-slate-400">Exterior Color</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 shrink-0 shadow-xs"
                    style={{ backgroundColor: colorHex }}
                  />
                  {vehicle.color || "Standard"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-slate-400">Ride Class</span>
                <span className="font-semibold text-[#61CB08] capitalize">
                  {vehicle.vehicleType || "Economy"}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Identification Numbers */}
          <div className="bg-gray-50/80 dark:bg-[#181d24]/80 rounded-xl p-4 border border-gray-200/70 dark:border-[#1f242b] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 dark:border-[#2d3748]">
              <Shield className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Identification &amp; Registration
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Plate */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-slate-400">License Plate</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {vehicle.licensePlateNumber || "N/A"}
                  </span>
                  {vehicle.licensePlateNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(vehicle.licensePlateNumber, "License Plate")}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      title="Copy"
                    >
                      {copiedKey === "License Plate" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* VIN */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-slate-400">VIN (Chassis #)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                    {vehicle.vehicleIdentificationNumber || "Not Provided"}
                  </span>
                  {vehicle.vehicleIdentificationNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(vehicle.vehicleIdentificationNumber, "VIN")}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      title="Copy"
                    >
                      {copiedKey === "VIN" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Registration Number */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-slate-400">Registration #</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                    {vehicle.registrationNumber || "Not Provided"}
                  </span>
                  {vehicle.registrationNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(vehicle.registrationNumber, "Registration Number")}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                      title="Copy"
                    >
                      {copiedKey === "Registration Number" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-[#2d3748] pt-2">
                <span className="text-gray-500 dark:text-slate-400">Verification Status</span>
                <span className="font-bold text-gray-900 dark:text-white capitalize">
                  {vehicle.status === "approved"
                    ? "✓ Approved"
                    : vehicle.status === "rejected"
                    ? "✕ Rejected"
                    : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER: Actions ── */}
      {hasPermission("approveDriversVehicles") && (
        <div className="pt-4 border-t border-gray-100 dark:border-[#1f242b] flex items-center justify-end gap-2.5">
          {isPending ? (
            <>
              <Button
                variant="danger"
                size="sm"
                disabled={isActionLoading}
                onClick={() => onRequestReject(vehicle, "vehicle")}
                icon={<XCircle className="w-4 h-4" />}
              >
                Reject Vehicle
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isActionLoading}
                disabled={isActionLoading}
                onClick={() => onApprove(vehicle._id, "vehicle")}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve Vehicle
              </Button>
            </>
          ) : isApproved ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-600 dark:text-[#61CB08] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Approved Vehicle
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => onRequestReject(vehicle, "vehicle")}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 border-rose-200 dark:border-rose-900/40"
              >
                Revoke Approval
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Rejected Vehicle
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => onApprove(vehicle._id, "vehicle")}
                className="text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                Overturn &amp; Approve
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ── Main Driver Details Page ──────────────────────────────────────────────────

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [docs, setDocs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState("documents");

  // Lightbox State
  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Single Item Rejection Modal State
  const [rejectItemModal, setRejectItemModal] = useState({
    isOpen: false,
    item: null,
    type: "document", // 'document' or 'vehicle'
    reason: "",
  });

  // Bulk Rejection Modal State
  const [bulkRejectModalOpen, setBulkRejectModalOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const { details: userDetails, loading: userLoading, refresh: refreshUser } = useGetUserDetails(
    id,
    "driver"
  );
  const pInfo = userDetails?.personalInfo;
  const fDetails = userDetails?.fullDetails;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const editInitialData = useMemo(
    () => ({
      firstName: fDetails?.firstName || pInfo?.firstName || "",
      lastName: fDetails?.lastName || pInfo?.lastName || "",
      email: pInfo?.email || fDetails?.email || "",
      subscriptionStatus: fDetails?.subscriptionStatus === "Expired" ? "canceled" : "active",
      balance: 0,
    }),
    [fDetails, pInfo]
  );

  const fetchData = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const [docsRes, vehiclesRes] = await Promise.all([
          api.getDriverDocs(id),
          api.getDriverVehicles(id),
        ]);
        setDocs(docsRes.data || []);
        setVehicles(vehiclesRes.data || []);
        if (isManual) {
          refreshUser();
          toast.success("Driver verification data refreshed");
        }
      } catch (err) {
        toast.error("Failed to load driver verification data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, refreshUser]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Document partitioning: active vs archived
  const latestDocsByType = useMemo(() => {
    const map = {};
    [...docs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((doc) => {
        if (!map[doc.type]) map[doc.type] = doc;
      });
    return map;
  }, [docs]);

  const latestDocs = useMemo(() => Object.values(latestDocsByType), [latestDocsByType]);
  const oldDocs = useMemo(
    () => docs.filter((d) => !latestDocs.find((ld) => ld._id === d._id)),
    [docs, latestDocs]
  );

  const pendingDocs = useMemo(
    () => latestDocs.filter((d) => d.status === "pending" || d.status === "needs_review"),
    [latestDocs]
  );

  // Vehicle verification docs for cross-referencing in vehicle card
  const vehicleRelatedDocs = useMemo(
    () =>
      docs.filter(
        (d) =>
          d.type === "vehicleVerification" ||
          d.type === "insurance" ||
          d.type === "vehicleRegistration" ||
          d.type === "inspection"
      ),
    [docs]
  );

  const getVehicleTime = (v) => {
    if (v?.createdAt) {
      const t = new Date(v.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (v?._id && typeof v._id === "string" && v._id.length >= 8) {
      const t = parseInt(v._id.substring(0, 8), 16) * 1000;
      if (!isNaN(t) && t > 0) return t;
    }
    return 0;
  };

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const timeA = getVehicleTime(a);
      const timeB = getVehicleTime(b);
      if (timeB !== timeA) return timeB - timeA;
      if (b._id && a._id && b._id !== a._id) return b._id > a._id ? 1 : -1;
      return 0;
    });
  }, [vehicles]);

  const latestVehicleId = sortedVehicles[0]?._id;
  const pendingVehicles = useMemo(
    () =>
      sortedVehicles.filter(
        (v) => v._id === latestVehicleId && (v.status === "pending" || v.status === "needs_review")
      ),
    [sortedVehicles, latestVehicleId]
  );

  const totalPending = pendingDocs.length + pendingVehicles.length;

  // ── Approval Handlers ───────────────────────────────────────────────────────

  const handleApprove = async (itemId, type = "document") => {
    setActionLoading(true);
    try {
      if (type === "document") {
        await api.updateDocs([{ id: itemId, status: "approved" }], []);
        toast.success("Document approved successfully!");
      } else {
        const v = sortedVehicles.find((x) => x._id === itemId);
        await api.updateDocs([], [
          {
            id: itemId,
            status: "approved",
            metadata: {
              vehicleIdentificationNumber: v?.vehicleIdentificationNumber || "",
              registrationNumber: v?.registrationNumber || "",
            },
          },
        ]);
        toast.success("Vehicle approved successfully!");
      }
      fetchData();
    } catch (err) {
      toast.error(err.message || `Failed to approve ${type}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Rejection Handlers ─────────────────────────────────────────────────────

  const handleOpenRejectModal = (item, type = "document") => {
    setRejectItemModal({
      isOpen: true,
      item,
      type,
      reason: item?.rejectReason || "",
    });
  };

  const handleConfirmSingleReject = async () => {
    const { item, type, reason } = rejectItemModal;
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setActionLoading(true);
    try {
      if (type === "document") {
        await api.updateDocs([{ id: item._id, status: "rejected", rejectReason: reason.trim() }], []);
        toast.success("Document rejected.");
      } else {
        const v = sortedVehicles.find((x) => x._id === item._id);
        await api.updateDocs([], [
          {
            id: item._id,
            status: "rejected",
            rejectReason: reason.trim(),
            metadata: {
              vehicleIdentificationNumber: v?.vehicleIdentificationNumber || "",
              registrationNumber: v?.registrationNumber || "",
            },
          },
        ]);
        toast.success("Vehicle rejected.");
      }
      setRejectItemModal({ isOpen: false, item: null, type: "document", reason: "" });
      fetchData();
    } catch (err) {
      toast.error(err.message || `Failed to reject ${type}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Bulk Handlers ──────────────────────────────────────────────────────────

  const handleApproveAll = async () => {
    if (totalPending === 0) return;
    setBulkLoading(true);
    try {
      await api.updateDocs(
        pendingDocs.map((d) => ({
          id: d._id,
          status: "approved",
          ...(d.type === "vehicleVerification" && {
            metadata: {
              vehicleIdentificationNumber: d.metadata?.vehicleIdentificationNumber || "",
              registrationNumber: d.metadata?.registrationNumber || "",
            },
          }),
        })),
        pendingVehicles.map((v) => ({
          id: v._id,
          status: "approved",
          metadata: {
            vehicleIdentificationNumber: v?.vehicleIdentificationNumber || "",
            registrationNumber: v?.registrationNumber || "",
          },
        }))
      );
      toast.success("All pending credentials & vehicles approved!");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to approve all items.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleConfirmBulkReject = async () => {
    if (!bulkRejectReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setBulkLoading(true);
    try {
      await api.updateDocs(
        pendingDocs.map((d) => ({
          id: d._id,
          status: "rejected",
          rejectReason: bulkRejectReason.trim(),
        })),
        pendingVehicles.map((v) => ({
          id: v._id,
          status: "rejected",
          rejectReason: bulkRejectReason.trim(),
        }))
      );
      toast.success("All pending items rejected.");
      setBulkRejectModalOpen(false);
      setBulkRejectReason("");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to reject pending items.");
    } finally {
      setBulkLoading(false);
    }
  };

  const driverName = [pInfo?.firstName, pInfo?.lastName].filter(Boolean).join(" ") || "Driver Applicant";
  const avatarColors = getAvatarColors(driverName);
  const initials = getInitials(driverName);

  // Tabs Configuration
  const tabsList = [
    {
      key: "documents",
      label: "Documents",
      count: latestDocs.length,
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      key: "vehicles",
      label: "Vehicles",
      count: sortedVehicles.length,
      icon: <Car className="w-3.5 h-3.5" />,
    },
    ...(oldDocs.length > 0
      ? [
          {
            key: "history",
            label: "Submission History",
            count: oldDocs.length,
            icon: <Layers className="w-3.5 h-3.5" />,
          },
        ]
      : []),
  ];

  if (loading && !docs.length && !vehicles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-[#61CB08]" />
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
          Loading Driver Application...
        </p>
      </div>
    );
  }

  const activePresets =
    rejectItemModal.type === "vehicle" ? VEHICLE_REJECTION_PRESETS : REJECTION_PRESETS;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Lightbox Modal */}
      {lightboxImages && (
        <ImageViewer
          images={lightboxImages}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxImages(null)}
        />
      )}

      {/* ── TOP HEADER & BREADCRUMBS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/driver-requests")}
            className="text-xs font-medium text-gray-700 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Driver Requests
          </Button>
          <span>/</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            Driver Verification
          </span>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="text-xs font-medium"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#61CB08]" : ""}`} />}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          {hasPermission("editUser") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              disabled={userLoading}
              className="text-xs font-medium"
              icon={<Pencil className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
          )}

          {totalPending > 0 && hasPermission("approveDriversVehicles") && (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setBulkRejectModalOpen(true)}
                disabled={bulkLoading}
                className="text-xs font-medium"
                icon={<XCircle className="w-3.5 h-3.5" />}
              >
                Reject All
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApproveAll}
                loading={bulkLoading}
                disabled={bulkLoading}
                className="text-xs font-medium"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve All ({totalPending})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── DRIVER PROFILE CARD ── */}
      <Card padding="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Personal Info */}
          <div className="flex items-center gap-4 min-w-0">
            {pInfo?.profilePicture ? (
              <img
                src={pInfo.profilePicture}
                alt={driverName}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 dark:border-[#1f242b] shadow-xs shrink-0"
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl border ${avatarColors.bg} ${avatarColors.text} ${avatarColors.border} shrink-0`}
              >
                {initials}
              </div>
            )}

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                  {driverName}
                </h1>
                {pInfo?.status && statusBadge(pInfo.status)}
                <button
                  type="button"
                  onClick={() => handleCopy(id, "Driver ID")}
                  className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#181d24] text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <span>ID: {id?.slice(0, 8)}</span>
                  {copiedField === "Driver ID" ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  {hasPermission("seeSensitiveData")
                    ? pInfo?.email || "—"
                    : maskEmail(pInfo?.email || "—")}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 opacity-60" />
                  {hasPermission("seeSensitiveData")
                    ? formatPhoneNumber(pInfo?.phone || pInfo?.phoneNumber) || "—"
                    : maskPhone(pInfo?.phone || pInfo?.phoneNumber || "—")}
                </span>
                {fDetails?.ssn && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 opacity-60" />
                      SSN: {fDetails.ssn.replace(/^(\d{3})(\d{2})(\d{4})$/, "$1-$2-$3")}
                    </span>
                  </>
                )}
                {pInfo?.address && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 max-w-[240px] truncate">
                      <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      {pInfo.address}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Verification Status Pill */}
          <div className="bg-gray-50 dark:bg-[#181d24] border border-gray-200/80 dark:border-[#1f242b] rounded-xl px-5 py-3 shrink-0 flex items-center gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Verification State
              </span>
              <span
                className={`text-sm sm:text-base font-bold ${
                  totalPending > 0 ? "text-amber-500" : "text-[#61CB08]"
                }`}
              >
                {totalPending > 0 ? `${totalPending} Item(s) Pending Review` : "✓ All Items Verified"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── TABS NAVIGATION ── */}
      <Tabs
        tabs={tabsList}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-4"
      />

      {/* ── TAB 1: DOCUMENTS ── */}
      {activeTab === "documents" && (
        <div className="space-y-4 animate-fadeIn">
          {latestDocs.length > 0 ? (
            latestDocs.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onApprove={handleApprove}
                onRequestReject={handleOpenRejectModal}
                onOpenLightbox={(scans, idx) => {
                  setLightboxImages(scans);
                  setLightboxIdx(idx);
                }}
                isActionLoading={actionLoading}
              />
            ))
          ) : (
            <Card padding="p-12" className="text-center">
              <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                No documents uploaded
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                This driver applicant has not submitted any documents yet.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB 2: VEHICLES ── */}
      {activeTab === "vehicles" && (
        <div className="space-y-4 animate-fadeIn">
          {sortedVehicles.length > 0 ? (
            sortedVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onApprove={handleApprove}
                onRequestReject={handleOpenRejectModal}
                isActionLoading={actionLoading}
              />
            ))
          ) : (
            <Card padding="p-12" className="text-center">
              <Car className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                No vehicle registered
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                No vehicle details have been provided for this applicant.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB 3: SUBMISSION HISTORY ── */}
      {activeTab === "history" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center gap-3 text-xs text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 text-blue-500" />
            <span>
              These are superseded or archived documents from previous submissions. They are preserved for audit purposes.
            </span>
          </div>

          {oldDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onApprove={() => {}}
              onRequestReject={() => {}}
              onOpenLightbox={(scans, idx) => {
                setLightboxImages(scans);
                setLightboxIdx(idx);
              }}
              isActionLoading={false}
            />
          ))}
        </div>
      )}

      {/* ── SINGLE ITEM REJECTION MODAL ── */}
      <Modal
        isOpen={rejectItemModal.isOpen}
        onClose={() => setRejectItemModal({ isOpen: false, item: null, type: "document", reason: "" })}
        title={`Reject ${rejectItemModal.type === "document" ? "Document" : "Vehicle"}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-slate-300">
            Please choose a preset rejection reason or provide a custom explanation for the driver:
          </p>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
              Quick Presets
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activePresets.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setRejectItemModal((prev) => ({ ...prev, reason: preset }))}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#181d24] text-gray-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 border border-gray-200 dark:border-[#2d3748] transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
              Rejection Note
            </label>
            <textarea
              rows={3}
              value={rejectItemModal.reason}
              onChange={(e) =>
                setRejectItemModal((prev) => ({
                  ...prev,
                  reason: e.target.value.slice(0, 150),
                }))
              }
              placeholder="Enter explanation for the applicant..."
              maxLength={150}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 dark:border-[#2d3748] bg-white dark:bg-[#141a24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Max 150 characters</span>
              <span className={rejectItemModal.reason.length >= 150 ? "text-rose-500 font-bold" : ""}>
                {rejectItemModal.reason.length}/150
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-[#1f242b]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setRejectItemModal({ isOpen: false, item: null, type: "document", reason: "" })
              }
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading}
              disabled={actionLoading || !rejectItemModal.reason.trim()}
              onClick={handleConfirmSingleReject}
              icon={<XCircle className="w-4 h-4" />}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── BULK REJECT MODAL ── */}
      <Modal
        isOpen={bulkRejectModalOpen}
        onClose={() => setBulkRejectModalOpen(false)}
        title="Reject All Pending Items"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-slate-300">
            This will reject all{" "}
            <strong className="text-gray-900 dark:text-white font-bold">{totalPending}</strong>{" "}
            pending items. Select a reason preset or enter custom notes:
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
              Quick Presets
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {REJECTION_PRESETS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setBulkRejectReason(preset)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#181d24] text-gray-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 border border-gray-200 dark:border-[#2d3748] transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
              Rejection Note
            </label>
            <textarea
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value.slice(0, 150))}
              maxLength={150}
              rows={3}
              placeholder="e.g. Scans are expired or unreadable..."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 dark:border-[#2d3748] bg-white dark:bg-[#141a24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Max 150 characters</span>
              <span className={bulkRejectReason.length >= 150 ? "text-rose-500 font-bold" : ""}>
                {bulkRejectReason.length}/150
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-[#1f242b]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBulkRejectModalOpen(false);
                setBulkRejectReason("");
              }}
              disabled={bulkLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={bulkLoading}
              disabled={bulkLoading || !bulkRejectReason.trim()}
              onClick={handleConfirmBulkReject}
              icon={<XCircle className="w-4 h-4" />}
            >
              Confirm Reject All
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── EDIT PROFILE MODAL ── */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={id}
        type="driver"
        initialData={editInitialData}
        onSuccess={() => {
          refreshUser();
          fetchData();
        }}
      />
    </div>
  );
};

export default DriverDetails;
