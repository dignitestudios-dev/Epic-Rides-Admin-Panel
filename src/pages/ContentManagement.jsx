import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Sliders, Save, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ContentManagement = () => {
  const [pricing, setPricing] = useState({
    baseFare: 50,
    perMileRate: 10,
    perMinuteRate: 2,
    surgeMultiplier: 1,
    cancellationFee: 5,
    instantWithdrawalFee: 1,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setPricing((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save or hook into API
    setTimeout(() => {
      setSaving(false);
      toast.success("Pricing configurations saved successfully");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-[#61CB08]" />
          Platform Pricing Configuration
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Manage system-wide default fare parameters, rate multipliers, and fee schedules.
        </p>
      </div>

      <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Fare Settings & Platform Fees
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Changes will take effect for all subsequent ride calculations across the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Base Fare ($)"
            type="number"
            value={pricing.baseFare}
            onChange={(e) => handleChange("baseFare", e.target.value)}
          />
          <Input
            label="Per Mile Rate ($)"
            type="number"
            value={pricing.perMileRate}
            onChange={(e) => handleChange("perMileRate", e.target.value)}
          />
          <Input
            label="Per Minute Rate ($)"
            type="number"
            value={pricing.perMinuteRate}
            onChange={(e) => handleChange("perMinuteRate", e.target.value)}
          />
          <Input
            label="Surge Multiplier (x)"
            type="number"
            step="0.1"
            value={pricing.surgeMultiplier}
            onChange={(e) => handleChange("surgeMultiplier", e.target.value)}
          />
          <Input
            label="Cancellation Fee ($)"
            type="number"
            value={pricing.cancellationFee}
            onChange={(e) => handleChange("cancellationFee", e.target.value)}
          />
          <Input
            label="Instant Withdrawal Fee (%)"
            type="number"
            value={pricing.instantWithdrawalFee}
            onChange={(e) =>
              handleChange("instantWithdrawalFee", e.target.value)
            }
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-[#1f242b]">
          <Button
            onClick={handleSave}
            loading={saving}
            variant="primary"
            icon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
