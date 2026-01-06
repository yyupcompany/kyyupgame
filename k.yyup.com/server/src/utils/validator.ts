import Joi from 'joi';
import { ApiError } from './apiError';

// 定义Joi错误类型
interface JoiError extends Error {
  isJoi: boolean;
  details: Array<{ message: string }>;
}

/**
 * 验证请求数据
 * @param data 请求数据
 * @param schema 验证规则
 * @returns 验证后的数据
 */
export const validateRequest = async <T>(data: any, schema: any): Promise<T> => {
  try {
    const validatedData = await schema.validateAsync(data, {
      abortEarly: false,
      stripUnknown: true
    });
    return validatedData as T;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'isJoi' in error && (error as JoiError).isJoi) {
      const joiError = error as JoiError;
      const messages = joiError.details.map(detail => detail.message);
      throw new ApiError(400, messages.join(', '));
    }
    throw error;
  }
}; 