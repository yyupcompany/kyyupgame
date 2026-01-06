/**
 * 家长跟进记录服务
 * 处理与家长跟进记录相关的业务逻辑
 */
import { ParentFollowup, ParentFollowupCreationAttributes } from '../../models/parent-followup.model';
import { ParentStudentRelation } from '../../models/parent-student-relation.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { Op, FindOptions } from 'sequelize';

// 服务层内部的查询参数类型
interface ParentFollowupFilterParams {
  page?: number;
  pageSize?: number;
  parentId: number; // parentId 设为必需
  followupType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class ParentFollowupService {
  /**
   * 创建家长跟进记录
   * @param data 跟进记录数据
   * @param userId 当前用户ID
   * @returns 创建的跟进记录
   */
  public async create(data: Omit<ParentFollowupCreationAttributes, 'createdBy'>, userId: number): Promise<ParentFollowup> {
    try {
      // 检查家长学生关系是否存在
      const parentRelation = await ParentStudentRelation.findByPk(data.parentId);
      if (!parentRelation) {
        throw ApiError.badRequest('家长学生关系不存在', 'PARENT_RELATION_NOT_FOUND');
      }

      // 创建跟进记录
      const followup = await ParentFollowup.create({
        ...data,
        createdBy: userId
      });

      return followup;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('创建家长跟进记录失败', 'PARENT_FOLLOWUP_CREATE_ERROR');
    }
  }

  /**
   * 获取家长跟进记录列表
   * @param filters 过滤参数
   * @returns 跟进记录列表和分页信息
   */
  public async list(filters: ParentFollowupFilterParams): Promise<{ rows: ParentFollowup[], count: number }> {
    const { 
      page = 1, 
      pageSize = 10, 
      parentId,
      followupType,
      startDate,
      endDate,
      sortBy = 'followupDate',
      sortOrder = 'DESC'
    } = filters;
    
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    const where: FindOptions['where'] = {
      parentId: parentId,
    };
    
    if (followupType) {
      where.followupType = followupType;
    }
    
    if (startDate || endDate) {
      where.followupDate = {
        ...(startDate && { [Op.gte]: new Date(startDate) }),
        ...(endDate && { [Op.lte]: new Date(endDate) }),
      };
    }

    return ParentFollowup.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'realName']
        }
      ],
      offset,
      limit,
      order: [[sortBy, sortOrder]]
    });
  }

  /**
   * 获取家长跟进记录详情
   * @param id 跟进记录ID
   * @returns 跟进记录详情
   */
  public async detail(id: number): Promise<ParentFollowup> {
    const followup = await ParentFollowup.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'realName']
        }
      ]
    });

    if (!followup) {
      throw ApiError.notFound('跟进记录不存在', 'PARENT_FOLLOWUP_NOT_FOUND');
    }
    return followup;
  }

  /**
   * 更新家长跟进记录
   * @param id 跟进记录ID
   * @param data 更新数据
   * @returns 更新后的跟进记录
   */
  public async update(id: number, data: Partial<Omit<ParentFollowupCreationAttributes, 'createdBy'>>): Promise<ParentFollowup> {
    const followup = await ParentFollowup.findByPk(id);
    if (!followup) {
      throw ApiError.notFound('跟进记录不存在', 'PARENT_FOLLOWUP_NOT_FOUND');
    }

    await followup.update(data);
    return this.detail(id); // 返回更新后的完整记录
  }

  /**
   * 删除家长跟进记录
   * @param id 跟进记录ID
   * @returns 是否删除成功
   */
  public async delete(id: number): Promise<boolean> {
    const followup = await ParentFollowup.findByPk(id);
    if (!followup) {
      throw ApiError.notFound('跟进记录不存在', 'PARENT_FOLLOWUP_NOT_FOUND');
    }

    await followup.destroy();
    return true;
  }
} 