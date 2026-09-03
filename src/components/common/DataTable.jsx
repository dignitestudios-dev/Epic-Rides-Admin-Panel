import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import Table from "../ui/Table";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { PAGINATION_CONFIG } from "../../config/constants";

/**
 * Paginated table panel. Renders without a border of its own — most callers
 * wrap it in a <Card>, which supplies the frame.
 */
const getPageNumbers = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let last;

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
    if (last) {
      if (i - last === 2) rangeWithDots.push(last + 1);
      else if (i - last !== 1) rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
};

const nf = new Intl.NumberFormat("en-US");

const DataTable = ({
  data = [],
  columns = [],
  title,
  description,
  searchable = false,
  exportable = false,
  addButton = true,
  addLabel = "Add new",
  onAdd,
  onExport,
  loading = false,
  totalPages = 1,
  totalData = 0,
  currentPage = 1,
  pageSize = PAGINATION_CONFIG.defaultPageSize,
  searchTerm = "",
  searchPlaceholder = "Search...",
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRowClick,
  emptyMessage,
  emptyHint,
  selectedUsers = [],
  handleBulkSuspend,
  handleBulkUnsuspend,
  handleExportCSV,
  exportBTn,
  actions,
}) => {
  const handleExport = () => {
    const formattedData = onExport ? onExport(data) : null;

    const rows =
      formattedData && formattedData.length > 0
        ? formattedData
        : data.map((row) =>
            Object.fromEntries(columns.map((col) => [col.label, row[col.key] ?? ""]))
          );

    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.map((header) => `"${header}"`).join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title?.replace(/\s+/g, "_") || "data"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const rangeStart = totalData === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalData);
  const hasToolbar = title || description || searchable || (addButton && onAdd) || exportBTn || exportable || actions;

  return (
    <div className="flex flex-col">
      {hasToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-line">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-semibold text-ink truncate">{title}</h2>
            )}
            {description && (
              <p className="text-caption text-ink-muted truncate">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {searchable && (
              <div className="w-full sm:w-56">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(event) => !loading && onSearch?.(event.target.value)}
                  leftIcon={<Search />}
                  rightIcon={
                    searchTerm ? (
                      <button
                        type="button"
                        onClick={() => onSearch?.("")}
                        aria-label="Clear search"
                        className="pointer-events-auto text-ink-faint hover:text-ink transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null
                  }
                />
              </div>
            )}

            {exportBTn && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleBulkSuspend}
                  disabled={selectedUsers.length === 0}
                >
                  Suspend selected
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleBulkUnsuspend}
                  disabled={selectedUsers.length === 0}
                >
                  Reinstate selected
                </Button>
                <Button variant="secondary" size="md" onClick={handleExportCSV}>
                  Export CSV
                </Button>
              </>
            )}

            {exportable && !exportBTn && (
              <Button variant="outline" size="md" onClick={handleExport} disabled={loading}>
                Export CSV
              </Button>
            )}

            {actions}

            {addButton && onAdd && (
              <Button size="md" onClick={onAdd} icon={<Plus />} disabled={loading}>
                {addLabel}
              </Button>
            )}
          </div>
        </div>
      )}

      <Table
        data={data}
        columns={columns}
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        emptyHint={emptyHint}
        maxHeight={null}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-line">
        <div className="flex items-center gap-2 text-caption text-ink-muted">
          <span className="tnum">
            {loading
              ? "Loading…"
              : totalData > 0
              ? `${nf.format(rangeStart)}–${nf.format(rangeEnd)} of ${nf.format(totalData)}`
              : "No results"}
          </span>

          <span aria-hidden="true" className="text-ink-faint">·</span>

          <label className="flex items-center gap-1.5">
            <span className="sr-only sm:not-sr-only">Rows</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
              className="h-7 pl-2 pr-6 rounded border border-line bg-surface text-ink text-caption cursor-pointer transition-colors hover:border-line-strong focus:outline-none focus:border-interactive focus:ring-2 focus:ring-interactive/25"
            >
              {PAGINATION_CONFIG.pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        {totalPages > 1 && (
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeft />}
              aria-label="Previous page"
              disabled={currentPage === 1 || loading}
              onClick={() => onPageChange?.(currentPage - 1)}
            />

            {getPageNumbers(currentPage, totalPages).map((page, index) =>
              page === "..." ? (
                <span
                  key={`gap-${index}`}
                  aria-hidden="true"
                  className="px-1 text-caption text-ink-faint"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  disabled={loading}
                  aria-current={currentPage === page ? "page" : undefined}
                  onClick={() => onPageChange?.(page)}
                  className={`tnum h-7 min-w-[28px] px-1.5 rounded text-caption font-medium transition-colors ${
                    currentPage === page
                      ? "bg-interactive text-interactive-ink"
                      : "text-ink-muted hover:text-ink hover:bg-surface-hover"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight />}
              aria-label="Next page"
              disabled={currentPage === totalPages || loading}
              onClick={() => onPageChange?.(currentPage + 1)}
            />
          </nav>
        )}
      </div>
    </div>
  );
};

export default DataTable;
