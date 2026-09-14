import React from "react";

const SkeletonItem = ({ className = "" }) => (
  <div className={`bg-gray-200 dark:bg-[#181d24] animate-pulse rounded-md ${className}`} />
);

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonItem className="h-3 w-40" />
          <SkeletonItem className="h-7 w-64" />
          <SkeletonItem className="h-3.5 w-80" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonItem key={i} className="h-8 w-28 rounded-lg" />
          ))}
        </div>
      </div>

      {/* 2. Live Telemetry Bar Skeleton */}
      <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1f242b] pb-3.5 mb-4">
          <SkeletonItem className="h-4 w-48" />
          <SkeletonItem className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-[#1f242b]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pt-2 sm:pt-0 sm:px-3 first:px-0 space-y-2">
              <SkeletonItem className="h-3 w-20" />
              <SkeletonItem className="h-7 w-28" />
              <SkeletonItem className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. 4 Key Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <SkeletonItem className="h-3 w-24" />
              <SkeletonItem className="h-4 w-4 rounded-full" />
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <SkeletonItem className="h-8 w-32" />
              <SkeletonItem className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between">
                <SkeletonItem className="h-2.5 w-20" />
                <SkeletonItem className="h-2.5 w-8" />
              </div>
              <SkeletonItem className="h-1.5 w-full rounded-full" />
            </div>
            <SkeletonItem className="h-9 w-full rounded mt-2" />
          </div>
        ))}
      </div>

      {/* 4. Main 2/3 + 1/3 Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Revenue Architecture & User Velocity */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#1f242b] pb-4">
            <div className="space-y-1.5">
              <SkeletonItem className="h-4 w-52" />
              <SkeletonItem className="h-3 w-72" />
            </div>
            <SkeletonItem className="h-7 w-28 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/60 dark:bg-[#181d24] space-y-3">
                <div className="flex justify-between items-center">
                  <SkeletonItem className="h-4 w-36" />
                  <SkeletonItem className="h-4 w-12 rounded-full" />
                </div>
                <SkeletonItem className="h-7 w-28" />
                <SkeletonItem className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-[#1f242b] space-y-3">
            <div className="flex justify-between">
              <SkeletonItem className="h-3.5 w-36" />
              <SkeletonItem className="h-3 w-24" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3.5 rounded-lg border border-gray-100 dark:border-[#1f242b] bg-white dark:bg-[#101317] space-y-2">
                  <div className="flex justify-between">
                    <SkeletonItem className="h-3.5 w-28" />
                    <SkeletonItem className="h-3.5 w-16" />
                  </div>
                  <SkeletonItem className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 space-y-4">
          <div className="border-b border-gray-100 dark:border-[#1f242b] pb-3 space-y-1.5">
            <SkeletonItem className="h-4 w-32" />
            <SkeletonItem className="h-3 w-48" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-100 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#101317] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonItem className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1.5">
                    <SkeletonItem className="h-3.5 w-36" />
                    <SkeletonItem className="h-2.5 w-48" />
                  </div>
                </div>
                <SkeletonItem className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom 1/2 + 1/2 Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ride Operations & Velocity */}
        <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#1f242b] pb-3">
            <div className="space-y-1.5">
              <SkeletonItem className="h-4 w-44" />
              <SkeletonItem className="h-3 w-64" />
            </div>
            <SkeletonItem className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-100 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#101317] space-y-2">
                <SkeletonItem className="h-3 w-16 mx-auto" />
                <SkeletonItem className="h-6 w-12 mx-auto" />
                <SkeletonItem className="h-3 w-20 mx-auto" />
                <SkeletonItem className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <SkeletonItem className="h-3 w-full" />
            <SkeletonItem className="h-2 w-full rounded-full" />
          </div>
        </div>

        {/* Fleet Share & Distribution */}
        <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-4 sm:p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#1f242b] pb-3">
            <div className="space-y-1.5">
              <SkeletonItem className="h-4 w-44" />
              <SkeletonItem className="h-3 w-56" />
            </div>
            <SkeletonItem className="h-4 w-20" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <SkeletonItem className="w-32 h-32 rounded-full shrink-0" />
            <div className="flex-1 w-full space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <SkeletonItem className="h-3 w-24" />
                    <SkeletonItem className="h-3 w-16" />
                  </div>
                  <SkeletonItem className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
