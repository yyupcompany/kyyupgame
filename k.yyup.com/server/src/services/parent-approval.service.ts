import { Op } from 'sequelize';
import { ParentApproval, ParentApprovalStatus, ParentRelationType } from '../models/parent-approval.model';
import { User } from '../models/user.model';
import { Class } from '../models/class.model';
import { Kindergarten } from '../models/kindergarten.model';
import { Student } from '../models/student.model';

/**
 * 家长审核服务
 * 负责管理家长的注册审核和数据访问控制
 */
export class ParentApprovalService {
  /**
   * 检查家长是否已通过审核
   */
  static async checkParentApproval(
    parentId: number,
    kindergartenId?: number
  ): Promise<{
    hasApproval: boolean;
    status?: ParentApprovalStatus;
    approval?: ParentApproval;
    reason?: string;
    dataAccessLevel: 'full' | 'limited' | 'none';
  }> {
    try {
      console.log('[家长审核服务] 检查审核状态:', { parentId, kindergartenId });

      // 1. 检查用户是否存在且是家长角色
      const parent = await User.findByPk(parentId);
      if (!parent) {
        return { hasApproval: false, reason: '用户不存在', dataAccessLevel: 'none' };
      }

      if (parent.role !== 'parent') {
        return { hasApproval: false, reason: '用户不是家长角色', dataAccessLevel: 'none' };
      }

      // 2. 查找审核记录
      const whereCondition: any = { parentId };
      if (kindergartenId) {
        whereCondition.kindergartenId = kindergartenId;
      }

      const approval = await ParentApproval.findOne({
        where: whereCondition,
        include: [
          { model: Student, as: 'student' },
          { model: Kindergarten, as: 'kindergarten' },
          { model: Class, as: 'class' }
        ],
        order: [['createdAt', 'DESC']]
      });

      if (!approval) {
        return {
          hasApproval: false,
          status: ParentApprovalStatus.PENDING,
          reason: '未找到审核记录',
          dataAccessLevel: 'none'
        };
      }

      // 3. 根据审核状态返回结果
      switch (approval.status) {
        case ParentApprovalStatus.APPROVED:
          return {
            hasApproval: true,
            status: approval.status,
            approval,
            dataAccessLevel: 'full'
          };
        case ParentApprovalStatus.PENDING:
          return {
            hasApproval: false,
            status: approval.status,
            approval,
            reason: '审核申请待处理',
            dataAccessLevel: 'limited'
          };
        case ParentApprovalStatus.REJECTED:
          return {
            hasApproval: false,
            status: approval.status,
            approval,
            reason: approval.rejectReason || '审核被拒绝',
            dataAccessLevel: 'none'
          };
        case ParentApprovalStatus.SUSPENDED:
          return {
            hasApproval: false,
            status: approval.status,
            approval,
            reason: '权限已被暂停',
            dataAccessLevel: 'none'
          };
        default:
          return {
            hasApproval: false,
            reason: '未知审核状态',
            dataAccessLevel: 'none'
          };
      }
    } catch (error) {
      console.error('[家长审核服务] 审核检查失败:', error);
      return { hasApproval: false, reason: '审核检查服务异常', dataAccessLevel: 'none' };
    }
  }

  /**
   * 创建家长审核申请
   */
  static async createParentRequest(data: {
    parentId: number;
    kindergartenId: number;
    classId?: number;
    studentId?: number;
    relationship?: ParentRelationType;
    childName?: string;
  }): Promise<ParentApproval> {
    try {
      const {
        parentId,
        kindergartenId,
        classId,
        studentId,
        relationship = ParentRelationType.OTHER,
        childName
      } = data;

      console.log('[家长审核服务] 创建家长申请:', {
        parentId,
        kindergartenId,
        classId,
        relationship
      });

      // 检查是否已有待审核的申请
      const existingRequest = await ParentApproval.findOne({
        where: {
          parentId,
          kindergartenId,
          status: ParentApprovalStatus.PENDING
        }
      });

      if (existingRequest) {
        throw new Error('该家长已有待审核的申请');
      }

      // 创建新的审核申请
      const approval = await ParentApproval.create({
        parentId,
        kindergartenId,
        classId,
        studentId,
        status: ParentApprovalStatus.PENDING,
        relationship,
        childName,
        requestedAt: new Date()
      });

      console.log('[家长审核服务] 家长申请创建成功:', approval.id);
      return approval;
    } catch (error) {
      console.error('[家长审核服务] 创建家长申请失败:', error);
      throw error;
    }
  }

  /**
   * 审核家长申请
   */
  static async approveParent(
    approvalId: number,
    assignerId: number,
    assignerType: 'principal' | 'admin' | 'teacher',
    data: {
      approved: boolean;
      approveNote?: string;
      rejectReason?: string;
      studentId?: number;
    }
  ): Promise<ParentApproval> {
    try {
      const { approved, approveNote, rejectReason, studentId } = data;

      console.log('[家长审核服务] 审核家长申请:', {
        approvalId,
        assignerId,
        approved
      });

      const approval = await ParentApproval.findOne({
        where: { id: approvalId }
      });

      if (!approval) {
        throw new Error('未找到家长审核记录');
      }

      if (approval.status !== ParentApprovalStatus.PENDING) {
        throw new Error('该申请已经处理过了');
      }

      const updateData: any = {
        assignerId,
        assignerType,
        approvedAt: new Date()
      };

      if (approved) {
        updateData.status = ParentApprovalStatus.APPROVED;
        updateData.approveNote = approveNote;
        if (studentId) {
          updateData.studentId = studentId;
        }
      } else {
        updateData.status = ParentApprovalStatus.REJECTED;
        updateData.rejectReason = rejectReason || '审核未通过';
      }

      await approval.update(updateData);

      console.log('[家长审核服务] 家长审核完成:', {
        id: approval.id,
        status: approval.status
      });

      return approval;
    } catch (error) {
      console.error('[家长审核服务] 家长审核失败:', error);
      throw error;
    }
  }

  /**
   * 获取待审核的家长申请列表
   */
  static async getPendingRequests(
    kindergartenId: number,
    classId?: number
  ): Promise<ParentApproval[]> {
    try {
      console.log('[家长审核服务] 获取待审核申请:', { kindergartenId, classId });

      const whereCondition: any = {
        kindergartenId,
        status: ParentApprovalStatus.PENDING
      };

      if (classId) {
        whereCondition.classId = classId;
      }

      const requests = await ParentApproval.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'parent',
            attributes: ['id', 'realName', 'phone', 'email']
          },
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name']
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name']
          }
        ],
        order: [['requestedAt', 'DESC']]
      });

      return requests;
    } catch (error) {
      console.error('[家长审核服务] 获取待审核申请失败:', error);
      throw error;
    }
  }

  /**
   * 获取家长的审核状态
   */
  static async getParentApprovalStatus(
    parentId: number,
    kindergartenId: number
  ): Promise<ParentApproval | null> {
    try {
      return await ParentApproval.findOne({
        where: { parentId, kindergartenId },
        include: [
          { model: Kindergarten, as: 'kindergarten' },
          { model: Class, as: 'class' },
          { model: Student, as: 'student' }
        ]
      });
    } catch (error) {
      console.error('[家长审核服务] 获取审核状态失败:', error);
      throw error;
    }
  }

  /**
   * 批量审核家长申请
   */
  static async batchApproveParents(
    approvalIds: number[],
    assignerId: number,
    assignerType: 'principal' | 'admin' | 'teacher',
    approved: boolean,
    approveNote?: string,
    rejectReason?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const id of approvalIds) {
      try {
        await this.approveParent(id, assignerId, assignerType, {
          approved,
          approveNote,
          rejectReason
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`ID ${id}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * 暂停或恢复家长权限
   */
  static async toggleParentApproval(
    approvalId: number,
    assignerId: number,
    suspend: boolean
  ): Promise<ParentApproval> {
    try {
      const approval = await ParentApproval.findByPk(approvalId);

      if (!approval) {
        throw new Error('未找到审核记录');
      }

      if (suspend && approval.status !== ParentApprovalStatus.APPROVED) {
        throw new Error('只能暂停已通过的审核');
      }

      if (!suspend && approval.status !== ParentApprovalStatus.SUSPENDED) {
        throw new Error('只能恢复已暂停的审核');
      }

      await approval.update({
        status: suspend ? ParentApprovalStatus.SUSPENDED : ParentApprovalStatus.APPROVED,
        assignerId
      });

      return approval;
    } catch (error) {
      console.error('[家长审核服务] 权限状态切换失败:', error);
      throw error;
    }
  }
}

