/**
 * AI招生功能API接口
 */

import { post, get } from '@/utils/request'

export interface SmartPlanningParams {
  parameters?: any
}

export interface ForecastParams {
  timeframe: '1month' | '3months' | '6months' | '1year'
}

export interface StrategyParams {
  objectives: any
}

export interface SimulationParams {
  scenarios: any[]
}

export const enrollmentAIApi = {
  // 智能规划
  generateSmartPlanning: (planId: number, params: SmartPlanningParams = {}) => {
    return post(`/enrollment-ai/plan/${planId}/smart-planning`, params)
  },

  // 招生预测
  generateForecast: (planId: number, params: ForecastParams) => {
    return post(`/enrollment-ai/plan/${planId}/forecast`, params)
  },

  // 招生策略
  generateStrategy: (planId: number, params: StrategyParams) => {
    return post(`/enrollment-ai/plan/${planId}/strategy`, params)
  },

  // 容量优化
  generateOptimization: (planId: number) => {
    return post(`/enrollment-ai/plan/${planId}/optimization`)
  },

  // 招生仿真
  generateSimulation: (planId: number, params: SimulationParams) => {
    return post(`/enrollment-ai/plan/${planId}/simulation`, params)
  },

  // 计划评估
  generateEvaluation: (planId: number) => {
    return post(`/enrollment-ai/plan/${planId}/evaluation`)
  },

  // 趋势分析
  generateTrendAnalysis: (timeRange: string = '3years') => {
    return get(`/enrollment-ai/trends?timeRange=${timeRange}`)
  },

  // 获取AI分析历史
  getAIHistory: (planId: number, params: { type?: string; limit?: number } = {}) => {
    return get(`/enrollment-ai/plan/${planId}/ai-history`, { params })
  },

  // 批量AI分析
  batchAnalysis: (planId: number, analysisTypes: string[]) => {
    return post(`/enrollment-ai/plan/${planId}/batch-analysis`, { analysisTypes })
  },

  // 导出AI报告
  exportReport: (planId: number, format: string = 'json') => {
    return get(`/enrollment-ai/plan/${planId}/export-ai-report?format=${format}`)
  },

  // 检查AI服务状态
  checkStatus: () => {
    return get('/enrollment-ai/ai-status')
  }
}