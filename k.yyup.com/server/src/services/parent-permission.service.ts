import { ParentPermissionConfirmation, ParentPermissionStatus, PermissionScope } from '../models/parent-permission-confirmation.model';

// 重新导出类型供其他模块使用
export { ParentPermissionStatus, PermissionScope };
import { User } from '../models/user.model';
import { Student } from '../models/student.model';
import { Kindergarten } from '../models/kindergarten.model';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { Op } from 'sequelize';

/**
 * 家长权限服务
 * 负责管理家长访问园所内容的权限确认
 */
export class ParentPermissionService {
  /**
   * 检查家长是否有指定权限
   */
  static async checkParentPermission(
    parentId: number,
    requiredPermission: PermissionScope,
    kindergartenId?: number
  ): Promise<{
    hasPermission: boolean;
    status?: ParentPermissionStatus;
    confirmation?: ParentPermissionConfirmation;
    reason?: string;
  }> {
    try {
      console.log('[家长权限服务] 检查权限:', {
        parentId,
        requiredPermission,
        kindergartenId
      });

      // 1. 检查用户是否存在且是家长角色
      const parent = await User.findByPk(parentId);
      if (!parent) {
        return { hasPermission: false, reason: '用户不存在' };
      }

      if (parent.role !== 'parent') {
        return { hasPermission: false, reason: '用户不是家长角色' };
      }

      // 2. 查找权限确认记录
      const whereCondition: any = {
        parentId,
        status: ParentPermissionStatus.APPROVED
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

      const confirmation = await ParentPermissionConfirmation.findOne({
        where: whereCondition,
        include: [
          { model: Student, as: 'student' },
          { model: Kindergarten, as: 'kindergarten' },
          { model: User, as: 'principal', attributes: ['id', 'realName', 'phone'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      if (!confirmation) {
        return {
          hasPermission: false,
          status: ParentPermissionStatus.PENDING,
          reason: '未找到有效的权限确认记录'
        };
      }

      // 3. 检查权限范围
      const permissionScope = confirmation.permissionScope;

      // 基础权限检查
      if (requiredPermission === PermissionScope.BASIC) {
        return { hasPermission: true, status: confirmation.status, confirmation };
      }

      // ALL权限检查
      if (permissionScope === PermissionScope.ALL) {
        return { hasPermission: true, status: confirmation.status, confirmation };
      }

      // 具体权限检查
      if (permissionScope === requiredPermission) {
        return { hasPermission: true, status: confirmation.status, confirmation };
      }

      return {
        hasPermission: false,
        status: confirmation.status,
        confirmation,
        reason: `权限范围不匹配，需要: ${requiredPermission}，当前: ${permissionScope}`
      };

    } catch (error) {
      console.error('[家长权限服务] 权限检查失败:', error);
      return { hasPermission: false, reason: '权限检查服务异常' };
    }
  }

  /**
   * 创建权限确认申请
   */
  static async createPermissionRequest(data: {
    parentId: number;
    studentId: number;
    kindergartenId: number;
    principalId: number;
    permissionScope?: PermissionScope;
    evidenceFiles?: string[];
    isPermanent?: boolean;
  }): Promise<ParentPermissionConfirmation> {
    try {
      const {
        parentId,
        studentId,
        kindergartenId,
        principalId,
        permissionScope = PermissionScope.ALL,
        evidenceFiles = [],
        isPermanent = false
      } = data;

      console.log('[家长权限服务] 创建权限申请:', {
        parentId,
        studentId,
        kindergartenId,
        permissionScope
      });

      // 检查是否已有待审核的申请
      const existingRequest = await ParentPermissionConfirmation.findOne({
        where: {
          parentId,
          studentId,
          kindergartenId,
          status: ParentPermissionStatus.PENDING
        }
      });

      if (existingRequest) {
        throw new Error('该家长已有待审核的权限申请');
      }

      // 创建新的权限确认申请
      const confirmation = await ParentPermissionConfirmation.create({
        parentId,
        studentId,
        kindergartenId,
        principalId,
        status: ParentPermissionStatus.PENDING,
        permissionScope,
        evidenceFiles: evidenceFiles.length > 0 ? JSON.stringify(evidenceFiles) : null,
        isPermanent,
        requestedAt: new Date()
      });

      console.log('[家长权限服务] 权限申请创建成功:', confirmation.id);
      return confirmation;

    } catch (error) {
      console.error('[家长权限服务] 创建权限申请失败:', error);
      throw error;
    }
  }

  /**
   * 园长确认权限
   */
  static async confirmPermission(
    confirmationId: number,
    principalId: number,
    data: {
      approved: boolean;
      confirmNote?: string;
      rejectReason?: string;
      expiryDate?: Date;
      isPermanent?: boolean;
    }
  ): Promise<ParentPermissionConfirmation> {
    try {
      const { approved, confirmNote, rejectReason, expiryDate, isPermanent = false } = data;

      console.log('[家长权限服务] 园长确认权限:', {
        confirmationId,
        principalId,
        approved
      });

      const confirmation = await ParentPermissionConfirmation.findOne({
        where: { id: confirmationId, principalId }
      });

      if (!confirmation) {
        throw new Error('未找到权限确认记录或无权限操作');
      }

      if (confirmation.status !== ParentPermissionStatus.PENDING) {
        throw new Error('该申请已经处理过了');
      }

      const updateData: any = {
        confirmedAt: new Date(),
        isPermanent
      };

      if (approved) {
        updateData.status = ParentPermissionStatus.APPROVED;
        if (confirmNote) updateData.confirmNote = confirmNote;
        if (expiryDate) updateData.expiryDate = expiryDate;
      } else {
        updateData.status = ParentPermissionStatus.REJECTED;
        if (rejectReason) updateData.rejectReason = rejectReason;
      }

      await confirmation.update(updateData);

      // 🚀 User模型没有kindergartenId字段，移除此更新逻辑
      // 在多租户架构中，租户关系由域名解析决定
      // if (approved) {
      //   await User.update(
      //     { kindergartenId: confirmation.kindergartenId },
      //     { where: { id: confirmation.parentId } }
      //   );
      // }

      console.log('[家长权限服务] 权限确认完成:', {
        confirmationId,
        status: updateData.status
      });

      return confirmation;

    } catch (error) {
      console.error('[家长权限服务] 权限确认失败:', error);
      throw error;
    }
  }

  /**
   * 获取园长的权限申请列表
   */
  static async getPendingRequests(principalId: number, kindergartenId: number) {
    try {
      console.log('[家长权限服务] 获取待审核申请:', { principalId, kindergartenId });

      const requests = await ParentPermissionConfirmation.findAll({
        where: {
          principalId,
          kindergartenId,
          status: ParentPermissionStatus.PENDING
        },
        include: [
          {
            model: User,
            as: 'parent',
            attributes: ['id', 'realName', 'phone', 'email']
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'gender', 'className']
          }
        ],
        order: [['requestedAt', 'DESC']]
      });

      return requests;

    } catch (error) {
      console.error('[家长权限服务] 获取待审核申请失败:', error);
      throw error;
    }
  }

  /**
   * 获取家长的所有权限记录
   */
  static async getParentPermissions(parentId: number, kindergartenId?: number) {
    try {
      const whereCondition: any = { parentId };
      if (kindergartenId) {
        whereCondition.kindergartenId = kindergartenId;
      }

      const permissions = await ParentPermissionConfirmation.findAll({
        where: whereCondition,
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'className']
          },
          {
            model: Kindergarten,
            as: 'kindergarten',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'principal',
            attributes: ['id', 'realName']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return permissions;

    } catch (error) {
      console.error('[家长权限服务] 获取家长权限记录失败:', error);
      throw error;
    }
  }

  /**
   * 暂停或恢复权限
   */
  static async togglePermission(
    confirmationId: number,
    principalId: number,
    suspend: boolean
  ): Promise<ParentPermissionConfirmation> {
    try {
      const confirmation = await ParentPermissionConfirmation.findOne({
        where: { id: confirmationId, principalId }
      });

      if (!confirmation) {
        throw new Error('未找到权限记录或无权限操作');
      }

      if (confirmation.status !== ParentPermissionStatus.APPROVED && !suspend) {
        throw new Error('只能恢复已暂停的权限');
      }

      if (confirmation.status !== ParentPermissionStatus.APPROVED && suspend) {
        throw new Error('只能暂停已确认的权限');
      }

      await confirmation.update({
        status: suspend ? ParentPermissionStatus.SUSPENDED : ParentPermissionStatus.APPROVED
      });

      return confirmation;

    } catch (error) {
      console.error('[家长权限服务] 权限状态切换失败:', error);
      throw error;
    }
  }

  /**
   * 批量确认权限
   */
  static async batchConfirmPermissions(
    confirmationIds: number[],
    principalId: number,
    approved: boolean,
    confirmNote?: string,
    rejectReason?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const id of confirmationIds) {
      try {
        await this.confirmPermission(id, principalId, {
          approved,
          confirmNote,
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
}