/**
 * AI用户管理中间层
 * 负责AI用户权限管理和用户设置管理，封装用户服务层逻辑
 */

// 权限键枚举
const PermissionKey = {
  AI_ADMIN: 'ai:admin',
  AI_USER: 'ai:user',
  AI_READ: 'ai:read',
  AI_WRITE: 'ai:write'
} as const;
type PermissionKeyType = string;

// 用户权限服务占位符
const aiUserPermissionService = {
  async checkPermission(userId: number, permissionKey: string, requiredLevel?: number) { return true; },
  async getUserPermissions(userId: number) { return {}; },
  async setPermission(userId: number, permissionKey: string, value: number) { return true; },
  async setPermissions(userId: number, permissions: Record<string, number>) { return true; },
  async removePermission(userId: number, permissionKey: string) { return true; },
  async initializeUserPermissions(userId: number) { return true; }
};

// 用户关系服务占位符
const aiUserRelationService = {
  async getUserRelation(userId: number) { return { id: userId, externalUserId: userId, settings: {}, lastActivity: new Date(), createdAt: new Date(), updatedAt: new Date() }; },
  async createUserRelation(data: any) { return { id: 1, ...data, createdAt: new Date(), updatedAt: new Date() }; },
  async updateUserSettings(userId: number, settings: any) { return true; },
  async getUserSettings(userId: number) { return {}; },
  async updateLastActivity(userId: number) { return true; },
  async getOrCreateUserRelation(userId: number) { return { id: userId, externalUserId: userId, settings: {}, lastActivity: new Date(), createdAt: new Date(), updatedAt: new Date() }; },
  async getRecentActiveUsers(limit: number) { return []; }
};
import { 
  BaseMiddleware, 
  IMiddlewareResult, 
  MiddlewareError, 
  ERROR_CODES 
} from './base.middleware';

// 用户设置类型
interface UserSettings {
  theme?: string;
  preferredModel?: string;
  customPrompts?: string[];
  [key: string]: string | string[] | undefined;
}

// 用户权限类型
interface UserPermission {
  key: string;
  value: number;
}

// 用户关系类型
interface UserRelation {
  id: number;
  externalUserId: number;
  settings: UserSettings;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI用户中间层接口
 */
export interface IAiUserMiddleware {
  // 权限管理
  checkPermission(userId: number, permissionKey: string, requiredLevel?: number): Promise<IMiddlewareResult<boolean>>;
  getUserPermissions(userId: number): Promise<IMiddlewareResult<Record<string, number>>>;
  setPermission(userId: number, permissionKey: string, value: number): Promise<IMiddlewareResult<boolean>>;
  setPermissions(userId: number, permissions: Record<string, number>): Promise<IMiddlewareResult<boolean>>;
  removePermission(userId: number, permissionKey: string): Promise<IMiddlewareResult<boolean>>;
  initializeUserPermissions(userId: number): Promise<IMiddlewareResult<boolean>>;
  
  // 用户设置管理
  getUserSettings(userId: number): Promise<IMiddlewareResult<UserSettings | null>>;
  updateUserSettings(userId: number, settings: UserSettings): Promise<IMiddlewareResult<UserRelation | null>>;
  getUserRelation(userId: number): Promise<IMiddlewareResult<UserRelation | null>>;
  createUserRelation(userId: number, settings?: UserSettings): Promise<IMiddlewareResult<UserRelation>>;
  updateLastActivity(userId: number): Promise<IMiddlewareResult<boolean>>;
  getRecentActiveUsers(limit?: number): Promise<IMiddlewareResult<UserRelation[]>>;
}

/**
 * AI用户中间层实现
 */
class AiUserMiddleware extends BaseMiddleware implements IAiUserMiddleware {
  /**
   * 检查用户是否拥有指定权限
   * @param userId 用户ID
   * @param permissionKey 权限键
   * @param requiredLevel 所需权限级别
   * @returns 是否拥有权限
   */
  async checkPermission(
    userId: number, 
    permissionKey: string, 
    requiredLevel?: number
  ): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查管理员权限，如果是请求权限管理操作
      if (permissionKey.startsWith('ai:permission:')) {
        const isAdmin = await aiUserPermissionService.checkPermission(userId, PermissionKey.AI_ADMIN, 1);
        if (!isAdmin) {
          throw new MiddlewareError(
            ERROR_CODES.FORBIDDEN,
            '需要管理员权限执行此操作',
            { userId, permissionKey }
          );
        }
      }
      
      // 检查具体权限
      const hasPermission = await aiUserPermissionService.checkPermission(
        userId,
        permissionKey,
        requiredLevel
      );
      
      return this.createSuccessResponse(hasPermission);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 获取用户所有权限
   * @param userId 用户ID
   * @returns 权限键值对
   */
  async getUserPermissions(userId: number): Promise<IMiddlewareResult<Record<string, number>>> {
    try {
      // 如果不是查询自己的权限，需要管理员权限
      const isSelfOrAdmin = await this.validatePermissions(userId, ['ai:permission:read']);
      if (!isSelfOrAdmin) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看权限列表的权限',
          { userId }
        );
      }
      
      // 获取用户权限
      const permissions = await aiUserPermissionService.getUserPermissions(userId);
      
      return this.createSuccessResponse(permissions);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<Record<string, number>>;
    }
  }
  
  /**
   * 设置用户单个权限
   * @param userId 用户ID
   * @param permissionKey 权限键
   * @param value 权限值
   * @returns 操作结果
   */
  async setPermission(
    userId: number, 
    permissionKey: string, 
    value: number
  ): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查管理员权限
      const isAdmin = await this.validatePermissions(userId, ['ai:permission:write']);
      if (!isAdmin) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有设置权限的权限',
          { userId, permissionKey }
        );
      }
      
      // 不允许设置管理员权限，除非操作者已有管理员权限
      if (permissionKey === 'ai:admin') {
        const hasAdminPermission = await aiUserPermissionService.checkPermission(userId, PermissionKey.AI_ADMIN, 1);
        if (!hasAdminPermission) {
          throw new MiddlewareError(
            ERROR_CODES.FORBIDDEN,
            '不能设置管理员权限',
            { userId, permissionKey }
          );
        }
      }
      
      // 设置权限
      await aiUserPermissionService.setPermission(userId, permissionKey, value);
      
      // 记录操作
      await this.logOperation(userId, 'SET_PERMISSION', {
        targetUserId: userId,
        permissionKey,
        value
      });
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 批量设置用户权限
   * @param userId 用户ID
   * @param permissions 权限键值对
   * @returns 操作结果
   */
  async setPermissions(
    userId: number, 
    permissions: Record<string, number>
  ): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查管理员权限
      const isAdmin = await this.validatePermissions(userId, ['ai:permission:write']);
      if (!isAdmin) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有设置权限的权限',
          { userId }
        );
      }
      
      // 不允许设置管理员权限，除非操作者已有管理员权限
      if ('ai:admin' in permissions) {
        const hasAdminPermission = await aiUserPermissionService.checkPermission(userId, PermissionKey.AI_ADMIN, 1);
        if (!hasAdminPermission) {
          throw new MiddlewareError(
            ERROR_CODES.FORBIDDEN,
            '不能设置管理员权限',
            { userId }
          );
        }
      }
      
      // 设置权限
      await aiUserPermissionService.setPermissions(userId, permissions);
      
      // 记录操作
      await this.logOperation(userId, 'SET_BULK_PERMISSIONS', {
        targetUserId: userId,
        permissionCount: Object.keys(permissions).length
      });
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 移除用户权限
   * @param userId 用户ID
   * @param permissionKey 权限键
   * @returns 操作结果
   */
  async removePermission(
    userId: number, 
    permissionKey: string
  ): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查管理员权限
      const isAdmin = await this.validatePermissions(userId, ['ai:permission:write']);
      if (!isAdmin) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有移除权限的权限',
          { userId, permissionKey }
        );
      }
      
      // 移除权限
      await aiUserPermissionService.removePermission(userId, permissionKey);
      
      // 记录操作
      await this.logOperation(userId, 'REMOVE_PERMISSION', {
        targetUserId: userId,
        permissionKey
      });
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 初始化用户默认权限
   * @param userId 用户ID
   * @returns 操作结果
   */
  async initializeUserPermissions(userId: number): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查权限
      const canInitialize = await this.validatePermissions(userId, ['ai:permission:initialize']);
      if (!canInitialize) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有初始化权限的权限',
          { userId }
        );
      }
      
      // 初始化权限
      await aiUserPermissionService.initializeUserPermissions(userId);
      
      // 记录操作
      await this.logOperation(userId, 'INITIALIZE_PERMISSIONS', {
        targetUserId: userId
      });
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 获取用户设置
   * @param userId 用户ID
   * @returns 用户设置
   */
  async getUserSettings(userId: number): Promise<IMiddlewareResult<UserSettings | null>> {
    try {
      // 检查权限，可以是自己或管理员
      const canAccess = await this.validatePermissions(userId, ['ai:user:read']);
      if (!canAccess) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看用户设置的权限',
          { userId }
        );
      }
      
      // 获取用户关系
      const userRelation = await aiUserRelationService.getUserRelation(userId);
      if (!userRelation) {
        return this.createSuccessResponse(null);
      }
      
      return this.createSuccessResponse(userRelation.settings);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<UserSettings | null>;
    }
  }
  
  /**
   * 更新用户设置
   * @param userId 用户ID
   * @param settings 新设置
   * @returns 更新后的用户关系
   */
  async updateUserSettings(
    userId: number, 
    settings: UserSettings
  ): Promise<IMiddlewareResult<UserRelation | null>> {
    try {
      // 检查权限，可以是自己或管理员
      const canUpdate = await this.validatePermissions(userId, ['ai:user:write']);
      if (!canUpdate) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有更新用户设置的权限',
          { userId }
        );
      }
      
      // 更新用户设置
      await aiUserRelationService.updateUserSettings(userId, settings);

      // 获取更新后的用户关系
      const userRelation = await aiUserRelationService.getUserRelation(userId);

      // 记录操作
      await this.logOperation(userId, 'UPDATE_USER_SETTINGS', {
        targetUserId: userId,
        settingsUpdated: Object.keys(settings)
      });

      return this.createSuccessResponse(userRelation ? {
        id: userRelation.id,
        externalUserId: userRelation.externalUserId,
        settings: userRelation.settings,
        lastActivity: userRelation.lastActivity,
        createdAt: userRelation.createdAt,
        updatedAt: userRelation.updatedAt
      } : null);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<UserRelation | null>;
    }
  }
  
  /**
   * 获取用户关系
   * @param userId 用户ID
   * @returns 用户关系
   */
  async getUserRelation(userId: number): Promise<IMiddlewareResult<UserRelation | null>> {
    try {
      // 检查权限，可以是自己或管理员
      const canAccess = await this.validatePermissions(userId, ['ai:user:read']);
      if (!canAccess) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看用户关系的权限',
          { userId }
        );
      }
      
      // 获取用户关系
      const userRelation = await aiUserRelationService.getUserRelation(userId);
      
      return this.createSuccessResponse(userRelation ? {
        id: userRelation.id,
        externalUserId: userRelation.externalUserId,
        settings: userRelation.settings,
        lastActivity: userRelation.lastActivity,
        createdAt: userRelation.createdAt,
        updatedAt: userRelation.updatedAt
      } : null);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<UserRelation | null>;
    }
  }
  
  /**
   * 创建用户关系
   * @param userId 用户ID
   * @param settings 初始设置
   * @returns 创建的用户关系
   */
  async createUserRelation(
    userId: number, 
    settings?: UserSettings
  ): Promise<IMiddlewareResult<UserRelation>> {
    try {
      // 检查权限，只有管理员可以创建其他用户关系
      const canCreate = await this.validatePermissions(userId, ['ai:user:create']);
      if (!canCreate) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有创建用户关系的权限',
          { userId }
        );
      }
      
      // 创建用户关系
      const userRelation = await aiUserRelationService.getOrCreateUserRelation(userId);
      
      // 记录操作
      await this.logOperation(userId, 'CREATE_USER_RELATION', {
        targetUserId: userId
      });
      
      return this.createSuccessResponse({
        id: userRelation.id,
        externalUserId: userRelation.externalUserId,
        settings: userRelation.settings,
        lastActivity: userRelation.lastActivity,
        createdAt: userRelation.createdAt,
        updatedAt: userRelation.updatedAt
      });
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<UserRelation>;
    }
  }
  
  /**
   * 更新用户最后活动时间
   * @param userId 用户ID
   * @returns 操作结果
   */
  async updateLastActivity(userId: number): Promise<IMiddlewareResult<boolean>> {
    try {
      // 更新最后活动时间
      const success = await aiUserRelationService.updateLastActivity(userId);
      
      return this.createSuccessResponse(success);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 获取最近活动用户
   * @param limit 数量限制
   * @returns 用户关系列表
   */
  async getRecentActiveUsers(limit = 10): Promise<IMiddlewareResult<UserRelation[]>> {
    try {
      // 检查管理员权限
      const isAdmin = await this.validatePermissions(0, ['ai:admin']);
      if (!isAdmin) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '需要管理员权限查看最近活动用户',
          { limit }
        );
      }
      
      // 获取最近活动用户
      const users = await aiUserRelationService.getRecentActiveUsers(limit);
      
      return this.createSuccessResponse(users.map(user => ({
        id: user.id,
        externalUserId: user.externalUserId,
        settings: user.settings,
        lastActivity: user.lastActivity,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })));
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<UserRelation[]>;
    }
  }
}

// 导出中间层实例
const aiUserMiddleware = new AiUserMiddleware();
export { aiUserMiddleware }; 