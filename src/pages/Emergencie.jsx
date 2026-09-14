import { useState } from "react";
import Button from "../components/ui/Button";
import EmergencyDetails from "./EmergencyDetails";
import Badge from "../components/ui/Badge";
import DataTable from "../components/common/DataTable";
import { getStatusVariant, formatPhoneNumber, formatDateTime } from "../utils/helpers";
import { AlertTriangle, Eye, ShieldAlert } from "lucide-react";

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
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0] || "?").slice(0, 2).toUpperCase();
}

const emergencyData = [
  {
    alertId: "EMG-001",
    rider: { name: "John Smith", userId: "R234", phone: "1111-111111" },
    driver: {
      name: "David Doe",
      driverId: "D882",
      vehicle: "Honda City",
      phone: "1111-111111",
    },
    location: { lat: 24.9200172, lng: 67.0612345 },
    rideStatus: "ongoing",
    timestamp: "2025-01-25T09:22:00Z",
    status: "Resolved",
  },
];

export default function Emergencies() {
  const [selectedCase, setSelectedCase] = useState(null);

  const columns = [
    {
      key: "alertId",
      label: "Alert ID",
      render: (val) => (
        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
          {val}
        </span>
      ),
    },
    {
      key: "rider",
      label: "Rider Info",
      render: (rider) => {
        const avatar = getAvatarColors(rider?.name);
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 border ${avatar.bg} ${avatar.text} ${avatar.border}`}
            >
              {getInitials(rider?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {rider?.name}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {formatPhoneNumber(rider?.phone)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "driver",
      label: "Driver Info",
      render: (driver) => {
        const avatar = getAvatarColors(driver?.name);
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 border ${avatar.bg} ${avatar.text} ${avatar.border}`}
            >
              {getInitials(driver?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {driver?.name}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {driver?.vehicle} • {formatPhoneNumber(driver?.phone)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "rideStatus",
      label: "Ride Status",
      render: (val) => (
        <Badge variant={val === "ongoing" ? "warning" : "default"} dot className="capitalize text-[10px]">
          {val}
        </Badge>
      ),
    },
    {
      key: "timestamp",
      label: "Trigger Time",
      render: (val) => (
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={getStatusVariant(val)} dot className="capitalize text-[10px]">
          {val}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCase(row)}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          View Incident
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          Emergency Incidents Log
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Historical record and real-time response feed for SOS triggers and critical safety alerts.
        </p>
      </div>

      <DataTable
        title="Emergency Cases"
        data={emergencyData}
        columns={columns}
        addButton={false}
        exportable={false}
      />

      {selectedCase && (
        <EmergencyDetails
          data={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}
