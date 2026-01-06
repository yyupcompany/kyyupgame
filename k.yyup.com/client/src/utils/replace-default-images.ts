/**
 * 替换默认展位图片工具
 * 使用AI生成的图片替换项目中的默认展位图片
 */

import { autoImageApi } from '../api/auto-image'
import { ElMessage, ElNotification } from 'element-plus'

export interface ImageReplaceItem {
  id: string | number
  title: string
  description: string
  type: 'activity' | 'poster' | 'template'
  currentImageUrl?: string
  element?: HTMLImageElement | HTMLElement
  updateCallback?: (imageUrl: string) => void
}

export interface ReplaceProgress {
  total: number
  completed: number
  success: number
  failed: number
  current?: string
}

/**
 * 默认展位图片替换器
 */
export class DefaultImageReplacer {
  private isReplacing = false
  private progressCallback?: (progress: ReplaceProgress) => void

  /**
   * 设置进度回调
   */
  setProgressCallback(callback: (progress: ReplaceProgress) => void) {
    this.progressCallback = callback
  }

  /**
   * 批量替换展位图片
   */
  async replaceImages(items: ImageReplaceItem[]): Promise<void> {
    if (this.isReplacing) {
      ElMessage.warning('正在替换图片中，请稍候...')
      return
    }

    if (items.length === 0) {
      ElMessage.warning('没有需要替换的图片')
      return
    }

    this.isReplacing = true

    try {
      ElNotification({
        title: '开始替换展位图片',
        message: `准备使用AI生成${items.length}张图片`,
        type: 'info',
        duration: 3000
      })

      const progress: ReplaceProgress = {
        total: items.length,
        completed: 0,
        success: 0,
        failed: 0
      }

      // 更新进度
      this.updateProgress(progress)

      // 分批处理
      const batchSize = 3
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        
        await this.processBatch(batch, progress)
        
        // 批次间延迟
        if (i + batchSize < items.length) {
          await this.delay(2000)
        }
      }

      // 完成通知
      ElNotification({
        title: '图片替换完成',
        message: `成功替换${progress.success}张图片，失败${progress.failed}张`,
        type: progress.failed === 0 ? 'success' : 'warning',
        duration: 5000
      })

    } catch (error: any) {
      console.error('批量替换图片失败:', error)
      ElNotification({
        title: '图片替换失败',
        message: error.message || '批量替换过程中发生错误',
        type: 'error',
        duration: 5000
      })
    } finally {
      this.isReplacing = false
    }
  }

  /**
   * 处理单个批次
   */
  private async processBatch(batch: ImageReplaceItem[], progress: ReplaceProgress): Promise<void> {
    const promises = batch.map(item => this.replaceItem(item, progress))
    await Promise.all(promises)
  }

  /**
   * 替换单个图片
   */
  private async replaceItem(item: ImageReplaceItem, progress: ReplaceProgress): Promise<void> {
    try {
      progress.current = item.title
      this.updateProgress(progress)

      // 生成图片
      const imageUrl = await autoImageApi.smartGenerateImage(
        `${item.title}: ${item.description}`,
        item.type
      )

      if (imageUrl) {
        // 更新图片
        await this.updateImage(item, imageUrl)
        
        progress.success++
        ElMessage.success(`${item.title} 配图生成成功`)
      } else {
        progress.failed++
        ElMessage.error(`${item.title} 配图生成失败`)
      }

    } catch (error: any) {
      console.error(`替换图片失败 [${item.title}]:`, error)
      progress.failed++
      ElMessage.error(`${item.title} 配图生成异常: ${error.message}`)
    } finally {
      progress.completed++
      this.updateProgress(progress)
    }
  }

  /**
   * 更新图片
   */
  private async updateImage(item: ImageReplaceItem, imageUrl: string): Promise<void> {
    // 如果有更新回调，优先使用回调
    if (item.updateCallback) {
      item.updateCallback(imageUrl)
      return
    }

    // 如果有DOM元素，直接更新
    if (item.element) {
      if (item.element instanceof HTMLImageElement) {
        item.element.src = imageUrl
      } else {
        // 查找元素内的img标签
        const img = item.element.querySelector('img')
        if (img) {
          img.src = imageUrl
        } else {
          // 设置背景图片
          item.element.style.backgroundImage = `url(${imageUrl})`
        }
      }
    }
  }

  /**
   * 更新进度
   */
  private updateProgress(progress: ReplaceProgress): void {
    if (this.progressCallback) {
      this.progressCallback({ ...progress })
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 扫描页面中的展位图片
   */
  scanDefaultImages(): ImageReplaceItem[] {
    const items: ImageReplaceItem[] = []
    
    // 扫描常见的展位图片选择器
    const selectors = [
      'img[src*="placeholder"]',
      'img[src*="default"]',
      'img[src*="demo"]',
      '.placeholder-image',
      '.default-image',
      '.demo-image'
    ]

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach((element, index) => {
        const img = element as HTMLImageElement
        const title = img.alt || img.title || `图片${index + 1}`
        const description = this.extractDescription(img)
        
        items.push({
          id: `scan_${Date.now()}_${index}`,
          title,
          description,
          type: this.guessImageType(img),
          currentImageUrl: img.src,
          element: img
        })
      })
    })

    return items
  }

  /**
   * 提取图片描述
   */
  private extractDescription(img: HTMLImageElement): string {
    // 尝试从周围的文本中提取描述
    const parent = img.parentElement
    if (parent) {
      const text = parent.textContent?.trim() || ''
      if (text && text !== img.alt) {
        return text.substring(0, 100)
      }
    }

    return img.alt || img.title || '默认图片'
  }

  /**
   * 猜测图片类型
   */
  private guessImageType(img: HTMLImageElement): 'activity' | 'poster' | 'template' {
    const src = img.src.toLowerCase()
    const alt = (img.alt || '').toLowerCase()
    const className = img.className.toLowerCase()
    
    const text = `${src} ${alt} ${className}`
    
    if (text.includes('activity') || text.includes('活动')) {
      return 'activity'
    } else if (text.includes('poster') || text.includes('海报')) {
      return 'poster'
    } else if (text.includes('template') || text.includes('模板')) {
      return 'template'
    }
    
    return 'activity' // 默认为活动类型
  }

  /**
   * 检查服务状态
   */
  async checkServiceStatus(): Promise<boolean> {
    try {
      const response = await autoImageApi.checkServiceStatus()
      return response.success && response.data.available
    } catch (error) {
      console.error('检查自动配图服务状态失败:', error)
      return false
    }
  }
}

// 导出工具实例
export const defaultImageReplacer = new DefaultImageReplacer()

// 导出便捷函数
export const replaceDefaultImages = (items: ImageReplaceItem[]) => {
  return defaultImageReplacer.replaceImages(items)
}

export const scanAndReplaceImages = async () => {
  const items = defaultImageReplacer.scanDefaultImages()
  if (items.length > 0) {
    await defaultImageReplacer.replaceImages(items)
  } else {
    ElMessage.info('未找到需要替换的展位图片')
  }
}

export default defaultImageReplacer
