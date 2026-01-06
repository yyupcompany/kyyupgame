import request from '@/utils/request'

export interface AssessmentConfig {
  id?: number
  name: string
  description?: string
  minAge: number
  maxAge: number
  dimensions: string[]
  status: 'active' | 'inactive'
}

export interface AssessmentQuestion {
  id?: number
  configId: number
  dimension: string
  ageGroup: string
  questionType: 'qa' | 'game' | 'interactive'
  title: string
  content: any
  gameConfig?: any
  difficulty: number
  score: number
  sortOrder: number
  status: 'active' | 'inactive'
}

export interface PhysicalTrainingItem {
  id?: number
  name: string
  description?: string
  category: string
  minAge: number
  maxAge: number
  instruction: string
  scoringCriteria: any
  mediaUrl?: string
  status: 'active' | 'inactive'
  sortOrder: number
}

export const assessmentAdminApi = {
  // 配置管理
  getConfigs(params?: { page?: number; pageSize?: number; status?: string }) {
    return request.get('/api/assessment-admin/configs', { params })
  },

  createConfig(data: AssessmentConfig) {
    return request.post('/api/assessment-admin/configs', data)
  },

  updateConfig(id: number, data: Partial<AssessmentConfig>) {
    return request.put(`/api/assessment-admin/configs/${id}`, data)
  },

  deleteConfig(id: number) {
    return request.delete(`/api/assessment-admin/configs/${id}`)
  },

  // 题目管理
  getQuestions(params?: { page?: number; pageSize?: number; configId?: number; dimension?: string; ageGroup?: string; status?: string }) {
    return request.get('/api/assessment-admin/questions', { params })
  },

  createQuestion(data: AssessmentQuestion) {
    return request.post('/api/assessment-admin/questions', data)
  },

  updateQuestion(id: number, data: Partial<AssessmentQuestion>) {
    return request.put(`/api/assessment-admin/questions/${id}`, data)
  },

  deleteQuestion(id: number) {
    return request.delete(`/api/assessment-admin/questions/${id}`)
  },

  // 统计
  getStats() {
    return request.get('/api/assessment-admin/stats')
  },

  // 体能项目管理
  getPhysicalItems(params?: { page?: number; pageSize?: number; category?: string; status?: string }) {
    return request.get('/api/assessment-admin/physical-items', { params })
  },

  createPhysicalItem(data: PhysicalTrainingItem) {
    return request.post('/api/assessment-admin/physical-items', data)
  },

  updatePhysicalItem(id: number, data: Partial<PhysicalTrainingItem>) {
    return request.put(`/api/assessment-admin/physical-items/${id}`, data)
  },

  deletePhysicalItem(id: number) {
    return request.delete(`/api/assessment-admin/physical-items/${id}`)
  },

  // AI生成题目配图（通过 AIBridge 统计用量）
  generateImage(data: { prompt: string; questionId?: number }) {
    return request.post('/api/assessment-admin/generate-image', data)
  }
}

