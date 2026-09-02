import React, { useState, useEffect } from "react";
import { Car, Sliders, Info, Check, Loader2, Navigation } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { api } from "../lib/services";
import { handleError, handleSuccess } from "../utils/helpers";
import toast from "react-hot-toast";

const CONFIG_TABS = [
  {
    id: "ride-configuration",
    label: "Ride Configuration",
    icon: Car,
    description: "Manage ride dispatch radius and matching parameters",
  },
  // Future sub-tabs can be added here
];

/* ── Ride Configuration Sub-Tab ────────────────────────────────────────── */
const RideConfigurationTab = () => {
  const [nearbyRadius, setNearbyRadius] = useState("");
  const [initialRadius, setInitialRadius] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await api.getRideConfiguration();
      const radius = response?.data?.nearbyRadius ?? response?.nearbyRadius ?? "";
      setNearbyRadius(radius !== "" ? String(radius) : "");
      setInitialRadius(radius !== "" ? Number(radius) : null);
      setError("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load ride configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const radiusNum = Number(nearbyRadius);

    if (nearbyRadius === "" || isNaN(radiusNum)) {
      setError("Please enter a valid radius number.");
      return;
    }

    if (radiusNum <= 0) {
      setError("Nearby radius must be greater than 0.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const payload = { nearbyRadius: radiusNum };
      const response = await api.updateRideConfiguration(payload);
      handleSuccess(response?.message, "Ride configuration updated successfully");
      setInitialRadius(radiusNum);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#39A300] mb-3" />
          <p className="text-sm text-gray-500">Loading ride configuration...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-[#39A300]">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Nearby Driver Dispatch Radius
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure the search radius for matching riders with available drivers
                </p>
              </div>
            </div>
            {initialRadius != null && (
              <Badge variant="primary" className="text-xs px-3 py-1">
                Active: {initialRadius} {initialRadius === 1 ? "mile" : "miles"}
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <Input
                  label="Nearby Radius (in miles) *"
                  name="nearbyRadius"
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder="e.g. 5"
                  value={nearbyRadius}
                  onChange={(e) => {
                    setNearbyRadius(e.target.value);
                    if (error) setError("");
                  }}
                  error={error}
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Enter the maximum distance in miles to detect nearby drivers.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    How it works
                  </p>
                  <p>
                    When a rider requests a ride, the system searches for available active drivers located within this radius around the pickup coordinates.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={fetchConfig}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                icon={<Check className="w-4 h-4" />}
              >
                Save Configuration
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

/* ── Main Configurations Page ──────────────────────────────────────────── */
const Configurations = () => {
  const [activeTab, setActiveTab] = useState("ride-configuration");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurations
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage system rules, ride dispatch, and application settings
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {CONFIG_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                isActive
                  ? "text-[#39A300] border-b-2 border-[#39A300]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-base">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Content */}
      <div className="pt-2">
        {activeTab === "ride-configuration" && <RideConfigurationTab />}
      </div>
    </div>
  );
};

export default Configurations;
