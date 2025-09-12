// Performance profiler to identify real bottlenecks
export class PerformanceProfiler {
  private static timings: Record<string, number> = {};
  private static markers: Record<string, number> = {};

  static start(label: string) {
    this.markers[label] = performance.now();
    console.time(`⏱️ ${label}`);
  }

  static end(label: string): number {
    const duration = performance.now() - this.markers[label];
    this.timings[label] = duration;
    console.timeEnd(`⏱️ ${label}`);
    
    // Color coding for performance analysis
    const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';
    // Performance measurement completed
    
    return duration;
  }

  static measure(label: string, fn: () => any) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static getReport(): Record<string, number> {
    return { ...this.timings };
  }

  static logReport() {
    console.group('📊 Performance Report');
    
    const sorted = Object.entries(this.timings)
      .sort(([, a], [, b]) => b - a);
    
    let totalTime = 0;
    sorted.forEach(([label, time]) => {
      totalTime += time;
      const percentage = ((time / Object.values(this.timings).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
      const color = time < 100 ? '🟢' : time < 500 ? '🟡' : '🔴';
      // Performance measurement with percentage
    });
    
    // Total measured time calculated
    console.groupEnd();
  }

  static reset() {
    this.timings = {};
    this.markers = {};
  }
}

// Network performance analyzer
export class NetworkAnalyzer {
  static analyzeResponse(url: string, response: Response, data: any) {
    const size = new Blob([JSON.stringify(data)]).size;
    const sizeKB = (size / 1024).toFixed(2);
    
    console.group(`🌐 Network Analysis: ${url}`);
    // Response size and status analyzed
    
    if (Array.isArray(data)) {
      const avgSize = size / data.length;
      console.log(`📋 Items: ${data.length}, Avg size per item: ${avgSize.toFixed(0)} bytes`);
      
      if (avgSize > 100) {
        console.warn(`⚠️ Large average item size (${avgSize.toFixed(0)} bytes) - potential over-fetching`);
      }
    }
    
    // Data structure analysis
    if (data && typeof data === 'object') {
      const sampleItem = Array.isArray(data) ? data[0] : data;
      if (sampleItem) {
        const fields = Object.keys(sampleItem);
        // Data fields analyzed
        
        // Check for potentially unused heavy fields
        const heavyFields = fields.filter(field => {
          const value = sampleItem[field];
          return value && JSON.stringify(value).length > 50;
        });
        
        if (heavyFields.length > 0) {
          console.warn(`⚠️ Heavy fields detected:`, heavyFields);
        }
      }
    }
    
    console.groupEnd();
  }
}

// Database query profiler (for backend integration)
export class DatabaseProfiler {
  static logSlowQuery(queryName: string, duration: number, recordCount: number) {
    const color = duration < 50 ? '🟢' : duration < 200 ? '🟡' : '🔴';
    // DB Query performance measured
    
    if (duration > 200) {
      console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    if (recordCount > 0) {
      const timePerRecord = duration / recordCount;
      if (timePerRecord > 2) {
        console.warn(`⚠️ Inefficient query: ${timePerRecord.toFixed(2)}ms per record`);
      }
    }
  }
}
