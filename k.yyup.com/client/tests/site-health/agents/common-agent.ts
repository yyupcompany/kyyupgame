/**
 * 全站健康检测系统 - 公共页面检测代理
 *
 * 职责：检测不需要登录即可访问的公共页面
 *
 * 使用方式：
 *  npx claude-code-tool invoke --name="Common-Agent" --prompt="检测公共页面"
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
 * 公共页面列表
 */
const COMMON_PAGES: PageStatus[] = [
  // ===== 认证相关 =====
  { route: '/login', name: '登录页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/register', name: '注册页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/forgot-password', name: '忘记密码页', status: 'pending', errors: 0, warnings: 0 },

  // ===== 设备选择 =====
  { route: '/', name: '设备选择页', status: 'pending', errors: 0, warnings: 0 },

  // ===== 错误页面 =====
  { route: '/403', name: '403错误页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/404', name: '404错误页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/500', name: '500错误页', status: 'pending', errors: 0, warnings: 0 },

  // ===== 移动端 =====
  { route: '/mobile/login', name: '移动端登录页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile-demo', name: '移动端Demo页', status: 'pending', errors: 0, warnings: 0 },

  // ===== 其他公共页面 =====
  { route: '/about', name: '关于页面', status: 'pending', errors: 0, warnings: 0 },
  { route: '/help', name: '帮助页面', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 登录页特殊检测
 */
async function testLoginPage(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 2 })

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

    // 检测表单元素
    const inputs = findAllInputs(snapshot)
    console.log(`    发现 ${inputs.length} 个输入框`)

    // 检测按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 测试用户名输入
    const usernameInput = inputs.find(i =>
      i.description.includes('用户名') || i.description.includes('手机') || i.description.includes('账号')
    )
    if (usernameInput) {
      try {
        await browser.type({
          element: usernameInput.description,
          ref: usernameInput.ref,
          text: 'test@example.com'
        })
        console.log(`    ✅ 用户名输入成功`)
      } catch (e: any) {
        console.log(`    ⚠️ 用户名输入失败: ${e.message}`)
      }
    }

    // 测试密码输入
    const passwordInput = inputs.find(i =>
      i.description.includes('密码') || i.type === 'password'
    )
    if (passwordInput) {
      try {
        await browser.type({
          element: passwordInput.description,
          ref: passwordInput.ref,
          text: 'test123456'
        })
        console.log(`    ✅ 密码输入成功`)
      } catch (e: any) {
        console.log(`    ⚠️ 密码输入失败: ${e.message}`)
      }
    }

    // 点击登录按钮
    const loginButton = buttons.find(b =>
      b.description.includes('登录') || b.description.includes('登录') || b.description.includes('sign in')
    )
    if (loginButton) {
      try {
        await browser.click({ element: loginButton.description, ref: loginButton.ref })
        await browser.wait({ time: 1 })
      } catch (e: any) {
        console.log(`    ⚠️ 登录按钮点击失败: ${e.message}`)
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
 * 注册页特殊检测
 */
async function testRegisterPage(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 2 })

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

    // 检测表单元素
    const inputs = findAllInputs(snapshot)
    console.log(`    发现 ${inputs.length} 个输入框`)

    // 检测按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 填写注册表单
    for (const input of inputs.slice(0, 4)) {
      try {
        await browser.type({
          element: input.description,
          ref: input.ref,
          text: '测试数据'
        })
        await browser.wait({ time: 0.1 })
      } catch (e: any) {
        // 忽略
      }
    }

    // 点击注册按钮
    const registerButton = buttons.find(b =>
      b.description.includes('注册') || b.description.includes('提交') || b.description.includes('sign up')
    )
    if (registerButton) {
      try {
        await browser.click({ element: registerButton.description, ref: registerButton.ref })
        await browser.wait({ time: 1 })
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
 * 错误页特殊检测
 */
async function testErrorPage(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 2 })

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

    // 检测错误信息显示
    const text = extractAllText(snapshot)
    console.log(`    页面文本长度: ${text.length} 字符`)

    // 检测返回按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 点击返回按钮
    const backButton = buttons.find(b =>
      b.description.includes('返回') || b.description.includes('首页') || b.description.includes('back')
    )
    if (backButton) {
      try {
        await browser.click({ element: backButton.description, ref: backButton.ref })
        await browser.wait({ time: 0.5 })
      } catch (e: any) {
        // 忽略
      }
    }

    const errors = await browser.consoleMessages({ level: 'error' })
    const duration = Date.now() - startTime

    // 错误页本身的console可能有预期内的错误，不计入失败
    const criticalErrors = errors.filter(e =>
      !e.message.includes('404') && !e.message.includes('500') && !e.message.includes('Not Found')
    )

    if (criticalErrors.length > 0) {
      console.error(`    ⚠️ 发现 ${criticalErrors.length} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: criticalErrors.length,
        warnings: criticalErrors.length,
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
 * 设备选择页特殊检测
 */
async function testDeviceSelectPage(
  baseUrl: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    await browser.navigate({ url: baseUrl + page.route })
    await browser.wait({ time: 2 })

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

    // 检测设备选项
    const cards = findAllCards(snapshot)
    console.log(`    发现 ${cards.length} 个设备选项`)

    // 检测按钮
    const buttons = findAllButtons(snapshot)
    console.log(`    发现 ${buttons.length} 个按钮`)

    // 点击PC端入口
    const pcButton = buttons.find(b =>
      b.description.includes('PC') || b.description.includes('电脑') || b.description.includes('管理')
    )
    if (pcButton) {
      try {
        await browser.click({ element: pcButton.description, ref: pcButton.ref })
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
    await browser.wait({ time: 2 })

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
    for (const button of buttons.slice(0, 2)) {
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

    if (role === 'textbox' || role === 'searchbox' || role === 'combobox' || role === 'email' || role === 'tel') {
      inputs.push({
        description: node.name || node.description || '输入框',
        ref: node.ref || '',
        type: node.type || '',
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
 * 提取所有文本
 */
function extractAllText(snapshot: any): string {
  let text = ''

  function traverse(node: any) {
    if (!node) return

    if (node.name) {
      text += node.name + ' '
    }
    if (node.description) {
      text += node.description + ' '
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return text
}

/**
 * 公共页面检测代理执行函数
 */
export async function runCommonAgent(
  baseUrl: string = 'http://localhost:5173',
  options: {
    continueOnError?: boolean
    categories?: ('auth' | 'error' | 'device' | 'other')[]
  } = {}
): Promise<{
  total: number
  completed: number
  failed: number
  pages: PageStatus[]
}> {
  const { continueOnError = true, categories = ['auth', 'error', 'device', 'other'] } = options

  console.log('='.repeat(80))
  console.log('全站健康检测系统 - 公共页面检测代理')
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

  if (categories.includes('auth')) {
    pagesToTest = pagesToTest.concat(
      COMMON_PAGES.filter(p => p.route === '/login' || p.route === '/register' || p.route === '/forgot-password')
    )
  }

  if (categories.includes('error')) {
    pagesToTest = pagesToTest.concat(
      COMMON_PAGES.filter(p => p.route.startsWith('/4') || p.route.startsWith('/5'))
    )
  }

  if (categories.includes('device')) {
    pagesToTest = pagesToTest.concat(
      COMMON_PAGES.filter(p => p.route === '/' || p.route === '/mobile-demo')
    )
  }

  if (categories.includes('other')) {
    pagesToTest = pagesToTest.concat(
      COMMON_PAGES.filter(p => !pagesToTest.includes(p))
    )
  }

  console.log(`\n📋 待检测页面数: ${pagesToTest.length}`)

  // 检测页面
  for (const page of pagesToTest) {
    let result: PageStatus

    // 根据页面路由选择检测方法
    if (page.route === '/login' || page.route === '/mobile/login') {
      result = await testLoginPage(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route === '/register') {
      result = await testRegisterPage(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route.startsWith('/4') || page.route.startsWith('/5')) {
      result = await testErrorPage(baseUrl, page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        type: async () => {},
        consoleMessages: async () => [],
      })
    } else if (page.route === '/') {
      result = await testDeviceSelectPage(baseUrl, page, {
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
  console.log('公共页面检测完成 - 统计信息')
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

export default runCommonAgent
