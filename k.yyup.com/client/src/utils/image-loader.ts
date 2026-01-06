/**
 * 统一图片管理工具
 * 负责管理所有图片资源的加载和路径转换
 * 支持本地开发和OSS生产环境的无缝切换
 */

import {
  OSS_CONFIG,
  getGameImagePath,
  getActivityImagePath,
  getUserImagePath,
  getOSSUrl,
  shouldUseOSS
} from '@/config/oss-paths'

export interface ImageConfig {
  // 是否使用OSS
  useOSS?: boolean
  // OSS基础URL
  ossBaseUrl?: string
  // 本地资源基础URL
  localBaseUrl?: string
  // 图片质量压缩
  quality?: number
  // 自定义图片处理参数
  imageProcess?: string
}

export interface ImageSource {
  // 图片唯一标识
  id: string
  // 图片分类
  category: 'game' | 'activity' | 'avatar' | 'icon' | 'background' | 'upload'
  // 文件名
  filename: string
  // 备用文件名
  fallbackFilename?: string
  // 是否必须使用OSS
  forceOSS?: boolean
  // 自定义URL（完全覆盖）
  customUrl?: string
}

class ImageLoader {
  private config: ImageConfig
  private cache: Map<string, string> = new Map()

  constructor(config: ImageConfig = {}) {
    // 默认配置
    this.config = {
      useOSS: process.env.NODE_ENV === 'production' || process.env.VITE_APP_USE_OSS === 'true',
      ossBaseUrl: process.env.VITE_APP_OSS_BASE_URL || 'https://systemkarder.oss-cn-guangzhou.aliyuncs.com',
      localBaseUrl: process.env.VITE_APP_LOCAL_BASE_URL || '/src/assets/images',
      quality: 80,
      imageProcess: 'image/resize,w_200,h_200',
      ...config
    }
  }

  /**
   * 获取图片URL
   * @param source 图片源信息
   * @returns 完整的图片URL
   */
  getImageUrl(source: string | ImageSource): string {
    // 检查缓存
    const cacheKey = typeof source === 'string' ? source : source.id
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    let url: string

    if (typeof source === 'string') {
      // 简单字符串路径
      url = this.buildImageUrl(source, 'upload')
    } else {
      // 完整的ImageSource对象
      if (source.customUrl) {
        url = source.customUrl
      } else {
        url = this.buildImageUrl(source.filename, source.category, source.forceOSS)
      }
    }

    // 缓存结果
    this.cache.set(cacheKey, url)
    return url
  }

  /**
   * 构建图片URL
   * @param filename 文件名
   * @param category 图片分类
   * @param forceOSS 是否强制使用OSS
   * @returns 完整URL
   */
  private buildImageUrl(filename: string, category: string, forceOSS: boolean = false): string {
    const shouldUseOSS = this.config.useOSS || forceOSS

    if (shouldUseOSS && this.config.ossBaseUrl) {
      return this.buildOSSUrl(filename, category)
    } else {
      return this.buildLocalUrl(filename, category)
    }
  }

  /**
   * 构建OSS URL
   */
  private buildOSSUrl(filename: string, category: string): string {
    const categoryPath = this.getCategoryPath(category)
    let url = `${this.config.ossBaseUrl}/${categoryPath}/${filename}`

    // 添加图片处理参数
    if (this.config.imageProcess && this.isImageFile(filename)) {
      url += `?x-oss-process=${encodeURIComponent(this.config.imageProcess)}`
    }

    return url
  }

  /**
   * 构建本地URL
   */
  private buildLocalUrl(filename: string, category: string): string {
    const categoryPath = this.getCategoryPath(category)

    // 开发环境使用require动态导入
    try {
      if (process.env.NODE_ENV === 'development') {
        // 尝试动态导入本地图片
        const imagePath = `@/assets/images/${categoryPath}/${filename}`
        try {
          return require(imagePath)
        } catch (e) {
          console.warn(`本地图片不存在: ${imagePath}`)
          // 返回默认图片或空字符串
          return this.getDefaultImageUrl(category)
        }
      }
    } catch (e) {
      console.warn('动态图片加载失败:', e)
    }

    // 生产环境或动态导入失败时返回静态路径
    return `${this.config.localBaseUrl}/${categoryPath}/${filename}`
  }

  /**
   * 获取分类对应的路径
   */
  private getCategoryPath(category: string): string {
    const pathMap: Record<string, string> = {
      game: 'games',
      activity: 'activities',
      avatar: 'avatars',
      icon: 'icons',
      background: 'backgrounds',
      upload: 'uploads'
    }
    return pathMap[category] || 'common'
  }

  /**
   * 判断是否为图片文件
   */
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension ? imageExtensions.includes(extension) : false
  }

  /**
   * 获取默认图片URL
   */
  private getDefaultImageUrl(category: string): string {
    const defaultImages: Record<string, string> = {
      game: '/src/assets/images/games/default-game.png',
      activity: '/src/assets/images/activities/default-activity.png',
      avatar: '/src/assets/images/avatars/default-avatar.png',
      icon: '/src/assets/images/icons/default-icon.png',
      background: '/src/assets/images/backgrounds/default-bg.jpg',
      upload: '/src/assets/images/common/no-image.png'
    }
    return defaultImages[category] || defaultImages.upload
  }

  /**
   * 批量获取图片URL
   */
  getBatchImageUrls(sources: (string | ImageSource)[]): Record<string, string> {
    const result: Record<string, string> = {}
    sources.forEach((source, index) => {
      const key = typeof source === 'string' ? source : source.id || `image_${index}`
      result[key] = this.getImageUrl(source)
    })
    return result
  }

  /**
   * 预加载图片
   */
  preloadImages(sources: (string | ImageSource)[]): Promise<void[]> {
    const promises = sources.map(source => {
      const url = this.getImageUrl(source)
      return this.loadImage(url)
    })
    return Promise.all(promises)
  }

  /**
   * 加载单个图片
   */
  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`图片加载失败: ${url}`))
      img.src = url
    })
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ImageConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.clearCache() // 配置更新后清除缓存
  }

  /**
   * 获取当前配置
   */
  getConfig(): ImageConfig {
    return { ...this.config }
  }

  // 便捷方法：游戏图片
  getGameImage(filename: string, role?: string, forceOSS: boolean = false): string {
    if (shouldUseOSS() && role) {
      return getGameImagePath('robot-factory', filename, role)
    }
    return this.getImageUrl({
      id: `game_${filename}`,
      category: 'game',
      filename,
      forceOSS
    })
  }

  // 便捷方法：活动图片
  getActivityImage(filename: string, forceOSS: boolean = false): string {
    if (shouldUseOSS()) {
      return getActivityImagePath('activities', filename)
    }
    return this.getImageUrl({
      id: `activity_${filename}`,
      category: 'activity',
      filename,
      forceOSS
    })
  }

  // 便捷方法：头像图片
  getAvatarImage(filename: string, imageType: string = 'avatar', forceOSS: boolean = false): string {
    if (shouldUseOSS()) {
      return getUserImagePath(imageType, filename)
    }
    return this.getImageUrl({
      id: `avatar_${filename}`,
      category: 'avatar',
      filename,
      forceOSS
    })
  }

  // 便捷方法：背景图片
  getBackgroundImage(gameName: string, filename?: string, forceOSS: boolean = false): string {
    if (shouldUseOSS() && filename) {
      return getGameImagePath(gameName, filename)
    }
    return this.getImageUrl({
      id: `bg_${gameName}`,
      category: 'background',
      filename: filename || `${gameName}-bg.jpg`,
      forceOSS
    })
  }

  // 便捷方法：Robot Factory角色图片
  getRobotFactoryImage(role: string, part: string, forceOSS: boolean = false): string {
    if (shouldUseOSS()) {
      return getGameImagePath('robot-factory', part, role)
    }
    return this.getImageUrl({
      id: `robot_${role}_${part}`,
      category: 'game',
      filename: `robot-factory/${role}/${part}`,
      forceOSS
    })
  }
}

// 创建全局单例
const imageLoader = new ImageLoader()

export default imageLoader

// 导出类型
export { ImageLoader, ImageSource, ImageConfig }

// Vue插件安装方法
export const ImageLoaderPlugin = {
  install(app: any, options?: ImageConfig) {
    if (options) {
      imageLoader.updateConfig(options)
    }

    // 全局属性
    app.config.globalProperties.$image = imageLoader

    // 全局provide/inject支持
    app.provide('imageLoader', imageLoader)
  }
}