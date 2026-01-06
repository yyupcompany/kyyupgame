import { TeacherApproval, TeacherApprovalStatus, TeacherApprovalScope } from '../models/teacher-approval.model';
import { User, UserStatus } from '../models/user.model';
import { Class } from '../models/class.model';
import { Kindergarten } from '../models/kindergarten.model';
import { Op } from 'sequelize';

/**
 * 教师审核服务
 * 负责管理教师的权限审核和数据访问控制
 */
export class TeacherApprovalService {
  /**
   * 检查教师是否有指定权限
   */
  static async checkTeacherPermission(
    teacherId: number,
    requiredPermission: TeacherApprovalScope,
    kindergartenId?: number
  ): Promise<{
    hasPermission: boolean;
    status?: TeacherApprovalStatus;
    approval?: TeacherApproval;
    reason?: string;
    dataAccessLevel: 'full' | 'limited' | 'none'; // 数据访问级别
  }> {
    try {
      console.log('[教师审核服务] 检查权限:', {
        teacherId,
        requiredPermission,
        kindergartenId
      });

      // 1. 检查用户是否存在且是教师角色
      const teacher = await User.findByPk(teacherId);
      if (!teacher) {
        return { hasPermission: false, reason: '用户不存在', dataAccessLevel: 'none' };
      }

      if (teacher.role !== 'teacher') {
        return { hasPermission: false, reason: '用户不是教师角色', dataAccessLevel: 'none' };
      }

      // 2. 查找权限审核记录
      const whereCondition: any = {
        teacherId,
        status: TeacherApprovalStatus.APPROVED
      };

      // 如果指定了幼儿园ID，需要匹配
      if (kindergartenId) {
        whereCondition.kindergartenId = kindergartenId;
      }

      // 检查权限是否过期（如果有过期时间）
      const currentDateTime = new Date();
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { expiryDate: null },
            { expiryDate: { [Op.gt]: currentDateTime } }
          ]
        }
      ];

      const approval = await TeacherApproval.findOne({
        where: whereCondition,
        include: [
          { model: Class, as: 'class' },
          { model: Kindergarten, as: 'kindergarten' },
          { model: User, as: 'assigner', attributes: ['id', 'realName', 'role'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      if (!approval) {
        return {
          hasPermission: false,
          status: TeacherApprovalStatus.PENDING,
          reason: '未找到有效的权限审核记录',
          dataAccessLevel: 'limited' // 老师可以查看界面但数据受限
        };
      }

      // 3. 检查权限范围
      const approvalScope = approval.approvalScope;

      // 基础权限检查 - 可以看到界面，但数据可能受限
      if (requiredPermission === TeacherApprovalScope.BASIC) {
        return { hasPermission: true, status: approval.status, approval, dataAccessLevel: 'limited' };
      }

      // ALL权限检查 - 可以看到全部数据
      if (approvalScope === TeacherApprovalScope.ALL) {
        return { hasPermission: true, status: approval.status, approval, dataAccessLevel: 'full' };
      }

      // 具体权限检查
      if (approvalScope === requiredPermission) {
        return { hasPermission: true, status: approval.status, approval, dataAccessLevel: 'full' };
      }

      return {
        hasPermission: false,
        status: approval.status,
        approval,
        reason: `权限范围不匹配，需要: ${requiredPermission}，当前: ${approvalScope}`,
        dataAccessLevel: 'limited'
      };

    } catch (error) {
      console.error('[教师审核服务] 权限检查失败:', error);
      return { hasPermission: false, reason: '权限检查服务异常', dataAccessLevel: 'none' };
    }
  }

  /**
   * 创建教师权限申请
   */
  static async createTeacherRequest(data: {
    teacherId: number;
    assignerId: number;
    assignerType?: 'principal' | 'admin';
    kindergartenId: number;
    classId?: number;
    approvalScope?: TeacherApprovalScope;
    teacherTitle?: string;
    teachingSubjects?: string[];
    evidenceFiles?: string[];
    isPermanent?: boolean;
  }): Promise<TeacherApproval> {
    try {
      const {
        teacherId,
        assignerId,
        assignerType = 'principal',
        kindergartenId,
        classId,
        approvalScope = TeacherApprovalScope.BASIC,
        teacherTitle,
        teachingSubjects = [],
        evidenceFiles = [],
        isPermanent = false
      } = data;

      console.log('[教师审核服务] 创建教师申请:', {
        teacherId,
        assignerId,
        kindergartenId,
        approvalScope
      });

      // 检查是否已有待审核的申请
      const existingRequest = await TeacherApproval.findOne({
        where: {
          teacherId,
          kindergartenId,
          status: TeacherApprovalStatus.PENDING
        }
      });

      if (existingRequest) {
        throw new Error('该教师已有待审核的权限申请');
      }

      // 创建新的权限审核申请
      const approval = await TeacherApproval.create({
        teacherId,
        assignerId,
        assignerType,
        kindergartenId,
        classId,
        status: TeacherApprovalStatus.PENDING,
        approvalScope,
        teacherTitle,
        teachingSubjects: teachingSubjects.length > 0 ? teachingSubjects.join(',') : null,
        evidenceFiles: evidenceFiles.length > 0 ? JSON.stringify(evidenceFiles) : null,
        isPermanent,
        requestedAt: new Date()
      });

      console.log('[教师审核服务] 教师申请创建成功:', approval.id);
      return approval;

    } catch (error) {
      console.error('[教师审核服务] 创建教师申请失败:', error);
      throw error;
    }
  }

  /**
   * 园长/管理员审核教师权限
   */
  static async approveTeacher(
    approvalId: number,
    assignerId: number,
    assignerType: 'principal' | 'admin',
    data: {
      approved: boolean;
      approveNote?: string;
      rejectReason?: string;
      expiryDate?: Date;
      isPermanent?: boolean;
    }
  ): Promise<TeacherApproval> {
    try {
      const { approved, approveNote, rejectReason, expiryDate, isPermanent = false } = data;

      console.log('[教师审核服务] 审核教师权限:', {
        approvalId,
        assignerId,
        approved
      });

      const approval = await TeacherApproval.findOne({
        where: { id: approvalId }
      });

      if (!approval) {
        throw new Error('未找到教师审核记录');
      }

      if (approval.status !== TeacherApprovalStatus.PENDING) {
        throw new Error('该申请已经处理过了');
      }

      const updateData: any = {
        approvedAt: new Date(),
        isPermanent
      };

      if (approved) {
        updateData.status = TeacherApprovalStatus.APPROVED;
        if (approveNote) updateData.approveNote = approveNote;
        if (expiryDate) updateData.expiryDate = expiryDate;
      } else {
        updateData.status = TeacherApprovalStatus.REJECTED;
        if (rejectReason) updateData.rejectReason = rejectReason;
      }

      await approval.update(updateData);

      // 如果审核通过，更新教师状态（User模型没有kindergartenId字段）
      if (approved) {
        await User.update(
          {
            status: UserStatus.ACTIVE
            // kindergartenId 字段不存在于User模型中，幼儿园关联通过Teacher模型处理
          },
          { where: { id: approval.teacherId } }
        );
      } else {
        // 如果拒绝，将教师状态设为未审核
        await User.update(
          {
            status: UserStatus.INACTIVE
          },
          { where: { id: approval.teacherId } }
        );
      }

      console.log('[教师审核服务] 教师审核完成:', {
        approvalId,
        status: updateData.status
      });

      return approval;

    } catch (error) {
      console.error('[教师审核服务] 教师审核失败:', error);
      throw error;
    }
  }

  /**
   * 获取园长的教师审核申请列表
   */
  static async getPendingRequests(assignerId: number, assignerType: 'principal' | 'admin', kindergartenId: number) {
    try {
      console.log('[教师审核服务] 获取待审核申请:', { assignerId, assignerType, kindergartenId });

      const requests = await TeacherApproval.findAll({
        where: {
          assignerId,
          assignerType,
          kindergartenId,
          status: TeacherApprovalStatus.PENDING
        },
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'realName', 'phone', 'email']
          },
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name']
          }
        ],
        order: [['requestedAt', 'DESC']]
      });

      return requests;

    } catch (error) {
      console.error('[教师审核服务] 获取待审核申请失败:', error);
      throw error;
    }
  }

  /**
   * 获取教师的所有审核记录
   */
  static async getTeacherApprovals(teacherId: number, kindergartenId?: number) {
    try {
      const whereCondition: any = { teacherId };
      if (kindergartenId) {
        whereCondition.kindergartenId = kindergartenId;
      }

      const approvals = await TeacherApproval.findAll({
        where: whereCondition,
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name']
          },
          {
            model: Kindergarten,
            as: 'kindergarten',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'assigner',
            attributes: ['id', 'realName', 'role']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return approvals;

    } catch (error) {
      console.error('[教师审核服务] 获取教师审核记录失败:', error);
      throw error;
    }
  }

  /**
   * 暂停或恢复教师权限
   */
  static async toggleTeacherApproval(
    approvalId: number,
    suspend: boolean
  ): Promise<TeacherApproval> {
    try {
      const approval = await TeacherApproval.findByPk(approvalId);

      if (!approval) {
        throw new Error('未找到教师审核记录');
      }

      if (approval.status !== TeacherApprovalStatus.APPROVED && !suspend) {
        throw new Error('只能恢复已暂停的权限');
      }

      if (approval.status !== TeacherApprovalStatus.APPROVED && suspend) {
        throw new Error('只能暂停已确认的权限');
      }

      await approval.update({
        status: suspend ? TeacherApprovalStatus.SUSPENDED : TeacherApprovalStatus.APPROVED
      });

      return approval;

    } catch (error) {
      console.error('[教师审核服务] 教师权限状态切换失败:', error);
      throw error;
    }
  }

  /**
   * 批量审核教师权限
   */
  static async batchApproveTeachers(
    approvalIds: number[],
    assignerId: number,
    assignerType: 'principal' | 'admin',
    approved: boolean,
    approveNote?: string,
    rejectReason?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const id of approvalIds) {
      try {
        await this.approveTeacher(id, assignerId, assignerType, {
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
   * 数据过滤服务 - 根据教师权限过滤数据
   */
  static async filterDataForTeacher<T>(
    teacherId: number,
    originalData: T[],
    permissionScope: TeacherApprovalScope,
    kindergartenId?: number
  ): Promise<{ data: T[]; hasFullAccess: boolean; reason: string }> {
    try {
      const permissionResult = await this.checkTeacherPermission(
        teacherId,
        permissionScope,
        kindergartenId
      );

      if (permissionResult.dataAccessLevel === 'full') {
        return {
          data: originalData,
          hasFullAccess: true,
          reason: '具有完整数据访问权限'
        };
      }

      if (permissionResult.dataAccessLevel === 'limited') {
        // 返回空数组，但不会报错
        return {
          data: [],
          hasFullAccess: false,
          reason: permissionResult.reason || '数据访问权限受限'
        };
      }

      // dataAccessLevel === 'none'
      return {
        data: [],
        hasFullAccess: false,
        reason: permissionResult.reason || '无数据访问权限'
      };

    } catch (error) {
      console.error('[教师审核服务] 数据过滤失败:', error);
      return {
        data: [],
        hasFullAccess: false,
        reason: '数据过滤服务异常'
      };
    }
  }
}