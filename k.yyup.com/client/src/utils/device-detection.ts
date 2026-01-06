/**
 * 🔍 设备检测工具
 * 
 * 用于检测用户设备类型，决定路由跳转策略
 * PC端 -> PC路由 | 移动端 -> Mobile路由
 */

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isPc: boolean
  isIos: boolean
  isAndroid: boolean
  userAgent: string
  screenWidth: number
  screenHeight: number
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase()
  const screenWidth = window.innerWidth || document.documentElement.clientWidth
  const screenHeight = window.innerHeight || document.documentElement.clientHeight

  // 移动设备检测关键词
  const mobileKeywords = [
    'mobile', 'android', 'iphone', 'ipod', 'blackberry', 
    'webos', 'windows phone', 'iemobile', 'opera mini'
  ]
  
  // 平板设备检测关键词
  const tabletKeywords = ['ipad', 'tablet', 'kindle', 'playbook', 'nexus 7', 'nexus 10']
  
  // iOS设备检测
  const isIos = /iphone|ipod|ipad/.test(userAgent)
  
  // Android设备检测
  const isAndroid = /android/.test(userAgent)
  
  // 移动设备检测 - 优先使用User Agent，屏幕尺寸作为辅助判断
  const isMobileByUA = mobileKeywords.some(keyword => userAgent.includes(keyword))

  // 检测是否为桌面浏览器（排除移动设备）
  const isDesktopBrowser = /windows|macintosh|linux/i.test(userAgent) &&
                          !/mobile|android|iphone|ipod|ipad/i.test(userAgent)

  // 如果明确是桌面浏览器，不管屏幕大小都不认为是移动设备
  const isMobile = isMobileByUA && !isDesktopBrowser
  
  // 平板设备检测
  const isTabletByUA = tabletKeywords.some(keyword => userAgent.includes(keyword))
  // 平板检测也要排除桌面浏览器
  const isTabletByScreen = screenWidth > 768 && screenWidth <= 1024 &&
                          ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
                          !isDesktopBrowser
  const isTablet = isTabletByUA || isTabletByScreen
  
  // PC设备检测（排除移动和平板）
  const isPc = !isMobile && !isTablet

  // 调试日志
  console.log('🔍 设备检测详情:', {
    userAgent: userAgent.substring(0, 100) + '...',
    screenWidth,
    screenHeight,
    isMobileByUA,
    isDesktopBrowser,
    isMobile,
    isTablet,
    isPc
  })

  return {
    isMobile,
    isTablet,
    isPc,
    isIos,
    isAndroid,
    userAgent,
    screenWidth,
    screenHeight
  }
}

/**
 * 检测是否为移动设备（包含平板）
 */
export function isMobileDevice(): boolean {
  const { isMobile, isTablet } = getDeviceInfo()
  return isMobile || isTablet
}

/**
 * 检测是否为PC设备
 */
export function isPcDevice(): boolean {
  const { isPc } = getDeviceInfo()
  return isPc
}

/**
 * 设置强制桌面模式
 */
export function setForceDesktopMode(force: boolean) {
  try {
    if (force) {
      localStorage.setItem('forceDesktop', 'true')
      console.log('🖥️ 已启用强制桌面模式')
    } else {
      localStorage.removeItem('forceDesktop')
      console.log('📱 已禁用强制桌面模式')
    }
  } catch (error) {
    console.warn('⚠️ 无法设置强制桌面模式:', error)
  }
}

/**
 * 检查是否为强制桌面模式
 */
export function isForceDesktopMode(): boolean {
  try {
    // 检查URL参数
    const params = new URLSearchParams(window.location.search)
    if (params.get('forceDesktop') === '1') {
      return true
    }

    // 检查localStorage设置
    const forceDesktop = localStorage.getItem('forceDesktop')
    return forceDesktop === 'true'
  } catch {
    return false
  }
}

/**
 * 获取设备类型字符串
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'pc' {
  // 如果强制桌面模式，直接返回pc
  if (isForceDesktopMode()) {
    console.log('🖥️ 强制桌面模式已启用')
    return 'pc'
  }

  const { isMobile, isTablet } = getDeviceInfo()

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'pc'
}

/**
 * 根据设备类型生成对应的路由路径
 */
export function getDeviceBasedRoute(originalPath: string): string {
  // 检查是否强制桌面模式
  if (isForceDesktopMode()) {
    console.log('🖥️ 强制桌面模式，跳过移动端重定向')
    return originalPath
  }

  const deviceType = getDeviceType()

  // 如果是移动设备，转换为移动端路由
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    // 如果已经是移动端路由，直接返回
    if (originalPath.startsWith('/mobile')) {
      return originalPath
    }
    
    // 路由映射表 - 移动端统一使用AI助手页面
    // 所有PC端路由在移动端都重定向到AI助手，让用户通过AI来完成所有操作
    const routeMapping: Record<string, string> = {
      '/': '/mobile',
      '/login': '/mobile/login',  // PC登录页面重定向到移动端登录页面
      '/dashboard': '/mobile',
      '/dashboard/index': '/mobile',
      
      // 所有业务功能都通过AI来处理
      '/ai': '/mobile',
      '/ai/ChatInterface': '/mobile',
      '/ai/AIAssistantPage': '/mobile',
      '/ai/ExpertConsultationPage': '/mobile',
      
      '/student': '/mobile',
      '/student/index': '/mobile',
      '/class': '/mobile',
      '/class/index': '/mobile',
      '/teacher': '/mobile',
      '/teacher/index': '/mobile',
      '/parent': '/mobile',
      '/parent/index': '/mobile',
      '/activity': '/mobile',
      '/activity/index': '/mobile',
      
      '/enrollment': '/mobile',
      '/enrollment-plan': '/mobile',
      '/application': '/mobile',
      
      '/chat': '/mobile',
      '/messages': '/mobile',
      
      '/statistics': '/mobile',
      '/analytics': '/mobile',
      
      '/marketing': '/mobile',
      '/customer': '/mobile',
      '/advertisement': '/mobile',
      
      '/system/users': '/mobile',
      '/system/roles': '/mobile',
      '/system/permissions': '/mobile',
      '/system/settings': '/mobile',
      '/system': '/mobile',
      
      '/profile': '/mobile',
      '/settings': '/mobile'
    }
    
    // 精确匹配
    if (routeMapping[originalPath]) {
      return routeMapping[originalPath]
    }
    
    // 动态路由匹配（如 /student/detail/123 -> /mobile/students/123）
    const dynamicMappings = [
      { pattern: /^\/student\/detail\/(.+)$/, replacement: '/mobile/students/$1' },
      { pattern: /^\/class\/detail\/(.+)$/, replacement: '/mobile/classes/$1' },
      { pattern: /^\/teacher\/detail\/(.+)$/, replacement: '/mobile/teachers/$1' },
      { pattern: /^\/activity\/detail\/(.+)$/, replacement: '/mobile/activities/$1' },
      { pattern: /^\/parent\/(.+)$/, replacement: '/mobile/children/$1' }
    ]
    
    for (const mapping of dynamicMappings) {
      const match = originalPath.match(mapping.pattern)
      if (match) {
        return mapping.replacement.replace('$1', match[1])
      }
    }
    
    // 如果没有找到匹配的路由，默认跳转到移动端首页
    return '/mobile/dashboard'
  }
  
  // PC设备，确保不是移动端路由
  if (originalPath.startsWith('/mobile')) {
    // 支持开发期强制停留在移动端地址（便于对齐样式与截图）
    // 只要 URL 上带 forceMobile=1 就不做 PC 反向映射
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('forceMobile') === '1') {
        return originalPath
      }
    } catch {}

    // 移动端路由 -> PC路由的逆向映射
    const reverseMappings: Record<string, string> = {
      '/mobile/dashboard': '/dashboard',
      '/mobile/ai': '/ai',
      '/mobile/students': '/student',
      '/mobile/classes': '/class',
      '/mobile/teachers': '/teacher',
      '/mobile/parents': '/parent',
      '/mobile/activities': '/activity',
      '/mobile/enrollment': '/enrollment',
      '/mobile/messages': '/chat',
      '/mobile/analytics': '/statistics',
      '/mobile/management': '/principal/Dashboard',
      '/mobile/system': '/system',
      '/mobile/profile': '/dashboard',
      '/mobile/settings': '/system/settings'
    }

    return reverseMappings[originalPath] || '/dashboard'
  }
  
  // PC设备的原始路径，直接返回
  return originalPath
}

/**
 * 设备检测中间件
 * 在路由跳转前检测设备类型并重定向
 */
export function createDeviceRedirectMiddleware() {
  return (to: any, from: any, next: any) => {
    console.log(`🔍 设备检测: ${from.path} -> ${to.path}`)
    
    const deviceType = getDeviceType()
    const targetPath = getDeviceBasedRoute(to.path)
    
    console.log(`📱 设备类型: ${deviceType}`)
    console.log(`🎯 目标路径: ${to.path} -> ${targetPath}`)
    
    // 如果目标路径和当前路径不同，进行重定向
    if (targetPath !== to.path) {
      console.log(`🔀 设备重定向: ${to.path} -> ${targetPath}`)
      next({ path: targetPath, replace: true })
    } else {
      next()
    }
  }
}

/**
 * 响应式设备检测Hook
 * 监听屏幕尺寸变化，动态调整设备类型
 */
export function useDeviceDetection() {
  // 这里需要在Vue组件中使用时导入相应的Vue hooks
  // import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'
  
  if (typeof window === 'undefined') {
    // 服务端渲染环境下的降级处理
    return {
      deviceInfo: { isMobile: false, isTablet: false, isPc: true } as any,
      isMobile: false,
      isPc: true,
      deviceType: 'pc' as const,
      getDeviceBasedRoute
    }
  }
  
  const deviceInfo = { value: getDeviceInfo() }
  
  // 监听窗口大小变化
  const updateDeviceInfo = () => {
    deviceInfo.value = getDeviceInfo()
  }
  
  // 如果在浏览器环境中，添加事件监听
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)
  }
  
  return {
    deviceInfo: deviceInfo.value,
    isMobile: deviceInfo.value.isMobile || deviceInfo.value.isTablet,
    isPc: deviceInfo.value.isPc,
    deviceType: getDeviceType(),
    getDeviceBasedRoute,
    cleanup: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateDeviceInfo)
        window.removeEventListener('orientationchange', updateDeviceInfo)
      }
    }
  }
}