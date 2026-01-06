import { Request, Response } from 'express';
import TrainingService from '../services/training.service.js';
import { TrainingActivity } from '../models/training-activity.model';
import { TrainingPlan } from '../models/training-plan.model';
import { TrainingRecord } from '../models/training-record.model';
import { TrainingAchievement } from '../models/training-achievement.model';
import { sequelize } from '../init';
import { Op } from 'sequelize';

/**
 * 训练中心控制器
 */
export class TrainingController {
  /**
   * 获取训练推荐
   */
  async getRecommendations(req: Request, res: Response) {
    try {
      const { childId, assessmentReportId, preferences } = req.body;
      const userId = (req as any).user.id;

      console.log('🎯 获取训练推荐...', { userId, childId, assessmentReportId });

      // 验证必需参数
      if (!childId) {
        return res.status(400).json({
          success: false,
          message: '孩子ID不能为空'
        });
      }

      // 获取训练推荐
      const recommendations = await TrainingService.generateTrainingRecommendations(
        parseInt(childId),
        assessmentReportId ? parseInt(assessmentReportId) : undefined,
        preferences
      );

      res.json({
        success: true,
        data: recommendations
      });

    } catch (error) {
      console.error('❌ 获取训练推荐失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取训练推荐失败'
      });
    }
  }

  /**
   * 创建训练计划
   */
  async createPlan(req: Request, res: Response) {
    try {
      const {
        childId,
        assessmentReportId,
        title,
        description,
        targetAbilities,
        activityIds,
        durationDays,
        difficulty,
        preferences
      } = req.body;

      const userId = (req as any).user.id;

      console.log('📝 创建训练计划...', { userId, childId, title });

      // 验证必需参数
      if (!childId || !title || !targetAbilities || !activityIds) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数'
        });
      }

      // 创建训练计划
      const plan = await TrainingPlan.create({
        userId,
        childId,
        assessmentReportId,
        title,
        description,
        targetAbilities,
        activityIds,
        durationDays,
        difficulty,
        startDate: new Date(),
        aiRecommendations: `基于您的需求，我们为您定制了${title}训练计划`,
        totalActivities: activityIds.length,
        completedActivities: 0,
        progress: 0,
        preferences: preferences || {}
      });

      // 创建初始成就记录
      await this.initializeAchievements(childId, plan.id);

      console.log('✅ 训练计划创建成功:', plan.id);

      res.status(201).json({
        success: true,
        data: plan
      });

    } catch (error) {
      console.error('❌ 创建训练计划失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建训练计划失败'
      });
    }
  }

  /**
   * 获取训练计划详情
   */
  async getPlanById(req: Request, res: Response) {
    try {
      const { planId } = req.params;
      const userId = (req as any).user.id;

      const plan = await TrainingPlan.findOne({
        where: {
          id: planId,
          userId
        }
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: '训练计划不存在'
        });
      }

      // 获取计划关联的活动详情
      const activityIds = (plan as any).activityIds || [];
      const activities = await TrainingActivity.findAll({
        where: {
          id: activityIds as number[]
        }
      });

      // 获取训练记录
      const records = await TrainingRecord.findAll({
        where: {
          planId: (plan as any).id
        },
        order: [['startTime', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          plan: (plan as any).toJSON(),
          activities: activities,
          records: records
        }
      });

    } catch (error) {
      console.error('❌ 获取训练计划失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取训练计划失败'
      });
    }
  }

  /**
   * 获取训练计划列表
   */
  async getPlans(req: Request, res: Response) {
    try {
      const { childId, status, page = 1, pageSize = 10 } = req.query;
      const userId = (req as any).user.id;

      const whereCondition: any = { userId };

      if (childId) whereCondition.childId = childId;
      if (status) whereCondition.status = status;

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows } = await TrainingPlan.findAndCountAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        offset,
        limit
      });

      res.json({
        success: true,
        data: {
          plans: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize))
        }
      });

    } catch (error) {
      console.error('❌ 获取训练计划列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取训练计划列表失败'
      });
    }
  }

  /**
   * 更新训练计划
   */
  async updatePlan(req: Request, res: Response) {
    try {
      const { planId } = req.params;
      const { status, activities, progress } = req.body;
      const userId = (req as any).user.id;

      const plan = await TrainingPlan.findOne({
        where: {
          id: planId,
          userId
        }
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: '训练计划不存在'
        });
      }

      // 更新字段
      if (status) (plan as any).set('status', status);
      if (activities) (plan as any).set('activityIds', activities);
      if (progress !== undefined) (plan as any).set('progress', progress);

      // 如果有活动更新，计算完成情况
      if (activities && Array.isArray(activities)) {
        const completedCount = activities.length;
        (plan as any).set('completedActivities', completedCount);
        (plan as any).set('progress', Math.round((completedCount / (plan as any).get('totalActivities')) * 100));
      }

      await (plan as any).save();

      res.json({
        success: true,
        data: plan
      });

    } catch (error) {
      console.error('❌ 更新训练计划失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新训练计划失败'
      });
    }
  }

  /**
   * 获取今日训练任务
   */
  async getDailyTasks(req: Request, res: Response) {
    try {
      const { childId, date } = req.query;
      const userId = (req as any).user.id;

      if (!childId) {
        return res.status(400).json({
          success: false,
          message: '孩子ID不能为空'
        });
      }

      // 获取活跃的训练计划
      const activePlans = await TrainingPlan.findAll({
        where: {
          userId,
          childId: Number(childId)}
      });

      if (activePlans.length === 0) {
        return res.json({
          success: true,
          data: {
            date: date || new Date().toISOString().split('T')[0],
            tasks: [],
            progress: {
              completedTasks: 0,
              totalTasks: 0,
              estimatedTimeRemaining: 0
            }
          }
        });
      }

      // 获取今日任务
      const today = date ? new Date(date as string) : new Date();
      const todayStr = today.toISOString().split('T')[0];

      const allActivities = [];
      for (const plan of activePlans) {
        const activities = await TrainingActivity.findAll({
          where: {
            id: plan.get('activityIds') as number[]
          }
        });

        allActivities.push(...activities.map(activity => ({
          ...activity.toJSON(),
          planId: plan.id,
          planTitle: plan.get('title')
        })));
      }

      // 获取今日已完成记录
      const completedRecords = await TrainingRecord.findAll({
        where: {
          childId: Number(childId),
          completionTime: {
            [Op.gte]: new Date(todayStr + ' 00:00:00'),
            [Op.lt]: new Date(todayStr + ' 23:59:59')
          }
        }
      });

      const completedActivityIds = completedRecords.map(r => r.activityId);
      const pendingTasks = allActivities.filter(task => !completedActivityIds.includes(task.id));

      // 计算进度
      const estimatedTimeRemaining = pendingTasks.reduce((sum, task) => sum + (task.estimatedDuration || 15), 0);

      res.json({
        success: true,
        data: {
          date: todayStr,
          tasks: pendingTasks.slice(0, 5), // 最多返回5个任务
          progress: {
            completedTasks: completedRecords.length,
            totalTasks: allActivities.length,
            estimatedTimeRemaining
          }
        }
      });

    } catch (error) {
      console.error('❌ 获取今日训练任务失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取今日训练任务失败'
      });
    }
  }

  /**
   * 获取训练活动列表
   */
  async getActivities(req: Request, res: Response) {
    try {
      const { activityType, childAge, difficulty, page = 1, pageSize = 20 } = req.query;

      const whereCondition: any = { isActive: true };

      if (activityType) whereCondition.activityType = activityType;
      if (childAge) {
        whereCondition[Op.and] = [
          { targetAgeMin: { [Op.lte]: childAge } },
          { targetAgeMax: { [Op.gte]: childAge } }
        ];
      }
      if (difficulty) whereCondition.difficultyLevel = difficulty;

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows } = await TrainingActivity.findAndCountAll({
        where: whereCondition,
        order: [['difficultyLevel', 'ASC'], ['createdAt', 'DESC']],
        offset,
        limit
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize))
        }
      });

    } catch (error) {
      console.error('❌ 获取训练活动列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取训练活动列表失败'
      });
    }
  }

  /**
   * 获取训练活动详情
   */
  async getActivityById(req: Request, res: Response) {
    try {
      const { activityId } = req.params;

      const activity = await TrainingActivity.findByPk(activityId);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '训练活动不存在'
        });
      }

      res.json({
        success: true,
        data: activity
      });

    } catch (error) {
      console.error('❌ 获取训练活动详情失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取训练活动详情失败'
      });
    }
  }

  /**
   * 开始训练活动
   */
  async startActivity(req: Request, res: Response) {
    try {
      const { planId, activityId, childId } = req.body;
      const userId = (req as any).user.id;

      // 验证参数
      if (!planId || !activityId || !childId) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数'
        });
      }

      // 验证计划和权限
      const plan = await TrainingPlan.findOne({
        where: {
          id: planId,
          userId,
          childId
        }
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: '训练计划不存在或无权限'
        });
      }

      // 获取活动详情
      const activity = await TrainingActivity.findByPk(activityId);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '训练活动不存在'
        });
      }

      // 生成会话ID和游戏Key
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const gameKey = `game_${activity.gameId}_${Date.now()}`;

      // 创建训练记录（开始状态）
      const record = await TrainingRecord.create({
        planId,
        activityId,
        childId
        // sessionId removed - not in schema
      });

      res.json({
        success: true,
        data: {
          sessionId: record.id,
          gameKey,
          instructions: (activity as any).get('trainingTips'),
          activity: (activity as any).toJSON(),
          recordId: record.id
        }
      });

    } catch (error) {
      console.error('❌ 开始训练活动失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '开始训练活动失败'
      });
    }
  }

  /**
   * 完成训练活动
   */
  async completeActivity(req: Request, res: Response) {
    try {
      const {
        planId,
        activityId,
        childId,
        gameRecordId,
        durationSeconds,
        score,
        accuracy,
        progressData,
        parentNotes
      } = req.body;

      const userId = (req as any).user.id;

      console.log('🎯 完成训练活动...', { planId, activityId, childId });

      // 验证参数
      if (!planId || !activityId || !childId || !durationSeconds) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数'
        });
      }

      // 验证权限
      const plan = await TrainingPlan.findOne({
        where: {
          id: planId,
          userId,
          childId
        }
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: '训练计划不存在或无权限'
        });
      }

      // 查找进行中的训练记录
      const record = await TrainingRecord.findOne({
        where: {
          planId,
          activityId,
          childId},
        order: [['startTime', 'DESC']]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '未找到进行中的训练记录'
        });
      }

      // 生成AI反馈
      const aiFeedback = await this.generateAIFeedback(
        activityId,
        score,
        accuracy,
        durationSeconds
      );

      // 评估表现等级
      const performanceRating = this.evaluatePerformance(score || 0, accuracy || 0);

      // 更新训练记录
      await record.update({
        gameRecordId,
        durationSeconds,
        score,
        accuracy,
        performanceRating: performanceRating || 'average',
        parentNotes,
        aiFeedback,
        completionTime: new Date()
      });

      // 检查和更新成就
      const achievements = await this.checkAndUpdateAchievements(childId, planId, record);

      // 更新计划进度
      await this.updatePlanProgress(planId);

      console.log('✅ 训练活动完成:', record.id);

      res.json({
        success: true,
        data: {
          recordId: record.id,
          feedback: aiFeedback,
          achievements,
          performanceRating
        }
      });

    } catch (error) {
      console.error('❌ 完成训练活动失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '完成训练活动失败'
      });
    }
  }

  /**
   * 获取训练进度统计
   */
  async getProgress(req: Request, res: Response) {
    try {
      const { childId, planId, period = 'month' } = req.query;
      const userId = (req as any).user.id;

      if (!childId) {
        return res.status(400).json({
          success: false,
          message: '孩子ID不能为空'
        });
      }

      // 获取进度数据
      const progress = await TrainingService.getTrainingProgress(
        parseInt(childId as string),
        planId ? parseInt(planId as string) : undefined,
        period as 'week' | 'month' | 'quarter'
      );

      res.json({
        success: true,
        data: progress
      });

    } catch (error) {
      console.error('❌ 获取训练进度失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取训练进度失败'
      });
    }
  }

  /**
   * 获取成就列表
   */
  async getAchievements(req: Request, res: Response) {
    try {
      const { childId, isEarned } = req.query;

      if (!childId) {
        return res.status(400).json({
          success: false,
          message: '孩子ID不能为空'
        });
      }

      const whereCondition: any = { childId };
      if (isEarned !== undefined) {
        whereCondition.isEarned = isEarned === 'true';
      }

      const achievements = await TrainingAchievement.findAll({
        where: whereCondition,
        order: [['level', 'ASC'], ['createdAt', 'DESC']]
      });

      // 计算总积分
      const totalPoints = achievements
        .filter(a => a.isEarned)
        .reduce((sum, a) => sum + a.pointsAwarded, 0);

      res.json({
        success: true,
        data: {
          achievements,
          totalPoints
        }
      });

    } catch (error) {
      console.error('❌ 获取成就列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取成就列表失败'
      });
    }
  }

  /**
   * 获取训练报告
   */
  async getTrainingReport(req: Request, res: Response) {
    try {
      const { planId } = req.params;
      const userId = (req as any).user.id;

      // 获取训练计划
      const plan = await TrainingPlan.findOne({
        where: {
          id: planId,
          userId
        }
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: '训练计划不存在'
        });
      }

      // 获取训练记录
      const records = await TrainingRecord.findAll({
        where: {
          planId},
        include: [
          {
            model: TrainingActivity,
            as: 'activity'
          }
        ],
        order: [['completionTime', 'ASC']]
      });

      // 计算进度统计
      const progress = await TrainingService.getTrainingProgress(
        (plan as any).get('childId'),
        parseInt(planId)
      );

      // 生成建议
      const recommendations = await this.generateReportRecommendations(plan as any, records);
      const nextSteps = await this.generateNextSteps(plan as any, progress);

      res.json({
        success: true,
        data: {
          planInfo: (plan as any).toJSON(),
          progress,
          completedSessions: records.length,
          averageScore: records.reduce((sum, r) => sum + (r.score || 0), 0) / records.length,
          recommendations,
          nextSteps
        }
      });

    } catch (error) {
      console.error('❌ 获取训练报告失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取训练报告失败'
      });
    }
  }

  // === 私有辅助方法 ===

  /**
   * 初始化成就记录
   */
  private async initializeAchievements(childId: number, planId: number) {
    // 这里可以根据需要创建默认的成就记录
    // 具体实现取决于成就系统设计
    console.log('🏆 初始化成就记录...', { childId, planId });
  }

  /**
   * 生成AI反馈
   */
  private async generateAIFeedback(
    activityId: number,
    score?: number,
    accuracy?: number,
    duration?: number
  ): Promise<string> {
    // 这里可以集成真实的AI服务
    const feedbacks = [
      '表现非常棒！继续保持这样的专注度。',
      '完成得很好！注意观察细节会有更好的表现。',
      '不错的开始！多练习会更熟练。',
      '做得好！下次可以尝试提高速度。'
    ];

    if (score && score >= 90) {
      return '🌟 完美的表现！您已经掌握了这个技能！';
    } else if (score && score >= 70) {
      return feedbacks[0];
    } else if (score && score >= 50) {
      return feedbacks[1];
    } else {
      return feedbacks[2];
    }
  }

  /**
   * 评估表现等级
   */
  private evaluatePerformance(score: number, accuracy: number): 'excellent' | 'good' | 'average' | 'needs_improvement' {
    const avgScore = (score + (accuracy * 100)) / 2;

    if (avgScore >= 90) return 'excellent';
    if (avgScore >= 75) return 'good';
    if (avgScore >= 60) return 'average';
    return 'needs_improvement';
  }

  /**
   * 检查和更新成就
   */
  private async checkAndUpdateAchievements(
    childId: number,
    planId: number,
    record: TrainingRecord
  ): Promise<TrainingAchievement[]> {
    const achievements: TrainingAchievement[] = [];

    try {
      // 检查首次完成成就
      const firstTimeAchievement = await TrainingAchievement.findOne({
        where: {
          childId,
          achievementType: 'completion',
          achievementName: '初次尝试'
        }
      });

      if (!firstTimeAchievement) {
        const achievement = await TrainingAchievement.create({
          childId,
          achievementType: 'completion',
          achievementName: '初次尝试',
          achievementDescription: '完成第一个训练活动',
          badgeIcon: '🎯',
          badgeColor: '#90EE90',
          pointsAwarded: 5,
          level: 1,
          criteria: { requiredCount: 1 },
          maxProgress: 1,
          progress: 1,
          isEarned: true,
          earnedAt: new Date(),
          tags: ['completion', 'first']
        });
        achievements.push(achievement);
      }

      // 检查连续训练成就
      // 检查完美表现成就
      if (record.score && record.score >= 90) {
        const perfectAchievement = await TrainingAchievement.findOne({
          where: {
            childId,
            achievementType: 'mastery',
            achievementName: '完美表现'
          }
        });

        if (!perfectAchievement) {
          const achievement = await TrainingAchievement.create({
            childId,
            achievementType: 'mastery',
            achievementName: '完美表现',
            achievementDescription: '训练得分达到90分以上',
            badgeIcon: '💎',
            badgeColor: '#F0E68C',
            pointsAwarded: 40,
            level: 3,
            criteria: { masteryScore: 90 },
            maxProgress: 100,
            progress: 100,
            isEarned: true,
            earnedAt: new Date(),
            tags: ['mastery', 'excellent']
          });
          achievements.push(achievement);
        }
      }

    } catch (error) {
      console.error('❌ 检查成就失败:', error);
    }

    return achievements;
  }

  /**
   * 更新计划进度
   */
  private async updatePlanProgress(planId: number) {
    try {
      const plan = await TrainingPlan.findByPk(planId);
      if (!plan) return;

      const completedRecords = await TrainingRecord.count({
        where: {
          planId}
      });

      const totalActivities = plan.get('totalActivities');
      const progress = Math.round((completedRecords / totalActivities) * 100);

      await plan.update({
        completedActivities: completedRecords,
        progress
      });

      // 如果完成所有活动，更新状态为已完成
      if (completedRecords >= totalActivities) {
        await plan.update({});
      }

    } catch (error) {
      console.error('❌ 更新计划进度失败:', error);
    }
  }

  /**
   * 生成报告建议
   */
  private async generateReportRecommendations(
    plan: TrainingPlan,
    records: TrainingRecord[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    const avgScore = records.reduce((sum, r) => sum + (r.score || 0), 0) / records.length;

    if (avgScore >= 80) {
      recommendations.push('孩子的表现非常出色，可以尝试更高难度的训练');
    } else if (avgScore >= 60) {
      recommendations.push('孩子的进步明显，继续保持当前的训练节奏');
    } else {
      recommendations.push('建议增加基础练习，循序渐进提升能力');
    }

    recommendations.push('定期进行训练，保持学习的连续性');
    recommendations.push('关注孩子在训练中的兴趣点，因材施教');

    return recommendations;
  }

  /**
   * 生成下一步建议
   */
  private async generateNextSteps(
    plan: TrainingPlan,
    progress: any
  ): Promise<string[]> {
    const nextSteps: string[] = [];

    const progressRate = plan.get('progress');

    if (progressRate >= 80) {
      nextSteps.push('当前计划即将完成，可以开始制定新的训练目标');
    } else if (progressRate >= 50) {
      nextSteps.push('继续保持训练节奏，重点提升薄弱环节');
    } else {
      nextSteps.push('确保每日训练时间，培养良好的学习习惯');
    }

    nextSteps.push('结合日常生活，在游戏中巩固训练效果');
    nextSteps.push('定期评估训练效果，调整训练方案');

    return nextSteps;
  }
}

export default new TrainingController();