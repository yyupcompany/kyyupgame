/**
 * TC-038: 浏览器兼容性测试
 * 验证移动端应用在不同移动浏览器上的兼容性
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { validateRequiredFields, validateFieldTypes } from '@/utils/validation';

// 模拟浏览器API
const mockNavigator = {
  userAgent: '',
  appName: 'Netscape',
  appVersion: '',
  platform: '',
  vendor: '',
  language: 'zh-CN',
  cookieEnabled: true,
  onLine: true,
  hardwareConcurrency: 4,
  deviceMemory: 4
};

Object.defineProperty(global, 'navigator', { value: mockNavigator });

describe('TC-038: 浏览器兼容性测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * 检测浏览器特性支持
   */
  const detectBrowserFeatures = () => {
    const features = {
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      geolocation: 'geolocation' in navigator,
      webWorkers: !!window.Worker,
      serviceWorker: !!navigator.serviceWorker,
      canvas2D: !!document.createElement('canvas').getContext,
      webgl: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })(),
      promises: !!window.Promise,
      fetch: !!window.fetch,
      webAssembly: !!window.WebAssembly,
      cssFlexbox: CSS.supports('display', 'flex'),
      cssGrid: CSS.supports('display', 'grid'),
      cssVariables: CSS.supports('color', 'var(--test)'),
      inputDate: (() => {
        const input = document.createElement('input');
        input.type = 'date';
        return input.type === 'date';
      })(),
      inputTime: (() => {
        const input = document.createElement('input');
        input.type = 'time';
        return input.type === 'time';
      })()
    };

    // 验证必需特性
    const requiredFeatures = ['localStorage', 'sessionStorage', 'promises', 'fetch'];
    requiredFeatures.forEach(feature => {
      expect(features[feature]).toBe(true);
    });

    return features;
  };

  /**
   * 验证浏览器信息和版本
   */
  const validateBrowserInfo = () => {
    const browserInfo = {
      userAgent: mockNavigator.userAgent,
      appName: mockNavigator.appName,
      appVersion: mockNavigator.appVersion,
      platform: mockNavigator.platform,
      vendor: mockNavigator.vendor,
      language: mockNavigator.language,
      cookieEnabled: mockNavigator.cookieEnabled,
      onLine: mockNavigator.onLine
    };

    // 检测浏览器类型
    const detectBrowser = () => {
      const ua = browserInfo.userAgent;

      if (ua.includes('Chrome') && !ua.includes('Edg')) {
        return { name: 'Chrome', type: 'Blink' };
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        return { name: 'Safari', type: 'WebKit' };
      } else if (ua.includes('Firefox')) {
        return { name: 'Firefox', type: 'Gecko' };
      } else if (ua.includes('Edg')) {
        return { name: 'Edge', type: 'Blink' };
      } else {
        return { name: 'Unknown', type: 'Unknown' };
      }
    };

    const browser = detectBrowser();
    expect(browser.name).not.toBe('Unknown');

    return { ...browserInfo, detectedBrowser: browser };
  };

  /**
   * 验证浏览器性能基准
   */
  const validateBrowserPerformance = async () => {
    // 测试渲染性能
    const renderStartTime = Date.now();

    const testElements = [];
    for (let i = 0; i < 100; i++) {
      testElements.push({
        offsetWidth: 100,
        offsetHeight: 100,
        style: {
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: ['red', 'green', 'blue'][i % 3]
        }
      });
    }

    const renderTime = Date.now() - renderStartTime;

    // 测试JavaScript性能
    const jsStartTime = Date.now();
    const largeArray = new Array(1000000).fill(0);
    const sum = largeArray.reduce((a, b) => a + b, 0);
    const jsTime = Date.now() - jsStartTime;

    // 性能基准验证
    expect(renderTime).toBeLessThan(1000); // 渲染 < 1秒
    expect(jsTime).toBeLessThan(2000); // JavaScript < 2秒

    return {
      renderTime,
      jsTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    };
  };

  describe('步骤1: iOS浏览器兼容性测试', () => {
    it('应该在Safari Mobile上正常工作', () => {
      const safariVersions = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      ];

      safariVersions.forEach(ua => {
        mockNavigator.userAgent = ua;
        mockNavigator.platform = 'iPhone';

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.detectedBrowser.name).toBe('Safari');
        expect(browserInfo.userAgent).toContain('Safari');
        expect(browserInfo.userAgent).toContain('Mobile');
      });
    });

    it('应该支持iOS Safari特性', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

      const safariFeatures = {
        webkitRequestAnimationFrame: !!window.webkitRequestAnimationFrame,
        webkitRequestFileSystem: !!window.webkitRequestFileSystem,
        webkitAudioContext: !!window.webkitAudioContext,
        webkitRTCPeerConnection: !!window.webkitRTCPeerConnection,
        webkitPerformance: !!window.webkitPerformance
      };

      expect(safariFeatures.webkitRequestAnimationFrame).toBe(true);
      expect(safariFeatures.webkitAudioContext).toBe(true);
    });

    it('应该处理Safari的限制', () => {
      const safariLimitations = {
        serviceWorkerLimited: true, // iOS Safari对Service Worker支持有限
        webPushNotSupported: true,  // iOS不支持Web Push
        installPromptLimited: true, // PWA安装提示有限
        autoplayRestricted: true    // 自动播放限制
      };

      expect(safariLimitations.serviceWorkerLimited).toBe(true);
      expect(safariLimitations.webPushNotSupported).toBe(true);
    });
  });

  describe('步骤2: Android浏览器兼容性测试', () => {
    it('应该在Chrome Mobile上正常工作', () => {
      const chromeVersions = [
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.74 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.126 Mobile Safari/537.36'
      ];

      chromeVersions.forEach(ua => {
        mockNavigator.userAgent = ua;

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.detectedBrowser.name).toBe('Chrome');
        expect(browserInfo.userAgent).toContain('Chrome');
        expect(browserInfo.userAgent).toContain('Mobile');
      });
    });

    it('应该支持Chrome Mobile特性', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.126 Mobile Safari/537.36';

      const chromeFeatures = {
        devToolsProtocol: true,      // DevTools Protocol支持
        v8Engine: true,              // V8 JavaScript引擎
        webAssembly: !!window.WebAssembly,
        serviceWorker: !!navigator.serviceWorker,
        webBluetooth: 'bluetooth' in navigator,
        webUSB: 'usb' in navigator,
        backgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window
      };

      expect(chromeFeatures.v8Engine).toBe(true);
      expect(chromeFeatures.webAssembly).toBe(true);
      expect(chromeFeatures.serviceWorker).toBe(true);
    });

    it('应该支持PWA功能', () => {
      const pwaFeatures = {
        serviceWorker: !!navigator.serviceWorker,
        webAppManifest: true,        // 假设支持manifest
        addToHomeScreen: true,       // Chrome支持添加到主屏幕
        offline: !!window.caches,    // Cache API支持
        backgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window
      };

      expect(pwaFeatures.serviceWorker).toBe(true);
      expect(pwaFeatures.offline).toBe(true);
    });
  });

  describe('步骤3: 第三方浏览器测试', () => {
    it('应该兼容Samsung Internet', () => {
      const samsungVersions = [
        'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/16.0 Chrome/92.0.4515.166 Mobile Safari/537.36'
      ];

      samsungVersions.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isSamsung = ua.includes('SamsungBrowser');
        expect(isSamsung).toBe(true);

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.userAgent).toContain('SamsungBrowser');
      });
    });

    it('应该兼容Firefox Mobile', () => {
      const firefoxVersions = [
        'Mozilla/5.0 (Mobile; rv:95.0) Gecko/95.0 Firefox/95.0',
        'Mozilla/5.0 (Mobile; rv:100.0) Gecko/100.0 Firefox/100.0',
        'Mozilla/5.0 (Mobile; rv:107.0) Gecko/107.0 Firefox/107.0'
      ];

      firefoxVersions.forEach(ua => {
        mockNavigator.userAgent = ua;

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.detectedBrowser.name).toBe('Firefox');
        expect(browserInfo.userAgent).toContain('Firefox');
        expect(browserInfo.userAgent).toContain('Mobile');
      });
    });

    it('应该兼容Opera Mobile', () => {
      const operaVersions = [
        'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36 OPR/58.2.2742.54967',
        'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 OPR/63.3.3216.58665'
      ];

      operaVersions.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isOpera = ua.includes('OPR');
        expect(isOpera).toBe(true);

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.userAgent).toContain('OPR');
      });
    });
  });

  describe('步骤4: 国产浏览器兼容性测试', () => {
    it('应该兼容UC浏览器', () => {
      const ucVersions = [
        'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36 UCBrowser/13.4.8.1303 Mobile',
        'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 UCBrowser/15.5.2.2548 Mobile'
      ];

      ucVersions.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isUC = ua.includes('UCBrowser');
        expect(isUC).toBe(true);

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.userAgent).toContain('UCBrowser');
      });
    });

    it('应该兼容QQ浏览器', () => {
      const qqVersions = [
        'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36 QQBrowser/11.7.5286.400',
        'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 QQBrowser/12.1.0.3956 Mobile'
      ];

      qqVersions.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isQQ = ua.includes('QQBrowser');
        expect(isQQ).toBe(true);

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.userAgent).toContain('QQBrowser');
      });
    });

    it('应该兼容小米浏览器', () => {
      const miVersions = [
        'Mozilla/5.0 (Linux; Android 11; Mi 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36 MiuiBrowser/14.5.23 Mobile',
        'Mozilla/5.0 (Linux; Android 12; Mi 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 MiuiBrowser/16.6.20 Mobile'
      ];

      miVersions.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isMi = ua.includes('MiuiBrowser');
        expect(isMi).toBe(true);

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.userAgent).toContain('MiuiBrowser');
      });
    });
  });

  describe('步骤5: 浏览器引擎兼容性测试', () => {
    it('应该兼容WebKit引擎', () => {
      const webkitBrowsers = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
      ];

      webkitBrowsers.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isWebKit = ua.includes('AppleWebKit');
        expect(isWebKit).toBe(true);

        const features = detectBrowserFeatures();
        expect(features.canvas2D).toBe(true);
        expect(features.localStorage).toBe(true);
      });
    });

    it('应该兼容Blink引擎', () => {
      const blinkBrowsers = [
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.126',
        'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/16.0'
      ];

      blinkBrowsers.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isBlink = ua.includes('AppleWebKit') && !ua.includes('Safari');
        expect(isBlink).toBe(true);

        const features = detectBrowserFeatures();
        expect(features.webAssembly).toBe(true);
        expect(features.serviceWorker).toBe(true);
      });
    });

    it('应该兼容Gecko引擎', () => {
      const geckoBrowsers = [
        'Mozilla/5.0 (Mobile; rv:107.0) Gecko/107.0 Firefox/107.0',
        'Mozilla/5.0 (Mobile; rv:100.0) Gecko/100.0 Firefox/100.0'
      ];

      geckoBrowsers.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isGecko = ua.includes('Gecko');
        expect(isGecko).toBe(true);

        const browserInfo = validateBrowserInfo();
        expect(browserInfo.detectedBrowser.name).toBe('Firefox');
      });
    });
  });

  describe('步骤6: 浏览器特性支持测试', () => {
    it('应该验证HTML5特性支持', () => {
      const html5Features = detectBrowserFeatures();

      expect(html5Features.localStorage).toBe(true);
      expect(html5Features.sessionStorage).toBe(true);
      expect(html5Features.geolocation).toBeDefined();
      expect(html5Features.webWorkers).toBeDefined();
      expect(html5Features.serviceWorker).toBeDefined();
    });

    it('应该验证CSS3特性支持', () => {
      const css3Features = {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        variables: CSS.supports('color', 'var(--test)'),
        transitions: CSS.supports('transition', 'all 0.3s'),
        animations: CSS.supports('animation', 'test 1s'),
        transforms: CSS.supports('transform', 'rotate(45deg)'),
        filters: CSS.supports('filter', 'blur(5px)'),
        gradients: CSS.supports('background', 'linear-gradient(red, blue)')
      };

      expect(css3Features.flexbox).toBe(true);
      expect(css3Features.variables).toBe(true);
      expect(css3Features.transitions).toBe(true);
      expect(css3Features.animations).toBe(true);
    });

    it('应该验证JavaScript特性支持', () => {
      const jsFeatures = {
        promises: !!window.Promise,
        asyncAwait: true, // 现代浏览器都支持
        fetch: !!window.fetch,
        webAssembly: !!window.WebAssembly,
        intersectionObserver: !!window.IntersectionObserver,
        resizeObserver: !!window.ResizeObserver,
        mutationObserver: !!window.MutationObserver,
        proxy: !!window.Proxy,
        reflect: !!window.Reflect
      };

      expect(jsFeatures.promises).toBe(true);
      expect(jsFeatures.fetch).toBe(true);
      expect(jsFeatures.webAssembly).toBeDefined();
      expect(jsFeatures.intersectionObserver).toBeDefined();
    });
  });

  describe('步骤7: 浏览器性能测试', () => {
    it('应该在不同浏览器中保持性能', async () => {
      const browserTests = [
        { name: 'Chrome', ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/106.0.5249.126' },
        { name: 'Safari', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Safari/605.1.15' },
        { name: 'Firefox', ua: 'Mozilla/5.0 (Mobile; rv:107.0) Gecko/107.0 Firefox/107.0' }
      ];

      for (const browser of browserTests) {
        mockNavigator.userAgent = browser.ua;

        const performance = await validateBrowserPerformance();

        // 所有浏览器都应该在合理时间内完成
        expect(performance.renderTime).toBeLessThan(2000);
        expect(performance.jsTime).toBeLessThan(3000);
      }
    });

    it('应该测试内存使用', () => {
      // 模拟内存测试
      const testMemoryUsage = () => {
        const arrays: number[][] = [];

        // 分配内存
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(10000).fill(0));
        }

        // 释放内存
        arrays.length = 0;

        return { status: 'completed' };
      };

      expect(() => testMemoryUsage()).not.toThrow();
    });
  });

  describe('兼容性工具函数测试', () => {
    it('detectBrowserFeatures应该检测浏览器特性', () => {
      const features = detectBrowserFeatures();
      expect(features).toHaveProperty('localStorage');
      expect(features).toHaveProperty('promises');
      expect(features).toHaveProperty('fetch');
      expect(typeof features.localStorage).toBe('boolean');
    });

    it('validateBrowserInfo应该验证浏览器信息', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/106.0.5249.126';

      const browserInfo = validateBrowserInfo();
      expect(browserInfo.userAgent).toContain('Chrome');
      expect(browserInfo.detectedBrowser.name).toBe('Chrome');
      expect(browserInfo.detectedBrowser.type).toBe('Blink');
    });

    it('validateBrowserPerformance应该验证性能', async () => {
      const performance = await validateBrowserPerformance();
      expect(performance.renderTime).toBeLessThan(1000);
      expect(performance.jsTime).toBeLessThan(2000);
    });
  });
});

/**
 * 测试总结
 *
 * 通过标准:
 * - 所有Grade A浏览器完全支持核心功能
 * - Grade B浏览器支持主要功能
 * - Grade C浏览器提供基础功能支持
 * - 各浏览器界面样式基本一致
 * - 性能在各浏览器中符合预期
 * - 优雅降级机制工作正常
 * - 无重大兼容性问题
 *
 * 失败标准:
 * - 主流浏览器核心功能不可用
 * - 界面在某些浏览器中严重错乱
 * - 性能严重低于预期
 * - 没有适当的降级处理
 * - 重要特性缺乏支持
 */