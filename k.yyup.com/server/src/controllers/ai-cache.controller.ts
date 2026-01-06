/**
 * AI缓存管理控制器
 * 
 * 提供工具意图缓存的管理接口：
 * - 查看缓存统计
 * - 清除缓存
 * - 预热缓存
 */

import { Request, Response } from 'express'
import { toolIntentCacheService } from '../services/ai/tool-intent-cache.service'

/**
 * 获取缓存统计信息
 * GET /api/ai-cache/stats
 */
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const stats = await toolIntentCacheService.getStats()
    
    res.json({
      success: true,
      data: stats,
      message: '获取缓存统计成功'
    })
  } catch (error: any) {
    console.error('❌ [AI缓存] 获取统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取缓存统计失败',
      error: error.message
    })
  }
}

/**
 * 清除指定工具的缓存
 * DELETE /api/ai-cache/tool/:toolName
 */
export const clearToolCache = async (req: Request, res: Response) => {
  try {
    const { toolName } = req.params
    
    const count = await toolIntentCacheService.clearTool(toolName)
    
    res.json({
      success: true,
      data: { count },
      message: `已清除 ${count} 个缓存`
    })
  } catch (error: any) {
    console.error('❌ [AI缓存] 清除工具缓存失败:', error)
    res.status(500).json({
      success: false,
      message: '清除工具缓存失败',
      error: error.message
    })
  }
}

/**
 * 清除所有缓存
 * DELETE /api/ai-cache/all
 */
export const clearAllCache = async (req: Request, res: Response) => {
  try {
    const count = await toolIntentCacheService.clearAll()
    
    res.json({
      success: true,
      data: { count },
      message: `已清除 ${count} 个缓存`
    })
  } catch (error: any) {
    console.error('❌ [AI缓存] 清除所有缓存失败:', error)
    res.status(500).json({
      success: false,
      message: '清除所有缓存失败',
      error: error.message
    })
  }
}

/**
 * 重置统计信息
 * POST /api/ai-cache/reset-stats
 */
export const resetStats = async (req: Request, res: Response) => {
  try {
    await toolIntentCacheService.resetStats()
    
    res.json({
      success: true,
      message: '统计信息已重置'
    })
  } catch (error: any) {
    console.error('❌ [AI缓存] 重置统计失败:', error)
    res.status(500).json({
      success: false,
      message: '重置统计失败',
      error: error.message
    })
  }
}

/**
 * 预热缓存
 * POST /api/ai-cache/warmup
 * 
 * Body: {
 *   tools: [
 *     { name: 'query_students', args: { page: 1, pageSize: 10 }, intent: '我将查询学生列表' },
 *     ...
 *   ]
 * }
 */
export const warmupCache = async (req: Request, res: Response) => {
  try {
    const { tools } = req.body
    
    if (!Array.isArray(tools)) {
      return res.status(400).json({
        success: false,
        message: 'tools必须是数组'
      })
    }
    
    await toolIntentCacheService.warmup(tools)
    
    res.json({
      success: true,
      data: { count: tools.length },
      message: `已预热 ${tools.length} 个工具缓存`
    })
  } catch (error: any) {
    console.error('❌ [AI缓存] 预热缓存失败:', error)
    res.status(500).json({
      success: false,
      message: '预热缓存失败',
      error: error.message
    })
  }
}

/**
 * 检查Redis连接状态
 * GET /api/ai-cache/health
 */
export const checkHealth = async (req: Request, res: Response) => {
  try {
    const isConnected = await toolIntentCacheService.isConnected()
    
    res.json({
      success: true,
      data: {
        redis: isConnected ? 'connected' : 'disconnected',
        cache: isConnected ? 'available' : 'unavailable'
      },
      message: isConnected ? 'Redis连接正常' : 'Redis连接失败'
    })
  } catch (error: any) {
    console.error('❌ [AI缓存] 健康检查失败:', error)
    res.status(500).json({
      success: false,
      message: '健康检查失败',
      error: error.message
    })
  }
}

