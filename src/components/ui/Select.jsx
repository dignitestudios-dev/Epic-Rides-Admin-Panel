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
        onSearch(searchTerm);
      } else {
        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, [searchTerm, options, searchable, onSearch]);

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
      "block w-full px-3.5 py-2.5 border rounded-lg shadow-xs bg-white dark:bg-[#13161a] text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#61CB08]/20 focus:border-[#61CB08] text-sm font-medium transition-all duration-150 cursor-pointer";
    const errorClasses = error
      ? "border-rose-400 dark:border-rose-500 focus:ring-rose-500/30 focus:border-rose-500"
      : "border-gray-200 dark:border-[#1f242b]";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
      <div className="space-y-1.5" ref={containerRef}>
        {label && !prefix && (
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-24 text-xs font-medium text-gray-500 dark:text-slate-400 pointer-events-none z-10 whitespace-nowrap overflow-hidden text-ellipsis">
              {prefix}:
            </span>
          )}
          {leftIcon && !prefix && (
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10 text-gray-400">
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
            className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className} flex items-center justify-between text-left ${prefix ? 'pl-28' : (leftIcon ? 'pl-8' : '')}`}
            {...props}
          >
            <span
              className={
                selectedOption
                  ? "text-gray-900 dark:text-slate-100 font-medium truncate"
                  : "text-gray-400 dark:text-slate-500 truncate"
              }
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {rightIcon && (
            <div className="absolute inset-y-0 right-8 pr-2.5 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}

          {/* Dropdown */}
          <div
            className={`absolute z-50 w-full mt-1 bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-lg shadow-xl max-h-60 overflow-hidden transition-all duration-150 origin-top ${
              isOpen
                ? "opacity-100 scale-y-100 translate-y-0"
                : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
            }`}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100 dark:border-[#1f242b]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-8 pr-3 py-1 text-xs bg-gray-50 dark:bg-[#101317] border border-gray-200 dark:border-[#1f242b] rounded-md focus:outline-none focus:ring-1 focus:ring-[#61CB08] text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto p-1" ref={dropdownRef}>
              {loading ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#61CB08]" />{" "}
                  <span className="text-xs text-gray-400">Loading...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full px-2.5 py-1.5 text-left text-xs rounded-md hover:bg-gray-100 dark:hover:bg-[#181d24] focus:outline-none flex items-center justify-between transition-colors ${
                      highlightedIndex === index
                        ? "bg-gray-100 dark:bg-[#181d24]"
                        : ""
                    } ${
                      option.value === value
                        ? "text-[#61CB08] font-bold"
                        : "text-gray-900 dark:text-slate-200"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{option.label}</span>
                    {option.value === value && <Check className="w-3.5 h-3.5 text-[#61CB08]" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-rose-500">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;