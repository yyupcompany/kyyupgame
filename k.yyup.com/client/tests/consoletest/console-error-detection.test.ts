import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

// Mock ECharts模块以避免环境检测问题
vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      getWidth: vi.fn(() => 400),
      getHeight: vi.fn(() => 300),
      clear: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn()
    })),
    dispose: vi.fn(),
    registerTheme: vi.fn(),
    registerMap: vi.fn(),
    graphic: {
      LinearGradient: vi.fn()
    }
  },
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getWidth: vi.fn(() => 400),
    getHeight: vi.fn(() => 300),
    clear: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn()
  })),
  dispose: vi.fn(),
  registerTheme: vi.fn(),
  registerMap: vi.fn(),
  graphic: {
    LinearGradient: vi.fn()
  }
}));

// Mock ECharts/core模块
vi.mock('echarts/core', () => ({
  use: vi.fn(),
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getWidth: vi.fn(() => 400),
    getHeight: vi.fn(() => 300),
    clear: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn()
  })),
  dispose: vi.fn(),
  registerTheme: vi.fn(),
  registerMap: vi.fn(),
  graphic: {
    LinearGradient: vi.fn()
  }
}));

// Mock ECharts charts
vi.mock('echarts/charts', () => ({
  BarChart: vi.fn(),
  LineChart: vi.fn(),
  PieChart: vi.fn(),
  ScatterChart: vi.fn(),
  RadarChart: vi.fn(),
  MapChart: vi.fn(),
  TreeChart: vi.fn(),
  TreemapChart: vi.fn(),
  GraphChart: vi.fn(),
  GaugeChart: vi.fn(),
  FunnelChart: vi.fn(),
  ParallelChart: vi.fn(),
  SankeyChart: vi.fn(),
  BoxplotChart: vi.fn(),
  CandlestickChart: vi.fn(),
  EffectScatterChart: vi.fn(),
  LinesChart: vi.fn(),
  HeatmapChart: vi.fn(),
  PictorialBarChart: vi.fn(),
  ThemeRiverChart: vi.fn(),
  SunburstChart: vi.fn(),
  CustomChart: vi.fn()
}));

// Mock ECharts components
vi.mock('echarts/components', () => ({
  TitleComponent: vi.fn(),
  TooltipComponent: vi.fn(),
  GridComponent: vi.fn(),
  PolarComponent: vi.fn(),
  AriaComponent: vi.fn(),
  ParallelComponent: vi.fn(),
  LegendComponent: vi.fn(),
  ScrollableLegendComponent: vi.fn(),
  VisualMapComponent: vi.fn(),
  VisualMapContinuousComponent: vi.fn(),
  VisualMapPiecewiseComponent: vi.fn(),
  TimelineComponent: vi.fn(),
  ToolboxComponent: vi.fn(),
  MarkPointComponent: vi.fn(),
  MarkLineComponent: vi.fn(),
  MarkAreaComponent: vi.fn(),
  GraphicComponent: vi.fn(),
  DatasetComponent: vi.fn(),
  TransformComponent: vi.fn()
}));

// Mock ECharts renderers
vi.mock('echarts/renderers', () => ({
  CanvasRenderer: vi.fn(),
  SVGRenderer: vi.fn()
}));
// Mock ElConfigProvider
const ElConfigProvider = {
  name: 'ElConfigProvider',
  props: ['locale', 'size', 'zIndex', 'namespace'],
  template: '<div><slot /></div>'
};
import {
  expectNoConsoleErrors,
  setupConsoleMonitoring,
  resetConsoleMonitoring,
  allowConsoleError,
  allowConsoleWarn
} from '../setup/console-monitoring';
import {
  CONSOLE_TEST_CONFIG,
  getTestStatistics,
  getSkippedPages,
  getPagesWithExpectedErrors
} from './console-test-config';

/**
 * 🔍 全页面控制台错误检测测试套件
 *
 * 📋 测试目标：
 * - 检测所有页面组件的控制台错误
 * - 覆盖 150+ Vue页面文件，17个功能模块
 * - 确保页面加载时无意外的控制台错误
 *
 * 🎯 测试策略：
 * 1. 动态导入所有页面组件
 * 2. 模拟完整的运行环境（路由、状态管理、API）
 * 3. 挂载组件并监控控制台输出
 * 4. 分模块组织测试用例，便于定位问题
 * 5. 支持预期错误和跳过测试的配置
 *
 * 🔧 技术特性：
 * - 基于 Vitest + Vue Test Utils
 * - 集成控制台监控系统
 * - 支持组件存根和Mock
 * - 提供详细的测试报告
 */

// 🔧 测试工具函数
function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/test', component: { template: '<div>Test</div>' } },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } }
    ]
  });
}

function createTestPinia() {
  return createPinia();
}

// 🎭 Mock全局组件和插件
const globalMocks = {
  $router: createTestRouter(),
  $route: { path: '/', params: {}, query: {}, meta: {} },
  $t: (key: string) => key,
  $message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  $loading: {
    show: vi.fn(),
    hide: vi.fn()
  },
  $confirm: vi.fn().mockResolvedValue(true),
  $notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
};

// 🎨 全局组件存根配置
const globalStubs = {
  // Element Plus 组件存根
  'el-table': true,
  'el-form': true,
  'el-form-item': true,
  'el-input': true,
  'el-button': true,
  'el-dialog': true,
  'el-drawer': true,
  'el-upload': true,
  'el-select': true,
  'el-option': true,
  'el-date-picker': true,
  'el-pagination': true,
  'el-card': true,
  'el-tabs': true,
  'el-tab-pane': true,
  'el-collapse': true,
  'el-collapse-item': true,
  'el-tree': true,
  'el-cascader': true,
  'el-transfer': true,
  'el-steps': true,
  'el-step': true,
  'el-timeline': true,
  'el-timeline-item': true,
  'el-descriptions': true,
  'el-descriptions-item': true,
  'el-image': true,
  'el-avatar': true,
  'el-badge': true,
  'el-tag': true,
  'el-progress': true,
  'el-skeleton': true,
  'el-empty': true,
  'el-result': true,
  'el-alert': true,
  'el-loading': true,
  'el-message': true,
  'el-notification': true,
  'el-popover': true,
  'el-tooltip': true,
  'el-dropdown': true,
  'el-dropdown-menu': true,
  'el-dropdown-item': true,
  'el-menu': true,
  'el-menu-item': true,
  'el-submenu': true,
  'el-breadcrumb': true,
  'el-breadcrumb-item': true,
  'el-page-header': true,
  'el-affix': true,
  'el-anchor': true,
  'el-anchor-link': true,
  'el-backtop': true,

  // Vue Router 组件存根
  'router-link': true,
  'router-view': true,

  // 自定义组件存根
  'center-container': true,
  'data-table': true,
  'stat-card': true,
  'chart-container': true,
  'form-modal': true,
  'detail-panel': true,
  'action-toolbar': true,
  'page-header': true,
  'search-form': true,
  'filter-panel': true,
  'export-button': true,
  'import-button': true,
  'batch-operations': true,
  'status-indicator': true,
  'permission-guard': true,
  'loading-spinner': true,
  'error-boundary': true,
  'async-component': true
};

// 控制台错误检测变量
let consoleSpy: any

describe('🔍 全页面控制台错误检测测试套件', () => {
  let router: any;
  let pinia: any;
  let testStats: any;

  beforeEach(() => {
    vi.clearAllMocks();
    resetConsoleMonitoring();
    setupConsoleMonitoring();

    router = createTestRouter();
    pinia = createTestPinia();
    testStats = getTestStatistics();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  // 📊 测试统计信息
  it('📊 should provide comprehensive test coverage statistics', () => {
    console.log(`\n🎯 控制台错误检测覆盖统计:`);
    console.log(`   📁 总模块数: ${testStats.totalModules}`);
    console.log(`   📄 总页面数: ${testStats.totalPages}`);
    console.log(`   🔧 测试策略: 动态导入 + 组件挂载 + 控制台监控`);

    console.log(`\n📋 模块详细统计:`);
    testStats.moduleBreakdown.forEach((module: any) => {
      console.log(`   ${module.name}: ${module.pageCount}个页面`);
    });

    const skippedPages = getSkippedPages();
    const pagesWithErrors = getPagesWithExpectedErrors();

    console.log(`\n⚠️  跳过的页面: ${skippedPages.length}个`);
    console.log(`🔍 预期错误的页面: ${pagesWithErrors.length}个`);

    expect(testStats.totalPages).toBeGreaterThan(150);
    expect(testStats.totalModules).toBeGreaterThanOrEqual(16);
  });

  // 🔍 动态生成每个模块的测试用例
  Object.entries(CONSOLE_TEST_CONFIG).forEach(([moduleKey, moduleConfig]) => {
    describe(`📁 ${moduleConfig.name} (${moduleConfig.pages.length}个页面)`, () => {
      moduleConfig.pages.forEach((pageConfig) => {
        const testName = `should load ${pageConfig.name} without console errors`;

        if (pageConfig.skipTest) {
          it.skip(`${testName} - SKIPPED: ${pageConfig.skipReason}`, () => {
            // 跳过的测试
          });
          return;
        }

        it(testName, async () => {
          try {
            // 🔧 设置预期错误
            if (pageConfig.expectedErrors) {
              pageConfig.expectedErrors.forEach(error => {
                allowConsoleError(error);
              });
            }

            // 🔧 设置模块级预期错误
            if (moduleConfig.ai && moduleKey === 'ai') {
              allowConsoleError('WebSocket connection failed');
              allowConsoleWarn('AI service unavailable');
            }

            // 📦 动态导入页面组件
            const componentModule = await import(`../../src/pages/${pageConfig.path}`);
            const Component = componentModule.default;

            if (!Component) {
              console.warn(`⚠️ 组件 ${pageConfig.name} (${pageConfig.path}) 导入失败或不存在`);
              return;
            }

            // 🎭 挂载组件
            const wrapper = mount(Component, {
              global: {
                plugins: [router, pinia],
                mocks: globalMocks,
                components: {
                  ElConfigProvider
                },
                stubs: globalStubs
              }
            });

            // ✅ 验证组件挂载成功
            expect(wrapper.exists()).toBe(true);

            // ⏳ 等待异步操作完成
            await wrapper.vm.$nextTick();

            // 等待可能的异步数据加载
            await new Promise(resolve => setTimeout(resolve, 100));

            // 🧹 卸载组件
            wrapper.unmount();

            console.log(`✅ ${pageConfig.name} 页面加载成功，无控制台错误`);
          } catch (error) {
            console.error(`❌ ${pageConfig.name} 页面加载失败:`, error);

            // 提供更详细的错误信息
            if (error instanceof Error) {
              console.error(`   错误类型: ${error.name}`);
              console.error(`   错误消息: ${error.message}`);
              console.error(`   页面路径: ${pageConfig.path}`);
            }

            throw error;
          }
        });
      });
    });
  });
});
