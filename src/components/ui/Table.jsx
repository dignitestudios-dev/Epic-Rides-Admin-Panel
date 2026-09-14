import React from "react";

// Helper to extract plain text string from React elements or primitives for hover tooltip title
const getTitleText = (node) => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTitleText).filter(Boolean).join(" ").trim();
  if (React.isValidElement(node)) {
    return getTitleText(node.props?.children);
  }
  return "";
};

const Table = ({
  data = [],
  columns = [],
  loading = false,
  className = "",
  defaultMaxWidth = "240px",
}) => {
  return (
    <div className={`overflow-x-auto ${className} max-h-[72vh] relative select-text`}>
      <table className="min-w-full divide-y divide-gray-200/80 dark:divide-[#1f242b]">
        <thead className="sticky top-0 left-0 bg-[#f8f9fa]/95 dark:bg-[#101317]/95 backdrop-blur z-10 border-b border-gray-200/80 dark:border-[#1f242b]">
          <tr>
            {columns.map((column) => {
              const isActionCol =
                column.key === "actions" ||
                column.key === "action" ||
                column.key === "select" ||
                column.truncate === false;

              const maxWidth =
                column.maxWidth ||
                (isActionCol ? undefined : defaultMaxWidth);

              return (
                <th
                  key={column.key}
                  style={maxWidth ? { maxWidth } : undefined}
                  className={`px-4 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider ${
                    isActionCol ? "whitespace-nowrap" : "max-w-[240px]"
                  } ${column.headerClassName || ""}`}
                  title={column.label}
                >
                  <div className="flex items-center space-x-1 min-w-0">
                    <span className="truncate">{column.label}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#13161a] divide-y divide-gray-100 dark:divide-[#1a1f26]">
          {data.map((row, index) => (
            <tr
              key={row._id || row.id || index}
              className="hover:bg-gray-50 dark:hover:bg-[#181d24] transition-colors group"
            >
              {columns.map((column) => {
                const isActionCol =
                  column.key === "actions" ||
                  column.key === "action" ||
                  column.key === "select" ||
                  column.truncate === false;

                const maxWidth =
                  column.maxWidth ||
                  (isActionCol ? undefined : defaultMaxWidth);

                const cellValue = column.render
                  ? column.render(row[column.key], row)
                  : row[column.key];

                const titleText = isActionCol ? "" : getTitleText(cellValue);

                return (
                  <td
                    key={column.key}
                    style={maxWidth ? { maxWidth } : undefined}
                    className={`px-4 py-3 text-xs text-gray-800 dark:text-slate-200 ${
                      isActionCol
                        ? "whitespace-nowrap"
                        : "max-w-[240px] overflow-hidden"
                    } ${column.className || ""}`}
                    title={titleText || undefined}
                  >
                    {isActionCol ? (
                      cellValue
                    ) : (
                      <div
                        style={maxWidth ? { maxWidth } : undefined}
                        className="truncate max-w-[240px] min-w-0 [&_.flex]:min-w-0 [&_.flex]:max-w-full [&_.flex>span]:truncate [&_.flex>div]:min-w-0 [&_.flex>div>p]:truncate [&_.flex>*:first-child]:shrink-0"
                      >
                        {cellValue ?? "—"}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && !loading && (
        <div className="text-center py-12 text-xs text-gray-400 dark:text-slate-500">
          No records found
        </div>
      )}
    </div>
  );
};

export default Table;
