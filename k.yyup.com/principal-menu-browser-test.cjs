const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

// 创建截图目录
const screenshotDir = path.join(__dirname, 'test-results', 'screenshots')
const reportDir = path.join(__dirname, 'test-results')

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true })
}

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true })
}

class PrincipalMenuTester {
  constructor() {
    this.browser = null
    this.page = null
    this.consoleErrors = []
    this.networkErrors = []
    this.testResults = []
  }

  async init() {
    console.log('🚀 启动浏览器...')
    this.browser = await puppeteer.launch({
      headless: false, // 显示浏览器窗口
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    this.page = await this.browser.newPage()

    // 监听控制台错误
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const error = {
          message: msg.text(),
          location: msg.location()?.url || 'unknown',
          type: msg.type(),
          timestamp: new Date().toISOString()
        }
        this.consoleErrors.push(error)
        console.log(`[控制台错误] ${msg.text()}`)
      } else if (msg.type() === 'warning') {
        console.log(`[控制台警告] ${msg.text()}`)
      }
    })

    // 监听网络错误
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        const error = {
          url: response.url(),
          status: response.status(),
          error: response.statusText(),
          timestamp: new Date().toISOString()
        }
        this.networkErrors.push(error)
        console.log(`[网络错误] ${response.status()} ${response.url()}`)
      }
    })

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      const pageError = {
        message: error.message,
        stack: error.stack || 'unknown',
        timestamp: new Date().toISOString()
      }
      this.consoleErrors.push({
        ...pageError,
        type: 'pageerror',
        location: pageError.stack
      })
      console.log(`[页面错误] ${error.message}`)
    })

    console.log('✅ 浏览器启动完成')
  }

  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${name}-${timestamp}.png`
    const filepath = path.join(screenshotDir, filename)
    await this.page.screenshot({ path: filepath, fullPage: true })
    console.log(`📸 截图已保存: ${filename}`)
    return filepath
  }

  async clearErrors() {
    const previousConsoleErrors = [...this.consoleErrors]
    const previousNetworkErrors = [...this.networkErrors]

    // 清空错误数组，但保留之前的记录用于比较
    this.consoleErrors = []
    this.networkErrors = []

    return {
      previousConsoleErrors,
      previousNetworkErrors
    }
  }

  async loginAsPrincipal() {
    console.log('🔐 开始登录流程...')

    // 访问登录页面
    await this.page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    console.log('✅ 登录页面加载完成')

    await this.takeScreenshot('login-page')

    // 等待页面完全加载
    await this.page.waitForTimeout(2000)

    // 查找并点击"园长"登录按钮
    try {
      // 尝试多种选择器来找到园长按钮
      const principalSelectors = [
        'button:contains("园长")',
        'button[class*="principal"]',
        '[data-role="principal"]',
        'button[onclick*="principal"]',
        '.login-role button:contains("园长")'
      ]

      let principalButton = null
      for (const selector of principalSelectors) {
        try {
          // 使用XPath来查找包含文本的按钮
          const xpathSelector = `//button[contains(text(), '园长')]`
          const buttons = await this.page.$x(xpathSelector)
          if (buttons.length > 0) {
            principalButton = buttons[0]
            console.log(`✅ 通过选择器找到园长按钮: ${selector}`)
            break
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (!principalButton) {
        // 如果还是找不到，查找所有按钮并打印文本
        const allButtons = await this.page.$$('button')
        console.log('🔍 查找所有按钮:')
        for (let i = 0; i < allButtons.length; i++) {
          const buttonText = await allButtons[i].evaluate(el => el.textContent.trim())
          console.log(`  按钮 ${i + 1}: "${buttonText}"`)
          if (buttonText.includes('园长')) {
            principalButton = allButtons[i]
            console.log(`✅ 找到园长按钮: "${buttonText}"`)
            break
          }
        }
      }

      if (!principalButton) {
        throw new Error('未找到园长登录按钮')
      }

      await principalButton.click()
      console.log('🔄 点击园长登录按钮')

      // 等待跳转
      await this.page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 15000
      })

      console.log('✅ 登录成功，页面跳转完成')
      await this.takeScreenshot('dashboard-after-login')

    } catch (error) {
      console.error(`❌ 登录失败: ${error.message}`)
      await this.takeScreenshot('login-error')
      throw error
    }
  }

  async testMenuItem(menuName, selector) {
    console.log(`\n🔍 开始测试菜单项: ${menuName}`)

    const startTime = Date.now()
    const { previousConsoleErrors, previousNetworkErrors } = await this.clearErrors()

    const result = {
      menuName,
      selector,
      success: false,
      consoleErrors: [],
      networkErrors: [],
      screenshot: null,
      error: null,
      duration: 0
    }

    try {
      // 查找菜单项
      const menuItem = await this.page.$(selector)
      if (!menuItem) {
        throw new Error(`未找到菜单项: ${menuName}`)
      }

      console.log(`✅ 找到菜单项: ${menuName}`)

      // 点击菜单项
      await menuItem.click()
      console.log(`🔄 点击菜单项: ${menuName}`)

      // 等待页面加载
      await this.page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 15000
      })

      await this.page.waitForTimeout(3000) // 额外等待时间让JavaScript执行完成

      // 截图
      result.screenshot = await this.takeScreenshot(`menu-${menuName.replace(/\s+/g, '-')}`)

      // 检查新出现的错误
      result.consoleErrors = this.consoleErrors.slice(previousConsoleErrors.length)
      result.networkErrors = this.networkErrors.slice(previousNetworkErrors.length)

      if (result.consoleErrors.length > 0 || result.networkErrors.length > 0) {
        console.log(`❌ 菜单项 "${menuName}" 发现错误:`)

        result.consoleErrors.forEach(error => {
          console.log(`   - 控制台错误: ${error.message}`)
        })

        result.networkErrors.forEach(error => {
          console.log(`   - 网络错误: ${error.status} ${error.url}`)
        })
      } else {
        console.log(`✅ 菜单项 "${menuName}" 测试通过，无错误`)
        result.success = true
      }

      // 获取当前URL
      result.currentUrl = this.page.url()
      console.log(`📍 当前页面URL: ${result.currentUrl}`)

    } catch (error) {
      console.log(`❌ 测试菜单项 "${menuName}" 时发生异常: ${error.message}`)
      result.error = error.message
      result.screenshot = await this.takeScreenshot(`error-menu-${menuName.replace(/\s+/g, '-')}`)
    }

    result.duration = Date.now() - startTime
    this.testResults.push(result)

    // 返回仪表板准备下一个测试
    try {
      await this.page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' })
      await this.page.waitForTimeout(1000)
    } catch (returnError) {
      console.log(`⚠️  无法返回仪表板: ${returnError.message}`)
    }

    return result
  }

  async runAllTests() {
    console.log('🎯 开始执行完整的园长菜单测试...')

    try {
      // 1. 登录
      await this.loginAsPrincipal()

      // 2. 等待侧边栏加载
      await this.page.waitForTimeout(2000)
      console.log('✅ 等待侧边栏加载完成')

      // 3. 定义要测试的菜单项
      const menuItems = [
        { name: '系统中心', selectors: [
          'text=系统中心',
          '[href*="system"]',
          '.menu-item:contains("系统中心")',
          'a:contains("系统中心")'
        ]},
        { name: '数据分析中心', selectors: [
          'text=数据分析中心',
          '[href*="analytics"]',
          '.menu-item:contains("数据分析中心")',
          'a:contains("数据分析中心")'
        ]},
        { name: '人事管理中心', selectors: [
          'text=人事管理中心',
          '[href*="personnel"]',
          '.menu-item:contains("人事管理中心")',
          'a:contains("人事管理中心")'
        ]},
        { name: '财务管理中心', selectors: [
          'text=财务管理中心',
          '[href*="finance"]',
          '.menu-item:contains("财务管理中心")',
          'a:contains("财务管理中心")'
        ]},
        { name: '活动管理中心', selectors: [
          'text=活动管理中心',
          '[href*="activity"]',
          '.menu-item:contains("活动管理中心")',
          'a:contains("活动管理中心")'
        ]},
        { name: '教学管理中心', selectors: [
          'text=教学管理中心',
          '[href*="teaching"]',
          '.menu-item:contains("教学管理中心")',
          'a:contains("教学管理中心")'
        ]}
      ]

      // 4. 依次测试每个菜单项
      for (const menuItem of menuItems) {
        let tested = false

        for (const selector of menuItem.selectors) {
          try {
            // 检查元素是否存在
            const element = await this.page.$(selector)
            if (element) {
              await this.testMenuItem(menuItem.name, selector)
              tested = true
              break
            }
          } catch (e) {
            // 继续尝试下一个选择器
          }
        }

        if (!tested) {
          console.log(`⚠️  菜单项 "${menuItem.name}" 未找到可用选择器，跳过测试`)

          // 尝试查找所有链接并打印
          const allLinks = await this.page.$$('a, .menu-item, .el-menu-item')
          console.log(`🔍 当前页面共有 ${allLinks.length} 个链接元素`)

          for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
            try {
              const linkText = await allLinks[i].evaluate(el => el.textContent?.trim() || '')
              console.log(`  链接 ${i + 1}: "${linkText}"`)
            } catch (e) {
              // 忽略错误
            }
          }
        }
      }

      // 5. 生成测试报告
      await this.generateReport()

    } catch (error) {
      console.error(`❌ 测试过程中发生严重错误: ${error.message}`)
      await this.takeScreenshot('critical-error')
    }
  }

  async generateReport() {
    console.log('\n📊 生成测试报告...')

    const report = {
      testTime: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        successfulTests: this.testResults.filter(r => r.success).length,
        failedTests: this.testResults.filter(r => !r.success).length,
        totalConsoleErrors: this.consoleErrors.length,
        totalNetworkErrors: this.networkErrors.length
      },
      results: this.testResults,
      allConsoleErrors: this.consoleErrors,
      allNetworkErrors: this.networkErrors
    }

    // 保存详细报告
    const reportPath = path.join(reportDir, 'principal-menu-test-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 详细报告已保存: ${reportPath}`)

    // 生成简洁的控制台报告
    console.log('\n' + '='.repeat(60))
    console.log('📋 测试报告摘要')
    console.log('='.repeat(60))
    console.log(`测试时间: ${report.testTime}`)
    console.log(`总测试数: ${report.summary.totalTests}`)
    console.log(`成功测试: ${report.summary.successfulTests}`)
    console.log(`失败测试: ${report.summary.failedTests}`)
    console.log(`控制台错误: ${report.summary.totalConsoleErrors}`)
    console.log(`网络错误: ${report.summary.totalNetworkErrors}`)

    if (report.summary.failedTests > 0) {
      console.log('\n❌ 失败的测试:')
      this.testResults.filter(r => !r.success).forEach((result, index) => {
        console.log(`${index + 1}. ${result.menuName}`)
        if (result.error) {
          console.log(`   错误: ${result.error}`)
        }
        if (result.consoleErrors.length > 0) {
          console.log(`   控制台错误: ${result.consoleErrors.length} 个`)
        }
        if (result.networkErrors.length > 0) {
          console.log(`   网络错误: ${result.networkErrors.length} 个`)
        }
      })
    }

    if (report.summary.totalConsoleErrors > 0) {
      console.log('\n🔥 控制台错误详情:')
      report.allConsoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`)
        if (error.location !== 'unknown') {
          console.log(`   位置: ${error.location}`)
        }
      })
    }

    if (report.summary.totalNetworkErrors > 0) {
      console.log('\n🌐 网络错误详情:')
      report.allNetworkErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.status}] ${error.url}`)
        console.log(`   错误: ${error.error}`)
      })
    }

    console.log('\n✅ 测试完成!')
    console.log(`📸 截图保存在: ${screenshotDir}`)
    console.log(`📄 报告保存在: ${reportPath}`)

    return report
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
      console.log('🧹 浏览器已关闭')
    }
  }
}

// 主执行函数
async function main() {
  const tester = new PrincipalMenuTester()

  try {
    await tester.init()
    await tester.runAllTests()
  } catch (error) {
    console.error(`❌ 测试执行失败: ${error.message}`)
  } finally {
    await tester.cleanup()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error)
}

module.exports = PrincipalMenuTester