/**
 * TC-002: 角色权限控制测试
 * 移动端基于角色的权限控制系统测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateAPIResponse,
  validateEnumValue,
  captureConsoleErrors
} from '../../utils/validation-helpers';
import {
  tapElement,
  waitForElement,
  waitForElementVisible
} from '../../utils/mobile-interactions';

// Mock API responses
const mockPermissionAPI = {
  getUserPermissions: vi.fn(),
  checkPermission: vi.fn(),
  updateUserPermissions: vi.fn()
};

const mockAuthAPI = {
  login: vi.fn(),
  logout: vi.fn()
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 定义角色枚举
enum UserRole {
  ADMIN = 'admin',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  PARENT = 'parent'
}

// 定义权限枚举
enum Permission {
  // 通用权限
  MOBILE_CENTERS_READ = 'mobile:centers:read',

  // 教师权限
  MOBILE_ACTIVITY_READ = 'mobile:activity:read',
  MOBILE_CLASS_READ = 'mobile:class:read',

  // 家长权限
  MOBILE_PARENT_READ = 'mobile:parent:read',
  MOBILE_CHILD_READ = 'mobile:child:read',

  // 管理员权限
  MOBILE_ADMIN_READ = 'mobile:admin:read',
  MOBILE_SYSTEM_SETTINGS = 'mobile:system:settings',

  // 园长权限
  MOBILE_REPORTS_READ = 'mobile:reports:read'
}

describe('TC-002: 角色权限控制测试', () => {
  let consoleMonitor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    consoleMonitor = captureConsoleErrors();

    // 设置基础DOM结构
    document.body.innerHTML = `
      <div class="mobile-app">
        <nav class="mobile-nav">
          <a href="/mobile/centers" data-route="/mobile/centers" data-permission="mobile:centers:read">管理中心</a>
          <a href="/mobile/centers/activity-center" data-route="/mobile/centers/activity-center" data-permission="mobile:activity:read">活动中心</a>
          <a href="/mobile/centers/parent-center" data-route="/mobile/centers/parent-center" data-permission="mobile:parent:read">家长中心</a>
          <a href="/mobile/admin/dashboard" data-route="/mobile/admin/dashboard" data-permission="mobile:admin:read">管理后台</a>
          <a href="/mobile/system/settings" data-route="/mobile/system/settings" data-permission="mobile:system:settings">系统设置</a>
        </nav>

        <main class="mobile-content">
          <div id="route-content">
            <!-- 动态内容区域 -->
          </div>

          <div id="unauthorized-message" style="display: none;">
            <h2>访问受限</h2>
            <p>您没有权限访问此页面</p>
            <button class="back-button" onclick="history.back()">返回</button>
          </div>
        </main>
      </div>
    `;

    // Mock route guard functionality
    const checkRoutePermission = async (route: string) => {
      const navLink = document.querySelector(`[data-route="${route}"]`) as HTMLElement;
      if (!navLink) return false;

      const requiredPermission = navLink.getAttribute('data-permission');
      if (!requiredPermission) return true;

      try {
        const response = await mockPermissionAPI.checkPermission(requiredPermission);
        return response.hasPermission;
      } catch (error) {
        return false;
      }
    };

    // Mock navigation function
    (window as any).navigateToRoute = async (route: string) => {
      const hasPermission = await checkRoutePermission(route);

      if (!hasPermission) {
        document.getElementById('route-content')!.style.display = 'none';
        document.getElementById('unauthorized-message')!.style.display = 'block';
        return false;
      }

      document.getElementById('route-content')!.style.display = 'block';
      document.getElementById('unauthorized-message')!.style.display = 'none';
      window.location.hash = route;
      return true;
    };

    // Add click handlers to navigation links
    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const route = (link as HTMLElement).getAttribute('data-route');
        if (route) {
          await (window as any).navigateToRoute(route);
        }
      });
    });
  });

  afterEach(() => {
    consoleMonitor.restore();
    expectNoConsoleErrors();
  });

  it('家长角色应该只能访问授权页面', async () => {
    // 模拟家长用户登录
    const parentUser = {
      id: 'parent_123',
      username: 'test_parent',
      role: UserRole.PARENT,
      email: 'parent@example.com'
    };

    // 模拟家长权限数据
    const parentPermissions = {
      permissions: [
        Permission.MOBILE_CENTERS_READ,
        Permission.MOBILE_PARENT_READ,
        Permission.MOBILE_CHILD_READ
      ],
      roles: [UserRole.PARENT],
      routes: ['/mobile/centers', '/mobile/centers/parent-center']
    };

    mockAuthAPI.login.mockResolvedValue({
      success: true,
      data: {
        token: 'parent_token',
        user: parentUser,
        ...parentPermissions
      }
    });

    mockPermissionAPI.getUserPermissions.mockResolvedValue(parentPermissions);

    // 设置权限检查Mock
    mockPermissionAPI.checkPermission.mockImplementation((permission: string) => {
      return Promise.resolve({
        hasPermission: parentPermissions.permissions.includes(permission as Permission)
      });
    });

    // 执行登录
    await mockAuthAPI.login({
      username: 'test_parent',
      password: 'password123'
    });

    // 严格验证权限数据结构
    const permissionValidation = validateRequiredFields(parentPermissions, [
      'permissions', 'roles', 'routes'
    ]);
    expect(permissionValidation.valid).toBe(true);

    // 验证字段类型
    const typeValidation = validateFieldTypes(parentPermissions, {
      permissions: 'array',
      roles: 'array',
      routes: 'array'
    });
    expect(typeValidation.valid).toBe(true);

    // 测试访问授权页面
    const authorizedRoutes = ['/mobile/centers', '/mobile/centers/parent-center'];
    for (const route of authorizedRoutes) {
      const canAccess = await (window as any).navigateToRoute(route);
      expect(canAccess).toBe(true);

      const unauthorizedMessage = document.getElementById('unauthorized-message') as HTMLElement;
      expect(unauthorizedMessage.style.display).toBe('none');

      const routeContent = document.getElementById('route-content') as HTMLElement;
      expect(routeContent.style.display).toBe('block');
    }

    // 测试访问未授权页面
    const unauthorizedRoutes = ['/mobile/centers/activity-center', '/mobile/admin/dashboard', '/mobile/system/settings'];
    for (const route of unauthorizedRoutes) {
      const canAccess = await (window as any).navigateToRoute(route);
      expect(canAccess).toBe(false);

      const unauthorizedMessage = document.getElementById('unauthorized-message') as HTMLElement;
      expect(unauthorizedMessage.style.display).toBe('block');

      expect(unauthorizedMessage.textContent).toContain('您没有权限访问此页面');

      const backButton = unauthorizedMessage.querySelector('.back-button');
      expect(backButton).toBeTruthy();
    }
  });

  it('教师角色应该有相应的权限', async () => {
    // 模拟教师用户
    const teacherUser = {
      id: 'teacher_123',
      username: 'test_teacher',
      role: UserRole.TEACHER,
      email: 'teacher@example.com'
    };

    // 模拟教师权限数据
    const teacherPermissions = {
      permissions: [
        Permission.MOBILE_CENTERS_READ,
        Permission.MOBILE_ACTIVITY_READ,
        Permission.MOBILE_CLASS_READ
      ],
      roles: [UserRole.TEACHER],
      routes: ['/mobile/centers', '/mobile/centers/activity-center']
    };

    mockAuthAPI.login.mockResolvedValue({
      success: true,
      data: {
        token: 'teacher_token',
        user: teacherUser,
        ...teacherPermissions
      }
    });

    mockPermissionAPI.getUserPermissions.mockResolvedValue(teacherPermissions);

    mockPermissionAPI.checkPermission.mockImplementation((permission: string) => {
      return Promise.resolve({
        hasPermission: teacherPermissions.permissions.includes(permission as Permission)
      });
    });

    // 执行登录
    await mockAuthAPI.login({
      username: 'test_teacher',
      password: 'password123'
    });

    // 验证教师权限数据
    const permissionValidation = validateRequiredFields(teacherPermissions, [
      'permissions', 'roles', 'routes'
    ]);
    expect(permissionValidation.valid).toBe(true);

    // 验证角色枚举值
    expect(validateEnumValue(teacherUser.role, UserRole)).toBe(true);

    // 测试教师可访问的页面
    const teacherAuthorizedRoutes = ['/mobile/centers', '/mobile/centers/activity-center'];
    for (const route of teacherAuthorizedRoutes) {
      const canAccess = await (window as any).navigateToRoute(route);
      expect(canAccess).toBe(true);
    }

    // 测试教师不可访问的页面
    const teacherUnauthorizedRoutes = ['/mobile/centers/parent-center', '/mobile/admin/dashboard'];
    for (const route of teacherUnauthorizedRoutes) {
      const canAccess = await (window as any).navigateToRoute(route);
      expect(canAccess).toBe(false);
    }
  });

  it('管理员角色应该拥有所有权限', async () => {
    // 模拟管理员用户
    const adminUser = {
      id: 'admin_123',
      username: 'test_admin',
      role: UserRole.ADMIN,
      email: 'admin@example.com'
    };

    // 模拟管理员权限数据（拥有所有权限）
    const adminPermissions = {
      permissions: Object.values(Permission),
      roles: [UserRole.ADMIN],
      routes: [
        '/mobile/centers',
        '/mobile/centers/activity-center',
        '/mobile/centers/parent-center',
        '/mobile/admin/dashboard',
        '/mobile/system/settings'
      ]
    };

    mockAuthAPI.login.mockResolvedValue({
      success: true,
      data: {
        token: 'admin_token',
        user: adminUser,
        ...adminPermissions
      }
    });

    mockPermissionAPI.getUserPermissions.mockResolvedValue(adminPermissions);

    mockPermissionAPI.checkPermission.mockImplementation((permission: string) => {
      return Promise.resolve({
        hasPermission: adminPermissions.permissions.includes(permission as Permission)
      });
    });

    // 执行登录
    await mockAuthAPI.login({
      username: 'test_admin',
      password: 'password123'
    });

    // 验证管理员拥有所有权限
    expect(adminPermissions.permissions).toContain(Permission.MOBILE_CENTERS_READ);
    expect(adminPermissions.permissions).toContain(Permission.MOBILE_ACTIVITY_READ);
    expect(adminPermissions.permissions).toContain(Permission.MOBILE_PARENT_READ);
    expect(adminPermissions.permissions).toContain(Permission.MOBILE_ADMIN_READ);
    expect(adminPermissions.permissions).toContain(Permission.MOBILE_SYSTEM_SETTINGS);

    // 测试管理员可以访问所有页面
    const allRoutes = [
      '/mobile/centers',
      '/mobile/centers/activity-center',
      '/mobile/centers/parent-center',
      '/mobile/admin/dashboard',
      '/mobile/system/settings'
    ];

    for (const route of allRoutes) {
      const canAccess = await (window as any).navigateToRoute(route);
      expect(canAccess).toBe(true);

      const unauthorizedMessage = document.getElementById('unauthorized-message') as HTMLElement;
      expect(unauthorizedMessage.style.display).toBe('none');
    }
  });

  it('应该正确处理权限刷新', async () => {
    // 初始权限（家长角色）
    const initialPermissions = {
      permissions: [Permission.MOBILE_CENTERS_READ, Permission.MOBILE_PARENT_READ],
      roles: [UserRole.PARENT],
      routes: ['/mobile/centers', '/mobile/centers/parent-center']
    };

    // 更新后的权限（升级为管理员）
    const updatedPermissions = {
      permissions: Object.values(Permission),
      roles: [UserRole.ADMIN],
      routes: [
        '/mobile/centers',
        '/mobile/centers/activity-center',
        '/mobile/centers/parent-center',
        '/mobile/admin/dashboard',
        '/mobile/system/settings'
      ]
    };

    mockPermissionAPI.getUserPermissions
      .mockResolvedValueOnce(initialPermissions)
      .mockResolvedValueOnce(updatedPermissions);

    mockPermissionAPI.checkPermission.mockImplementation((permission: string) => {
      return Promise.resolve({
        hasPermission: updatedPermissions.permissions.includes(permission as Permission)
      });
    });

    mockPermissionAPI.updateUserPermissions.mockResolvedValue({
      success: true,
      data: updatedPermissions
    });

    // 获取初始权限
    const initialResult = await mockPermissionAPI.getUserPermissions();
    expect(initialResult).toEqual(initialPermissions);

    // 模拟后台更新权限
    const updateResult = await mockPermissionAPI.updateUserPermissions('user_123', updatedPermissions);

    // 验证更新响应
    const updateValidation = validateAPIResponse(updateResult);
    expect(updateValidation.valid).toBe(true);

    // 验证权限数据
    const permissionValidation = validateRequiredFields(updateResult.data, [
      'permissions', 'roles', 'routes'
    ]);
    expect(permissionValidation.valid).toBe(true);

    // 测试权限立即生效
    const canAccessAdmin = await (window as any).navigateToRoute('/mobile/admin/dashboard');
    expect(canAccess).toBe(true);

    const canAccessSettings = await (window as any).navigateToRoute('/mobile/system/settings');
    expect(canAccessSettings).toBe(true);
  });

  it('应该正确处理权限验证失败', async () => {
    // 模拟权限检查失败
    mockPermissionAPI.checkPermission.mockRejectedValue(new Error('Permission check failed'));

    // 尝试访问需要权限的页面
    const canAccess = await (window as any).navigateToRoute('/mobile/admin/dashboard');

    // 验证失败时默认拒绝访问
    expect(canAccess).toBe(false);

    const unauthorizedMessage = document.getElementById('unauthorized-message') as HTMLElement;
    expect(unauthorizedMessage.style.display).toBe('block');
  });

  it('应该正确验证角色枚举值', async () => {
    // 测试有效角色值
    expect(validateEnumValue(UserRole.ADMIN, UserRole)).toBe(true);
    expect(validateEnumValue(UserRole.PARENT, UserRole)).toBe(true);
    expect(validateEnumValue(UserRole.TEACHER, UserRole)).toBe(true);
    expect(validateEnumValue(UserRole.PRINCIPAL, UserRole)).toBe(true);

    // 测试无效角色值
    expect(validateEnumValue('invalid_role', UserRole)).toBe(false);
    expect(validateEnumValue(null, UserRole)).toBe(false);
    expect(validateEnumValue(undefined, UserRole)).toBe(false);
  });

  it('应该正确验证权限枚举值', async () => {
    // 测试有效权限值
    expect(validateEnumValue(Permission.MOBILE_CENTERS_READ, Permission)).toBe(true);
    expect(validateEnumValue(Permission.MOBILE_PARENT_READ, Permission)).toBe(true);

    // 测试无效权限值
    expect(validateEnumValue('invalid_permission', Permission)).toBe(false);
    expect(validateEnumValue(null, Permission)).toBe(false);
  });

  it('应该正确处理权限缓存机制', async () => {
    const permissions = {
      permissions: [Permission.MOBILE_CENTERS_READ],
      roles: [UserRole.PARENT],
      routes: ['/mobile/centers']
    };

    mockPermissionAPI.getUserPermissions.mockResolvedValue(permissions);
    mockPermissionAPI.checkPermission.mockResolvedValue({ hasPermission: true });

    // Mock缓存存储
    const permissionCache = new Map<string, boolean>();

    // 模拟权限缓存检查函数
    (window as any).checkPermissionWithCache = async (permission: string) => {
      if (permissionCache.has(permission)) {
        return permissionCache.get(permission);
      }

      const result = await mockPermissionAPI.checkPermission(permission);
      permissionCache.set(permission, result.hasPermission);
      return result.hasPermission;
    };

    // 第一次调用（应该调用API）
    const result1 = await (window as any).checkPermissionWithCache(Permission.MOBILE_CENTERS_READ);
    expect(result1).toBe(true);
    expect(mockPermissionAPI.checkPermission).toHaveBeenCalledTimes(1);

    // 第二次调用（应该使用缓存）
    const result2 = await (window as any).checkPermissionWithCache(Permission.MOBILE_CENTERS_READ);
    expect(result2).toBe(true);
    expect(mockPermissionAPI.checkPermission).toHaveBeenCalledTimes(1); // 没有增加调用次数

    // 验证缓存存储
    expect(permissionCache.get(Permission.MOBILE_CENTERS_READ)).toBe(true);
  });
});

/**
 * 检查控制台错误
 */
function expectNoConsoleErrors() {
  expect(consoleMonitor.errors).toHaveLength(0);
  expect(consoleMonitor.warnings).toHaveLength(0);
}

/**
 * 权限测试数据生成器
 */
export function generatePermissionTestData() {
  return {
    [UserRole.PARENT]: {
      permissions: [Permission.MOBILE_CENTERS_READ, Permission.MOBILE_PARENT_READ, Permission.MOBILE_CHILD_READ],
      authorizedRoutes: ['/mobile/centers', '/mobile/centers/parent-center'],
      unauthorizedRoutes: ['/mobile/admin/dashboard', '/mobile/system/settings']
    },
    [UserRole.TEACHER]: {
      permissions: [Permission.MOBILE_CENTERS_READ, Permission.MOBILE_ACTIVITY_READ, Permission.MOBILE_CLASS_READ],
      authorizedRoutes: ['/mobile/centers', '/mobile/centers/activity-center'],
      unauthorizedRoutes: ['/mobile/centers/parent-center', '/mobile/admin/dashboard']
    },
    [UserRole.ADMIN]: {
      permissions: Object.values(Permission),
      authorizedRoutes: ['/mobile/centers', '/mobile/centers/activity-center', '/mobile/centers/parent-center', '/mobile/admin/dashboard', '/mobile/system/settings'],
      unauthorizedRoutes: []
    }
  };
}