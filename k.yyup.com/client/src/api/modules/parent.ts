// 家长管理模块API服务
import { request } from '../../utils/request';
import { PARENT_ENDPOINTS } from '../endpoints';
import { 
  transformParentFollowUpData,
  transformListResponse,
  transformParentFormData,
  transformParentFollowUpFormData
} from '../../utils/dataTransform';

/**
 * API响应类型
 */
export interface ApiResponseType<T = any> {
  items?: T[];
  total?: number;
  success?: boolean;
  message?: string;
  data?: {
    items?: T[];
    total?: number;
  } | T;
  [key: string]: any;
}

/**
 * 家长状态枚举
 */
export enum ParentStatus {
  POTENTIAL = '潜在家长',
  ACTIVE = '在读家长',
  GRADUATED = '毕业家长'
}

/**
 * 家长数据类型（后端返回）
 */
export interface ParentData {
  id: number | string;
  name: string;
  phone: string;
  email?: string;
  relation?: string;
  address?: string;
  studentId?: number | string;
  studentName?: string;
  userId?: number | string;
  status?: string;
  registerDate?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

/**
 * 家长前端展示类型
 */
export interface Parent {
  id: number | string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  registerDate?: string;
  source?: string;
  address?: string;
  children?: any[];
  followUpRecords?: any[];
  activities?: any[];
  avatar?: string;
}

/**
 * 跟进记录类型
 */
export interface FollowUpRecord {
  id: number | string;
  title: string;
  content?: string;
  time: string;
  type: string;
  creator: string;
}

/**
 * 家长查询参数
 */
export interface ParentListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 将后端数据转换为前端展示格式
 */
export function transformParentData(data: any): Parent {
  // 处理后端返回的数据结构，用户信息在 user 子对象中
  const user = data.user || {};

  return {
    id: data.id,
    name: data.name || user.realName || user.username || '未知',
    phone: data.phone || user.phone || '',
    email: data.email || user.email || '',
    status: data.status || ParentStatus.POTENTIAL,
    registerDate: data.registerDate || data.createdAt,
    source: data.source || '未知',
    address: data.address,
    avatar: data.avatar,
    children: [],
    followUpRecords: [],
    activities: []
  };
}

/**
 * 转换跟进记录格式
 */
export function transformFollowUpRecord(record: any): FollowUpRecord {
  return {
    id: record.id,
    title: record.title || record.content?.substring(0, 20) || '跟进记录',
    content: record.content,
    time: record.followupDate || record.createdAt,
    type: record.followupType || '电话沟通',
    creator: record.creatorName || '系统'
  };
}

/**
 * 家长管理API
 */
const parentApi = {
  /**
   * 获取家长列表
   * @param params 查询参数
   * @returns 家长列表和总数
   */
  getParentList(params?: ParentListParams): Promise<ApiResponseType<ParentData>> {
    return request.get(PARENT_ENDPOINTS.BASE, { params })
    .then((response: any) => {
      return transformListResponse(response, transformParentData);
    });
  },

  /**
   * 获取家长详情
   * @param id 家长ID
   * @returns 家长详情
   */
  getParentById(id: number | string): Promise<ApiResponseType<ParentData>> {
    return request.get(PARENT_ENDPOINTS.GET_BY_ID(id))
    .then((response: any) => {
      if (response.data) {
        response.data = transformParentData(response.data);
      }
      return response;
    });
  },

  /**
   * 创建家长
   * @param data 家长创建参数
   * @returns 创建结果
   */
  createParent(data: Partial<ParentData>): Promise<ApiResponseType<ParentData>> {
    const transformedData = transformParentFormData(data);
    return request.post(PARENT_ENDPOINTS.BASE, transformedData)
    .then((response: any) => {
      if (response.data) {
        response.data = transformParentData(response.data);
      }
      return response;
    });
  },

  /**
   * 更新家长
   * @param id 家长ID
   * @param data 家长更新参数
   * @returns 更新结果
   */
  updateParent(id: number | string, data: Partial<ParentData>): Promise<ApiResponseType<ParentData>> {
    const transformedData = transformParentFormData(data);
    return request.put(PARENT_ENDPOINTS.UPDATE(id), transformedData)
    .then((response: any) => {
      if (response.data) {
        response.data = transformParentData(response.data);
      }
      return response;
    });
  },

  /**
   * 删除家长
   * @param id 家长ID
   * @returns 删除结果
   */
  deleteParent(id: number | string): Promise<ApiResponseType<{ success: boolean }>> {
    return request.delete(PARENT_ENDPOINTS.DELETE(id));
  },

  /**
   * 获取家长关联的孩子
   * @param id 家长ID
   * @returns 孩子列表
   */
  getParentChildren(id: number | string): Promise<ApiResponseType<any[]>> {
    return request.get(PARENT_ENDPOINTS.GET_CHILDREN(id));
  },

  /**
   * 获取家长跟进记录
   * @param parentId 家长ID
   * @param params 查询参数
   * @returns 跟进记录列表
   */
  getFollowUpList(parentId: number | string, params?: any): Promise<ApiResponseType<any>> {
    return request.get(`${PARENT_ENDPOINTS.BASE}/${parentId}/followups`, { params })
    .then((response: any) => {
      return transformListResponse(response, transformParentFollowUpData);
    });
  },

  /**
   * 创建跟进记录
   * @param parentId 家长ID
   * @param data 跟进记录数据
   * @returns 创建结果
   */
  createFollowUp(parentId: number | string, data: any): Promise<ApiResponseType<any>> {
    const transformedData = transformParentFollowUpFormData(data);
    return request.post(`${PARENT_ENDPOINTS.BASE}/${parentId}/followups`, transformedData)
    .then((response: any) => {
      if (response.data) {
        response.data = transformParentFollowUpData(response.data);
      }
      return response;
    });
  }
};

export default parentApi; 