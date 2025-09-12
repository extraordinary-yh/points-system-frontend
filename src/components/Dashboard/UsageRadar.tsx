"use client";

import React, { useState } from "react";
import { FiEye, FiInfo } from "react-icons/fi";
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
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Debug removed - using central debugging in useSharedDashboardData hook

  // Show skeleton loader while loading
  if (isLoading) {
    return <UsageRadarSkeleton />;
  }
  
  // Use categoryData directly - colors are already assigned consistently in shared hook
  const enrichedCategoryData = categoryData;

  return (
    <div 
      className="col-span-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl border border-slate-200/50 backdrop-blur-sm flex flex-col"
      data-section="lifetime-chart"
    >
      {/* Modern header with glassmorphism effect */}
      <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <FiEye className="text-white text-sm" />
            </div>
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Lifetime Earnings Chart
            </span>
          </h3>
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              <FiInfo className="text-slate-500 text-sm" />
            </button>
            {showInfoTooltip && (
                              <div className="absolute right-0 top-8 w-64 p-3 bg-white border border-slate-200 rounded-lg shadow-lg text-xs text-slate-600 z-50">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Shows total points earned from all activities.<br/>
                  <span className="text-slate-500">Does not reflect current balance after redeeming rewards.</span>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="flex-1 p-6">
        {enrichedCategoryData.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px] text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-inner">
              <div className="text-6xl mb-4 opacity-50">📊</div>
              <p className="font-semibold text-slate-700 mb-2">No Activity Data</p>
              <p className="text-sm text-slate-500">Complete activities to see your points distribution across categories</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full min-h-[380px] flex flex-col">
            {/* Custom 3D Pie Chart - takes most space */}
            <div className="flex-1 flex items-center justify-center py-2">
              {/* 3D Chart Container - optimized size with reduced white space */}
              <div className="relative w-80 h-80">

                
                {/* Main Chart */}
                <div className="relative w-full h-full">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
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
                        <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15"/>
                        <feDropShadow dx="0" dy="2" stdDeviation="8" floodOpacity="0.05"/>
                      </filter>
                    </defs>
                    
                                          {/* Central Label - Total Points Earned */}
                      <text 
                        x="100" 
                        y="96" 
                        textAnchor="middle" 
                        className="fill-slate-700 font-bold"
                        fontSize="13"
                      >
                        {enrichedCategoryData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                      </text>
                      <text 
                        x="100" 
                        y="107" 
                        textAnchor="middle" 
                        className="fill-slate-500 font-medium"
                        fontSize="6"
                      >
                        Total Points
                      </text>
                      <text 
                        x="100" 
                        y="114" 
                        textAnchor="middle" 
                        className="fill-slate-400 font-medium"
                        fontSize="5"
                      >
                        (All Time)
                      </text>
                    
                    {/* Render pie segments */}
                    {(() => {
                      let currentAngle = -90; // Start from top
                      const total = enrichedCategoryData.reduce((sum, item) => sum + item.value, 0);
                      const centerX = 100;
                      const centerY = 100;
                      const radius = 70;
                      const innerRadius = 40;
                      
                      return enrichedCategoryData.map((entry, index) => {
                        const percentage = entry.value / total;
                        const angle = percentage * 360;
                        // Add small gap between segments
                        const gapAngle = 2; // 2 degrees gap
                        const adjustedAngle = angle - gapAngle;
                        const startAngle = ((currentAngle + gapAngle/2) * Math.PI) / 180;
                        const endAngle = ((currentAngle + gapAngle/2 + adjustedAngle) * Math.PI) / 180;
                        
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
                              filter="url(#shadow3d)"
                              className="transition-all duration-300 group-hover:brightness-110"
                              transform={`translate(1, 2) translate(0, 0)`}
                              opacity="0.6"
                            />
                            {/* Main layer with hover transform */}
                            <path
                              d={pathData}
                              fill={`url(#gradient-${index})`}
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
                              onMouseEnter={() => setHoveredSegment(index)}
                              onMouseLeave={() => setHoveredSegment(null)}
                            />
                          </g>
                        );
                      });
                    })()}
                    

                  </svg>
                </div>
              </div>
              {/* Enhanced floating tooltip - only show for hovered segment */}
              {hoveredSegment !== null && (
                (() => {
                  const entry = enrichedCategoryData[hoveredSegment];
                  const total = enrichedCategoryData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = ((entry.value / total) * 100).toFixed(1);
                  const pointsFormatted = entry.value.toLocaleString();
                  
                  // Activity suggestions based on category
                  const getActivitySuggestions = (categoryName: string) => {
                    const suggestions: Record<string, string[]> = {
                      'content': [
                        'Upload your resume to Discord',
                        'Complete your profile information',
                        'Add portfolio links'
                      ],
                      'social': [
                        'Engage in Discord discussions',
                        'Participate in community events',
                        'Help other students'
                      ],
                      'professional': [
                        'Attend resume workshops',
                        'Join career development sessions',
                        'Connect with mentors'
                      ],
                      'events': [
                        'Attend networking events',
                        'Join company presentations',
                        'Participate in webinars'
                      ],
                      'engagement': [
                        'Be active in Discord channels',
                        'Participate in Q&A sessions',
                        'Share resources with peers'
                      ],
                      'learning': [
                        'Complete skill-building workshops',
                        'Attend educational sessions',
                        'Share learning resources'
                      ]
                    };
                    return suggestions[categoryName.toLowerCase()] || ['Stay engaged with community activities'];
                  };
                  
                  const activitySuggestions = getActivitySuggestions(entry.name);
                  
                  return (
                    <div
                      className="absolute bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg px-8 py-6 pointer-events-none z-20 min-w-[340px] max-w-[380px] transition-all duration-200"
                      style={{
                        boxShadow: `0 8px 20px ${entry.color}04, 0 4px 8px ${entry.color}06`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div 
                          className="w-6 h-6 rounded-xl shadow-sm flex-shrink-0 mt-0.5"
                          style={{ 
                            background: entry.gradient,
                            boxShadow: `0 2px 6px ${entry.color}15`
                          }}
                        ></div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-xl mb-4">{entry.name}</p>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-base text-slate-700 mr-6">Points:</span>
                              <span className="font-semibold text-slate-800 text-lg">{pointsFormatted}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-base text-slate-700 mr-6">Percentage:</span>
                              <span className="font-semibold text-slate-800 text-lg">{percentage}%</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200/40">
                              <span className="text-base text-slate-700 mr-6">Of Total Earned:</span>
                              <span className="font-semibold text-slate-800 text-lg">{total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Activity Suggestions */}
                      <div className="border-t border-slate-200/40 pt-4">
                        <p className="text-sm font-semibold text-slate-700 mb-3">💡 Earn more {entry.name} points by:</p>
                        <ul className="space-y-2">
                          {activitySuggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start">
                              <span className="text-slate-400 mr-3">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  );
                })()
              )}
            </div>
            
            {/* Simple Legend */}
            <div className="flex-shrink-0 mt-4">
              <div className="flex flex-wrap justify-center gap-4">
                {enrichedCategoryData.map((entry, index) => {
                  const total = enrichedCategoryData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = ((entry.value / total) * 100).toFixed(1);
                  return (
                    <div 
                      key={entry.name} 
                      className="flex items-center gap-2 text-sm"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          background: entry.gradient
                        }}
                      ></div>
                      <span className="font-medium text-slate-700">{entry.name}</span>
                      <span className="text-slate-500 font-mono text-xs">{percentage}%</span>
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
