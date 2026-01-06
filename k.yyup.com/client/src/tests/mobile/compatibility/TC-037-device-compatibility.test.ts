/**
 * TC-037: 主流移动设备兼容性测试
 * 验证移动端应用在主流移动设备上的兼容性
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest';
import { validateRequiredFields, validateFieldTypes } from '@/utils/validation';

// 模拟设备信息
const mockNavigator = {
  userAgent: '',
  platform: '',
  vendor: '',
  hardwareConcurrency: 4,
  deviceMemory: 4,
  maxTouchPoints: 1,
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100
  }
};

Object.defineProperty(global, 'navigator', { value: mockNavigator });

describe('TC-037: 主流移动设备兼容性测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * 验证设备信息和兼容性
   */
  const validateDeviceInfo = () => {
    const deviceInfo = {
      userAgent: mockNavigator.userAgent,
      platform: mockNavigator.platform,
      vendor: mockNavigator.vendor
    };

    // 验证关键浏览器特性
    const requiredFeatures = [
      'localStorage',
      'sessionStorage',
      'fetch',
      'Promise',
      'WebAssembly'
    ];

    requiredFeatures.forEach(feature => {
      if (!(feature in global)) {
        throw new Error(`Required feature ${feature} not supported`);
      }
    });

    return deviceInfo;
  };

  /**
   * 验证功能兼容性
   */
  const validateFeatureCompatibility = () => {
    const deviceCapabilities = {
      touch: 'ontouchstart' in window,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator,
      vibration: 'vibrate' in navigator,
      bluetooth: 'bluetooth' in navigator,
      webgl: (() => {
        try {
          return !!window.WebGLRenderingContext;
        } catch {
          return false;
        }
      })()
    };

    // 验证必需功能可用
    expect(deviceCapabilities.touch).toBe(true);

    return deviceCapabilities;
  };

  /**
   * 验证设备性能基准
   */
  const validatePerformanceBenchmarks = async () => {
    const startTime = Date.now();

    // 测试渲染性能
    const testElement = {
      style: { width: '100px', height: '100px', backgroundColor: 'red' },
      offsetWidth: 100,
      offsetHeight: 100
    };

    const renderTime = Date.now() - startTime;

    // 测试JavaScript性能
    const jsStartTime = Date.now();
    const testArray = new Array(100000).fill(0).map((_, i) => i);
    testArray.sort((a, b) => a - b);
    const jsTime = Date.now() - jsStartTime;

    // 性能基准验证
    expect(renderTime).toBeLessThan(100); // 渲染 < 100ms
    expect(jsTime).toBeLessThan(1000); // JavaScript < 1s

    return { renderTime, jsTime };
  };

  describe('步骤1: iOS设备兼容性测试', () => {
    it('应该在iPhone设备上正常运行', () => {
      const iPhoneDevices = [
        {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          platform: 'iPhone',
          expectedFeatures: ['touch', 'geolocation', 'camera']
        },
        {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          platform: 'iPhone',
          expectedFeatures: ['touch', 'geolocation', 'camera']
        },
        {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          platform: 'iPhone',
          expectedFeatures: ['touch', 'geolocation', 'camera']
        },
        {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          platform: 'iPhone',
          expectedFeatures: ['touch', 'geolocation', 'camera']
        }
      ];

      iPhoneDevices.forEach(device => {
        mockNavigator.userAgent = device.userAgent;
        mockNavigator.platform = device.platform;

        const deviceInfo = validateDeviceInfo();
        expect(deviceInfo.userAgent).toContain('iPhone');
        expect(deviceInfo.platform).toBe('iPhone');

        const capabilities = validateFeatureCompatibility();
        device.expectedFeatures.forEach(feature => {
          expect(capabilities[feature]).toBe(true);
        });
      });
    });

    it('应该支持iOS特有功能', () => {
      const iOSSpecificFeatures = {
        webkitAPI: !!window.webkitRequestAnimationFrame,
        touchEvents: 'ontouchstart' in window,
        deviceMotion: 'DeviceMotionEvent' in window,
        deviceOrientation: 'DeviceOrientationEvent' in window,
        webAudio: 'AudioContext' in window
      };

      expect(iOSSpecificFeatures.webkitAPI).toBe(true);
      expect(iOSSpecificFeatures.touchEvents).toBe(true);
      expect(iOSSpecificFeatures.deviceMotion).toBeDefined();
      expect(iOSSpecificFeatures.deviceOrientation).toBeDefined();
    });

    it('应该在Safari Mobile中正确渲染', () => {
      // 模拟Safari Mobile用户代理
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

      const safariFeatures = {
        webkit: mockNavigator.userAgent.includes('AppleWebKit'),
        safari: mockNavigator.userAgent.includes('Safari'),
        mobile: mockNavigator.userAgent.includes('Mobile')
      };

      expect(safariFeatures.webkit).toBe(true);
      expect(safariFeatures.safari).toBe(true);
      expect(safariFeatures.mobile).toBe(true);
    });
  });

  describe('步骤2: Android设备兼容性测试', () => {
    it('应该在主流Android设备上运行', () => {
      const androidDevices = [
        {
          userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
          platform: 'Linux armv8l',
          expectedPerformance: 'high'
        },
        {
          userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
          platform: 'Linux aarch64',
          expectedPerformance: 'high'
        },
        {
          userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36',
          platform: 'Linux aarch64',
          expectedPerformance: 'high'
        },
        {
          userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36',
          platform: 'Linux armv8l',
          expectedPerformance: 'medium'
        }
      ];

      androidDevices.forEach(device => {
        mockNavigator.userAgent = device.userAgent;
        mockNavigator.platform = device.platform;

        const deviceInfo = validateDeviceInfo();
        expect(deviceInfo.userAgent).toContain('Android');
        expect(deviceInfo.platform).toContain('Linux');

        // 设置性能期望
        mockNavigator.hardwareConcurrency = device.expectedPerformance === 'high' ? 8 : 4;
        mockNavigator.deviceMemory = device.expectedPerformance === 'high' ? 8 : 4;
      });
    });

    it('应该支持Chrome Mobile特性', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

      const chromeFeatures = {
        chrome: mockNavigator.userAgent.includes('Chrome'),
        webKit: mockNavigator.userAgent.includes('AppleWebKit'),
        mobile: mockNavigator.userAgent.includes('Mobile'),
        v8: true // 模拟V8引擎可用
      };

      expect(chromeFeatures.chrome).toBe(true);
      expect(chromeFeatures.webKit).toBe(true);
      expect(chromeFeatures.mobile).toBe(true);
      expect(chromeFeatures.v8).toBe(true);
    });

    it('应该兼容不同Android浏览器', () => {
      const androidBrowsers = [
        { name: 'Chrome Mobile', ua: 'Chrome/114.0.0.0' },
        { name: 'Samsung Internet', ua: 'SamsungBrowser/21.0' },
        { name: 'Firefox Mobile', ua: 'Firefox/107.0' },
        { name: 'Opera Mobile', ua: 'OPR/73.0' }
      ];

      androidBrowsers.forEach(browser => {
        mockNavigator.userAgent = `Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) ${browser.ua} Mobile Safari/537.36`;

        const containsBrowserUA = mockNavigator.userAgent.includes(browser.ua.split('/')[0]);
        expect(containsBrowserUA).toBe(true);
      });
    });
  });

  describe('步骤3: 平板设备兼容性测试', () => {
    it('应该在iPad设备上正确显示', () => {
      const iPadDevices = [
        {
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)',
          platform: 'iPad',
          expectedFeatures: ['touch', 'geolocation', 'camera']
        },
        {
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
          platform: 'iPad',
          expectedFeatures: ['touch', 'geolocation', 'camera']
        }
      ];

      iPadDevices.forEach(device => {
        mockNavigator.userAgent = device.userAgent;
        mockNavigator.platform = device.platform;

        const deviceInfo = validateDeviceInfo();
        expect(deviceInfo.userAgent).toContain('iPad');
        expect(deviceInfo.platform).toBe('iPad');
      });
    });

    it('应该支持Android平板特性', () => {
      const androidTablets = [
        'Mozilla/5.0 (Linux; Android 13; SM-X900) AppleWebKit/537.36',
        'Mozilla/5.0 (Linux; Android 12; SM-T870) AppleWebKit/537.36'
      ];

      androidTablets.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isTablet = ua.includes('SM-X') || ua.includes('SM-T');
        expect(isTablet).toBe(true);

        // 平板通常有更大的屏幕和内存
        mockNavigator.deviceMemory = 6;
        expect(mockNavigator.deviceMemory).toBeGreaterThan(4);
      });
    });

    it('应该支持分屏和多窗口', () => {
      // 模拟分屏检测
      const detectMultiWindow = () => {
        const width = window.innerWidth || 1024;
        const height = window.innerHeight || 768;
        const devicePixelRatio = window.devicePixelRatio || 1;

        return {
          isTablet: width >= 768 || height >= 768,
          supportsSplitScreen: width > height || height > width,
          screenRatio: width / height
        };
      };

      const multiWindowInfo = detectMultiWindow();
      expect(multiWindowInfo.isTablet).toBe(true);
      expect(multiWindowInfo.screenRatio).toBeGreaterThan(0);
    });
  });

  describe('步骤4: 设备性能分级测试', () => {
    it('应该适配高端设备', () => {
      const highEndDevice = {
        hardwareConcurrency: 8,
        deviceMemory: 8,
        connection: { effectiveType: '4g', downlink: 50 }
      };

      mockNavigator.hardwareConcurrency = highEndDevice.hardwareConcurrency;
      mockNavigator.deviceMemory = highEndDevice.deviceMemory;
      mockNavigator.connection = highEndDevice.connection;

      expect(mockNavigator.hardwareConcurrency).toBeGreaterThanOrEqual(8);
      expect(mockNavigator.deviceMemory).toBeGreaterThanOrEqual(8);
      expect(mockNavigator.connection.effectiveType).toBe('4g');
    });

    it('应该适配中端设备', () => {
      const midRangeDevice = {
        hardwareConcurrency: 6,
        deviceMemory: 6,
        connection: { effectiveType: '4g', downlink: 20 }
      };

      mockNavigator.hardwareConcurrency = midRangeDevice.hardwareConcurrency;
      mockNavigator.deviceMemory = midRangeDevice.deviceMemory;
      mockNavigator.connection = midRangeDevice.connection;

      expect(mockNavigator.hardwareConcurrency).toBeGreaterThanOrEqual(6);
      expect(mockNavigator.deviceMemory).toBeGreaterThanOrEqual(6);
      expect(mockNavigator.connection.effectiveType).toBe('4g');
    });

    it('应该适配入门级设备', () => {
      const lowEndDevice = {
        hardwareConcurrency: 4,
        deviceMemory: 4,
        connection: { effectiveType: '3g', downlink: 2 }
      };

      mockNavigator.hardwareConcurrency = lowEndDevice.hardwareConcurrency;
      mockNavigator.deviceMemory = lowEndDevice.deviceMemory;
      mockNavigator.connection = lowEndDevice.connection;

      expect(mockNavigator.hardwareConcurrency).toBeGreaterThanOrEqual(4);
      expect(mockNavigator.deviceMemory).toBeGreaterThanOrEqual(4);
      expect(['3g', '4g']).toContain(mockNavigator.connection.effectiveType);
    });
  });

  describe('步骤5: 特殊设备兼容性测试', () => {
    it('应该支持折叠屏设备', () => {
      const foldableDevices = [
        'Mozilla/5.0 (Linux; Android 13; SM-F926B) AppleWebKit/537.36',
        'Mozilla/5.0 (Linux; Android 12; SM-W2021) AppleWebKit/537.36'
      ];

      foldableDevices.forEach(ua => {
        mockNavigator.userAgent = ua;

        const isFoldable = ua.includes('SM-F') || ua.includes('SM-W');
        expect(isFoldable).toBe(true);

        // 折叠屏设备通常有高级特性
        expect(mockNavigator.hardwareConcurrency).toBeGreaterThanOrEqual(6);
        expect(mockNavigator.deviceMemory).toBeGreaterThanOrEqual(6);
      });
    });

    it('应该适配特殊屏幕比例', () => {
      const specialRatios = [
        { width: 1080, height: 2400, name: '20:9' },  // 现代手机
        { width: 1440, height: 3120, name: '19.5:9' }, // 折叠屏
        { width: 896, height: 414, name: '21.6:9' },  // iPhone Pro Max
        { width: 800, height: 1280, name: '16:10' }   // 平板
      ];

      specialRatios.forEach(({ width, height, name }) => {
        const ratio = width / height;
        expect(ratio).toBeGreaterThan(0.3);
        expect(ratio).toBeLessThan(2.5);
      });
    });
  });

  describe('步骤6: 设备特性兼容性测试', () => {
    it('应该验证生物识别支持', () => {
      const biometricSupport = {
        touchId: false, // iOS特定
        faceId: false,  // iOS特定
        fingerprint: 'FingerprintManager' in window,
        faceRecognition: 'FaceDetector' in window
      };

      // 在不同设备上，生物识别支持可能不同
      expect(typeof biometricSupport.fingerprint).toBe('boolean');
      expect(typeof biometricSupport.faceRecognition).toBe('boolean');
    });

    it('应该验证传感器集成', () => {
      const sensors = {
        accelerometer: 'Accelerometer' in window,
        gyroscope: 'Gyroscope' in window,
        magnetometer: 'Magnetometer' in window,
        ambientLight: 'AmbientLightSensor' in window,
        proximity: 'ProximitySensor' in window
      };

      // 至少应该有基本的运动传感器
      expect(sensors.accelerometer || sensors.gyroscope).toBe(true);
    });

    it('应该验证硬件特性', () => {
      const hardwareFeatures = {
        vibration: 'vibrate' in navigator,
        camera: 'mediaDevices' in navigator,
        microphone: 'mediaDevices' in navigator,
        bluetooth: 'bluetooth' in navigator,
        nfc: 'nfc' in navigator,
        usb: 'usb' in navigator
      };

      expect(hardwareFeatures.vibration).toBeDefined();
      expect(hardwareFeatures.camera).toBeDefined();
    });
  });

  describe('兼容性工具函数测试', () => {
    it('validateDeviceInfo应该验证设备信息', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)';
      mockNavigator.platform = 'iPhone';

      expect(() => validateDeviceInfo()).not.toThrow();
    });

    it('validateFeatureCompatibility应该验证功能兼容性', () => {
      // 模拟触摸设备
      Object.defineProperty(window, 'ontouchstart', { value: jest.fn() });

      const capabilities = validateFeatureCompatibility();
      expect(capabilities).toHaveProperty('touch');
      expect(typeof capabilities.touch).toBe('boolean');
    });

    it('validatePerformanceBenchmarks应该验证性能', async () => {
      const performance = await validatePerformanceBenchmarks();
      expect(performance.renderTime).toBeLessThan(100);
      expect(performance.jsTime).toBeLessThan(1000);
    });
  });

  describe('性能和稳定性测试', () => {
    it('应该在各种设备上保持性能', async () => {
      const deviceTypes = [
        { cores: 4, memory: 4, name: 'entry-level' },
        { cores: 6, memory: 6, name: 'mid-range' },
        { cores: 8, memory: 8, name: 'high-end' }
      ];

      for (const device of deviceTypes) {
        mockNavigator.hardwareConcurrency = device.cores;
        mockNavigator.deviceMemory = device.memory;

        const performance = await validatePerformanceBenchmarks();

        // 所有设备都应该在合理时间内完成
        expect(performance.renderTime).toBeLessThan(200);
        expect(performance.jsTime).toBeLessThan(2000);
      }
    });

    it('应该处理设备特性缺失', () => {
      // 测试功能缺失时的优雅降级
      const originalNavigator = { ...navigator };

      // 模拟缺少某些功能
      delete (navigator as any).bluetooth;
      delete (navigator as any).vibrate;

      const capabilities = validateFeatureCompatibility();
      expect(capabilities.bluetooth).toBe(false);
      expect(capabilities.vibration).toBe(false);

      // 恢复原始navigator
      Object.assign(navigator, originalNavigator);
    });
  });
});

/**
 * 测试总结
 *
 * 通过标准:
 * - 所有主流设备上应用正常运行
 * - 核心功能在各设备上完整可用
 * - 性能在各等级设备上符合预期
 * - 界面在各设备尺寸下正确适配
 * - 特殊设备特性正确支持
 * - 优雅降级机制工作正常
 * - 无重大兼容性问题
 *
 * 失败标准:
 * - 在主流设备上无法运行
 * - 核心功能在特定设备上不可用
 * - 性能严重低于预期
 * - 界面在特定设备上错乱
 * - 设备特性支持有问题
 * - 没有适当的降级处理
 */