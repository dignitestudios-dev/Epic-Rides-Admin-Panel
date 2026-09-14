import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, Save } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { formatDateTime } from "../utils/helpers";
import useRideConfiguration from "../hooks/ride-configuration/useRideConfiguration";

const RideConfiguration = () => {
  const { config, loading, updating, fetchConfig, updateConfig } =
    useRideConfiguration();

  const [nearbyRadius, setNearbyRadius] = useState("");
  const [carpoolNearbyRadius, setCarpoolNearbyRadius] = useState("");
  const [nearbyError, setNearbyError] = useState("");
  const [carpoolError, setCarpoolError] = useState("");

  const savedNearbyRadius = useMemo(() => {
    if (config?.nearbyRadius !== undefined && config?.nearbyRadius !== null) {
      return Number(config.nearbyRadius);
    }
    return "";
  }, [config]);

  const savedCarpoolRadius = useMemo(() => {
    if (
      config?.carpoolNearbyRadius !== undefined &&
      config?.carpoolNearbyRadius !== null
    ) {
      return Number(config.carpoolNearbyRadius);
    }
    return 0.31;
  }, [config]);

  // Populate state once API returns config
  useEffect(() => {
    if (config) {
      if (config.nearbyRadius !== undefined && config.nearbyRadius !== null) {
        setNearbyRadius(config.nearbyRadius);
      }
      if (
        config.carpoolNearbyRadius !== undefined &&
        config.carpoolNearbyRadius !== null
      ) {
        setCarpoolNearbyRadius(config.carpoolNearbyRadius);
      } else {
        setCarpoolNearbyRadius(0.31);
      }
      setNearbyError("");
      setCarpoolError("");
    }
  }, [config]);

  const currentNearbyVal = Number(nearbyRadius);
  const currentCarpoolVal = Number(carpoolNearbyRadius);

  const isNearbyValid = !isNaN(currentNearbyVal) && currentNearbyVal > 0 && nearbyRadius !== "";
  const isCarpoolValid = !isNaN(currentCarpoolVal) && currentCarpoolVal > 0 && carpoolNearbyRadius !== "";
  const isValid = isNearbyValid && isCarpoolValid;

  const isDirty =
    !loading &&
    (currentNearbyVal !== savedNearbyRadius ||
      currentCarpoolVal !== savedCarpoolRadius);

  const handleNearbyChange = (e) => {
    const val = e.target.value;
    setNearbyRadius(val);
    if (val === "" || isNaN(Number(val)) || Number(val) <= 0) {
      setNearbyError("Please enter a valid radius greater than 0");
    } else {
      setNearbyError("");
    }
  };

  const handleCarpoolChange = (e) => {
    const val = e.target.value;
    setCarpoolNearbyRadius(val);
    if (val === "" || isNaN(Number(val)) || Number(val) <= 0) {
      setCarpoolError("Please enter a valid radius greater than 0");
    } else {
      setCarpoolError("");
    }
  };

  const handleReset = () => {
    setNearbyRadius(savedNearbyRadius);
    setCarpoolNearbyRadius(savedCarpoolRadius);
    setNearbyError("");
    setCarpoolError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !isDirty) return;

    await updateConfig({
      nearbyRadius: currentNearbyVal,
      carpoolNearbyRadius: currentCarpoolVal,
    });
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Ride Configuration
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
              Dispatch Engine
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Manage search, dispatch matching, and pickup radius thresholds
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={fetchConfig}
            disabled={loading || updating}
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Configuration Card ──────────────────────────────────────────── */}
      <Card className="p-6 rounded-xl border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a]">
        <div className="border-b border-gray-100 dark:border-[#1f242b] pb-4 mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            General Dispatch Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Configure search radius for private and carpool rides.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#61CB08] animate-spin" />
            <p className="text-xs text-gray-500 dark:text-slate-400">Loading configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            <div className="space-y-4">
              <div>
                <Input
                  label="Private Ride Radius (miles)"
                  type="number"
                  min="0.01"
                  step="any"
                  value={nearbyRadius}
                  onChange={handleNearbyChange}
                  error={nearbyError}
                  placeholder="e.g. 5"
                  disabled={updating}
                />
              </div>

              <div>
                <Input
                  label="Carpool Nearby Radius (miles)"
                  type="number"
                  min="0.01"
                  step="any"
                  value={carpoolNearbyRadius}
                  onChange={handleCarpoolChange}
                  error={carpoolError}
                  placeholder="e.g. 0.75"
                  disabled={updating}
                />
              </div>
            </div>

            {config?.updatedAt && (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Last updated: {formatDateTime(config.updatedAt)}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || !isValid || updating}
                icon={
                  updating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )
                }
              >
                {updating ? "Updating..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={!isDirty || updating}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RideConfiguration;
