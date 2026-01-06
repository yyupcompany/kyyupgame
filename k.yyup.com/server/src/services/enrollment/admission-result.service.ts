/**
 * 录取结果服务
 */
import { Transaction, Op, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../../init';
import { AdmissionResult, AdmissionStatus, AdmissionType } from '../../models/admission-result.model';
import { EnrollmentApplication } from '../../models/enrollment-application.model';
import { ParentStudentRelation } from '../../models/parent-student-relation.model';
import { User } from '../../models/user.model';
import { Student } from '../../models/student.model';
import { EnrollmentPlan } from '../../models/enrollment-plan.model';
import { Class } from '../../models/class.model';
import { ApiError } from '../../utils/apiError';

// 分页工具函数
const getPagination = (page: number, size: number) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data: any[], count: number, page: number, limit: number) => {
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    totalItems,
    data,
    totalPages,
    currentPage,
  };
};

/**
 * 录取结果服务类
 */
export class AdmissionResultService {
  /**
   * 创建录取结果
   * @param resultData 录取结果数据
   * @param userId 当前用户ID
   * @returns 创建的录取结果
   */
  async createResult(resultData: InferCreationAttributes<AdmissionResult>, userId: number): Promise<AdmissionResult> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查报名申请是否存在
      const application = await EnrollmentApplication.findByPk(resultData.applicationId);
      if (!application) {
        throw new ApiError(404, '报名申请不存在');
      }
      
      // 检查是否已有录取结果
      const existingResult = await AdmissionResult.findOne({
        where: { applicationId: resultData.applicationId }
      });
      
      if (existingResult) {
        throw new ApiError(400, '该报名申请已有录取结果');
      }
      
      // 检查家长关系是否存在
      const parentRelation = await ParentStudentRelation.findByPk(resultData.parentId);
      if (!parentRelation) {
        throw new ApiError(404, '家长关系不存在');
      }
      
      // 检查招生计划是否存在
      const plan = await EnrollmentPlan.findByPk(resultData.planId);
      if (!plan) {
        throw new ApiError(404, '招生计划不存在');
      }
      
      // 如果有班级ID，检查班级是否存在
      if (resultData.classId) {
        const classEntity = await Class.findByPk(resultData.classId);
        if (!classEntity) {
          throw new ApiError(404, '班级不存在');
        }
      }
      
      // 创建录取结果
      const result = await AdmissionResult.create({
        ...resultData,
        createdBy: userId,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取录取结果详情
   * @param id 录取结果ID
   * @returns 录取结果详情
   */
  async getResultById(id: number): Promise<AdmissionResult> {
    const result = await AdmissionResult.findByPk(id, {
      include: [
        {
          model: EnrollmentApplication,
          as: 'application',
        },
        {
          model: ParentStudentRelation,
          as: 'parent',
          attributes: ['id'],
        },
        {
          model: EnrollmentPlan,
          as: 'plan',
        },
        {
          model: Class,
          as: 'class',
        },
        {
          model: User,
          as: 'creator',
        },
        {
          model: User,
          as: 'updater',
        },
      ],
    });
    
    if (!result) {
      throw new ApiError(404, '录取结果不存在');
    }
    
    return result;
  }
  
  /**
   * 更新录取结果
   * @param id 录取结果ID
   * @param resultData 录取结果数据
   * @param userId 当前用户ID
   * @returns 更新后的录取结果
   */
  async updateResult(id: number, resultData: Partial<InferCreationAttributes<AdmissionResult>>, userId: number): Promise<AdmissionResult> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查录取结果是否存在
      const result = await AdmissionResult.findByPk(id);
      if (!result) {
        throw new ApiError(404, '录取结果不存在');
      }
      
      // 如果更改了家长关系，检查家长关系是否存在
      if (resultData.parentId && resultData.parentId !== result.parentId) {
        const parentRelation = await ParentStudentRelation.findByPk(resultData.parentId);
        if (!parentRelation) {
          throw new ApiError(404, '家长关系不存在');
        }
      }
      
      // 如果更改了招生计划，检查招生计划是否存在
      if (resultData.planId && resultData.planId !== result.planId) {
        const plan = await EnrollmentPlan.findByPk(resultData.planId);
        if (!plan) {
          throw new ApiError(404, '招生计划不存在');
        }
      }
      
      // 如果更改了班级，检查班级是否存在
      if (resultData.classId && resultData.classId !== result.classId) {
        const classEntity = await Class.findByPk(resultData.classId);
        if (!classEntity) {
          throw new ApiError(404, '班级不存在');
        }
      }
      
      // 更新录取结果
      await result.update({
        ...resultData,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return this.getResultById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 删除录取结果
   * @param id 录取结果ID
   * @returns 是否删除成功
   */
  async deleteResult(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查录取结果是否存在
      const result = await AdmissionResult.findByPk(id);
      if (!result) {
        throw new ApiError(404, '录取结果不存在');
      }
      
      // 删除录取结果
      await result.destroy({ transaction });
      
      await transaction.commit();
      
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取录取结果列表
   * @param filters 过滤条件
   * @param page 页码
   * @param size 每页大小
   * @returns 录取结果列表
   */
  async getResults(filters: any, page: number, size: number): Promise<any> {
    const { limit, offset } = getPagination(page, size);
    
    const condition: any = {};
    
    // 添加过滤条件（基于实际数据库字段）
    if (filters.resultType) {
      condition.resultType = filters.resultType;
    }
    
    if (filters.classId) {
      condition.classId = filters.classId;
    }
    
    if (filters.kindergartenId) {
      condition.kindergartenId = filters.kindergartenId;
    }
    
    if (filters.studentId) {
      condition.studentId = filters.studentId;
    }
    
    // 暂时不包含关联查询，避免字段不匹配问题
    const { count, rows } = await AdmissionResult.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    
    return getPagingData(rows, count, page, limit);
  }
  
  /**
   * 更新录取状态
   * @param id 录取结果ID
   * @param status 新状态
   * @param userId 当前用户ID
   * @returns 更新后的录取结果
   */
  async updateStatus(id: number, status: AdmissionStatus, userId: number): Promise<AdmissionResult> {
    const transaction = await sequelize.transaction();
    
    try {
      const result = await this.getResultById(id);
      
      await result.update({
        status,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 确认入学
   * @param id 录取结果ID
   * @param confirmData 确认数据
   * @param userId 当前用户ID
   * @returns 更新后的录取结果
   */
  async confirmEnrollment(id: number, confirmData: Partial<InferCreationAttributes<AdmissionResult>>, userId: number): Promise<AdmissionResult> {
    const transaction = await sequelize.transaction();
    
    try {
      const result = await this.getResultById(id);
      
      if (result.status !== AdmissionStatus.ADMITTED) {
        throw new ApiError(400, '只有已录取状态才能确认入学');
      }
      
      await result.update({
        ...confirmData,
        status: AdmissionStatus.CONFIRMED,
        confirmationDate: new Date(),
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取录取统计数据
   * @param filters 过滤条件
   * @returns 统计数据
   */
  async getStatistics(filters: any): Promise<any> {
    const condition: any = {};
    
    if (filters.planId) {
      condition.planId = filters.planId;
    }
    
    if (filters.kindergartenId) {
      condition.kindergartenId = filters.kindergartenId;
    }
    
    const stats = await AdmissionResult.findAll({
      where: condition,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
      ],
      group: ['status'],
    });
    
    return stats;
  }
}

// 导出服务实例
export default new AdmissionResultService(); 