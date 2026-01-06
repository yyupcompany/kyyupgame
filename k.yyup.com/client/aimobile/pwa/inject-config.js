/**
 * Service Worker 配置注入脚本
 *
 * 此脚本用于将端点配置注入到 Service Worker 文件中
 * 在构建过程中自动执行
 */

const fs = require('fs')
const path = require('path')

// 读取配置文件
function loadConfig() {
  const configPath = path.resolve(__dirname, 'sw-endpoints.config.ts')
  const configContent = fs.readFileSync(configPath, 'utf8')

  // 简单的提取逻辑（实际项目中应该使用 TypeScript 编译器）
  const exportMatch = configContent.match(/export const SW_CONFIG = ({[\s\S]*?}) as const/)
  if (!exportMatch) {
    throw new Error('无法找到 SW_CONFIG 配置')
  }

  return exportMatch[1]
}

// 注入配置到 Service Worker
function injectConfig() {
  const swPath = path.resolve(__dirname, 'sw.js')
  const swBackupPath = path.resolve(__dirname, 'sw.js.backup')

  // 备份原始文件
  if (!fs.existsSync(swBackupPath)) {
    fs.copyFileSync(swPath, swBackupPath)
  }

  // 读取原始 Service Worker
  let swContent = fs.readFileSync(swPath, 'utf8')

  // 加载配置
  const config = loadConfig()

  // 注入配置到文件顶部
  const configInjection = `/**
 * 🏫 幼儿园管理系统 - Service Worker 配置
 *
 * 此配置由构建工具自动注入，请勿手动修改
 * 构建时间: ${new Date().toISOString()}
 */

// Service Worker API 端点配置
const SW_CONFIG = ${config}

// 从配置中提取端点常量
const { ENDPOINTS, CACHE, VERSION } = SW_CONFIG

// 使用配置中的端点
const API_ENDPOINTS = [
  ENDPOINTS.AUTH_USER,
  ENDPOINTS.DASHBOARD_STATS,
  ENDPOINTS.STUDENTS,
  ENDPOINTS.CLASSES,
  ENDPOINTS.ACTIVITIES
]

// 缓存配置
const CACHE_VERSION = VERSION
const STATIC_CACHE = \`\${CACHE.CACHE_PREFIX}-\${CACHE.CACHE_TYPES.STATIC}-\${CACHE_VERSION}\`
const API_CACHE = \`\${CACHE.CACHE_PREFIX}-\${CACHE.CACHE_TYPES.API}-\${CACHE_VERSION}\`
const PAGES_CACHE = \`\${CACHE.CACHE_PREFIX}-\${CACHE.CACHE_TYPES.PAGES}-\${CACHE_VERSION}\`
const IMAGES_CACHE = \`\${CACHE.CACHE_PREFIX}-\${CACHE.CACHE_TYPES.IMAGES}-\${CACHE_VERSION}\`

// 离线配置
const OFFLINE_PAGE = ENDPOINTS.OFFLINE_PAGE
const OFFLINE_API_RESPONSE = ENDPOINTS.OFFLINE_RESPONSE

`

  // 查找注入位置（在第一个注释块之后）
  const injectionPoint = swContent.indexOf('// 缓存版本号')
  if (injectionPoint === -1) {
    throw new Error('无法找到 Service Worker 配置注入点')
  }

  // 替换原有的配置部分
  const originalConfigEnd = swContent.indexOf('// 离线页面')
  if (originalConfigEnd === -1) {
    throw new Error('无法找到原始配置结束位置')
  }

  // 构建新的文件内容
  const newSwContent =
    swContent.substring(0, injectionPoint) +
    configInjection +
    swContent.substring(originalConfigEnd)

  // 写入修改后的文件
  fs.writeFileSync(swPath, newSwContent)

  console.log('✅ Service Worker 配置注入成功')
  console.log(`📝 配置文件: ${configPath}`)
  console.log(`🔧 Service Worker: ${swPath}`)
  console.log(`⏰ 构建时间: ${new Date().toISOString()}`)
}

// 恢复原始文件
function restoreOriginal() {
  const swPath = path.resolve(__dirname, 'sw.js')
  const swBackupPath = path.resolve(__dirname, 'sw.js.backup')

  if (fs.existsSync(swBackupPath)) {
    fs.copyFileSync(swBackupPath, swPath)
    console.log('✅ Service Worker 已恢复到原始状态')
  }
}

// 命令行参数处理
const command = process.argv[2]

switch (command) {
  case 'inject':
    injectConfig()
    break
  case 'restore':
    restoreOriginal()
    break
  case 'help':
  default:
    console.log(`
Service Worker 配置注入工具

用法:
  node inject-config.js <command>

命令:
  inject   - 将配置注入到 Service Worker
  restore  - 恢复原始 Service Worker 文件
  help     - 显示此帮助信息

示例:
  node inject-config.js inject
  node inject-config.js restore
`)
    break
}