import React from "react";
import {
  Search,
  Download,
  Plus,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Table from "../ui/Table";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { PAGINATION_CONFIG } from "../../config/constants";

const getPageNumbers = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

const DataTable = ({
  data = [],
  columns = [],
  title,
  subtitle,
  searchable = false,
  exportable = false,
  addButton = true,
  onAdd,
  onExport,
  loading = false,
  totalPages = 1,
  totalData = 0,
  currentPage = 1,
  pageSize = PAGINATION_CONFIG.defaultPageSize,
  searchTerm = "",
  searchPlaceholder = "Search records...",
  onPageChange,
  onPageSizeChange,
  onSearch,
  selectedUsers = [],
  handleBulkSuspend,
  handleBulkUnsuspend,
  handleExportCSV,
  exportBTn,
  children,
}) => {
  const handleExport = () => {
    if (onExport) {
      const formattedData = onExport(data);
      if (!formattedData || formattedData.length === 0) return;
      const headers = Object.keys(formattedData[0]);
      const csvContent = [
        headers.map((header) => `"${header}"`).join(","),
        ...formattedData.map((row) =>
          headers
            .map((header) => {
              let value = row[header] || "";
              value = value.toString().replace(/"/g, '""');
              return `"${value}"`;
            })
            .join(",")
        ),
      ].join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title?.replace(/\s+/g, "_") || "data"}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else {
      const csv = [
        columns.map((col) => col.label).join(","),
        ...data.map((row) =>
          columns.map((col) => row[col.key] || "").join(",")
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "data"}.csv`;
      a.click();
    }
  };

  const handleSearch = (e) => {
    if (loading) return;
    onSearch && onSearch(e.target.value);
  };

  const startIdx = totalData > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIdx = totalData > 0 ? Math.min(currentPage * pageSize, totalData) : 0;

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] overflow-hidden shadow-xs">
      {/* ── Table Card Header (Title & Subtitle + Top Action Buttons) ────── */}
      {(title || subtitle || addButton || exportBTn || exportable) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-100 dark:border-[#1f242b]">
          <div>
            {title && (
              <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                icon={<Download className="w-3.5 h-3.5" />}
                disabled={loading}
              >
                Export
              </Button>
            )}
            {addButton && onAdd && (
              <Button
                size="sm"
                onClick={onAdd}
                icon={<Plus className="w-3.5 h-3.5" />}
                disabled={loading}
              >
                Add New
              </Button>
            )}
            {exportBTn && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkSuspend}
                  disabled={selectedUsers.length === 0}
                >
                  Suspend Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkUnsuspend}
                  disabled={selectedUsers.length === 0}
                >
                  Reinstate Selected
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportCSV}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Integrated Filter & Search Toolbar (Matching Screenshots 2 & 3) ── */}
      {(searchable || children) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50/50 dark:bg-[#101317]/60 border-b border-gray-100 dark:border-[#1f242b]">
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px] flex-wrap">
            {searchable && (
              <div className="w-full sm:max-w-xs">
                <Input
                  placeholder={searchPlaceholder || "Search..."}
                  value={searchTerm}
                  onChange={handleSearch}
                  leftIcon={<Search className="w-3.5 h-3.5 text-gray-400" />}
                  rightIcon={
                    searchTerm ? (
                      <button
                        type="button"
                        onClick={() => onSearch && onSearch("")}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null
                  }
                  className="h-8 text-xs bg-white dark:bg-[#13161a]"
                />
              </div>
            )}
            {children}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400 px-2.5 py-1 rounded-md bg-white dark:bg-[#13161a] border border-gray-200/80 dark:border-[#1f242b] font-medium">
              {totalData > 0 ? `${totalData} shown` : "0 shown"}
            </span>
          </div>
        </div>
      )}

      {/* ── Main Data Table ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCcw className="w-6 h-6 animate-spin text-[#61CB08]" />
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
            Loading records...
          </span>
        </div>
      ) : (
        <Table data={data} columns={columns} loading={loading} />
      )}

      {/* ── Enterprise Pagination Footer ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-[#1f242b] bg-gray-50/40 dark:bg-[#101317]/40">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-slate-400">Show</span>
          <select
            name="pageSize"
            id="pageSize"
            className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#61CB08]"
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange && onPageSizeChange(Number(e.target.value))
            }
          >
            {PAGINATION_CONFIG.pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            rows
          </span>
          {totalData > 0 && (
            <span className="text-xs text-gray-400 dark:text-slate-500 hidden sm:inline ml-1">
              ({startIdx}–{endIdx} of {totalData})
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              className="px-2 py-1 h-7 rounded-md"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {getPageNumbers(currentPage, totalPages).map((page, index) =>
              page === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="px-2 text-xs text-gray-400 dark:text-slate-500"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  disabled={loading}
                  onClick={() => onPageChange && onPageChange(page)}
                  className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-md transition-colors ${
                    currentPage === page
                      ? "bg-[#61CB08] text-black shadow-xs font-bold"
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#181d24] hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || loading}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              className="px-2 py-1 h-7 rounded-md"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
