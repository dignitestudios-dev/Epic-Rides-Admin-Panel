import React, { forwardRef, useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      prefix,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      options = [],
      placeholder = "Select an option...",
      searchable = false,
      onSearch,
      value,
      onChange,
      disabled = false,
      name,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter options based on search term
    useEffect(() => {
      if (!searchable || !searchTerm) {
        setFilteredOptions(options);
        return;
      }

      if (onSearch) {
        // If custom onSearch function is provided, use it
        onSearch(searchTerm);
      } else {
        // Default search behavior - filter by label
        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, [searchTerm, options, searchable, onSearch]);

    // Reset search when options change (for custom onSearch)
    useEffect(() => {
      if (onSearch) {
        setFilteredOptions(options);
      }
    }, [options, onSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event) => {
        if (!isOpen) return;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
            break;
          case "Enter":
            event.preventDefault();
            if (highlightedIndex >= 0) {
              handleSelect(filteredOptions[highlightedIndex]);
            }
            break;
          case "Escape":
            event.preventDefault();
            setIsOpen(false);
            setSearchTerm("");
            setHighlightedIndex(-1);
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filteredOptions, highlightedIndex]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (highlightedIndex >= 0 && dropdownRef.current) {
        const highlightedElement =
          dropdownRef.current.children[highlightedIndex];
        if (highlightedElement) {
          highlightedElement.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      }
    }, [highlightedIndex]);

    const selectedOption = options?.find((opt) => opt.value === value);

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setSearchTerm("");
      setHighlightedIndex(-1);
    };
    const handleSelect = (option) => {
      if (onChange) {
        onChange({
          target: {
            name,
            value: option.value,
          },
        });
      }

      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    };

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setHighlightedIndex(-1);
    };

    const baseClasses =
      "block w-full h-8 px-2.5 border border-line rounded bg-surface text-ink text-sm cursor-pointer transition-colors duration-150 hover:border-line-strong focus:outline-none focus:border-interactive focus:ring-2 focus:ring-interactive/25";
    const errorClasses = error
      ? "border-danger focus:border-danger focus:ring-danger/25"
      : "";
    const disabledClasses = disabled
      ? "opacity-45 pointer-events-none bg-surface-sunken"
      : "";

    return (
      <div className="space-y-1.5" ref={containerRef}>
        {label && !prefix && (
          <label className="block text-caption font-medium text-ink-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 max-w-[45%] truncate text-caption font-medium text-ink-subtle pointer-events-none z-10">
              {prefix}
            </span>
          )}
          {leftIcon && !prefix && (
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none z-10 text-ink-faint [&>svg]:w-4 [&>svg]:h-4">
              {leftIcon}
            </div>
          )}

          {/* Trigger Button */}
          <button
            ref={ref}
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            name={name}
            className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className} flex items-center justify-between text-left ${prefix ? "pl-[46%]" : leftIcon ? "pl-8" : ""}`}
            {...props}
          >
            <span
              className={`truncate ${
                selectedOption ? "text-ink" : "text-ink-faint"
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 ml-1.5 text-ink-faint transition-transform duration-150 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {rightIcon && (
            <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none text-ink-faint [&>svg]:w-4 [&>svg]:h-4">
              {rightIcon}
            </div>
          )}

          {/* Dropdown */}
          <div
            className={`absolute z-50 w-full mt-1 bg-surface-raised border border-line rounded-lg shadow-lg max-h-60 overflow-hidden origin-top transition-all duration-150 ease-out ${
              isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none"
            }`}
          >
            {searchable && (
              <div className="p-1.5 border-b border-line">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full h-7 pl-8 pr-2 text-sm bg-surface-sunken border border-line rounded focus:outline-none focus:border-interactive focus:ring-2 focus:ring-interactive/25 text-ink placeholder:text-ink-faint"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto" ref={dropdownRef}>
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-ink-faint" />
                  <span className="text-caption text-ink-subtle">Loading</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-caption text-ink-subtle">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full px-2.5 py-1.5 text-left text-sm flex items-center justify-between gap-2 transition-colors duration-100 focus:outline-none hover:bg-surface-hover focus:bg-surface-hover ${
                      highlightedIndex === index ? "bg-surface-hover" : ""
                    } ${
                      option.value === value
                        ? "font-medium text-ink"
                        : "text-ink-muted"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-interactive" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-caption text-danger">{error}</p>}
        {helperText && !error && (
          <p className="text-caption text-ink-subtle">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;