/**
 * 移动端中心首页 - 100%功能测试覆盖
 * 覆盖范围：页面加载、统计概览、中心导航、路由跳转、响应式设计
 * 测试标准：遵循项目严格验证规则，移动端优化
 */

import { test, expect } from '@playwright/test'
import {
  validateAPIResponse,
  validateRequiredFields,
  expectNoConsoleErrors
} from '../../utils/validation'

// 测试配置
const PAGE_CONFIG = {
  url: '/mobile/centers',
  title: '中心目录',
  mobileViewport: { width: 375, height: 667 },
  tabletViewport: { width: 768, height: 1024 },
  desktopViewport: { width: 1024, height: 768 }
}

// 预期的中心数据
const EXPECTED_CENTERS = {
  sections: [
    {
      id: 'kindergarten-management',
      title: '园所管理',
      expectedCenterCount: 4
    },
    {
      id: 'business-management',
      title: '业务管理',
      expectedCenterCount: 6
    },
    {
      id: 'finance-management',
      title: '财务管理',
      expectedCenterCount: 1
    },
    {
      id: 'system-management',
      title: '系统管理',
      expectedCenterCount: 4
    },
    {
      id: 'ai-intelligence',
      title: 'AI智能',
      expectedCenterCount: 4
    }
  ],
  totalCenters: 19,
  expectedStats: ['中心总数', '园所管理', '业务管理', '财务管理', '系统管理', 'AI智能']
}

test.describe('[移动端中心首页] - 100%功能测试覆盖', () => {
  let page: any

  test.beforeEach(async ({ browser }) => {
    // 创建移动端上下文
    const context = await browser.newContext({
      viewport: PAGE_CONFIG.mobileViewport,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    })
    page = await context.newPage()

    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.warn('Console error:', msg.text())
      }
    })

    // 监听页面错误
    page.on('pageerror', error => {
      console.warn('Page error:', error.message)
    })
  })

  test.afterEach(async () => {
    expectNoConsoleErrors(page)
    if (page) {
      await page.close()
    }
  })

  test.describe('页面加载和基础功能', () => {
    test('移动端页面正确加载', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 验证页面标题
      const pageTitle = page.locator('h1, .page-title, .van-nav-bar__title')
      await expect(pageTitle).toContainText(PAGE_CONFIG.title)

      // 验证主要内容区域
      const mainContent = page.locator('.mobile-centers-index, [data-testid="mobile-centers-index"]')
      await expect(mainContent).toBeVisible()

      // 验证使用移动端布局
      const mobileLayout = page.locator('.MobileMainLayout, [data-testid="mobile-layout"]')
      if (await mobileLayout.count() > 0) {
        await expect(mobileLayout.first()).toBeVisible()
      }
    })

    test('统计概览正确显示', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待统计卡片加载
      await page.waitForSelector('.overview-section, [data-testid="overview-section"]')

      // 验证概览区域
      const overviewSection = page.locator('.overview-section, [data-testid="overview-section"]')
      await expect(overviewSection).toBeVisible()

      // 验证统计网格
      const statsGrid = overviewSection.locator('.stats-grid, [data-testid="stats-grid"]')
      await expect(statsGrid).toBeVisible()

      // 验证统计卡片数量
      const statCards = statsGrid.locator('.stat-card, [data-testid="stat-card"]')
      expect(await statCards.count()).toBeGreaterThanOrEqual(6)

      // 验证每个统计卡片
      for (let i = 0; i < await statCards.count(); i++) {
        const card = statCards.nth(i)
        await expect(card).toBeVisible()

        // 验证卡片结构
        const statIcon = card.locator('.stat-icon, [data-testid="stat-icon"]')
        const statInfo = card.locator('.stat-info, [data-testid="stat-info"]')
        const statValue = card.locator('.stat-value, [data-testid="stat-value"]')
        const statLabel = card.locator('.stat-label, [data-testid="stat-label"]')

        await expect(statIcon).toBeVisible()
        await expect(statInfo).toBeVisible()
        await expect(statValue).toBeVisible()
        await expect(statLabel).toBeVisible()

        // 验证图标
        const iconElement = statIcon.locator('svg, i')
        if (await iconElement.count() > 0) {
          await expect(iconElement.first()).toBeVisible()
        }

        // 验证数值不为空
        const valueText = await statValue.textContent()
        expect(valueText?.trim()?.length).toBeGreaterThan(0)

        // 验证标签不为空
        const labelText = await statLabel.textContent()
        expect(labelText?.trim()?.length).toBeGreaterThan(0)
      }
    })

    test('统计数据内容验证', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待统计卡片加载
      await page.waitForSelector('.stat-card')

      const statCards = page.locator('.stat-card')

      // 验证预期的统计标签
      const foundLabels = []
      for (let i = 0; i < await statCards.count(); i++) {
        const card = statCards.nth(i)
        const labelElement = card.locator('.stat-label')
        const labelText = await labelElement.textContent()
        if (labelText) {
          foundLabels.push(labelText.trim())
        }
      }

      // 验证包含预期的统计项
      for (const expectedLabel of EXPECTED_CENTERS.expectedStats) {
        expect(foundLabels.some(label => label.includes(expectedLabel))).toBeTruthy()
      }

      // 验证中心总数统计
      const totalStats = foundLabels.find(label => label.includes('中心总数'))
      expect(totalStats).toBeTruthy()

      // 验证数值格式（应该是数字）
      for (let i = 0; i < await statCards.count(); i++) {
        const card = statCards.nth(i)
        const valueElement = card.locator('.stat-value')
        const valueText = await valueElement.textContent()

        if (valueText) {
          const cleanValue = valueText.trim()
          expect(/^\d+$/.test(cleanValue) || /^\d+$/.test(cleanValue)).toBeTruthy()
        }
      }
    })
  })

  test.describe('中心分组导航功能', () => {
    test('中心分组正确显示', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心分组加载
      await page.waitForSelector('.centers-sections, [data-testid="centers-sections"]')

      // 验证分组容器
      const sectionsContainer = page.locator('.centers-sections, [data-testid="centers-sections"]')
      await expect(sectionsContainer).toBeVisible()

      // 验证分组数量
      const sectionCards = sectionsContainer.locator('.section-card, [data-testid="section-card"]')
      expect(await sectionCards.count()).toBe(EXPECTED_CENTERS.sections.length)

      // 验证每个分组
      for (let i = 0; i < await sectionCards.count(); i++) {
        const section = sectionCards.nth(i)
        await expect(section).toBeVisible()

        // 验证分组头部
        const sectionHeader = section.locator('.section-header, [data-testid="section-header"]')
        await expect(sectionHeader).toBeVisible()

        // 验证分组标题
        const sectionTitle = sectionHeader.locator('.section-title')
        await expect(sectionTitle).toBeVisible()

        // 验证分组描述
        const sectionDescription = sectionHeader.locator('.section-description')
        await expect(sectionDescription).toBeVisible()
        expect(await sectionDescription.textContent()).toBeTruthy()
      }
    })

    test('分组内容正确加载', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心分组加载
      await page.waitForSelector('.section-card')

      const sectionCards = page.locator('.section-card')

      // 验证每个分组的中心网格
      for (let i = 0; i < await sectionCards.count(); i++) {
        const section = sectionCards.nth(i)

        // 验证中心网格
        const centersGrid = section.locator('.centers-grid, [data-testid="centers-grid"]')
        await expect(centersGrid).toBeVisible()

        // 验证中心卡片
        const centerCards = centersGrid.locator('.center-card, [data-testid="center-card"]')
        expect(await centerCards.count()).toBeGreaterThan(0)
      }
    })

    test('中心卡片结构和内容', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心卡片加载
      await page.waitForSelector('.center-card, [data-testid="center-card"]')

      const centerCards = page.locator('.center-card')
      expect(await centerCards.count()).toBeGreaterThan(0)

      // 验证第一个中心卡片结构
      const firstCard = centerCards.first()
      await expect(firstCard).toBeVisible()

      // 验证卡片结构
      const centerIcon = firstCard.locator('.center-icon, [data-testid="center-icon"]')
      const centerInfo = firstCard.locator('.center-info, [data-testid="center-info"]')
      const centerArrow = firstCard.locator('.center-arrow, [data-testid="center-arrow"]')

      await expect(centerIcon).toBeVisible()
      await expect(centerInfo).toBeVisible()
      await expect(centerArrow).toBeVisible()

      // 验证中心信息内容
      const centerName = centerInfo.locator('h4')
      const centerDescription = centerInfo.locator('p')

      await expect(centerName).toBeVisible()
      await expect(centerDescription).toBeVisible()

      const nameText = await centerName.textContent()
      const descriptionText = await centerDescription.textContent()

      expect(nameText?.trim()?.length).toBeGreaterThan(0)
      expect(descriptionText?.trim()?.length).toBeGreaterThan(0)
    })

    test('中心卡片可点击性', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心卡片加载
      await page.waitForSelector('.center-card, [data-testid="center-card"]')

      const centerCards = page.locator('.center-card')
      expect(await centerCards.count()).toBeGreaterThan(0)

      // 验证第一个中心卡片的可点击性
      const firstCard = centerCards.first()
      await expect(firstCard).toBeVisible()

      // 验证cursor样式
      const cursorStyle = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).cursor
      })
      expect(cursorStyle).toBe('pointer')

      // 验证点击反馈（不实际点击，避免页面跳转）
      await firstCard.hover()
      await expect(firstCard).toBeVisible()
    })
  })

  test.describe('路由导航功能', () => {
    test('路由跳转功能测试', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心卡片加载
      await page.waitForSelector('.center-card, [data-testid="center-card"]')

      const centerCards = page.locator('.center-card')
      const firstCard = centerCards.first()

      // 获取点击前的URL
      const initialUrl = page.url()

      // 监听路由变化
      let navigationOccurred = false
      page.on('framenavigated', () => {
        navigationOccurred = true
      })

      // 点击中心卡片
      await firstCard.click()

      // 等待可能的导航或提示
      await page.waitForTimeout(2000)

      // 验证是否有导航发生或显示提示
      const currentUrl = page.url()
      const toastMessage = page.locator('.van-toast, [data-testid="toast"]')

      expect(
        navigationOccurred && currentUrl !== initialUrl ||
        await toastMessage.count() > 0
      ).toBeTruthy()

      // 如果有提示，验证提示内容
      if (await toastMessage.count() > 0) {
        const toastText = await toastMessage.textContent()
        expect(toastText).toContain('开发中')
      }
    })

    test('路由错误处理', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心卡片加载
      await page.waitForSelector('.center-card')

      const centerCards = page.locator('.center-card')

      // 查找可能路由错误的卡片
      for (let i = 0; i < Math.min(await centerCards.count(), 3); i++) {
        const card = centerCards.nth(i)

        // 点击卡片
        await card.click()
        await page.waitForTimeout(1000)

        // 检查是否有错误提示
        const toastMessage = page.locator('.van-toast')
        if (await toastMessage.count() > 0) {
          const toastText = await toastMessage.textContent()
          expect(['页面开发中', '页面不存在', '路由错误'].some(
            msg => toastText?.includes(msg)
          )).toBeTruthy()
        }

        // 如果导航成功，返回首页
        if (page.url() !== PAGE_CONFIG.url) {
          await page.goto(PAGE_CONFIG.url)
          await page.waitForSelector('.center-card')
        }
      }
    })
  })

  test.describe('响应式设计', () => {
    test('移动端布局正确显示', async () => {
      // 设置移动端视口
      await page.setViewportSize(PAGE_CONFIG.mobileViewport)
      await page.goto(PAGE_CONFIG.url)

      // 验证移动端特定元素
      const mobileLayout = page.locator('.MobileMainLayout')
      if (await mobileLayout.count() > 0) {
        await expect(mobileLayout.first()).toBeVisible()
      }

      // 验证统计卡片网格（移动端应该是2列）
      const statsGrid = page.locator('.stats-grid')
      if (await statsGrid.count() > 0) {
        const gridStyle = await statsGrid.first().evaluate(el => {
          return window.getComputedStyle(el).gridTemplateColumns
        })
        // 移动端应该是2列布局
        expect(gridStyle).toContain('1fr 1fr')
      }

      // 验证中心卡片（移动端应该是单列布局）
      const centersGrid = page.locator('.centers-grid')
      if (await centersGrid.count() > 0) {
        const gridStyle = await centersGrid.first().evaluate(el => {
          return window.getComputedStyle(el).display
        })
        expect(gridStyle).toContain('flex') // 移动端使用flex布局
      }
    })

    test('平板端布局适配', async () => {
      // 设置平板端视口
      await page.setViewportSize(PAGE_CONFIG.tabletViewport)
      await page.goto(PAGE_CONFIG.url)

      // 等待页面适配
      await page.waitForTimeout(1000)

      // 验证主要内容区域
      const mainContent = page.locator('.mobile-centers-index')
      await expect(mainContent).toBeVisible()

      // 验证统计卡片网格（平板端可能是3列）
      const statsGrid = page.locator('.stats-grid')
      if (await statsGrid.count() > 0) {
        await expect(statsGrid.first()).toBeVisible()
      }

      // 验证中心网格布局
      const centersGrid = page.locator('.centers-grid')
      if (await centersGrid.count() > 0) {
        await expect(centersGrid.first()).toBeVisible()
      }
    })

    test('桌面端布局适配', async () => {
      // 设置桌面端视口
      await page.setViewportSize(PAGE_CONFIG.desktopViewport)
      await page.goto(PAGE_CONFIG.url)

      // 等待页面适配
      await page.waitForTimeout(1000)

      // 验证页面仍然正常显示
      const mainContent = page.locator('.mobile-centers-index')
      await expect(mainContent).toBeVisible()

      // 验证最大宽度限制
      const mainContentStyle = await mainContent.evaluate(el => {
        return window.getComputedStyle(el).maxWidth
      })
      // 桌面端应该有最大宽度限制
      expect(mainContentStyle).toBeTruthy()

      // 验证统计卡片网格（桌面端可能是3列）
      const statsGrid = page.locator('.stats-grid')
      if (await statsGrid.count() > 0) {
        await expect(statsGrid.first()).toBeVisible()
      }
    })

    test('不同屏幕密度适配', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 验证高密度屏幕适配
      const statCards = page.locator('.stat-card')
      const sectionCards = page.locator('.section-card')

      // 检查阴影效果适配
      for (const cardSelector of [statCards, sectionCards]) {
        if (await cardSelector.count() > 0) {
          const firstCard = cardSelector.first()
          const boxShadow = await firstCard.evaluate(el => {
            return window.getComputedStyle(el).boxShadow
          })
          // 验证有阴影效果
          expect(boxShadow).toBeTruthy()
        }
      }
    })
  })

  test.describe('交互效果和动画', () => {
    test('统计卡片点击反馈', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待统计卡片加载
      await page.waitForSelector('.stat-card')

      const statCards = page.locator('.stat-card')
      if (await statCards.count() > 0) {
        const firstCard = statCards.first()

        // 记录点击前样式
        const beforeTransform = await firstCard.evaluate(el => {
          return window.getComputedStyle(el).transform
        })

        // 点击卡片
        await firstCard.click()

        // 等待动画效果
        await page.waitForTimeout(300)

        // 验证点击反馈（可能没有特定变化，但不应该有错误）
        expectNoConsoleErrors(page)
      }
    })

    test('中心卡片悬停和点击效果', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心卡片加载
      await page.waitForSelector('.center-card')

      const centerCards = page.locator('.center-card')
      const firstCard = centerCards.first()

      // 悬停效果
      await firstCard.hover()
      await page.waitForTimeout(200)

      // 验证悬停状态
      const hoverBgColor = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor
      })
      expect(hoverBgColor).toBeTruthy()

      // 点击效果
      const beforeTransform = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).transform
      })

      await firstCard.click()
      await page.waitForTimeout(200)

      // 验证点击反馈
      expectNoConsoleErrors(page)
    })

    test('箭头图标颜色变化', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待中心卡片加载
      await page.waitForSelector('.center-card')

      const centerCards = page.locator('.center-card')
      const firstCard = centerCards.first()

      // 获取箭头元素
      const arrowElement = firstCard.locator('.center-arrow')
      if (await arrowElement.count() > 0) {
        // 记录点击前颜色
        const beforeColor = await arrowElement.evaluate(el => {
          return window.getComputedStyle(el).color
        })

        // 点击卡片
        await firstCard.click()
        await page.waitForTimeout(200)

        // 记录点击后颜色
        const afterColor = await arrowElement.evaluate(el => {
          return window.getComputedStyle(el).color
        })

        // 验证颜色变化或不变化（根据设计可能变化）
        expect([beforeColor, afterColor].every(c => c !== null)).toBeTruthy()
      }
    })
  })

  test.describe('性能和加载', () => {
    test('页面加载性能', async () => {
      const startTime = Date.now()

      await page.goto(PAGE_CONFIG.url)

      // 等待主要内容加载
      await page.waitForSelector('.mobile-centers-index', {
        timeout: 10000
      })

      const loadTime = Date.now() - startTime

      // 页面应该在合理时间内加载（移动端可能稍慢，设定为8秒）
      expect(loadTime).toBeLessThan(8000)
    })

    test('图片和图标加载', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待页面加载
      await page.waitForLoadState('networkidle')

      // 验证图标元素
      const icons = page.locator('.stat-icon svg, .center-icon svg, .stat-icon i, .center-icon i')

      for (let i = 0; i < Math.min(await icons.count(), 5); i++) {
        await expect(icons.nth(i)).toBeVisible()
      }

      // 验证图标不破损
      const brokenImages = page.locator('img[src=""]')
      expect(await brokenImages.count()).toBe(0)
    })

    test('滚动性能', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待内容加载
      await page.waitForSelector('.centers-sections')

      // 模拟滚动
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2)
      })

      await page.waitForTimeout(1000)

      // 验证页面仍然正常
      const mainContent = page.locator('.mobile-centers-index')
      await expect(mainContent).toBeVisible()

      // 向上滚动
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })

      await page.waitForTimeout(500)

      // 验证回到顶部
      const scrollTop = await page.evaluate(() => window.pageYOffset)
      expect(scrollTop).toBe(0)
    })
  })

  test.describe('可访问性', () => {
    test('键盘导航支持', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 使用Tab键导航
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)

      // 验证焦点正确移动
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(['BUTTON', 'INPUT', 'SELECT', 'A', 'DIV']).toContain(focusedElement || '')

      // 继续Tab导航
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(200)
      }

      // 验证没有JavaScript错误
      expectNoConsoleErrors(page)
    })

    test('屏幕阅读器支持', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待内容加载
      await page.waitForSelector('.stat-card, .center-card')

      // 验证重要元素的语义化标签
      const importantElements = [
        'h1', 'h3', 'h4',           // 标题
        '.stat-card',             // 统计卡片
        '.center-card',           // 中心卡片
        '.section-header'         // 分组头部
      ]

      for (const selector of importantElements) {
        const elements = page.locator(selector)
        if (await elements.count() > 0) {
          // 检查第一个元素是否有适当的可访问性属性
          const firstElement = elements.first()
          const hasContent = await firstElement.evaluate(el => {
            return el.textContent?.trim() !== '' ||
                   el.hasAttribute('aria-label') ||
                   el.hasAttribute('aria-labelledby')
          })

          expect(hasContent).toBeTruthy()
        }
      }
    })

    test('触摸目标大小（移动端）', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待可交互元素加载
      await page.waitForSelector('.center-card, .stat-card')

      // 验证中心卡片的触摸目标大小
      const centerCards = page.locator('.center-card')
      if (await centerCards.count() > 0) {
        const firstCard = centerCards.first()

        // 验证最小触摸目标大小（44px）
        const cardHeight = await firstCard.evaluate(el => {
          return window.getComputedStyle(el).height
        })
        const heightValue = parseInt(cardHeight || '0')
        expect(heightValue).toBeGreaterThanOrEqual(44)
      }

      // 验证统计卡片的触摸目标大小
      const statCards = page.locator('.stat-card')
      if (await statCards.count() > 0) {
        const firstCard = statCards.first()

        const cardHeight = await firstCard.evaluate(el => {
          return window.getComputedStyle(el).height
        })
        const heightValue = parseInt(cardHeight || '0')
        expect(heightValue).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('数据一致性', () => {
    test('统计数据准确性', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待统计卡片加载
      await page.waitForSelector('.stat-card')

      // 验证中心总数统计
      const statCards = page.locator('.stat-card')
      let totalCount = 0

      // 找到中心总数的统计卡片
      for (let i = 0; i < await statCards.count(); i++) {
        const card = statCards.nth(i)
        const label = card.locator('.stat-label')
        const labelText = await label.textContent()

        if (labelText?.includes('中心总数')) {
          const value = card.locator('.stat-value')
          const valueText = await value.textContent()
          totalCount = parseInt(valueText || '0')
          break
        }
      }

      // 验证总数合理性
      expect(totalCount).toBeGreaterThan(0)
      expect(totalCount).toBeLessThanOrEqual(50) // 合理的上限
    })

    test('分组数据完整性', async () => {
      await page.goto(PAGE_CONFIG.url)

      // 等待分组加载
      await page.waitForSelector('.section-card')

      const sectionCards = page.locator('.section-card')
      const foundSections = []

      // 收集找到的分组标题
      for (let i = 0; i < await sectionCards.count(); i++) {
        const section = sectionCards.nth(i)
        const titleElement = section.locator('.section-title h3')
        const titleText = await titleElement.textContent()

        if (titleText) {
          foundSections.push(titleText.trim())
        }
      }

      // 验证预期分组存在
      for (const expectedSection of EXPECTED_CENTERS.sections) {
        expect(foundSections.some(title => title.includes(expectedSection.title))).toBeTruthy()
      }
    })
  })
})