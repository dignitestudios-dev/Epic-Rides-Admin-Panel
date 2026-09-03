import { Inbox } from "lucide-react";

/**
 * The data grid. Hairline rules are the only ornament; alignment and the mono
 * numeric face do the rest of the work.
 *
 * Column shape:
 *   { key, label, render?, numeric?, align?, width?, className?, headerClassName? }
 *
 * Mark a column `numeric` to right-align it and render it in tabular figures,
 * so digits line up down the column and don't jitter as values change.
 */
const alignmentFor = (column) => {
  if (column.align) return `text-${column.align}`;
  return column.numeric ? "text-right" : "text-left";
};

const Table = ({
  data = [],
  columns = [],
  loading = false,
  className = "",
  emptyState,
  emptyMessage = "No records found",
  emptyHint,
  onRowClick,
  rowKey = (row, index) => row.id ?? row._id ?? index,
  skeletonRows = 8,
  stickyHeader = true,
  maxHeight = "70vh",
}) => {
  const showEmpty = !loading && data.length === 0;

  return (
    <div
      className={`relative w-full overflow-auto ${className}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse">
        <thead
          className={
            stickyHeader
              ? "sticky top-0 z-10 bg-surface after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-line"
              : "bg-surface"
          }
        >
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={[
                  "px-3 h-9 text-micro font-semibold uppercase text-ink-subtle whitespace-nowrap",
                  "first:pl-4 last:pr-4",
                  alignmentFor(column),
                  column.headerClassName ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="border-t border-line-subtle">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2.5 first:pl-4 last:pr-4">
                    <div
                      className="skeleton h-3.5"
                      style={{
                        width: `${55 + ((rowIndex * 7 + column.key.length * 3) % 35)}%`,
                        marginLeft: column.numeric ? "auto" : undefined,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                className={[
                  "border-t border-line-subtle transition-colors",
                  "hover:bg-surface-hover",
                  onRowClick ? "cursor-pointer" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-numeric={column.numeric ? "" : undefined}
                    className={[
                      "px-3 py-2.5 text-sm text-ink align-middle",
                      "first:pl-4 last:pr-4",
                      alignmentFor(column),
                      column.className ?? "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {showEmpty &&
        (emptyState ?? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-14 px-4 text-center">
            <Inbox className="w-5 h-5 text-ink-faint" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">{emptyMessage}</p>
            {emptyHint && (
              <p className="text-caption text-ink-subtle max-w-xs">{emptyHint}</p>
            )}
          </div>
        ))}
    </div>
  );
};

export default Table;
