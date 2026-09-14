import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Plus, RefreshCcw, Trash2, Clock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import usePeakWindowsActions from "../hooks/ride-rates/usePeakWindowsActions";
import { handleError } from "../utils/helpers";

const getWindowRange = (window) => ({
  startHour: Number(window.startHour),
  endHour: Number(window.endHour),
});

const overlaps = (a, b) => Math.max(a.startHour, b.startHour) < Math.min(a.endHour, b.endHour);

const peakWindowSchema = z
  .object({
    startHour: z.coerce.number().int().min(0).max(23),
    endHour: z.coerce.number().int().min(1).max(24),
    isActive: z.coerce.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.endHour <= value.startHour) {
      ctx.addIssue({
        code: "custom",
        path: ["endHour"],
        message: "End hour must be greater than start hour",
      });
    }
  });

const emptyWindow = {
  startHour: 7,
  endHour: 10,
  isActive: true,
};

const PeakWindows = () => {
  const { loading, peakWindows, createPeakWindow, updatePeakWindow, deletePeakWindow } =
    usePeakWindowsActions();
  const [editingWindow, setEditingWindow] = useState(null);
  const editingWindowId = editingWindow?.id || editingWindow?._id || null;

  const defaultValues = useMemo(() => editingWindow || emptyWindow, [editingWindow]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(peakWindowSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (values) => {
    const nextRange = getWindowRange(values);
    const hasConflict = peakWindows.some((window) => {
      const windowId = window.id || window._id;
      if (editingWindowId && windowId === editingWindowId) return false;
      return overlaps(nextRange, getWindowRange(window));
    });

    if (hasConflict) {
      handleError(new Error("This time range overlaps an existing peak window"));
      return;
    }

    if (editingWindow?.id || editingWindow?._id) {
      await updatePeakWindow(editingWindow.id || editingWindow._id, values);
    } else {
      await createPeakWindow(values);
    }
    setEditingWindow(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#61CB08]" />
            Peak Windows Configuration
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Define daily operating hours when dynamic surge multipliers and peak pricing surcharges apply.
          </p>
        </div>
        <Button
          onClick={() => setEditingWindow({ ...emptyWindow })}
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
        >
          Add Peak Window
        </Button>
      </div>

      {loading && !peakWindows.length ? (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-8 text-gray-500 text-sm shadow-sm justify-center">
          <RefreshCcw className="h-4 w-4 animate-spin text-[#61CB08]" />
          Loading peak windows...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {peakWindows.map((window) => (
            <div
              key={window.id || window._id}
              className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-5 shadow-sm transition-all hover:border-[#61CB08]/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#61CB08]/10 text-[#61CB08] flex items-center justify-center font-bold text-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      {window.startHour}:00 — {window.endHour}:00
                    </h2>
                    <div className="mt-1">
                      <Badge variant={window.isActive ? "success" : "default"} dot className="text-[10px]">
                        {window.isActive ? "Active Window" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingWindow(window)}
                    icon={<Edit2 className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deletePeakWindow(window.id || window._id)}
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 dark:bg-[#181d24] border border-gray-100 dark:border-[#222831] px-3.5 py-2.5">
                  <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Start Hour</div>
                  <div className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
                    {window.startHour}:00
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-[#181d24] border border-gray-100 dark:border-[#222831] px-3.5 py-2.5">
                  <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">End Hour</div>
                  <div className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
                    {window.endHour}:00
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-[#181d24] border border-gray-100 dark:border-[#222831] px-3.5 py-2.5">
                  <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Duration</div>
                  <div className="mt-0.5 text-base font-bold text-[#61CB08]">
                    {Math.max(0, window.endHour - window.startHour)} hrs
                  </div>
                </div>
              </div>
            </div>
          ))}
          {peakWindows.length === 0 && (
            <div className="col-span-2 text-center p-8 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl text-gray-400 text-sm">
              No peak windows configured yet. Click "Add Peak Window" to get started.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!editingWindow}
        onClose={() => setEditingWindow(null)}
        title={editingWindow?.id || editingWindow?._id ? "Edit Peak Window" : "Create Peak Window"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Start Hour (0 - 23)"
              type="number"
              min="0"
              max="23"
              {...register("startHour")}
              error={errors.startHour?.message}
            />
            <Input
              label="End Hour (1 - 24)"
              type="number"
              min="1"
              max="24"
              {...register("endHour")}
              error={errors.endHour?.message}
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-gray-50 dark:bg-[#181d24] px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300 text-[#61CB08] focus:ring-[#61CB08] accent-[#61CB08]"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable this peak window for surge pricing
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditingWindow(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Save Window
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PeakWindows;
