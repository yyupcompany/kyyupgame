const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

async function runCompleteTest() {
  console.log('🚀 执行完整的园长菜单测试...')

  // 创建结果目录
  const screenshotDir = path.join(__dirname, 'test-results', 'screenshots')
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true })
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--disable-web-security']
  })

  const page = await browser.newPage()

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
      console.log(`[网络错误] ${response.status} ${response.url}`)
    }
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

    await takeScreenshot('login-page-start')
    await page.waitForTimeout(3000)

    // 2. 尝试多种方式登录
    console.log('🔍 尝试登录...')

    let loginSuccess = false

    // 方法1: 查找园长按钮
    try {
      const buttons = await page.$$('button')
      console.log(`找到 ${buttons.length} 个按钮`)

      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].evaluate(el => el.textContent.trim())
        console.log(`按钮 ${i + 1}: "${buttonText}"`)

        if (buttonText.includes('园长')) {
          console.log('🎯 找到园长按钮，尝试点击...')
          await buttons[i].click()
          await page.waitForTimeout(5000)

          const currentUrl = page.url()
          console.log(`点击后URL: ${currentUrl}`)

          if (currentUrl.includes('dashboard')) {
            loginSuccess = true
            console.log('✅ 登录成功！')
            break
          }
        }
      }
    } catch (e) {
      console.log(`方法1失败: ${e.message}`)
    }

    // 方法2: 如果方法1失败，尝试直接访问仪表板
    if (!loginSuccess) {
      console.log('⚠️  方法1失败，尝试直接访问仪表板...')
      try {
        await page.goto('http://localhost:5173/dashboard', {
          waitUntil: 'networkidle',
          timeout: 15000
        })

        const currentUrl = page.url()
        if (currentUrl.includes('dashboard')) {
          loginSuccess = true
          console.log('✅ 直接访问仪表板成功！')
        }
      } catch (e) {
        console.log(`直接访问失败: ${e.message}`)
      }
    }

    // 方法3: 如果仍然失败，模拟表单登录
    if (!loginSuccess) {
      console.log('⚠️  尝试模拟登录流程...')
      try {
        // 检查是否有用户名和密码输入框
        const usernameInput = await page.$('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]')
        const passwordInput = await page.$('input[type="password"], input[name="password"], input[placeholder*="密码"]')

        if (usernameInput && passwordInput) {
          await usernameInput.fill('principal')
          await passwordInput.fill('123456')

          const loginButton = await page.$('button[type="submit"], button:has-text("登录"), button:has-text("登录")')
          if (loginButton) {
            await loginButton.click()
            await page.waitForTimeout(5000)

            const currentUrl = page.url()
            if (currentUrl.includes('dashboard')) {
              loginSuccess = true
              console.log('✅ 表单登录成功！')
            }
          }
        }
      } catch (e) {
        console.log(`表单登录失败: ${e.message}`)
      }
    }

    if (!loginSuccess) {
      throw new Error('所有登录方法都失败了')
    }

    await takeScreenshot('dashboard-success')
    await page.waitForTimeout(3000)

    // 3. 分析侧边栏菜单
    console.log('🔍 分析侧边栏菜单...')

    // 查找所有可能的菜单容器
    const menuContainers = await page.$$('.sidebar, .el-menu, nav, [class*="menu"], [class*="nav"]')
    console.log(`找到 ${menuContainers.length} 个可能的菜单容器`)

    // 查找所有菜单项
    const menuItems = await page.$$('a, button[onclick*="/"], .menu-item, .el-menu-item, [role="menuitem"]')
    console.log(`找到 ${menuItems.length} 个菜单项`)

    const availableMenus = []

    for (let i = 0; i < menuItems.length; i++) {
      try {
        const text = await menuItems[i].evaluate(el => el.textContent?.trim() || '')
        const isVisible = await menuItems[i].isVisible()
        const href = await menuItems[i].evaluate(el => el.href || '')

        if (text && isVisible && text.length < 50) {
          availableMenus.push({
            text,
            href,
            element: menuItems[i],
            index: i
          })
          console.log(`  ${availableMenus.length}. "${text}" -> ${href}`)
        }
      } catch (e) {
        // 忽略错误
      }
    }

    console.log(`\n📋 找到 ${availableMenus.length} 个可见菜单项`)

    // 4. 测试目标菜单项
    const targetMenus = [
      '系统中心',
      '数据分析中心',
      '人事管理中心',
      '财务管理中心',
      '活动管理中心',
      '教学管理中心'
    ]

    console.log('\n🎯 测试目标菜单项...')

    const testResults = []

    for (const targetMenu of targetMenus) {
      console.log(`\n🔍 测试菜单: ${targetMenu}`)

      const result = {
        menuName: targetMenu,
        success: false,
        found: false,
        error: null,
        consoleErrors: [],
        networkErrors: [],
        screenshot: null,
        url: null
      }

      try {
        // 查找匹配的菜单项
        let matchedItem = null

        for (const menu of availableMenus) {
          if (menu.text.includes(targetMenu) || targetMenu.includes(menu.text)) {
            matchedItem = menu
            break
          }
        }

        if (matchedItem) {
          result.found = true
          console.log(`✅ 找到匹配菜单项: "${matchedItem.text}"`)

          const previousConsoleErrors = consoleErrors.length
          const previousNetworkErrors = networkErrors.length

          // 点击菜单项
          await matchedItem.element.click()
          await page.waitForTimeout(5000)

          // 检查错误
          result.consoleErrors = consoleErrors.slice(previousConsoleErrors)
          result.networkErrors = networkErrors.slice(previousNetworkErrorCount)

          result.url = page.url()
          console.log(`跳转后URL: ${result.url}`)

          // 截图
          result.screenshot = await takeScreenshot(`menu-${targetMenu.replace(/\s+/g, '-')}`)

          if (result.consoleErrors.length > 0 || result.networkErrors.length > 0) {
            console.log(`❌ 发现错误:`)
            result.consoleErrors.forEach(error => {
              console.log(`   控制台错误: ${error.message}`)
            })
            result.networkErrors.forEach(error => {
              console.log(`   网络错误: ${error.status} ${error.url}`)
            })
          } else {
            console.log(`✅ 菜单项 "${targetMenu}" 测试通过`)
            result.success = true
          }

          // 返回仪表板
          await page.goto('http://localhost:5173/dashboard', {
            waitUntil: 'networkidle'
          })
          await page.waitForTimeout(2000)

        } else {
          result.error = '未找到匹配的菜单项'
          console.log(`❌ 未找到菜单项: ${targetMenu}`)
        }

      } catch (error) {
        result.error = error.message
        console.log(`❌ 测试失败: ${error.message}`)
        result.screenshot = await takeScreenshot(`error-${targetMenu.replace(/\s+/g, '-')}`)
      }

      testResults.push(result)
    }

    // 5. 生成测试报告
    console.log('\n📊 生成测试报告...')

    const report = {
      testTime: new Date().toISOString(),
      loginSuccess,
      availableMenusCount: availableMenus.length,
      availableMenus: availableMenus.map(m => ({ text: m.text, href: m.href })),
      summary: {
        totalTests: testResults.length,
        successfulTests: testResults.filter(r => r.success).length,
        failedTests: testResults.filter(r => !r.success).length,
        foundTests: testResults.filter(r => r.found).length,
        totalConsoleErrors: consoleErrors.length,
        totalNetworkErrors: networkErrors.length
      },
      results: testResults,
      allConsoleErrors: consoleErrors,
      allNetworkErrors: networkErrors
    }

    const reportPath = path.join(__dirname, 'test-results', 'complete-test-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log('\n' + '='.repeat(60))
    console.log('📋 完整测试报告')
    console.log('='.repeat(60))
    console.log(`登录状态: ${loginSuccess ? '成功' : '失败'}`)
    console.log(`可用菜单数: ${availableMenus.length}`)
    console.log(`测试菜单数: ${testResults.length}`)
    console.log(`成功测试: ${report.summary.successfulTests}`)
    console.log(`失败测试: ${report.summary.failedTests}`)
    console.log(`找到菜单: ${report.summary.foundTests}`)
    console.log(`控制台错误: ${report.summary.totalConsoleErrors}`)
    console.log(`网络错误: ${report.summary.totalNetworkErrors}`)

    console.log('\n📋 可用菜单:')
    availableMenus.forEach((menu, index) => {
      console.log(`${index + 1}. "${menu.text}" -> ${menu.href}`)
    })

    if (report.summary.failedTests > 0) {
      console.log('\n❌ 失败的测试:')
      testResults.filter(r => !r.success).forEach((result, index) => {
        console.log(`${index + 1}. ${result.menuName}: ${result.error || '未知错误'}`)
      })
    }

    console.log(`\n📄 详细报告已保存: ${reportPath}`)

    await takeScreenshot('test-complete')

  } catch (error) {
    console.error(`❌ 测试过程中发生严重错误: ${error.message}`)
    await takeScreenshot('critical-error')
  } finally {
    await browser.close()
    console.log('🧹 浏览器已关闭')
  }
}

// 执行测试
runCompleteTest().catch(console.error)