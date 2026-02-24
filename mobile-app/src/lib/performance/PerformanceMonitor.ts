/**
 * Performance monitoring utility
 * Tracks app load time, screen transitions, and other performance metrics
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private appStartTime: number = Date.now();

  /**
   * Start tracking a performance metric
   */
  start(metricName: string): void {
    this.metrics.set(metricName, {
      name: metricName,
      startTime: Date.now(),
    });
  }

  /**
   * End tracking a performance metric
   */
  end(metricName: string): number | null {
    const metric = this.metrics.get(metricName);
    if (!metric) {
      console.warn(`Performance metric "${metricName}" not found`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    this.metrics.set(metricName, {
      ...metric,
      endTime,
      duration,
    });

    return duration;
  }

  /**
   * Get a specific metric
   */
  getMetric(metricName: string): PerformanceMetric | undefined {
    return this.metrics.get(metricName);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get app load time since initialization
   */
  getAppLoadTime(): number {
    return Date.now() - this.appStartTime;
  }

  /**
   * Log performance metrics to console
   */
  logMetrics(): void {
    console.log('=== Performance Metrics ===');
    console.log(`App Load Time: ${this.getAppLoadTime()}ms`);
    
    this.metrics.forEach((metric) => {
      if (metric.duration !== undefined) {
        console.log(`${metric.name}: ${metric.duration}ms`);
      }
    });
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Check if load time meets Seeker target (<100ms)
   */
  meetsLoadTimeTarget(): boolean {
    const loadTime = this.getAppLoadTime();
    return loadTime < 100;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Start tracking app load immediately
performanceMonitor.start('app-initialization');
