/**
 * 教师权限管理控制器
 * 为园长提供教师权限审核和管理功能
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { TeacherApprovalService } from '../services/teacher-approval.service';
import { TeacherApprovalStatus, TeacherApprovalScope } from '../models/teacher-approval.model';

/**
 * 获取待审核的教师权限申请列表
 */
export const getPendingTeacherApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const assignerId = user.id;
    const assignerType = user.role === 'principal' ? 'principal' : 'admin';

    // 获取用户的幼儿园ID
    const kindergartenId = user.kindergartenId;

    if (!kindergartenId) {
      throw ApiError.badRequest('您未关联到任何幼儿园，无法查看权限申请');
    }

    console.log('[教师权限管理] 获取待审核申请:', {
      assignerId,
      assignerType,
      kindergartenId
    });

    const pendingApprovals = await TeacherApprovalService.getPendingRequests(
      assignerId,
      assignerType,
      kindergartenId
    );

    ApiResponse.success(res, pendingApprovals, '获取待审核申请成功');

  } catch (error: any) {
    console.error('[教师权限管理] 获取待审核申请失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`获取待审核申请失败: ${error.message}`);
  }
};

/**
 * 获取所有教师权限记录（包括已审核、待审核等）
 */
export const getAllTeacherApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const { status, page = 1, pageSize = 10 } = req.query;

    // 获取用户的幼儿园ID
    const kindergartenId = user.kindergartenId;

    if (!kindergartenId) {
      throw ApiError.badRequest('您未关联到任何幼儿园，无法查看权限记录');
    }

    console.log('[教师权限管理] 获取所有权限记录:', {
      kindergartenId,
      status,
      page,
      pageSize
    });

    // 获取教师权限记录
    const approvals = await TeacherApprovalService.getTeacherApprovals(
      user.id, // 这里可以根据需要调整
      kindergartenId
    );

    // 根据状态过滤
    let filteredApprovals = approvals;
    if (status && typeof status === 'string') {
      filteredApprovals = approvals.filter(approval => approval.status === status);
    }

    // 分页处理
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedApprovals = filteredApprovals.slice(startIndex, endIndex);

    const response = {
      items: paginatedApprovals,
      total: filteredApprovals.length,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(filteredApprovals.length / pageSizeNum)
    };

    ApiResponse.success(res, response, '获取教师权限记录成功');

  } catch (error: any) {
    console.error('[教师权限管理] 获取权限记录失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`获取权限记录失败: ${error.message}`);
  }
};

/**
 * 审核教师权限申请
 */
export const approveTeacherRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const {
      approved,
      approveNote,
      rejectReason,
      expiryDate,
      isPermanent = false
    } = req.body;

    if (!id || isNaN(parseInt(id))) {
      throw ApiError.badRequest('无效的权限申请ID');
    }

    const approvalId = parseInt(id);
    const assignerId = user.id;
    const assignerType = user.role === 'principal' ? 'principal' : 'admin';

    console.log('[教师权限管理] 审核教师权限申请:', {
      approvalId,
      assignerId,
      assignerType,
      approved
    });

    const updatedApproval = await TeacherApprovalService.approveTeacher(
      approvalId,
      assignerId,
      assignerType,
      {
        approved,
        approveNote,
        rejectReason,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        isPermanent
      }
    );

    const message = approved ? '教师权限申请审核通过' : '教师权限申请已拒绝';

    ApiResponse.success(res, updatedApproval, message);

  } catch (error: any) {
    console.error('[教师权限管理] 审核教师权限申请失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`审核教师权限申请失败: ${error.message}`);
  }
};

/**
 * 批量审核教师权限申请
 */
export const batchApproveTeacherRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const {
      approvalIds,
      approved,
      approveNote,
      rejectReason
    } = req.body;

    if (!approvalIds || !Array.isArray(approvalIds) || approvalIds.length === 0) {
      throw ApiError.badRequest('请选择要审核的权限申请');
    }

    const assignerId = user.id;
    const assignerType = user.role === 'principal' ? 'principal' : 'admin';

    console.log('[教师权限管理] 批量审核教师权限申请:', {
      approvalIds: approvalIds.length,
      assignerId,
      assignerType,
      approved
    });

    const result = await TeacherApprovalService.batchApproveTeachers(
      approvalIds,
      assignerId,
      assignerType,
      approved,
      approveNote,
      rejectReason
    );

    const message = approved
      ? `批量审核通过成功：${result.success}个申请，失败：${result.failed}个`
      : `批量拒绝成功：${result.success}个申请，失败：${result.failed}个`;

    ApiResponse.success(res, result, message);

  } catch (error: any) {
    console.error('[教师权限管理] 批量审核教师权限申请失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`批量审核教师权限申请失败: ${error.message}`);
  }
};

/**
 * 暂停或恢复教师权限
 */
export const toggleTeacherPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { suspend } = req.body;

    if (!id || isNaN(parseInt(id))) {
      throw ApiError.badRequest('无效的权限记录ID');
    }

    const approvalId = parseInt(id);

    console.log('[教师权限管理] 切换教师权限状态:', {
      approvalId,
      suspend
    });

    const updatedApproval = await TeacherApprovalService.toggleTeacherApproval(
      approvalId,
      suspend
    );

    const message = suspend ? '教师权限已暂停' : '教师权限已恢复';

    ApiResponse.success(res, updatedApproval, message);

  } catch (error: any) {
    console.error('[教师权限管理] 切换教师权限状态失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`切换教师权限状态失败: ${error.message}`);
  }
};

/**
 * 获取教师权限统计数据
 */
export const getTeacherPermissionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const kindergartenId = user.kindergartenId;

    if (!kindergartenId) {
      throw ApiError.badRequest('您未关联到任何幼儿园，无法查看统计数据');
    }

    console.log('[教师权限管理] 获取权限统计数据:', {
      kindergartenId
    });

    // 获取所有教师权限记录
    const approvals = await TeacherApprovalService.getTeacherApprovals(
      user.id,
      kindergartenId
    );

    // 统计各状态数量
    const stats = {
      total: approvals.length,
      pending: approvals.filter(a => a.status === TeacherApprovalStatus.PENDING).length,
      approved: approvals.filter(a => a.status === TeacherApprovalStatus.APPROVED).length,
      rejected: approvals.filter(a => a.status === TeacherApprovalStatus.REJECTED).length,
      suspended: approvals.filter(a => a.status === TeacherApprovalStatus.SUSPENDED).length,

      // 按权限范围统计
      scopeStats: {
        basic: approvals.filter(a => a.approvalScope === TeacherApprovalScope.BASIC).length,
        student_management: approvals.filter(a => a.approvalScope === TeacherApprovalScope.STUDENT_MANAGEMENT).length,
        attendance_management: approvals.filter(a => a.approvalScope === TeacherApprovalScope.ATTENDANCE_MANAGEMENT).length,
        activity_management: approvals.filter(a => a.approvalScope === TeacherApprovalScope.ACTIVITY_MANAGEMENT).length,
        teaching_management: approvals.filter(a => a.approvalScope === TeacherApprovalScope.TEACHING_MANAGEMENT).length,
        all: approvals.filter(a => a.approvalScope === TeacherApprovalScope.ALL).length
      }
    };

    ApiResponse.success(res, stats, '获取教师权限统计数据成功');

  } catch (error: any) {
    console.error('[教师权限管理] 获取权限统计数据失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`获取权限统计数据失败: ${error.message}`);
  }
};

/**
 * 获取指定教师的权限详情
 */
export const getTeacherPermissionDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user as any;

    if (!id || isNaN(parseInt(id))) {
      throw ApiError.badRequest('无效的教师ID');
    }

    const teacherId = parseInt(id);
    const kindergartenId = user.kindergartenId;

    if (!kindergartenId) {
      throw ApiError.badRequest('您未关联到任何幼儿园，无法查看权限详情');
    }

    console.log('[教师权限管理] 获取教师权限详情:', {
      teacherId,
      kindergartenId
    });

    const approvals = await TeacherApprovalService.getTeacherApprovals(
      teacherId,
      kindergartenId
    );

    if (approvals.length === 0) {
      throw ApiError.notFound('未找到该教师的权限记录');
    }

    ApiResponse.success(res, approvals[0], '获取教师权限详情成功');

  } catch (error: any) {
    console.error('[教师权限管理] 获取教师权限详情失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`获取教师权限详情失败: ${error.message}`);
  }
};

export default {
  getPendingTeacherApprovals,
  getAllTeacherApprovals,
  approveTeacherRequest,
  batchApproveTeacherRequests,
  toggleTeacherPermission,
  getTeacherPermissionStats,
  getTeacherPermissionDetail
};