/**
 * Vue 权限指令 - Level 4: 操作权限验证
 * Vue Permission Directives - Level 4: Action Permission Verification
 * 
 * 功能：
 * 1. v-permission：单个权限验证指令
 * 2. v-permissions：多个权限验证指令（or逻辑）
 * 3. v-permission-all：多个权限验证指令（and逻辑）
 * 4. 支持权限缓存和实时验证
 */

import { DirectiveBinding, ObjectDirective } from 'vue'
import { usePermissionsStore } from '../stores/permissions'

interface PermissionElement extends HTMLElement {
  _permissionCode?: string
  _permissionCodes?: string[]
  _originalDisplay?: string
  _originalOpacity?: string
  _originalPointerEvents?: string
}

/**
 * 隐藏或显示元素
 */
const toggleElement = (el: PermissionElement, hasPermission: boolean, binding: DirectiveBinding) => {
  const { modifiers } = binding
  
  // 保存原始样式（仅首次）
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
    // 无权限：处理元素
    if (modifiers.hide) {
      // .hide 修饰符：完全隐藏
      el.style.display = 'none'
    } else if (modifiers.disable) {
      // .disable 修饰符：禁用但可见
      el.style.opacity = '0.5'
      el.style.pointerEvents = 'none'
      el.style.cursor = 'not-allowed'
      el.setAttribute('title', '权限不足')
    } else {
      // 默认：完全隐藏
      el.style.display = 'none'
    }
  }
}

/**
 * v-permission：单个权限验证指令
 * 
 * 用法：
 * <button v-permission="'EDIT_STUDENT'">编辑</button>
 * <button v-permission:hide="'DELETE_STUDENT'">删除</button>
 * <button v-permission:disable="'VIEW_REPORT'">查看报告</button>
 */
export const vPermission: ObjectDirective = {
  async mounted(el: PermissionElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!value) {
      console.warn('v-permission directive requires a permission code')
      return
    }

    try {
      console.log(`🔍 Level 4: v-permission 检查权限: ${value}`)
      
      // 缓存权限代码
      el._permissionCode = value
      
      // 获取权限store
      const permissionsStore = usePermissionsStore()
      
      // 检查权限
      const hasPermission = permissionsStore.hasPermissionCode ? 
        permissionsStore.hasPermissionCode(value) : 
        false
      
      console.log(`⚡ Level 4: v-permission 权限验证结果: ${value} -> ${hasPermission}`)
      
      // 应用样式
      toggleElement(el, hasPermission, binding)
      
    } catch (error) {
      console.error(`❌ Level 4: v-permission 指令错误: ${value}`, error)
      // 权限验证失败时默认隐藏
      toggleElement(el, false, binding)
    }
  },

  async updated(el: PermissionElement, binding: DirectiveBinding) {
    // 仅在权限代码改变时重新验证
    if (el._permissionCode !== binding.value) {
      await vPermission.mounted!(el, binding, {} as any, {} as any)
    }
  },

  unmounted(el: PermissionElement) {
    // 清理缓存
    delete el._permissionCode
    delete el._originalDisplay
    delete el._originalOpacity
    delete el._originalPointerEvents
  }
}

/**
 * v-permissions：多个权限验证指令（or逻辑）
 * 有任意一个权限即可显示
 * 
 * 用法：
 * <button v-permissions="['EDIT_STUDENT', 'VIEW_STUDENT']">操作</button>
 */
export const vPermissions: ObjectDirective = {
  async mounted(el: PermissionElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!Array.isArray(value) || value.length === 0) {
      console.warn('v-permissions directive requires an array of permission codes')
      return
    }

    try {
      console.log(`🔍 Level 4: v-permissions 检查权限组: ${value.join(', ')}`)
      
      // 缓存权限代码
      el._permissionCodes = value
      
      // 获取权限store
      const permissionsStore = usePermissionsStore()
      
      // 检查权限（or逻辑）
      const hasAnyPermission = value.some(code => 
        permissionsStore.hasPermissionCode ? 
          permissionsStore.hasPermissionCode(code) : 
          false
      )
      
      console.log(`⚡ Level 4: v-permissions 权限验证结果: [${value.join(', ')}] -> ${hasAnyPermission}`)
      
      // 应用样式
      toggleElement(el, hasAnyPermission, binding)
      
    } catch (error) {
      console.error(`❌ Level 4: v-permissions 指令错误: ${value}`, error)
      toggleElement(el, false, binding)
    }
  },

  async updated(el: PermissionElement, binding: DirectiveBinding) {
    // 仅在权限代码改变时重新验证
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
 * v-permission-all：多个权限验证指令（and逻辑）
 * 需要拥有所有权限才能显示
 * 
 * 用法：
 * <button v-permission-all="['EDIT_STUDENT', 'DELETE_STUDENT']">高级操作</button>
 */
export const vPermissionAll: ObjectDirective = {
  async mounted(el: PermissionElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!Array.isArray(value) || value.length === 0) {
      console.warn('v-permission-all directive requires an array of permission codes')
      return
    }

    try {
      console.log(`🔍 Level 4: v-permission-all 检查全部权限: ${value.join(', ')}`)
      
      // 缓存权限代码
      el._permissionCodes = value
      
      // 获取权限store
      const permissionsStore = usePermissionsStore()
      
      // 检查权限（and逻辑）
      const hasAllPermissions = value.every(code => 
        permissionsStore.hasPermissionCode ? 
          permissionsStore.hasPermissionCode(code) : 
          false
      )
      
      console.log(`⚡ Level 4: v-permission-all 权限验证结果: [${value.join(', ')}] -> ${hasAllPermissions}`)
      
      // 应用样式
      toggleElement(el, hasAllPermissions, binding)
      
    } catch (error) {
      console.error(`❌ Level 4: v-permission-all 指令错误: ${value}`, error)
      toggleElement(el, false, binding)
    }
  },

  async updated(el: PermissionElement, binding: DirectiveBinding) {
    const currentCodes = JSON.stringify(el._permissionCodes)
    const newCodes = JSON.stringify(binding.value)
    
    if (currentCodes !== newCodes) {
      await vPermissionAll.mounted!(el, binding, {} as any, {} as any)
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
 * 权限指令集合
 */
export const permissionDirectives = {
  permission: vPermission,
  permissions: vPermissions,
  'permission-all': vPermissionAll
}

/**
 * 注册所有权限指令的安装函数
 */
export const installPermissionDirectives = (app: any) => {
  console.log('🔧 Level 4: 注册权限指令...')
  
  app.directive('permission', vPermission)
  app.directive('permissions', vPermissions)
  app.directive('permission-all', vPermissionAll)
  
  console.log('✅ Level 4: 权限指令注册完成')
}