/**
 * 权限预加载服务
 * 
 * 功能：
 * 1. 服务器启动时将权限、角色等固定数据预加载到 Redis
 * 2. 减少数据库查询压力
 * 3. 提高登录和权限验证速度
 * 4. 支持多服务器实例共享缓存
 */

import RedisService from './redis.service';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { RolePermission } from '../models/role-permission.model';
import { Op } from 'sequelize';

/**
 * Redis 缓存键前缀
 */
const CACHE_KEYS = {
  ALL_ROLES: 'system:roles:all',
  ALL_PERMISSIONS: 'system:permissions:all',
  ROLE_PERMISSIONS: 'system:role_permissions:',  // + roleId
  ROLE_BY_CODE: 'system:role:code:',  // + roleCode
  PERMISSION_BY_CODE: 'system:permission:code:',  // + permissionCode
  MENU_ROUTES: 'system:menu:routes',
  PERMISSION_TREE: 'system:permission:tree',
};

/**
 * 缓存过期时间（秒）
 * 这些数据很少变动，可以设置较长的过期时间
 */
const CACHE_TTL = {
  ROLES: 24 * 60 * 60,  // 24小时
  PERMISSIONS: 24 * 60 * 60,  // 24小时
  ROLE_PERMISSIONS: 24 * 60 * 60,  // 24小时
  MENU_ROUTES: 12 * 60 * 60,  // 12小时
};

export class PermissionPreloadService {
  /**
   * 初始化权限预加载
   * 在服务器启动时调用
   */
  static async initialize(): Promise<void> {
    const startTime = Date.now();
    console.log('🔄 开始预加载权限数据到 Redis...');

    try {
      // 检查Redis是否已连接
      if (!RedisService.getIsConnected()) {
        console.log('⚠️ Redis未连接，跳过权限数据预加载');
        console.log('💡 系统将使用数据库查询模式');
        return;
      }

      // 1. 预加载所有角色
      await this.preloadRoles();

      // 2. 预加载所有权限
      await this.preloadPermissions();

      // 3. 预加载角色权限映射
      await this.preloadRolePermissions();

      // 4. 预加载菜单路由
      await this.preloadMenuRoutes();

      // 5. 预加载权限树
      await this.preloadPermissionTree();

      const duration = Date.now() - startTime;
      console.log(`✅ 权限数据预加载完成，耗时 ${duration}ms`);
      console.log('📊 预加载统计:');
      console.log('   - 所有角色已缓存');
      console.log('   - 所有权限已缓存');
      console.log('   - 角色权限映射已缓存');
      console.log('   - 菜单路由已缓存');
      console.log('   - 权限树已缓存');
    } catch (error) {
      console.error('❌ 权限数据预加载失败:', error);
      console.warn('⚠️ 系统将降级到数据库查询模式');
      // 不抛出错误，允许系统继续启动
    }
  }

  /**
   * 预加载所有角色
   */
  private static async preloadRoles(): Promise<void> {
    try {
      const roles = await Role.findAll({
        where: { status: 1 },
        attributes: ['id', 'code', 'name', 'description', 'status'],
        raw: true,
      });

      // 缓存所有角色列表
      await RedisService.set(CACHE_KEYS.ALL_ROLES, roles, CACHE_TTL.ROLES);

      // 缓存每个角色的详情（按 code 索引）
      for (const role of roles) {
        const key = `${CACHE_KEYS.ROLE_BY_CODE}${role.code}`;
        await RedisService.set(key, role, CACHE_TTL.ROLES);
      }

      console.log(`✅ 已预加载 ${roles.length} 个角色到 Redis`);
    } catch (error) {
      console.error('❌ 预加载角色失败:', error);
      throw error;
    }
  }

  /**
   * 预加载所有权限
   */
  private static async preloadPermissions(): Promise<void> {
    try {
      const permissions = await Permission.findAll({
        where: { status: 1 },
        attributes: [
          'id',
          'code',
          'name',
          'chineseName',
          'chinese_name',
          'path',
          'type',
          'parentId',
          'parent_id',
          'icon',
          'sort',
          'status',
          'description',
        ],
        raw: true,
      });

      // 缓存所有权限列表
      await RedisService.set(CACHE_KEYS.ALL_PERMISSIONS, permissions, CACHE_TTL.PERMISSIONS);

      // 缓存每个权限的详情（按 code 索引）
      for (const permission of permissions) {
        if (permission.code) {
          const key = `${CACHE_KEYS.PERMISSION_BY_CODE}${permission.code}`;
          await RedisService.set(key, permission, CACHE_TTL.PERMISSIONS);
        }
      }

      console.log(`✅ 已预加载 ${permissions.length} 个权限到 Redis`);
    } catch (error) {
      console.error('❌ 预加载权限失败:', error);
      throw error;
    }
  }

  /**
   * 预加载角色权限映射
   */
  private static async preloadRolePermissions(): Promise<void> {
    try {
      const rolePermissions = await RolePermission.findAll({
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'code', 'name'],
          },
          {
            model: Permission,
            as: 'permission',
            attributes: ['id', 'code', 'path', 'name'],
          },
        ],
      });

      // 按角色分组权限
      const permissionsByRole: Record<string, any[]> = {};

      for (const rp of rolePermissions) {
        const roleCode = (rp as any).role?.code;
        const permission = (rp as any).permission;

        if (roleCode && permission) {
          if (!permissionsByRole[roleCode]) {
            permissionsByRole[roleCode] = [];
          }
          permissionsByRole[roleCode].push({
            id: permission.id,
            code: permission.code,
            path: permission.path,
            name: permission.name,
          });
        }
      }

      // 缓存每个角色的权限列表
      for (const [roleCode, permissions] of Object.entries(permissionsByRole)) {
        const key = `${CACHE_KEYS.ROLE_PERMISSIONS}${roleCode}`;
        await RedisService.set(key, permissions, CACHE_TTL.ROLE_PERMISSIONS);
      }

      console.log(`✅ 已预加载 ${Object.keys(permissionsByRole).length} 个角色的权限映射到 Redis`);
    } catch (error) {
      console.error('❌ 预加载角色权限映射失败:', error);
      throw error;
    }
  }

  /**
   * 预加载菜单路由
   */
  private static async preloadMenuRoutes(): Promise<void> {
    try {
      const menuRoutes = await Permission.findAll({
        where: {
          status: 1,
          type: { [Op.in]: ['category', 'menu', 'page'] },
        },
        attributes: [
          'id',
          'code',
          'name',
          'chineseName',
          'chinese_name',
          'path',
          'type',
          'parentId',
          'parent_id',
          'icon',
          'sort',
          'component',
        ],
        order: [['sort', 'ASC']],
        raw: true,
      });

      // 缓存菜单路由列表
      await RedisService.set(CACHE_KEYS.MENU_ROUTES, menuRoutes, CACHE_TTL.MENU_ROUTES);

      console.log(`✅ 已预加载 ${menuRoutes.length} 个菜单路由到 Redis`);
    } catch (error) {
      console.error('❌ 预加载菜单路由失败:', error);
      throw error;
    }
  }

  /**
   * 预加载权限树（层级结构）
   */
  private static async preloadPermissionTree(): Promise<void> {
    try {
      const permissions = await Permission.findAll({
        where: { status: 1 },
        attributes: [
          'id',
          'code',
          'name',
          'chineseName',
          'chinese_name',
          'path',
          'type',
          'parentId',
          'parent_id',
          'icon',
          'sort',
        ],
        order: [['sort', 'ASC']],
        raw: true,
      });

      // 构建树形结构
      const tree = this.buildPermissionTree(permissions);

      // 缓存权限树
      await RedisService.set(CACHE_KEYS.PERMISSION_TREE, tree, CACHE_TTL.PERMISSIONS);

      console.log(`✅ 已预加载权限树到 Redis (${permissions.length} 个节点)`);
    } catch (error) {
      console.error('❌ 预加载权限树失败:', error);
      throw error;
    }
  }

  /**
   * 构建权限树
   */
  private static buildPermissionTree(permissions: any[]): any[] {
    const map: Record<number, any> = {};
    const tree: any[] = [];

    // 创建映射
    for (const permission of permissions) {
      map[permission.id] = {
        ...permission,
        children: [],
      };
    }

    // 构建树
    for (const permission of permissions) {
      const parentId = permission.parentId || permission.parent_id;
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[permission.id]);
      } else {
        tree.push(map[permission.id]);
      }
    }

    return tree;
  }

  /**
   * 刷新缓存
   * 当权限数据更新时调用
   */
  static async refresh(): Promise<void> {
    console.log('🔄 刷新权限缓存...');
    await this.initialize();
  }

  /**
   * 清除所有权限缓存
   */
  static async clear(): Promise<void> {
    console.log('🗑️ 清除权限缓存...');
    try {
      const keys = Object.values(CACHE_KEYS);
      for (const key of keys) {
        if (key.endsWith(':')) {
          // 删除所有匹配的键
          const pattern = `${key}*`;
          const matchedKeys = await RedisService.keys(pattern);
          for (const matchedKey of matchedKeys) {
            await RedisService.del(matchedKey);
          }
        } else {
          await RedisService.del(key);
        }
      }
      console.log('✅ 权限缓存已清除');
    } catch (error) {
      console.error('❌ 清除权限缓存失败:', error);
    }
  }

  /**
   * 获取缓存的角色列表
   */
  static async getCachedRoles(): Promise<any[] | null> {
    return await RedisService.get(CACHE_KEYS.ALL_ROLES);
  }

  /**
   * 获取缓存的权限列表
   */
  static async getCachedPermissions(): Promise<any[] | null> {
    return await RedisService.get(CACHE_KEYS.ALL_PERMISSIONS);
  }

  /**
   * 获取缓存的角色权限
   */
  static async getCachedRolePermissions(roleCode: string): Promise<any[] | null> {
    const key = `${CACHE_KEYS.ROLE_PERMISSIONS}${roleCode}`;
    return await RedisService.get(key);
  }

  /**
   * 获取缓存的菜单路由
   */
  static async getCachedMenuRoutes(): Promise<any[] | null> {
    return await RedisService.get(CACHE_KEYS.MENU_ROUTES);
  }

  /**
   * 获取缓存的权限树
   */
  static async getCachedPermissionTree(): Promise<any[] | null> {
    return await RedisService.get(CACHE_KEYS.PERMISSION_TREE);
  }
}

export default PermissionPreloadService;

