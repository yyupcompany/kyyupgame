/**
 * 注册来源标识中间件
 *
 * 🔒 等保三级要求：
 * - 区分Demo环境和正式环境的用户注册
 * - Demo用户数据应该与正式用户数据隔离
 * - 记录用户注册来源用于审计追踪
 *
 * 功能：
 * 1. 根据请求域名识别注册来源（Demo/正式）
 * 2. 在request对象中附加来源信息
 * 3. 记录到审计日志
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 注册来源类型
 */
export enum RegistrationSource {
  DEMO = 'demo',                    // k.yyup.cc - Demo环境
  PRODUCTION = 'production',        // rent.yyup.cc - 正式环境
  UNKNOWN = 'unknown',              // 未知来源
  ADMIN = 'admin',                  // 管理后台
  API = 'api',                      // API调用
}

/**
 * 扩展Request接口，添加注册来源信息
 */
declare global {
  namespace Express {
    interface Request {
      registrationSource?: RegistrationSource;
      isDemoMode?: boolean;
      isProductionMode?: boolean;
      sourceDomain?: string;
    }
  }
}

/**
 * 域名配置映射
 */
const DOMAIN_CONFIG: Record<string, RegistrationSource> = {
  'k.yyup.cc': RegistrationSource.DEMO,
  'www.k.yyup.cc': RegistrationSource.DEMO,
  'localhost:5173': RegistrationSource.DEMO,
  'localhost:3000': RegistrationSource.DEMO,

  'rent.yyup.cc': RegistrationSource.PRODUCTION,
  'www.rent.yyup.cc': RegistrationSource.PRODUCTION,

  'admin.yyup.cc': RegistrationSource.ADMIN,
  'k.yyup.com': RegistrationSource.PRODUCTION,
};

/**
 * 注册来源检测中间件
 *
 * @example
 * router.use(detectRegistrationSource);
 */
export const detectRegistrationSource = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const host = req.headers.host?.toLowerCase() || '';
    const referer = req.headers.referer?.toLowerCase() || '';

    // 提取域名（去掉端口和路径）
    const domain = host.split(':')[0];
    const refererDomain = referer ? new URL(referer).hostname : '';

    // 检测注册来源
    let detectedSource = RegistrationSource.UNKNOWN;

    // 1. 优先检查直接访问域名
    for (const [configuredDomain, source] of Object.entries(DOMAIN_CONFIG)) {
      if (domain === configuredDomain || domain.endsWith(`.${configuredDomain}`)) {
        detectedSource = source;
        break;
      }
    }

    // 2. 如果没检测到，检查Referer
    if (detectedSource === RegistrationSource.UNKNOWN && refererDomain) {
      for (const [configuredDomain, source] of Object.entries(DOMAIN_CONFIG)) {
        if (refererDomain === configuredDomain || refererDomain.endsWith(`.${configuredDomain}`)) {
          detectedSource = source;
          break;
        }
      }
    }

    // 3. 根据User-Agent判断（移动端API等）
    if (detectedSource === RegistrationSource.UNKNOWN) {
      const userAgent = req.headers['user-agent']?.toLowerCase() || '';
      if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('ios')) {
        detectedSource = RegistrationSource.API;
      }
    }

    // 附加到request对象
    req.registrationSource = detectedSource;
    req.sourceDomain = domain;
    req.isDemoMode = detectedSource === RegistrationSource.DEMO;
    req.isProductionMode = detectedSource === RegistrationSource.PRODUCTION;

    // 记录检测日志
    console.log('[注册来源检测]', {
      domain,
      refererDomain,
      detectedSource,
      isDemoMode: req.isDemoMode,
      isProductionMode: req.isProductionMode,
      path: req.path,
      ip: req.ip,
    });

    next();
  } catch (error) {
    console.error('[注册来源检测] 检测失败:', error);
    // 检测失败时设置为UNKNOWN，不影响业务流程
    req.registrationSource = RegistrationSource.UNKNOWN;
    req.isDemoMode = false;
    req.isProductionMode = false;
    next();
  }
};

/**
 * 验证注册来源中间件
 * 用于限制某些接口只能从特定来源访问
 *
 * @example
 * // 只允许正式环境访问
 * router.post('/register', detectRegistrationSource, validateRegistrationSource([RegistrationSource.PRODUCTION]), registerHandler);
 */
export const validateRegistrationSource = (allowedSources: RegistrationSource[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentSource = req.registrationSource || RegistrationSource.UNKNOWN;

    if (!allowedSources.includes(currentSource)) {
      console.warn('[注册来源验证] 来源不被允许', {
        currentSource,
        allowedSources,
        path: req.path,
        ip: req.ip,
      });

      res.status(403).json({
        success: false,
        message: '该操作不允许从当前来源访问',
        error: 'SOURCE_NOT_ALLOWED',
        details: {
          currentSource,
          allowedSources,
        },
      });
      return;
    }

    next();
  };
};

/**
 * Demo环境限制中间件
 * 限制Demo环境用户的操作权限
 *
 * @example
 * router.post('/critical-operation', detectRegistrationSource, restrictDemoMode, handler);
 */
export const restrictDemoMode = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isDemoMode) {
    console.warn('[Demo环境限制] Demo用户尝试执行受限操作', {
      path: req.path,
      ip: req.ip,
      userId: (req as any).user?.id,
    });

    res.status(403).json({
      success: false,
      message: 'Demo环境不允许执行此操作',
      error: 'DEMO_MODE_RESTRICTION',
      hint: '如需完整功能，请访问正式环境：rent.yyup.cc',
    });
    return;
  }

  next();
};

/**
 * 获取注册来源配置
 *
 * @param source 注册来源
 * @returns 配置对象
 */
export function getSourceConfig(source: RegistrationSource) {
  const configs = {
    [RegistrationSource.DEMO]: {
      name: 'Demo环境',
      description: '用于演示和测试',
      dataIsolation: true,  // 数据应该隔离
      canCreateRealData: false,  // 不能创建真实数据
      maxUsers: 100,
      maxStorageGB: 1,
    },
    [RegistrationSource.PRODUCTION]: {
      name: '正式环境',
      description: '生产使用',
      dataIsolation: false,
      canCreateRealData: true,
      maxUsers: Infinity,
      maxStorageGB: Infinity,
    },
    [RegistrationSource.ADMIN]: {
      name: '管理后台',
      description: '系统管理',
      dataIsolation: false,
      canCreateRealData: true,
      maxUsers: Infinity,
      maxStorageGB: Infinity,
    },
    [RegistrationSource.API]: {
      name: 'API调用',
      description: '移动端或第三方API',
      dataIsolation: false,
      canCreateRealData: true,
      maxUsers: Infinity,
      maxStorageGB: Infinity,
    },
    [RegistrationSource.UNKNOWN]: {
      name: '未知来源',
      description: '无法识别的来源',
      dataIsolation: false,
      canCreateRealData: false,
      maxUsers: 0,
      maxStorageGB: 0,
    },
  };

  return configs[source] || configs[RegistrationSource.UNKNOWN];
}

/**
 * 检查用户是否可以执行某操作（基于注册来源）
 *
 * @param req Request对象
 * @param operation 操作类型
 * @returns 是否允许执行
 */
export function canPerformOperation(req: Request, operation: string): boolean {
  const source = req.registrationSource || RegistrationSource.UNKNOWN;
  const config = getSourceConfig(source);

  // Demo环境限制
  if (source === RegistrationSource.DEMO) {
    const restrictedOperations = [
      'export_data',
      'delete_permanent',
      'payment',
      'send_sms',
      'send_email',
      'create_admin_user',
    ];

    if (restrictedOperations.includes(operation)) {
      return false;
    }
  }

  // Unknown来源限制更多操作
  if (source === RegistrationSource.UNKNOWN) {
    return false;
  }

  return true;
}

export default {
  detectRegistrationSource,
  validateRegistrationSource,
  restrictDemoMode,
  getSourceConfig,
  canPerformOperation,
  RegistrationSource,
};
