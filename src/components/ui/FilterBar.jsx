import { Calendar, Search, X as XIcon } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

/**
 * Row of filter controls that sits above a table. Controls line up on one
 * baseline; the clear action only appears once something is actually filtered.
 */
const FilterBar = ({
  filters = [],
  onClear,
  showClear = true,
  className = "",
  searchable = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}) => {
  const hasActiveFilter =
    Boolean(searchValue) || filters.some((filter) => Boolean(filter.value));

  return (
    <div className={`flex flex-wrap items-end gap-2 ${className}`}>
      {searchable && (
        <div className="w-full sm:w-64">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            leftIcon={<Search />}
            rightIcon={
              searchValue ? (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  aria-label="Clear search"
                  className="pointer-events-auto text-ink-faint hover:text-ink transition-colors"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              ) : null
            }
          />
        </div>
      )}

      {filters.map((filter) => {
        if (filter.type === "select") {
          return (
            <div key={filter.key} className="w-[180px]">
              <Select
                value={filter.value}
                onChange={filter.onChange}
                options={[...(filter.options || [])]}
                className={filter.className || ""}
                placeholder={filter.placeholder || filter.label}
                prefix={filter.label}
              />
            </div>
          );
        }

        if (filter.type === "date") {
          return (
            <div key={filter.key} className="w-[176px]">
              <Input
                type="date"
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className={filter.className || ""}
                leftIcon={<Calendar />}
                aria-label={filter.label}
              />
            </div>
          );
        }

        return (
          <div key={filter.key} className="w-[180px]">
            <Input
              type="text"
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              placeholder={filter.placeholder || filter.label}
              className={filter.className || ""}
              prefix={filter.label}
            />
          </div>
        );
      })}

      {showClear && hasActiveFilter && (
        <Button variant="ghost" icon={<XIcon />} onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
