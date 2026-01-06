/**
 * 教师权限检查中间件
 * 用于检查教师是否有相应的权限，并实现数据过滤
 */

import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { TeacherApprovalService } from '../services/teacher-approval.service';
import { TeacherApprovalScope } from '../models/teacher-approval.model';
import { ApiResponse } from '../utils/apiResponse';

// 扩展 Request 类型以包含权限检查结果
declare global {
  namespace Express {
    interface Request {
      teacherPermission?: {
        hasPermission: boolean;
        dataAccessLevel: 'full' | 'limited' | 'none';
        status?: string;
        approval?: any;
        reason?: string;
      };
    }
  }
}

/**
 * 检查教师基础权限的中间件
 * 允许查看界面，但根据权限状态返回不同级别的数据
 */
export const checkTeacherBasicPermission = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;

  // 如果不是教师角色，直接通过
  if (!user || user.role !== 'teacher') {
    return next();
  }

  // 检查教师权限
  TeacherApprovalService.checkTeacherPermission(
    user.id,
    TeacherApprovalScope.BASIC,
    user.kindergartenId
  ).then(permissionResult => {
    // 将权限结果附加到请求对象
    req.teacherPermission = permissionResult;

    // 记录权限检查结果
    console.log('[教师权限中间件] 权限检查结果:', {
      userId: user.id,
      dataAccessLevel: permissionResult.dataAccessLevel,
      hasPermission: permissionResult.hasPermission,
      status: permissionResult.status
    });

    next();
  }).catch(error => {
    console.error('[教师权限中间件] 权限检查失败:', error);

    // 权限检查失败时，设置为无权限状态
    req.teacherPermission = {
      hasPermission: false,
      dataAccessLevel: 'none',
      reason: '权限检查服务异常'
    };

    next();
  });
};

/**
 * 检查教师特定权限的中间件
 * 用于需要特定权限才能访问的功能
 */
export const checkTeacherSpecificPermission = (
  requiredPermission: TeacherApprovalScope,
  allowLimitedAccess = true
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    // 如果不是教师角色，直接通过
    if (!user || user.role !== 'teacher') {
      return next();
    }

    // 检查教师权限
    TeacherApprovalService.checkTeacherPermission(
      user.id,
      requiredPermission,
      user.kindergartenId
    ).then(permissionResult => {
      // 将权限结果附加到请求对象
      req.teacherPermission = permissionResult;

      // 记录权限检查结果
      console.log('[教师权限中间件] 特定权限检查结果:', {
        userId: user.id,
        requiredPermission,
        dataAccessLevel: permissionResult.dataAccessLevel,
        hasPermission: permissionResult.hasPermission,
        status: permissionResult.status
      });

      // 如果要求完全权限但只有有限权限，返回403
      if (!allowLimitedAccess && permissionResult.dataAccessLevel === 'limited') {
        return ApiResponse.error(
          res,
          permissionResult.reason || '权限不足，需要完全访问权限',
          'TEACHER_PERMISSION_INSUFFICIENT',
          403
        );
      }

      next();
    }).catch(error => {
      console.error('[教师权限中间件] 特定权限检查失败:', error);

      return ApiResponse.error(
        res,
        '权限检查失败',
        'TEACHER_PERMISSION_ERROR',
        500
      );
    });
  };
};

/**
 * 学生管理权限检查中间件
 */
export const checkTeacherStudentPermission = checkTeacherSpecificPermission(
  TeacherApprovalScope.STUDENT_MANAGEMENT
);

/**
 * 考勤管理权限检查中间件
 */
export const checkTeacherAttendancePermission = checkTeacherSpecificPermission(
  TeacherApprovalScope.ATTENDANCE_MANAGEMENT
);

/**
 * 活动管理权限检查中间件
 */
export const checkTeacherActivityPermission = checkTeacherSpecificPermission(
  TeacherApprovalScope.ACTIVITY_MANAGEMENT
);

/**
 * 教学管理权限检查中间件
 */
export const checkTeacherTeachingPermission = checkTeacherSpecificPermission(
  TeacherApprovalScope.TEACHING_MANAGEMENT
);

/**
 * 数据过滤中间件
 * 根据教师权限过滤API响应数据
 */
export const filterDataForTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;
  const teacherPermission = req.teacherPermission;

  // 如果不是教师或有完全权限，直接通过
  if (!user || user.role !== 'teacher' || !teacherPermission || teacherPermission.dataAccessLevel === 'full') {
    return next();
  }

  // 保存原始的 res.json 方法
  const originalJson = res.json;

  // 重写 res.json 方法
  res.json = function(data: any) {
    try {
      // 如果是 ApiResponse 格式的响应
      if (data && data.data && typeof data.data === 'object') {
        console.log('[教师数据过滤] 开始过滤数据:', {
          userId: user.id,
          dataAccessLevel: teacherPermission.dataAccessLevel,
          originalDataKeys: Object.keys(data.data)
        });

        // 如果是有限权限，过滤敏感数据
        if (teacherPermission.dataAccessLevel === 'limited') {
          data.data = filterSensitiveData(data.data);
          console.log('[教师数据过滤] 数据过滤完成');
        } else if (teacherPermission.dataAccessLevel === 'none') {
          // 如果无权限，返回空数据
          data.data = Array.isArray(data.data) ? [] : {};
          console.log('[教师数据过滤] 无权限，返回空数据');
        }

        // 添加权限信息到响应中（可选，用于前端显示提示）
        if (teacherPermission.dataAccessLevel !== 'full') {
          data.permissionInfo = {
            dataAccessLevel: teacherPermission.dataAccessLevel,
            reason: teacherPermission.reason,
            status: teacherPermission.status
          };
        }
      }
    } catch (error) {
      console.error('[教师数据过滤] 数据过滤失败:', error);
    }

    // 调用原始的 res.json 方法
    return originalJson.call(this, data);
  };

  next();
};

/**
 * 过滤敏感数据
 * 根据数据类型进行不同的过滤策略
 */
function filterSensitiveData(data: any): any {
  if (Array.isArray(data)) {
    // 如果是数组，返回空数组
    return [];
  } else if (typeof data === 'object' && data !== null) {
    // 如果是对象，根据类型进行过滤
    if ('items' in data && Array.isArray(data.items)) {
      // 分页数据结构，清空 items
      return {
        ...data,
        items: [],
        total: 0
      };
    } else if ('list' in data && Array.isArray(data.list)) {
      // 列表数据结构，清空 list
      return {
        ...data,
        list: [],
        total: 0
      };
    } else {
      // 其他对象结构，返回空对象
      return {};
    }
  }

  // 其他类型直接返回
  return data;
}

/**
 * 教师过滤器请求类型
 */
export interface TeacherFilterRequest extends Request {
  userId?: number;
  permission?: any;
  dataAccessLevel?: 'full' | 'limited' | 'none';
}

/**
 * 检查教师是否可以编辑客户
 */
export const canTeacherEditCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;

  if (!user || user.role !== 'teacher') {
    return next();
  }

  // 教师需要通过审核才能编辑客户
  TeacherApprovalService.checkTeacherPermission(
    user.id,
    TeacherApprovalScope.BASIC
  ).then(permissionResult => {
    if (!permissionResult.hasPermission || permissionResult.dataAccessLevel !== 'full') {
      return ApiResponse.error(
        res,
        permissionResult.reason || '权限不足，无法编辑客户信息',
        'TEACHER_CUSTOMER_EDIT_DENIED',
        403
      );
    }

    next();
  }).catch(error => {
    console.error('[编辑客户权限检查] 错误:', error);
    return ApiResponse.error(
      res,
      '权限检查失败',
      'TEACHER_PERMISSION_ERROR',
      500
    );
  });
};

/**
 * 批量数据过滤中间件
 * 用于批量操作的数据过滤
 */
export const filterBatchDataForTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;
  const teacherPermission = req.teacherPermission;

  // 如果不是教师或有完全权限，直接通过
  if (!user || user.role !== 'teacher' || !teacherPermission || teacherPermission.dataAccessLevel === 'full') {
    return next();
  }

  // 对于无权限或有限权限的教师，阻止批量操作
  if (teacherPermission.dataAccessLevel === 'none' || teacherPermission.dataAccessLevel === 'limited') {
    return ApiResponse.error(
      res,
      '权限不足，无法执行批量操作',
      'TEACHER_BATCH_OPERATION_DENIED',
      403
    );
  }

  next();
};

/**
 * 检查教师角色中间件
 */
export const checkTeacherRole = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;

  if (!user || user.role !== 'teacher') {
    return ApiResponse.error(
      res,
      '权限不足，仅限教师访问',
      'TEACHER_ROLE_REQUIRED',
      403
    );
  }

  next();
};

/**
 * 客户池数据过滤中间件
 */
export const filterCustomerPoolForTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;

  // 如果不是教师，直接通过
  if (!user || user.role !== 'teacher') {
    return next();
  }

  // 教师需要通过审核才能访问客户池数据
  TeacherApprovalService.checkTeacherPermission(
    user.id,
    TeacherApprovalScope.BASIC
  ).then(permissionResult => {
    if (!permissionResult.hasPermission || permissionResult.dataAccessLevel === 'none') {
      return ApiResponse.error(
        res,
        permissionResult.reason || '权限不足，无法访问客户池数据',
        'TEACHER_CUSTOMER_POOL_DENIED',
        403
      );
    }

    // 如果有有限权限，过滤数据
    if (permissionResult.dataAccessLevel === 'limited') {
      const originalJson = res.json;
      res.json = function(data: any) {
        if (data && data.data && typeof data.data === 'object') {
          data.data = filterSensitiveData(data.data);
        }
        return originalJson.call(this, data);
      };
    }

    next();
  }).catch(error => {
    console.error('[客户池权限检查] 错误:', error);
    return ApiResponse.error(
      res,
      '权限检查失败',
      'TEACHER_PERMISSION_ERROR',
      500
    );
  });
};

export default {
  checkTeacherBasicPermission,
  checkTeacherSpecificPermission,
  checkTeacherStudentPermission,
  checkTeacherAttendancePermission,
  checkTeacherActivityPermission,
  checkTeacherTeachingPermission,
  filterDataForTeacher,
  filterBatchDataForTeacher,
  checkTeacherRole,
  filterCustomerPoolForTeacher,
  canTeacherEditCustomer
};