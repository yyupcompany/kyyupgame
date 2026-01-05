// 图片处理工具函数

/**
 * 获取完整的图片URL
 * @param imagePath 图片路径（可能是相对路径或完整URL）
 * @returns 完整的图片URL
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  // 如果没有图片路径，返回默认图片
  if (!imagePath || imagePath.trim() === '') {
    return '/default-activity.svg'
  }

  // 如果已经是完整的URL（包含协议），直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 兼容无前导斜杠的后端相对路径（uploads、templates 等）
  if (imagePath.startsWith('uploads/')) {
    // 开发环境使用Vite代理
    if (import.meta.env.DEV) {
      return `/${imagePath}`
    }
    // 生产环境使用当前域名
    return `${window.location.origin}/${imagePath}`
  }
  if (imagePath.startsWith('templates/')) {
    // 静态公共资源：指向 public/templates
    return `/${imagePath}`
  }
  // 若仅给出文件名（如 "festival.jpg"），默认走 public/templates 下占位图
  if (/^[^\/]+\.(png|jpe?g|gif|webp|svg)$/i.test(imagePath)) {
    // 优先使用SVG版本，如果不存在则使用原文件名
    const baseName = imagePath.replace(/\.(png|jpe?g|gif|webp)$/i, '')
    return `/templates/${baseName}.svg`
  }

  // 如果是相对路径，需要拼接API基础URL
  if (imagePath.startsWith('/uploads/')) {
    // 开发环境使用Vite代理
    if (import.meta.env.DEV) {
      return imagePath
    }

    // 生产环境使用当前域名
    return `${window.location.origin}${imagePath}`
  }

  // 如果是以/开头的路径，直接返回（静态资源）
  if (imagePath.startsWith('/')) {
    return imagePath
  }

  // 其他情况，返回默认图片
  return '/default-activity.svg'
}

/**
 * 获取活动模板图片URL
 * @param template 活动模板对象
 * @returns 完整的图片URL
 */
export function getTemplateImageUrl(template: any): string {
  return getImageUrl(template?.coverImage)
}

/**
 * 检查图片URL是否有效
 * @param imageUrl 图片URL
 * @returns Promise<boolean>
 */
export function checkImageUrl(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
}

/**
 * 处理图片加载错误
 * @param event 错误事件
 * @param fallbackUrl 备用图片URL
 */
export function handleImageError(event: Event, fallbackUrl?: string): void {
  const img = event.target as HTMLImageElement
  const defaultFallback = fallbackUrl || '/default-activity.svg'

  if (img && img.src !== defaultFallback) {
    // 降低日志噪音：使用 info 级别
    console.info('图片加载失败，使用默认图片:', img.src)
    img.src = defaultFallback

    // 防止无限循环：如果默认图片也加载失败，移除src属性
    img.onerror = () => {
      console.warn('默认图片也加载失败，移除图片显示:', defaultFallback)
      img.style.display = 'none'
      img.onerror = null // 防止再次触发
    }
  }
}

/**
 * 获取安全的图片URL（带错误处理）
 * @param imagePath 图片路径
 * @returns 安全的图片URL
 */
export function getSafeImageUrl(imagePath: string | null | undefined): string {
  try {
    return getImageUrl(imagePath)
  } catch (error) {
    console.warn('获取图片URL失败:', error)
    return '/default-activity.svg'
  }
}
