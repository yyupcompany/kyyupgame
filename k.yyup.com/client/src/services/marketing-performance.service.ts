import request from '@/utils/request'

// 营销绩效相关的API接口
export default class MarketingPerformanceService {
  // 获取转介绍统计数据
  static async getReferralStats(params: {
    startDate: string
    endDate: string
  }) {
    return request({
      url: '/api/marketing-performance/referral-stats',
      method: 'GET',
      params
    })
  }

  // 获取转介绍奖励列表
  static async getReferralRewards(params: {
    page: number
    size: number
    startDate: string
    endDate: string
    referrerRole?: string
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    return request({
      url: '/api/marketing-performance/referral-rewards',
      method: 'GET',
      params
    })
  }

  // 审批发放奖励
  static async approveReward(rewardId: string) {
    return request({
      url: `/api/marketing-performance/referral-rewards/${rewardId}/approve`,
      method: 'POST'
    })
  }

  // 获取团队排名
  static async getTeamRanking(params: {
    rankingType: string
    timeFilter: string
    startDate?: string
    endDate?: string
  }) {
    return request({
      url: '/api/marketing-performance/team-ranking',
      method: 'GET',
      params
    })
  }

  // 获取个人贡献数据
  static async getPersonalContribution(params: {
    startDate: string
    endDate: string
  }) {
    return request({
      url: '/api/marketing-performance/personal-contribution',
      method: 'GET',
      params
    })
  }

  // 获取个人转介绍记录
  static async getPersonalReferralRecords(params: {
    page: number
    size: number
    startDate: string
    endDate: string
  }) {
    return request({
      url: '/api/marketing-performance/personal-referral-records',
      method: 'GET',
      params
    })
  }

  // 发送提醒
  static async sendReminder(recordId: string) {
    return request({
      url: `/api/marketing-performance/referral-records/${recordId}/remind`,
      method: 'POST'
    })
  }

  // 导出个人记录
  static async exportPersonalRecords(params: {
    startDate: string
    endDate: string
  }) {
    return request({
      url: '/api/marketing-performance/export/personal-records',
      method: 'GET',
      params,
      responseType: 'blob'
    })
  }

  // 获取奖励设置
  static async getRewardSettings() {
    return request({
      url: '/api/marketing-performance/reward-settings',
      method: 'GET'
    })
  }

  // 更新奖励设置
  static async updateRewardSettings(settings: any) {
    return request({
      url: '/api/marketing-performance/reward-settings',
      method: 'PUT',
      data: settings
    })
  }

  // 获取设置变更历史
  static async getSettingsHistory(params: {
    page?: number
    size?: number
  } = {}) {
    return request({
      url: '/api/marketing-performance/reward-settings/history',
      method: 'GET',
      params
    })
  }

  // 导出绩效报告
  static async exportPerformanceReport(params: {
    startDate: string
    endDate: string
    tab: string
  }) {
    return request({
      url: '/api/marketing-performance/export/report',
      method: 'GET',
      params,
      responseType: 'blob'
    })
  }

  // 生成推荐码
  static async generateReferralCode(userId: string) {
    return request({
      url: `/api/marketing-performance/generate-referral-code/${userId}`,
      method: 'POST'
    })
  }

  // 获取推荐统计
  static async getReferralAnalytics(params: {
    referralCode?: string
    userId?: string
    startDate?: string
    endDate?: string
  }) {
    return request({
      url: '/api/marketing-performance/referral-analytics',
      method: 'GET',
      params
    })
  }

  // 获取转化漏斗数据
  static async getConversionFunnel(params: {
    startDate: string
    endDate: string
    groupBy?: 'day' | 'week' | 'month'
  }) {
    return request({
      url: '/api/marketing-performance/conversion-funnel',
      method: 'GET',
      params
    })
  }

  // 获取奖励发放记录
  static async getRewardPaymentHistory(params: {
    page: number
    size: number
    startDate?: string
    endDate?: string
    status?: string
  }) {
    return request({
      url: '/api/marketing-performance/reward-payments',
      method: 'GET',
      params
    })
  }

  // 批量发放奖励
  static async batchApproveRewards(rewardIds: string[]) {
    return request({
      url: '/api/marketing-performance/referral-rewards/batch-approve',
      method: 'POST',
      data: { rewardIds }
    })
  }

  // 获取排行榜
  static async getLeaderboard(params: {
    type: 'referrals' | 'rewards' | 'conversion'
    period: 'week' | 'month' | 'quarter' | 'year'
    limit?: number
  }) {
    return request({
      url: '/api/marketing-performance/leaderboard',
      method: 'GET',
      params
    })
  }
}

// 类型定义
export interface ReferralStats {
  totalRewards: number
  rewardsTrend: string
  successfulReferrals: number
  referralsTrend: string
  conversionRate: number
  conversionTrend: string
  activeReferrers: number
  referrersTrend: string
}

export interface ReferralReward {
  id: string
  referrerId: string
  referrerName: string
  referrerRole: 'teacher' | 'parent' | 'principal'
  refereeId: string
  refereeName: string
  referralDate: string
  referralCode: string
  rewardAmount: number
  rewardType: 'visit' | 'trial' | 'enrollment'
  status: 'pending' | 'paid' | 'cancelled'
  paidDate?: string
  conversionStage: 'link_clicked' | 'visited' | 'trial_attended' | 'enrolled'
  visitDate?: string
  trialDate?: string
  enrollmentDate?: string
  operations?: Array<{
    operator: string
    action: string
    note: string
    createdAt: string
  }>
}

export interface TeamRankingMember {
  id: string
  name: string
  role: 'teacher' | 'parent' | 'principal'
  avatar: string
  successfulReferrals: number
  totalRewards: number
  conversionRate: number
  comprehensiveScore?: number
  trend: 'up' | 'down' | 'stable'
  trendValue?: string
}

export interface PersonalContribution {
  totalReferrals: number
  referralsTrend: string
  totalRewards: number
  rewardsTrend: string
  conversionRate: number
  conversionTrend: string
  activityScore: number
  activityTrend: string
}

export interface ReferralRecord {
  id: string
  refereeName: string
  referralDate: string
  currentStage: string
  potentialReward: number
  status: 'pending' | 'converted' | 'expired'
}

export interface RewardSettings {
  baseSettings: {
    visitReward: number
    trialReward: number
    enrollmentReward: number
    secondaryRewardRate: number
    tertiaryRewardRate: number
    autoPay: boolean
    minPayAmount: number
  }
  roleMultipliers: {
    teacherMultiplier: number
    parentMultiplier: number
    principalMultiplier: number
  }
}

export interface SettingsHistory {
  operator: string
  changeType: string
  oldValue: string
  newValue: string
  reason: string
  createdAt: string
}