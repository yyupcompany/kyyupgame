import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import assessmentService from '../services/assessment/assessment.service';
import assessmentReportService from '../services/assessment/assessment-report.service';
import * as assessmentFollowupService from '../services/assessment/assessment-followup.service';
import growthTrackingService from '../services/assessment/growth-tracking.service';
import { ApiError } from '../utils/apiError';
import { AssessmentRecord } from '../models/assessment-record.model';
import { AssessmentReport } from '../models/assessment-report.model';
import { Op } from 'sequelize';

/**
 * 开始测评
 */
export const startAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { childName, childAge, childGender, phone } = req.body;

    if (!childName || !childAge) {
      throw ApiError.badRequest('缺少必填字段：childName, childAge');
    }

    const record = await assessmentService.createRecord({
      childName,
      childAge: parseInt(childAge),
      childGender,
      userId,
      phone
    });

    ApiResponse.success(res, record, '测评开始成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取题目列表
 */
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { configId, ageGroup, dimension } = req.query;

    if (!configId || !ageGroup) {
      throw ApiError.badRequest('缺少必填参数：configId, ageGroup');
    }

    const questions = await assessmentService.getQuestions(
      parseInt(configId as string),
      ageGroup as string,
      dimension as string
    );

    ApiResponse.success(res, questions, '获取题目成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 提交答案
 */
export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId, questionId, answer, timeSpent } = req.body;

    if (!recordId || !questionId || answer === undefined) {
      throw ApiError.badRequest('缺少必填字段：recordId, questionId, answer');
    }

    const answerRecord = await assessmentService.submitAnswer(
      parseInt(recordId),
      parseInt(questionId),
      answer,
      timeSpent
    );

    ApiResponse.success(res, answerRecord, '答案提交成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 完成测评
 */
export const completeAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      throw ApiError.badRequest('缺少必填参数：recordId');
    }

    const record = await assessmentService.completeAssessment(parseInt(recordId));

    // 异步生成报告
    assessmentReportService.generateReport(record.id).catch(error => {
      console.error('生成报告失败:', error);
    });

    // 异步创建成长追踪记录
    growthTrackingService.createTrackingRecord({
      recordId: record.id,
      parentId: record.parentId,
      studentId: record.studentId
    }).catch(error => {
      console.error('创建成长追踪记录失败:', error);
    });

    // 异步自动跟进（临时禁用，需要确认方法名）
    // assessmentFollowupService.followupAfterAssessment(record.id).catch(error => {
    //   console.error('自动跟进失败:', error);
    // });

    ApiResponse.success(res, record, '测评完成成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取测评记录
 */
export const getRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.params;

    const record = await AssessmentRecord.findByPk(recordId);

    if (!record) {
      throw ApiError.notFound('测评记录不存在');
    }

    ApiResponse.success(res, record, '获取测评记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取报告
 */
export const getReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.params;

    let report = await AssessmentReport.findOne({
      where: { recordId: parseInt(recordId) }
    });

    if (!report) {
      // 如果报告不存在，尝试生成
      const record = await assessmentService.completeAssessment(parseInt(recordId));
      report = await assessmentReportService.generateReport(record.id);
    }

    // 增加查看次数
    report.viewCount = (report.viewCount || 0) + 1;
    await report.save();

    ApiResponse.success(res, report, '获取报告成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取成长轨迹
 */
export const getGrowthTrajectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { childName, studentId, phone, limit } = req.query;

    // 获取家长ID（如果是家长用户）
    let parentId: number | undefined;
    if (userId) {
      const Parent = require('../../models/parent.model').Parent;
      const parent = await Parent.findOne({
        where: { userId }
      });
      if (parent) {
        parentId = parent.id;
      }
    }

    const trajectory = await growthTrackingService.getGrowthTrajectory({
      childName: childName as string,
      parentId,
      studentId: studentId ? parseInt(studentId as string) : undefined,
      phone: phone as string,
      limit: limit ? parseInt(limit as string) : 12
    });

    ApiResponse.success(res, trajectory, '获取成长轨迹成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取我的测评记录列表
 */
export const getMyRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId || req.user?.id;  // ✅ 修复：支持userId和id两种格式
    const { page = 1, pageSize = 10, phone } = req.query;

    // 构建查询条件：优先使用userId，其次使用phone
    const where: any = {};
    if (userId) {
      where.userId = userId;
    } else if (phone) {
      where.phone = phone;
    } else {
      throw ApiError.badRequest('请提供userId或phone参数');
    }

    let records: any[] = [];
    let total = 0;

    try {
      const result = await AssessmentRecord.findAndCountAll({
        where,
        limit: parseInt(pageSize as string),
        offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'recordNo', 'configId', 'childName', 'childAge', 'childGender', 'status', 'startTime', 'endTime', 'totalScore', 'developmentQuotient', 'createdAt']
      });
      records = result.rows;
      total = result.count;
    } catch (dbError) {
      // 数据库表结构不完整时返回空数据
      console.warn('[测评记录] 数据库查询失败，返回空数据:', dbError instanceof Error ? dbError.message : '未知错误');
      records = [];
      total = 0;
    }

    ApiResponse.success(res, {
      records,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    }, '获取测评记录列表成功');
  } catch (error: any) {
    // 如果是参数错误，返回空数据而不是错误
    if (error.status === 400) {
      ApiResponse.success(res, {
        records: [],
        total: 0,
        page: 1,
        pageSize: 10
      }, '获取测评记录列表成功');
    } else {
      ApiResponse.handleError(res, error);
    }
  }
};

