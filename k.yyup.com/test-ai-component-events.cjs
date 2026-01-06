/**
 * AI助手前端渲染组件事件监控测试
 * 捕获Vue组件渲染、DOM变化、控制台日志等详细事件
 */

const { chromium } = require('playwright');
const { EventEmitter } = require('events');

// 测试配置
const CONFIG = {
  FRONTEND_URL: 'http://localhost:5173',
  AI_ASSISTANT_URL: 'http://localhost:5173/aiassistant?mode=fullpage',
  BACKEND_URL: 'http://localhost:3000',
  TEST_TIMEOUT: 30000
};

// 事件收集器
class ComponentEventCollector extends EventEmitter {
  constructor() {
    super();
    this.events = [];
    this.componentEvents = [];
    this.networkEvents = [];
    this.consoleEvents = [];
    this.domEvents = [];
    this.vueComponentEvents = [];
    this.performanceEvents = [];
  }

  addEvent(type, data) {
    const event = {
      timestamp: new Date().toISOString(),
      type,
      data
    };

    this.events.push(event);

    // 分类存储事件
    switch (type) {
      case 'component':
        this.componentEvents.push(event);
        break;
      case 'network':
        this.networkEvents.push(event);
        break;
      case 'console':
        this.consoleEvents.push(event);
        break;
      case 'dom':
        this.domEvents.push(event);
        break;
      case 'vue_component':
        this.vueComponentEvents.push(event);
        break;
      case 'performance':
        this.performanceEvents.push(event);
        break;
    }

    this.emit('event', event);
    console.log(`🎯 [${type.toUpperCase()}] ${data.action || data.event || data.type || 'unknown'}:`, data.message || data);
  }

  getStats() {
    return {
      total: this.events.length,
      component: this.componentEvents.length,
      network: this.networkEvents.length,
      console: this.consoleEvents.length,
      dom: this.domEvents.length,
      vue_component: this.vueComponentEvents.length,
      performance: this.performanceEvents.length
    };
  }

  getEventsByType(type) {
    return this.events.filter(event => event.type === type);
  }

  getVueComponentLifecycle() {
    return this.vueComponentEvents.filter(event =>
      event.data.action.includes('mount') ||
      event.data.action.includes('update') ||
      event.data.action.includes('unmount')
    );
  }

  getErrorEvents() {
    return this.consoleEvents.filter(event =>
      event.data.type === 'error' || event.data.type === 'warning'
    );
  }
}

// 主测试函数
async function runComponentRenderEventsTest() {
  console.log('🚀 开始AI助手前端渲染组件事件监控测试...');

  const collector = new ComponentEventCollector();
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 设置详细的页面事件监听
    setupDetailedPageEvents(page, collector);

    // 步骤1: 访问AI助手页面
    console.log('\n📍 步骤1: 访问AI助手页面');

    await page.goto(CONFIG.AI_ASSISTANT_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    collector.addEvent('navigation', {
      action: 'page_loaded',
      url: page.url(),
      timestamp: new Date().toISOString()
    });

    // 等待Vue应用初始化
    await page.waitForTimeout(3000);

    // 步骤2: 检查Vue应用和组件状态
    console.log('\n📍 步骤2: 检查Vue应用和组件状态');

    const vueAppStatus = await checkVueApplicationStatus(page, collector);

    // 步骤3: 监听Vue组件渲染事件
    console.log('\n📍 步骤3: 监听Vue组件渲染事件');

    await monitorVueComponentRendering(page, collector);

    // 步骤4: 查找并分析AI组件
    console.log('\n📍 步骤4: 查找并分析AI组件');

    const componentAnalysis = await analyzeAIComponents(page, collector);

    // 步骤5: 测试组件交互和响应
    console.log('\n📍 步骤5: 测试组件交互和响应');

    if (componentAnalysis.hasInput) {
      await testComponentInteraction(page, collector);
    }

    // 步骤6: 监听性能指标和渲染性能
    console.log('\n📍 步骤6: 监听性能指标和渲染性能');

    await monitorRenderingPerformance(page, collector);

    // 步骤7: 捕获组件生命周期事件
    console.log('\n📍 步骤7: 捕获组件生命周期事件');

    await captureComponentLifecycle(page, collector);

    // 步骤8: 最终页面快照和分析
    console.log('\n📍 步骤8: 最终页面快照和分析');

    await captureFinalPageSnapshot(page, collector);

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    collector.addEvent('test_error', {
      action: 'test_failed',
      error: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();

    // 生成详细报告
    generateComponentEventsReport(collector);
  }
}

// 设置详细的页面事件监听
function setupDetailedPageEvents(page, collector) {
  // 控制台事件监听
  page.on('console', msg => {
    const eventData = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location() ? {
        url: msg.location().url,
        lineNumber: msg.location().lineNumber,
        columnNumber: msg.location().columnNumber
      } : null,
      args: msg.args().map(arg => arg.toString()),
      timestamp: new Date().toISOString()
    };

    collector.addEvent('console', {
      action: 'console_message',
      ...eventData
    });

    // 特别关注Vue相关的控制台信息
    if (msg.text().includes('Vue') || msg.text().includes('[Vue]')) {
      collector.addEvent('vue_component', {
        action: 'vue_console_message',
        message: msg.text(),
        type: msg.type()
      });
    }
  });

  // 页面错误监听
  page.on('pageerror', error => {
    collector.addEvent('console', {
      action: 'page_error',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // 请求事件监听
  page.on('request', request => {
    const requestData = {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString()
    };

    collector.addEvent('network', {
      action: 'request_started',
      ...requestData
    });

    // 特别关注AI相关的请求
    if (request.url().includes('/ai') || request.url().includes('/chat')) {
      collector.addEvent('component', {
        action: 'ai_api_request',
        url: request.url(),
        method: request.method()
      });
    }
  });

  // 响应事件监听
  page.on('response', response => {
    const responseData = {
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    };

    collector.addEvent('network', {
      action: 'response_received',
      ...responseData
    });
  });

  // DOM事件监听
  page.on('domcontentloaded', () => {
    collector.addEvent('dom', {
      action: 'dom_content_loaded',
      timestamp: new Date().toISOString()
    });
  });

  page.on('load', () => {
    collector.addEvent('dom', {
      action: 'page_fully_loaded',
      timestamp: new Date().toISOString()
    });
  });
}

// 检查Vue应用状态
async function checkVueApplicationStatus(page, collector) {
  try {
    const vueStatus = await page.evaluate(() => {
      return {
        // Vue应用检查
        vueApp: !!window.Vue,
        appElement: !!document.querySelector('#app'),

        // 组件计数
        totalComponents: document.querySelectorAll('[data-v-]').length,
        vueComponents: document.querySelectorAll('[data-v-]').length,

        // 页面基本信息
        title: document.title,
        url: window.location.href,
        readyState: document.readyState,

        // AI相关组件检查
        aiComponents: {
          aiAssistant: !!document.querySelector('.ai-assistant'),
          chatContainer: !!document.querySelector('.chat-container'),
          messageList: !!document.querySelector('.message-list'),
          inputArea: !!document.querySelector('.input-area'),
          sendButton: !!document.querySelector('button[type="submit"], .send-button')
        },

        // Element Plus组件检查
        elementComponents: {
          elInput: document.querySelectorAll('.el-input, .el-textarea').length,
          elButton: document.querySelectorAll('.el-button').length,
          elCard: document.querySelectorAll('.el-card').length
        }
      };
    });

    collector.addEvent('vue_component', {
      action: 'vue_application_status',
      status: vueStatus
    });

    console.log('📱 Vue应用状态:', vueStatus);
    return vueStatus;

  } catch (error) {
    collector.addEvent('vue_component', {
      action: 'vue_status_check_failed',
      error: error.message
    });
    return null;
  }
}

// 监听Vue组件渲染事件
async function monitorVueComponentRendering(page, collector) {
  try {
    await page.evaluate(() => {
      // 创建MutationObserver监听DOM变化
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // 检查是否是Vue组件
                const isVueComponent =
                  node.hasAttribute('data-v-') ||
                  node.hasAttribute('data-v-app') ||
                  node.classList.contains('vue-component') ||
                  node.__vue__ !== undefined;

                if (isVueComponent) {
                  // 记录组件渲染事件
                  const componentInfo = {
                    tagName: node.tagName,
                    className: node.className,
                    vueId: node.getAttribute('data-v-'),
                    isAIComponent: node.className.includes('ai-') ||
                                   node.className.includes('chat') ||
                                   node.tagName.toLowerCase().includes('ai')
                  };

                  // 将信息存储在window对象中供后续获取
                  if (!window.vueComponentEvents) {
                    window.vueComponentEvents = [];
                  }
                  window.vueComponentEvents.push({
                    type: 'component_rendered',
                    component: componentInfo,
                    timestamp: new Date().toISOString()
                  });
                }

                // 递归检查子元素
                if (node.querySelectorAll) {
                  const vueElements = node.querySelectorAll('[data-v-]');
                  vueElements.forEach(el => {
                    const componentInfo = {
                      tagName: el.tagName,
                      className: el.className,
                      vueId: el.getAttribute('data-v-'),
                      isAIComponent: el.className.includes('ai-') ||
                                     el.className.includes('chat')
                    };

                    if (!window.vueComponentEvents) {
                      window.vueComponentEvents = [];
                    }
                    window.vueComponentEvents.push({
                      type: 'vue_element_found',
                      component: componentInfo,
                      timestamp: new Date().toISOString()
                    });
                  });
                }
              }
            });

            // 监听移除的节点（组件卸载）
            mutation.removedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-v-')) {
                if (!window.vueComponentEvents) {
                  window.vueComponentEvents = [];
                }
                window.vueComponentEvents.push({
                  type: 'component_removed',
                  component: {
                    tagName: node.tagName,
                    className: node.className
                  },
                  timestamp: new Date().toISOString()
                });
              }
            });
          }
        });
      });

      // 开始观察
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-v-', 'class']
      });

      // 将observer暴露到window
      window.componentObserver = observer;
      window.vueComponentEvents = [];
    });

    // 等待一段时间收集组件事件
    await page.waitForTimeout(3000);

    // 获取收集的组件事件
    const componentEvents = await page.evaluate(() => {
      return window.vueComponentEvents || [];
    });

    componentEvents.forEach(event => {
      collector.addEvent('vue_component', {
        action: event.type,
        component: event.component,
        timestamp: event.timestamp
      });
    });

    console.log(`🎯 捕获到 ${componentEvents.length} 个Vue组件事件`);

  } catch (error) {
    collector.addEvent('vue_component', {
      action: 'component_monitoring_failed',
      error: error.message
    });
  }
}

// 分析AI组件
async function analyzeAIComponents(page, collector) {
  try {
    const componentAnalysis = await page.evaluate(() => {
      const analysis = {
        // AI相关组件
        aiComponents: {
          aiAssistant: document.querySelectorAll('.ai-assistant').length,
          chatContainer: document.querySelectorAll('.chat-container, .message-list').length,
          inputArea: document.querySelectorAll('textarea, .input-area, .message-input').length,
          sendButton: document.querySelectorAll('button[type="submit"], .send-button, .el-button--primary').length,
          aiResponse: document.querySelectorAll('.ai-response, .message-content, .response-content').length,
          loadingMessage: document.querySelectorAll('.loading-message, .loading').length
        },

        // 输入组件详细分析
        inputComponents: [],

        // 组件总数
        totalInteractiveComponents: 0,

        // Vue组件统计
        vueComponentStats: {
          total: document.querySelectorAll('[data-v-]').length,
          withAIClasses: document.querySelectorAll('[data-v-]').length,
          uniqueDataVIds: new Set()
        }
      };

      // 分析输入组件
      const inputSelectors = [
        'textarea',
        'input[type="text"]',
        '.el-textarea__inner',
        '.el-input__inner',
        '[contenteditable="true"]',
        'textarea[placeholder*="请输入"]'
      ];

      inputSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          analysis.inputComponents.push({
            selector,
            count: elements.length,
            elements: Array.from(elements).map(el => ({
              tagName: el.tagName,
              type: el.type,
              placeholder: el.placeholder,
              disabled: el.disabled,
              className: el.className
            }))
          });
        }
      });

      // 统计交互组件
      analysis.totalInteractiveComponents =
        document.querySelectorAll('button, input, textarea, select, a[href]').length;

      // 统计Vue组件ID
      document.querySelectorAll('[data-v-]').forEach(el => {
        const dataVId = el.getAttribute('data-v-');
        if (dataVId) {
          analysis.vueComponentStats.uniqueDataVIds.add(dataVId);
        }
      });
      analysis.vueComponentStats.uniqueDataVIds = analysis.vueComponentStats.uniqueDataVIds.size;

      return analysis;
    });

    collector.addEvent('component', {
      action: 'ai_components_analysis',
      analysis: componentAnalysis
    });

    console.log('🏗️ AI组件分析:', componentAnalysis);

    return {
      hasInput: componentAnalysis.inputComponents.length > 0,
      analysis: componentAnalysis
    };

  } catch (error) {
    collector.addEvent('component', {
      action: 'component_analysis_failed',
      error: error.message
    });
    return { hasInput: false };
  }
}

// 测试组件交互
async function testComponentInteraction(page, collector) {
  try {
    // 查找输入框
    const inputElement = await page.$('textarea, .el-textarea__inner, [contenteditable="true"]');

    if (!inputElement) {
      collector.addEvent('component', {
        action: 'no_input_found_for_interaction'
      });
      return;
    }

    console.log('🎯 找到输入框，开始交互测试');

    // 输入测试消息
    const testMessage = '前端组件事件监控测试 - 查询学生信息';
    await inputElement.fill(testMessage);

    collector.addEvent('component', {
      action: 'input_interaction_test',
      message: testMessage,
      timestamp: new Date().toISOString()
    });

    // 查找发送按钮
    const sendButton = await page.$('button[type="submit"], .send-button, .el-button--primary');

    if (sendButton) {
      console.log('🎯 找到发送按钮，准备点击');

      // 点击发送按钮
      await sendButton.click();

      collector.addEvent('component', {
        action: 'send_button_interaction',
        message: testMessage,
        timestamp: new Date().toISOString()
      });

      // 等待可能的响应
      console.log('⏳ 等待响应...');
      await page.waitForTimeout(5000);

      // 检查响应内容
      const responseCheck = await checkForAIResponse(page, collector);

      if (responseCheck.hasResponse) {
        collector.addEvent('component', {
          action: 'interaction_success',
          responseFound: true,
          responseType: responseCheck.type
        });
      } else {
        collector.addEvent('component', {
          action: 'interaction_no_response',
          message: '未找到AI响应内容'
        });
      }

    } else {
      collector.addEvent('component', {
        action: 'no_send_button_found'
      });
    }

  } catch (error) {
    collector.addEvent('component', {
      action: 'component_interaction_failed',
      error: error.message
    });
  }
}

// 检查AI响应
async function checkForAIResponse(page, collector) {
  try {
    const responseCheck = await page.evaluate(() => {
      const responseSelectors = [
        '.ai-response',
        '.message-content',
        '.response-content',
        '.chat-message',
        '.assistant-message',
        '.loading-message'
      ];

      for (const selector of responseSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          return {
            hasResponse: true,
            selector: selector,
            count: elements.length,
            type: selector.replace('.', '').replace('-', '_'),
            content: Array.from(elements).map(el => ({
              text: el.textContent?.trim().substring(0, 100),
              hasContent: el.textContent && el.textContent.trim().length > 0
            }))
          };
        }
      }

      return { hasResponse: false };
    });

    if (responseCheck.hasResponse) {
      collector.addEvent('component', {
        action: 'ai_response_detected',
        selector: responseCheck.selector,
        count: responseCheck.count,
        hasContent: responseCheck.content.some(c => c.hasContent)
      });
    }

    return responseCheck;

  } catch (error) {
    collector.addEvent('component', {
      action: 'response_check_failed',
      error: error.message
    });
    return { hasResponse: false };
  }
}

// 监听渲染性能
async function monitorRenderingPerformance(page, collector) {
  try {
    const performanceMetrics = await page.evaluate(() => {
      // 基本性能指标
      const navigation = performance.getEntriesByType('navigation')[0];

      // 渲染性能指标
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(p => p.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint = paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

      // 内存使用
      const memoryInfo = performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null;

      // DOM统计
      const domStats = {
        totalElements: document.querySelectorAll('*').length,
        vueComponents: document.querySelectorAll('[data-v-]').length,
        interactiveElements: document.querySelectorAll('button, input, textarea, select, a[href]').length,
        aiComponents: document.querySelectorAll('[class*="ai-"], [class*="chat"]').length
      };

      return {
        // 页面加载性能
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,

        // 渲染性能
        firstPaint,
        firstContentfulPaint,

        // 内存
        memory: memoryInfo,

        // DOM统计
        dom: domStats,

        // 时间戳
        timestamp: new Date().toISOString()
      };
    });

    collector.addEvent('performance', {
      action: 'rendering_performance_metrics',
      metrics: performanceMetrics
    });

    console.log('⚡ 渲染性能指标:', {
      domContentLoaded: `${performanceMetrics.domContentLoaded}ms`,
      loadComplete: `${performanceMetrics.loadComplete}ms`,
      firstPaint: `${performanceMetrics.firstPaint}ms`,
      vueComponents: performanceMetrics.dom.vueComponents
    });

  } catch (error) {
    collector.addEvent('performance', {
      action: 'performance_monitoring_failed',
      error: error.message
    });
  }
}

// 捕获组件生命周期
async function captureComponentLifecycle(page, collector) {
  try {
    const lifecycleEvents = await page.evaluate(() => {
      const events = [];

      // 查找所有Vue组件实例
      const allElements = document.querySelectorAll('[data-v-]');

      allElements.forEach(element => {
        const componentInfo = {
          tagName: element.tagName,
          className: element.className,
          vueId: element.getAttribute('data-v-'),
          isVisible: element.offsetParent !== null,
          hasChildren: element.children.length > 0,
         textContent: element.textContent ? element.textContent.substring(0, 50) : ''
        };

        // 尝试访问Vue实例（如果可用）
        if (element.__vue__) {
          const vueInstance = element.__vue_;
          componentInfo.vueInstance = {
            _isMounted: vueInstance._isMounted,
            _isDestroyed: vueInstance._isDestroyed,
            $options: {
              name: vueInstance.$options?.name,
              components: vueInstance.$options?.components ? Object.keys(vueInstance.$options.components) : []
            }
          };
        }

        events.push(componentInfo);
      });

      return events;
    });

    lifecycleEvents.forEach(event => {
      collector.addEvent('vue_component', {
        action: 'component_lifecycle_snapshot',
        component: event
      });
    });

    console.log(`🔄 捕获了 ${lifecycleEvents.length} 个组件生命周期快照`);

  } catch (error) {
    collector.addEvent('vue_component', {
      action: 'lifecycle_capture_failed',
      error: error.message
    });
  }
}

// 捕获最终页面快照
async function captureFinalPageSnapshot(page, collector) {
  try {
    const snapshot = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),

        // 统计信息
        stats: {
          totalElements: document.querySelectorAll('*').length,
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input, textarea').length,
          vueComponents: document.querySelectorAll('[data-v-]').length,
          forms: document.querySelectorAll('form').length,

          // AI组件统计
          aiComponents: document.querySelectorAll('[class*="ai-"]').length,
          chatComponents: document.querySelectorAll('[class*="chat"]').length,
          messageComponents: document.querySelectorAll('[class*="message"]').length
        },

        // 页面内容长度
        contentLength: {
          html: document.documentElement.outerHTML.length,
          body: document.body.outerHTML.length,
          textContent: document.body.textContent?.length || 0
        }
      };
    });

    collector.addEvent('dom', {
      action: 'final_page_snapshot',
      snapshot
    });

    // 截图
    const screenshot = await page.screenshot({
      fullPage: true,
      path: './ai-component-events-screenshot.png'
    });

    collector.addEvent('dom', {
      action: 'screenshot_taken',
      path: './ai-component-events-screenshot.png',
      success: !!screenshot
    });

    console.log('📸 页面快照已保存');

  } catch (error) {
    collector.addEvent('dom', {
      action: 'snapshot_failed',
      error: error.message
    });
  }
}

// 生成组件事件报告
function generateComponentEventsReport(collector) {
  const stats = collector.getStats();
  const errorEvents = collector.getErrorEvents();
  const lifecycleEvents = collector.getVueComponentLifecycle();

  console.log('\n📊 ===== AI助手前端渲染组件事件详细报告 =====');

  console.log('\n🔢 事件统计:');
  console.log(`总事件数: ${stats.total}`);
  console.log(`组件事件: ${stats.component}`);
  console.log(`网络事件: ${stats.network}`);
  console.log(`控制台事件: ${stats.console}`);
  console.log(`DOM事件: ${stats.dom}`);
  console.log(`Vue组件事件: ${stats.vue_component}`);
  console.log(`性能事件: ${stats.performance}`);

  console.log('\n🎯 Vue组件生命周期事件:');
  lifecycleEvents.forEach(event => {
    console.log(`  ✅ ${event.timestamp} - ${event.data.action}`);
  });

  console.log('\n🌐 AI相关网络请求:');
  const aiNetworkEvents = collector.networkEvents.filter(e =>
    e.data.action === 'ai_api_request' || e.data.url?.includes('/ai')
  );
  aiNetworkEvents.forEach(event => {
    console.log(`  📡 ${event.timestamp} - ${event.data.action}: ${event.data.url}`);
  });

  console.log('\n⚠️ 错误和警告:');
  if (errorEvents.length > 0) {
    errorEvents.forEach(error => {
      console.log(`  ❌ ${error.timestamp} - ${error.data.type}: ${error.data.text}`);
    });
  } else {
    console.log('  ✅ 无错误或警告');
  }

  console.log('\n💻 控制台消息:');
  const vueConsoleEvents = collector.consoleEvents.filter(e =>
    e.data.text?.includes('Vue') || e.data.text?.includes('[Vue]')
  );
  vueConsoleEvents.forEach(event => {
    console.log(`  📝 ${event.timestamp} - ${event.data.type}: ${event.data.text}`);
  });

  // 保存详细报告
  const reportData = {
    summary: {
      total: stats.total,
      component: stats.component,
      network: stats.network,
      console: stats.console,
      dom: stats.dom,
      vue_component: stats.vue_component,
      performance: stats.performance,
      timestamp: new Date().toISOString()
    },
    stats,
    events: collector.events,
    componentEvents: collector.componentEvents,
    networkEvents: collector.networkEvents,
    consoleEvents: collector.consoleEvents,
    domEvents: collector.domEvents,
    vueComponentEvents: collector.vueComponentEvents,
    performanceEvents: collector.performanceEvents,
    errorEvents,
    lifecycleEvents
  };

  const fs = require('fs');
  fs.writeFileSync(
    './ai-component-events-report.json',
    JSON.stringify(reportData, null, 2),
    'utf8'
  );

  console.log('\n💾 详细组件事件报告已保存到: ai-component-events-report.json');
  console.log('\n🎉 前端渲染组件事件监控测试完成！');

  return stats;
}

// 运行测试
if (require.main === module) {
  runComponentRenderEventsTest().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}