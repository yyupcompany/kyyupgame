/**
 * 权限变更监听服务 - 自动缓存更新
 * Permission Watcher Service - Automatic Cache Updates
 * 
 * 功能：
 * 1. 监听权限表的增删改操作
 * 2. 自动触发路由缓存刷新
 * 3. 防止频繁刷新的延迟机制
 * 4. 提供变更日志和监控
 */

import { RouteCacheService } from './route-cache.service'
import { Permission } from '../models/permission.model'
import { Role } from '../models/role.model'
import { RolePermission } from '../models/role-permission.model'
import sequelize from '../config/sequelize'

interface ChangeEvent {
  type: 'create' | 'update' | 'destroy'
  model: string
  instanceId: number | string
  timestamp: number
  details?: any
}

class PermissionWatcherService {
  private static isWatching = false
  private static refreshTimeout: NodeJS.Timeout | null = null
  private static changeEvents: ChangeEvent[] = []
  private static readonly REFRESH_DELAY = 2000 // 2秒延迟，避免频繁刷新
  private static readonly MAX_EVENTS = 100 // 最多保留100个变更事件

  /**
   * 启动权限变更监听
   */
  static startWatching(): void {
    if (this.isWatching) {
      console.log('⚠️ 权限监听服务已在运行')
      return
    }

    console.log('👀 启动权限变更监听服务...')
    
    try {
      // 监听权限表变更
      this.listenToPermissionChanges()
      
      // 监听角色表变更
      this.listenToRoleChanges()
      
      // 监听角色权限关系表变更
      this.listenToRolePermissionChanges()
      
      // 启动定期检查 (兜底机制)
      this.startPeriodicCheck()
      
      this.isWatching = true
      console.log('✅ 权限变更监听服务已启动')
      
      // 添加启动成功的事件记录
      this.recordChangeEvent({
        type: 'create',
        model: 'PermissionWatcher',
        instanceId: 'service',
        timestamp: Date.now(),
        details: { message: '权限变更监听服务启动成功' }
      })
      
    } catch (error) {
      console.error('❌ 启动权限监听服务失败:', error)
      this.isWatching = false
      throw error
    }
  }

  /**
   * 停止权限变更监听
   */
  static stopWatching(): void {
    if (!this.isWatching) return

    console.log('🛑 停止权限变更监听服务...')
    
    // 清除延迟刷新
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }

    this.isWatching = false
    console.log('✅ 权限变更监听服务已停止')
  }

  /**
   * 监听权限表变更
   */
  private static listenToPermissionChanges(): void {
    console.log('🔗 设置权限表变更监听...')

    // 权限创建
    Permission.addHook('afterCreate', (instance: any, options: any) => {
      this.onPermissionChanged('create', 'Permission', instance.id, {
        name: instance.name,
        code: instance.code,
        path: instance.path,
        type: instance.type
      })
    })

    // 权限更新
    Permission.addHook('afterUpdate', (instance: any, options: any) => {
      this.onPermissionChanged('update', 'Permission', instance.id, {
        name: instance.name,
        code: instance.code,
        path: instance.path,
        type: instance.type,
        changed: options.fields || []
      })
    })

    // 权限删除
    Permission.addHook('afterDestroy', (instance: any, options: any) => {
      this.onPermissionChanged('destroy', 'Permission', instance.id, {
        name: instance.name,
        code: instance.code
      })
    })

    // 批量操作监听
    Permission.addHook('afterBulkCreate', (instances: any[], options: any) => {
      console.log(`📝 批量创建权限: ${instances.length} 条`)
      this.scheduleRefresh()
    })

    Permission.addHook('afterBulkUpdate', (options: any) => {
      console.log('📝 批量更新权限')
      this.scheduleRefresh()
    })

    Permission.addHook('afterBulkDestroy', (options: any) => {
      console.log('📝 批量删除权限')
      this.scheduleRefresh()
    })
  }

  /**
   * 监听角色表变更
   */
  private static listenToRoleChanges(): void {
    console.log('🔗 设置角色表变更监听...')

    Role.addHook('afterCreate', (instance: any) => {
      this.onPermissionChanged('create', 'Role', instance.id, {
        name: instance.name,
        code: instance.code
      })
    })

    Role.addHook('afterUpdate', (instance: any) => {
      this.onPermissionChanged('update', 'Role', instance.id, {
        name: instance.name,
        code: instance.code
      })
    })

    Role.addHook('afterDestroy', (instance: any) => {
      this.onPermissionChanged('destroy', 'Role', instance.id, {
        name: instance.name,
        code: instance.code
      })
    })
  }

  /**
   * 监听角色权限关系表变更
   */
  private static listenToRolePermissionChanges(): void {
    console.log('🔗 设置角色权限关系表变更监听...')

    RolePermission.addHook('afterCreate', (instance: any) => {
      this.onPermissionChanged('create', 'RolePermission', instance.id, {
        roleId: instance.roleId,
        permissionId: instance.permissionId
      })
    })

    RolePermission.addHook('afterDestroy', (instance: any) => {
      this.onPermissionChanged('destroy', 'RolePermission', instance.id, {
        roleId: instance.roleId,
        permissionId: instance.permissionId
      })
    })
  }

  /**
   * 权限变更回调处理
   */
  private static onPermissionChanged(
    type: 'create' | 'update' | 'destroy', 
    model: string, 
    instanceId: number | string,
    details?: any
  ): void {
    console.log(`📝 检测到${model}变更: ${type} - ID: ${instanceId}`)

    // 记录变更事件
    this.recordChangeEvent({
      type,
      model,
      instanceId,
      timestamp: Date.now(),
      details
    })

    // 延迟刷新缓存
    this.scheduleRefresh()
  }

  /**
   * 记录变更事件
   */
  private static recordChangeEvent(event: ChangeEvent): void {
    this.changeEvents.push(event)
    
    // 保持事件列表大小
    if (this.changeEvents.length > this.MAX_EVENTS) {
      this.changeEvents = this.changeEvents.slice(-this.MAX_EVENTS)
    }
  }

  /**
   * 延迟调度缓存刷新
   */
  private static scheduleRefresh(): void {
    // 清除之前的延迟刷新
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
    }

    // 设置新的延迟刷新
    this.refreshTimeout = setTimeout(async () => {
      try {
        console.log('🔄 权限变更触发，开始刷新路由缓存...')
        await RouteCacheService.refreshCache()
        console.log('✅ 权限变更响应完成，路由缓存已更新')
        
        // TODO: 通知前端用户权限已更新 (下个版本实现WebSocket)
        
      } catch (error) {
        console.error('❌ 权限变更响应失败:', error)
      } finally {
        this.refreshTimeout = null
      }
    }, this.REFRESH_DELAY)

    console.log(`⏱️ 已调度缓存刷新，将在 ${this.REFRESH_DELAY}ms 后执行`)
  }

  /**
   * 立即刷新缓存 (紧急情况使用)
   */
  static async forceRefresh(): Promise<void> {
    console.log('⚡ 强制立即刷新路由缓存...')
    
    // 清除延迟刷新
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }

    try {
      await RouteCacheService.refreshCache()
      console.log('✅ 强制刷新完成')
    } catch (error) {
      console.error('❌ 强制刷新失败:', error)
      throw error
    }
  }

  /**
   * 启动定期检查 (兜底机制)
   */
  private static startPeriodicCheck(): void {
    // 每5分钟检查一次权限表更新时间
    setInterval(async () => {
      try {
        const lastModified = await this.getPermissionLastModified()
        const cacheTime = RouteCacheService.getLastLoadTime()
        
        if (lastModified > cacheTime + 60000) { // 超过1分钟差异才刷新
          console.log('🔄 定期检查发现权限数据变更，触发缓存刷新...')
          await RouteCacheService.refreshCache()
        }
      } catch (error) {
        console.warn('⚠️ 定期权限检查失败:', error)
      }
    }, 5 * 60 * 1000) // 5分钟
  }

  /**
   * 获取权限表最后修改时间
   * 使用默认租户数据库名称（共享连接池模式）
   */
  private static async getPermissionLastModified(): Promise<number> {
    try {
      // 检查sequelize是否可用
      if (!sequelize || typeof sequelize.query !== 'function') {
        console.warn('⚠️ Sequelize未正确初始化，跳过权限表检查')
        return 0
      }

      // 获取默认租户数据库名称（从环境变量或使用默认值）
      const tenantDb = process.env.DB_NAME || 'kindergarten';

      const result = await sequelize.query(`
        SELECT MAX(updated_at) as lastModified
        FROM ${tenantDb}.permissions
        WHERE status = 1
      `)

      const lastModified = (result[0] as any)[0]?.lastModified
      return lastModified ? new Date(lastModified).getTime() : 0
    } catch (error) {
      console.warn('⚠️ 获取权限表更新时间失败:', error)
      return 0
    }
  }

  /**
   * 获取变更事件列表
   */
  static getChangeEvents(limit = 20): ChangeEvent[] {
    return this.changeEvents.slice(-limit).reverse() // 最新的在前面
  }

  /**
   * 获取监听状态
   */
  static getWatcherStatus(): {
    isWatching: boolean
    eventCount: number
    lastEventTime: number | null
    refreshScheduled: boolean
  } {
    const lastEvent = this.changeEvents[this.changeEvents.length - 1]
    
    return {
      isWatching: this.isWatching,
      eventCount: this.changeEvents.length,
      lastEventTime: lastEvent?.timestamp || null,
      refreshScheduled: this.refreshTimeout !== null
    }
  }

  /**
   * 清空变更事件记录
   */
  static clearChangeEvents(): void {
    this.changeEvents = []
    console.log('🗑️ 已清空权限变更事件记录')
  }
}

export { PermissionWatcherService, ChangeEvent }