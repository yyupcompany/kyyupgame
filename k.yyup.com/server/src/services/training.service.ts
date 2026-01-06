import { TrainingActivity } from '../models/training-activity.model';
import { TrainingPlan } from '../models/training-plan.model';
import { TrainingRecord } from '../models/training-record.model';
import { TrainingAchievement } from '../models/training-achievement.model';
import { AssessmentReport } from '../models/assessment-report.model';
import { Op } from 'sequelize';
import { sequelize } from '../init';

/**
 * 能力缺口接口
 */
interface AbilityGap {
  dimension: string;
  currentScore: number;
  targetScore: number;
  priority: number;
  improvementNeeded: number;
}

/**
 * 训练推荐接口
 */
interface TrainingRecommendation {
  plan: TrainingPlan;
  reasoning: string;
  confidence: number;
  alternativePlans?: TrainingPlan[];
}

/**
 * 训练进度接口
 */
interface TrainingProgress {
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  improvementRate: number;
  abilityProgress: {
    [key: string]: number;
  };
  weeklyTrend: Array<{
    date: string;
    sessions: number;
    minutes: number;
    averageScore: number;
  }>;
}

/**
 * 训练中心服务类
 */
export class TrainingService {
  /**
   * 基于测评结果生成训练推荐
   */
  async generateTrainingRecommendations(
    childId: number,
    assessmentReportId?: number,
    preferences?: {
      interests?: string[];
      difficulty?: 'easy' | 'medium' | 'hard';
      dailyTime?: number;
      focusAreas?: string[];
    }
  ): Promise<TrainingRecommendation[]> {
    console.log('🎯 生成训练推荐...', { childId, assessmentReportId, preferences });

    try {
      // 如果有测评报告，基于测评结果推荐
      if (assessmentReportId) {
        const assessmentReport = await AssessmentReport.findByPk(assessmentReportId);
        if (assessmentReport) {
          return await this.recommendByAssessment(childId, assessmentReport, preferences);
        }
      }

      // 否则基于年龄和偏好推荐
      const childAge = await this.getChildAge(childId);
      return await this.recommendByAgeAndPreferences(childId, childAge, preferences);

    } catch (error) {
      console.error('❌ 生成训练推荐失败:', error);
      throw new Error(`生成训练推荐失败: ${error.message}`);
    }
  }

  /**
   * 基于测评结果推荐训练计划
   */
  private async recommendByAssessment(
    childId: number,
    assessmentReport: AssessmentReport,
    preferences?: any
  ): Promise<TrainingRecommendation[]> {
    const content = assessmentReport.get('content') as any;
    const gaps = this.identifyAbilityGaps(content);
    const childAge = await this.getChildAge(childId);

    const recommendations: TrainingRecommendation[] = [];

    // 为每个能力缺口生成专项训练计划
    for (const gap of gaps) {
      const suitableActivities = await this.findSuitableActivities(
        gap.dimension,
        childAge,
        gap.currentScore,
        preferences
      );

      if (suitableActivities.length > 0) {
        const plan = this.generateTrainingPlan(
          childId,
          assessmentReport.id,
          gap,
          suitableActivities,
          preferences
        );

        recommendations.push({
          plan,
          reasoning: this.generateReasoning(gap, suitableActivities),
          confidence: this.calculateConfidence(gap, suitableActivities)
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 基于年龄和偏好推荐训练计划
   */
  private async recommendByAgeAndPreferences(
    childId: number,
    childAge: number,
    preferences?: any
  ): Promise<TrainingRecommendation[]> {
    const activities = await TrainingActivity.findAll({
      where: {
        targetAgeMin: { [Op.lte]: childAge },
        targetAgeMax: { [Op.gte]: childAge },
        isActive: true
      }
    });

    if (activities.length === 0) {
      throw new Error('没有找到适合的训练活动');
    }

    // 按类型分组
    const groupedActivities = this.groupActivitiesByType(activities);
    const recommendations: TrainingRecommendation[] = [];

    Object.entries(groupedActivities).forEach(([type, typeActivities]) => {
      if (typeActivities.length > 0) {
        const plan = this.generateBasicTrainingPlan(
          childId,
          type,
          typeActivities,
          preferences
        );

        recommendations.push({
          plan,
          reasoning: `基于${childAge}岁儿童的${this.getTypeName(type)}发展特点推荐`,
          confidence: 0.7
        });
      }
    });

    return recommendations;
  }

  /**
   * 识别能力缺口
   */
  private identifyAbilityGaps(assessmentContent: any): AbilityGap[] {
    const gaps: AbilityGap[] = [];
    const threshold = 60; // 60分以下认为需要提升

    // 从improvements字段获取需要提升的维度
    const improvements = assessmentContent.improvements || [];

    // 从dimensions字段分析具体得分
    const dimensions = assessmentContent.dimensions || {};

    // 合并improvements和dimensions数据
    const allDimensions = new Set([...improvements, ...Object.keys(dimensions)]);

    allDimensions.forEach(dimension => {
      let currentScore = 0;
      let maxScore = 100;

      // 尝试从dimensions获取分数
      if (dimensions[dimension]) {
        const dimensionData = dimensions[dimension];
        currentScore = dimensionData.score || 0;
        maxScore = dimensionData.maxScore || 100;
      }

      // 计算百分比分数
      const percentageScore = maxScore > 0 ? (currentScore / maxScore) * 100 : 0;

      if (percentageScore < threshold) {
        gaps.push({
          dimension,
          currentScore: percentageScore,
          targetScore: Math.min(percentageScore + 20, 100),
          priority: this.calculatePriority(dimension, percentageScore),
          improvementNeeded: Math.max(20, threshold - percentageScore)
        });
      }
    });

    return gaps.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 查找合适的训练活动
   */
  private async findSuitableActivities(
    dimension: string,
    childAge: number,
    currentScore: number,
    preferences?: any
  ): Promise<TrainingActivity[]> {
    const activityType = this.mapDimensionToActivityType(dimension);
    const targetDifficulty = this.calculateOptimalDifficulty(currentScore);

    const activities = await TrainingActivity.findAll({
      where: {
        activityType,
        targetAgeMin: { [Op.lte]: childAge },
        targetAgeMax: { [Op.gte]: childAge },
        difficultyLevel: {
          [Op.between]: [targetDifficulty - 1, targetDifficulty + 1]
        },
        isActive: true
      },
      limit: 10,
      order: [
        ['difficultyLevel', 'ASC'],
        ['estimatedDuration', 'ASC']
      ]
    });

    // 根据偏好过滤
    if (preferences?.focusAreas?.length > 0) {
      return activities.filter(activity =>
        preferences.focusAreas.includes(activity.activityType)
      );
    }

    return activities;
  }

  /**
   * 生成训练计划
   */
  private generateTrainingPlan(
    childId: number,
    assessmentReportId: number,
    gap: AbilityGap,
    activities: TrainingActivity[],
    preferences?: any
  ): TrainingPlan {
    const selectedActivities = activities.slice(0, 5).map(a => a.id);
    const difficulty = preferences?.difficulty || this.determineDifficulty(gap.currentScore);

    return TrainingPlan.build({
      userId: 1, // TODO: 从请求中获取真实用户ID
      childId,
      assessmentReportId,
      title: `${this.getDimensionName(gap.dimension)}专项训练`,
      description: `针对${this.getDimensionName(gap.dimension)}能力的系统化训练计划，目标提升${gap.improvementNeeded.toFixed(1)}%`,
      targetAbilities: [gap.dimension],
      activityIds: selectedActivities,
      durationDays: preferences?.duration || 21,
      difficulty,
      status: 'active',
      startDate: new Date(),
      aiRecommendations: `基于测评结果，您的孩子在${this.getDimensionName(gap.dimension)}方面需要重点关注。当前水平${gap.currentScore.toFixed(1)}%，目标达到${gap.targetScore.toFixed(1)}%`,
      totalActivities: selectedActivities.length,
      completedActivities: 0,
      progress: 0,
      preferences: preferences || {}
    });
  }

  /**
   * 生成基础训练计划
   */
  private generateBasicTrainingPlan(
    childId: number,
    activityType: string,
    activities: TrainingActivity[],
    preferences?: any
  ): TrainingPlan {
    const selectedActivities = activities.slice(0, 5).map(a => a.id);

    return TrainingPlan.build({
      userId: 1,
      childId,
      title: `${this.getTypeName(activityType)}综合训练`,
      description: `适合${activities[0]?.targetAgeMin || 3}-${activities[0]?.targetAgeMax || 6}岁儿童的${this.getTypeName(activityType)}能力训练`,
      targetAbilities: [activityType],
      activityIds: selectedActivities,
      durationDays: preferences?.duration || 30,
      difficulty: preferences?.difficulty || 'medium',
      status: 'active',
      startDate: new Date(),
      totalActivities: selectedActivities.length,
      completedActivities: 0,
      progress: 0,
      preferences: preferences || {}
    });
  }

  /**
   * 计算优先级
   */
  private calculatePriority(dimension: string, score: number): number {
    const priorityMap: Record<string, number> = {
      'attention': 1, // 专注力最优先
      'memory': 1,   // 记忆力最优先
      'language': 2,  // 语言能力次优先
      'motor': 3,     // 动作能力
      'social': 3,    // 社交能力
      'logic': 4      // 逻辑思维最后
    };

    const basePriority = priorityMap[dimension] || 4;
    const priorityMultiplier = Math.max(0.1, (60 - score) / 60); // 分数越低，优先级越高

    return basePriority * priorityMultiplier;
  }

  /**
   * 计算最优难度
   */
  private calculateOptimalDifficulty(currentScore: number): number {
    if (currentScore >= 80) return 4; // 高分用高难度
    if (currentScore >= 60) return 3; // 中等用中等难度
    if (currentScore >= 40) return 2; // 中低分用较低难度
    return 1; // 低分用简单难度
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(gap: AbilityGap, activities: TrainingActivity[]): number {
    const activityMatch = activities.length;
    const gapSize = gap.improvementNeeded;

    // 活动匹配度越高，置信度越高
    const activityScore = Math.min(activityMatch / 5, 1) * 0.6;

    // 缺口越大，推荐的必要性越强
    const gapScore = Math.min(gapSize / 50, 1) * 0.4;

    return activityScore + gapScore;
  }

  /**
   * 生成推荐理由
   */
  private generateReasoning(gap: AbilityGap, activities: TrainingActivity[]): string {
    const dimensionName = this.getDimensionName(gap.dimension);
    const activityNames = activities.slice(0, 3).map(a => a.activityName).join('、');

    return `测评显示孩子在${dimensionName}方面需要重点提升。我们推荐了${activityNames}等${activities.length}个训练活动，这些活动专门针对${dimensionName}能力设计，可以有效帮助提升相关技能。`;
  }

  /**
   * 获取孩子年龄
   */
  private async getChildAge(childId: number): Promise<number> {
    // TODO: 从孩子表获取真实年龄
    return 4; // 临时返回默认年龄
  }

  /**
   * 按类型分组活动
   */
  private groupActivitiesByType(activities: TrainingActivity[]): Record<string, TrainingActivity[]> {
    const grouped: Record<string, TrainingActivity[]> = {};

    activities.forEach(activity => {
      if (!grouped[activity.activityType]) {
        grouped[activity.activityType] = [];
      }
      grouped[activity.activityType].push(activity);
    });

    return grouped;
  }

  /**
   * 维度映射到活动类型
   */
  private mapDimensionToActivityType(dimension: string): string {
    const mapping: Record<string, string> = {
      'attention': 'cognitive',
      'memory': 'cognitive',
      'logic': 'cognitive',
      'language': 'language',
      'social': 'social',
      'motor': 'motor'
    };

    return mapping[dimension] || 'cognitive';
  }

  /**
   * 获取维度名称
   */
  private getDimensionName(dimension: string): string {
    const names: Record<string, string> = {
      'attention': '专注力',
      'memory': '记忆力',
      'logic': '逻辑思维',
      'language': '语言能力',
      'social': '社交能力',
      'motor': '运动能力'
    };

    return names[dimension] || dimension;
  }

  /**
   * 获取活动类型名称
   */
  private getTypeName(type: string): string {
    const names: Record<string, string> = {
      'cognitive': '认知能力',
      'motor': '运动能力',
      'language': '语言能力',
      'social': '社交能力'
    };

    return names[type] || type;
  }

  /**
   * 确定难度等级
   */
  private determineDifficulty(score: number): 'easy' | 'medium' | 'hard' {
    if (score >= 70) return 'hard';
    if (score >= 40) return 'medium';
    return 'easy';
  }

  /**
   * 获取训练进度统计
   */
  async getTrainingProgress(
    childId: number,
    planId?: number,
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<TrainingProgress> {
    const whereCondition: any = {
      childId
    };

    if (planId) {
      whereCondition.planId = planId;
    }

    // 计算时间范围
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    whereCondition.completionTime = {
      [Op.gte]: startDate
    };

    const records = await TrainingRecord.findAll({
      where: whereCondition,
      include: [
        {
          model: TrainingActivity,
          as: 'activity',
          attributes: ['activityType']
        }
      ],
      order: [['completionTime', 'ASC']]
    });

    // 计算统计数据
    const totalSessions = records.length;
    const totalMinutes = records.reduce((sum, record) => sum + record.durationSeconds, 0) / 60;
    const averageScore = records.reduce((sum, record) => sum + (record.score || 0), 0) / records.length;

    // 按类型统计进度
    const abilityProgress: Record<string, number> = {};
    records.forEach(record => {
      const type = (record as any).abilityType || 'cognitive';
      abilityProgress[type] = (abilityProgress[type] || 0) + 1;
    });

    // 计算周趋势
    const weeklyTrend = this.calculateWeeklyTrend(records);

    // 计算改进率（基于得分趋势）
    const improvementRate = this.calculateImprovementRate(records);

    return {
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      averageScore: Math.round(averageScore),
      improvementRate,
      abilityProgress,
      weeklyTrend
    };
  }

  /**
   * 计算周趋势
   */
  private calculateWeeklyTrend(records: TrainingRecord[]): Array<any> {
    const weeklyData: Record<string, any> = {};

    records.forEach(record => {
      const weekStart = this.getWeekStart(record.completionTime);

      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = {
          date: weekStart,
          sessions: 0,
          minutes: 0,
          totalScore: 0,
          count: 0
        };
      }

      weeklyData[weekStart].sessions++;
      weeklyData[weekStart].minutes += record.durationSeconds / 60;
      weeklyData[weekStart].totalScore += record.score || 0;
      weeklyData[weekStart].count++;
    });

    // 计算平均分并排序
    return Object.values(weeklyData).map(week => ({
      date: week.date,
      sessions: week.sessions,
      minutes: Math.round(week.minutes),
      averageScore: Math.round(week.totalScore / week.count)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * 计算改进率
   */
  private calculateImprovementRate(records: TrainingRecord[]): number {
    if (records.length < 2) return 0;

    const firstHalf = records.slice(0, Math.floor(records.length / 2));
    const secondHalf = records.slice(Math.floor(records.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, record) => sum + (record.score || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, record) => sum + (record.score || 0), 0) / secondHalf.length;

    if (firstHalfAvg === 0) return 0;

    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  }

  /**
   * 获取周开始日期
   */
  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }
}

export default new TrainingService();