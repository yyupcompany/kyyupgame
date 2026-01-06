/**
 * 权限管理工具函数测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/utils/permission.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import {
  PermissionManager,
  createPermissionManager,
  requirePermission,
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  type Permission,
  type Role
} from '@/utils/permission'

describe('PermissionManager', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  let permissionManager: PermissionManager

  beforeEach(() => {
    permissionManager = new PermissionManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该使用默认权限和角色初始化', () => {
      const manager = new PermissionManager()
      
      expect(manager).toBeInstanceOf(PermissionManager)
    })

    it('应该能够使用自定义权限和角色初始化', () => {
      const permissions = [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.USER_VIEW]
      const role = ROLES.TEACHER
      
      const manager = new PermissionManager(permissions, role)
      
      expect(manager).toBeInstanceOf(PermissionManager)
    })

    it('应该能够使用createPermissionManager函数创建实例', () => {
      const manager = createPermissionManager([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
      
      expect(manager).toBeInstanceOf(PermissionManager)
    })
  })

  describe('updatePermissions', () => {
    it('应该能够更新用户权限和角色', () => {
      const newPermissions = [PERMISSIONS.USER_MANAGE, PERMISSIONS.ROLE_MANAGE]
      const newRole = ROLES.ADMIN
      
      permissionManager.updatePermissions(newPermissions, newRole)
      
      // 验证权限更新
      expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(true)
      expect(permissionManager.hasRole(ROLES.ADMIN)).toBe(true)
    })

    it('应该能够清空权限', () => {
      permissionManager.updatePermissions([], ROLES.USER)
      
      expect(permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('应该为超级管理员返回所有权限为true', () => {
      permissionManager.updatePermissions([], ROLES.SUPER_ADMIN)
      
      expect(permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.SYSTEM_MANAGE)).toBe(true)
    })

    it('应该为管理员返回所有权限为true', () => {
      permissionManager.updatePermissions([], ROLES.ADMIN)
      
      expect(permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.SYSTEM_MANAGE)).toBe(true)
    })

    it('应该正确检查具体权限', () => {
      const permissions = [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.USER_VIEW]
      permissionManager.updatePermissions(permissions, ROLES.TEACHER)
      
      expect(permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.USER_VIEW)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(false)
    })

    it('应该正确处理通配符权限', () => {
      permissionManager.updatePermissions(['*'], ROLES.TEACHER)
      
      expect(permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(true)
      expect(permissionManager.hasPermission(PERMISSIONS.SYSTEM_MANAGE)).toBe(true)
    })

    it('应该为没有权限的请求返回false', () => {
      permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
      
      expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(false)
      expect(permissionManager.hasPermission(PERMISSIONS.SYSTEM_MANAGE)).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('应该正确检查角色', () => {
      permissionManager.updatePermissions([], ROLES.TEACHER)
      
      expect(permissionManager.hasRole(ROLES.TEACHER)).toBe(true)
      expect(permissionManager.hasRole(ROLES.ADMIN)).toBe(false)
      expect(permissionManager.hasRole(ROLES.PARENT)).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('应该正确检查多个角色中的任意一个', () => {
      permissionManager.updatePermissions([], ROLES.TEACHER)
      
      expect(permissionManager.hasAnyRole([ROLES.TEACHER, ROLES.ADMIN])).toBe(true)
      expect(permissionManager.hasAnyRole([ROLES.ADMIN, ROLES.PRINCIPAL])).toBe(false)
      expect(permissionManager.hasAnyRole([ROLES.PARENT, ROLES.USER])).toBe(false)
    })

    it('应该处理空的角色列表', () => {
      expect(permissionManager.hasAnyRole([])).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('应该为超级管理员返回true', () => {
      permissionManager.updatePermissions([], ROLES.SUPER_ADMIN)
      expect(permissionManager.isAdmin()).toBe(true)
    })

    it('应该为管理员返回true', () => {
      permissionManager.updatePermissions([], ROLES.ADMIN)
      expect(permissionManager.isAdmin()).toBe(true)
    })

    it('应该为非管理员返回false', () => {
      permissionManager.updatePermissions([], ROLES.TEACHER)
      expect(permissionManager.isAdmin()).toBe(false)
      
      permissionManager.updatePermissions([], ROLES.PARENT)
      expect(permissionManager.isAdmin()).toBe(false)
    })
  })

  describe('canAccess', () => {
    it('应该根据资源和操作检查权限', () => {
      permissionManager.updatePermissions([PERMISSIONS.USER_VIEW], ROLES.TEACHER)
      
      expect(permissionManager.canAccess('user', 'view')).toBe(true)
      expect(permissionManager.canAccess('user', 'manage')).toBe(false)
      expect(permissionManager.canAccess('system', 'config')).toBe(false)
    })

    it('应该为管理员返回所有访问权限为true', () => {
      permissionManager.updatePermissions([], ROLES.ADMIN)
      
      expect(permissionManager.canAccess('user', 'view')).toBe(true)
      expect(permissionManager.canAccess('user', 'manage')).toBe(true)
      expect(permissionManager.canAccess('system', 'config')).toBe(true)
    })
  })

  describe('filterMenusByPermission', () => {
    it('应该过滤有权限的菜单项', () => {
      const menus = [
        { id: 1, name: 'Dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
        { id: 2, name: 'User Management', permission: PERMISSIONS.USER_MANAGE },
        { id: 3, name: 'Settings', permission: PERMISSIONS.SYSTEM_CONFIG }
      ]
      
      permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
      
      const filteredMenus = permissionManager.filterMenusByPermission(menus)
      
      expect(filteredMenus).toHaveLength(1)
      expect(filteredMenus[0].id).toBe(1)
      expect(filteredMenus[0].name).toBe('Dashboard')
    })

    it('应该保留没有权限要求的菜单项', () => {
      const menus = [
        { id: 1, name: 'Dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
        { id: 2, name: 'Home' }, // 没有权限要求
        { id: 3, name: 'Settings', permission: PERMISSIONS.SYSTEM_CONFIG }
      ]
      
      permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
      
      const filteredMenus = permissionManager.filterMenusByPermission(menus)
      
      expect(filteredMenus).toHaveLength(2)
      expect(filteredMenus[0].id).toBe(1)
      expect(filteredMenus[1].id).toBe(2)
    })

    it('应该递归过滤子菜单', () => {
      const menus = [
        {
          id: 1,
          name: 'System',
          permission: PERMISSIONS.SYSTEM_MANAGE,
          children: [
            { id: 2, name: 'Users', permission: PERMISSIONS.USER_VIEW },
            { id: 3, name: 'Roles', permission: PERMISSIONS.ROLE_VIEW }
          ]
        },
        {
          id: 4,
          name: 'Dashboard',
          permission: PERMISSIONS.DASHBOARD_VIEW,
          children: [
            { id: 5, name: 'Overview' }, // 没有权限要求
            { id: 6, name: 'Analytics', permission: PERMISSIONS.STATISTICS_VIEW }
          ]
        }
      ]
      
      permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.STATISTICS_VIEW], ROLES.TEACHER)
      
      const filteredMenus = permissionManager.filterMenusByPermission(menus)
      
      expect(filteredMenus).toHaveLength(1)
      expect(filteredMenus[0].id).toBe(4)
      expect(filteredMenus[0].children).toHaveLength(2)
      expect(filteredMenus[0].children![0].id).toBe(5)
      expect(filteredMenus[0].children![1].id).toBe(6)
    })

    it('应该移除没有权限且没有子菜单的菜单项', () => {
      const menus = [
        {
          id: 1,
          name: 'System',
          permission: PERMISSIONS.SYSTEM_MANAGE,
          children: [
            { id: 2, name: 'Users', permission: PERMISSIONS.USER_VIEW }
          ]
        },
        {
          id: 3,
          name: 'Dashboard',
          permission: PERMISSIONS.DASHBOARD_VIEW
        }
      ]
      
      permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
      
      const filteredMenus = permissionManager.filterMenusByPermission(menus)
      
      expect(filteredMenus).toHaveLength(1)
      expect(filteredMenus[0].id).toBe(3)
    })
  })

  describe('静态方法', () => {
    describe('getRolePermissions', () => {
      it('应该返回角色的权限列表', () => {
        const permissions = PermissionManager.getRolePermissions(ROLES.TEACHER)
        
        expect(Array.isArray(permissions)).toBe(true)
        expect(permissions).toContain(PERMISSIONS.DASHBOARD_VIEW)
        expect(permissions).toContain(PERMISSIONS.STUDENT_VIEW)
        expect(permissions).not.toContain(PERMISSIONS.USER_MANAGE)
      })

      it('应该为无效角色返回默认用户权限', () => {
        const permissions = PermissionManager.getRolePermissions('invalid_role' as any)
        const defaultPermissions = PermissionManager.getRolePermissions(ROLES.USER)
        
        expect(permissions).toEqual(defaultPermissions)
      })
    })

    describe('isValidPermission', () => {
      it('应该验证有效的权限代码', () => {
        expect(PermissionManager.isValidPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
        expect(PermissionManager.isValidPermission(PERMISSIONS.USER_MANAGE)).toBe(true)
        expect(PermissionManager.isValidPermission('*')).toBe(true)
      })

      it('应该拒绝无效的权限代码', () => {
        expect(PermissionManager.isValidPermission('INVALID_PERMISSION')).toBe(false)
        expect(PermissionManager.isValidPermission('')).toBe(false)
        expect(PermissionManager.isValidPermission('user_view')).toBe(false) // 小写
      })
    })

    describe('isValidRole', () => {
      it('应该验证有效的角色代码', () => {
        expect(PermissionManager.isValidRole(ROLES.SUPER_ADMIN)).toBe(true)
        expect(PermissionManager.isValidRole(ROLES.ADMIN)).toBe(true)
        expect(PermissionManager.isValidRole(ROLES.TEACHER)).toBe(true)
        expect(PermissionManager.isValidRole(ROLES.PARENT)).toBe(true)
        expect(PermissionManager.isValidRole(ROLES.USER)).toBe(true)
      })

      it('应该拒绝无效的角色代码', () => {
        expect(PermissionManager.isValidRole('INVALID_ROLE')).toBe(false)
        expect(PermissionManager.isValidRole('')).toBe(false)
        expect(PermissionManager.isValidRole('super_admin')).toBe(false) // 小写
      })
    })
  })
})

describe('权限常量', () => {
  describe('PERMISSIONS', () => {
    it('应该包含所有预定义的权限', () => {
      expect(PERMISSIONS.DASHBOARD_VIEW).toBeDefined()
      expect(PERMISSIONS.USER_MANAGE).toBeDefined()
      expect(PERMISSIONS.TEACHER_MANAGE).toBeDefined()
      expect(PERMISSIONS.STUDENT_MANAGE).toBeDefined()
      expect(PERMISSIONS.AI_ASSISTANT_USE).toBeDefined()
      expect(PERMISSIONS.CHAT_USE).toBeDefined()
      expect(PERMISSIONS.STATISTICS_VIEW).toBeDefined()
    })

    it('应该有正确的权限代码格式', () => {
      Object.values(PERMISSIONS).forEach(permission => {
        expect(permission).toMatch(/^[A-Z_]+$/)
        expect(permission.length).toBeGreaterThan(0)
      })
    })
  })

  describe('ROLES', () => {
    it('应该包含所有预定义的角色', () => {
      expect(ROLES.SUPER_ADMIN).toBeDefined()
      expect(ROLES.ADMIN).toBeDefined()
      expect(ROLES.PRINCIPAL).toBeDefined()
      expect(ROLES.TEACHER).toBeDefined()
      expect(ROLES.PARENT).toBeDefined()
      expect(ROLES.USER).toBeDefined()
    })

    it('应该有正确的角色代码格式', () => {
      Object.values(ROLES).forEach(role => {
        expect(role).toMatch(/^[a-z_]+$/)
        expect(role.length).toBeGreaterThan(0)
      })
    })
  })

  describe('ROLE_PERMISSIONS', () => {
    it('应该为每个角色定义权限列表', () => {
      Object.keys(ROLES).forEach(role => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined()
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true)
      })
    })

    it('应该为超级管理员设置通配符权限', () => {
      expect(ROLE_PERMISSIONS[ROLES.SUPER_ADMIN]).toEqual(['*'])
    })

    it('应该为管理员设置完整的权限列表', () => {
      const adminPermissions = ROLE_PERMISSIONS[ROLES.ADMIN]
      
      expect(adminPermissions).toContain(PERMISSIONS.DASHBOARD_VIEW)
      expect(adminPermissions).toContain(PERMISSIONS.USER_MANAGE)
      expect(adminPermissions).toContain(PERMISSIONS.SYSTEM_MANAGE)
      expect(adminPermissions.length).toBeGreaterThan(10)
    })

    it('应该为教师设置适当的权限', () => {
      const teacherPermissions = ROLE_PERMISSIONS[ROLES.TEACHER]
      
      expect(teacherPermissions).toContain(PERMISSIONS.DASHBOARD_VIEW)
      expect(teacherPermissions).toContain(PERMISSIONS.STUDENT_VIEW)
      expect(teacherPermissions).not.toContain(PERMISSIONS.USER_MANAGE)
      expect(teacherPermissions).not.toContain(PERMISSIONS.SYSTEM_MANAGE)
    })

    it('应该为家长设置适当的权限', () => {
      const parentPermissions = ROLE_PERMISSIONS[ROLES.PARENT]
      
      expect(parentPermissions).toContain(PERMISSIONS.DASHBOARD_VIEW)
      expect(parentPermissions).toContain(PERMISSIONS.STUDENT_VIEW)
      expect(parentPermissions).toContain(PERMISSIONS.PARENT_VIEW)
      expect(parentPermissions).not.toContain(PERMISSIONS.USER_MANAGE)
    })

    it('应该为普通用户设置最小权限', () => {
      const userPermissions = ROLE_PERMISSIONS[ROLES.USER]
      
      expect(userPermissions).toEqual([PERMISSIONS.DASHBOARD_VIEW])
    })
  })

  describe('ROUTE_PERMISSIONS', () => {
    it('应该为路由定义权限映射', () => {
      expect(ROUTE_PERMISSIONS['/dashboard']).toBe(PERMISSIONS.DASHBOARD_VIEW)
      expect(ROUTE_PERMISSIONS['/system/user']).toBe(PERMISSIONS.USER_VIEW)
      expect(ROUTE_PERMISSIONS['/teacher']).toBe(PERMISSIONS.TEACHER_VIEW)
      expect(ROUTE_PERMISSIONS['/student']).toBe(PERMISSIONS.STUDENT_VIEW)
      expect(ROUTE_PERMISSIONS['/ai']).toBe(PERMISSIONS.AI_ASSISTANT_USE)
    })

    it('应该覆盖所有主要路由', () => {
      const expectedRoutes = [
        '/dashboard',
        '/system/user',
        '/system/role',
        '/teacher',
        '/student',
        '/class',
        '/enrollment',
        '/activity',
        '/system/config',
        '/ai',
        '/statistics'
      ]
      
      expectedRoutes.forEach(route => {
        expect(ROUTE_PERMISSIONS[route]).toBeDefined()
      })
    })
  })
})

describe('requirePermission装饰器', () => {
  it('应该创建权限装饰器', () => {
    class TestClass {
      @requirePermission(PERMISSIONS.USER_VIEW)
      testMethod() {
        return 'test result'
      }
    }
    
    const instance = new TestClass()
    
    expect(typeof instance.testMethod).toBe('function')
  })

  it('应该在调用方法时记录权限检查', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    
    class TestClass {
      @requirePermission(PERMISSIONS.USER_VIEW)
      testMethod() {
        return 'test result'
      }
    }
    
    const instance = new TestClass()
    instance.testMethod()
    
    expect(consoleSpy).toHaveBeenCalledWith('检查权限: USER_VIEW')
  })

  it('应该保持原方法的返回值', () => {
    class TestClass {
      @requirePermission(PERMISSIONS.USER_VIEW)
      testMethod() {
        return 'test result'
      }
    }
    
    const instance = new TestClass()
    const result = instance.testMethod()
    
    expect(result).toBe('test result')
  })

  it('应该保持原方法的参数传递', () => {
    class TestClass {
      @requirePermission(PERMISSIONS.USER_VIEW)
      testMethod(param1: string, param2: number) {
        return `${param1}-${param2}`
      }
    }
    
    const instance = new TestClass()
    const result = instance.testMethod('test', 123)
    
    expect(result).toBe('test-123')
  })
})

describe('权限管理集成测试', () => {
  let permissionManager: PermissionManager

  beforeEach(() => {
    permissionManager = new PermissionManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该能够完整模拟用户权限流程', () => {
    // 模拟用户登录
    const userPermissions = PermissionManager.getRolePermissions(ROLES.TEACHER)
    permissionManager.updatePermissions(userPermissions, ROLES.TEACHER)
    
    // 验证权限
    expect(permissionManager.hasRole(ROLES.TEACHER)).toBe(true)
    expect(permissionManager.isAdmin()).toBe(false)
    expect(permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
    expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(false)
    
    // 验证菜单过滤
    const menus = [
      { id: 1, name: 'Dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
      { id: 2, name: 'User Management', permission: PERMISSIONS.USER_MANAGE },
      { id: 3, name: 'Student View', permission: PERMISSIONS.STUDENT_VIEW }
    ]
    
    const filteredMenus = permissionManager.filterMenusByPermission(menus)
    expect(filteredMenus).toHaveLength(2)
    expect(filteredMenus.map(m => m.id)).toEqual([1, 3])
  })

  it('应该能够处理角色升级', () => {
    // 初始为教师
    permissionManager.updatePermissions(
      PermissionManager.getRolePermissions(ROLES.TEACHER),
      ROLES.TEACHER
    )
    
    expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(false)
    
    // 升级为管理员
    permissionManager.updatePermissions(
      PermissionManager.getRolePermissions(ROLES.ADMIN),
      ROLES.ADMIN
    )
    
    expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(true)
    expect(permissionManager.isAdmin()).toBe(true)
  })

  it('应该能够验证路由权限', () => {
    permissionManager.updatePermissions(
      PermissionManager.getRolePermissions(ROLES.TEACHER),
      ROLES.TEACHER
    )
    
    // 验证有权限的路由
    expect(permissionManager.hasPermission(ROUTE_PERMISSIONS['/dashboard'])).toBe(true)
    expect(permissionManager.hasPermission(ROUTE_PERMISSIONS['/teacher'])).toBe(true)
    
    // 验证没有权限的路由
    expect(permissionManager.hasPermission(ROUTE_PERMISSIONS['/system/user'])).toBe(false)
  })

  it('应该能够处理通配符权限场景', () => {
    // 设置通配符权限
    permissionManager.updatePermissions(['*'], ROLES.TEACHER)
    
    // 应该拥有所有权限
    Object.values(PERMISSIONS).forEach(permission => {
      expect(permissionManager.hasPermission(permission)).toBe(true)
    })
    
    // 应该能够访问所有路由
    Object.values(ROUTE_PERMISSIONS).forEach(permission => {
      expect(permissionManager.hasPermission(permission)).toBe(true)
    })
  })
})

describe('权限管理安全性测试', () => {
  let permissionManager: PermissionManager

  beforeEach(() => {
    permissionManager = new PermissionManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该防止权限提升攻击', () => {
    // 设置普通用户权限
    permissionManager.updatePermissions(
      PermissionManager.getRolePermissions(ROLES.USER),
      ROLES.USER
    )
    
    // 尝试访问管理员功能
    expect(permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(false)
    expect(permissionManager.hasPermission(PERMISSIONS.SYSTEM_MANAGE)).toBe(false)
    expect(permissionManager.isAdmin()).toBe(false)
  })

  it('应该验证权限代码的有效性', () => {
    // 设置有效权限
    permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
    
    expect(PermissionManager.isValidPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
    expect(permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(true)
    
    // 尝试设置无效权限
    expect(PermissionManager.isValidPermission('MALICIOUS_CODE')).toBe(false)
    expect(permissionManager.hasPermission('MALICIOUS_CODE' as any)).toBe(false)
  })

  it('应该验证角色代码的有效性', () => {
    // 设置有效角色
    permissionManager.updatePermissions([], ROLES.TEACHER)
    
    expect(PermissionManager.isValidRole(ROLES.TEACHER)).toBe(true)
    expect(permissionManager.hasRole(ROLES.TEACHER)).toBe(true)
    
    // 尝试设置无效角色
    expect(PermissionManager.isValidRole('MALICIOUS_ROLE')).toBe(false)
    expect(permissionManager.hasRole('MALICIOUS_ROLE' as any)).toBe(false)
  })

  it('应该防止权限枚举攻击', () => {
    // 设置有限的权限
    permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
    
    // 验证只能访问已授权的权限
    Object.values(PERMISSIONS).forEach(permission => {
      const hasAccess = permissionManager.hasPermission(permission)
      const shouldBeAccessible = permission === PERMISSIONS.DASHBOARD_VIEW
      
      expect(hasAccess).toBe(shouldBeAccessible)
    })
  })

  it('应该安全的处理菜单过滤', () => {
    const maliciousMenu = {
      id: 1,
      name: 'Malicious Menu',
      permission: '<script>alert("xss")</script>',
      children: [
        { id: 2, name: 'Sub Menu', permission: 'MALICIOUS_CODE' }
      ]
    }
    
    const menus = [maliciousMenu]
    
    // 不应该抛出错误
    expect(() => {
      permissionManager.filterMenusByPermission(menus)
    }).not.toThrow()
    
    // 恶意菜单应该被过滤掉
    const filteredMenus = permissionManager.filterMenusByPermission(menus)
    expect(filteredMenus).toHaveLength(0)
  })

  it('应该防止路由权限绕过', () => {
    // 设置教师权限
    permissionManager.updatePermissions(
      PermissionManager.getRolePermissions(ROLES.TEACHER),
      ROLES.TEACHER
    )
    
    // 验证不能访问管理员路由
    const adminRoutes = ['/system/user', '/system/role', '/system/config']
    
    adminRoutes.forEach(route => {
      const requiredPermission = ROUTE_PERMISSIONS[route]
      expect(permissionManager.hasPermission(requiredPermission)).toBe(false)
    })
  })

  it('应该处理权限注入攻击', () => {
    // 尝试注入恶意权限
    const maliciousPermissions = [
      PERMISSIONS.DASHBOARD_VIEW,
      'JAVASCRIPT:alert("xss")',
      '<script>alert("xss")</script>',
      '../../../etc/passwd'
    ]
    
    // 不应该抛出错误
    expect(() => {
      permissionManager.updatePermissions(maliciousPermissions, ROLES.TEACHER)
    }).not.toThrow()
    
    // 恶意权限应该被拒绝
    expect(permissionManager.hasPermission('JAVASCRIPT:alert("xss")' as any)).toBe(false)
    expect(permissionManager.hasPermission('<script>alert("xss")</script>' as any)).toBe(false)
  })
})

describe('权限管理性能测试', () => {
  let permissionManager: PermissionManager

  beforeEach(() => {
    permissionManager = new PermissionManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该能够快速检查权限', () => {
    // 设置管理员权限（最多权限）
    permissionManager.updatePermissions(
      PermissionManager.getRolePermissions(ROLES.ADMIN),
      ROLES.ADMIN
    )
    
    const iterations = 10000
    
    const startTime = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      permissionManager.hasPermission(PERMISSIONS.DASHBOARD_VIEW)
      permissionManager.hasPermission(PERMISSIONS.USER_MANAGE)
      permissionManager.hasPermission(PERMISSIONS.SYSTEM_MANAGE)
    }
    
    const endTime = performance.now()
    const avgTime = (endTime - startTime) / (iterations * 3)
    
    // 平均检查时间应该小于0.001ms
    expect(avgTime).toBeLessThan(0.001)
  })

  it('应该能够快速过滤菜单', () => {
    // 创建大量菜单项
    const menus = []
    for (let i = 0; i < 1000; i++) {
      menus.push({
        id: i,
        name: `Menu ${i}`,
        permission: i % 2 === 0 ? PERMISSIONS.DASHBOARD_VIEW : PERMISSIONS.USER_MANAGE
      })
    }
    
    permissionManager.updatePermissions([PERMISSIONS.DASHBOARD_VIEW], ROLES.TEACHER)
    
    const iterations = 100
    
    const startTime = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      permissionManager.filterMenusByPermission(menus)
    }
    
    const endTime = performance.now()
    const avgTime = (endTime - startTime) / iterations
    
    // 平均过滤时间应该小于1ms
    expect(avgTime).toBeLessThan(1)
  })

  it('应该能够快速验证权限和角色', () => {
    const iterations = 10000
    
    const startTime = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      PermissionManager.isValidPermission(PERMISSIONS.DASHBOARD_VIEW)
      PermissionManager.isValidRole(ROLES.TEACHER)
      PermissionManager.getRolePermissions(ROLES.TEACHER)
    }
    
    const endTime = performance.now()
    const avgTime = (endTime - startTime) / (iterations * 3)
    
    // 平均验证时间应该小于0.001ms
    expect(avgTime).toBeLessThan(0.001)
  })
})