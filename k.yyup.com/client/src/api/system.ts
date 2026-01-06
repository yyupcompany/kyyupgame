import { get, post, put, del } from '../utils/request';
import type { ApiResponse } from '../utils/request';
import {
  API_PREFIX,
  SYSTEM_USER_ENDPOINTS,
  SYSTEM_ROLE_ENDPOINTS,
  SYSTEM_LOG_ENDPOINTS
} from './endpoints'

// 字典数据项接口
interface DictItem {
  label: string;
  value: string | number;
  disabled?: boolean;
  sort?: number;
  remark?: string;
}
import type { 
  Campus, 
  SystemUser, 
  SystemRole, 
  SystemLog, 
  SystemConfig 
} from '../types/system';

/**
 * 获取校区列表
 * @returns Promise
 */
export function getCampusList() {
  return get(`${API_PREFIX}/system/campuses`)
    .then((response: any) => response.data);
}

/**
 * 获取校区详情
 * @param id 校区ID
 * @returns Promise
 */
export function getCampusDetail(id: number) {
  return get(`${API_PREFIX}/system/campuses/${id}`)
    .then((response: any) => response.data);
}

/**
 * 创建校区
 * @param data 校区数据
 * @returns Promise
 */
export function createCampus(data: any) {
  return post(`${API_PREFIX}/system/campuses`, data)
    .then((response: any) => response.data);
}

/**
 * 更新校区
 * @param id 校区ID
 * @param data 校区数据
 * @returns Promise
 */
export function updateCampus(id: number, data: any) {
  return put(`${API_PREFIX}/system/campuses/${id}`, data)
    .then((response: any) => response.data);
}

/**
 * 删除校区
 * @param id 校区ID
 * @returns Promise
 */
export function deleteCampus(id: number) {
  return del(`${API_PREFIX}/system/campuses/${id}`)
    .then((response: any) => response.data);
}

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns Promise
 */
export function getUserList(params?: any) {
  return get(SYSTEM_USER_ENDPOINTS.BASE, { params })
    .then((response: any) => response.data);
}

/**
 * 获取用户详情
 * @param id 用户ID
 * @returns Promise
 */
export function getUserDetail(id: number) {
  return get(SYSTEM_USER_ENDPOINTS.GET_BY_ID(id))
    .then((response: any) => response.data);
}

/**
 * 创建用户
 * @param data 用户数据
 * @returns Promise
 */
export function createUser(data: any) {
  return post(SYSTEM_USER_ENDPOINTS.BASE, data)
    .then((response: any) => response.data);
}

/**
 * 更新用户
 * @param id 用户ID
 * @param data 用户数据
 * @returns Promise
 */
export function updateUser(id: number, data: any) {
  return put(SYSTEM_USER_ENDPOINTS.UPDATE(id), data)
    .then((response: any) => response.data);
}

/**
 * 删除用户
 * @param id 用户ID
 * @returns Promise
 */
export function deleteUser(id: number) {
  return del(SYSTEM_USER_ENDPOINTS.DELETE(id))
    .then((response: any) => response.data);
}

/**
 * 获取角色列表
 * @returns Promise
 */
export function getRoleList() {
  return get(SYSTEM_ROLE_ENDPOINTS.BASE)
    .then((response: any) => response.data);
}

/**
 * 获取字典数据
 * @param type 字典类型
 * @returns Promise
 */
export function getDictData(type: string) {
  return get(`${API_PREFIX}/system/dict/data/${type}`)
    .then((response: any) => response.data);
}

/**
 * 获取系统配置
 * @param key 配置键
 * @returns Promise
 */
export function getSystemConfig(key: string) {
  return get(`${API_PREFIX}/system-configs/${key}`)
    .then((response: any) => response.data);
}

/**
 * 更新系统配置
 * @param key 配置键
 * @param value 配置值
 * @returns Promise
 */
export function updateSystemConfig(key: string, value: any) {
  return put(`${API_PREFIX}/system-configs/${key}`, { value })
    .then((response: any) => response.data);
}

/**
 * 获取系统日志
 * @param params 查询参数
 * @returns Promise
 */
export function getSystemLogs(params?: any) {
  return get(SYSTEM_LOG_ENDPOINTS.BASE, { params })
    .then((response: any) => response.data);
}

/**
 * 清空系统日志
 * @returns Promise
 */
export function clearSystemLogs() {
  return del(SYSTEM_LOG_ENDPOINTS.CLEAR)
    .then((response: any) => response.data);
}

/**
 * 系统管理API服务
 */
export const systemApi = {
  /**
   * 获取校区列表
   */
  getCampuses(): Promise<ApiResponse<Campus[]>> {
    return get(`${API_PREFIX}/system/campuses`);
  },

  /**
   * 获取校区详情
   */
  getCampusById(id: string): Promise<ApiResponse<Campus>> {
    return get(`${API_PREFIX}/system/campuses/${id}`);
  },

  /**
   * 创建校区
   */
  createCampus(data: Partial<Campus>): Promise<ApiResponse<Campus>> {
    return post(`${API_PREFIX}/system/campuses`, data);
  },

  /**
   * 更新校区
   */
  updateCampus(id: string, data: Partial<Campus>): Promise<ApiResponse<Campus>> {
    return put(`${API_PREFIX}/system/campuses/${id}`, data);
  },

  /**
   * 删除校区
   */
  deleteCampus(id: string): Promise<ApiResponse<null>> {
    return del(`${API_PREFIX}/system/campuses/${id}`);
  },

  /**
   * 获取系统用户列表
   */
  getSystemUsers(params?: any): Promise<ApiResponse<{ users: SystemUser[]; total: number }>> {
    return get(SYSTEM_USER_ENDPOINTS.BASE, { params });
  },

  /**
   * 获取系统用户详情
   */
  getSystemUserById(id: string): Promise<ApiResponse<SystemUser>> {
    return get(SYSTEM_USER_ENDPOINTS.GET_BY_ID(id));
  },

  /**
   * 创建系统用户
   */
  createSystemUser(data: Partial<SystemUser>): Promise<ApiResponse<SystemUser>> {
    return post(SYSTEM_USER_ENDPOINTS.BASE, data);
  },

  /**
   * 更新系统用户
   */
  updateSystemUser(id: string, data: Partial<SystemUser>): Promise<ApiResponse<SystemUser>> {
    return put(SYSTEM_USER_ENDPOINTS.UPDATE(id), data);
  },

  /**
   * 删除系统用户
   */
  deleteSystemUser(id: string): Promise<ApiResponse<null>> {
    return del(SYSTEM_USER_ENDPOINTS.DELETE(id));
  },

  /**
   * 获取系统角色列表
   */
  getSystemRoles(): Promise<ApiResponse<SystemRole[]>> {
    return get(SYSTEM_ROLE_ENDPOINTS.BASE);
  },

  /**
   * 获取字典数据
   */
  getDictData(type: string): Promise<ApiResponse<DictItem[]>> {
    return get(`${API_PREFIX}/system/dict/data/${type}`);
  },

  /**
   * 获取系统配置
   */
  getSystemConfig(key: string): Promise<ApiResponse<SystemConfig>> {
    return get(`${API_PREFIX}/system-configs/${key}`);
  },

  /**
   * 更新系统配置
   */
  updateSystemConfig(key: string, value: any): Promise<ApiResponse<SystemConfig>> {
    return put(`${API_PREFIX}/system-configs/${key}`, { value });
  },

  /**
   * 获取系统日志列表
   */
  getSystemLogs(params?: any): Promise<ApiResponse<{ logs: SystemLog[]; total: number }>> {
    return get(SYSTEM_LOG_ENDPOINTS.BASE, { params });
  },

  /**
   * 清空系统日志
   */
  clearSystemLogs(): Promise<ApiResponse<null>> {
    return del(SYSTEM_LOG_ENDPOINTS.CLEAR);
  }
}; 