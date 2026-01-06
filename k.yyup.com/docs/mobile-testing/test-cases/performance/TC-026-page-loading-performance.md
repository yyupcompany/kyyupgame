# TC-026: 页面加载性能测试

## 📋 测试概述

**测试目标**: 验证移动端页面加载性能，确保在各种网络条件下页面能够快速、稳定地加载和渲染
**测试类型**: 性能测试
**优先级**: 高
**预计执行时间**: 15-20分钟

---

## 🎯 测试场景

### 场景1: 首页加载性能测试
- **目标**: 验证应用首页的加载性能
- **覆盖功能**: 首屏渲染时间、资源加载时间、交互可用时间

### 场景2: 核心页面加载性能测试
- **目标**: 验证核心业务页面的加载性能
- **覆盖功能**: 登录页、仪表板、活动页、用户中心等

### 场景3: 列表页面性能测试
- **目标**: 验证数据列表页面的加载性能
- **覆盖功能**: 分页加载、虚拟滚动、搜索过滤性能

### 场景4: 详情页面性能测试
- **目标**: 验证详情页面的加载性能
- **覆盖功能**: 数据获取、图片加载、关联数据渲染

### 场景5: 网络条件适应性测试
- **目标**: 验证不同网络条件下的性能表现
- **覆盖功能**: 3G/4G/WiFi/弱网环境下的加载性能

---

## 🔍 详细测试用例

### TC-026-01: 首页加载性能测试

**测试步骤**:
1. 清空浏览器缓存和存储
2. 测量首次访问时间
3. 测量二次访问时间
4. 分析资源加载瀑布图
5. 验证关键渲染路径

**测试环境**: 
- 浏览器: Chrome Mobile (无头模式)
- 网络: WiFi (4G标准)
- 设备: 模拟移动设备 (iPhone 12)

**严格验证要求**:
```typescript
// 1. 首屏渲染时间验证
const fcp = await measureFirstContentfulPaint();
expect(fcp).toBeLessThan(2000); // 首屏渲染应小于2秒

// 2. 最大内容渲染时间验证
const lcp = await measureLargestContentfulPaint();
expect(lcp).toBeLessThan(3000); // 最大内容渲染应小于3秒

// 3. 首次输入延迟验证
const fid = await measureFirstInputDelay();
expect(fid).toBeLessThan(100); // 首次输入延迟应小于100ms

// 4. 累积布局偏移验证
const cls = await measureCumulativeLayoutShift();
expect(cls).toBeLessThan(0.1); // 布局偏移应小于0.1

// 5. 页面加载完整性验证
const loadComplete = await measureLoadCompleteTime();
expect(loadComplete).toBeLessThan(5000); // 完整加载应小于5秒
```

**性能指标详细验证**:
```typescript
// 1. DOM解析性能验证
const domParseTime = await measureDOMParseTime();
expect(domParseTime).toBeLessThan(500); // DOM解析应小于500ms

// 2. 样式计算性能验证
const styleCalcTime = await measureStyleCalculationTime();
expect(styleCalcTime).toBeLessThan(200); // 样式计算应小于200ms

// 3. 布局计算性能验证
const layoutTime = await measureLayoutTime();
expect(layoutTime).toBeLessThan(300); // 布局计算应小于300ms

// 4. 绘制性能验证
const paintTime = await measurePaintTime();
expect(paintTime).toBeLessThan(400); // 绘制应小于400ms

// 5. JavaScript执行时间验证
const jsExecuteTime = await measureJavaScriptExecutionTime();
expect(jsExecuteTime).toBeLessThan(1000); // JS执行应小于1秒
```

**资源加载验证**:
```typescript
// 1. CSS文件加载验证
const cssLoadTimes = await measureResourceLoadTimes('.css');
cssLoadTimes.forEach(loadTime => {
  expect(loadTime).toBeLessThan(1000); // 单个CSS文件应小于1秒
});

// 2. JavaScript文件加载验证
const jsLoadTimes = await measureResourceLoadTimes('.js');
jsLoadTimes.forEach(loadTime => {
  expect(loadTime).toBeLessThan(1500); // 单个JS文件应小于1.5秒
});

// 3. 图片资源加载验证
const imageLoadTimes = await measureResourceLoadTimes(['.jpg', '.png', '.gif', '.webp']);
imageLoadTimes.forEach(loadTime => {
  expect(loadTime).toBeLessThan(2000); // 单个图片应小于2秒
});

// 4. API请求响应时间验证
const apiResponseTimes = await measureAPIResponseTimes();
apiResponseTimes.forEach(responseTime => {
  expect(responseTime).toBeLessThan(3000); // API响应应小于3秒
});
```

**预期结果**:
- ✅ 首屏渲染时间 ≤ 2秒
- ✅ 最大内容渲染时间 ≤ 3秒
- ✅ 首次输入延迟 ≤ 100ms
- ✅ 累积布局偏移 ≤ 0.1
- ✅ 完整页面加载时间 ≤ 5秒
- ✅ 所有资源加载时间在合理范围内

### TC-026-02: 核心页面加载性能测试

**测试步骤**:
1. 测试登录页面加载性能
2. 测试仪表板页面加载性能
3. 测试活动页面加载性能
4. 测试用户中心页面加载性能
5. 对比各页面性能差异

**测试页面列表**:
- 登录页 (`/login`)
- 仪表板 (`/dashboard`)
- 活动列表 (`/activities`)
- 用户中心 (`/profile`)
- 设置页面 (`/settings`)

**严格验证要求**:
```typescript
// 1. 登录页面性能验证
await navigateTo('/login');
const loginMetrics = await measurePageLoadMetrics();
expect(loginMetrics.fcp).toBeLessThan(1500); // 登录页应更快速
expect(loginMetrics.loadComplete).toBeLessThan(3000);

// 2. 仪表板页面性能验证
await navigateTo('/dashboard');
const dashboardMetrics = await measurePageLoadMetrics();
expect(dashboardMetrics.fcp).toBeLessThan(2000);
expect(dashboardMetrics.loadComplete).toBeLessThan(4000);

// 3. 活动页面性能验证
await navigateTo('/activities');
const activitiesMetrics = await measurePageLoadMetrics();
expect(activitiesMetrics.fcp).toBeLessThan(2500); // 数据较多，可适当放宽
expect(activitiesMetrics.loadComplete).toBeLessThan(5000);

// 4. 用户中心性能验证
await navigateTo('/profile');
const profileMetrics = await measurePageLoadMetrics();
expect(profileMetrics.fcp).toBeLessThan(2000);
expect(profileMetrics.loadComplete).toBeLessThan(4000);

// 5. 设置页面性能验证
await navigateTo('/settings');
const settingsMetrics = await measurePageLoadMetrics();
expect(settingsMetrics.fcp).toBeLessThan(1500);
expect(settingsMetrics.loadComplete).toBeLessThan(3000);
```

**页面组件渲染验证**:
```typescript
// 1. 组件挂载时间验证
const componentMountTimes = await measureComponentMountTimes();
Object.entries(componentMountTimes).forEach(([componentName, mountTime]) => {
  expect(mountTime).toBeLessThan(1000); // 单个组件挂载应小于1秒
});

// 2. 数据获取性能验证
const dataFetchTimes = await measureDataFetchTimes();
dataFetchTimes.forEach(fetchTime => {
  expect(fetchTime).toBeLessThan(2000); // 数据获取应小于2秒
});

// 3. 状态更新性能验证
const stateUpdateTimes = await measureStateUpdateTimes();
stateUpdateTimes.forEach(updateTime => {
  expect(updateTime).toBeLessThan(500); // 状态更新应小于500ms
});
```

**预期结果**:
- ✅ 所有核心页面首屏渲染 ≤ 2.5秒
- ✅ 简单页面(登录、设置)加载更快
- ✅ 复杂页面(仪表板、活动)性能合理
- ✅ 组件渲染时间在可接受范围内
- ✅ 数据获取和状态更新高效

### TC-026-03: 列表页面性能测试

**测试步骤**:
1. 测试小数据量列表加载
2. 测试中等数据量列表加载
3. 测试大数据量列表加载
4. 测试分页加载性能
5. 测试虚拟滚动性能

**测试数据量**:
- 小数据量: 10-50条记录
- 中等数据量: 100-500条记录
- 大数据量: 1000+条记录

**严格验证要求**:
```typescript
// 1. 小数据量列表性能验证
await loadListWithSize(20);
const smallListMetrics = await measureListLoadMetrics();
expect(smallListMetrics.renderTime).toBeLessThan(500);
expect(smallListMetrics.scrollSmoothness).toBeGreaterThan(0.9);

// 2. 中等数据量列表性能验证
await loadListWithSize(200);
const mediumListMetrics = await measureListLoadMetrics();
expect(mediumListMetrics.renderTime).toBeLessThan(1000);
expect(mediumListMetrics.scrollSmoothness).toBeGreaterThan(0.8);

// 3. 大数据量列表性能验证
await loadListWithSize(2000);
const largeListMetrics = await measureListLoadMetrics();
expect(largeListMetrics.renderTime).toBeLessThan(2000);
expect(largeListMetrics.scrollSmoothness).toBeGreaterThan(0.7);

// 4. 分页加载性能验证
const paginationMetrics = await measurePaginationPerformance();
expect(paginationMetrics.pageLoadTime).toBeLessThan(800);
expect(paginationMetrics.transitionSmoothness).toBeGreaterThan(0.8);

// 5. 虚拟滚动性能验证
const virtualScrollMetrics = await measureVirtualScrollPerformance();
expect(virtualScrollMetrics.initialRenderTime).toBeLessThan(300);
expect(virtualScrollMetrics.scrollFrameTime).toBeLessThan(16); // 60fps
```

**列表交互性能验证**:
```typescript
// 1. 搜索过滤性能验证
const searchMetrics = await measureSearchPerformance();
expect(searchMetrics.searchResponseTime).toBeLessThan(300);
expect(searchMetrics.filterUpdateTime).toBeLessThan(100);

// 2. 排序性能验证
const sortMetrics = await measureSortPerformance();
expect(sortMetrics.sortExecutionTime).toBeLessThan(500);
expect(sortMetrics.uiUpdateTime).toBeLessThan(200);

// 3. 列表项操作性能验证
const itemActionMetrics = await measureListItemActions();
expect(itemActionMetrics.clickResponseTime).toBeLessThan(50);
expect(itemActionMetrics.actionFeedbackTime).toBeLessThan(200);
```

**预期结果**:
- ✅ 小数据量列表渲染 ≤ 500ms
- ✅ 中等数据量列表渲染 ≤ 1秒
- ✅ 大数据量列表渲染 ≤ 2秒
- ✅ 分页加载响应 ≤ 800ms
- ✅ 虚拟滚动保持60fps
- ✅ 搜索过滤响应 ≤ 300ms

### TC-026-04: 详情页面性能测试

**测试步骤**:
1. 测试文本详情页面加载
2. 测试图文混合详情页面
3. 测试多媒体详情页面
4. 测试关联数据加载
5. 测试详情页面交互性能

**页面类型**:
- 纯文本详情
- 图文混合详情
- 包含视频/音频的详情
- 包含大量关联数据的详情

**严格验证要求**:
```typescript
// 1. 文本详情页面性能验证
await loadTextDetailPage();
const textDetailMetrics = await measureDetailPageMetrics();
expect(textDetailMetrics.contentRenderTime).toBeLessThan(800);
expect(textDetailMetrics.interactiveTime).toBeLessThan(1200);

// 2. 图文详情页面性能验证
await loadImageTextDetailPage();
const imageTextMetrics = await measureDetailPageMetrics();
expect(imageTextMetrics.textRenderTime).toBeLessThan(500);
expect(imageTextMetrics.imageLoadTime).toBeLessThan(3000);
expect(imageTextMetrics.completeRenderTime).toBeLessThan(3500);

// 3. 多媒体详情页面性能验证
await loadMultimediaDetailPage();
const multimediaMetrics = await measureDetailPageMetrics();
expect(multimediaMetrics.textRenderTime).toBeLessThan(500);
expect(multimediaMetrics.mediaLoadTime).toBeLessThan(5000);
expect(multimediaMetrics.completeRenderTime).toBeLessThan(6000);

// 4. 关联数据加载验证
const relatedDataMetrics = await measureRelatedDataLoading();
expect(relatedDataMetrics.primaryDataLoadTime).toBeLessThan(2000);
expect(relatedDataMetrics.relatedDataLoadTime).toBeLessThan(3000);
expect(relatedDataMetrics.totalLoadTime).toBeLessThan(5000);

// 5. 详情页面交互性能验证
const interactionMetrics = await measureDetailPageInteractions();
expect(interactionMetrics.buttonClickResponse).toBeLessThan(100);
expect(interactionMetrics.formInteractionResponse).toBeLessThan(200);
expect(interactionMetrics.navigationResponse).toBeLessThan(300);
```

**图片和媒体加载验证**:
```typescript
// 1. 图片懒加载性能验证
const lazyLoadMetrics = await measureLazyLoadPerformance();
expect(lazyLoadMetrics.initialViewLoadTime).toBeLessThan(1000);
expect(lazyLoadMetrics.lazyImageLoadTime).toBeLessThan(2000);

// 2. 图片优化验证
const imageOptimizationMetrics = await measureImageOptimization();
expect(imageOptimizationMetrics.compressionRatio).toBeGreaterThan(0.7);
expect(imageOptimizationMetrics.loadingTimeImprovement).toBeGreaterThan(0.3);

// 3. 媒体文件加载验证
const mediaLoadMetrics = await measureMediaLoading();
expect(mediaLoadMetrics.audioLoadTime).toBeLessThan(3000);
expect(mediaLoadMetrics.videoLoadTime).toBeLessThan(8000);
```

**预期结果**:
- ✅ 文本详情内容渲染 ≤ 800ms
- ✅ 图片加载时间 ≤ 3秒
- ✅ 媒体文件加载 ≤ 8秒
- ✅ 关联数据加载 ≤ 5秒
- ✅ 页面交互响应 ≤ 300ms
- ✅ 懒加载机制有效

### TC-026-05: 网络条件适应性测试

**测试步骤**:
1. 模拟不同网络速度
2. 测试离线页面访问
3. 测试网络切换场景
4. 验证缓存机制效果
5. 测试渐进式加载

**网络条件模拟**:
- WiFi (快速): 10Mbps
- 4G标准: 4Mbps
- 3G标准: 1Mbps
- 弱网环境: 0.5Mbps
- 离线模式

**严格验证要求**:
```typescript
// 1. WiFi环境性能验证
await simulateNetworkCondition('wifi', 10000, 50);
const wifiMetrics = await measurePageLoadMetrics();
expect(wifiMetrics.fcp).toBeLessThan(1500);
expect(wifiMetrics.loadComplete).toBeLessThan(3000);

// 2. 4G网络性能验证
await simulateNetworkCondition('4g', 4000, 100);
const lteMetrics = await measurePageLoadMetrics();
expect(lteMetrics.fcp).toBeLessThan(3000);
expect(lteMetrics.loadComplete).toBeLessThan(6000);

// 3. 3G网络性能验证
await simulateNetworkCondition('3g', 1000, 200);
const threeGMetrics = await measurePageLoadMetrics();
expect(threeGMetrics.fcp).toBeLessThan(5000);
expect(threeGMetrics.loadComplete).toBeLessThan(10000);

// 4. 弱网环境性能验证
await simulateNetworkCondition('slow', 500, 500);
const slowNetworkMetrics = await measurePageLoadMetrics();
expect(slowNetworkMetrics.fcp).toBeLessThan(8000);
expect(slowNetworkMetrics.loadComplete).toBeLessThan(15000);

// 5. 离线访问验证
await simulateOfflineMode();
const offlineMetrics = await measureOfflinePageAccess();
expect(offlineMetrics.cacheHitRate).toBeGreaterThan(0.8);
expect(offlineMetrics.offlinePageAvailability).toBe(true);
```

**网络切换和缓存验证**:
```typescript
// 1. 网络切换处理验证
const networkSwitchMetrics = await measureNetworkSwitchHandling();
expect(networkSwitchMetrics.switchDetectionTime).toBeLessThan(1000);
expect(networkSwitchMetrics.recoveryTime).toBeLessThan(3000);

// 2. 缓存效果验证
const cacheMetrics = await measureCacheEffectiveness();
expect(cacheMetrics.cacheHitRate).toBeGreaterThan(0.7);
expect(cacheMetrics.cacheSizeOptimization).toBe(true);
expect(cacheMetrics.cacheExpiration).toBeWorking();

// 3. 渐进式加载验证
const progressiveLoadMetrics = await measureProgressiveLoading();
expect(progressiveLoadMetrics.skeletonDisplayTime).toBeLessThan(200);
expect(progressiveLoadMetrics.contentProgressiveTime).toBeLessThan(1000);
expect(progressiveLoadMetrics.fullContentTime).toBeLessThan(5000);
```

**预期结果**:
- ✅ WiFi环境下快速加载
- ✅ 4G网络下可接受性能
- ✅ 3G网络下基本可用
- ✅ 弱网环境下降级处理
- ✅ 离线访问部分功能可用
- ✅ 网络切换平滑处理

---

## 🚨 性能瓶颈测试

### 场景1: 内存泄漏检测
- **模拟**: 连续页面导航和操作
- **验证**: 内存使用趋势
- **预期**: 内存使用稳定，无明显泄漏

### 场景2: CPU密集型操作
- **模拟**: 大量数据处理和渲染
- **验证**: CPU使用率和响应性
- **预期**: 主线程不阻塞，保持交互响应

### 场景3: 网络请求堆积
- **模拟**: 同时发起大量API请求
- **验证**: 请求队列处理和页面响应性
- **预期**: 请求有序处理，页面不卡顿

---

## 🔧 技术要求

### 浏览器性能API
```typescript
// Performance Observer API
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

// 监控关键性能指标
observer.observe({ entryTypes: ['paint', 'navigation', 'resource'] });

// 核心Web指标测量
const vitals = {
  fcp: await measureFCP(),
  lcp: await measureLCP(),
  fid: await measureFID(),
  cls: await measureCLS()
};
```

### 自动化测试工具
```typescript
// Lighthouse性能审计
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    }
  }
};

// WebPageTest API集成
const webPageTestConfig = {
  location: 'Dulles:Chrome',
  connectivity: '4G',
  runs: 3,
  firstViewOnly: false,
  timeline: true
};
```

---

## 📊 性能基准

### 移动端性能目标
```typescript
const performanceTargets = {
  // 核心Web指标
  firstContentfulPaint: { target: 2000, good: 1000 },
  largestContentfulPaint: { target: 3000, good: 1500 },
  firstInputDelay: { target: 100, good: 50 },
  cumulativeLayoutShift: { target: 0.1, good: 0.05 },

  // 自定义指标
  pageLoadTime: { target: 5000, good: 3000 },
  apiResponseTime: { target: 3000, good: 1500 },
  componentMountTime: { target: 1000, good: 500 },

  // 网络适应性
  wifiLoadTime: { target: 3000, good: 1500 },
  lteLoadTime: { target: 6000, good: 3000 },
  threeGLoadTime: { target: 10000, good: 5000 }
};
```

---

## ✅ 验收标准

1. ✅ 所有页面首屏渲染时间达标
2. ✅ 核心Web指标在目标范围内
3. ✅ 网络适应性测试通过
4. ✅ 内存和CPU使用合理
5. ✅ 用户体验流畅无明显卡顿
6. ✅ 离线和弱网环境可用性达标
7. ✅ 缓存机制有效提升性能
8. ✅ 性能监控和报告功能完整

---

## 📝 测试报告模板

```typescript
interface PageLoadPerformanceTestReport {
  testId: 'TC-026';
  testDate: string;
  testEnvironment: {
    browser: string;
    device: string;
    networkConditions: string[];
  };
  results: {
    homepagePerformance: PerformanceMetrics;
    corePagesPerformance: Record<string, PerformanceMetrics>;
    listPagePerformance: ListPageMetrics;
    detailPagePerformance: DetailPageMetrics;
    networkAdaptability: NetworkAdaptabilityMetrics;
  };
  coreWebVitals: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  };
  resourceAnalysis: {
    totalResources: number;
    totalSize: number;
    optimizedResources: number;
    cacheHitRate: number;
  };
  performanceScore: {
    lighthouseScore: number;
    customScore: number;
    userExperienceScore: number;
  };
  recommendations: string[];
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
}
```

---

## 🚀 执行指南

1. **环境准备**: 配置性能测试工具和监控
2. **网络模拟**: 设置不同网络条件
3. **基准测试**: 建立性能基准线
4. **数据收集**: 收集详细的性能数据
5. **分析报告**: 生成性能分析报告
6. **优化建议**: 提供性能优化建议

---

**创建日期**: 2025-11-24  
**最后更新**: 2025-11-24  
**版本**: 1.0  
**状态**: 待执行