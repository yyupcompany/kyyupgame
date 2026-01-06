import { Request, Response } from 'express';
import { RequestWithUser } from '../types/express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

export class QuotasController {
  /**
   * 获取配额列表
   * @param req 请求
   * @param res 响应
   */
  public getQuotas = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { year, classId } = req.query;
      const currentYear = year || new Date().getFullYear();
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      let whereClause = 'WHERE eq.deleted_at IS NULL';
      if (classId) {
        whereClause += ` AND eq.class_id = ${parseInt(classId as string)}`;
      }
      whereClause += ` AND eq.enrollment_year = ${currentYear}`;

      const [quotas] = await sequelize.query(`
        SELECT 
          eq.id, eq.enrollment_year as enrollmentYear, eq.total_quota as totalQuota,
          eq.used_quota as usedQuota, eq.remaining_quota as remainingQuota,
          eq.status, eq.created_at as createdAt, eq.updated_at as updatedAt,
          c.name as className, c.grade_level as gradeLevel, c.capacity,
          (SELECT COUNT(*) FROM ${tenantDb}.enrollment_applications ea WHERE ea.target_class_id = eq.class_id AND ea.status = 3 AND ea.deleted_at IS NULL) as acceptedApplications
        FROM ${tenantDb}.enrollment_quotas eq
        LEFT JOIN ${tenantDb}.classes c ON eq.class_id = c.id
        ${whereClause}
        ORDER BY eq.created_at DESC
      `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

      const quotasArray = Array.isArray(quotas) ? quotas : (quotas ? [quotas] : []);

      res.json({
        success: true,
        message: '获取配额列表成功',
        data: {
          quotas: quotasArray.map((quota: any) => ({
            id: quota.id,
            enrollmentYear: quota.enrollmentYear,
            totalQuota: quota.totalQuota,
            usedQuota: quota.usedQuota,
            remainingQuota: quota.remainingQuota,
            status: quota.status,
            createdAt: quota.createdAt,
            updatedAt: quota.updatedAt,
            className: quota.className,
            gradeLevel: quota.gradeLevel,
            capacity: quota.capacity,
            acceptedApplications: parseInt(quota.acceptedApplications) || 0,
            utilizationRate: Math.round(((quota.usedQuota || 0) / (quota.totalQuota || 1)) * 100)
          })),
          summary: {
            totalQuotas: quotasArray.reduce((sum: number, quota: any) => sum + (quota.totalQuota || 0), 0),
            totalUsed: quotasArray.reduce((sum: number, quota: any) => sum + (quota.usedQuota || 0), 0),
            totalRemaining: quotasArray.reduce((sum: number, quota: any) => sum + (quota.remainingQuota || 0), 0)
          }
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取配额列表失败');
    }
  }

  /**
   * 创建配额
   * @param req 请求
   * @param res 响应
   */
  public createQuota = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { enrollmentYear, classId, totalQuota } = req.body;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const [result] = await sequelize.query(`
        INSERT INTO ${tenantDb}.enrollment_quotas 
        (enrollment_year, class_id, total_quota, used_quota, remaining_quota, status, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, 1, NOW(), NOW())
      `, {
        replacements: [enrollmentYear, classId, totalQuota, totalQuota],
        type: QueryTypes.INSERT
      }) as [any, any];

      const quotaId = result[0];

      res.status(201).json({
        success: true,
        message: '创建配额成功',
        data: {
          id: quotaId,
          enrollmentYear,
          classId,
          totalQuota,
          usedQuota: 0,
          remainingQuota: totalQuota,
          status: 1,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      this.handleError(res, error, '创建配额失败');
    }
  }

  /**
   * 更新配额
   * @param req 请求
   * @param res 响应
   */
  public updateQuota = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { totalQuota, usedQuota } = req.body;
      const remainingQuota = totalQuota - usedQuota;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      await sequelize.query(`
        UPDATE ${tenantDb}.enrollment_quotas 
        SET total_quota = ?, used_quota = ?, remaining_quota = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `, {
        replacements: [totalQuota, usedQuota, remainingQuota, id],
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '更新配额成功',
        data: {
          id: parseInt(id),
          totalQuota,
          usedQuota,
          remainingQuota,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      this.handleError(res, error, '更新配额失败');
    }
  }

  /**
   * 删除配额
   * @param req 请求
   * @param res 响应
   */
  public deleteQuota = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      await sequelize.query(`
        UPDATE ${tenantDb}.enrollment_quotas 
        SET deleted_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `, {
        replacements: [id],
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '删除配额成功',
        data: {
          id: parseInt(id),
          deletedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      this.handleError(res, error, '删除配额失败');
    }
  }

  /**
   * 处理错误的私有方法
   */
  private handleError(res: Response, error: any, defaultMessage: string): void {
    console.error(defaultMessage + ':', error);
    res.status(500).json({
      success: false,
      message: defaultMessage,
      error: {
        code: 'SERVER_ERROR',
        message: error?.message || '未知错误'
      }
    });
  }
}