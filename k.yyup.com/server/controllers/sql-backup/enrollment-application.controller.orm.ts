/**
 * 报名申请控制器
 */
import { Request, Response, NextFunction } from 'express';
import enrollmentApplicationService from '../services/enrollment/enrollment-application.service';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 创建报名申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const applicationData = req.body;
    const application = await enrollmentApplicationService.createApplication(applicationData, userId);
    
    return ApiResponse.success(res, application, '创建报名申请成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取报名申请详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const application = await enrollmentApplicationService.getApplicationById(Number(id));
    
    return ApiResponse.success(res, application, '获取报名申请详情成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 更新报名申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const applicationData = req.body;
    const application = await enrollmentApplicationService.updateApplication(Number(id), applicationData, userId);
    
    return ApiResponse.success(res, application, '更新报名申请成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除报名申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await enrollmentApplicationService.deleteApplication(Number(id));
    
    return ApiResponse.success(res, null, '删除报名申请成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取报名申请列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, size = 10, ...filters } = req.query;
    const applications = await enrollmentApplicationService.getApplications(
      filters,
      Number(page),
      Number(size)
    );
    
    return ApiResponse.success(res, applications, '获取报名申请列表成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 审核报名申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const reviewApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const reviewData = req.body;
    const application = await enrollmentApplicationService.reviewApplication(Number(id), reviewData, userId);
    
    return ApiResponse.success(res, application, '审核报名申请成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 添加报名申请材料
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const addApplicationMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const materialData = req.body;
    const material = await enrollmentApplicationService.addApplicationMaterial(
      Number(applicationId),
      materialData,
      userId
    );
    
    return ApiResponse.success(res, material, '添加报名申请材料成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 验证报名申请材料
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const verifyMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { materialId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const verifyData = req.body;
    const material = await enrollmentApplicationService.verifyMaterial(
      Number(materialId),
      verifyData,
      userId
    );
    
    return ApiResponse.success(res, material, '验证报名申请材料成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除报名申请材料
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const deleteMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { materialId } = req.params;
    await enrollmentApplicationService.deleteMaterial(Number(materialId));
    
    return ApiResponse.success(res, null, '删除报名申请材料成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取报名申请材料列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getMaterials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const materials = await enrollmentApplicationService.getMaterials(Number(applicationId));
    
    return ApiResponse.success(res, materials, '获取报名申请材料列表成功');
  } catch (error) {
    next(error);
  }
}; 