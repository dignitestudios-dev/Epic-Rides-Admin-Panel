import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// Mini Sparkline SVG wave generator with smooth enterprise bezier curves
const Sparkline = ({ color = "#61CB08", index = 0 }) => {
  const paths = [
    "M0,24 C40,28 80,12 120,20 C160,28 200,8 240,16 C280,24 320,10 360,8",
    "M0,20 C40,10 80,24 120,14 C160,8 200,26 240,12 C280,6 320,12 360,6",
    "M0,14 C40,20 80,26 120,18 C160,22 200,14 240,24 C280,26 320,20 360,22",
    "M0,26 C40,20 80,22 120,14 C160,12 200,16 240,10 C280,12 320,6 360,4",
  ];
  const selectedPath = paths[index % paths.length];
  const gradientId = `spark-grad-${index}`;

  return (
    <div className="w-full h-9 overflow-hidden mt-3 pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
      <svg viewBox="0 0 360 36" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={`${selectedPath} L360,36 L0,36 Z`}
          fill={`url(#${gradientId})`}
        />
        <path
          d={selectedPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

const THEME_ACCENTS = [
  { color: "#61CB08", badge: "bg-[#61CB08]/10 text-[#61CB08] border-[#61CB08]/20" },
  { color: "#38bdf8", badge: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  { color: "#f59e0b", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { color: "#a855f7", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { color: "#10b981", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { color: "#f43f5e", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
];

const StatsCard = ({
  title,
  value,
  change,
  changeType = "positive",
  targetLabel,
  targetProgress,
  icon,
  index = 0,
  sparkline = true,
  loading = false,
  className = "",
}) => {
  const accent = THEME_ACCENTS[index % THEME_ACCENTS.length];

  if (loading) {
    return (
      <div
        className={`rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 flex flex-col justify-between ${className}`}
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-[#181d24] animate-pulse rounded-md" />
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-[#181d24] animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="h-7 w-28 bg-gray-200 dark:bg-[#181d24] animate-pulse rounded-md" />
          </div>
        </div>
        {sparkline && (
          <div className="w-full h-8 mt-3 bg-gray-100 dark:bg-[#181d24]/60 animate-pulse rounded-md" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 group hover:border-gray-300 dark:hover:border-[#2a313c] ${className}`}
    >
      <div>
        {/* Title and optional icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-500 dark:text-slate-400 uppercase truncate">
            {title}
          </span>
          {icon && (
            <div className="text-gray-400 dark:text-slate-500">
              {React.cloneElement(icon, { className: "w-4 h-4" })}
            </div>
          )}
        </div>

        {/* Value and Change Pill */}
        <div className="mt-2.5 flex items-baseline justify-between gap-2 flex-wrap">
          <div className="text-2xl sm:text-[26px] font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </div>
          {change && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                changeType === "positive"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-[#61CB08] border-emerald-200 dark:border-[#61CB08]/30"
                  : changeType === "negative"
                  ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="w-3 h-3" />
              ) : changeType === "negative" ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {change}
            </span>
          )}
        </div>

        {/* Target Progress Bar */}
        {targetProgress != null && (
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 dark:text-slate-400 font-medium truncate">
                {targetLabel || "Target"}
              </span>
              <span className="text-gray-700 dark:text-slate-300 font-semibold shrink-0">
                {targetProgress}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-[#1f242b] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(targetProgress, 100)}%`,
                  backgroundColor: accent.color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sparkline Wave */}
      {sparkline && <Sparkline color={accent.color} index={index} />}
    </div>
  );
};

export default StatsCard;
