import request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

/**
 * 活动海报管理API
 * 完善活动→海报→营销功能→预览发布→一键转发的完整链路
 */

// API端点常量
export const ACTIVITY_POSTER_ENDPOINTS = {
  GENERATE: (id: number | string) => `${API_PREFIX}/activities/${id}/poster/generate`,
  GET_POSTERS: (id: number | string) => `${API_PREFIX}/activities/${id}/posters`,
  PREVIEW: (id: number | string) => `${API_PREFIX}/activities/${id}/poster/preview`,
  PUBLISH: (id: number | string) => `${API_PREFIX}/activities/${id}/publish`,
  SHARE: (id: number | string) => `${API_PREFIX}/activities/${id}/share`,
  SHARE_STATS: (id: number | string) => `${API_PREFIX}/activities/${id}/share/stats`,
  INCREMENT_VIEWS: (id: number | string) => `${API_PREFIX}/activities/${id}/view`,
  QRCODE: (id: number | string) => `${API_PREFIX}/activities/${id}/qrcode`,
} as const

// 类型定义
export interface ActivityPosterData {
  activityId: number
  posterId: number
  posterType: 'main' | 'share' | 'detail' | 'preview'
  isActive: boolean
}

export interface PosterGenerateData {
  posterType?: 'main' | 'share' | 'detail' | 'preview'
  marketingConfig?: any
  templateId?: number
  customContent?: any
}

export interface ShareData {
  shareChannel: 'wechat' | 'weibo' | 'qq' | 'link' | 'qrcode' | 'other'
  posterId?: number
  customMessage?: string
}

export interface PublishData {
  publishChannels?: string[]
}

export interface ShareStats {
  shareChannel: string
  count: number
}

export interface ActivityShareResponse {
  shareContent: {
    title: string
    description: string
    imageUrl: string
    url: string
    customMessage?: string
  }
  shareUrl: string
  shareId: number
  message: string
}

/**
 * 为活动生成海报
 */
export function generateActivityPoster(
  activityId: number,
  data: PosterGenerateData
): Promise<ApiResponse<any>> {
  return request.post(ACTIVITY_POSTER_ENDPOINTS.GENERATE(activityId), data)
}

/**
 * 获取活动的所有海报
 */
export function getActivityPosters(activityId: number): Promise<ApiResponse<ActivityPosterData[]>> {
  return request.get(ACTIVITY_POSTER_ENDPOINTS.GET_POSTERS(activityId))
}

/**
 * 预览活动海报
 */
export function previewActivityPoster(
  activityId: number,
  posterType: string = 'main'
): Promise<ApiResponse<any>> {
  return request.get(ACTIVITY_POSTER_ENDPOINTS.PREVIEW(activityId), {
    params: { posterType }
  })
}

/**
 * 发布活动和海报
 */
export function publishActivity(
  activityId: number,
  data: PublishData = {}
): Promise<ApiResponse<any>> {
  return request.put(ACTIVITY_POSTER_ENDPOINTS.PUBLISH(activityId), data)
}

/**
 * 一键转发分享
 */
export function shareActivity(
  activityId: number,
  data: ShareData
): Promise<ApiResponse<ActivityShareResponse>> {
  return request.post(ACTIVITY_POSTER_ENDPOINTS.SHARE(activityId), data)
}

/**
 * 获取活动分享统计
 */
export function getActivityShareStats(activityId: number): Promise<ApiResponse<{
  activity: {
    id: number
    title: string
    shareCount: number
    viewCount: number
  }
  shareStats: ShareStats[]
  totalShares: number
  totalViews: number
}>> {
  return request.get(ACTIVITY_POSTER_ENDPOINTS.SHARE_STATS(activityId))
}

/**
 * 更新活动浏览次数
 */
export function incrementActivityViews(activityId: number): Promise<ApiResponse<any>> {
  return request.post(ACTIVITY_POSTER_ENDPOINTS.INCREMENT_VIEWS(activityId))
}

/**
 * 生成活动二维码
 */
export function generateActivityQRCode(activityId: number): Promise<ApiResponse<{
  qrCodeUrl: string
  shareUrl: string
}>> {
  return request.get(ACTIVITY_POSTER_ENDPOINTS.QRCODE(activityId))
}

/**
 * 复制分享链接到剪贴板
 */
export async function copyShareLink(shareUrl: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('复制链接失败:', error)
    return false
  }
}

/**
 * 打开分享窗口
 */
export function openShareWindow(url: string, title: string = '分享'): void {
  const width = 600
  const height = 400
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  )
}

/**
 * 生成微信分享链接
 */
export function generateWeChatShareUrl(shareUrl: string, title: string, description: string): string {
  const params = new URLSearchParams({
    url: shareUrl,
    title,
    desc: description,
    summary: description
  })
  return `https://api.weixin.qq.com/cgi-bin/message/custom/send?${params.toString()}`
}

/**
 * 生成微博分享链接
 */
export function generateWeiboShareUrl(shareUrl: string, title: string): string {
  const params = new URLSearchParams({
    url: shareUrl,
    title,
    source: '幼儿园招生管理系统',
    sourceUrl: window.location.origin
  })
  return `https://service.weibo.com/share/share.php?${params.toString()}`
}

/**
 * 生成QQ分享链接
 */
export function generateQQShareUrl(shareUrl: string, title: string, description: string): string {
  const params = new URLSearchParams({
    url: shareUrl,
    title,
    desc: description,
    summary: description,
    site: '幼儿园招生管理系统'
  })
  return `https://connect.qq.com/widget/shareqq/index.html?${params.toString()}`
}

/**
 * 格式化分享数据
 */
export function formatShareData(activity: any, shareChannel: string): ShareData {
  return {
    shareChannel: shareChannel as any,
    posterId: activity.posterId,
    customMessage: `精彩活动推荐：${activity.title}，欢迎参与！`
  }
}

/**
 * 获取分享渠道图标
 */
export function getShareChannelIcon(channel: string): string {
  const icons: Record<string, string> = {
    wechat: '💬',
    weibo: '📱',
    qq: '🐧',
    link: '🔗',
    qrcode: '📱',
    other: '📤'
  }
  return icons[channel] || '📤'
}

/**
 * 获取分享渠道名称
 */
export function getShareChannelName(channel: string): string {
  const names: Record<string, string> = {
    wechat: '微信',
    weibo: '微博',
    qq: 'QQ',
    link: '复制链接',
    qrcode: '二维码',
    other: '其他'
  }
  return names[channel] || '其他'
}
