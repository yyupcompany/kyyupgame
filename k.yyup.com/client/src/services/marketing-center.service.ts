import request from '@/utils/request'

// 营销统计数据接口
export interface MarketingStatistics {
  activeCampaigns: {
    count: number
    change: string
  }
  newCustomers: {
    count: number
    change: string
  }
  conversionRate: {
    rate: number
    change: string
  }
  marketingROI: {
    roi: number
    change: string
  }
}

// 营销活动摘要接口
export interface MarketingCampaignSummary {
  id: number
  title: string
  description: string
  status: string
  startDate: string
  participantCount: number
  conversionRate: number
}

// 营销渠道接口
export interface MarketingChannel {
  name: string
  icon: string
  monthlyCustomers: number
  conversionRate: number
  acquisitionCost: number
  status: string
}

/**
 * 营销中心服务
 */
export class MarketingCenterService {
  
  /**
   * 获取营销中心统计数据
   * @returns 营销统计数据
   */
  static async getStatistics(): Promise<MarketingStatistics> {
    try {
      const response = await request.get('/api/marketing-center/statistics')
      return response.data
    } catch (error) {
      console.error('获取营销统计数据失败:', error)
      // 返回默认数据作为降级方案
      return {
        activeCampaigns: { count: 0, change: '0%' },
        newCustomers: { count: 0, change: '0%' },
        conversionRate: { rate: 0, change: '0%' },
        marketingROI: { roi: 0, change: '0%' }
      }
    }
  }

  /**
   * 获取最近的营销活动
   * @param limit 返回数量限制，默认3个
   * @returns 营销活动列表
   */
  static async getRecentCampaigns(limit: number = 3): Promise<MarketingCampaignSummary[]> {
    try {
      const response = await request.get('/api/marketing-center/campaigns/recent', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('获取最近营销活动失败:', error)
      // 返回空数组作为降级方案
      return []
    }
  }

  /**
   * 获取营销渠道概览
   * @returns 营销渠道列表
   */
  static async getChannels(): Promise<MarketingChannel[]> {
    try {
      const response = await request.get('/api/marketing-center/channels')
      return response.data
    } catch (error) {
      console.error('获取营销渠道数据失败:', error)
      // 返回空数组作为降级方案
      return []
    }
  }
}

export default MarketingCenterService
