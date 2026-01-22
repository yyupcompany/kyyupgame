// 学生管理模块API服务
import { request } from '../../utils/request';
import { STUDENT_ENDPOINTS } from '../endpoints';
import { ClassStudent } from '../../types/class';
import { transformStudentData, transformListResponse, transformStudentFormData } from '../../utils/dataTransform';

/**
 * API响应类型
 */
interface ApiResponseType<T = any> {
  items?: T[];
  total?: number;
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 学生状态
 */
export enum StudentStatus {
  ACTIVE = 'ACTIVE',           // 在读
  GRADUATED = 'GRADUATED',     // 毕业
  TRANSFERRED = 'TRANSFERRED', // 转校
  SUSPENDED = 'SUSPENDED',     // 休学
  INACTIVE = 'INACTIVE'        // 非活动
}

/**
 * 学生信息
 */
export interface Student {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  age: number;
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  };
  status: StudentStatus;
  enrollmentDate: string;
  currentClassId?: number;
  currentClassName?: string;
  avatar?: string;
  healthInfo?: {
    allergies?: string;
    medicalConditions?: string;
    medications?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  attendanceRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 学生简要信息
 */
export interface StudentBrief {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  currentClassName?: string;
  guardian: {
    name: string;
    phone: string;
  };
  status: StudentStatus;
}

/**
 * 学生创建参数
 */
export interface StudentCreateParams {
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  };
  status?: StudentStatus;
  enrollmentDate: string;
  classId?: string;
  avatar?: string;
  healthInfo?: {
    allergies?: string;
    medicalConditions?: string;
    medications?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  notes?: string;
}

/**
 * 学生查询参数
 */
export interface StudentQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: StudentStatus;
  gender?: 'MALE' | 'FEMALE';
  classId?: string;
  enrollmentDateStart?: string;
  enrollmentDateEnd?: string;
  ageMin?: number;
  ageMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 获取学生列表
 * @param params 查询参数
 * @returns 学生列表和总数
 */
export function getStudentList(params?: StudentQueryParams): Promise<ApiResponseType<PaginatedData<Student>>> {
  return request.get(STUDENT_ENDPOINTS.BASE, { params })
  .then((response: any) => {
    // 使用数据转换层处理响应
    return transformListResponse(response, transformStudentData);
  });
}

/**
 * 获取学生详情
 * @param id 学生ID
 * @returns 学生详情
 */
export function getStudentDetail(id: string): Promise<ApiResponseType<Student>> {
  return request.get(STUDENT_ENDPOINTS.GET_BY_ID(id));
}

/**
 * 创建学生
 * @param data 学生创建参数
 * @returns 创建结果
 */
export function createStudent(data: StudentCreateParams): Promise<ApiResponseType<Student>> {
  // 转换前端数据格式为后端格式
  const backendData = transformStudentFormData(data);
  
  return request.post(STUDENT_ENDPOINTS.BASE, backendData)
  .then((response: any) => {
    // 转换响应数据
    if (response.data) {
      response.data = transformStudentData(response.data);
    }
    return response;
  });
}

/**
 * 更新学生
 * @param id 学生ID
 * @param data 学生更新参数
 * @returns 更新结果
 */
export function updateStudent(id: string, data: Partial<StudentCreateParams>): Promise<ApiResponseType<Student>> {
  return request.put(STUDENT_ENDPOINTS.GET_BY_ID(id), data);
}

/**
 * 删除学生
 * @param id 学生ID
 * @returns 删除结果
 */
export function deleteStudent(id: string): Promise<ApiResponseType<{ success: boolean }>> {
  return request.delete(STUDENT_ENDPOINTS.GET_BY_ID(id));
}

/**
 * 更新学生状态
 * @param id 学生ID
 * @param status 学生状态
 * @returns 更新结果
 */
export function updateStudentStatus(id: string, status: StudentStatus): Promise<ApiResponseType<Student>> {
  return (request as any).patch((STUDENT_ENDPOINTS.UPDATE_STATUS as any)(id), { status });
}

/**
 * 获取可分配的学生列表
 * @param params 查询参数
 * @returns 学生列表和总数
 */
export function getAvailableStudents(params?: {
  keyword?: string;
  ageMin?: number;
  ageMax?: number;
}): Promise<ApiResponseType<StudentBrief>> {
  return request.get(STUDENT_ENDPOINTS.AVAILABLE, { params });
}

/**
 * 搜索可添加到班级的学生
 * @param params 查询参数
 * @returns 学生列表和总数
 */
export function searchAvailableStudents(params: {
  keyword: string;
  excludeClassId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponseType<ClassStudent>> {
  return request.get(STUDENT_ENDPOINTS.AVAILABLE, { params });
}

/**
 * 学生API对象（兼容旧代码）
 */
export const studentApi = {
  getStudentList,
  getStudentById: getStudentDetail,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  getAvailableStudents,
  searchAvailableStudents
};