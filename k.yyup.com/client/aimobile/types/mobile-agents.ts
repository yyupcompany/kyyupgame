/**
 * 🤖 移动端智能体类型定义
 * 
 * 与后端API完全对应的移动端智能体类型系统
 * 基于现有的Smart Expert和Expert Consultation系统
 * 
 * 重要：所有类型定义都与后端API保持一致，确保数据库兼容性
 */

import type { AgentType, ExpertConsultationType, AgentConfig, MobileAgentConfig } from './mobile-workflow'

// ==================== 基础智能体类型 ====================

export interface MobileAgent {
  id: string
  type: AgentType
  name: string
  description: string
  status: AgentStatus
  capabilities: string[]  // 简化为字符串数组，与后端对应
  config: AgentConfig
  context: AgentContext
  metrics: AgentMetrics
}

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'completed' | 'failed' | 'paused'

// 与后端Smart Expert系统对应的专家定义
export interface SmartExpert {
  id: AgentType
  name: string
  description: string
  capabilities: string[]
  prompt: string
}

// 与后端Expert Consultation系统对应的专家定义
export interface ConsultationExpert {
  type: ExpertConsultationType
  name: string
  description: string
}

// ==================== 移动端专家配置 ====================

// Smart Expert系统的专家配置（与后端EXPERTS对象对应）
export const MOBILE_SMART_EXPERTS: Record<AgentType, SmartExpert> = {
  'activity_planner': {
    id: 'activity_planner',
    name: '活动策划专家',
    description: '专业的幼儿园活动策划专家，擅长设计教育性、趣味性和安全性并重的活动方案',
    capabilities: ['活动方案设计', '教育价值评估', '安全风险控制', '资源配置优化'],
    prompt: '你是资深的幼儿园活动策划专家，拥有10年以上的活动组织经验。请根据需求制定详细的活动方案，重点考虑教育价值、趣味性、安全性和可执行性。'
  },
  'marketing_expert': {
    id: 'marketing_expert',
    name: '招生营销专家',
    description: '专业的教育行业营销专家，擅长招生策略制定和品牌推广',
    capabilities: ['招生策略', '品牌推广', '市场分析', '转化优化'],
    prompt: '你是专业的教育行业营销专家，精通幼儿园招生策略和品牌建设。请根据需求制定有效的营销方案，重点关注目标客户分析、渠道选择和转化优化。'
  },
  'education_expert': {
    id: 'education_expert',
    name: '教育评估专家',
    description: '专业的幼儿教育专家，擅长教育方案评估和课程设计',
    capabilities: ['教育方案评估', '课程设计', '发展评估', '教学质量'],
    prompt: '你是资深的幼儿教育专家，具有丰富的教育理论知识和实践经验。请从教育专业角度分析方案的教育价值和发展适宜性。'
  },
  'cost_analyst': {
    id: 'cost_analyst',
    name: '成本分析专家',
    description: '专业的成本控制和预算管理专家',
    capabilities: ['成本核算', '预算制定', '资源优化', '投入产出分析'],
    prompt: '你是专业的成本分析专家，擅长教育行业的成本控制和预算管理。请从成本效益角度分析方案的可行性和优化建议。'
  },
  'risk_assessor': {
    id: 'risk_assessor',
    name: '风险评估专家',
    description: '专业的风险管理和安全评估专家',
    capabilities: ['风险识别', '安全评估', '应急预案', '合规检查'],
    prompt: '你是专业的风险评估专家，专注于教育活动的安全管理和风险控制。请识别潜在风险并提供防控措施。'
  },
  'creative_designer': {
    id: 'creative_designer',
    name: '创意设计专家',
    description: '专业的创意设计和视觉传达专家',
    capabilities: ['创意设计', '视觉传达', '用户体验', '品牌形象'],
    prompt: '你是专业的创意设计专家，擅长教育行业的视觉设计和创意策划。请从设计和用户体验角度提供创意建议。'
  },
  'curriculum_expert': {
    id: 'curriculum_expert',
    name: '课程教学专家',
    description: '专业的幼儿园课程教学专家，为新老师提供各类课程的专业教学指导',
    capabilities: ['课程设计', '教学方法', '教学技巧', '课堂管理', '教学评估', '新教师指导'],
    prompt: '你是资深的幼儿园课程教学专家，拥有15年以上的一线教学和教师培训经验。你专门为新老师提供专业的教学指导，擅长各年龄段的课程教学方法。'
  }
}

// Expert Consultation系统的专家配置（与后端expertTypes对应）
export const MOBILE_CONSULTATION_EXPERTS: Record<ExpertConsultationType, ConsultationExpert> = {
  'planner': {
    type: 'planner',
    name: '招生策划专家',
    description: '擅长活动策划和品牌营销'
  },
  'psychologist': {
    type: 'psychologist',
    name: '心理学专家',
    description: '专注儿童心理发展和家长需求分析'
  },
  'investor': {
    type: 'investor',
    name: '投资分析专家',
    description: '精通财务规划和成本控制'
  },
  'director': {
    type: 'director',
    name: '园长管理专家',
    description: '拥有丰富的园所运营管理经验'
  },
  'teacher': {
    type: 'teacher',
    name: '执行教师专家',
    description: '熟悉一线教学和活动执行'
  },
  'parent': {
    type: 'parent',
    name: '家长体验专家',
    description: '从用户角度评估活动吸引力'
  }
}

// ==================== 简化的移动端专家接口 ====================

export interface AgentContext {
  sessionId: string
  userId: string
  role: string
  conversationHistory: AgentMessage[]
  workingMemory: Map<string, any>
  preferences: AgentPreferences
  constraints: AgentConstraints
}

export interface AgentPreferences {
  responseStyle: 'concise' | 'detailed' | 'conversational'
  language: string
  expertise_level: 'beginner' | 'intermediate' | 'expert'
  mobile_optimized: boolean
}

export interface AgentConstraints {
  maxResponseLength: number
  timeoutSeconds: number
  memoryLimitMB: number
  networkLimitMB: number
  batteryThreshold: number
}

export interface AgentMetrics {
  totalInteractions: number
  averageResponseTime: number
  successRate: number
  userSatisfaction: number
  memoryUsage: number
  lastActiveTime: number
}

export interface AgentMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: number
  metadata?: AgentMessageMetadata
}

export interface AgentMessageMetadata {
  type: 'text' | 'image' | 'file' | 'action' | 'result'
  confidence?: number
  processing_time?: number
  tokens_used?: number
  tools_called?: string[]
}

// ==================== 与后端API对应的请求和响应类型 ====================

// Smart Expert API请求类型
export interface SmartExpertRequest {
  expert_id: AgentType
  task: string
  context?: string
}

// Smart Expert API响应类型
export interface SmartExpertResponse {
  expert_id: AgentType
  expert_name: string
  task: string
  advice: string
  timestamp: string
  error?: boolean
}

// Expert Consultation API请求类型
export interface ExpertConsultationRequest {
  query: string
  context?: string
  preferences?: {
    expertOrder?: ExpertConsultationType[]
    focusAreas?: string[]
    urgency?: 'low' | 'medium' | 'high'
  }
}

// Expert Consultation API响应类型
export interface ExpertConsultationResponse {
  consultationId: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  experts: ExpertConsultationType[]
  messages: ConsultationMessage[]
}

export interface ConsultationMessage {
  id: string
  expertType: ExpertConsultationType
  content: string
  timestamp: string
  round: number
  order: number
}
