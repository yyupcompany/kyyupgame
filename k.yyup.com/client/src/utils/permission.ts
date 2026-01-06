/**
 * 权限管理工具
 * 与后端权限验证保持一致
 */

export interface Permission {
  code: string;
  name: string;
  resource: string;
  action: string;
}

export interface Role {
  code: string;
  name: string;
  permissions: string[];
}

/**
 * 系统权限常量定义
 * 与后端权限表保持一致
 */
export const PERMISSIONS = {
  // 仪表板权限
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  
  // 用户管理权限
  USER_MANAGE: 'USER_MANAGE',
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  
  // 角色管理权限
  ROLE_MANAGE: 'ROLE_MANAGE',
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE',
  
  // 家长管理权限
  PARENT_MANAGE: 'PARENT_MANAGE',
  PARENT_VIEW: 'PARENT_VIEW',
  PARENT_CREATE: 'PARENT_CREATE',
  PARENT_UPDATE: 'PARENT_UPDATE',
  PARENT_DELETE: 'PARENT_DELETE',
  PARENT_FOLLOW_UP_VIEW: 'PARENT_FOLLOW_UP_VIEW',

  // 教师管理权限
  TEACHER_MANAGE: 'TEACHER_MANAGE',
  TEACHER_VIEW: 'TEACHER_VIEW',
  TEACHER_CREATE: 'TEACHER_CREATE',
  TEACHER_UPDATE: 'TEACHER_UPDATE',
  TEACHER_DELETE: 'TEACHER_DELETE',
  
  // 学生管理权限
  STUDENT_MANAGE: 'STUDENT_MANAGE',
  STUDENT_VIEW: 'STUDENT_VIEW',
  STUDENT_CREATE: 'STUDENT_CREATE',
  STUDENT_UPDATE: 'STUDENT_UPDATE',
  STUDENT_DELETE: 'STUDENT_DELETE',
  
  // 班级管理权限
  CLASS_MANAGE: 'CLASS_MANAGE',
  CLASS_VIEW: 'CLASS_VIEW',
  CLASS_CREATE: 'CLASS_CREATE',
  CLASS_UPDATE: 'CLASS_UPDATE',
  CLASS_DELETE: 'CLASS_DELETE',
  
  // 招生管理权限
  ENROLLMENT_MANAGE: 'ENROLLMENT_MANAGE',
  ENROLLMENT_VIEW: 'ENROLLMENT_VIEW',
  ENROLLMENT_CREATE: 'ENROLLMENT_CREATE',
  ENROLLMENT_UPDATE: 'ENROLLMENT_UPDATE',
  ENROLLMENT_DELETE: 'ENROLLMENT_DELETE',
  
  // 活动管理权限
  ACTIVITY_MANAGE: 'ACTIVITY_MANAGE',
  ACTIVITY_VIEW: 'ACTIVITY_VIEW',
  ACTIVITY_CREATE: 'ACTIVITY_CREATE',
  ACTIVITY_UPDATE: 'ACTIVITY_UPDATE',
  ACTIVITY_DELETE: 'ACTIVITY_DELETE',
  
  // 系统设置权限
  SYSTEM_MANAGE: 'SYSTEM_MANAGE',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  SYSTEM_LOG_VIEW: 'SYSTEM_LOG_VIEW',
  
  // AI助手权限
  AI_ASSISTANT_USE: 'AI_ASSISTANT_USE',
  AI_ACCESS: 'AI_ACCESS',
  AI_CHAT: 'AI_CHAT',
  AI_MEMORY: 'AI_MEMORY',
  AI_MODEL_MANAGE: 'AI_MODEL_MANAGE',
  
  // 聊天功能权限
  CHAT_USE: 'CHAT_USE',
  CHAT_VIEW: 'CHAT_VIEW',
  
  // 园长功能权限
  PRINCIPAL_VIEW: 'PRINCIPAL_VIEW',
  PRINCIPAL_DASHBOARD: 'PRINCIPAL_DASHBOARD',
  PRINCIPAL_PERFORMANCE: 'PRINCIPAL_PERFORMANCE',
  PRINCIPAL_MARKETING: 'PRINCIPAL_MARKETING',
  
  // 广告管理权限
  ADVERTISEMENT_VIEW: 'ADVERTISEMENT_VIEW',
  ADVERTISEMENT_MANAGE: 'ADVERTISEMENT_MANAGE',
  
  // 客户管理权限
  CUSTOMER_VIEW: 'CUSTOMER_VIEW',
  CUSTOMER_MANAGE: 'CUSTOMER_MANAGE',
  
  // 统计分析权限
  STATISTICS_VIEW: 'STATISTICS_VIEW',
  STATISTICS_EXPORT: 'STATISTICS_EXPORT'
} as const;

/**
 * 系统角色常量定义
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  PARENT: 'parent',
  USER: 'user'
} as const;

/**
 * 角色权限映射
 * 与后端权限设置保持一致
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: ['*'], // 超级管理员拥有所有权限
  
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.ROLE_MANAGE,
    PERMISSIONS.PARENT_MANAGE,
    PERMISSIONS.TEACHER_MANAGE,
    PERMISSIONS.STUDENT_MANAGE,
    PERMISSIONS.CLASS_MANAGE,
    PERMISSIONS.ENROLLMENT_MANAGE,
    PERMISSIONS.ACTIVITY_MANAGE,
    PERMISSIONS.SYSTEM_MANAGE,
    PERMISSIONS.AI_ASSISTANT_USE,
    PERMISSIONS.AI_ACCESS,
    PERMISSIONS.AI_CHAT,
    PERMISSIONS.AI_MEMORY,
    PERMISSIONS.AI_MODEL_MANAGE,
    PERMISSIONS.CHAT_USE,
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.PRINCIPAL_VIEW,
    PERMISSIONS.PRINCIPAL_DASHBOARD,
    PERMISSIONS.PRINCIPAL_PERFORMANCE,
    PERMISSIONS.PRINCIPAL_MARKETING,
    PERMISSIONS.ADVERTISEMENT_VIEW,
    PERMISSIONS.ADVERTISEMENT_MANAGE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_MANAGE,
    PERMISSIONS.STATISTICS_VIEW,
    PERMISSIONS.STATISTICS_EXPORT
  ],
  
  [ROLES.PRINCIPAL]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TEACHER_VIEW,
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.CLASS_VIEW,
    PERMISSIONS.ENROLLMENT_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.STATISTICS_VIEW,
    PERMISSIONS.AI_ASSISTANT_USE,
    PERMISSIONS.AI_CHAT,
    PERMISSIONS.AI_MEMORY,
    PERMISSIONS.CHAT_USE
  ],
  
  [ROLES.TEACHER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.CLASS_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.AI_ASSISTANT_USE,
    PERMISSIONS.AI_CHAT,
    PERMISSIONS.AI_MEMORY,
    PERMISSIONS.CHAT_USE
  ],
  
  [ROLES.PARENT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.PARENT_VIEW,
    PERMISSIONS.PARENT_FOLLOW_UP_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.AI_ASSISTANT_USE,
    PERMISSIONS.AI_CHAT,
    PERMISSIONS.AI_MEMORY,
    PERMISSIONS.CHAT_USE
  ],
  
  [ROLES.USER]: [
    PERMISSIONS.DASHBOARD_VIEW
  ]
};

/**
 * 权限检查工具类
 */
export class PermissionManager {
  private userPermissions: string[] = [];
  private userRole: string = ROLES.USER;
  
  constructor(permissions: string[] = [], role: string = ROLES.USER) {
    this.userPermissions = permissions;
    this.userRole = role;
  }
  
  /**
   * 更新用户权限
   */
  updatePermissions(permissions: string[], role: string) {
    this.userPermissions = permissions;
    this.userRole = role;
  }
  
  /**
   * 检查是否拥有指定权限
   */
  hasPermission(permissionCode: string): boolean {
    // 超级管理员和管理员拥有所有权限
    if (this.userRole === ROLES.SUPER_ADMIN || this.userRole === ROLES.ADMIN) {
      return true;
    }
    
    // 检查通配符权限
    if (this.userPermissions.includes('*')) {
      return true;
    }
    
    // 检查具体权限
    return this.userPermissions.includes(permissionCode);
  }
  
  /**
   * 检查是否拥有指定角色
   */
  hasRole(roleCode: string): boolean {
    return this.userRole === roleCode;
  }
  
  /**
   * 检查是否拥有任一指定角色
   */
  hasAnyRole(roleCodes: string[]): boolean {
    return roleCodes.includes(this.userRole);
  }
  
  /**
   * 检查是否为管理员
   */
  isAdmin(): boolean {
    return this.hasAnyRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  }
  
  /**
   * 根据资源和操作检查权限
   */
  canAccess(resource: string, action: string): boolean {
    const permissionCode = `${resource.toUpperCase()}_${action.toUpperCase()}`;
    return this.hasPermission(permissionCode);
  }
  
  /**
   * 过滤有权限的菜单项
   */
  filterMenusByPermission<T extends { permission?: string; children?: T[] }>(
    menus: T[]
  ): T[] {
    return menus.filter(menu => {
      // 如果菜单没有权限要求，默认可以访问
      if (!menu.permission) {
        return true;
      }
      
      // 检查权限
      const hasPermission = this.hasPermission(menu.permission);
      
      // 如果有子菜单，递归过滤
      if (menu.children && menu.children.length > 0) {
        menu.children = this.filterMenusByPermission(menu.children);
        // 如果过滤后没有子菜单，且当前菜单也没有权限，则不显示
        return menu.children.length > 0 || hasPermission;
      }
      
      return hasPermission;
    });
  }
  
  /**
   * 获取角色对应的权限列表
   */
  static getRolePermissions(roleCode: string): string[] {
    return ROLE_PERMISSIONS[roleCode] || ROLE_PERMISSIONS[ROLES.USER];
  }
  
  /**
   * 验证权限代码是否有效
   */
  static isValidPermission(permissionCode: string): boolean {
    return Object.values(PERMISSIONS).includes(permissionCode as any) || permissionCode === '*';
  }
  
  /**
   * 验证角色代码是否有效
   */
  static isValidRole(roleCode: string): boolean {
    return Object.values(ROLES).includes(roleCode as any);
  }
}

/**
 * 创建权限管理器实例
 */
export function createPermissionManager(permissions: string[] = [], role: string = ROLES.USER): PermissionManager {
  return new PermissionManager(permissions, role);
}

/**
 * 权限装饰器 - 用于路由守卫
 */
export function requirePermission(permissionCode: string) {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      // 这里可以在实际使用时注入权限检查逻辑
      console.log(`检查权限: ${permissionCode}`);
      return originalMethod.apply(this, args);
    };
  };
}

/**
 * 路由权限映射表
 * 用于路由守卫中的权限检查
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  // 仪表板
  '/dashboard': PERMISSIONS.DASHBOARD_VIEW,
  
  // 用户管理
  '/system/user': PERMISSIONS.USER_VIEW,
  '/system/user/create': PERMISSIONS.USER_CREATE,
  '/system/user/edit': PERMISSIONS.USER_UPDATE,
  
  // 角色管理
  '/system/role': PERMISSIONS.ROLE_VIEW,
  '/system/role/create': PERMISSIONS.ROLE_CREATE,
  '/system/role/edit': PERMISSIONS.ROLE_UPDATE,
  
  // 教师管理
  '/teacher': PERMISSIONS.TEACHER_VIEW,
  // '/teacher/create': PERMISSIONS.TEACHER_CREATE, // 路由不存在，已注释
  '/teacher/edit': PERMISSIONS.TEACHER_UPDATE,
  
  // 学生管理
  '/student': PERMISSIONS.STUDENT_VIEW,
  // '/student/create': PERMISSIONS.STUDENT_CREATE, // 路由不存在，已注释
  '/student/edit': PERMISSIONS.STUDENT_UPDATE,
  
  // 班级管理
  '/class': PERMISSIONS.CLASS_VIEW,
  // '/class/create': PERMISSIONS.CLASS_CREATE, // 路由不存在，已注释
  '/class/edit': PERMISSIONS.CLASS_UPDATE,
  
  // 招生管理
  '/enrollment': PERMISSIONS.ENROLLMENT_VIEW,
  // '/enrollment/create': PERMISSIONS.ENROLLMENT_CREATE, // 路由不存在，已注释
  '/enrollment/edit': PERMISSIONS.ENROLLMENT_UPDATE,
  
  // 活动管理
  '/activity': PERMISSIONS.ACTIVITY_VIEW,
  // '/activity/create': PERMISSIONS.ACTIVITY_CREATE, // 路由不存在，已注释
  '/activity/edit': PERMISSIONS.ACTIVITY_UPDATE,
  
  // 系统设置
  '/system/config': PERMISSIONS.SYSTEM_CONFIG,
  '/system/log': PERMISSIONS.SYSTEM_LOG_VIEW,
  
  // AI助手
  '/ai': PERMISSIONS.AI_ASSISTANT_USE,
  '/ai/chat': PERMISSIONS.AI_CHAT,
  '/ai/memory': PERMISSIONS.AI_MEMORY,
  '/ai/model': PERMISSIONS.AI_MODEL_MANAGE,
  
  // 统计分析
  '/statistics': PERMISSIONS.STATISTICS_VIEW
};