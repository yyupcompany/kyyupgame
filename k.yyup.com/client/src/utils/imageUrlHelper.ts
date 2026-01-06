/**
 * 图片URL处理工具
 * 用于将本地路径转换为OSS URL
 */

// OSS配置
const OSS_CONFIG = {
  BASE_URL: process.env.VUE_APP_OSS_BASE_URL || 'https://systemkarder.oss-cn-guangzhou.aliyuncs.com',
  PATH_PREFIX: process.env.VUE_APP_OSS_PATH_PREFIX || 'kindergarten/',
  UPLOAD_PATH: '/uploads/'
}

/**
 * 将图片路径转换为完整的OSS URL
 * @param imagePath 图片路径（可能是相对路径或绝对路径）
 * @returns 完整的图片URL
 */
export function getImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return getDefaultImage()
  }

  // 如果已经是完整的URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 如果是相对路径或本地路径，转换为OSS URL
  if (imagePath.startsWith('/uploads/')) {
    // 移除 /uploads/ 前缀，添加OSS路径前缀
    const relativePath = imagePath.replace('/uploads/', '')
    return `${OSS_CONFIG.BASE_URL}/${OSS_CONFIG.PATH_PREFIX}${relativePath}`
  }

  if (imagePath.startsWith('uploads/')) {
    const relativePath = imagePath
    return `${OSS_CONFIG.BASE_URL}/${OSS_CONFIG.PATH_PREFIX}${relativePath}`
  }

  // 其他情况，视为相对路径
  return `${OSS_CONFIG.BASE_URL}/${OSS_CONFIG.PATH_PREFIX}${imagePath}`
}

/**
 * 获取默认图片
 * @returns 默认图片URL
 */
export function getDefaultImage(): string {
  // 使用在线占位符图片服务，确保始终可访问
  return 'https://via.placeholder.com/400x300/f0f0f0/999999?text=活动图片'
}

/**
 * 批量处理图片URLs
 * @param items 包含图片路径的对象数组
 * @param imageField 图片字段名
 * @returns 处理后的对象数组
 */
export function processImageUrls<T extends Record<string, any>>(
  items: T[],
  imageField: string = 'image'
): T[] {
  return items.map(item => ({
    ...item,
    [imageField]: getImageUrl(item[imageField])
  }))
}

/**
 * 处理活动的多个图片字段
 * @param activity 活动对象
 * @returns 处理后的活动对象
 */
export function processActivityImages(activity: any) {
  return {
    ...activity,
    cover_image: getImageUrl(activity.cover_image),
    poster_url: getImageUrl(activity.poster_url),
    share_poster_url: getImageUrl(activity.share_poster_url),
    // 兼容前端使用的字段名
    image: getImageUrl(activity.cover_image || activity.image),
    imageUrl: getImageUrl(activity.cover_image || activity.image)
  }
}