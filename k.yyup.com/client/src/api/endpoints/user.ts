/**
 * 用户管理相关API端点
 */
import { API_PREFIX } from './base';

// 用户管理接口
export const USER_ENDPOINTS = {
  BASE: `${API_PREFIX}users`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}users/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}users/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}users/${id}`,
  GET_PROFILE: `${API_PREFIX}users/profile`,
  UPDATE_PROFILE: `${API_PREFIX}users/profile`,
  UPDATE_ROLES: (id: number | string) => `${API_PREFIX}users/${id}/roles`,
  SEARCH: `${API_PREFIX}users/search`,
  EXPORT: `${API_PREFIX}users/export`,
  IMPORT: `${API_PREFIX}users/import`,
  BATCH_UPDATE: `${API_PREFIX}users/batch-update`,
  BATCH_DELETE: `${API_PREFIX}users/batch-delete`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}users/${id}/status`,
  RESET_PASSWORD: (id: number | string) => `${API_PREFIX}users/${id}/reset-password`,
} as const;

// 角色和权限接口
export const ROLE_ENDPOINTS = {
  BASE: `${API_PREFIX}roles`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}roles/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}roles/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}roles/${id}`,
  GET_PERMISSIONS: (id: number | string) => `${API_PREFIX}roles/${id}/permissions`,
  ASSIGN_PERMISSIONS: (id: number | string) => `${API_PREFIX}roles/${id}/permissions`,
  SEARCH: `${API_PREFIX}roles/search`,
  EXPORT: `${API_PREFIX}roles/export`,
  BATCH_DELETE: `${API_PREFIX}roles/batch-delete`,
} as const;

export const PERMISSION_ENDPOINTS = {
  BASE: `${API_PREFIX}permissions`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}permissions/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}permissions/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}permissions/${id}`,
  MY_PAGES: `${API_PREFIX}permissions/my-pages`,
  CHECK_PAGE: (pagePath: string) => `${API_PREFIX}permissions/check${String(pagePath).startsWith('/') ? '' : '/'}${pagePath}`,
  ROLE_PAGES: (roleId: number | string) => `${API_PREFIX}permissions/roles/${roleId}`,
  UPDATE_ROLE_PAGES: (roleId: number | string) => `${API_PREFIX}permissions/roles/${roleId}`,
  SEARCH: `${API_PREFIX}permissions/search`,
  EXPORT: `${API_PREFIX}permissions/export`,
  BATCH_DELETE: `${API_PREFIX}permissions/batch-delete`,
} as const;