import React, { useEffect, useState } from 'react';
import { PerformanceProfiler } from '../utils/performanceProfiler';

// Performance debug component to show real-time performance metrics
export const PerformanceDebug: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<Record<string, number>>({});
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Update performance data every 2 seconds
    const interval = setInterval(() => {
      setPerformanceData(PerformanceProfiler.getReport());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
        >
          Show Perf
        </button>
      </div>
    );
  }

  const sortedEntries = Object.entries(performanceData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10 slowest operations

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-yellow-300">⚡ Performance Monitor</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      {sortedEntries.length === 0 ? (
        <p className="text-gray-400">No performance data yet...</p>
      ) : (
        <div className="space-y-1">
          {sortedEntries.map(([label, time]) => {
            const color = time < 100 ? 'text-green-400' : time < 500 ? 'text-yellow-400' : 'text-red-400';
            return (
              <div key={label} className="flex justify-between">
                <span className="truncate mr-2" title={label}>
                  {label.replace('API Request: ', '').replace('/api/', '')}
                </span>
                <span className={color}>{time.toFixed(0)}ms</span>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
        <button 
          onClick={() => {
            PerformanceProfiler.reset();
            setPerformanceData({});
          }}
          className="text-blue-400 hover:text-blue-300"
        >
          Reset Data
        </button>
        <span className="ml-2">•</span>
        <button 
          onClick={() => PerformanceProfiler.logReport()}
          className="ml-2 text-blue-400 hover:text-blue-300"
        >
          Log Report
        </button>
      </div>
    </div>
  );
};
