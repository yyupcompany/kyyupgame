/**
 * 菜单数据扁平化Store
 * 性能优化：将嵌套菜单结构转换为扁平化Map，提升路由查找效率从O(n²)到O(1)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MenuItem {
  id: string
  title: string
  route: string
  icon: string
  categoryId?: string
  categoryTitle?: string
}

export interface MenuCategory {
  id: string
  title: string
  icon: string
  items: MenuItem[]
}

export const useMenuStore = defineStore('menu-flat', () => {
  // 扁平化菜单Map - Key: route路径, Value: 菜单项配置
  const flatMenuMap = ref<Map<string, MenuItem>>(new Map())
  
  // 分类菜单Map - Key: categoryId, Value: 分类配置
  const categoryMap = ref<Map<string, MenuCategory>>(new Map())

  /**
   * 初始化管理员菜单（CentersSidebar）
   */
  const initAdminMenus = (categories: MenuCategory[]) => {
    flatMenuMap.value.clear()
    categoryMap.value.clear()

    // 添加管理控制台
    flatMenuMap.value.set('/dashboard', {
      id: 'centers-dashboard',
      title: '管理控制台',
      route: '/dashboard',
      icon: 'dashboard'
    })

    // 遍历分类，扁平化所有菜单项
    categories.forEach(category => {
      categoryMap.value.set(category.id, category)
      
      category.items.forEach(item => {
        flatMenuMap.value.set(item.route, {
          ...item,
          categoryId: category.id,
          categoryTitle: category.title
        })
      })
    })

    console.log('✅ 管理员菜单已扁平化', {
      totalMenus: flatMenuMap.value.size,
      categories: categoryMap.value.size
    })
  }

  /**
   * 初始化教师菜单（TeacherCenterSidebar）
   */
  const initTeacherMenus = (items: MenuItem[]) => {
    flatMenuMap.value.clear()
    
    items.forEach(item => {
      flatMenuMap.value.set(item.route, item)
    })

    console.log('✅ 教师菜单已扁平化', {
      totalMenus: flatMenuMap.value.size
    })
  }

  /**
   * 初始化家长菜单（ParentCenterSidebar）
   */
  const initParentMenus = (items: MenuItem[]) => {
    flatMenuMap.value.clear()
    
    items.forEach(item => {
      flatMenuMap.value.set(item.route, item)
    })

    console.log('✅ 家长菜单已扁平化', {
      totalMenus: flatMenuMap.value.size
    })
  }

  /**
   * 根据路由查找菜单项 - O(1)复杂度
   */
  const getMenuByRoute = (route: string): MenuItem | undefined => {
    return flatMenuMap.value.get(route)
  }

  /**
   * 检查路由是否存在于菜单中
   */
  const hasRoute = (route: string): boolean => {
    return flatMenuMap.value.has(route)
  }

  /**
   * 获取分类信息
   */
  const getCategoryById = (categoryId: string): MenuCategory | undefined => {
    return categoryMap.value.get(categoryId)
  }

  /**
   * 获取所有菜单项（用于渲染）
   */
  const getAllMenus = computed(() => {
    return Array.from(flatMenuMap.value.values())
  })

  /**
   * 获取分类下的菜单项
   */
  const getMenusByCategory = (categoryId: string): MenuItem[] => {
    return Array.from(flatMenuMap.value.values()).filter(
      item => item.categoryId === categoryId
    )
  }

  /**
   * 性能统计
   */
  const getStats = () => {
    return {
      totalMenus: flatMenuMap.value.size,
      totalCategories: categoryMap.value.size,
      memoryEstimate: `~${Math.round(flatMenuMap.value.size * 0.5)}KB`
    }
  }

  return {
    // State
    flatMenuMap,
    categoryMap,
    
    // Getters
    getAllMenus,
    
    // Actions
    initAdminMenus,
    initTeacherMenus,
    initParentMenus,
    getMenuByRoute,
    hasRoute,
    getCategoryById,
    getMenusByCategory,
    getStats
  }
})
