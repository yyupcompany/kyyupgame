/* eslint-disable no-console */
/**
 * 前后端端点对齐检测（静态扫描版）
 *
 * - 不启动服务、不请求后端、不修改后端
 * - 扫描后端 server/src 中 (app|router).(get|post|put|delete|patch) 的路径字面量
 * - 扫描前端 client/src 中 get/post/put/delete/patch 调用与 request({url}) 的路径字面量
 * - 规范化（去掉 /api 前缀、去掉 query、模板字符串参数归一化）后做集合比对
 * - 生成 Markdown 报告到 docs/
 */

const fs = require('fs')
const path = require('path')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const SERVER_SRC = path.join(PROJECT_ROOT, 'server', 'src')
const CLIENT_SRC = path.join(PROJECT_ROOT, 'client', 'src')
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function walkFiles(rootDir, exts) {
  /** @type {string[]} */
  const results = []
  /** @type {string[]} */
  const stack = [rootDir]

  while (stack.length) {
    const dir = stack.pop()
    if (!dir) continue

    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }

    for (const ent of entries) {
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        // 跳过一些大目录
        if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git') continue
        stack.push(p)
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase()
        if (exts.includes(ext)) results.push(p)
      }
    }
  }
  return results
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

function stripQuery(p) {
  const idx = p.indexOf('?')
  return idx >= 0 ? p.slice(0, idx) : p
}

function normalizePath(p) {
  if (!p) return ''
  let x = String(p).trim()
  x = stripQuery(x)
  // 只处理 / 开头的相对路径（避免把 http:// 之类算进去）
  if (!x.startsWith('/')) return ''
  // 统一 /api 前缀
  if (x.startsWith('/api/')) x = x.slice('/api'.length)
  if (x === '/api') x = '/'

  // 模板字符串参数归一化
  x = x.replace(/\$\{[^}]+\}/g, ':param')
  // 常见 path param 统一
  x = x.replace(/\/:(\w+)/g, '/:param')
  // 清理重复斜杠
  x = x.replace(/\/{2,}/g, '/')
  // 去掉末尾斜杠（根路径除外）
  if (x.length > 1 && x.endsWith('/')) x = x.slice(0, -1)
  return x
}

function resolveImport(fromFile, spec) {
  if (!spec || typeof spec !== 'string') return null
  if (!spec.startsWith('.')) return null
  const baseDir = path.dirname(fromFile)
  const raw = path.resolve(baseDir, spec)
  const candidates = [
    raw,
    `${raw}.ts`,
    `${raw}.js`,
    `${raw}.cjs`,
    `${raw}.mjs`,
    path.join(raw, 'index.ts'),
    path.join(raw, 'index.js')
  ]
  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c
    } catch {
      // ignore
    }
  }
  return null
}

function parseImports(filePath, content) {
  /** @type {Map<string, string>} */
  const map = new Map()
  // import foo from './x'
  const re1 = /\bimport\s+([A-Za-z0-9_$]+)\s+from\s+['"]([^'"]+)['"]/g
  let m
  while ((m = re1.exec(content))) {
    const ident = m[1]
    const spec = m[2]
    const resolved = resolveImport(filePath, spec)
    if (resolved) map.set(ident, resolved)
  }
  // const foo = require('./x')
  const re2 = /\bconst\s+([A-Za-z0-9_$]+)\s*=\s*require\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = re2.exec(content))) {
    const ident = m[1]
    const spec = m[2]
    const resolved = resolveImport(filePath, spec)
    if (resolved) map.set(ident, resolved)
  }
  return map
}

function extractRouterUseMounts(content) {
  /** @type {{mountPath: string, lastIdent: string}[]} */
  const out = []
  // router.use('/x', something...)
  const re = /\brouter\s*\.\s*use\s*\(\s*(['"`])(\/[^'"`]+)\1\s*,([\s\S]*?)\)/g
  let m
  while ((m = re.exec(content))) {
    const mountPath = normalizePath(m[2])
    const rest = m[3] || ''
    const parts = rest
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (!parts.length) continue
    const last = parts[parts.length - 1]
    if (/[\s({]/.test(last)) continue
    if (!/^[A-Za-z0-9_$]+$/.test(last)) continue
    out.push({ mountPath, lastIdent: last })
  }
  return out
}

function guessSuggestion(clientPathNorm, backendSet) {
  // 简单候选：同尾段 / 同前缀
  const segs = clientPathNorm.split('/').filter(Boolean)
  const last = segs[segs.length - 1] || ''
  /** @type {{p:string, score:number}[]} */
  const scored = []
  for (const b of backendSet) {
    const bSegs = b.split('/').filter(Boolean)
    const bLast = bSegs[bSegs.length - 1] || ''
    let score = 0
    if (bLast && last && bLast === last) score += 5
    if (b.startsWith(clientPathNorm.split('/:param')[0])) score += 3
    if (b.includes(last) && last.length >= 4) score += 2
    // 共同前缀长度（字符）
    const minLen = Math.min(b.length, clientPathNorm.length)
    let i = 0
    while (i < minLen && b[i] === clientPathNorm[i]) i++
    score += Math.min(4, Math.floor(i / 6))
    if (score > 0) scored.push({ p: b, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 5).map(s => s.p)
}

/**
 * 抽取后端端点（粗粒度：只抓路径字面量）
 * @param {string} content
 * @returns {{method:string, path:string}[]}
 */
function extractBackendEndpoints(content) {
  /** @type {{method:string, path:string}[]} */
  const out = []

  // app.get('/api/xxx') / router.post('/xxx') ...
  const re = /\b(app|router)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*(['"`])([^'"`]+)\3/g
  let m
  while ((m = re.exec(content))) {
    const method = m[2].toUpperCase()
    const p = normalizePath(m[4])
    if (p) out.push({ method, path: p })
  }
  return out
}

function collectBackendEndpointsWithMounts(entryFile) {
  /** @type {Set<string>} */
  const backendAll = new Set()
  /** @type {Map<string, Set<string>>} */
  const backendByMethod = new Map()

  /** @type {Set<string>} */
  const visited = new Set()
  /** @type {{prefix:string, file:string}[]} */
  const queue = [{ prefix: '', file: entryFile }]

  while (queue.length) {
    const cur = queue.shift()
    if (!cur) continue
    const key = `${cur.prefix}::${cur.file}`
    if (visited.has(key)) continue
    visited.add(key)

    const content = safeRead(cur.file)
    if (!content) continue

    // 当前文件中的端点（带 prefix）
    const eps = extractBackendEndpoints(content)
    for (const e of eps) {
      const full = normalizePath(`${cur.prefix}${e.path}`)
      if (!full) continue
      backendAll.add(full)
      const set = backendByMethod.get(e.method) || new Set()
      set.add(full)
      backendByMethod.set(e.method, set)
    }

    // 继续追踪 router.use('/prefix', childRouter)
    const imports = parseImports(cur.file, content)
    const mounts = extractRouterUseMounts(content)
    for (const mt of mounts) {
      const childFile = imports.get(mt.lastIdent)
      if (!childFile) continue
      const childPrefix = normalizePath(`${cur.prefix}${mt.mountPath}`)
      if (!childPrefix) continue
      queue.push({ prefix: childPrefix, file: childFile })
    }
  }

  return { backendAll, backendByMethod }
}

/**
 * 抽取前端 API 调用端点（粗粒度）
 * @param {string} content
 * @returns {string[]}
 */
function extractClientApiPaths(content) {
  /** @type {string[]} */
  const out = []

  // get('/xxx'), post(`/xxx/${id}`) 等
  const reCall = /\b(get|post|put|patch|del|delete)\s*\(\s*(['"`])(\/[^'"`]+)\2/g
  let m
  while ((m = reCall.exec(content))) {
    const p = normalizePath(m[3])
    if (p) out.push(p)
  }

  // request({ url: '/xxx' })
  const reUrl = /\burl\s*:\s*(['"`])(\/[^'"`]+)\1/g
  while ((m = reUrl.exec(content))) {
    const p = normalizePath(m[2])
    if (p) out.push(p)
  }

  return out
}

/**
 * 抽取前端路由跳转（router.push('/xxx')）用于“页面端点对齐”辅助排查
 * @param {string} content
 * @returns {string[]}
 */
function extractClientNavPaths(content) {
  /** @type {string[]} */
  const out = []
  const rePush = /\brouter\s*\.\s*push\s*\(\s*(['"`])(\/[^'"`]+)\1\s*\)/g
  let m
  while ((m = rePush.exec(content))) {
    const p = normalizePath(m[2])
    if (p) out.push(p)
  }
  return out
}

function extractFrontendRouteDefs(routerRoutesDir) {
  const routeFiles = walkFiles(routerRoutesDir, ['.ts', '.js'])
  /** @type {Set<string>} */
  const paths = new Set()
  const rePath = /\bpath\s*:\s*(['"`])(\/[^'"`]+)\1/g
  for (const f of routeFiles) {
    const c = safeRead(f)
    let m
    while ((m = rePath.exec(c))) {
      const p = normalizePath(m[2])
      if (p) paths.add(p)
    }
  }
  return paths
}

function main() {
  ensureDir(DOCS_DIR)

  // 1) 后端端点集合（并集策略）
  //  - A: 全量扫描 server/src 的 (app|router).METHOD('...') 字面量（覆盖“函数注册路由”等情况）
  //  - B: 从主路由 entry 递归推导 router.use 前缀（覆盖“子Router挂载前缀”情况）
  const backendFiles = walkFiles(SERVER_SRC, ['.ts', '.js'])
  /** @type {Set<string>} */
  const backendAll = new Set()
  /** @type {Map<string, Set<string>>} */
  const backendByMethod = new Map()

  // A) 全量扫描
  for (const f of backendFiles) {
    const c = safeRead(f)
    const eps = extractBackendEndpoints(c)
    for (const e of eps) {
      backendAll.add(e.path)
      const set = backendByMethod.get(e.method) || new Set()
      set.add(e.path)
      backendByMethod.set(e.method, set)
    }
  }

  // B) 前缀推导补全（并入集合）
  const serverEntry = path.join(SERVER_SRC, 'routes', 'index.ts')
  const mounted = collectBackendEndpointsWithMounts(serverEntry)
  for (const p of mounted.backendAll) backendAll.add(p)
  for (const [method, set] of mounted.backendByMethod.entries()) {
    const tgt = backendByMethod.get(method) || new Set()
    for (const p of set) tgt.add(p)
    backendByMethod.set(method, tgt)
  }

  // 2) 前端 API 端点集合
  const clientFiles = walkFiles(CLIENT_SRC, ['.ts', '.tsx', '.js', '.vue', '.cjs', '.mjs'])
  /** @type {Map<string, {paths:Set<string>, occurrences: Map<string, {files:Set<string>}>}>} */
  const client = {
    paths: new Set(),
    occurrences: new Map()
  }

  for (const f of clientFiles) {
    const c = safeRead(f)
    const apiPaths = extractClientApiPaths(c)
    for (const p of apiPaths) {
      client.paths.add(p)
      const occ = client.occurrences.get(p) || { files: new Set() }
      occ.files.add(path.relative(PROJECT_ROOT, f))
      client.occurrences.set(p, occ)
    }
  }

  // 3) 前端路由跳转对齐（辅助项）
  const routerRoutesDir = path.join(CLIENT_SRC, 'router', 'routes')
  const feRouteDefs = extractFrontendRouteDefs(routerRoutesDir)
  /** @type {Map<string, {files:Set<string>}>} */
  const navOccurrences = new Map()
  /** @type {Set<string>} */
  const navPaths = new Set()
  for (const f of clientFiles) {
    const c = safeRead(f)
    const navs = extractClientNavPaths(c)
    for (const p of navs) {
      navPaths.add(p)
      const occ = navOccurrences.get(p) || { files: new Set() }
      occ.files.add(path.relative(PROJECT_ROOT, f))
      navOccurrences.set(p, occ)
    }
  }

  // 4) 比对：前端有、后端没有
  /** @type {{path:string, files:string[], suggestions:string[]}[]} */
  const clientMissing = []
  for (const p of Array.from(client.paths).sort()) {
    if (!backendAll.has(p)) {
      clientMissing.push({
        path: p,
        files: Array.from(client.occurrences.get(p)?.files || []).sort(),
        suggestions: guessSuggestion(p, backendAll)
      })
    }
  }

  // 5) 比对：前端 router.push 有、前端路由表没有（典型白屏/404来源）
  /** @type {{path:string, files:string[], suggestions:string[]}[]} */
  const navMissing = []
  for (const p of Array.from(navPaths).sort()) {
    if (!feRouteDefs.has(p)) {
      navMissing.push({
        path: p,
        files: Array.from(navOccurrences.get(p)?.files || []).sort(),
        suggestions: guessSuggestion(p, feRouteDefs)
      })
    }
  }

  const now = new Date()
  const y = now.getFullYear()
  const m2 = String(now.getMonth() + 1).padStart(2, '0')
  const d2 = String(now.getDate()).padStart(2, '0')
  const reportPath = path.join(DOCS_DIR, `endpoint-alignment-report-${y}${m2}${d2}.md`)

  const lines = []
  lines.push(`# 前后端端点对齐检测报告 (${y}-${m2}-${d2})`)
  lines.push('')
  lines.push(`- 扫描后端文件数: **${backendFiles.length}**`)
  lines.push(`- 抽取到后端端点数(去重, 仅字面量): **${backendAll.size}**`)
  lines.push(`- 扫描前端文件数: **${clientFiles.length}**`)
  lines.push(`- 抽取到前端 API 调用端点数(去重): **${client.paths.size}**`)
  lines.push('')
  lines.push(`> 说明：这是“静态扫描”结果（基于代码里的路径字面量），可能存在少量误报/漏报（例如路径由变量拼接、或多级 router.use 前缀组合）。但非常适合快速抓出“明显写错的端点/路径”。`)
  lines.push('')

  lines.push(`## 1) 前端调用存在，但后端未发现的 API 端点（需要对齐）`)
  lines.push('')
  if (clientMissing.length === 0) {
    lines.push('- ✅ 未发现明显不对齐的前端 API 端点')
  } else {
    lines.push(`共 **${clientMissing.length}** 条：`)
    lines.push('')
    clientMissing.forEach((it, idx) => {
      lines.push(`### ${idx + 1}. \`${it.path}\``)
      lines.push('')
      lines.push(`- 前端引用文件:`)
      it.files.slice(0, 20).forEach(f => lines.push(`  - \`${f}\``))
      if (it.files.length > 20) lines.push(`  - ...（共 ${it.files.length} 个文件引用，已截断）`)
      if (it.suggestions.length) {
        lines.push(`- 后端可能存在的相近端点候选:`)
        it.suggestions.slice(0, 8).forEach(s => lines.push(`  - \`${s}\``))
      }
      lines.push('')
    })
  }

  lines.push(`## 2) 前端 router.push 跳转存在，但前端路由表未定义的路径（典型白屏来源）`)
  lines.push('')
  if (navMissing.length === 0) {
    lines.push('- ✅ 未发现明显不对齐的前端路由跳转')
  } else {
    lines.push(`共 **${navMissing.length}** 条：`)
    lines.push('')
    navMissing.forEach((it, idx) => {
      lines.push(`### ${idx + 1}. \`${it.path}\``)
      lines.push('')
      lines.push(`- 触发位置:`)
      it.files.slice(0, 20).forEach(f => lines.push(`  - \`${f}\``))
      if (it.files.length > 20) lines.push(`  - ...（共 ${it.files.length} 个文件引用，已截断）`)
      if (it.suggestions.length) {
        lines.push(`- 前端路由表相近候选:`)
        it.suggestions.slice(0, 8).forEach(s => lines.push(`  - \`${s}\``))
      }
      lines.push('')
    })
  }

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8')
  console.log(`✅ 对齐检测报告已生成: ${path.relative(PROJECT_ROOT, reportPath)}`)
  console.log(`- 前端API未对齐: ${clientMissing.length}`)
  console.log(`- 前端路由跳转未对齐: ${navMissing.length}`)
}

main()


