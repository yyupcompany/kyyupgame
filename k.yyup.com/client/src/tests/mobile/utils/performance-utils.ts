/**
 * 性能测试工具集
 * 用于页面加载性能、API响应时间、内存使用等测试
 */

// Web Vitals 测量接口
interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  loadComplete?: number;
}

// 内存使用指标
interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  domNodeCount?: number;
  listenerCount?: number;
}

// 网络性能指标
interface NetworkMetrics {
  responseTime: number;
  dataSize: number;
  statusCode: number;
  cacheHit?: boolean;
  requestType: string;
}

// 资源加载指标
interface ResourceMetrics {
  name: string;
  type: string;
  duration: number;
  size: number;
  startTime: number;
  endTime: number;
}

/**
 * 测量首屏渲染时间 (FCP)
 */
export function measureFirstContentfulPaint(): Promise<number> {
  return new Promise((resolve) => {
    if (!window.performance || !window.PerformanceObserver) {
      resolve(0);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        resolve(fcpEntry.startTime);
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    // 超时处理
    setTimeout(() => {
      observer.disconnect();
      resolve(0);
    }, 10000);
  });
}

/**
 * 测量最大内容渲染时间 (LCP)
 */
export function measureLargestContentfulPaint(): Promise<number> {
  return new Promise((resolve) => {
    if (!window.performance || !window.PerformanceObserver) {
      resolve(0);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1]; // 最后一个就是最大的
      if (lcpEntry) {
        resolve(lcpEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // 超时处理
    setTimeout(() => {
      observer.disconnect();
      resolve(0);
    }, 10000);
  });
}

/**
 * 测量首次输入延迟 (FID)
 */
export function measureFirstInputDelay(): Promise<number> {
  return new Promise((resolve) => {
    if (!window.performance || !window.PerformanceObserver) {
      resolve(0);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fidEntry = entries[0];
      if (fidEntry && 'processingStart' in fidEntry) {
        const fid = (fidEntry as any).processingStart - fidEntry.startTime;
        resolve(fid);
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['first-input'] });

    // 超时处理
    setTimeout(() => {
      observer.disconnect();
      resolve(0);
    }, 10000);
  });
}

/**
 * 测量累积布局偏移 (CLS)
 */
export function measureCumulativeLayoutShift(): Promise<number> {
  return new Promise((resolve) => {
    if (!window.performance || !window.PerformanceObserver) {
      resolve(0);
      return;
    }

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    // 超时处理
    setTimeout(() => {
      observer.disconnect();
      resolve(clsValue);
    }, 10000);
  });
}

/**
 * 测量页面加载完成时间
 */
export function measureLoadCompleteTime(): Promise<number> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve(performance.now());
      return;
    }

    const handleLoad = () => {
      resolve(performance.now());
      window.removeEventListener('load', handleLoad);
    };

    window.addEventListener('load', handleLoad);

    // 超时处理
    setTimeout(() => {
      window.removeEventListener('load', handleLoad);
      resolve(performance.now());
    }, 15000);
  });
}

/**
 * 测量DOM解析时间
 */
export function measureDOMParseTime(): number {
  if (!performance.timing) {
    return 0;
  }

  const timing = performance.timing;
  return timing.domContentLoadedEventStart - timing.navigationStart;
}

/**
 * 测量样式计算时间
 */
export function measureStyleCalculationTime(): number {
  if (!performance.timing) {
    return 0;
  }

  const timing = performance.timing;
  return timing.domComplete - timing.domLoading;
}

/**
 * 获取内存使用情况
 */
export function getMemoryMetrics(): MemoryMetrics | null {
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }

  return null;
}

/**
 * 获取DOM节点数量
 */
export function getDOMNodeCount(): number {
  return document.querySelectorAll('*').length;
}

/**
 * 获取事件监听器数量（估算）
 */
export function getEventListenerCount(): number {
  // 这是一个估算值，因为浏览器API不直接提供这个信息
  // 可以通过其他方式更准确地测量
  return 0;
}

/**
 * 测量资源加载时间
 */
export function measureResourceLoadTime(selector: string): Promise<ResourceMetrics[]> {
  return new Promise((resolve) => {
    if (!window.performance || !window.PerformanceObserver) {
      resolve([]);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const resources: ResourceMetrics[] = entries.map(entry => ({
        name: entry.name,
        type: entry.initiatorType || 'unknown',
        duration: entry.duration,
        size: (entry as any).transferSize || 0,
        startTime: entry.startTime,
        endTime: entry.startTime + entry.duration
      }));

      resolve(resources);
      observer.disconnect();
    });

    observer.observe({ entryTypes: ['resource'] });

    // 超时处理
    setTimeout(() => {
      observer.disconnect();
      resolve([]);
    }, 10000);
  });
}

/**
 * 测量API响应时间
 */
export function measureAPIResponseTime<T>(
  apiCall: () => Promise<T>
): Promise<{ result: T; responseTime: number }> {
  const startTime = performance.now();

  return apiCall().then(result => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return {
      result,
      responseTime
    };
  }).catch(error => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    throw {
      error,
      responseTime
    };
  });
}

/**
 * 测量组件挂载时间
 */
export function measureComponentMountTime(
  componentName: string,
  mountFunction: () => void | Promise<void>
): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    Promise.resolve(mountFunction()).then(() => {
      const endTime = performance.now();
      const mountTime = endTime - startTime;
      
      console.log(`Component ${componentName} mounted in ${mountTime.toFixed(2)}ms`);
      resolve(mountTime);
    }).catch(error => {
      console.error(`Error mounting component ${componentName}:`, error);
      resolve(-1);
    });
  });
}

/**
 * 测量交互响应时间
 */
export function measureInteractionResponseTime(
  interactionName: string,
  interactionFunction: () => void | Promise<void>
): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    Promise.resolve(interactionFunction()).then(() => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.log(`Interaction ${interactionName} completed in ${responseTime.toFixed(2)}ms`);
      resolve(responseTime);
    }).catch(error => {
      console.error(`Error in interaction ${interactionName}:`, error);
      resolve(-1);
    });
  });
}

/**
 * 测量列表滚动性能
 */
export function measureListScrollPerformance(
  listSelector: string,
  scrollSteps: number = 10
): Promise<{ averageFrameTime: number; droppedFrames: number }> {
  return new Promise((resolve) => {
    const listElement = document.querySelector(listSelector) as HTMLElement;
    if (!listElement) {
      resolve({ averageFrameTime: 0, droppedFrames: 0 });
      return;
    }

    const frameTimes: number[] = [];
    let droppedFrames = 0;
    let currentStep = 0;

    const measureFrame = () => {
      const startTime = performance.now();
      
      // 滚动一小段距离
      const scrollStep = listElement.scrollHeight / scrollSteps;
      listElement.scrollTop += scrollStep;

      requestAnimationFrame(() => {
        const endTime = performance.now();
        const frameTime = endTime - startTime;
        frameTimes.push(frameTime);

        // 超过16ms认为是掉帧
        if (frameTime > 16.67) {
          droppedFrames++;
        }

        currentStep++;
        if (currentStep < scrollSteps) {
          measureFrame();
        } else {
          const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
          resolve({ averageFrameTime, droppedFrames });
        }
      });
    };

    measureFrame();
  });
}

/**
 * 测量搜索性能
 */
export function measureSearchPerformance<T>(
  searchFunction: (query: string) => Promise<T[]>,
  query: string
): Promise<{ resultCount: number; searchTime: number }> {
  const startTime = performance.now();

  return searchFunction(query).then(results => {
    const endTime = performance.now();
    const searchTime = endTime - startTime;

    return {
      resultCount: Array.isArray(results) ? results.length : 0,
      searchTime
    };
  });
}

/**
 * 测量批量操作性能
 */
export function measureBatchOperationPerformance<T>(
  operationFunction: (items: T[]) => Promise<void>,
  items: T[],
  batchSize: number = 10
): Promise<{ totalTime: number; averageTimePerBatch: number; totalBatches: number }> {
  const startTime = performance.now();
  const totalBatches = Math.ceil(items.length / batchSize);

  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  const batchPromises = batches.map(batch => 
    operationFunction(batch).then(() => performance.now())
  );

  return Promise.all(batchPromises).then(() => {
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTimePerBatch = totalTime / totalBatches;

    return {
      totalTime,
      averageTimePerBatch,
      totalBatches
    };
  });
}

/**
 * 检测内存泄漏
 */
export function detectMemoryLeaks(
  testFunction: () => void | Promise<void>,
  iterations: number = 10,
  threshold: number = 1024 * 1024 // 1MB
): Promise<{ hasLeak: boolean; memoryGrowth: number }> {
  const initialMemory = getMemoryMetrics();
  if (!initialMemory) {
    return Promise.resolve({ hasLeak: false, memoryGrowth: 0 });
  }

  const runIteration = async (): Promise<void> => {
    // 强制垃圾回收（如果可用）
    if ((window as any).gc) {
      (window as any).gc();
    }

    await testFunction();

    // 再次强制垃圾回收
    if ((window as any).gc) {
      (window as any).gc();
    }
  };

  const runAllIterations = async (): Promise<void> => {
    for (let i = 0; i < iterations; i++) {
      await runIteration();
    }
  };

  return runAllIterations().then(() => {
    const finalMemory = getMemoryMetrics();
    if (!finalMemory) {
      return { hasLeak: false, memoryGrowth: 0 };
    }

    const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
    const hasLeak = memoryGrowth > threshold;

    return {
      hasLeak,
      memoryGrowth
    };
  });
}

/**
 * 模拟网络条件
 */
export function simulateNetworkCondition(
  latency: number = 200,
  downloadThroughput: number = 1000,
  uploadThroughput: number = 1000
): void {
  // 这个函数需要结合Chrome DevTools的Network Throttling功能
  // 或者使用Service Worker来模拟
  console.log('Network simulation configured:', {
    latency,
    downloadThroughput,
    uploadThroughput
  });
}

/**
 * 性能基准测试
 */
export function runPerformanceBenchmark(
  testName: string,
  testFunction: () => void | Promise<void>,
  iterations: number = 100
): Promise<{ 
  testName: string; 
  iterations: number; 
  totalTime: number; 
  averageTime: number; 
  minTime: number; 
  maxTime: number; 
  standardDeviation: number 
}> {
  const times: number[] = [];

  const runSingleIteration = async (): Promise<void> => {
    const startTime = performance.now();
    await testFunction();
    const endTime = performance.now();
    times.push(endTime - startTime);
  };

  const runAllIterations = async (): Promise<void> => {
    for (let i = 0; i < iterations; i++) {
      await runSingleIteration();
    }
  };

  return runAllIterations().then(() => {
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    // 计算标准差
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / iterations;
    const standardDeviation = Math.sqrt(variance);

    return {
      testName,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      standardDeviation
    };
  });
}

/**
 * 生成性能报告
 */
export function generatePerformanceReport(metrics: {
  pageMetrics?: PerformanceMetrics;
  memoryMetrics?: MemoryMetrics;
  networkMetrics?: NetworkMetrics[];
  resourceMetrics?: ResourceMetrics[];
}): string {
  const report: string[] = [];
  
  report.push('=== Performance Report ===');
  report.push(`Generated at: ${new Date().toISOString()}`);
  report.push('');

  if (metrics.pageMetrics) {
    report.push('Page Metrics:');
    report.push(`  First Contentful Paint: ${(metrics.pageMetrics.fcp || 0).toFixed(2)}ms`);
    report.push(`  Largest Contentful Paint: ${(metrics.pageMetrics.lcp || 0).toFixed(2)}ms`);
    report.push(`  First Input Delay: ${(metrics.pageMetrics.fid || 0).toFixed(2)}ms`);
    report.push(`  Cumulative Layout Shift: ${(metrics.pageMetrics.cls || 0).toFixed(4)}`);
    report.push('');
  }

  if (metrics.memoryMetrics) {
    report.push('Memory Metrics:');
    report.push(`  Used JS Heap Size: ${(metrics.memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    report.push(`  Total JS Heap Size: ${(metrics.memoryMetrics.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    report.push(`  JS Heap Size Limit: ${(metrics.memoryMetrics.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
    report.push('');
  }

  if (metrics.networkMetrics && metrics.networkMetrics.length > 0) {
    report.push('Network Metrics:');
    metrics.networkMetrics.forEach((metric, index) => {
      report.push(`  Request ${index + 1}:`);
      report.push(`    Type: ${metric.requestType}`);
      report.push(`    Response Time: ${metric.responseTime.toFixed(2)}ms`);
      report.push(`    Data Size: ${(metric.dataSize / 1024).toFixed(2)}KB`);
      report.push(`    Status Code: ${metric.statusCode}`);
      report.push(`    Cache Hit: ${metric.cacheHit ? 'Yes' : 'No'}`);
    });
    report.push('');
  }

  if (metrics.resourceMetrics && metrics.resourceMetrics.length > 0) {
    report.push('Resource Loading Metrics:');
    const resourcesByType = metrics.resourceMetrics.reduce((acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = [];
      }
      acc[resource.type].push(resource);
      return acc;
    }, {} as Record<string, ResourceMetrics[]>);

    Object.entries(resourcesByType).forEach(([type, resources]) => {
      const totalTime = resources.reduce((sum, r) => sum + r.duration, 0);
      const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
      const avgTime = totalTime / resources.length;

      report.push(`  ${type.toUpperCase()}:`);
      report.push(`    Count: ${resources.length}`);
      report.push(`    Total Time: ${totalTime.toFixed(2)}ms`);
      report.push(`    Average Time: ${avgTime.toFixed(2)}ms`);
      report.push(`    Total Size: ${(totalSize / 1024).toFixed(2)}KB`);
    });
  }

  return report.join('\n');
}

// 导出性能常量
export const PERFORMANCE_THRESHOLDS = {
  FCP_GOOD: 2000,      // First Contentful Paint < 2s
  LCP_GOOD: 2500,      // Largest Contentful Paint < 2.5s
  FID_GOOD: 100,       // First Input Delay < 100ms
  CLS_GOOD: 0.1,       // Cumulative Layout Shift < 0.1
  API_RESPONSE_GOOD: 2000, // API Response < 2s
  MEMORY_THRESHOLD: 50 * 1024 * 1024, // 50MB
  FRAME_TIME_GOOD: 16.67 // 60fps = 16.67ms per frame
} as const;