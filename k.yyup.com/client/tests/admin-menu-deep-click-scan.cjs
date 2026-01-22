/**
 * Admin 菜单深度点击巡检（仅前端）
 *
 * 目标：
 * - 使用登录页“快捷登录-系统管理员”（.admin-btn）登录
 * - 遍历 admin 侧边栏所有一级菜单页面
 * - 在每个页面中尝试点击少量“安全按钮/链接”（避免删除/危险操作）
 * - 捕获：空白页、页面崩溃（pageerror）、关键控制台错误
 *
 * 约束：
 * - 不允许修改后端；本脚本只做前端自动化巡检
 * - 必须 headless
 */
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const OUTPUT_DIR = path.join(__dirname, 'admin-menu-deep-click-results')
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots')

const ADMIN_MENUS = [
  { name: '管理控制台', path: '/dashboard' },
  // 业务管理
  { name: '业务中心', path: '/centers/business' },
  { name: '活动中心', path: '/centers/activity' },
  { name: '招生中心', path: '/centers/enrollment' },
  { name: '客户池中心', path: '/centers/customer-pool' },
  { name: '任务中心', path: '/centers/task' },
  { name: '文档中心', path: '/centers/document-center' },
  { name: '财务中心', path: '/centers/finance' },
  // 营销管理
  { name: '营销中心', path: '/centers/marketing' },
  { name: '呼叫中心', path: '/centers/call' },
  { name: '相册中心', path: '/centers/media' },
  { name: '新媒体中心', path: '/principal/media-center' },
  // 人事与教学管理
  { name: '人员中心', path: '/centers/personnel' },
  { name: '教学中心', path: '/centers/teaching' },
  { name: '测评中心', path: '/centers/assessment' },
  { name: '考勤中心', path: '/centers/attendance' },
  // 数据与分析管理
  { name: '数据分析中心', path: '/centers/analytics' },
  { name: '用量中心', path: '/centers/usage' },
  // 治理与集团管理
  { name: '集团中心', path: '/group' },
  { name: '督查中心', path: '/centers/inspection' },
  // 系统与AI管理
  { name: '系统中心', path: '/centers/system' },
  { name: 'AI中心', path: '/centers/ai' }
]

function ensureDirs() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

function safeFileName(input) {
  return String(input).replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/^_+|_+$/g, '')
}

function isCriticalConsoleError(text) {
  if (!text) return false
  const ignore = [
    'favicon',
    'ERR_CONNECTION_REFUSED', // 常见采集/监控上报失败，不影响页面
    'net::ERR',
    'Failed to load resource'
  ]
  return !ignore.some(k => text.includes(k))
}

async function detectBlank(page) {
  return await page.evaluate(() => {
    const app = document.querySelector('#app')
    const bodyText = (document.body?.innerText || '').trim()
    const appText = (app?.textContent || '').trim()

    const visibleCount = Array.from(document.querySelectorAll('body *')).filter(el => {
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity || 1) > 0 &&
        rect.width > 0 &&
        rect.height > 0
    }).length

    // 经验规则：既没有可见元素，也没有文本，且 #app 为空/极少文本
    const isBlank = visibleCount < 20 && bodyText.length < 20 && appText.length < 20

    // 另外一种：出现典型“白屏崩溃”时，#app 存在但内容为空
    const appEmpty = !!app && app.innerHTML.trim().length < 20

    return {
      isBlank: isBlank || (appEmpty && bodyText.length < 50),
      visibleCount,
      bodyTextLen: bodyText.length,
      appTextLen: appText.length
    }
  })
}

async function loginAdmin(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 20000 })

  // 登录页里有“快捷登录”按钮：.admin-btn
  const btn = page.locator('.quick-login .admin-btn')
  if (await btn.count()) {
    await btn.first().click({ timeout: 10000 })
  } else {
    // 兼容：若结构变化，退化用 .admin-btn
    await page.locator('.admin-btn').first().click({ timeout: 10000 })
  }

  // 等待进入系统（通常 /dashboard）
  await page.waitForURL(url => !String(url).includes('/login'), { timeout: 20000 })
  await page.waitForTimeout(800)
}

async function clickSomeSafeActions(page, maxClicks = 3) {
  // 只在 main 内容区里找（避免点到侧边栏/顶部退出等）
  const candidates = page.locator('main button, main a, main [role="button"]')
  const count = await candidates.count()
  if (!count) return []

  const clicked = []
  for (let i = 0; i < count && clicked.length < maxClicks; i++) {
    const el = candidates.nth(i)
    const text = (await el.innerText().catch(() => ''))?.trim()
    const aria = (await el.getAttribute('aria-label').catch(() => ''))?.trim()
    const label = text || aria || ''

    // 跳过危险/破坏性操作
    const dangerous = ['删除', '移除', '清空', '重置数据', '停用', '禁用', '注销', '退出']
    if (dangerous.some(k => label.includes(k))) continue

    // 优先点击“安全动作”
    const safeKeywords = ['查看', '详情', '编辑', '新建', '创建', '刷新', '导出', '设置', '管理', '进入', '打开', '任务', 'AI']
    if (label && !safeKeywords.some(k => label.includes(k))) continue

    // 避免对话框里的按钮造成连锁（先只点可见的）
    if (!(await el.isVisible().catch(() => false))) continue
    if (!(await el.isEnabled().catch(() => false))) continue

    const beforeUrl = page.url()
    try {
      await el.click({ timeout: 3000 })
      await page.waitForTimeout(800)
      // 若发生路由跳转，等待稳定
      if (page.url() !== beforeUrl) {
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
        await page.waitForTimeout(800)
      }
      clicked.push({ label: label || '(no label)', from: beforeUrl, to: page.url() })
    } catch {
      // 忽略单个按钮点击失败（可能被遮罩/动画/禁用）
    }
  }
  return clicked
}

async function testRoute(browser, menu) {
  // ⚠️ 该函数已被新的“单次登录复用Page”逻辑替代，保留空实现避免外部误调用
  // 旧实现（每页新建context+重新登录+networkidle）会导致整体非常慢，且可能卡死在networkidle
  throw new Error('testRoute() 已弃用，请使用 main() 中的单次登录复用Page流程')
}

async function main() {
  ensureDirs()
  console.log(`🧪 Admin 深度点击巡检开始: ${BASE_URL}`)

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  })

  const results = []
  try {
    // ✅ 改为：只创建一个context+page，登录一次，然后逐页访问/点击
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    page.setDefaultTimeout(20000)

    // 全局监听（每个页面用 buffer 归集）
    let currentConsoleErrors = []
    let currentPageErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (isCriticalConsoleError(text)) currentConsoleErrors.push(text)
      }
    })
    page.on('pageerror', err => {
      currentPageErrors.push(err.message)
    })

    console.log('🔐 执行一次 admin 快捷登录...')
    await loginAdmin(page)
    console.log('✅ 登录完成，开始逐页巡检')

    for (const menu of ADMIN_MENUS) {
      currentConsoleErrors = []
      currentPageErrors = []

      const start = Date.now()
      const r = {
        name: menu.name,
        path: menu.path,
        url: `${BASE_URL}${menu.path}`,
        status: 'PASS',
        loadTimeMs: 0,
        blank: null,
        consoleErrors: [],
        pageErrors: [],
        clickedActions: [],
        screenshot: null
      }

      console.log(`🔎 测试: ${menu.name} ${menu.path}`)

      try {
        // 🚫 避免 networkidle 卡死：使用 domcontentloaded + 轻微等待
        await page.goto(r.url, { waitUntil: 'domcontentloaded', timeout: 25000 })
        await page.waitForTimeout(1200)

        // 白屏检测（页面级）
        const blankInfo = await detectBlank(page)
        r.blank = blankInfo
        if (blankInfo.isBlank) r.status = 'BLANK'

        // 深度点击（按钮/子页面入口）
        const clicks = await clickSomeSafeActions(page, 3)
        r.clickedActions = clicks

        // 点击后再次检测
        const blankAfter = await detectBlank(page)
        if (blankAfter.isBlank) {
          r.status = 'BLANK'
          r.blank = { ...blankAfter, stage: 'afterClick' }
        }

        r.consoleErrors = currentConsoleErrors.slice(0, 5)
        r.pageErrors = currentPageErrors.slice(0, 3)

        if (r.pageErrors.length || r.consoleErrors.length) {
          r.status = r.status === 'BLANK' ? 'BLANK' : 'FAIL'
        }

        if (r.status !== 'PASS') {
          const shotName = `${safeFileName(menu.name)}_${safeFileName(menu.path)}.png`
          const shotPath = path.join(SCREENSHOT_DIR, shotName)
          await page.screenshot({ path: shotPath, fullPage: true })
          r.screenshot = shotPath
        }
      } catch (e) {
        r.status = 'ERROR'
        r.pageErrors = [...(r.pageErrors || []), String(e?.message || e)].slice(0, 3)
        const shotName = `${safeFileName(menu.name)}_${safeFileName(menu.path)}_ERROR.png`
        const shotPath = path.join(SCREENSHOT_DIR, shotName)
        try {
          await page.screenshot({ path: shotPath, fullPage: true })
          r.screenshot = shotPath
        } catch {}
      } finally {
        r.loadTimeMs = Date.now() - start
        results.push(r)

        const icon = r.status === 'PASS' ? '✅' : (r.status === 'BLANK' ? '⬜' : '❌')
        console.log(`${icon} ${menu.name} -> ${r.status} (${r.loadTimeMs}ms)`)
        if (r.status !== 'PASS') {
          if (r.blank?.isBlank) console.log(`   白屏判定: visible=${r.blank.visibleCount}, bodyLen=${r.blank.bodyTextLen}`)
          if (r.pageErrors?.length) console.log(`   pageerror: ${r.pageErrors[0].slice(0, 120)}`)
          if (r.consoleErrors?.length) console.log(`   console: ${r.consoleErrors[0].slice(0, 120)}`)
        }
      }
    }

    await page.close()
    await context.close()
  } finally {
    await browser.close()
  }

  const outJson = path.join(OUTPUT_DIR, `report-${Date.now()}.json`)
  fs.writeFileSync(outJson, JSON.stringify({ baseUrl: BASE_URL, results }, null, 2))

  const failed = results.filter(r => r.status !== 'PASS')
  console.log('\n' + '='.repeat(60))
  console.log(`完成：PASS ${results.length - failed.length} / ${results.length}，异常 ${failed.length}`)
  if (failed.length) {
    console.log('异常列表：')
    failed.forEach(r => console.log(`- ${r.status} ${r.name} (${r.path})`))
  }
  console.log(`报告: ${outJson}`)
  console.log('='.repeat(60))

  // exit code：有异常则返回1，便于CI/脚本链路识别
  process.exit(failed.length ? 1 : 0)
}

if (require.main === module) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}


