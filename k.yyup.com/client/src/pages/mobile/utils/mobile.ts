/**
 * 移动端工具函数
 */

/**
 * 检查是否为移动设备
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 获取设备类型
 */
export const getDeviceType = (): 'iOS' | 'Android' | 'Other' => {
  const userAgent = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'iOS'
  } else if (/Android/.test(userAgent)) {
    return 'Android'
  }
  return 'Other'
}

/**
 * 获取屏幕宽度
 */
export const getScreenWidth = (): number => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
}

/**
 * 获取屏幕高度
 */
export const getScreenHeight = (): number => {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCallTime >= delay) {
      lastCallTime = now
      func(...args)
    }
  }
}

/**
 * 格式化日期
 */
export const formatDate = (date: Date | string | number, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 深度克隆
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 生成随机 ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * 校验手机号
 */
export const validatePhone = (phone: string): boolean => {
  const phoneReg = /^1[3-9]\d{9}$/
  return phoneReg.test(phone)
}

/**
 * 校验邮箱
 */
export const validateEmail = (email: string): boolean => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailReg.test(email)
}

/**
 * 显示 Toast
 */
export const showToast = (message: string, type: 'success' | 'warning' | 'danger' | 'primary' = 'primary') => {
  // 这里需要结合 Vant 的 Toast 组件使用
  // 例如: Toast({ type, message })
  console.log(`Toast: ${type} - ${message}`)
}

/**
 * 跳转到外部链接
 */
export const openExternal = (url: string): void => {
  if (!/^https?:\/\//.test(url)) {
    url = 'https://' + url
  }
  window.open(url, '_blank')
}

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('复制失败:', err)
    return false
  }
}

/**
 * 获取 URL 参数
 */
export const getUrlParam = (name: string, url?: string): string | null => {
  const searchUrl = url || window.location.search
  const params = new URLSearchParams(searchUrl)
  return params.get(name)
}

/**
 * 设置 URL 参数
 */
export const setUrlParam = (name: string, value: string): void => {
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.replaceState({}, '', url.toString())
}
