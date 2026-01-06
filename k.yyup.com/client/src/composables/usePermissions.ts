// Mock Vue functions for TypeScript compilation
const ref = (value: any) => ({ value })
const computed = (fn: any) => ({ value: fn() })
import { ElMessage } from 'element-plus'
import { getUserPagePermissions, checkPageAccess, getRolePagePermissions, updateRolePagePermissions } from '../api/modules/system'
import type { Permission } from '../types/system'

export interface UserPagePermissions {
  userId: number
  pages: Permission[]
}

export interface PageAccessCheck {
  userId: number
  pagePath: string
  hasAccess: boolean
}

export interface RolePagePermissions {
  role: any
  pages: Permission[]
}

export function usePermissions() {
  const loading = ref(false)
  const userPages = ref([])
  const rolePages = ref([])

  /**
   * 获取当前用户的页面权限
   */
  const fetchUserPagePermissions = async () => {
    try {
      loading.value = true
      const response = await getUserPagePermissions()

      if (response.success && response.data) {
        userPages.value = response.data.pages || []
        console.log('用户页面权限:', response.data.pages)
        return response.data
      } else {
        ElMessage.error(response.message || '获取用户页面权限失败')
        return null
      }
    } catch (error) {
      console.error('获取用户页面权限失败:', error)
      ElMessage.error('获取用户页面权限失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查用户是否可以访问指定页面
   */
  const checkUserPageAccess = async (pagePath: string): Promise<boolean> => {
    try {
      const response = await checkPageAccess(pagePath)

      if (response.success && response.data) {
        return response.data.hasAccess
      } else {
        console.warn('页面权限检查失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('页面权限检查失败:', error)
      return false
    }
  }

  /**
   * 获取角色的页面权限
   */
  const fetchRolePagePermissions = async (roleId: string | number) => {
    try {
      loading.value = true
      const response = await getRolePagePermissions(roleId)

      if (response.success && response.data) {
        rolePages.value = response.data.pages || []
        console.log('角色页面权限:', response.data.pages)
        return response.data
      } else {
        ElMessage.error(response.message || '获取角色页面权限失败')
        return null
      }
    } catch (error) {
      console.error('获取角色页面权限失败:', error)
      ElMessage.error('获取角色页面权限失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新角色的页面权限
   */
  const updateRolePages = async (roleId: string | number, permissionIds: number[]) => {
    try {
      loading.value = true
      const response = await updateRolePagePermissions(roleId, permissionIds)

      if (response.success && response.data) {
        ElMessage.success('角色页面权限更新成功')
        return true
      } else {
        ElMessage.error(response.message || '更新角色页面权限失败')
        return false
      }
    } catch (error) {
      console.error('更新角色页面权限失败:', error)
      ElMessage.error('更新角色页面权限失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据权限过滤菜单
   */
  const filterMenusByPermissions = (menus: any[], permissions: Permission[]) => {
    const permissionCodes = permissions.map(p => p.code)
    
    return menus.filter(menu => {
      // 无权限要求的菜单默认可访问
      if (!menu.permission) return true
      
      // 检查权限
      const hasPermission = permissionCodes.includes(menu.permission)
      
      // 递归过滤子菜单
      if (menu.children && menu.children.length) {
        menu.children = filterMenusByPermissions(menu.children, permissions)
        // 如果子菜单为空且当前菜单无权限，则隐藏整个菜单
        return menu.children.length > 0 || hasPermission
      }
      
      return hasPermission
    })
  }

  /**
   * 检查是否有指定权限
   */
  const hasPermission = computed(() => (permissionCode: string) => {
    return userPages.value.some((page: any) => page.code === permissionCode)
  })

  /**
   * 检查是否有任意一个权限
   */
  const hasAnyPermission = computed(() => (permissionCodes: string[]) => {
    return permissionCodes.some(code => hasPermission.value(code))
  })

  /**
   * 检查是否有所有权限
   */
  const hasAllPermissions = computed(() => (permissionCodes: string[]) => {
    return permissionCodes.every(code => hasPermission.value(code))
  })

  return {
    loading,
    userPages,
    rolePages,
    fetchUserPagePermissions,
    checkUserPageAccess,
    fetchRolePagePermissions,
    updateRolePages,
    filterMenusByPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
} 