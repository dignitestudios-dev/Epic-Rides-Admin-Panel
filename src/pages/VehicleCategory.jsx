import { useMemo, useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Car,
  Plus,
  Loader2,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import Tabs from "../components/ui/Tabs";
import StatsCard from "../components/common/StatsCard";
import { useForm, Controller } from "react-hook-form";
import { formatDate } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useGetAllVehicleTypes from "../hooks/vehicle-types/useGetAllVehicleTypes";
import useCreateVehicleType from "../hooks/vehicle-types/useCreateVehicleType";
import useVehicleTypeActions from "../hooks/vehicle-types/useVehicleTypeActions";
import useDebounce from "../hooks/global/useDebounce";

const VehicleCategoryManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [rideType, setRideType] = useState("");

  const { loading, vehicleTypes, totalPages, totalData, getAllVehicleTypes } =
    useGetAllVehicleTypes(
      currentPage,
      pageSize,
      debouncedSearch,
      rideType,
    );

  // Reset page when search or rideType changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, rideType]);

  const { loading: loadingCreate, createVehicleType } = useCreateVehicleType();
  const {
    loading: loadingActions,
    updateVehicleType,
    deleteVehicleType,
  } = useVehicleTypeActions();

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const defaultValues = {
    model: "",
    rideType: "economy",
    notes: "",
    isActive: "true",
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  const tabs = [
    { key: "", label: "All Vehicles", count: totalData },
    { key: "economy", label: "Economy" },
    { key: "luxury", label: "Luxury" },
  ];

  const handleTabChange = (key) => {
    setRideType(key);
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "model",
      label: "Vehicle Model",
      render: (value, vehicle) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Car className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">
              {value || "—"}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              {vehicle._id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "rideType",
      label: "Ride Type",
      render: (value) => (
        <Badge variant={value === "luxury" ? "purple" : "info"} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (isActive) => (
        <Badge variant={isActive ? "success" : "danger"} dot>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (value) => (
        <span className="text-xs text-gray-500 dark:text-slate-400 max-w-[200px] truncate block">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => (
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, vehicle) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleEdit(vehicle)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
            title="Edit vehicle"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setVehicleToDelete(vehicle);
              setShowDeleteModal(true);
            }}
            disabled={loadingActions}
            className="p-1.5 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete vehicle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    if (size) {
      setCurrentPage(1);
      setPageSize(size);
    }
  };

  const handleAdd = () => {
    reset(defaultValues);
    setEditingVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    const formattedVehicle = {
      ...vehicle,
      isActive: JSON.stringify(vehicle.isActive),
    };
    setEditingVehicle(formattedVehicle);
    reset(formattedVehicle);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    const success = await deleteVehicleType(vehicleToDelete._id);
    if (success) {
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      getAllVehicleTypes();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const onSubmit = async (data) => {
    try {
      const isDuplicate = vehicleTypes?.some(
        (v) => v.model.toLowerCase().trim() === data.model.toLowerCase().trim() && v._id !== editingVehicle?._id
      );

      if (isDuplicate) {
        setError("model", {
          type: "manual",
          message: "This vehicle model already exists.",
        });
        return;
      }

      if (editingVehicle) {
        const payload = {
          rideType: data.rideType,
          isActive: data.isActive === "true" || data.isActive === true,
          notes: data.notes,
          model: data.model
        };
        const success = await updateVehicleType(editingVehicle._id, payload);
        if (success) {
          handleModalClose();
          getAllVehicleTypes();
        }
      } else {
        const payload = {
          ...data,
          isActive: data.isActive === "true" || data.isActive === true,
        };
        const success = await createVehicleType(payload);
        if (success) {
          handleModalClose();
          getAllVehicleTypes();
        }
      }
    } catch (error) {
      console.error("Error saving vehicle type:", error);
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Vehicle Category Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
              {totalData || 0} models
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Manage vehicle model mapping and service classes for your fleet
          </p>
        </div>
        <Button
          onClick={handleAdd}
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Vehicle
        </Button>
      </div>

      {/* Segment Tabs */}
      <Tabs tabs={tabs} activeTab={rideType} onChange={handleTabChange} />

      {/* Data Table */}
      <DataTable
        title="Vehicle Registry"
        subtitle="Catalog of authorized vehicle models by ride type"
        loading={loading}
        data={vehicleTypes}
        columns={columns}
        searchable
        searchTerm={search}
        searchPlaceholder="Search by model..."
        onSearch={setSearch}
        addButton={false}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalData={totalData}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingVehicle ? "Edit Vehicle" : "Create Vehicle"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Model"
              placeholder="e.g. Camry"
              {...register("model", { required: "Model is required" })}
              disabled={loadingCreate || loadingActions}
              error={errors.model?.message}
            />

            <Controller
              name="rideType"
              control={control}
              rules={{ required: "Ride type is required" }}
              render={({ field, fieldState }) => (
                <Select
                  label="Ride Type"
                  options={[
                    { value: "economy", label: "Economy" },
                    { value: "luxury", label: "Luxury" },
                  ]}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={loadingCreate || loadingActions}
                  error={fieldState.error?.message}
                />
              )}
            />

            {editingVehicle && (
              <div className="sm:col-span-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Status"
                      options={[
                        { value: "true", label: "Active" },
                        { value: "false", label: "Inactive" },
                      ]}
                      value={String(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={loadingCreate || loadingActions}
                    />
                  )}
                />
              </div>
            )}
          </div>

          <TextArea
            label="Notes"
            placeholder="Add any notes here..."
            maxLength={200}
            {...register("notes", { maxLength: { value: 200, message: "Notes cannot exceed 200 characters" } })}
            disabled={loadingCreate || loadingActions}
            rows={3}
            error={errors.notes?.message}
          />

          <div className="flex justify-end space-x-2.5 pt-4 border-t border-gray-100 dark:border-[#1f242b]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingCreate || loadingActions}
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loadingCreate || loadingActions}
            >
              {loadingCreate || loadingActions ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : editingVehicle ? (
                "Update Vehicle"
              ) : (
                "Create Vehicle"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Vehicle"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-slate-400">
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </p>
          {vehicleToDelete && (
            <div className="bg-gray-50 dark:bg-[#181d24] p-3 rounded-lg border border-gray-200 dark:border-[#1f242b]">
              <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">
                {vehicleToDelete.model}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 capitalize mt-0.5">
                Ride Type: {vehicleToDelete.rideType}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-2.5 pt-3 border-t border-gray-100 dark:border-[#1f242b]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={loadingActions}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              disabled={loadingActions}
            >
              {loadingActions ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VehicleCategoryManagement;

