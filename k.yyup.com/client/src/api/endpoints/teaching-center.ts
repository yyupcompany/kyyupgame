import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

// 教学中心API接口
export const teachingCenterApi = {
  // ==================== 课程进度相关 ====================
  
  /**
   * 获取课程进度统计数据
   */
  getCourseProgressStats(): Promise<ApiResponse<any>> {
    // 后端实际路由为 /api/teaching-center/course-progress（无 /stats 后缀）
    return request.get('/api/teaching-center/course-progress')
  },

  /**
   * 获取班级详细进度
   */
  getClassDetailedProgress(classId: number): Promise<ApiResponse<any>> {
    return request.get(`/api/teaching-center/course-progress/class/${classId}/detailed`)
  },

  /**
   * 教师确认完成课程
   */
  confirmCourseCompletion(data: {
    class_id: number
    course_id: number
    completion_status: string
    notes?: string
  }): Promise<ApiResponse<any>> {
    return request.post('/api/teaching-center/course-progress/confirm', data)
  },

  // ==================== 户外训练相关 ====================
  
  /**
   * 获取户外训练统计数据
   */
  getOutdoorTrainingStats(): Promise<ApiResponse<any>> {
    // 后端实际路由为 /api/teaching-center/outdoor-training（无 /stats 后缀）
    return request.get('/api/teaching-center/outdoor-training')
  },

  /**
   * 获取班级户外训练详情
   */
  getClassOutdoorTrainingDetails(classId: number): Promise<ApiResponse<any>> {
    return request.get(`/api/teaching-center/outdoor-training/class/${classId}/details`)
  },

  /**
   * 创建户外训练记录
   */
  createOutdoorTrainingRecord(data: {
    class_id: number
    week_number: number
    training_type: 'outdoor_training' | 'departure_display'
    training_date: string
    location?: string
    attendance_count: number
    target_achieved_count: number
    notes?: string
  }): Promise<ApiResponse<any>> {
    return request.post('/api/teaching-center/outdoor-training/records', data)
  },

  /**
   * 更新户外训练记录
   */
  updateOutdoorTrainingRecord(recordId: number, data: any): Promise<ApiResponse<any>> {
    return request.put(`/api/teaching-center/outdoor-training/records/${recordId}`, data)
  },

  // ==================== 校外展示相关 ====================
  
  /**
   * 获取校外展示统计数据
   */
  getExternalDisplayStats(): Promise<ApiResponse<any>> {
    // 后端实际路由为 /api/teaching-center/external-display（无 /stats 后缀）
    return request.get('/api/teaching-center/external-display')
  },

  /**
   * 获取班级校外展示详情
   */
  getClassExternalDisplayDetails(classId: number): Promise<ApiResponse<any>> {
    return request.get(`/api/teaching-center/external-display/class/${classId}/details`)
  },

  /**
   * 创建校外展示记录
   */
  createExternalDisplayRecord(data: {
    class_id: number
    activity_name: string
    activity_date: string
    location: string
    activity_type: string
    participant_count: number
    achievement_level: string
    achievement_rate: number
    notes?: string
  }): Promise<ApiResponse<any>> {
    return request.post('/api/teaching-center/external-display/records', data)
  },

  /**
   * 更新校外展示记录
   */
  updateExternalDisplayRecord(recordId: number, data: any): Promise<ApiResponse<any>> {
    return request.put(`/api/teaching-center/external-display/records/${recordId}`, data)
  },

  // ==================== 锦标赛相关 ====================
  
  /**
   * 获取锦标赛统计数据
   */
  getChampionshipStats(): Promise<ApiResponse<any>> {
    // 后端实际路由为 /api/teaching-center/championship（无 /stats 后缀）
    return request.get('/api/teaching-center/championship')
  },

  /**
   * 获取锦标赛详情
   */
  getChampionshipDetails(championshipId: number): Promise<ApiResponse<any>> {
    return request.get(`/api/teaching-center/championship/${championshipId}/details`)
  },

  /**
   * 创建锦标赛
   */
  createChampionship(data: {
    championship_name: string
    championship_type: string
    championship_date: string
    location: string
    target_participant_count: number
    budget_amount?: number
    awards_description?: string
    notes?: string
  }): Promise<ApiResponse<any>> {
    return request.post('/api/teaching-center/championship', data)
  },

  /**
   * 更新锦标赛状态
   */
  updateChampionshipStatus(championshipId: number, data: {
    status: string
    notes?: string
  }): Promise<ApiResponse<any>> {
    return request.put(`/api/teaching-center/championship/${championshipId}/status`, data)
  },

  /**
   * 更新锦标赛信息
   */
  updateChampionship(championshipId: number, data: any): Promise<ApiResponse<any>> {
    return request.put(`/api/teaching-center/championship/${championshipId}`, data)
  },

  // ==================== 媒体管理相关 ====================
  
  /**
   * 获取媒体文件列表
   */
  getMediaFiles(params: {
    reference_type: string
    reference_id: number
    media_type?: 'image' | 'video'
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    return request.get('/api/teaching-center/media/files', { params })
  },

  /**
   * 上传媒体文件
   */
  uploadMediaFile(formData: FormData): Promise<ApiResponse<any>> {
    return request.post('/api/teaching-center/media/upload', formData)
  },

  /**
   * 删除媒体文件
   */
  deleteMediaFile(fileId: number): Promise<ApiResponse<any>> {
    return request.delete(`/api/teaching-center/media/files/${fileId}`)
  },

  /**
   * 获取媒体统计信息
   */
  getMediaStats(params: {
    reference_type: string
    reference_id?: number
  }): Promise<ApiResponse<any>> {
    return request.get('/api/teaching-center/media/stats', { params })
  },

  /**
   * 批量上传媒体文件
   */
  batchUploadMediaFiles(data: {
    files: File[]
    reference_type: string
    reference_id: number
    description?: string
  }): Promise<ApiResponse<any>> {
    const formData = new FormData()
    
    data.files.forEach((file) => {
      formData.append('files', file)
    })
    
    formData.append('reference_type', data.reference_type)
    formData.append('reference_id', data.reference_id.toString())
    
    if (data.description) {
      formData.append('description', data.description)
    }

    return request.post('/api/teaching-center/media/batch-upload', formData)
  },

  // ==================== 脑科学课程相关 ====================
  
  /**
   * 获取脑科学课程列表
   */
  getBrainScienceCourses(params?: {
    page?: number
    limit?: number
    course_type?: string
    age_group?: string
  }): Promise<ApiResponse<any>> {
    return request.get('/api/teaching-center/brain-science-courses', { params })
  },

  /**
   * 创建脑科学课程
   */
  createBrainScienceCourse(data: {
    course_name: string
    course_type: string
    description?: string
    target_age_group: string
    duration_weeks: number
    sessions_per_week: number
    objectives?: string
    materials_needed?: string
  }): Promise<ApiResponse<any>> {
    return request.post('/api/teaching-center/brain-science-courses', data)
  },

  /**
   * 更新脑科学课程
   */
  updateBrainScienceCourse(courseId: number, data: any): Promise<ApiResponse<any>> {
    return request.put(`/api/teaching-center/brain-science-courses/${courseId}`, data)
  },

  /**
   * 删除脑科学课程
   */
  deleteBrainScienceCourse(courseId: number): Promise<ApiResponse<any>> {
    return request.delete(`/api/teaching-center/brain-science-courses/${courseId}`)
  },

  // ==================== 课程计划相关 ====================
  
  /**
   * 获取课程计划列表
   */
  getCoursePlans(params?: {
    semester?: string
    class_id?: number
    course_id?: number
  }): Promise<ApiResponse<any>> {
    return request.get('/api/teaching-center/course-plans', { params })
  },

  /**
   * 创建课程计划
   */
  createCoursePlan(data: {
    semester: string
    class_id: number
    course_id: number
    planned_start_date: string
    planned_end_date: string
    target_completion_rate: number
    notes?: string
  }): Promise<ApiResponse<any>> {
    return request.post('/api/teaching-center/course-plans', data)
  },

  /**
   * 更新课程计划
   */
  updateCoursePlan(planId: number, data: any): Promise<ApiResponse<any>> {
    return request.put(`/api/teaching-center/course-plans/${planId}`, data)
  },

  // ==================== 数据导出相关 ====================
  
  /**
   * 导出课程进度报告
   */
  async exportCourseProgressReport(params: {
    class_id?: number
    semester?: string
    format?: 'excel' | 'pdf'
  }): Promise<Blob> {
    const response: any = await request.get('/api/teaching-center/export/course-progress', {
      params,
      responseType: 'blob'
    })
    return response.data || response
  },

  /**
   * 导出户外训练报告
   */
  async exportOutdoorTrainingReport(params: {
    class_id?: number
    training_type?: string
    format?: 'excel' | 'pdf'
  }): Promise<Blob> {
    const response: any = await request.get('/api/teaching-center/export/outdoor-training', {
      params,
      responseType: 'blob'
    })
    return response.data || response
  },

  /**
   * 导出锦标赛报告
   */
  async exportChampionshipReport(championshipId: number, format: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    const response: any = await request.get(`/api/teaching-center/export/championship/${championshipId}`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data || response
  }
}

export default teachingCenterApi
