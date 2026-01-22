/**
 * 静态权限管理存储
 * 使用静态菜单配置 + 路由守卫 + 按钮权限模式
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { STATIC_MENU_CONFIG, ROLE_PERMISSIONS, filterMenuByRole, hasPermission as checkStaticPermission } from '../config/static-menu';

export const usePermissionsStore = defineStore('permissions-simple', () => {
  // 核心状态
  const menuItems = ref<any[]>([]);
  const userRole = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // 计算属性
  const hasMenuItems = computed(() => menuItems.value.length > 0);
  const isAdmin = computed(() => userRole.value === 'admin');
  const isPrincipal = computed(() => userRole.value === 'principal');
  const isTeacher = computed(() => userRole.value === 'teacher');
  const isParent = computed(() => userRole.value === 'parent');

  /**
   * 获取用户菜单 - 使用静态菜单配置
   */
  const fetchMenuItems = async () => {
    try {
      loading.value = true;
      error.value = null;

      if (!userRole.value) {
        console.warn('⚠️ 用户角色未设置，使用默认菜单');
        menuItems.value = STATIC_MENU_CONFIG.filter(menu => !menu.roles || menu.roles.length === 0);
        return;
      }

      // 使用静态菜单配置根据用户角色过滤
      const filteredMenus = filterMenuByRole([...STATIC_MENU_CONFIG], userRole.value);
      menuItems.value = filteredMenus;
      console.log(`✅ 菜单生成成功 (${userRole.value}):`, menuItems.value.length, '个菜单项');
    } catch (err) {
      error.value = err instanceof Error ? err.message : '菜单生成失败';
      console.error('❌ 菜单生成失败:', err);
      menuItems.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 设置用户角色 - 简化版本，直接从用户信息获取
   */
  const setUserRole = (role: string) => {
    userRole.value = role;
    console.log(`✅ 用户角色设置: ${role}`);
  };

  /**
   * 静态权限验证接口 - 使用静态权限配置
   * @param permission 权限代码，如 'dashboard:view', 'centers:view' 等
   * @returns boolean 是否有权限
   */
  const checkPermission = (permission: string): boolean => {
    if (!userRole.value) {
      console.warn('⚠️ 用户角色未设置，默认无权限');
      return false;
    }

    return checkStaticPermission(userRole.value, permission);
  };

  /**
   * 批量权限验证
   * @param permissions 权限代码数组
   * @returns {[permission: string]: boolean} 权限验证结果
   */
  const checkPermissions = (permissions: string[]): {[key: string]: boolean} => {
    const results: {[key: string]: boolean} = {};

    permissions.forEach(permission => {
      results[permission] = checkPermission(permission);
    });

    return results;
  };

  /**
   * 检查是否有某个角色
   */
  const hasRole = (roleCode: string): boolean => {
    return userRole.value === roleCode;
  };

  /**
   * 检查菜单访问权限
   *
   * 权限检查策略：
   * 1. 特殊处理移动端路由，自动允许访问
   * 2. 检查静态菜单配置中的权限（精确匹配和前缀匹配）
   * 3. 如果菜单项不存在，则允许访问（因为可能是动态路由或其他路由）
   * 4. 如果菜单项存在但没有定义 roles，则允许访问
   * 5. 如果菜单项存在且定义了 roles，则检查用户角色
   */
  const canAccessMenu = (menuPath: string): boolean => {
    if (!userRole.value) return false;

    // ✅ 特殊处理移动端路由：自动允许访问
    // 移动端路由有独立的布局和权限系统，不需要在静态菜单中配置
    if (menuPath.startsWith('/mobile/')) {
      return true;
    }

    // 在静态菜单配置中查找对应的菜单项
    // 支持精确匹配和前缀匹配（例如 /parent-center/dashboard 匹配 /parent-center）
    const findMenuItem = (menus: any[], path: string): any => {
      for (const menu of menus) {
        // 精确匹配
        if (menu.path === path) {
          return menu;
        }
        // 前缀匹配：如果路径以菜单路径开头，则认为匹配
        if (path.startsWith(menu.path + '/')) {
          return menu;
        }
        // 递归查找子菜单
        if (menu.children) {
          const found = findMenuItem(menu.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItem(STATIC_MENU_CONFIG, menuPath);

    // ✅ 修复：如果菜单项不存在，允许访问（可能是动态路由或其他路由）
    if (!menuItem) {
      console.log(`ℹ️ 菜单项不存在: ${menuPath}，允许访问（可能是动态路由）`);
      return true;
    }

    // 检查角色权限
    if (menuItem.roles && menuItem.roles.length > 0) {
      const hasAccess = menuItem.roles.includes(userRole.value);
      if (!hasAccess) {
        console.warn(`🚫 用户角色 ${userRole.value} 无权访问 ${menuPath}，需要角色: ${menuItem.roles.join(', ')}`);
      }
      return hasAccess;
    }

    // ✅ 如果没有定义 roles，允许访问
    console.log(`ℹ️ 菜单项 ${menuPath} 未定义角色权限，允许访问`);
    return true;
  };

  /**
   * 初始化权限数据 - 简化版本
   */
  const initializePermissions = async (userRoleFromAuth?: string) => {
    try {
      console.log('🚀 初始化静态权限系统...');

      // 设置用户角色
      if (userRoleFromAuth) {
        setUserRole(userRoleFromAuth);
      }

      // 生成菜单
      await fetchMenuItems();

      initialized.value = true;
      console.log('✅ 静态权限系统初始化完成');
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '权限初始化失败';
      console.error('❌ 权限初始化失败:', err);
      return false;
    }
  };

  /**
   * 清除权限数据
   */
  const clearPermissions = () => {
    menuItems.value = [];
    userRole.value = '';
    initialized.value = false;
    error.value = null;
    console.log('🗑️ 权限数据已清除');
  };

  /**
   * 同步权限检查（供指令使用）
   */
  const hasPermissionSync = (permission: string): boolean => {
    return checkPermission(permission);
  };

  /**
   * 异步权限检查（供指令使用）
   */
  const hasPermission = async (permission: string): Promise<boolean> => {
    return checkPermission(permission);
  };

  /**
   * 批量异步权限检查（供指令使用）
   */
  const hasPermissions = async (permissions: string[]): Promise<{[key: string]: boolean}> => {
    return checkPermissions(permissions);
  };

  return {
    // 状态
    menuItems,
    userRole,
    loading,
    error,
    initialized,

    // 计算属性
    hasMenuItems,
    isAdmin,
    isPrincipal,
    isTeacher,
    isParent,

    // 核心权限方法 - 静态权限系统
    checkPermission,      // 单个权限验证（同步）
    checkPermissions,     // 批量权限验证
    hasRole,             // 角色检查
    canAccessMenu,       // 菜单访问权限检查
    
    // 指令兼容方法
    hasPermissionSync,    // 同步权限检查
    hasPermission,        // 异步权限检查
    hasPermissions,       // 批量异步权限检查

    // 管理方法
    setUserRole,
    initializePermissions,
    clearPermissions,

    // 内部方法
    fetchMenuItems
  };
});