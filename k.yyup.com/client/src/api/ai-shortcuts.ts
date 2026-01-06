import request from '@/utils/request'

// AI快捷操作相关接口

/**
 * AI快捷操作数据类型
 */
export interface AIShortcut {
  id: number
  shortcut_name: string
  prompt_name: string
  category: string
  role: string
  system_prompt: string
  api_endpoint: 'ai_chat' | 'ai_query'
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * 查询参数类型
 */
export interface AIShortcutQuery {
  page?: number
  pageSize?: number
  role?: string
  category?: string
  api_endpoint?: string
  is_active?: boolean
  search?: string
}

/**
 * 创建/更新参数类型
 */
export interface AIShortcutForm {
  shortcut_name: string
  prompt_name: string
  category: string
  role: string
  system_prompt: string
  api_endpoint: 'ai_chat' | 'ai_query'
  is_active?: boolean
  sort_order?: number
}

/**
 * 分页响应类型
 */
export interface AIShortcutListResponse {
  list: AIShortcut[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 获取AI快捷操作列表
 */
export const getAIShortcuts = (params?: AIShortcutQuery) => {
  return request.get<AIShortcutListResponse>('/ai-shortcuts', { params })
}

/**
 * 获取用户可用的快捷操作
 */
export const getUserShortcuts = () => {
  return request.get<AIShortcut[]>('/ai-shortcuts/user')
}

/**
 * 根据ID获取AI快捷操作详情
 */
export const getAIShortcutById = (id: number) => {
  return request.get<AIShortcut>(`/ai-shortcuts/${id}`)
}

/**
 * 获取快捷操作配置（用于AI调用）
 */
export const getShortcutConfig = (id: number) => {
  return request.get<AIShortcut>(`/ai-shortcuts/${id}/config`)
}

/**
 * 创建AI快捷操作
 */
export const createAIShortcut = (data: AIShortcutForm) => {
  return request.post<{ id: number }>('/ai-shortcuts', data)
}

/**
 * 更新AI快捷操作
 */
export const updateAIShortcut = (id: number, data: Partial<AIShortcutForm>) => {
  return request.put(`/ai-shortcuts/${id}`, data)
}

/**
 * 删除AI快捷操作
 */
export const deleteAIShortcut = (id: number) => {
  return request.delete(`/ai-shortcuts/${id}`)
}

/**
 * 批量删除AI快捷操作
 */
export const batchDeleteAIShortcuts = (ids: number[]) => {
  return request.post('/api/ai-shortcuts/batch/delete', { ids })
}

/**
 * 更新排序顺序
 */
export const updateSortOrder = (sortData: Array<{ id: number; sort_order: number }>) => {
  return request.put('/api/ai-shortcuts/sort', { sortData })
}

/**
 * 功能类别选项
 */
export const CATEGORY_OPTIONS = [
  { label: '招生规划', value: 'enrollment_planning' },
  { label: '活动策划', value: 'activity_planning' },
  { label: '进展分析', value: 'progress_analysis' },
  { label: '跟进提醒', value: 'follow_up_reminder' },
  { label: '转化监控', value: 'conversion_monitoring' },
  { label: '年龄提醒', value: 'age_reminder' },
  { label: '任务管理', value: 'task_management' },
  { label: '综合分析', value: 'comprehensive_analysis' }
]

/**
 * 角色选项
 */
export const ROLE_OPTIONS = [
  { label: '园长', value: 'principal' },
  { label: '管理员', value: 'admin' },
  { label: '教师', value: 'teacher' },
  { label: '通用', value: 'all' }
]

/**
 * API类型选项
 */
export const API_ENDPOINT_OPTIONS = [
  { label: 'AI聊天', value: 'ai_chat' },
  { label: 'AI查询', value: 'ai_query' }
]

/**
 * 获取类别标签
 */
export const getCategoryLabel = (category: string): string => {
  const option = CATEGORY_OPTIONS.find(item => item.value === category)
  return option?.label || category
}

/**
 * 获取角色标签
 */
export const getRoleLabel = (role: string): string => {
  const option = ROLE_OPTIONS.find(item => item.value === role)
  return option?.label || role
}

/**
 * 获取API类型标签
 */
export const getApiEndpointLabel = (apiEndpoint: string): string => {
  const option = API_ENDPOINT_OPTIONS.find(item => item.value === apiEndpoint)
  return option?.label || apiEndpoint
}

/**
 * 验证提示词名称格式
 */
export const validatePromptName = (promptName: string): boolean => {
  // 只允许字母、数字、下划线
  const regex = /^[a-zA-Z0-9_]+$/
  return regex.test(promptName)
}

/**
 * 生成默认排序值
 */
export const generateDefaultSortOrder = (existingShortcuts: AIShortcut[]): number => {
  if (existingShortcuts.length === 0) return 1
  const maxSort = Math.max(...existingShortcuts.map(item => item.sort_order))
  return maxSort + 1
}

export default {
  getAIShortcuts,
  getUserShortcuts,
  getAIShortcutById,
  getShortcutConfig,
  createAIShortcut,
  updateAIShortcut,
  deleteAIShortcut,
  batchDeleteAIShortcuts,
  updateSortOrder,
  getCategoryLabel,
  getRoleLabel,
  getApiEndpointLabel,
  validatePromptName,
  generateDefaultSortOrder
}
