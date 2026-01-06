/**
 * 用户上下文提供服务
 * 从请求中提取用户上下文信息
 */

import { Request } from 'express';

export interface UserContext {
  userId?: number;
  kindergartenId?: number;
  phone?: string;
  username?: string;
  role?: string;
  permissions?: string[];
}

class UserContextProviderService {
  /**
   * 从请求中提取用户上下文
   */
  extractUserContextFromRequest(req: Request): UserContext {
    const user = (req as any).user;

    if (!user) {
      console.log('⚠️ [用户上下文] 未找到用户信息');
      return {};
    }

    return {
      userId: user.id,
      kindergartenId: user.kindergartenId,
      phone: user.phone,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    };
  }

  /**
   * 获取用户的幼儿园ID
   */
  getKindergartenId(req: Request): number | undefined {
    const context = this.extractUserContextFromRequest(req);
    return context.kindergartenId;
  }

  /**
   * 获取用户ID
   */
  getUserId(req: Request): number | undefined {
    const context = this.extractUserContextFromRequest(req);
    return context.userId;
  }

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(req: Request, permission: string): boolean {
    const context = this.extractUserContextFromRequest(req);
    return context.permissions?.includes(permission) || false;
  }
}

export const userContextProviderService = new UserContextProviderService();
export default userContextProviderService;

