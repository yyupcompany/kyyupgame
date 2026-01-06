/**
 * 路由缓存服务 - 核心性能优化
 * Route Cache Service - Core Performance Optimization
 * 
 * 功能：
 * 1. 服务器启动时一次性从数据库加载所有路由到内存
 * 2. 提供毫秒级的路由数据访问
 * 3. 支持缓存刷新和状态监控
 * 4. 按用户角色优化的路由分组
 */

import { Permission } from '../models/permission.model'
import { Role } from '../models/role.model'
import { RolePermission } from '../models/role-permission.model'
import { Op } from 'sequelize'

interface RouteCache {
  allRoutes: any[]
  routesByRole: Record<string, any[]>
  permissionsByRole: Record<string, string[]>
  lastLoadTime: number
  version: string
  routeCount: number
  isHealthy: boolean
}

interface CacheMetrics {
  loadTime: number
  queryTime: number
  processingTime: number
  errorCount: number
}

class RouteCacheService {
  private static cache: RouteCache = {
    allRoutes: [],
    routesByRole: {},
    permissionsByRole: {},
    lastLoadTime: 0,
    version: '1.0.0',
    routeCount: 0,
    isHealthy: false
  }
  
  private static metrics: CacheMetrics = {
    loadTime: 0,
    queryTime: 0,
    processingTime: 0,
    errorCount: 0
  }

  /**
   * 服务器启动时初始化路由缓存
   */
  static async initializeRouteCache(retries = 3): Promise<void> {
    const startTime = Date.now()
    console.log('🔄 正在初始化路由缓存系统...')
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // 从数据库加载路由数据
        await this.loadRoutesFromDatabase()
        
        // 计算加载时间
        this.metrics.loadTime = Date.now() - startTime
        
        console.log(`✅ 路由缓存初始化完成`)
        console.log(`📊 缓存统计:`)
        console.log(`   - 路由总数: ${this.cache.routeCount}`)
        console.log(`   - 角色分组: ${Object.keys(this.cache.routesByRole).length}`)
        console.log(`   - 加载耗时: ${this.metrics.loadTime}ms`)
        console.log(`   - 缓存状态: ${this.cache.isHealthy ? '健康' : '异常'}`)
        
        return // 成功初始化，退出重试循环
        
      } catch (error) {
        this.metrics.errorCount++
        this.cache.isHealthy = false
        
        if (attempt < retries) {
          console.warn(`⚠️ 路由缓存初始化失败 (尝试 ${attempt}/${retries}):`, error)
          console.log(`🔄 等待 ${attempt * 1000}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        } else {
          console.error('❌ 路由缓存初始化最终失败:', error)
          console.error('💡 可能的原因:')
          console.error('   1. 数据库连接问题')
          console.error('   2. 模型关联未正确初始化 (RolePermission.initAssociations)')
          console.error('   3. 权限表数据损坏或缺失')
          console.error('🔧 解决方案: 手动调用 POST /api/admin/refresh-permission-cache')
          throw error
        }
      }
    }
  }

  /**
   * 从数据库加载路由数据
   */
  private static async loadRoutesFromDatabase(): Promise<void> {
    const queryStartTime = Date.now()
    
    try {
      // 查询所有启用的路由权限
      const routes = await Permission.findAll({
        where: {
          status: 1,
          type: { [Op.in]: ['category', 'menu', 'page', 'button'] }
        },
        order: [
          ['parent_id', 'ASC'],
          ['sort', 'ASC'],
          ['id', 'ASC']
        ],
        raw: false // 改为false以获取模型属性名（chineseName）而不是数据库字段名（chinese_name）
      })

      // 转换为普通对象，确保包含chineseName字段
      const routesData = routes.map(route => ({
        id: route.id,
        name: route.name,
        chineseName: route.chineseName, // 使用模型属性名
        chinese_name: route.chineseName, // 同时保留数据库字段名以兼容
        code: route.code,
        type: route.type,
        parentId: route.parentId,
        parent_id: route.parentId, // 兼容字段
        path: route.path,
        component: route.component,
        icon: route.icon,
        sort: route.sort,
        status: route.status,
        permission: route.permission
      }))

      this.metrics.queryTime = Date.now() - queryStartTime

      console.log(`🔍 从数据库查询到 ${routesData.length} 条路由记录`)
      console.log(`🔍 示例路由数据:`, routesData.slice(0, 2).map(r => ({
        name: r.name,
        chineseName: r.chineseName,
        chinese_name: r.chinese_name
      })))

      // 查询所有角色和权限关系
      const rolePermissions = await this.loadRolePermissions()

      // 处理和缓存数据
      const processingStartTime = Date.now()
      await this.cacheRoutes(routesData, rolePermissions)
      this.metrics.processingTime = Date.now() - processingStartTime
      
    } catch (error) {
      console.error('❌ 数据库查询失败:', error)
      throw error
    }
  }

  /**
   * 加载角色权限关系
   */
  private static async loadRolePermissions(): Promise<Record<string, string[]>> {
    try {
      const rolePermissions = await RolePermission.findAll({
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name', 'code'] },
          { model: Permission, as: 'permission', attributes: ['id', 'code', 'path'] }
        ],
        raw: false
      })

      const permissionsByRole: Record<string, string[]> = {}

      for (const rp of rolePermissions) {
        const role = (rp as any).role
        const permission = (rp as any).permission
        
        if (role && permission) {
          const roleKey = role.code || role.name
          if (!permissionsByRole[roleKey]) {
            permissionsByRole[roleKey] = []
          }
          permissionsByRole[roleKey].push(permission.code || permission.path)
        }
      }

      console.log(`🔑 加载了 ${Object.keys(permissionsByRole).length} 个角色的权限映射`)
      return permissionsByRole

    } catch (error) {
      console.warn('⚠️ 角色权限加载失败，将使用基础权限检查:', error)
      console.warn('💡 提示: 这可能是由于模型关联未正确初始化导致的')
      console.warn('🔧 解决方案: 确保 RolePermission.initAssociations() 已被调用')
      return {}
    }
  }

  /**
   * 缓存路由数据
   */
  private static async cacheRoutes(routes: any[], rolePermissions: Record<string, string[]>): Promise<void> {
    // 更新缓存数据
    this.cache.allRoutes = routes
    this.cache.permissionsByRole = rolePermissions
    this.cache.routeCount = routes.length
    this.cache.lastLoadTime = Date.now()
    this.cache.version = `${Date.now()}`
    this.cache.isHealthy = true

    // 按角色分组路由
    this.cache.routesByRole = this.groupRoutesByRole(routes, rolePermissions)
    
    console.log('📦 路由数据已缓存到内存')
  }

  /**
   * 按角色分组路由
   */
  private static groupRoutesByRole(routes: any[], rolePermissions: Record<string, string[]>): Record<string, any[]> {
    const routesByRole: Record<string, any[]> = {}

    // 为每个角色创建路由列表
    for (const [roleCode, permissions] of Object.entries(rolePermissions)) {
      routesByRole[roleCode] = routes.filter(route => {
        // 检查路由是否在该角色的权限范围内
        return permissions.includes(route.code) || 
               permissions.includes(route.path) || 
               permissions.includes('*') // 超级管理员权限
      })
    }

    // 添加默认分组
    routesByRole['default'] = routes.filter(route => !route.permission || route.permission === '')
    routesByRole['admin'] = routes // 管理员拥有所有路由

    return routesByRole
  }

  /**
   * 获取缓存的路由数据
   */
  static getCachedRoutes(userRole?: string): any[] {
    if (!this.cache.isHealthy) {
      console.warn('⚠️ 路由缓存状态异常，返回空数组')
      return []
    }

    if (userRole) {
      // 返回特定角色的路由
      const roleRoutes = this.cache.routesByRole[userRole] || this.cache.routesByRole['default'] || []
      console.log(`📋 返回角色 "${userRole}" 的路由: ${roleRoutes.length} 条`)
      return roleRoutes
    }

    // 返回所有路由
    console.log(`📋 返回所有路由: ${this.cache.allRoutes.length} 条`)
    return this.cache.allRoutes
  }

  /**
   * 获取用户权限列表
   */
  static getUserPermissions(userRole: string): string[] {
    return this.cache.permissionsByRole[userRole] || []
  }

  /**
   * 刷新缓存
   */
  static async refreshCache(): Promise<void> {
    console.log('🔄 开始刷新路由缓存...')
    
    try {
      const oldRouteCount = this.cache.routeCount
      await this.loadRoutesFromDatabase()
      
      const newRouteCount = this.cache.routeCount
      console.log(`✅ 路由缓存刷新完成: ${oldRouteCount} → ${newRouteCount} 条路由`)
      
    } catch (error) {
      this.metrics.errorCount++
      console.error('❌ 路由缓存刷新失败:', error)
      throw error
    }
  }

  /**
   * 获取缓存状态信息
   */
  static getCacheStatus(): RouteCache & CacheMetrics & { cacheAge: number } {
    return {
      ...this.cache,
      ...this.metrics,
      cacheAge: Date.now() - this.cache.lastLoadTime
    }
  }

  /**
   * 获取最后加载时间
   */
  static getLastLoadTime(): number {
    return this.cache.lastLoadTime
  }

  /**
   * 检查缓存健康状态
   */
  static isHealthy(): boolean {
    return this.cache.isHealthy && this.cache.routeCount > 0
  }

  /**
   * 清空缓存 (仅用于测试)
   */
  static clearCache(): void {
    console.log('🗑️ 清空路由缓存')
    this.cache = {
      allRoutes: [],
      routesByRole: {},
      permissionsByRole: {},
      lastLoadTime: 0,
      version: '1.0.0',
      routeCount: 0,
      isHealthy: false
    }
  }

  /**
   * 获取性能指标
   */
  static getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * 缓存预热 (可选功能)
   */
  static async warmupCache(): Promise<void> {
    console.log('🔥 开始缓存预热...')
    
    // 预热常用角色的路由数据
    const commonRoles = ['admin', 'principal', 'teacher', 'parent']
    
    for (const role of commonRoles) {
      const routes = this.getCachedRoutes(role)
      console.log(`🔥 预热角色 "${role}": ${routes.length} 条路由`)
    }
    
    console.log('✅ 缓存预热完成')
  }
}

export { RouteCacheService }