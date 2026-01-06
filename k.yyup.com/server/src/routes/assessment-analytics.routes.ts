/**
 * Admin/园长测评数据中心API路由
*/
import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { verifyToken } from '../middlewares/auth.middleware';
import AssessmentRecord from '../models/assessment-record.model';
import AssessmentReport from '../models/assessment-report.model';
import Student from '../models/student.model';
import Parent from '../models/parent.model';
import ParentStudentRelation from '../models/parent-student-relation.model';

const router = Router();

// 应用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 获取测评总览统计
 * GET /api/assessment-analytics/overview
*/
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // 获取总测评次数
    const totalAssessments = await AssessmentRecord.count();

    // 获取本月新增
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyAssessments = await AssessmentRecord.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // 计算完成率（已完成的测评 / 总测评数）
    const completedCount = await AssessmentRecord.count({
      where: { status: 'completed' },
    });
    const completionRate = totalAssessments > 0 
      ? Math.round((completedCount / totalAssessments) * 100) 
      : 0;

    // 计算平均分
    const records = await AssessmentRecord.findAll({
      attributes: ['totalScore'],
      where: { status: 'completed' },
    });
    const averageScore = records.length > 0
      ? Math.round(records.reduce((sum, r) => sum + (r.totalScore || 0), 0) / records.length)
      : 0;

    // 获取趋势数据（最近7天）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendRecords = await AssessmentRecord.findAll({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      order: [['createdAt', 'ASC']],
    });

    // 按天分组
    const trendData: { labels: string[]; values: number[] } = {
      labels: [],
      values: [],
    };

    const dayMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dayMap.set(key, 0);
      trendData.labels.push(`${date.getMonth() + 1}-${date.getDate()}`);
    }

    trendRecords.forEach((record) => {
      const key = new Date(record.createdAt).toISOString().split('T')[0];
      if (dayMap.has(key)) {
        dayMap.set(key, dayMap.get(key)! + 1);
      }
    });

    trendData.values = Array.from(dayMap.values());

    // 获取年龄分布
    const ageDistribution: Array<{ age: number; count: number }> = [];
    const completedRecords = await AssessmentRecord.findAll({
      where: { status: 'completed' },
      include: [
        {
          model: Parent,
          as: 'parent',
          include: [
            {
              model: Student,
              as: 'students',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    const ageMap = new Map<number, number>();
    completedRecords.forEach((record: any) => {
      if (record.parent && record.parent.students && record.parent.students.length > 0) {
        const student = record.parent.students[0];
        if (student.age) {
          ageMap.set(student.age, (ageMap.get(student.age) || 0) + 1);
        }
      }
    });

    for (const [age, count] of ageMap.entries()) {
      ageDistribution.push({ age, count });
    }
    ageDistribution.sort((a, b) => a.age - b.age);

    // 计算五大维度平均分
    const dimensionScores = {
      cognitive: 0,
      physical: 0,
      social: 0,
      emotional: 0,
      language: 0,
    };

    if (records.length > 0) {
      records.forEach((record: any) => {
        if (record.dimensionScores) {
          dimensionScores.cognitive += record.dimensionScores.cognitive || 0;
          dimensionScores.physical += record.dimensionScores.physical || 0;
          dimensionScores.social += record.dimensionScores.social || 0;
          dimensionScores.emotional += record.dimensionScores.emotional || 0;
          dimensionScores.language += record.dimensionScores.language || 0;
        }
      });

      dimensionScores.cognitive = Math.round(dimensionScores.cognitive / records.length);
      dimensionScores.physical = Math.round(dimensionScores.physical / records.length);
      dimensionScores.social = Math.round(dimensionScores.social / records.length);
      dimensionScores.emotional = Math.round(dimensionScores.emotional / records.length);
      dimensionScores.language = Math.round(dimensionScores.language / records.length);
    }

    // 发育商分布
    const dqDistribution = [
      { range: '85-100', count: 0, percentage: 0 },
      { range: '75-84', count: 0, percentage: 0 },
      { range: '60-74', count: 0, percentage: 0 },
      { range: '0-59', count: 0, percentage: 0 },
    ];

    records.forEach((record: any) => {
      const dq = record.dq || 0;
      if (dq >= 85) dqDistribution[0].count++;
      else if (dq >= 75) dqDistribution[1].count++;
      else if (dq >= 60) dqDistribution[2].count++;
      else dqDistribution[3].count++;
    });

    dqDistribution.forEach((item) => {
      item.percentage = records.length > 0 
        ? Math.round((item.count / records.length) * 100) 
        : 0;
    });

    // 获取最近20条测评记录
    const recentRecords = await AssessmentRecord.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Parent,
          as: 'parent',
          include: [
            {
              model: Student,
              as: 'students',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    const formattedRecords = recentRecords.map((record: any) => {
      const student = record.parent?.students?.[0];
      return {
        id: record.id,
        studentName: student?.name || '未知',
        age: student?.age || 0,
        assessmentType: record.assessmentType,
        totalScore: record.totalScore,
        createdAt: record.createdAt,
        status: record.status,
      };
    });

    res.json({
      success: true,
      data: {
        totalAssessments,
        monthlyAssessments,
        completionRate,
        averageScore,
        trendData,
        ageDistribution,
        dimensionScores,
        dqDistribution,
        recentRecords: formattedRecords,
      },
    });
  } catch (error: any) {
    console.error('[ASSESSMENT]: 获取测评总览失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取测评总览失败',
    });
  }
});

/**
 * 获取测评记录列表
 * GET /api/assessment-analytics/records
*/
router.get('/records', async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      assessmentType,
      startDate,
      endDate,
      minScore,
      maxScore,
      minAge,
      maxAge,
      status,
      page = 1,
      pageSize = 20,
    } = req.query;

    const where: any = {};

    // 关键词搜索（学生姓名）
    // 注意：需要通过关联查询实现

    // 测评类型
    if (assessmentType) {
      const types = Array.isArray(assessmentType) ? assessmentType : [assessmentType];
      where.assessmentType = { [Op.in]: types };
    }

    // 日期范围
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    // 分数区间
    if (minScore !== undefined || maxScore !== undefined) {
      where.totalScore = {};
      if (minScore) where.totalScore[Op.gte] = Number(minScore);
      if (maxScore) where.totalScore[Op.lte] = Number(maxScore);
    }

    // 状态
    if (status) {
      where.status = status;
    }

    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const { count, rows } = await AssessmentRecord.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Parent,
          as: 'parent',
          include: [
            {
              model: Student,
              as: 'students',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    const records = rows.map((record: any) => {
      const student = record.parent?.students?.[0];
      return {
        id: record.id,
        studentName: student?.name || '未知',
        age: student?.age || 0,
        gender: student?.gender || 'unknown',
        assessmentType: record.assessmentType,
        totalScore: record.totalScore,
        dq: record.dq,
        createdAt: record.createdAt,
        status: record.status,
        dimensionScores: record.dimensionScores,
      };
    });

    res.json({
      success: true,
      data: {
        records,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error: any) {
    console.error('[ASSESSMENT]: 获取测评记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取测评记录失败',
    });
  }
});

/**
 * 获取测评记录详情
 * GET /api/assessment-analytics/records/:id
*/
router.get('/records/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await AssessmentRecord.findByPk(id, {
      include: [
        {
          model: Parent,
          as: 'parent',
          include: [
            {
              model: Student,
              as: 'students',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '测评记录不存在',
      });
    }

    const recordData: any = record.toJSON();
    const student = recordData.parent?.students?.[0];

    const formattedRecord = {
      id: recordData.id,
      studentName: student?.name || '未知',
      age: student?.age || 0,
      gender: student?.gender || 'unknown',
      assessmentType: recordData.assessmentType,
      totalScore: recordData.totalScore,
      dq: recordData.dq,
      createdAt: recordData.createdAt,
      status: recordData.status,
      dimensionScores: recordData.dimensionScores,
    };

    res.json({
      success: true,
      data: formattedRecord,
    });
  } catch (error: any) {
    console.error('[ASSESSMENT]: 获取测评记录详情失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取测评记录详情失败',
    });
  }
});

/**
 * 获取测评报告列表
 * GET /api/assessment-analytics/reports
*/
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const { count, rows } = await AssessmentReport.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    const reports = rows.map((report: any) => ({
      id: report.id,
      studentName: '学生' + report.id, // 需要关联查询
      reportType: 'assessment',
      createdAt: report.createdAt,
    }));

    res.json({
      success: true,
      data: {
        reports,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error: any) {
    console.error('[ASSESSMENT]: 获取测评报告列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取测评报告列表失败',
    });
  }
});

/**
 * 获取趋势数据
 * GET /api/assessment-analytics/trends
*/
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    const records = await AssessmentRecord.findAll({
      where,
      order: [['createdAt', 'ASC']],
    });

    // 简单的数据聚合（实际应该使用数据库聚合函数）
    const trendData: { labels: string[]; values: number[] } = {
      labels: [],
      values: [],
    };

    const dataMap = new Map<string, number>();
    records.forEach((record) => {
      const date = new Date(record.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      dataMap.set(key, (dataMap.get(key) || 0) + 1);
    });

    trendData.labels = Array.from(dataMap.keys());
    trendData.values = Array.from(dataMap.values());

    res.json({
      success: true,
      data: trendData,
    });
  } catch (error: any) {
    console.error('[ASSESSMENT]: 获取趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取趋势数据失败',
    });
  }
});

export default router;

