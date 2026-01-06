/**
 * 前端权限管理 - 静态菜单系统简化版
 * 专为静态菜单系统设计的简化权限验证
 */

import { defineStore } from 'pinia';
// import env from '@/env';
import { ref, computed } from 'vue';
import { getUserMenu, getUserRoles, getUserPermissions, type MenuItem } from '../api/modules/auth-permissions';
import { post } from '../utils/request';
import { useUserStore } from '@/stores/user';



// Mock env object
const env = {
  isDevelopment: false,
  useMockData: false
}

// 中文名称映射函数
const getChineseNameForMenuItem = (name: string): string => {
  const nameMap: Record<string, string> = {
    'Personnel Center': '人员中心',
    'Activity Center': '活动中心',
    'Enrollment Center': '招生中心',
    'Marketing Center': '营销中心',
    'AI Center': 'AI中心',
    'Finance Center': '财务中心',
    'FinanceCenter': '财务中心',
    'Teaching Center': '教学中心',
    'System Center': '系统中心',
    'System Management': '系统中心',
    'Dashboard Center': '仪表板中心',
    'Script Center': '话术中心',
    // 添加更多可能的英文名称
    'Personnel Management': '人员中心',
    'Activity Management': '活动中心',
    'Enrollment Management': '招生中心',
    'Marketing Management': '营销中心',
    'AI Management': 'AI中心',
    'Finance Management': '财务中心',
    'System Settings': '系统中心',
    'Task Center': '任务中心',
    'Customer Pool Center': '客户池中心',
    '任务中心': '任务中心',
    '系统管理': '系统中心',
    '话术中心': '话术中心'
  };
  return nameMap[name] || name;
};

export const usePermissionsStore = defineStore('permissions', () => {
  // 核心状态
  const menuItems = ref([]);
  const roles = ref([]);
  const permissions = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  // 权限缓存已移至verificationCache统一管理

  // 计算属性
  const hasPermissions = computed(() => permissions.value.length > 0);
  const hasMenuItems = computed(() => menuItems.value.length > 0);
  const userRoles = computed(() => roles.value.map((role: any) => role.code));
  const isAdmin = computed(() => userRoles.value.includes('admin'));

  // 获取用户权限
  const fetchPermissions = async () => {
    try {
      // 🔒 检查用户是否已登录
      const token = localStorage.getItem('kindergarten_token')

      if (!token) {
        console.log('🔧 未登录状态，跳过权限获取:', window.location.pathname);
        permissions.value = [];
        return;
      }

      loading.value = true;
      error.value = null;

      const response = await getUserPermissions();
      if (response.success) {
        permissions.value = response.data || [];
        console.log('✅ 权限获取成功:', permissions.value.length);
      } else {
        throw new Error(response.message || '获取权限失败');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取权限失败';
      console.error('❌ 权限获取失败:', err);
      permissions.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 获取用户菜单
  const fetchMenuItems = async () => {
    try {
      // 🔒 检查用户是否已登录
      const token = localStorage.getItem('kindergarten_token')

      if (!token) {
        console.log('🔧 未登录状态，跳过菜单获取:', window.location.pathname);
        menuItems.value = [];
        return;
      }

      loading.value = true;
      error.value = null;

      const response = await getUserMenu();
      if (response.success) {
        // 后端返回的数据格式: 直接是菜单数组
        const data = response.data || [];
        const rawMenuItems = Array.isArray(data) ? data : (data.menuItems || []);

        // 🎯 最规范的实现：完全信任后端返回的数据，不做任何转换
        // 后端已经返回了chinese_name字段，前端直接使用
        // 不再使用前端的名称映射逻辑
        menuItems.value = rawMenuItems;

        console.log('✅ 菜单获取成功:', menuItems.value.length);
        console.log('🔍 菜单数据详情:', menuItems.value.slice(0, 2));
        console.log('🔍 第一个菜单项结构:', menuItems.value[0]);
      } else {
        throw new Error(response.message || '获取菜单失败');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取菜单失败';
      console.error('❌ 菜单获取失败:', err);
      // 开发/Mock模式下提供本地降级菜单，避免401阻塞
      if (env.isDevelopment && env.useMockData) {
        const fallbackMenu: any[] = [
          {
            id: 'dashboard-category',
            name: 'Dashboard Center',
            chineseName: '仪表板��心',
            code: 'DASHBOARD_CENTER',
            type: 'category',
            path: '#dashboard',
            icon: 'Gauge',
            sort: 1,
            parentId: null,
            status: 1,
            children: [
              {
                id: 'dashboard-home',
                name: 'dashboard',
                chineseName: '���表板',
                code: 'DASHBOARD_HOME',
                type: 'menu',
                path: '/dashboard',
                component: 'pages/dashboard/index.vue',
                filePath: 'pages/dashboard/index.vue',
                icon: 'Gauge',
                sort: 1,
                parentId: 'dashboard-category',
                status: 1
              }
            ]
          }
        ];
        menuItems.value = fallbackMenu;
        console.warn('⚠️ 使用本地降级菜单（开发Mock）:', menuItems.value.length);
      } else {
        menuItems.value = [];
      }
    } finally {
      loading.value = false;
    }
  };

  // 获取用户角色
  const fetchRoles = async () => {
    try {
      // 🔒 检查用户是否已登录
      const token = localStorage.getItem('kindergarten_token')

      if (!token) {
        console.log('🔧 未登录状态，跳过角色获取:', window.location.pathname);
        roles.value = [];
        return;
      }

      loading.value = true;
      error.value = null;

      const response = await getUserRoles();
      if (response.success) {
        // 后端返回的数据格式: { roles: [...], currentRole: {...}, isAdmin: boolean }
        const data = response.data || {};
        roles.value = data.roles || [];
        console.log('✅ 角色获取成功:', roles.value.map((r: any) => r.name));
      } else {
        throw new Error(response.message || '获取角色失败');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取角色失败';
      console.error('❌ 角色获取失败:', err);
      // 开发/Mock模式下提供本地降级角色
      if (env.isDevelopment && env.useMockData) {
        roles.value = [
          { id: 1, name: '管理员', code: 'admin', description: '开发管理员', status: 1 } as any
        ];
        console.warn('⚠️ 使用本地降级角色（开发Mock）:', roles.value.map((r: any) => r.code));
      } else {
        roles.value = [];
      }
    } finally {
      loading.value = false;
    }
  };

  // 检查是否有某个权限 - 修复：检查菜单项而不是权限数组
  const hasPermission = (path: string): boolean => {
    // 管理员拥有所有权限
    if (isAdmin.value) {
      console.log(`✅ 管理员权限，允许访问: ${path}`);
      return true;
    }

    // 递归检查菜单项中是否有匹配的路径
    const checkMenuItems = (items: MenuItem[]): boolean => {
      for (const item of items) {
        if (item.path === path) {
          console.log(`✅ 找到匹配的菜单权限: ${path}`);
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (checkMenuItems(item.children)) {
            return true;
          }
        }
      }
      return false;
    };

    const hasAccess = checkMenuItems(menuItems.value);
    if (!hasAccess) {
      console.warn(`🚫 未找到路径权限: ${path}, 菜单项数量: ${menuItems.value.length}`);
    }
    return hasAccess;
  };

  // Level 4: 检查是否有某个权限代码（用于指令）
  const hasPermissionCode = (code: string): boolean => {
    // 管理员拥有所有权限
    if (isAdmin.value) {
      console.log(`✅ Level 4: 管理员权限，允许访问: ${code}`);
      return true;
    }

    // 检查���限列表中是否包含该权限代码
    const hasCode = permissions.value.some((permission: any) =>
      (permission as any).code === code ||
      (permission as any).permission === code ||
      (permission as any).path === code
    );

    console.log(`🔍 Level 4: 权限代码验证: ${code} -> ${hasCode}`);
    return hasCode;
  };

  // 检查是否有某个角色
  const hasRole = (roleCode: string): boolean => {
    // 首先检查权限store中的角色
    if (userRoles.value.includes(roleCode)) {
      return true;
    }

    // 简化版本：直接检查基础角色
    console.warn(`🚫 角色检查失败: ${roleCode}, 权限角色: [${userRoles.value.join(', ')}]`);
    return false;
  };

  // 动态权限获取已整合到fetchPermissions中

  // 初始化权限数据 - 修复：加载菜单权限和用户权限代码
  const initializePermissions = async () => {
    try {
      // 🔒 检查用户是否已登录
      const token = localStorage.getItem('kindergarten_token')

      if (!token) {
        console.log('🔧 未登录状态，跳过权限检查:', window.location.pathname);
        return null;
      }

      console.log('🚀 Level 1: 初始化菜单权限和用户权限...');

      // 🔧 修复：同时加载菜单权限和用户权限代码，确保Level 4权限验证正常工作
      await Promise.all([
        fetchMenuItems(),    // 获取侧边栏菜单
        fetchRoles(),        // 获取用户角色信息
        fetchPermissions()   // 🎯 重新添加：获取用户权限代码列表，支持hasPermissionCode函数
      ]);

      console.log('✅ Level 1: 菜单权限和用户权限初始化完成');
      console.log(`📊 菜单数量: ${menuItems.value.length}, 角色数量: ${roles.value.length}, 权限数量: ${permissions.value.length}`);

      return {
        menuItems: menuItems.value,
        roles: roles.value,
        level: 1,
        description: '侧边栏菜单权限'
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : '权限初始化失败';
      console.error('❌ Level 1 权限初始化失败:', err);
      return null;
    }
  };

  // 清空权限数据
  const clearPermissions = () => {
    permissions.value = [];
    menuItems.value = [];
    roles.value = [];
    error.value = null;
  };

  // 刷新权限数据
  const refreshPermissions = async () => {
    await initializePermissions();
  };

  // Level 2: 页面访问权限验证（带缓存）
  const verificationCache = ref(new Map());
  const VERIFICATION_CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  const checkPagePermission = async (path: string, permission?: string): Promise<boolean> => {
    try {
      if ((env.isDevelopment && env.useMockData) || isAdmin.value) {
        console.log(`🔧 开发/Mock模式或管理员，跳过后端校验: ${path}`);
        return true;
      }

      // 工作台是所有登录用户都可以访问的基础页面
      if (path === '/dashboard' || path === '/') {
        console.log(`✅ Level 2: 工作台页面，所有登录用户都可访问: ${path}`);
        return true;
      }

      // 检查是否有认证token，如果没有则跳过权限检查
      const userStore = useUserStore();
      if (!userStore.token) {
        console.log(`🔧 未登录状态，跳过权限检查: ${path}`);
        return true; // 让路由守卫处理重定向到登录页面
      }

      // 检查缓存
      const cacheKey = `${path}:${permission || ''}`;
      const cached = verificationCache.value.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp) < VERIFICATION_CACHE_DURATION) {
        console.log(`✅ Level 2: 使用缓存的权限验证结果: ${path} -> ${cached.result}`);
        return cached.result;
      }

      console.log(`🔍 Level 2: 验证页面权限: ${path}`);
      const startTime = Date.now();

      // 调用权限验证API - 使用正确的API端点
      const response = await post('/dynamic-permissions/check-permission', {
        path,
        permission
      });

      let hasPermission = response.success && response.data?.hasPermission;
      const responseTime = Date.now() - startTime;

      // 如果当前路径权限验证失败，尝试验证父路由权限（权限继承）
      if (!hasPermission && path.includes('/')) {
        // 提取父路径（去掉最后一段）
        const pathSegments = path.split('/').filter(Boolean);
        if (pathSegments.length > 1) {
          // 检查最后一段是否是ID（数字）
          const lastSegment = pathSegments[pathSegments.length - 1];
          const isDetailPage = /^\d+$/.test(lastSegment);

          if (isDetailPage) {
            // 构建父路径
            const parentPath = '/' + pathSegments.slice(0, -1).join('/');
            console.log(`🔍 Level 2: 详情页权限验证失败，尝试验证父路由权限: ${parentPath}`);

            // 递归验证父路径权限
            const parentHasPermission = await checkPagePermission(parentPath, permission);
            if (parentHasPermission) {
              console.log(`✅ Level 2: 父路由有权限，继承权限: ${path} <- ${parentPath}`);
              hasPermission = true;
            }
          }
        }
      }

      // 缓存结果
      verificationCache.value.set(cacheKey, {
        result: hasPermission,
        timestamp: Date.now()
      });

      console.log(`⚡ Level 2: 权限验证完成: ${path} -> ${hasPermission} (${responseTime}ms)`);
      return hasPermission;

    } catch (err) {
      console.error(`❌ Level 2: 页面权限验证失败: ${path}`, err);
      // 如果是401错误（未认证），返回true让路由守卫处理
      if (err?.response?.status === 401) {
        console.log(`🔧 认证失败，跳过权限检查: ${path}`);
        return true;
      }
      return false;
    }
  };

  // 清除权限验证缓存
  const clearVerificationCache = () => {
    verificationCache.value.clear();
    console.log('🗑️ Level 2: 权限验证缓存已清除');
  };

  // 🎯 新增：将menuItems转换为menuGroups格式供ImprovedSidebar使用
  const menuGroups = computed(() => {
    console.log('🔍 menuGroups计算属性被调用');
    console.log('🔍 menuItems.value:', menuItems.value);
    console.log('🔍 menuItems.value.length:', menuItems.value?.length);

    if (!menuItems.value || menuItems.value.length === 0) {
      console.warn('⚠️ menuItems为空，返回空数组');
      return [];
    }

    // 将menuItems转换为ImprovedSidebar需要的格式
    const groups = menuItems.value.map((category: any) => {
      console.log('🔍 处理category:', category.name, category.chineseName, category.chinese_name);

      const children = category.children || [];

      // 🎯 最规范的实现：完全信任后端返回的数据，不做任何转换
      // 后端已经返回了chinese_name字段，前端直接使用
      // 不再使用前端的名称映射逻辑
      const items = children.length > 0
        ? children.map((menu: any) => ({
            id: menu.id || menu.code,
            title: menu.chineseName || menu.chinese_name || menu.name,
            route: menu.path || '#',
            icon: menu.icon || 'Menu',
            children: (menu.children || []).map((submenu: any) => ({
              id: submenu.id || submenu.code,
              title: submenu.chineseName || submenu.chinese_name || submenu.name,
              route: submenu.path || '#',
              icon: submenu.icon || 'Menu'
            }))
          }))
        : [{
            // 如果没有children，将category本身作为菜单项
            id: category.id || category.code,
            title: category.chineseName || category.chinese_name || category.name,
            route: category.path || '#',
            icon: category.icon || 'Menu',
            children: []
          }];

      return {
        id: category.id || category.code,
        title: category.chineseName || category.chinese_name || category.name,
        description: category.description || '',
        icon: category.icon || 'Menu',
        items: items
      };
    });

    console.log('✅ menuGroups生成完成:', groups.length, '个分组');
    console.log('🔍 第一个分组:', groups[0]);
    return groups;
  });

  return {
    // 状态
    permissions,
    menuItems,
    roles,
    loading,
    error,

    // 计算属性
    hasPermissions,
    hasMenuItems,
    userRoles,
    isAdmin,
    menuGroups, // 🎯 新增：导出menuGroups

    // Level 1: 菜单权限方法
    fetchPermissions,
    fetchMenuItems,
    fetchRoles,
    hasPermission,
    hasPermissionCode,
    hasRole,
    initializePermissions,
    clearPermissions,
    refreshPermissions,

    // Level 2: 页面权限验证方法
    checkPagePermission,
    clearVerificationCache
  };
});
