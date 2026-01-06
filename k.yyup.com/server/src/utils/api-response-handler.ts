import { Response } from 'express';

/**
 * 统一API响应处理函数
 */
export function handleApiResponse(
  res: Response,
  data: any,
  message: string,
  error?: any,
  statusCode: number = 200
): void {
  if (error) {
    console.error('API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = statusCode >= 400 ? statusCode : 500;
    
    res.status(errorCode).json({
      success: false,
      message,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
}
