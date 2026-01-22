/**
 * 全站健康检测系统 - 园长检测代理
 *
 * 职责：检测园长（Principal）角色的所有页面
 *
 * 使用方式：
 *  npx claude-code-tool invoke --name="Principal-Agent" --prompt="检测园长页面"
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
 * 园长页面列表
 */
const PRINCIPAL_PAGES: PageStatus[] = [
  // ===== 园长中心模块 =====
  { route: '/principal/Dashboard', name: '园长仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/CustomerPool', name: '园长客户池', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/Performance', name: '园长绩效', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/PosterGenerator', name: '海报生成器', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/PosterTemplates', name: '海报模板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/ParentPermissionManagement', name: '家长权限管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/decision-support/intelligent-dashboard', name: '智能决策仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/media-center/VideoCreatorTimeline', name: '视频创作时间线', status: 'pending', errors: 0, warnings: 0 },

  // ===== 园长可见业务中心 =====
  { route: '/centers/AnalyticsCenter', name: '数据分析中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/BusinessCenter', name: '业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CallCenter', name: '呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CustomerPoolCenter', name: '客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/EnrollmentCenter', name: '招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/FinanceCenter', name: '财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/MarketingCenter', name: '营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TaskCenter', name: '任务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TeachingCenter', name: '教学中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/UsageCenter', name: '用量中心', status: 'pending', errors: 0, warnings: 0 },

  // ===== 移动端页面 =====
  { route: '/mobile/centers/analytics-hub', name: '移动端数据分析', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/business-hub', name: '移动端业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/call-center', name: '移动端呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/customer-pool-center', name: '移动端客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/enrollment-center', name: '移动端招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/finance-center', name: '移动端财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/marketing-center', name: '移动端营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/task-center', name: '移动端任务中心', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 园长中心特殊检测步骤
 */
async function testPrincipalDashboard(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    // 1. 导航到仪表板
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

    // 2. 检测统计卡片
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${cards.length} 个统计卡片`)

    // 3. 点击统计卡片
    for (const card of cards.slice(0, 3)) {
      try {
        await browser.click({ element: card.description, ref: card.ref })
        await browser.wait({ time: 0.5 })
        await browser.snapshot()
      } catch (e: any) {
        console.log(`    ⚠️ 点击卡片失败: ${card.description}`)
      }
    }

    // 4. 检测快捷操作
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 5. 获取控制台错误
    const errors = await browser.consoleMessages({ level: 'error' })

    const duration = Date.now() - startTime
    const errorCount = errors.length

    if (errorCount > 0) {
      console.error(`    ⚠️ 发现 ${errorCount} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errorCount,
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
 * 客户池页面检测
 */
async function testCustomerPool(
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

    // 检测筛选器
    const inputs = findAllInputs(snapshot)
    console.log(`    发现 ${inputs.length} 个输入框`)

    // 检测表格
    const tables = findAllTables(snapshot)
    console.log(`    发现 ${tables.length} 个表格`)

    // 检测按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 测试搜索功能
    const searchInputs = inputs.filter(i =>
      i.description.includes('搜索') || i.description.includes('客户')
    )
    for (const input of searchInputs.slice(0, 1)) {
      try {
        await browser.type({
          element: input.description,
          ref: input.ref,
          text: '测试客户'
        })
        await browser.wait({ time: 0.5 })
      } catch (e: any) {
        console.log(`    ⚠️ 输入失败: ${input.description}`)
      }
    }

    // 获取控制台错误
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

    if (role === 'textbox' || role === 'searchbox' || role === 'combobox') {
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

    if (role === 'group' || role === 'section' || node.name?.includes('卡片')) {
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
 * 查找所有表格
 */
function findAllTables(snapshot: any): { description: string; ref: string }[] {
  const tables: { description: string; ref: string }[] = []
  if (!snapshot) return tables

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''

    if (role === 'table' || node.name?.includes('表格') || node.name?.includes('列表')) {
      tables.push({
        description: node.name || node.description || '表格',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return tables
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

    // 点击按钮（限制数量）
    for (const button of buttons.slice(0, 3)) {
      try {
        await browser.click({ element: button.description, ref: button.ref })
        await browser.wait({ time: 0.3 })
      } catch (e: any) {
        // 忽略点击错误
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
 * 园长检测代理执行函数
 */
export async function runPrincipalAgent(
  baseUrl: string = 'http://localhost:5173',
  options: {
    loginToken?: string
    continueOnError?: boolean
    categories?: ('principal' | 'centers' | 'mobile')[]
  } = {}
): Promise<{
  total: number
  completed: number
  failed: number
  pages: PageStatus[]
}> {
  const { loginToken, continueOnError = true, categories = ['principal', 'centers', 'mobile'] } = options

  console.log('='.repeat(80))
  console.log('全站健康检测系统 - 园长检测代理')
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

  if (categories.includes('principal')) {
    pagesToTest = pagesToTest.concat(
      PRINCIPAL_PAGES.filter(p => p.route.startsWith('/principal/'))
    )
  }

  if (categories.includes('centers')) {
    pagesToTest = pagesToTest.concat(
      PRINCIPAL_PAGES.filter(p => p.route.startsWith('/centers/'))
    )
  }

  if (categories.includes('mobile')) {
    pagesToTest = pagesToTest.concat(
      PRINCIPAL_PAGES.filter(p => p.route.startsWith('/mobile/'))
    )
  }

  console.log(`\n📋 待检测页面数: ${pagesToTest.length}`)

  // 检测页面
  for (const page of pagesToTest) {
    let result: PageStatus

    // 根据页面路由选择检测方法
    if (page.route === '/principal/Dashboard') {
      result = await testPrincipalDashboard(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.includes('CustomerPool')) {
      result = await testCustomerPool(baseUrl, page, {
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
  console.log('园长检测完成 - 统计信息')
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

export default runPrincipalAgent
