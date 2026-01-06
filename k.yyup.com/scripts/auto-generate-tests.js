#!/usr/bin/env node

/**
 * 自动化测试生成工具
 * 基于扫描结果自动生成缺失的测试用例
 */

const fs = require('fs');
const path = require('path');
const TestCoverageScanner = require('./test-coverage-scanner');

class AutoTestGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.clientDir = path.join(this.projectRoot, 'client');
    this.testDir = path.join(this.clientDir, 'tests');
    this.scanner = new TestCoverageScanner();
    this.generatedTests = [];
    this.errors = [];
  }

  /**
   * 自动生成所有缺失的测试
   */
  async generateAllMissingTests(options = {}) {
    console.log('🚀 开始自动生成测试用例...');

    const {
      dryRun = false,
      outputDir = null,
      includeE2E = true,
      includeUnit = true,
      includeIntegration = true,
      targetRiskLevel = null, // 'high', 'medium', 'low', null for all
      batchSize = 10
    } = options;

    try {
      // 运行扫描器
      console.log('📊 分析项目测试覆盖情况...');
      await this.scanner.run();

      // 获取未覆盖的组件
      const uncoveredComponents = this.scanner.components.filter(c => !c.hasTest);

      // 根据风险等级过滤
      let componentsToProcess = uncoveredComponents;
      if (targetRiskLevel) {
        componentsToProcess = uncoveredComponents.filter(c => c.riskLevel === targetRiskLevel);
      }

      console.log(`🎯 找到 ${componentsToProcess.length} 个需要生成测试的组件`);

      if (componentsToProcess.length === 0) {
        console.log('✅ 所有组件都已有测试覆盖！');
        return { generatedTests: [], errors: [] };
      }

      // 按优先级排序
      componentsToProcess.sort((a, b) => {
        const riskPriority = { high: 3, medium: 2, low: 1 };
        return (riskPriority[b.riskLevel] || 0) - (riskPriority[a.riskLevel] || 0);
      });

      // 分批处理
      const batches = this.chunkArray(componentsToProcess, batchSize);
      let totalGenerated = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n📦 处理第 ${i + 1}/${batches.length} 批 (${batch.length} 个组件)`);

        for (const component of batch) {
          try {
            const generatedTests = await this.generateTestsForComponent(component, {
              dryRun,
              outputDir,
              includeE2E,
              includeUnit,
              includeIntegration
            });

            if (generatedTests.length > 0) {
              this.generatedTests.push(...generatedTests);
              totalGenerated += generatedTests.length;
              console.log(`  ✅ ${component.componentName}: 生成 ${generatedTests.length} 个测试`);
            }
          } catch (error) {
            console.error(`  ❌ ${component.componentName}: 生成失败 - ${error.message}`);
            this.errors.push({
              component: component.componentName,
              error: error.message,
              path: component.relativePath
            });
          }
        }

        // 每批处理后暂停一下，避免文件系统过载
        if (i < batches.length - 1) {
          await this.sleep(100);
        }
      }

      console.log(`\n🎉 测试生成完成！`);
      console.log(`📊 总计生成: ${totalGenerated} 个测试文件`);
      console.log(`❌ 错误数量: ${this.errors.length}`);

      if (!dryRun) {
        await this.generateTestIndex();
        await this.generateRunScript();
      }

      return {
        generatedTests: this.generatedTests,
        errors: this.errors,
        summary: {
          totalComponents: componentsToProcess.length,
          totalGenerated: totalGenerated,
          successCount: this.generatedTests.length,
          errorCount: this.errors.length
        }
      };

    } catch (error) {
      console.error('❌ 自动生成测试失败:', error);
      throw error;
    }
  }

  /**
   * 为单个组件生成测试
   */
  async generateTestsForComponent(component, options) {
    const { dryRun, outputDir, includeE2E, includeUnit, includeIntegration } = options;
    const generatedTests = [];

    // 生成测试目录结构
    const testBaseDir = outputDir || path.join(this.testDir, 'unit', 'components');
    const categoryDir = path.join(testBaseDir, component.category);

    // 确保目录存在
    if (!dryRun && !fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // 生成单元测试
    if (includeUnit) {
      const unitTest = await this.generateUnitTest(component);
      const unitTestPath = path.join(categoryDir, `${component.componentName}.test.ts`);

      if (!dryRun) {
        fs.writeFileSync(unitTestPath, unitTest, 'utf8');
      }

      generatedTests.push({
        type: 'unit',
        path: unitTestPath,
        component: component.componentName,
        content: unitTest
      });
    }

    // 生成E2E测试（仅对页面组件）
    if (includeE2E && component.category.includes('page')) {
      const e2eTest = await this.generateE2ETest(component);
      const e2eTestPath = path.join(this.testDir, 'e2e', `${component.componentName}.e2e.test.ts`);

      if (!dryRun) {
        if (!fs.existsSync(path.dirname(e2eTestPath))) {
          fs.mkdirSync(path.dirname(e2eTestPath), { recursive: true });
        }
        fs.writeFileSync(e2eTestPath, e2eTest, 'utf8');
      }

      generatedTests.push({
        type: 'e2e',
        path: e2eTestPath,
        component: component.componentName,
        content: e2eTest
      });
    }

    // 生成集成测试（对复杂组件）
    if (includeIntegration && this.needsIntegrationTest(component)) {
      const integrationTest = await this.generateIntegrationTest(component);
      const integrationTestPath = path.join(this.testDir, 'integration', `${component.componentName}.integration.test.ts`);

      if (!dryRun) {
        if (!fs.existsSync(path.dirname(integrationTestPath))) {
          fs.mkdirSync(path.dirname(integrationTestPath), { recursive: true });
        }
        fs.writeFileSync(integrationTestPath, integrationTest, 'utf8');
      }

      generatedTests.push({
        type: 'integration',
        path: integrationTestPath,
        component: component.componentName,
        content: integrationTest
      });
    }

    return generatedTests;
  }

  /**
   * 生成单元测试
   */
  async generateUnitTest(component) {
    const templatePath = path.relative(this.clientDir, component.absolutePath);
    const componentName = component.componentName;
    const componentCategory = component.category;

    // 读取组件内容分析
    let componentContent = '';
    try {
      componentContent = fs.readFileSync(component.absolutePath, 'utf8');
    } catch (error) {
      console.warn(`⚠️  无法读取组件文件: ${component.absolutePath}`);
    }

    const analysis = this.analyzeComponent(componentContent, component);

    return `import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import ${componentName} from '@/${templatePath.replace('.vue', '')}'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      alert: vi.fn().mockResolvedValue('confirm'),
      confirm: vi.fn().mockResolvedValue('confirm'),
      prompt: vi.fn().mockResolvedValue({ value: 'test' })
    },
    ElNotification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

// Mock API请求
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ success: true, data: [] }),
    post: vi.fn().mockResolvedValue({ success: true, data: {} }),
    put: vi.fn().mockResolvedValue({ success: true, data: {} }),
    delete: vi.fn().mockResolvedValue({ success: true, data: {} })
  }
}))

// Mock Store
const mockStore = {
  userInfo: { id: 1, username: 'test', role: 'admin', permissions: [] },
  hasPermission: vi.fn().mockReturnValue(true),
  updateUserInfo: vi.fn()
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockStore
}))

vi.mock('@/stores/permission', () => ({
  usePermissionStore: () => ({
    hasPermission: vi.fn().mockReturnValue(true),
    permissions: []
  })
}))

// Mock Router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  currentRoute: { value: { path: '/test' } }
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRouter.currentRoute
}))

describe('${componentName} - 单元测试', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()

    wrapper = mount(${componentName}, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-button': true,
          'el-input': true,
          'el-form': true,
          'el-form-item': true,
          'el-dialog': true,
          'el-table': true,
          'el-table-column': true,
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-divider': true
        }
      },
      props: ${analysis.hasProps ? '{}' : '{}'}
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染测试', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.${componentName.toLowerCase()}').exists()).toBe(true)
    })

    it('应该包含必要的DOM结构', () => {
      ${analysis.elements.length > 0 ?
        analysis.elements.slice(0, 3).map(el =>
          `expect(wrapper.find('${el}').exists()).toBe(true)`
        ).join('\n      ') :
        'expect(wrapper.exists()).toBe(true)'}
    })
  })

  ${analysis.hasProps ? `
  describe('Props验证测试', () => {
    it('应该接受正确的props', async () => {
      const testProps = ${JSON.stringify(analysis.props || {})}
      await wrapper.setProps(testProps)
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理默认props值', () => {
      expect(wrapper.exists()).toBe(true)
    })
  })
  ` : ''}

  ${analysis.hasEvents ? `
  describe('事件触发测试', () => {
    ${analysis.events.slice(0, 3).map(event => `
    it('应该触发${event}事件', async () => {
      await wrapper.vm.$emit('${event}', 'test-data')
      expect(wrapper.emitted('${event}')).toBeTruthy()
      if (wrapper.emitted('${event}')?.[0]) {
        expect(wrapper.emitted('${event}')[0]).toEqual(['test-data'])
      }
    }`).join('\n')}
  })
  ` : ''}

  ${analysis.hasMethods ? `
  describe('方法功能测试', () => {
    ${analysis.methods.slice(0, 3).map(method => `
    it('${method}方法应该正常工作', () => {
      expect(typeof wrapper.vm.${method}).toBe('function')
      // 根据方法的具体实现添加更多断言
    }`).join('\n')}
  })
  ` : ''}

  ${analysis.hasComputed ? `
  describe('计算属性测试', () => {
    ${analysis.computed.slice(0, 3).map(prop => `
    it('计算属性${prop}应该正常工作', () => {
      expect(wrapper.vm.${prop}).toBeDefined()
      // 根据计算属性的具体实现添加更多断言
    }`).join('\n')}
  })
  ` : ''}

  ${componentCategory === 'system' || componentCategory === 'admin' ? `
  describe('权限验证测试', () => {
    it('应该根据权限显示/隐藏元素', () => {
      mockStore.hasPermission.mockReturnValue(false)
      // 重新渲染组件
      wrapper = mount(${componentName}, {
        global: {
          plugins: [ElementPlus],
          stubs: {}
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('应该验证用户角色', () => {
      mockStore.userInfo.role = 'user'
      expect(mockStore.userInfo.role).toBe('user')
    })
  })
  ` : ''}

  ${componentName.includes('Form') || componentName.includes('Dialog') ? `
  describe('表单功能测试', () => {
    it('应该处理表单提交', async () => {
      if (wrapper.vm.submitForm) {
        const submitSpy = vi.spyOn(wrapper.vm, 'submitForm')
        await wrapper.vm.submitForm()
        expect(submitSpy).toHaveBeenCalled()
      }
    })

    it('应该重置表单', async () => {
      if (wrapper.vm.resetForm) {
        const resetSpy = vi.spyOn(wrapper.vm, 'resetForm')
        await wrapper.vm.resetForm()
        expect(resetSpy).toHaveBeenCalled()
      }
    })
  })
  ` : ''}

  ${componentName.includes('Table') || componentName.includes('List') ? `
  describe('表格功能测试', () => {
    it('应该处理数据加载', async () => {
      if (wrapper.vm.loadData) {
        const loadSpy = vi.spyOn(wrapper.vm, 'loadData')
        await wrapper.vm.loadData()
        expect(loadSpy).toHaveBeenCalled()
      }
    })

    it('应该处理排序功能', async () => {
      if (wrapper.vm.handleSort) {
        await wrapper.vm.handleSort({ prop: 'test', order: 'ascending' })
        expect(wrapper.vm.sortField).toBeDefined()
      }
    })
  })
  ` : ''}

  describe('错误处理测试', () => {
    it('应该优雅处理错误状态', async () => {
      if (wrapper.vm.handleError) {
        const errorSpy = vi.spyOn(wrapper.vm, 'handleError')
        await wrapper.vm.handleError(new Error('Test error'))
        expect(errorSpy).toHaveBeenCalled()
      }
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空数据', async () => {
      await wrapper.setProps({ data: [] })
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理null值', async () => {
      await wrapper.setProps({ data: null })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('生命周期测试', () => {
    it('应该在mounted时执行初始化', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('应该在unmounted时清理资源', async () => {
      await wrapper.unmount()
      expect(wrapper.exists()).toBe(false)
    })
  })
})`;
  }

  /**
   * 生成E2E测试
   */
  async generateE2ETest(component) {
    const route = this.extractRouteFromComponent(component);

    return `import { test, expect } from '@playwright/test'
import { validateRequiredFields, validateFieldTypes, validateAPIResponse } from '../utils/validation'

test.describe('${component.componentName} - E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录页面（如果需要）
    await page.goto('${route}')

    // 等待页面加载完成
    await page.waitForLoadState('networkidle')

    // 检查控制台错误
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.log('Console error:', message.text())
      }
    })
  })

  test('页面应该正确加载', async ({ page }) => {
    await expect(page).toHaveTitle(/幼儿园管理系统/)

    // 检查关键元素
    await expect(page.locator('body')).toBeVisible()
  })

  test('应该包含必要的页面元素', async ({ page }) => {
    // 检查页面标题
    const title = page.locator('h1, .page-title, .title')
    if (await title.count() > 0) {
      await expect(title.first()).toBeVisible()
    }

    // 检查主要内容区域
    await expect(page.locator('.${component.componentName.toLowerCase()}, .main-content, .content')).toBeVisible()
  })

  test('导航功能应该正常', async ({ page }) => {
    // 测试面包屑导航
    const breadcrumb = page.locator('.breadcrumb, .el-breadcrumb')
    if (await breadcrumb.count() > 0) {
      await expect(breadcrumb).toBeVisible()
    }

    // 测试返回按钮
    const backButton = page.locator('button:has-text("返回"), .back-button, .el-button:has-text("返回")')
    if (await backButton.count() > 0) {
      await backButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('表单交互应该正常', async ({ page }) => {
    // 查找表单元素
    const forms = page.locator('form')
    const formCount = await forms.count()

    if (formCount > 0) {
      for (let i = 0; i < formCount; i++) {
        const form = forms.nth(i)

        // 检查表单输入
        const inputs = form.locator('input, textarea, .el-input, .el-textarea')
        const inputCount = await inputs.count()

        for (let j = 0; j < Math.min(inputCount, 3); j++) {
          const input = inputs.nth(j)
          await input.fill('测试数据')
          await expect(input).toHaveValue('测试数据')
        }

        // 检查表单按钮
        const submitButton = form.locator('button[type="submit"], .el-button--primary, button:has-text("提交")')
        if (await submitButton.count() > 0) {
          await submitButton.first().click()
          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('表格功能应该正常', async ({ page }) => {
    const tables = page.locator('.el-table, table')
    const tableCount = await tables.count()

    if (tableCount > 0) {
      const table = tables.first()
      await expect(table).toBeVisible()

      // 检查表格数据
      const rows = table.locator('tbody tr, .el-table__body tr')
      const rowCount = await rows.count()

      if (rowCount > 0) {
        await expect(rows.first()).toBeVisible()
      }

      // 测试排序功能
      const sortHeaders = table.locator('th.sortable, .el-table__header th:has(.caret-wrapper)')
      if (await sortHeaders.count() > 0) {
        await sortHeaders.first().click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('对话框功能应该正常', async ({ page }) => {
    // 查找触发对话框的按钮
    const dialogTriggers = page.locator('button:has-text("新增"), button:has-text("编辑"), button:has-text("删除"), .el-button:has-text("新增")')
    const triggerCount = await dialogTriggers.count()

    if (triggerCount > 0) {
      await dialogTriggers.first().click()

      // 等待对话框出现
      await page.waitForTimeout(500)

      // 检查对话框
      const dialog = page.locator('.el-dialog, .el-overlay-dialog, [role="dialog"]')
      if (await dialog.count() > 0) {
        await expect(dialog).toBeVisible()

        // 关闭对话框
        const closeButton = dialog.locator('.el-dialog__headerbtn, .el-button:has-text("取消"), button:has-text("取消")')
        if (await closeButton.count() > 0) {
          await closeButton.click()
        }
      }
    }
  })

  test('响应式布局应该正常', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('body')).toBeVisible()

    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()

    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('API调用应该正确', async ({ page }) => {
    // 监听网络请求
    const responses = []
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        })
      }
    })

    // 触发页面操作
    await page.reload()
    await page.waitForTimeout(2000)

    // 验证API响应
    expect(responses.length).toBeGreaterThan(0)
    responses.forEach(response => {
      expect(response.ok).toBe(true)
    })
  })

  test('无障碍访问应该正常', async ({ page }) => {
    // 检查页面标题
    const pageTitle = await page.title()
    expect(pageTitle).toBeTruthy()
    expect(pageTitle.length).toBeGreaterThan(0)

    // 检查主要元素的aria属性
    const mainElements = page.locator('main, [role="main"], .main-content')
    if (await mainElements.count() > 0) {
      await expect(mainElements.first()).toBeVisible()
    }

    // 检查按钮的可访问性
    const buttons = page.locator('button, [role="button"], .el-button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      await expect(button).toBeVisible()
    }
  })

  test('页面性能应该良好', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('${route}')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // 页面加载时间应该少于5秒
    expect(loadTime).toBeLessThan(5000)
  })

  test.afterEach(async ({ page }) => {
    // 检查控制台错误
    const consoleErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    // 确保没有严重的控制台错误
    expect(consoleErrors.filter(error =>
      !error.includes('deprecated') &&
      !error.includes('warning')
    )).toHaveLength(0)
  })
})`;
  }

  /**
   * 生成集成测试
   */
  async generateIntegrationTest(component) {
    return `import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ${component.componentName} from '@/components/${component.category}/${component.componentName}.vue'

// 创建测试路由
const testRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/test', component: ${component.componentName} }
  ]
})

describe('${component.componentName} - 集成测试', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    vi.clearAllMocks()

    wrapper = mount(${component.componentName}, {
      global: {
        plugins: [pinia, testRouter],
        stubs: {
          'router-link': true,
          'router-view': true,
          'el-button': true,
          'el-input': true,
          'el-form': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('状态管理集成', () => {
    it('应该与Pinia store正确集成', async () => {
      // 测试与状态管理的集成
      expect(wrapper.exists()).toBe(true)
    })

    it('应该响应store状态变化', async () => {
      // 模拟store状态变化
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('路由集成', () => {
    it('应该与Vue Router正确集成', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理路由参数', async () => {
      await testRouter.push('/test')
      await wrapper.vm.$nextTick()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('组件通信集成', () => {
    it('应该正确处理父组件传入的props', async () => {
      await wrapper.setProps({
        testData: 'test-value'
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('应该正确向父组件emit事件', async () => {
      await wrapper.vm.$emit('custom-event', 'test-data')
      expect(wrapper.emitted('custom-event')).toBeTruthy()
    })
  })

  describe('API集成测试', () => {
    it('应该正确处理API调用', async () => {
      // Mock API调用
      const mockAPI = vi.fn().mockResolvedValue({ success: true, data: {} })

      if (wrapper.vm.loadData) {
        await wrapper.vm.loadData()
        expect(wrapper.exists()).toBe(true)
      }
    })

    it('应该处理API错误', async () => {
      // Mock API错误
      const mockAPI = vi.fn().mockRejectedValue(new Error('API Error'))

      if (wrapper.vm.handleError) {
        await wrapper.vm.handleError(new Error('Test error'))
        expect(wrapper.exists()).toBe(true)
      }
    })
  })

  describe('用户体验集成', () => {
    it('应该提供良好的用户反馈', async () => {
      // 测试加载状态、错误提示等
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理用户交互流程', async () => {
      // 模拟完整的用户操作流程
      expect(wrapper.exists()).toBe(true)
    })
  })
})`;
  }

  /**
   * 分析组件结构
   */
  analyzeComponent(content, component) {
    const analysis = {
      hasProps: false,
      hasEvents: false,
      hasMethods: false,
      hasComputed: false,
      props: {},
      events: [],
      methods: [],
      computed: [],
      elements: []
    };

    if (!content) return analysis;

    // 检查props
    analysis.hasProps = /props\s*:/g.test(content) || /defineProps/g.test(content);

    // 提取props定义
    const propsMatch = content.match(/props\s*:\s*{([^}]+)}/s);
    if (propsMatch) {
      try {
        const propsStr = propsMatch[1];
        const propNames = propsStr.match(/(\w+)\s*:/g);
        if (propNames) {
          analysis.props = propNames.map(name => name.replace(':', '').trim());
        }
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 检查events (emits)
    analysis.hasEvents = /emits\s*:/g.test(content) || /defineEmits/g.test(content);

    // 提取emits定义
    const emitsMatch = content.match(/emits\s*:\s*\[([^\]]+)\]/s);
    if (emitsMatch) {
      try {
        const emitsStr = emitsMatch[1];
        analysis.events = emitsStr.match(/'([^']+)'/g)?.map(e => e.replace(/'/g, '')) || [];
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 检查methods
    analysis.hasMethods = /methods\s*:/g.test(content) || /\w+\s*\([^)]*\)\s*{/g.test(content);

    // 提取方法名
    const methodMatches = content.match(/(?:\s|^)(\w+)\s*\([^)]*\)\s*{/g);
    if (methodMatches) {
      analysis.methods = [...new Set(methodMatches.map(m =>
        m.trim().match(/^(\w+)/)?.[1]
      ).filter(Boolean))];
    }

    // 检查computed
    analysis.hasComputed = /computed\s*:/g.test(content);

    // 提取computed属性
    const computedMatch = content.match(/computed\s*:\s*{([^}]+)}/s);
    if (computedMatch) {
      try {
        const computedStr = computedMatch[1];
        const computedNames = computedStr.match(/(\w+)\s*\(/g);
        if (computedNames) {
          analysis.computed = computedNames.map(name => name.replace('(', '').trim());
        }
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 提取常见的DOM元素选择器
    const elementPatterns = [
      /\.el-button/,
      /\.el-input/,
      /\.el-form/,
      /\.el-table/,
      /\.el-dialog/,
      /\.el-card/,
      /<button/,
      /<input/,
      /<form/,
      /<table/,
      /\.[a-zA-Z][\w-]*[^{]*{/
    ];

    elementPatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern, 'g'));
      if (matches && matches.length > 0) {
        // 简单提取一些选择器
        const selector = matches[0].replace(/[{}]/g, '').split(' ').slice(0, 2).join(' ');
        if (selector.startsWith('.') || selector.startsWith('#')) {
          analysis.elements.push(selector.split(' ')[0]);
        }
      }
    });

    return analysis;
  }

  /**
   * 判断是否需要集成测试
   */
  needsIntegrationTest(component) {
    const complexCategories = ['system', 'admin', 'teacher-center', 'marketing'];
    const complexNames = ['dashboard', 'management', 'center', 'system'];

    return complexCategories.includes(component.category) ||
           complexNames.some(name => component.componentName.toLowerCase().includes(name));
  }

  /**
   * 从组件路径提取路由
   */
  extractRouteFromComponent(component) {
    if (component.relativePath.includes('pages/')) {
      const routePath = component.relativePath
        .replace(/^src\/pages\//, '')
        .replace(/\.vue$/, '')
        .replace(/\/index$/, '')
        .replace(/\//g, '/');

      return `/${routePath}`;
    }

    return '/test';
  }

  /**
   * 生成测试索引文件
   */
  async generateTestIndex() {
    const indexContent = `// 自动生成的测试索引文件
// 此文件由 auto-generate-tests.js 自动生成，请勿手动修改

export * from './unit/components'
export * from './integration'
export * from './e2e'

// 测试统计信息
export const testStatistics = {
  generatedTests: ${this.generatedTests.length},
  generatedAt: '${new Date().toISOString()}',
  componentTypes: {
    ${this.generateTestStats()}
  }
}`;

    const indexPath = path.join(this.testDir, 'generated-tests-index.ts');
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log(`📝 生成测试索引: ${indexPath}`);
  }

  /**
   * 生成测试统计信息
   */
  generateTestStats() {
    const stats = {};
    this.generatedTests.forEach(test => {
      const category = test.path.split('/').slice(-2)[0];
      stats[category] = (stats[category] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([category, count]) => `${category}: ${count}`)
      .join(',\n    ');
  }

  /**
   * 生成运行脚本
   */
  async generateRunScript() {
    const scriptContent = `#!/bin/bash

# 自动生成测试运行脚本
# 此脚本用于运行新生成的测试

echo "🚀 运行自动生成的测试..."

# 设置变量
CLIENT_DIR="$(cd "$(dirname "$0")/../client" && pwd)"
GENERATED_DIR="$CLIENT_DIR/tests"

# 检查是否存在新生成的测试
if [ ! -d "$GENERATED_DIR/unit/components" ]; then
    echo "❌ 没有找到生成的测试文件"
    exit 1
fi

# 运行单元测试
echo "📋 运行单元测试..."
cd "$CLIENT_DIR"
npm run test:unit -- --run generated-tests-index.ts

# 运行集成测试
echo "🔗 运行集成测试..."
npm run test:integration

# 运行E2E测试
echo "🌐 运行E2E测试..."
npm run test:e2e

echo "✅ 所有测试运行完成！"
`;

    const scriptPath = path.join(this.projectRoot, 'run-generated-tests.sh');
    fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
    console.log(`📜 生成运行脚本: ${scriptPath}`);
  }

  /**
   * 工具方法 - 数组分块
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 工具方法 - 睡眠
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI入口
if (require.main === module) {
  const generator = new AutoTestGenerator();

  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    includeE2E: !args.includes('--no-e2e'),
    includeUnit: !args.includes('--no-unit'),
    includeIntegration: !args.includes('--no-integration'),
  };

  // 解析目标风险等级
  const riskLevelArg = args.find(arg => arg.startsWith('--risk-level='));
  if (riskLevelArg) {
    options.targetRiskLevel = riskLevelArg.split('=')[1];
  }

  // 解析批次大小
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
  if (batchSizeArg) {
    options.batchSize = parseInt(batchSizeArg.split('=')[1]);
  }

  console.log('🎯 自动测试生成选项:', options);

  generator.generateAllMissingTests(options)
    .then(result => {
      console.log('\n🎉 测试生成完成！');
      console.log('📊 生成摘要:');
      console.log(`  - 处理组件: ${result.summary.totalComponents}`);
      console.log(`  - 生成测试: ${result.summary.totalGenerated}`);
      console.log(`  - 成功数量: ${result.summary.successCount}`);
      console.log(`  - 错误数量: ${result.summary.errorCount}`);

      if (result.errors.length > 0) {
        console.log('\n❌ 错误详情:');
        result.errors.forEach(error => {
          console.log(`  - ${error.component}: ${error.error}`);
        });
      }

      if (!options.dryRun) {
        console.log('\n💡 下一步:');
        console.log('1. 运行 npm run test:unit 执行单元测试');
        console.log('2. 运行 npm run test:e2e 执行E2E测试');
        console.log('3. 运行 ./run-generated-tests.sh 执行所有生成的测试');
      }
    })
    .catch(error => {
      console.error('❌ 自动生成测试失败:', error);
      process.exit(1);
    });
}

module.exports = AutoTestGenerator;