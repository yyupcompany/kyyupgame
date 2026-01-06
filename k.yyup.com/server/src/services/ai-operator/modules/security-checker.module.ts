/**
 * 安全检查模块
 * 🔧 阶段2重构：从UnifiedIntelligenceService提取
 * 
 * 负责：
 * - 用户角色验证
 * - 敏感操作检查
 * - 数据访问权限检查
 * - 跨权限访问检查
 */

import { Role, PermissionLevel, ROLE_PERMISSIONS, logSecurityViolation } from '../../../middlewares/rbac.middleware';

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  role: string;
  level: PermissionLevel;
  violation?: string;
}

export interface UserRequest {
  content: string;
  userId: string;
  conversationId: string;
  context?: any;
}

/**
 * 安全检查器类
 */
export class SecurityChecker {
  private static instance: SecurityChecker;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): SecurityChecker {
    if (!SecurityChecker.instance) {
      SecurityChecker.instance = new SecurityChecker();
    }
    return SecurityChecker.instance;
  }

  /**
   * 执行完整的安全检查
   */
  async performSecurityCheck(request: UserRequest): Promise<SecurityCheckResult> {
    try {
      // 提取用户角色信息
      const userRole = this.normalizeRole(request.context?.role || 'parent');
      const message = request.content.toLowerCase();

      // 获取角色权限配置
      const rolePermissions = ROLE_PERMISSIONS[userRole];
      if (!rolePermissions) {
        return {
          allowed: false,
          reason: '无效的用户角色，请联系系统管理员',
          role: userRole,
          level: PermissionLevel.DENIED
        };
      }

      // 检查敏感操作
      const sensitiveCheck = this.checkSensitiveOperations(message, userRole);
      if (!sensitiveCheck.allowed) {
        // 记录安全违规
        logSecurityViolation({
          userId: request.userId,
          role: userRole,
          message: request.content,
          requestType: 'sensitive_operation',
          timestamp: new Date()
        }, sensitiveCheck.violation!);

        return {
          ...sensitiveCheck,
          role: userRole
        };
      }

      // 检查数据访问权限
      const dataAccessCheck = this.checkDataAccessPermissions(message, userRole);
      if (!dataAccessCheck.allowed) {
        // 记录安全违规
        logSecurityViolation({
          userId: request.userId,
          role: userRole,
          message: request.content,
          requestType: 'unauthorized_data_access',
          timestamp: new Date()
        }, dataAccessCheck.violation!);

        return {
          ...dataAccessCheck,
          role: userRole
        };
      }

      // 检查跨权限访问
      const crossAccessCheck = this.checkCrossPermissionAccess(message, userRole);
      if (!crossAccessCheck.allowed) {
        // 记录安全违规
        logSecurityViolation({
          userId: request.userId,
          role: userRole,
          message: request.content,
          requestType: 'cross_permission_access',
          timestamp: new Date()
        }, crossAccessCheck.violation!);

        return {
          ...crossAccessCheck,
          role: userRole
        };
      }

      console.log(`✅ [Security] 权限检查通过 - 角色: ${userRole}, 级别: ${rolePermissions.level}`);

      return {
        allowed: true,
        role: userRole,
        level: rolePermissions.level
      };

    } catch (error) {
      console.error('❌ [Security] 权限检查异常:', error);
      return {
        allowed: false,
        reason: '权限验证过程中发生错误，请重试',
        role: 'unknown',
        level: PermissionLevel.DENIED
      };
    }
  }

  /**
   * 标准化角色名称
   */
  normalizeRole(role: string): Role {
    const normalizedRole = role.toLowerCase();

    switch (normalizedRole) {
      case 'admin':
      case 'administrator':
      case 'super_admin':
        return Role.ADMIN;
      case 'principal':
      case 'headmaster':
        return Role.PRINCIPAL;
      case 'teacher':
      case 'instructor':
        return Role.TEACHER;
      case 'parent':
      case 'guardian':
        return Role.PARENT;
      default:
        console.warn(`⚠️ 未知角色类型: ${role}, 默认为parent`);
        return Role.PARENT;
    }
  }

  /**
   * 检查敏感操作
   */
  private checkSensitiveOperations(message: string, role: Role): {
    allowed: boolean;
    reason?: string;
    violation?: string;
    level: PermissionLevel;
  } {
    const sensitiveKeywords = [
      '修改系统', '删除所有', '修改权限', '管理员密码', '修改管理员',
      '系统配置', '删除用户', '重置系统', '清空数据', '修改ai模型配置'
    ];

    const containsSensitiveOperation = sensitiveKeywords.some(keyword =>
      message.includes(keyword)
    );

    if (containsSensitiveOperation && role !== Role.ADMIN) {
      return {
        allowed: false,
        reason: '检测到敏感操作，该操作仅限系统管理员执行。如需帮助，请联系管理员。',
        violation: `非管理员用户(${role})尝试执行敏感操作: ${message}`,
        level: PermissionLevel.DENIED
      };
    }

    return {
      allowed: true,
      level: ROLE_PERMISSIONS[role].level
    };
  }

  /**
   * 检查数据访问权限
   */
  private checkDataAccessPermissions(message: string, role: Role): {
    allowed: boolean;
    reason?: string;
    violation?: string;
    level: PermissionLevel;
  } {
    const rolePermissions = ROLE_PERMISSIONS[role];

    console.log(`🔍 [DataAccess] 权限检查 - 角色: ${role}, 消息: "${message}"`);
    console.log(`🔍 [DataAccess] 角色权限配置:`, rolePermissions);

    // 检查用户数据访问
    if ((message.includes('所有用户') || message.includes('全部用户') ||
         message.includes('用户统计') || message.includes('登录统计')) &&
        rolePermissions.dataAccess.users === 'none') {
      console.log(`❌ [DataAccess] 用户数据访问被拒绝 - 角色: ${role}`);
      return {
        allowed: false,
        reason: `您没有权限查看所有用户数据。${role === Role.TEACHER ? '教师只能查看自己班级的相关信息。' : '家长只能查看自己孩子的相关信息。'}`,
        violation: `${role}角色尝试访问所有用户数据`,
        level: PermissionLevel.DENIED
      };
    }

    // 检查财务数据访问
    if ((message.includes('财务') || message.includes('收支') ||
         message.includes('费用') || message.includes('收入')) &&
        rolePermissions.dataAccess.financial === 'none') {
      console.log(`❌ [DataAccess] 财务数据访问被拒绝 - 角色: ${role}`);
      return {
        allowed: false,
        reason: `您没有权限访问财务数据。${role === Role.TEACHER ? '教师无法查看财务信息。' : '家长只能查看自己的缴费记录。'}`,
        violation: `${role}角色尝试访问财务数据`,
        level: PermissionLevel.DENIED
      };
    }

    // 检查系统数据访问
    if (message.includes('系统') && rolePermissions.dataAccess.system === 'none') {
      console.log(`❌ [DataAccess] 系统数据访问被拒绝 - 角色: ${role}`);
      return {
        allowed: false,
        reason: `您没有权限访问系统数据。请联系系统管理员获取相关权限。`,
        violation: `${role}角色尝试访问系统数据`,
        level: PermissionLevel.DENIED
      };
    }

    console.log(`✅ [DataAccess] 数据访问权限检查通过`);

    return {
      allowed: true,
      level: rolePermissions.level
    };
  }

  /**
   * 检查跨权限访问
   */
  private checkCrossPermissionAccess(message: string, role: Role): {
    allowed: boolean;
    reason?: string;
    violation?: string;
    level: PermissionLevel;
  } {
    const rolePermissions = ROLE_PERMISSIONS[role];

    // 教师尝试查看其他班级的数据
    if (role === Role.TEACHER && 
        (message.includes('其他班级') || message.includes('全部班级') || message.includes('所有班级'))) {
      return {
        allowed: false,
        reason: '教师只能查看自己任教班级的数据，无法访问其他班级。',
        violation: '教师尝试跨班级访问数据',
        level: PermissionLevel.DENIED
      };
    }

    // 家长尝试查看其他家长或学生的数据
    if (role === Role.PARENT && 
        (message.includes('其他学生') || message.includes('所有学生') || message.includes('全部家长'))) {
      return {
        allowed: false,
        reason: '家长只能查看自己孩子的相关信息，无法访问其他学生数据。',
        violation: '家长尝试访问其他学生数据',
        level: PermissionLevel.DENIED
      };
    }

    return {
      allowed: true,
      level: rolePermissions.level
    };
  }
}

// 导出单例
export const securityChecker = SecurityChecker.getInstance();

