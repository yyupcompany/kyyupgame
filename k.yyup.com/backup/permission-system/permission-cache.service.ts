/**
 * 权限缓存服务
 * 
 * 提供权限相关的缓存功能：
 * - 用户权限缓存
 * - 角色权限缓存
 * - 动态路由缓存
 * - 权限检查缓存
 */

import RedisService from './redis.service';
import { RedisTTL, RedisKeyPrefix } from '../config/redis.config';
import { sequelize } from '../database';
import { QueryTypes } from 'sequelize';

/**
 * 权限数据接口
 */
interface PermissionData {
  id: number;
  name: string;
  chinese_name: string;
  code: string;
  type: string;
  parent_id: number | null;
  path: string;
  component: string;
  file_path: string;
  permission: string;
  icon: string;
  sort: number;
  status: number;
}

/**
 * 用户权限信息接口
 */
interface UserPermissionInfo {
  permissions: string[];
  roles: string[];
  isAdmin: boolean;
}

class PermissionCacheService {
  /**
   * 获取用户权限列表（带缓存）
   * @param userId 用户ID
   * @returns 权限代码数组
   */
  static async getUserPermissions(userId: number): Promise<string[]> {
    const cacheKey = `${RedisKeyPrefix.USER_PERMISSIONS}${userId}`;
    
    try {
      // 1. 尝试从缓存获取
      const cached = await RedisService.get<string[]>(cacheKey);
      if (cached && Array.isArray(cached)) {
        console.log(`✅ 命中权限缓存: 用户${userId}, ${cached.length}个权限`);
        return cached;
      }

      // 2. 从数据库查询
      console.log(`🔍 从数据库查询用户权限: 用户${userId}`);
      const startTime = Date.now();

      // 检查用户角色
      const userRoles = await sequelize.query<{ code: string }>(`
        SELECT DISTINCT r.code
        FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = :userId AND r.status = 1
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      if (userRoles.length === 0) {
        console.warn(`⚠️ 用户没有角色: ${userId}`);
        return [];
      }

      const roleCodes = userRoles.map(r => r.code);
      const isAdmin = roleCodes.some(code => code === 'admin' || code === 'super_admin');

      let permissions: string[] = [];

      if (isAdmin) {
        // 管理员获取所有权限
        const allPermissions = await sequelize.query<{ code: string }>(`
          SELECT DISTINCT code
          FROM permissions
          WHERE status = 1 AND code IS NOT NULL AND code != ''
          ORDER BY sort, id
        `, {
          type: QueryTypes.SELECT
        });

        permissions = allPermissions.map(p => p.code);
      } else {
        // 普通用户查询权限
        const userPermissions = await sequelize.query<{ code: string }>(`
          SELECT DISTINCT p.code
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          INNER JOIN roles r ON rp.role_id = r.id
          INNER JOIN user_roles ur ON r.id = ur.role_id
          WHERE ur.user_id = :userId
            AND p.status = 1
            AND r.status = 1
            AND p.code IS NOT NULL
            AND p.code != ''
          ORDER BY p.sort, p.id
        `, {
          replacements: { userId },
          type: QueryTypes.SELECT
        });

        permissions = userPermissions.map(p => p.code);
      }

      const queryTime = Date.now() - startTime;
      console.log(`📊 数据库查询完成: 用户${userId}, ${permissions.length}个权限, 耗时${queryTime}ms`);

      // 3. 写入缓存
      if (permissions.length > 0) {
        await RedisService.set(cacheKey, permissions, RedisTTL.USER_PERMISSIONS);
        console.log(`💾 权限已缓存: 用户${userId}, TTL=${RedisTTL.USER_PERMISSIONS}秒`);
      }

      return permissions;
    } catch (error) {
      console.error(`❌ 获取用户权限失败: 用户${userId}`, error);
      return [];
    }
  }

  /**
   * 获取角色权限列表（带缓存）
   * @param roleCode 角色代码
   * @returns 权限代码数组
   */
  static async getRolePermissions(roleCode: string): Promise<string[]> {
    const cacheKey = `${RedisKeyPrefix.ROLE_PERMISSIONS}${roleCode}`;
    
    try {
      // 1. 尝试从缓存获取
      const cached = await RedisService.get<string[]>(cacheKey);
      if (cached && Array.isArray(cached)) {
        console.log(`✅ 命中角色权限缓存: ${roleCode}, ${cached.length}个权限`);
        return cached;
      }

      // 2. 从数据库查询
      console.log(`🔍 从数据库查询角色权限: ${roleCode}`);
      const startTime = Date.now();

      const rolePermissions = await sequelize.query<{ code: string }>(`
        SELECT DISTINCT p.code
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN roles r ON rp.role_id = r.id
        WHERE r.code = :roleCode
          AND p.status = 1
          AND r.status = 1
          AND p.code IS NOT NULL
          AND p.code != ''
        ORDER BY p.sort, p.id
      `, {
        replacements: { roleCode },
        type: QueryTypes.SELECT
      });

      const permissions = rolePermissions.map(p => p.code);
      const queryTime = Date.now() - startTime;
      console.log(`📊 数据库查询完成: 角色${roleCode}, ${permissions.length}个权限, 耗时${queryTime}ms`);

      // 3. 写入缓存
      if (permissions.length > 0) {
        await RedisService.set(cacheKey, permissions, RedisTTL.ROLE_PERMISSIONS);
        console.log(`💾 角色权限已缓存: ${roleCode}, TTL=${RedisTTL.ROLE_PERMISSIONS}秒`);
      }

      return permissions;
    } catch (error) {
      console.error(`❌ 获取角色权限失败: ${roleCode}`, error);
      return [];
    }
  }

  /**
   * 获取用户动态路由（带缓存）
   * @param userId 用户ID
   * @returns 权限数据数组
   */
  static async getDynamicRoutes(userId: number): Promise<PermissionData[]> {
    const cacheKey = `${RedisKeyPrefix.DYNAMIC_ROUTES}${userId}`;
    
    try {
      // 1. 尝试从缓存获取
      const cached = await RedisService.get<PermissionData[]>(cacheKey);
      if (cached && Array.isArray(cached)) {
        console.log(`✅ 命中动态路由缓存: 用户${userId}, ${cached.length}条路由`);
        return cached;
      }

      // 2. 从数据库查询
      console.log(`🔍 从数据库查询动态路由: 用户${userId}`);
      const startTime = Date.now();

      // 检查用户角色
      const userRoles = await sequelize.query<{ code: string }>(`
        SELECT DISTINCT r.code
        FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = :userId AND r.status = 1
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      if (userRoles.length === 0) {
        console.warn(`⚠️ 用户没有角色: ${userId}`);
        return [];
      }

      const roleCodes = userRoles.map(r => r.code);
      const isAdmin = roleCodes.some(code => code === 'admin' || code === 'super_admin');

      let routes: PermissionData[] = [];

      if (isAdmin) {
        // 管理员获取所有路由
        routes = await sequelize.query<PermissionData>(`
          SELECT
            p.id,
            p.name,
            p.chinese_name,
            p.code,
            p.type,
            p.parent_id,
            p.path,
            p.component,
            p.file_path,
            p.permission,
            p.icon,
            p.sort,
            p.status
          FROM permissions p
          WHERE p.status = 1
          ORDER BY p.sort, p.id
        `, {
          type: QueryTypes.SELECT
        });
      } else {
        // 普通用户查询路由
        routes = await sequelize.query<PermissionData>(`
          SELECT DISTINCT
            p.id,
            p.name,
            p.chinese_name,
            p.code,
            p.type,
            p.parent_id,
            p.path,
            p.component,
            p.file_path,
            p.permission,
            p.icon,
            p.sort,
            p.status
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          INNER JOIN roles r ON rp.role_id = r.id
          INNER JOIN user_roles ur ON r.id = ur.role_id
          WHERE ur.user_id = :userId
            AND p.status = 1
            AND r.status = 1
          ORDER BY p.sort, p.id
        `, {
          replacements: { userId },
          type: QueryTypes.SELECT
        });
      }

      const queryTime = Date.now() - startTime;
      console.log(`📊 数据库查询完成: 用户${userId}, ${routes.length}条路由, 耗时${queryTime}ms`);

      // 3. 写入缓存
      if (routes.length > 0) {
        await RedisService.set(cacheKey, routes, RedisTTL.DYNAMIC_ROUTES);
        console.log(`💾 动态路由已缓存: 用户${userId}, TTL=${RedisTTL.DYNAMIC_ROUTES}秒`);
      }

      return routes;
    } catch (error) {
      console.error(`❌ 获取动态路由失败: 用户${userId}`, error);
      return [];
    }
  }

  /**
   * 检查用户是否有指定权限（带缓存）
   * @param userId 用户ID
   * @param permissionCode 权限代码
   * @returns 是否有权限
   */
  static async checkPermission(userId: number, permissionCode: string): Promise<boolean> {
    const cacheKey = `${RedisKeyPrefix.PERMISSION_CHECK}${userId}:${permissionCode}`;

    try {
      // 1. 尝试从缓存获取
      const cached = await RedisService.get<boolean>(cacheKey);
      if (cached !== null) {
        console.log(`✅ 命中权限检查缓存: 用户${userId}, 权限${permissionCode}, 结果=${cached}`);
        return cached;
      }

      // 2. 从用户权限列表中检查
      const permissions = await this.getUserPermissions(userId);
      const hasPermission = permissions.includes(permissionCode);

      console.log(`🔍 权限检查: 用户${userId}, 权限${permissionCode}, 结果=${hasPermission}`);

      // 3. 写入缓存
      await RedisService.set(cacheKey, hasPermission, RedisTTL.PERMISSION_CHECK);

      return hasPermission;
    } catch (error) {
      console.error(`❌ 权限检查失败: 用户${userId}, 权限${permissionCode}`, error);
      return false;
    }
  }

  /**
   * 批量检查用户权限（带缓存）
   * @param userId 用户ID
   * @param permissionCodes 权限代码数组
   * @returns 权限检查结果对象
   */
  static async checkPermissions(userId: number, permissionCodes: string[]): Promise<Record<string, boolean>> {
    try {
      const permissions = await this.getUserPermissions(userId);
      const permissionSet = new Set(permissions);

      const results: Record<string, boolean> = {};
      for (const code of permissionCodes) {
        results[code] = permissionSet.has(code);
      }

      console.log(`🔍 批量权限检查: 用户${userId}, ${permissionCodes.length}个权限`);
      return results;
    } catch (error) {
      console.error(`❌ 批量权限检查失败: 用户${userId}`, error);
      return {};
    }
  }

  /**
   * 检查用户是否有访问路径的权限（带缓存）
   * @param userId 用户ID
   * @param path 路径
   * @returns 是否有权限
   */
  static async checkPathPermission(userId: number, path: string): Promise<boolean> {
    const cacheKey = `${RedisKeyPrefix.PATH_PERMISSION}${userId}:${path}`;

    try {
      // 1. 尝试从缓存获取
      const cached = await RedisService.get<boolean>(cacheKey);
      if (cached !== null) {
        console.log(`✅ 命中路径权限缓存: 用户${userId}, 路径${path}, 结果=${cached}`);
        return cached;
      }

      // 2. 查询路径对应的权限
      const permissions = await sequelize.query<{ code: string }>(`
        SELECT code
        FROM permissions
        WHERE status = 1 AND path = :path
        LIMIT 1
      `, {
        replacements: { path },
        type: QueryTypes.SELECT
      });

      if (permissions.length === 0) {
        console.warn(`⚠️ 路径权限不存在: ${path}`);
        await RedisService.set(cacheKey, false, RedisTTL.PATH_PERMISSION);
        return false;
      }

      // 3. 检查用户是否有该权限
      const hasPermission = await this.checkPermission(userId, permissions[0].code);

      // 4. 写入缓存
      await RedisService.set(cacheKey, hasPermission, RedisTTL.PATH_PERMISSION);

      return hasPermission;
    } catch (error) {
      console.error(`❌ 路径权限检查失败: 用户${userId}, 路径${path}`, error);
      return false;
    }
  }

  /**
   * 获取用户完整权限信息（带缓存）
   * @param userId 用户ID
   * @returns 用户权限信息
   */
  static async getUserPermissionInfo(userId: number): Promise<UserPermissionInfo> {
    const cacheKey = `${RedisKeyPrefix.USER_PERMISSION_INFO}${userId}`;

    try {
      // 1. 尝试从缓存获取
      const cached = await RedisService.get<UserPermissionInfo>(cacheKey);
      if (cached) {
        console.log(`✅ 命中用户权限信息缓存: 用户${userId}`);
        return cached;
      }

      // 2. 从数据库查询
      const userRoles = await sequelize.query<{ code: string }>(`
        SELECT DISTINCT r.code
        FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = :userId AND r.status = 1
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });

      if (userRoles.length === 0) {
        console.warn(`⚠️ 用户没有角色: ${userId}`);
        return { permissions: [], roles: [], isAdmin: false };
      }

      const roleCodes = userRoles.map(r => r.code);
      const isAdmin = roleCodes.some(code => code === 'admin' || code === 'super_admin');

      const permissions = await this.getUserPermissions(userId);

      const info: UserPermissionInfo = {
        permissions,
        roles: roleCodes,
        isAdmin
      };

      // 3. 写入缓存
      await RedisService.set(cacheKey, info, RedisTTL.USER_PERMISSION_INFO);
      console.log(`💾 用户权限信息已缓存: 用户${userId}`);

      return info;
    } catch (error) {
      console.error(`❌ 获取用户权限信息失败: 用户${userId}`, error);
      return { permissions: [], roles: [], isAdmin: false };
    }
  }

  /**
   * 清除用户权限缓存
   * @param userId 用户ID
   */
  static async clearUserCache(userId: number): Promise<void> {
    try {
      const patterns = [
        `${RedisKeyPrefix.USER_PERMISSIONS}${userId}`,
        `${RedisKeyPrefix.DYNAMIC_ROUTES}${userId}`,
        `${RedisKeyPrefix.USER_PERMISSION_INFO}${userId}`,
        `${RedisKeyPrefix.PERMISSION_CHECK}${userId}:*`,
        `${RedisKeyPrefix.PATH_PERMISSION}${userId}:*`
      ];

      for (const pattern of patterns) {
        if (pattern.includes('*')) {
          await RedisService.delPattern(pattern);
        } else {
          await RedisService.del(pattern);
        }
      }

      console.log(`🗑️ 已清除用户缓存: 用户${userId}`);
    } catch (error) {
      console.error(`❌ 清除用户缓存失败: 用户${userId}`, error);
    }
  }

  /**
   * 清除角色权限缓存
   * @param roleCode 角色代码
   */
  static async clearRoleCache(roleCode: string): Promise<void> {
    try {
      const cacheKey = `${RedisKeyPrefix.ROLE_PERMISSIONS}${roleCode}`;
      await RedisService.del(cacheKey);
      console.log(`🗑️ 已清除角色缓存: ${roleCode}`);
    } catch (error) {
      console.error(`❌ 清除角色缓存失败: ${roleCode}`, error);
    }
  }

  /**
   * 清除所有权限相关缓存
   */
  static async clearAllCache(): Promise<void> {
    try {
      const patterns = [
        `${RedisKeyPrefix.USER_PERMISSIONS}*`,
        `${RedisKeyPrefix.ROLE_PERMISSIONS}*`,
        `${RedisKeyPrefix.DYNAMIC_ROUTES}*`,
        `${RedisKeyPrefix.USER_PERMISSION_INFO}*`,
        `${RedisKeyPrefix.PERMISSION_CHECK}*`,
        `${RedisKeyPrefix.PATH_PERMISSION}*`
      ];

      for (const pattern of patterns) {
        await RedisService.delPattern(pattern);
      }

      console.log(`🗑️ 已清除所有权限缓存`);
    } catch (error) {
      console.error(`❌ 清除所有权限缓存失败`, error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  static async getCacheStats(): Promise<{
    userPermissions: number;
    rolePermissions: number;
    dynamicRoutes: number;
    permissionChecks: number;
    pathPermissions: number;
  }> {
    try {
      const stats = {
        userPermissions: 0,
        rolePermissions: 0,
        dynamicRoutes: 0,
        permissionChecks: 0,
        pathPermissions: 0
      };

      const patterns = [
        { key: 'userPermissions', pattern: `${RedisKeyPrefix.USER_PERMISSIONS}*` },
        { key: 'rolePermissions', pattern: `${RedisKeyPrefix.ROLE_PERMISSIONS}*` },
        { key: 'dynamicRoutes', pattern: `${RedisKeyPrefix.DYNAMIC_ROUTES}*` },
        { key: 'permissionChecks', pattern: `${RedisKeyPrefix.PERMISSION_CHECK}*` },
        { key: 'pathPermissions', pattern: `${RedisKeyPrefix.PATH_PERMISSION}*` }
      ];

      for (const { key, pattern } of patterns) {
        const keys = await RedisService.keys(pattern);
        stats[key as keyof typeof stats] = keys.length;
      }

      return stats;
    } catch (error) {
      console.error(`❌ 获取缓存统计失败`, error);
      return {
        userPermissions: 0,
        rolePermissions: 0,
        dynamicRoutes: 0,
        permissionChecks: 0,
        pathPermissions: 0
      };
    }
  }
}

export default PermissionCacheService;

