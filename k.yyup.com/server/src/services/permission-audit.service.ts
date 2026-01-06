/**
 * 权限变更审计服务
 * 
 * 等保三级合规要求：
 * - 应记录对安全设置的变更
 * - 应记录权限分配和变更操作
 * - 审计记录应包含操作者、操作时间、操作内容、操作结果
 * 
 * 覆盖场景：
 * - 角色创建/修改/删除
 * - 用户角色分配/移除
 * - 权限创建/修改/删除
 * - 角色权限分配/移除
 */

import { secureAuditLogService, AuditLogLevel, AuditLogCategory, AuditLogEntry } from './secure-audit-log.service';

/**
 * 权限变更类型
 */
export enum PermissionChangeType {
  // 角色操作
  ROLE_CREATE = 'role_create',
  ROLE_UPDATE = 'role_update',
  ROLE_DELETE = 'role_delete',
  
  // 用户角色操作
  USER_ROLE_ASSIGN = 'user_role_assign',
  USER_ROLE_REMOVE = 'user_role_remove',
  USER_ROLE_UPDATE = 'user_role_update',
  
  // 权限操作
  PERMISSION_CREATE = 'permission_create',
  PERMISSION_UPDATE = 'permission_update',
  PERMISSION_DELETE = 'permission_delete',
  
  // 角色权限操作
  ROLE_PERMISSION_GRANT = 'role_permission_grant',
  ROLE_PERMISSION_REVOKE = 'role_permission_revoke',
  
  // 特殊操作
  ADMIN_PRIVILEGE_GRANT = 'admin_privilege_grant',
  ADMIN_PRIVILEGE_REVOKE = 'admin_privilege_revoke',
  BULK_PERMISSION_CHANGE = 'bulk_permission_change'
}

/**
 * 权限变更记录接口
 */
export interface PermissionChangeRecord {
  changeType: PermissionChangeType;
  operatorId: number;
  operatorName?: string;
  targetUserId?: number;
  targetUserName?: string;
  targetRoleId?: number;
  targetRoleName?: string;
  targetPermissionId?: number;
  targetPermissionCode?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 权限变更审计服务类
 */
export class PermissionAuditService {
  private static instance: PermissionAuditService;

  private constructor() {}

  static getInstance(): PermissionAuditService {
    if (!PermissionAuditService.instance) {
      PermissionAuditService.instance = new PermissionAuditService();
    }
    return PermissionAuditService.instance;
  }

  /**
   * 生成变更描述
   */
  private generateDescription(record: PermissionChangeRecord): string {
    const { changeType, operatorName, targetUserName, targetRoleName, targetPermissionCode } = record;
    
    const descriptions: Record<PermissionChangeType, string> = {
      [PermissionChangeType.ROLE_CREATE]: `创建角色: ${targetRoleName}`,
      [PermissionChangeType.ROLE_UPDATE]: `修改角色: ${targetRoleName}`,
      [PermissionChangeType.ROLE_DELETE]: `删除角色: ${targetRoleName}`,
      [PermissionChangeType.USER_ROLE_ASSIGN]: `为用户 ${targetUserName} 分配角色 ${targetRoleName}`,
      [PermissionChangeType.USER_ROLE_REMOVE]: `移除用户 ${targetUserName} 的角色 ${targetRoleName}`,
      [PermissionChangeType.USER_ROLE_UPDATE]: `更新用户 ${targetUserName} 的角色配置`,
      [PermissionChangeType.PERMISSION_CREATE]: `创建权限: ${targetPermissionCode}`,
      [PermissionChangeType.PERMISSION_UPDATE]: `修改权限: ${targetPermissionCode}`,
      [PermissionChangeType.PERMISSION_DELETE]: `删除权限: ${targetPermissionCode}`,
      [PermissionChangeType.ROLE_PERMISSION_GRANT]: `为角色 ${targetRoleName} 授予权限 ${targetPermissionCode}`,
      [PermissionChangeType.ROLE_PERMISSION_REVOKE]: `撤销角色 ${targetRoleName} 的权限 ${targetPermissionCode}`,
      [PermissionChangeType.ADMIN_PRIVILEGE_GRANT]: `授予用户 ${targetUserName} 管理员权限`,
      [PermissionChangeType.ADMIN_PRIVILEGE_REVOKE]: `撤销用户 ${targetUserName} 的管理员权限`,
      [PermissionChangeType.BULK_PERMISSION_CHANGE]: `批量权限变更操作`
    };

    return descriptions[changeType] || `权限变更: ${changeType}`;
  }

  /**
   * 确定日志级别
   */
  private determineLogLevel(changeType: PermissionChangeType): AuditLogLevel {
    // 高敏感操作使用 WARNING 级别
    const highSensitiveOps = [
      PermissionChangeType.ADMIN_PRIVILEGE_GRANT,
      PermissionChangeType.ADMIN_PRIVILEGE_REVOKE,
      PermissionChangeType.ROLE_DELETE,
      PermissionChangeType.PERMISSION_DELETE,
      PermissionChangeType.BULK_PERMISSION_CHANGE
    ];

    if (highSensitiveOps.includes(changeType)) {
      return AuditLogLevel.WARNING;
    }

    return AuditLogLevel.INFO;
  }

  /**
   * 记录权限变更
   */
  async logPermissionChange(record: PermissionChangeRecord): Promise<AuditLogEntry | null> {
    const description = this.generateDescription(record);
    const level = this.determineLogLevel(record.changeType);

    return secureAuditLogService.log(
      level,
      AuditLogCategory.AUTHORIZATION,
      description,
      {
        userId: record.operatorId,
        username: record.operatorName,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        resourceType: 'permission',
        resourceId: this.getResourceId(record),
        details: {
          changeType: record.changeType,
          targetUserId: record.targetUserId,
          targetUserName: record.targetUserName,
          targetRoleId: record.targetRoleId,
          targetRoleName: record.targetRoleName,
          targetPermissionId: record.targetPermissionId,
          targetPermissionCode: record.targetPermissionCode,
          beforeState: record.beforeState,
          afterState: record.afterState,
          reason: record.reason
        }
      }
    );
  }

  /**
   * 获取资源ID
   */
  private getResourceId(record: PermissionChangeRecord): string {
    if (record.targetUserId) return `user:${record.targetUserId}`;
    if (record.targetRoleId) return `role:${record.targetRoleId}`;
    if (record.targetPermissionId) return `permission:${record.targetPermissionId}`;
    return 'unknown';
  }

  // ========== 便捷方法 ==========

  /**
   * 记录角色创建
   */
  async logRoleCreate(
    operatorId: number,
    operatorName: string,
    roleId: number,
    roleName: string,
    roleConfig: Record<string, any>,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.ROLE_CREATE,
      operatorId,
      operatorName,
      targetRoleId: roleId,
      targetRoleName: roleName,
      afterState: roleConfig,
      ...context
    });
  }

  /**
   * 记录角色更新
   */
  async logRoleUpdate(
    operatorId: number,
    operatorName: string,
    roleId: number,
    roleName: string,
    beforeState: Record<string, any>,
    afterState: Record<string, any>,
    context?: { ipAddress?: string; userAgent?: string; reason?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.ROLE_UPDATE,
      operatorId,
      operatorName,
      targetRoleId: roleId,
      targetRoleName: roleName,
      beforeState,
      afterState,
      ...context
    });
  }

  /**
   * 记录角色删除
   */
  async logRoleDelete(
    operatorId: number,
    operatorName: string,
    roleId: number,
    roleName: string,
    roleConfig: Record<string, any>,
    context?: { ipAddress?: string; userAgent?: string; reason?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.ROLE_DELETE,
      operatorId,
      operatorName,
      targetRoleId: roleId,
      targetRoleName: roleName,
      beforeState: roleConfig,
      ...context
    });
  }

  /**
   * 记录用户角色分配
   */
  async logUserRoleAssign(
    operatorId: number,
    operatorName: string,
    targetUserId: number,
    targetUserName: string,
    roleId: number,
    roleName: string,
    context?: { ipAddress?: string; userAgent?: string; reason?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.USER_ROLE_ASSIGN,
      operatorId,
      operatorName,
      targetUserId,
      targetUserName,
      targetRoleId: roleId,
      targetRoleName: roleName,
      afterState: { roleId, roleName },
      ...context
    });
  }

  /**
   * 记录用户角色移除
   */
  async logUserRoleRemove(
    operatorId: number,
    operatorName: string,
    targetUserId: number,
    targetUserName: string,
    roleId: number,
    roleName: string,
    context?: { ipAddress?: string; userAgent?: string; reason?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.USER_ROLE_REMOVE,
      operatorId,
      operatorName,
      targetUserId,
      targetUserName,
      targetRoleId: roleId,
      targetRoleName: roleName,
      beforeState: { roleId, roleName },
      ...context
    });
  }

  /**
   * 记录权限授予
   */
  async logPermissionGrant(
    operatorId: number,
    operatorName: string,
    roleId: number,
    roleName: string,
    permissionId: number,
    permissionCode: string,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.ROLE_PERMISSION_GRANT,
      operatorId,
      operatorName,
      targetRoleId: roleId,
      targetRoleName: roleName,
      targetPermissionId: permissionId,
      targetPermissionCode: permissionCode,
      ...context
    });
  }

  /**
   * 记录权限撤销
   */
  async logPermissionRevoke(
    operatorId: number,
    operatorName: string,
    roleId: number,
    roleName: string,
    permissionId: number,
    permissionCode: string,
    context?: { ipAddress?: string; userAgent?: string; reason?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.ROLE_PERMISSION_REVOKE,
      operatorId,
      operatorName,
      targetRoleId: roleId,
      targetRoleName: roleName,
      targetPermissionId: permissionId,
      targetPermissionCode: permissionCode,
      ...context
    });
  }

  /**
   * 记录管理员权限授予
   */
  async logAdminPrivilegeGrant(
    operatorId: number,
    operatorName: string,
    targetUserId: number,
    targetUserName: string,
    context?: { ipAddress?: string; userAgent?: string; reason?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.ADMIN_PRIVILEGE_GRANT,
      operatorId,
      operatorName,
      targetUserId,
      targetUserName,
      afterState: { isAdmin: true },
      ...context
    });
  }

  /**
   * 记录管理员权限撤销
   */
  async logAdminPrivilegeRevoke(
    operatorId: number,
    operatorName: string,
    targetUserId: number,
    targetUserName: string,
    context?: { ipAddress?: string; userAgent?: string; reason?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logPermissionChange({
      changeType: PermissionChangeType.ADMIN_PRIVILEGE_REVOKE,
      operatorId,
      operatorName,
      targetUserId,
      targetUserName,
      beforeState: { isAdmin: true },
      afterState: { isAdmin: false },
      ...context
    });
  }

  /**
   * 查询权限变更历史
   */
  async queryPermissionChanges(options: {
    targetUserId?: number;
    targetRoleId?: number;
    changeType?: PermissionChangeType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ logs: AuditLogEntry[]; total: number }> {
    return secureAuditLogService.query({
      category: AuditLogCategory.AUTHORIZATION,
      ...options
    });
  }
}

// 导出单例
export const permissionAuditService = PermissionAuditService.getInstance();
export default permissionAuditService;
