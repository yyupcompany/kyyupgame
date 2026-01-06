/**
 * 数据范围权限中间件
 * 
 * 功能：
 * 1. 根据用户的 dataScope 自动注入园区过滤条件
 * 2. 防止用户跨园访问数据
 * 3. 支持总园长查看所有园区数据
 * 
 * 使用方法：
 * router.get('/students', verifyToken, applyDataScope, studentController.list);
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 数据范围类型
 */
export enum DataScope {
  ALL = 'all',        // 全部园区（总园长、集团管理员）
  SINGLE = 'single',  // 单个园区（分园园长、教师、家长）
  NONE = 'none',      // 无数据访问权限
}

/**
 * 扩展Request接口，添加数据范围过滤条件
 */
declare global {
  namespace Express {
    interface Request {
      dataFilter?: {
        kindergartenId?: number;
        kindergartenIds?: number[];
        allowAll?: boolean;
      };
    }
  }
}

/**
 * 应用数据范围过滤中间件
 * 
 * 在 Service 层调用前自动注入园区过滤条件
 */
export const applyDataScope = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = req.user as any;

    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
        error: 'UNAUTHORIZED'
      });
      return;
    }

    const dataScope = user.dataScope || DataScope.SINGLE;

    console.log('[数据范围中间件] 应用数据范围过滤:', {
      userId: user.id,
      username: user.username,
      role: user.role,
      dataScope,
      primaryKindergartenId: user.primaryKindergartenId
    });

    // 初始化数据过滤对象
    req.dataFilter = {};

    switch (dataScope) {
      case DataScope.ALL:
        // 总园长/集团管理员：可访问所有园区
        req.dataFilter.allowAll = true;
        if (user.allowedKindergartenIds && user.allowedKindergartenIds.length > 0) {
          req.dataFilter.kindergartenIds = user.allowedKindergartenIds;
        }
        console.log('[数据范围中间件] 数据范围=ALL，允许访问所有园区');
        break;

      case DataScope.SINGLE:
        // 分园园长/教师/家长：只能访问本园区
        if (!user.primaryKindergartenId && !user.kindergartenId) {
          console.warn('[数据范围中间件] 用户无园区归属，拒绝访问');
          res.status(403).json({
            success: false,
            message: '您尚未分配园区，无法访问数据',
            error: 'NO_KINDERGARTEN_ASSIGNED'
          });
          return;
        }
        
        req.dataFilter.kindergartenId = user.primaryKindergartenId || user.kindergartenId;
        console.log('[数据范围中间件] 数据范围=SINGLE，限制为园区:', req.dataFilter.kindergartenId);
        break;

      case DataScope.NONE:
        // 无权限用户：禁止访问
        console.warn('[数据范围中间件] 数据范围=NONE，拒绝访问');
        res.status(403).json({
          success: false,
          message: '您没有数据访问权限',
          error: 'NO_DATA_ACCESS'
        });
        return;

      default:
        // 未知数据范围，默认限制为单园区
        console.warn('[数据范围中间件] 未知数据范围，默认为SINGLE');
        req.dataFilter.kindergartenId = user.primaryKindergartenId || user.kindergartenId;
    }

    next();
  } catch (error) {
    console.error('[数据范围中间件] 错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * 获取数据范围过滤条件
 * 在 Service 层使用，构建 Sequelize where 条件
 * 
 * @param req Express Request 对象
 * @returns 园区过滤条件对象
 * 
 * @example
 * const where = getDataScopeFilter(req);
 * const students = await Student.findAll({ where });
 */
export const getDataScopeFilter = (req: Request): any => {
  const filter = req.dataFilter || {};

  if (filter.allowAll) {
    // 允许访问所有园区，不添加过滤条件
    if (filter.kindergartenIds && filter.kindergartenIds.length > 0) {
      // 如果指定了允许的园区列表，限制在列表范围内
      return {
        kindergartenId: filter.kindergartenIds
      };
    }
    return {}; // 无限制
  }

  if (filter.kindergartenId) {
    // 限制为单个园区
    return {
      kindergartenId: filter.kindergartenId
    };
  }

  // 默认情况：无条件（理论上不应该到这里）
  console.warn('[数据范围中间件] 无有效过滤条件，返回空对象');
  return {};
};

/**
 * 检查用户是否可以访问指定园区的数据
 * 
 * @param req Express Request 对象
 * @param targetKindergartenId 目标园区ID
 * @returns 是否有权限访问
 * 
 * @example
 * if (!canAccessKindergarten(req, studentKindergartenId)) {
 *   throw new Error('无权访问该园区数据');
 * }
 */
export const canAccessKindergarten = (req: Request, targetKindergartenId: number): boolean => {
  const filter = req.dataFilter || {};

  if (filter.allowAll) {
    // 允许访问所有园区
    if (filter.kindergartenIds && filter.kindergartenIds.length > 0) {
      // 如果指定了允许的园区列表，检查是否在列表中
      return filter.kindergartenIds.includes(targetKindergartenId);
    }
    return true; // 无限制
  }

  if (filter.kindergartenId) {
    // 只能访问单个园区
    return filter.kindergartenId === targetKindergartenId;
  }

  // 默认不允许
  return false;
};

/**
 * 跨园数据访问审计日志
 * 
 * @param req Express Request 对象
 * @param action 操作类型（read/write/delete）
 * @param resourceType 资源类型（student/teacher/class等）
 * @param resourceId 资源ID
 * @param targetKindergartenId 目标园区ID
 */
export const logCrossKindergartenAccess = async (
  req: Request,
  action: 'read' | 'write' | 'delete',
  resourceType: string,
  resourceId: number,
  targetKindergartenId: number
): Promise<void> => {
  try {
    const user = req.user as any;
    const userKindergartenId = user?.primaryKindergartenId || user?.kindergartenId;

    // 只记录跨园访问
    if (userKindergartenId && userKindergartenId !== targetKindergartenId) {
      console.log('[跨园访问审计]', {
        userId: user?.id,
        username: user?.username,
        userKindergartenId,
        targetKindergartenId,
        action,
        resourceType,
        resourceId,
        timestamp: new Date().toISOString()
      });

      // TODO: 存储到数据库的审计日志表
      // await CrossKindergartenAccessLog.create({...});
    }
  } catch (error) {
    console.error('[跨园访问审计] 记录失败:', error);
    // 审计日志失败不影响业务流程
  }
};

/**
 * 强制数据范围中间件
 * 对于敏感操作，强制检查数据范围，即使是管理员也不例外
 * 
 * @param allowedScopes 允许的数据范围列表
 */
export const enforceDataScope = (allowedScopes: DataScope[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as any;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      const dataScope = user.dataScope || DataScope.SINGLE;

      if (!allowedScopes.includes(dataScope)) {
        console.warn('[强制数据范围检查] 权限不足:', {
          userId: user.id,
          dataScope,
          allowedScopes
        });

        res.status(403).json({
          success: false,
          message: '您没有执行此操作的权限',
          error: 'INSUFFICIENT_DATA_SCOPE'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('[强制数据范围检查] 错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
};

export default {
  applyDataScope,
  getDataScopeFilter,
  canAccessKindergarten,
  logCrossKindergartenAccess,
  enforceDataScope,
  DataScope
};
