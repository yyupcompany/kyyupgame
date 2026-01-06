/**
 * AI智能分配控制器
 */

import { Request, Response } from 'express';
import { smartAssignService } from '../services/ai/smart-assign.service';

/**
 * AI智能分配
 */
export const smartAssign = async (req: Request, res: Response) => {
  try {
    const { customerIds, options } = req.body;
    const userId = (req as any).user?.id;

    // 参数验证
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要分配的客户ID列表'
      });
    }

    console.log(`🤖 [AI智能分配] 用户${userId}请求为${customerIds.length}个客户分配教师`);

    // 调用AI推荐服务
    const recommendations = await smartAssignService.recommendTeacher(
      customerIds,
      options || {},
      userId
    );

    res.json({
      success: true,
      data: {
        recommendations: recommendations
      },
      message: 'AI分配建议生成成功'
    });
  } catch (error: any) {
    console.error('❌ [AI智能分配] 失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI分配失败'
    });
  }
};

/**
 * 执行批量分配
 */
export const batchAssign = async (req: Request, res: Response) => {
  try {
    const { assignments, note } = req.body;

    // 参数验证
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供分配列表'
      });
    }

    console.log(`📝 [批量分配] 开始执行${assignments.length}个客户分配`);

    // 执行分配
    const result = await smartAssignService.executeAssignment(assignments, note);

    res.json({
      success: true,
      data: result,
      message: `分配完成: 成功${result.successCount}个，失败${result.failedCount}个`
    });
  } catch (error: any) {
    console.error('❌ [批量分配] 失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '批量分配失败'
    });
  }
};

/**
 * 获取教师能力分析
 */
export const getTeacherCapacity = async (req: Request, res: Response) => {
  try {
    console.log('📊 [教师能力分析] 开始查询');

    const capacityData = await smartAssignService.analyzeTeacherCapacity();

    res.json({
      success: true,
      data: capacityData,
      message: '教师能力分析完成'
    });
  } catch (error: any) {
    console.error('❌ [教师能力分析] 失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '教师能力分析失败'
    });
  }
};

