/**
 * 缓存失效中间件
 * 
 * 在数据更新操作后自动清除相关缓存
 */

import { Request, Response, NextFunction } from 'express';
import PermissionCacheService from '../services/permission-cache.service';

/**
 * 缓存失效操作类型
 */
export enum CacheInvalidationType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  USER_ROLE = 'user_role',
  ROLE_PERMISSION = 'role_permission',
  ALL = 'all'
}

/**
 * 缓存失效配置
 */
interface CacheInvalidationConfig {
  type: CacheInvalidationType;
  getUserId?: (req: Request) => number | number[];
  getRoleCode?: (req: Request) => string | string[];
  clearAll?: boolean;
}

/**
 * 创建缓存失效中间件
 * 
 * @param config 缓存失效配置
 * @returns Express中间件
 */
export function createCacheInvalidationMiddleware(config: CacheInvalidationConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 保存原始的res.json方法
    const originalJson = res.json.bind(res);

    // 重写res.json方法
    res.json = function(body: any) {
      // 只在成功响应时清除缓存
      if (body && body.success) {
        // 异步清除缓存，不阻塞响应
        setImmediate(async () => {
          try {
            await invalidateCache(config, req);
          } catch (error) {
            console.error('❌ 缓存失效失败:', error);
          }
        });
      }

      // 调用原始的json方法
      return originalJson(body);
    };

    next();
  };
}

/**
 * 执行缓存失效
 */
async function invalidateCache(config: CacheInvalidationConfig, req: Request): Promise<void> {
  const { type, getUserId, getRoleCode, clearAll } = config;

  console.log(`🗑️ 开始缓存失效: 类型=${type}`);

  try {
    if (clearAll) {
      await PermissionCacheService.clearAllCache();
      console.log('✅ 已清除所有权限缓存');
      return;
    }

    switch (type) {
      case CacheInvalidationType.USER:
        if (getUserId) {
          const userIds = getUserId(req);
          const ids = Array.isArray(userIds) ? userIds : [userIds];
          for (const userId of ids) {
            await PermissionCacheService.clearUserCache(userId);
            console.log(`✅ 已清除用户${userId}的缓存`);
          }
        }
        break;

      case CacheInvalidationType.ROLE:
        if (getRoleCode) {
          const roleCodes = getRoleCode(req);
          const codes = Array.isArray(roleCodes) ? roleCodes : [roleCodes];
          for (const roleCode of codes) {
            await PermissionCacheService.clearRoleCache(roleCode);
            console.log(`✅ 已清除角色${roleCode}的缓存`);
          }
        }
        // 角色变更影响所有用户，清除所有用户缓存
        await PermissionCacheService.clearAllCache();
        console.log('✅ 角色变更，已清除所有缓存');
        break;

      case CacheInvalidationType.PERMISSION:
        // 权限变更影响所有用户和角色
        await PermissionCacheService.clearAllCache();
        console.log('✅ 权限变更，已清除所有缓存');
        break;

      case CacheInvalidationType.USER_ROLE:
        // 用户角色关联变更，清除相关用户缓存
        if (getUserId) {
          const userIds = getUserId(req);
          const ids = Array.isArray(userIds) ? userIds : [userIds];
          for (const userId of ids) {
            await PermissionCacheService.clearUserCache(userId);
            console.log(`✅ 用户角色变更，已清除用户${userId}的缓存`);
          }
        }
        break;

      case CacheInvalidationType.ROLE_PERMISSION:
        // 角色权限关联变更，清除相关角色和所有用户缓存
        if (getRoleCode) {
          const roleCodes = getRoleCode(req);
          const codes = Array.isArray(roleCodes) ? roleCodes : [roleCodes];
          for (const roleCode of codes) {
            await PermissionCacheService.clearRoleCache(roleCode);
            console.log(`✅ 角色权限变更，已清除角色${roleCode}的缓存`);
          }
        }
        // 清除所有用户缓存，因为角色权限变更会影响所有拥有该角色的用户
        await PermissionCacheService.clearAllCache();
        console.log('✅ 角色权限变更，已清除所有用户缓存');
        break;

      case CacheInvalidationType.ALL:
        await PermissionCacheService.clearAllCache();
        console.log('✅ 已清除所有权限缓存');
        break;
    }
  } catch (error) {
    console.error('❌ 缓存失效执行失败:', error);
    throw error;
  }
}

/**
 * 预定义的缓存失效中间件
 */

// 用户创建/更新/删除后清除用户缓存
export const invalidateUserCache = createCacheInvalidationMiddleware({
  type: CacheInvalidationType.USER,
  getUserId: (req) => Number(req.params.id) || Number(req.body.id)
});

// 角色创建/更新/删除后清除所有缓存
export const invalidateRoleCache = createCacheInvalidationMiddleware({
  type: CacheInvalidationType.ROLE,
  getRoleCode: (req) => req.body.code || req.params.code
});

// 权限创建/更新/删除后清除所有缓存
export const invalidatePermissionCache = createCacheInvalidationMiddleware({
  type: CacheInvalidationType.PERMISSION
});

// 用户角色关联变更后清除用户缓存
export const invalidateUserRoleCache = createCacheInvalidationMiddleware({
  type: CacheInvalidationType.USER_ROLE,
  getUserId: (req) => {
    // 支持单个用户ID或用户ID数组
    if (req.body.userId) {
      return Number(req.body.userId);
    }
    if (req.body.userIds && Array.isArray(req.body.userIds)) {
      return req.body.userIds.map((id: any) => Number(id));
    }
    if (req.params.userId) {
      return Number(req.params.userId);
    }
    return 0;
  }
});

// 角色权限关联变更后清除角色和所有用户缓存
export const invalidateRolePermissionCache = createCacheInvalidationMiddleware({
  type: CacheInvalidationType.ROLE_PERMISSION,
  getRoleCode: (req) => {
    if (req.body.roleCode) {
      return req.body.roleCode;
    }
    if (req.params.roleCode) {
      return req.params.roleCode;
    }
    // 如果有roleId，需要查询roleCode（这里简化处理）
    return '';
  }
});

// 清除所有缓存
export const invalidateAllCache = createCacheInvalidationMiddleware({
  type: CacheInvalidationType.ALL,
  clearAll: true
});

/**
 * 批量缓存失效中间件
 * 用于批量操作后清除多个用户的缓存
 */
export const invalidateBatchUserCache = createCacheInvalidationMiddleware({
  type: CacheInvalidationType.USER,
  getUserId: (req) => {
    // 从请求体中获取用户ID数组
    if (req.body.userIds && Array.isArray(req.body.userIds)) {
      return req.body.userIds.map((id: any) => Number(id));
    }
    // 从响应数据中获取（需要在响应后处理）
    return [];
  }
});

export default {
  createCacheInvalidationMiddleware,
  invalidateUserCache,
  invalidateRoleCache,
  invalidatePermissionCache,
  invalidateUserRoleCache,
  invalidateRolePermissionCache,
  invalidateAllCache,
  invalidateBatchUserCache
};

