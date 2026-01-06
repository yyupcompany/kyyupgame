const { chromium } = require('playwright')

async function debugSidebar() {
  console.log('🔍 开始调试侧边栏菜单...')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  try {
    // 访问登录页面
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // 点击园长登录按钮
    const principalButton = page.locator('button:has-text("园长")').first()
    await principalButton.click()

    // 等待登录成功
    await page.waitForURL('**/dashboard**', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('✅ 登录成功，开始分析侧边栏...')

    // 1. 查找所有可能的侧边栏容器
    const sidebarSelectors = [
      '.sidebar',
      '.el-menu',
      '.menu',
      '[class*="sidebar"]',
      '[class*="menu"]',
      'nav',
      '.navigation',
      '[class*="nav"]'
    ]

    let sidebarElement = null
    for (const selector of sidebarSelectors) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          sidebarElement = element
          console.log(`✅ 找到侧边栏容器: ${selector}`)
          break
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!sidebarElement) {
      console.log('❌ 未找到侧边栏容器，尝试查找所有链接元素...')

      // 查找所有链接
      const allLinks = await page.locator('a, button, [role="menuitem"], .menu-item, .el-menu-item').all()
      console.log(`🔍 找到 ${allLinks.length} 个可能的菜单项`)

      for (let i = 0; i < Math.min(allLinks.length, 20); i++) {
        try {
          const text = await allLinks[i].textContent()
          const isVisible = await allLinks[i].isVisible()
          console.log(`  ${i + 1}. "${text}" - 可见: ${isVisible}`)
        } catch (e) {
          console.log(`  ${i + 1}. 无法获取文本内容`)
        }
      }
    } else {
      console.log('✅ 找到侧边栏，分析其中的菜单项...')

      // 在侧边栏内查找所有菜单项
      const menuItems = await sidebarElement.locator('a, button, [role="menuitem"], .menu-item, .el-menu-item, li').all()
      console.log(`📋 侧边栏内找到 ${menuItems.length} 个菜单项`)

      for (let i = 0; i < menuItems.length; i++) {
        try {
          const text = await menuItems[i].textContent()
          const isVisible = await menuItems[i].isVisible()
          const tagName = await menuItems[i].evaluate(el => el.tagName.toLowerCase())
          const className = await menuItems[i].evaluate(el => el.className)
          const href = await menuItems[i].evaluate(el => el.href || '')

          console.log(`  ${i + 1}. [${tagName}] "${text}"`)
          console.log(`     可见: ${isVisible}`)
          console.log(`     类名: ${className}`)
          console.log(`     链接: ${href}`)
          console.log('')
        } catch (e) {
          console.log(`  ${i + 1}. 无法获取菜单项信息: ${e.message}`)
        }
      }
    }

    // 2. 检查用户权限信息
    console.log('🔍 检查用户权限信息...')

    try {
      // 检查本地存储中的用户信息
      const userInfo = await page.evaluate(() => {
        return {
          localStorage: {
            user: localStorage.getItem('user'),
            token: localStorage.getItem('token'),
            permissions: localStorage.getItem('permissions'),
            role: localStorage.getItem('role')
          },
          sessionStorage: {
            user: sessionStorage.getItem('user'),
            token: sessionStorage.getItem('token'),
            permissions: sessionStorage.getItem('permissions'),
            role: sessionStorage.getItem('role')
          }
        }
      })

      console.log('用户信息:', JSON.stringify(userInfo, null, 2))

      // 检查页面上的用户信息显示
      const userDisplay = await page.locator('[class*="user"], [class*="avatar"], .el-dropdown').first()
      if (await userDisplay.isVisible()) {
        const userText = await userDisplay.textContent()
        console.log(`页面显示的用户信息: ${userText}`)
      }

    } catch (e) {
      console.log(`无法获取用户权限信息: ${e.message}`)
    }

    // 3. 尝试直接访问系统中心页面
    console.log('🔍 尝试直接访问系统中心页面...')

    try {
      const response = await page.goto('http://localhost:5173/centers/system-center', {
        waitUntil: 'networkidle',
        timeout: 15000
      })

      const currentUrl = page.url()
      console.log(`访问结果: ${currentUrl}`)

      if (currentUrl.includes('403')) {
        console.log('❌ 访问被拒绝 (403 权限不足)')
      } else if (currentUrl.includes('404')) {
        console.log('❌ 页面不存在 (404)')
      } else {
        console.log('✅ 页面访问成功')
      }

      await page.waitForTimeout(2000)

    } catch (e) {
      console.log(`访问系统中心页面失败: ${e.message}`)
    }

    // 4. 截图当前状态
    await page.screenshot({
      path: 'test-results/screenshots/sidebar-debug-final.png',
      fullPage: true
    })

    console.log('📸 最终状态截图已保存')

    // 5. 检查网络请求
    console.log('🔍 检查最近的网络请求...')

    const requests = []
    page.on('request', request => {
      if (request.url().includes('permission') || request.url().includes('menu') || request.url().includes('route')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        })
      }
    })

    // 等待一段时间收集请求
    await page.waitForTimeout(3000)

    if (requests.length > 0) {
      console.log('发现权限/菜单相关请求:')
      requests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`)
      })
    } else {
      console.log('未发现权限/菜单相关请求')
    }

    console.log('\n✅ 调试完成！')

  } catch (error) {
    console.error(`❌ 调试过程中发生错误: ${error.message}`)
    await page.screenshot({
      path: 'test-results/screenshots/debug-error.png',
      fullPage: true
    })
  } finally {
    await browser.close()
  }
}

// 执行调试
debugSidebar().catch(console.error)