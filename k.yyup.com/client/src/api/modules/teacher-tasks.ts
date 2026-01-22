import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量 - 统一使用 /api/tasks 端点（与 admin 保持一致）
const TEACHER_TASKS_ENDPOINTS = {
  STATS: `${API_PREFIX}/tasks/stats`,
  TASKS: `${API_PREFIX}/tasks`,
  TASK_BY_ID: (id: number) => `${API_PREFIX}/tasks/${id}`,
  TASK_STATUS: (id: number) => `${API_PREFIX}/tasks/${id}/status`,
  BATCH_DELETE: `${API_PREFIX}/tasks/batch`,
  BATCH_COMPLETE: `${API_PREFIX}/tasks/batch`
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
    if (!res.data) {
      throw new Error('获取任务统计失败：响应数据为空')
    }
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
    if (!res.data) {
      throw new Error('获取任务列表失败：响应数据为空')
    }
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
    if (!res.data) {
      throw new Error('创建任务失败：响应数据为空')
    }
    return res.data
  },

  // 更新任务（解包）
  updateTask: async (id: number, data: UpdateTaskData): Promise<Task> => {
    const res = await request.put<Task>(TEACHER_TASKS_ENDPOINTS.TASK_BY_ID(id), data)
    if (!res.data) {
      throw new Error('更新任务失败：响应数据为空')
    }
    return res.data
  },

  // 更新任务状态（解包）
  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const res = await request.put<Task>(TEACHER_TASKS_ENDPOINTS.TASK_STATUS(id), { status })
    if (!res.data) {
      throw new Error('更新任务状态失败：响应数据为空')
    }
    return res.data
  },

  // 删除任务 - 使用直接删除端点
  deleteTask: async (id: number): Promise<void> => {
    await request.delete(TEACHER_TASKS_ENDPOINTS.TASK_BY_ID(id))
  },

  // 批量完成任务 - 使用PUT方法
  batchCompleteTask: async (taskIds: number[]): Promise<void> => {
    await request.put(TEACHER_TASKS_ENDPOINTS.BATCH_COMPLETE, { taskIds, status: 'completed' })
  },

  // 批量删除任务
  batchDeleteTask: async (taskIds: number[]): Promise<void> => {
    await request.delete(TEACHER_TASKS_ENDPOINTS.BATCH_DELETE, { data: { taskIds } })
  },

  // 获取任务详情（解包）
  getTaskDetail: async (id: number): Promise<Task> => {
    const res = await request.get<Task>(TEACHER_TASKS_ENDPOINTS.TASK_BY_ID(id))
    if (!res.data) {
      throw new Error('获取任务详情失败：响应数据为空')
    }
    return res.data
  }
}

export default teacherTasksApi
