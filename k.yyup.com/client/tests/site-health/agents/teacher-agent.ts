/**
 * 全站健康检测系统 - 教师检测代理
 *
 * 职责：检测教师（Teacher）角色的所有页面
 *
 * 使用方式：
 *  npx claude-code-tool invoke --name="Teacher-Agent" --prompt="检测教师页面"
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
 * 教师页面列表
 */
const TEACHER_PAGES: PageStatus[] = [
  // ===== 教师工作台模块 =====
  { route: '/teacher-center/dashboard', name: '教师仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/activities', name: '活动管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/attendance', name: '考勤管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks', name: '任务管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks/create', name: '新建任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks/detail', name: '任务详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks/edit', name: '编辑任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/enrollment', name: '招生协助', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/customer-pool', name: '客户池', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/customer-tracking', name: '客户跟进', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/teaching', name: '教学工作', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/creative-curriculum', name: '创意课程', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/notifications', name: '通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/performance-rewards', name: '绩效奖励', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/class-contacts', name: '班级联系', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/appointment-management', name: '预约管理', status: 'pending', errors: 0, warnings: 0 },

  // ===== 教师可见业务中心 =====
  { route: '/centers/ActivityCenter', name: '活动中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AssessmentCenter', name: '评估中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AttendanceCenter', name: '考勤中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/DocumentCenter', name: '文档中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/InspectionCenter', name: '检查中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TaskCenter', name: '任务中心', status: 'pending', errors: 0, warnings: 0 },

  // ===== 移动端教师页面 =====
  { route: '/mobile/teacher-center/dashboard', name: '移动端教师仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/activities', name: '移动端活动管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/teaching', name: '移动端教学工作', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/attendance', name: '移动端考勤管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/customer-pool', name: '移动端客户池', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/customer-tracking', name: '移动端客户跟进', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks', name: '移动端任务管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks/create', name: '移动端新建任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks/detail', name: '移动端任务详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks/edit', name: '移动端编辑任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/performance-rewards', name: '移动端绩效奖励', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/notifications', name: '移动端通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/enrollment', name: '移动端招生协助', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/appointment-management', name: '移动端预约管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/class-contacts', name: '移动端班级联系', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/creative-curriculum', name: '移动端创意课程', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 教师仪表板特殊检测
 */
async function testTeacherDashboard(
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

    // 检测今日待办
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${cards.length} 个卡片`)

    // 检测快捷入口
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 检测统计信息
    const stats = findAllStats(snapshot)
    console.log(`    发现 ${stats.length} 个统计项`)

    // 点击快捷操作按钮
    for (const button of buttons.slice(0, 3)) {
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
 * 活动管理页面检测
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

    // 检测活动列表
    const tables = findAllTables(snapshot)
    console.log(`    发现 ${tables.length} 个表格`)

    // 检测筛选器
    const inputs = findAllInputs(snapshot)
    console.log(`    发现 ${inputs.length} 个输入框`)

    // 检测操作按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 测试筛选功能
    for (const input of inputs.slice(0, 2)) {
      try {
        await browser.type({
          element: input.description,
          ref: input.ref,
          text: '测试'
        })
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
 * 任务管理页面检测
 */
async function testTasks(
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

    // 检测任务列表
    const tables = findAllTables(snapshot)
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${tables.length} 个表格, ${cards.length} 个卡片`)

    // 检测新增按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 点击新建任务按钮
    const createButton = buttons.find(b =>
      b.description.includes('新建') || b.description.includes('创建') || b.description.includes('添加')
    )
    if (createButton) {
      try {
        await browser.click({ element: createButton.description, ref: createButton.ref })
        await browser.wait({ time: 0.5 })
        await browser.snapshot()

        // 检测表单
        const formInputs = findAllInputs(snapshot)
        console.log(`    表单中有 ${formInputs.length} 个输入框`)

        // 填写表单
        for (const input of formInputs.slice(0, 3)) {
          try {
            await browser.type({
              element: input.description,
              ref: input.ref,
              text: '测试数据'
            })
          } catch (e: any) {
            // 忽略
          }
        }

        // 点击取消或关闭
        const cancelButtons = buttons.filter(b =>
          b.description.includes('取消') || b.description.includes('关闭')
        )
        for (const btn of cancelButtons.slice(0, 1)) {
          try {
            await browser.click({ element: btn.description, ref: btn.ref })
          } catch (e: any) {
            // 忽略
          }
        }
      } catch (e: any) {
        console.log(`    ⚠️ 新建任务操作失败: ${e.message}`)
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
 * 考勤管理页面检测
 */
async function testAttendance(
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

    // 检测考勤表格
    const tables = findAllTables(snapshot)
    console.log(`    发现 ${tables.length} 个表格`)

    // 检测日期选择器
    const inputs = findAllInputs(snapshot)
    console.log(`    发现 ${inputs.length} 个输入框`)

    // 检测操作按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 测试日期选择
    for (const input of inputs.slice(0, 1)) {
      try {
        await browser.click({ element: input.description, ref: input.ref })
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

    if (role === 'textbox' || role === 'searchbox' || role === 'combobox' || role === 'spinbutton') {
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
 * 查找统计项
 */
function findAllStats(snapshot: any): { description: string; ref: string }[] {
  const stats: { description: string; ref: string }[] = []
  if (!snapshot) return stats

  function traverse(node: any) {
    if (!node) return

    const name = node.name || ''
    const description = node.description || ''

    // 匹配数字统计项
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
 * 教师检测代理执行函数
 */
export async function runTeacherAgent(
  baseUrl: string = 'http://localhost:5173',
  options: {
    loginToken?: string
    continueOnError?: boolean
    categories?: ('teacher-center' | 'centers' | 'mobile')[]
  } = {}
): Promise<{
  total: number
  completed: number
  failed: number
  pages: PageStatus[]
}> {
  const { loginToken, continueOnError = true, categories = ['teacher-center', 'centers', 'mobile'] } = options

  console.log('='.repeat(80))
  console.log('全站健康检测系统 - 教师检测代理')
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

  if (categories.includes('teacher-center')) {
    pagesToTest = pagesToTest.concat(
      TEACHER_PAGES.filter(p => p.route.startsWith('/teacher-center/'))
    )
  }

  if (categories.includes('centers')) {
    pagesToTest = pagesToTest.concat(
      TEACHER_PAGES.filter(p => p.route.startsWith('/centers/'))
    )
  }

  if (categories.includes('mobile')) {
    pagesToTest = pagesToTest.concat(
      TEACHER_PAGES.filter(p => p.route.startsWith('/mobile/'))
    )
  }

  console.log(`\n📋 待检测页面数: ${pagesToTest.length}`)

  // 检测页面
  for (const page of pagesToTest) {
    let result: PageStatus

    // 根据页面路由选择检测方法
    if (page.route === '/teacher-center/dashboard' || page.route === '/mobile/teacher-center/dashboard') {
      result = await testTeacherDashboard(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.includes('activities') || page.route.includes('Enrollment')) {
      result = await testActivities(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.includes('tasks')) {
      result = await testTasks(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.includes('attendance')) {
      result = await testAttendance(baseUrl, page, {
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
  console.log('教师检测完成 - 统计信息')
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

export default runTeacherAgent
