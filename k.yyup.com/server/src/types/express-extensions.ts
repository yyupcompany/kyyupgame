/**
 * Express.js 扩展类型定义
 * 为Request对象添加自定义属性
 */

import { Request } from 'express';

// 简化的用户类型
interface SimpleUser {
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

// 租户信息类型
interface TenantInfo {
  tenantCode: string;
  databaseName: string;
  domain: string;
}

// 扩展Express Request接口
declare global {
	namespace Express {
		interface Request {
			user?: SimpleUser;
			tenant?: {
				code: string;
				domain: string;
				databaseName: string;
			};
			tenantInfo?: TenantInfo;
			tenantDb?: any;
		}
	}
}

export { SimpleUser, TenantInfo };