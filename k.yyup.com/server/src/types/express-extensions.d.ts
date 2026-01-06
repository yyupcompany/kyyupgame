/**
 * Express 扩展类型定义
 *
 * 扩展 Express Request 类型以支持自定义属性
 * 避免 using 'as any'
 */

import { UserRole } from '../models';

/**
 * 认证用户信息类型
 */
export interface AuthenticatedUser {
  id: number;
  username: string;
  role: string;
  email: string;
  realName: string;
  phone: string;
  status: string;
  isAdmin: boolean;
  kindergartenId?: number;
  globalUserId?: string;
  authSource?: string;
  tenantCode?: string;
  tenantDomain?: string;
  tenantDatabaseName?: string;
}

/**
 * 租户信息类型
 */
export interface TenantInfo {
  code: string;
  name: string;
  domain: string;
  databaseName: string;
  id?: number;
}

/**
 * 家长-学生关系信息
 */
export interface ParentStudentRelation {
  id: number;
  status: string;
  createdAt: Date;
  studentId: number;
  studentName: string;
}

/**
 * 家长-班级关系信息
 */
export interface ParentClassRelation {
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
}

/**
 * Sequelize Query Result 类型
 */
export type QueryResult<T = any> = [T[], any];

/**
 * Sequelize Insert Result 类型
 */
export interface InsertResult {
  insertId?: number;
  affectedRows?: number;
}

/**
 * Express 扩展类型定义
 */
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * 认证用户信息
     * 由认证中间件设置
     */
    user?: AuthenticatedUser;

    /**
     * 租户信息
     * 由租户解析中间件设置
     */
    tenant?: TenantInfo;

    /**
     * 租户数据库实例（共享连接池模式）
     */
    tenantDb?: any;

    /**
     * 家长-学生关系信息
     * 由家长权限中间件设置
     */
    parentStudentRelation?: ParentStudentRelation;

    /**
     * 家长-班级关系信息
     * 由家长班级权限中间件设置
     */
    parentClassRelation?: ParentClassRelation;

    /**
     * 家长孩子数量
     */
    parentChildrenCount?: number;
  }
}

/**
 * 导出所有类型
 */
export type {
  AuthenticatedUser,
  TenantInfo,
  ParentStudentRelation,
  ParentClassRelation,
  QueryResult,
  InsertResult
};
