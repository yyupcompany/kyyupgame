const { chromium } = require('playwright')

async function analyzeSidebar() {
  console.log('🔍 分析侧边栏菜单结构...')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  })

  const page = await browser.newPage()

  try {
    // 直接访问仪表板
    console.log('📍 直接访问仪表板...')
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    await page.waitForTimeout(3000)

    // 检查当前URL，如果被重定向到登录页面，说明需要登录
    const currentUrl = page.url()
    console.log(`当前页面URL: ${currentUrl}`)

    if (currentUrl.includes('/login')) {
      console.log('🔐 需要登录，尝试登录流程...')

      // 等待登录页面加载
      await page.waitForTimeout(2000)

      // 查找所有按钮
      const allButtons = await page.locator('button').all()
      console.log(`找到 ${allButtons.length} 个按钮`)

      let principalButton = null
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent()
        console.log(`按钮 ${i + 1}: "${buttonText}"`)
        if (buttonText && buttonText.includes('园长')) {
          principalButton = allButtons[i]
          console.log(`✅ 找到园长按钮`)
          break
        }
      }

      if (principalButton) {
        await principalButton.click()
        await page.waitForTimeout(5000)
      } else {
        console.log('❌ 未找到园长登录按钮')
      }
    }

    // 等待页面稳定
    await page.waitForTimeout(3000)

    // 截图当前状态
    await page.screenshot({
      path: 'test-results/screenshots/analyze-sidebar-current.png',
      fullPage: true
    })

    console.log('📸 当前状态截图已保存')

    // 查找所有可能的菜单项
    console.log('🔍 查找所有菜单项...')

    // 使用多种选择器查找菜单项
    const menuSelectors = [
      'a[href*="/"]',
      'button[onclick*="/"]',
      '.menu-item',
      '.el-menu-item',
      '[role="menuitem"]',
      'nav a',
      '.sidebar a',
      '.navigation a'
    ]

    let allMenuItems = []
    let uniqueMenuTexts = new Set()

    for (const selector of menuSelectors) {
      try {
        const items = await page.locator(selector).all()
        console.log(`选择器 "${selector}" 找到 ${items.length} 个元素`)

        for (const item of items) {
          try {
            const text = await item.textContent()
            const isVisible = await item.isVisible()
            const href = await item.evaluate(el => el.href || '')

            if (text && text.trim() && isVisible) {
              const cleanText = text.trim()

              if (!uniqueMenuTexts.has(cleanText) && cleanText.length < 50) {
                uniqueMenuTexts.add(cleanText)
                allMenuItems.push({
                  text: cleanText,
                  selector: selector,
                  href: href,
                  isVisible: isVisible
                })
                console.log(`  ✅ 菜单项: "${cleanText}" -> ${href}`)
              }
            }
          } catch (e) {
            // 忽略单个元素错误
          }
        }
      } catch (e) {
        console.log(`选择器 "${selector}" 执行失败: ${e.message}`)
      }
    }

    console.log(`\n📋 总共找到 ${allMenuItems.length} 个唯一菜单项:`)
    allMenuItems.forEach((item, index) => {
      console.log(`${index + 1}. "${item.text}"`)
      console.log(`   链接: ${item.href}`)
      console.log(`   可见: ${item.isVisible}`)
    })

    // 检查特定的园长菜单项
    const targetMenus = [
      '系统中心',
      '数据分析中心',
      '人事管理中心',
      '财务管理中心',
      '活动管理中心',
      '教学管理中心',
      '客户池中心',
      '营销中心'
    ]

    console.log('\n🎯 检查目标菜单项:')
    const foundTargetMenus = []

    for (const targetMenu of targetMenus) {
      const found = allMenuItems.find(item =>
        item.text.includes(targetMenu) || targetMenu.includes(item.text)
      )

      if (found) {
        foundTargetMenus.push(found)
        console.log(`✅ 找到: "${targetMenu}" -> ${found.href}`)
      } else {
        console.log(`❌ 未找到: "${targetMenu}"`)
      }
    }

    // 尝试点击找到的菜单项
    if (foundTargetMenus.length > 0) {
      console.log('\n🔄 测试点击菜单项...')

      for (let i = 0; i < Math.min(foundTargetMenus.length, 3); i++) {
        const menuItem = foundTargetMenus[i]
        console.log(`点击: "${menuItem.text}"`)

        try {
          // 查找对应的页面元素并点击
          const element = page.locator(`text=${menuItem.text}`).first()
          if (await element.isVisible()) {
            await element.click()
            await page.waitForTimeout(3000)

            const newUrl = page.url()
            console.log(`跳转后URL: ${newUrl}`)

            // 截图
            await page.screenshot({
              path: `test-results/screenshots/menu-${menuItem.text.replace(/\s+/g, '-')}.png`,
              fullPage: true
            })

            // 返回仪表板
            await page.goto('http://localhost:5173/dashboard', {
              waitUntil: 'networkidle'
            })
            await page.waitForTimeout(2000)
          } else {
            console.log(`元素不可见，无法点击`)
          }
        } catch (e) {
          console.log(`点击失败: ${e.message}`)
        }
      }
    }

    // 检查页面控制台错误
    console.log('\n🔍 检查控制台错误...')

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[控制台错误] ${msg.text()}`)
      }
    })

    // 等待一段时间收集错误
    await page.waitForTimeout(2000)

    console.log('\n✅ 分析完成!')

  } catch (error) {
    console.error(`❌ 分析过程中发生错误: ${error.message}`)
    await page.screenshot({
      path: 'test-results/screenshots/analyze-error.png',
      fullPage: true
    })
  } finally {
    await browser.close()
  }
}

// 执行分析
analyzeSidebar().catch(console.error)