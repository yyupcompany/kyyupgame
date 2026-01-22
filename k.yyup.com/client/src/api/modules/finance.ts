import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const FINANCE_ENDPOINTS = {
  // 概览
  OVERVIEW: `${API_PREFIX}/finance/overview`,
  TODAY_PAYMENTS: `${API_PREFIX}/finance/today-payments`,
  SEND_REMINDER: `${API_PREFIX}/finance/send-reminder`,

  // 收款管理
  PAYMENT_RECORDS: `${API_PREFIX}/finance/payment/records`,
  CONFIRM_PAYMENT: (id: string) => `${API_PREFIX}/finance/payment/records/${id}/confirm`,
  BANK_TRANSACTIONS: `${API_PREFIX}/finance/payment/bank-transactions`,
  RECONCILE_BANK: `${API_PREFIX}/finance/payment/reconcile-bank`,
  CUSTOMER_CREDITS: `${API_PREFIX}/finance/payment/customer-credits`,
  PAYMENT_STATISTICS: `${API_PREFIX}/finance/payment/statistics`,

  // 支出管理
  EXPENSE_RECORDS: `${API_PREFIX}/finance/expense/records`,
  APPROVE_EXPENSE: (id: string) => `${API_PREFIX}/finance/expense/records/${id}/approve`,
  PAY_EXPENSE: (id: string) => `${API_PREFIX}/finance/expense/records/${id}/pay`,
  SUPPLIERS: `${API_PREFIX}/finance/expense/suppliers`,
  EXPENSE_STATISTICS: `${API_PREFIX}/finance/expense/statistics`,

  // 预算管理
  BUDGET_ITEMS: `${API_PREFIX}/finance/budget/items`,
  UPDATE_BUDGET: (id: string) => `${API_PREFIX}/finance/budget/items/${id}`,
  BUDGET_ADJUSTMENTS: `${API_PREFIX}/finance/budget/adjustments`,
  APPROVE_BUDGET_ADJUSTMENT: (id: string) => `${API_PREFIX}/finance/budget/adjustments/${id}/approve`,
  BUDGET_OVERVIEW: `${API_PREFIX}/finance/budget/overview`,

  // 收费项目和缴费单
  FEE_ITEMS: `${API_PREFIX}/finance/fee-items`,
  PAYMENT_BILLS: `${API_PREFIX}/finance/payment-bills`,
  PAY_BILL: (id: string) => `${API_PREFIX}/finance/payment-bills/${id}/pay`,
  PAYMENT_RECORDS_LIST: `${API_PREFIX}/finance/payment-records`,

  // 退费管理
  REFUND_APPLICATIONS: `${API_PREFIX}/finance/refund-applications`,
  PROCESS_REFUND: (id: string) => `${API_PREFIX}/finance/refund-applications/${id}`,

  // 财务报表
  REPORTS: `${API_PREFIX}/finance/reports`,
  REPORTS_ALL: `${API_PREFIX}/finance/reports/all`,
  EXPORT_REPORT: (id: string) => `${API_PREFIX}/finance/reports/${id}/export`,
  REPORTS_GENERATE: `${API_PREFIX}/finance/reports/generate`,
  CUSTOM_REPORTS: `${API_PREFIX}/finance/reports/custom`,
  COPY_REPORT: (id: string) => `${API_PREFIX}/finance/reports/${id}/copy`,
  DELETE_REPORT: (id: string) => `${API_PREFIX}/finance/reports/${id}`,
  DOWNLOAD_REPORT: (id: string) => `${API_PREFIX}/finance/reports/${id}/download`,
  REGENERATE_REPORT: (id: string) => `${API_PREFIX}/finance/reports/${id}/regenerate`,
  REVOKE_SHARE: (id: string) => `${API_PREFIX}/finance/reports/shares/${id}`,

  // 财务分析
  ANALYTICS: `${API_PREFIX}/finance/analytics`,
  EXPORT_ANALYTICS: `${API_PREFIX}/finance/analytics/export`,

  // 财务预测
  FORECAST: `${API_PREFIX}/finance/forecast`,
  FORECAST_GENERATE: `${API_PREFIX}/finance/forecast/generate`,
  FORECAST_CONFIGS: `${API_PREFIX}/finance/forecast/configs`,
  UPDATE_FORECAST_CONFIG: (id: string) => `${API_PREFIX}/finance/forecast/configs/${id}`,
  DELETE_FORECAST_CONFIG: (id: string) => `${API_PREFIX}/finance/forecast/configs/${id}`,
  FORECAST_HISTORY: `${API_PREFIX}/finance/forecast/history`,
  FORECAST_REPORTS: `${API_PREFIX}/finance/forecast/reports`,
  FORECAST_REPORTS_GENERATE: `${API_PREFIX}/finance/forecast/reports/generate`
} as const

// 财务概览数据接口
export interface FinanceOverview {
  monthlyRevenue: number
  revenueGrowth: number
  pendingAmount: number
  pendingCount: number
  collectionRate: number
  paidCount: number
  totalCount: number
  overdueAmount: number
  overdueCount: number
}

// 收费项目接口
export interface FeeItem {
  id: string
  name: string
  category: string
  amount: number
  period: string
  isRequired: boolean
  description?: string
  status: 'active' | 'inactive'
}

// 收费套餐接口
export interface FeePackage {
  id: string
  name: string
  description: string
  items: FeeItem[]
  totalAmount: number
  discountRate?: number
  finalAmount: number
  validPeriod: string
  status: 'active' | 'inactive'
}

// 缴费单接口
export interface PaymentBill {
  id: string
  billNo: string
  studentId: string
  studentName: string
  className: string
  items: {
    feeId: string
    feeName: string
    amount: number
    period: string
  }[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  createdAt: string
  paidAt?: string
  paymentMethod?: string
}

// 缴费记录接口
export interface PaymentRecord {
  id: string
  billId?: string
  date?: string
  studentId?: string
  studentName?: string
  feeType?: string
  amount: number
  period?: string
  paymentMethod?: string
  method?: 'cash' | 'bank_transfer' | 'wechat' | 'alipay' | 'credit_card'
  paidAt?: string
  status: 'pending' | 'paid' | 'refunded' | 'cancelled' | 'partial_refund'
  receipt?: string
  customer?: string
  customerId?: string
  remark?: string
  receiptUrl?: string
  createdAt?: string
  confirmedAt?: string
}

// 退费申请接口
export interface RefundApplication {
  id: string
  studentId: string
  studentName: string
  feeType: string
  originalAmount: number
  refundAmount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  appliedAt: string
  processedAt?: string
  processedBy?: string
  remarks?: string
}

// 财务报表接口
export interface FinancialReport {
  id: string
  name: string
  type: string
  period: {
    start: string
    end: string
  }
  data: {
    totalRevenue: number
    totalRefund: number
    netRevenue: number
    collectionRate: number
    overdueRate: number
    monthlyTrend: Array<{
      month: string
      revenue: number
      refund: number
      net: number
    }>
    categoryBreakdown: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }
  generatedAt: string
}

// 银行流水接口
export interface BankTransaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  description: string
  bankName: string
  accountNumber: string
  transactionId: string
  matchedPaymentId?: string
  isMatched: boolean
  createdAt: string
}

// 客户信用信息接口
export interface CustomerCredit {
  id: string
  customerId: string
  customerName: string
  creditRating: 'A' | 'B' | 'C' | 'D'
  creditLimit: number
  currentDebt: number
  overdueAmount: number
  paymentHistory: number
  lastPaymentDate?: string
  warningLevel: 'normal' | 'warning' | 'danger'
}

// 支出记录接口
export interface ExpenseRecord {
  id: string
  date: string
  amount: number
  category: 'salary' | 'rent' | 'utilities' | 'materials' | 'equipment' | 'other'
  categoryName: string
  supplier?: string
  supplierId?: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  description: string
  invoiceUrl?: string
  approver?: string
  approvedAt?: string
  paidAt?: string
  createdBy: string
  createdAt: string
}

// 供应商接口
export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  businessLicense: string
  bankAccount: string
  totalAmount: number
  contractCount: number
  status: 'active' | 'inactive'
  createdAt: string
}

// 预算项目接口
export interface BudgetItem {
  id: string
  name: string
  category: string
  department?: string
  project?: string
  totalBudget: number
  usedAmount: number
  remainingAmount: number
  usageRate: number
  period: {
    start: string
    end: string
  }
  status: 'active' | 'completed' | 'suspended'
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 预算调整记录接口
export interface BudgetAdjustment {
  id: string
  budgetId: string
  type: 'increase' | 'decrease'
  amount: number
  reason: string
  originalAmount: number
  newAmount: number
  status: 'pending' | 'approved' | 'rejected'
  applicant: string
  approver?: string
  appliedAt: string
  approvedAt?: string
}

class FinanceAPI {
  // 获取财务概览
  async getOverview(): Promise<ApiResponse<FinanceOverview>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.OVERVIEW)
      return response.data
    } catch (error) {
      console.error('获取财务概览失败:', error)
      throw error
    }
  }

  // ========== 收款管理相关API ==========

  // 获取收款记录列表
  async getPaymentRecords(params?: {
    customerId?: string
    status?: string
    method?: string
    dateRange?: string[]
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: PaymentRecord[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.PAYMENT_RECORDS, { params })
      return response.data
    } catch (error) {
      console.error('获取收款记录失败:', error)
      throw error
    }
  }

  // 创建收款记录
  async createPaymentRecord(data: {
    customerId: string
    amount: number
    method: string
    remark?: string
  }): Promise<ApiResponse<PaymentRecord>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.PAYMENT_RECORDS, data)
      return response.data
    } catch (error) {
      console.error('创建收款记录失败:', error)
      throw error
    }
  }

  // 确认收款
  async confirmPayment(paymentId: string, data: {
    receiptUrl?: string
  }): Promise<ApiResponse<PaymentRecord>> {
    try {
      const response = await request.put(FINANCE_ENDPOINTS.CONFIRM_PAYMENT(paymentId), data)
      return response.data
    } catch (error) {
      console.error('确认收款失败:', error)
      throw error
    }
  }

  // 获取银行流水
  async getBankTransactions(params?: {
    bankName?: string
    isMatched?: boolean
    dateRange?: string[]
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: BankTransaction[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.BANK_TRANSACTIONS, { params })
      return response.data
    } catch (error) {
      console.error('获取银行流水失败:', error)
      throw error
    }
  }

  // 银行对账
  async reconcileBank(transactionIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.RECONCILE_BANK, { transactionIds })
      return response.data
    } catch (error) {
      console.error('银行对账失败:', error)
      throw error
    }
  }

  // 获取客户信用信息
  async getCustomerCredits(params?: {
    warningLevel?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: CustomerCredit[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.CUSTOMER_CREDITS, { params })
      return response.data
    } catch (error) {
      console.error('获取客户信用信息失败:', error)
      throw error
    }
  }

  // 获取收款统计数据
  async getPaymentStatistics(params?: {
    period: 'daily' | 'monthly' | 'yearly'
    dateRange?: string[]
  }): Promise<ApiResponse<{
    totalAmount: number
    totalCount: number
    methodStats: Array<{ method: string, amount: number, count: number }>
    trendData: Array<{ date: string, amount: number }>
  }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.PAYMENT_STATISTICS, { params })
      return response.data
    } catch (error) {
      console.error('获取收款统计失败:', error)
      throw error
    }
  }

  // ========== 支出管理相关API ==========

  // 获取支出记录列表
  async getExpenseRecords(params?: {
    category?: string
    status?: string
    supplierId?: string
    approvalStatus?: string
    dateRange?: string[]
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: ExpenseRecord[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.EXPENSE_RECORDS, { params })
      return response.data
    } catch (error) {
      console.error('获取支出记录失败:', error)
      throw error
    }
  }

  // 创建支出申请
  async createExpenseRecord(data: {
    amount: number
    category: string
    supplier?: string
    description: string
    invoiceUrl?: string
  }): Promise<ApiResponse<ExpenseRecord>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.EXPENSE_RECORDS, data)
      return response.data
    } catch (error) {
      console.error('创建支出申请失败:', error)
      throw error
    }
  }

  // 审批支出申请
  async approveExpenseRecord(expenseId: string, data: {
    status: 'approved' | 'rejected'
    remark?: string
  }): Promise<ApiResponse<ExpenseRecord>> {
    try {
      const response = await request.put(FINANCE_ENDPOINTS.APPROVE_EXPENSE(expenseId), data)
      return response.data
    } catch (error) {
      console.error('审批支出申请失败:', error)
      throw error
    }
  }

  // 支付出资
  async payExpenseRecord(expenseId: string, data: {
    paymentMethod: string
    receiptUrl?: string
  }): Promise<ApiResponse<ExpenseRecord>> {
    try {
      const response = await request.put(FINANCE_ENDPOINTS.PAY_EXPENSE(expenseId), data)
      return response.data
    } catch (error) {
      console.error('支出付款失败:', error)
      throw error
    }
  }

  // 获取供应商列表
  async getSuppliers(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: Supplier[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.SUPPLIERS, { params })
      return response.data
    } catch (error) {
      console.error('获取供应商列表失败:', error)
      throw error
    }
  }

  // 获取支出统计数据
  async getExpenseStatistics(params?: {
    period: 'daily' | 'monthly' | 'yearly'
    dateRange?: string[]
    category?: string
  }): Promise<ApiResponse<{
    totalAmount: number
    totalCount: number
    categoryStats: Array<{ category: string, amount: number, count: number }>
    trendData: Array<{ date: string, amount: number }>
  }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.EXPENSE_STATISTICS, { params })
      return response.data
    } catch (error) {
      console.error('获取支出统计失败:', error)
      throw error
    }
  }

  // ========== 预算管理相关API ==========

  // 获取预算项目列表
  async getBudgetItems(params?: {
    department?: string
    category?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: BudgetItem[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.BUDGET_ITEMS, { params })
      return response.data
    } catch (error) {
      console.error('获取预算项目失败:', error)
      throw error
    }
  }

  // 创建预算项目
  async createBudgetItem(data: {
    name: string
    category: string
    department?: string
    project?: string
    totalBudget: number
    period: { start: string, end: string }
  }): Promise<ApiResponse<BudgetItem>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.BUDGET_ITEMS, data)
      return response.data
    } catch (error) {
      console.error('创建预算项目失败:', error)
      throw error
    }
  }

  // 更新预算项目
  async updateBudgetItem(budgetId: string, data: {
    name?: string
    totalBudget?: number
    status?: string
  }): Promise<ApiResponse<BudgetItem>> {
    try {
      const response = await request.put(FINANCE_ENDPOINTS.UPDATE_BUDGET(budgetId), data)
      return response.data
    } catch (error) {
      console.error('更新预算项目失败:', error)
      throw error
    }
  }

  // 获取预算调整记录
  async getBudgetAdjustments(params?: {
    budgetId?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: BudgetAdjustment[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.BUDGET_ADJUSTMENTS, { params })
      return response.data
    } catch (error) {
      console.error('获取预算调整记录失败:', error)
      throw error
    }
  }

  // 申请预算调整
  async applyBudgetAdjustment(data: {
    budgetId: string
    type: 'increase' | 'decrease'
    amount: number
    reason: string
  }): Promise<ApiResponse<BudgetAdjustment>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.BUDGET_ADJUSTMENTS, data)
      return response.data
    } catch (error) {
      console.error('申请预算调整失败:', error)
      throw error
    }
  }

  // 审批预算调整
  async approveBudgetAdjustment(adjustmentId: string, data: {
    status: 'approved' | 'rejected'
    remark?: string
  }): Promise<ApiResponse<BudgetAdjustment>> {
    try {
      const response = await request.put(FINANCE_ENDPOINTS.APPROVE_BUDGET_ADJUSTMENT(adjustmentId), data)
      return response.data
    } catch (error) {
      console.error('审批预算调整失败:', error)
      throw error
    }
  }

  // 获取预算概览
  async getBudgetOverview(): Promise<ApiResponse<{
    totalBudget: number
    totalUsed: number
    totalRemaining: number
    usageRate: number
    categoryStats: Array<{ category: string, budget: number, used: number, rate: number }>
    warningCount: number
  }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.BUDGET_OVERVIEW)
      return response.data
    } catch (error) {
      console.error('获取预算概览失败:', error)
      throw error
    }
  }

  // 获取收费项目列表
  async getFeeItems(): Promise<ApiResponse<FeeItem[]>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.FEE_ITEMS)
      return response.data
    } catch (error) {
      console.error('获取收费项目失败:', error)
      throw error
    }
  }

  // 获取缴费单列表
  async getPaymentBills(params?: {
    studentId?: string
    status?: string
    dateRange?: string[]
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: PaymentBill[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.PAYMENT_BILLS, { params })
      return response.data
    } catch (error) {
      console.error('获取缴费单失败:', error)
      throw error
    }
  }

  // 创建缴费单
  async createPaymentBill(data: {
    studentId: string
    items: { feeId: string, period: string }[]
    dueDate: string
    discount?: number
  }): Promise<ApiResponse<PaymentBill>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.PAYMENT_BILLS, data)
      return response.data
    } catch (error) {
      console.error('创建缴费单失败:', error)
      throw error
    }
  }

  // 处理缴费
  async processPayment(billId: string, data: {
    paymentMethod: string
    amount: number
    receipt?: string
  }): Promise<ApiResponse<PaymentRecord>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.PAY_BILL(billId), data)
      return response.data
    } catch (error) {
      console.error('处理缴费失败:', error)
      throw error
    }
  }

  // 获取缴费记录（学生）
  async getStudentPaymentRecords(params?: {
    studentId?: string
    dateRange?: string[]
    status?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: PaymentRecord[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.PAYMENT_RECORDS_LIST, { params })
      return response.data
    } catch (error) {
      console.error('获取缴费记录失败:', error)
      throw error
    }
  }

  // 获取退费申请列表
  async getRefundApplications(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: RefundApplication[], total: number }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.REFUND_APPLICATIONS, { params })
      return response.data
    } catch (error) {
      console.error('获取退费申请失败:', error)
      throw error
    }
  }

  // 处理退费申请
  async processRefundApplication(id: string, data: {
    status: 'approved' | 'rejected'
    remarks?: string
  }): Promise<ApiResponse<RefundApplication>> {
    try {
      const response = await request.put(FINANCE_ENDPOINTS.PROCESS_REFUND(id), data)
      return response.data
    } catch (error) {
      console.error('处理退费申请失败:', error)
      throw error
    }
  }

  // 生成财务报表
  async generateReport(data: {
    type: string
    period: { start: string, end: string }
    name?: string
  }): Promise<ApiResponse<FinancialReport>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.REPORTS, data)
      return response.data
    } catch (error) {
      console.error('生成财务报表失败:', error)
      throw error
    }
  }

  // 获取财务报表列表
  async getReports(): Promise<ApiResponse<FinancialReport[]>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.REPORTS)
      return response.data
    } catch (error) {
      console.error('获取财务报表失败:', error)
      throw error
    }
  }

  // 导出报表
  async exportReport(reportId: string, format: 'excel' | 'pdf'): Promise<Blob> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.EXPORT_REPORT(reportId), {
        params: { format },
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('导出报表失败:', error)
      throw error
    }
  }

  // 获取今日收费记录
  async getTodayPayments(): Promise<ApiResponse<PaymentRecord[]>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.TODAY_PAYMENTS)
      return response.data
    } catch (error) {
      console.error('获取今日收费失败:', error)
      throw error
    }
  }

  // 发送催缴通知
  async sendCollectionReminder(billIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.SEND_REMINDER, { billIds })
      return response.data
    } catch (error) {
      console.error('发送催缴通知失败:', error)
      throw error
    }
  }

  // ========== Finance模块第3批：财务报表、分析、预测相关API ==========

  // ===== 财务报表相关API =====

  // 获取报表数据（包含模板、自定义报表、历史记录、分享）
  async getReportsAll(): Promise<ApiResponse<{
    templates: import('@/pages/mobile/finance/types/batch3').FinanceReportTemplate[]
    customReports: import('@/pages/mobile/finance/types/batch3').CustomReport[]
    reportHistory: import('@/pages/mobile/finance/types/batch3').ReportData[]
    shares: import('@/pages/mobile/finance/types/batch3').ReportShare[]
  }>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.REPORTS_ALL)
      return response.data
    } catch (error) {
      console.error('获取报表数据失败:', error)
      throw error
    }
  }

  // 生成报表（第3批API）
  async generateBatch3Report(params: import('@/pages/mobile/finance/types/batch3').ReportGenerateParams): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ReportData>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.REPORTS_GENERATE, params)
      return response.data
    } catch (error) {
      console.error('生成报表失败:', error)
      throw error
    }
  }

  // 创建自定义报表
  async createCustomReport(data: Partial<import('@/pages/mobile/finance/types/batch3').CustomReport>): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').CustomReport>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.CUSTOM_REPORTS, data)
      return response.data
    } catch (error) {
      console.error('创建自定义报表失败:', error)
      throw error
    }
  }

  // 复制报表
  async copyReport(reportId: string): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').CustomReport>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.COPY_REPORT(reportId))
      return response.data
    } catch (error) {
      console.error('复制报表失败:', error)
      throw error
    }
  }

  // 删除报表
  async deleteReport(reportId: string): Promise<ApiResponse<void>> {
    try {
      const response = await request.delete(FINANCE_ENDPOINTS.DELETE_REPORT(reportId))
      return response.data
    } catch (error) {
      console.error('删除报表失败:', error)
      throw error
    }
  }

  // 下载报表
  async downloadReport(reportId: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.DOWNLOAD_REPORT(reportId), {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('下载报表失败:', error)
      throw error
    }
  }

  // 重新生成报表
  async regenerateReport(reportId: string): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ReportData>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.REGENERATE_REPORT(reportId))
      return response.data
    } catch (error) {
      console.error('重新生成报表失败:', error)
      throw error
    }
  }

  // 撤销分享
  async revokeShare(shareId: string): Promise<ApiResponse<void>> {
    try {
      const response = await request.delete(FINANCE_ENDPOINTS.REVOKE_SHARE(shareId))
      return response.data
    } catch (error) {
      console.error('撤销分享失败:', error)
      throw error
    }
  }

  // ===== 财务分析相关API =====

  // 获取分析数据
  async getAnalytics(params: import('@/pages/mobile/finance/types/batch3').AnalyticsQueryParams): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').FinanceAnalyticsResponse>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.ANALYTICS, { params })
      return response.data
    } catch (error) {
      console.error('获取分析数据失败:', error)
      throw error
    }
  }

  // 导出分析报告
  async exportAnalyticsReport(params: {
    dateRange: string[]
    granularity: string
    format: 'pdf' | 'excel'
  }): Promise<ApiResponse<Blob>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.EXPORT_ANALYTICS, params, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('导出分析报告失败:', error)
      throw error
    }
  }

  // ===== 财务预测相关API =====

  // 获取预测数据
  async getForecast(params: Record<string, any> = {}): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').FinanceForecastResponse>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.FORECAST, { params })
      return response.data
    } catch (error) {
      console.error('获取预测数据失败:', error)
      throw error
    }
  }

  // 生成预测
  async generateForecast(params: import('@/pages/mobile/finance/types/batch3').ForecastGenerateParams): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ForecastResult>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.FORECAST_GENERATE, params)
      return response.data
    } catch (error) {
      console.error('生成预测失败:', error)
      throw error
    }
  }

  // 获取预测配置列表
  async getForecastConfigs(): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ForecastConfig[]>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.FORECAST_CONFIGS)
      return response.data
    } catch (error) {
      console.error('获取预测配置失败:', error)
      throw error
    }
  }

  // 创建预测配置
  async createForecastConfig(data: Partial<import('@/pages/mobile/finance/types/batch3').ForecastConfig>): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ForecastConfig>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.FORECAST_CONFIGS, data)
      return response.data
    } catch (error) {
      console.error('创建预测配置失败:', error)
      throw error
    }
  }

  // 更新预测配置
  async updateForecastConfig(configId: string, data: Partial<import('@/pages/mobile/finance/types/batch3').ForecastConfig>): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ForecastConfig>> {
    try {
      const response = await request.put(FINANCE_ENDPOINTS.UPDATE_FORECAST_CONFIG(configId), data)
      return response.data
    } catch (error) {
      console.error('更新预测配置失败:', error)
      throw error
    }
  }

  // 删除预测配置
  async deleteForecastConfig(configId: string): Promise<ApiResponse<void>> {
    try {
      const response = await request.delete(FINANCE_ENDPOINTS.DELETE_FORECAST_CONFIG(configId))
      return response.data
    } catch (error) {
      console.error('删除预测配置失败:', error)
      throw error
    }
  }

  // 获取预测历史记录
  async getForecastHistory(): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ForecastResult[]>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.FORECAST_HISTORY)
      return response.data
    } catch (error) {
      console.error('获取预测历史失败:', error)
      throw error
    }
  }

  // 获取预测报告
  async getForecastReports(): Promise<ApiResponse<import('@/pages/mobile/finance/types/batch3').ForecastResult[]>> {
    try {
      const response = await request.get(FINANCE_ENDPOINTS.FORECAST_REPORTS)
      return response.data
    } catch (error) {
      console.error('获取预测报告失败:', error)
      throw error
    }
  }

  // 生成预测报告
  async generateForecastReport(data: {
    configId: string
    scenario: 'optimistic' | 'pessimistic' | 'neutral'
    format: 'pdf' | 'excel'
  }): Promise<ApiResponse<Blob>> {
    try {
      const response = await request.post(FINANCE_ENDPOINTS.FORECAST_REPORTS_GENERATE, data, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('生成预测报告失败:', error)
      throw error
    }
  }
}

export default new FinanceAPI()

// 命名导出以兼容不同的导入方式
export const financeApi = new FinanceAPI()