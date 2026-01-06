/**
 * 简化的Vue权限指令 - 统一的权限验证接口
 * 前端开发者只需要知道权限代码，不需要了解后端4层权限架构
 */

import { DirectiveBinding, ObjectDirective } from 'vue'
import { usePermissionsStore } from '../stores/permissions-simple'

interface PermissionElement extends HTMLElement {
  _permissionCode?: string
  _permissionCodes?: string[]
  _originalDisplay?: string
  _originalOpacity?: string
  _originalPointerEvents?: string
}

/**
 * 控制元素显示/隐藏
 */
const toggleElement = (el: PermissionElement, hasPermission: boolean, binding: DirectiveBinding) => {
  const { modifiers } = binding
  
  // 保存原始样式
  if (el._originalDisplay === undefined) {
    el._originalDisplay = el.style.display || 'block'
    el._originalOpacity = el.style.opacity || '1'
    el._originalPointerEvents = el.style.pointerEvents || 'auto'
  }

  if (hasPermission) {
    // 有权限：恢复元素
    el.style.display = el._originalDisplay || ''
    el.style.opacity = el._originalOpacity || ''
    el.style.pointerEvents = el._originalPointerEvents || ''
    el.removeAttribute('title')
  } else {
    // 无权限：根据修饰符处理
    if (modifiers.disable) {
      // .disable 修饰符：禁用但可见
      el.style.opacity = '0.5'
      el.style.pointerEvents = 'none'
      el.style.cursor = 'not-allowed'
      el.setAttribute('title', '权限不足')
    } else {
      // 默认或 .hide 修饰符：隐藏元素
      el.style.display = 'none'
    }
  }
}

/**
 * v-permission：单个权限验证指令
 * 
 * 用法：
 * <button v-permission="'EDIT_STUDENT'">编辑学生</button>
 * <button v-permission:disable="'DELETE_STUDENT'">删除学生</button>
 */
export const vPermission: ObjectDirective = {
  async mounted(el: PermissionElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!value) {
      console.warn('v-permission 指令需要提供权限代码')
      return
    }

    try {
      el._permissionCode = value
      
      const permissionsStore = usePermissionsStore()
      
      // 使用同步权限检查（基于缓存）
      const hasPermission = permissionsStore.hasPermissionSync(value)
      
      // 应用样式
      toggleElement(el, hasPermission, binding)
      
      // 如果没有缓存，异步获取权限并更新UI
      if (!hasPermission && !permissionsStore.isAdmin) {
        permissionsStore.hasPermission(value).then((result: any) => {
          if (result) {
            toggleElement(el, true, binding)
          }
        })
      }
      
    } catch (error) {
      console.error(`v-permission 指令错误: ${value}`, error)
      toggleElement(el, false, binding)
    }
  },

  async updated(el: PermissionElement, binding: DirectiveBinding) {
    // 权限代码改变时重新验证
    if (el._permissionCode !== binding.value) {
      await vPermission.mounted!(el, binding, {} as any, {} as any)
    }
  },

  unmounted(el: PermissionElement) {
    delete el._permissionCode
    delete el._originalDisplay
    delete el._originalOpacity
    delete el._originalPointerEvents
  }
}

/**
 * v-permissions：多权限验证指令（or逻辑）
 * 有任意一个权限即可显示
 * 
 * 用法：
 * <button v-permissions="['EDIT_STUDENT', 'VIEW_STUDENT']">学生管理</button>
 */
export const vPermissions: ObjectDirective = {
  async mounted(el: PermissionElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!Array.isArray(value) || value.length === 0) {
      console.warn('v-permissions 指令需要提供权限代码数组')
      return
    }

    try {
      el._permissionCodes = value
      
      const permissionsStore = usePermissionsStore()
      
      // 检查是否有任意一个权限（基于缓存）
      const hasAnyPermission = value.some(permission => 
        permissionsStore.hasPermissionSync(permission)
      )
      
      // 应用样式
      toggleElement(el, hasAnyPermission, binding)
      
      // 如果没有权限且不是管理员，异步验证所有权限
      if (!hasAnyPermission && !permissionsStore.isAdmin) {
        permissionsStore.hasPermissions(value).then((results: any) => {
          const hasAny = Object.values(results).some(Boolean)
          if (hasAny) {
            toggleElement(el, true, binding)
          }
        })
      }
      
    } catch (error) {
      console.error(`v-permissions 指令错误: ${value}`, error)
      toggleElement(el, false, binding)
    }
  },

  async updated(el: PermissionElement, binding: DirectiveBinding) {
    const currentCodes = JSON.stringify(el._permissionCodes)
    const newCodes = JSON.stringify(binding.value)
    
    if (currentCodes !== newCodes) {
      await vPermissions.mounted!(el, binding, {} as any, {} as any)
    }
  },

  unmounted(el: PermissionElement) {
    delete el._permissionCodes
    delete el._originalDisplay
    delete el._originalOpacity
    delete el._originalPointerEvents
  }
}

/**
 * 权限指令安装函数
 */
export const installPermissionDirectives = (app: any) => {
  console.log('🔧 注册简化权限指令...')
  
  app.directive('permission', vPermission)
  app.directive('permissions', vPermissions)
  
  console.log('✅ 权限指令注册完成')
}

/**
 * 权限指令集合
 */
export const permissionDirectives = {
  permission: vPermission,
  permissions: vPermissions
}