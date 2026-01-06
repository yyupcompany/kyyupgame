/**
 * 营销管理相关API端点
 */
import { API_PREFIX } from './base';

// 营销活动接口
export const MARKETING_CAMPAIGN_ENDPOINTS = {
  BASE: `${API_PREFIX}marketing-campaigns`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}`,
  LAUNCH: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}/launch`,
  PAUSE: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}/pause`,
  RESUME: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}/resume`,
  STOP: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}/stop`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}/performance`,
  ANALYTICS: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}/analytics`,
  DUPLICATE: (id: number | string) => `${API_PREFIX}marketing-campaigns/${id}/duplicate`,
  EXPORT: `${API_PREFIX}marketing-campaigns/export`,
  TEMPLATES: `${API_PREFIX}marketing-campaigns/templates`,
} as const;

// 渠道追踪接口
export const CHANNEL_TRACKING_ENDPOINTS = {
  BASE: `${API_PREFIX}channel-tracking`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}channel-tracking/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}channel-tracking/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}channel-tracking/${id}`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}channel-tracking/${id}/performance`,
  STATISTICS: `${API_PREFIX}channel-tracking/statistics`,
  ANALYSIS: `${API_PREFIX}channel-tracking/analysis`,
  ATTRIBUTION: `${API_PREFIX}channel-tracking/attribution`,
  FUNNEL: `${API_PREFIX}channel-tracking/funnel`,
  ROI: `${API_PREFIX}channel-tracking/roi`,
  TRENDS: `${API_PREFIX}channel-tracking/trends`,
  EXPORT: `${API_PREFIX}channel-tracking/export`,
} as const;

// 转化追踪接口
export const CONVERSION_TRACKING_ENDPOINTS = {
  BASE: `${API_PREFIX}conversion-tracking`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}conversion-tracking/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}conversion-tracking/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}conversion-tracking/${id}`,
  EVENTS: `${API_PREFIX}conversion-tracking/events`,
  GOALS: `${API_PREFIX}conversion-tracking/goals`,
  FUNNEL: `${API_PREFIX}conversion-tracking/funnel`,
  ATTRIBUTION: `${API_PREFIX}conversion-tracking/attribution`,
  PATH_ANALYSIS: `${API_PREFIX}conversion-tracking/path-analysis`,
  COHORT_ANALYSIS: `${API_PREFIX}conversion-tracking/cohort-analysis`,
  EXPORT: `${API_PREFIX}conversion-tracking/export`,
} as const;

// 广告管理接口
export const ADVERTISEMENT_ENDPOINTS = {
  BASE: `${API_PREFIX}advertisements`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}advertisements/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}advertisements/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}advertisements/${id}`,
  PUBLISH: (id: number | string) => `${API_PREFIX}advertisements/${id}/publish`,
  UNPUBLISH: (id: number | string) => `${API_PREFIX}advertisements/${id}/unpublish`,
  SCHEDULE: (id: number | string) => `${API_PREFIX}advertisements/${id}/schedule`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}advertisements/${id}/performance`,
  ANALYTICS: (id: number | string) => `${API_PREFIX}advertisements/${id}/analytics`,
  PREVIEW: (id: number | string) => `${API_PREFIX}advertisements/${id}/preview`,
  DUPLICATE: (id: number | string) => `${API_PREFIX}advertisements/${id}/duplicate`,
  EXPORT: `${API_PREFIX}advertisements/export`,
  POSITIONS: `${API_PREFIX}advertisements/positions`,
  CATEGORIES: `${API_PREFIX}advertisements/categories`,
} as const;

// 海报管理接口
export const POSTER_ENDPOINTS = {
  BASE: `${API_PREFIX}posters`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}posters/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}posters/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}posters/${id}`,
  GENERATE: `${API_PREFIX}posters/generate`,
  TEMPLATES: `${API_PREFIX}posters/templates`,
  EDITOR: `${API_PREFIX}posters/editor`,
  PREVIEW: (id: number | string) => `${API_PREFIX}posters/${id}/preview`,
  DOWNLOAD: (id: number | string) => `${API_PREFIX}posters/${id}/download`,
  SHARE: (id: number | string) => `${API_PREFIX}posters/${id}/share`,
  ANALYTICS: (id: number | string) => `${API_PREFIX}posters/${id}/analytics`,
  EXPORT: `${API_PREFIX}posters/export`,
} as const;

// 海报模板接口
export const POSTER_TEMPLATE_ENDPOINTS = {
  BASE: `${API_PREFIX}poster-templates`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}poster-templates/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}poster-templates/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}poster-templates/${id}`,
  CATEGORIES: `${API_PREFIX}poster-templates/categories`,
  POPULAR: `${API_PREFIX}poster-templates/popular`,
  RECENT: `${API_PREFIX}poster-templates/recent`,
  SEARCH: `${API_PREFIX}poster-templates/search`,
  PREVIEW: (id: number | string) => `${API_PREFIX}poster-templates/${id}/preview`,
  CLONE: (id: number | string) => `${API_PREFIX}poster-templates/${id}/clone`,
  EXPORT: `${API_PREFIX}poster-templates/export`,
} as const;

// 营销分析接口
export const MARKETING_ANALYSIS_ENDPOINTS = {
  BASE: `${API_PREFIX}marketing-analysis`,
  OVERVIEW: `${API_PREFIX}marketing-analysis/overview`,
  CAMPAIGN_PERFORMANCE: `${API_PREFIX}marketing-analysis/campaign-performance`,
  CHANNEL_PERFORMANCE: `${API_PREFIX}marketing-analysis/channel-performance`,
  CONVERSION_ANALYSIS: `${API_PREFIX}marketing-analysis/conversion-analysis`,
  CUSTOMER_JOURNEY: `${API_PREFIX}marketing-analysis/customer-journey`,
  ATTRIBUTION: `${API_PREFIX}marketing-analysis/attribution`,
  ROI_ANALYSIS: `${API_PREFIX}marketing-analysis/roi-analysis`,
  BUDGET_OPTIMIZATION: `${API_PREFIX}marketing-analysis/budget-optimization`,
  FORECAST: `${API_PREFIX}marketing-analysis/forecast`,
  RECOMMENDATIONS: `${API_PREFIX}marketing-analysis/recommendations`,
  EXPORT: `${API_PREFIX}marketing-analysis/export`,
} as const;

// 营销自动化接口
export const MARKETING_AUTOMATION_ENDPOINTS = {
  BASE: `${API_PREFIX}marketing-automation`,
  WORKFLOWS: `${API_PREFIX}marketing-automation/workflows`,
  TRIGGERS: `${API_PREFIX}marketing-automation/triggers`,
  ACTIONS: `${API_PREFIX}marketing-automation/actions`,
  TEMPLATES: `${API_PREFIX}marketing-automation/templates`,
  SCHEDULES: `${API_PREFIX}marketing-automation/schedules`,
  PERFORMANCE: `${API_PREFIX}marketing-automation/performance`,
  LOGS: `${API_PREFIX}marketing-automation/logs`,
  TESTING: `${API_PREFIX}marketing-automation/testing`,
  EXPORT: `${API_PREFIX}marketing-automation/export`,
} as const;