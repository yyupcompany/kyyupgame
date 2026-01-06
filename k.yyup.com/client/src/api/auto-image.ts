/**
 * 自动配图API服务
 * 提供AI自动生成图像的前端接口
 */

import { aiService } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'


export interface ImageGenerationRequest {
  prompt: string
  category?: 'activity' | 'poster' | 'template' | 'marketing' | 'education'
  style?: 'natural' | 'cartoon' | 'realistic' | 'artistic'
  size?: '1920x1920' | '2048x2048' | '1920x1080' | '2560x1440' | '1024x768'  // 添加 1024x768 支持
  quality?: 'standard' | 'hd'
  watermark?: boolean
}

export interface ImageGenerationResult {
  imageUrl: string
  usage?: {
    generated_images: number
    output_tokens: number
    total_tokens: number
  }
  metadata?: {
    prompt: string
    model: string
    parameters: any
    duration: number
  }
}

export interface ActivityImageRequest {
  activityTitle: string
  activityDescription: string
}

export interface PosterImageRequest {
  posterTitle: string
  posterContent: string
  style?: string
  size?: string
  quality?: string
}

export interface TemplateImageRequest {
  templateName: string
  templateDescription: string
  templateData?: any // 模板的详细数据，用于智能提示词生成
}

export interface BatchImageRequest {
  requests: ImageGenerationRequest[]
}

export interface BatchImageResult {
  results: Array<{
    success: boolean
    imageUrl?: string
    error?: string
    usage?: any
    metadata?: any
  }>
  summary: {
    total: number
    success: number
    failure: number
  }
}

export interface ServiceStatus {
  available: boolean
  model?: string
  error?: string
}

/**
 * 自动配图API类
 */
export class AutoImageApi {
  /**
   * 生成单张图像
   */
  async generateImage(data: ImageGenerationRequest): Promise<ApiResponse<ImageGenerationResult>> {
    return aiService.post('/auto-image/generate', data)
  }

  /**
   * 为活动生成配图
   */
  async generateActivityImage(data: ActivityImageRequest): Promise<ApiResponse<ImageGenerationResult>> {
    return aiService.post('/auto-image/activity', data)
  }

  /**
   * 为海报生成配图
   */
  async generatePosterImage(data: PosterImageRequest): Promise<ApiResponse<ImageGenerationResult>> {
    return aiService.post('/auto-image/poster', data)
  }

  /**
   * 为模板生成配图
   */
  async generateTemplateImage(data: TemplateImageRequest): Promise<ApiResponse<ImageGenerationResult>> {
    return aiService.post('/auto-image/template', data)
  }

  /**
   * 批量生成图像
   */
  async generateBatchImages(data: BatchImageRequest): Promise<ApiResponse<BatchImageResult>> {
    return aiService.post('/auto-image/batch', data)
  }

  /**
   * 检查服务状态
   */
  async checkServiceStatus(): Promise<ApiResponse<ServiceStatus>> {
    return aiService.get('/auto-image/status')
  }

  /**
   * 快速生成活动配图（简化接口）
   */
  async quickGenerateActivityImage(title: string, description: string): Promise<string | null> {
    try {
      const response = await this.generateActivityImage({
        activityTitle: title,
        activityDescription: description
      })

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl
      }

      return null
    } catch (error) {
      console.error('快速生成活动配图失败:', error)
      return null
    }
  }

  /**
   * 快速生成海报配图（简化接口）
   */
  async quickGeneratePosterImage(title: string, content: string): Promise<string | null> {
    try {
      const response = await this.generatePosterImage({
        posterTitle: title,
        posterContent: content
      })

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl
      }

      return null
    } catch (error) {
      console.error('快速生成海报配图失败:', error)
      return null
    }
  }

  /**
   * 快速生成模板配图（简化接口）
   */
  async quickGenerateTemplateImage(name: string, description: string): Promise<string | null> {
    try {
      const response = await this.generateTemplateImage({
        templateName: name,
        templateDescription: description
      })

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl
      }

      return null
    } catch (error) {
      console.error('快速生成模板配图失败:', error)
      return null
    }
  }

  /**
   * 根据文本内容智能生成配图
   */
  async smartGenerateImage(
    content: string,
    type: 'activity' | 'poster' | 'template' = 'activity'
  ): Promise<string | null> {
    try {
      // 根据内容长度和类型智能构建提示词
      let prompt = content

      // 如果内容太长，提取关键信息
      if (content.length > 100) {
        // 简单的关键词提取（实际项目中可以使用更复杂的NLP算法）
        const keywords = content.match(/[\u4e00-\u9fa5]{2,}/g)?.slice(0, 5).join('，') || content.substring(0, 50)
        prompt = keywords
      }

      const response = await this.generateImage({
        prompt,
        category: type,
        style: 'natural',
        size: '1024x768',
        quality: 'standard',
        watermark: true
      })

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl
      }

      return null
    } catch (error) {
      console.error('智能生成配图失败:', error)
      return null
    }
  }

  /**
   * 智能生成提示词（基于活动信息）
   */
  async smartGeneratePrompt(
    title: string,
    description: string,
    type: 'activity' | 'poster' | 'template' = 'poster'
  ): Promise<string | null> {
    try {
      // 使用模板生成API来获取智能提示词
      await this.generateTemplateImage({
        templateName: title,
        templateDescription: description,
        templateData: { type }
      })

      // 注意：这里我们实际上不需要生成图片，只需要提示词
      // 但由于后端API设计，我们需要调用生成API来获取智能提示词
      // 在实际项目中，可以考虑添加一个专门的提示词生成API

      return null // 暂时返回null，让前端使用本地生成的提示词
    } catch (error) {
      console.error('智能提示词生成失败:', error)
      return null
    }
  }

  /**
   * 批量替换展位图片
   */
  async batchReplaceDefaultImages(items: Array<{
    id: string | number
    title: string
    description: string
    type: 'activity' | 'poster' | 'template'
  }>): Promise<Array<{
    id: string | number
    imageUrl: string | null
    success: boolean
    error?: string
  }>> {
    const results = []

    // 分批处理，避免同时发送太多请求
    const batchSize = 3
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)

      const batchPromises = batch.map(async (item) => {
        try {
          const imageUrl = await this.smartGenerateImage(
            `${item.title}: ${item.description}`,
            item.type
          )

          return {
            id: item.id,
            imageUrl,
            success: !!imageUrl,
            error: imageUrl ? undefined : '生成失败'
          }
        } catch (error: any) {
          return {
            id: item.id,
            imageUrl: null,
            success: false,
            error: error.message || '生成异常'
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // 批次间延迟，避免请求过于频繁
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return results
  }
}

// 导出API实例
export const autoImageApi = new AutoImageApi()

// 导出默认实例
export default autoImageApi
