import request from '@/utils/request'

// API基础路径 (需要包含/api前缀，因为request工具的baseURL为空)
const API_BASE = '/api/personnel-center'

// 类型定义
export interface PersonnelOverview {
  stats: Array<{
    key: string
    title: string
    value: number
    unit: string
    trend: number
    trendText: string
    type: string
    icon: string
  }>
}

export interface Student {
  id: string
  name: string
  studentId: string
  className: string
  gender: string
  age: number
  status: string
  enrollDate: string
  avatar?: string
  parentName?: string
  parentPhone?: string
  grades?: Array<{
    id: string
    subject: string
    score: number
  }>
}

export interface Parent {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  status: string
  registerDate: string
  children?: Array<{
    id: string
    name: string
  }>
  communications?: Array<{
    id: string
    date: string
    type: string
    content: string
  }>
}

export interface Teacher {
  id: string
  name: string
  employeeId: string
  department: string
  position: string
  phone: string
  email?: string
  status: string
  hireDate: string
  classes?: Array<{
    id: string
    name: string
  }>
  subjects?: string[]
}

export interface Class {
  id: string
  name: string
  grade: string
  maxCapacity: number
  currentStudents: number
  teacherName: string
  assistantTeacher?: string
  room: string
  status: string
  createDate: string
  students?: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

export interface QueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  [key: string]: any
}

// 人员中心API
export const personnelCenterApi = {
  // 概览数据
  getOverview: () => request.get(`${API_BASE}/overview`),
  
  // 人员分布统计
  getPersonnelDistribution: () => request.get(`${API_BASE}/distribution`),
  
  // 人员趋势统计
  getPersonnelTrend: () => request.get(`${API_BASE}/trend`),

  // 学生管理
  getStudents: (params: QueryParams) => request.get(`${API_BASE}/students`, params),
  createStudent: (data: Partial<Student>) => request.post(`${API_BASE}/students`, data),
  updateStudent: (id: string, data: Partial<Student>) => request.put(`${API_BASE}/students/${id}`, data),
  deleteStudent: (id: string) => request.delete(`${API_BASE}/students/${id}`),
  getStudentDetail: (id: string) => request.get(`${API_BASE}/students/${id}`),

  // 家长管理
  getParents: (params: QueryParams) => request.get(`${API_BASE}/parents`, params),
  createParent: (data: Partial<Parent>) => request.post(`${API_BASE}/parents`, data),
  updateParent: (id: string, data: Partial<Parent>) => request.put(`${API_BASE}/parents/${id}`, data),
  deleteParent: (id: string) => request.delete(`${API_BASE}/parents/${id}`),
  getParentDetail: (id: string) => request.get(`${API_BASE}/parents/${id}`),

  // 教师管理
  getTeachers: (params: QueryParams) => request.get(`${API_BASE}/teachers`, params),
  createTeacher: (data: Partial<Teacher>) => request.post(`${API_BASE}/teachers`, data),
  updateTeacher: (id: string, data: Partial<Teacher>) => request.put(`${API_BASE}/teachers/${id}`, data),
  deleteTeacher: (id: string) => request.delete(`${API_BASE}/teachers/${id}`),
  getTeacherDetail: (id: string) => request.get(`${API_BASE}/teachers/${id}`),

  // 班级管理
  getClasses: (params: QueryParams) => request.get(`${API_BASE}/classes`, params),
  createClass: (data: Partial<Class>) => request.post(`${API_BASE}/classes`, data),
  updateClass: (id: string, data: Partial<Class>) => request.put(`${API_BASE}/classes/${id}`, data),
  deleteClass: (id: string) => request.delete(`${API_BASE}/classes/${id}`),
  getClassDetail: (id: string) => request.get(`${API_BASE}/classes/${id}`),

  // 统计分析
  getPersonnelStatistics: () => request.get(`${API_BASE}/statistics`),
  
  // 导出功能
  exportStudents: (params: QueryParams) => request.get(`${API_BASE}/students/export`, params),
  exportParents: (params: QueryParams) => request.get(`${API_BASE}/parents/export`, params),
  exportTeachers: (params: QueryParams) => request.get(`${API_BASE}/teachers/export`, params),
  exportClasses: (params: QueryParams) => request.get(`${API_BASE}/classes/export`, params),

  // 批量操作
  batchUpdateStudents: (ids: string[], data: Partial<Student>) => 
    request.put(`${API_BASE}/students/batch`, { ids, data }),
  batchDeleteStudents: (ids: string[]) => 
    request.delete(`${API_BASE}/students/batch`, { data: { ids } }),
  
  batchUpdateParents: (ids: string[], data: Partial<Parent>) => 
    request.put(`${API_BASE}/parents/batch`, { ids, data }),
  batchDeleteParents: (ids: string[]) => 
    request.delete(`${API_BASE}/parents/batch`, { data: { ids } }),
  
  batchUpdateTeachers: (ids: string[], data: Partial<Teacher>) => 
    request.put(`${API_BASE}/teachers/batch`, { ids, data }),
  batchDeleteTeachers: (ids: string[]) => 
    request.delete(`${API_BASE}/teachers/batch`, { data: { ids } }),
  
  batchUpdateClasses: (ids: string[], data: Partial<Class>) => 
    request.put(`${API_BASE}/classes/batch`, { ids, data }),
  batchDeleteClasses: (ids: string[]) => 
    request.delete(`${API_BASE}/classes/batch`, { data: { ids } })
}

export default personnelCenterApi
