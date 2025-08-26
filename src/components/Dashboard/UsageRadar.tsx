"use client";

import React from "react";
import { FiEye } from "react-icons/fi";
import { useSharedDashboardData } from "../../hooks/useSharedDashboardData";
import { UsageRadarSkeleton } from "./SkeletonLoaders";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  gradient: string;
}

// Remove duplicate color definitions - using shared data colors only

export const UsageRadar = () => {
  const { categoryData, isLoading, error } = useSharedDashboardData();

  // Show skeleton loader while loading
  if (isLoading) {
    return <UsageRadarSkeleton />;
  }
  
  // Use categoryData directly - colors are already assigned consistently in shared hook
  const enrichedCategoryData = categoryData;

  return (
    <div className="col-span-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm flex flex-col">
      {/* Modern header with glassmorphism effect */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <FiEye className="text-white text-sm" />
          </div>
          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Points by Category
          </span>
        </h3>
      </div>

      <div className="flex-1 p-6">
        {enrichedCategoryData.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[320px] text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-inner">
              <div className="text-6xl mb-4 opacity-50">📊</div>
              <p className="font-semibold text-slate-700 mb-2">No Activity Data</p>
              <p className="text-sm text-slate-500">Complete activities to see your points distribution</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full min-h-[320px] flex flex-col">
            {/* Custom 3D Pie Chart - takes most space */}
            <div className="flex-1 flex items-center justify-center pb-4">
              {/* 3D Chart Container - bigger */}
              <div className="relative w-72 h-72">
                {/* 3D Shadow/Base */}
                <div className="absolute inset-0 top-4 rounded-full bg-gradient-to-br from-slate-300/30 to-slate-400/30 blur-lg transform rotate-3"></div>
                
                {/* Main Chart */}
                <div className="relative w-full h-full">
                  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                    <defs>
                      {/* Gradient definitions for each segment */}
                      {enrichedCategoryData.map((entry, index) => (
                        <defs key={index}>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={entry.color} stopOpacity="0.9"/>
                            <stop offset="100%" stopColor={entry.color} stopOpacity="0.7"/>
                          </linearGradient>
                          {/* 3D effect gradient */}
                          <linearGradient id={`gradient-3d-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={entry.color} stopOpacity="1"/>
                            <stop offset="50%" stopColor={entry.color} stopOpacity="0.8"/>
                            <stop offset="100%" stopColor={entry.color} stopOpacity="0.6"/>
                          </linearGradient>
                        </defs>
                      ))}
                      
                      {/* Filter for 3D effect */}
                      <filter id="shadow3d" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.3"/>
                        <feDropShadow dx="0" dy="2" stdDeviation="8" floodOpacity="0.1"/>
                      </filter>
                    </defs>
                    
                    {/* Render pie segments */}
                    {(() => {
                      let currentAngle = -90; // Start from top
                      const total = enrichedCategoryData.reduce((sum, item) => sum + item.value, 0);
                      const centerX = 100;
                      const centerY = 100;
                      const radius = 70;
                      const innerRadius = 25;
                      
                      return enrichedCategoryData.map((entry, index) => {
                        const percentage = entry.value / total;
                        const angle = percentage * 360;
                        const startAngle = (currentAngle * Math.PI) / 180;
                        const endAngle = ((currentAngle + angle) * Math.PI) / 180;
                        
                        const x1 = centerX + Math.cos(startAngle) * radius;
                        const y1 = centerY + Math.sin(startAngle) * radius;
                        const x2 = centerX + Math.cos(endAngle) * radius;
                        const y2 = centerY + Math.sin(endAngle) * radius;
                        
                        const x3 = centerX + Math.cos(startAngle) * innerRadius;
                        const y3 = centerY + Math.sin(startAngle) * innerRadius;
                        const x4 = centerX + Math.cos(endAngle) * innerRadius;
                        const y4 = centerY + Math.sin(endAngle) * innerRadius;
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        const pathData = [
                          `M ${x3} ${y3}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `L ${x4} ${y4}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}`,
                          'Z'
                        ].join(' ');
                        
                        currentAngle += angle;
                        
                        // Calculate hover transform for outward expansion
                        const midAngle = (startAngle + endAngle) / 2;
                        const hoverOffsetX = Math.cos(midAngle) * 8;
                        const hoverOffsetY = Math.sin(midAngle) * 8;
                        
                        return (
                          <g key={index} className="pie-segment group cursor-pointer">
                            {/* 3D base layer */}
                            <path
                              d={pathData}
                              fill={`url(#gradient-3d-${index})`}
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="1"
                              filter="url(#shadow3d)"
                              className="transition-all duration-300 group-hover:brightness-110"
                              transform={`translate(1, 2) translate(0, 0)`}
                              opacity="0.6"
                            />
                            {/* Main layer with hover transform */}
                            <path
                              d={pathData}
                              fill={`url(#gradient-${index})`}
                              stroke="rgba(255,255,255,0.8)"
                              strokeWidth="2"
                              className="transition-all duration-300 group-hover:brightness-110"
                              filter="url(#shadow3d)"
                              style={{
                                transformOrigin: `${centerX}px ${centerY}px`,
                                transform: `translate(0, 0)`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = `translate(${hoverOffsetX}px, ${hoverOffsetY}px)`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = `translate(0, 0)`;
                              }}
                            />
                            
                            {/* Tooltip trigger area (invisible) */}
                            <path
                              d={pathData}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={(e) => {
                                // Show tooltip
                                const tooltip = document.getElementById(`tooltip-${index}`);
                                if (tooltip) {
                                  tooltip.style.opacity = '1';
                                  tooltip.style.pointerEvents = 'auto';
                                }
                              }}
                              onMouseLeave={(e) => {
                                // Hide tooltip
                                const tooltip = document.getElementById(`tooltip-${index}`);
                                if (tooltip) {
                                  tooltip.style.opacity = '0';
                                  tooltip.style.pointerEvents = 'none';
                                }
                              }}
                            />
                          </g>
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>
              {/* Floating tooltips for each segment */}
              {enrichedCategoryData.map((entry, index) => {
                const total = enrichedCategoryData.reduce((sum, item) => sum + item.value, 0);
                const percentage = ((entry.value / total) * 100).toFixed(1);
                return (
                  <div
                    key={`tooltip-${index}`}
                    id={`tooltip-${index}`}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl px-4 py-3 pointer-events-none opacity-0 transition-all duration-200 z-10"
                    style={{
                      boxShadow: `0 10px 25px ${entry.color}20`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ 
                          background: entry.gradient,
                          boxShadow: `0 2px 8px ${entry.color}40`
                        }}
                      ></div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{entry.name}</p>
                        <p className="text-xs text-slate-600">{entry.value} points • {percentage}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Compact Legend - cleaner version */}
            <div className="flex-shrink-0 mt-2">
              <div className="flex flex-wrap justify-center gap-2">
                {enrichedCategoryData.map((entry, index) => {
                  const total = enrichedCategoryData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = ((entry.value / total) * 100).toFixed(1);
                  return (
                    <div key={entry.name} className="flex items-center gap-1.5 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-xs">
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ 
                          background: entry.gradient
                        }}
                      ></div>
                      <span className="font-medium text-slate-700">{entry.name}</span>
                      <span className="text-slate-500 font-mono">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
