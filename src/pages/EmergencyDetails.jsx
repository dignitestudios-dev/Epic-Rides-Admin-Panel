import { useState } from "react";
import TextArea from "../components/ui/TextArea";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { getStatusVariant, formatPhoneNumber, formatDateTime } from "../utils/helpers";
import { X, ShieldAlert, User, Car, MapPin, Save, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function EmergencyDetails({ data, onClose }) {
  const [note, setNote] = useState("");

  const handleSaveNote = () => {
    if (!note.trim()) return;
    toast.success("Incident note recorded");
    setNote("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-[#1f242b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Emergency Incident Report
              </h3>
              <p className="text-xs text-gray-400">
                Alert ID: <span className="font-mono text-rose-500 font-semibold">{data.alertId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header summary */}
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Safety Triggered
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
              {formatDateTime(data.timestamp)}
            </div>
          </div>
          <Badge variant={getStatusVariant(data.status)} dot className="text-xs capitalize">
            {data.status}
          </Badge>
        </div>

        {/* Rider & Driver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-[#181d24] border border-gray-100 dark:border-[#222831] rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-gray-400">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Rider Details
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white pt-1">{data.rider.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {formatPhoneNumber(data.rider.phone)}
            </p>
            <p className="text-[11px] text-gray-400">ID: {data.rider.userId}</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-[#181d24] border border-gray-100 dark:border-[#222831] rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-gray-400">
              <Car className="w-3.5 h-3.5 text-[#61CB08]" />
              Driver Details
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white pt-1">{data.driver.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {formatPhoneNumber(data.driver.phone)}
            </p>
            <p className="text-[11px] text-gray-400">Vehicle: {data.driver.vehicle} (ID: {data.driver.driverId})</p>
          </div>
        </div>

        {/* Location */}
        <div className="p-4 bg-gray-50 dark:bg-[#181d24] border border-gray-100 dark:border-[#222831] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              GPS Coordinates: {data.location.lat}, {data.location.lng}
            </span>
          </div>
          <a
            href={`https://maps.google.com/?q=${data.location.lat},${data.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#61CB08] hover:underline font-semibold"
          >
            Open in Maps
          </a>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Safety Operator Resolution Notes
          </label>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add detailed resolution notes or action logs taken by safety dispatch..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveNote}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Operator Note
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-[#1f242b]">
          <Button variant="outline" onClick={onClose}>
            Dismiss
          </Button>
          <Button variant="danger" icon={<AlertTriangle className="w-4 h-4" />}>
            Suspend Driver
          </Button>
        </div>
      </div>
    </div>
  );
}
