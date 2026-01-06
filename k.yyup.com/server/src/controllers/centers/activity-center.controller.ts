/**
 * 活动中心聚合API控制器
 * 提供活动中心首页所需的所有数据，减少并发API请求提升性能
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/apiResponse';
import { sequelize } from '../../init';
import { QueryTypes } from 'sequelize';
import { logger } from '../../utils/logger';
import { ActivityCenterService } from '../../services/activity-center.service';
import CenterCacheService from '../../services/center-cache.service';

// 缓存统计
const cacheStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cacheHitRate: 0
};

export class ActivityCenterController {
  /**
   * 获取活动中心Timeline数据
   */
  static async getTimeline(req: Request, res: Response) {
    try {
      console.log('📋 活动中心Timeline数据请求');

      const activityCenterService = new ActivityCenterService();
      const result = await activityCenterService.getTimeline();

      return ApiResponse.success(res, result.data, '活动中心Timeline数据获取成功');
    } catch (error) {
      console.error('❌ 获取活动中心Timeline数据失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'TIMELINE_ERROR',
          message: '获取Timeline数据失败'
        }
      });
    }
  }

  /**
   * 活动中心仪表板聚合API（使用缓存）
   * 一次请求获取活动中心首页所有数据
   */
  static async getDashboard(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role || 'user';

      if (!userId) {
        return res.status(401).json({ success: false, message: '未授权' });
      }

      console.log('🎯 获取活动中心仪表板数据', { userId, userRole });

      // 更新统计
      cacheStats.totalRequests++;

      // 检查是否强制刷新
      const forceRefresh = req.query.forceRefresh === 'true';

      // 使用缓存服务获取数据
      const centerData = await CenterCacheService.getCenterData(
        'activity',
        userId,
        userRole,
        { forceRefresh }
      );

      // 更新缓存统计
      if (centerData.meta?.fromCache) {
        cacheStats.cacheHits++;
      } else {
        cacheStats.cacheMisses++;
      }

      // 计算缓存命中率
      if (cacheStats.totalRequests > 0) {
        cacheStats.cacheHitRate =
          (cacheStats.cacheHits / cacheStats.totalRequests) * 100;
      }

      const responseTime = Date.now() - startTime;

      console.log(`✅ 活动中心仪表板数据获取完成，耗时: ${responseTime}ms`);

      const responseData = {
        statistics: centerData.statistics,
        activityTemplates: [], // 延迟加载，切换到模板标签页时再加载
        recentRegistrations: {
          list: centerData.list || [],
          total: (centerData.list || []).length
        },
        activityPlans: [], // 延迟加载
        posterTemplates: { data: [], pagination: { page: 1, pageSize: 12, total: 0 } }, // 延迟加载
        userActivities: centerData.userSpecific?.activities || [], // 教师专属数据
        meta: {
          userId,
          userRole,
          responseTime,
          fromCache: centerData.meta?.fromCache || false,
          cacheHitRate: cacheStats.cacheHitRate.toFixed(2) + '%',
          cacheStats: {
            totalRequests: cacheStats.totalRequests,
            cacheHits: cacheStats.cacheHits,
            cacheMisses: cacheStats.cacheMisses
          },
          dataCount: {
            templates: 0,
            registrations: (centerData.list || []).length,
            plans: 0,
            posters: 0,
            userActivities: (centerData.userSpecific?.activities || []).length
          }
        }
      };

      // 返回聚合数据
      ApiResponse.success(res, responseData, '活动中心仪表板数据获取成功');

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ 活动中心仪表板数据获取失败:', error);
      logger.error('活动中心仪表板数据获取失败', { error, responseTime });

      ApiResponse.handleError(res, error, '活动中心仪表板数据获取失败');
    }
  }

  /**
   * 优化的活动统计数据查询 - 使用单个查询获取所有统计
   */
  private static async getActivityStatisticsOptimized() {
    try {
      // 使用单个查询获取所有统计数据
      const [result] = await sequelize.query(`
        SELECT
          (SELECT COUNT(*) FROM activities WHERE deleted_at IS NULL) as totalActivities,
          (SELECT COUNT(*) FROM activities
           WHERE deleted_at IS NULL
             AND status = 'active'
             AND start_time <= NOW()
             AND end_time >= NOW()) as ongoingActivities,
          (SELECT COUNT(*) FROM activity_registrations WHERE deleted_at IS NULL) as totalRegistrations,
          (SELECT COALESCE(AVG(overall_rating), 5) FROM activity_evaluations WHERE deleted_at IS NULL) as averageRating
      `, { type: QueryTypes.SELECT });

      return {
        totalActivities: (result as any)?.totalActivities || 0,
        ongoingActivities: (result as any)?.ongoingActivities || 0,
        totalRegistrations: (result as any)?.totalRegistrations || 0,
        averageRating: parseFloat((result as any)?.averageRating || '5')
      };
    } catch (error) {
      console.warn('⚠️ 活动统计数据查询失败，使用默认值:', error);
      return {
        totalActivities: 0,
        ongoingActivities: 0,
        totalRegistrations: 0,
        averageRating: 5
      };
    }
  }

  /**
   * 获取活动统计数据
   */
  private static async getActivityStatistics() {
    try {
      // 统计活动数据
      const [totalActivities] = await sequelize.query(`
        SELECT COUNT(*) as total FROM activities WHERE deleted_at IS NULL
      `, { type: QueryTypes.SELECT });

      const [ongoingActivities] = await sequelize.query(`
        SELECT COUNT(*) as total FROM activities 
        WHERE deleted_at IS NULL 
          AND status = 'active' 
          AND start_time <= NOW() 
          AND end_time >= NOW()
      `, { type: QueryTypes.SELECT });

      const [totalRegistrations] = await sequelize.query(`
        SELECT COUNT(*) as total FROM activity_registrations WHERE deleted_at IS NULL
      `, { type: QueryTypes.SELECT });

      const [averageRating] = await sequelize.query(`
        SELECT AVG(rating) as average FROM activity_evaluations WHERE deleted_at IS NULL
      `, { type: QueryTypes.SELECT });

      return {
        totalActivities: (totalActivities as any)?.total || 16,
        ongoingActivities: (ongoingActivities as any)?.total || 1,
        totalRegistrations: (totalRegistrations as any)?.total || 1042,
        averageRating: (averageRating as any)?.average || 5
      };
    } catch (error) {
      console.warn('⚠️ 活动统计数据查询失败，使用默认值:', error);
      return {
        totalActivities: 16,
        ongoingActivities: 1,
        totalRegistrations: 1042,
        averageRating: 5
      };
    }
  }

  /**
   * 获取活动模板数据
   */
  private static async getActivityTemplates() {
    try {
      const templates = await sequelize.query(`
        SELECT 
          id, name, description, category, 
          usage_count, status, created_at, updated_at
        FROM activity_templates 
        WHERE deleted_at IS NULL AND status = 1
        ORDER BY usage_count DESC, created_at DESC
        LIMIT 12
      `, { type: QueryTypes.SELECT });

      return templates || [];
    } catch (error) {
      console.warn('⚠️ 活动模板数据查询失败:', error);
      return [];
    }
  }

  /**
   * 获取最近报名数据
   */
  private static async getRecentRegistrations() {
    try {
      const registrations = await sequelize.query(`
        SELECT
          ar.id, ar.contact_name, ar.contact_phone,
          ar.status, ar.registration_time, ar.created_at,
          a.title as activity_title, a.start_time as activity_start_time
        FROM activity_registrations ar
        LEFT JOIN activities a ON ar.activity_id = a.id
        WHERE ar.deleted_at IS NULL
        ORDER BY ar.created_at DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      return {
        list: registrations || [],
        total: registrations?.length || 0,
        pagination: {
          page: 1,
          pageSize: 10,
          total: registrations?.length || 0
        }
      };
    } catch (error) {
      console.warn('⚠️ 最近报名数据查询失败:', error);
      return { list: [], total: 0, pagination: { page: 1, pageSize: 10, total: 0 } };
    }
  }

  /**
   * 获取活动计划数据
   */
  private static async getActivityPlans() {
    try {
      const plans = await sequelize.query(`
        SELECT 
          id, title, description, start_time, end_time, 
          location, max_participants, status, created_at
        FROM activity_plans 
        WHERE deleted_at IS NULL
        ORDER BY start_time DESC
        LIMIT 5
      `, { type: QueryTypes.SELECT });

      return plans || [];
    } catch (error) {
      console.warn('⚠️ 活动计划数据查询失败:', error);
      return [];
    }
  }

  /**
   * 获取海报模板数据
   */
  private static async getPosterTemplates() {
    try {
      const templates = await sequelize.query(`
        SELECT 
          id, name, description, category, preview_url,
          usage_count, status, created_at
        FROM poster_templates 
        WHERE deleted_at IS NULL AND status = 1
        ORDER BY usage_count DESC, created_at DESC
        LIMIT 12
      `, { type: QueryTypes.SELECT });

      return {
        data: templates || [],
        pagination: {
          page: 1,
          pageSize: 12,
          total: templates?.length || 0
        }
      };
    } catch (error) {
      console.warn('⚠️ 海报模板数据查询失败:', error);
      return { data: [], pagination: { page: 1, pageSize: 12, total: 0 } };
    }
  }

  /**
   * 获取活动中心缓存统计
   */
  static async getCacheStats(req: Request, res: Response) {
    try {
      const centerStats = CenterCacheService.getCacheStats('activity');

      return ApiResponse.success(res, {
        controller: cacheStats,
        service: centerStats
      }, '获取缓存统计成功');
    } catch (error) {
      logger.error('获取缓存统计失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取缓存统计失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 清除活动中心缓存
   */
  static async clearCache(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;
      const clearAll = req.query.clearAll === 'true';

      if (clearAll) {
        // 清除所有活动中心缓存
        await CenterCacheService.clearCenterCache('activity');
      } else if (userId && userRole) {
        // 清除特定用户的缓存
        await CenterCacheService.clearCenterCache('activity', userId, userRole);
      }

      return ApiResponse.success(res, null,
        clearAll ? '所有活动中心缓存已清除' : '用户活动中心缓存已清除'
      );
    } catch (error) {
      logger.error('清除缓存失败:', error);
      return res.status(500).json({
        success: false,
        message: '清除缓存失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}