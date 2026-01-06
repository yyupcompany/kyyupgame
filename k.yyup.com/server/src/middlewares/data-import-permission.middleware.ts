import { Request, Response, NextFunction } from 'express';
import { DataImportService } from '../services/data-import.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';

/**
 * 数据导入权限验证中间件
 * 包括关键词检测和权限预检功能
 */

interface DataImportRequest extends Request {
  importType?: string;
  hasImportPermission?: boolean;
}

export class DataImportPermissionMiddleware {
  private dataImportService: DataImportService;

  constructor() {
    this.dataImportService = new DataImportService();
  }

  /**
   * 检测数据导入意图的中间件
   */
  detectImportIntent = async (
    req: DataImportRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const { query, message, content } = req.body;
      const userQuery = query || message || content || '';

      if (!userQuery) {
        return next();
      }

      // 检测导入意图
      const importType = this.dataImportService.detectImportIntent(userQuery);
      
      if (importType) {
        req.importType = importType;
        logger.info('检测到数据导入意图', {
          userId: req.user?.id,
          importType,
          query: userQuery
        });
      }

      next();
    } catch (error) {
      logger.error('导入意图检测失败', { error });
      next(error);
    }
  };

  /**
   * 权限预检中间件
   */
  checkImportPermission = async (
    req: DataImportRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      // 如果没有检测到导入意图，直接通过
      if (!req.importType) {
        return next();
      }

      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      // 检查导入权限
      const hasPermission = await this.dataImportService.checkImportPermission(
        userId, 
        req.importType
      );

      if (!hasPermission) {
        logger.warn('用户无数据导入权限', {
          userId,
          importType: req.importType
        });

        res.status(403).json({
          success: false,
          message: `您没有${req.importType}数据导入权限，请联系管理员`,
          code: 'INSUFFICIENT_PERMISSION',
          data: {
            importType: req.importType,
            requiredPermission: this.getRequiredPermission(req.importType)
          }
        });
        return;
      }

      req.hasImportPermission = true;
      logger.info('数据导入权限验证通过', {
        userId,
        importType: req.importType
      });

      next();
    } catch (error) {
      logger.error('导入权限检查失败', { error });
      next(error);
    }
  };

  /**
   * 获取所需权限名称
   */
  private getRequiredPermission(importType: string): string {
    const permissionMap: Record<string, string> = {
      student: 'STUDENT_CREATE',
      parent: 'PARENT_MANAGE',
      teacher: 'TEACHER_MANAGE'
    };
    return permissionMap[importType] || 'UNKNOWN';
  }

  /**
   * 数据导入专用权限检查中间件
   * 用于数据导入相关的API路由
   */
  requireImportPermission = (importType: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          throw ApiError.unauthorized('用户未登录');
        }

        const hasPermission = await this.dataImportService.checkImportPermission(
          userId, 
          importType
        );

        if (!hasPermission) {
          throw ApiError.forbidden(
            `需要${importType}数据导入权限`,
            'INSUFFICIENT_IMPORT_PERMISSION'
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * 批量权限检查中间件
   * 检查用户是否有任意一种数据导入权限
   */
  requireAnyImportPermission = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      const importTypes = ['student', 'parent', 'teacher'];
      const permissions = await Promise.all(
        importTypes.map(type => 
          this.dataImportService.checkImportPermission(userId, type)
        )
      );

      const hasAnyPermission = permissions.some(permission => permission);

      if (!hasAnyPermission) {
        throw ApiError.forbidden(
          '需要数据导入权限',
          'NO_IMPORT_PERMISSION'
        );
      }

      // 将用户拥有的导入权限添加到请求对象
      (req as any).availableImportTypes = importTypes.filter((_, index) => permissions[index]);

      next();
    } catch (error) {
      next(error);
    }
  };
}

// 创建中间件实例
const dataImportPermissionMiddleware = new DataImportPermissionMiddleware();

// 导出中间件方法
export const {
  detectImportIntent,
  checkImportPermission,
  requireImportPermission,
  requireAnyImportPermission
} = dataImportPermissionMiddleware;

// 导出完整的中间件类
export default DataImportPermissionMiddleware;

/**
 * 组合中间件：检测意图 + 权限验证
 * 用于AI助手等需要智能检测的场景
 */
export const smartImportPermissionCheck = [
  detectImportIntent,
  checkImportPermission
];

/**
 * 数据导入权限预设
 */
export const importPermissionPresets = {
  student: requireImportPermission('student'),
  parent: requireImportPermission('parent'),
  teacher: requireImportPermission('teacher'),
  any: requireAnyImportPermission
};
