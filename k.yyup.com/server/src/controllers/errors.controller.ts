/**
 * 错误收集控制器
 * 用于收集和处理前端错误报告
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import SystemLogService from '../services/system/system-log.service';
import { SystemLog } from '../models/system-log.model';

export class ErrorsController {
  /**
   * 报告关键错误
   */
  static reportCriticalError = asyncHandler(async (req: Request, res: Response) => {
    const errorInfo = req.body;
    
    try {
      // 记录到系统日志
      await SystemLogService.createLog({
        level: 'error' as any,
        operationType: 'other' as any,
        moduleName: 'FRONTEND',
        message: `前端关键错误: ${errorInfo.message}`,
        details: JSON.stringify(errorInfo),
        userId: req.user?.id || null,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        action: 'CRITICAL_ERROR',
        type: 'error' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 如果是生产环境，可以发送到错误监控服务
      if (process.env.NODE_ENV === 'production') {
        console.error('🚨 前端关键错误:', errorInfo);
        
        // 这里可以集成第三方错误监控服务
        // 例如：Sentry, LogRocket, Bugsnag等
        // await sendToErrorMonitoring(errorInfo);
      }

      res.status(200).json({
        success: true,
        message: '错误报告已收集',
        data: null
      });
    } catch (error) {
      console.error('处理错误报告失败:', error);
      res.status(500).json({
        success: false,
        message: '错误报告处理失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  });

  /**
   * 批量报告错误
   */
  static reportErrorBatch = asyncHandler(async (req: Request, res: Response) => {
    const { errors } = req.body;
    
    if (!Array.isArray(errors)) {
      return res.status(400).json({
        success: false,
        message: '错误数据格式不正确',
        error: 'Invalid data format'
      });
    }

    try {
      const logEntries = errors.map(error => ({
        level: 'error' as any,
        operationType: 'other' as any,
        moduleName: 'FRONTEND',
        message: `前端错误: ${error.message}`,
        details: JSON.stringify(error),
        userId: req.user?.id || null,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        action: `${error.type.toUpperCase()}_ERROR`,
        type: 'error' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // 批量创建日志
      await SystemLogService.createLogBatch(logEntries);

      res.status(200).json({
        success: true,
        message: `已收集${errors.length}个错误报告`,
        data: null
      });
    } catch (error) {
      console.error('批量处理错误报告失败:', error);
      res.status(500).json({
        success: false,
        message: '批量错误报告处理失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  });

  /**
   * 获取错误统计
   */
  static getErrorStatistics = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      // 查询前端错误日志
      const errorLogs = await SystemLog.findAll({
        where: {
          moduleName: 'FRONTEND',
          action: {
            [require('sequelize').Op.like]: '%_ERROR'
          },
          ...(startDate && endDate && {
            createdAt: {
              [require('sequelize').Op.between]: [new Date(startDate as string), new Date(endDate as string)]
            }
          })
        },
        order: [['createdAt', 'DESC']]
      });

      // 统计错误类型
      const errorStats = errorLogs.reduce((acc, log) => {
        const errorType = log.action?.replace('_ERROR', '').toLowerCase() || 'unknown';
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 统计最近24小时的错误
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentErrors = errorLogs.filter(log => new Date(log.createdAt) > last24Hours);

      res.status(200).json({
        success: true,
        message: '获取错误统计成功',
        data: {
          totalErrors: errorLogs.length,
          errorsByType: errorStats,
          recentErrors: recentErrors.length,
          errorLogs: errorLogs.slice(0, 50) // 返回最近50条错误
        }
      });
    } catch (error) {
      console.error('获取错误统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取错误统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  });

  /**
   * 健康检查接口
   */
  static healthCheck = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: '系统健康',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  });
}