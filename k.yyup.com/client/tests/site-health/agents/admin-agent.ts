/**
 * 全站健康检测系统 - 管理员检测代理
 *
 * 职责：检测管理员（Admin）角色的所有页面
 *
 * 使用方式：
 *  npx claude-code-tool invoke --name="Admin-Agent" --prompt="检测管理员页面"
 */

import type { Task } from '@anthropic-ai/claude-code'

/**
 * 检测结果接口
 */
interface TestResult {
  page: string           // 页面路由
  role: string           // 角色
  status: 'pass' | 'fail' | 'warning'
  errors: ConsoleError[]
  warnings: ConsoleWarning[]
  elements: {
    buttons: number
    inputs: number
    cards: number
    tables: number
    dialogs: number
  }
  timestamp: string
}

/**
 * 控制台错误接口
 */
interface ConsoleError {
  type: string
  message: string
  location?: string
  timestamp: string
}

/**
 * 控制台警告接口
 */
interface ConsoleWarning {
  type: string
  message: string
  timestamp: string
}

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
 * 管理员页面列表
 */
const ADMIN_PAGES: PageStatus[] = [
  // ===== 系统管理模块 =====
  { route: '/system/permissions', name: '权限管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/roles', name: '角色管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/Backup', name: '备份管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/AIModelConfig', name: 'AI模型配置', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/MessageTemplate', name: '消息模板', status: 'pending', errors: 0, warnings: 0 },

  // ===== 业务中心模块 =====
  { route: '/centers/ActivityCenter', name: '活动中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AnalyticsCenter', name: '数据分析中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AssessmentCenter', name: '评估中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AttendanceCenter', name: '考勤中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/BusinessCenter', name: '业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CallCenter', name: '呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CustomerPoolCenter', name: '客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/DocumentCenter', name: '文档中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/EnrollmentCenter', name: '招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/FinanceCenter', name: '财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/InspectionCenter', name: '检查中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/MarketingCenter', name: '营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/PersonnelCenter', name: '人员中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/SystemCenter', name: '系统中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TaskCenter', name: '任务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TeachingCenter', name: '教学中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/UsageCenter', name: '用量中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AICenter', name: 'AI智能中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AIBillingCenter', name: 'AI计费中心', status: 'pending', errors: 0, warnings: 0 },

  // ===== 移动端中心页面 =====
  { route: '/mobile/centers/activity-center', name: '移动端活动中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/analytics-center', name: '移动端数据分析中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/assessment-center', name: '移动端评估中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/attendance-center', name: '移动端考勤中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/business-center', name: '移动端业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/call-center', name: '移动端呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/customer-pool-center', name: '移动端客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/document-center', name: '移动端文档中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/enrollment-center', name: '移动端招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/finance-center', name: '移动端财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/inspection-center', name: '移动端检查中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/marketing-center', name: '移动端营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/task-center', name: '移动端任务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/teaching-center', name: '移动端教学中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/usage-center', name: '移动端用量中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/system-center', name: '移动端系统中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/notification-center', name: '移动端通知中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/permission-center', name: '移动端权限中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/personnel-center', name: '移动端人员中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/student-center', name: '移动端学生中心', status: 'pending', errors: 0, warnings: 0 },
]

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

    if (role === 'button' || role === 'link' || type === 'button' || (role === 'text' && node.name?.includes('按钮'))) {
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
    const type = node.type || ''

    if (role === 'textbox' || role === 'searchbox' || role === 'combobox' || type === 'text') {
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
 * 查找所有表格
 */
function findAllTables(snapshot: any): { description: string; ref: string }[] {
  const tables: { description: string; ref: string }[] = []
  if (!snapshot) return tables

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''

    if (role === 'table' || node.name?.includes('表格') || node.name?.includes('table') || node.name?.includes('列表')) {
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
 * 页面检测函数
 */
async function testPage(
  baseUrl: string,
  page: PageStatus,
  browser: any,
  loginToken?: string
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    // 1. 导航到页面
    await browser.navigate({ url: baseUrl + page.route })

    // 2. 等待页面加载
    await browser.wait({ time: 3 })

    // 3. 获取页面快照
    const snapshot = await browser.snapshot()

    if (!snapshot) {
      console.error(`    ❌ 页面无法渲染: ${page.route}`)
      return {
        ...page,
        status: 'failed',
        errors: 1,
        timestamp: new Date().toISOString(),
        errorDetails: ['页面无法渲染'],
      }
    }

    // 4. 检测交互元素
    const buttons = findAllButtons(snapshot)
    const inputs = findAllInputs(snapshot)
    const cards = findAllCards(snapshot)
    const tables = findAllTables(snapshot)

    console.log(`    元素检测: 按钮(${buttons.length}) 输入框(${inputs.length}) 卡片(${cards.length}) 表格(${tables.length})`)

    // 5. 点击所有按钮（限制数量）
    let clickErrors: string[] = []
    for (const button of buttons.slice(0, 5)) {
      try {
        await browser.click({ element: button.description, ref: button.ref })
        await browser.wait({ time: 0.5 })
        await browser.snapshot()
      } catch (e: any) {
        clickErrors.push(`点击失败: ${button.description} - ${e.message}`)
      }
    }

    // 6. 获取控制台错误
    const errors = await browser.consoleMessages({ level: 'error' })

    const duration = Date.now() - startTime
    const errorCount = errors.length + clickErrors.length

    if (errorCount > 0) {
      console.error(`    ⚠️ 发现 ${errorCount} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errorCount,
        warnings: errors.length,
        timestamp: new Date().toISOString(),
        errorDetails: clickErrors,
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
 * 管理员检测代理执行函数
 */
export async function runAdminAgent(
  baseUrl: string = 'http://localhost:5173',
  options: {
    loginToken?: string
    continueOnError?: boolean
    categories?: ('system' | 'centers' | 'mobile')[]
  } = {}
): Promise<{
  total: number
  completed: number
  failed: number
  pages: PageStatus[]
}> {
  const { loginToken, continueOnError = true, categories = ['system', 'centers', 'mobile'] } = options

  console.log('='.repeat(80))
  console.log('全站健康检测系统 - 管理员检测代理')
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

  if (categories.includes('system')) {
    pagesToTest = pagesToTest.concat(
      ADMIN_PAGES.filter(p => p.route.startsWith('/system/'))
    )
  }

  if (categories.includes('centers')) {
    pagesToTest = pagesToTest.concat(
      ADMIN_PAGES.filter(p => p.route.startsWith('/centers/'))
    )
  }

  if (categories.includes('mobile')) {
    pagesToTest = pagesToTest.concat(
      ADMIN_PAGES.filter(p => p.route.startsWith('/mobile/'))
    )
  }

  console.log(`\n📋 待检测页面数: ${pagesToTest.length}`)

  // 检测页面
  for (const page of pagesToTest) {
    const result = await testPage(baseUrl, page, {
      navigate: async () => {},
      wait: async () => {},
      snapshot: async () => null,
      click: async () => {},
      consoleMessages: async () => [],
    }, loginToken)

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
  console.log('管理员检测完成 - 统计信息')
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

export default runAdminAgent
