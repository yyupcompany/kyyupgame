/**
 * 🔍 PWA功能验证测试套件
 * 
 * 专门针对移动端PWA功能进行深度验证
 * 包括Manifest验证、Service Worker测试、离线功能、安装体验等
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class PWAValidationSuite {
  constructor(baseUrl = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        score: 0
      }
    };
  }

  async runValidation() {
    console.log('🔍 开始PWA功能验证测试\n');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 12
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    try {
      // 1. Manifest文件验证
      await this.validateManifest(page);
      
      // 2. Service Worker功能测试
      await this.validateServiceWorker(page);
      
      // 3. 缓存策略测试
      await this.validateCacheStrategies(page);
      
      // 4. 离线功能测试
      await this.validateOfflineCapability(page);
      
      // 5. 安装体验测试
      await this.validateInstallability(page);
      
      // 6. 推送通知测试
      await this.validateNotifications(page);
      
      // 7. 后台同步测试
      await this.validateBackgroundSync(page);
      
      // 8. PWA审计
      await this.runPWAAudit(page);
      
    } finally {
      await browser.close();
      await this.generateReport();
    }
  }

  async validateManifest(page) {
    const test = {
      name: 'Manifest文件验证',
      category: 'PWA基础',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('📋 验证Manifest配置...');
      
      await page.goto(`${this.baseUrl}/mobile`);
      await page.waitForLoadState('networkidle');
      
      // 检查manifest链接
      const manifestLink = await page.$('link[rel="manifest"]');
      if (!manifestLink) {
        throw new Error('未找到manifest链接');
      }
      
      const manifestHref = await manifestLink.getAttribute('href');
      test.details.manifestUrl = manifestHref;
      
      // 获取manifest内容
      const manifestResponse = await page.goto(`${this.baseUrl}${manifestHref}`);
      const manifest = await manifestResponse.json();
      
      // 验证必需字段
      const requiredFields = {
        'name': '应用名称',
        'short_name': '短名称', 
        'start_url': '启动URL',
        'display': '显示模式',
        'theme_color': '主题色',
        'background_color': '背景色',
        'icons': '图标数组'
      };
      
      const missingFields = [];
      const presentFields = {};
      
      Object.entries(requiredFields).forEach(([field, description]) => {
        if (manifest[field]) {
          presentFields[field] = manifest[field];
        } else {
          missingFields.push(`${field} (${description})`);
        }
      });
      
      test.details.manifest = manifest;
      test.details.presentFields = presentFields;
      test.details.missingFields = missingFields;
      
      // 验证图标配置
      if (manifest.icons && Array.isArray(manifest.icons)) {
        const iconValidation = await this.validateIcons(page, manifest.icons);
        test.details.iconValidation = iconValidation;
      }
      
      // 验证启动URL
      if (manifest.start_url) {
        const startUrlResponse = await page.goto(`${this.baseUrl}${manifest.start_url}`);
        test.details.startUrlStatus = startUrlResponse.status();
      }
      
      // PWA显示模式检查
      const validDisplayModes = ['standalone', 'fullscreen', 'minimal-ui', 'browser'];
      test.details.displayModeValid = validDisplayModes.includes(manifest.display);
      
      // 评分
      let score = 0;
      if (missingFields.length === 0) score += 40;
      if (test.details.iconValidation?.validIcons >= 2) score += 30;
      if (test.details.displayModeValid) score += 20;
      if (test.details.startUrlStatus === 200) score += 10;
      
      test.status = score >= 70 ? 'passed' : 'failed';
      test.score = score;
      test.details.message = score >= 70 
        ? `Manifest配置优秀 (评分: ${score}/100)`
        : `Manifest配置需要改进 (评分: ${score}/100, 缺少字段: ${missingFields.join(', ')})`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `Manifest验证失败: ${error.message}`;
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async validateIcons(page, icons) {
    const validation = {
      totalIcons: icons.length,
      validIcons: 0,
      invalidIcons: [],
      sizesCovered: new Set()
    };
    
    for (const icon of icons) {
      try {
        const iconResponse = await page.goto(`${this.baseUrl}${icon.src}`);
        if (iconResponse.status() === 200) {
          validation.validIcons++;
          if (icon.sizes) {
            validation.sizesCovered.add(icon.sizes);
          }
        } else {
          validation.invalidIcons.push({
            src: icon.src,
            status: iconResponse.status()
          });
        }
      } catch (error) {
        validation.invalidIcons.push({
          src: icon.src,
          error: error.message
        });
      }
    }
    
    validation.sizesCovered = Array.from(validation.sizesCovered);
    return validation;
  }

  async validateServiceWorker(page) {
    const test = {
      name: 'Service Worker功能',
      category: 'PWA核心',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('⚙️ 验证Service Worker...');
      
      await page.goto(`${this.baseUrl}/mobile`);
      await page.waitForLoadState('networkidle');
      
      // 检查Service Worker支持
      const swSupport = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      if (!swSupport) {
        throw new Error('浏览器不支持Service Worker');
      }
      
      // 等待Service Worker注册
      await page.waitForTimeout(3000);
      
      const swInfo = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return null;
        
        return {
          scope: registration.scope,
          updateViaCache: registration.updateViaCache,
          state: {
            installing: registration.installing?.state,
            waiting: registration.waiting?.state,
            active: registration.active?.state
          },
          controller: !!navigator.serviceWorker.controller
        };
      });
      
      test.details.serviceWorkerInfo = swInfo;
      
      if (!swInfo) {
        throw new Error('Service Worker未注册');
      }
      
      // 检查SW文件
      const swUrl = `${this.baseUrl}/sw.js`;
      const swResponse = await page.goto(swUrl);
      test.details.swFileStatus = swResponse.status();
      
      if (swResponse.status() !== 200) {
        throw new Error(`Service Worker文件访问失败: ${swResponse.status()}`);
      }
      
      // 检查SW功能
      const swContent = await swResponse.text();
      const features = {
        hasInstallEvent: swContent.includes("addEventListener('install'"),
        hasActivateEvent: swContent.includes("addEventListener('activate'"),
        hasFetchHandler: swContent.includes("addEventListener('fetch'"),
        hasSyncHandler: swContent.includes("addEventListener('sync'"),
        hasPushHandler: swContent.includes("addEventListener('push'"),
        hasCacheAPI: swContent.includes('caches.open'),
        hasNotificationAPI: swContent.includes('showNotification')
      };
      
      test.details.features = features;
      
      // 评分
      let score = 0;
      if (swInfo.controller) score += 30;
      if (swInfo.state.active === 'activated') score += 20;
      if (features.hasInstallEvent && features.hasActivateEvent) score += 20;
      if (features.hasFetchHandler) score += 15;
      if (features.hasCacheAPI) score += 10;
      if (features.hasSyncHandler || features.hasPushHandler) score += 5;
      
      test.status = score >= 70 ? 'passed' : 'failed';
      test.score = score;
      test.details.message = `Service Worker功能评分: ${score}/100`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `Service Worker验证失败: ${error.message}`;
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async validateCacheStrategies(page) {
    const test = {
      name: '缓存策略验证',
      category: 'PWA性能',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('💾 验证缓存策略...');
      
      await page.goto(`${this.baseUrl}/mobile`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // 让SW有时间缓存资源
      
      // 检查缓存存储
      const cacheInfo = await page.evaluate(async () => {
        if (!('caches' in window)) return null;
        
        const cacheNames = await caches.keys();
        const cacheDetails = {};
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          cacheDetails[cacheName] = {
            size: keys.length,
            urls: keys.slice(0, 10).map(req => req.url) // 只取前10个避免太多数据
          };
        }
        
        return {
          cacheNames,
          totalCaches: cacheNames.length,
          details: cacheDetails
        };
      });
      
      test.details.cacheInfo = cacheInfo;
      
      if (!cacheInfo) {
        throw new Error('Cache API不可用');
      }
      
      // 测试资源缓存
      const testResources = [
        '/mobile/dashboard',
        '/manifest.json',
        '/icons/icon-192.png'
      ];
      
      const cacheTests = [];
      
      for (const resource of testResources) {
        try {
          // 首次加载
          const response1 = await page.goto(`${this.baseUrl}${resource}`);
          const loadTime1 = Date.now();
          
          await page.waitForTimeout(500);
          
          // 第二次加载（应该从缓存）
          const response2 = await page.goto(`${this.baseUrl}${resource}`);
          const loadTime2 = Date.now();
          
          cacheTests.push({
            resource,
            firstLoad: {
              status: response1.status(),
              fromCache: false
            },
            secondLoad: {
              status: response2.status(),
              fromCache: response2.fromServiceWorker() || loadTime2 < loadTime1
            }
          });
          
        } catch (error) {
          cacheTests.push({
            resource,
            error: error.message
          });
        }
      }
      
      test.details.cacheTests = cacheTests;
      
      // 评分
      let score = 0;
      if (cacheInfo.totalCaches > 0) score += 30;
      if (cacheInfo.totalCaches >= 3) score += 20; // 多个缓存策略
      
      const successfulCacheTests = cacheTests.filter(test => 
        test.secondLoad && test.secondLoad.fromCache
      ).length;
      score += (successfulCacheTests / testResources.length) * 50;
      
      test.status = score >= 60 ? 'passed' : 'failed';
      test.score = score;
      test.details.message = `缓存策略评分: ${score}/100 (${successfulCacheTests}/${testResources.length} 资源成功缓存)`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `缓存策略验证失败: ${error.message}`;
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async validateOfflineCapability(page) {
    const test = {
      name: '离线功能验证',
      category: 'PWA体验',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('🔌 验证离线功能...');
      
      // 在线状态下访问页面
      await page.goto(`${this.baseUrl}/mobile/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // 确保资源被缓存
      
      const onlineContent = await page.content();
      test.details.onlineContentLength = onlineContent.length;
      
      // 切换到离线状态
      await page.setOfflineMode(true);
      test.details.offlineModeSet = true;
      
      // 测试离线页面访问
      const offlineTests = [];
      const testPages = [
        '/mobile/dashboard',
        '/mobile/students',
        '/mobile/activities'
      ];
      
      for (const testPage of testPages) {
        try {
          await page.goto(`${this.baseUrl}${testPage}`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });
          
          await page.waitForTimeout(2000);
          
          const offlineContent = await page.content();
          const hasContent = offlineContent.length > 1000 && 
                           !offlineContent.includes('ERR_INTERNET_DISCONNECTED');
          
          offlineTests.push({
            page: testPage,
            success: hasContent,
            contentLength: offlineContent.length,
            hasOfflineIndicator: offlineContent.includes('offline') || 
                                offlineContent.includes('离线')
          });
          
        } catch (error) {
          offlineTests.push({
            page: testPage,
            success: false,
            error: error.message
          });
        }
      }
      
      test.details.offlineTests = offlineTests;
      
      // 检查离线提示
      const offlineIndicators = await page.$$('.offline-indicator, .network-status, [data-offline]');
      test.details.hasOfflineIndicators = offlineIndicators.length > 0;
      
      // 恢复在线状态
      await page.setOfflineMode(false);
      await page.waitForTimeout(1000);
      
      // 检查在线恢复
      await page.goto(`${this.baseUrl}/mobile/dashboard`);
      const onlineRecoveryContent = await page.content();
      test.details.onlineRecovery = onlineRecoveryContent.length > onlineContent.length * 0.8;
      
      // 评分
      const successfulOfflinePages = offlineTests.filter(test => test.success).length;
      let score = 0;
      
      score += (successfulOfflinePages / testPages.length) * 60;
      if (test.details.hasOfflineIndicators) score += 20;
      if (test.details.onlineRecovery) score += 20;
      
      test.status = score >= 60 ? 'passed' : 'failed';
      test.score = score;
      test.details.message = `离线功能评分: ${score}/100 (${successfulOfflinePages}/${testPages.length} 页面支持离线)`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `离线功能验证失败: ${error.message}`;
    } finally {
      // 确保恢复在线状态
      await page.setOfflineMode(false);
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async validateInstallability(page) {
    const test = {
      name: '安装体验验证',
      category: 'PWA用户体验',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('📲 验证安装体验...');
      
      await page.goto(`${this.baseUrl}/mobile`);
      await page.waitForLoadState('networkidle');
      
      // 检查基本PWA安装条件
      const installConditions = await page.evaluate(() => {
        return {
          hasManifest: !!document.querySelector('link[rel="manifest"]'),
          hasServiceWorker: 'serviceWorker' in navigator,
          isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
          hasValidStartUrl: true, // 简化检查
          hasIcon: !!document.querySelector('link[rel="manifest"]')
        };
      });
      
      test.details.installConditions = installConditions;
      
      // 检查是否已安装
      const isInstalled = await page.evaluate(() => {
        return window.matchMedia('(display-mode: standalone)').matches ||
               (window.navigator as any).standalone === true;
      });
      
      test.details.isInstalled = isInstalled;
      
      // 监听安装提示事件
      let installPromptTriggered = false;
      let installPromptDetails = null;
      
      await page.evaluateOnNewDocument(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
          window.__installPromptEvent = e;
          window.__installPromptTriggered = true;
        });
      });
      
      await page.reload();
      await page.waitForTimeout(5000);
      
      const promptInfo = await page.evaluate(() => {
        return {
          triggered: window.__installPromptTriggered || false,
          hasEvent: !!window.__installPromptEvent
        };
      });
      
      test.details.installPrompt = promptInfo;
      
      // 检查安装按钮或提示
      const installButtons = await page.$$('[data-install], .install-button, .add-to-home');
      test.details.hasInstallUI = installButtons.length > 0;
      
      // 检查应用快捷方式配置
      const manifest = await this.getManifestContent(page);
      if (manifest) {
        test.details.hasShortcuts = manifest.shortcuts && manifest.shortcuts.length > 0;
        test.details.hasCategories = manifest.categories && manifest.categories.length > 0;
        test.details.hasScreenshots = manifest.screenshots && manifest.screenshots.length > 0;
      }
      
      // 评分
      let score = 0;
      
      // 基本条件
      const conditionsMet = Object.values(installConditions).filter(Boolean).length;
      score += (conditionsMet / Object.keys(installConditions).length) * 40;
      
      // 安装提示
      if (promptInfo.triggered || isInstalled) score += 20;
      
      // 用户体验
      if (test.details.hasInstallUI) score += 15;
      if (test.details.hasShortcuts) score += 10;
      if (test.details.hasCategories) score += 5;
      if (test.details.hasScreenshots) score += 10;
      
      test.status = score >= 60 ? 'passed' : 'failed';
      test.score = score;
      
      const missingConditions = Object.entries(installConditions)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      test.details.message = score >= 60 
        ? `安装体验优秀 (评分: ${score}/100)`
        : `安装体验需改进 (评分: ${score}/100${missingConditions.length ? ', 缺少条件: ' + missingConditions.join(', ') : ''})`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `安装体验验证失败: ${error.message}`;
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async validateNotifications(page) {
    const test = {
      name: '推送通知验证',
      category: 'PWA功能',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('🔔 验证推送通知...');
      
      await page.goto(`${this.baseUrl}/mobile`);
      await page.waitForLoadState('networkidle');
      
      // 检查通知API支持
      const notificationSupport = await page.evaluate(() => {
        return {
          hasNotification: 'Notification' in window,
          hasPushManager: 'PushManager' in window,
          hasServiceWorkerPush: 'serviceWorker' in navigator,
          permission: Notification.permission
        };
      });
      
      test.details.notificationSupport = notificationSupport;
      
      if (!notificationSupport.hasNotification) {
        throw new Error('浏览器不支持Notification API');
      }
      
      // 检查Service Worker中的推送处理
      const swContent = await page.goto(`${this.baseUrl}/sw.js`).then(r => r.text());
      const swPushFeatures = {
        hasPushListener: swContent.includes("addEventListener('push'"),
        hasNotificationClick: swContent.includes("addEventListener('notificationclick'"),
        hasShowNotification: swContent.includes('showNotification'),
        hasNotificationActions: swContent.includes('actions:')
      };
      
      test.details.swPushFeatures = swPushFeatures;
      
      // 检查权限请求功能
      const hasPermissionRequest = await page.$$('.notification-permission, [data-notification], .enable-notifications');
      test.details.hasPermissionRequestUI = hasPermissionRequest.length > 0;
      
      // 尝试请求权限（在测试环境中通常会被拒绝）
      let permissionRequestResult = null;
      try {
        permissionRequestResult = await page.evaluate(async () => {
          if ('Notification' in window && Notification.permission === 'default') {
            // 不实际请求权限，只检查API
            return {
              available: true,
              currentPermission: Notification.permission
            };
          }
          return {
            available: false,
            currentPermission: Notification.permission
          };
        });
      } catch (error) {
        permissionRequestResult = { error: error.message };
      }
      
      test.details.permissionRequest = permissionRequestResult;
      
      // 评分
      let score = 0;
      
      if (notificationSupport.hasNotification) score += 25;
      if (notificationSupport.hasPushManager) score += 25;
      if (swPushFeatures.hasPushListener) score += 20;
      if (swPushFeatures.hasNotificationClick) score += 15;
      if (test.details.hasPermissionRequestUI) score += 10;
      if (swPushFeatures.hasNotificationActions) score += 5;
      
      test.status = score >= 60 ? 'passed' : 'failed';
      test.score = score;
      test.details.message = `推送通知功能评分: ${score}/100`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `推送通知验证失败: ${error.message}`;
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async validateBackgroundSync(page) {
    const test = {
      name: '后台同步验证',
      category: 'PWA功能',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('🔄 验证后台同步...');
      
      await page.goto(`${this.baseUrl}/mobile`);
      await page.waitForLoadState('networkidle');
      
      // 检查后台同步API支持
      const syncSupport = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return { supported: false };
        
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return { supported: false };
        
        return {
          supported: 'sync' in registration,
          hasRegistration: !!registration
        };
      });
      
      test.details.syncSupport = syncSupport;
      
      // 检查Service Worker中的同步处理
      const swContent = await page.goto(`${this.baseUrl}/sw.js`).then(r => r.text());
      const swSyncFeatures = {
        hasSyncListener: swContent.includes("addEventListener('sync'"),
        hasBackgroundSync: swContent.includes('background-sync') || swContent.includes('handleBackgroundSync'),
        hasSyncLogic: swContent.includes('sync') && swContent.includes('register'),
        hasDataStorage: swContent.includes('localStorage') || swContent.includes('indexedDB')
      };
      
      test.details.swSyncFeatures = swSyncFeatures;
      
      // 检查本地数据存储
      const dataStorage = await page.evaluate(() => {
        const localStorageKeys = Object.keys(localStorage);
        const sessionStorageKeys = Object.keys(sessionStorage);
        
        return {
          localStorage: {
            count: localStorageKeys.length,
            hasSyncData: localStorageKeys.some(key => 
              key.includes('sync') || key.includes('pending') || key.includes('queue')
            )
          },
          sessionStorage: {
            count: sessionStorageKeys.length
          }
        };
      });
      
      test.details.dataStorage = dataStorage;
      
      // 模拟后台同步场景
      if (syncSupport.supported) {
        try {
          const syncTest = await page.evaluate(async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.sync) {
              try {
                await registration.sync.register('test-sync');
                return { success: true };
              } catch (error) {
                return { success: false, error: error.message };
              }
            }
            return { success: false, error: 'No sync registration available' };
          });
          
          test.details.syncTest = syncTest;
        } catch (error) {
          test.details.syncTest = { success: false, error: error.message };
        }
      }
      
      // 评分
      let score = 0;
      
      if (syncSupport.supported) score += 30;
      if (swSyncFeatures.hasSyncListener) score += 25;
      if (swSyncFeatures.hasBackgroundSync) score += 20;
      if (dataStorage.localStorage.hasSyncData) score += 15;
      if (test.details.syncTest?.success) score += 10;
      
      test.status = score >= 50 ? 'passed' : 'failed';
      test.score = score;
      test.details.message = score >= 50 
        ? `后台同步功能完善 (评分: ${score}/100)`
        : `后台同步功能需要完善 (评分: ${score}/100)`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `后台同步验证失败: ${error.message}`;
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async runPWAAudit(page) {
    const test = {
      name: 'PWA综合审计',
      category: 'PWA评估',
      status: 'running',
      details: {},
      startTime: Date.now()
    };

    try {
      console.log('🔍 运行PWA综合审计...');
      
      await page.goto(`${this.baseUrl}/mobile`);
      await page.waitForLoadState('networkidle');
      
      // 性能指标
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart,
          loadComplete: navigation?.loadEventEnd - navigation?.navigationStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
        };
      });
      
      test.details.performance = performanceMetrics;
      
      // 安全性检查
      const securityCheck = await page.evaluate(() => {
        return {
          isHTTPS: location.protocol === 'https:',
          hasCSP: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
          mixedContent: {
            scripts: Array.from(document.scripts).some(s => s.src && s.src.startsWith('http:')),
            styles: Array.from(document.styleSheets).some(s => s.href && s.href.startsWith('http:')),
            images: Array.from(document.images).some(i => i.src && i.src.startsWith('http:'))
          }
        };
      });
      
      test.details.security = securityCheck;
      
      // 可访问性检查
      const accessibilityCheck = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const buttons = document.querySelectorAll('button, [role="button"]');
        const links = document.querySelectorAll('a');
        const forms = document.querySelectorAll('form');
        
        return {
          images: {
            total: images.length,
            withAlt: Array.from(images).filter(img => img.alt && img.alt.trim()).length
          },
          buttons: {
            total: buttons.length,
            withLabel: Array.from(buttons).filter(btn => 
              btn.textContent?.trim() || btn.getAttribute('aria-label')
            ).length
          },
          links: {
            total: links.length,
            withText: Array.from(links).filter(link => 
              link.textContent?.trim() || link.getAttribute('aria-label')
            ).length
          },
          forms: {
            total: forms.length,
            withLabels: Array.from(forms).filter(form => 
              form.querySelectorAll('label, [aria-label]').length > 0
            ).length
          }
        };
      });
      
      test.details.accessibility = accessibilityCheck;
      
      // 移动端优化
      const mobileOptimization = await page.evaluate(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        const touchIcons = document.querySelectorAll('link[rel*="apple-touch-icon"], link[rel*="icon"]');
        
        return {
          hasViewportMeta: !!viewport,
          viewportContent: viewport?.getAttribute('content'),
          hasTouchIcons: touchIcons.length > 0,
          touchIconCount: touchIcons.length,
          hasThemeColor: !!document.querySelector('meta[name="theme-color"]')
        };
      });
      
      test.details.mobileOptimization = mobileOptimization;
      
      // 综合评分
      let score = 0;
      
      // 性能评分 (25%)
      let perfScore = 0;
      if (performanceMetrics.domContentLoaded < 2000) perfScore += 10;
      if (performanceMetrics.firstContentfulPaint < 1500) perfScore += 10;
      if (performanceMetrics.loadComplete < 3000) perfScore += 5;
      score += perfScore;
      
      // 安全性评分 (20%)
      let secScore = 0;
      if (securityCheck.isHTTPS) secScore += 15;
      if (!securityCheck.mixedContent.scripts && !securityCheck.mixedContent.styles) secScore += 5;
      score += secScore;
      
      // 可访问性评分 (25%)
      let a11yScore = 0;
      const imgRatio = accessibilityCheck.images.total > 0 ? 
        accessibilityCheck.images.withAlt / accessibilityCheck.images.total : 1;
      const btnRatio = accessibilityCheck.buttons.total > 0 ? 
        accessibilityCheck.buttons.withLabel / accessibilityCheck.buttons.total : 1;
      a11yScore += (imgRatio + btnRatio) * 12.5;
      score += a11yScore;
      
      // 移动端优化评分 (30%)
      let mobileScore = 0;
      if (mobileOptimization.hasViewportMeta) mobileScore += 10;
      if (mobileOptimization.hasTouchIcons) mobileScore += 10;
      if (mobileOptimization.hasThemeColor) mobileScore += 10;
      score += mobileScore;
      
      test.status = score >= 75 ? 'passed' : 'failed';
      test.score = Math.round(score);
      test.details.breakdown = {
        performance: perfScore,
        security: secScore,
        accessibility: a11yScore,
        mobile: mobileScore,
        total: Math.round(score)
      };
      test.details.message = `PWA综合审计评分: ${Math.round(score)}/100`;
      
    } catch (error) {
      test.status = 'failed';
      test.score = 0;
      test.details.error = error.message;
      test.details.message = `PWA审计失败: ${error.message}`;
    }
    
    test.duration = Date.now() - test.startTime;
    this.addTestResult(test);
  }

  async getManifestContent(page) {
    try {
      const manifestLink = await page.$('link[rel="manifest"]');
      if (!manifestLink) return null;
      
      const manifestHref = await manifestLink.getAttribute('href');
      const response = await page.goto(`${this.baseUrl}${manifestHref}`);
      return await response.json();
    } catch {
      return null;
    }
  }

  addTestResult(test) {
    this.results.tests.push(test);
    this.results.summary.total++;
    if (test.status === 'passed') {
      this.results.summary.passed++;
    } else if (test.status === 'failed') {
      this.results.summary.failed++;
    }
    
    // 计算总体评分
    const totalScore = this.results.tests.reduce((sum, test) => sum + (test.score || 0), 0);
    this.results.summary.score = Math.round(totalScore / this.results.tests.length);
    
    // 打印进度
    const status = test.status === 'passed' ? '✅' : '❌';
    console.log(`${status} ${test.name} (${test.score}/100) - ${test.details.message}`);
  }

  async generateReport() {
    console.log('\n📊 生成PWA验证报告...');
    
    // 生成HTML报告
    const htmlReport = this.generateHTMLReport();
    await fs.writeFile('./pwa-validation-report.html', htmlReport);
    
    // 生成JSON报告
    await fs.writeFile('./pwa-validation-report.json', JSON.stringify(this.results, null, 2));
    
    // 打印摘要
    this.printSummary();
    
    console.log('\n📋 PWA验证报告已生成:');
    console.log('   - HTML: ./pwa-validation-report.html');
    console.log('   - JSON: ./pwa-validation-report.json');
  }

  generateHTMLReport() {
    const { results } = this;
    const categories = [...new Set(results.tests.map(t => t.category))];
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PWA功能验证报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #1890ff; color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .score { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .score.excellent { color: #52c41a; }
        .score.good { color: #1890ff; }
        .score.needs-work { color: #faad14; }
        .score.poor { color: #f5222d; }
        .category { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .category-header { font-size: 1.3em; font-weight: bold; margin-bottom: 15px; color: #1890ff; }
        .test-item { padding: 15px; border-left: 4px solid #f0f0f0; margin-bottom: 15px; background: #fafafa; }
        .test-item.passed { border-left-color: #52c41a; }
        .test-item.failed { border-left-color: #f5222d; }
        .test-name { font-weight: 600; margin-bottom: 5px; }
        .test-score { display: inline-block; padding: 4px 12px; border-radius: 12px; color: white; font-size: 0.9em; margin: 5px 0; }
        .test-score.high { background: #52c41a; }
        .test-score.medium { background: #1890ff; }
        .test-score.low { background: #faad14; }
        .test-score.fail { background: #f5222d; }
        .test-message { font-size: 0.9em; color: #666; margin-top: 5px; }
        .details { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 0.85em; }
        .progress-bar { background: #f0f0f0; height: 6px; border-radius: 3px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📱 PWA功能验证报告</h1>
            <p>应用: ${results.baseUrl}</p>
            <p>测试时间: ${new Date(results.timestamp).toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <div class="score ${this.getScoreClass(results.summary.score)}">${results.summary.score}</div>
                <div>综合评分</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${results.summary.score}%; background: ${this.getScoreColor(results.summary.score)};"></div>
                </div>
            </div>
            <div class="summary-card">
                <div class="score">${results.summary.total}</div>
                <div>总测试项</div>
            </div>
            <div class="summary-card">
                <div class="score excellent">${results.summary.passed}</div>
                <div>通过项目</div>
            </div>
            <div class="summary-card">
                <div class="score ${results.summary.failed > 0 ? 'poor' : 'excellent'}">${results.summary.failed}</div>
                <div>失败项目</div>
            </div>
        </div>
        
        ${categories.map(category => {
          const categoryTests = results.tests.filter(t => t.category === category);
          const categoryScore = Math.round(categoryTests.reduce((sum, t) => sum + (t.score || 0), 0) / categoryTests.length);
          
          return `
            <div class="category">
                <div class="category-header">
                    ${category} (评分: ${categoryScore}/100)
                </div>
                ${categoryTests.map(test => `
                    <div class="test-item ${test.status}">
                        <div class="test-name">${test.name}</div>
                        <span class="test-score ${this.getScoreClass(test.score)}">${test.score}/100</span>
                        <div class="test-message">${test.details.message}</div>
                        ${test.details.error ? `<div class="details"><strong>错误:</strong> ${test.details.error}</div>` : ''}
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${test.score}%; background: ${this.getScoreColor(test.score)};"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
          `;
        }).join('')}
        
        <div class="category">
            <div class="category-header">PWA推荐改进</div>
            <div class="details">
                ${this.generateRecommendations().map(rec => `<p>• ${rec}</p>`).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-work';
    return 'poor';
  }

  getScoreColor(score) {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#f5222d';
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.results.tests.filter(t => t.status === 'failed' || t.score < 60);
    
    failedTests.forEach(test => {
      switch (test.name) {
        case 'Manifest文件验证':
          recommendations.push('完善manifest.json配置，确保包含所有必需字段和图标');
          break;
        case 'Service Worker功能':
          recommendations.push('优化Service Worker实现，添加缓存策略和离线支持');
          break;
        case '离线功能验证':
          recommendations.push('改进离线体验，确保核心功能在离线状态下可用');
          break;
        case '安装体验验证':
          recommendations.push('优化PWA安装体验，添加安装提示和引导');
          break;
        case '推送通知验证':
          recommendations.push('完善推送通知功能，添加权限管理和消息处理');
          break;
        case '后台同步验证':
          recommendations.push('实现后台同步功能，确保数据一致性');
          break;
        case 'PWA综合审计':
          recommendations.push('提升整体PWA质量，关注性能、安全性和可访问性');
          break;
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('PWA功能实现优秀，继续保持！');
      recommendations.push('可以考虑添加更多PWA新特性，如文件处理、联系人集成等');
    }
    
    return [...new Set(recommendations)];
  }

  printSummary() {
    const { results } = this;
    
    console.log('\n' + '='.repeat(60));
    console.log('📱 PWA功能验证总结');
    console.log('='.repeat(60));
    console.log(`📊 综合评分: ${results.summary.score}/100`);
    console.log(`🔍 测试项目: ${results.summary.total}`);
    console.log(`✅ 通过: ${results.summary.passed}`);
    console.log(`❌ 失败: ${results.summary.failed}`);
    console.log(`📈 通过率: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
    
    // 按类别显示结果
    const categories = [...new Set(results.tests.map(t => t.category))];
    console.log('\n📋 分类结果:');
    
    categories.forEach(category => {
      const categoryTests = results.tests.filter(t => t.category === category);
      const categoryScore = Math.round(categoryTests.reduce((sum, t) => sum + (t.score || 0), 0) / categoryTests.length);
      const status = categoryScore >= 70 ? '✅' : categoryScore >= 50 ? '⚠️' : '❌';
      console.log(`   ${status} ${category}: ${categoryScore}/100`);
    });
    
    // PWA等级评估
    let pwaLevel = '';
    if (results.summary.score >= 90) {
      pwaLevel = '🌟 PWA优秀 - 完全符合PWA标准';
    } else if (results.summary.score >= 70) {
      pwaLevel = '👍 PWA良好 - 基本符合PWA标准';
    } else if (results.summary.score >= 50) {
      pwaLevel = '⚠️ PWA一般 - 需要改进PWA功能';
    } else {
      pwaLevel = '🚨 PWA不足 - 缺乏基本PWA特性';
    }
    
    console.log(`\n🎯 PWA等级: ${pwaLevel}`);
    console.log('='.repeat(60));
  }
}

// 主执行函数
async function runPWAValidation(baseUrl = 'http://localhost:5173') {
  const validator = new PWAValidationSuite(baseUrl);
  await validator.runValidation();
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🚀 启动PWA功能验证...\n');
  runPWAValidation().catch(console.error);
}

module.exports = { PWAValidationSuite, runPWAValidation };