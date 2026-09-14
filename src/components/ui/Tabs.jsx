import React from "react";

/**
 * Reusable enterprise Segment Tabs component
 * Standardized across all directory and management pages.
 */
const Tabs = ({ tabs = [], activeTab, onChange, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-1 border-b border-gray-200 dark:border-[#1f242b] overflow-x-auto pb-1 text-xs ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "border-[#61CB08] text-gray-900 dark:text-white font-bold"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
            }`}
          >
            {tab.icon && (
              <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>
            )}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-[#61CB08]/15 text-[#61CB08]"
                    : "bg-gray-100 dark:bg-[#181d24] text-gray-400 dark:text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
