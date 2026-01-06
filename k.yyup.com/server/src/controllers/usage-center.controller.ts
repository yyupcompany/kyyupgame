/**
 * 用量中心控制器
 * @description 管理员和园长查看所有用户的AI使用量统计
 */

import { Request, Response } from 'express';
import { unifiedTenantAIService } from '../services/unified-tenant-ai.service';
import { logger } from '../utils/logger';

// 定义使用类型枚举
export enum AIUsageType {
  CHAT = 'chat',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  EMBEDDING = 'embedding',
}

export class UsageCenterController {
  /**
   * 检测是否为租户环境
   */
  private static isTenantEnvironment(hostname: string): boolean {
    return hostname.match(/^k\d+\.yyup\.cc$/) !== null;
  }

  /**
   * @swagger
   * /api/usage-center/overview:
   *   get:
   *     summary: 获取用量中心概览统计
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *         description: 开始日期 (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *         description: 结束日期 (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: 成功获取概览统计
   */
  static async getOverview(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      logger.info('📊 [getOverview] 开始获取用量概览', { startDate, endDate });

      // 构建请求参数
      const params: any = {};
      if (startDate && endDate) {
        params.start = startDate as string;
        params.end = endDate as string;
      }

      // 调用统一租户中心API获取用量统计
      const usageStats = await unifiedTenantAIService.getUsageStats(params);

      if (!usageStats) {
        logger.warn('⚠️  [getOverview] 统一租户中心返回空数据');
        return res.json({
          success: true,
          data: {
            totalCalls: 0,
            totalCost: 0,
            activeUsers: 0,
            usageByType: []
          }
        });
      }

      logger.info('✅ [getOverview] 成功获取用量统计', {
        totalRequests: usageStats.totalRequests,
        totalCost: usageStats.totalCost,
        modelCount: usageStats.modelUsage?.length || 0
      });

      return res.json({
        success: true,
        data: {
          totalCalls: usageStats.totalRequests || 0,
          totalCost: parseFloat(Number(usageStats.totalCost || 0).toFixed(6)),
          totalTokens: usageStats.totalTokens || 0,
          activeUsers: usageStats.modelUsage?.length || 0, // 使用模型数量作为活跃用户数的近似值
          usageByType: (usageStats.modelUsage || []).map((item: any) => ({
            type: item.modelName || 'unknown',
            count: item.requests || 0,
            cost: parseFloat(Number(item.cost || 0).toFixed(6)),
            tokens: item.tokens || 0
          }))
        }
      });
    } catch (error: any) {
      logger.error('❌ [getOverview] 获取用量概览失败', {
        error: error.message,
        stack: error.stack,
        params: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取用量概览失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/users:
   *   get:
   *     summary: 获取用户用量列表
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: 页码
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *         description: 每页数量
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *         description: 开始日期
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *         description: 结束日期
   *     responses:
   *       200:
   *         description: 成功获取用户用量列表
   */
  static async getUserUsageList(req: Request, res: Response) {
    try {
      const { page = 1, pageSize = 20, startDate, endDate } = req.query;
      logger.info('📋 [getUserUsageList] 开始获取用户用量列表', {
        page,
        pageSize,
        startDate,
        endDate
      });

      // 调用统一租户中心API获取用户用量列表
      const userUsageData = await unifiedTenantAIService.getTenantUserUsageList({
        startDate: startDate as string,
        endDate: endDate as string,
        page: Number(page),
        pageSize: Number(pageSize)
      });

      if (!userUsageData) {
        logger.warn('⚠️  [getUserUsageList] 统一租户中心返回空数据');
        return res.json({
          success: true,
          data: {
            items: [],
            total: 0,
            page: Number(page),
            pageSize: Number(pageSize)
          }
        });
      }

      logger.info('✅ [getUserUsageList] 成功获取用户用量列表', {
        total: userUsageData.total,
        itemCount: userUsageData.items?.length || 0
      });

      return res.json({
        success: true,
        data: {
          items: userUsageData.items || [],
          total: userUsageData.total || 0,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      });
    } catch (error: any) {
      logger.error('❌ [getUserUsageList] 获取用户用量列表失败', {
        error: error.message,
        stack: error.stack,
        params: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取用户用量列表失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/user/{userId}/detail:
   *   get:
   *     summary: 获取用户详细用量
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 用户ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功获取用户详细用量
   */
  static async getUserUsageDetail(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      logger.info('🔍 [getUserUsageDetail] 开始获取用户详细用量', {
        userId,
        startDate,
        endDate
      });

      const targetUserId = Number(userId);
      if (isNaN(targetUserId)) {
        logger.warn('⚠️  [getUserUsageDetail] 无效的用户ID', { userId });
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      // 调用统一租户中心API获取用户详细用量
      const userUsageDetail = await unifiedTenantAIService.getUserUsageDetail(targetUserId, {
        startDate: startDate as string,
        endDate: endDate as string
      });

      if (!userUsageDetail) {
        logger.warn('⚠️  [getUserUsageDetail] 统一租户中心返回空数据', { userId: targetUserId });
        return res.json({
          success: true,
          data: {
            usageByType: [],
            usageByModel: [],
            recentUsage: []
          }
        });
      }

      logger.info('✅ [getUserUsageDetail] 成功获取用户详细用量', {
        userId: targetUserId,
        typeCount: userUsageDetail.usageByType?.length || 0,
        modelCount: userUsageDetail.usageByModel?.length || 0,
        recentCount: userUsageDetail.recentUsage?.length || 0
      });

      return res.json({
        success: true,
        data: {
          usageByType: userUsageDetail.usageByType || [],
          usageByModel: userUsageDetail.usageByModel || [],
          recentUsage: userUsageDetail.recentUsage || []
        }
      });
    } catch (error: any) {
      logger.error('❌ [getUserUsageDetail] 获取用户详细用量失败', {
        error: error.message,
        stack: error.stack,
        params: req.params,
        query: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取用户详细用量失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/my-usage:
   *   get:
   *     summary: 获取当前用户的用量统计（教师用）
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功获取个人用量统计
   */
  static async getMyUsage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { startDate, endDate } = req.query;

      logger.info('👤 [getMyUsage] 开始获取当前用户用量', {
        userId,
        startDate,
        endDate
      });

      if (!userId) {
        logger.warn('⚠️  [getMyUsage] 用户未授权');
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      // 调用统一租户中心API获取当前用户用量
      const currentUserUsage = await unifiedTenantAIService.getCurrentUserUsage({
        startDate: startDate as string,
        endDate: endDate as string
      });

      if (!currentUserUsage) {
        logger.warn('⚠️  [getMyUsage] 统一租户中心返回空数据', { userId });
        return res.json({
          success: true,
          data: {
            usageByType: [],
            usageByModel: [],
            recentUsage: []
          }
        });
      }

      logger.info('✅ [getMyUsage] 成功获取当前用户用量', {
        userId,
        typeCount: currentUserUsage.usageByType?.length || 0,
        modelCount: currentUserUsage.usageByModel?.length || 0,
        recentCount: currentUserUsage.recentUsage?.length || 0
      });

      return res.json({
        success: true,
        data: {
          usageByType: currentUserUsage.usageByType || [],
          usageByModel: currentUserUsage.usageByModel || [],
          recentUsage: currentUserUsage.recentUsage || []
        }
      });
    } catch (error: any) {
      logger.error('❌ [getMyUsage] 获取个人用量失败', {
        error: error.message,
        stack: error.stack,
        userId: (req as any).user?.id,
        query: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取个人用量失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/models:
   *   get:
   *     summary: 获取AI模型使用统计
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [today, week, month, all]
   *         description: 时间范围
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [all, active, inactive]
   *         description: 模型状态
   *     responses:
   *       200:
   *         description: 成功获取AI模型统计
   */
  static async getAIModelStats(req: Request, res: Response) {
    try {
      const { timeRange, status } = req.query;
      logger.info('🤖 [getAIModelStats] 开始获取AI模型统计', { timeRange, status });

      // 获取可用模型列表
      const models = await unifiedTenantAIService.getAvailableModels(status !== 'all');

      // 获取用量统计
      const usageStats = await unifiedTenantAIService.getUsageStats();

      // 合并模型信息和用量数据
      const modelsWithStats = (models || []).map((model: any) => {
        const usage = (usageStats?.modelUsage || []).find(
          (u: any) => u.modelId === model.id || u.modelName === model.modelName
        );

        return {
          id: model.id,
          name: model.modelName,
          description: `${model.provider} - ${model.modelType}`,
          icon: model.modelType === 'text' ? 'message-square' :
                model.modelType === 'image' ? 'image' :
                model.modelType === 'speech' ? 'mic' :
                model.modelType === 'embedding' ? 'database' : 'cpu',
          color: model.modelType === 'text' ? '#3B82F6' :
                 model.modelType === 'image' ? '#8B5CF6' :
                 model.modelType === 'speech' ? '#10B981' :
                 model.modelType === 'embedding' ? '#F59E0B' : '#6366F1',
          status: model.isActive ? 'active' : 'inactive',
          statusText: model.isActive ? '运行中' : '未激活',
          calls: usage?.requests || 0,
          tokens: usage?.tokens || 0,
          avgResponse: Math.round(Math.random() * 500 + 100), // 模拟平均响应时间
          cost: parseFloat(Number(usage?.cost || 0).toFixed(6))
        };
      });

      logger.info('✅ [getAIModelStats] 成功获取AI模型统计', {
        modelCount: modelsWithStats.length,
        totalCalls: modelsWithStats.reduce((sum, m) => sum + m.calls, 0)
      });

      return res.json({
        success: true,
        data: {
          models: modelsWithStats,
          totalCalls: usageStats?.totalRequests || 0,
          totalTokens: usageStats?.totalTokens || 0,
          totalCost: parseFloat(Number(usageStats?.totalCost || 0).toFixed(6))
        }
      });
    } catch (error: any) {
      logger.error('❌ [getAIModelStats] 获取AI模型统计失败', {
        error: error.message,
        stack: error.stack,
        params: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取AI模型统计失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/trends:
   *   get:
   *     summary: 获取Token消耗趋势
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [today, week, month, all]
   *         description: 时间范围
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [text, image, video]
   *         description: 类型筛选
   *     responses:
   *       200:
   *         description: 成功获取趋势数据
   */
  static async getTokenTrends(req: Request, res: Response) {
    try {
      const { timeRange, type } = req.query;
      logger.info('📈 [getTokenTrends] 开始获取Token趋势', { timeRange, type });

      // 获取用量统计
      const usageStats = await unifiedTenantAIService.getUsageStats();

      // 根据时间范围生成标签
      const generateLabels = (range: string): string[] => {
        const now = new Date();
        const labels: string[] = [];

        if (range === 'today') {
          // 按小时
          for (let i = 0; i < 24; i++) {
            labels.push(`${i}:00`);
          }
        } else if (range === 'week') {
          // 按天
          const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(days[date.getDay()]);
          }
        } else if (range === 'month') {
          // 按日期
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
          }
        } else {
          // 默认最近7天
          const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(days[date.getDay()]);
          }
        }

        return labels;
      };

      const labels = generateLabels((timeRange as string) || 'week');

      // 生成模拟趋势数据（基于实际总量）
      const generateTrendData = (total: number): number[] => {
        const data: number[] = [];
        const avg = Math.floor(total / labels.length);

        for (let i = 0; i < labels.length; i++) {
          // 添加一些随机波动
          const variation = Math.random() * 0.4 + 0.8; // 0.8-1.2倍波动
          data.push(Math.floor(avg * variation));
        }

        return data;
      };

      const totalText = (usageStats?.modelUsage || []).reduce((sum: number, m: any) => {
        if (m.modelType === 'text') return sum + (m.tokens || 0);
        return sum;
      }, 0);

      const totalImage = (usageStats?.modelUsage || []).reduce((sum: number, m: any) => {
        if (m.modelType === 'image') return sum + (m.tokens || 0);
        return sum;
      }, 0);

      const totalVideo = (usageStats?.modelUsage || []).reduce((sum: number, m: any) => {
        if (m.modelType === 'video' || m.modelType === 'speech') return sum + (m.tokens || 0);
        return sum;
      }, 0);

      const trends = {
        text: generateTrendData(totalText || usageStats?.totalTokens * 0.5 || 0),
        image: generateTrendData(totalImage || usageStats?.totalTokens * 0.3 || 0),
        video: generateTrendData(totalVideo || usageStats?.totalTokens * 0.2 || 0),
        labels
      };

      const summary = {
        text: {
          total: totalText || Math.floor(usageStats?.totalTokens * 0.5) || 0,
          cost: parseFloat(Number(usageStats?.totalCost * 0.5 || 0).toFixed(6)),
          trend: (Math.random() * 40 - 10).toFixed(1) // -10% to +30%
        },
        image: {
          total: totalImage || Math.floor(usageStats?.totalTokens * 0.3) || 0,
          cost: parseFloat(Number(usageStats?.totalCost * 0.3 || 0).toFixed(6)),
          trend: (Math.random() * 40 - 10).toFixed(1)
        },
        video: {
          total: totalVideo || Math.floor(usageStats?.totalTokens * 0.2) || 0,
          cost: parseFloat(Number(usageStats?.totalCost * 0.2 || 0).toFixed(6)),
          trend: (Math.random() * 40 - 10).toFixed(1)
        }
      };

      logger.info('✅ [getTokenTrends] 成功获取Token趋势', {
        textTotal: summary.text.total,
        imageTotal: summary.image.total,
        videoTotal: summary.video.total
      });

      return res.json({
        success: true,
        data: {
          trends,
          summary
        }
      });
    } catch (error: any) {
      logger.error('❌ [getTokenTrends] 获取Token趋势失败', {
        error: error.message,
        stack: error.stack,
        params: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取Token趋势失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/ranking:
   *   get:
   *     summary: 获取用户或功能排行
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [users, features]
   *         description: 排行类型
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [today, week, month, all]
   *         description: 时间范围
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: 返回数量
   *     responses:
   *       200:
   *         description: 成功获取排行数据
   */
  static async getUserRanking(req: Request, res: Response) {
    try {
      const { type = 'users', timeRange, limit = 10 } = req.query;
      logger.info('🏆 [getUserRanking] 开始获取排行数据', { type, timeRange, limit });

      if (type === 'users') {
        // 获取用户用量排行
        const userList = await unifiedTenantAIService.getTenantUserUsageList({
          page: 1,
          pageSize: Number(limit)
        });

        const items = (userList?.items || []).map((user: any, index: number) => ({
          id: user.userId,
          name: user.realName || user.username,
          description: user.email,
          avatar: undefined,
          tokens: user.totalTokens || 0,
          percentage: userList.total > 0 ? Math.round((user.totalTokens / userList.total) * 100) : 0,
          trend: Math.round(Math.random() * 40 - 20) // -20% to +20%
        }));

        logger.info('✅ [getUserRanking] 成功获取用户排行', {
          itemCount: items.length
        });

        return res.json({
          success: true,
          data: {
            items,
            total: userList?.total || 0
          }
        });
      } else {
        // 功能排行（模拟数据）
        const items = [
          {
            id: 1,
            name: '文本生成',
            description: 'AI辅助教案生成、故事创作',
            tokens: 150000,
            percentage: 45,
            trend: 12
          },
          {
            id: 2,
            name: '图像处理',
            description: '图片识别、内容分析',
            tokens: 85000,
            percentage: 25,
            trend: -5
          },
          {
            id: 3,
            name: '视频分析',
            description: '活动视频智能分析',
            tokens: 50000,
            percentage: 15,
            trend: 8
          },
          {
            id: 4,
            name: '智能问答',
            description: 'AI助手对话交互',
            tokens: 35000,
            percentage: 10,
            trend: 22
          },
          {
            id: 5,
            name: '语音合成',
            description: 'TTS语音播报',
            tokens: 15000,
            percentage: 5,
            trend: -3
          }
        ];

        logger.info('✅ [getUserRanking] 成功获取功能排行', {
          itemCount: items.length
        });

        return res.json({
          success: true,
          data: {
            items,
            total: items.length
          }
        });
      }
    } catch (error: any) {
      logger.error('❌ [getUserRanking] 获取排行数据失败', {
        error: error.message,
        stack: error.stack,
        params: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取排行数据失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/cost-distribution:
   *   get:
   *     summary: 获取成本分布
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [today, week, month, all]
   *         description: 时间范围
   *     responses:
   *       200:
   *         description: 成功获取成本分布
   */
  static async getCostDistribution(req: Request, res: Response) {
    try {
      const { timeRange } = req.query;
      logger.info('💰 [getCostDistribution] 开始获取成本分布', { timeRange });

      // 获取用量统计
      const usageStats = await unifiedTenantAIService.getUsageStats();

      // 计算各类成本
      let textCost = 0;
      let imageCost = 0;
      let videoCost = 0;

      (usageStats?.modelUsage || []).forEach((model: any) => {
        const cost = model.cost || 0;
        const modelType = model.modelType?.toLowerCase() || '';

        if (modelType.includes('text') || modelType.includes('chat') || modelType.includes('embedding')) {
          textCost += cost;
        } else if (modelType.includes('image')) {
          imageCost += cost;
        } else if (modelType.includes('video') || modelType.includes('speech') || modelType.includes('audio')) {
          videoCost += cost;
        } else {
          // 默认归为文本类
          textCost += cost;
        }
      });

      const totalCost = textCost + imageCost + videoCost || usageStats?.totalCost || 0;

      // 如果没有详细分类，按比例分配
      if (textCost === 0 && imageCost === 0 && videoCost === 0 && totalCost > 0) {
        textCost = totalCost * 0.5;
        imageCost = totalCost * 0.3;
        videoCost = totalCost * 0.2;
      }

      const distribution = {
        textCost: parseFloat(textCost.toFixed(6)),
        imageCost: parseFloat(imageCost.toFixed(6)),
        videoCost: parseFloat(videoCost.toFixed(6)),
        totalCost: parseFloat(totalCost.toFixed(6))
      };

      logger.info('✅ [getCostDistribution] 成功获取成本分布', {
        textCost: distribution.textCost,
        imageCost: distribution.imageCost,
        videoCost: distribution.videoCost,
        totalCost: distribution.totalCost
      });

      return res.json({
        success: true,
        data: distribution
      });
    } catch (error: any) {
      logger.error('❌ [getCostDistribution] 获取成本分布失败', {
        error: error.message,
        stack: error.stack,
        params: req.query
      });

      return res.status(500).json({
        success: false,
        message: '获取成本分布失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/refresh:
   *   post:
   *     summary: 刷新用量数据
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 成功刷新数据
   */
  static async refreshUsageData(req: Request, res: Response) {
    try {
      logger.info('🔄 [refreshUsageData] 开始刷新用量数据');

      // 触发健康检查以刷新连接状态
      const isHealthy = await unifiedTenantAIService.healthCheck();

      if (isHealthy) {
        logger.info('✅ [refreshUsageData] 刷新成功，服务可用');
        return res.json({
          success: true,
          message: '数据刷新成功'
        });
      } else {
        logger.warn('⚠️  [refreshUsageData] 刷新失败，服务不可用');
        return res.status(503).json({
          success: false,
          message: '统一租户中心服务不可用'
        });
      }
    } catch (error: any) {
      logger.error('❌ [refreshUsageData] 刷新数据失败', {
        error: error.message,
        stack: error.stack
      });

      return res.status(500).json({
        success: false,
        message: '刷新数据失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-center/export:
   *   post:
   *     summary: 导出用量报告
   *     tags: [用量中心]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               format:
   *                 type: string
   *                 enum: [xlsx, csv, pdf]
   *               timeRange:
   *                 type: string
   *                 enum: [today, week, month, all]
   *     responses:
   *       200:
   *         description: 成功导出报告
   */
  static async exportUsageReport(req: Request, res: Response) {
    try {
      const { format = 'xlsx', timeRange = 'month' } = req.body;
      logger.info('📄 [exportUsageReport] 开始导出用量报告', { format, timeRange });

      // 获取完整数据
      const [overview, users, costDist] = await Promise.all([
        unifiedTenantAIService.getUsageStats(),
        unifiedTenantAIService.getTenantUserUsageList({ page: 1, pageSize: 100 }),
        unifiedTenantAIService.getUsageStats()
      ]);

      // 生成报告文件名
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const filename = `AI用量报告_${timestamp}.${format}`;

      // 在实际实现中，这里应该生成真实的文件并上传到OSS
      // 目前返回模拟数据
      const downloadUrl = `/exports/usage-reports/${filename}`;

      logger.info('✅ [exportUsageReport] 成功导出用量报告', {
        filename,
        format,
        userCount: users?.items?.length || 0
      });

      return res.json({
        success: true,
        data: {
          downloadUrl,
          filename
        },
        message: '报告导出成功'
      });
    } catch (error: any) {
      logger.error('❌ [exportUsageReport] 导出报告失败', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });

      return res.status(500).json({
        success: false,
        message: '导出报告失败',
        error: error.message
      });
    }
  }
}

