import { Request, Response } from 'express';
import { EnrollmentQuotaService } from '../services/enrollment/enrollment-quota.service';
import {
  createEnrollmentQuotaSchema,
  updateEnrollmentQuotaSchema,
  enrollmentQuotaFilterSchema,
  enrollmentQuotaAllocationSchema,
  enrollmentQuotaBatchAdjustmentSchema
} from '../validations/enrollment-quota.validation';
import { ApiResponse } from '../utils/apiResponse';
import { EnrollmentQuota } from '../types/database.types';

/**
 * 招生名额控制器
 * 处理招生名额相关的HTTP请求
 */
export class EnrollmentQuotaController {
  private quotaService: EnrollmentQuotaService;

  constructor() {
    this.quotaService = new EnrollmentQuotaService();
  }

  /**
   * 创建招生名额
   * @route POST /api/enrollment/quotas
   */
  async createEnrollmentQuota(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求数据
      const { error, value } = createEnrollmentQuotaSchema.validate(req.body);
      if (error) {
        ApiResponse.badRequest(res, error.message);
        return;
      }

      // 创建招生名额
      const quota = await this.quotaService.createQuota(value);
      ApiResponse.success(res, quota, '招生名额创建成功', 201);
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 获取招生名额详情
   * @route GET /api/enrollment/quotas/:id
   */
  async getEnrollmentQuotaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的名额ID');
        return;
      }

      const quota = await this.quotaService.getQuotaById(id);
      ApiResponse.success(res, quota);
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 更新招生名额
   * @route PUT /api/enrollment/quotas/:id
   */
  async updateEnrollmentQuota(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的名额ID');
        return;
      }

      // 验证请求数据
      const { error, value } = updateEnrollmentQuotaSchema.validate({
        ...req.body,
        id
      });
      
      if (error) {
        ApiResponse.badRequest(res, error.message);
        return;
      }

      // 更新招生名额
      const quota = await this.quotaService.updateQuota(value);
      ApiResponse.success(res, quota, '招生名额更新成功');
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 删除招生名额
   * @route DELETE /api/enrollment/quotas/:id
   */
  async deleteEnrollmentQuota(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的名额ID');
        return;
      }

      await this.quotaService.deleteQuota(id);
      ApiResponse.success(res, null, '招生名额删除成功');
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 获取招生名额列表
   * @route GET /api/enrollment/quotas
   */
  async getEnrollmentQuotas(req: Request, res: Response): Promise<void> {
    try {
      // 验证过滤参数
      const { error, value } = enrollmentQuotaFilterSchema.validate(req.query);
      if (error) {
        ApiResponse.badRequest(res, error.message);
        return;
      }

      // 获取名额列表
      const quotaList = await this.quotaService.getQuotaList(value);
      ApiResponse.success(res, quotaList);
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 分配招生名额
   * @route POST /api/enrollment/quotas/allocate
   */
  async allocateQuota(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求数据
      const { error, value } = enrollmentQuotaAllocationSchema.validate(req.body);
      if (error) {
        ApiResponse.badRequest(res, error.message);
        return;
      }

      // 分配名额
      const quota = await this.quotaService.allocateQuota(value);
      ApiResponse.success(res, quota, '名额分配成功');
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 获取招生名额统计
   * @route GET /api/enrollment/quotas/statistics/:planId
   */
  async getQuotaStatistics(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.planId, 10) || 0;
      if (isNaN(planId)) {
        ApiResponse.badRequest(res, '无效的计划ID');
        return;
      }

      // 获取名额统计
      const statistics = await this.quotaService.getQuotaStatistics(planId);
      ApiResponse.success(res, statistics);
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 批量调整招生名额
   * @route POST /api/enrollment/quotas/batch-adjust
   */
  async batchAdjustQuota(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求数据
      const { error, value } = enrollmentQuotaBatchAdjustmentSchema.validate(req.body);
      if (error) {
        ApiResponse.badRequest(res, error.message);
        return;
      }

      // 批量调整名额
      await this.quotaService.batchAdjustQuota(value);
      ApiResponse.success(res, null, '名额批量调整成功');
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 按计划获取招生名额
   * @route GET /api/enrollment-quotas/by-plan/:planId
   */
  async getQuotasByPlan(req: Request, res: Response): Promise<void> {
    try {
      const planId = parseInt(req.params.planId, 10) || 0;
      if (isNaN(planId)) {
        ApiResponse.badRequest(res, '无效的计划ID');
        return;
      }

      // 获取计划下的名额列表
      const quotas = await this.quotaService.getQuotasByPlan(planId);
      ApiResponse.success(res, quotas, '按计划获取招生名额成功');
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 按班级获取招生名额
   * @route GET /api/enrollment-quotas/by-class/:classId
   */
  async getQuotasByClass(req: Request, res: Response): Promise<void> {
    try {
      const classId = parseInt(req.params.classId, 10) || 0;
      if (isNaN(classId)) {
        ApiResponse.badRequest(res, '无效的班级ID');
        return;
      }

      // 获取班级下的名额列表
      const quotas = await this.quotaService.getQuotasByClass(classId);
      ApiResponse.success(res, quotas, '按班级获取招生名额成功');
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }

  /**
   * 调整招生名额
   * @route PATCH /api/enrollment-quotas/:id/adjust
   */
  async adjustQuota(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的名额ID');
        return;
      }

      const { adjustment, reason } = req.body;
      
      if (typeof adjustment !== 'number') {
        ApiResponse.badRequest(res, '调整数量必须是数字');
        return;
      }

      // 调整名额
      const quota = await this.quotaService.adjustQuota(id, adjustment, reason);
      ApiResponse.success(res, quota, '招生名额调整成功');
    } catch (error) {
      ApiResponse.handleError(res, error);
    }
  }
} 