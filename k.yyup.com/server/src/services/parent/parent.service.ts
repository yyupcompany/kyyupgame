/**
 * 家长管理服务
 * 处理与家长相关的业务逻辑
 */
import { sequelize } from '../../init';
import { Parent, ParentCreationAttributes, ParentAttributes } from '../../models/parent.model';
import { User } from '../../models/user.model';
import { Student } from '../../models/student.model';
import { Class } from '../../models/class.model';
import { ApiError } from '../../utils/apiError';
import { Op, WhereOptions, Transaction } from 'sequelize';

// 服务内部的查询参数接口
interface ParentFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  studentId?: number;
  userId?: number;
  relationship?: string;
  isPrimaryContact?: number;
  isLegalGuardian?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class ParentService {
  /**
   * 创建家长与学生的关联关系
   * @param data 关联数据
   * @returns 创建的家长关联记录
   */
  public async create(data: ParentCreationAttributes): Promise<Parent> {
    return sequelize.transaction(async (transaction: Transaction) => {
      const { userId, studentId, isPrimaryContact, isLegalGuardian } = data;

      if (!userId || !studentId) {
        throw ApiError.badRequest('用户ID和学生ID不能为空');
      }

      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw ApiError.badRequest('用户不存在', 'USER_NOT_FOUND');
      }

      const student = await Student.findByPk(studentId, { transaction });
      if (!student) {
        throw ApiError.badRequest('学生不存在', 'STUDENT_NOT_FOUND');
      }

      const existingRelation = await Parent.findOne({ where: { userId, studentId }, transaction });
      if (existingRelation) {
        throw ApiError.badRequest('该用户已与此学生建立家长关系', 'PARENT_RELATION_EXISTS');
      }

      if (isPrimaryContact) {
        await Parent.update({ isPrimaryContact: 0 }, { where: { studentId, isPrimaryContact: 1 }, transaction });
      }
      if (isLegalGuardian) {
        await Parent.update({ isLegalGuardian: 0 }, { where: { studentId, isLegalGuardian: 1 }, transaction });
      }

      // 只保留ParentCreationAttributes中存在的字段
      const parentData: ParentCreationAttributes = {
        userId,
        studentId,
        relationship: data.relationship || '未指定',
        isPrimaryContact: data.isPrimaryContact || 0,
        isLegalGuardian: data.isLegalGuardian || 0,
        idCardNo: data.idCardNo,
        workUnit: data.workUnit,
        occupation: data.occupation,
        education: data.education,
        address: data.address,
        remark: data.remark,
        creatorId: data.creatorId,
        updaterId: data.updaterId
      };

      return Parent.create(parentData, { transaction });
    });
  }

  /**
   * 获取家长列表
   * @param filters 过滤参数
   * @returns 家长列表和分页信息
   */
  public async list(filters: ParentFilterParams): Promise<{ rows: Parent[]; count: number }> {
    const { 
      page = 1, 
      pageSize = 10, 
      keyword,
      studentId,
      userId,
      relationship,
      isPrimaryContact,
      isLegalGuardian,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;

    const where: any = {};
    
    if (keyword) {
      const keywordCondition = { [Op.like]: `%${keyword}%` };
      where[Op.or] = [
        { relationship: keywordCondition },
        { '$user.realName$': keywordCondition },
        { '$user.phone$': keywordCondition },
        { '$Students.name$': keywordCondition }
      ];
    }
    
    if (studentId) where.studentId = studentId;
    if (userId) where.userId = userId;
    if (relationship) where.relationship = { [Op.like]: `%${relationship}%` };
    if (isPrimaryContact !== undefined) where.isPrimaryContact = isPrimaryContact;
    if (isLegalGuardian !== undefined) where.isLegalGuardian = isLegalGuardian;

    return Parent.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'realName', 'phone', 'email'] },
        { model: Student, as: 'Students', attributes: ['id', 'name', 'studentNo'] }
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [[sortBy, sortOrder]],
      distinct: true
    });
  }

  /**
   * 获取家长详情
   * @param id 家长关联ID
   * @returns 家长详情
   */
  public async detail(id: number): Promise<Parent> {
    const parent = await Parent.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        {
          model: Student,
          as: 'Students',
          include: [{ model: Class, as: 'class' }]
        }
      ]
    });

    if (!parent) {
      throw ApiError.notFound('家长关联不存在', 'PARENT_NOT_FOUND');
    }
    return parent;
  }

  /**
   * 更新家长信息
   * @param id 家长关联ID
   * @param data 更新的家长数据
   * @returns 更新后的家长记录
   */
  public async update(id: number, data: Partial<ParentCreationAttributes>): Promise<Parent> {
    return sequelize.transaction(async (transaction: Transaction) => {
      const parent = await Parent.findByPk(id, { transaction });
      if (!parent) {
        throw ApiError.notFound('家长关联不存在', 'PARENT_NOT_FOUND');
      }

      const { isPrimaryContact, isLegalGuardian } = data;

      if (isPrimaryContact) {
        await Parent.update(
          { isPrimaryContact: 0 },
          { where: { studentId: parent.studentId, id: { [Op.ne]: id } }, transaction }
        );
      }
      if (isLegalGuardian) {
        await Parent.update(
          { isLegalGuardian: 0 },
          { where: { studentId: parent.studentId, id: { [Op.ne]: id } }, transaction }
        );
      }

      await parent.update(data, { transaction });
      return parent;
    });
  }

  /**
   * 删除家长关联
   * @param id 家长关联ID
   */
  public async delete(id: number): Promise<void> {
    const parent = await Parent.findByPk(id);
    if (!parent) {
      throw ApiError.notFound('家长关联不存在', 'PARENT_NOT_FOUND');
    }
    await parent.destroy();
  }

  /**
   * 批量为学生设置家长
   * @param studentId 学生ID
   * @param parentUserIds 家长用户ID列表
   */
  public async batchSetStudentParents(studentId: number, parentUserIds: number[]): Promise<void> {
    await sequelize.transaction(async (transaction: Transaction) => {
      await Parent.destroy({ where: { studentId }, transaction });

      if (parentUserIds.length > 0) {
        const student = await Student.findByPk(studentId, { transaction });
        if (!student) throw ApiError.notFound('学生不存在');

        for (const userId of parentUserIds) {
          const user = await User.findByPk(userId, { transaction });
          if (!user) throw ApiError.badRequest(`用户ID ${userId} 不存在`);

          await Parent.create({
            studentId,
            userId,
            relationship: '未指定',
            isPrimaryContact: 0,
            isLegalGuardian: 0
          }, { transaction });
        }
      }
    });
  }
} 