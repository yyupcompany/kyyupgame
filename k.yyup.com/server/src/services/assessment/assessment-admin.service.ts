import { AssessmentConfig } from '../../models/assessment-config.model';
import { AssessmentQuestion } from '../../models/assessment-question.model';
import { PhysicalTrainingItem } from '../../models/physical-training-item.model';
import { Op } from 'sequelize';

export class AssessmentAdminService {
  
  async getConfigs(options: any = {}) {
    const { page = 1, pageSize = 20, status, keyword, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    const where: any = {};
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await AssessmentConfig.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [[sortBy, sortOrder]]
    });

    return {
      configs: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize))
    };
  }

  async getStats() {
    const configCount = await AssessmentConfig.count();
    const questionCount = await AssessmentQuestion.count();
    const physicalItemCount = await PhysicalTrainingItem.count();

    const dimensionStats: any = {};
    const dimensions = ['attention', 'memory', 'logic', 'language', 'motor', 'social'];
    for (const dim of dimensions) {
      dimensionStats[dim] = await AssessmentQuestion.count({ where: { dimension: dim } });
    }

    return {
      totalConfigs: configCount,
      totalQuestions: questionCount,
      totalPhysicalItems: physicalItemCount,
      dimensionCounts: dimensionStats
    };
  }

  async getQuestions(options: any = {}) {
    const { page = 1, pageSize = 20, configId, dimension, ageGroup, questionType, status, keyword, sortBy = 'sortOrder', sortOrder = 'ASC' } = options;
    const where: any = {};
    if (configId) where.configId = parseInt(configId);
    if (dimension) where.dimension = dimension;
    if (ageGroup) where.ageGroup = ageGroup;
    if (questionType) where.questionType = questionType;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await AssessmentQuestion.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [[sortBy, sortOrder]]
    });

    return {
      questions: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize))
    };
  }

  async getPhysicalItems(options: any = {}) {
    const { page = 1, pageSize = 20, category, difficulty, ageRange, status, keyword, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    const where: any = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (ageRange) where.ageRange = ageRange;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { instructions: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await PhysicalTrainingItem.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [[sortBy, sortOrder]]
    });

    const categoryCounts: any = {};
    const categories = ['balance', 'strength', 'flexibility', 'coordination', 'endurance'];
    for (const cat of categories) {
      categoryCounts[cat] = await PhysicalTrainingItem.count({ where: { category: cat } });
    }

    return {
      items: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize)),
      statistics: {
        totalCount: count,
        categoryCounts
      }
    };
  }
}
