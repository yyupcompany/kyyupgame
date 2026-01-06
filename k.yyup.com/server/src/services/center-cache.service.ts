/**
 * 中心页面缓存服务
 * 
 * 功能：
 * 1. 统一管理15个中心页面的缓存
 * 2. 混合缓存策略（公共统计 + 角色列表 + 用户数据）
 * 3. 智能缓存失效
 * 4. 性能监控
 */

import RedisService from './redis.service';
import { RedisTTL } from '../config/redis.config';
import { sequelize } from '../database';
import { QueryTypes } from 'sequelize';

/**
 * 中心数据选项
 */
export interface CenterDataOptions {
  page?: number;
  pageSize?: number;
  filters?: any;
  forceRefresh?: boolean;
}

/**
 * 中心数据结构
 */
export interface CenterData {
  statistics?: any;      // 统计数据（公共缓存）
  list?: any[];          // 列表数据（角色缓存）
  userSpecific?: any;    // 用户专属数据（用户缓存）
  meta?: {
    fromCache: boolean;
    cacheKey?: string;
    responseTime: number;
    userId?: number;
    userRole?: string;
  };
}

/**
 * 缓存统计
 */
interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
}

/**
 * 中心缓存服务类
 */
class CenterCacheService {
  // 缓存Key前缀
  private readonly CENTER_STATS_PREFIX = 'center:stats:';      // 公共统计数据
  private readonly CENTER_ROLE_PREFIX = 'center:role:';        // 角色列表数据
  private readonly CENTER_USER_PREFIX = 'center:user:';        // 用户专属数据

  // 缓存统计
  private stats: Record<string, CacheStats> = {};

  /**
   * 获取中心数据（混合缓存策略）
   * 
   * @param centerName 中心名称
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param options 选项
   * @returns 中心数据
   */
  async getCenterData(
    centerName: string,
    userId: number,
    userRole: string,
    options: CenterDataOptions = {}
  ): Promise<CenterData> {
    const startTime = Date.now();
    
    // 初始化统计
    if (!this.stats[centerName]) {
      this.stats[centerName] = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0
      };
    }
    
    this.stats[centerName].totalRequests++;

    try {
      // 如果强制刷新，直接从数据库加载
      if (options.forceRefresh) {
        const data = await this.loadCenterDataFromDB(centerName, userId, userRole, options);
        this.stats[centerName].cacheMisses++;
        this.updateCacheHitRate(centerName);
        
        // 更新缓存
        await this.setCenterCache(centerName, userId, userRole, data);
        
        return {
          ...data,
          meta: {
            fromCache: false,
            responseTime: Date.now() - startTime,
            userId,
            userRole
          }
        };
      }

      // 尝试从缓存获取
      const cachedData = await this.getCenterCache(centerName, userId, userRole);
      
      if (cachedData) {
        this.stats[centerName].cacheHits++;
        this.updateCacheHitRate(centerName);
        
        return {
          ...cachedData,
          meta: {
            fromCache: true,
            responseTime: Date.now() - startTime,
            userId,
            userRole
          }
        };
      }

      // 缓存未命中，从数据库加载
      const data = await this.loadCenterDataFromDB(centerName, userId, userRole, options);
      this.stats[centerName].cacheMisses++;
      this.updateCacheHitRate(centerName);
      
      // 设置缓存
      await this.setCenterCache(centerName, userId, userRole, data);
      
      return {
        ...data,
        meta: {
          fromCache: false,
          responseTime: Date.now() - startTime,
          userId,
          userRole
        }
      };
    } catch (error) {
      console.error(`❌ 获取中心数据失败 [${centerName}]:`, error);
      throw error;
    }
  }

  /**
   * 从缓存获取中心数据
   */
  private async getCenterCache(
    centerName: string,
    userId: number,
    userRole: string
  ): Promise<CenterData | null> {
    try {
      // 1. 获取公共统计数据（所有用户共享）
      const statsKey = `${this.CENTER_STATS_PREFIX}${centerName}`;
      const statistics = await RedisService.get(statsKey);

      // 2. 获取角色列表数据（同角色共享）
      const roleKey = `${this.CENTER_ROLE_PREFIX}${centerName}:${userRole}`;
      const list = await RedisService.get(roleKey);

      // 3. 获取用户专属数据
      const userKey = `${this.CENTER_USER_PREFIX}${centerName}:${userId}`;
      const userSpecific = await RedisService.get(userKey);

      // 如果任何一个缓存不存在，返回null（需要完整重新加载）
      if (!statistics && !list && !userSpecific) {
        return null;
      }

      return {
        statistics: statistics || undefined,
        list: list || undefined,
        userSpecific: userSpecific || undefined
      };
    } catch (error) {
      console.error(`❌ 获取中心缓存失败 [${centerName}]:`, error);
      return null;
    }
  }

  /**
   * 设置中心缓存
   */
  private async setCenterCache(
    centerName: string,
    userId: number,
    userRole: string,
    data: CenterData
  ): Promise<void> {
    try {
      const ttl = this.getCenterTTL(centerName);

      // 1. 缓存公共统计数据
      if (data.statistics) {
        const statsKey = `${this.CENTER_STATS_PREFIX}${centerName}`;
        await RedisService.set(statsKey, data.statistics, ttl);
      }

      // 2. 缓存角色列表数据
      if (data.list) {
        const roleKey = `${this.CENTER_ROLE_PREFIX}${centerName}:${userRole}`;
        await RedisService.set(roleKey, data.list, ttl);
      }

      // 3. 缓存用户专属数据
      if (data.userSpecific) {
        const userKey = `${this.CENTER_USER_PREFIX}${centerName}:${userId}`;
        await RedisService.set(userKey, data.userSpecific, ttl);
      }

      console.log(`✅ 中心缓存已设置 [${centerName}], TTL=${ttl}秒`);
    } catch (error) {
      console.error(`❌ 设置中心缓存失败 [${centerName}]:`, error);
    }
  }

  /**
   * 从数据库加载中心数据
   */
  private async loadCenterDataFromDB(
    centerName: string,
    userId: number,
    userRole: string,
    options: CenterDataOptions
  ): Promise<CenterData> {
    // 根据中心名称调用对应的加载方法
    switch (centerName) {
      case 'dashboard':
        return await this.loadDashboardData(userId, userRole, options);
      case 'activity':
        return await this.loadActivityCenterData(userId, userRole, options);
      case 'enrollment':
        return await this.loadEnrollmentCenterData(userId, userRole, options);
      case 'personnel':
        return await this.loadPersonnelCenterData(userId, userRole, options);
      case 'marketing':
        return await this.loadMarketingCenterData(userId, userRole, options);
      case 'customer-pool':
        return await this.loadCustomerPoolCenterData(userId, userRole, options);
      case 'task':
        return await this.loadTaskCenterData(userId, userRole, options);
      case 'system':
        return await this.loadSystemCenterData(userId, userRole, options);
      default:
        throw new Error(`未知的中心: ${centerName}`);
    }
  }

  /**
   * 加载Dashboard数据
   */
  private async loadDashboardData(
    userId: number,
    userRole: string,
    options: CenterDataOptions
  ): Promise<CenterData> {
    try {
      // 公共统计数据
      const [statsResult] = await sequelize.query(`
        SELECT
          (SELECT COUNT(*) FROM users) as userCount,
          (SELECT COUNT(*) FROM students) as studentCount,
          (SELECT COUNT(*) FROM teachers) as teacherCount,
          (SELECT COUNT(*) FROM classes) as classCount,
          (SELECT COUNT(*) FROM activities) as activityCount
      `, { type: QueryTypes.SELECT });

      // 用户专属数据（待办事项、日程等）
      const userTodos = await sequelize.query(`
        SELECT id, title, status, due_date, priority
        FROM todos
        WHERE user_id = ?
        ORDER BY due_date ASC
        LIMIT 10
      `, {
        replacements: [userId],
        type: QueryTypes.SELECT
      });

      return {
        statistics: statsResult,
        userSpecific: {
          todos: userTodos
        }
      };
    } catch (error) {
      console.error('❌ 加载Dashboard数据失败:', error);
      throw error;
    }
  }

  /**
   * 加载活动中心数据
   */
  private async loadActivityCenterData(
    userId: number,
    userRole: string,
    options: CenterDataOptions
  ): Promise<CenterData> {
    try {
      // 公共统计数据
      const [statsResult] = await sequelize.query(`
        SELECT
          (SELECT COUNT(*) FROM activities) as totalActivities,
          (SELECT COUNT(*) FROM activities WHERE status = 'ongoing') as ongoingActivities,
          (SELECT COUNT(*) FROM activity_registrations) as totalRegistrations,
          (SELECT AVG(overall_rating) FROM activity_evaluations) as averageRating
      `, { type: QueryTypes.SELECT });

      // 角色列表数据（最近报名）
      const recentRegistrations = await sequelize.query(`
        SELECT
          ar.id,
          ar.activity_id,
          ar.student_id,
          ar.registration_time,
          ar.status,
          a.title as activity_name,
          s.name as student_name
        FROM activity_registrations ar
        LEFT JOIN activities a ON ar.activity_id = a.id
        LEFT JOIN students s ON ar.student_id = s.id
        ORDER BY ar.registration_time DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });

      // 用户专属数据（教师的活动）
      let userActivities = [];
      if (userRole === 'teacher') {
        userActivities = await sequelize.query(`
          SELECT
            a.id,
            a.name,
            a.status,
            a.start_date,
            a.end_date,
            COUNT(ar.id) as registration_count
          FROM activities a
          LEFT JOIN activity_registrations ar ON a.id = ar.activity_id
          WHERE a.teacher_id = ?
          GROUP BY a.id
          ORDER BY a.start_date DESC
          LIMIT 10
        `, {
          replacements: [userId],
          type: QueryTypes.SELECT
        });
      }

      return {
        statistics: statsResult,
        list: recentRegistrations,
        userSpecific: {
          activities: userActivities
        }
      };
    } catch (error) {
      console.error('❌ 加载活动中心数据失败:', error);
      throw error;
    }
  }

  /**
   * 加载招生中心数据
   */
  private async loadEnrollmentCenterData(
    userId: number,
    userRole: string,
    options: CenterDataOptions
  ): Promise<CenterData> {
    // 实现招生中心数据加载逻辑
    return {
      statistics: {},
      list: [],
      userSpecific: {}
    };
  }

  // ... 其他中心的加载方法（后续实现）
  private async loadPersonnelCenterData(userId: number, userRole: string, options: CenterDataOptions): Promise<CenterData> {
    return { statistics: {}, list: [], userSpecific: {} };
  }

  private async loadMarketingCenterData(userId: number, userRole: string, options: CenterDataOptions): Promise<CenterData> {
    return { statistics: {}, list: [], userSpecific: {} };
  }

  private async loadCustomerPoolCenterData(userId: number, userRole: string, options: CenterDataOptions): Promise<CenterData> {
    return { statistics: {}, list: [], userSpecific: {} };
  }

  private async loadTaskCenterData(userId: number, userRole: string, options: CenterDataOptions): Promise<CenterData> {
    return { statistics: {}, list: [], userSpecific: {} };
  }

  private async loadSystemCenterData(userId: number, userRole: string, options: CenterDataOptions): Promise<CenterData> {
    return { statistics: {}, list: [], userSpecific: {} };
  }

  /**
   * 获取中心的TTL
   */
  private getCenterTTL(centerName: string): number {
    const ttlMap: Record<string, number> = {
      'dashboard': RedisTTL.DASHBOARD_CENTER,
      'task': RedisTTL.TASK_CENTER,
      'activity': RedisTTL.ACTIVITY_CENTER,
      'personnel': RedisTTL.PERSONNEL_CENTER,
      'marketing': RedisTTL.MARKETING_CENTER,
      'enrollment': RedisTTL.ENROLLMENT_CENTER,
      'customer-pool': RedisTTL.CUSTOMER_POOL_CENTER,
      'system': RedisTTL.SYSTEM_CENTER
    };

    return ttlMap[centerName] || RedisTTL.DEFAULT_CENTER;
  }

  /**
   * 清除中心缓存
   */
  async clearCenterCache(centerName: string, userId?: number, userRole?: string): Promise<void> {
    try {
      if (userId && userRole) {
        // 清除特定用户的缓存
        const userKey = `${this.CENTER_USER_PREFIX}${centerName}:${userId}`;
        await RedisService.del(userKey);
      } else if (userRole) {
        // 清除特定角色的缓存
        const roleKey = `${this.CENTER_ROLE_PREFIX}${centerName}:${userRole}`;
        await RedisService.del(roleKey);
      } else {
        // 清除所有缓存
        const statsKey = `${this.CENTER_STATS_PREFIX}${centerName}`;
        await RedisService.del(statsKey);
        
        const rolePattern = `${this.CENTER_ROLE_PREFIX}${centerName}:*`;
        const roleKeys = await RedisService.keys(rolePattern);
        for (const key of roleKeys) {
          await RedisService.del(key);
        }
        
        const userPattern = `${this.CENTER_USER_PREFIX}${centerName}:*`;
        const userKeys = await RedisService.keys(userPattern);
        for (const key of userKeys) {
          await RedisService.del(key);
        }
      }

      console.log(`✅ 中心缓存已清除 [${centerName}]`);
    } catch (error) {
      console.error(`❌ 清除中心缓存失败 [${centerName}]:`, error);
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(centerName?: string): Record<string, CacheStats> | CacheStats {
    if (centerName) {
      return this.stats[centerName] || {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0
      };
    }
    return this.stats;
  }

  /**
   * 更新缓存命中率
   */
  private updateCacheHitRate(centerName: string): void {
    const stats = this.stats[centerName];
    if (stats.totalRequests > 0) {
      stats.cacheHitRate = (stats.cacheHits / stats.totalRequests) * 100;
    }
  }
}

// 导出单例
export default new CenterCacheService();

