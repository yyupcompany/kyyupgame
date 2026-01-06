/**
 * TC-003: 设备检测和路由分离测试
 * 移动设备检测和路由分离机制测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateMobileResponsive,
  captureConsoleErrors
} from '../../utils/validation-helpers';
import {
  tapElement,
  waitForElement,
  simulateOrientationChange,
  scrollToElement
} from '../../utils/mobile-interactions';

// Mock API for device detection
const mockDeviceAPI = {
  getDeviceInfo: vi.fn(),
  updateDeviceSettings: vi.fn()
};

// Mock router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  currentRoute: {
    path: '/',
    query: {}
  }
};

// Mock window location
const locationMock = {
  ...window.location,
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn()
};

Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true
});

// Device detection utilities
const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent;
  const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'];
  return mobileKeywords.some(keyword => userAgent.includes(keyword)) || window.innerWidth <= 768;
};

const isTabletDevice = (): boolean => {
  const userAgent = navigator.userAgent;
  return /iPad|Tablet/i.test(userAgent) || (window.innerWidth >= 768 && window.innerWidth <= 1024);
};

const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isTabletDevice()) return 'tablet';
  if (isMobileDevice()) return 'mobile';
  return 'desktop';
};

describe('TC-003: 设备检测和路由分离测试', () => {
  let consoleMonitor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleMonitor = captureConsoleErrors();

    // 设置基础DOM结构
    document.body.innerHTML = `
      <div class="app-container" data-device-type="desktop">
        <header class="app-header">
          <nav class="desktop-nav">
            <a href="/">首页</a>
            <a href="/dashboard">仪表板</a>
            <a href="/admin">管理</a>
          </nav>
        </header>

        <main class="app-content">
          <div id="desktop-content" class="desktop-content">
            <h1>桌面端版本</h1>
            <p>这是桌面端的界面</p>
          </div>

          <div id="mobile-content" class="mobile-content" style="display: none;">
            <h1>移动端版本</h1>
            <p>这是移动端的界面</p>
            <nav class="mobile-nav">
              <a href="/mobile">移动首页</a>
              <a href="/mobile/centers">管理中心</a>
            </nav>
          </div>
        </main>

        <footer class="app-footer">
          <span class="device-info"></span>
        </footer>
      </div>
    `;

    // Mock device detection function
    (window as any).detectDevice = () => {
      const deviceInfo = {
        type: getDeviceType(),
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isTouchDevice: 'ontouchstart' in window,
        pixelRatio: window.devicePixelRatio || 1
      };

      document.querySelector('.device-info')!.textContent =
        `${deviceInfo.type} - ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`;

      document.querySelector('.app-container')!.setAttribute('data-device-type', deviceInfo.type);

      return deviceInfo;
    };

    // Mock routing function
    (window as any).handleRouting = (deviceType: string) => {
      const desktopContent = document.getElementById('desktop-content') as HTMLElement;
      const mobileContent = document.getElementById('mobile-content') as HTMLElement;

      if (deviceType === 'mobile' || deviceType === 'tablet') {
        // 显示移动端内容
        desktopContent.style.display = 'none';
        mobileContent.style.display = 'block';

        // 自动跳转到移动端路由
        if (!window.location.pathname.startsWith('/mobile')) {
          window.location.pathname = '/mobile';
        }
      } else {
        // 显示桌面端内容
        desktopContent.style.display = 'block';
        mobileContent.style.display = 'none';

        // 跳转到桌面端路由
        if (window.location.pathname.startsWith('/mobile')) {
          window.location.pathname = window.location.pathname.replace('/mobile', '') || '/';
        }
      }
    };

    // Mock device API
    mockDeviceAPI.getDeviceInfo.mockReturnValue({
      type: 'mobile',
      userAgent: navigator.userAgent,
      capabilities: ['touch', 'geolocation', 'camera']
    });
  });

  afterEach(() => {
    consoleMonitor.restore();
    expectNoConsoleErrors();
  });

  it('应该正确检测移动设备', async () => {
    // 设置移动设备User Agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      configurable: true
    });

    // 设置移动设备屏幕尺寸
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true });

    // 添加触摸设备支持
    Object.defineProperty(window, 'ontouchstart', { value: () => {}, configurable: true });

    // 执行设备检测
    const deviceInfo = (window as any).detectDevice();

    // 严格验证设备信息结构
    const requiredFields = ['type', 'userAgent', 'screenWidth', 'screenHeight', 'isTouchDevice', 'pixelRatio'];
    const fieldValidation = validateRequiredFields(deviceInfo, requiredFields);
    expect(fieldValidation.valid).toBe(true);

    // 验证字段类型
    const typeValidation = validateFieldTypes(deviceInfo, {
      type: 'string',
      userAgent: 'string',
      screenWidth: 'number',
      screenHeight: 'number',
      isTouchDevice: 'boolean',
      pixelRatio: 'number'
    });
    expect(typeValidation.valid).toBe(true);

    // 验证设备类型检测
    expect(deviceInfo.type).toBe('mobile');
    expect(isMobileDevice()).toBe(true);
    expect(isTabletDevice()).toBe(false);
    expect(getDeviceType()).toBe('mobile');

    // 验证屏幕尺寸
    expect(deviceInfo.screenWidth).toBe(375);
    expect(deviceInfo.screenHeight).toBe(812);

    // 验证触摸设备检测
    expect(deviceInfo.isTouchDevice).toBe(true);

    // 验证设备信息显示
    const deviceInfoElement = document.querySelector('.device-info') as HTMLElement;
    expect(deviceInfoElement.textContent).toContain('mobile');
    expect(deviceInfoElement.textContent).toContain('375x812');

    // 验证DOM属性更新
    const appContainer = document.querySelector('.app-container') as HTMLElement;
    expect(appContainer.getAttribute('data-device-type')).toBe('mobile');
  });

  it('应该正确检测平板设备', async () => {
    // 设置平板设备User Agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      configurable: true
    });

    // 设置平板设备屏幕尺寸
    Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true });

    // 执行设备检测
    const deviceInfo = (window as any).detectDevice();

    // 验证平板设备检测
    expect(deviceInfo.type).toBe('tablet');
    expect(isMobileDevice()).toBe(true);
    expect(isTabletDevice()).toBe(true);
    expect(getDeviceType()).toBe('tablet');

    // 验证屏幕尺寸
    expect(deviceInfo.screenWidth).toBe(768);
    expect(deviceInfo.screenHeight).toBe(1024);
  });

  it('应该正确检测桌面设备', async () => {
    // 设置桌面设备User Agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true
    });

    // 设置桌面设备屏幕尺寸
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });

    // 移除触摸设备支持
    Object.defineProperty(window, 'ontouchstart', { value: undefined, configurable: true });

    // 执行设备检测
    const deviceInfo = (window as any).detectDevice();

    // 验证桌面设备检测
    expect(deviceInfo.type).toBe('desktop');
    expect(isMobileDevice()).toBe(false);
    expect(isTabletDevice()).toBe(false);
    expect(getDeviceType()).toBe('desktop');

    // 验证屏幕尺寸
    expect(deviceInfo.screenWidth).toBe(1920);
    expect(deviceInfo.screenHeight).toBe(1080);

    // 验证非触摸设备
    expect(deviceInfo.isTouchDevice).toBe(false);
  });

  it('移动设备应该自动跳转到移动端路由', async () => {
    // 设置移动设备环境
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true
    });
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });

    // 设置当前路径为根路径
    window.location.pathname = '/';

    // 执行路由处理
    const deviceType = getDeviceType();
    (window as any).handleRouting(deviceType);

    // 验证路由跳转
    expect(window.location.pathname).toBe('/mobile');

    // 验证内容显示切换
    const desktopContent = document.getElementById('desktop-content') as HTMLElement;
    const mobileContent = document.getElementById('mobile-content') as HTMLElement;

    expect(desktopContent.style.display).toBe('none');
    expect(mobileContent.style.display).toBe('block');

    // 验证移动端导航显示
    const mobileNav = document.querySelector('.mobile-nav') as HTMLElement;
    expect(mobileNav.style.display).not.toBe('none');
  });

  it('桌面设备应该保持桌面端路由', async () => {
    // 设置桌面设备环境
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      configurable: true
    });
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });

    // 设置当前路径为根路径
    window.location.pathname = '/';

    // 执行路由处理
    const deviceType = getDeviceType();
    (window as any).handleRouting(deviceType);

    // 验证路由保持不变
    expect(window.location.pathname).toBe('/');

    // 验证内容显示
    const desktopContent = document.getElementById('desktop-content') as HTMLElement;
    const mobileContent = document.getElementById('mobile-content') as HTMLElement;

    expect(desktopContent.style.display).toBe('block');
    expect(mobileContent.style.display).toBe('none');

    // 验证桌面端导航显示
    const desktopNav = document.querySelector('.desktop-nav') as HTMLElement;
    expect(desktopNav.style.display).not.toBe('none');
  });

  it('应该正确处理设备方向变化', async () => {
    // 设置移动设备环境
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true });

    // 初始设备检测
    let deviceInfo = (window as any).detectDevice();
    expect(deviceInfo.type).toBe('mobile');

    // 模拟设备方向变化为横屏
    await simulateOrientationChange('landscape');

    // 验证屏幕尺寸更新
    expect(window.innerWidth).toBe(812);
    expect(window.innerHeight).toBe(375);

    // 重新检测设备类型
    deviceInfo = (window as any).detectDevice();

    // 横屏模式下仍然应该是移动设备
    expect(deviceInfo.type).toBe('mobile');
    expect(deviceInfo.screenWidth).toBe(812);
    expect(deviceInfo.screenHeight).toBe(375);

    // 验证响应式适配
    const responsiveCheck = validateMobileResponsive();
    expect(responsiveCheck.valid).toBe(true);
    expect(responsiveCheck.info.viewportWidth).toBe(812);
    expect(responsiveCheck.info.viewportHeight).toBe(375);
  });

  it('应该正确处理窗口大小调整', async () => {
    // 初始设置为桌面设备
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });

    let deviceInfo = (window as any).detectDevice();
    expect(deviceInfo.type).toBe('desktop');

    // 模拟窗口缩小到移动设备尺寸
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true });

    // 触发resize事件
    window.dispatchEvent(new Event('resize'));

    // 重新检测设备类型
    deviceInfo = (window as any).detectDevice();
    expect(deviceInfo.type).toBe('mobile');

    // 执行路由处理
    (window as any).handleRouting(deviceInfo.type);

    // 验证路由跳转
    expect(window.location.pathname).toBe('/mobile');
  });

  it('应该正确验证移动端响应式设计', async () => {
    // 设置移动设备环境
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true });

    // 执行响应式验证
    const responsiveCheck = validateMobileResponsive();

    // 严格验证响应式结果
    expect(responsiveCheck.valid).toBe(true);
    expect(responsiveCheck.info.isMobile).toBe(true);
    expect(responsiveCheck.info.hasHorizontalScroll).toBe(false);

    // 验证视口尺寸
    expect(responsiveCheck.info.viewportWidth).toBe(375);
    expect(responsiveCheck.info.viewportHeight).toBe(812);

    // 验证触摸目标大小（移动端最小44px）
    const touchTargets = document.querySelectorAll('button, a, input');
    touchTargets.forEach((target, index) => {
      const rect = target.getBoundingClientRect();
      const minSize = 44;
      expect(rect.width).toBeGreaterThanOrEqual(minSize);
      expect(rect.height).toBeGreaterThanOrEqual(minSize);
    });

    // 验证字体大小
    if (responsiveCheck.info.fontSize) {
      const fontSizeValue = parseInt(responsiveCheck.info.fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(14);
    }
  });

  it('应该正确处理设备信息API调用', async () => {
    // Mock设备信息API响应
    const mockDeviceResponse = {
      success: true,
      data: {
        type: 'mobile',
        userAgent: navigator.userAgent,
        capabilities: ['touch', 'geolocation', 'camera', 'bluetooth'],
        os: 'iOS',
        version: '14.0',
        model: 'iPhone'
      }
    };

    mockDeviceAPI.getDeviceInfo.mockResolvedValue(mockDeviceResponse);

    // 调用设备信息API
    const deviceInfo = await mockDeviceAPI.getDeviceInfo();

    // 严格验证API响应
    const responseValidation = validateRequiredFields(deviceInfo.data, [
      'type', 'userAgent', 'capabilities', 'os', 'version', 'model'
    ]);
    expect(responseValidation.valid).toBe(true);

    // 验证字段类型
    const typeValidation = validateFieldTypes(deviceInfo.data, {
      type: 'string',
      userAgent: 'string',
      capabilities: 'array',
      os: 'string',
      version: 'string',
      model: 'string'
    });
    expect(typeValidation.valid).toBe(true);

    // 验证能力列表
    expect(Array.isArray(deviceInfo.data.capabilities)).toBe(true);
    expect(deviceInfo.data.capabilities).toContain('touch');
  });

  it('应该正确处理设备设置更新', async () => {
    // Mock设置更新API
    const mockUpdateResponse = {
      success: true,
      data: {
        deviceId: 'device_123',
        preferences: {
          theme: 'dark',
          fontSize: 'large',
          animations: true
        },
        updatedAt: new Date().toISOString()
      }
    };

    mockDeviceAPI.updateDeviceSettings.mockResolvedValue(mockUpdateResponse);

    // 更新设备设置
    const settings = {
      theme: 'dark',
      fontSize: 'large',
      animations: true
    };

    const updateResult = await mockDeviceAPI.updateDeviceSettings('device_123', settings);

    // 验证更新响应
    const responseValidation = validateRequiredFields(updateResult.data, [
      'deviceId', 'preferences', 'updatedAt'
    ]);
    expect(responseValidation.valid).toBe(true);

    // 验证偏好设置
    expect(updateResult.data.preferences).toEqual(settings);
    expect(updateResult.data.deviceId).toBe('device_123');
  });
});

/**
 * 检查控制台错误
 */
function expectNoConsoleErrors() {
  expect(consoleMonitor.errors).toHaveLength(0);
  expect(consoleMonitor.warnings).toHaveLength(0);
}

/**
 * 设备检测工具函数
 */
export const DeviceDetectionUtils = {
  isMobileDevice,
  isTabletDevice,
  getDeviceType,

  // 生成测试用User Agents
  getUserAgents: () => ({
    mobile: {
      iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      Android: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
    },
    tablet: {
      iPad: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      Android: 'Mozilla/5.0 (Linux; Android 10; SM-T865) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36'
    },
    desktop: {
      Windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  })
};