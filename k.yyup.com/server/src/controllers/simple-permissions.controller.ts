/**
 * 简化的权限控制器 - 为前端提供统一的权限验证接口
 * 隐藏后端4层权限架构复杂性
 */

import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { RouteCacheService } from '../services/route-cache.service';

/**
 * 统一权限验证接口 - 前端只需要调用这一个API
 * POST /api/permissions/check
 */
export const checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { permission } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      });
      return;
    }

    if (!permission) {
      res.status(400).json({
        success: false,
        error: 'INVALID_PARAMS',
        message: '权限参数不能为空'
      });
      return;
    }

    console.log(`🔍 权限验证: 用户${userId} 检查权限 ${permission}`);
    const startTime = Date.now();

    // 管理员拥有所有权限
    if (userRole === 'admin') {
      const responseTime = Date.now() - startTime;
      res.json({
        success: true,
        data: {
          hasPermission: true,
          isAdmin: true
        },
        meta: {
          userId,
          userRole,
          permission,
          responseTime,
          fromCache: false,
          description: '管理员权限验证'
        }
      });
      return;
    }

    let hasPermission = false;
    let fromCache = false;

    try {
      // 优先使用缓存
      if (RouteCacheService.isHealthy()) {
        const allRoutes = RouteCacheService.getCachedRoutes();
        
        // 在所有权限中查找匹配的权限
        const matchedPermission = allRoutes.find((route: any) => 
          route.status === 1 && (
            route.code === permission ||
            route.permission === permission ||
            route.path?.includes(permission)
          )
        );

        if (matchedPermission) {
          // 检查用户是否有这个权限
          const userHasPermission = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN roles r ON rp.role_id = r.id
            INNER JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = :userId 
              AND p.id = :permissionId
              AND p.status = 1
              AND r.status = 1
          `, {
            replacements: { userId, permissionId: matchedPermission.id },
            type: QueryTypes.SELECT
          }) as any[];

          hasPermission = userHasPermission[0].count > 0;
          fromCache = true;
        }
      } else {
        throw new Error('缓存不健康');
      }
    } catch (cacheError) {
      console.warn('⚠️ 缓存查询失败，使用数据库查询:', (cacheError as Error).message);
      
      // 降级：直接数据库查询
      const userPermissions = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN roles r ON rp.role_id = r.id
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = :userId 
          AND p.status = 1
          AND r.status = 1
          AND (
            p.code = :permission OR 
            p.permission = :permission OR 
            p.path LIKE :permissionPattern
          )
      `, {
        replacements: { 
          userId, 
          permission,
          permissionPattern: `%${permission}%`
        },
        type: QueryTypes.SELECT
      }) as any[];

      hasPermission = userPermissions[0].count > 0;
    }

    const responseTime = Date.now() - startTime;
    console.log(`⚡ 权限验证完成: ${permission} -> ${hasPermission} (${responseTime}ms)`);

    res.json({
      success: true,
      data: {
        hasPermission,
        isAdmin: false
      },
      meta: {
        userId,
        userRole,
        permission,
        responseTime,
        fromCache,
        description: '权限验证'
      }
    });

  } catch (error) {
    console.error('❌ 权限验证失败:', error);
    next(new ApiError(500, '权限验证失败'));
  }
};

/**
 * 批量权限验证接口 - 优化多个权限查询
 * POST /api/permissions/batch-check
 * 
 * 注意：这个接口复用了之前实现的逻辑
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

    console.log(`🔍 批量权限验证: 用户${userId} 检查 ${permissionsToCheck.length} 个权限`);
    const startTime = Date.now();

    const results: { [key: string]: boolean } = {};

    // 管理员拥有所有权限
    if (userRole === 'admin') {
      permissionsToCheck.forEach(permission => {
        results[permission] = true;
      });
      
      const responseTime = Date.now() - startTime;
      res.json({
        success: true,
        data: {
          results,
          summary: {
            total: permissionsToCheck.length,
            granted: permissionsToCheck.length,
            denied: 0
          }
        },
        meta: {
          userId,
          userRole,
          responseTime,
          description: '批量权限验证（管理员）'
        }
      });
      return;
    }

    // 普通用户批量查询权限
    const permissionCodes = permissionsToCheck.map(p => `'${p}'`).join(',');
    
    const userPermissions = await sequelize.query(`
      SELECT DISTINCT p.code, p.permission, p.path
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = :userId 
        AND p.status = 1
        AND r.status = 1
        AND (
          p.code IN (${permissionCodes}) OR 
          p.permission IN (${permissionCodes}) OR
          p.path IN (${permissionCodes})
        )
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    }) as any[];

    const userPermissionSet = new Set([
      ...userPermissions.map(p => p.code),
      ...userPermissions.map(p => p.permission),
      ...userPermissions.map(p => p.path)
    ]);

    permissionsToCheck.forEach(permission => {
      results[permission] = userPermissionSet.has(permission);
    });

    const responseTime = Date.now() - startTime;
    const grantedCount = Object.values(results).filter(Boolean).length;

    console.log(`⚡ 批量权限验证完成: ${grantedCount}/${permissionsToCheck.length} 个权限通过 (${responseTime}ms)`);

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: permissionsToCheck.length,
          granted: grantedCount,
          denied: permissionsToCheck.length - grantedCount
        }
      },
      meta: {
        userId,
        userRole,
        responseTime,
        description: '批量权限验证'
      }
    });

  } catch (error) {
    console.error('❌ 批量权限验证失败:', error);
    next(new ApiError(500, '批量权限验证失败'));
  }
};