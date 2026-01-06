/**
 * 🏫 幼儿园管理系统 - 移动端入口
 * 
 * 基于文档 docs/ai移动端说明/ 的架构设计
 * 支持响应式设计、PWA功能、AI智能助手
 */

export * from './components'
export * from './pages'
export * from './layouts'
export * from './stores'
export * from './services'
export * from './utils'
export * from './types'

// 移动端配置
export { default as mobileConfig } from './config/mobile.config'
export { default as pwaConfig } from './config/pwa.config'

// 移动端路由
export { mobileRoutes } from './router/mobile.routes'

// 移动端主题
export { mobileTheme } from './styles/mobile.theme'