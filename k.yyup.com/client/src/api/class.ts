/**
 * 班级管理相关API
 */
import { get, post, put, del } from '@/utils/request';
import type { ApiResponse } from '@/utils/request';
import { CLASS_ENDPOINTS } from './endpoints';
import type { 
  Class, 
  ClassSchedule,
  ClassCreateRequest,
  ClassUpdateRequest,
  ClassInfo
} from '../types/class';
import {
  ClassFilterRequest,
  ClassStudentAssignRequest,
  ClassTeacherAssignRequest
} from '@/types/class';

/**
 * 获取班级列表
 * @param params 筛选参数
 * @returns 班级列表数据
 */
export function getClassList(params?: ClassFilterRequest) {
  return get(CLASS_ENDPOINTS.BASE, { params })
    .then((response: any) => response.data);
}

/**
 * 获取班级详情
 * @param id 班级ID
 * @returns 班级详情数据
 */
export function getClassDetail(id: number) {
  return get(CLASS_ENDPOINTS.GET_BY_ID(id))
    .then((response: any) => response.data);
}

/**
 * 创建班级
 * @param data 班级创建数据
 * @returns 创建结果
 */
export function createClass(data: ClassCreateRequest) {
  return post(CLASS_ENDPOINTS.BASE, data)
    .then((response: any) => response.data);
}

/**
 * 更新班级
 * @param id 班级ID
 * @param data 班级更新数据
 * @returns 更新结果
 */
export function updateClass(id: number, data: ClassUpdateRequest) {
  return put(CLASS_ENDPOINTS.UPDATE(id), data)
    .then((response: any) => response.data);
}

/**
 * 删除班级
 * @param id 班级ID
 * @returns 删除结果
 */
export function deleteClass(id: number) {
  return del(CLASS_ENDPOINTS.DELETE(id))
    .then((response: any) => response.data);
}

/**
 * 获取班级学生列表
 * @param id 班级ID
 * @returns 学生列表数据
 */
export function getClassStudents(id: number) {
  return get(CLASS_ENDPOINTS.STUDENTS(id))
    .then((response: any) => response.data);
}

/**
 * 获取班级教师列表
 * @param id 班级ID
 * @returns 教师列表数据
 */
export function getClassTeachers(id: number) {
  return get(CLASS_ENDPOINTS.TEACHERS(id))
    .then((response: any) => response.data);
}

/**
 * 分配学生到班级
 * @param data 班级学生关联数据
 * @returns 分配结果
 */
export function assignStudentsToClass(data: ClassStudentAssignRequest) {
  return post(CLASS_ENDPOINTS.STUDENTS(data.classId), {
    studentIds: data.studentIds
  })
    .then((response: any) => response.data);
}

/**
 * 分配教师到班级
 * @param data 班级教师关联数据
 * @returns 分配结果
 */
export function assignTeachersToClass(data: ClassTeacherAssignRequest) {
  return post(CLASS_ENDPOINTS.TEACHERS(data.classId), {
    teacherIds: data.teacherIds
  })
    .then((response: any) => response.data);
}

/**
 * 设置班主任
 * @param classId 班级ID
 * @param teacherId 教师ID
 * @returns 设置结果
 */
export function setHeadTeacher(classId: number, teacherId: number) {
  return post(`${CLASS_ENDPOINTS.GET_BY_ID(classId)}/head-teacher`, {
    teacherId
  })
    .then((response: any) => response.data);
}

/**
 * 获取班级课程表
 * @param id 班级ID
 * @returns 课程表数据
 */
export function getClassSchedule(id: number) {
  return get(`${CLASS_ENDPOINTS.GET_BY_ID(id)}/schedule`)
    .then((response: any) => response.data);
}

/**
 * 更新班级课程表
 * @param classId 班级ID
 * @param data 课程表数据
 * @returns 更新结果
 */
export function updateClassSchedule(classId: number, data: any) {
  return put(`${CLASS_ENDPOINTS.GET_BY_ID(classId)}/schedule`, data)
    .then((response: any) => response.data);
}

/**
 * 获取可用班级列表（用于下拉选择）
 * @returns 班级简要信息列表
 */
export function getAvailableClasses() {
  return get(`${CLASS_ENDPOINTS.BASE}/available`)
    .then((response: any) => response.data);
}

/**
 * 获取班级统计数据
 * @param id 班级ID
 * @returns 班级统计数据
 */
export function getClassStatistics(id: number) {
  return get(`${CLASS_ENDPOINTS.GET_BY_ID(id)}/statistics`)
    .then((response: any) => response.data);
}

/**
 * 班级管理API服务
 */
export const classApi = {
  /**
   * 获取班级列表
   */
  getClasses(params?: any): Promise<ApiResponse<{ classes: Class[]; total: number }>> {
    return get('/classes', { params });
  },

  /**
   * 获取班级详情
   */
  getClassById(id: string): Promise<ApiResponse<Class>> {
    return get(`/classes/${id}`);
  },

  /**
   * 创建班级
   */
  createClass(data: ClassCreateRequest): Promise<ApiResponse<Class>> {
    return post('/classes', data);
  },

  /**
   * 更新班级
   */
  updateClass(id: string, data: ClassUpdateRequest): Promise<ApiResponse<Class>> {
    return put(`/classes/${id}`, data);
  },

  /**
   * 删除班级
   */
  deleteClass(id: string): Promise<ApiResponse<null>> {
    return del(`/classes/${id}`);
  },

  /**
   * 获取班级学生列表
   */
  getClassStudents(id: string): Promise<ApiResponse<any[]>> {
    return get(CLASS_ENDPOINTS.STUDENTS(id));
  },

  /**
   * 获取班级教师列表
   */
  getClassTeachers(id: string): Promise<ApiResponse<any[]>> {
    return get(CLASS_ENDPOINTS.TEACHERS(id));
  },

  /**
   * 添加学生到班级
   */
  addStudentToClass(data: { classId: string; studentId: string }): Promise<ApiResponse<any>> {
    return post(CLASS_ENDPOINTS.STUDENTS(data.classId), {
      studentId: data.studentId
    });
  },

  /**
   * 添加教师到班级
   */
  addTeacherToClass(data: { classId: string; teacherId: string }): Promise<ApiResponse<any>> {
    return post(CLASS_ENDPOINTS.TEACHERS(data.classId), {
      teacherId: data.teacherId
    });
  },

  /**
   * 设置班主任
   */
  setHeadTeacher(classId: string, teacherId: string): Promise<ApiResponse<any>> {
    return post(`${CLASS_ENDPOINTS.GET_BY_ID(classId)}/head-teacher`, {
      teacherId
    });
  },

  /**
   * 获取班级课程表
   */
  getClassSchedule(id: string): Promise<ApiResponse<ClassSchedule>> {
    return get(`${CLASS_ENDPOINTS.GET_BY_ID(id)}/schedule`);
  },

  /**
   * 更新班级课程表
   */
  updateClassSchedule(classId: string, data: any): Promise<ApiResponse<ClassSchedule>> {
    return put(`${CLASS_ENDPOINTS.GET_BY_ID(classId)}/schedule`, data);
  },

  /**
   * 获取可用班级列表
   */
  getAvailableClasses(): Promise<ApiResponse<ClassInfo[]>> {
    return get(`${CLASS_ENDPOINTS.BASE}/available`);
  }
}; 