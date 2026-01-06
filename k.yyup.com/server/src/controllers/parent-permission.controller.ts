import { Request, Response } from 'express';
import { ParentPermissionService, PermissionScope, ParentPermissionStatus } from '../services/parent-permission.service';
import { User } from '../models/user.model';
import { Student } from '../models/student.model';
import { Kindergarten } from '../models/kindergarten.model';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { Teacher } from '../models/teacher.model';

/**
 * 家长权限管理控制器
 * 提供园长管理家长权限的API接口
 */
export class ParentPermissionController {
  /**
   * 园长获取待审核的权限申请列表
   * GET /api/parent-permissions/pending
   */
  static async getPendingPermissions(req: Request, res: Response): Promise<void> {
    try {
      const principal = req.user as any;
      const kindergartenId = principal?.kindergartenId;

      console.log('[家长权限管理] 获取待审核权限申请:', {
        principalId: principal.id,
        kindergartenId
      });

      if (!kindergartenId) {
        res.status(400).json({
          success: false,
          message: '园长必须关联幼儿园'
        });
        return;
      }

      const pendingRequests = await ParentPermissionService.getPendingRequests(
        principal.id,
        kindergartenId
      );

      res.json({
        success: true,
        message: '获取待审核权限申请成功',
        data: pendingRequests
      });

    } catch (error: any) {
      console.error('[家长权限管理] 获取待审核权限申请失败:', error);
      res.status(500).json({
        success: false,
        message: '获取待审核权限申请失败',
        error: error.message
      });
    }
  }

  /**
   * 园长确认权限申请
   * POST /api/parent-permissions/:id/confirm
   */
  static async confirmPermission(req: Request, res: Response): Promise<void> {
    try {
      const principal = req.user as any;
      const { id } = req.params;
      const { approved, confirmNote, rejectReason, expiryDate, isPermanent } = req.body;

      console.log('[家长权限管理] 园长确认权限:', {
        confirmationId: id,
        principalId: principal.id,
        approved
      });

      const confirmation = await ParentPermissionService.confirmPermission(
        Number(id),
        principal.id,
        {
          approved,
          confirmNote,
          rejectReason,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          isPermanent
        }
      );

      res.json({
        success: true,
        message: approved ? '权限确认成功' : '权限拒绝成功',
        data: confirmation
      });

    } catch (error: any) {
      console.error('[家长权限管理] 确认权限失败:', error);
      res.status(400).json({
        success: false,
        message: '确认权限失败',
        error: error.message
      });
    }
  }

  /**
   * 批量确认权限申请
   * POST /api/parent-permissions/batch-confirm
   */
  static async batchConfirmPermissions(req: Request, res: Response): Promise<void> {
    try {
      const principal = req.user as any;
      const { confirmationIds, approved, confirmNote, rejectReason } = req.body;

      console.log('[家长权限管理] 批量确认权限:', {
        principalId: principal.id,
        confirmationIds,
        approved
      });

      if (!Array.isArray(confirmationIds) || confirmationIds.length === 0) {
        res.status(400).json({
          success: false,
          message: '请提供要确认的权限申请ID列表'
        });
        return;
      }

      const results = await ParentPermissionService.batchConfirmPermissions(
        confirmationIds.map(Number),
        principal.id,
        approved,
        confirmNote,
        rejectReason
      );

      res.json({
        success: true,
        message: `批量确认完成，成功: ${results.success}，失败: ${results.failed}`,
        data: results
      });

    } catch (error: any) {
      console.error('[家长权限管理] 批量确认权限失败:', error);
      res.status(500).json({
        success: false,
        message: '批量确认权限失败',
        error: error.message
      });
    }
  }

  /**
   * 暂停或恢复权限
   * PUT /api/parent-permissions/:id/toggle
   */
  static async togglePermission(req: Request, res: Response): Promise<void> {
    try {
      const principal = req.user as any;
      const { id } = req.params;
      const { suspend } = req.body;

      console.log('[家长权限管理] 切换权限状态:', {
        confirmationId: id,
        principalId: principal.id,
        suspend
      });

      const confirmation = await ParentPermissionService.togglePermission(
        Number(id),
        principal.id,
        suspend
      );

      res.json({
        success: true,
        message: suspend ? '权限已暂停' : '权限已恢复',
        data: confirmation
      });

    } catch (error: any) {
      console.error('[家长权限管理] 切换权限状态失败:', error);
      res.status(400).json({
        success: false,
        message: '切换权限状态失败',
        error: error.message
      });
    }
  }

  /**
   * 获取家长的所有权限记录
   * GET /api/parent-permissions/parent/:parentId
   */
  static async getParentPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.params;
      const kindergartenId = (req.user as any)?.kindergartenId;

      console.log('[家长权限管理] 获取家长权限记录:', {
        parentId,
        kindergartenId
      });

      const permissions = await ParentPermissionService.getParentPermissions(
        Number(parentId),
        kindergartenId
      );

      res.json({
        success: true,
        message: '获取家长权限记录成功',
        data: permissions
      });

    } catch (error: any) {
      console.error('[家长权限管理] 获取家长权限记录失败:', error);
      res.status(500).json({
        success: false,
        message: '获取家长权限记录失败',
        error: error.message
      });
    }
  }

  /**
   * 创建权限申请（家长主动申请）
   * POST /api/parent-permissions/request
   */
  static async createPermissionRequest(req: Request, res: Response): Promise<void> {
    try {
      const parent = req.user as any;
      const { studentId, permissionScope, evidenceFiles, isPermanent } = req.body;

      console.log('[家长权限管理] 创建权限申请:', {
        parentId: parent.id,
        studentId,
        permissionScope
      });

      // 获取园长ID和幼儿园信息
      const kindergartenId = (parent as any)?.kindergartenId;
      if (!kindergartenId) {
        res.status(400).json({
          success: false,
          message: '请先关联幼儿园'
        });
        return;
      }

      // 获取该幼儿园的园长 - 通过Teacher关联查找
      const principal = await User.findOne({
        where: {
          role: 'principal' as any,
          status: 'active'
        },
        include: [{
          model: Teacher,
          as: 'teacher',
          where: { kindergartenId },
          required: true
        }]
      });

      if (!principal) {
        res.status(400).json({
          success: false,
          message: '该幼儿园暂无园长，请联系管理员'
        });
        return;
      }

      // 验证家长和学生关联关系
      const relation = await ParentStudentRelation.findOne({
        where: {
          userId: parent.id,
          studentId
        }
      });

      if (!relation) {
        res.status(400).json({
          success: false,
          message: '您与该学生没有关联关系'
        });
        return;
      }

      const confirmation = await ParentPermissionService.createPermissionRequest({
        parentId: parent.id,
        studentId,
        kindergartenId,
        principalId: principal.id,
        permissionScope,
        evidenceFiles,
        isPermanent
      });

      res.status(201).json({
        success: true,
        message: '权限申请提交成功，请等待园长审核',
        data: confirmation
      });

    } catch (error: any) {
      console.error('[家长权限管理] 创建权限申请失败:', error);
      res.status(400).json({
        success: false,
        message: '创建权限申请失败',
        error: error.message
      });
    }
  }

  /**
   * 获取园长的权限管理统计
   * GET /api/parent-permissions/stats
   */
  static async getPermissionStats(req: Request, res: Response): Promise<void> {
    try {
      const principal = req.user as any;
      const kindergartenId = principal?.kindergartenId;

      console.log('[家长权限管理] 获取权限管理统计:', {
        principalId: principal.id,
        kindergartenId
      });

      if (!kindergartenId) {
        res.status(400).json({
          success: false,
          message: '园长必须关联幼儿园'
        });
        return;
      }

      // 这里可以添加统计逻辑，比如：
      // - 待审核数量
      // - 已确认数量
      // - 已拒绝数量
      // - 已暂停数量
      // 等等

      const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
        total: 0
      };

      // TODO: 实现实际的统计查询

      res.json({
        success: true,
        message: '获取权限管理统计成功',
        data: stats
      });

    } catch (error: any) {
      console.error('[家长权限管理] 获取权限管理统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取权限管理统计失败',
        error: error.message
      });
    }
  }

  /**
   * 检查家长权限状态
   * GET /api/parent-permissions/check/:parentId?scope=xxx
   */
  static async checkParentPermissionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.params;
      const { scope } = req.query;
      const currentKindergartenId = (req.user as any)?.kindergartenId;

      console.log('[家长权限管理] 检查家长权限状态:', {
        parentId,
        scope,
        currentKindergartenId
      });

      let requiredPermission = PermissionScope.BASIC;
      if (scope && Object.values(PermissionScope).includes(scope as PermissionScope)) {
        requiredPermission = scope as PermissionScope;
      }

      const permissionResult = await ParentPermissionService.checkParentPermission(
        Number(parentId),
        requiredPermission,
        currentKindergartenId
      );

      res.json({
        success: true,
        message: '权限状态检查完成',
        data: permissionResult
      });

    } catch (error: any) {
      console.error('[家长权限管理] 检查家长权限状态失败:', error);
      res.status(500).json({
        success: false,
        message: '检查家长权限状态失败',
        error: error.message
      });
    }
  }
}