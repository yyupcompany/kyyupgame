import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { EnrollmentPlanService } from '../services';
import { 
  createEnrollmentPlanSchema, 
  updateEnrollmentPlanSchema, 
  enrollmentPlanFilterSchema,
  enrollmentPlanTrackingFilterSchema,
  enrollmentPlanClassSchema,
  enrollmentPlanAssigneeSchema
} from '../validations/enrollment-plan.validation';
import { 
  CreateEnrollmentPlanDto, 
  UpdateEnrollmentPlanDto,
  EnrollmentPlanFilterParams,
  EnrollmentPlanTrackingFilterParams,
  EnrollmentPlanClassDto,
  EnrollmentPlanAssigneeDto
} from '../types/enrollment-plan';
import { User } from '../models/user.model';

// 扩展 Request 类型以包含 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * 招生计划控制器
 * 处理与招生计划相关的请求
 */
export class EnrollmentPlanController {
  private enrollmentPlanService: EnrollmentPlanService;

  constructor() {
    this.enrollmentPlanService = new EnrollmentPlanService();
  }

  /**
   * 创建招生计划
   * @route POST /api/enrollment-plans
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求参数
      const { error, value } = createEnrollmentPlanSchema.validate(req.body);
      if (error) {
        ApiResponse.error(res, error.message, 'VALIDATION_ERROR', 400);
        return;
      }

      // 获取当前用户ID (假设通过认证中间件设置)
      const userId = req.user?.id;
      if (!userId) {
        ApiResponse.error(res, '用户未认证', 'UNAUTHORIZED', 401);
        return;
      }

      const plan = await this.enrollmentPlanService.create(value as CreateEnrollmentPlanDto, userId);
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
      // 验证查询参数
      const { error, value } = enrollmentPlanFilterSchema.validate(req.query);
      if (error) {
        ApiResponse.error(res, error.message, 'VALIDATION_ERROR', 400);
        return;
      }

      const planList = await this.enrollmentPlanService.list(value as EnrollmentPlanFilterParams);
      ApiResponse.success(res, planList, '获取招生计划列表成功');
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      const plan = await this.enrollmentPlanService.detail(id);
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 验证请求参数
      const { error, value } = updateEnrollmentPlanSchema.validate(req.body);
      if (error) {
        ApiResponse.error(res, error.message, 'VALIDATION_ERROR', 400);
        return;
      }

      const plan = await this.enrollmentPlanService.update(id, value as UpdateEnrollmentPlanDto);
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      await this.enrollmentPlanService.delete(id);
      ApiResponse.success(res, null, '删除招生计划成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '删除招生计划失败');
    }
  }

  /**
   * 设置招生计划班级
   * @route POST /api/enrollment-plans/:id/classes
   */
  async setClasses(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 验证请求参数
      const { error, value } = enrollmentPlanClassSchema.validate({ ...req.body, planId });
      if (error) {
        ApiResponse.error(res, error.message, 'VALIDATION_ERROR', 400);
        return;
      }

      await this.enrollmentPlanService.setClasses(value as EnrollmentPlanClassDto);
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
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 验证请求参数
      const { error, value } = enrollmentPlanAssigneeSchema.validate({ ...req.body, planId });
      if (error) {
        ApiResponse.error(res, error.message, 'VALIDATION_ERROR', 400);
        return;
      }

      await this.enrollmentPlanService.setAssignees(value as EnrollmentPlanAssigneeDto);
      ApiResponse.success(res, null, '设置招生计划负责人成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '设置招生计划负责人失败');
    }
  }

  /**
   * 获取招生计划完成统计
   * @route GET /api/enrollment-plans/:id/statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      const statistics = await this.enrollmentPlanService.getStatistics(id);
      ApiResponse.success(res, statistics, '获取招生计划统计成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生计划统计失败');
    }
  }

  /**
   * 获取招生计划执行跟踪记录
   * @route GET /api/enrollment-plans/:id/trackings
   */
  async getTrackings(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 验证查询参数
      const { error, value } = enrollmentPlanTrackingFilterSchema.validate({ ...req.query, planId });
      if (error) {
        ApiResponse.error(res, error.message, 'VALIDATION_ERROR', 400);
        return;
      }

      const trackings = await this.enrollmentPlanService.getTrackings(value as EnrollmentPlanTrackingFilterParams);
      ApiResponse.success(res, trackings, '获取招生计划跟踪记录成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生计划跟踪记录失败');
    }
  }

  /**
   * 添加招生计划执行跟踪记录
   * @route POST /api/enrollment-plans/:id/trackings
   */
  async addTracking(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
        return;
      }

      // 获取当前用户ID (假设通过认证中间件设置)
      const userId = req.user?.id;
      if (!userId) {
        ApiResponse.error(res, '用户未认证', 'UNAUTHORIZED', 401);
        return;
      }

      // 验证请求参数
      // 这里暂时没有添加跟踪记录的验证规则，需要根据实际情况添加
      const tracking = await this.enrollmentPlanService.addTracking(planId, req.body, userId);
      ApiResponse.success(res, tracking, '添加招生计划跟踪记录成功', 201);
    } catch (error) {
      ApiResponse.handleError(res, error, '添加招生计划跟踪记录失败');
    }
  }
}

export default new EnrollmentPlanController(); 