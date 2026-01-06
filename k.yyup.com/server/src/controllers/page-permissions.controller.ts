/**
 * 页面权限控制器 - Level 3: 页面操作权限管理
 * Page Permissions Controller - Level 3: Page Action Permissions Management
 * 
 * 功能：
 * 1. 获取页面内的操作权限（button类型）
 * 2. 批量权限验证
 * 3. 页面权限缓存管理
 */

import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { RouteCacheService } from '../services/route-cache.service';

/**
 * Level 3: 获取页面操作权限
 * GET /api/permissions/page-actions?pageId={pageId}
 */
export const getPageActions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { pageId, pagePath } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      });
      return;
    }

    console.log(`🔍 Level 3: 获取页面操作权限 - 页面ID: ${pageId}, 路径: ${pagePath}, 用户: ${userId}`);
    const startTime = Date.now();

    let pagePermissions: any[] = [];
    let fromCache = false;

    try {
      // 🚀 优先使用缓存获取页面权限
      if (RouteCacheService.isHealthy()) {
        console.log('✅ Level 3: 路由缓存健康，从缓存获取页面权限');
        
        const allRoutes = RouteCacheService.getCachedRoutes();
        
        // 获取指定页面的子权限（button类型）
        pagePermissions = allRoutes.filter((route: any) => {
          const isButtonType = route.type === 'button';
          const belongsToPage = pageId ? route.parent_id == pageId : route.path?.includes(pagePath as string);
          return route.status === 1 && isButtonType && belongsToPage;
        });

        fromCache = true;
        console.log(`📊 Level 3: 从缓存获取页面权限 ${pagePermissions.length} 条，耗时: ${Date.now() - startTime}ms`);
        
      } else {
        console.warn('⚠️ Level 3: 路由缓存不健康，降级到数据库查询');
        throw new Error('缓存不健康');
      }
    } catch (cacheError) {
      console.warn('⚠️ Level 3: 缓存获取失败，使用数据库查询:', (cacheError as Error).message);
      
      // 降级：数据库查询
      let whereCondition = '';
      let replacements: any = { userId };

      if (pageId) {
        whereCondition = 'AND p.parent_id = :pageId';
        replacements.pageId = pageId;
      } else if (pagePath) {
        whereCondition = 'AND p.path LIKE :pagePath';
        replacements.pagePath = `%${pagePath}%`;
      }

      if (userRole === 'admin') {
        // 管理员获取所有权限
        pagePermissions = await sequelize.query(`
          SELECT
            p.id,
            p.name,
            p.chinese_name,
            p.code,
            p.type,
            p.parent_id,
            p.path,
            p.component,
            p.permission,
            p.icon,
            p.sort,
            p.status
          FROM permissions p
          WHERE p.status = 1
            AND p.type = 'button'
            ${whereCondition}
          ORDER BY p.sort, p.id
        `, {
          replacements,
          type: QueryTypes.SELECT
        }) as any[];
      } else {
        // 普通用户只获取有权限的操作
        pagePermissions = await sequelize.query(`
          SELECT DISTINCT
            p.id,
            p.name,
            p.chinese_name,
            p.code,
            p.type,
            p.parent_id,
            p.path,
            p.component,
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
            AND p.type = 'button'
            ${whereCondition}
          ORDER BY p.sort, p.id
        `, {
          replacements,
          type: QueryTypes.SELECT
        }) as any[];
      }

      console.log(`📊 Level 3: 从数据库获取页面权限 ${pagePermissions.length} 条，耗时: ${Date.now() - startTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`⚡ Level 3: 页面权限获取完成，总耗时: ${totalTime}ms`);

    // 按功能分组权限
    const groupedPermissions = {
      actions: pagePermissions.filter(p => p.permission?.includes('_VIEW') || p.permission?.includes('_EDIT') || p.permission?.includes('_DELETE')),
      navigation: pagePermissions.filter(p => p.path && !p.permission),
      operations: pagePermissions.filter(p => p.permission && !p.permission.includes('_VIEW') && !p.permission.includes('_EDIT') && !p.permission.includes('_DELETE'))
    };

    res.json({
      success: true,
      data: {
        permissions: pagePermissions,
        grouped: groupedPermissions,
        summary: {
          total: pagePermissions.length,
          actions: groupedPermissions.actions.length,
          navigation: groupedPermissions.navigation.length,
          operations: groupedPermissions.operations.length
        }
      },
      meta: {
        userId,
        userRole,
        pageId,
        pagePath,
        fromCache,
        responseTime: totalTime,
        level: 3,
        description: '页面操作权限',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Level 3: 获取页面权限失败:', error);
    next(new ApiError(500, '获取页面权限失败'));
  }
};

/**
 * Level 3: 批量权限验证
 * POST /api/permissions/batch-check
 */
export const batchCheckPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { permissions: permissionsToCheck } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      });
      return;
    }

    if (!Array.isArray(permissionsToCheck) || permissionsToCheck.length === 0) {
      res.status(400).json({
        success: false,
        error: 'INVALID_PARAMS',
        message: '权限列表不能为空'
      });
      return;
    }

    console.log(`🔍 Level 3: 批量权限验证 - ${permissionsToCheck.length} 个权限，用户: ${userId}`);
    const startTime = Date.now();

    const results: { [key: string]: boolean } = {};

    // 管理员拥有所有权限
    if (userRole === 'admin') {
      permissionsToCheck.forEach(permission => {
        results[permission] = true;
      });
      
      console.log(`⚡ Level 3: 管理员批量权限验证完成，总耗时: ${Date.now() - startTime}ms`);
    } else {
      // 普通用户需要查询权限
      const permissionCodes = permissionsToCheck.map(p => `'${p}'`).join(',');
      
      const userPermissions = await sequelize.query(`
        SELECT DISTINCT p.code, p.path
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN roles r ON rp.role_id = r.id
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = :userId 
          AND p.status = 1
          AND r.status = 1
          AND (p.code IN (${permissionCodes}) OR p.path IN (${permissionCodes}))
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      }) as any[];

      const userPermissionCodes = new Set([
        ...userPermissions.map(p => p.code),
        ...userPermissions.map(p => p.path)
      ]);

      permissionsToCheck.forEach(permission => {
        results[permission] = userPermissionCodes.has(permission);
      });

      console.log(`⚡ Level 3: 批量权限验证完成，总耗时: ${Date.now() - startTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    const hasPermissionCount = Object.values(results).filter(Boolean).length;

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: permissionsToCheck.length,
          granted: hasPermissionCount,
          denied: permissionsToCheck.length - hasPermissionCount
        }
      },
      meta: {
        userId,
        userRole,
        responseTime: totalTime,
        level: 3,
        description: '批量权限验证',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Level 3: 批量权限验证失败:', error);
    next(new ApiError(500, '批量权限验证失败'));
  }
};