import { useMemo, useState } from "react";
import Select from "../components/ui/Select";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  Layers,
  ShieldCheck,
  ShieldX,
  ArrowRight,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Tabs from "../components/ui/Tabs";
import StatsCard from "../components/common/StatsCard";
import { useForm, Controller } from "react-hook-form";
import { formatDate, formatNumber } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useGetAllCategories from "../hooks/categories/useGetAllCategories";
import useCategoryActions from "../hooks/categories/useCategoryActions";
import useCreateCategory from "../hooks/categories/useCreateCategory";
import { usePersistentState } from "../hooks/global/usePersistentState";

const Categories = () => {
  const [currentPage, setCurrentPage] = usePersistentState("categories_currentPage", 1);
  const [pageSize, setPageSize] = usePersistentState("categories_pageSize", PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = usePersistentState("categories_status", "");

  const {
    loading,
    stats,
    totalPages,
    totalData,
    categories,
    getAllCategories,
  } = useGetAllCategories(status, currentPage, pageSize);

  const { loading: loadingCreateCategory, createCategory } = useCreateCategory();
  const {
    loading: loadingCategoryActions,
    deleteCategory,
    updateCategory,
  } = useCategoryActions();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const defaultValues = {
    name: "",
    isActive: "true",
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues });

  const tabs = [
    { key: "", label: "All Categories", count: stats?.totalCategories ?? totalData },
    { key: "active", label: "Active", count: stats?.totalActiveCategories },
    { key: "inactive", label: "Inactive", count: stats?.totalInactiveCategories },
  ];

  const handleTabChange = (val) => {
    setStatus(val);
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "name",
      label: "Category Name",
      render: (name, category) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#61CB08]/15 border border-[#61CB08]/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#61CB08]">
              {(name?.[0] || "C").toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {name || "—"}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              {category._id}
            </p>
          </div>
        </div>
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
      render: (_, category) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleEdit(category)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
            title="Edit category"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(category._id)}
            disabled={loadingCategoryActions}
            className="p-1.5 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete category"
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

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const handleAdd = () => {
    reset(defaultValues);
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    const formattedCategory = {
      ...category,
      isActive: JSON.stringify(category.isActive),
    };

    setEditingCategory(formattedCategory);
    reset(formattedCategory);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    const success = await deleteCategory(categoryId);
    if (success) {
      getAllCategories();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const handleExportCategories = (data) => {
    return data.map((category) => ({
      Title: category?.name,
      Status: category?.isActive ? "Active" : "Inactive",
      Created: formatDate(category?.createdAt),
    }));
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        const categoryId = editingCategory._id;
        const {
          _id,
          createdAt,
          updatedAt,
          __v,
          isDeleted,
          ...editCategoryPayload
        } = data;

        const payload = {
          ...editCategoryPayload,
          isActive: editCategoryPayload.isActive === "true" || editCategoryPayload.isActive === true,
        };

        const success = await updateCategory(categoryId, payload);
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllCategories();
        }
      } else {
        const payload = {
          ...data,
          isActive: data.isActive === "true" || data.isActive === true,
        };
        const success = await createCategory(payload);
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllCategories();
        }
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Categories Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20">
              {totalData || 0} categories
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Organize and manage ride service categories across the fleet
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleAdd}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Categories"
          value={formatNumber(stats?.totalCategories || totalData || 0)}
          index={0}
        />
        <StatsCard
          title="Active Categories"
          value={formatNumber(stats?.totalActiveCategories || 0)}
          index={1}
        />
        <StatsCard
          title="Inactive Categories"
          value={formatNumber(stats?.totalInactiveCategories || 0)}
          index={2}
        />
      </div>

      {/* Segment Tabs */}
      <Tabs tabs={tabs} activeTab={status} onChange={handleTabChange} />

      {/* Data Table */}
      <DataTable
        title="Category Directory"
        subtitle="List of all catalog category items and operational status"
        loading={loading}
        data={categories}
        columns={columns}
        onExport={handleExportCategories}
        onAdd={handleAdd}
        addButton={false}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalData={totalData}
        exportable
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Premium Executive"
            {...register("name", { required: "Category name is required" })}
            disabled={loadingCreateCategory || loadingCategoryActions}
            error={errors.name?.message}
          />

          <Controller
            name="isActive"
            control={control}
            disabled={loadingCreateCategory || loadingCategoryActions}
            rules={{ required: "Status is required" }}
            render={({ field, fieldState }) => (
              <Select
                label="Status"
                options={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
                value={String(field.value)}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  if (e.target.value) clearErrors("isActive");
                }}
                disabled={loadingCreateCategory || loadingCategoryActions}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="flex justify-end space-x-2.5 pt-4 border-t border-gray-100 dark:border-[#1f242b]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingCreateCategory || loadingCategoryActions}
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loadingCreateCategory || loadingCategoryActions}
            >
              {loadingCreateCategory || loadingCategoryActions ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;

