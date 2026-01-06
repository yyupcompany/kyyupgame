import { Response } from 'express'

export class ErrorHandler {
  static handleError(error: any, res: Response) {
    console.error('API错误:', error)
    
    const statusCode = error.statusCode || 500
    const message = error.message || '服务器内部错误'
    
    res.status(statusCode).json({
      success: false,
      message,
      error: message
    })
  }
}