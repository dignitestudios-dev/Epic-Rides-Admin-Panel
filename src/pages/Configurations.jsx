import React, { useEffect, useMemo } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useForm } from "react-hook-form";
import { useApp } from "../contexts/AppContext";
import useAppConfigsActions from "../hooks/app-configs/useAppConfigsActions";
import Button from "../components/ui/Button";
import { Sliders, Save, Loader2 } from "lucide-react";

const Configurations = () => {
  const { appConfigs } = useApp();
  const { loading, updateAppConfigs } = useAppConfigsActions();

  const defaultValues = useMemo(() => {
    return {
      pickupAddress: appConfigs?.pickupAddress || "",
      shippingCost: appConfigs?.shippingCost || 0,
    };
  }, [appConfigs]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (appConfigs) {
      reset({
        pickupAddress: appConfigs?.pickupAddress || "",
        shippingCost: appConfigs?.shippingCost || 0,
      });
    }
  }, [appConfigs, reset]);

  const onSubmit = (data) => {
    if (data.pickupAddress === appConfigs?.pickupAddress) {
      setError(
        "pickupAddress",
        { message: "No change in pickup address" },
        { shouldFocus: true }
      );
      return;
    }

    updateAppConfigs(data);
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Platform Configurations
          </h1>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
            System
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Global dispatch base points, default operating addresses, and core app variables
        </p>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-5 sm:p-6 max-w-2xl">
        <div className="border-b border-gray-100 dark:border-[#1f242b] pb-3 mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Dispatch Origin Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Default hub address used for fleet logistics and dispatch origin
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Default Hub / Pickup Address"
            placeholder="e.g. 100 S Biscayne Blvd, Miami, FL 33131"
            {...register("pickupAddress", {
              required: "Pickup address is required",
            })}
            disabled={loading}
            error={errors.pickupAddress?.message}
          />

          <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-[#1f242b]">
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            >
              {loading ? "Saving Changes..." : "Save Configurations"}
            </Button>
          </div>
        </form>

        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-3 pt-3 border-t border-gray-100 dark:border-[#1f242b]">
          Note: Changes take effect across active customer dispatch sessions immediately.
        </p>
      </div>
    </div>
  );
};

export default Configurations;

