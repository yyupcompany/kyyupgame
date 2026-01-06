import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const KINDERGARTEN_ENDPOINTS = {
  BASE: `${API_PREFIX}/kindergartens`,
  BY_ID: (id: string | number) => `${API_PREFIX}/kindergartens/${id}`,
  STATISTICS: (id: string | number) => `${API_PREFIX}/kindergartens/${id}/statistics`,
  CLASSES: (id: string | number) => `${API_PREFIX}/kindergartens/${id}/classes`,
  TEACHERS: (id: string | number) => `${API_PREFIX}/kindergartens/${id}/teachers`,
  STUDENTS: (id: string | number) => `${API_PREFIX}/kindergartens/${id}/students`
} as const

/**
 * 幼儿园类型枚举
 */
export enum KindergartenType {
  DIRECT = 1, // 直营
  FRANCHISE = 2, // 加盟
  COOPERATIVE = 3, // 合营
}

/**
 * 幼儿园状态枚举
 */
export enum KindergartenStatus {
  DISABLED = 0, // 停业
  ACTIVE = 1, // 正常
  BUILDING = 2, // 筹建中
}

/**
 * 幼儿园信息接口
 */
export interface Kindergarten {
  id: number;
  name: string;
  code: string;
  type: KindergartenType;
  level?: number;
  address?: string;
  longitude?: number;
  latitude?: number;
  phone?: string;
  email?: string;
  principal?: string;
  establishedDate?: string;
  area?: number;
  buildingArea?: number;
  classCount: number;
  teacherCount: number;
  studentCount: number;
  description?: string;
  features?: string;
  philosophy?: string;
  feeDescription?: string;
  status: KindergartenStatus;
  groupId?: number;
  groupRole?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 幼儿园列表查询参数
 */
export interface KindergartenListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: KindergartenStatus;
  type?: KindergartenType;
  groupId?: number;
}

/**
 * 幼儿园管理API
 */
export const kindergartenApi = {
  /**
   * 获取幼儿园列表
   */
  getKindergartenList(params?: KindergartenListParams) {
    return request.get<{
      items: Kindergarten[];
      total: number;
      page: number;
      pageSize: number;
    }>(KINDERGARTEN_ENDPOINTS.BASE, { params });
  },

  /**
   * 获取幼儿园详情
   */
  getKindergartenDetail(id: number) {
    return request.get<Kindergarten>(KINDERGARTEN_ENDPOINTS.BY_ID(id));
  },

  /**
   * 创建幼儿园
   */
  createKindergarten(data: Partial<Kindergarten>) {
    return request.post<Kindergarten>(KINDERGARTEN_ENDPOINTS.BASE, data);
  },

  /**
   * 更新幼儿园信息
   */
  updateKindergarten(id: number, data: Partial<Kindergarten>) {
    return request.put<Kindergarten>(KINDERGARTEN_ENDPOINTS.BY_ID(id), data);
  },

  /**
   * 删除幼儿园
   */
  deleteKindergarten(id: number) {
    return request.delete(KINDERGARTEN_ENDPOINTS.BY_ID(id));
  },

  /**
   * 获取幼儿园统计信息
   */
  getKindergartenStatistics(id: number) {
    return request.get(KINDERGARTEN_ENDPOINTS.STATISTICS(id));
  },

  /**
   * 获取幼儿园班级列表
   */
  getKindergartenClasses(id: number) {
    return request.get(KINDERGARTEN_ENDPOINTS.CLASSES(id));
  },

  /**
   * 获取幼儿园教师列表
   */
  getKindergartenTeachers(id: number) {
    return request.get(KINDERGARTEN_ENDPOINTS.TEACHERS(id));
  },

  /**
   * 获取幼儿园学生列表
   */
  getKindergartenStudents(id: number) {
    return request.get(KINDERGARTEN_ENDPOINTS.STUDENTS(id));
  },
};

export default kindergartenApi;

