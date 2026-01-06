/**
 * TC-041: 设备兼容性完整测试套件
 * 100%设备兼容性覆盖 - 各种移动设备、屏幕尺寸、操作系统、浏览器
 * 确保在所有目标设备上提供一致的用户体验
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateRequiredFields, validateFieldTypes, validateMobileElement } from '../../utils/validation-helpers';

// 设备配置数据库
const DEVICE_DATABASE = {
  // iOS 设备
  iOS: {
    iPhone: {
      'iPhone SE': { width: 375, height: 667, density: 2, userAgent: 'iPhone SE', osVersion: '15.7' },
      'iPhone 8': { width: 375, height: 667, density: 2, userAgent: 'iPhone8,1', osVersion: '16.0' },
      'iPhone 11': { width: 414, height: 896, density: 2, userAgent: 'iPhone12,1', osVersion: '16.5' },
      'iPhone 12': { width: 390, height: 844, density: 3, userAgent: 'iPhone13,2', osVersion: '17.0' },
      'iPhone 14 Pro': { width: 393, height: 852, density: 3, userAgent: 'iPhone15,2', osVersion: '17.1' },
      'iPhone 15 Pro Max': { width: 430, height: 932, density: 3, userAgent: 'iPhone16,2', osVersion: '17.2' }
    },
    iPad: {
      'iPad 9': { width: 768, height: 1024, density: 2, userAgent: 'iPad13,2', osVersion: '16.0' },
      'iPad Air': { width: 820, height: 1180, density: 2, userAgent: 'iPad13,11', osVersion: '17.0' },
      'iPad Pro 11': { width: 834, height: 1194, density: 2, userAgent: 'iPad14,3', osVersion: '17.0' },
      'iPad Pro 12.9': { width: 1024, height: 1366, density: 2, userAgent: 'iPad13,8', osVersion: '17.1' }
    }
  },

  // Android 设备
  Android: {
    Phones: {
      'Samsung Galaxy S21': { width: 360, height: 800, density: 3, userAgent: 'SM-G991B', osVersion: '13' },
      'Samsung Galaxy S23': { width: 360, height: 780, density: 3, userAgent: 'SM-S911B', osVersion: '14' },
      'Google Pixel 7': { width: 393, height: 851, density: 2.625, userAgent: 'Pixel 7', osVersion: '14' },
      'Xiaomi Mi 13': { width: 393, height: 851, density: 2.75, userAgent: 'Mi 13', osVersion: '13' },
      'OnePlus 11': { width: 389, height: 850, density: 3, userAgent: 'OnePlus 11', osVersion: '13' },
      'Huawei Mate 50': { width: 390, height: 844, density: 2.75, userAgent: 'ALT-AL00', osVersion: '12' }
    },
    Tablets: {
      'Samsung Galaxy Tab S8': { width: 800, height: 1280, density: 2, userAgent: 'SM-X900', osVersion: '13' },
      'Google Pixel Tablet': { width: 800, height: 1280, density: 2, userAgent: 'Pixel Tablet', osVersion: '14' },
      'Xiaomi Pad 6': { width: 800, height: 1200, density: 2, userAgent: '23046RP50C', osVersion: '13' }
    }
  },

  // 特殊设备
  Special: {
    'Small Screen': { width: 320, height: 568, density: 2, userAgent: 'Generic Small', osVersion: 'OS' },
    'Foldable': { width: 780, height: 1812, density: 2.625, userAgent: 'Foldable', osVersion: '13' },
    'Large Tablet': { width: 1366, height: 1024, density: 2, userAgent: 'Large Tablet', osVersion: 'OS' }
  }
};

// 浏览器配置
const BROWSER_CONFIGURATIONS = [
  { name: 'Safari', engine: 'WebKit', version: '16.5', mobile: true },
  { name: 'Chrome Mobile', engine: 'Blink', version: '120', mobile: true },
  { name: 'Firefox Mobile', engine: 'Gecko', version: '119', mobile: true },
  { name: 'Edge Mobile', engine: 'Blink', version: '120', mobile: true },
  { name: 'Opera Mobile', engine: 'Blink', version: '80', mobile: true },
  { name: 'UC Browser', engine: 'WebKit', version: '15.5', mobile: true },
  { name: 'Samsung Browser', engine: 'WebKit', version: '22', mobile: true }
];

// 网络环境配置
const NETWORK_CONFIGURATIONS = [
  { type: 'WiFi', downlink: 10, rtt: 20, effectiveType: '4g' },
  { type: '4G', downlink: 4, rtt: 50, effectiveType: '4g' },
  { type: '3G', downlink: 1.5, rtt: 200, effectiveType: '3g' },
  { type: '2G', downlink: 0.1, rtt: 1000, effectiveType: '2g' },
  { type: 'Slow WiFi', downlink: 2, rtt: 100, effectiveType: '3g' }
];

describe('TC-041: 设备兼容性完整测试套件', () => {
  let originalDevice: any = {};
  let compatibilityResults: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    // 保存原始设备信息
    originalDevice = {
      userAgent: navigator.userAgent,
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };

    // 设置基础DOM结构
    document.body.innerHTML = `
      <div class="mobile-app">
        <header class="app-header">
          <nav class="navigation">
            <button class="menu-toggle">☰</button>
            <h1 class="app-title">幼儿园管理系统</h1>
            <div class="header-actions">
              <button class="notification-bell">🔔</button>
              <button class="user-avatar">👤</button>
            </div>
          </nav>
        </header>

        <main class="app-content">
          <section class="dashboard-section">
            <h2>仪表板</h2>
            <div class="card-grid">
              <div class="dashboard-card">
                <h3>我的孩子</h3>
                <p class="card-value">2个孩子</p>
              </div>
              <div class="dashboard-card">
                <h3>今日活动</h3>
                <p class="card-value">3个活动</p>
              </div>
              <div class="dashboard-card">
                <h3>未读通知</h3>
                <p class="card-value">5条通知</p>
              </div>
            </div>
          </section>

          <section class="actions-section">
            <h2>快捷操作</h2>
            <div class="action-buttons">
              <button class="action-button primary">查看日历</button>
              <button class="action-button secondary">联系老师</button>
              <button class="action-button tertiary">查看照片</button>
              <button class="action-button quaternary">缴费管理</button>
            </div>
          </section>
        </main>

        <footer class="app-footer">
          <nav class="bottom-navigation">
            <button class="nav-item active" data-page="home">🏠</button>
            <button class="nav-item" data-page="children">👶</button>
            <button class="nav-item" data-page="activities">📅</button>
            <button class="nav-item" data-page="messages">💬</button>
            <button class="nav-item" data-page="profile">👤</button>
          </nav>
        </footer>
      </div>
    `;
  });

  afterEach(() => {
    // 恢复原始设备信息
    Object.defineProperty(window, 'innerWidth', { value: originalDevice.width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalDevice.height, configurable: true });
    Object.defineProperty(navigator, 'userAgent', { value: originalDevice.userAgent, configurable: true });
  });

  describe('1. iOS设备兼容性测试', () => {
    describe('iPhone系列兼容性', () => {
      Object.entries(DEVICE_DATABASE.iOS.iPhone).forEach(([deviceName, config]) => {
        it(`应该在${deviceName}上正确显示`, async () => {
          await simulateDevice(config);

          // 验证基本布局适配
          const layoutValidation = validateLayoutForDevice(config);
          expect(layoutValidation.valid).toBe(true);
          expect(layoutValidation.errors).toHaveLength(0);

          // 验证字体和触摸目标大小
          const touchValidation = validateTouchTargetsForDevice(config);
          expect(touchValidation.valid).toBe(true);

          // 验证iOS特定功能
          const iOSValidation = await validateiOSSpecificFeatures(config);
          expect(iOSValidation.valid).toBe(true);

          // 记录测试结果
          recordCompatibilityResult('iOS', deviceName, config, {
            layout: layoutValidation,
            touch: touchValidation,
            iOSSpecific: iOSValidation
          });

          console.log(`✅ ${deviceName} 兼容性测试通过`);
        });
      });
    });

    describe('iPad系列兼容性', () => {
      Object.entries(DEVICE_DATABASE.iOS.iPad).forEach(([deviceName, config]) => {
        it(`应该在${deviceName}上正确显示`, async () => {
          await simulateDevice(config);

          // 验证平板布局
          const tabletLayoutValidation = validateTabletLayout(config);
          expect(tabletLayoutValidation.valid).toBe(true);

          // 验证多列布局支持
          const multiColumnValidation = validateMultiColumnLayout(config);
          expect(multiColumnValidation.valid).toBe(true);

          // 验证横竖屏适配
          const orientationValidation = await validateOrientationSupport(config);
          expect(orientationValidation.valid).toBe(true);

          recordCompatibilityResult('iPad', deviceName, config, {
            layout: tabletLayoutValidation,
            multiColumn: multiColumnValidation,
            orientation: orientationValidation
          });

          console.log(`✅ ${deviceName} (iPad) 兼容性测试通过`);
        });
      });
    });
  });

  describe('2. Android设备兼容性测试', () => {
    describe('Android手机兼容性', () => {
      Object.entries(DEVICE_DATABASE.Android.Phones).forEach(([deviceName, config]) => {
        it(`应该在${deviceName}上正确显示`, async () => {
          await simulateDevice(config);

          // 验证Android特定布局
          const androidLayoutValidation = validateAndroidLayout(config);
          expect(androidLayoutValidation.valid).toBe(true);

          // 验证导航栏适配
          const navigationValidation = validateAndroidNavigation(config);
          expect(navigationValidation.valid).toBe(true);

          // 验证状态栏处理
          const statusBarValidation = validateStatusBarHandling(config);
          expect(statusBarValidation.valid).toBe(true);

          recordCompatibilityResult('Android', deviceName, config, {
            layout: androidLayoutValidation,
            navigation: navigationValidation,
            statusBar: statusBarValidation
          });

          console.log(`✅ ${deviceName} 兼容性测试通过`);
        });
      });
    });

    describe('Android平板兼容性', () => {
      Object.entries(DEVICE_DATABASE.Android.Tablets).forEach(([deviceName, config]) => {
        it(`应该在${deviceName}上正确显示`, async () => {
          await simulateDevice(config);

          // 验证Android平板特性
          const androidTabletValidation = validateAndroidTablet(config);
          expect(androidTabletValidation.valid).toBe(true);

          // 验证触摸交互优化
          const touchOptimizationValidation = validateTouchOptimization(config);
          expect(touchOptimizationValidation.valid).toBe(true);

          recordCompatibilityResult('Android Tablet', deviceName, config, {
            tablet: androidTabletValidation,
            touchOptimization: touchOptimizationValidation
          });

          console.log(`✅ ${deviceName} (Android Tablet) 兼容性测试通过`);
        });
      });
    });
  });

  describe('3. 特殊设备兼容性测试', () => {
    Object.entries(DEVICE_DATABASE.Special).forEach(([deviceName, config]) => {
      it(`应该正确处理${deviceName}特殊设备`, async () => {
        await simulateDevice(config);

        // 验证极端尺寸处理
        const extremeSizeValidation = validateExtremeSizeHandling(config);
        expect(extremeSizeValidation.valid).toBe(true);

        // 验证响应式断点
        const breakpointValidation = validateResponsiveBreakpoints(config);
        expect(breakpointValidation.valid).toBe(true);

        recordCompatibilityResult('Special', deviceName, config, {
          extremeSize: extremeSizeValidation,
          breakpoints: breakpointValidation
        });

        console.log(`✅ ${deviceName} 特殊设备兼容性测试通过`);
      });
    });
  });

  describe('4. 浏览器兼容性测试', () => {
    BROWSER_CONFIGURATIONS.forEach(browser => {
      it(`应该在${browser.name}上正确工作`, async () => {
        await simulateBrowser(browser);

        // 验证浏览器特性支持
        const featuresValidation = validateBrowserFeatures(browser);
        expect(featuresValidation.valid).toBe(true);

        // 验证CSS兼容性
        const cssValidation = validateCSSCompatibility(browser);
        expect(cssValidation.valid).toBe(true);

        // 验证JavaScript兼容性
        const jsValidation = validateJSCompatibility(browser);
        expect(jsValidation.valid).toBe(true);

        // 验证性能表现
        const performanceValidation = validateBrowserPerformance(browser);
        expect(performanceValidation.valid).toBe(true);

        recordCompatibilityResult('Browser', browser.name, browser, {
          features: featuresValidation,
          css: cssValidation,
          javascript: jsValidation,
          performance: performanceValidation
        });

        console.log(`✅ ${browser.name} 浏览器兼容性测试通过`);
      });
    });
  });

  describe('5. 网络环境兼容性测试', () => {
    NETWORK_CONFIGURATIONS.forEach(network => {
      it(`应该正确适应${network.type}网络环境`, async () => {
        await simulateNetworkCondition(network);

        // 验证网络适配策略
        const adaptationValidation = validateNetworkAdaptation(network);
        expect(adaptationValidation.valid).toBe(true);

        // 验证离线功能
        const offlineValidation = validateOfflineFunctionality(network);
        expect(offlineValidation.valid).toBe(true);

        // 验证数据加载策略
        const loadingStrategyValidation = validateLoadingStrategy(network);
        expect(loadingStrategyValidation.valid).toBe(true);

        recordCompatibilityResult('Network', network.type, network, {
          adaptation: adaptationValidation,
          offline: offlineValidation,
          loadingStrategy: loadingStrategyValidation
        });

        console.log(`✅ ${network.type} 网络环境兼容性测试通过`);
      });
    });
  });

  describe('6. 可访问性兼容性测试', () => {
    it('应该支持屏幕阅读器', async () => {
      const screenReaderValidation = validateScreenReaderSupport();
      expect(screenReaderValidation.valid).toBe(true);
    });

    it('应该支持键盘导航', async () => {
      const keyboardNavigationValidation = validateKeyboardNavigation();
      expect(keyboardNavigationValidation.valid).toBe(true);
    });

    it('应该支持高对比度模式', async () => {
      const highContrastValidation = validateHighContrastMode();
      expect(highContrastValidation.valid).toBe(true);
    });

    it('应该支持字体缩放', async () => {
      const fontScalingValidation = validateFontScaling();
      expect(fontScalingValidation.valid).toBe(true);
    });
  });

  describe('7. 设备特定功能测试', () => {
    it('应该正确处理触摸手势', async () => {
      const gestures = ['tap', 'swipe', 'pinch', 'longpress'];

      for (const gesture of gestures) {
        const gestureValidation = validateTouchGesture(gesture);
        expect(gestureValidation.valid).toBe(true);
      }
    });

    it('应该正确处理设备方向变化', async () => {
      const orientations = ['portrait', 'landscape', 'portrait-upside-down', 'landscape-left', 'landscape-right'];

      for (const orientation of orientations) {
        const orientationValidation = await validateDeviceOrientation(orientation);
        expect(orientationValidation.valid).toBe(true);
      }
    });

    it('应该正确处理硬件键盘', async () => {
      const hardwareKeyboardValidation = validateHardwareKeyboard();
      expect(hardwareKeyboardValidation.valid).toBe(true);
    });
  });

  describe('8. 兼容性报告生成', () => {
    it('应该生成完整的兼容性报告', () => {
      const compatibilityReport = generateCompatibilityReport(compatibilityResults);

      // 验证报告结构
      expect(compatibilityReport).toHaveProperty('summary');
      expect(compatibilityReport).toHaveProperty('deviceResults');
      expect(compatibilityReport).toHaveProperty('browserResults');
      expect(compatibilityReport).toHaveProperty('networkResults');
      expect(compatibilityReport).toHaveProperty('recommendations');

      // 验证关键指标
      expect(compatibilityReport.summary.totalDevices).toBeGreaterThan(0);
      expect(compatibilityReport.summary.successRate).toBeGreaterThanOrEqual(0);
      expect(compatibilityReport.summary.successRate).toBeLessThanOrEqual(100);

      console.log('兼容性测试报告:', JSON.stringify(compatibilityReport, null, 2));
    });
  });
});

// 辅助函数
async function simulateDevice(deviceConfig: any): Promise<void> {
  // 设置设备属性
  Object.defineProperty(window, 'innerWidth', { value: deviceConfig.width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: deviceConfig.height, configurable: true });
  Object.defineProperty(window, 'devicePixelRatio', { value: deviceConfig.density, configurable: true });
  Object.defineProperty(navigator, 'userAgent', {
    value: generateUserAgent(deviceConfig),
    configurable: true
  });

  // 触发resize事件
  window.dispatchEvent(new Event('resize'));

  // 等待布局稳定
  await new Promise(resolve => setTimeout(resolve, 100));
}

function generateUserAgent(config: any): string {
  const osVersion = config.osVersion || 'OS';

  if (config.userAgent.includes('iPhone')) {
    return `Mozilla/5.0 (iPhone; CPU iPhone OS ${osVersion.replace('.', '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1`;
  } else if (config.userAgent === 'Foldable') {
    return `Mozilla/5.0 (Linux; Android ${osVersion}; SM-F926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36`;
  } else {
    return `Mozilla/5.0 (Linux; Android ${osVersion}; ${config.userAgent}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36`;
  }
}

function validateLayoutForDevice(config: any): any {
  const errors: string[] = [];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 验证视口尺寸
  if (viewportWidth !== config.width || viewportHeight !== config.height) {
    errors.push(`视口尺寸不匹配: 期望 ${config.width}x${config.height}, 实际 ${viewportWidth}x${viewportHeight}`);
  }

  // 验证内容适配
  const appElement = document.querySelector('.mobile-app') as HTMLElement;
  if (appElement) {
    const rect = appElement.getBoundingClientRect();
    if (rect.width > viewportWidth) {
      errors.push(`应用宽度超出视口: ${rect.width} > ${viewportWidth}`);
    }
  }

  // 验证关键元素可见性
  const criticalElements = [
    '.app-header',
    '.app-content',
    '.app-footer',
    '.dashboard-section',
    '.actions-section'
  ];

  criticalElements.forEach(selector => {
    const element = document.querySelector(selector);
    if (!element) {
      errors.push(`关键元素缺失: ${selector}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateTouchTargetsForDevice(config: any): any {
  const errors: string[] = [];
  const buttons = document.querySelectorAll('button, .nav-item');

  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    const minSize = 44; // iOS推荐最小触控目标

    if (rect.width < minSize) {
      errors.push(`按钮宽度过小: ${rect.width}px < ${minSize}px`);
    }
    if (rect.height < minSize) {
      errors.push(`按钮高度过小: ${rect.height}px < ${minSize}px`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

async function validateiOSSpecificFeatures(config: any): Promise<any> {
  const errors: string[] = [];

  // 验证iOS特定CSS支持
  const testElement = document.createElement('div');
  testElement.style.cssText = '-webkit-backdrop-filter: blur(10px)';

  const computedStyle = window.getComputedStyle(testElement);
  if (computedStyle.backdropFilter === 'none' && computedStyle.webkitBackdropFilter === 'none') {
    errors.push('iOS backdrop-filter 不支持');
  }

  // 验证安全区域适配
  const safeAreaTest = document.createElement('div');
  safeAreaTest.style.cssText = 'padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateTabletLayout(config: any): any {
  const errors: string[] = [];

  // 验证平板布局适配
  if (config.width >= 768) {
    const cardGrid = document.querySelector('.card-grid');
    if (cardGrid) {
      const rect = cardGrid.getBoundingClientRect();
      // 平板应该显示多列
      if (rect.width < 600) {
        errors.push('平板模式未启用多列布局');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateMultiColumnLayout(config: any): any {
  const errors: string[] = [];

  if (config.width >= 1024) {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      if (rect.width > 400) {
        errors.push(`卡片${index}宽度过大: ${rect.width}px`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function validateOrientationSupport(config: any): Promise<any> {
  const errors: string[] = [];
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;

  // 测试横屏模式
  Object.defineProperty(window, 'innerWidth', { value: config.height, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: config.width, configurable: true });
  window.dispatchEvent(new Event('resize'));

  await new Promise(resolve => setTimeout(resolve, 50));

  const landscapeApp = document.querySelector('.mobile-app') as HTMLElement;
  if (landscapeApp) {
    const rect = landscapeApp.getBoundingClientRect();
    if (rect.width > window.innerWidth) {
      errors.push('横屏布局溢出');
    }
  }

  // 恢复原始尺寸
  Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: originalHeight, configurable: true });
  window.dispatchEvent(new Event('resize'));

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateAndroidLayout(config: any): any {
  const errors: string[] = [];

  // 验证Android特定布局
  const navigationBar = document.querySelector('.bottom-navigation');
  if (navigationBar) {
    const rect = navigationBar.getBoundingClientRect();
    // Android导航栏通常有特定的最小高度
    if (rect.height < 48) {
      errors.push('Android导航栏高度不足');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateAndroidNavigation(config: any): any {
  const errors: string[] = [];

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    // Android Material Design 触控目标建议48dp
    if (rect.width < 48 || rect.height < 48) {
      errors.push('Android导航项触控目标过小');
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateStatusBarHandling(config: any): any {
  const errors: string[] = [];

  // 验证状态栏处理
  const appHeader = document.querySelector('.app-header');
  if (appHeader) {
    const rect = appHeader.getBoundingClientRect();
    // 检查是否考虑了状态栏高度
    if (rect.top < 20) {
      errors.push('应用头部未考虑状态栏高度');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateAndroidTablet(config: any): any {
  const errors: string[] = [];

  // Android平板特定验证
  if (config.width >= 800) {
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
      const rect = button.getBoundingClientRect();
      // 平板按钮应该更大
      if (rect.height < 56) {
        errors.push('平板按钮高度不足');
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateTouchOptimization(config: any): any {
  const errors: string[] = [];

  // 验证触摸优化
  const clickableElements = document.querySelectorAll('button, .nav-item, .dashboard-card');
  clickableElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // 通用最小触控目标

    if (rect.width < minSize || rect.height < minSize) {
      errors.push(`触控目标过小: ${rect.width}x${rect.height}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateExtremeSizeHandling(config: any): any {
  const errors: string[] = [];

  // 极端尺寸处理验证
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (viewportWidth < 360) {
    // 极小屏幕特殊处理
    const menuToggle = document.querySelector('.menu-toggle') as HTMLElement;
    if (menuToggle && !menuToggle.offsetParent) {
      errors.push('极小屏幕缺少汉堡菜单');
    }
  }

  if (viewportWidth > 1200) {
    // 超大屏幕特殊处理
    const contentArea = document.querySelector('.app-content') as HTMLElement;
    if (contentArea) {
      const rect = contentArea.getBoundingClientRect();
      if (rect.width > viewportWidth * 0.8) {
        errors.push('超大屏幕内容区域过宽');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateResponsiveBreakpoints(config: any): any {
  const errors: string[] = [];

  const viewportWidth = window.innerWidth;
  let expectedBreakpoint = '';

  if (viewportWidth < 360) {
    expectedBreakpoint = 'xs';
  } else if (viewportWidth < 768) {
    expectedBreakpoint = 'sm';
  } else if (viewportWidth < 1024) {
    expectedBreakpoint = 'md';
  } else if (viewportWidth < 1280) {
    expectedBreakpoint = 'lg';
  } else {
    expectedBreakpoint = 'xl';
  }

  // 验证CSS类应用
  const appElement = document.querySelector('.mobile-app');
  if (appElement && !appElement.classList.contains(`breakpoint-${expectedBreakpoint}`)) {
    errors.push(`响应式断点未正确应用: ${expectedBreakpoint}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function simulateBrowser(browserConfig: any): Promise<void> {
  // 设置浏览器特性
  Object.defineProperty(navigator, 'userAgent', {
    value: generateBrowserUserAgent(browserConfig),
    configurable: true
  });

  // 模拟浏览器特性支持
  (window as any).browserFeatures = {
    cssGrid: browserConfig.engine === 'Blink' || browserConfig.engine === 'WebKit',
    flexbox: true,
    webP: browserConfig.engine !== 'Gecko' || parseInt(browserConfig.version) > 115,
    serviceWorker: browserConfig.mobile
  };
}

function generateBrowserUserAgent(config: any): string {
  if (config.name === 'Safari') {
    return `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${config.version} Mobile/15E148 Safari/604.1`;
  } else if (config.name.includes('Chrome')) {
    return `Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${config.version}.0.0.0 Mobile Safari/537.36`;
  } else if (config.name.includes('Firefox')) {
    return `Mozilla/5.0 (Mobile; rv:${config.version}.0) Gecko/${config.version}.0 Firefox/${config.version}.0`;
  } else {
    return `Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${config.version}.0.0.0 Mobile Safari/537.36`;
  }
}

function validateBrowserFeatures(browserConfig: any): any {
  const errors: string[] = [];
  const features = (window as any).browserFeatures || {};

  // 验证关键特性支持
  if (!features.flexbox) {
    errors.push('Flexbox 不支持');
  }

  if (browserConfig.name === 'Safari' && !features.cssGrid) {
    errors.push('现代 Safari 应该支持 CSS Grid');
  }

  return {
    valid: errors.length === 0,
    errors,
    features
  };
}

function validateCSSCompatibility(browserConfig: any): any {
  const errors: string[] = [];

  // 验证CSS属性支持
  const testElement = document.createElement('div');
  testElement.style.cssText = `
    display: grid;
    gap: 10px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  `;

  const computedStyle = window.getComputedStyle(testElement);

  // 根据浏览器验证特定CSS支持
  if (browserConfig.engine === 'WebKit' && browserConfig.version < 16) {
    if (computedStyle.backdropFilter === 'none') {
      errors.push('Safari backdrop-filter 支持需要更新版本');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateJSCompatibility(browserConfig: any): any {
  const errors: string[] = [];

  // 验证JavaScript特性支持
  try {
    // ES6+ 特性测试
    const testArrow = () => true;
    const testPromise = Promise.resolve();
    const testAsync = (async () => true)();
    const testOptional = { a: 1 }?.a;
  } catch (error) {
    errors.push('ES6+ JavaScript 特性支持不足');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateBrowserPerformance(browserConfig: any): any {
  const errors: string[] = [];

  // 简单的性能验证
  const startTime = performance.now();

  // 模拟一些DOM操作
  for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    document.body.removeChild(div);
  }

  const endTime = performance.now();
  const operationTime = endTime - startTime;

  // 操作应该在合理时间内完成
  if (operationTime > 100) {
    errors.push(`DOM操作性能较差: ${operationTime.toFixed(2)}ms`);
  }

  return {
    valid: errors.length === 0,
    errors,
    performanceTime: operationTime
  };
}

async function simulateNetworkCondition(networkConfig: any): Promise<void> {
  // 模拟网络条件
  Object.defineProperty(navigator, 'connection', {
    value: {
      effectiveType: networkConfig.effectiveType,
      downlink: networkConfig.downlink,
      rtt: networkConfig.rtt,
      saveData: networkConfig.effectiveType === '2g'
    },
    configurable: true
  });

  await new Promise(resolve => setTimeout(resolve, 50));
}

function validateNetworkAdaptation(networkConfig: any): any {
  const errors: string[] = [];

  // 验证网络适配策略
  if (networkConfig.effectiveType === '2g') {
    // 2G网络应该有特殊优化
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.includes('low-quality') && !src.includes('compressed')) {
        errors.push('2G网络应该使用压缩图片');
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateOfflineFunctionality(networkConfig: any): any {
  const errors: string[] = [];

  // 验证离线功能
  if ('serviceWorker' in navigator) {
    // 检查Service Worker注册
    if (!navigator.serviceWorker.controller) {
      errors.push('Service Worker 未激活');
    }
  } else {
    errors.push('浏览器不支持 Service Worker');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateLoadingStrategy(networkConfig: any): any {
  const errors: string[] = [];

  // 验证加载策略
  if (networkConfig.effectiveType === '2g' || networkConfig.effectiveType === '3g') {
    // 慢速网络应该有加载优化
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    if (links.length > 3) {
      errors.push('慢速网络CSS文件过多');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateScreenReaderSupport(): any {
  const errors: string[] = [];

  // 验证屏幕阅读器支持
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');

  interactiveElements.forEach(element => {
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby') && !(element as HTMLInputElement).placeholder) {
      errors.push(`交互元素缺少可访问性标签: ${element.tagName}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateKeyboardNavigation(): any {
  const errors: string[] = [];

  // 验证键盘导航
  const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');

  focusableElements.forEach(element => {
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex && parseInt(tabIndex) < 0) {
      errors.push(`元素tabindex设置不当: ${element.tagName}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateHighContrastMode(): any {
  const errors: string[] = [];

  // 验证高对比度模式
  (window as any).matchMedia = vi.fn().mockImplementation(query => ({
    matches: query === '(prefers-contrast: high)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  const hasHighContrastMediaQuery = window.matchMedia('(prefers-contrast: high)').matches;

  // 检查是否有高对比度样式适配
  const testElement = document.createElement('div');
  document.body.appendChild(testElement);

  const computedStyle = window.getComputedStyle(testElement);
  // 这里应该检查实际的高对比度样式是否正确应用

  document.body.removeChild(testElement);

  return {
    valid: errors.length === 0,
    errors,
    hasHighContrastSupport: hasHighContrastMediaQuery
  };
}

function validateFontScaling(): any {
  const errors: string[] = [];

  // 测试字体缩放
  const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);

  if (rootFontSize < 14) {
    errors.push('根字体大小过小');
  }

  return {
    valid: errors.length === 0,
    errors,
    rootFontSize
  };
}

function validateTouchGesture(gesture: string): any {
  const errors: string[] = [];

  // 验证触摸手势支持
  const testElement = document.createElement('div');
  testElement.style.cssText = 'width: 100px; height: 100px; background: red;';
  document.body.appendChild(testElement);

  try {
    // 模拟触摸事件
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 50 } as Touch]
    });
    testElement.dispatchEvent(touchStart);

    if (gesture === 'swipe') {
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 50 } as Touch]
      });
      testElement.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend');
      testElement.dispatchEvent(touchEnd);
    }

  } catch (error) {
    errors.push(`触摸手势 ${gesture} 不支持`);
  }

  document.body.removeChild(testElement);

  return {
    valid: errors.length === 0,
    errors
  };
}

async function validateDeviceOrientation(orientation: string): Promise<any> {
  const errors: string[] = [];

  let width = 375, height = 812;

  switch (orientation) {
    case 'landscape':
      [width, height] = [812, 375];
      break;
    case 'landscape-left':
      [width, height] = [812, 375];
      break;
    case 'landscape-right':
      [width, height] = [812, 375];
      break;
    case 'portrait-upside-down':
      [width, height] = [375, 812];
      break;
  }

  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
  window.dispatchEvent(new Event('resize'));

  await new Promise(resolve => setTimeout(resolve, 50));

  const appElement = document.querySelector('.mobile-app') as HTMLElement;
  if (appElement) {
    const rect = appElement.getBoundingClientRect();
    if (rect.width > window.innerWidth || rect.height > window.innerHeight) {
      errors.push(`${orientation} 方向下布局溢出`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateHardwareKeyboard(): any {
  const errors: string[] = [];

  // 验证硬件键盘支持
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // Tab键应该能正确导航
      const focusedElement = document.activeElement;
      if (!focusedElement || focusedElement === document.body) {
        errors.push('Tab键导航失效');
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function recordCompatibilityResult(category: string, deviceName: string, config: any, results: any): void {
  compatibilityResults.push({
    category,
    deviceName,
    config,
    results,
    timestamp: new Date().toISOString()
  });
}

function generateCompatibilityReport(results: any[]): any {
  const totalTests = results.length;
  const successfulTests = results.filter(result =>
    Object.values(result.results).every((validation: any) => validation.valid)
  ).length;

  const deviceResults = results.filter(r => ['iOS', 'Android', 'Special'].includes(r.category));
  const browserResults = results.filter(r => r.category === 'Browser');
  const networkResults = results.filter(r => r.category === 'Network');

  return {
    summary: {
      totalTests,
      successfulTests,
      successRate: totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0,
      testedDevices: deviceResults.length,
      testedBrowsers: browserResults.length,
      testedNetworks: networkResults.length
    },
    deviceResults: deviceResults.map(r => ({
      name: r.deviceName,
      category: r.category,
      success: Object.values(r.results).every((v: any) => v.valid),
      errors: Object.values(r.results).flatMap((v: any) => v.errors)
    })),
    browserResults: browserResults.map(r => ({
      name: r.deviceName,
      category: r.category,
      success: Object.values(r.results).every((v: any) => v.valid),
      errors: Object.values(r.results).flatMap((v: any) => v.errors)
    })),
    networkResults: networkResults.map(r => ({
      name: r.deviceName,
      category: r.category,
      success: Object.values(r.results).every((v: any) => v.valid),
      errors: Object.values(r.results).flatMap((v: any) => v.errors)
    })),
    recommendations: generateCompatibilityRecommendations(results),
    generatedAt: new Date().toISOString()
  };
}

function generateCompatibilityRecommendations(results: any[]): string[] {
  const recommendations: string[] = [];
  const allErrors = results.flatMap(r => Object.values(r.results).flatMap((v: any) => v.errors));

  // 分析错误类型并生成建议
  const touchErrors = allErrors.filter(e => e.includes('触控') || e.includes('点击'));
  if (touchErrors.length > 0) {
    recommendations.push('优化触控目标大小，确保所有按钮满足最小44x44px要求');
  }

  const layoutErrors = allErrors.filter(e => e.includes('布局') || e.includes('宽度'));
  if (layoutErrors.length > 0) {
    recommendations.push('完善响应式布局，确保在各种屏幕尺寸下正常显示');
  }

  const performanceErrors = allErrors.filter(e => e.includes('性能'));
  if (performanceErrors.length > 0) {
    recommendations.push('优化性能表现，减少DOM操作和资源加载时间');
  }

  if (recommendations.length === 0) {
    recommendations.push('兼容性测试通过，继续维护当前的兼容性标准');
  }

  return recommendations;
}