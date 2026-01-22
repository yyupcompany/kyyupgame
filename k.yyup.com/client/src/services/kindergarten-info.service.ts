/**
 * 幼儿园基础信息服务
 * 统一管理基础信息的获取和格式化
 */
import request from '@/utils/request'

export interface KindergartenBasicInfo {
  id: number | null
  name: string
  description: string
  address: string
  phone: string
  consultationPhone: string
  contactPerson: string
  logoUrl: string
  coverImages: string[]
  studentCount: number
  teacherCount: number
  classCount: number
}

class KindergartenInfoService {
  private cachedInfo: KindergartenBasicInfo | null = null
  private cacheTime: number = 0
  private CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  /**
   * 获取幼儿园基础信息（带缓存）
   */
  async getBasicInfo(): Promise<KindergartenBasicInfo> {
    const now = Date.now()
    
    // 如果缓存有效，直接返回
    if (this.cachedInfo && (now - this.cacheTime) < this.CACHE_DURATION) {
      console.log('📦 使用缓存的幼儿园基础信息')
      return this.cachedInfo!
    }

    try {
      console.log('🔄 从API获取幼儿园基础信息...')
      // 从API获取
      const response = await request.get('/kindergarten/basic-info')
      
      if (response.success && response.data) {
        this.cachedInfo = response.data
        this.cacheTime = now
        console.log('✅ 幼儿园基础信息获取成功:', this.cachedInfo)
        return this.cachedInfo!
      }
    } catch (error) {
      console.warn('⚠️ 获取幼儿园基础信息失败，使用默认值:', error)
    }

    // 返回默认值
    return this.getDefaultInfo()
  }

  /**
   * 格式化为AI提示词
   */
  async formatForAIPrompt(options?: {
    includeName?: boolean
    includeAddress?: boolean
    includeContact?: boolean
    includeDescription?: boolean
  }): Promise<string> {
    const info = await this.getBasicInfo()
    const parts: string[] = []

    const opts = {
      includeName: true,
      includeAddress: true,
      includeContact: true,
      includeDescription: false, // 简介默认不包含，避免提示词过长
      ...options
    }

    if (opts.includeName && info.name) {
      parts.push(`幼儿园名称：${info.name}`)
    }

    if (opts.includeDescription && info.description) {
      parts.push(`幼儿园简介：${info.description}`)
    }

    if (opts.includeAddress && info.address) {
      parts.push(`园区地址：${info.address}`)
    }

    if (opts.includeContact) {
      if (info.consultationPhone) {
        parts.push(`咨询电话：${info.consultationPhone}`)
      } else if (info.phone) {
        parts.push(`咨询电话：${info.phone}`)
      }
      
      if (info.contactPerson) {
        parts.push(`联系人：${info.contactPerson}`)
      }
    }

    const result = parts.join('\n')
    console.log('📝 格式化AI提示词:', result)
    return result
  }

  /**
   * 格式化为海报数据
   */
  async formatForPoster(): Promise<{
    kindergartenName: string
    address: string
    phone: string
    contactPerson: string
    logoUrl: string
  }> {
    const info = await this.getBasicInfo()
    const result = {
      kindergartenName: info.name || '幼儿园',
      address: info.address || '',
      phone: info.consultationPhone || info.phone || '',
      contactPerson: info.contactPerson || '',
      logoUrl: info.logoUrl || ''
    }
    console.log('🎨 格式化海报数据:', result)
    return result
  }

  /**
   * 格式化为报名页面数据
   */
  async formatForRegistrationPage(): Promise<{
    kindergartenName: string
    description: string
    address: string
    phone: string
    contactPerson: string
    logoUrl: string
    coverImages: string[]
  }> {
    const info = await this.getBasicInfo()
    const result = {
      kindergartenName: info.name || '幼儿园',
      description: info.description || '',
      address: info.address || '',
      phone: info.consultationPhone || info.phone || '',
      contactPerson: info.contactPerson || '',
      logoUrl: info.logoUrl || '',
      coverImages: info.coverImages || []
    }
    console.log('📄 格式化报名页面数据:', result)
    return result
  }

  /**
   * 检查基础信息是否完整
   */
  async checkInfoComplete(): Promise<{
    complete: boolean
    missing: string[]
  }> {
    const info = await this.getBasicInfo()
    const missing: string[] = []

    if (!info.name) missing.push('幼儿园名称')
    if (!info.address) missing.push('园区地址')
    if (!info.consultationPhone && !info.phone) missing.push('联系电话')

    return {
      complete: missing.length === 0,
      missing
    }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    console.log('🗑️ 清除幼儿园基础信息缓存')
    this.cachedInfo = null
    this.cacheTime = 0
  }

  /**
   * 获取默认信息
   */
  private getDefaultInfo(): KindergartenBasicInfo {
    console.log('📋 使用默认幼儿园信息')
    return {
      id: null,
      name: '',
      description: '',
      address: '',
      phone: '',
      consultationPhone: '',
      contactPerson: '',
      logoUrl: '',
      coverImages: [],
      studentCount: 0,
      teacherCount: 0,
      classCount: 0
    }
  }
}

// 导出单例
export const kindergartenInfoService = new KindergartenInfoService()

// 导出便捷方法
export const getKindergartenBasicInfo = () => kindergartenInfoService.getBasicInfo()
export const formatForPoster = () => kindergartenInfoService.formatForPoster()
export const formatForRegistrationPage = () => kindergartenInfoService.formatForRegistrationPage()

// 默认导出
export default kindergartenInfoService

