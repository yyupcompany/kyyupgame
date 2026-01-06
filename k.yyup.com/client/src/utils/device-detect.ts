/**
 * 设备检测工具
 * 用于判断当前设备类型（PC/移动端）
 */

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  // 1. 检查User Agent
  const ua = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile'
  ]
  
  const isMobileUA = mobileKeywords.some(keyword => ua.includes(keyword))
  
  // 2. 检查屏幕宽度
  const isMobileWidth = window.innerWidth <= 768
  
  // 3. 检查触摸支持
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // 综合判断
  return isMobileUA || (isMobileWidth && hasTouch)
}

/**
 * 检测是否为平板设备
 */
export function isTablet(): boolean {
  const ua = navigator.userAgent.toLowerCase()
  const isIPad = ua.includes('ipad')
  const isTabletUA = ua.includes('tablet') || ua.includes('kindle')
  const isTabletWidth = window.innerWidth > 768 && window.innerWidth <= 1024
  
  return isIPad || isTabletUA || isTabletWidth
}

/**
 * 检测是否为PC设备
 */
export function isPCDevice(): boolean {
  return !isMobileDevice() && !isTablet()
}

/**
 * 获取设备类型
 */
export type DeviceType = 'mobile' | 'tablet' | 'pc'

export function getDeviceType(): DeviceType {
  if (isMobileDevice()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'pc'
}

/**
 * 检测是否为iOS设备
 */
export function isIOS(): boolean {
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
}

/**
 * 检测是否为Android设备
 */
export function isAndroid(): boolean {
  return /android/.test(navigator.userAgent.toLowerCase())
}

/**
 * 检测是否为微信内置浏览器
 */
export function isWeChat(): boolean {
  return /micromessenger/.test(navigator.userAgent.toLowerCase())
}

/**
 * 强制设置设备类型（用于测试）
 */
let forcedDeviceType: DeviceType | null = null

export function forceDeviceType(type: DeviceType | null) {
  forcedDeviceType = type
  localStorage.setItem('forced_device_type', type || '')
}

export function getForcedDeviceType(): DeviceType | null {
  if (forcedDeviceType) return forcedDeviceType
  
  const stored = localStorage.getItem('forced_device_type')
  return stored as DeviceType | null
}

/**
 * 获取设备类型（考虑强制设置）
 */
export function getActualDeviceType(): DeviceType {
  const forced = getForcedDeviceType()
  if (forced) {
    console.log(`📱 使用强制设备类型: ${forced}`)
    return forced
  }
  
  const detected = getDeviceType()
  console.log(`📱 检测到设备类型: ${detected} (宽度: ${window.innerWidth}px, UA: ${navigator.userAgent.substring(0, 50)}...)`)
  return detected
}

/**
 * 是否当前在移动端路由
 */
export function isOnMobileRoute(): boolean {
  return window.location.pathname.startsWith('/mobile')
}

/**
 * 是否当前在PC端路由
 */
export function isOnPCRoute(): boolean {
  return !isOnMobileRoute()
}
