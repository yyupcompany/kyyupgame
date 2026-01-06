import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
const PARENT_PERMISSION_ENDPOINTS = {
  PENDING: `${API_PREFIX}/parent-permissions/pending`,
  CONFIRM: (id: number) => `${API_PREFIX}/parent-permissions/${id}/confirm`,
  BATCH_CONFIRM: `${API_PREFIX}/parent-permissions/batch-confirm`,
  TOGGLE: (id: number) => `${API_PREFIX}/parent-permissions/${id}/toggle`,
  PARENT: (parentId: number) => `${API_PREFIX}/parent-permissions/parent/${parentId}`,
  REQUEST: `${API_PREFIX}/parent-permissions/request`,
  STATS: `${API_PREFIX}/parent-permissions/stats`
} as const;

/**
 * 家长权限管理API
 */
export const parentPermissionAPI = {
  /**
   * 获取待审核的权限申请列表
   */
  getPendingPermissions() {
    return request.get(PARENT_PERMISSION_ENDPOINTS.PENDING);
  },

  /**
   * 园长确认权限申请
   */
  confirmPermission(id: number, data: {
    approved: boolean;
    confirmNote?: string;
    rejectReason?: string;
    expiryDate?: string;
    isPermanent?: boolean;
  }) {
    return request.post(PARENT_PERMISSION_ENDPOINTS.CONFIRM(id), data);
  },

  /**
   * 批量确认权限申请
   */
  batchConfirmPermissions(data: {
    confirmationIds: number[];
    approved: boolean;
    confirmNote?: string;
    rejectReason?: string;
  }) {
    return request.post(PARENT_PERMISSION_ENDPOINTS.BATCH_CONFIRM, data);
  },

  /**
   * 暂停或恢复权限
   */
  togglePermission(id: number, suspend: boolean) {
    return request.put(PARENT_PERMISSION_ENDPOINTS.TOGGLE(id), { suspend });
  },

  /**
   * 获取家长的所有权限记录
   */
  getParentPermissions(parentId: number) {
    return request.get(PARENT_PERMISSION_ENDPOINTS.PARENT(parentId));
  },

  /**
   * 创建权限申请（家长主动申请）
   */
  createPermissionRequest(data: {
    studentId: number;
    permissionScope?: string;
    evidenceFiles?: string[];
    isPermanent?: boolean;
  }) {
    return request.post(PARENT_PERMISSION_ENDPOINTS.REQUEST, data);
  },

  /**
   * 获取园长的权限管理统计
   */
  getPermissionStats() {
    return request.get(PARENT_PERMISSION_ENDPOINTS.STATS);
  },

  /**
   * 检查家长权限状态
   */
  checkParentPermissionStatus(parentId: number, scope?: string) {
    const params = scope ? { scope } : {};
    return request.get(`/parent-permissions/check/${parentId}`, { params });
  }
};