#!/usr/bin/env node

/**
 * 测试结果分析器
 * 用于分析页面渲染测试的结果，并提供详细的报告
 */

const fs = require('fs')
const path = require('path')

class TestResultAnalyzer {
  constructor() {
    this.testResults = {
      login: {},
      main: {},
      ai: {},
      performance: {},
      css: {}
    }
    this.issues = []
    this.warnings = []
    this.successes = []
  }

  analyzeLogFile(logPath) {
    console.log(`🔍 分析测试日志: ${logPath}`)

    try {
      const content = fs.readFileSync(logPath, 'utf8')
      const lines = content.split('\n')

      lines.forEach(line => {
        this.parseLine(line)
      })

      this.generateReport()
    } catch (error) {
      console.error('❌ 无法读取日志文件:', error.message)
    }
  }

  parseLine(line) {
    // 解析不同类型的测试结果
    if (line.includes('页面标题:')) {
      this.testResults.login.pageTitle = line.split(': ')[1]
    }
    if (line.includes('登录表单数量:')) {
      this.testResults.login.formCount = parseInt(line.match(/\d+/)[0])
    }
    if (line.includes('重复ID数量:')) {
      const count = parseInt(line.match(/\d+/)[0])
      if (count > 0) {
        this.issues.push(`发现 ${count} 个重复的DOM ID`)
      }
    }
    if (line.includes('主布局组件数量:')) {
      this.testResults.main.layoutCount = parseInt(line.match(/\d+/)[0])
    }
    if (line.includes('侧边栏数量:')) {
      this.testResults.main.sidebarCount = parseInt(line.match(/\d+/)[0])
    }
    if (line.includes('AI助手容器数量:')) {
      this.testResults.ai.containerCount = parseInt(line.match(/\d+/)[0])
    }
    if (line.includes('消息列表数量:')) {
      this.testResults.ai.messageListCount = parseInt(line.match(/\d+/)[0])
    }
    if (line.includes('会话标签页数量:')) {
      this.testResults.ai.conversationTabs = parseInt(line.match(/\d+/)[0])
    }
    if (line.includes('DOM统计:')) {
      const stats = line.match(/总节点=(\d+), 交互元素=(\d+)/)
      if (stats) {
        this.testResults.performance.domNodes = parseInt(stats[1])
        this.testResults.performance.interactiveElements = parseInt(stats[2])
      }
    }
    if (line.includes('累积布局偏移(CLS):')) {
      this.testResults.css.cumulativeLayoutShift = parseFloat(line.match(/[\d.]+/)[0])
    }
  }

  checkForIssues() {
    // 检查重复组件问题
    if (this.testResults.login.formCount > 1) {
      this.issues.push('登录页面存在重复的表单组件')
    }
    if (this.testResults.main.sidebarCount > 2) {
      this.issues.push('主页面存在过多的侧边栏组件')
    }
    if (this.testResults.ai.messageListCount > 2) {
      this.issues.push('AI助手页面存在重复的消息列表')
    }

    // 检查性能问题
    if (this.testResults.performance.domNodes > 5000) {
      this.warnings.push('DOM节点数量较多，可能影响性能')
    }
    if (this.testResults.css.cumulativeLayoutShift > 0.1) {
      this.warnings.push('累积布局偏移较大，影响用户体验')
    }

    // 检查功能完整性
    if (this.testResults.ai.conversationTabs === 0) {
      this.warnings.push('会话标签页功能可能未正确渲染')
    }

    // 检查成功项
    if (this.testResults.login.formCount === 1) {
      this.successes.push('登录页面表单渲染正确')
    }
    if (this.testResults.ai.containerCount >= 1) {
      this.successes.push('AI助手主容器渲染正常')
    }
  }

  generateReport() {
    this.checkForIssues()

    console.log('\n' + '='.repeat(60))
    console.log('📊 页面渲染测试分析报告')
    console.log('='.repeat(60))

    // 登录页面
    console.log('\n🔐 登录页面分析:')
    console.log(`  - 页面标题: ${this.testResults.login.pageTitle || '未获取'}`)
    console.log(`  - 表单组件数量: ${this.testResults.login.formCount || '未检测'}`)

    // 主页面
    console.log('\n🏠 主页面分析:')
    console.log(`  - 主布局组件: ${this.testResults.main.layoutCount || '未检测'}`)
    console.log(`  - 侧边栏组件: ${this.testResults.main.sidebarCount || '未检测'}`)

    // AI助手页面
    console.log('\n🤖 AI助手页面分析:')
    console.log(`  - AI助手容器: ${this.testResults.ai.containerCount || '未检测'}`)
    console.log(`  - 消息列表: ${this.testResults.ai.messageListCount || '未检测'}`)
    console.log(`  - 会话标签页: ${this.testResults.ai.conversationTabs || '未检测'}`)

    // 性能分析
    console.log('\n📊 性能分析:')
    console.log(`  - DOM节点总数: ${this.testResults.performance.domNodes || '未检测'}`)
    console.log(`  - 交互元素数量: ${this.testResults.performance.interactiveElements || '未检测'}`)
    console.log(`  - 累积布局偏移: ${this.testResults.css.cumulativeLayoutShift || '未检测'}`)

    // 问题汇总
    if (this.issues.length > 0) {
      console.log('\n❌ 发现的问题:')
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告信息:')
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`)
      })
    }

    if (this.successes.length > 0) {
      console.log('\n✅ 成功项:')
      this.successes.forEach((success, index) => {
        console.log(`  ${index + 1}. ${success}`)
      })
    }

    // 总体评估
    console.log('\n🎯 总体评估:')
    const totalIssues = this.issues.length
    const totalWarnings = this.warnings.length

    if (totalIssues === 0 && totalWarnings === 0) {
      console.log('  🟢 页面渲染状态: 优秀')
    } else if (totalIssues === 0 && totalWarnings <= 2) {
      console.log('  🟡 页面渲染状态: 良好')
    } else if (totalIssues <= 2) {
      console.log('  🟠 页面渲染状态: 一般')
    } else {
      console.log('  🔴 页面渲染状态: 需要修复')
    }

    // 保存报告到文件
    this.saveReportToFile()
  }

  saveReportToFile() {
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      issues: this.issues,
      warnings: this.warnings,
      successes: this.successes,
      summary: {
        totalIssues: this.issues.length,
        totalWarnings: this.warnings.length,
        totalSuccesses: this.successes.length
      }
    }

    const reportPath = 'test-results/page-rendering-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 详细报告已保存到: ${reportPath}`)
  }
}

// 检查是否有测试结果文件
const checkTestResults = () => {
  const testDir = 'test-results'

  if (!fs.existsSync(testDir)) {
    console.log('📁 创建测试结果目录...')
    fs.mkdirSync(testDir, { recursive: true })
  }

  console.log('🔍 检查测试结果文件...')

  const screenshots = fs.readdirSync(testDir).filter(file => file.endsWith('.png'))
  if (screenshots.length > 0) {
    console.log(`📸 发现 ${screenshots.length} 个页面快照:`)
    screenshots.forEach(screenshot => {
      console.log(`  - ${screenshot}`)
    })
  }

  const reports = fs.readdirSync(testDir).filter(file => file.endsWith('.json'))
  if (reports.length > 0) {
    console.log(`📊 发现 ${reports.length} 个测试报告:`)
    reports.forEach(report => {
      console.log(`  - ${report}`)
    })
  }
}

// 主函数
const main = () => {
  console.log('🚀 启动页面渲染测试分析...')

  checkTestResults()

  // 如果有日志文件，进行分析
  const logFiles = [
    'test-results/test.log',
    'playwright-report/test.log'
  ].filter(file => fs.existsSync(file))

  if (logFiles.length > 0) {
    const analyzer = new TestResultAnalyzer()
    logFiles.forEach(logFile => {
      analyzer.analyzeLogFile(logFile)
    })
  } else {
    console.log('ℹ️  未找到测试日志文件，请先运行页面渲染测试')
    console.log('💡 运行命令: npm run test:e2e page-rendering-verification')
  }
}

if (require.main === module) {
  main()
}