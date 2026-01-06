/**
 * 权限控制器
 * 处理权限相关的API请求，包括动态路由生成
 *
 * 版本: v2.0 - Redis缓存优化版
 * 更新日期: 2025-01-06
 */

import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { RouteCacheService } from '../services/route-cache.service';
import PermissionCacheService from '../services/permission-cache.service';

/**
 * 缓存统计信息
 */
interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  avgResponseTime: number;
  avgCacheResponseTime: number;
  avgDbResponseTime: number;
}

// 全局缓存统计
const cacheStats: CacheStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cacheHitRate: 0,
  avgResponseTime: 0,
  avgCacheResponseTime: 0,
  avgDbResponseTime: 0
};

// 响应时间记录
const responseTimesCache: number[] = [];
const responseTimesDb: number[] = [];

/**
 * 更新缓存统计信息
 */
function updateCacheStats(): void {
  // 计算缓存命中率
  cacheStats.cacheHitRate = cacheStats.totalRequests > 0
    ? (cacheStats.cacheHits / cacheStats.totalRequests) * 100
    : 0;

  // 计算平均响应时间
  if (responseTimesCache.length > 0) {
    cacheStats.avgCacheResponseTime =
      responseTimesCache.reduce((a, b) => a + b, 0) / responseTimesCache.length;
  }

  if (responseTimesDb.length > 0) {
    cacheStats.avgDbResponseTime =
      responseTimesDb.reduce((a, b) => a + b, 0) / responseTimesDb.length;
  }

  // 计算总体平均响应时间
  const allTimes = [...responseTimesCache, ...responseTimesDb];
  if (allTimes.length > 0) {
    cacheStats.avgResponseTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
  }

  // 限制数组大小，只保留最近100次记录
  if (responseTimesCache.length > 100) {
    responseTimesCache.splice(0, responseTimesCache.length - 100);
  }
  if (responseTimesDb.length > 100) {
    responseTimesDb.splice(0, responseTimesDb.length - 100);
  }
}

/**
 * 获取缓存统计信息
 */
export const getCacheStats = async (req: Request, res: Response): Promise<void> => {
  try {
    updateCacheStats();

    // 获取Redis缓存统计
    const redisCacheStats = await PermissionCacheService.getCacheStats();

    res.json({
      success: true,
      data: {
        performance: {
          totalRequests: cacheStats.totalRequests,
          cacheHits: cacheStats.cacheHits,
          cacheMisses: cacheStats.cacheMisses,
          cacheHitRate: `${cacheStats.cacheHitRate.toFixed(2)}%`,
          avgResponseTime: `${cacheStats.avgResponseTime.toFixed(2)}ms`,
          avgCacheResponseTime: `${cacheStats.avgCacheResponseTime.toFixed(2)}ms`,
          avgDbResponseTime: `${cacheStats.avgDbResponseTime.toFixed(2)}ms`,
          performanceImprovement: cacheStats.avgDbResponseTime > 0
            ? `${((1 - cacheStats.avgCacheResponseTime / cacheStats.avgDbResponseTime) * 100).toFixed(2)}%`
            : 'N/A'
        },
        redis: redisCacheStats,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('❌ 获取缓存统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取缓存统计失败'
    });
  }
};

/**
 * 清除权限缓存
 */
export const clearPermissionCache = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roleCode, all } = req.body;

    if (all) {
      await PermissionCacheService.clearAllCache();
      console.log('🗑️ 已清除所有权限缓存');
    } else if (userId) {
      await PermissionCacheService.clearUserCache(userId);
      console.log(`🗑️ 已清除用户${userId}的缓存`);
    } else if (roleCode) {
      await PermissionCacheService.clearRoleCache(roleCode);
      console.log(`🗑️ 已清除角色${roleCode}的缓存`);
    } else {
      res.status(400).json({
        success: false,
        message: '请指定userId、roleCode或all参数'
      });
      return;
    }

    res.json({
      success: true,
      message: '缓存清除成功'
    });
  } catch (error) {
    console.error('❌ 清除缓存失败:', error);
    res.status(500).json({
      success: false,
      message: '清除缓存失败'
    });
  }
};

/**
 * 获取用户权限和动态路由 - Redis缓存优化版 v2.0
 */
export const getDynamicRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🚀 获取动态路由请求 (Redis缓存优化版 v2.0):', (req as any).user);
    const startTime = Date.now();

    // 从请求中获取用户信息
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    // 获取租户数据库名称（共享连接池模式）
    const tenantDatabaseName = (req as any).tenant?.databaseName || 'kindergarten';

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      });
      return;
    }

    // 更新统计
    cacheStats.totalRequests++;

    // 🚀 使用PermissionCacheService获取动态路由（传递租户数据库名称）
    let permissions: any[] = [];
    let fromCache = false;

    try {
      // 从Redis缓存获取
      permissions = await PermissionCacheService.getDynamicRoutes(userId, tenantDatabaseName);
      fromCache = true;

      const cacheTime = Date.now() - startTime;
      responseTimesCache.push(cacheTime);
      cacheStats.cacheHits++;

      console.log(`✅ 从Redis缓存获取 ${permissions.length} 条路由，耗时: ${cacheTime}ms`);
    } catch (cacheError) {
      console.error('❌ Redis缓存获取失败，降级到数据库:', (cacheError as Error).message);

      // 降级：直接从数据库查询（使用完整表名）
      fromCache = false;
      cacheStats.cacheMisses++;

      if (userRole === 'admin' || userRole === 'super_admin') {
        permissions = await sequelize.query(`
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
          FROM ${tenantDatabaseName}.permissions p
          WHERE p.status = 1
          ORDER BY p.sort, p.id
        `, {
          type: QueryTypes.SELECT
        }) as any[];
      } else {
        permissions = await sequelize.query(`
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
          FROM ${tenantDatabaseName}.permissions p
          INNER JOIN ${tenantDatabaseName}.role_permissions rp ON p.id = rp.permission_id
          INNER JOIN ${tenantDatabaseName}.roles r ON rp.role_id = r.id
          INNER JOIN ${tenantDatabaseName}.user_roles ur ON r.id = ur.role_id
          WHERE ur.user_id = :userId
            AND p.status = 1
            AND r.status = 1
          ORDER BY p.sort, p.id
        `, {
          replacements: { userId },
          type: QueryTypes.SELECT
        }) as any[];
      }

      const dbTime = Date.now() - startTime;
      responseTimesDb.push(dbTime);
      console.log(`📊 从数据库获取 ${permissions.length} 条路由，耗时: ${dbTime}ms`);
    }

    const totalTime = Date.now() - startTime;

    // 更新平均响应时间
    updateCacheStats();

    console.log(`⚡ 动态路由获取完成，总耗时: ${totalTime}ms, 缓存命中率: ${cacheStats.cacheHitRate.toFixed(2)}%`);

    res.json({
      success: true,
      data: {
        permissions,
        routes: buildDynamicRoutes(permissions as any[])
      },
      meta: {
        fromCache,
        responseTime: totalTime,
        cacheHitRate: cacheStats.cacheHitRate,
        cacheStats: {
          totalRequests: cacheStats.totalRequests,
          cacheHits: cacheStats.cacheHits,
          cacheMisses: cacheStats.cacheMisses
        },
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ 获取动态路由失败:', error);
    console.error('Error details:', (error as any).message);
    console.error('Stack:', (error as any).stack);
    next(new ApiError(500, '获取动态路由失败'));
  }
};

/**
 * 构建动态路由结构
 */
function buildDynamicRoutes(permissions: any[]): any[] {
  const routes: any[] = [];
  const categoryMap = new Map<number, any>();
  
  // 先创建所有分类（parent_id为空的是父级分类，包括category和menu类型）
  permissions.forEach(permission => {
    if ((permission.type === 'category' || permission.type === 'menu') && permission.parent_id === null) {
      const category = {
        id: permission.id,
        name: permission.name,
        code: permission.code,
        path: permission.path,
        icon: permission.icon,
        sort: permission.sort,
        children: []
      };
      categoryMap.set(permission.id, category);
      routes.push(category);
    }
  });
  
  // 然后添加菜单项到对应分类
  permissions.forEach(permission => {
    if (permission.type === 'menu' && permission.parent_id) {
      const parent = categoryMap.get(permission.parent_id);
      if (parent) {
        parent.children.push({
          id: permission.id,
          name: permission.name,
          code: permission.code,
          path: permission.path,
          component: permission.component,
          file_path: permission.file_path,
          permission: permission.permission,
          icon: permission.icon,
          sort: permission.sort,
          type: permission.type
        });
      }
    }
  });
  
  // 对分类和子项进行排序
  routes.sort((a, b) => a.sort - b.sort);
  routes.forEach(route => {
    if (route.children) {
      route.children.sort((a: any, b: any) => a.sort - b.sort);
    }
  });
  
  return routes;
}

/**
 * 获取用户权限列表 - Redis缓存优化版 v2.0
 */
export const getUserPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🚀 获取用户权限请求 (Redis缓存优化版 v2.0):', (req as any).user);
    const startTime = Date.now();

    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    // 获取租户数据库名称（共享连接池模式）
    const tenantDatabaseName = (req as any).tenant?.databaseName || 'kindergarten';

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      });
      return;
    }

    // 更新统计
    cacheStats.totalRequests++;

    let permissionCodes: string[] = [];
    let fromCache = false;

    // 🚀 使用PermissionCacheService获取用户权限（传递租户数据库名称）
    try {
      permissionCodes = await PermissionCacheService.getUserPermissions(userId, tenantDatabaseName);
      fromCache = true;

      const cacheTime = Date.now() - startTime;
      responseTimesCache.push(cacheTime);
      cacheStats.cacheHits++;

      console.log(`✅ 从Redis缓存获取 ${permissionCodes.length} 个权限，耗时: ${cacheTime}ms`);
    } catch (cacheError) {
      console.error('❌ Redis缓存获取失败:', (cacheError as Error).message);
      fromCache = false;
      cacheStats.cacheMisses++;

      // 降级：直接从数据库查询（使用完整表名）
      if (userRole === 'admin' || userRole === 'super_admin') {
        const permissions = await sequelize.query<{ code: string }>(`
          SELECT DISTINCT code
          FROM ${tenantDatabaseName}.permissions
          WHERE status = 1 AND code IS NOT NULL AND code != ''
          ORDER BY sort, id
        `, {
          type: QueryTypes.SELECT
        });
        permissionCodes = permissions.map(p => p.code);
      } else {
        const permissions = await sequelize.query<{ code: string }>(`
          SELECT DISTINCT p.code
          FROM ${tenantDatabaseName}.permissions p
          INNER JOIN ${tenantDatabaseName}.role_permissions rp ON p.id = rp.permission_id
          INNER JOIN ${tenantDatabaseName}.roles r ON rp.role_id = r.id
          INNER JOIN ${tenantDatabaseName}.user_roles ur ON r.id = ur.role_id
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
        permissionCodes = permissions.map(p => p.code);
      }

      const dbTime = Date.now() - startTime;
      responseTimesDb.push(dbTime);
      console.log(`📊 从数据库获取 ${permissionCodes.length} 个权限，耗时: ${dbTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    // 更新统计
    updateCacheStats();

    console.log(`⚡ 用户权限获取完成，总耗时: ${totalTime}ms, 缓存命中率: ${cacheStats.cacheHitRate.toFixed(2)}%`);

    res.json({
      success: true,
      data: permissionCodes || [],
      meta: {
        userId,
        userRole,
        isAdmin,
        fromCache,
        responseTime: totalTime,
        cacheHitRate: cacheStats.cacheHitRate,
        cacheStats: {
          totalRequests: cacheStats.totalRequests,
          cacheHits: cacheStats.cacheHits,
          cacheMisses: cacheStats.cacheMisses
        },
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ 获取用户权限失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户权限失败',
      message: (error as Error).message,
      timestamp: Date.now()
    });
  }
};

/**
 * 检查用户是否有特定权限
 */
export const checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { path, permission } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      });
      return;
    }

    // 验证必要参数
    if (!path && !permission) {
      res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: '缺少必要的权限检查参数'
      });
      return;
    }

    // 管理员拥有所有权限
    if (userRole === 'admin') {
      res.json({
        success: true,
        data: {
          hasPermission: true,
          isAdmin: true
        }
      });
      return;
    }

    // 特殊处理：允许教师访问创意课程页面及其子页面
    if (userRole === 'teacher' && (path === '/teacher-center/creative-curriculum' || path === '/teacher-center/creative-curriculum/interactive')) {
      res.json({
        success: true,
        data: {
          hasPermission: true,
          isAdmin: false
        }
      });
      return;
    }

    // 构建动态SQL查询条件
    let whereCondition = 'ur.user_id = :userId AND p.status = 1 AND r.status = 1';
    const replacements: any = { userId };

    if (path && permission) {
      whereCondition += ' AND (p.path = :path OR p.code = :permission)';
      replacements.path = path;
      replacements.permission = permission;
    } else if (path) {
      whereCondition += ' AND p.path = :path';
      replacements.path = path;
    } else if (permission) {
      whereCondition += ' AND p.code = :permission';
      replacements.permission = permission;
    }

    // 检查具体权限
    const results = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ${whereCondition}
    `, {
      replacements,
      type: QueryTypes.SELECT
    });

    // QueryTypes.SELECT 返回的是数组，需要取第一个元素
    const hasPermission = results && results.length > 0 && (results[0] as any).count > 0;

    res.json({
      success: true,
      data: {
        hasPermission,
        isAdmin: false
      }
    });

  } catch (error) {
    console.error('检查权限失败:', error);
    next(new ApiError(500, '检查权限失败'));
  }
};

/**
 * 获取所有可用的路由路径（用于路由表生成）- 优化版本（使用缓存）
 */
export const getAllRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🚀 获取所有路由请求 (缓存优化版)');
    const startTime = Date.now();

    let routes: any[] = [];
    let fromCache = false;

    // 🚀 优化：优先从缓存获取路由数据
    try {
      if (RouteCacheService.isHealthy()) {
        console.log('✅ 路由缓存健康，从缓存获取数据');
        
        // 从缓存获取所有路由，然后过滤
        const allRoutes = RouteCacheService.getCachedRoutes();
        routes = allRoutes.filter((route: any) => 
          route.status === 1 &&
          ['menu', 'button'].includes(route.type) &&
          route.path &&
          route.component
        );
        
        fromCache = true;
        console.log(`📊 从缓存获取并过滤 ${routes.length} 条路由，耗时: ${Date.now() - startTime}ms`);
        
      } else {
        console.warn('⚠️ 路由缓存不健康，降级到数据库查询');
        throw new Error('缓存不健康');
      }
    } catch (cacheError) {
      console.warn('⚠️ 缓存获取失败，降级到数据库查询:', (cacheError as Error).message);
      
      // 降级：从数据库查询
      const result = await sequelize.query(`
        SELECT
          p.path,
          p.component,
          p.file_path,
          p.name,
          p.code,
          p.type,
          p.parent_id,
          p.icon,
          p.sort
        FROM permissions p
        WHERE p.status = 1
          AND p.type IN ('menu', 'button')
          AND p.path IS NOT NULL
          AND p.component IS NOT NULL
        ORDER BY p.sort, p.id
      `, {
        type: QueryTypes.SELECT
      });

      routes = Array.isArray(result) ? result : [];
      console.log(`📊 从数据库获取 ${routes.length} 条路由，耗时: ${Date.now() - startTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`⚡ 所有路由获取完成，总耗时: ${totalTime}ms`);

    res.json({
      success: true,
      data: {
        routes: routes.map((route: any) => ({
          path: route.path,
          component: route.component,
          file_path: route.file_path,
          name: route.name,
          code: route.code,
          type: route.type,
          parent_id: route.parent_id,
          icon: route.icon,
          sort: route.sort,
          meta: {
            title: route.name,
            requiresAuth: true,
            permission: route.code
          }
        }))
      },
      meta: {
        fromCache,
        responseTime: totalTime,
        cacheStatus: RouteCacheService.isHealthy() ? 'healthy' : 'unhealthy',
        routeCount: routes.length,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ 获取所有路由失败:', error);
    next(new ApiError(500, '获取所有路由失败'));
  }
};