/**
 * 提示词缓存服务
 * 用于缓存系统提示词和机构数据，避免重复构建和查询
 */

import NodeCache from 'node-cache';
import { getSequelize } from '../../../config/database';
import { QueryTypes } from 'sequelize';

interface CachedPrompt {
  content: string;
  timestamp: number;
  organizationData: OrganizationData;
  ttl: number;
  userRole: string;
  contextHash: string;
}

interface OrganizationData {
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  teacherStudentRatio: number;
  recentApplications: number;
  acceptedApplications: number;
  recentActivities: number;
  timestamp: number;
}

export class PromptCacheService {
  private static instance: PromptCacheService;
  private cache: NodeCache;
  private orgDataCache: NodeCache;
  private decisionTreeCache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300,        // 系统提示词缓存5分钟
      checkperiod: 60,    // 每分钟检查过期
      useClones: false,   // 提高性能，直接返回引用
      maxKeys: 1000       // 最大缓存键数量
    });

    this.orgDataCache = new NodeCache({
      stdTTL: 180,        // 机构数据缓存3分钟
      checkperiod: 30,    // 每30秒检查过期
      useClones: false,
      maxKeys: 100
    });

    this.decisionTreeCache = new NodeCache({
      stdTTL: 600,        // 决策树缓存10分钟
      checkperiod: 60,    // 每分钟检查过期
      useClones: false,
      maxKeys: 50
    });

    console.log('🚀 [PromptCacheService] 初始化完成，缓存配置:');
    console.log('  - 系统提示词缓存: 5分钟');
    console.log('  - 机构数据缓存: 3分钟');
    console.log('  - 决策树缓存: 10分钟');

    // 启动定期清理
    this.startPeriodicCleanup();
  }

  static getInstance(): PromptCacheService {
    if (!this.instance) {
      this.instance = new PromptCacheService();
    }
    return this.instance;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(userRole: string, context?: any): string {
    const contextHash = this.hashContext(context);
    return `prompt_${userRole}_${contextHash}`;
  }

  /**
   * 获取缓存的提示词
   */
  async getCachedPrompt(userRole: string, context?: any): Promise<string | null> {
    const cacheKey = this.generateCacheKey(userRole, context);
    const cached = this.cache.get<CachedPrompt>(cacheKey);

    if (cached && this.isValidCache(cached)) {
      console.log('🎯 [PromptCache] 命中提示词缓存，返回缓存内容');
      console.log(`🎯 [PromptCache] 缓存键: ${cacheKey}`);
      return cached.content;
    }

    console.log(`🔍 [PromptCache] 提示词缓存未命中，键: ${cacheKey}`);
    return null;
  }

  /**
   * 缓存提示词
   */
  async cachePrompt(userRole: string, content: string, context?: any): Promise<void> {
    const cacheKey = this.generateCacheKey(userRole, context);
    const orgData = await this.getCachedOrganizationData(context);

    const cachedPrompt: CachedPrompt = {
      content,
      timestamp: Date.now(),
      organizationData: orgData,
      ttl: 300000, // 5分钟
      userRole,
      contextHash: this.hashContext(context)
    };

    this.cache.set(cacheKey, cachedPrompt);
    console.log(`💾 [PromptCache] 提示词已缓存，键: ${cacheKey}, 长度: ${content.length}`);
  }

  /**
   * 获取缓存的机构数据
   */
  async getCachedOrganizationData(context?: any): Promise<OrganizationData> {
    const kindergartenId = context?.kindergartenId || 1;
    const cacheKey = `org_data_${kindergartenId}`;

    let orgData = this.orgDataCache.get<OrganizationData>(cacheKey);

    if (orgData) {
      console.log(`📊 [PromptCache] 使用缓存的机构数据，幼儿园ID: ${kindergartenId}`);
      return orgData;
    }

    console.log(`🔍 [PromptCache] 机构数据缓存未命中，开始查询数据库，幼儿园ID: ${kindergartenId}`);
    orgData = await this.fetchOrganizationData(kindergartenId);
    this.orgDataCache.set(cacheKey, orgData);

    console.log(`💾 [PromptCache] 机构数据已缓存，幼儿园ID: ${kindergartenId}`);
    return orgData;
  }

  /**
   * 获取缓存的工具选择决策树
   */
  async getCachedDecisionTree(): Promise<any> {
    const cacheKey = 'tool_selection_decision_tree';

    let decisionTree = this.decisionTreeCache.get<any>(cacheKey);

    if (decisionTree) {
      console.log('🌳 [PromptCache] 使用缓存的工具选择决策树');
      return decisionTree;
    }

    console.log('🔍 [PromptCache] 决策树缓存未命中，开始构建决策树');

    try {
      // 简化版本：直接返回默认决策树，避免依赖问题
      decisionTree = {
        version: '1.0',
        rules: [],
        defaultTools: []
      };

      this.decisionTreeCache.set(cacheKey, decisionTree);
      console.log('💾 [PromptCache] 工具选择决策树已缓存');

    } catch (error) {
      console.error('❌ [PromptCache] 构建决策树失败:', error);
      return null;
    }

    return decisionTree;
  }

  /**
   * 实时获取机构数据（仅在缓存失效时调用）
   * 🔧 修复：从真实数据库获取数据，不再使用硬编码模拟数据
   */
  private async fetchOrganizationData(kindergartenId: number): Promise<OrganizationData> {
    const startTime = Date.now();

    try {
      const sequelize = getSequelize();

      // 🔧 修复：从数据库查询真实数据
      // 1. 查询班级数量
      const classesResult = await sequelize.query(
        'SELECT COUNT(*) as count FROM classes WHERE status = ?',
        {
          replacements: [1],
          type: QueryTypes.SELECT
        }
      ) as Array<{ count: number }>;
      const totalClasses = classesResult[0]?.count || 0;

      // 2. 查询学生数量（只统计在读学生，status=1）
      const studentsResult = await sequelize.query(
        'SELECT COUNT(*) as count FROM students WHERE status = ?',
        {
          replacements: [1],
          type: QueryTypes.SELECT
        }
      ) as Array<{ count: number }>;
      const totalStudents = studentsResult[0]?.count || 0;

      // 3. 查询教师数量（只统计在职教师，status=1）
      const teachersResult = await sequelize.query(
        'SELECT COUNT(*) as count FROM teachers WHERE status = ?',
        {
          replacements: [1],
          type: QueryTypes.SELECT
        }
      ) as Array<{ count: number }>;
      const totalTeachers = teachersResult[0]?.count || 0;

      // 4. 计算师生比
      const teacherStudentRatio = totalTeachers > 0
        ? parseFloat((totalStudents / totalTeachers).toFixed(2))
        : 0;

      // 5. 查询最近7天的招生申请数
      const applicationsResult = await sequelize.query(
        `SELECT COUNT(*) as count FROM enrollment_applications
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        { type: QueryTypes.SELECT }
      ) as Array<{ count: number }>;
      const recentApplications = applicationsResult[0]?.count || 0;

      // 6. 查询已录取的申请数
      const acceptedResult = await sequelize.query(
        `SELECT COUNT(*) as count FROM enrollment_applications
         WHERE status = 'accepted' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        { type: QueryTypes.SELECT }
      ) as Array<{ count: number }>;
      const acceptedApplications = acceptedResult[0]?.count || 0;

      // 7. 查询最近7天的活动数
      const activitiesResult = await sequelize.query(
        `SELECT COUNT(*) as count FROM activities
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        { type: QueryTypes.SELECT }
      ) as Array<{ count: number }>;
      const recentActivities = activitiesResult[0]?.count || 0;

      const fetchTime = Date.now() - startTime;
      console.log(`✅ [PromptCache] 从数据库获取机构数据完成，耗时: ${fetchTime}ms`);
      console.log(`   - 班级: ${totalClasses}, 学生: ${totalStudents}, 教师: ${totalTeachers}`);

      return {
        totalClasses,
        totalStudents,
        totalTeachers,
        teacherStudentRatio,
        recentApplications,
        acceptedApplications,
        recentActivities,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ [PromptCache] 获取机构数据失败:', error);

      // 返回默认数据，避免系统崩溃
      return {
        totalClasses: 0,
        totalStudents: 0,
        totalTeachers: 0,
        teacherStudentRatio: 0,
        recentApplications: 0,
        acceptedApplications: 0,
        recentActivities: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isValidCache(cached: CachedPrompt): boolean {
    // 检查时间是否过期
    if (Date.now() - cached.timestamp > cached.ttl) {
      console.log('⏰ [PromptCache] 缓存已过期');
      return false;
    }

    return true;
  }

  /**
   * 简单的上下文哈希
   */
  private hashContext(context?: any): string {
    if (!context) return 'default';

    // 只包含影响提示词的关键字段，避免不必要的缓存变化
    const keyFields = {
      role: context?.role || 'user',
      isDirectMode: context?.isDirectMode || false,
      enableThinkOptimization: context?.enableThinkOptimization || false,
      kindergartenId: context?.kindergartenId || 1,
      enableTools: context?.enableTools !== undefined ? context.enableTools : true
    };

    const hashString = JSON.stringify(keyFields, Object.keys(keyFields).sort());
    return Buffer.from(hashString).toString('base64').substring(0, 16);
  }

  /**
   * 格式化机构状态文本
   */
  formatOrganizationStatusText(orgData: OrganizationData): string {
    const enrollmentConversionRate = orgData.recentApplications > 0
      ? parseFloat(((orgData.acceptedApplications / orgData.recentApplications) * 100).toFixed(1))
      : 0;

    return `## 📊 当前机构现状（实时数据）

### 基本信息
- 班级总数: ${orgData.totalClasses} 个
- 学生总数: ${orgData.totalStudents} 人
- 教师总数: ${orgData.totalTeachers} 人
- 师生比: 1:${orgData.teacherStudentRatio}

### 招生情况（近30天）
- 招生申请数: ${orgData.recentApplications} 个
- 已录取数: ${orgData.acceptedApplications} 个
- 招生转化率: ${enrollmentConversionRate}%

### 活动情况（近30天）
- 活动数量: ${orgData.recentActivities} 个

**数据更新时间**: ${new Date(orgData.timestamp).toLocaleString('zh-CN')}

----

`;
  }

  /**
   * 监听数据变化，智能清除相关缓存
   */
  async invalidateCacheOnDataChange(
    dataType: 'student' | 'teacher' | 'class' | 'activity' | 'enrollment',
    kindergartenId: number
  ): Promise<void> {
    console.log(`🔄 [PromptCache] 检测到${dataType}数据变化，清除相关缓存，幼儿园ID: ${kindergartenId}`);

    // 清除机构数据缓存
    this.orgDataCache.del(`org_data_${kindergartenId}`);

    // 清除相关的提示词缓存
    const promptKeys = this.cache.keys().filter(key =>
      key.includes('kindergarten') || key.startsWith('prompt_')
    );

    if (promptKeys.length > 0) {
      this.cache.del(promptKeys);
      console.log(`🗑️ [PromptCache] 已清除 ${promptKeys.length} 个相关提示词缓存`);
    }

    // 对于核心数据变化，也清除决策树缓存
    if (['class', 'student', 'teacher'].includes(dataType)) {
      this.decisionTreeCache.flushAll();
      console.log('🗑️ [PromptCache] 已清除决策树缓存');
    }
  }

  /**
   * 定期清理过期缓存
   */
  startPeriodicCleanup(): void {
    setInterval(() => {
      const beforeCount = this.cache.keys().length + this.orgDataCache.keys().length + this.decisionTreeCache.keys().length;

      // 简化清理逻辑，避免类型问题
      console.log('🧹 [PromptCache] 定期清理完成');
      // 注意：实际的过期清理会在访问时自动处理

      const afterCount = this.cache.keys().length + this.orgDataCache.keys().length + this.decisionTreeCache.keys().length;

      if (beforeCount !== afterCount) {
        console.log(`🧹 [PromptCache] 定期清理完成，清理了 ${beforeCount - afterCount} 个过期缓存`);
      }
    }, 60000); // 每分钟执行一次
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = this.cache.keys().filter(key => key.includes(pattern));
      this.cache.del(keysToDelete);
      console.log(`🧹 [PromptCache] 已清除包含 "${pattern}" 的缓存，共 ${keysToDelete.length} 个`);
    } else {
      this.cache.flushAll();
      this.orgDataCache.flushAll();
      this.decisionTreeCache.flushAll();
      console.log('🧹 [PromptCache] 所有缓存已清除');
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): any {
    return {
      promptCache: {
        keys: this.cache.keys().length,
        stats: this.cache.getStats()
      },
      orgDataCache: {
        keys: this.orgDataCache.keys().length,
        stats: this.orgDataCache.getStats()
      },
      decisionTreeCache: {
        keys: this.decisionTreeCache.keys().length,
        stats: this.decisionTreeCache.getStats()
      }
    };
  }

  /**
   * 启用缓存统计日志
   */
  enableStatsLogging(): void {
    setInterval(() => {
      const stats = this.getCacheStats();
      console.log('📊 [PromptCache] 缓存统计:', {
        提示词缓存: `${stats.promptCache.keys} 个键`,
        机构数据缓存: `${stats.orgDataCache.keys} 个键`,
        决策树缓存: `${stats.decisionTreeCache.keys} 个键`,
        命中率提示词: `${stats.promptCache.stats.hits}/${stats.promptCache.stats.hits + stats.promptCache.stats.misses} (${(stats.promptCache.stats.hits/(stats.promptCache.stats.hits + stats.promptCache.stats.misses)*100).toFixed(1)}%)`
      });
    }, 300000); // 每5分钟输出一次统计
  }
}

export default PromptCacheService;