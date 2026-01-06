const { chromium } = require('playwright')
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

async function runPrincipalMenuTest() {
  console.log('🚀 启动 Playwright 浏览器测试...')

  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口以便观察
    slowMo: 1000 // 慢速操作以便观察
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  const testResults = []
  const consoleErrors = []
  const networkErrors = []

  // 监听控制台错误
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const error = {
        message: msg.text(),
        location: msg.location()?.url || 'unknown',
        type: msg.type(),
        timestamp: new Date().toISOString()
      }
      consoleErrors.push(error)
      console.log(`[控制台错误] ${msg.text()}`)
    } else if (msg.type() === 'warning') {
      console.log(`[控制台警告] ${msg.text()}`)
    }
  })

  // 监听网络错误
  page.on('response', (response) => {
    if (response.status() >= 400) {
      const error = {
        url: response.url(),
        status: response.status(),
        error: response.statusText(),
        timestamp: new Date().toISOString()
      }
      networkErrors.push(error)
      console.log(`[网络错误] ${response.status()} ${response.url()}`)
    }
  })

  // 监听页面错误
  page.on('pageerror', (error) => {
    const pageError = {
      message: error.message,
      stack: error.stack || 'unknown',
      timestamp: new Date().toISOString()
    }
    consoleErrors.push({
      ...pageError,
      type: 'pageerror',
      location: pageError.stack
    })
    console.log(`[页面错误] ${error.message}`)
  })

  async function takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${name}-${timestamp}.png`
    const filepath = path.join(screenshotDir, filename)
    await page.screenshot({ path: filepath, fullPage: true })
    console.log(`📸 截图已保存: ${filename}`)
    return filepath
  }

  try {
    // 1. 访问登录页面
    console.log('🔐 访问登录页面...')
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    console.log('✅ 登录页面加载完成')
    await takeScreenshot('login-page')

    // 等待页面稳定
    await page.waitForTimeout(2000)

    // 2. 查找并点击园长登录按钮
    console.log('🔍 查找园长登录按钮...')

    // 尝试多种方式找到园长按钮
    let principalButton = null

    // 方法1: 通过XPath查找包含"园长"文本的按钮
    try {
      const buttons = await page.locator('button:has-text("园长")').all()
      if (buttons.length > 0) {
        principalButton = buttons[0]
        console.log('✅ 通过文本找到园长按钮')
      }
    } catch (e) {
      console.log('方法1失败:', e.message)
    }

    // 方法2: 查找所有按钮并检查文本
    if (!principalButton) {
      const allButtons = await page.locator('button').all()
      console.log(`🔍 找到 ${allButtons.length} 个按钮，检查内容...`)

      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent()
        console.log(`  按钮 ${i + 1}: "${buttonText}"`)

        if (buttonText && buttonText.includes('园长')) {
          principalButton = allButtons[i]
          console.log(`✅ 找到园长按钮: "${buttonText}"`)
          break
        }
      }
    }

    if (!principalButton) {
      throw new Error('未找到园长登录按钮')
    }

    // 点击园长按钮
    console.log('🔄 点击园长登录按钮...')
    await principalButton.click()

    // 3. 等待登录成功和页面跳转
    console.log('⏳ 等待登录跳转...')
    await page.waitForURL('**/dashboard**', { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    console.log('✅ 登录成功，进入仪表板')
    await takeScreenshot('dashboard-after-login')

    // 等待页面稳定
    await page.waitForTimeout(3000)

    // 4. 查找侧边栏菜单
    console.log('🔍 查找侧边栏菜单...')

    // 等待侧边栏加载
    await page.waitForSelector('.sidebar, .el-menu, [class*="sidebar"], [class*="menu"]', { timeout: 10000 })
    console.log('✅ 侧边栏加载完成')

    // 5. 定义要测试的菜单项
    const menuItems = [
      '系统中心',
      '数据分析中心',
      '人事管理中心',
      '财务管理中心',
      '活动管理中心',
      '教学管理中心',
      '客户池中心',
      '营销中心'
    ]

    // 6. 依次测试每个菜单项
    for (const menuName of menuItems) {
      console.log(`\n🔍 开始测试菜单项: ${menuName}`)

      const startTime = Date.now()
      const previousErrorCount = consoleErrors.length
      const previousNetworkErrorCount = networkErrors.length

      const result = {
        menuName,
        success: false,
        consoleErrors: [],
        networkErrors: [],
        screenshot: null,
        error: null,
        duration: 0,
        url: null
      }

      try {
        // 查找菜单项
        const menuItem = page.locator(`text=${menuName}`).first()

        if (await menuItem.isVisible()) {
          console.log(`✅ 找到菜单项: ${menuName}`)

          // 点击菜单项
          await menuItem.click()
          console.log(`🔄 点击菜单项: ${menuName}`)

          // 等待页面加载
          await page.waitForLoadState('networkidle', { timeout: 15000 })
          await page.waitForTimeout(3000)

          // 截图
          result.screenshot = await takeScreenshot(`menu-${menuName.replace(/\s+/g, '-')}`)

          // 检查新出现的错误
          result.consoleErrors = consoleErrors.slice(previousErrorCount)
          result.networkErrors = networkErrors.slice(previousNetworkErrorCount)

          // 获取当前URL
          result.url = page.url()
          console.log(`📍 当前页面URL: ${result.url}`)

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

        } else {
          console.log(`⚠️  菜单项 "${menuName}" 不可见，跳过测试`)
          result.error = '菜单项不可见'
        }

      } catch (error) {
        console.log(`❌ 测试菜单项 "${menuName}" 时发生异常: ${error.message}`)
        result.error = error.message
        result.screenshot = await takeScreenshot(`error-menu-${menuName.replace(/\s+/g, '-')}`)
      }

      result.duration = Date.now() - startTime
      testResults.push(result)

      // 返回仪表板准备下一个测试
      try {
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' })
        await page.waitForTimeout(1000)
      } catch (returnError) {
        console.log(`⚠️  无法返回仪表板: ${returnError.message}`)
      }
    }

    // 7. 生成测试报告
    console.log('\n📊 生成测试报告...')

    const report = {
      testTime: new Date().toISOString(),
      summary: {
        totalTests: testResults.length,
        successfulTests: testResults.filter(r => r.success).length,
        failedTests: testResults.filter(r => !r.success).length,
        totalConsoleErrors: consoleErrors.length,
        totalNetworkErrors: networkErrors.length
      },
      results: testResults,
      allConsoleErrors: consoleErrors,
      allNetworkErrors: networkErrors
    }

    // 保存详细报告
    const reportPath = path.join(reportDir, 'principal-menu-test-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 详细报告已保存: ${reportPath}`)

    // 生成控制台报告
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
      testResults.filter(r => !r.success).forEach((result, index) => {
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

  } catch (error) {
    console.error(`❌ 测试过程中发生严重错误: ${error.message}`)
    await takeScreenshot('critical-error')
    throw error

  } finally {
    await browser.close()
    console.log('🧹 浏览器已关闭')
  }
}

// 主执行函数
async function main() {
  try {
    await runPrincipalMenuTest()
  } catch (error) {
    console.error(`❌ 测试执行失败: ${error.message}`)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { runPrincipalMenuTest }