import { Response } from 'express';
import { IMiddlewareResult } from '../../../middlewares/ai/base.middleware';
import { ApiResponse } from '../../../utils/apiResponse';

export const handleMiddlewareResponse = <T>(res: Response, result: IMiddlewareResult<T>) => {
  if (result.success) {
    ApiResponse.success(res, result.data);
  } else {
    // 默认错误处理
    let statusCode = 400; // Bad Request as default
    if (result.error) {
        switch (result.error.code) {
            case 'FORBIDDEN':
                statusCode = 403;
                break;
            case 'NOT_FOUND':
                statusCode = 404;
                break;
            case 'UNAUTHORIZED':
                statusCode = 401;
                break;
            case 'SERVER_ERROR':
                statusCode = 500;
                break;
        }
        ApiResponse.error(res, result.error.message, result.error.code, statusCode);
    } else {
        ApiResponse.serverError(res, 'An unexpected error occurred.');
    }
  }
}; 