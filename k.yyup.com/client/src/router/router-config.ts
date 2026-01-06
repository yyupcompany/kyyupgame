/**
 * 路由配置文件
 * 
 * 包含：
 * - 路由优先级配置
 * - 路由预加载配置
 * - 其他全局路由配置
 */

// 路由优先级配置
export const routePriorities = {
  critical: ['/login', '/register', '/dashboard', '/'],
  high: [
    '/class', 
    '/teacher', 
    '/teacher-center', 
    '/enrollment-plan', 
    '/enrollment', 
    '/group'
  ],
  medium: [
    '/profile', 
    '/search', 
    '/parent', 
    '/customer', 
    '/statistics', 
    '/ai', 
    '/chat'
  ],
  low: [
    '/help', 
    '/system', 
    '/advertisement', 
    '/activity', 
    '/principal'
  ]
}

// 路由预加载配置
export const preloadConfig = {
  // 立即预加载的路由
  immediate: [
    '/dashboard', 
    '/class', 
    '/teacher', 
    '/teacher-center'
  ],
  
  // 空闲时预加载的路由
  idle: [
    '/enrollment-plan', 
    '/enrollment', 
    '/parent'
  ],
  
  // 按需预加载的路由
  ondemand: [
    '/system', 
    '/ai', 
    '/statistics'
  ]
}
