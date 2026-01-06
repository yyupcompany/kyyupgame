/**
 * 面试记录控制器
 */
import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 创建面试记录
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const createInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '用户未认证' });
    }
    
    const {
      applicationId,
      interviewDate,
      interviewerId,
      location,
      status = 'scheduled',
      notes,
      durationMinutes = 30
    } = req.body;

    // 验证必填字段
    if (!applicationId || !interviewDate || !interviewerId) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：applicationId, interviewDate, interviewerId'
      });
    }

    // 验证申请是否存在
    const applications = await sequelize.query(`
      SELECT id FROM ${tenantDb}.enrollment_applications
      WHERE id = :applicationId AND deleted_at IS NULL
    `, {
      replacements: { applicationId },
      type: QueryTypes.SELECT
    }) as any[];

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: '申请记录不存在'
      });
    }

    // 验证面试官是否存在
    const interviewers = await sequelize.query(`
      SELECT id FROM ${tenantDb}.users
      WHERE id = :interviewerId AND status = 'active'
    `, {
      replacements: { interviewerId },
      type: QueryTypes.SELECT
    }) as any[];

    if (!interviewers || interviewers.length === 0) {
      return res.status(404).json({
        success: false,
        message: '面试官不存在'
      });
    }

    // 插入面试记录
    const result = await sequelize.query(`
      INSERT INTO ${tenantDb}.enrollment_interviews
      (application_id, interview_date, interviewer_id, location, status, notes, duration_minutes, created_by)
      VALUES (:applicationId, :interviewDate, :interviewerId, :location, :status, :notes, :durationMinutes, :userId)
    `, {
      replacements: {
        applicationId,
        interviewDate,
        interviewerId,
        location,
        status,
        notes,
        durationMinutes,
        userId
      },
      type: QueryTypes.INSERT
    }) as any;

    const interviewId = result[0];

    // 获取创建的面试记录详情
    const interviews = await sequelize.query(`
      SELECT
        ei.*,
        ea.student_name,
        pu.real_name as parent_name,
        u.real_name as interviewer_name
      FROM ${tenantDb}.enrollment_interviews ei
      LEFT JOIN ${tenantDb}.enrollment_applications ea ON ei.application_id = ea.id
      LEFT JOIN ${tenantDb}.parents p ON ea.parent_id = p.id
      LEFT JOIN ${tenantDb}.users pu ON p.user_id = pu.id
      LEFT JOIN ${tenantDb}.users u ON ei.interviewer_id = u.id
      WHERE ei.id = :id
    `, {
      replacements: { id: interviewId },
      type: QueryTypes.SELECT
    }) as any[];

    const interview = interviews[0] as any;

    return res.status(201).json({
      success: true,
      message: '创建面试记录成功',
      data: {
        id: interview.id,
        applicationId: interview.application_id,
        interviewDate: interview.interview_date,
        interviewerId: interview.interviewer_id,
        location: interview.location,
        status: interview.status,
        notes: interview.notes,
        durationMinutes: interview.duration_minutes,
        createdBy: interview.created_by,
        createdAt: interview.created_at,
        updatedAt: interview.updated_at,
        interviewer: {
          id: interview.interviewer_id,
          name: interview.interviewer_name
        },
        application: {
          id: interview.application_id,
          studentName: interview.student_name
        }
      }
    });
  } catch (error) {
    console.error('创建面试记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建面试记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 获取面试记录详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getInterviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id, 10) || 0)) {
      return res.status(400).json({
        success: false,
        message: '无效的面试记录ID'
      });
    }

    // 查询真实数据库
    const interviews = await sequelize.query(`
      SELECT
        ei.*,
        ea.student_name,
        pu.real_name as parent_name,
        u.real_name as interviewer_name
      FROM ${tenantDb}.enrollment_interviews ei
      LEFT JOIN ${tenantDb}.enrollment_applications ea ON ei.application_id = ea.id
      LEFT JOIN ${tenantDb}.parents p ON ea.parent_id = p.id
      LEFT JOIN ${tenantDb}.users pu ON p.user_id = pu.id
      LEFT JOIN ${tenantDb}.users u ON ei.interviewer_id = u.id
      WHERE ei.id = :id AND ei.deleted_at IS NULL
    `, {
      replacements: { id: parseInt(id, 10) || 0 },
      type: QueryTypes.SELECT
    }) as any[];

    if (!interviews || interviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '面试记录不存在'
      });
    }

    const interview = interviews[0] as any;

    return res.json({
      success: true,
      message: '获取面试记录详情成功',
      data: {
        id: interview.id,
        applicationId: interview.application_id,
        interviewDate: interview.interview_date,
        interviewerId: interview.interviewer_id,
        location: interview.location,
        status: interview.status,
        score: interview.score,
        feedback: interview.feedback,
        notes: interview.notes,
        durationMinutes: interview.duration_minutes,
        createdBy: interview.created_by,
        createdAt: interview.created_at,
        updatedAt: interview.updated_at,
        interviewer: {
          id: interview.interviewer_id,
          name: interview.interviewer_name
        },
        application: {
          id: interview.application_id,
          studentName: interview.student_name,
          parentName: interview.parent_name
        }
      }
    });
  } catch (error) {
    console.error('获取面试记录详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取面试记录详情失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 更新面试记录
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const updateInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: '用户未认证' });
    }

    if (!id || isNaN(parseInt(id, 10) || 0)) {
      return res.status(400).json({
        success: false,
        message: '无效的面试记录ID'
      });
    }

    const {
      interviewDate,
      location,
      status,
      score,
      feedback,
      notes,
      durationMinutes
    } = req.body;

    // 检查面试记录是否存在
    const existingInterviews = await sequelize.query(`
      SELECT id FROM ${tenantDb}.enrollment_interviews 
      WHERE id = :id AND deleted_at IS NULL
    `, {
      replacements: { id: parseInt(id, 10) || 0 },
      type: QueryTypes.SELECT
    }) as any[];

    if (!existingInterviews || existingInterviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '面试记录不存在'
      });
    }

    // 构建更新字段
    const updateFields = [];
    const replacements: any = { id: parseInt(id, 10) || 0 };

    if (interviewDate !== undefined) {
      updateFields.push('interview_date = :interviewDate');
      replacements.interviewDate = interviewDate;
    }
    if (location !== undefined) {
      updateFields.push('location = :location');
      replacements.location = location;
    }
    if (status !== undefined) {
      updateFields.push('status = :status');
      replacements.status = status;
    }
    if (score !== undefined) {
      updateFields.push('score = :score');
      replacements.score = score;
    }
    if (feedback !== undefined) {
      updateFields.push('feedback = :feedback');
      replacements.feedback = feedback;
    }
    if (notes !== undefined) {
      updateFields.push('notes = :notes');
      replacements.notes = notes;
    }
    if (durationMinutes !== undefined) {
      updateFields.push('duration_minutes = :durationMinutes');
      replacements.durationMinutes = durationMinutes;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段'
      });
    }

    // 执行更新
    await sequelize.query(`
      UPDATE ${tenantDb}.enrollment_interviews 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = :id
    `, {
      replacements,
      type: QueryTypes.UPDATE
    });

    // 获取更新后的记录
    const updatedInterviews = await sequelize.query(`
      SELECT 
        ei.*,
        ea.student_name,
        pu.real_name as parent_name,
        u.real_name as interviewer_name
      FROM ${tenantDb}.enrollment_interviews ei
      LEFT JOIN enrollment_applications ea ON ei.application_id = ea.id
      LEFT JOIN parents p ON ea.parent_id = p.id
      LEFT JOIN ${tenantDb}.users pu ON p.user_id = pu.id
      LEFT JOIN ${tenantDb}.users u ON ei.interviewer_id = u.id
      WHERE ei.id = :id
    `, {
      replacements: { id: parseInt(id, 10) || 0 },
      type: QueryTypes.SELECT
    }) as any[];

    const interview = updatedInterviews[0] as any;

    return res.json({
      success: true,
      message: '更新面试记录成功',
      data: {
        id: interview.id,
        applicationId: interview.application_id,
        interviewDate: interview.interview_date,
        interviewerId: interview.interviewer_id,
        location: interview.location,
        status: interview.status,
        score: interview.score,
        feedback: interview.feedback,
        notes: interview.notes,
        durationMinutes: interview.duration_minutes,
        createdBy: interview.created_by,
        createdAt: interview.created_at,
        updatedAt: interview.updated_at,
        interviewer: {
          id: interview.interviewer_id,
          name: interview.interviewer_name
        },
        application: {
          id: interview.application_id,
          studentName: interview.student_name
        }
      }
    });
  } catch (error) {
    console.error('更新面试记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新面试记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 删除面试记录
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const deleteInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: '用户未认证' });
    }

    if (!id || isNaN(parseInt(id, 10) || 0)) {
      return res.status(400).json({
        success: false,
        message: '无效的面试记录ID'
      });
    }

    // 检查面试记录是否存在
    const existingInterviews = await sequelize.query(`
      SELECT id FROM ${tenantDb}.enrollment_interviews 
      WHERE id = :id AND deleted_at IS NULL
    `, {
      replacements: { id: parseInt(id, 10) || 0 },
      type: QueryTypes.SELECT
    }) as any[];

    if (!existingInterviews || existingInterviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '面试记录不存在'
      });
    }

    // 软删除
    await sequelize.query(`
      UPDATE ${tenantDb}.enrollment_interviews 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = :id
    `, {
      replacements: { id: parseInt(id, 10) || 0 },
      type: QueryTypes.UPDATE
    });

    return res.json({
      success: true,
      message: '删除面试记录成功',
      data: null
    });
  } catch (error) {
    console.error('删除面试记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除面试记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 获取面试记录列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      interviewerId, 
      applicationId,
      startDate,
      endDate 
    } = req.query;
    
    const offset = (parseInt(page as string, 10) || 0 - 1) * parseInt(pageSize as string, 10) || 0;
    const limit = parseInt(pageSize as string, 10) || 0;

    // 构建查询条件
    const whereConditions = ['ei.deleted_at IS NULL'];
    const replacements: any = { offset, limit };

    if (status) {
      whereConditions.push('ei.status = :status');
      replacements.status = status;
    }
    if (interviewerId) {
      whereConditions.push('ei.interviewer_id = :interviewerId');
      replacements.interviewerId = interviewerId;
    }
    if (applicationId) {
      whereConditions.push('ei.application_id = :applicationId');
      replacements.applicationId = applicationId;
    }
    if (startDate) {
      whereConditions.push('ei.interview_date >= :startDate');
      replacements.startDate = startDate;
    }
    if (endDate) {
      whereConditions.push('ei.interview_date <= :endDate');
      replacements.endDate = endDate;
    }

    const whereClause = whereConditions.join(' AND ');

    // 获取总数
    const countResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM ${tenantDb}.enrollment_interviews ei
      WHERE ${whereClause}
    `, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    const total = parseInt(countResult[0].total, 10) || 0;

    // 获取列表数据
    const interviews = await sequelize.query(`
      SELECT 
        ei.*,
        ea.student_name,
        pu.real_name as parent_name,
        u.real_name as interviewer_name
      FROM ${tenantDb}.enrollment_interviews ei
      LEFT JOIN enrollment_applications ea ON ei.application_id = ea.id
      LEFT JOIN parents p ON ea.parent_id = p.id
      LEFT JOIN ${tenantDb}.users pu ON p.user_id = pu.id
      LEFT JOIN ${tenantDb}.users u ON ei.interviewer_id = u.id
      WHERE ${whereClause}
      ORDER BY ei.interview_date DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    const items = interviews.map((interview: any) => ({
      id: interview.id,
      applicationId: interview.application_id,
      interviewDate: interview.interview_date,
      interviewerId: interview.interviewer_id,
      location: interview.location,
      status: interview.status,
      score: interview.score,
      feedback: interview.feedback,
      notes: interview.notes,
      durationMinutes: interview.duration_minutes,
      createdBy: interview.created_by,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at,
      interviewer: {
        id: interview.interviewer_id,
        name: interview.interviewer_name
      },
      application: {
        id: interview.application_id,
        studentName: interview.student_name,
        parentName: interview.parent_name
      }
    }));

    return res.json({
      success: true,
      message: '获取面试记录列表成功',
      data: {
        items,
        total,
        page: parseInt(page as string, 10) || 0,
        pageSize: parseInt(pageSize as string, 10) || 0,
        totalPages: Math.ceil(total / parseInt(pageSize as string, 10) || 0)
      }
    });
  } catch (error) {
    console.error('获取面试记录列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取面试记录列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 获取面试记录统计数据
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getInterviewStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    // 获取总数统计
    const totalStats = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled,
        AVG(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as averageScore,
        AVG(CASE WHEN duration_minutes IS NOT NULL THEN duration_minutes ELSE NULL END) as averageDuration
      FROM ${tenantDb}.enrollment_interviews 
      WHERE deleted_at IS NULL
    `, {
      type: QueryTypes.SELECT
    }) as any[];

    // 获取按月统计
    const monthlyStats = await sequelize.query(`
      SELECT 
        DATE_FORMAT(interview_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        AVG(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as averageScore
      FROM ${tenantDb}.enrollment_interviews 
      WHERE deleted_at IS NULL 
        AND interview_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(interview_date, '%Y-%m')
      ORDER BY month DESC
    `, {
      type: QueryTypes.SELECT
    });

    // 获取按面试官统计
    const interviewerStats = await sequelize.query(`
      SELECT 
        ei.interviewer_id as interviewerId,
        u.real_name as name,
        COUNT(*) as totalCount,
        SUM(CASE WHEN ei.status = 'completed' THEN 1 ELSE 0 END) as completedCount,
        AVG(CASE WHEN ei.score IS NOT NULL THEN ei.score ELSE NULL END) as averageScore
      FROM ${tenantDb}.enrollment_interviews ei
      LEFT JOIN ${tenantDb}.users u ON ei.interviewer_id = u.id
      WHERE ei.deleted_at IS NULL
      GROUP BY ei.interviewer_id, u.real_name
      ORDER BY totalCount DESC
    `, {
      type: QueryTypes.SELECT
    });

    // 获取按状态统计
    const statusStats = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${tenantDb}.enrollment_interviews WHERE deleted_at IS NULL), 2) as percentage
      FROM ${tenantDb}.enrollment_interviews 
      WHERE deleted_at IS NULL
      GROUP BY status
      ORDER BY count DESC
    `, {
      type: QueryTypes.SELECT
    });

    // 获取分数分布统计
    const scoreDistribution = await sequelize.query(`
      SELECT 
        CASE 
          WHEN score >= 90 THEN '优秀(90-100)'
          WHEN score >= 80 THEN '良好(80-89)'
          WHEN score >= 70 THEN '一般(70-79)'
          WHEN score >= 60 THEN '及格(60-69)'
          ELSE '不及格(<60)'
        END as scoreRange,
        COUNT(*) as count
      FROM ${tenantDb}.enrollment_interviews 
      WHERE deleted_at IS NULL AND score IS NOT NULL
      GROUP BY 
        CASE 
          WHEN score >= 90 THEN '优秀(90-100)'
          WHEN score >= 80 THEN '良好(80-89)'
          WHEN score >= 70 THEN '一般(70-79)'
          WHEN score >= 60 THEN '及格(60-69)'
          ELSE '不及格(<60)'
        END
      ORDER BY MIN(score) DESC
    `, {
      type: QueryTypes.SELECT
    });

    const stats = totalStats[0] as any;

    return res.json({
      success: true,
      message: '获取面试统计成功',
      data: {
        overview: {
          total: parseInt(stats.total) || 0,
          scheduled: parseInt(stats.scheduled) || 0,
          completed: parseInt(stats.completed) || 0,
          cancelled: parseInt(stats.cancelled) || 0,
          rescheduled: parseInt(stats.rescheduled) || 0,
          averageScore: parseFloat(stats.averageScore) || 0,
          averageDuration: parseFloat(stats.averageDuration) || 0
        },
        byMonth: monthlyStats,
        byInterviewer: interviewerStats,
        byStatus: statusStats,
        scoreDistribution: scoreDistribution
      }
    });
  } catch (error) {
    console.error('获取面试统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取面试统计失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}; 