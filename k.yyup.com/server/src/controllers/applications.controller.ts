import { Request, Response } from 'express';
import { RequestWithUser } from '../types/express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

export class ApplicationsController {
  /**
   * 获取申请列表
   * @param req 请求
   * @param res 响应
   */
  public getApplications = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { page = 1, pageSize = 10, status, keyword } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      let whereClause = 'WHERE ea.deleted_at IS NULL';
      if (status) {
        whereClause += ` AND ea.status = ${parseInt(status as string)}`;
      }
      if (keyword) {
        whereClause += ` AND (ea.student_name LIKE '%${keyword}%' OR ea.parent_name LIKE '%${keyword}%' OR ea.phone LIKE '%${keyword}%')`;
      }

      const [applications] = await sequelize.query(`
        SELECT 
          ea.id, ea.student_name as studentName, ea.student_gender as studentGender,
          ea.student_birthday as studentBirthday, ea.parent_name as parentName,
          ea.phone, ea.email, ea.address, ea.status, ea.created_at as createdAt,
          ea.interview_time as interviewTime, ea.notes,
          c.name as className, c.grade_level as gradeLevel
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.classes c ON ea.target_class_id = c.id
        ${whereClause}
        ORDER BY ea.created_at DESC
        LIMIT ${parseInt(pageSize as string)} OFFSET ${offset}
      `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

      const countResult = await sequelize.query(`
        SELECT COUNT(*) as total FROM ${tenantDb}.enrollment_applications ea ${whereClause}
      `, { type: QueryTypes.SELECT }) as Record<string, any>[];

      const applicationsArray = Array.isArray(applications) ? applications : (applications ? [applications] : []);
      const total = parseInt(countResult[0]?.total) || 0;

      res.json({
        success: true,
        message: '获取申请列表成功',
        data: {
          applications: applicationsArray.map((app: any) => ({
            id: app.id,
            studentName: app.studentName,
            studentGender: app.studentGender,
            studentBirthday: app.studentBirthday,
            parentName: app.parentName,
            phone: app.phone,
            email: app.email,
            address: app.address,
            status: app.status,
            createdAt: app.createdAt,
            interviewTime: app.interviewTime,
            notes: app.notes,
            className: app.className,
            gradeLevel: app.gradeLevel
          })),
          pagination: {
            total,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            totalPages: Math.ceil(total / parseInt(pageSize as string))
          }
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取申请列表失败');
    }
  }

  /**
   * 创建新申请
   * @param req 请求
   * @param res 响应
   */
  public createApplication = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const {
        studentName, studentGender, studentBirthday, parentName,
        phone, email, address, targetClassId, notes
      } = req.body;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const [result] = await sequelize.query(`
        INSERT INTO ${tenantDb}.enrollment_applications 
        (student_name, student_gender, student_birthday, parent_name, phone, email, address, target_class_id, notes, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, {
        replacements: [studentName, studentGender, studentBirthday, parentName, phone, email, address, targetClassId, notes],
        type: QueryTypes.INSERT
      }) as [any, any];

      const applicationId = result[0];

      res.status(201).json({
        success: true,
        message: '创建申请成功',
        data: {
          id: applicationId,
          studentName,
          parentName,
          phone,
          status: 1,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      this.handleError(res, error, '创建申请失败');
    }
  }

  /**
   * 更新申请状态
   * @param req 请求
   * @param res 响应
   */
  public updateApplicationStatus = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, notes, interviewTime } = req.body;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      await sequelize.query(`
        UPDATE ${tenantDb}.enrollment_applications 
        SET status = ?, notes = ?, interview_time = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `, {
        replacements: [status, notes, interviewTime, id],
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '更新申请状态成功',
        data: {
          id: parseInt(id),
          status,
          notes,
          interviewTime,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      this.handleError(res, error, '更新申请状态失败');
    }
  }

  /**
   * 删除申请
   * @param req 请求
   * @param res 响应
   */
  public deleteApplication = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      await sequelize.query(`
        UPDATE ${tenantDb}.enrollment_applications 
        SET deleted_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `, {
        replacements: [id],
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '删除申请成功',
        data: {
          id: parseInt(id),
          deletedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      this.handleError(res, error, '删除申请失败');
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