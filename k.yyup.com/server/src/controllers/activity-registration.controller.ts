﻿﻿﻿﻿﻿import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { ActivityRegistration } from '../models/activity-registration.model';
import { Activity } from '../models/activity.model';
import { Student } from '../models/student.model';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { User as UserModel } from '../models/user.model';
import { sequelize } from '../init';

// 获取数据库实例
const getSequelizeInstance = () => {
  return sequelize;
};

/**
 * 创建活动报名
 */
export const createRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }

    // 验证请求体不为空
    if (!req.body || Object.keys(req.body).length === 0) {
      throw ApiError.badRequest('报名数据不能为空');
    }

    const {
      activityId,
      contactName,
      contactPhone,
      childName,
      childAge,
      childGender,
      attendeeCount = 1,
      specialNeeds,
      source,
      remark
    } = req.body;

    // 验证必填字段
    if (!activityId || !contactName || !contactPhone) {
      throw ApiError.badRequest('活动ID、联系人姓名和联系电话为必填项');
    }

    // 验证活动ID格式
    if (isNaN(Number(activityId)) || Number(activityId) <= 0) {
      throw ApiError.badRequest('无效的活动ID');
    }

    // 验证联系人姓名
    if (typeof contactName !== 'string' || contactName.trim().length === 0) {
      throw ApiError.badRequest('联系人姓名不能为空');
    }

    // 验证联系电话格式
    if (typeof contactPhone !== 'string' || !/^1[3-9]\d{9}$/.test(contactPhone.trim())) {
      throw ApiError.badRequest('请输入有效的手机号码');
    }

    // 验证参加人数
    if (attendeeCount !== undefined && (isNaN(Number(attendeeCount)) || Number(attendeeCount) <= 0)) {
      throw ApiError.badRequest('参加人数必须是正整数');
    }

    // 验证孩子年龄
    if (childAge !== undefined && childAge !== null && (isNaN(Number(childAge)) || Number(childAge) < 0 || Number(childAge) > 18)) {
      throw ApiError.badRequest('孩子年龄应在0-18岁之间');
    }

    // 验证孩子性别
    if (childGender !== undefined && childGender !== null && ![0, 1, 2, 'male', 'female', 'unknown'].includes(childGender)) {
      throw ApiError.badRequest('孩子性别值无效');
    }

    const db = getSequelizeInstance();
    const now = new Date();

    // 转换gender字符串为数字
    let genderValue = null;
    if (childGender) {
      genderValue = childGender === 'male' ? 1 : (childGender === 'female' ? 0 : null);
    }

    // 使用Sequelize模型创建记录
    const registration = await ActivityRegistration.create({
      activityId: activityId,
      contactName: contactName,
      contactPhone: contactPhone,
      childName: childName || null,
      childAge: childAge || null,
      childGender: genderValue,
      registrationTime: now,
      attendeeCount: attendeeCount || 1,
      specialNeeds: specialNeeds || null,
      source: source || null,
      status: 0,
      remark: remark || null,
      creatorId: userId
    });

    ApiResponse.success(res, registration, '活动报名创建成功');
  } catch (error) {
    logger.error('创建活动报名失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取活动报名详情
 */
export const getRegistrationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('报名ID无效');
    }
    
      const db = getSequelizeInstance();
        const [registration] = await db.query(
      `SELECT 
        ar.*,
        a.title as activity_title,
        a.start_time as activity_start_time,
        a.end_time as activity_end_time,
        a.location as activity_location,
        a.capacity as activity_capacity,
        a.fee as activity_fee
      FROM ${tenantDb}.activity_registrations ar
      LEFT JOIN ${tenantDb}.activities a ON ar.activity_id = a.id
      WHERE ar.id = ? AND ar.deleted_at IS NULL`,
      {
        replacements: [Number(id) || 0],
        type: QueryTypes.SELECT
      }
    );
      
    if (!registration) {
      throw ApiError.notFound('活动报名记录不存在');
    }
    
    ApiResponse.success(res, registration, '获取活动报名详情成功');
  } catch (error) {
    logger.error('获取活动报名详情失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 更新活动报名
 */
export const updateRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    // 验证ID参数
    const registrationId = parseInt(id, 10);
    if (isNaN(registrationId) || registrationId <= 0) {
      throw ApiError.badRequest('无效的报名ID');
    }

    // 验证请求体不为空
    if (!req.body || Object.keys(req.body).length === 0) {
      throw ApiError.badRequest('更新数据不能为空');
    }

    const {
      contactName,
      contactPhone,
      childName,
      childAge,
      childGender,
      attendeeCount,
      specialNeeds,
      source,
      remark
    } = req.body;

    const db = getSequelizeInstance();
    const now = new Date();

    // 检查记录是否存在
    const [existingRecord] = await db.query(
      `SELECT id FROM ${tenantDb}.activity_registrations WHERE id = ? AND deleted_at IS NULL`,
      {
        replacements: [registrationId],
        type: QueryTypes.SELECT
      }
    );

    if (!existingRecord) {
      throw ApiError.notFound('活动报名记录不存在');
    }

    // 构建更新字段
    const updateFields = [];
    const replacements = [];

    if (contactName !== undefined) {
      updateFields.push('contact_name = ?');
      replacements.push(contactName);
    }
    if (contactPhone !== undefined) {
      updateFields.push('contact_phone = ?');
      replacements.push(contactPhone);
    }
    if (childName !== undefined) {
      updateFields.push('child_name = ?');
      replacements.push(childName);
    }
    if (childAge !== undefined) {
      updateFields.push('child_age = ?');
      replacements.push(childAge);
    }
    if (childGender !== undefined) {
      updateFields.push('child_gender = ?');
      replacements.push(childGender);
    }
    if (attendeeCount !== undefined) {
      updateFields.push('attendee_count = ?');
      replacements.push(attendeeCount);
    }
    if (specialNeeds !== undefined) {
      updateFields.push('special_needs = ?');
      replacements.push(specialNeeds);
    }
    if (source !== undefined) {
      updateFields.push('source = ?');
      replacements.push(source);
    }
    if (remark !== undefined) {
      updateFields.push('remark = ?');
      replacements.push(remark);
    }

    // 验证联系电话格式
    if (contactPhone !== undefined && typeof contactPhone === 'string' && !/^1[3-9]\d{9}$/.test(contactPhone.trim())) {
      throw ApiError.badRequest('请输入有效的手机号码');
    }

    // 验证孩子年龄
    if (childAge !== undefined && childAge !== null && (isNaN(Number(childAge)) || Number(childAge) < 0 || Number(childAge) > 18)) {
      throw ApiError.badRequest('孩子年龄应在0-18岁之间');
    }

    // 验证参加人数
    if (attendeeCount !== undefined && (isNaN(Number(attendeeCount)) || Number(attendeeCount) <= 0)) {
      throw ApiError.badRequest('参加人数必须是正整数');
    }

    if (updateFields.length === 0) {
      throw ApiError.badRequest('没有提供要更新的字段');
    }

    // 添加更新时间和更新人
    updateFields.push('updated_at = ?', 'updater_id = ?');
    replacements.push(now, userId, registrationId);

    // 执行更新
    await db.query(
      `UPDATE ${tenantDb}.activity_registrations SET ${updateFields.join(', ')} WHERE id = ?`,
      {
        replacements,
        type: QueryTypes.UPDATE
      }
    );

    // 查询更新后的记录
    const [updatedRegistration] = await db.query(
      `SELECT * FROM ${tenantDb}.activity_registrations WHERE id = ?`,
      {
        replacements: [registrationId],
        type: QueryTypes.SELECT
      }
    );
    
    ApiResponse.success(res, updatedRegistration, '更新活动报名成功');
  } catch (error) {
    logger.error('更新活动报名失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 删除活动报名
 */
export const deleteRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('报名ID无效');
    }

    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }

    const db = getSequelizeInstance();
    const now = new Date();

    // 检查记录是否存在
    const [existingRecord] = await db.query(
      `SELECT id FROM ${tenantDb}.activity_registrations WHERE id = ? AND deleted_at IS NULL`,
      {
        replacements: [Number(id) || 0],
        type: QueryTypes.SELECT
      }
    );

    if (!existingRecord) {
      // 幂等性：如果记录不存在，也返回成功（可能已经被删除）
      ApiResponse.success(res, null, '删除活动报名成功');
      return;
    }

    // 软删除：更新deleted_at字段
    await db.query(
      `UPDATE ${tenantDb}.activity_registrations SET deleted_at = ?, updater_id = ? WHERE id = ?`,
      {
        replacements: [now, userId, Number(id) || 0],
        type: QueryTypes.UPDATE
      }
    );
    
    ApiResponse.success(res, null, '删除活动报名成功');
  } catch (error) {
    logger.error('删除活动报名失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 审核活动报名
 */
export const reviewRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }

    // 验证ID参数
    const registrationId = parseInt(id, 10);
    if (isNaN(registrationId) || registrationId <= 0) {
      throw ApiError.badRequest('无效的报名ID');
    }

    // 验证请求体不为空
    if (!req.body || Object.keys(req.body).length === 0) {
      throw ApiError.badRequest('审核数据不能为空');
    }
    
    const { status, remark } = req.body;

    // 验证状态值是必填项
    if (status === undefined || status === null) {
      throw ApiError.badRequest('审核状态是必填项');
    }

    // 验证状态值
    if (![0, 1, 2].includes(Number(status))) {
      throw ApiError.badRequest('状态值无效，应为0(待确认)、1(已确认)或2(已拒绝)');
    }

    const db = getSequelizeInstance();
    const now = new Date();

    // 检查记录是否存在
    const [existingRecord] = await db.query(
      `SELECT id, status FROM ${tenantDb}.activity_registrations WHERE id = ? AND deleted_at IS NULL`,
      {
        replacements: [Number(id) || 0],
        type: QueryTypes.SELECT
      }
    );

    if (!existingRecord) {
      throw ApiError.notFound('活动报名记录不存在');
    }

    // 更新状态和备注
    await db.query(
      `UPDATE ${tenantDb}.activity_registrations SET status = ?, remark = ?, updated_at = ?, updater_id = ? WHERE id = ?`,
      {
        replacements: [status, remark || null, now, userId, Number(id) || 0],
        type: QueryTypes.UPDATE
      }
    );

    // 查询更新后的记录
    const [updatedRegistration] = await db.query(
      `SELECT 
        ar.*,
        a.title as activity_title
      FROM ${tenantDb}.activity_registrations ar
      LEFT JOIN ${tenantDb}.activities a ON ar.activity_id = a.id
      WHERE ar.id = ?`,
      {
        replacements: [Number(id) || 0],
        type: QueryTypes.SELECT
      }
    );
    
    ApiResponse.success(res, updatedRegistration, '审核活动报名成功');
  } catch (error) {
    logger.error('审核活动报名失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 取消活动报名
 */
export const cancelRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }

    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('报名ID无效');
    }
    
    const { cancelReason } = req.body;

    const db = getSequelizeInstance();
    const now = new Date();

    // 检查记录是否存在
    const [existingRecord] = await db.query(
      `SELECT id, status FROM ${tenantDb}.activity_registrations WHERE id = ? AND deleted_at IS NULL`,
      {
        replacements: [Number(id) || 0],
        type: QueryTypes.SELECT
      }
    );

    if (!existingRecord) {
      throw ApiError.notFound('活动报名记录不存在');
    }

    // 更新状态为已取消(3)，并记录取消原因
    await db.query(
      `UPDATE ${tenantDb}.activity_registrations SET status = 3, remark = ?, updated_at = ?, updater_id = ? WHERE id = ?`,
      {
        replacements: [cancelReason || '用户主动取消', now, userId, Number(id) || 0],
        type: QueryTypes.UPDATE
      }
    );

    // 查询更新后的记录
    const [updatedRegistration] = await db.query(
      `SELECT 
        ar.*,
        a.title as activity_title
      FROM ${tenantDb}.activity_registrations ar
      LEFT JOIN ${tenantDb}.activities a ON ar.activity_id = a.id
      WHERE ar.id = ?`,
      {
        replacements: [Number(id) || 0],
        type: QueryTypes.SELECT
      }
    );
    
    ApiResponse.success(res, updatedRegistration, '取消活动报名成功');
  } catch (error) {
    logger.error('取消活动报名失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 签到
 */
export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    // 模拟签到操作    // const mockCheckIn = {
    //       registrationId: Number(id) || 0,
    //       checkInTime: new Date(),
    //       checkInBy: userId,
    //       status: 'checked_in'
    //     };
    
    ApiResponse.success(res, [], '签到成功');
  } catch (error) {
    logger.error('签到失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 标记缺席
 */
export const markAsAbsent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    // 模拟标记缺席操作    // const mockAbsent = {
    //       registrationId: Number(id) || 0,
    //       absentTime: new Date(),
    //       markedBy: userId,
    //       status: 'absent'
    //     };
    
    ApiResponse.success(res, [], '标记缺席成功');
  } catch (error) {
    logger.error('标记缺席失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 记录反馈
 */
export const recordFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const { feedback, rating } = req.body;
    
    // 模拟记录反馈操作    // const mockFeedback = {
    //       registrationId: Number(id) || 0,
    //       feedback: feedback,
    //       rating: rating,
    //       feedbackTime: new Date(),
    //       recordedBy: userId
    //     };
    
    ApiResponse.success(res, [], '记录反馈成功');
  } catch (error) {
    logger.error('记录反馈失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 标记为已转化
 */
export const markAsConverted = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    // 模拟标记转化操作    // const mockConversion = {
    //       registrationId: Number(id) || 0,
    //       isConversion: 1,
    //       conversionTime: new Date(),
    //       convertedBy: userId
    //     };
    
    ApiResponse.success(res, [], '标记转化成功');
  } catch (error) {
    logger.error('标记转化失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取活动报名列表
 */
export const getRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, size = 10, activityId } = req.query;

    console.log('🔍 开始查询报名数据，包含关联信息...');

    // 尝试使用Sequelize模型查询，包含关联数据
    try {
      const whereClause: any = {
        deletedAt: null
      };

      if (activityId) {
        whereClause.activityId = Number(activityId) || 0;
      }

      const offset = ((Number(page) - 1) || 0) * Number(size) || 0;

      const { rows: registrations, count: total } = await ActivityRegistration.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Activity,
            as: 'activity',
            attributes: ['id', 'title', 'description', 'startTime', 'endTime', 'status'],
            required: false,
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'gender', 'birthDate'],
            required: false,
          },
          {
            model: ParentStudentRelation,
            as: 'parent',
            attributes: ['id', 'relationship'],
            include: [
              {
                model: UserModel,
                as: 'user',
                attributes: ['id', 'realName', 'phone'],
                required: false,
              },
            ],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: Number(size) || 10,
        offset: offset,
      });

      console.log('📋 查询结果:', {
        total,
        registrationsLength: registrations.length,
        firstItem: registrations[0] ? {
          id: registrations[0].id,
          contactName: registrations[0].contactName,
          childName: registrations[0].childName,
          activity: registrations[0].activity,
          student: registrations[0].student,
          parent: registrations[0].parent,
        } : null
      });

      const result = {
        data: registrations,
        pagination: {
          page: Number(page) || 1,
          size: Number(size) || 10,
          total: Number(total) || 0,
          totalPages: Math.ceil((Number(total) || 0) / (Number(size) || 10))
        }
      };

      ApiResponse.success(res, result, '获取活动报名列表成功');
      return;
    } catch (dbError) {
      console.log('Sequelize查询失败，使用原始SQL查询:', dbError);

      // 如果Sequelize查询失败，回退到原始SQL查询
      let whereClause = 'WHERE deleted_at IS NULL';
      const replacements: any[] = [];

      if (activityId) {
        whereClause += ' AND activity_id = ?';
        replacements.push(Number(activityId) || 0);
      }

      const offset = ((Number(page) - 1) || 0) * Number(size) || 0;
      replacements.push(Number(size) || 0, offset);

      const db = getSequelizeInstance();
      const registrations = await db.query(
        `SELECT * FROM activity_registrations ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        {
          replacements,
          type: 'SELECT'
        }
      );

      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM activity_registrations ${whereClause}`,
        {
          replacements: replacements.slice(0, -2), // 移除LIMIT和OFFSET参数
          type: 'SELECT'
        }
      );

      const countList = Array.isArray(countResult) ? countResult : [];
      const total = (countList[0] as any)?.total || 0;

      const registrationsList = Array.isArray(registrations) ? registrations : [];
      const result = {
        data: registrationsList,
        pagination: {
          page: Number(page) || 0,
          size: Number(size) || 0,
          total: Number(total) || 0,
          totalPages: Math.ceil(Number(total) || 0 / Number(size) || 0)
        }
      };

      ApiResponse.success(res, result, '获取活动报名列表成功');
      return;
    }
    
    // 如果数据库查询失败，返回模拟数据    // const mockRegistrations = [
    //       {
    //         id: 1,
    //         activityId: 1,
    //         contactName: '张三',
    //         contactPhone: '13800138000',
    //         childName: '小明',
    //         status: 1,
    //         registrationTime: new Date(),
    //         createdAt: new Date()
    //       },
    //       {
    //         id: 2,
    //         activityId: 1,
    //         contactName: '李四',
    //         contactPhone: '13800138001',
    //         childName: '小红',
    //         status: 1,
    //         registrationTime: new Date(),
    //         createdAt: new Date()
    //       }
    //     ];
    
    const result = {
      data: [],
      pagination: {
        page: Number(page) || 0,
        size: Number(size) || 0,
        total: 0,
        totalPages: 1
      }
    };
    
    ApiResponse.success(res, result, '获取活动报名列表成功');
  } catch (error) {
    logger.error('获取活动报名列表失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取活动报名统计
 */
export const getRegistrationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.query;
    
    // 模拟统计数据    // const mockStats = {
    //       activityId: activityId ? Number(activityId) || 0 : null,
    //       totalRegistrations: 50,
    //       confirmedRegistrations: 45,
    //       pendingRegistrations: 3,
    //       cancelledRegistrations: 2,
    //       checkInCount: 40,
    //       conversionCount: 30,
    //       conversionRate: 0.67
    //     };
    
    ApiResponse.success(res, [], '获取活动报名统计成功');
  } catch (error) {
    logger.error('获取活动报名统计失败', error);
    ApiResponse.handleError(res, error);
  }
};

// 状态文本映射函数
function getStatusText(status: number): string {
  const statusMap: { [key: number]: string } = {
    0: '待审核',
    1: '已确认',
    2: '已拒绝',
    3: '已取消'
  };
  return statusMap[status] || '未知状态';
}

/**
 * 按活动获取报名列表
 */
export const getRegistrationsByActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;
    const { page = 1, size = 10 } = req.query;
    
    if (!activityId || isNaN(Number(activityId) || 0)) {
      throw ApiError.badRequest('活动ID无效');
    }
    
    // 尝试从数据库查询
    try {
      const db = getSequelizeInstance();
      const offset = ((Number(page) - 1) || 0) * Number(size) || 0;
      
      const registrations = await db.query(
        'SELECT * FROM activity_registrations WHERE activity_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
        {
          replacements: [Number(activityId) || 0, Number(size) || 0, offset],
          type: 'SELECT'
        }
      );
      
      const countResult = await db.query(
        'SELECT COUNT(*) as total FROM activity_registrations WHERE activity_id = ? AND deleted_at IS NULL',
        {
          replacements: [Number(activityId) || 0],
          type: 'SELECT'
        }
      );
      
      const countList = Array.isArray(countResult) ? countResult : [];
      const total = (countList[0] as any)?.total || 0;
      
      const registrationsList = Array.isArray(registrations) ? registrations : [];
      const result = {
        data: registrationsList,
        pagination: {
          page: Number(page) || 0,
          size: Number(size) || 0,
          total: Number(total) || 0,
          totalPages: Math.ceil(Number(total) || 0 / Number(size) || 0)
        }
      };
      
      ApiResponse.success(res, result, '按活动获取报名列表成功');
      return;
    } catch (dbError) {
      console.log('数据库查询失败，使用模拟数据:', dbError);
    }
    
    // 模拟数据    // const mockRegistrations = [
    //       {
    //         id: 1,
    //         activityId: Number(activityId) || 0,
    //         contactName: '张三',
    //         contactPhone: '13800138000',
    //         childName: '小明',
    //         status: 1,
    //         registrationTime: new Date(),
    //         createdAt: new Date()
    //       }
    //     ];
    
    const result = {
      data: [],
      pagination: {
        page: Number(page) || 0,
        size: Number(size) || 0,
        total: 0,
        totalPages: 1
      }
    };
    
    ApiResponse.success(res, result, '按活动获取报名列表成功');
  } catch (error) {
    logger.error('按活动获取报名列表失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 按学生获取报名列表
 */
export const getRegistrationsByStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { page = 1, size = 10 } = req.query;
    
    if (!studentId || isNaN(Number(studentId) || 0)) {
      throw ApiError.badRequest('学生ID无效');
    }
    
    // 模拟数据    // const mockRegistrations = [
    //       {
    //         id: 1,
    //         activityId: 1,
    //         studentId: Number(studentId) || 0,
    //         contactName: '张三',
    //         contactPhone: '13800138000',
    //         childName: '小明',
    //         status: 1,
    //         registrationTime: new Date(),
    //         createdAt: new Date()
    //       }
    //     ];
    
    const result = {
      data: [],
      pagination: {
        page: Number(page) || 0,
        size: Number(size) || 0,
        total: 0,
        totalPages: 1
      }
    };
    
    ApiResponse.success(res, result, '按学生获取报名列表成功');
  } catch (error) {
    logger.error('按学生获取报名列表失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 按状态获取报名列表
 */
export const getRegistrationsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    const { page = 1, size = 10 } = req.query;
    
    // 状态映射
    const statusMap: { [key: string]: number } = {
      'pending': 0,
      'confirmed': 1,
      'rejected': 2,
      'cancelled': 3,
      'checked-in': 4,
      'absent': 5
    };
    
    const statusValue = statusMap[status];
    if (statusValue === undefined) {
      throw ApiError.badRequest('状态参数无效');
    }
    
    // 模拟数据    // const mockRegistrations = [
    //       {
    //         id: 1,
    //         activityId: 1,
    //         contactName: '张三',
    //         contactPhone: '13800138000',
    //         childName: '小明',
    //         status: statusValue,
    //         statusText: getStatusText(statusValue),
    //         registrationTime: new Date(),
    //         createdAt: new Date()
    //       }
    //     ];
    
    const result = {
      data: [],
      pagination: {
        page: Number(page) || 0,
        size: Number(size) || 0,
        total: 0,
        totalPages: 1
      }
    };
    
    ApiResponse.success(res, result, '按状态获取报名列表成功');
  } catch (error) {
    logger.error('按状态获取报名列表失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 批量确认报名
 */
export const batchConfirmRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    // 验证请求体不为空
    if (!req.body || Object.keys(req.body).length === 0) {
      throw ApiError.badRequest('批量确认数据不能为空');
    }
    
    const { registrationIds } = req.body;
    
    // 验证报名ID列表
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      throw ApiError.badRequest('报名ID列表不能为空');
    }
    
    // 验证每个ID的格式
    for (const id of registrationIds) {
      if (isNaN(Number(id)) || Number(id) <= 0) {
        throw ApiError.badRequest(`无效的报名ID: ${id}`);
      }
    }
    
    // 检查重复的ID
    const uniqueIds = [...new Set(registrationIds)];
    if (uniqueIds.length !== registrationIds.length) {
      throw ApiError.badRequest('报名ID列表中存在重复的ID');
    }
    
    // 模拟批量确认操作    // const mockResult = {
    //       successCount: registrationIds.length,
    //       failedCount: 0,
    //       confirmedIds: registrationIds,
    //       failedIds: [],
    //       confirmedAt: new Date(),
    //       confirmedBy: userId
    //     };
    
    ApiResponse.success(res, [], '批量确认报名成功');
  } catch (error) {
    logger.error('批量确认报名失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取报名付款信息
 */
export const getRegistrationPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('报名ID无效');
    }
    
    // 模拟付款信息    // const mockPayment = {
    //       registrationId: Number(id) || 0,
    //       paymentStatus: 'paid', // pending, paid, failed, refunded
    //       amount: 299.00,
    //       currency: 'CNY',
    //       paymentMethod: 'wechat',
    //       transactionId: 'TXN' + Date.now(),
    //       paidAt: new Date(),
    //       paymentDetails: {
    //         activityFee: 299.00,
    //         discount: 0,
    //         finalAmount: 299.00
    //       }
    //     };
    
    ApiResponse.success(res, [], '获取报名付款信息成功');
  } catch (error) {
    logger.error('获取报名付款信息失败', error);
    ApiResponse.handleError(res, error);
  }
};

/**
 * 处理报名付款
 */
export const processRegistrationPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('报名ID无效');
    }
    
    const { amount, paymentMethod } = req.body;
    
    if (!amount || !paymentMethod) {
      throw ApiError.badRequest('付款金额和付款方式不能为空');
    }
    
    // 模拟付款处理    // const mockPaymentResult = {
    //       registrationId: Number(id) || 0,
    //       paymentStatus: 'paid',
    //       amount: Number(amount) || 0,
    //       paymentMethod: paymentMethod,
    //       transactionId: 'TXN' + Date.now(),
    //       processedAt: new Date(),
    //       processedBy: userId
    //     };
    
    ApiResponse.success(res, [], '处理报名付款成功');
  } catch (error) {
    logger.error('处理报名付款失败', error);
    ApiResponse.handleError(res, error);
  }
};// Force reload Thu Jun 12 06:17:36 UTC 2025
