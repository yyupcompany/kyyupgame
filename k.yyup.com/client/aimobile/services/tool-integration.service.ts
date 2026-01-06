/**
 * 🛠️ 工具集成服务
 * 
 * 集成各种AI工具：图片生成、文档生成、数据可视化等
 * 为AI任务规划器提供工具调用能力
 */

import { mobileStorageService, StorageType } from './mobile-storage.service'

// 工具配置接口
export interface ToolConfig {
  apiKey?: string
  baseURL?: string
  model?: string
  timeout?: number
  retryAttempts?: number
}

// 图片生成请求接口
export interface ImageGenerationRequest {
  prompt: string
  style?: 'realistic' | 'cartoon' | 'professional' | 'artistic'
  size?: '512x512' | '1024x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  count?: number
}

// 图片生成响应接口
export interface ImageGenerationResponse {
  images: Array<{
    url: string
    prompt: string
    size: string
    style: string
  }>
  usage: {
    totalTokens: number
    cost: number
  }
}

// 文档生成请求接口
export interface DocumentGenerationRequest {
  title: string
  content: Record<string, any>
  template?: 'report' | 'proposal' | 'plan' | 'summary'
  format?: 'markdown' | 'html' | 'pdf'
  language?: 'zh-CN' | 'en-US'
}

// 文档生成响应接口
export interface DocumentGenerationResponse {
  document: {
    title: string
    content: string
    format: string
    downloadUrl?: string
  }
  metadata: {
    wordCount: number
    pageCount: number
    generatedAt: string
  }
}

// 数据可视化请求接口
export interface DataVisualizationRequest {
  data: any[]
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area'
  title: string
  xAxis?: string
  yAxis?: string
  config?: Record<string, any>
}

// 数据可视化响应接口
export interface DataVisualizationResponse {
  chart: {
    type: string
    config: Record<string, any>
    imageUrl?: string
    interactiveUrl?: string
  }
  data: any[]
}

export class ToolIntegrationService {
  private configs: Map<string, ToolConfig> = new Map()

  constructor() {
    this.initializeConfigs()
  }

  // ==================== 初始化配置 ====================

  private async initializeConfigs(): Promise<void> {
    // 加载工具配置
    const savedConfigs = await mobileStorageService.get('tool_configs', StorageType.LOCAL)
    if (savedConfigs) {
      this.configs = new Map(Object.entries(savedConfigs))
    }

    // 设置默认配置
    this.setDefaultConfigs()
  }

  private setDefaultConfigs(): void {
    // 图片生成工具配置
    if (!this.configs.has('image_generation')) {
      this.configs.set('image_generation', {
        baseURL: 'https://api.openai.com/v1',
        model: 'dall-e-3',
        timeout: 60000,
        retryAttempts: 3
      })
    }

    // 文档生成工具配置
    if (!this.configs.has('document_generation')) {
      this.configs.set('document_generation', {
        timeout: 30000,
        retryAttempts: 2
      })
    }

    // 数据可视化工具配置
    if (!this.configs.has('data_visualization')) {
      this.configs.set('data_visualization', {
        timeout: 15000,
        retryAttempts: 2
      })
    }
  }

  // ==================== 图片生成 ====================

  /**
   * 生成图片
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    console.log('🎨 开始生成图片:', request.prompt)

    try {
      const config = this.configs.get('image_generation')!
      
      // 优化提示词
      const optimizedPrompt = this.optimizeImagePrompt(request.prompt, request.style)
      
      // 调用图片生成API
      const response = await this.callImageGenerationAPI(optimizedPrompt, request, config)
      
      // 保存生成历史
      await this.saveImageHistory(request, response)
      
      console.log('✅ 图片生成完成')
      return response

    } catch (error) {
      console.error('❌ 图片生成失败:', error)
      
      // 降级处理：返回占位图片
      return this.getFallbackImage(request)
    }
  }

  private optimizeImagePrompt(prompt: string, style?: string): string {
    let optimized = prompt

    // 添加样式描述
    switch (style) {
      case 'professional':
        optimized += ', professional design, clean layout, corporate style'
        break
      case 'cartoon':
        optimized += ', cartoon style, colorful, friendly, child-friendly'
        break
      case 'artistic':
        optimized += ', artistic style, creative, visually appealing'
        break
      case 'realistic':
        optimized += ', photorealistic, high quality, detailed'
        break
    }

    // 添加质量描述
    optimized += ', high quality, 4k resolution'

    return optimized
  }

  private async callImageGenerationAPI(
    prompt: string, 
    request: ImageGenerationRequest, 
    config: ToolConfig
  ): Promise<ImageGenerationResponse> {
    // 这里应该调用实际的图片生成API（如DALL-E、Midjourney等）
    // 暂时返回模拟结果
    
    const mockResponse: ImageGenerationResponse = {
      images: [{
        url: `https://picsum.photos/1024/1024?random=${Date.now()}`,
        prompt: prompt,
        size: request.size || '1024x1024',
        style: request.style || 'professional'
      }],
      usage: {
        totalTokens: prompt.length,
        cost: 0.02
      }
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    return mockResponse
  }

  private getFallbackImage(request: ImageGenerationRequest): ImageGenerationResponse {
    return {
      images: [{
        url: 'https://via.placeholder.com/1024x1024/667eea/ffffff?text=Generated+Image',
        prompt: request.prompt,
        size: request.size || '1024x1024',
        style: request.style || 'professional'
      }],
      usage: {
        totalTokens: 0,
        cost: 0
      }
    }
  }

  // ==================== 文档生成 ====================

  /**
   * 生成文档
   */
  async generateDocument(request: DocumentGenerationRequest): Promise<DocumentGenerationResponse> {
    console.log('📄 开始生成文档:', request.title)

    try {
      // 选择模板
      const template = this.getDocumentTemplate(request.template || 'report')
      
      // 生成内容
      const content = this.generateDocumentContent(request, template)
      
      // 格式化文档
      const formattedContent = this.formatDocument(content, request.format || 'markdown')
      
      const response: DocumentGenerationResponse = {
        document: {
          title: request.title,
          content: formattedContent,
          format: request.format || 'markdown',
          downloadUrl: this.generateDownloadUrl(request.title, formattedContent)
        },
        metadata: {
          wordCount: this.countWords(formattedContent),
          pageCount: Math.ceil(this.countWords(formattedContent) / 500),
          generatedAt: new Date().toISOString()
        }
      }

      // 保存文档历史
      await this.saveDocumentHistory(request, response)

      console.log('✅ 文档生成完成')
      return response

    } catch (error) {
      console.error('❌ 文档生成失败:', error)
      throw error
    }
  }

  private getDocumentTemplate(type: string): string {
    const templates = {
      report: `
# {title}

## 执行摘要
{summary}

## 详细内容
{content}

## 结论和建议
{recommendations}

---
*生成时间：{timestamp}*
      `,
      proposal: `
# {title}

## 项目概述
{overview}

## 实施方案
{implementation}

## 预算分析
{budget}

## 时间安排
{timeline}

## 风险评估
{risks}
      `,
      plan: `
# {title}

## 目标
{objectives}

## 执行步骤
{steps}

## 资源需求
{resources}

## 成功指标
{metrics}
      `
    }

    return templates[type] || templates.report
  }

  private generateDocumentContent(request: DocumentGenerationRequest, template: string): string {
    let content = template

    // 替换模板变量
    content = content.replace('{title}', request.title)
    content = content.replace('{timestamp}', new Date().toLocaleString('zh-CN'))

    // 处理内容数据
    Object.entries(request.content).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      const formattedValue = this.formatContentValue(value)
      content = content.replace(new RegExp(placeholder, 'g'), formattedValue)
    })

    return content
  }

  private formatContentValue(value: any): string {
    if (typeof value === 'string') {
      return value
    } else if (Array.isArray(value)) {
      return value.map(item => `- ${item}`).join('\n')
    } else if (typeof value === 'object') {
      return Object.entries(value)
        .map(([k, v]) => `**${k}**: ${v}`)
        .join('\n\n')
    } else {
      return String(value)
    }
  }

  private formatDocument(content: string, format: string): string {
    switch (format) {
      case 'html':
        return this.markdownToHtml(content)
      case 'pdf':
        // 这里应该调用PDF生成服务
        return content
      default:
        return content
    }
  }

  private markdownToHtml(markdown: string): string {
    // 简单的Markdown到HTML转换
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>')
  }

  private generateDownloadUrl(title: string, content: string): string {
    // 生成下载链接（实际应该上传到文件服务）
    const blob = new Blob([content], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  // ==================== 数据可视化 ====================

  /**
   * 生成数据可视化
   */
  async generateVisualization(request: DataVisualizationRequest): Promise<DataVisualizationResponse> {
    console.log('📊 开始生成数据可视化:', request.title)

    try {
      // 生成图表配置
      const chartConfig = this.generateChartConfig(request)
      
      // 生成图表图片（可选）
      const imageUrl = await this.generateChartImage(chartConfig, request)

      const response: DataVisualizationResponse = {
        chart: {
          type: request.chartType,
          config: chartConfig,
          imageUrl,
          interactiveUrl: this.generateInteractiveUrl(chartConfig)
        },
        data: request.data
      }

      console.log('✅ 数据可视化生成完成')
      return response

    } catch (error) {
      console.error('❌ 数据可视化生成失败:', error)
      throw error
    }
  }

  private generateChartConfig(request: DataVisualizationRequest): Record<string, any> {
    const baseConfig = {
      type: request.chartType,
      data: {
        labels: request.data.map(item => item[request.xAxis || 'label']),
        datasets: [{
          label: request.title,
          data: request.data.map(item => item[request.yAxis || 'value']),
          backgroundColor: this.getChartColors(request.chartType),
          borderColor: '#667eea',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: request.title
          },
          legend: {
            display: true
          }
        },
        scales: request.chartType !== 'pie' ? {
          y: {
            beginAtZero: true
          }
        } : undefined
      }
    }

    // 合并用户配置
    return { ...baseConfig, ...request.config }
  }

  private getChartColors(chartType: string): string[] {
    const colorPalettes = {
      bar: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
      line: ['#667eea'],
      pie: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#38f9d7'],
      scatter: ['#667eea'],
      area: ['rgba(102, 126, 234, 0.3)']
    }

    return colorPalettes[chartType] || colorPalettes.bar
  }

  private async generateChartImage(config: Record<string, any>, request: DataVisualizationRequest): Promise<string> {
    // 这里应该调用图表渲染服务生成图片
    // 暂时返回占位图片
    return `https://via.placeholder.com/800x400/667eea/ffffff?text=${encodeURIComponent(request.title)}`
  }

  private generateInteractiveUrl(config: Record<string, any>): string {
    // 生成交互式图表链接
    const encodedConfig = encodeURIComponent(JSON.stringify(config))
    return `https://chart-viewer.example.com?config=${encodedConfig}`
  }

  // ==================== 历史记录 ====================

  private async saveImageHistory(request: ImageGenerationRequest, response: ImageGenerationResponse): Promise<void> {
    const history = await mobileStorageService.get('image_generation_history', StorageType.LOCAL) || []
    history.unshift({
      request,
      response,
      timestamp: new Date().toISOString()
    })

    // 只保留最近50条记录
    const trimmedHistory = history.slice(0, 50)
    
    await mobileStorageService.set('image_generation_history', trimmedHistory, {
      type: StorageType.LOCAL,
      ttl: 30 * 24 * 60 * 60 * 1000 // 30天
    })
  }

  private async saveDocumentHistory(request: DocumentGenerationRequest, response: DocumentGenerationResponse): Promise<void> {
    const history = await mobileStorageService.get('document_generation_history', StorageType.LOCAL) || []
    history.unshift({
      request,
      response,
      timestamp: new Date().toISOString()
    })

    const trimmedHistory = history.slice(0, 30)
    
    await mobileStorageService.set('document_generation_history', trimmedHistory, {
      type: StorageType.LOCAL,
      ttl: 30 * 24 * 60 * 60 * 1000
    })
  }

  // ==================== 配置管理 ====================

  /**
   * 设置工具配置
   */
  async setToolConfig(toolName: string, config: ToolConfig): Promise<void> {
    this.configs.set(toolName, config)
    
    // 保存配置
    const configsObject = Object.fromEntries(this.configs)
    await mobileStorageService.set('tool_configs', configsObject, {
      type: StorageType.LOCAL
    })
  }

  /**
   * 获取工具配置
   */
  getToolConfig(toolName: string): ToolConfig | undefined {
    return this.configs.get(toolName)
  }

  /**
   * 获取生成历史
   */
  async getGenerationHistory(type: 'image' | 'document'): Promise<any[]> {
    const key = `${type}_generation_history`
    return await mobileStorageService.get(key, StorageType.LOCAL) || []
  }

  /**
   * 清除历史记录
   */
  async clearHistory(type?: 'image' | 'document'): Promise<void> {
    if (type) {
      const key = `${type}_generation_history`
      await mobileStorageService.remove(key, StorageType.LOCAL)
    } else {
      await mobileStorageService.remove('image_generation_history', StorageType.LOCAL)
      await mobileStorageService.remove('document_generation_history', StorageType.LOCAL)
    }
  }

  /**
   * 获取使用统计
   */
  async getUsageStats(): Promise<{
    images: { total: number; thisMonth: number }
    documents: { total: number; thisMonth: number }
    totalCost: number
  }> {
    const imageHistory = await this.getGenerationHistory('image')
    const documentHistory = await this.getGenerationHistory('document')
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const imageThisMonth = imageHistory.filter(item => 
      new Date(item.timestamp) >= thisMonth
    ).length

    const documentThisMonth = documentHistory.filter(item => 
      new Date(item.timestamp) >= thisMonth
    ).length

    const totalCost = imageHistory.reduce((sum, item) => 
      sum + (item.response?.usage?.cost || 0), 0
    )

    return {
      images: {
        total: imageHistory.length,
        thisMonth: imageThisMonth
      },
      documents: {
        total: documentHistory.length,
        thisMonth: documentThisMonth
      },
      totalCost
    }
  }
}

// 导出单例实例
export const toolIntegrationService = new ToolIntegrationService()

export default toolIntegrationService
