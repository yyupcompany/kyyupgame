import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 🔒 数据导入安全中间件
 * 专门用于数据导入工作流的多层安全验证
 */

export interface ImportSecurityContext {
  userId: number;
  userRole: string;
  importType: string;
  recordCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class DataImportSecurityMiddleware {
  
  /**
   * 🔒 导入前安全检查
   */
  static async preImportSecurityCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { importType, data } = req.body;
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;

      if (!userId || !userRole) {
        return res.status(401).json({
          success: false,
          message: '用户身份验证失败',
          code: 'AUTHENTICATION_FAILED'
        });
      }

      // 1. 评估风险等级
      const riskLevel = DataImportSecurityMiddleware.assessRiskLevel(data, importType);
      
      // 2. 检查导入权限
      const hasPermission = await DataImportSecurityMiddleware.checkImportPermission(
        userId, userRole, importType, riskLevel
      );
      
      if (!hasPermission.allowed) {
        return res.status(403).json({
          success: false,
          message: hasPermission.reason,
          code: 'IMPORT_PERMISSION_DENIED'
        });
      }

      // 3. 检查频率限制
      const rateLimitCheck = await DataImportSecurityMiddleware.checkRateLimit(userId, importType);
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({
          success: false,
          message: rateLimitCheck.reason,
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      // 4. 记录安全上下文
      req.importSecurity = {
        userId,
        userRole,
        importType,
        recordCount: Array.isArray(data) ? data.length : 1,
        riskLevel
      };

      logger.info('数据导入安全检查通过', {
        userId,
        importType,
        riskLevel,
        recordCount: req.importSecurity.recordCount
      });

      next();
    } catch (error) {
      logger.error('数据导入安全检查失败', { error });
      res.status(500).json({
        success: false,
        message: '安全检查失败',
        code: 'SECURITY_CHECK_FAILED'
      });
    }
  }

  /**
   * 🔒 评估导入风险等级
   */
  private static assessRiskLevel(data: any[], importType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const recordCount = Array.isArray(data) ? data.length : 1;
    
    // 基于记录数量评估
    if (recordCount > 1000) return 'CRITICAL';
    if (recordCount > 100) return 'HIGH';
    if (recordCount > 10) return 'MEDIUM';
    
    // 基于数据类型评估
    if (importType === 'teacher') return 'HIGH'; // 教师数据敏感度高
    if (importType === 'parent') return 'MEDIUM'; // 家长数据包含个人信息
    
    return 'LOW';
  }

  /**
   * 🔒 检查导入权限
   */
  private static async checkImportPermission(
    userId: number, 
    userRole: string, 
    importType: string, 
    riskLevel: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    
    // 超级管理员拥有所有权限
    if (userRole === 'super_admin') {
      return { allowed: true };
    }

    // 高风险操作需要管理员权限
    if (riskLevel === 'CRITICAL' && userRole !== 'admin') {
      return { 
        allowed: false, 
        reason: '批量导入超过1000条记录需要管理员权限' 
      };
    }

    // 教师数据导入需要特殊权限
    if (importType === 'teacher' && !['admin', 'hr_manager'].includes(userRole)) {
      return { 
        allowed: false, 
        reason: '教师数据导入需要管理员或人事经理权限' 
      };
    }

    // TODO: 实现更细粒度的权限检查
    // 例如：检查用户是否有权限操作特定班级、部门等

    return { allowed: true };
  }

  /**
   * 🔒 检查频率限制
   */
  private static async checkRateLimit(
    userId: number, 
    importType: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    
    // TODO: 实现Redis或内存缓存的频率限制
    // 例如：每小时最多导入5次，每天最多导入20次
    
    const hourlyLimit = 5;
    const dailyLimit = 20;
    
    // 模拟检查
    const hourlyCount = await this.getImportCount(userId, importType, 'hour');
    const dailyCount = await this.getImportCount(userId, importType, 'day');
    
    if (hourlyCount >= hourlyLimit) {
      return { 
        allowed: false, 
        reason: `每小时最多导入${hourlyLimit}次，请稍后再试` 
      };
    }
    
    if (dailyCount >= dailyLimit) {
      return { 
        allowed: false, 
        reason: `每天最多导入${dailyLimit}次，已达到限制` 
      };
    }

    return { allowed: true };
  }

  /**
   * 获取导入次数统计
   */
  private static async getImportCount(
    userId: number, 
    importType: string, 
    period: 'hour' | 'day'
  ): Promise<number> {
    // TODO: 实现实际的统计查询
    logger.info('检查导入频率', { userId, importType, period });
    return 0; // 模拟返回
  }

  /**
   * 🔒 导入后安全审计
   */
  static async postImportSecurityAudit(req: Request, res: Response, next: NextFunction) {
    try {
      const security = req.importSecurity;
      const result = res.locals.importResult;

      if (security && result) {
        // 记录详细的审计日志
        await DataImportSecurityMiddleware.logSecurityAudit({
          userId: security.userId,
          importType: security.importType,
          riskLevel: security.riskLevel,
          recordCount: security.recordCount,
          successCount: result.successCount,
          failureCount: result.failureCount,
          timestamp: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        // 高风险操作额外通知
        if (security.riskLevel === 'CRITICAL' || security.riskLevel === 'HIGH') {
          await DataImportSecurityMiddleware.notifyHighRiskImport(security, result);
        }
      }

      next();
    } catch (error) {
      logger.error('导入后安全审计失败', { error });
      // 不阻断响应，但记录错误
      next();
    }
  }

  /**
   * 记录安全审计日志
   */
  private static async logSecurityAudit(auditData: any): Promise<void> {
    logger.info('数据导入安全审计', auditData);
    // TODO: 写入专门的安全审计表
  }

  /**
   * 高风险导入通知
   */
  private static async notifyHighRiskImport(security: ImportSecurityContext, result: any): Promise<void> {
    logger.warn('高风险数据导入操作', {
      userId: security.userId,
      importType: security.importType,
      riskLevel: security.riskLevel,
      recordCount: security.recordCount,
      result
    });
    
    // TODO: 发送邮件或系统通知给管理员
  }
}

// 扩展Request接口
declare global {
  namespace Express {
    interface Request {
      importSecurity?: ImportSecurityContext;
    }
  }
}

export default DataImportSecurityMiddleware;
