import request from '@/utils/request'

export interface StartAssessmentParams {
  childName: string
  childAge: number
  childGender?: 'male' | 'female'
  phone?: string
}

export interface SubmitAnswerParams {
  recordId: number
  questionId: number
  answer: any
  timeSpent?: number
}

export interface AssessmentRecord {
  id: number
  recordNo: string
  childName: string
  childAge: number
  childGender?: 'male' | 'female'
  status: 'in_progress' | 'completed' | 'cancelled'
  totalScore?: number
  maxScore?: number
  developmentQuotient?: number
  createdAt: string
}

export interface AssessmentReport {
  id: number
  recordId: number
  reportNo: string
  content: any
  qrCodeUrl?: string
  shareUrl?: string
  viewCount: number
}

export const assessmentApi = {
  // 开始测评
  startAssessment(params: StartAssessmentParams) {
    return request.post<{ data: AssessmentRecord }>('/api/assessment/start', params)
  },

  // 获取题目列表
  getQuestions(configId: number, ageGroup: string, dimension?: string) {
    return request.get('/api/assessment/questions', {
      params: { configId, ageGroup, dimension }
    })
  },

  // 提交答案
  submitAnswer(params: SubmitAnswerParams) {
    return request.post('/api/assessment/answer', params)
  },

  // 完成测评
  completeAssessment(recordId: number) {
    return request.post<{ data: AssessmentRecord }>(`/api/assessment/${recordId}/complete`)
  },

  // 获取测评记录
  getRecord(recordId: number) {
    return request.get<{ data: AssessmentRecord }>(`/api/assessment/record/${recordId}`)
  },

  // 获取报告
  getReport(recordId: number) {
    return request.get<{ data: AssessmentReport }>(`/api/assessment/report/${recordId}`)
  },

  // 获取我的测评记录列表
  getMyRecords(params?: { page?: number; pageSize?: number; phone?: string }) {
    return request.get('/api/assessment/my-records', { params })
  },

  // 获取成长轨迹
  getGrowthTrajectory(params?: {
    childName?: string
    studentId?: number
    phone?: string
    limit?: number
  }) {
    return request.get('/api/assessment/growth-trajectory', { params })
  }
}

