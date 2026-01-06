/**
 * 活动报名页面API
 */
import request from '@/utils/request'

export interface RegistrationPageConfig {
  activityId?: number
  activityName: string
  posterUrl: string
  includeInfo: string[]
  formFields: string[]
}

export interface RegistrationPageResponse {
  pageId: string
  pageUrl: string
  qrcodeDataUrl: string
  config: any
}

/**
 * 生成活动报名页面
 */
export const generateRegistrationPage = (config: RegistrationPageConfig) => {
  return request.post<RegistrationPageResponse>('/activity-registration-page/generate', config)
}

/**
 * 获取报名页面配置
 */
export const getRegistrationPage = (pageId: string) => {
  return request.get(`/activity-registration-page/${pageId}`)
}

/**
 * 提交报名信息
 */
export const submitRegistration = (pageId: string, data: any) => {
  return request.post(`/activity-registration-page/${pageId}/submit`, data)
}

/**
 * 获取报名统计
 */
export const getRegistrationStats = (pageId: string) => {
  return request.get(`/activity-registration-page/${pageId}/stats`)
}

