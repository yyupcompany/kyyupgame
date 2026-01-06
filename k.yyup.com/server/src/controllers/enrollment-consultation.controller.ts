import { Request, Response } from 'express';
import { EnrollmentConsultationService, EnrollmentConsultationFollowupService } from '../services/enrollment';
import { 
  createEnrollmentConsultationSchema,
  updateEnrollmentConsultationSchema,
  enrollmentConsultationFilterSchema,
  createEnrollmentConsultationFollowupSchema,
  enrollmentConsultationFollowupFilterSchema
} from '../validations/enrollment-consultation.validation';
import { validateRequest } from '../utils/validator';
import { ApiResponse } from '../utils/apiResponse';
import { 
  CreateEnrollmentConsultationDto, 
  UpdateEnrollmentConsultationDto,
  EnrollmentConsultationFilterParams,
  CreateEnrollmentConsultationFollowupDto,
  EnrollmentConsultationFollowupFilterParams
} from '../types/enrollment-consultation';

/**
 * 招生咨询控制器
 * 处理招生咨询相关的HTTP请求
 */
export class EnrollmentConsultationController {
  private consultationService: EnrollmentConsultationService;
  private followupService: EnrollmentConsultationFollowupService;

  constructor() {
    this.consultationService = new EnrollmentConsultationService();
    this.followupService = new EnrollmentConsultationFollowupService();
  }

  /**
   * 创建招生咨询
   * @param req 请求对象
   * @param res 响应对象
   */
  createConsultation = async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求数据
      const validatedData = await validateRequest<CreateEnrollmentConsultationDto>(req.body, createEnrollmentConsultationSchema);
      
      // 创建招生咨询
      const userId = req.user?.id as number;
      const consultation = await this.consultationService.createConsultation(validatedData, userId);
      
      ApiResponse.success(res, consultation, '招生咨询创建成功', 201);
    } catch (error) {
      ApiResponse.handleError(res, error, '创建招生咨询失败');
    }
  };

  /**
   * 获取招生咨询详情
   * @param req 请求对象
   * @param res 响应对象
   */
  getConsultationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的咨询ID');
        return;
      }
      
      const consultation = await this.consultationService.getConsultationById(id);
      
      ApiResponse.success(res, consultation, '获取招生咨询详情成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生咨询详情失败');
    }
  };

  /**
   * 更新招生咨询
   * @param req 请求对象
   * @param res 响应对象
   */
  updateConsultation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的咨询ID');
        return;
      }
      
      // 验证请求数据
      const validatedData = await validateRequest<UpdateEnrollmentConsultationDto>({ ...req.body, id }, updateEnrollmentConsultationSchema);
      
      // 更新招生咨询
      const userId = req.user?.id as number;
      const consultation = await this.consultationService.updateConsultation(validatedData, userId);
      
      ApiResponse.success(res, consultation, '招生咨询更新成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '更新招生咨询失败');
    }
  };

  /**
   * 删除招生咨询
   * @param req 请求对象
   * @param res 响应对象
   */
  deleteConsultation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的咨询ID');
        return;
      }
      
      await this.consultationService.deleteConsultation(id);
      
      ApiResponse.success(res, null, '招生咨询删除成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '删除招生咨询失败');
    }
  };

  /**
   * 获取招生咨询列表
   * @param req 请求对象
   * @param res 响应对象
   */
  getConsultationList = async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求参数
      const validatedParams = await validateRequest<EnrollmentConsultationFilterParams>(req.query, enrollmentConsultationFilterSchema);

      // 获取用户信息用于角色过滤
      const userInfo = req.user ? {
        id: req.user.id,
        role: (req.user as any)?.role || 'admin'
      } : undefined;

      // 查询招生咨询列表，传递用户信息进行角色过滤
      const consultations = await this.consultationService.getConsultationList(validatedParams, userInfo);

      ApiResponse.success(res, consultations, '获取招生咨询列表成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生咨询列表失败');
    }
  };

  /**
   * 获取招生咨询统计
   * @param req 请求对象
   * @param res 响应对象
   */
  getConsultationStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求参数
      const validatedParams = await validateRequest<EnrollmentConsultationFilterParams>(req.query, enrollmentConsultationFilterSchema);
      
      // 查询招生咨询统计
      const statistics = await this.consultationService.getConsultationStatistics(validatedParams);
      
      ApiResponse.success(res, statistics, '获取招生咨询统计成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生咨询统计失败');
    }
  };

  /**
   * 创建招生咨询跟进记录
   * @param req 请求对象
   * @param res 响应对象
   */
  createFollowup = async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求数据
      const validatedData = await validateRequest<CreateEnrollmentConsultationFollowupDto>(req.body, createEnrollmentConsultationFollowupSchema);
      
      // 创建招生咨询跟进记录
      const userId = req.user?.id as number;
      const followup = await this.followupService.createFollowup(validatedData, userId);
      
      ApiResponse.success(res, followup, '招生咨询跟进记录创建成功', 201);
    } catch (error) {
      ApiResponse.handleError(res, error, '创建招生咨询跟进记录失败');
    }
  };

  /**
   * 获取招生咨询跟进记录详情
   * @param req 请求对象
   * @param res 响应对象
   */
  getFollowupById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10) || 0;
      
      if (isNaN(id)) {
        ApiResponse.badRequest(res, '无效的跟进记录ID');
        return;
      }
      
      const followup = await this.followupService.getFollowupById(id);
      
      ApiResponse.success(res, followup, '获取招生咨询跟进记录详情成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生咨询跟进记录详情失败');
    }
  };

  /**
   * 获取招生咨询跟进记录列表
   * @param req 请求对象
   * @param res 响应对象
   */
  getFollowupList = async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求参数
      const validatedParams = await validateRequest<EnrollmentConsultationFollowupFilterParams>(req.query, enrollmentConsultationFollowupFilterSchema);
      
      // 查询招生咨询跟进记录列表
      const followups = await this.followupService.getFollowupList(validatedParams);
      
      ApiResponse.success(res, followups, '获取招生咨询跟进记录列表成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '获取招生咨询跟进记录列表失败');
    }
  };
}

export default new EnrollmentConsultationController(); 