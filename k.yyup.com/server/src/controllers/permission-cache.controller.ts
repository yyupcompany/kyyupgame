/**
 * 权限缓存控制器 - 管理员缓存管理接口
 * Permission Cache Controller - Admin Cache Management API
 * 
 * 功能：
 * 1. 手动刷新权限缓存
 * 2. 查看缓存状态和统计
 * 3. 获取权限变更历史
 * 4. 缓存健康检查和诊断
 */

import { Request, Response } from 'express'
import { RouteCacheService } from '../services/route-cache.service'
import { PermissionWatcherService } from '../services/permission-watcher.service'

class PermissionCacheController {
  
  /**
   * 手动刷新权限缓存
   * POST /api/admin/refresh-permission-cache
   */
  static async refreshPermissionCache(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔄 管理员触发权限缓存刷新...')
      console.log(`👤 操作用户: ${(req.user as any)?.username || 'Unknown'} (ID: ${req.user?.id})`)
      
      const startTime = Date.now()
      
      // 获取刷新前的缓存状态
      const beforeStatus = RouteCacheService.getCacheStatus()
      
      // 执行缓存刷新
      await RouteCacheService.refreshCache()
      
      // 获取刷新后的缓存状态
      const afterStatus = RouteCacheService.getCacheStatus()
      const refreshTime = Date.now() - startTime
      
      // TODO: 记录操作日志
      // await OperationLogService.log({
      //   userId: req.user.id,
      //   action: 'REFRESH_PERMISSION_CACHE',
      //   details: '管理员手动刷新了权限缓存',
      //   timestamp: new Date()
      // })
      
      // TODO: 通知所有在线用户权限已更新
      // await NotificationService.broadcastPermissionUpdate()
      
      console.log(`✅ 权限缓存刷新完成，耗时: ${refreshTime}ms`)
      
      res.json({
        success: true,
        message: '权限缓存已成功刷新',
        data: {
          refreshTime,
          before: {
            routeCount: beforeStatus.routeCount,
            lastLoadTime: beforeStatus.lastLoadTime,
            isHealthy: beforeStatus.isHealthy
          },
          after: {
            routeCount: afterStatus.routeCount,
            lastLoadTime: afterStatus.lastLoadTime,
            isHealthy: afterStatus.isHealthy
          },
          changes: {
            routeCountDiff: afterStatus.routeCount - beforeStatus.routeCount,
            timeDiff: afterStatus.lastLoadTime - beforeStatus.lastLoadTime
          }
        },
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('❌ 权限缓存刷新失败:', error)
      
      res.status(500).json({
        success: false,
        error: '权限缓存刷新失败',
        message: (error as Error).message,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * 获取权限缓存状态
   * GET /api/admin/permission-cache-status
   */
  static async getCacheStatus(req: Request, res: Response): Promise<void> {
    try {
      const cacheStatus = RouteCacheService.getCacheStatus()
      const watcherStatus = PermissionWatcherService.getWatcherStatus()
      const metrics = RouteCacheService.getMetrics()
      
      // 计算缓存年龄
      const cacheAge = Date.now() - cacheStatus.lastLoadTime
      const cacheAgeHuman = formatDuration(cacheAge)
      
      // 评估缓存健康度
      const healthScore = calculateHealthScore(cacheStatus, metrics)
      
      res.json({
        success: true,
        data: {
          // 基本状态
          cache: {
            routeCount: cacheStatus.routeCount,
            roleCount: Object.keys(cacheStatus.routesByRole).length,
            lastLoadTime: cacheStatus.lastLoadTime,
            cacheAge,
            cacheAgeHuman,
            version: cacheStatus.version,
            isHealthy: cacheStatus.isHealthy
          },
          
          // 性能指标
          metrics: {
            loadTime: metrics.loadTime,
            queryTime: metrics.queryTime,
            processingTime: metrics.processingTime,
            errorCount: metrics.errorCount
          },
          
          // 监听状态
          watcher: {
            isWatching: watcherStatus.isWatching,
            eventCount: watcherStatus.eventCount,
            lastEventTime: watcherStatus.lastEventTime,
            refreshScheduled: watcherStatus.refreshScheduled
          },
          
          // 健康评分
          health: {
            score: healthScore,
            status: getHealthStatus(healthScore),
            recommendations: getHealthRecommendations(healthScore, cacheStatus, metrics)
          }
        },
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('❌ 获取缓存状态失败:', error)
      
      res.status(500).json({
        success: false,
        error: '获取缓存状态失败',
        message: (error as Error).message,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * 获取权限变更历史
   * GET /api/admin/permission-change-history
   */
  static async getChangeHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50
      const changeEvents = PermissionWatcherService.getChangeEvents(limit)
      
      res.json({
        success: true,
        data: {
          events: changeEvents,
          totalCount: changeEvents.length,
          limit
        },
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('❌ 获取变更历史失败:', error)
      
      res.status(500).json({
        success: false,
        error: '获取变更历史失败',
        message: (error as Error).message,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * 强制刷新缓存 (紧急情况)
   * POST /api/admin/force-refresh-cache
   */
  static async forceRefreshCache(req: Request, res: Response): Promise<void> {
    try {
      console.log('⚡ 管理员触发强制刷新缓存...')
      console.log(`👤 操作用户: ${(req.user as any)?.username || 'Unknown'} (ID: ${req.user?.id})`)
      
      const startTime = Date.now()
      
      // 执行强制刷新
      await PermissionWatcherService.forceRefresh()
      
      // 尝试启动监听服务（如果未启动）
      const watcherStatus = PermissionWatcherService.getWatcherStatus()
      if (!watcherStatus.isWatching) {
        try {
          console.log('🔄 检测到监听服务未启动，正在启动...')
          PermissionWatcherService.startWatching()
          console.log('✅ 权限变更监听服务已启动')
        } catch (watcherError) {
          console.warn('⚠️  启动监听服务失败:', watcherError)
        }
      }
      
      const refreshTime = Date.now() - startTime
      const finalWatcherStatus = PermissionWatcherService.getWatcherStatus()
      
      console.log(`✅ 强制刷新完成，耗时: ${refreshTime}ms`)
      
      res.json({
        success: true,
        message: '缓存已强制刷新',
        data: {
          refreshTime,
          forced: true,
          watcherStarted: finalWatcherStatus.isWatching
        },
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('❌ 强制刷新失败:', error)
      
      res.status(500).json({
        success: false,
        error: '强制刷新失败',
        message: (error as Error).message,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * 清空变更历史
   * DELETE /api/admin/permission-change-history
   */
  static async clearChangeHistory(req: Request, res: Response): Promise<void> {
    try {
      console.log('🗑️ 管理员清空权限变更历史...')
      console.log(`👤 操作用户: ${(req.user as any)?.username || 'Unknown'} (ID: ${req.user?.id})`)
      
      PermissionWatcherService.clearChangeEvents()
      
      res.json({
        success: true,
        message: '变更历史已清空',
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('❌ 清空变更历史失败:', error)
      
      res.status(500).json({
        success: false,
        error: '清空变更历史失败',
        message: (error as Error).message,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * 缓存预热
   * POST /api/admin/warmup-cache
   */
  static async warmupCache(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 管理员触发缓存预热...')
      console.log(`👤 操作用户: ${(req.user as any)?.username || 'Unknown'} (ID: ${req.user?.id})`)
      
      const startTime = Date.now()
      
      await RouteCacheService.warmupCache()
      
      const warmupTime = Date.now() - startTime
      console.log(`✅ 缓存预热完成，耗时: ${warmupTime}ms`)
      
      res.json({
        success: true,
        message: '缓存预热完成',
        data: {
          warmupTime
        },
        timestamp: Date.now()
      })
      
    } catch (error) {
      console.error('❌ 缓存预热失败:', error)
      
      res.status(500).json({
        success: false,
        error: '缓存预热失败',
        message: (error as Error).message,
        timestamp: Date.now()
      })
    }
  }
}

/**
 * 格式化时间差
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天${hours % 24}小时`
  if (hours > 0) return `${hours}小时${minutes % 60}分钟`
  if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`
  return `${seconds}秒`
}

/**
 * 计算健康评分 (0-100)
 */
function calculateHealthScore(cacheStatus: any, metrics: any): number {
  let score = 100
  
  // 基础健康检查
  if (!cacheStatus.isHealthy) score -= 30
  if (cacheStatus.routeCount === 0) score -= 20
  
  // 性能指标检查
  if (metrics.loadTime > 5000) score -= 15 // 加载时间超过5秒
  if (metrics.queryTime > 1000) score -= 10 // 查询时间超过1秒
  if (metrics.errorCount > 0) score -= 10 * metrics.errorCount // 每个错误扣10分
  
  // 缓存年龄检查
  const cacheAge = Date.now() - cacheStatus.lastLoadTime
  if (cacheAge > 24 * 60 * 60 * 1000) score -= 15 // 超过24小时
  
  return Math.max(0, score)
}

/**
 * 获取健康状态描述
 */
function getHealthStatus(score: number): string {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  if (score >= 40) return 'poor'
  return 'critical'
}

/**
 * 获取健康建议
 */
function getHealthRecommendations(score: number, cacheStatus: any, metrics: any): string[] {
  const recommendations: string[] = []
  
  if (!cacheStatus.isHealthy) {
    recommendations.push('缓存状态异常，建议立即刷新缓存')
  }
  
  if (cacheStatus.routeCount === 0) {
    recommendations.push('缓存中没有路由数据，请检查数据库连接')
  }
  
  if (metrics.loadTime > 5000) {
    recommendations.push('缓存加载时间较长，建议检查数据库性能')
  }
  
  if (metrics.errorCount > 0) {
    recommendations.push('存在缓存错误，建议查看日志并修复')
  }
  
  const cacheAge = Date.now() - cacheStatus.lastLoadTime
  if (cacheAge > 24 * 60 * 60 * 1000) {
    recommendations.push('缓存数据较旧，建议刷新缓存')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('缓存状态良好，无需特殊操作')
  }
  
  return recommendations
}

export { PermissionCacheController }