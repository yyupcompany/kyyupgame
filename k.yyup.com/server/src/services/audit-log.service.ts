/**
 * 审计日志服务
 *
 * 🔒 等保三级要求：
 * - 所有敏感操作必须记录审计日志
 * - 日志必须包含：操作人、操作时间、操作类型、资源类型、资源ID、IP地址、User-Agent
 * - 审计日志不可篡改、不可删除
 */

import { Request } from 'express';
import { sequelize } from '../init';

/**
 * 审计操作类型
 */
export enum AuditAction {
  // 用户管理
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  RESET_PASSWORD = 'RESET_PASSWORD',

  // 园长管理
  CREATE_PRINCIPAL = 'CREATE_PRINCIPAL',
  UPDATE_PRINCIPAL = 'UPDATE_PRINCIPAL',
  DELETE_PRINCIPAL = 'DELETE_PRINCIPAL',

  // 教师管理
  CREATE_TEACHER = 'CREATE_TEACHER',
  UPDATE_TEACHER = 'UPDATE_TEACHER',
  DELETE_TEACHER = 'DELETE_TEACHER',

  // 权限管理
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  REVOKE_ROLE = 'REVOKE_ROLE',
  GRANT_PERMISSION = 'GRANT_PERMISSION',
  REVOKE_PERMISSION = 'REVOKE_PERMISSION',

  // 园所管理
  CREATE_KINDERGARTEN = 'CREATE_KINDERGARTEN',
  UPDATE_KINDERGARTEN = 'UPDATE_KINDERGARTEN',
  DELETE_KINDERGARTEN = 'DELETE_KINDERGARTEN',

  // 系统配置
  UPDATE_SYSTEM_CONFIG = 'UPDATE_SYSTEM_CONFIG',
  UPDATE_AI_MODEL_CONFIG = 'UPDATE_AI_MODEL_CONFIG',

  // 数据导出
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA',

  // 登录/登出
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
}

/**
 * 资源类型
 */
export enum ResourceType {
  USER = 'user',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  KINDERGARTEN = 'kindergarten',
  CLASS = 'class',
  ROLE = 'role',
  PERMISSION = 'permission',
  SYSTEM_CONFIG = 'system_config',
  AI_MODEL_CONFIG = 'ai_model_config',
}

/**
 * 审计日志接口
 */
export interface AuditLogData {
  operatorUserId: number;
  operatorUsername?: string;
  operatorRole?: string;
  action: AuditAction | string;
  resourceType: ResourceType | string;
  resourceId?: number;
  resourceName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  tenantId?: number;
  kindergartenId?: number;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * 审计日志服务类
 */
export class AuditLogService {
  /**
   * 记录审计日志
   *
   * @param data 审计日志数据
   * @param req Express Request 对象（可选，用于自动提取IP和User-Agent）
   */
  static async log(data: AuditLogData, req?: Request): Promise<void> {
    try {
      // 如果提供了Request对象，自动提取IP和User-Agent
      const enrichedData: AuditLogData = {
        ...data,
        ipAddress: data.ipAddress || (req?.ip || req?.socket?.remoteAddress),
        userAgent: data.userAgent || req?.headers['user-agent'],
      };

      // 构建日志记录
      const logRecord = {
        operator_user_id: enrichedData.operatorUserId,
        operator_username: enrichedData.operatorUsername || null,
        operator_role: enrichedData.operatorRole || null,
        action: enrichedData.action,
        resource_type: enrichedData.resourceType,
        resource_id: enrichedData.resourceId || null,
        resource_name: enrichedData.resourceName || null,
        details: enrichedData.details ? JSON.stringify(enrichedData.details) : null,
        ip_address: enrichedData.ipAddress || null,
        user_agent: enrichedData.userAgent || null,
        tenant_id: enrichedData.tenantId || null,
        kindergarten_id: enrichedData.kindergartenId || null,
        severity: enrichedData.severity || 'info',
        created_at: new Date(),
      };

      // 输出到控制台（开发环境）
      console.log('[审计日志]', JSON.stringify({
        ...logRecord,
        // 敏感信息脱敏
        operator_username: logRecord.operator_username
          ? `${logRecord.operator_username.slice(0, 3)}****`
          : null,
      }));

      // TODO: 存储到数据库
      // 等保三级要求：审计日志必须持久化存储
      // 建议使用单独的审计日志表或审计日志数据库
      // await AuditLogModel.create(logRecord);

      // TODO: 发送到远程日志服务器（用于防篡改）
      // 可以使用ELK、Splunk或其他日志管理系统
      // await RemoteAuditLogService.send(logRecord);

    } catch (error) {
      // 审计日志记录失败不应该影响业务流程
      // 但必须记录错误
      console.error('[审计日志] 记录失败:', error);
    }
  }

  /**
   * 记录敏感操作（高优先级）
   */
  static async logSensitive(data: AuditLogData, req?: Request): Promise<void> {
    await this.log({ ...data, severity: 'critical' }, req);
  }

  /**
   * 记录安全事件
   */
  static async logSecurity(
    data: Omit<AuditLogData, 'severity' | 'action'> & {
      securityEventType: string;
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
    },
    req?: Request
  ): Promise<void> {
    await this.log(
      {
        ...data,
        action: `SECURITY_${data.securityEventType}`,
        severity: data.threatLevel === 'critical' ? 'critical' : 'error',
      },
      req
    );
  }

  /**
   * 从Request对象提取审计信息
   */
  static extractAuditInfo(req: Request): {
    ipAddress?: string;
    userAgent?: string;
    userId?: number;
    username?: string;
    role?: string;
  } {
    const user = (req as any).user;
    return {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: user?.id,
      username: user?.username,
      role: user?.role,
    };
  }

  /**
   * 快捷方法：记录用户创建
   */
  static async logUserCreate(
    operatorId: number,
    targetUserId: number,
    targetUsername: string,
    role: string,
    req?: Request
  ): Promise<void> {
    await this.log(
      {
        operatorUserId: operatorId,
        action: AuditAction.CREATE_USER,
        resourceType: ResourceType.USER,
        resourceId: targetUserId,
        resourceName: targetUsername,
        details: { role },
      },
      req
    );
  }

  /**
   * 快捷方法：记录园长创建
   */
  static async logPrincipalCreate(
    operatorId: number,
    principalId: number,
    principalName: string,
    kindergartenId: number,
    req?: Request
  ): Promise<void> {
    await this.logSensitive(
      {
        operatorUserId: operatorId,
        action: AuditAction.CREATE_PRINCIPAL,
        resourceType: ResourceType.PRINCIPAL,
        resourceId: principalId,
        resourceName: principalName,
        details: { kindergartenId },
        kindergartenId,
      },
      req
    );
  }

  /**
   * 快捷方法：记录教师创建
   */
  static async logTeacherCreate(
    operatorId: number,
    teacherId: number,
    teacherName: string,
    kindergartenId: number,
    req?: Request
  ): Promise<void> {
    await this.log(
      {
        operatorUserId: operatorId,
        action: AuditAction.CREATE_TEACHER,
        resourceType: ResourceType.TEACHER,
        resourceId: teacherId,
        resourceName: teacherName,
        details: { kindergartenId },
        kindergartenId,
      },
      req
    );
  }

  /**
   * 快捷方法：记录权限拒绝
   */
  static async logAccessDenied(
    userId: number,
    username: string,
    role: string,
    attemptedAction: string,
    req?: Request
  ): Promise<void> {
    await this.logSecurity(
      {
        operatorUserId: userId,
        operatorUsername: username,
        operatorRole: role,
        securityEventType: 'ACCESS_DENIED',
        threatLevel: 'medium',
        resourceType: ResourceType.USER,
        details: { attemptedAction },
      },
      req
    );
  }

  /**
   * 快捷方法：记录跨园区访问尝试
   */
  static async logCrossKindergartenAttempt(
    userId: number,
    username: string,
    role: string,
    userKindergartenId: number,
    targetKindergartenId: number,
    req?: Request
  ): Promise<void> {
    await this.logSecurity(
      {
        operatorUserId: userId,
        operatorUsername: username,
        operatorRole: role,
        securityEventType: 'CROSS_KINDERGARTEN_ATTEMPT',
        threatLevel: 'high',
        resourceType: ResourceType.KINDERGARTEN,
        resourceId: targetKindergartenId,
        kindergartenId: userKindergartenId,
        details: {
          userKindergartenId,
          targetKindergartenId,
        },
      },
      req
    );
  }
}

export default AuditLogService;
