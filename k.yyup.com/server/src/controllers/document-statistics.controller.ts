import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import DocumentInstance from '../models/document-instance.model';
import DocumentTemplate from '../models/document-template.model';

/**
 * 文档统计分析控制器
 */
export class DocumentStatisticsController {
  
  /**
   * 获取统计概览
   * GET /api/document-statistics/overview
   */
  static async getOverview(req: Request, res: Response) {
    try {
      // 移除 kindergartenId 过滤，因为 document_instances 表中没有这个字段
      // 如果需要按幼儿园过滤，应该通过 JOIN 关联到其他表

      // 总文档数
      const totalDocuments = await DocumentInstance.count();

      // 各状态文档数
      const statusStats = await DocumentInstance.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // 本月新增文档数
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);

      const thisMonthDocuments = await DocumentInstance.count({
        where: {
          createdAt: {
            [Op.gte]: thisMonthStart
          }
        }
      });

      // 平均完成进度（使用 completionRate 而不是 progress）
      const avgProgress = await DocumentInstance.findOne({
        attributes: [
          [fn('AVG', col('completion_rate')), 'avgProgress']
        ],
        raw: true
      });

      // 即将逾期的文档数
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const upcomingOverdue = await DocumentInstance.count({
        where: {
          deadline: {
            [Op.between]: [now, threeDaysLater]
          },
          status: {
            [Op.notIn]: ['approved', 'archived']
          }
        }
      });

      // 已逾期的文档数
      const overdue = await DocumentInstance.count({
        where: {
          deadline: {
            [Op.lt]: now
          },
          status: {
            [Op.notIn]: ['approved', 'archived']
          }
        }
      });

      return res.json({
        success: true,
        data: {
          totalDocuments,
          statusStats,
          thisMonthDocuments,
          avgProgress: Math.round((avgProgress as any)?.avgProgress || 0),
          upcomingOverdue,
          overdue
        }
      });
    } catch (error: any) {
      console.error('获取统计概览失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取统计概览失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取使用趋势
   * GET /api/document-statistics/trends
   */
  static async getTrends(req: Request, res: Response) {
    try {
      const { period = '30days' } = req.query;

      let startDate = new Date();
      let groupBy = 'DATE(created_at)';

      // 根据周期设置起始日期和分组方式
      if (period === '7days') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30days') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90days') {
        startDate.setDate(startDate.getDate() - 90);
      } else if (period === '1year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
      }

      // 查询趋势数据
      const trends = await DocumentInstance.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          [literal(groupBy), 'date'],
          [fn('COUNT', col('id')), 'count']
        ],
        group: [literal(groupBy)],
        order: [[col('date'), 'ASC']],
        raw: true
      } as any);

      return res.json({
        success: true,
        data: {
          period,
          trends
        }
      });
    } catch (error: any) {
      console.error('获取使用趋势失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取使用趋势失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取模板使用排行
   * GET /api/document-statistics/template-ranking
   */
  static async getTemplateRanking(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;

      const ranking = await DocumentInstance.findAll({
        attributes: [
          'templateId',
          [fn('COUNT', col('DocumentInstance.id')), 'count']
        ],
        include: [
          {
            model: DocumentTemplate,
            as: 'template',
            attributes: ['id', 'code', 'name', 'category']
          }
        ],
        group: ['templateId', 'template.id'],
        order: [[fn('COUNT', col('DocumentInstance.id')), 'DESC']],
        limit: Number(limit),
        raw: false
      });

      return res.json({
        success: true,
        data: {
          ranking
        }
      });
    } catch (error: any) {
      console.error('获取模板使用排行失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取模板使用排行失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取完成率统计
   * GET /api/document-statistics/completion-rate
   */
  static async getCompletionRate(req: Request, res: Response) {
    try {
      // 按状态统计
      const statusStats = await DocumentInstance.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const total = statusStats.reduce((sum: number, item: any) => sum + Number(item.count), 0);

      const completionRate = statusStats.map((item: any) => ({
        status: item.status,
        count: Number(item.count),
        percentage: total > 0 ? Math.round((Number(item.count) / total) * 100) : 0
      }));

      // 按进度区间统计（使用 completionRate 而不是 progress）
      const progressRanges = [
        { min: 0, max: 20, label: '0-20%' },
        { min: 21, max: 40, label: '21-40%' },
        { min: 41, max: 60, label: '41-60%' },
        { min: 61, max: 80, label: '61-80%' },
        { min: 81, max: 100, label: '81-100%' }
      ];

      const progressStats = await Promise.all(
        progressRanges.map(async (range) => {
          const count = await DocumentInstance.count({
            where: {
              completionRate: {
                [Op.between]: [range.min, range.max]
              }
            }
          });
          return {
            label: range.label,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
          };
        })
      );

      return res.json({
        success: true,
        data: {
          total,
          completionRate,
          progressStats
        }
      });
    } catch (error: any) {
      console.error('获取完成率统计失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取完成率统计失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取用户统计
   * GET /api/document-statistics/user-stats
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      // 按创建者统计（使用 createdBy 而不是 ownerId）
      const ownerStats = await DocumentInstance.findAll({
        attributes: [
          'createdBy',
          [fn('COUNT', col('id')), 'totalCount'],
          [fn('AVG', col('completion_rate')), 'avgProgress']
        ],
        group: ['createdBy'],
        raw: true
      });

      // 按分配人统计
      const assigneeStats = await DocumentInstance.findAll({
        where: {
          assignedTo: {
            [Op.ne]: null
          }
        },
        attributes: [
          'assignedTo',
          [fn('COUNT', col('id')), 'totalCount'],
          [fn('AVG', col('completion_rate')), 'avgProgress']
        ],
        group: ['assignedTo'],
        raw: true
      });

      return res.json({
        success: true,
        data: {
          ownerStats,
          assigneeStats
        }
      });
    } catch (error: any) {
      console.error('获取用户统计失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取用户统计失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 导出统计报表
   * GET /api/document-statistics/export
   */
  static async exportReport(req: Request, res: Response) {
    try {
      const { format = 'excel' } = req.query;
      const kindergartenId = (req as any).user?.kindergartenId;

      // TODO: 实现Excel/PDF导出功能
      return res.json({
        success: true,
        data: {
          message: '导出功能开发中...',
          format
        }
      });
    } catch (error: any) {
      console.error('导出统计报表失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '导出统计报表失败',
          details: error.message
        }
      });
    }
  }
}

