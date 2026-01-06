import { Op } from 'sequelize';
import { ActivityEvaluation } from '../../models/activity-evaluation.model';
import { Activity } from '../../models/activity.model';
import { ActivityRegistration } from '../../models/activity-registration.model';
import { Parent } from '../../models/parent.model';
import { Teacher } from '../../models/teacher.model';
import { logger } from '../../utils/logger';

// 定义评分分布类型
interface RatingDistribution {
  [key: number]: number;
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

// 定义百分比分布类型
interface RatingPercentages {
  [key: string]: number;
}

// 定义满意度数据类型
interface SatisfactionData {
  totalRating: number;
  count: number;
  average: number;
}

// 定义月度满意度类型
interface MonthlySatisfaction {
  [key: string]: SatisfactionData;
}

// 定义活动类型满意度类型
interface ActivityTypeSatisfaction {
  [key: string]: SatisfactionData;
}

/**
 * 活动评价服务类
 * 
 * 提供活动评价相关的业务逻辑处理
 */
export class ActivityEvaluationService {
  /**
   * 创建活动评价
   * @param {Object} data - 评价数据
   * @param {number} userId - 创建用户ID
   * @returns {Promise<ActivityEvaluation>} 创建的评价对象
   */
  async createEvaluation(data: any, userId: number): Promise<ActivityEvaluation> {
    try {
      // 检查活动是否存在
      const activity = await Activity.findByPk(data.activityId);
      if (!activity) {
        throw new Error('活动不存在');
      }

      // 如果提供了报名ID，检查报名记录是否存在
      if (data.registrationId) {
        const registration = await ActivityRegistration.findByPk(data.registrationId);
        if (!registration) {
          throw new Error('报名记录不存在');
        }
        
        // 检查该报名记录是否已有评价
        const existingEvaluation = await ActivityEvaluation.findOne({
          where: { registrationId: data.registrationId }
        });
        
        if (existingEvaluation) {
          throw new Error('该报名记录已有评价，不能重复评价');
        }
      }

      // 创建评价记录
      return await ActivityEvaluation.create({
        ...data,
        evaluationTime: new Date(),
        status: 1, // 默认状态为已发布
        creatorId: userId,
        updaterId: userId
      });
    } catch (error: any) {
      logger.error(`创建活动评价失败: ${error.message}`, { userId, data });
      throw error;
    }
  }

  /**
   * 获取评价详情
   * @param {number} id - 评价ID
   * @returns {Promise<ActivityEvaluation>} 评价对象
   */
  async getEvaluationById(id: number): Promise<ActivityEvaluation> {
    try {
      const evaluation = await ActivityEvaluation.findByPk(id, {
        include: [
          { model: Activity, as: 'activity' },
          { model: ActivityRegistration, as: 'registration' },
          { model: Parent, as: 'parent' },
          { model: Teacher, as: 'teacher' }
        ]
      });
      
      if (!evaluation) {
        throw new Error('评价不存在');
      }
      
      return evaluation;
    } catch (error: any) {
      logger.error(`获取评价详情失败: ${error.message}`, { id });
      throw error;
    }
  }

  /**
   * 更新评价
   * @param {number} id - 评价ID
   * @param {Object} data - 更新数据
   * @param {number} userId - 更新用户ID
   * @returns {Promise<ActivityEvaluation>} 更新后的评价对象
   */
  async updateEvaluation(id: number, data: any, userId: number): Promise<ActivityEvaluation> {
    try {
      const evaluation = await ActivityEvaluation.findByPk(id);
      
      if (!evaluation) {
        throw new Error('评价不存在');
      }
      
      // 检查是否有权限更新
      if (evaluation.creatorId !== userId && !data.isAdmin) {
        throw new Error('无权限更新此评价');
      }
      
      // 更新评价
      await evaluation.update({
        ...data,
        updaterId: userId
      });
      
      return await this.getEvaluationById(id);
    } catch (error: any) {
      logger.error(`更新评价失败: ${error.message}`, { id, userId, data });
      throw error;
    }
  }

  /**
   * 删除评价
   * @param {number} id - 评价ID
   * @param {number} userId - 删除用户ID
   * @param {boolean} isAdmin - 是否为管理员
   * @returns {Promise<boolean>} 删除结果
   */
  async deleteEvaluation(id: number, userId: number, isAdmin: boolean = false): Promise<boolean> {
    try {
      const evaluation = await ActivityEvaluation.findByPk(id);
      
      if (!evaluation) {
        throw new Error('评价不存在');
      }
      
      // 检查是否有权限删除
      if (evaluation.creatorId !== userId && !isAdmin) {
        throw new Error('无权限删除此评价');
      }
      
      await evaluation.destroy();
      return true;
    } catch (error: any) {
      logger.error(`删除评价失败: ${error.message}`, { id, userId });
      throw error;
    }
  }

  /**
   * 回复评价
   * @param {number} id - 评价ID
   * @param {string} content - 回复内容
   * @param {number} userId - 回复用户ID
   * @returns {Promise<ActivityEvaluation>} 更新后的评价对象
   */
  async replyEvaluation(id: number, content: string, userId: number): Promise<ActivityEvaluation> {
    try {
      const evaluation = await ActivityEvaluation.findByPk(id);
      
      if (!evaluation) {
        throw new Error('评价不存在');
      }
      
      await evaluation.reply(content, userId);
      return await this.getEvaluationById(id);
    } catch (error: any) {
      logger.error(`回复评价失败: ${error.message}`, { id, userId });
      throw error;
    }
  }

  /**
   * 获取评价列表
   * @param {Object} query - 查询条件
   * @returns {Promise<{rows: ActivityEvaluation[], count: number}>} 评价列表和总数
   */
  async getEvaluations(query: any): Promise<{rows: ActivityEvaluation[], count: number}> {
    try {
      const {
        page = 1,
        limit = 10,
        activityId,
        parentId,
        teacherId,
        registrationId,
        evaluatorType,
        minRating,
        maxRating,
        status,
        isPublic,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = query;
      
      const offset = (page - 1) * limit;
      
      // 构建查询条件
      const where: any = {};
      
      if (activityId) where.activityId = activityId;
      if (parentId) where.parentId = parentId;
      if (teacherId) where.teacherId = teacherId;
      if (registrationId) where.registrationId = registrationId;
      if (evaluatorType) where.evaluatorType = evaluatorType;
      if (status) where.status = status;
      if (isPublic !== undefined) where.isPublic = isPublic;
      
      // 评分范围过滤
      if (minRating !== undefined || maxRating !== undefined) {
        where.overallRating = {};
        if (minRating !== undefined) where.overallRating[Op.gte] = minRating;
        if (maxRating !== undefined) where.overallRating[Op.lte] = maxRating;
      }
      
      // 日期范围过滤
      if (startDate || endDate) {
        where.evaluationTime = {};
        if (startDate) where.evaluationTime[Op.gte] = new Date(startDate);
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          where.evaluationTime[Op.lte] = endDateTime;
        }
      }
      
      // 执行查询
      const { rows, count } = await ActivityEvaluation.findAndCountAll({
        where,
        include: [
          { model: Activity, as: 'activity' },
          { model: ActivityRegistration, as: 'registration' }
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true
      });
      
      return { rows, count };
    } catch (error: any) {
      logger.error(`获取评价列表失败: ${error.message}`, { query });
      throw error;
    }
  }

  /**
   * 获取活动评价统计
   * @param {number} activityId - 活动ID
   * @returns {Promise<Object>} 统计结果
   */
  async getEvaluationStatistics(activityId: number): Promise<any> {
    try {
      // 检查活动是否存在
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        throw new Error('活动不存在');
      }
      
      // 获取所有评价
      const evaluations = await ActivityEvaluation.findAll({
        where: { activityId }
      });
      
      // 计算评分统计
      const totalCount = evaluations.length;
      let overallRatingSum = 0;
      let contentRatingSum = 0;
      let organizationRatingSum = 0;
      let environmentRatingSum = 0;
      let serviceRatingSum = 0;
      
      let contentRatingCount = 0;
      let organizationRatingCount = 0;
      let environmentRatingCount = 0;
      let serviceRatingCount = 0;
      
      // 评分分布
      const ratingDistribution: RatingDistribution = {
        5: 0, // 5星
        4: 0, // 4星
        3: 0, // 3星
        2: 0, // 2星
        1: 0  // 1星
      };
      
      evaluations.forEach(evaluation => {
        // 总体评分
        overallRatingSum += evaluation.overallRating;
        const rating = evaluation.overallRating;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
        }
        
        // 内容评分
        if (evaluation.contentRating !== null) {
          contentRatingSum += evaluation.contentRating;
          contentRatingCount++;
        }
        
        // 组织评分
        if (evaluation.organizationRating !== null) {
          organizationRatingSum += evaluation.organizationRating;
          organizationRatingCount++;
        }
        
        // 环境评分
        if (evaluation.environmentRating !== null) {
          environmentRatingSum += evaluation.environmentRating;
          environmentRatingCount++;
        }
        
        // 服务评分
        if (evaluation.serviceRating !== null) {
          serviceRatingSum += evaluation.serviceRating;
          serviceRatingCount++;
        }
      });
      
      // 计算平均分
      const averageOverallRating = totalCount > 0 ? Math.round((overallRatingSum / totalCount) * 10) / 10 : 0;
      const averageContentRating = contentRatingCount > 0 ? Math.round((contentRatingSum / contentRatingCount) * 10) / 10 : 0;
      const averageOrganizationRating = organizationRatingCount > 0 ? Math.round((organizationRatingSum / organizationRatingCount) * 10) / 10 : 0;
      const averageEnvironmentRating = environmentRatingCount > 0 ? Math.round((environmentRatingSum / environmentRatingCount) * 10) / 10 : 0;
      const averageServiceRating = serviceRatingCount > 0 ? Math.round((serviceRatingSum / serviceRatingCount) * 10) / 10 : 0;
      
      // 计算评分百分比分布
      const ratingPercentages: RatingPercentages = {};
      Object.keys(ratingDistribution).forEach(rating => {
        const ratingKey = rating as unknown as keyof RatingDistribution;
        ratingPercentages[rating] = totalCount > 0 
          ? Math.round((ratingDistribution[ratingKey] / totalCount) * 1000) / 10 
          : 0;
      });
      
      return {
        totalCount,
        averageRatings: {
          overall: averageOverallRating,
          content: averageContentRating,
          organization: averageOrganizationRating,
          environment: averageEnvironmentRating,
          service: averageServiceRating
        },
        ratingDistribution,
        ratingPercentages
      };
    } catch (error: any) {
      logger.error(`获取活动评价统计失败: ${error.message}`, { activityId });
      throw error;
    }
  }

  /**
   * 生成满意度报表
   * @param {Object} query - 查询条件
   * @returns {Promise<Object>} 满意度报表数据
   */
  async generateSatisfactionReport(query: any): Promise<any> {
    try {
      const {
        startDate,
        endDate,
        kindergartenId
      } = query;
      
      // 构建查询条件
      const where: any = {};
      
      // 日期范围过滤
      if (startDate || endDate) {
        where.evaluationTime = {};
        if (startDate) where.evaluationTime[Op.gte] = new Date(startDate);
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          where.evaluationTime[Op.lte] = endDateTime;
        }
      }
      
      // 如果提供了幼儿园ID，则需要关联活动表进行过滤
      const include = [
        { 
          model: Activity, 
          as: 'activity',
          where: kindergartenId ? { kindergartenId } : {}
        }
      ];
      
      // 获取所有符合条件的评价
      const evaluations = await ActivityEvaluation.findAll({
        where,
        include
      });
      
      // 按月统计满意度
      const monthlySatisfaction: MonthlySatisfaction = {};
      
      // 按活动类型统计满意度
      const activityTypeSatisfaction: ActivityTypeSatisfaction = {};
      
      // 处理每个评价
      for (const evaluation of evaluations) {
        // 确保活动数据已加载
        if (!evaluation.activity) {
          await evaluation.reload({ include: [{ model: Activity, as: 'activity' }] });
        }
        
        const activity = evaluation.activity;
        if (!activity) continue;
        
        // 按月统计
        const month = `${evaluation.evaluationTime.getFullYear()}-${String(evaluation.evaluationTime.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlySatisfaction[month]) {
          monthlySatisfaction[month] = {
            totalRating: 0,
            count: 0,
            average: 0
          };
        }
        monthlySatisfaction[month].totalRating += evaluation.overallRating;
        monthlySatisfaction[month].count += 1;
        monthlySatisfaction[month].average = Math.round((monthlySatisfaction[month].totalRating / monthlySatisfaction[month].count) * 10) / 10;
        
        // 按活动类型统计
        const activityType = activity.activityType;
        if (!activityTypeSatisfaction[activityType]) {
          activityTypeSatisfaction[activityType] = {
            totalRating: 0,
            count: 0,
            average: 0
          };
        }
        activityTypeSatisfaction[activityType].totalRating += evaluation.overallRating;
        activityTypeSatisfaction[activityType].count += 1;
        activityTypeSatisfaction[activityType].average = Math.round((activityTypeSatisfaction[activityType].totalRating / activityTypeSatisfaction[activityType].count) * 10) / 10;
      }
      
      // 计算总体满意度
      const totalCount = evaluations.length;
      const totalRating = evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0);
      const overallAverage = totalCount > 0 ? Math.round((totalRating / totalCount) * 10) / 10 : 0;
      
      // 计算评分分布
      const ratingDistribution: RatingDistribution = {
        5: 0, // 5星
        4: 0, // 4星
        3: 0, // 3星
        2: 0, // 2星
        1: 0  // 1星
      };
      
      evaluations.forEach(evaluation => {
        const rating = evaluation.overallRating;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
        }
      });
      
      return {
        overallSatisfaction: {
          average: overallAverage,
          totalCount
        },
        monthlySatisfaction,
        activityTypeSatisfaction,
        ratingDistribution
      };
    } catch (error: any) {
      logger.error(`生成满意度报表失败: ${error.message}`, { query });
      throw error;
    }
  }
} 

// 默认导出活动评价服务实例
export default new ActivityEvaluationService(); 