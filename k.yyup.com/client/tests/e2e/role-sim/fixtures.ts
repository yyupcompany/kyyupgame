import fs from 'fs'
import path from 'path'
import type { Page, Response } from '@playwright/test'
import type { CollectedIssue, RoleCode } from './types'

const NOISE_CONSOLE_PATTERNS: RegExp[] = [
  /127\.0\.0\.1:7242\/ingest/i,
  /Failed to load resource.*ingest/i
]

const NOISE_REQUEST_PATTERNS: RegExp[] = [
  /127\.0\.0\.1:7242\/ingest/i
]

function nowIso() {
  return new Date().toISOString()
}

export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

export function getRoleSimOutDir() {
  // 运行时通常在 client/ 目录；统一把产物落到 client/test-results/role-sim
  return path.resolve(process.cwd(), 'test-results', 'role-sim')
}

export function writeIssues(role: RoleCode, issues: CollectedIssue[]) {
  const outDir = getRoleSimOutDir()
  ensureDir(outDir)
  const outFile = path.join(outDir, `${role}-issues.json`)
  fs.writeFileSync(outFile, JSON.stringify({ role, generatedAt: nowIso(), issues }, null, 2), 'utf8')
  return outFile
}

export function createCollector(role: RoleCode) {
  const issues: CollectedIssue[] = []
  const dedupe = new Set<string>()

  const push = (it: Omit<CollectedIssue, 'role' | 'ts'>) => {
    const key = [
      role,
      it.type,
      it.url,
      it.route || '',
      it.title || '',
      it.message
    ].join('|')

    if (dedupe.has(key)) return
    dedupe.add(key)
    issues.push({ ...it, role, ts: nowIso() })
  }

  return { issues, push }
}

export function attachSignalCollectors(page: Page, collector: ReturnType<typeof createCollector>) {
  page.on('pageerror', (err) => {
    collector.push({
      type: 'PageError',
      url: page.url(),
      message: err?.message || String(err)
    })
  })

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (NOISE_CONSOLE_PATTERNS.some((re) => re.test(text))) return
    // 某些浏览器会把被拦截的上报请求简化成泛化错误，这里按已知噪音过滤
    if (text === 'Failed to load resource: net::ERR_CONNECTION_REFUSED') return
    collector.push({
      type: 'ConsoleError',
      url: page.url(),
      message: text
    })
  })

  page.on('requestfailed', (req) => {
    const reqUrl = req.url()
    if (NOISE_REQUEST_PATTERNS.some((re) => re.test(reqUrl))) return
    const failure = req.failure()
    collector.push({
      type: 'RequestFailed',
      url: page.url(),
      message: `${req.method()} ${reqUrl} ${failure?.errorText || 'request failed'}`,
      details: {
        resourceType: req.resourceType()
      }
    })
  })

  page.on('response', async (res: Response) => {
    try {
      const req = res.request()
      const rt = req.resourceType()
      if (rt !== 'xhr' && rt !== 'fetch') return
      const status = res.status()
      if (status < 400) return
      collector.push({
        type: 'BadResponse',
        url: page.url(),
        message: `${req.method()} ${res.url()} -> ${status}`,
        details: {
          status,
          resourceType: rt
        }
      })
    } catch {
      // ignore
    }
  })
}

export async function loginAsRole(page: Page, role: RoleCode) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  const btnSelectorMap: Record<RoleCode, string> = {
    admin: '.quick-btn.admin-btn',
    principal: '.quick-btn.principal-btn',
    teacher: '.quick-btn.teacher-btn',
    parent: '.quick-btn.parent-btn'
  }

  await page.locator(btnSelectorMap[role]).click({ timeout: 15000 })
  // 登录页自身有动画/跳转逻辑，避免 networkidle 卡住：用 URL 变化 + 短等待
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 30000 })
  await page.waitForTimeout(800)
}

export async function assertNotBlank(page: Page, context: { role: RoleCode; route?: string; title?: string }, collector: ReturnType<typeof createCollector>) {
  const url = page.url()

  // 被踢回登录：典型权限/路由守卫问题
  if (new URL(url).pathname.endsWith('/login')) {
    collector.push({
      type: 'NavigationRedirectedToLogin',
      url,
      route: context.route,
      title: context.title,
      message: `导航后被重定向到登录页（可能是权限/token/路由守卫问题）`
    })
    return false
  }

  // 关键容器存在
  const app = page.locator('#app')
  try {
    await app.waitFor({ state: 'visible', timeout: 10000 })
  } catch {
    collector.push({
      type: 'BlankScreen',
      url,
      route: context.route,
      title: context.title,
      message: `#app 容器不可见`
    })
    return false
  }

  // 经验性判定：主内容至少要有一个可见标题/容器/卡片/表格/表单/空态
  //（这里覆盖“中心页 timeline / tabs / detail-panel”等常见布局，减少误报）
  const candidates = page.locator(
    [
      'h1',
      'h2',
      'h3',
      '.page-title',
      '.center-title',
      '.page-header',
      '.welcome-section',
      '.page-container',
      '.center-page',
      '.main-content',
      '.content-slot',
      '.content-section',
      '.timeline-container',
      '.timeline-section',
      '.detail-panel',
      '.el-tabs',
      '.el-card',
      '.stat-card',
      '.el-table',
      '.el-form',
      '.el-empty',
      '[role="main"]'
    ].join(', ')
  )
  const count = await candidates.count()
  if (count === 0) {
    collector.push({
      type: 'BlankScreen',
      url,
      route: context.route,
      title: context.title,
      message: `未检测到常见主内容元素（可能白屏/空渲染）`
    })
    return false
  }

  // 二次兜底：#app 文本过短也可能是空渲染（排除纯布局壳）
  try {
    const txt = (await app.innerText({ timeout: 2000 })).replace(/\s+/g, ' ').trim()
    if (txt.length < 20) {
      collector.push({
        type: 'BlankScreen',
        url,
        route: context.route,
        title: context.title,
        message: `#app 文本内容过少（疑似空渲染）`
      })
      return false
    }
  } catch {
    // ignore
  }

  return true
}


