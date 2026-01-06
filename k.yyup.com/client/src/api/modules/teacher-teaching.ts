import { request } from '@/utils/request'

// 教学相关接口定义
export interface TeachingStats {
  classes: number
  students: number
  weekCourses: number
  completionRate: number
}

export interface ClassInfo {
  id: number
  name: string
  studentCount: number
  grade: string
  room: string
  schedule: string
  description?: string
}

export interface ProgressInfo {
  id: number
  className: string
  courseName: string
  totalSessions: number
  completedSessions: number
  completionRate: number
  lastUpdate: string
}

export interface TeachingRecord {
  id: number
  className: string
  courseName: string
  date: string
  duration: number
  content: string
  mediaFiles?: string[]
  notes?: string
}

export interface StudentInfo {
  id: number
  name: string
  className: string
  age: number
  gender: string
  performance: string
  attendance: number
}

export interface CreateRecordData {
  classId: number
  courseName: string
  date: string
  duration: number
  content: string
  notes?: string
}

// 教学中心API
export const teacherTeachingApi = {
  // 获取教学统计（解包标准响应）
  getTeachingStats: async (): Promise<TeachingStats> => {
    const res = await request.get<any>('/teacher-dashboard/teaching/stats')
    // 响应拦截器返回 { success: true, data: {...} }，所以需要取 res.data
    return res.data || res
  },

  // 获取班级列表（解包）
  getClassList: async (): Promise<ClassInfo[]> => {
    const res = await request.get<any>('/teacher-dashboard/teaching/classes')
    // 响应拦截器返回 { success: true, data: [...] }，所以需要取 res.data
    return res.data || res
  },

  // 获取教学进度（解包）
  getProgressData: async (params?: {
    classId?: number
    courseName?: string
  }): Promise<ProgressInfo[]> => {
    const res = await request.get<any>('/teacher-dashboard/teaching/progress', { params })
    // 响应拦截器返回 { success: true, data: [...] }，所以需要取 res.data
    return res.data || res
  },

  // 获取教学记录（解包）
  getTeachingRecords: async (params?: {
    classId?: number
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{
    records: TeachingRecord[]
    total: number
    page: number
    limit: number
  }> => {
    const res = await request.get<any>('/teacher-dashboard/teaching/records', { params })
    // 响应拦截器返回 { success: true, data: {...} }，所以需要取 res.data
    return res.data || res
  },

  // 获取学生列表（解包）
  getStudentsList: async (params?: {
    classId?: number
    page?: number
    limit?: number
  }): Promise<{
    students: StudentInfo[]
    total: number
    page: number
    limit: number
  }> => {
    const res = await request.get<any>('/teacher-dashboard/teaching/students', { params })
    // 响应拦截器返回 { success: true, data: {...} }，所以需要取 res.data
    return res.data || res
  },

  // 创建教学记录（解包）
  createTeachingRecord: async (data: CreateRecordData): Promise<TeachingRecord> => {
    const res = await request.post<any>('/teacher-dashboard/teaching/records', data)
    return res.data || res
  },

  // 更新教学记录（解包）
  updateTeachingRecord: async (id: number, data: Partial<CreateRecordData>): Promise<TeachingRecord> => {
    const res = await request.put<any>(`/teacher-dashboard/teaching/records/${id}`, data)
    return res.data || res
  },

  // 删除教学记录
  deleteTeachingRecord: async (id: number): Promise<void> => {
    await request.delete(`/teacher-dashboard/teaching/records/${id}`)
  },

  // 更新教学进度（解包）
  updateProgress: async (id: number, data: {
    completedSessions: number
    notes?: string
  }): Promise<ProgressInfo> => {
    const res = await request.put<any>(`/teacher-dashboard/teaching/progress/${id}`, data)
    return res.data || res
  },

  // 上传教学媒体（解包）
  uploadTeachingMedia: async (formData: FormData): Promise<{
    url: string
    filename: string
  }> => {
    const res = await request.post<any>(
      '/teacher-dashboard/teaching/media',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res.data || res
  },

  // 获取班级详情（解包）
  getClassDetail: async (id: number): Promise<ClassInfo & {
    students: StudentInfo[]
    recentRecords: TeachingRecord[]
  }> => {
    const res = await request.get<any>(`/teacher-dashboard/teaching/classes/${id}`)
    return res.data || res
  },

  // 获取学生详情（解包）
  getStudentDetail: async (id: number): Promise<StudentInfo & {
    records: TeachingRecord[]
    progress: ProgressInfo[]
  }> => {
    const res = await request.get<any>(`/teacher-dashboard/teaching/students/${id}`)
    return res.data || res
  }
}

export default teacherTeachingApi
