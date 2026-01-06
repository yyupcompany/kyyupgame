import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

/**
 * 招生计划控制器
 * 提供招生计划的创建、查询、更新、删除等功能
 */
export class EnrollmentPlanController {
  constructor() {
    // 移除服务依赖，直接使用SQL查询
  }

  /**
   * 创建招生计划
   * @route POST /api/enrollment-plans
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('未登录或登录已过期');
      }

      // 暂时返回模拟数据
      const plan = {
        id: Date.now(),
        ...req.body,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      ApiResponse.success(res, plan, '创建招生计划成功', 201);
    } catch (error) {
      ApiResponse.handleError(res, error, '创建招生计划失败');
    }
  }

  /**
   * 获取招生计划列表
   * @route GET /api/enrollment-plans
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      
      // 暂时返回模拟数据
      const plans = [
        {
          id: 1,
          title: '2024年春季招生计划',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          targetCount: 100,
          currentCount: 50
        },
        {
          id: 2,
          title: '2024年秋季招生计划',
          status: 'draft',
          startDate: '2024-09-01',
          endDate: '2024-11-30',
          targetCount: 120,
          currentCount: 0
        }
      ];

      const result = {
        items: plans,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 0,
        total: plans.length,
        totalPages: Math.ceil(plans.length / Number(pageSize) || 0)
      };

      ApiResponse.success(res, result, '获取招生计划列表成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生计划列表失败');
    }
  }

  /**
   * 获取招生计划详情
   * @route GET /api/enrollment-plans/:id
   */
  async detail(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 暂时返回模拟数据
      const plan = {
        id,
        title: '2024年春季招生计划',
        description: '面向3-6岁儿童的春季招生计划',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        targetCount: 100,
        currentCount: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      ApiResponse.success(res, plan, '获取招生计划详情成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生计划详情失败');
    }
  }

  /**
   * 更新招生计划
   * @route PUT /api/enrollment-plans/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 暂时返回模拟数据
      const plan = {
        id,
        ...req.body,
        updatedAt: new Date()
      };

      ApiResponse.success(res, plan, '更新招生计划成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '更新招生计划失败');
    }
  }

  /**
   * 删除招生计划
   * @route DELETE /api/enrollment-plans/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      ApiResponse.success(res, null, '删除招生计划成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '删除招生计划失败');
    }
  }

  /**
   * 获取单个招生计划统计
   * @route GET /api/enrollment-plans/:id/statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 暂时返回模拟数据
      const statistics = {
        totalApplications: 75,
        approvedApplications: 50,
        rejectedApplications: 15,
        pendingApplications: 10,
        completionRate: 0.5
      };

      ApiResponse.success(res, statistics, '获取招生计划统计成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生计划统计失败');
    }
  }

  /**
   * 获取全局招生计划统计
   * @route GET /api/enrollment-plans/statistics
   */
  async getGlobalStatistics(req: Request, res: Response): Promise<void> {
    try {
      // 暂时返回模拟数据
      const statistics = {
        total: 2,
        active: 1,
        draft: 1,
        completed: 0,
        totalTargetCount: 220,
        totalCurrentCount: 50,
        totalApplications: 75,
        completionRate: 0.227
      };

      ApiResponse.success(res, statistics, '获取全局招生计划统计成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取全局招生计划统计失败');
    }
  }

  /**
   * 获取招生分析数据
   * @route GET /api/enrollment-plans/analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, planId } = req.query;
      
      // 暂时返回模拟分析数据
      const analytics = {
        totalTarget: 200,
        totalEnrolled: 150,
        totalApplications: 180,
        enrollmentRate: 0.75,
        conversionRate: 0.83,
        trends: [
          { date: '2024-01-01', applications: 20, enrolled: 15 },
          { date: '2024-01-02', applications: 25, enrolled: 18 },
          { date: '2024-01-03', applications: 30, enrolled: 22 },
          { date: '2024-01-04', applications: 28, enrolled: 20 },
          { date: '2024-01-05', applications: 32, enrolled: 25 }
        ],
        channels: [
          { name: '线上推广', applications: 45, enrolled: 30 },
          { name: '转介绍', applications: 35, enrolled: 25 },
          { name: '社区活动', applications: 30, enrolled: 20 },
          { name: '园所宣传', applications: 25, enrolled: 15 }
        ],
        classes: [
          { name: '小班', enrolled: 35 },
          { name: '中班', enrolled: 45 },
          { name: '大班', enrolled: 65 }
        ]
      };

      ApiResponse.success(res, analytics, '获取招生分析数据成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生分析数据失败');
    }
  }

  /**
   * 获取招生计划跟踪记录
   * @route GET /api/enrollment-plans/:id/trackings
   */
  async getTrackings(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id, 10) || 0;
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 暂时返回模拟数据
      const trackings = [
        {
          id: 1,
          planId,
          action: '创建招生计划',
          description: '创建了2024年春季招生计划',
          createdAt: new Date(),
          createdBy: 1
        }
      ];

      ApiResponse.success(res, trackings, '获取招生计划跟踪记录成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生计划跟踪记录失败');
    }
  }

  /**
   * 设置招生计划班级
   * @route POST /api/enrollment-plans/:id/classes
   */
  async setClasses(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id, 10) || 0;
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 暂时返回成功响应
      ApiResponse.success(res, null, '设置招生计划班级成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '设置招生计划班级失败');
    }
  }

  /**
   * 设置招生计划负责人
   * @route POST /api/enrollment-plans/:id/assignees
   */
  async setAssignees(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id, 10) || 0;
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 暂时返回成功响应
      ApiResponse.success(res, null, '设置招生计划负责人成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '设置招生计划负责人失败');
    }
  }

  /**
   * 添加招生计划跟踪记录
   * @route POST /api/enrollment-plans/:id/trackings
   */
  async addTracking(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id, 10) || 0;
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        ApiResponse.error(res, '用户未认证', 'UNAUTHORIZED', 401);
        return;
      }

      // 暂时返回模拟数据
      const tracking = {
        id: Date.now(),
        planId,
        ...req.body,
        createdBy: userId,
        createdAt: new Date()
      };

      ApiResponse.success(res, tracking, '添加招生计划跟踪记录成功', 201);
    } catch (error) {
      ApiResponse.handleError(res, error, '添加招生计划跟踪记录失败');
    }
  }

  /**
   * 更新招生计划状态
   * @route PUT /api/enrollment-plans/:id/status
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id, 10) || 0;
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      const { status } = req.body;
      if (!status) {
        ApiResponse.error(res, '状态参数不能为空', 'INVALID_STATUS', 400);
        return;
      }

      // 验证状态值是否有效
      const validStatuses = ['draft', 'pending', 'in_progress', 'finished', 'cancelled'];
      if (!validStatuses.includes(status)) {
        ApiResponse.error(res, '无效的状态值', 'INVALID_STATUS_VALUE', 400);
        return;
      }

      // 暂时返回模拟数据
      const plan = {
        id: planId,
        status,
        updatedAt: new Date()
      };

      ApiResponse.success(res, plan, '更新招生计划状态成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '更新招生计划状态失败');
    }
  }
}

// 创建控制器实例
const enrollmentPlanController = new EnrollmentPlanController();

// 导出控制器方法
export const createEnrollmentPlan = enrollmentPlanController.create.bind(enrollmentPlanController);
export const getEnrollmentPlans = enrollmentPlanController.list.bind(enrollmentPlanController);
export const getEnrollmentPlanById = enrollmentPlanController.detail.bind(enrollmentPlanController);
export const updateEnrollmentPlan = enrollmentPlanController.update.bind(enrollmentPlanController);
export const deleteEnrollmentPlan = enrollmentPlanController.delete.bind(enrollmentPlanController);
export const getEnrollmentPlanStatistics = enrollmentPlanController.getStatistics.bind(enrollmentPlanController);
export const getGlobalEnrollmentPlanStatistics = enrollmentPlanController.getGlobalStatistics.bind(enrollmentPlanController);
export const getEnrollmentPlanTrackings = enrollmentPlanController.getTrackings.bind(enrollmentPlanController);
export const addEnrollmentPlanTracking = enrollmentPlanController.addTracking.bind(enrollmentPlanController);
export const setEnrollmentPlanClasses = enrollmentPlanController.setClasses.bind(enrollmentPlanController);
export const setEnrollmentPlanAssignees = enrollmentPlanController.setAssignees.bind(enrollmentPlanController);
export const updateEnrollmentPlanStatus = enrollmentPlanController.updateStatus.bind(enrollmentPlanController); 