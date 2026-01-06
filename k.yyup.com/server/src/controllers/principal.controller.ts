import { Request, Response } from 'express';
import { PrincipalService } from '../services/principal.service';
import { BaseController } from './base.controller';
import RoleCacheService from '../services/role-cache.service';

export class PrincipalController extends BaseController {
  private principalService: PrincipalService;

  constructor() {
    super();
    this.principalService = new PrincipalService();
  }

  /**
   * 获取园区概览
   */
  getCampusOverview = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      // 尝试从缓存获取
      const cachedData = await RoleCacheService.getPrincipalData(userId, 'campus_overview');

      if (cachedData) {
        console.log('✅ 从缓存获取园区概览数据');
        return this.handleSuccess(res, cachedData, '获取园区概览成功（缓存）');
      }

      const data = await this.principalService.getCampusOverview();

      // 缓存数据（5分钟）
      await RoleCacheService.setPrincipalData(userId, 'campus_overview', data, 300);

      this.handleSuccess(res, data, '获取园区概览成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取待审批列表
   */
  getApprovalList = async (req: Request, res: Response) => {
    try {
      const { status, type, page, pageSize } = req.query;
      const data = await this.principalService.getApprovalList({
        status: status as string,
        type: type as string,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 10
      });
      this.handleSuccess(res, data, '获取待审批列表成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 处理审批
   */
  /**
   * 获取仪表板统计
   */
  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      // 尝试从缓存获取
      const cachedData = await RoleCacheService.getDashboardData(userId, 'principal');

      if (cachedData) {
        console.log('✅ 从缓存获取园长仪表板统计数据');
        return this.handleSuccess(res, cachedData, '获取仪表板统计成功（缓存）');
      }

      const data = await this.principalService.getDashboardStats();

      // 缓存数据（5分钟）
      await RoleCacheService.setDashboardData(userId, 'principal', data);

      this.handleSuccess(res, data, '获取仪表板统计成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取活动列表
   */
  getActivities = async (req: Request, res: Response) => {
    try {
      const { page, pageSize, status } = req.query;
      const data = await this.principalService.getActivities({
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 10,
        status: status as string
      });
      this.handleSuccess(res, data, '获取活动列表成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  handleApproval = async (req: Request, res: Response) => {
    try {
      const { id, action } = req.params;
      const { comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未登录'
        });
      }

      const data = await this.principalService.handleApproval(
        id,
        action as 'approve' | 'reject',
        userId,
        comment
      );
      
      const message = action === 'approve' ? '审批通过成功' : '审批拒绝成功';
      this.handleSuccess(res, data, message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取重要通知
   */
  getImportantNotices = async (req: Request, res: Response) => {
    try {
      const data = await this.principalService.getImportantNotices();
      this.handleSuccess(res, data, '获取重要通知成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 发布通知
   */
  publishNotice = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未登录'
        });
      }

      const data = await this.principalService.publishNotice({
        ...req.body,
        publisherId: userId
      });
      
      this.handleSuccess(res, data, '发布通知成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取园长工作安排
   */
  getPrincipalSchedule = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未登录'
        });
      }

      const data = await this.principalService.getPrincipalSchedule(userId);
      this.handleSuccess(res, data, '获取工作安排成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 创建园长日程安排
   */
  createPrincipalSchedule = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未登录'
        });
      }

      const data = await this.principalService.createPrincipalSchedule({
        ...req.body,
        userId
      });
      
      this.handleSuccess(res, data, '创建日程安排成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取招生趋势数据
   */
  getEnrollmentTrend = async (req: Request, res: Response) => {
    try {
      const { period = 'month' } = req.query;
      const data = await this.principalService.getEnrollmentTrend(period as string);
      this.handleSuccess(res, data, '获取招生趋势数据成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取客户池统计数据
   */
  getCustomerPoolStats = async (req: Request, res: Response) => {
    try {
      const data = await this.principalService.getCustomerPoolStats();
      this.handleSuccess(res, data, '获取客户池统计数据成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取客户池列表
   */
  getCustomerPoolList = async (req: Request, res: Response) => {
    try {
      const params = req.query;
      const data = await this.principalService.getCustomerPoolList(params);
      this.handleSuccess(res, data, '获取客户池列表成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取绩效统计数据
   */
  getPerformanceStats = async (req: Request, res: Response) => {
    try {
      const params = req.query;
      const data = await this.principalService.getPerformanceStats(params);
      this.handleSuccess(res, data, '获取绩效统计数据成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取绩效排名数据
   */
  getPerformanceRankings = async (req: Request, res: Response) => {
    try {
      const params = req.query;
      const data = await this.principalService.getPerformanceRankings(params);
      this.handleSuccess(res, data, '获取绩效排名数据成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取绩效详情数据
   */
  getPerformanceDetails = async (req: Request, res: Response) => {
    try {
      const params = req.query;
      const data = await this.principalService.getPerformanceDetails(params);
      this.handleSuccess(res, data, '获取绩效详情数据成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取客户详情
   */
  getCustomerDetail = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.principalService.getCustomerDetail(parseInt(id));
      this.handleSuccess(res, data, '获取客户详情成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 分配客户给教师
   */
  assignCustomerTeacher = async (req: Request, res: Response) => {
    try {
      const data = await this.principalService.assignCustomerTeacher(req.body);
      this.handleSuccess(res, data, '分配客户成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 批量分配客户给教师
   */
  batchAssignCustomerTeacher = async (req: Request, res: Response) => {
    try {
      const data = await this.principalService.batchAssignCustomerTeacher(req.body);
      this.handleSuccess(res, data, '批量分配客户成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 删除客户
   */
  deleteCustomer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.principalService.deleteCustomer(parseInt(id));
      this.handleSuccess(res, data, '删除客户成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 添加客户跟进记录
   */
  addCustomerFollowUp = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.principalService.addCustomerFollowUp(parseInt(id), req.body);
      this.handleSuccess(res, data, '添加跟进记录成功');
    } catch (error) {
      this.handleError(res, error);
    }
  };
}