import { Response } from 'express';
import { ApiResponseEnhanced } from '../utils/apiResponseEnhanced';

export class BaseController {
  /**
   * 统一错误处理
   */
  protected handleError(res: Response, error: any, defaultMessage = '操作失败') {
    ApiResponseEnhanced.handleError(res, error, defaultMessage);
  }

  /**
   * 统一成功响应
   */
  protected handleSuccess(res: Response, data?: any, message = '操作成功') {
    ApiResponseEnhanced.success(res, data, message);
  }

  /**
   * 统一分页响应
   */
  protected handlePaginated(
    res: Response,
    items: any[],
    total: number,
    page: number,
    pageSize: number,
    message = '获取数据成功'
  ) {
    ApiResponseEnhanced.paginated(res, items, total, page, pageSize, message);
  }

  /**
   * 统一未授权响应
   */
  protected handleUnauthorized(res: Response, message = '未授权') {
    ApiResponseEnhanced.unauthorized(res, message);
  }

  /**
   * 统一禁止访问响应
   */
  protected handleForbidden(res: Response, message = '禁止访问') {
    ApiResponseEnhanced.forbidden(res, message);
  }

  /**
   * 统一资源不存在响应
   */
  protected handleNotFound(res: Response, message = '资源不存在') {
    ApiResponseEnhanced.notFound(res, message);
  }

  /**
   * 统一请求参数错误响应
   */
  protected handleBadRequest(res: Response, message = '请求参数错误') {
    ApiResponseEnhanced.badRequest(res, message);
  }
}