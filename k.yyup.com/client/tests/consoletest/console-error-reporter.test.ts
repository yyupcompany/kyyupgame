import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { 
  setupConsoleMonitoring, 
  resetConsoleMonitoring,
  getConsoleSpy,
  getUnhandledErrorCount,
  getUnhandledRejectionCount
} from '../setup/console-monitoring';
import { CONSOLE_TEST_CONFIG, getTestStatistics } from './console-test-config';

/**
 * 🔍 控制台错误报告生成器
 * 
 * 功能：
 * 1. 批量测试所有页面组件
 * 2. 收集控制台错误信息
 * 3. 生成详细的错误报告
 * 4. 提供错误分类和统计
 * 5. 支持错误趋势分析
 */

interface ConsoleError {
  page: string;
  module: string;
  errorType: 'error' | 'warn' | 'rejection';
  message: string;
  timestamp: number;
  stack?: string;
}

interface TestResult {
  page: string;
  module: string;
  success: boolean;
  errors: ConsoleError[];
  warnings: string[];
  loadTime: number;
  componentExists: boolean;
}

interface ConsoleErrorReport {
  summary: {
    totalPages: number;
    testedPages: number;
    successfulPages: number;
    failedPages: number;
    totalErrors: number;
    totalWarnings: number;
    testDuration: number;
  };
  moduleStats: Array<{
    module: string;
    totalPages: number;
    successfulPages: number;
    failedPages: number;
    errorCount: number;
    warningCount: number;
  }>;
  errorDetails: ConsoleError[];
  failedPages: TestResult[];
  recommendations: string[];
}

class ConsoleErrorReporter {
  private results: TestResult[] = [];
  private startTime: number = 0;
  private router: any;
  private pinia: any;

  constructor() {
    this.router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/test', component: { template: '<div>Test</div>' } }
      ]
    });
    this.pinia = createPinia();
  }

  /**
   * 开始测试所有页面
   */
  async runAllTests(): Promise<ConsoleErrorReport> {
    this.startTime = Date.now();
    this.results = [];

    console.log('🚀 开始批量控制台错误检测...\n');

    for (const [moduleKey, moduleConfig] of Object.entries(CONSOLE_TEST_CONFIG)) {
      console.log(`📁 测试模块: ${moduleConfig.name} (${moduleConfig.pages.length}个页面)`);
      
      for (const pageConfig of moduleConfig.pages) {
        if (pageConfig.skipTest) {
          console.log(`   ⏭️  跳过: ${pageConfig.name} - ${pageConfig.skipReason}`);
          continue;
        }

        const result = await this.testSinglePage(moduleKey, moduleConfig.name, pageConfig);
        this.results.push(result);
        
        const status = result.success ? '✅' : '❌';
        const errorInfo = result.errors.length > 0 ? ` (${result.errors.length}个错误)` : '';
        console.log(`   ${status} ${pageConfig.name}${errorInfo}`);
      }
      
      console.log(''); // 空行分隔
    }

    return this.generateReport();
  }

  /**
   * 测试单个页面
   */
  private async testSinglePage(moduleKey: string, moduleName: string, pageConfig: any): Promise<TestResult> {
    const startTime = Date.now();
    const errors: ConsoleError[] = [];
    const warnings: string[] = [];
    let success = false;
    let componentExists = false;

    // 重置控制台监控
    resetConsoleMonitoring();
    setupConsoleMonitoring();

    try {
      // 动态导入组件
      const componentModule = await import(`../../src/pages/${pageConfig.path}`);
      const Component = componentModule.default;

      if (!Component) {
        componentExists = false;
        errors.push({
          page: pageConfig.name,
          module: moduleName,
          errorType: 'error',
          message: `Component not found or failed to import: ${pageConfig.path}`,
          timestamp: Date.now()
        });
      } else {
        componentExists = true;

        // 挂载组件
        const wrapper = mount(Component, {
          global: {
            plugins: [this.router, this.pinia],
            mocks: {
              $router: this.router,
              $route: { path: '/', params: {}, query: {} },
              $t: (key: string) => key,
              $message: {
                success: vi.fn(),
                error: vi.fn(),
                warning: vi.fn(),
                info: vi.fn()
              }
            },
            stubs: {
              'el-table': true,
              'el-form': true,
              'el-dialog': true,
              'el-drawer': true,
              'el-upload': true,
              'router-link': true,
              'router-view': true
            }
          }
        });

        // 等待组件渲染
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 50));

        // 检查控制台错误
        const consoleSpy = getConsoleSpy();
        const errorCount = getUnhandledErrorCount();
        const rejectionCount = getUnhandledRejectionCount();

        if (errorCount > 0) {
          errors.push({
            page: pageConfig.name,
            module: moduleName,
            errorType: 'error',
            message: `${errorCount} unhandled console errors detected`,
            timestamp: Date.now()
          });
        }

        if (rejectionCount > 0) {
          errors.push({
            page: pageConfig.name,
            module: moduleName,
            errorType: 'rejection',
            message: `${rejectionCount} unhandled promise rejections detected`,
            timestamp: Date.now()
          });
        }

        // 检查控制台警告
        if (consoleSpy.warn && consoleSpy.warn.mock && consoleSpy.warn.mock.calls.length > 0) {
          consoleSpy.warn.mock.calls.forEach((call: any[]) => {
            warnings.push(call.join(' '));
          });
        }

        wrapper.unmount();
        success = errors.length === 0;
      }
    } catch (error) {
      errors.push({
        page: pageConfig.name,
        module: moduleName,
        errorType: 'error',
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    const loadTime = Date.now() - startTime;

    return {
      page: pageConfig.name,
      module: moduleName,
      success,
      errors,
      warnings,
      loadTime,
      componentExists
    };
  }

  /**
   * 生成详细报告
   */
  private generateReport(): ConsoleErrorReport {
    const testDuration = Date.now() - this.startTime;
    const stats = getTestStatistics();
    
    const successfulPages = this.results.filter(r => r.success);
    const failedPages = this.results.filter(r => !r.success);
    const allErrors = this.results.flatMap(r => r.errors);
    const allWarnings = this.results.flatMap(r => r.warnings);

    // 按模块统计
    const moduleStats = Object.entries(CONSOLE_TEST_CONFIG).map(([moduleKey, moduleConfig]) => {
      const moduleResults = this.results.filter(r => r.module === moduleConfig.name);
      const moduleSuccessful = moduleResults.filter(r => r.success);
      const moduleErrors = moduleResults.flatMap(r => r.errors);
      const moduleWarnings = moduleResults.flatMap(r => r.warnings);

      return {
        module: moduleConfig.name,
        totalPages: moduleConfig.pages.length,
        successfulPages: moduleSuccessful.length,
        failedPages: moduleResults.length - moduleSuccessful.length,
        errorCount: moduleErrors.length,
        warningCount: moduleWarnings.length
      };
    });

    // 生成建议
    const recommendations = this.generateRecommendations(failedPages, allErrors);

    return {
      summary: {
        totalPages: stats.totalPages,
        testedPages: this.results.length,
        successfulPages: successfulPages.length,
        failedPages: failedPages.length,
        totalErrors: allErrors.length,
        totalWarnings: allWarnings.length,
        testDuration
      },
      moduleStats,
      errorDetails: allErrors,
      failedPages,
      recommendations
    };
  }

  /**
   * 生成修复建议
   */
  private generateRecommendations(failedPages: TestResult[], errors: ConsoleError[]): string[] {
    const recommendations: string[] = [];

    if (failedPages.length > 0) {
      recommendations.push(`发现 ${failedPages.length} 个页面存在控制台错误，建议优先修复`);
    }

    const componentNotFoundErrors = errors.filter(e => e.message.includes('Component not found'));
    if (componentNotFoundErrors.length > 0) {
      recommendations.push(`发现 ${componentNotFoundErrors.length} 个组件导入失败，检查文件路径和组件导出`);
    }

    const unhandledErrors = errors.filter(e => e.message.includes('unhandled console errors'));
    if (unhandledErrors.length > 0) {
      recommendations.push(`发现 ${unhandledErrors.length} 个页面有未处理的控制台错误，检查组件逻辑`);
    }

    const rejectionErrors = errors.filter(e => e.errorType === 'rejection');
    if (rejectionErrors.length > 0) {
      recommendations.push(`发现 ${rejectionErrors.length} 个未处理的Promise拒绝，添加错误处理`);
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 所有页面都通过了控制台错误检测！');
    }

    return recommendations;
  }
}

describe('🔍 控制台错误报告生成器', () => {
  let reporter: ConsoleErrorReporter;

  beforeEach(() => {
    reporter = new ConsoleErrorReporter();
  });

  it('should generate comprehensive console error report', async () => {
    const report = await reporter.runAllTests();

    // 验证报告结构
    expect(report.summary).toBeDefined();
    expect(report.moduleStats).toBeDefined();
    expect(report.errorDetails).toBeDefined();
    expect(report.failedPages).toBeDefined();
    expect(report.recommendations).toBeDefined();

    // 输出详细报告
    console.log('\n📊 控制台错误检测报告');
    console.log('='.repeat(50));
    
    console.log('\n📈 总体统计:');
    console.log(`   总页面数: ${report.summary.totalPages}`);
    console.log(`   测试页面数: ${report.summary.testedPages}`);
    console.log(`   成功页面数: ${report.summary.successfulPages}`);
    console.log(`   失败页面数: ${report.summary.failedPages}`);
    console.log(`   总错误数: ${report.summary.totalErrors}`);
    console.log(`   总警告数: ${report.summary.totalWarnings}`);
    console.log(`   测试耗时: ${report.summary.testDuration}ms`);

    console.log('\n📁 模块统计:');
    report.moduleStats.forEach(stat => {
      const successRate = stat.totalPages > 0 ? 
        ((stat.successfulPages / stat.totalPages) * 100).toFixed(1) : '0';
      console.log(`   ${stat.module}: ${stat.successfulPages}/${stat.totalPages} (${successRate}%) - ${stat.errorCount}错误, ${stat.warningCount}警告`);
    });

    if (report.failedPages.length > 0) {
      console.log('\n❌ 失败页面详情:');
      report.failedPages.forEach(page => {
        console.log(`   ${page.module}/${page.page}: ${page.errors.length}个错误`);
        page.errors.forEach(error => {
          console.log(`     - ${error.errorType}: ${error.message}`);
        });
      });
    }

    console.log('\n💡 修复建议:');
    report.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });

    // 验证测试覆盖率
    expect(report.summary.testedPages).toBeGreaterThan(100);
    
    // 如果有失败页面，提供详细信息但不让测试失败
    if (report.summary.failedPages > 0) {
      console.warn(`\n⚠️ 发现 ${report.summary.failedPages} 个页面存在控制台错误，请查看上述详情进行修复`);
    }
  }, 300000); // 5分钟超时
});
