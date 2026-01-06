/**
 * 🌐 移动端API服务
 * 
 * 专门为移动端设计的API服务层
 * 支持Smart Expert和Expert Consultation系统调用
 */

import type { 
  AgentType, 
  ExpertConsultationType,
  SmartExpertRequest,
  SmartExpertResponse,
  ExpertConsultationRequest,
  ExpertConsultationResponse
} from '../types/mobile-agents'

// 移动端API配置
const MOBILE_API_CONFIG = {
  baseURL: '/api', // 相对路径，适配移动端
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
}

export class MobileAPIService {
  private baseURL: string
  private timeout: number
  private retryAttempts: number
  private retryDelay: number

  constructor() {
    this.baseURL = MOBILE_API_CONFIG.baseURL
    this.timeout = MOBILE_API_CONFIG.timeout
    this.retryAttempts = MOBILE_API_CONFIG.retryAttempts
    this.retryDelay = MOBILE_API_CONFIG.retryDelay
  }

  /**
   * 调用Smart Expert系统
   */
  async callSmartExpert(request: SmartExpertRequest): Promise<SmartExpertResponse> {
    const url = `${this.baseURL}/ai/expert/smart-chat`

    console.log(`🤖 调用Smart Expert: ${request.expert_id}`)

    try {
      // 将请求转换为智能聊天的messages格式，并在内容中提示优先专家
      const content = `${request.task}${request.expert_id ? `（请优先由${request.expert_id}专家处理）` : ''}${request.context ? `\n上下文：${request.context}` : ''}`

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const auth = this.getAuthToken()
      if (auth) headers['Authorization'] = auth

      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            { role: 'user', content }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Smart Expert API调用失败: ${response.status}`)
      }

      const data: any = await response.json()

      // 统一响应为 SmartExpertResponse 结构
      const advice = data?.advice || data?.message || ''
      let expertName = '智能助手'
      if (Array.isArray(data?.expert_calls) && data.expert_calls.length > 0) {
        const first = data.expert_calls[0]
        expertName = first?.result?.expert_name || first?.result?.expert_id || expertName
      }

      const normalized: SmartExpertResponse = {
        expert_id: request.expert_id,
        expert_name: expertName,
        task: request.task,
        advice,
        timestamp: new Date().toISOString(),
        error: data?.success === false
      }

      console.log(`✅ Smart Expert响应成功: ${request.expert_id}`)
      return normalized

    } catch (error) {
      console.error(`❌ Smart Expert调用失败:`, error)
      throw error
    }
  }

  /**
   * 获取Smart Expert列表
   */
  async getSmartExpertList(domain?: string): Promise<any> {
    const url = `${this.baseURL}/ai/smart-expert/list`
    const params = domain ? `?domain=${domain}` : ''
    
    try {
      const response = await this.fetchWithRetry(`${url}${params}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthToken()
        }
      })

      if (!response.ok) {
        throw new Error(`获取专家列表失败: ${response.status}`)
      }

      return await response.json()
      
    } catch (error) {
      console.error(`❌ 获取专家列表失败:`, error)
      throw error
    }
  }

  /**
   * 启动Expert Consultation会话
   */
  async startExpertConsultation(request: ExpertConsultationRequest): Promise<ExpertConsultationResponse> {
    const url = `${this.baseURL}/expert-consultation/start`
    
    console.log(`👥 启动专家咨询会话`)
    
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthToken()
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`专家咨询启动失败: ${response.status}`)
      }

      const data = await response.json()
      
      console.log(`✅ 专家咨询会话已启动: ${data.consultationId}`)
      return data
      
    } catch (error) {
      console.error(`❌ 专家咨询启动失败:`, error)
      throw error
    }
  }

  /**
   * 获取Expert Consultation下一轮发言
   */
  async getNextConsultationSpeech(consultationId: string): Promise<any> {
    const url = `${this.baseURL}/expert-consultation/${consultationId}/next`
    
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthToken()
        }
      })

      if (!response.ok) {
        throw new Error(`获取专家发言失败: ${response.status}`)
      }

      return await response.json()
      
    } catch (error) {
      console.error(`❌ 获取专家发言失败:`, error)
      throw error
    }
  }

  /**
   * 获取Expert Consultation汇总
   */
  async getConsultationSummary(consultationId: string): Promise<any> {
    const url = `${this.baseURL}/expert-consultation/${consultationId}/summary`
    
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthToken()
        }
      })

      if (!response.ok) {
        throw new Error(`获取咨询汇总失败: ${response.status}`)
      }

      return await response.json()
      
    } catch (error) {
      console.error(`❌ 获取咨询汇总失败:`, error)
      throw error
    }
  }

  /**
   * 智能专家调度聊天（直连模式）
   */
  async smartExpertChat(messages: any[]): Promise<any> {
    const url = `${this.baseURL}/ai/expert/smart-chat`

    console.log(`💬 智能专家调度聊天`)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const auth = this.getAuthToken()
      if (auth) headers['Authorization'] = auth

      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages })
      })

      if (!response.ok) {
        throw new Error(`智能专家聊天失败: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error(`❌ 智能专家聊天失败:`, error)
      throw error
    }
  }

  /**
   * 带重试的fetch请求
   */
  private async fetchWithRetry(url: string, options: RequestInit, attempt: number = 1): Promise<Response> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response
      
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`🔄 API请求重试 ${attempt}/${this.retryAttempts}: ${url}`)
        await this.delay(this.retryDelay * attempt)
        return this.fetchWithRetry(url, options, attempt + 1)
      }
      
      throw error
    }
  }

  /**
   * 获取认证Token
   */
  private getAuthToken(): string {
    // 从localStorage或其他存储中获取token（兼容多种key）
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('kindergarten_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token')

    return token ? `Bearer ${token}` : ''
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 检查网络连接状态
   */
  isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * 获取网络质量
   */
  getNetworkQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!navigator.onLine) return 'offline'
    
    // 检查网络连接类型（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const effectiveType = connection.effectiveType
      
      switch (effectiveType) {
        case '4g':
          return 'excellent'
        case '3g':
          return 'good'
        case '2g':
          return 'poor'
        default:
          return 'good'
      }
    }
    
    return 'good'
  }

  /**
   * 移动端专用：压缩请求数据
   */
  private compressRequestData(data: any): any {
    // 移动端可以压缩一些不必要的数据
    if (typeof data === 'object' && data !== null) {
      const compressed = { ...data }
      
      // 移除空值和undefined
      Object.keys(compressed).forEach(key => {
        if (compressed[key] === null || compressed[key] === undefined || compressed[key] === '') {
          delete compressed[key]
        }
      })
      
      return compressed
    }
    
    return data
  }

  /**
   * 移动端专用：处理离线队列
   */
  private offlineQueue: Array<{ url: string, options: RequestInit, resolve: Function, reject: Function }> = []

  /**
   * 添加到离线队列
   */
  private addToOfflineQueue(url: string, options: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({ url, options, resolve, reject })
    })
  }

  /**
   * 处理离线队列
   */
  async processOfflineQueue(): Promise<void> {
    if (!this.isOnline() || this.offlineQueue.length === 0) return
    
    console.log(`📱 处理离线队列: ${this.offlineQueue.length} 个请求`)
    
    const queue = [...this.offlineQueue]
    this.offlineQueue = []
    
    for (const item of queue) {
      try {
        const response = await this.fetchWithRetry(item.url, item.options)
        item.resolve(response)
      } catch (error) {
        item.reject(error)
      }
    }
  }
}

// 导出单例实例
export const mobileAPIService = new MobileAPIService()

// 监听网络状态变化，自动处理离线队列
window.addEventListener('online', () => {
  console.log('📱 网络已连接，处理离线队列')
  mobileAPIService.processOfflineQueue()
})

export default mobileAPIService
