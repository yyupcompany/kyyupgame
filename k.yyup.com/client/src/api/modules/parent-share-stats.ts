import request from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const PARENT_SHARE_ENDPOINTS = {
  SHARE_STATS: `${API_PREFIX}/parent/share-stats`,
  SHARE_RECORDS: `${API_PREFIX}/parent/share-records`,
  SHARE_RECORD_BY_ID: (id: string) => `${API_PREFIX}/parent/share-records/${id}`,
  SHARE_TO_SOCIAL: `${API_PREFIX}/parent/share-to-social`,
  SHARE_QRCODE: (recordId: string) => `${API_PREFIX}/parent/share-qrcode/${recordId}`,
  SHARE_ANALYTICS: `${API_PREFIX}/parent/share-analytics`,
  SHARE_EXPORT: `${API_PREFIX}/parent/share-export`
} as const

// 分享记录接口
export interface ShareRecord {
  id: number
  title: string
  content?: string
  shareTime: string
  shareCount: number
  viewCount: number
  likeCount: number
  type: 'assessment' | 'game' | 'growth' | 'activity'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// 分享统计数据接口
export interface ShareStats {
  totalShares: number
  totalViews: number
  totalReach: number
  engagementRate: number
  totalLikes: number
  totalComments: number
  shareByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  dailyStats: Array<{
    date: string
    shares: number
    views: number
    likes: number
  }>
}

// 分享筛选参数
export interface ShareListParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string[]
  startDate?: string
  endDate?: string
  status?: string
}

// 分享详情接口
export interface ShareDetail extends ShareRecord {
  shareLink: string
  qrCode: string
  viewers: Array<{
    id: number
    name: string
    avatar: string
    viewTime: string
    duration?: number
    liked: boolean
  }>
  shareHistory: Array<{
    shareTime: string
    platform: string
    channel: string
  }>
}

// API响应包装
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// 分页数据响应
interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const parentShareStatsApi = {
  // 获取分享统计数据
  getShareStats(params?: {
    startDate?: string
    endDate?: string
    type?: string[]
  }): Promise<ApiResponse<ShareStats>> {
    return request.get(PARENT_SHARE_ENDPOINTS.SHARE_STATS, { params })
  },

  // 获取分享记录列表
  getShareRecords(params: ShareListParams): Promise<ApiResponse<PaginatedResponse<ShareRecord>>> {
    return request.get(PARENT_SHARE_ENDPOINTS.SHARE_RECORDS, { params })
  },

  // 获取分享详情
  getShareDetail(id: number): Promise<ApiResponse<ShareDetail>> {
    return request.get(PARENT_SHARE_ENDPOINTS.SHARE_RECORD_BY_ID(`${id}`))
  },

  // 创建分享
  createShare(data: {
    title: string
    content?: string
    type: ShareRecord['type']
    recordId?: number
    attachments?: Array<{
      type: 'image' | 'video' | 'document'
      url: string
      name: string
    }>
  }): Promise<ApiResponse<ShareRecord>> {
    return request.post(PARENT_SHARE_ENDPOINTS.SHARE_RECORDS, data)
  },

  // 更新分享
  updateShare(id: number, data: Partial<ShareRecord>): Promise<ApiResponse<ShareRecord>> {
    return request.put(PARENT_SHARE_ENDPOINTS.SHARE_RECORD_BY_ID(`${id}`), data)
  },

  // 删除分享
  deleteShare(id: number): Promise<ApiResponse<void>> {
    return request.delete(PARENT_SHARE_ENDPOINTS.SHARE_RECORD_BY_ID(`${id}`))
  },

  // 分享到社交平台
  shareToSocial(data: {
    recordId: number
    platform: 'wechat' | 'moments' | 'weibo' | 'qq' | 'link'
    channel?: string
    message?: string
  }): Promise<ApiResponse<{ shareId: string; shareUrl: string }>> {
    return request.post(PARENT_SHARE_ENDPOINTS.SHARE_TO_SOCIAL, data)
  },

  // 获取分享二维码
  getShareQRCode(recordId: number): Promise<ApiResponse<{ qrCode: string; shareUrl: string }>> {
    return request.get(PARENT_SHARE_ENDPOINTS.SHARE_QRCODE(`${recordId}`))
  },

  // 获取分享分析报告
  getShareAnalytics(params: {
    recordId?: number
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<ApiResponse<{
    summary: ShareStats
    trends: Array<{
      date: string
      shares: number
      views: number
      likes: number
      conversion: number
    }>
    topContent: Array<{
      id: number
      title: string
      views: number
      likes: number
      shares: number
    }>
  }>> {
    return request.get(PARENT_SHARE_ENDPOINTS.SHARE_ANALYTICS, { params })
  },

  // 导出分享数据
  exportShareData(params: {
    format: 'excel' | 'csv' | 'pdf'
    startDate?: string
    endDate?: string
    type?: string[]
  }): Promise<Blob> {
    return request.get(PARENT_SHARE_ENDPOINTS.SHARE_EXPORT, {
      params,
      responseType: 'blob'
    }) as any
  }
}

// 分享类型映射
export const SHARE_TYPE_MAP = {
  assessment: '宝宝发育测评',
  game: '脑开发游戏',
  growth: '成长轨迹',
  activity: '活动分享'
} as const

// 分享状态映射
export const SHARE_STATUS_MAP = {
  active: '活跃',
  inactive: '已停用'
} as const

// 平台映射
export const SHARE_PLATFORM_MAP = {
  wechat: '微信',
  moments: '朋友圈',
  weibo: '微博',
  qq: 'QQ',
  link: '链接'
} as const