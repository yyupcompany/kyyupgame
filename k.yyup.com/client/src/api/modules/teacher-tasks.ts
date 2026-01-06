import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
const TEACHER_TASKS_ENDPOINTS = {
  STATS: `${API_PREFIX}/teacher-dashboard/tasks/stats`,
  TASKS: `${API_PREFIX}/teacher-dashboard/tasks`,
  TASK_BY_ID: (id: number) => `${API_PREFIX}/teacher-dashboard/tasks/${id}`,
  TASK_STATUS: (id: number) => `${API_PREFIX}/teacher-dashboard/tasks/${id}/status`,
  BATCH_DELETE: `${API_PREFIX}/teacher-dashboard/tasks/batch-delete`,
  BATCH_COMPLETE: `${API_PREFIX}/teacher-dashboard/tasks/batch-complete`
} as const

// 任务接口定义
export interface Task {
  id: number
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  dueDate: string
  progress: number
  assignedBy?: string
  createdAt: string
  updatedAt: string
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  inProgress: number
}

export interface CreateTaskData {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  priority?: 'high' | 'medium' | 'low'
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
  progress?: number
  dueDate?: string
}

// 任务管理API
export const teacherTasksApi = {
  // 获取任务统计（解包标准响应）
  getTaskStats: async (): Promise<TaskStats> => {
    const res = await request.get<TaskStats>(TEACHER_TASKS_ENDPOINTS.STATS)
    return res.data
  },

  // 获取任务列表（解包标准响应）
  getTaskList: async (params?: {
    status?: string
    priority?: string
    page?: number
    limit?: number
  }): Promise<{
    tasks: Task[]
    total: number
    page: number
    limit: number
  }> => {
    const res = await request.get<{
      list: Task[]
      total: number
      page: number
      pageSize: number
    }>(TEACHER_TASKS_ENDPOINTS.TASKS, { params })
    return {
      tasks: res.data.list,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.pageSize
    }
  },

  // 创建任务（解包）
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const res = await request.post<Task>(TEACHER_TASKS_ENDPOINTS.TASKS, data)
    return res.data
  },

  // 更新任务（解包）
  updateTask: async (id: number, data: UpdateTaskData): Promise<Task> => {
    const res = await request.put<Task>(TEACHER_TASKS_ENDPOINTS.TASK_BY_ID(id), data)
    return res.data
  },

  // 更新任务状态（解包）
  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const res = await request.put<Task>(TEACHER_TASKS_ENDPOINTS.TASK_STATUS(id), { completed: status === 'completed' })
    return res.data
  },

  // 删除任务
  deleteTask: async (id: number): Promise<void> => {
    await request.delete(TEACHER_TASKS_ENDPOINTS.BATCH_DELETE, { data: { taskIds: [id] } })
  },

  // 批量完成任务
  batchCompleteTask: async (taskIds: number[]): Promise<void> => {
    await request.post(TEACHER_TASKS_ENDPOINTS.BATCH_COMPLETE, { taskIds })
  },

  // 批量删除任务（使用DELETE并传body）
  batchDeleteTask: async (taskIds: number[]): Promise<void> => {
    await request.delete(TEACHER_TASKS_ENDPOINTS.BATCH_DELETE, { data: { taskIds } })
  },

  // 获取任务详情（解包）
  getTaskDetail: async (id: number): Promise<Task> => {
    const res = await request.get<Task>(TEACHER_TASKS_ENDPOINTS.TASK_BY_ID(id))
    return res.data
  }
}

export default teacherTasksApi
