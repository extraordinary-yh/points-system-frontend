"use client";

import React from "react";

// Skeleton for Activity Graph (Chart)
export const ActivityGraphSkeleton = () => {
  return (
    <div className="col-span-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm flex flex-col animate-pulse">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-200 w-9 h-9"></div>
          <div className="bg-slate-200 h-5 w-32 rounded"></div>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 p-6">
        <div className="w-full h-80 bg-slate-100 rounded-xl relative overflow-hidden">
          {/* Mock chart lines */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-200 w-8 rounded-t"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for Usage Radar (Pie Chart)
export const UsageRadarSkeleton = () => {
  return (
    <div className="col-span-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm flex flex-col animate-pulse">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-200 w-9 h-9"></div>
          <div className="bg-slate-200 h-5 w-36 rounded"></div>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 p-6">
        <div className="relative h-full min-h-[320px] flex flex-col">
          {/* Pie chart skeleton */}
          <div className="flex-1 flex items-center justify-center pb-4">
            <div className="relative w-72 h-72">
              {/* Pie chart circle */}
              <div className="w-full h-full rounded-full bg-slate-100 relative overflow-hidden">
                {/* Pie segments */}
                <div className="absolute inset-6 rounded-full bg-white"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-spin-slow"></div>
              </div>
            </div>
          </div>
          
          {/* Legend skeleton */}
          <div className="flex-shrink-0 mt-2">
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  <div className="bg-slate-200 h-3 w-12 rounded"></div>
                  <div className="bg-slate-200 h-3 w-8 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for Recent Transactions (Table)
export const RecentTransactionsSkeleton = () => {
  return (
    <div className="col-span-12 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-200 w-9 h-9"></div>
            <div className="bg-slate-200 h-5 w-32 rounded"></div>
          </div>
          <div className="bg-slate-200 h-8 w-16 rounded-lg"></div>
        </div>
      </div>
      
      {/* Table */}
      <div className="p-6">
        <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm">
          {/* Table header */}
          <div className="bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm border-b border-slate-200/50 p-4">
            <div className="flex justify-between">
              <div className="bg-slate-200 h-3 w-16 rounded"></div>
              <div className="bg-slate-200 h-3 w-12 rounded"></div>
              <div className="bg-slate-200 h-3 w-16 rounded"></div>
              <div className="bg-slate-200 h-3 w-4 rounded"></div>
            </div>
          </div>
          
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`p-4 border-b border-slate-100/50 ${i % 2 ? "bg-slate-50/30" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-200 w-6 h-6"></div>
                  <div className="bg-slate-200 h-4 w-24 rounded"></div>
                </div>
                <div className="bg-slate-200 h-4 w-16 rounded"></div>
                <div className="bg-slate-200 h-5 w-12 rounded-full"></div>
                <div className="bg-slate-200 h-4 w-4 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
