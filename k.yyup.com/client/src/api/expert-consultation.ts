/**
 * AI专家咨询API服务
 */

import requestInstance from '../utils/request'
import { EXPERT_CONSULTATION_ENDPOINTS } from './endpoints'

/**
 * 专家类型枚举
 */
export enum ExpertType {
  INVESTOR = 'investor',
  DIRECTOR = 'director', 
  PLANNER = 'planner',
  TEACHER = 'teacher',
  PARENT = 'parent',
  PSYCHOLOGIST = 'psychologist'
}

/**
 * 问题类型枚举
 */
export enum QueryType {
  RECRUITMENT_ACTIVITY = 'recruitment_activity',
  PARENT_CONVERSION = 'parent_conversion',
  GENERAL = 'general'
}

/**
 * 咨询请求接口
 */
export interface ConsultationRequest {
  query: string
  context?: string
  preferences?: ConsultationPreferences
}

/**
 * 咨询偏好设置
 */
export interface ConsultationPreferences {
  expertOrder?: ExpertType[]
  focusAreas?: string[]
  urgency?: 'low' | 'medium' | 'high'
}

/**
 * 专家发言接口
 */
export interface ExpertSpeech {
  expertType: ExpertType
  expertName: string
  content: string
  keyPoints: string[]
  recommendations: string[]
  timestamp: string
  processingTime: number
}

/**
 * 咨询会话接口
 */
export interface ConsultationSession {
  sessionId: string
  userId: number
  query: string
  queryType: QueryType
  expertOrder: ExpertType[]
  speeches: ExpertSpeech[]
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
  completedAt?: string
}

/**
 * 咨询进度接口
 */
export interface ConsultationProgress {
  sessionId: string
  currentExpert: number
  totalExperts: number
  currentExpertType: ExpertType
  completedExperts: ExpertType[]
  isCompleted: boolean
  estimatedTimeRemaining: number
}

/**
 * 咨询汇总接口
 */
export interface ConsultationSummary {
  sessionId: string
  overallAnalysis: string
  keyInsights: string[]
  consensusPoints: string[]
  conflictingViews: Array<{
    topic: string
    viewpoints: Array<{
      expert: ExpertType
      opinion: string
    }>
  }>
  finalRecommendations: string[]
}

/**
 * 行动计划接口
 */
export interface ActionPlan {
  planId: string
  sessionId: string
  summary: string
  priority: 'high' | 'medium' | 'low'
  tasks: ActionItem[]
  timeline: string
  budget?: BudgetEstimate
  successMetrics: string[]
}

/**
 * 行动项接口
 */
export interface ActionItem {
  id: string
  title: string
  description: string
  responsible: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  dependencies?: string[]
}

/**
 * 预算估算接口
 */
export interface BudgetEstimate {
  total: number
  breakdown: Array<{
    category: string
    amount: number
    description: string
  }>
  currency: string
}

/**
 * 启动专家咨询
 * @param request 咨询请求
 * @returns 咨询会话
 */
export const startConsultation = async (request: ConsultationRequest): Promise<ConsultationSession> => {
  const response = await requestInstance.post(EXPERT_CONSULTATION_ENDPOINTS.START_CONSULTATION, request)
  return response.data
}

/**
 * 获取下一个专家发言
 * @param sessionId 会话ID
 * @returns 专家发言
 */
export const getNextExpertSpeech = async (sessionId: string): Promise<ExpertSpeech> => {
  const response = await requestInstance.get(EXPERT_CONSULTATION_ENDPOINTS.GET_NEXT_SPEECH(sessionId))
  return response.data
}

/**
 * 获取咨询进度
 * @param sessionId 会话ID
 * @returns 咨询进度
 */
export const getConsultationProgress = async (sessionId: string): Promise<ConsultationProgress> => {
  const response = await requestInstance.get(EXPERT_CONSULTATION_ENDPOINTS.GET_PROGRESS(sessionId))
  return response.data
}

/**
 * 获取咨询汇总
 * @param sessionId 会话ID
 * @returns 咨询汇总
 */
export const getConsultationSummary = async (sessionId: string): Promise<ConsultationSummary> => {
  const response = await requestInstance.get(EXPERT_CONSULTATION_ENDPOINTS.GET_SUMMARY(sessionId))
  return response.data
}

/**
 * 生成行动计划
 * @param sessionId 会话ID
 * @returns 行动计划
 */
export const generateActionPlan = async (sessionId: string): Promise<ActionPlan> => {
  const response = await requestInstance.post(EXPERT_CONSULTATION_ENDPOINTS.GENERATE_ACTION_PLAN(sessionId))
  return response.data
}

/**
 * 获取咨询会话详情
 * @param sessionId 会话ID
 * @returns 咨询会话
 */
export const getConsultationSession = async (sessionId: string): Promise<ConsultationSession> => {
  const response = await requestInstance.get(EXPERT_CONSULTATION_ENDPOINTS.GET_SESSION(sessionId))
  return response.data
}

/**
 * AI专家咨询API服务
 */
export const expertConsultationApi = {
  startConsultation,
  getNextExpertSpeech,
  getConsultationProgress,
  getConsultationSummary,
  generateActionPlan,
  getConsultationSession
}