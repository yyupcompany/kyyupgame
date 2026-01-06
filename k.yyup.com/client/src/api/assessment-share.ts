import request from '@/utils/request'

export interface ShareStats {
  shareCount: number
  scanCount: number
  conversionCount: number
  rewardPoints: number
  recentScans: Array<{
    scannerName: string
    scanTime: Date
    completed: boolean
  }>
}

export interface ShareRewards {
  totalShares: number
  totalScans: number
  totalConversions: number
  totalRewardPoints: number
  availableRewards: Array<{
    name: string
    points: number
    description: string
  }>
}

export const assessmentShareApi = {
  // 记录分享
  recordShare(data: {
    recordId: number
    shareChannel: 'wechat' | 'moments' | 'link' | 'qrcode'
    sharePlatform?: string
  }) {
    return request.post('/api/assessment-share/share', data)
  },

  // 记录扫描
  recordScan(data: {
    recordId: number
    scannerPhone?: string
    source: 'qrcode' | 'link'
    referrerUserId?: number
  }) {
    return request.post('/api/assessment-share/scan', data)
  },

  // 获取分享统计
  async getShareStats(recordId: number): Promise<{ data: { data: ShareStats } }> {
    const response = await request.get(`/api/assessment-share/stats/${recordId}`)
    return {
      data: {
        data: response.data!
      }
    }
  },

  // 获取用户分享奖励
  async getUserShareRewards(): Promise<{ data: { data: ShareRewards } }> {
    const response = await request.get('/api/assessment-share/rewards')
    return {
      data: {
        data: response.data!
      }
    }
  }
}





