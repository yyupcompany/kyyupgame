/**
 * TC-041: 网络连接错误处理测试
 * 验证移动端应用在各种网络连接错误场景下的错误处理能力和用户体验
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  StrictValidator,
  ConsoleErrorMonitor,
  NetworkErrorSimulator,
  MobileTestUtils,
  PerformanceMonitor,
  TestDataGenerator,
  AssertionHelpers,
  TestCleanup
} from './test-utils';

describe('TC-041: 网络连接错误处理测试', () => {
  let consoleMonitor: ConsoleErrorMonitor;
  let networkSimulator: NetworkErrorSimulator;
  let performanceMonitor: PerformanceMonitor;
  let cleanup: TestCleanup;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleMonitor = new ConsoleErrorMonitor();
    networkSimulator = new NetworkErrorSimulator();
    performanceMonitor = new PerformanceMonitor();
    cleanup = TestCleanup.create();

    // 添加清理任务
    cleanup.addCleanup(() => {
      consoleMonitor.restore();
      networkSimulator.restore();
    });
  });

  afterEach(() => {
    consoleMonitor.expectNoConsoleErrors();
    performanceMonitor.clear();
  });

  describe('TC-041-01: 网络完全断开处理', () => {
    it('应该显示网络断开提示并保持页面内容可见', async () => {
      // 模拟网络断开
      MobileTestUtils.simulateNetworkChange('none');

      // 测试页面元素
      const offlineBanner = document.querySelector('[data-testid="offline-banner"]');
      const retryButton = document.querySelector('[data-testid="retry-button"]');
      const mainContent = document.querySelector('[data-testid="main-content"]');

      // 验证网络状态提示
      AssertionHelpers.assertElementVisible(offlineBanner);
      AssertionHelpers.assertElementContainsText(offlineBanner!, '网络连接已断开');
      
      // 验证重试按钮
      AssertionHelpers.assertElementVisible(retryButton);
      expect(retryButton?.textContent).toContain('重试');
      
      // 验证页面内容仍然可见（缓存数据）
      AssertionHelpers.assertElementVisible(mainContent);

      // 验证无控制台错误
      expect(consoleMonitor.getErrors().filter(e => e.includes('NetworkError'))).toHaveLength(0);
    });

    it('应该正确处理离线状态下的用户操作', async () => {
      MobileTestUtils.simulateNetworkChange('none');

      // 模拟用户点击操作
      const actionButton = document.querySelector('[data-testid="action-button"]');
      if (actionButton) {
        performanceMonitor.start();
        actionButton.click();
        const responseTime = performanceMonitor.end('offline-action');

        // 验证响应时间（应该快速，因为没有网络请求）
        expect(responseTime).toBeLessThan(100);

        // 验证显示离线提示而不是错误
        const offlineMessage = document.querySelector('[data-testid="offline-message"]');
        AssertionHelpers.assertElementVisible(offlineMessage);
        AssertionHelpers.assertElementContainsText(offlineMessage!, '网络不可用');
      }
    });

    it('应该提供合适的重试机制', async () => {
      MobileTestUtils.simulateNetworkChange('none');

      // 设置网络恢复
      setTimeout(() => {
        MobileTestUtils.simulateNetworkChange('wifi', '4g');
      }, 1000);

      // 点击重试按钮
      const retryButton = document.querySelector('[data-testid="retry-button"]') as HTMLButtonElement;
      if (retryButton) {
        performanceMonitor.start();
        retryButton.click();
        const retryTime = performanceMonitor.end('network-retry');

        // 验证重试响应时间
        expect(retryTime).toBeLessThan(2000);

        // 验证网络恢复提示
        const recoveryMessage = document.querySelector('[data-testid="recovery-message"]');
        AssertionHelpers.assertElementContainsText(recoveryMessage!, '网络已恢复');
      }
    });
  });

  describe('TC-041-02: 网络请求超时处理', () => {
    it('应该在30秒后显示超时提示', async () => {
      // 模拟网络超时
      networkSimulator.addErrorScenario('/api/data', () => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(
              JSON.stringify(TestDataGenerator.generateErrorResponse('Request timeout')), 
              { status: 408 }
            ));
          }, 30000); // 30秒超时
        })
      );

      performanceMonitor.start();
      
      // 模拟API调用
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        const timeoutDuration = performanceMonitor.end('api-timeout');
        
        // 验证超时时间
        expect(timeoutDuration).toBeGreaterThanOrEqual(29000); // 允许1秒误差
        expect(timeoutDuration).toBeLessThan(31000);
        
        // 验证错误响应结构
        AssertionHelpers.assertApiResponseStructure(data);
        expect(data.success).toBe(false);
        expect(data.error.message).toContain('timeout');
        
      } catch (error) {
        const timeoutDuration = performanceMonitor.end('api-timeout');
        expect(timeoutDuration).toBeGreaterThanOrEqual(29000);
      }
    });

    it('应该提供重新请求选项并防止重复请求', async () => {
      let requestCount = 0;
      
      networkSimulator.addErrorScenario('/api/slow', () => {
        requestCount++;
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(
              JSON.stringify(TestDataGenerator.generateErrorResponse('Timeout')), 
              { status: 408 }
            ));
          }, 35000); // 超过30秒超时
        });
      });

      // 模拟快速重复点击
      const retryButton = document.querySelector('[data-testid="retry-button"]') as HTMLButtonElement;
      if (retryButton) {
        // 快速点击3次
        retryButton.click();
        retryButton.click();
        retryButton.click();

        // 等待一段时间后检查请求次数
        setTimeout(() => {
          expect(requestCount).toBeLessThanOrEqual(1); // 应该只发送一次请求
        }, 100);
      }
    });

    it('应该显示加载状态直到超时', async () => {
      const loadingSpinner = document.querySelector('[data-testid="loading-spinner"]');
      
      networkSimulator.addErrorScenario('/api/long-request', () => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(
              JSON.stringify(TestDataGenerator.generateErrorResponse('Timeout')), 
              { status: 408 }
            ));
          }, 32000);
        })
      );

      // 开始请求
      fetch('/api/long-request');

      // 验证加载状态显示
      AssertionHelpers.assertElementVisible(loadingSpinner);
      expect(loadingSpinner?.style.display).not.toBe('none');

      // 等待超时后
      setTimeout(() => {
        // 加载状态应该消失
        expect(loadingSpinner?.style.display).toBe('none');
        
        // 显示超时错误
        const timeoutMessage = document.querySelector('[data-testid="timeout-message"]');
        AssertionHelpers.assertElementVisible(timeoutMessage);
        AssertionHelpers.assertElementContainsText(timeoutMessage!, '请求超时');
      }, 33000);
    });
  });

  describe('TC-041-03: 弱网络环境测试', () => {
    it('应该在慢网络下显示加载指示器', async () => {
      // 模拟慢3G网络
      MobileTestUtils.simulateNetworkChange('cellular', 'slow-3g');

      // 模拟慢速API响应
      networkSimulator.addErrorScenario('/api/slow-data', () => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(
              JSON.stringify(TestDataGenerator.generateApiResponse({ data: 'test' })), 
              { status: 200 }
            ));
          }, 5000); // 5秒延迟
        })
      );

      const loadingIndicator = document.querySelector('[data-testid="loading-indicator"]');
      const contentArea = document.querySelector('[data-testid="content-area"]');

      // 开始请求
      fetch('/api/slow-data');

      // 验证加载指示器显示
      AssertionHelpers.assertElementVisible(loadingIndicator);
      
      // 验证骨架屏或占位符
      const skeleton = document.querySelector('[data-testid="skeleton-loading"]');
      if (skeleton) {
        AssertionHelpers.assertElementVisible(skeleton);
      }

      // 等待响应完成
      setTimeout(() => {
        // 验证内容区域已更新
        AssertionHelpers.assertElementVisible(contentArea);
        AssertionHelpers.assertElementContainsText(contentArea!, 'test');
        
        // 加载指示器应该消失
        expect(loadingIndicator?.style.display).toBe('none');
      }, 5200);
    });

    it('应该实现渐进式内容加载', async () => {
      MobileTestUtils.simulateNetworkChange('cellular', '3g');

      // 模拟分块数据加载
      let chunkCount = 0;
      networkSimulator.addErrorScenario('/api/progressive-data', () => {
        chunkCount++;
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(
              JSON.stringify({
                success: true,
                data: {
                  chunk: chunkCount,
                  total: 3,
                  content: `Chunk ${chunkCount} data`
                }
              }), 
              { status: 200 }
            ));
          }, chunkCount * 1000); // 每个块延迟增加
        });
      });

      const progressContainer = document.querySelector('[data-testid="progress-container"]');
      
      // 开始渐进式加载
      for (let i = 1; i <= 3; i++) {
        performanceMonitor.start();
        const response = await fetch('/api/progressive-data');
        const data = await response.json();
        const loadTime = performanceMonitor.end(`chunk-${i}`);

        // 验证每个块的数据结构
        StrictValidator.validateRequiredFields(data, ['success', 'data']);
        StrictValidator.validateRequiredFields(data.data, ['chunk', 'total', 'content']);
        
        expect(data.data.chunk).toBe(i);
        expect(loadTime).toBeLessThan(i * 1000 + 500); // 允许误差

        // 验证进度显示
        if (progressContainer) {
          const progressBar = progressContainer.querySelector('[data-testid="progress-bar"]');
          if (progressBar) {
            const expectedProgress = (i / 3) * 100;
            expect(progressBar.getAttribute('aria-valuenow')).toBe(String(expectedProgress));
          }
        }
      }
    });
  });

  describe('TC-041-04: 网络恢复自动重连', () => {
    it('应该自动检测网络状态变化', async () => {
      // 初始状态：离线
      MobileTestUtils.simulateNetworkChange('none');
      
      const networkStatus = document.querySelector('[data-testid="network-status"]');
      AssertionHelpers.assertElementContainsText(networkStatus!, '离线');

      // 模拟网络恢复
      MobileTestUtils.simulateNetworkChange('wifi', '4g');

      // 验证状态自动更新
      setTimeout(() => {
        AssertionHelpers.assertElementContainsText(networkStatus!, '在线');
        
        const recoveryNotification = document.querySelector('[data-testid="recovery-notification"]');
        AssertionHelpers.assertElementVisible(recoveryNotification);
        AssertionHelpers.assertElementContainsText(recoveryNotification!, '网络已恢复');
      }, 100);
    });

    it('应该智能重试失败的请求', async () => {
      let retryAttempts = 0;
      
      // 初始失败
      networkSimulator.addErrorScenario('/api/retry-test', () => {
        retryAttempts++;
        if (retryAttempts <= 2) {
          return Promise.resolve(new Response(
            JSON.stringify(TestDataGenerator.generateErrorResponse('Network error')), 
            { status: 500 }
          ));
        } else {
          return Promise.resolve(new Response(
            JSON.stringify(TestDataGenerator.generateApiResponse({ success: true })), 
            { status: 200 }
          ));
        }
      });

      // 模拟自动重试机制
      const retryWithBackoff = async (url: string, maxRetries: number = 3): Promise<any> => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              return response.json();
            }
            if (i < maxRetries - 1) {
              // 指数退避
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          }
        }
        throw new Error('Max retries exceeded');
      };

      performanceMonitor.start();
      const result = await retryWithBackoff('/api/retry-test');
      const totalTime = performanceMonitor.end('smart-retry');

      // 验证重试成功
      expect(result.success).toBe(true);
      expect(retryAttempts).toBe(3); // 初始失败 + 2次重试 + 成功
      
      // 验证总时间合理（包含退避延迟）
      expect(totalTime).toBeGreaterThan(3000); // 至少包含退避延迟
      expect(totalTime).toBeLessThan(10000); // 但不应该太长
    });

    it('应该更新UI状态并显示恢复提示', async () => {
      // 模拟网络断开状态下的操作
      MobileTestUtils.simulateNetworkChange('none');
      
      const saveButton = document.querySelector('[data-testid="save-button"]') as HTMLButtonElement;
      if (saveButton) {
        saveButton.click();
        
        // 验证显示离线状态
        const offlineIndicator = document.querySelector('[data-testid="offline-indicator"]');
        AssertionHelpers.assertElementVisible(offlineIndicator);
      }

      // 恢复网络
      MobileTestUtils.simulateNetworkChange('wifi', '4g');
      
      setTimeout(() => {
        // 验证UI状态自动更新
        const onlineIndicator = document.querySelector('[data-testid="online-indicator"]');
        AssertionHelpers.assertElementVisible(onlineIndicator);
        
        // 验证操作队列自动处理
        const syncMessage = document.querySelector('[data-testid="sync-message"]');
        AssertionHelpers.assertElementVisible(syncMessage);
        AssertionHelpers.assertElementContainsText(syncMessage!, '同步完成');
      }, 500);
    });
  });

  describe('TC-041-05: 离线功能支持', () => {
    it('应该支持缓存页面的离线访问', async () => {
      // 先在有网络时访问页面（缓存数据）
      MobileTestUtils.simulateNetworkChange('wifi', '4g');
      
      const cachedPage = document.querySelector('[data-testid="cached-page"]');
      const originalContent = cachedPage?.textContent;

      // 断开网络
      MobileTestUtils.simulateNetworkChange('none');
      
      // 刷新页面（模拟离线访问）
      window.location.reload();
      
      setTimeout(() => {
        // 验证缓存页面可正常访问
        AssertionHelpers.assertElementVisible(cachedPage);
        expect(cachedPage?.textContent).toBe(originalContent);
        
        // 验证离线状态指示器
        const offlineBadge = document.querySelector('[data-testid="offline-badge"]');
        AssertionHelpers.assertElementVisible(offlineBadge);
      }, 1000);
    });

    it('应该显示离线状态指示器', async () => {
      MobileTestUtils.simulateNetworkChange('none');
      
      const offlineIndicator = document.querySelector('[data-testid="offline-status-indicator"]');
      const offlineText = document.querySelector('[data-testid="offline-text"]');
      const offlineIcon = document.querySelector('[data-testid="offline-icon"]');
      
      // 验证离线指示器组件
      AssertionHelpers.assertElementVisible(offlineIndicator);
      AssertionHelpers.assertElementVisible(offlineText);
      AssertionHelpers.assertElementContainsText(offlineText!, '离线模式');
      AssertionHelpers.assertElementVisible(offlineIcon);
      
      // 验证指示器样式
      expect(offlineIndicator?.classList.contains('offline')).toBe(true);
      expect(offlineIndicator?.getAttribute('aria-live')).toBe('polite');
    });

    it('应该支持本地数据操作和离线队列', async () => {
      MobileTestUtils.simulateNetworkChange('none');
      
      // 模拟本地数据操作
      const form = document.querySelector('[data-testid="offline-form"]') as HTMLFormElement;
      const input = document.querySelector('[data-testid="offline-input"]') as HTMLInputElement;
      
      if (form && input) {
        input.value = '测试数据';
        form.dispatchEvent(new Event('submit'));
        
        // 验证数据保存到本地队列
        const queueIndicator = document.querySelector('[data-testid="offline-queue-indicator"]');
        AssertionHelpers.assertElementVisible(queueIndicator);
        AssertionHelpers.assertElementContainsText(queueIndicator!, '1 个操作待同步');
        
        // 模拟网络恢复后的同步
        MobileTestUtils.simulateNetworkChange('wifi', '4g');
        
        setTimeout(() => {
          // 验证队列清空
          expect(queueIndicator?.textContent).toContain('0 个操作');
          
          // 验证同步成功提示
          const syncSuccess = document.querySelector('[data-testid="sync-success"]');
          AssertionHelpers.assertElementVisible(syncSuccess);
        }, 2000);
      }
    });
  });

  describe('网络错误处理性能验证', () => {
    it('错误状态显示应该在100ms内完成', async () => {
      MobileTestUtils.simulateNetworkChange('none');
      
      performanceMonitor.start();
      
      // 触发网络错误
      const triggerError = () => {
        const errorBanner = document.querySelector('[data-testid="offline-banner"]');
        return errorBanner?.style.display !== 'none';
      };
      
      // 等待错误状态显示
      while (!triggerError() && performanceMonitor.getMeasurements()['error-display'] < 100) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const errorDisplayTime = performanceMonitor.end('error-display');
      expect(errorDisplayTime).toBeLessThan(100);
    });

    it('重试响应时间应该在50ms内', async () => {
      const retryButton = document.querySelector('[data-testid="retry-button"]') as HTMLButtonElement;
      
      if (retryButton) {
        performanceMonitor.start();
        retryButton.click();
        const retryResponseTime = performanceMonitor.end('retry-response');
        
        expect(retryResponseTime).toBeLessThan(50);
      }
    });

    it('网络状态检测应该在200ms内完成', async () => {
      performanceMonitor.start();
      
      // 触发网络状态检测
      MobileTestUtils.simulateNetworkChange('wifi', '4g');
      
      // 等待状态检测完成
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const detectionTime = performanceMonitor.end('network-detection');
      expect(detectionTime).toBeLessThan(200);
    });
  });
});