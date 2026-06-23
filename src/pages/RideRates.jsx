import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Plus, RefreshCcw } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import useRideRatesActions from "../hooks/ride-rates/useRideRatesActions";

const bracketSchema = z.object({
  minMiles: z.coerce.number().min(0, "Min miles must be 0 or more"),
  maxMiles: z
    .union([z.coerce.number().positive("Max miles must be greater than 0"), z.literal("")])
    .nullable()
    .optional(),
  ratePerMile: z.coerce.number().positive("Rate per mile must be greater than 0"),
});

const rateSchema = z
  .object({
    rideType: z.string().min(1),
    brackets: z.array(bracketSchema).min(1, "At least one bracket is required"),
    peakSurchargePerMile: z.coerce.number().min(0).max(100000, "Peak surcharge cannot exceed 100000"),
    discountPercentage: z.coerce.number().min(0).max(100),
  })
  .superRefine((value, ctx) => {
    value.brackets.forEach((bracket, index) => {
      const normalizedMax =
        bracket.maxMiles === null || bracket.maxMiles === "" ? null : Number(bracket.maxMiles);

      if (normalizedMax !== null && normalizedMax <= bracket.minMiles) {
        ctx.addIssue({
          code: "custom",
          message: "Max miles must be greater than min miles",
          path: ["brackets", index, "maxMiles"],
        });
      }

      if (index > 0) {
        const prev = value.brackets[index - 1];
        const prevMax = prev.maxMiles === null || prev.maxMiles === "" ? null : Number(prev.maxMiles);
        const expectedMin = prevMax === null ? prev.minMiles + 1 : prevMax + 1;

        if (bracket.minMiles !== expectedMin) {
          ctx.addIssue({
            code: "custom",
            message: `Min miles must start at ${expectedMin} to avoid overlapping ranges`,
            path: ["brackets", index, "minMiles"],
          });
        }
      }
    });
  });

const emptyRate = {
  rideType: "",
  brackets: [{ minMiles: 0, maxMiles: 5, ratePerMile: 0 }],
  peakSurchargePerMile: 0,
  discountPercentage: 0,
};

const buildNextBracket = (brackets) => {
  const lastBracket = brackets[brackets.length - 1];
  const lastMax = lastBracket?.maxMiles === "" || lastBracket?.maxMiles == null ? null : Number(lastBracket.maxMiles);
  const minMiles = brackets.length === 0 ? 0 : lastMax == null ? Number(lastBracket.minMiles) + 1 : lastMax + 1;
  const maxMiles = minMiles + 4;

  return {
    minMiles,
    maxMiles,
    ratePerMile: 0,
  };
};

const normalizeBrackets = (brackets) =>
  brackets.map((bracket, index) => {
    const normalized = {
      ...bracket,
      minMiles: Number(bracket.minMiles),
      ratePerMile: Number(bracket.ratePerMile),
      maxMiles:
        bracket.maxMiles === "" || bracket.maxMiles === null || bracket.maxMiles === undefined
          ? null
          : Number(bracket.maxMiles),
    };

    if (index > 0) {
      const prev = brackets[index - 1];
      const prevMax = prev.maxMiles === "" || prev.maxMiles === null || prev.maxMiles === undefined
        ? Number(prev.minMiles)
        : Number(prev.maxMiles);
      normalized.minMiles = prevMax + 1;
    }

    return normalized;
  });

const RideRates = () => {
  const { data, loading, updateRideRate } = useRideRatesActions();
  const [editingRate, setEditingRate] = useState(null);

  const rates = data?.rates || [];
  const peakWindows = data?.peakWindows || [];

  const defaultValues = useMemo(() => {
    if (!editingRate) return emptyRate;
    return {
      rideType: editingRate.rideType || "",
      brackets: editingRate.brackets?.length
        ? editingRate.brackets.map((bracket) => ({
            ...bracket,
            maxMiles: bracket.maxMiles ?? "",
          }))
        : emptyRate.brackets,
      peakSurchargePerMile: editingRate.peakSurchargePerMile ?? 0,
      discountPercentage: editingRate.discountPercentage ?? 0,
    };
  }, [editingRate]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rateSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "brackets",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watchedBrackets = useWatch({ control, name: "brackets" });

  useEffect(() => {
    if (!watchedBrackets?.length) return;

    watchedBrackets.forEach((bracket, index) => {
      if (index === 0) return;

      const prev = watchedBrackets[index - 1];
      const prevMax =
        prev?.maxMiles === "" || prev?.maxMiles === null || prev?.maxMiles === undefined
          ? Number(prev?.minMiles)
          : Number(prev.maxMiles);
      const nextMin = prevMax + 1;

      if (Number(bracket?.minMiles) !== nextMin) {
        setValue(`brackets.${index}.minMiles`, nextMin, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    });
  }, [watchedBrackets, setValue]);

  const openEditor = (rate) => setEditingRate(rate);
  const closeEditor = () => setEditingRate(null);

  const onSubmit = async (values) => {
    await updateRideRate(editingRate.rideType, {
      ...values,
      brackets: normalizeBrackets(values.brackets),
    });
    closeEditor();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 p-6 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-primary-300">Pricing</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ride Rates</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-300">
              Manage tiered ride pricing, peak surcharge, and discounts for each ride type.
            </p>
          </div>
          <div className="text-sm text-gray-300">
            {peakWindows.length} peak window{peakWindows.length === 1 ? "" : "s"} configured
          </div>
        </div>
      </div>

      {loading && !rates.length ? (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          Loading ride rates...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {rates.map((rate) => (
            <Card key={rate.rideType} className="border border-gray-200 shadow-sm dark:border-gray-800">
              <Card.Content>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                      {rate.rideType}
                    </h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEditor(rate)} icon={<Edit2 className="h-4 w-4" />}>
                    Edit
                  </Button>
                </div>

                <div className="mt-5 space-y-3">
                  {rate.brackets?.map((bracket, index) => (
                    <div
                      key={`${rate.rideType}-${index}`}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {bracket.minMiles} to {bracket.maxMiles ?? "unlimited"} miles
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Bracket {index + 1}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${Number(bracket.ratePerMile).toFixed(2)} / mile
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-primary-50 px-4 py-3 dark:bg-primary-950/40">
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-400">Peak surcharge</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      ${Number(rate.peakSurchargePerMile || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-400">Discount</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {Number(rate.discountPercentage || 0)}%
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!editingRate}
        onClose={closeEditor}
        title={`Edit ${editingRate?.rideType || ""} Rate`}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Peak surcharge per mile"
              type="number"
              step="0.01"
              max="100000"
              {...register("peakSurchargePerMile")}
              error={errors.peakSurchargePerMile?.message}
            />
            <Input
              label="Discount percentage"
              type="number"
              step="0.01"
              {...register("discountPercentage")}
              error={errors.discountPercentage?.message}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Mileage brackets</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(buildNextBracket(fields))}
                icon={<Plus className="h-4 w-4" />}
              >
                Add bracket
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label="Min miles"
                      type="number"
                      step="1"
                      {...register(`brackets.${index}.minMiles`)}
                      error={errors.brackets?.[index]?.minMiles?.message}
                      readOnly={index > 0}
                    />
                    <Input
                      label="Max miles"
                      type="number"
                      step="1"
                      placeholder="Leave blank for infinity"
                      {...register(`brackets.${index}.maxMiles`)}
                      error={errors.brackets?.[index]?.maxMiles?.message}
                    />
                    <Input
                      label="Rate per mile"
                      type="number"
                      step="0.01"
                      {...register(`brackets.${index}.ratePerMile`)}
                      error={errors.brackets?.[index]?.ratePerMile?.message}
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} disabled={fields.length === 1}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeEditor}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RideRates;
