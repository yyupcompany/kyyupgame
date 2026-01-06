import request from '@/utils/request'

// API基础路径
const API_BASE = '/child-growth'

// 类型定义
export interface GrowthRecord {
  id: number
  title: string
  content: string
  type: 'skill' | 'activity' | 'health' | 'social'
  typeName: string
  date: string
  photos: Array<{
    id?: string
    url: string
    name?: string
    size?: number
  }>
  childId: number
  createdAt?: string
  updatedAt?: string
}

export interface Milestone {
  id: number
  title: string
  description: string
  icon: string
  date: string
  achieved: boolean
  childId: number
  createdAt?: string
}

export interface GrowthStats {
  heightGrowth: number
  weightGrowth: number
  newSkills: number
  activities: number
  monthStats: {
    recordsCount: number
    photosCount: number
    milestonesCount: number
  }
}

export interface Child {
  id: number
  name: string
  age: number
  class: string
  avatar?: string
  grade?: string
}

export interface QueryParams {
  page?: number
  pageSize?: number
  childId?: number
  type?: string
  dateFrom?: string
  dateTo?: string
  keyword?: string
}

export interface CreateRecordParams {
  title: string
  content: string
  type: 'skill' | 'activity' | 'health' | 'social'
  photos?: Array<File | { url: string }>
  childId: number
}

export interface UpdateRecordParams extends Partial<CreateRecordParams> {
  id: number
}

// 成长记录API
export const childGrowthApi = {
  // 获取家长的孩子列表
  getChildren: () => request.get(`${API_BASE}/children`),

  // 获取成长记录列表
  getGrowthRecords: (params: QueryParams) =>
    request.get(`${API_BASE}/records`, { params }),

  // 获取成长记录详情
  getGrowthRecord: (id: number) =>
    request.get(`${API_BASE}/records/${id}`),

  // 创建成长记录
  createGrowthRecord: (data: CreateRecordParams) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'photos' && Array.isArray(data[key])) {
        data[key]!.forEach((photo, index) => {
          if (photo instanceof File) {
            formData.append(`photos[${index}]`, photo)
          } else {
            formData.append(`photoUrls[${index}]`, photo.url)
          }
        })
      } else {
        formData.append(key, String(data[key as keyof CreateRecordParams]))
      }
    })
    return request.post(`${API_BASE}/records`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 更新成长记录
  updateGrowthRecord: (id: number, data: UpdateRecordParams) =>
    request.put(`${API_BASE}/records/${id}`, data),

  // 删除成长记录
  deleteGrowthRecord: (id: number) =>
    request.delete(`${API_BASE}/records/${id}`),

  // 批量删除成长记录
  batchDeleteGrowthRecords: (ids: number[]) =>
    request.delete(`${API_BASE}/records/batch`, { data: { ids } }),

  // 获取里程碑列表
  getMilestones: (childId: number) =>
    request.get(`${API_BASE}/milestones`, { params: { childId } }),

  // 创建里程碑
  createMilestone: (data: Omit<Milestone, 'id' | 'createdAt'>) =>
    request.post(`${API_BASE}/milestones`, data),

  // 更新里程碑
  updateMilestone: (id: number, data: Partial<Milestone>) =>
    request.put(`${API_BASE}/milestones/${id}`, data),

  // 删除里程碑
  deleteMilestone: (id: number) =>
    request.delete(`${API_BASE}/milestones/${id}`),

  // 获取成长统计数据
  getGrowthStats: (childId: number, period?: 'month' | 'quarter' | 'year') =>
    request.get(`${API_BASE}/stats/${childId}`, { params: { period } }),

  // 获取成长轨迹分析
  getGrowthTrajectory: (childId: number, params?: {
    limit?: number
    dateFrom?: string
    dateTo?: string
  }) =>
    request.get(`${API_BASE}/trajectory/${childId}`, { params }),

  // 上传成长照片
  uploadGrowthPhoto: (recordId: number, photos: File[]) => {
    const formData = new FormData()
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo)
    })
    return request.post(`${API_BASE}/records/${recordId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 删除成长照片
  deleteGrowthPhoto: (recordId: number, photoId: string) =>
    request.delete(`${API_BASE}/records/${recordId}/photos/${photoId}`),

  // 导出成长报告
  exportGrowthReport: (childId: number, params: {
    format: 'pdf' | 'excel'
    dateFrom?: string
    dateTo?: string
  }) =>
    request.get(`${API_BASE}/export/${childId}`, {
      params,
      responseType: 'blob'
    }),

  // 获取成长数据趋势
  getGrowthTrend: (childId: number, params: {
    type: 'height' | 'weight' | 'skills' | 'activities'
    period: 'month' | 'quarter' | 'year'
  }) =>
    request.get(`${API_BASE}/trend/${childId}`, { params }),

  // 获取成长对比数据
  getGrowthComparison: (childId: number, compareWith?: 'average' | 'grade' | 'class') =>
    request.get(`${API_BASE}/comparison/${childId}`, { params: { compareWith } }),

  // 获取智能成长建议
  getGrowthSuggestions: (childId: number) =>
    request.get(`${API_BASE}/suggestions/${childId}`)
}

export default childGrowthApi