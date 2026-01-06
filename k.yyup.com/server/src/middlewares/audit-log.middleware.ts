import { Request, Response, NextFunction } from 'express';
import { OperationLog, OperationType, OperationResult } from '../models/operation-log.model';
import { logger } from '../utils/logger';

/**
 * 审计日志中间件
 * 自动记录所有CRUD操作的审计日志
 */

interface AuditLogOptions {
  module: string;           // 模块名称
  resourceType?: string;    // 资源类型
  action?: string;          // 自定义操作名称
  skipLogging?: boolean;    // 跳过日志记录
}

/**
 * 从HTTP方法映射到操作类型
 */
const mapMethodToOperationType = (method: string): OperationType => {
  switch (method.toUpperCase()) {
    case 'POST':
      return OperationType.CREATE;
    case 'GET':
      return OperationType.READ;
    case 'PUT':
    case 'PATCH':
      return OperationType.UPDATE;
    case 'DELETE':
      return OperationType.DELETE;
    default:
      return OperationType.OTHER;
  }
};

/**
 * 从路径提取资源ID
 */
const extractResourceId = (path: string): string | null => {
  const matches = path.match(/\/(\d+)(?:\/|$)/);
  return matches ? matches[1] : null;
};

/**
 * 生成操作描述
 */
const generateDescription = (method: string, path: string, module: string): string => {
  const operationType = mapMethodToOperationType(method);
  const resourceId = extractResourceId(path);
  
  const actionMap = {
    [OperationType.CREATE]: '创建',
    [OperationType.READ]: '查询',
    [OperationType.UPDATE]: '更新',
    [OperationType.DELETE]: '删除',
    [OperationType.OTHER]: '操作'
  };
  
  const action = actionMap[operationType];
  const resource = resourceId ? `ID为${resourceId}的` : '';
  
  return `${action}${resource}${module}`;
};

/**
 * 审计日志中间件工厂函数
 */
export const auditLog = (options: AuditLogOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (options.skipLogging) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseData: any = null;
    let operationResult = OperationResult.SUCCESS;
    let resultMessage: string | null = null;

    // 拦截响应数据
    res.send = function(data: any) {
      responseData = data;
      if (res.statusCode >= 400) {
        operationResult = OperationResult.FAILED;
        try {
          const parsed = JSON.parse(data);
          resultMessage = parsed.message || '操作失败';
        } catch {
          resultMessage = '操作失败';
        }
      }
      return originalSend.call(this, data);
    };

    res.json = function(data: any) {
      responseData = data;
      if (res.statusCode >= 400) {
        operationResult = OperationResult.FAILED;
        resultMessage = data.message || '操作失败';
      }
      return originalJson.call(this, data);
    };

    // 继续处理请求
    next();

    // 请求完成后记录日志
    res.on('finish', async () => {
      try {
        const executionTime = Date.now() - startTime;
        const userId = req.user?.id || null;
        const operationType = mapMethodToOperationType(req.method);
        const resourceId = extractResourceId(req.path);
        const action = options.action || req.method.toLowerCase();
        const description = generateDescription(req.method, req.path, options.module);

        // 异步记录审计日志
        setImmediate(async () => {
          try {
            await OperationLog.create({
              userId,
              module: options.module,
              action,
              operationType,
              resourceType: options.resourceType || options.module,
              resourceId,
              description,
              requestMethod: req.method,
              requestUrl: req.originalUrl,
              requestParams: JSON.stringify({
                query: req.query,
                body: req.body,
                params: req.params
              }),
              requestIp: req.ip || req.connection.remoteAddress || null,
              userAgent: req.get('User-Agent') || null,
              deviceInfo: req.get('User-Agent') || null,
              operationResult,
              resultMessage,
              executionTime,
            });

            logger.info('审计日志记录成功', {
              userId,
              module: options.module,
              action,
              operationType,
              executionTime
            });
          } catch (error) {
            logger.error('审计日志记录失败', {
              error: error instanceof Error ? error.message : 'Unknown error',
              userId,
              module: options.module,
              action
            });
          }
        });
      } catch (error) {
        logger.error('审计日志中间件错误', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  };
};

/**
 * 常用模块的审计日志中间件
 */
export const auditLogPresets = {
  student: auditLog({ module: '学生管理', resourceType: 'student' }),
  parent: auditLog({ module: '家长管理', resourceType: 'parent' }),
  teacher: auditLog({ module: '教师管理', resourceType: 'teacher' }),
  user: auditLog({ module: '用户管理', resourceType: 'user' }),
  role: auditLog({ module: '角色管理', resourceType: 'role' }),
  permission: auditLog({ module: '权限管理', resourceType: 'permission' }),
  enrollment: auditLog({ module: '招生管理', resourceType: 'enrollment' }),
  activity: auditLog({ module: '活动管理', resourceType: 'activity' }),
  class: auditLog({ module: '班级管理', resourceType: 'class' }),
  system: auditLog({ module: '系统管理', resourceType: 'system' }),
  dataImport: auditLog({ module: '数据导入', resourceType: 'data_import' })
};
