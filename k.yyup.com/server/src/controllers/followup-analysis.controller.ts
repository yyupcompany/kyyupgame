/**
 * 跟进质量分析控制器
 */

import { Request, Response } from 'express';
import { followupAnalysisService } from '../services/ai/followup-analysis.service';
import { pdfReportService } from '../services/ai/pdf-report.service';

/**
 * 获取跟进质量统计
 */
export const getFollowupAnalysis = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('📊 [跟进质量分析] 开始查询统计数据');

    const result = await followupAnalysisService.getFollowupStatistics(
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: result,
      message: '跟进质量统计完成'
    });
  } catch (error: any) {
    console.error('❌ [跟进质量分析] 失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '跟进质量统计失败'
    });
  }
};

/**
 * AI深度分析跟进质量
 */
export const analyzeFollowupQuality = async (req: Request, res: Response) => {
  try {
    const { teacherIds, analysisType } = req.body;
    const userId = (req as any).user?.id;

    console.log('🤖 [AI深度分析] 开始分析跟进质量');

    const result = await followupAnalysisService.analyzeFollowupQuality(
      teacherIds,
      analysisType || 'detailed',
      userId
    );

    res.json({
      success: true,
      data: result,
      message: 'AI深度分析完成'
    });
  } catch (error: any) {
    console.error('❌ [AI深度分析] 失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI深度分析失败'
    });
  }
};

/**
 * 生成PDF报告
 */
export const generatePDFReport = async (req: Request, res: Response) => {
  try {
    const { teacherIds, mergeAll, includeAIAnalysis, format } = req.body;
    const userId = (req as any).user?.id;

    // 参数验证
    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供教师ID列表'
      });
    }

    console.log(`📄 [PDF报告生成] 为${teacherIds.length}个教师生成报告`);

    const result = await pdfReportService.generateFollowupReports(
      {
        teacherIds,
        mergeAll: mergeAll || false,
        includeAIAnalysis: includeAIAnalysis !== false,
        format: format || 'detailed'
      },
      userId
    );

    res.json({
      success: true,
      data: result,
      message: 'PDF报告生成成功'
    });
  } catch (error: any) {
    console.error('❌ [PDF报告生成] 失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'PDF报告生成失败'
    });
  }
};

