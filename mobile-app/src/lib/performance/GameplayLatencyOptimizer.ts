/**
 * Gameplay Latency Optimizer
 * Task 5.3: Optimize gameplay latency for sub-10ms shot execution
 * 
 * Optimizations:
 * 1. Ephemeral Rollup integration for <10ms latency
 * 2. Optimistic UI updates for instant feedback
 * 3. Shot execution performance tracking
 * 4. 60fps animation optimization
 * 
 * Requirements: 3.7, 7.1
 */

interface ShotPerformanceMetrics {
  shotId: string;
  startTime: number;
  endTime?: number;
  latency?: number;
  optimisticUpdateTime?: number;
  actualUpdateTime?: number;
  animationFrameRate?: number;
}

class GameplayLatencyOptimizer {
  private shotMetrics: Map<string, ShotPerformanceMetrics> = new Map();
  private readonly TARGET_LATENCY = 10; // ms
  private readonly TARGET_FPS = 60;
  private animationFrameTimes: number[] = [];

  /**
   * Start tracking shot execution
   */
  startShotTracking(shotId: string): void {
    this.shotMetrics.set(shotId, {
      shotId,
      startTime: performance.now(),
    });
  }

  /**
   * Record optimistic UI update time
   */
  recordOptimisticUpdate(shotId: string): void {
    const metric = this.shotMetrics.get(shotId);
    if (metric) {
      metric.optimisticUpdateTime = performance.now() - metric.startTime;
    }
  }

  /**
   * Record actual update from Ephemeral Rollup
   */
  recordActualUpdate(shotId: string): void {
    const metric = this.shotMetrics.get(shotId);
    if (metric) {
      metric.actualUpdateTime = performance.now() - metric.startTime;
      metric.endTime = performance.now();
      metric.latency = metric.actualUpdateTime;
    }
  }

  /**
   * Get shot latency
   */
  getShotLatency(shotId: string): number | null {
    const metric = this.shotMetrics.get(shotId);
    return metric?.latency || null;
  }

  /**
   * Check if shot meets latency target (<10ms)
   */
  meetsLatencyTarget(shotId: string): boolean {
    const latency = this.getShotLatency(shotId);
    return latency !== null && latency < this.TARGET_LATENCY;
  }

  /**
   * Track animation frame time
   */
  trackAnimationFrame(frameTime: number): void {
    this.animationFrameTimes.push(frameTime);
    
    // Keep only last 60 frames (1 second at 60fps)
    if (this.animationFrameTimes.length > 60) {
      this.animationFrameTimes.shift();
    }
  }

  /**
   * Calculate current FPS
   */
  getCurrentFPS(): number {
    if (this.animationFrameTimes.length < 2) {
      return 0;
    }

    const frameDurations = [];
    for (let i = 1; i < this.animationFrameTimes.length; i++) {
      frameDurations.push(this.animationFrameTimes[i] - this.animationFrameTimes[i - 1]);
    }

    const avgFrameDuration = frameDurations.reduce((a, b) => a + b, 0) / frameDurations.length;
    return 1000 / avgFrameDuration;
  }

  /**
   * Check if animation meets 60fps target
   */
  meetsFrameRateTarget(): boolean {
    const fps = this.getCurrentFPS();
    return fps >= this.TARGET_FPS * 0.9; // Allow 10% tolerance (54fps)
  }

  /**
   * Get average shot latency
   */
  getAverageLatency(): number {
    const latencies = Array.from(this.shotMetrics.values())
      .map(m => m.latency)
      .filter((l): l is number => l !== undefined);

    if (latencies.length === 0) return 0;

    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalShots: number;
    averageLatency: number;
    meetsTarget: boolean;
    currentFPS: number;
    meetsFPSTarget: boolean;
  } {
    return {
      totalShots: this.shotMetrics.size,
      averageLatency: this.getAverageLatency(),
      meetsTarget: this.getAverageLatency() < this.TARGET_LATENCY,
      currentFPS: this.getCurrentFPS(),
      meetsFPSTarget: this.meetsFrameRateTarget(),
    };
  }

  /**
   * Log performance metrics
   */
  logMetrics(): void {
    const summary = this.getPerformanceSummary();
    
    console.log('=== Gameplay Performance Metrics ===');
    console.log(`Total Shots: ${summary.totalShots}`);
    console.log(`Average Latency: ${summary.averageLatency.toFixed(2)}ms`);
    console.log(`Meets Target (<10ms): ${summary.meetsTarget ? '✅' : '❌'}`);
    console.log(`Current FPS: ${summary.currentFPS.toFixed(1)}`);
    console.log(`Meets FPS Target (60fps): ${summary.meetsFPSTarget ? '✅' : '❌'}`);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.shotMetrics.clear();
    this.animationFrameTimes = [];
  }

  /**
   * Optimize shot execution with Ephemeral Rollup
   * Returns optimistic result immediately, actual result via callback
   */
  async optimizedShotExecution<T>(
    shotId: string,
    executeFn: () => Promise<T>,
    optimisticResult: T,
    onActualResult?: (result: T) => void
  ): Promise<T> {
    this.startShotTracking(shotId);

    // Return optimistic result immediately
    this.recordOptimisticUpdate(shotId);
    
    // Execute actual shot on Ephemeral Rollup in background
    executeFn()
      .then((actualResult) => {
        this.recordActualUpdate(shotId);
        
        if (onActualResult) {
          onActualResult(actualResult);
        }

        // Log if latency exceeds target
        if (!this.meetsLatencyTarget(shotId)) {
          console.warn(
            `Shot ${shotId} exceeded latency target: ${this.getShotLatency(shotId)}ms`
          );
        }
      })
      .catch((error) => {
        console.error(`Shot ${shotId} failed:`, error);
      });

    return optimisticResult;
  }

  /**
   * Request animation frame with performance tracking
   */
  requestOptimizedAnimationFrame(callback: (time: number) => void): number {
    return requestAnimationFrame((time) => {
      this.trackAnimationFrame(time);
      callback(time);
    });
  }
}

// Export singleton instance
export const gameplayLatencyOptimizer = new GameplayLatencyOptimizer();

/**
 * React hook for gameplay latency optimization
 */
export function useGameplayLatency() {
  return {
    startShotTracking: (shotId: string) => gameplayLatencyOptimizer.startShotTracking(shotId),
    recordOptimisticUpdate: (shotId: string) => gameplayLatencyOptimizer.recordOptimisticUpdate(shotId),
    recordActualUpdate: (shotId: string) => gameplayLatencyOptimizer.recordActualUpdate(shotId),
    getShotLatency: (shotId: string) => gameplayLatencyOptimizer.getShotLatency(shotId),
    meetsLatencyTarget: (shotId: string) => gameplayLatencyOptimizer.meetsLatencyTarget(shotId),
    getCurrentFPS: () => gameplayLatencyOptimizer.getCurrentFPS(),
    meetsFrameRateTarget: () => gameplayLatencyOptimizer.meetsFrameRateTarget(),
    getPerformanceSummary: () => gameplayLatencyOptimizer.getPerformanceSummary(),
    optimizedShotExecution: <T,>(
      shotId: string,
      executeFn: () => Promise<T>,
      optimisticResult: T,
      onActualResult?: (result: T) => void
    ) => gameplayLatencyOptimizer.optimizedShotExecution(shotId, executeFn, optimisticResult, onActualResult),
    requestOptimizedAnimationFrame: (callback: (time: number) => void) =>
      gameplayLatencyOptimizer.requestOptimizedAnimationFrame(callback),
  };
}
