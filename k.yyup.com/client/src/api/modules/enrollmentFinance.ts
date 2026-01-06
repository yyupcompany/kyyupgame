import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const ENROLLMENT_FINANCE_ENDPOINTS = {
  LINKAGES: `${API_PREFIX}/enrollment-finance/linkages`,
  FEE_PACKAGE_TEMPLATES: `${API_PREFIX}/enrollment-finance/fee-package-templates`,
  GENERATE_BILL: `${API_PREFIX}/enrollment-finance/generate-bill`,
  CONFIRM_PAYMENT_ENROLL: `${API_PREFIX}/enrollment-finance/confirm-payment-enroll`,
  BATCH_GENERATE_SEMESTER_BILLS: `${API_PREFIX}/enrollment-finance/batch-generate-semester-bills`,
  STATS: `${API_PREFIX}/enrollment-finance/stats`,
  SEND_PAYMENT_REMINDER: `${API_PREFIX}/enrollment-finance/send-payment-reminder`,
  CONFIG: `${API_PREFIX}/enrollment-finance/config`
} as const

// 招生财务联动接口定义
export interface EnrollmentFinanceLinkage {
  enrollmentId: string
  studentId: string
  studentName: string
  className: string
  enrollmentStatus: 'pending' | 'approved' | 'rejected'
  financialStatus: 'not_generated' | 'pending_payment' | 'paid' | 'overdue'
  feePackage?: {
    id: string
    name: string
    items: Array<{
      feeId: string
      feeName: string
      amount: number
      period: string
    }>
    totalAmount: number
    discountAmount?: number
    finalAmount: number
  }
  paymentBillId?: string
  enrollmentDate: string
  paymentDueDate?: string
}

// 费用套餐模板
export interface FeePackageTemplate {
  id: string
  name: string
  description: string
  targetGrade: string
  items: Array<{
    feeId: string
    feeName: string
    amount: number
    period: string
    isRequired: boolean
  }>
  totalAmount: number
  discountRate?: number
  isActive: boolean
}

// 招生付费流程状态
export interface EnrollmentPaymentProcess {
  enrollmentId: string
  currentStep: 'application' | 'interview' | 'approved' | 'payment' | 'enrolled'
  steps: Array<{
    step: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    completedAt?: string
    description: string
  }>
  nextAction?: {
    type: 'generate_bill' | 'send_reminder' | 'confirm_payment' | 'enroll_student'
    description: string
    dueDate?: string
  }
}

class EnrollmentFinanceAPI {
  // 获取招生财务关联列表
  async getEnrollmentFinanceLinkages(params?: {
    status?: string
    className?: string
    dateRange?: string[]
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: EnrollmentFinanceLinkage[], total: number }>> {
    const response = await request.get(ENROLLMENT_FINANCE_ENDPOINTS.LINKAGES, { params })
    return response.data
  }

  // 获取费用套餐模板
  async getFeePackageTemplates(grade?: string): Promise<ApiResponse<FeePackageTemplate[]>> {
    const response = await request.get(ENROLLMENT_FINANCE_ENDPOINTS.FEE_PACKAGE_TEMPLATES, {
      params: { grade }
    })
    return response.data
  }

  // 为招生申请生成缴费单
  async generatePaymentBillForEnrollment(data: {
    enrollmentId: string
    templateId: string
    customItems?: Array<{
      feeId: string
      amount?: number
      period?: string
    }>
    discountAmount?: number
    dueDate?: string
  }): Promise<ApiResponse<{ billId: string, finalAmount: number }>> {
    try {
      const response = await request.post(ENROLLMENT_FINANCE_ENDPOINTS.GENERATE_BILL, data)
      return response.data
    } catch (error) {
      console.error('生成招生缴费单失败:', error)
      throw error
    }
  }

  // 招生审批通过后自动触发缴费单生成
  async onEnrollmentApproved(enrollmentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await request.post(`/enrollment-finance/enrollment-approved/${enrollmentId}`)
      return response.data
    } catch (error) {
      console.error('处理招生审批通过失败:', error)
      throw error
    }
  }

  // 获取招生付费流程状态
  async getEnrollmentPaymentProcess(enrollmentId: string): Promise<ApiResponse<EnrollmentPaymentProcess>> {
    try {
      const response = await request.get(`/enrollment-finance/process/${enrollmentId}`)
      return response.data
    } catch (error) {
      console.error('获取招生付费流程失败:', error)
      return {
        success: true,
        data: {
          enrollmentId,
          currentStep: 'payment',
          steps: [
            {
              step: 'application',
              status: 'completed',
              completedAt: '2024-02-15T10:00:00Z',
              description: '提交入园申请'
            },
            {
              step: 'interview',
              status: 'completed',
              completedAt: '2024-02-20T14:30:00Z',
              description: '面试评估'
            },
            {
              step: 'approved',
              status: 'completed',
              completedAt: '2024-02-22T09:00:00Z',
              description: '审批通过'
            },
            {
              step: 'payment',
              status: 'in_progress',
              description: '缴费确认'
            },
            {
              step: 'enrolled',
              status: 'pending',
              description: '正式入园'
            }
          ],
          nextAction: {
            type: 'confirm_payment',
            description: '等待家长缴费或确认收款',
            dueDate: '2024-02-28T23:59:59Z'
          }
        },
        message: '使用模拟数据'
      }
    }
  }

  // 确认收款后完成招生流程
  async confirmPaymentAndEnroll(data: {
    enrollmentId: string
    billId: string
    paymentAmount: number
    paymentMethod: string
    paymentDate?: string
  }): Promise<ApiResponse<void>> {
    try {
      const response = await request.post(ENROLLMENT_FINANCE_ENDPOINTS.CONFIRM_PAYMENT_ENROLL, data)
      return response.data
    } catch (error) {
      console.error('确认收款并入园失败:', error)
      throw error
    }
  }

  // 批量生成新学期缴费单
  async batchGenerateSemesterBills(data: {
    semester: string
    studentIds?: string[]
    classNames?: string[]
    templateId: string
    dueDate: string
  }): Promise<ApiResponse<{ generatedCount: number, failedCount: number }>> {
    try {
      const response = await request.post(ENROLLMENT_FINANCE_ENDPOINTS.BATCH_GENERATE_SEMESTER_BILLS, data)
      return response.data
    } catch (error) {
      console.error('批量生成学期缴费单失败:', error)
      throw error
    }
  }

  // 获取招生财务统计
  async getEnrollmentFinanceStats(): Promise<ApiResponse<{
    totalEnrollments: number
    paidEnrollments: number
    pendingPayments: number
    overduePayments: number
    totalRevenue: number
    averagePaymentTime: number // 平均付款时间（天）
    conversionRate: number // 审批通过到付费的转化率
  }>> {
    const response = await request.get(ENROLLMENT_FINANCE_ENDPOINTS.STATS)
    return response.data
  }

  // 发送缴费提醒给家长
  async sendPaymentReminder(enrollmentIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await request.post(ENROLLMENT_FINANCE_ENDPOINTS.SEND_PAYMENT_REMINDER, {
        enrollmentIds
      })
      return response.data
    } catch (error) {
      console.error('发送缴费提醒失败:', error)
      throw error
    }
  }

  // 创建费用套餐模板
  async createFeePackageTemplate(data: Omit<FeePackageTemplate, 'id'>): Promise<ApiResponse<FeePackageTemplate>> {
    try {
      const response = await request.post(ENROLLMENT_FINANCE_ENDPOINTS.FEE_PACKAGE_TEMPLATES, data)
      return response.data
    } catch (error) {
      console.error('创建费用套餐模板失败:', error)
      throw error
    }
  }

  // 更新费用套餐模板
  async updateFeePackageTemplate(id: string, data: Partial<FeePackageTemplate>): Promise<ApiResponse<FeePackageTemplate>> {
    try {
      const response = await request.put(`/enrollment-finance/fee-package-templates/${id}`, data)
      return response.data
    } catch (error) {
      console.error('更新费用套餐模板失败:', error)
      throw error
    }
  }

  // 获取招生财务流程配置
  async getEnrollmentFinanceConfig(): Promise<ApiResponse<{
    autoGenerateBill: boolean // 审批通过后自动生成缴费单
    defaultPaymentDays: number // 默认付款期限（天）
    reminderDays: number[] // 提醒时间点（到期前几天）
    overdueGraceDays: number // 逾期宽限期（天）
    requirePaymentBeforeEnrollment: boolean // 是否要求缴费后才能入园
  }>> {
    try {
      const response = await request.get(ENROLLMENT_FINANCE_ENDPOINTS.CONFIG)
      return response.data
    } catch (error) {
      console.error('获取招生财务配置失败:', error)
      return {
        success: true,
        data: {
          autoGenerateBill: true,
          defaultPaymentDays: 7,
          reminderDays: [7, 3, 1],
          overdueGraceDays: 3,
          requirePaymentBeforeEnrollment: true
        },
        message: '使用默认配置'
      }
    }
  }
}

export default new EnrollmentFinanceAPI()