import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import {
  Navigation,
  User,
  Phone,
  Car,
  RefreshCw,
  MapPin,
  Users,
  Eye,
  X,
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { api } from "../lib/services";

// ── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL = 10_000; // ms
const ANIMATION_DURATION = 2500; // ms — smooth marker travel time
// Default map center — Orlando, Florida
const DEFAULT_CENTER = { lat: 28.5383, lng: -81.3792 };

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  ],
};

// ── SVG car icons ─────────────────────────────────────────────────────────────
const ECONOMY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 46" width="56" height="46">
  <defs>
    <filter id="es" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <g filter="url(#es)">
    <rect x="3" y="15" width="50" height="20" rx="5" fill="#22c55e"/>
    <path d="M11 15 L17 5 L39 5 L45 15Z" fill="#16a34a"/>
    <rect x="12" y="6" width="11" height="9" rx="2" fill="#bbf7d0" opacity="0.92"/>
    <rect x="26" y="6" width="13" height="9" rx="2" fill="#bbf7d0" opacity="0.92"/>
    <circle cx="15" cy="35" r="5.5" fill="#1f2937" stroke="#e5e7eb" stroke-width="1.5"/>
    <circle cx="41" cy="35" r="5.5" fill="#1f2937" stroke="#e5e7eb" stroke-width="1.5"/>
    <rect x="3" y="24" width="9" height="5" rx="2" fill="#fef08a" opacity="0.85"/>
    <rect x="44" y="24" width="9" height="5" rx="2" fill="#fca5a5" opacity="0.85"/>
  </g>
</svg>`;

const LUXURY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48" width="68" height="48">
  <defs>
    <filter id="ls" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <g filter="url(#ls)">
    <rect x="3" y="17" width="62" height="20" rx="6" fill="#f59e0b"/>
    <path d="M12 17 L18 5 L50 5 L56 17Z" fill="#d97706"/>
    <rect x="13" y="6" width="14" height="10" rx="2" fill="#fef3c7" opacity="0.92"/>
    <rect x="30" y="6" width="18" height="10" rx="2" fill="#fef3c7" opacity="0.92"/>
    <circle cx="17" cy="37" r="6" fill="#1f2937" stroke="#e5e7eb" stroke-width="1.5"/>
    <circle cx="51" cy="37" r="6" fill="#1f2937" stroke="#e5e7eb" stroke-width="1.5"/>
    <rect x="3" y="25" width="10" height="5" rx="2" fill="#fef08a" opacity="0.9"/>
    <rect x="55" y="25" width="10" height="5" rx="2" fill="#fca5a5" opacity="0.9"/>
    <path d="M30 2 L32 6 L34 2 L36 6 L38 2" stroke="#f59e0b" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

const svgToDataUrl = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

// ── Smooth marker animation hook ──────────────────────────────────────────────
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function useSmoothPositions(drivers) {
  const [positions, setPositions] = useState({});
  const rafRef = useRef({}); // per-driver rAF id
  const currentPos = useRef({}); // per-driver latest interpolated position

  // Only cancel all animations on unmount
  useEffect(() => {
    return () => {
      Object.values(rafRef.current).forEach(cancelAnimationFrame);
    };
  }, []);

  useEffect(() => {
    if (!drivers.length) return;

    drivers.forEach((driver) => {
      const newLat = driver.location?.coordinates?.[1];
      const newLng = driver.location?.coordinates?.[0];
      if (newLat == null || newLng == null) return;

      const prev = currentPos.current[driver.id];

      // First time seeing this driver — snap immediately
      if (!prev) {
        const pos = { lat: newLat, lng: newLng };
        currentPos.current[driver.id] = pos;
        setPositions((p) => ({ ...p, [driver.id]: pos }));
        return;
      }

      // No movement — skip
      if (
        Math.abs(prev.lat - newLat) < 1e-7 &&
        Math.abs(prev.lng - newLng) < 1e-7
      )
        return;

      // Cancel any in-progress animation for this driver
      if (rafRef.current[driver.id]) {
        cancelAnimationFrame(rafRef.current[driver.id]);
      }

      const startLat = prev.lat;
      const startLng = prev.lng;
      const startTime = performance.now();

      const step = (now) => {
        const t = Math.min((now - startTime) / ANIMATION_DURATION, 1);
        const e = easeInOutCubic(t);
        const lat = startLat + (newLat - startLat) * e;
        const lng = startLng + (newLng - startLng) * e;
        const pos = { lat, lng };

        currentPos.current[driver.id] = pos;
        setPositions((p) => ({ ...p, [driver.id]: pos }));

        if (t < 1) {
          rafRef.current[driver.id] = requestAnimationFrame(step);
        }
      };

      rafRef.current[driver.id] = requestAnimationFrame(step);
    });
  }, [drivers]);

  return positions;
}

// ── Driver sidebar card ───────────────────────────────────────────────────────
const DriverCard = React.memo(({ driver, isSelected, onLocate, onView }) => {
  const name =
    [driver.firstName, driver.lastName].filter(Boolean).join(" ") || "Unknown";
  const isLuxury = driver.vehicleType?.toLowerCase() === "luxury";
  const isOnTrip = !!driver.activeRideId;

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        isSelected
          ? "border-primary-400 bg-primary-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {driver.profilePicture ? (
              <img
                src={driver.profilePicture}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {/* Status dot */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              isOnTrip ? "bg-blue-500" : "bg-green-500"
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" />
            {driver.phone || "—"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge
              variant={isLuxury ? "warning" : "success"}
              className="text-[10px] px-1.5 py-0.5"
            >
              {isLuxury ? "✦ Luxury" : "Economy"}
            </Badge>
            <span
              className={`text-[10px] font-medium ${
                isOnTrip ? "text-blue-600" : "text-green-600"
              }`}
            >
              {isOnTrip ? "On Trip" : "Available"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          icon={<Navigation className="w-3.5 h-3.5" />}
          onClick={() => onLocate(driver)}
        >
          Locate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => onView(driver)}
        >
          Details
        </Button>
      </div>
    </div>
  );
});
DriverCard.displayName = "DriverCard";

// ── Driver detail modal ───────────────────────────────────────────────────────
const DriverDetailModal = ({ driver, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!driver) return null;

  const name =
    [driver.firstName, driver.lastName].filter(Boolean).join(" ") || "—";
  const vd = driver.vehicleDetails;
  const isLuxury = driver.vehicleType?.toLowerCase() === "luxury";
  const isOnTrip = !!driver.activeRideId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Driver Details" size="sm">
      <div className="space-y-4">
        {/* Profile row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
            {driver.profilePicture ? (
              <img
                src={driver.profilePicture}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              {driver.phone || "—"}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={isLuxury ? "warning" : "success"}>
                {isLuxury ? "✦ Luxury" : "Economy"}
              </Badge>
              <Badge variant={isOnTrip ? "primary" : "success"}>
                {isOnTrip ? "On Trip" : "Available"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Vehicle details */}
        {vd && (
          <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 text-sm border border-gray-100">
            <p className="font-semibold text-gray-700 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Car className="w-4 h-4" /> Vehicle Details
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-gray-600 text-sm">
              <span className="font-medium text-gray-500">Make</span>
              <span>{vd.make || "—"}</span>
              <span className="font-medium text-gray-500">Model</span>
              <span>{vd.model || "—"}</span>
              <span className="font-medium text-gray-500">Year</span>
              <span>{vd.yearOfManufacture || "—"}</span>
              <span className="font-medium text-gray-500">Color</span>
              <span className="capitalize">{vd.color || "—"}</span>
              <span className="font-medium text-gray-500">Plate</span>
              <span>{vd.licensePlateNumber || "—"}</span>
              <span className="font-medium text-gray-500">Reg. No.</span>
              <span>{vd.registrationNumber || "—"}</span>
              <span className="font-medium text-gray-500">Doc Status</span>
              <span>
                <Badge
                  variant={vd.status === "approved" ? "success" : "warning"}
                  className="text-xs"
                >
                  {vd.status}
                </Badge>
              </span>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-gray-50 rounded-xl p-3 text-sm border border-gray-100">
          <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Current Location
          </p>
          <p className="text-gray-700 font-mono text-xs">
            {driver.location?.coordinates?.[1]?.toFixed(6)},{" "}
            {driver.location?.coordinates?.[0]?.toFixed(6)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              navigate(`/user-management/driver/${driver.id}`);
            }}
          >
            Full Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const BirdsEyeView = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveTime, setLiveTime] = useState(new Date());
  const [selectedId, setSelectedId] = useState(null);
  const [detailDriver, setDetailDriver] = useState(null);
  const [search, setSearch] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const mapRef = useRef(null);
  const pollRef = useRef(null);

  // Load Google Maps SDK
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Build icon objects once after SDK is ready
  const icons = useMemo(() => {
    if (!isLoaded || !window.google) return null;
    return {
      economy: {
        url: svgToDataUrl(ECONOMY_SVG),
        scaledSize: new window.google.maps.Size(56, 46),
        anchor: new window.google.maps.Point(28, 46),
      },
      luxury: {
        url: svgToDataUrl(LUXURY_SVG),
        scaledSize: new window.google.maps.Size(68, 48),
        anchor: new window.google.maps.Point(34, 48),
      },
    };
  }, [isLoaded]);

  // Fetch drivers
  const fetchDrivers = useCallback(async () => {
    try {
      const res = await api.getBirdsEyeView();
      setDrivers(res?.data || []);
    } catch (_e) {
      // Keep existing data on poll failure; silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchDrivers();
    pollRef.current = setInterval(fetchDrivers, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchDrivers]);

  // Live clock — ticks every second independently of polling
  useEffect(() => {
    const clockRef = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(clockRef);
  }, []);

  // Smooth animated positions
  const smoothPositions = useSmoothPositions(drivers);

  const handleLocate = useCallback(
    (driver) => {
      const pos = smoothPositions[driver.id];
      if (!pos || !mapRef.current) return;
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(16);
      setSelectedId(driver.id);
    },
    [smoothPositions]
  );

  const handleRecenter = useCallback(() => {
    mapRef.current?.panTo(DEFAULT_CENTER);
    mapRef.current?.setZoom(13);
  }, []);

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((d) => {
        if (!search) return true;
        const name = [d.firstName, d.lastName].join(" ").toLowerCase();
        return name.includes(search.toLowerCase()) || (d.phone || "").includes(search);
      }),
    [drivers, search]
  );

  const economyCount = drivers.filter(
    (d) => d.vehicleType?.toLowerCase() !== "luxury"
  ).length;
  const luxuryCount = drivers.length - economyCount;

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500 space-y-2">
          <MapPin className="w-10 h-10 mx-auto opacity-50" />
          <p className="font-semibold">Failed to load Google Maps</p>
          <p className="text-sm text-gray-500">
            Please check your <code>VITE_GOOGLE_MAPS_API_KEY</code> environment
            variable.
          </p>
        </div>
      </div>
    );
  }

  return (
    // Break out of Layout's p-6 padding and max-w constraint
    <div
      className="-m-6 flex overflow-hidden"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* ── Map ─────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        {!isLoaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-3">
            <div className="w-9 h-9 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading map…</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={13}
            options={MAP_OPTIONS}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {icons &&
              drivers.map((driver) => {
                const pos = smoothPositions[driver.id];
                if (!pos) return null;
                const isLuxury = driver.vehicleType?.toLowerCase() === "luxury";
                return (
                  <Marker
                    key={driver.id}
                    position={pos}
                    icon={isLuxury ? icons.luxury : icons.economy}
                    title={
                      [driver.firstName, driver.lastName]
                        .filter(Boolean)
                        .join(" ") || "Driver"
                    }
                    zIndex={selectedId === driver.id ? 100 : 1}
                    onClick={() => {
                      setSelectedId(driver.id);
                      setDetailDriver(driver);
                    }}
                  />
                );
              })}
          </GoogleMap>
        )}

        {/* Top-left overlay pills — single row, no overlap */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none select-none">
          {/* Live + clock */}
          <div className="bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            Live
            <span className="text-gray-400">
              · {liveTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          {/* Online count */}
          <div className="bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 text-xs font-medium text-gray-700">
            <Users className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            {drivers.length} online
          </div>
        </div>

        {/* Recenter button */}
        <button
          className="absolute left-3 bottom-28 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          onClick={handleRecenter}
          title="Center on my location"
        >
          <MapPin className="w-4.5 h-4.5 text-primary-600" />
        </button>

        {/* Manual refresh */}
        <button
          className="absolute left-3 bottom-16 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          onClick={fetchDrivers}
          title="Refresh now"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Active Drivers</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              Auto-refresh 10s
            </span>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2 mt-2.5">
            <div className="flex-1 bg-green-50 rounded-lg px-2.5 py-1.5 text-center border border-green-100">
              <p className="text-xs text-green-600 font-medium">Economy</p>
              <p className="text-lg font-bold text-green-700">{economyCount}</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-lg px-2.5 py-1.5 text-center border border-amber-100">
              <p className="text-xs text-amber-600 font-medium">Luxury</p>
              <p className="text-lg font-bold text-amber-700">{luxuryCount}</p>
            </div>
            <div className="flex-1 bg-blue-50 rounded-lg px-2.5 py-1.5 text-center border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-lg font-bold text-blue-700">{drivers.length}</p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone…"
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Legend */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-green-50 border border-green-100 rounded-full px-2.5 py-1 text-[11px] font-medium text-green-700">
              <span className="w-2 h-2 rounded-sm bg-green-500 flex-shrink-0" />
              Economy
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 text-[11px] font-medium text-amber-700">
              <span className="w-2 h-2 rounded-sm bg-amber-500 flex-shrink-0" />
              Luxury
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 text-[11px] font-medium text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              On Trip
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-600">
              <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
              Available
            </span>
          </div>
        </div>

        {/* Driver list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            // Skeleton
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-gray-100 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="h-7 bg-gray-100 rounded-lg flex-1" />
                  <div className="h-7 bg-gray-100 rounded-lg flex-1" />
                </div>
              </div>
            ))
          ) : filteredDrivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
              <Car className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium text-gray-500">
                {search ? "No drivers match your search" : "No active drivers"}
              </p>
              {search && (
                <button
                  className="mt-2 text-xs text-primary-500 hover:underline"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                isSelected={selectedId === driver.id}
                onLocate={handleLocate}
                onView={(d) => {
                  setDetailDriver(d);
                  setSelectedId(d.id);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Driver detail modal */}
      <DriverDetailModal
        driver={detailDriver}
        isOpen={!!detailDriver}
        onClose={() => setDetailDriver(null)}
      />
    </div>
  );
};

export default BirdsEyeView;
