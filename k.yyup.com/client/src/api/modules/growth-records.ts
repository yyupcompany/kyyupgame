/**
 * 成长记录API
 *
 * 专门用于身高、体重、体能等成长数据的CRUD操作
 * 后端API路径: /api/growth-records
 */

import request from '@/utils/request'

// API基础路径
const API_BASE = '/growth-records'

/**
 * 成长记录类型
 */
export enum GrowthRecordType {
  HEIGHT_WEIGHT = 'height_weight',   // 身高体重
  PHYSICAL = 'physical',             // 体能测试
  COGNITIVE = 'cognitive',           // 认知发展
  SOCIAL = 'social',                 // 社会情感
  LANGUAGE = 'language',             // 语言发展
  ART = 'art',                       // 艺术表现
  CUSTOM = 'custom'                  // 自定义
}

/**
 * 测量方式
 */
export enum MeasurementType {
  MANUAL = 'manual',     // 手动测量
  AUTOMATIC = 'automatic', // 自动采集
  REPORT = 'report',     // 家长报告
}

/**
 * 成长记录数据模型（与后端同步）
 */
export interface GrowthRecord {
  id: number
  studentId: number
  type: GrowthRecordType
  // 身高体重数据
  height: number | null        // 身高 (cm)
  weight: number | null        // 体重 (kg)
  headCircumference: number | null // 头围 (cm)
  // 体能数据
  running50m: number | null    // 50米跑 (秒)
  standingJump: number | null  // 立定跳远 (cm)
  ballThrow: number | null     // 掷球 (m)
  sitAndReach: number | null   // 坐位体前屈 (cm)
  // 发展评估分数 (0-100)
  cognitiveScore: number | null   // 认知发展评分
  socialScore: number | null      // 社会情感评分
  languageScore: number | null    // 语言发展评分
  motorScore: number | null       // 动作发展评分
  // 元数据
  measurementDate: string       // 测量日期
  measurementType: MeasurementType
  ageInMonths: number           // 月龄
  observerId: number | null     // 记录人ID
  remark: string | null         // 备注
  // 标准化百分位
  heightPercentile: number | null  // 身高百分位 (3-97)
  weightPercentile: number | null  // 体重百分位 (3-97)
  bmi: number | null            // BMI指数
  // 关联数据
  student?: {
    id: number
    name: string
    gender: number
    birthDate: string
  }
  // 时间戳
  createdAt?: string
  updatedAt?: string
}

/**
 * 学生信息（简化版）
 */
export interface Student {
  id: number
  name: string
  gender: number
  birthDate: string
}

/**
 * 成长曲线数据点
 */
export interface GrowthChartDataPoint {
  id: number
  measurementDate: string
  height: number | null
  weight: number | null
  ageInMonths: number
  heightPercentile: number | null
  weightPercentile: number | null
  bmi: number | null
}

/**
 * 成长曲线响应数据
 */
export interface GrowthChartResponse {
  records: GrowthChartDataPoint[]
  student: Student
}

/**
 * 成长评估建议
 */
export interface DevelopmentAdvice {
  level: string
  advice: string
}

/**
 * 成长评估报告
 */
export interface GrowthReport {
  student: Student & {
    ageInMonths?: number
  }
  latestRecord: {
    date: string
    height: number | null
    weight: number | null
    bmi: number | null
    heightPercentile: number | null
    weightPercentile: number | null
  } | null
  trends: {
    height: {
      values: number[]
      dates: string[]
      change: number
    }
    weight: {
      values: number[]
      dates: string[]
      change: number
    }
  }
  advice: {
    height?: {
      percentile: number
      level: string
      advice: string
    }
    weight?: {
      percentile: number
      level: string
      advice: string
    }
    bmi?: {
      value: number
      level: string
      advice: string
    }
  }
  recordsCount: number
}

/**
 * 同龄对比数据
 */
export interface PeerComparisonResponse {
  student: {
    id: number
    name: string
    ageInMonths: number
    gender: string
  }
  measurementDate: string
  comparison: {
    height: {
      value: number
      percentile: number
      level: string
      percent: number
      description: string
    }
    weight: {
      value: number
      percentile: number
      level: string
      percent: number
      description: string
    }
    bmi: {
      value: number | null
      description: string
    }
  }
}

/**
 * 查询参数
 */
export interface GrowthRecordsQueryParams {
  studentId?: number
  type?: GrowthRecordType | string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

/**
 * 创建成长记录参数
 */
export interface CreateGrowthRecordParams {
  studentId: number
  type?: GrowthRecordType | string
  height?: number
  weight?: number
  headCircumference?: number
  running50m?: number
  standingJump?: number
  ballThrow?: number
  sitAndReach?: number
  cognitiveScore?: number
  socialScore?: number
  languageScore?: number
  motorScore?: number
  measurementDate: string
  measurementType?: MeasurementType | string
  remark?: string
}

/**
 * 批量导入记录项
 */
export interface BulkRecordItem {
  type?: GrowthRecordType | string
  height?: number
  weight?: number
  headCircumference?: number
  measurementDate: string
  measurementType?: MeasurementType | string
  remark?: string
}

/**
 * 批量导入参数
 */
export interface BulkCreateParams {
  studentId: number
  records: BulkRecordItem[]
}

/**
 * 成长记录API接口
 */
export const growthRecordsApi = {
  /**
   * 获取成长记录列表
   */
  getGrowthRecords: (params: GrowthRecordsQueryParams) =>
    request.get<{ data: GrowthRecord[]; message: string }>(API_BASE, { params }),

  /**
   * 获取单个成长记录详情
   */
  getGrowthRecord: (id: number) =>
    request.get<{ data: GrowthRecord; message: string }>(`${API_BASE}/${id}`),

  /**
   * 创建成长记录
   */
  createGrowthRecord: (data: CreateGrowthRecordParams) =>
    request.post<{ data: GrowthRecord; message: string }>(API_BASE, data),

  /**
   * 更新成长记录
   */
  updateGrowthRecord: (id: number, data: Partial<CreateGrowthRecordParams>) =>
    request.put<{ data: GrowthRecord; message: string }>(`${API_BASE}/${id}`, data),

  /**
   * 删除成长记录
   */
  deleteGrowthRecord: (id: number) =>
    request.delete<{ data: null; message: string }>(`${API_BASE}/${id}`),

  /**
   * 获取成长曲线数据（用于图表展示）
   */
  getGrowthChart: (params: { studentId: number; type?: GrowthRecordType | string }) =>
    request.get<{ data: GrowthChartResponse; message: string }>(`${API_BASE}/chart`, { params }),

  /**
   * 获取成长评估报告
   */
  getGrowthReport: (studentId: number, params?: { months?: number }) =>
    request.get<{ data: GrowthReport; message: string }>(`${API_BASE}/report/${studentId}`, { params }),

  /**
   * 获取同龄对比数据
   */
  getPeerComparison: (studentId: number) =>
    request.get<{ data: PeerComparisonResponse; message: string }>(`${API_BASE}/peer-comparison/${studentId}`),

  /**
   * 批量导入成长记录
   */
  bulkCreateGrowthRecords: (data: BulkCreateParams) =>
    request.post<{
      data: {
        total: number
        success: number
        failed: number
        results: Array<{ index: number; success: boolean; id?: number }>
        errors?: Array<{ index: number; success: boolean; error: string }>
      }
      message: string
    }>(`${API_BASE}/bulk`, data),
}

export default growthRecordsApi
