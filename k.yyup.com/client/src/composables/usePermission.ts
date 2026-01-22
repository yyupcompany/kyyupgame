import { computed, ref, watch } from 'vue'
import { useUserStore } from '../stores/user';
import {
  // PermissionManager,
  ROLES,
  ROUTE_PERMISSIONS,
  createPermissionManager
} from '../utils/permission';

/**
 * 权限检查组合式函数
 * 与后端权限验证保持一致
 */
export function usePermission() {
  const userStore = useUserStore();
  
  // 创建权限管理器实例
  const permissionManager = ref(
    createPermissionManager(
      userStore.userPermissions || [],
      userStore.userInfo?.role || ROLES.USER
    )
  );
  
  // 监听用户信息变化，更新权限管理器
  watch(
    [() => userStore.userPermissions, () => userStore.userInfo?.role],
    ([permissions, role]) => {
      permissionManager.value.updatePermissions(
        (permissions as string[]) || [],
        (role as string) || ROLES.USER
      );
    },
    { immediate: true }
  );
  
  // 获取用户权限列表
  const userPermissions = computed(() => userStore.userPermissions || []);
  
  // 获取用户角色
  const userRole = computed(() => userStore.userInfo?.role || ROLES.USER);
  
  /**
   * 检查用户是否拥有特定权限
   * @param permissionCode 权限代码
   * @returns 是否拥有权限
   */
  const hasPermission = (permissionCode: string): boolean => {
    return permissionManager.value.hasPermission(permissionCode);
  };
  
  /**
   * 检查用户是否拥有特定角色
   * @param roleCode 角色代码
   * @returns 是否拥有角色
   */
  const hasRole = (roleCode: string): boolean => {
    return permissionManager.value.hasRole(roleCode);
  };
  
  /**
   * 检查用户是否拥有任一指定角色
   * @param roleCodes 角色代码数组
   * @returns 是否拥有任一角色
   */
  const hasAnyRole = (roleCodes: string[]): boolean => {
    return permissionManager.value.hasAnyRole(roleCodes);
  };
  
  /**
   * 检查是否为管理员
   * @returns 是否为管理员
   */
  const isAdmin = (): boolean => {
    return permissionManager.value.isAdmin();
  };
  
  /**
   * 检查用户是否可以访问特定资源的特定操作
   * @param resource 资源名称
   * @param action 操作类型
   * @returns 是否可以访问
   */
  const canAccess = (resource: string, action: string): boolean => {
    return permissionManager.value.canAccess(resource, action);
  };
  
  /**
   * 检查用户是否可以访问特定路由
   * @param routePath 路由路径
   * @returns 是否可以访问
   */
  const canAccessRoute = (routePath: string): boolean => {
    const requiredPermission = ROUTE_PERMISSIONS[routePath];
    
    // 如果路由没有权限要求，默认可以访问
    if (!requiredPermission) {
      return true;
    }
    
    return hasPermission(requiredPermission);
  };
  
  /**
   * 过滤菜单项，只保留有权限访问的菜单
   * @param menus 菜单项列表
   * @returns 过滤后的菜单列表
   */
  const filterMenusByPermission = <T extends { 
    permission?: string; 
    path?: string;
    children?: T[] 
  }>(menus: T[]): T[] => {
    const normalizedMenus = menus.map(menu => ({
      ...menu,
      permission: menu.permission || (menu.path ? ROUTE_PERMISSIONS[menu.path] : undefined)
    })) as T[];
    return permissionManager.value.filterMenusByPermission(normalizedMenus);
  };
  
  /**
   * 根据权限显示/隐藏元素的指令
   */
  const vPermission = {
    mounted(el: HTMLElement, binding: { value: string }) {
      if (!hasPermission(binding.value)) {
        el.style.display = 'none';
      }
    },
    updated(el: HTMLElement, binding: { value: string }) {
      if (!hasPermission(binding.value)) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    }
  };
  
  /**
   * 根据角色显示/隐藏元素的指令
   */
  const vRole = {
    mounted(el: HTMLElement, binding: { value: string | string[] }) {
      const roles = Array.isArray(binding.value) ? binding.value : [binding.value];
      if (!hasAnyRole(roles)) {
        el.style.display = 'none';
      }
    },
    updated(el: HTMLElement, binding: { value: string | string[] }) {
      const roles = Array.isArray(binding.value) ? binding.value : [binding.value];
      if (!hasAnyRole(roles)) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    }
  };
  
  // 兼容旧版API
  const can = (resource: string, action: string): boolean => {
    return canAccess(resource, action);
  };
  
  return {
    // 权限检查方法
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin,
    canAccess,
    canAccessRoute,
    can, // 兼容旧版API
    
    // 菜单过滤
    filterMenusByPermission,
    
    // 指令
    vPermission,
    vRole,
    
    // 计算属性
    userPermissions,
    userRole,
    
    // 权限管理器实例（用于高级用法）
    permissionManager: computed(() => permissionManager.value)
  };
} 