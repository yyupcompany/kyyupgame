import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { CustomerApplicationService } from '../services/customer-application.service';

/**
 * 扩展Request接口，添加用户信息
 * 使用类型断言而不是接口扩展，避免与Express的User类型冲突
 */
type AuthRequest = Request & {
  user?: {
    id: number;
    userId?: number;  // 可选，因为verifyToken中间件只设置id
    username: string;
    role: string;
    kindergartenId?: number;
    [key: string]: any;  // 允许其他属性
  };
}

/**
 * 客户申请控制器
 */
export class CustomerApplicationController extends BaseController {
  private customerApplicationService: CustomerApplicationService;

  constructor() {
    super();
    this.customerApplicationService = new CustomerApplicationService();
  }

  /**
   * 教师申请客户（支持批量）
   * POST /api/teacher/customer-applications
   */
  applyForCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { customerIds, applyReason } = req.body;
      const teacherId = req.user?.userId || req.user?.id;
      const kindergartenId = req.user?.kindergartenId;

      // 参数验证
      if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
        res.status(400).json({
          success: false,
          message: '请选择要申请的客户'
        });
        return;
      }

      if (!teacherId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      // 调用服务层处理申请
      const result = await this.customerApplicationService.applyForCustomers({
        customerIds,
        teacherId,
        kindergartenId,
        applyReason
      });

      this.handleSuccess(res, result, '申请提交成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取教师的申请记录
   * GET /api/teacher/customer-applications
   */
  getTeacherApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teacherId = req.user?.userId || req.user?.id;
      const { status, page = 1, pageSize = 20 } = req.query;

      if (!teacherId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      const result = await this.customerApplicationService.getTeacherApplications({
        teacherId,
        status: status as string,
        page: Number(page),
        pageSize: Number(pageSize)
      });

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取园长待审批的申请列表
   * GET /api/principal/customer-applications
   */
  getPrincipalApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const kindergartenId = req.user?.kindergartenId;
      const { status, teacherId, customerId, page = 1, pageSize = 20 } = req.query;

      const result = await this.customerApplicationService.getPrincipalApplications({
        kindergartenId,
        status: status as string,
        teacherId: teacherId ? Number(teacherId) : undefined,
        customerId: customerId ? Number(customerId) : undefined,
        page: Number(page),
        pageSize: Number(pageSize)
      });

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 园长审批申请
   * POST /api/principal/customer-applications/:id/review
   */
  reviewApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, rejectReason } = req.body;
      const principalId = req.user?.userId || req.user?.id;

      // 参数验证
      if (!action || !['approve', 'reject'].includes(action)) {
        res.status(400).json({
          success: false,
          message: '审批操作无效'
        });
        return;
      }

      if (action === 'reject' && !rejectReason) {
        res.status(400).json({
          success: false,
          message: '拒绝申请时必须填写拒绝理由'
        });
        return;
      }

      if (!principalId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      // 调用服务层处理审批
      const result = await this.customerApplicationService.reviewApplication({
        applicationId: Number(id),
        principalId,
        action,
        rejectReason
      });

      this.handleSuccess(res, result, action === 'approve' ? '已同意申请' : '已拒绝申请');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 批量审批申请
   * POST /api/principal/customer-applications/batch-review
   */
  batchReviewApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { applicationIds, action, rejectReason } = req.body;
      const principalId = req.user?.userId || req.user?.id;

      // 参数验证
      if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
        res.status(400).json({
          success: false,
          message: '请选择要审批的申请'
        });
        return;
      }

      if (!action || !['approve', 'reject'].includes(action)) {
        res.status(400).json({
          success: false,
          message: '审批操作无效'
        });
        return;
      }

      if (action === 'reject' && !rejectReason) {
        res.status(400).json({
          success: false,
          message: '批量拒绝申请时必须填写拒绝理由'
        });
        return;
      }

      if (!principalId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      // 调用服务层处理批量审批
      const result = await this.customerApplicationService.batchReviewApplications({
        applicationIds,
        principalId,
        action,
        rejectReason
      });

      this.handleSuccess(res, result, `批量${action === 'approve' ? '同意' : '拒绝'}成功`);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取申请详情
   * GET /api/customer-applications/:id
   */
  getApplicationDetail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      const result = await this.customerApplicationService.getApplicationDetail(Number(id), userId);

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取申请统计
   * GET /api/customer-applications/stats
   */
  getApplicationStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const userRole = req.user?.role;
      const kindergartenId = req.user?.kindergartenId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      const result = await this.customerApplicationService.getApplicationStats({
        userId,
        userRole,
        kindergartenId
      });

      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

export default new CustomerApplicationController();

