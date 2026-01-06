#!/usr/bin/env node

/**
 * 测试覆盖率扫描工具
 * 识别无测试覆盖的Vue组件并提供创建测试的指导
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

class TestCoverageScanner {
  constructor() {
    this.clientDir = path.join(__dirname, '../client/src')
    this.testDir = path.join(__dirname, '../client/tests')
    this.components = []
    this.testFiles = []
    this.coverageMap = new Map()
    this.componentTests = new Map()
  }

  /**
   * 扫描所有Vue组件
   */
  scanVueComponents() {
    console.log('🔍 扫描Vue组件...')

    const vueFiles = glob.sync('**/*.vue', {
      cwd: this.clientDir,
      absolute: true
    })

    this.components = vueFiles.map(file => {
      const relativePath = path.relative(this.clientDir, file)
      const componentName = path.basename(file, '.vue')
      const componentDir = path.dirname(relativePath)

      return {
        absolutePath: file,
        relativePath,
        componentName,
        componentDir,
        category: this.categorizeComponent(relativePath),
        hasTest: false,
        testFile: null,
        riskLevel: 'unknown'
      }
    })

    console.log(`✅ 找到 ${this.components.length} 个Vue组件`)
    return this.components
  }

  /**
   * 扫描所有测试文件
   */
  scanTestFiles() {
    console.log('🔍 扫描测试文件...')

    const testFiles = glob.sync('**/*.test.ts', {
      cwd: this.testDir,
      absolute: true
    })

    this.testFiles = testFiles.map(file => {
      const relativePath = path.relative(this.testDir, file)
      const testName = path.basename(file, '.test.ts')

      return {
        absolutePath: file,
        relativePath,
        testName,
        category: this.categorizeTest(relativePath)
      }
    })

    console.log(`✅ 找到 ${this.testFiles.length} 个测试文件`)
    return this.testFiles
  }

  /**
   * 组件分类
   */
  categorizeComponent(relativePath) {
    if (relativePath.startsWith('components/')) {
      if (relativePath.includes('/system/')) return 'system'
      if (relativePath.includes('/ai/')) return 'ai'
      if (relativePath.includes('/activity/')) return 'activity'
      if (relativePath.includes('/marketing/')) return 'marketing'
      if (relativePath.includes('/centers/')) return 'centers'
      if (relativePath.includes('/layout/')) return 'layout'
      if (relativePath.includes('/common/')) return 'common'
      return 'component'
    }

    if (relativePath.startsWith('pages/')) {
      if (relativePath.includes('/teacher-center/')) return 'teacher-center'
      if (relativePath.includes('/admin/')) return 'admin'
      if (relativePath.includes('/system/')) return 'system'
      if (relativePath.includes('/marketing/')) return 'marketing'
      if (relativePath.includes('/finance/')) return 'finance'
      if (relativePath.includes('/enrollment/')) return 'enrollment'
      return 'page'
    }

    if (relativePath.startsWith('layouts/')) return 'layout'
    if (relativePath.startsWith('views/')) return 'view'

    return 'other'
  }

  /**
   * 测试文件分类
   */
  categorizeTest(relativePath) {
    if (relativePath.startsWith('unit/components/')) {
      const category = relativePath.split('/')[2] || 'unknown'
      return `unit-${category}`
    }

    if (relativePath.startsWith('e2e/')) return 'e2e'
    if (relativePath.startsWith('integration/')) return 'integration'
    if (relativePath.startsWith('page-detection/')) return 'page-detection'
    if (relativePath.startsWith('mobile/')) return 'mobile'

    return 'unit'
  }

  /**
   * 匹配组件和测试文件
   */
  matchComponentsWithTests() {
    console.log('🔗 匹配组件和测试文件...')

    this.components.forEach(component => {
      const possibleTestNames = [
        `${component.componentName}.test.ts`,
        `${component.componentName}.spec.ts`,
        `${component.componentName.toLowerCase()}.test.ts`,
        `${component.componentName.toUpperCase()}.test.ts`
      ]

      // 查找直接匹配的测试文件
      let testFile = this.testFiles.find(test =>
        possibleTestNames.includes(test.testName + '.test.ts') ||
        possibleTestNames.includes(test.testName + '.spec.ts')
      )

      // 如果直接匹配失败，尝试模糊匹配
      if (!testFile) {
        testFile = this.testFiles.find(test =>
          test.testName.toLowerCase().includes(component.componentName.toLowerCase()) ||
          component.componentName.toLowerCase().includes(test.testName.toLowerCase())
        )
      }

      if (testFile) {
        component.hasTest = true
        component.testFile = testFile
        this.componentTests.set(component.relativePath, testFile.relativePath)
      }
    })

    console.log(`✅ 匹配完成: ${this.components.filter(c => c.hasTest).length} 个组件有测试`)
  }

  /**
   * 评估风险等级
   */
  assessRiskLevels() {
    console.log('⚠️ 评估风险等级...')

    const highRiskCategories = [
      'finance',      // 财务管理 - 极高风险
      'system',       // 系统管理 - 高风险
      'admin',        // 管理员功能 - 高风险
      'enrollment',   // 招生管理 - 高风险
      'payment',      // 支付相关 - 极高风险
      'security'      // 安全相关 - 极高风险
    ]

    const mediumRiskCategories = [
      'teacher-center',
      'marketing',
      'ai',
      'centers'
    ]

    this.components.forEach(component => {
      if (!component.hasTest) {
        if (highRiskCategories.includes(component.category)) {
          component.riskLevel = 'high'
        } else if (mediumRiskCategories.includes(component.category)) {
          component.riskLevel = 'medium'
        } else {
          component.riskLevel = 'low'
        }
      } else {
        component.riskLevel = 'covered'
      }
    })
  }

  /**
   * 生成测试创建建议
   */
  generateTestSuggestions(component) {
    const suggestions = []

    // 基础测试建议
    suggestions.push('基础渲染测试')
    suggestions.push('Props验证测试')
    suggestions.push('事件触发测试')

    // 根据组件类型添加特定建议
    if (component.category === 'system' || component.category === 'admin') {
      suggestions.push('权限验证测试')
      suggestions.push('表单验证测试')
      suggestions.push('API调用验证')
    }

    if (component.componentName.includes('Dialog')) {
      suggestions.push('对话框开关测试')
      suggestions.push('表单提交测试')
      suggestions.push('取消操作测试')
    }

    if (component.componentName.includes('Form')) {
      suggestions.push('表单验证测试')
      suggestions.push('重置表单测试')
      suggestions.push('提交数据测试')
    }

    if (component.componentName.includes('Table') || component.componentName.includes('List')) {
      suggestions.push('数据加载测试')
      suggestions.push('排序功能测试')
      suggestions.push('筛选功能测试')
      suggestions.push('分页功能测试')
    }

    if (component.category === 'ai') {
      suggestions.push('AI响应处理测试')
      suggestions.push('错误状态测试')
      suggestions.push('加载状态测试')
    }

    return suggestions
  }

  /**
   * 生成测试模板
   */
  generateTestTemplate(component) {
    const templatePath = path.relative(this.clientDir, component.absolutePath)
    const componentName = component.componentName
    const suggestions = this.generateTestSuggestions(component)

    return `import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    }
  }
})

// Mock相关API
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ success: true, data: [] }),
    post: vi.fn().mockResolvedValue({ success: true, data: {} }),
    put: vi.fn().mockResolvedValue({ success: true, data: {} }),
    delete: vi.fn().mockResolvedValue({ success: true, data: {} })
  }
}))

// Mock相关Store
const mockStore = {
  userInfo: { id: 1, username: 'test', role: 'admin' },
  hasPermission: vi.fn().mockReturnValue(true)
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockStore
}))

describe('${componentName} - 完整测试覆盖', () => {
  let wrapper: any

  beforeEach(() => {
    // 重置所有mock
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
          'el-table-column': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染测试', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('应该包含必要的DOM结构', () => {
      // 根据实际组件结构添加断言
      expect(wrapper.find('.${componentName.toLowerCase()}').exists()).toBe(true)
    })
  })

${suggestions.map(suggestion => {
  switch(suggestion) {
    case 'Props验证测试':
      return `  describe('Props验证测试', () => {
    it('应该接受正确的props', async () => {
      // 测试props传递
      await wrapper.setProps({
        // 添加需要测试的props
      })

      // 验证props是否正确应用
      expect(wrapper.exists()).toBe(true)
    })
  })`

    case '事件触发测试':
      return `  describe('事件触发测试', () => {
    it('应该正确触发事件', async () => {
      // 测试事件触发
      await wrapper.vm.$emit('test-event', 'test-data')

      expect(wrapper.emitted('test-event')).toBeTruthy()
      expect(wrapper.emitted('test-event')?.[0]).toEqual(['test-data'])
    })
  })`

    case '表单验证测试':
      return `  describe('表单验证测试', () => {
    it('应该验证必填字段', async () => {
      if (wrapper.vm.resetForm) {
        wrapper.vm.resetForm()
        expect(typeof wrapper.vm.resetForm).toBe('function')
      }
    })
  })`

    case '权限验证测试':
      return `  describe('权限验证测试', () => {
    it('应该根据权限显示/隐藏元素', () => {
      // 测试权限相关功能
      expect(wrapper.exists()).toBe(true)
    })
  })`

    case 'API调用验证':
      return `  describe('API调用验证', () => {
    it('应该正确处理API响应', async () => {
      // 测试API调用
      await nextTick()

      // 验证API调用结果
      expect(wrapper.exists()).toBe(true)
    })
  })`

    default:
      return `  describe('${suggestion}', () => {
    it('应该正确处理${suggestion}', async () => {
      // 添加${suggestion}的具体测试逻辑
      await nextTick()
      expect(wrapper.exists()).toBe(true)
    })
  })`
  }
}).join('\n\n')}

  describe('错误处理测试', () => {
    it('应该优雅处理错误状态', async () => {
      // 测试错误处理
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空数据', async () => {
      // 测试边界条件
      await wrapper.setProps({ data: [] })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
`
  }

  /**
   * 生成覆盖率报告
   */
  generateReport() {
    console.log('📊 生成覆盖率报告...')

    const totalComponents = this.components.length
    const coveredComponents = this.components.filter(c => c.hasTest).length
    const uncoveredComponents = totalComponents - coveredComponents
    const coverageRate = ((coveredComponents / totalComponents) * 100).toFixed(2)

    // 按风险等级统计
    const highRiskUncovered = this.components.filter(c => c.riskLevel === 'high').length
    const mediumRiskUncovered = this.components.filter(c => c.riskLevel === 'medium').length
    const lowRiskUncovered = this.components.filter(c => c.riskLevel === 'low').length

    // 按类别统计
    const categoryStats = {}
    this.components.forEach(component => {
      const category = component.category
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, covered: 0, uncovered: 0 }
      }
      categoryStats[category].total++
      if (component.hasTest) {
        categoryStats[category].covered++
      } else {
        categoryStats[category].uncovered++
      }
    })

    const report = {
      summary: {
        totalComponents,
        coveredComponents,
        uncoveredComponents,
        coverageRate: `${coverageRate}%`
      },
      riskAnalysis: {
        highRiskUncovered,
        mediumRiskUncovered,
        lowRiskUncovered
      },
      categoryBreakdown: categoryStats,
      uncoveredComponents: this.components.filter(c => !c.hasTest).map(component => ({
        name: component.componentName,
        path: component.relativePath,
        category: component.category,
        riskLevel: component.riskLevel,
        suggestions: this.generateTestSuggestions(component)
      }))
    }

    return report
  }

  /**
   * 创建缺失的测试文件
   */
  async createMissingTests(outputDir = path.join(__dirname, '../generated-tests')) {
    console.log('📝 创建缺失的测试文件...')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const uncoveredComponents = this.components.filter(c => !c.hasTest)

    for (const component of uncoveredComponents) {
      const categoryDir = path.join(outputDir, component.category)
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true })
      }

      const testFilePath = path.join(categoryDir, `${component.componentName}.test.ts`)
      const testTemplate = this.generateTestTemplate(component)

      fs.writeFileSync(testFilePath, testTemplate, 'utf8')
      console.log(`✅ 创建测试文件: ${testFilePath}`)
    }

    console.log(`🎉 成功创建 ${uncoveredComponents.length} 个测试文件`)
  }

  /**
   * 运行完整扫描
   */
  async run() {
    console.log('🚀 开始测试覆盖率扫描...\n')

    this.scanVueComponents()
    this.scanTestFiles()
    this.matchComponentsWithTests()
    this.assessRiskLevels()

    const report = this.generateReport()

    // 打印报告摘要
    console.log('\n📋 测试覆盖率报告:')
    console.log('=' .repeat(50))
    console.log(`总组件数: ${report.summary.totalComponents}`)
    console.log(`已覆盖: ${report.summary.coveredComponents}`)
    console.log(`未覆盖: ${report.summary.uncoveredComponents}`)
    console.log(`覆盖率: ${report.summary.coverageRate}`)

    console.log('\n⚠️ 风险分析:')
    console.log(`高风险未覆盖: ${report.riskAnalysis.highRiskUncovered}`)
    console.log(`中风险未覆盖: ${report.riskAnalysis.mediumRiskUncovered}`)
    console.log(`低风险未覆盖: ${report.riskAnalysis.lowRiskUncovered}`)

    console.log('\n📂 类别统计:')
    Object.entries(report.categoryBreakdown).forEach(([category, stats]) => {
      const rate = ((stats.covered / stats.total) * 100).toFixed(1)
      console.log(`${category}: ${stats.covered}/${stats.total} (${rate}%)`)
    })

    // 保存详细报告
    const reportPath = path.join(__dirname, '../test-coverage-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n💾 详细报告已保存到: ${reportPath}`)

    return report
  }
}

// CLI入口
if (require.main === module) {
  const scanner = new TestCoverageScanner()

  scanner.run().then(report => {
    console.log('\n🎯 建议操作:')
    if (report.riskAnalysis.highRiskUncovered > 0) {
      console.log('1. 立即为高风险组件创建测试')
    }
    if (report.riskAnalysis.mediumRiskUncovered > 0) {
      console.log('2. 优先为中风险组件创建测试')
    }

    console.log('3. 运行 scanner.createMissingTests() 创建所有缺失的测试文件')

    // 询问是否创建测试文件
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('\n是否创建缺失的测试文件? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        scanner.createMissingTests().then(() => {
          console.log('\n✨ 测试文件创建完成!')
          process.exit(0)
        })
      } else {
        process.exit(0)
      }
      rl.close()
    })
  }).catch(error => {
    console.error('❌ 扫描失败:', error)
    process.exit(1)
  })
}

module.exports = TestCoverageScanner