/**
 * 全站健康检测系统 - 家长检测代理
 *
 * 职责：检测家长（Parent）角色的所有页面
 *
 * 使用方式：
 *  npx claude-code-tool invoke --name="Parent-Agent" --prompt="检测家长页面"
 */

import type { Task } from '@anthropic-ai/claude-code'

/**
 * 页面状态接口
 */
interface PageStatus {
  route: string
  name: string
  status: 'pending' | 'testing' | 'completed' | 'failed'
  errors: number
  warnings: number
  timestamp?: string
  errorDetails?: string[]
}

/**
 * 家长页面列表
 */
const PARENT_PAGES: PageStatus[] = [
  // ===== 家长中心主模块 =====
  { route: '/parent-center/dashboard', name: '家长仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/AIAssistant', name: 'AI助手', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/ai-assistant', name: 'AI助手', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/activities', name: '活动列表', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children', name: '孩子信息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/add', name: '添加孩子', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/edit', name: '编辑孩子', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/growth', name: '孩子成长', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/followup', name: '孩子跟进', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment', name: '能力评估', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/start', name: '开始测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/doing', name: '测评进行中', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/report', name: '测评报告', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/development-assessment', name: '发育测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/growth-trajectory', name: '成长轨迹', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/child-growth', name: '成长记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/communication', name: '家园沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/communication/smart-hub', name: '智能沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/notifications', name: '通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/notifications/detail', name: '通知详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/photo-album', name: '成长相册', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/profile', name: '个人中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/feedback', name: '意见反馈', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/promotion-center', name: '推广中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/share-stats', name: '分享统计', status: 'pending', errors: 0, warnings: 0 },

  // ===== 游戏模块 =====
  { route: '/parent-center/games', name: '亲子游戏', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/games/records', name: '游戏记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/games/achievements', name: '游戏成就', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/kindergarten-rewards', name: '园所奖励', status: 'pending', errors: 0, warnings: 0 },

  // ===== 移动端家长页面 =====
  { route: '/mobile/parent-center', name: '移动端家长中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/dashboard', name: '移动端家长仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/activities', name: '移动端活动列表', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/activities/detail', name: '移动端活动详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/activity-registration', name: '移动端活动报名', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/children', name: '移动端孩子信息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/child-growth', name: '移动端成长记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment', name: '移动端能力评估', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/start', name: '移动端开始测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/doing', name: '移动端测评进行中', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/report', name: '移动端测评报告', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/development-assessment', name: '移动端发育测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/growth-trajectory', name: '移动端成长轨迹', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/games', name: '移动端亲子游戏', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/games/records', name: '移动端游戏记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/games/achievements', name: '移动端游戏成就', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/photo-album', name: '移动端成长相册', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/communication', name: '移动端家园沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/communication/smart-hub', name: '移动端智能沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/notifications', name: '移动端通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/notifications/detail', name: '移动端通知详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/profile', name: '移动端个人中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/feedback', name: '移动端意见反馈', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/ai-assistant', name: '移动端AI助手', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/promotion-center', name: '移动端推广中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/share-stats', name: '移动端分享统计', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/kindergarten-rewards', name: '移动端园所奖励', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 家长仪表板特殊检测
 */
async function testParentDashboard(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 3 })

    const snapshot = await browser.snapshot()

    if (!snapshot) {
      return {
        ...page,
        status: 'failed',
        errors: 1,
        timestamp: new Date().toISOString(),
        errorDetails: ['页面无法渲染'],
      }
    }

    // 检测孩子信息卡片
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${cards.length} 个卡片`)

    // 检测快捷操作
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 检测统计信息
    const stats = findAllStats(snapshot)
    console.log(`    发现 ${stats.length} 个统计项`)

    // 点击快捷入口
    for (const button of buttons.slice(0, 4)) {
      try {
        await browser.click({ element: button.description, ref: button.ref })
        await browser.wait({ time: 0.5 })
      } catch (e: any) {
        // 忽略
      }
    }

    const errors = await browser.consoleMessages({ level: 'error' })
    const duration = Date.now() - startTime

    if (errors.length > 0) {
      console.error(`    ⚠️ 发现 ${errors.length} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errors.length,
        warnings: errors.length,
        timestamp: new Date().toISOString(),
      }
    }

    console.log(`    ✅ 通过 (${duration}ms)`)
    return {
      ...page,
      status: 'completed',
      errors: 0,
      warnings: 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error(`    ❌ 检测失败: ${error.message}`)
    return {
      ...page,
      status: 'failed',
      errors: 1,
      timestamp: new Date().toISOString(),
      errorDetails: [error.message],
    }
  }
}

/**
 * 活动列表页面检测
 */
async function testActivities(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 3 })

    const snapshot = await browser.snapshot()

    if (!snapshot) {
      return {
        ...page,
        status: 'failed',
        errors: 1,
        timestamp: new Date().toISOString(),
        errorDetails: ['页面无法渲染'],
      }
    }

    // 检测活动卡片
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${cards.length} 个活动卡片`)

    // 检测筛选器
    const inputs = findAllInputs(snapshot)
    console.log(`    发现 ${inputs.length} 个输入框`)

    // 检测操作按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 点击活动卡片查看详情
    for (const card of cards.slice(0, 2)) {
      try {
        await browser.click({ element: card.description, ref: card.ref })
        await browser.wait({ time: 0.5 })
        await browser.snapshot()

        // 检测报名按钮
        const detailButtons = findAllButtons(snapshot)
        for (const btn of detailButtons.slice(0, 2)) {
          try {
            await browser.click({ element: btn.description, ref: btn.ref })
            await browser.wait({ time: 0.3 })
          } catch (e: any) {
            // 忽略
          }
        }

        // 返回列表
        const backButtons = buttons.filter(b =>
          b.description.includes('返回') || b.description.includes('back')
        )
        for (const btn of backButtons.slice(0, 1)) {
          try {
            await browser.click({ element: btn.description, ref: btn.ref })
          } catch (e: any) {
            // 忽略
          }
        }
      } catch (e: any) {
        // 忽略
      }
    }

    const errors = await browser.consoleMessages({ level: 'error' })
    const duration = Date.now() - startTime

    if (errors.length > 0) {
      console.error(`    ⚠️ 发现 ${errors.length} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errors.length,
        warnings: errors.length,
        timestamp: new Date().toISOString(),
      }
    }

    console.log(`    ✅ 通过 (${duration}ms)`)
    return {
      ...page,
      status: 'completed',
      errors: 0,
      warnings: 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error(`    ❌ 检测失败: ${error.message}`)
    return {
      ...page,
      status: 'failed',
      errors: 1,
      timestamp: new Date().toISOString(),
      errorDetails: [error.message],
    }
  }
}

/**
 * 能力评估页面检测
 */
async function testAssessment(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 3 })

    const snapshot = await browser.snapshot()

    if (!snapshot) {
      return {
        ...page,
        status: 'failed',
        errors: 1,
        timestamp: new Date().toISOString(),
        errorDetails: ['页面无法渲染'],
      }
    }

    // 检测评估列表
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${cards.length} 个评估卡片`)

    // 检测开始测评按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 点击开始测评
    const startButton = buttons.find(b =>
      b.description.includes('开始') || b.description.includes('测评') || b.description.includes('评估')
    )
    if (startButton) {
      try {
        await browser.click({ element: startButton.description, ref: startButton.ref })
        await browser.wait({ time: 1 })
        await browser.snapshot()

        // 检测测评题目
        const questionInputs = findAllInputs(snapshot)
        console.log(`    测评中有 ${questionInputs.length} 个题目`)

        // 选择答案
        for (const input of questionInputs.slice(0, 3)) {
          try {
            await browser.click({ element: input.description, ref: input.ref })
            await browser.wait({ time: 0.2 })
          } catch (e: any) {
            // 忽略
          }
        }

        // 点击下一题或提交
        const navButtons = buttons.filter(b =>
          b.description.includes('下一') || b.description.includes('提交') || b.description.includes('完成')
        )
        for (const btn of navButtons.slice(0, 1)) {
          try {
            await browser.click({ element: btn.description, ref: btn.ref })
            await browser.wait({ time: 0.3 })
          } catch (e: any) {
            // 忽略
          }
        }
      } catch (e: any) {
        console.log(`    ⚠️ 测评操作失败: ${e.message}`)
      }
    }

    const errors = await browser.consoleMessages({ level: 'error' })
    const duration = Date.now() - startTime

    if (errors.length > 0) {
      console.error(`    ⚠️ 发现 ${errors.length} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errors.length,
        warnings: errors.length,
        timestamp: new Date().toISOString(),
      }
    }

    console.log(`    ✅ 通过 (${duration}ms)`)
    return {
      ...page,
      status: 'completed',
      errors: 0,
      warnings: 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error(`    ❌ 检测失败: ${error.message}`)
    return {
      ...page,
      status: 'failed',
      errors: 1,
      timestamp: new Date().toISOString(),
      errorDetails: [error.message],
    }
  }
}

/**
 * 亲子游戏页面检测
 */
async function testGames(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 3 })

    const snapshot = await browser.snapshot()

    if (!snapshot) {
      return {
        ...page,
        status: 'failed',
        errors: 1,
        timestamp: new Date().toISOString(),
        errorDetails: ['页面无法渲染'],
      }
    }

    // 检测游戏卡片
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${cards.length} 个游戏卡片`)

    // 检测操作按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 点击游戏卡片进入游戏
    for (const card of cards.slice(0, 2)) {
      try {
        await browser.click({ element: card.description, ref: card.ref })
        await browser.wait({ time: 1 })
        await browser.snapshot()

        // 检测游戏界面
        const gameElements = findAllButtons(snapshot).concat(findAllInputs(snapshot))
        console.log(`    游戏界面有 ${gameElements.length} 个交互元素`)

        // 点击游戏中的按钮
        for (const element of gameElements.slice(0, 2)) {
          try {
            await browser.click({ element: element.description, ref: element.ref })
            await browser.wait({ time: 0.3 })
          } catch (e: any) {
            // 忽略
          }
        }

        // 返回游戏列表
        const backButtons = buttons.filter(b =>
          b.description.includes('返回') || b.description.includes('退出') || b.description.includes('back')
        )
        for (const btn of backButtons.slice(0, 1)) {
          try {
            await browser.click({ element: btn.description, ref: btn.ref })
          } catch (e: any) {
            // 忽略
          }
        }
      } catch (e: any) {
        // 忽略
      }
    }

    const errors = await browser.consoleMessages({ level: 'error' })
    const duration = Date.now() - startTime

    if (errors.length > 0) {
      console.error(`    ⚠️ 发现 ${errors.length} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errors.length,
        warnings: errors.length,
        timestamp: new Date().toISOString(),
      }
    }

    console.log(`    ✅ 通过 (${duration}ms)`)
    return {
      ...page,
      status: 'completed',
      errors: 0,
      warnings: 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error(`    ❌ 检测失败: ${error.message}`)
    return {
      ...page,
      status: 'failed',
      errors: 1,
      timestamp: new Date().toISOString(),
      errorDetails: [error.message],
    }
  }
}

/**
 * 查找所有按钮
 */
function findAllButtons(snapshot: any): { description: string; ref: string }[] {
  const buttons: { description: string; ref: string }[] = []
  if (!snapshot) return buttons

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''
    const type = node.type || ''

    if (role === 'button' || role === 'link' || type === 'button') {
      buttons.push({
        description: node.name || node.description || '按钮',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return buttons
}

/**
 * 查找所有输入框
 */
function findAllInputs(snapshot: any): { description: string; ref: string }[] {
  const inputs: { description: string; ref: string }[] = []
  if (!snapshot) return inputs

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''

    if (role === 'textbox' || role === 'searchbox' || role === 'combobox' || role === 'radio' || role === 'checkbox') {
      inputs.push({
        description: node.name || node.description || '输入框',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return inputs
}

/**
 * 查找所有卡片
 */
function findAllCards(snapshot: any): { description: string; ref: string }[] {
  const cards: { description: string; ref: string }[] = []
  if (!snapshot) return cards

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''

    if (role === 'group' || role === 'section' || node.name?.includes('卡片') || node.name?.includes('card')) {
      cards.push({
        description: node.name || node.description || '卡片',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return cards
}

/**
 * 查找统计项
 */
function findAllStats(snapshot: any): { description: string; ref: string }[] {
  const stats: { description: string; ref: string }[] = []
  if (!snapshot) return stats

  function traverse(node: any) {
    if (!node) return

    const name = node.name || ''
    const description = node.description || ''

    if (/\d+/.test(name) || /\d+/.test(description)) {
      stats.push({
        description: name || description || '统计项',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return stats
}

/**
 * 通用页面检测函数
 */
async function testPage(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 3 })

    const snapshot = await browser.snapshot()

    if (!snapshot) {
      return {
        ...page,
        status: 'failed',
        errors: 1,
        timestamp: new Date().toISOString(),
        errorDetails: ['页面无法渲染'],
      }
    }

    const buttons = findAllButtons(snapshot)
    const inputs = findAllInputs(snapshot)

    console.log(`    元素检测: 按钮(${buttons.length}) 输入框(${inputs.length})`)

    // 点击按钮
    for (const button of buttons.slice(0, 3)) {
      try {
        await browser.click({ element: button.description, ref: button.ref })
        await browser.wait({ time: 0.3 })
      } catch (e: any) {
        // 忽略
      }
    }

    const errors = await browser.consoleMessages({ level: 'error' })
    const duration = Date.now() - startTime

    if (errors.length > 0) {
      console.error(`    ⚠️ 发现 ${errors.length} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errors.length,
        warnings: errors.length,
        timestamp: new Date().toISOString(),
      }
    }

    console.log(`    ✅ 通过 (${duration}ms)`)
    return {
      ...page,
      status: 'completed',
      errors: 0,
      warnings: 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error(`    ❌ 检测失败: ${error.message}`)
    return {
      ...page,
      status: 'failed',
      errors: 1,
      timestamp: new Date().toISOString(),
      errorDetails: [error.message],
    }
  }
}

/**
 * 家长检测代理执行函数
 */
export async function runParentAgent(
  baseUrl: string = 'http://localhost:5173',
  options: {
    loginToken?: string
    continueOnError?: boolean
    categories?: ('parent-center' | 'games' | 'mobile')[]
  } = {}
): Promise<{
  total: number
  completed: number
  failed: number
  pages: PageStatus[]
}> {
  const { loginToken, continueOnError = true, categories = ['parent-center', 'games', 'mobile'] } = options

  console.log('='.repeat(80))
  console.log('全站健康检测系统 - 家长检测代理')
  console.log('='.repeat(80))
  console.log(`检测地址: ${baseUrl}`)
  console.log(`检测模块: ${categories.join(', ')}`)
  console.log(`错误继续执行: ${continueOnError}`)
  console.log('='.repeat(80))

  const results: PageStatus[] = []
  let completed = 0
  let failed = 0

  // 根据分类筛选页面
  let pagesToTest: PageStatus[] = []

  if (categories.includes('parent-center')) {
    pagesToTest = pagesToTest.concat(
      PARENT_PAGES.filter(p => p.route.startsWith('/parent-center/') && !p.route.includes('games'))
    )
  }

  if (categories.includes('games')) {
    pagesToTest = pagesToTest.concat(
      PARENT_PAGES.filter(p => p.route.includes('games') || p.route.includes('kindergarten-rewards'))
    )
  }

  if (categories.includes('mobile')) {
    pagesToTest = pagesToTest.concat(
      PARENT_PAGES.filter(p => p.route.startsWith('/mobile/'))
    )
  }

  console.log(`\n📋 待检测页面数: ${pagesToTest.length}`)

  // 检测页面
  for (const page of pagesToTest) {
    let result: PageStatus

    // 根据页面路由选择检测方法
    if (page.route === '/parent-center/dashboard' || page.route === '/mobile/parent-center/dashboard') {
      result = await testParentDashboard(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.includes('activities')) {
      result = await testActivities(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.includes('assessment')) {
      result = await testAssessment(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.includes('games')) {
      result = await testGames(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else {
      result = await testPage(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    }

    results.push(result)

    if (result.status === 'completed') {
      completed++
    } else {
      failed++
    }

    if (!continueOnError && result.status === 'failed') {
      break
    }
  }

  // 输出统计信息
  console.log('\n' + '='.repeat(80))
  console.log('家长检测完成 - 统计信息')
  console.log('='.repeat(80))
  console.log(`总页面数: ${results.length}`)
  console.log(`成功: ${completed}`)
  console.log(`失败: ${failed}`)
  console.log(`成功率: ${((completed / results.length) * 100).toFixed(2)}%`)
  console.log('='.repeat(80))

  // 输出失败的页面
  if (failed > 0) {
    console.log('\n失败的页面:')
    for (const page of results.filter(p => p.status === 'failed')) {
      console.log(`  - ${page.name} (${page.route})`)
      if (page.errorDetails) {
        for (const error of page.errorDetails) {
          console.log(`    └─ ${error}`)
        }
      }
    }
  }

  return {
    total: results.length,
    completed,
    failed,
    pages: results,
  }
}

export default runParentAgent
