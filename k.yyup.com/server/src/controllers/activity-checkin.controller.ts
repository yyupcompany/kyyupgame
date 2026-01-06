﻿import { Request, Response } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

/**
 * 活动签到控制器
 * 提供活动签到的创建、查询、统计等功能
 */

/**
 * 签到
 * @param req 请求对象
 * @param res 响应对象
 */
export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    if (!userId) {
      res.status(401).json({ success: false, message: '未登录或登录已过期' });
      return;
    }

    const { id } = req.params;
    const { location } = req.body;

    if (!location) {
      res.status(400).json({ success: false, message: '签到地点不能为空' });
      return;
    }
    
    // 更新报名记录的签到信息
    await sequelize.query(`
      UPDATE ${tenantDb}.activity_registrations 
      SET check_in_time = NOW(), 
          check_in_location = :location,
          updated_at = NOW(),
          updater_id = :userId
      WHERE id = :registrationId AND deleted_at IS NULL
    `, {
      replacements: { 
        location, 
        userId, 
        registrationId: id 
      },
      type: QueryTypes.UPDATE
    });

    // 获取更新后的记录
    const [resultRows] = await sequelize.query(`
      SELECT ar.id, ar.activity_id, ar.contact_name, ar.contact_phone,
             ar.check_in_time, ar.check_in_location,
             a.title as activity_title
      FROM ${tenantDb}.activity_registrations ar
      LEFT JOIN ${tenantDb}.activities a ON ar.activity_id = a.id
      WHERE ar.id = :registrationId AND ar.deleted_at IS NULL
    `, {
      replacements: { registrationId: id },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];

    if (!resultRows || resultRows.length === 0) {
      res.status(404).json({ success: false, message: '签到记录不存在' });
      return;
    }

    const result = resultRows[0];
    res.json({
      success: true,
      message: '签到成功',
      data: result
    });
  } catch (error) {
    console.error('签到失败:', error);
    res.status(500).json({ success: false, message: '签到失败' });
  }
};

/**
 * 批量签到
 * @param req 请求对象
 * @param res 响应对象
 */
export const batchCheckIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    if (!userId) {
      res.status(401).json({ success: false, message: '未登录或登录已过期' });
      return;
    }

    const { registrationIds, location } = req.body;

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      res.status(400).json({ success: false, message: '报名ID列表不能为空' });
      return;
    }

    if (!location) {
      res.status(400).json({ success: false, message: '签到地点不能为空' });
      return;
    }
    
    // 批量更新签到信息
    const placeholders = registrationIds.map(() => '?').join(',');
    await sequelize.query(`
      UPDATE ${tenantDb}.activity_registrations 
      SET check_in_time = NOW(), 
          check_in_location = ?,
          updated_at = NOW(),
          updater_id = ?
      WHERE id IN (${placeholders}) AND deleted_at IS NULL
    `, {
      replacements: [location, userId, ...registrationIds],
      type: QueryTypes.UPDATE
    });

    // 获取更新结果
    const results = await sequelize.query(`
      SELECT id, contact_name, check_in_time
      FROM ${tenantDb}.activity_registrations 
      WHERE id IN (${placeholders}) AND deleted_at IS NULL
    `, {
      replacements: registrationIds,
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      message: '批量签到处理完成',
      data: {
        successCount: results.length,
        failureCount: registrationIds.length - results.length,
        details: results
      }
    });
  } catch (error) {
    console.error('批量签到失败:', error);
    res.status(500).json({ success: false, message: '批量签到失败' });
  }
};

/**
 * 获取活动签到列表
 * @param req 请求对象
 * @param res 响应对象
 */
export const getCheckins = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { 
      activityId, 
      page = 1, 
      limit = 10
    } = req.query;

    if (!activityId) {
      res.status(400).json({ success: false, message: '活动ID不能为空' });
      return;
    }

    const offset = ((Number(page) - 1) || 0) * Number(limit) || 0;

    // 获取签到列表
    const [items] = await sequelize.query(`
      SELECT ar.id, ar.contact_name, ar.contact_phone, ar.child_name,
             ar.check_in_time, ar.check_in_location, ar.registration_time,
             a.title as activity_title
      FROM ${tenantDb}.activity_registrations ar
      LEFT JOIN ${tenantDb}.activities a ON ar.activity_id = a.id
      WHERE ar.activity_id = :activityId 
        AND ar.check_in_time IS NOT NULL 
        AND ar.deleted_at IS NULL
      ORDER BY ar.check_in_time DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { 
        activityId: Number(activityId) || 0, 
        limit: Number(limit) || 0, 
        offset 
      },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];;

    // 获取总数
    const [totalResultRows] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM ${tenantDb}.activity_registrations ar
      WHERE ar.activity_id = :activityId 
        AND ar.check_in_time IS NOT NULL 
        AND ar.deleted_at IS NULL
    `, {
      replacements: { activityId: Number(activityId) || 0 },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];

    const total = (totalResultRows && totalResultRows.length > 0) ? totalResultRows[0].total : 0;

    res.json({
      success: true,
      message: '获取活动签到列表成功',
      data: {
        items,
        page: Number(page) || 0,
        limit: Number(limit) || 0,
        total: Number(total) || 0,
        totalPages: Math.ceil(Number(total) || 0 / Number(limit) || 0)
      }
    });
  } catch (error) {
    console.error('获取活动签到列表失败:', error);
    res.status(500).json({ success: false, message: '获取活动签到列表失败' });
  }
};

/**
 * 获取活动签到统计数据
 * @param req 请求对象
 * @param res 响应对象
 */
export const getCheckinStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { activityId } = req.params;
    const userId = req.user?.id;
    const userRole = (req.user as any)?.role;

    if (!activityId) {
      res.status(400).json({ success: false, message: '活动ID不能为空' });
      return;
    }

    // 教师权限检查：只能查看自己创建的活动或被分配的活动
    if (userRole === 'teacher') {
      const [teacherActivityRows] = await sequelize.query(`
        SELECT 1 FROM ${tenantDb}.activities a
        LEFT JOIN ${tenantDb}.activity_staffs ast ON a.id = ast.activity_id
        LEFT JOIN ${tenantDb}.teachers t ON (ast.teacher_id = t.id OR a.creator_id = t.user_id)
        WHERE a.id = :activityId AND t.user_id = :userId AND a.deleted_at IS NULL
      `, {
        replacements: { activityId: Number(activityId), userId },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      if (!teacherActivityRows || teacherActivityRows.length === 0) {
        res.status(403).json({ success: false, message: '无权限查看此活动的签到统计' });
        return;
      }
    }

    // 获取活动基本信息
    const [activityRows] = await sequelize.query(`
      SELECT id, title, capacity, registered_count, checked_in_count
      FROM ${tenantDb}.activities
      WHERE id = :activityId AND deleted_at IS NULL
    `, {
      replacements: { activityId: Number(activityId) },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];

    if (!activityRows || activityRows.length === 0) {
      res.status(404).json({ success: false, message: '活动不存在' });
      return;
    }

    const activity = activityRows[0];

    // 获取统计数据
    const [statsRows] = await sequelize.query(`
      SELECT
        COUNT(*) as totalRegistrations,
        SUM(CASE WHEN check_in_time IS NOT NULL THEN 1 ELSE 0 END) as checkedInCount,
        SUM(CASE WHEN check_in_time IS NULL THEN 1 ELSE 0 END) as notCheckedInCount,
        ROUND(
          SUM(CASE WHEN check_in_time IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
          2
        ) as checkInRate
      FROM ${tenantDb}.activity_registrations
      WHERE activity_id = :activityId AND deleted_at IS NULL
    `, {
      replacements: { activityId: Number(activityId) },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];

    if (!statsRows || statsRows.length === 0) {
      res.status(500).json({ success: false, message: '查询统计数据失败' });
      return;
    }

    const stats = statsRows[0];

    // 获取签到时间分布统计
    const [timeDistributionRows] = await sequelize.query(`
      SELECT
        HOUR(check_in_time) as hour,
        COUNT(*) as count
      FROM ${tenantDb}.activity_registrations
      WHERE activity_id = :activityId AND check_in_time IS NOT NULL AND deleted_at IS NULL
      GROUP BY HOUR(check_in_time)
      ORDER BY hour
    `, {
      replacements: { activityId: Number(activityId) },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];

    res.json({
      success: true,
      message: '获取活动签到统计数据成功',
      data: {
        activity: {
          id: activity.id,
          title: activity.title,
          capacity: activity.capacity,
          registeredCount: activity.registered_count,
          checkedInCount: activity.checked_in_count
        },
        statistics: {
          totalRegistrations: parseInt(stats.totalRegistrations) || 0,
          checkedInCount: parseInt(stats.checkedInCount) || 0,
          notCheckedInCount: parseInt(stats.notCheckedInCount) || 0,
          checkInRate: parseFloat(stats.checkInRate) || 0
        },
        timeDistribution: timeDistributionRows.map(row => ({
          hour: row.hour,
          count: parseInt(row.count)
        }))
      }
    });
  } catch (error) {
    console.error('获取活动签到统计数据失败:', error);
    res.status(500).json({ success: false, message: '获取活动签到统计数据失败' });
  }
};

/**
 * 导出签到数据
 * @param req 请求对象
 * @param res 响应对象
 */
export const exportCheckinData = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { activityId } = req.params;

    if (!activityId) {
      res.status(400).json({ success: false, message: '活动ID不能为空' });
      return;
    }

    // 获取签到数据
    const data = await sequelize.query(`
      SELECT ar.contact_name, ar.contact_phone, ar.child_name, ar.child_age,
             ar.registration_time, ar.check_in_time, ar.check_in_location,
             a.title as activity_title
      FROM ${tenantDb}.activity_registrations ar
      LEFT JOIN ${tenantDb}.activities a ON ar.activity_id = a.id
      WHERE ar.activity_id = :activityId AND ar.deleted_at IS NULL
      ORDER BY ar.registration_time DESC
    `, {
      replacements: { activityId: Number(activityId) || 0 },
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      message: '导出签到数据成功',
      data: {
        fileName: `activity_${activityId}_checkin_data.xlsx`,
        records: data,
        totalCount: data.length
      }
    });
  } catch (error) {
    console.error('导出签到数据失败:', error);
    res.status(500).json({ success: false, message: '导出签到数据失败' });
  }
};

/**
 * 根据手机号签到
 * @param req 请求对象
 * @param res 响应对象
 */
export const checkInByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    if (!userId) {
      res.status(401).json({ success: false, message: '未登录或登录已过期' });
      return;
    }

    const { activityId } = req.params;
    const { phone, location } = req.body;

    if (!activityId) {
      res.status(400).json({ success: false, message: '活动ID不能为空' });
      return;
    }

    if (!phone) {
      res.status(400).json({ success: false, message: '手机号不能为空' });
      return;
    }

    if (!location) {
      res.status(400).json({ success: false, message: '签到地点不能为空' });
      return;
    }

    // 查找报名记录
    const [registrationRows] = await sequelize.query(`
      SELECT id, contact_name, contact_phone, check_in_time
      FROM ${tenantDb}.activity_registrations 
      WHERE activity_id = :activityId 
        AND contact_phone = :phone 
        AND deleted_at IS NULL
    `, {
      replacements: { activityId: Number(activityId) || 0, phone },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];

    if (!registrationRows || registrationRows.length === 0) {
      res.status(404).json({ success: false, message: '未找到该手机号的报名记录' });
      return;
    }

    const registration = registrationRows[0];
    if (registration.check_in_time) {
      res.status(400).json({ success: false, message: '该报名记录已签到' });
      return;
    }

    // 更新签到信息
    await sequelize.query(`
      UPDATE ${tenantDb}.activity_registrations 
      SET check_in_time = NOW(), 
          check_in_location = :location,
          updated_at = NOW(),
          updater_id = :userId
      WHERE id = :registrationId
    `, {
      replacements: { 
        location, 
        userId, 
        registrationId: registration.id 
      },
      type: QueryTypes.UPDATE
    });

    res.json({
      success: true,
      message: '签到成功',
      data: {
        id: registration.id,
        contactName: registration.contact_name,
        contactPhone: registration.contact_phone,
        checkInTime: new Date(),
        checkInLocation: location
      }
    });
  } catch (error) {
    console.error('根据手机号签到失败:', error);
    res.status(500).json({ success: false, message: '根据手机号签到失败' });
  }
}; 