// 班级管理模块API服务
import requestInstance from '../../utils/request';
import { CLASS_ENDPOINTS, ATTENDANCE_ENDPOINTS } from '../endpoints';

// 使用request方法
const request = requestInstance.request;
import { transformClassData, transformListResponse } from '../../utils/dataTransform';
import {
  ClassInfo,
  ClassStudent,
  ClassType,
  ClassStatus,
  ClassCreateParams,
  ClassQueryParams,
  TeacherAssignmentParams,
  ClassStatistics,
  StudentAttendance,
  ScheduleItem
} from '../../types/class';

/**
 * API响应类型
 */
interface ApiResponseType<T = any> {
  items?: T[];
  total?: number;
  success?: boolean;
  failedStudents?: Array<{ id: string; name: string }>;
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * 班级数据接口
 */
export interface Class {
  id: string;
  name: string;
  type: ClassType;
  status: ClassStatus;
  capacity: number;
  currentCount: number;
  headTeacherId?: string;
  headTeacherName?: string;
  assistantTeacherIds?: string[];
  assistantTeacherNames?: string[];
  classroom?: string;
  schedule?: ScheduleItem[];
  startDate: string;
  endDate?: string;
  description?: string;
  ageRange: string;  // 例如：'3-4岁'
  createdAt: string;
  updatedAt: string;
}

/**
 * 班级学生简要信息接口
 */
export interface ClassStudentBrief {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  avatar?: string;
  guardianName: string;
  guardianPhone: string;
  enrollmentDate: string;
}

/**
 * 获取班级列表
 * @param params 查询参数
 * @returns 班级列表和总数
 */
export function getClassList(params?: ClassQueryParams): Promise<ApiResponseType<ClassInfo>> {
  return request({
    url: CLASS_ENDPOINTS.BASE,
    method: 'get',
    params
  }).then(response => {
    // 使用数据转换层处理响应
    return transformListResponse(response, transformClassData);
  });
}

/**
 * 获取班级详情
 * @param id 班级ID
 * @returns 班级详情
 */
export function getClassDetail(id: string): Promise<ApiResponseType<ClassInfo>> {
  return request({
    url: CLASS_ENDPOINTS.GET_BY_ID(id),
    method: 'get'
  }).then(response => {
    // 转换响应数据
    if (response.data) {
      response.data = transformClassData(response.data);
    }
    return response;
  });
}

/**
 * 创建班级
 * @param data 班级创建参数
 * @returns 创建结果
 */
export function createClass(data: ClassCreateParams): Promise<ApiResponseType<ClassInfo>> {
  return request({
    url: CLASS_ENDPOINTS.BASE,
    method: 'post',
    data
  });
}

/**
 * 更新班级
 * @param id 班级ID
 * @param data 班级更新参数
 * @returns 更新结果
 */
export function updateClass(id: string, data: Partial<ClassCreateParams>): Promise<ApiResponseType<ClassInfo>> {
  return request({
    url: CLASS_ENDPOINTS.UPDATE(id),
    method: 'put',
    data
  });
}

/**
 * 删除班级
 * @param id 班级ID
 * @returns 删除结果
 */
export function deleteClass(id: string): Promise<ApiResponseType<{ success: boolean }>> {
  return request({
    url: CLASS_ENDPOINTS.DELETE(id),
    method: 'delete'
  });
}

/**
 * 更新班级状态
 * @param id 班级ID
 * @param status 班级状态
 * @returns 更新结果
 */
export function updateClassStatus(id: string, status: ClassStatus): Promise<ApiResponseType<ClassInfo>> {
  return request({
    url: CLASS_ENDPOINTS.UPDATE_STATUS(id),
    method: 'patch',
    data: { status }
  });
}

/**
 * 分配教师
 * @param id 班级ID
 * @param data 教师分配参数
 * @returns 分配结果
 */
export function assignTeachers(id: string, data: TeacherAssignmentParams): Promise<ApiResponseType<ClassInfo>> {
  return request({
    url: CLASS_ENDPOINTS.TEACHERS(id),
    method: 'put',
    data
  });
}

/**
 * 获取班级学生列表
 * @param classId 班级ID
 * @param params 查询参数
 * @returns 学生列表和总数
 */
export function getClassStudents(
  classId: string, 
  params?: { 
    page?: number; 
    pageSize?: number; 
    status?: string; 
    keyword?: string;
  }
): Promise<ApiResponseType<ClassStudent>> {
  return request({
    url: CLASS_ENDPOINTS.STUDENTS(classId),
    method: 'get',
    params
  });
}

/**
 * 添加学生到班级
 * @param classId 班级ID
 * @param data 学生添加参数
 * @returns 添加结果
 */
export function addStudentsToClass(
  classId: string, 
  data: { 
    studentIds: string[]; 
    joinDate: string;
    remarks?: string;
  }
): Promise<ApiResponseType<ClassStudent>> {
  return request({
    url: CLASS_ENDPOINTS.STUDENTS(classId),
    method: 'post',
    data
  });
}

/**
 * 从班级移除学生
 * @param classId 班级ID
 * @param studentId 学生ID
 * @returns 移除结果
 */
export function removeStudentFromClass(classId: string, studentId: string): Promise<ApiResponseType<{ success: boolean }>> {
  return request({
    url: CLASS_ENDPOINTS.REMOVE_STUDENT(classId, studentId),
    method: 'delete'
  });
}

/**
 * 转班
 * @param classId 源班级ID
 * @param data 转班参数
 * @returns 转班结果
 */
export function transferStudents(
  classId: string, 
  data: { 
    studentIds: string[]; 
    targetClassId: string;
    transferDate: string;
    reason: string;
  }
): Promise<ApiResponseType<ClassStudent>> {
  return request({
    url: CLASS_ENDPOINTS.TRANSFER(classId),
    method: 'post',
    data
  });
}

/**
 * 获取班级统计数据
 * @returns 班级统计数据
 */
export function getClassStatistics(): Promise<ApiResponseType<ClassStatistics[]>> {
  return request({
    url: CLASS_ENDPOINTS.STATISTICS,
    method: 'get'
  });
}

/**
 * 获取可用教室
 * @param params 查询参数
 * @returns 可用教室列表
 */
export function getAvailableClassrooms(params?: {
  date?: string;
  timeSlot?: string;
}): Promise<ApiResponseType<string[]>> {
  return request({
    url: CLASS_ENDPOINTS.AVAILABLE_CLASSROOMS,
    method: 'get',
    params
  });
}

/**
 * 导出班级数据
 * @param params 导出参数
 * @returns 文件URL
 */
export function exportClassData(params?: {
  classIds?: string[];
  includeStudents?: boolean;
  includeAttendance?: boolean;
}): Promise<ApiResponseType<{ fileUrl: string }>> {
  return request({
    url: CLASS_ENDPOINTS.EXPORT,
    method: 'get',
    params,
    responseType: 'blob'
  });
}

/**
 * 获取学生考勤记录
 * @param studentId 学生ID
 * @param params 查询参数
 * @returns 考勤记录列表
 */
export function getStudentAttendance(
  studentId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<ApiResponseType<StudentAttendance>> {
  return request({
    url: ATTENDANCE_ENDPOINTS.STUDENT(studentId),
    method: 'get',
    params
  });
}

/**
 * 班级API对象（兼容旧代码）
 */
export const classApi = {
  getClassList,
  getClassDetail,
  createClass,
  updateClass,
  deleteClass,
  updateClassStatus,
  assignTeachers,
  getClassStudents,
  addStudentsToClass,
  removeStudentFromClass,
  transferStudents,
  getClassStatistics,
  getAvailableClassrooms,
  exportClassData,
  getStudentAttendance
}; 