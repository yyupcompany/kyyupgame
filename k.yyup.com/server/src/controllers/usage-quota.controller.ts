/**
 * 用量配额控制器
 * @description 管理用户用量配额和预警
 */

import { Request, Response } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

export class UsageQuotaController {
  /**
   * @swagger
   * /api/usage-quota/user/{userId}:
   *   get:
   *     summary: 获取用户配额信息
   *     tags: [用量配额]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 成功获取配额信息
   */
  static async getUserQuota(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 查询用户配额设置
      const quotaSettings = await sequelize.query(
        `SELECT * FROM ${tenantDb}.usage_quotas WHERE user_id = ? LIMIT 1`,
        {
          replacements: [userId],
          type: QueryTypes.SELECT
        }
      ) as any[];

      // 如果没有配额设置，返回默认值
      if (quotaSettings.length === 0) {
        return res.json({
          success: true,
          data: {
            userId: parseInt(userId),
            monthlyQuota: 10000, // 默认每月10000次调用
            monthlyCostQuota: 100, // 默认每月100元
            currentMonthUsage: 0,
            currentMonthCost: 0,
            usagePercentage: 0,
            costPercentage: 0,
            warningEnabled: false,
            warningThreshold: 80
          }
        });
      }

      const quota = quotaSettings[0];

      // 查询当月用量
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const usageStats = await sequelize.query(
        `SELECT
          COUNT(*) as total_calls,
          SUM(cost) as total_cost
         FROM ${tenantDb}.ai_model_usage
         WHERE user_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
        {
          replacements: [userId, currentMonth],
          type: QueryTypes.SELECT
        }
      ) as any[];

      const currentUsage = usageStats[0];
      const totalCalls = parseInt(currentUsage.total_calls || 0);
      const totalCost = parseFloat(currentUsage.total_cost || 0);

      return res.json({
        success: true,
        data: {
          userId: parseInt(userId),
          monthlyQuota: quota.monthly_quota,
          monthlyCostQuota: quota.monthly_cost_quota,
          currentMonthUsage: totalCalls,
          currentMonthCost: totalCost,
          usagePercentage: quota.monthly_quota > 0 ? (totalCalls / quota.monthly_quota * 100) : 0,
          costPercentage: quota.monthly_cost_quota > 0 ? (totalCost / quota.monthly_cost_quota * 100) : 0,
          warningEnabled: quota.warning_enabled === 1,
          warningThreshold: quota.warning_threshold || 80
        }
      });
    } catch (error: any) {
      console.error('获取用户配额失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取用户配额失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-quota/user/{userId}:
   *   put:
   *     summary: 更新用户配额
   *     tags: [用量配额]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               monthlyQuota:
   *                 type: integer
   *               monthlyCostQuota:
   *                 type: number
   *               warningEnabled:
   *                 type: boolean
   *               warningThreshold:
   *                 type: integer
   *     responses:
   *       200:
   *         description: 配额更新成功
   */
  static async updateUserQuota(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { monthlyQuota, monthlyCostQuota, warningEnabled, warningThreshold } = req.body;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 检查配额是否存在
      const existingQuota = await sequelize.query(
        `SELECT * FROM ${tenantDb}.usage_quotas WHERE user_id = ? LIMIT 1`,
        {
          replacements: [userId],
          type: QueryTypes.SELECT
        }
      ) as any[];

      if (existingQuota.length === 0) {
        // 创建新配额
        await sequelize.query(
          `INSERT INTO ${tenantDb}.usage_quotas (user_id, monthly_quota, monthly_cost_quota, warning_enabled, warning_threshold, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          {
            replacements: [
              userId,
              monthlyQuota || 10000,
              monthlyCostQuota || 100,
              warningEnabled ? 1 : 0,
              warningThreshold || 80
            ],
            type: QueryTypes.INSERT
          }
        );
      } else {
        // 更新配额
        await sequelize.query(
          `UPDATE ${tenantDb}.usage_quotas
           SET monthly_quota = ?, monthly_cost_quota = ?, warning_enabled = ?, warning_threshold = ?, updated_at = NOW()
           WHERE user_id = ?`,
          {
            replacements: [
              monthlyQuota || existingQuota[0].monthly_quota,
              monthlyCostQuota || existingQuota[0].monthly_cost_quota,
              warningEnabled !== undefined ? (warningEnabled ? 1 : 0) : existingQuota[0].warning_enabled,
              warningThreshold || existingQuota[0].warning_threshold,
              userId
            ],
            type: QueryTypes.UPDATE
          }
        );
      }

      return res.json({
        success: true,
        message: '配额更新成功'
      });
    } catch (error: any) {
      console.error('更新用户配额失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新用户配额失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/usage-quota/warnings:
   *   get:
   *     summary: 获取所有预警信息
   *     tags: [用量配额]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 成功获取预警信息
   */
  static async getWarnings(req: Request, res: Response) {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 检查表是否存在
      const tableExists = await sequelize.query(
        `SHOW TABLES LIKE 'usage_quotas'`,
        { type: QueryTypes.SELECT }
      );

      // 如果表不存在，返回空数组
      if (!tableExists || tableExists.length === 0) {
        console.warn('⚠️ usage_quotas表不存在，返回空预警列表');
        return res.json({
          success: true,
          data: []
        });
      }

      const currentMonth = new Date().toISOString().slice(0, 7);

      // 查询所有启用预警的用户
      const warnings = await sequelize.query(
        `SELECT
          uq.user_id,
          u.username,
          u.real_name,
          u.email,
          uq.monthly_quota,
          uq.monthly_cost_quota,
          uq.warning_threshold,
          COUNT(amu.id) as current_usage,
          SUM(amu.cost) as current_cost
         FROM ${tenantDb}.usage_quotas uq
         LEFT JOIN ${tenantDb}.users u ON uq.user_id = u.id
         LEFT JOIN ${tenantDb}.ai_model_usage amu ON uq.user_id = amu.user_id AND DATE_FORMAT(amu.created_at, '%Y-%m') = ?
         WHERE uq.warning_enabled = 1
         GROUP BY uq.user_id, u.username, u.real_name, u.email, uq.monthly_quota, uq.monthly_cost_quota, uq.warning_threshold
         HAVING
           (COUNT(amu.id) / uq.monthly_quota * 100) >= uq.warning_threshold OR
           (SUM(amu.cost) / uq.monthly_cost_quota * 100) >= uq.warning_threshold`,
        {
          replacements: [currentMonth],
          type: QueryTypes.SELECT
        }
      ) as any[];

      const formattedWarnings = warnings.map(w => ({
        userId: w.user_id,
        username: w.username,
        realName: w.real_name,
        email: w.email,
        monthlyQuota: w.monthly_quota,
        monthlyCostQuota: w.monthly_cost_quota,
        currentUsage: parseInt(w.current_usage || 0),
        currentCost: parseFloat(w.current_cost || 0),
        usagePercentage: w.monthly_quota > 0 ? (parseInt(w.current_usage || 0) / w.monthly_quota * 100) : 0,
        costPercentage: w.monthly_cost_quota > 0 ? (parseFloat(w.current_cost || 0) / w.monthly_cost_quota * 100) : 0,
        warningThreshold: w.warning_threshold
      }));

      return res.json({
        success: true,
        data: formattedWarnings
      });
    } catch (error: any) {
      console.error('获取预警信息失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取预警信息失败',
        error: error.message
      });
    }
  }
}

