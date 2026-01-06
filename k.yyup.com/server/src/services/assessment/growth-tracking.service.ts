import { AssessmentRecord } from '../../models/assessment-record.model';
import { AssessmentGrowthTracking } from '../../models/assessment-growth-tracking.model';
import { Op } from 'sequelize';
import { sequelize } from '../../init';
import { QueryTypes } from 'sequelize';

/**
 * 成长轨迹服务
 */
export class GrowthTrackingService {
  /**
   * 获取孩子的成长轨迹
   */
  async getGrowthTrajectory(data: {
    childName?: string;
    parentId?: number;
    studentId?: number;
    phone?: string;
    limit?: number;
  }): Promise<{
    records: Array<{
      id: number;
      recordNo: string;
      childName: string;
      childAge: number;
      assessmentDate: Date;
      dq: number;
      totalScore: number;
      maxScore: number;
      dimensionScores: any;
    }>;
    trends: {
      dates: string[];
      dqTrend: number[];
      dimensionTrends: Record<string, number[]>;
      improvements: Array<{
        dimension: string;
        improvement: number;
        trend: 'up' | 'down' | 'stable';
      }>;
    };
    comparison: {
      currentVsPrevious?: {
        dqChange: number;
        dimensionChanges: Record<string, number>;
      };
      vsAgeAverage?: {
        dqDiff: number;
        percentile: number;
      };
    };
  }> {
    try {
      const where: any = {};
      
      if (data.parentId) {
        where.parentId = data.parentId;
      }
      if (data.studentId) {
        where.studentId = data.studentId;
      }
      if (data.phone) {
        where.phone = data.phone;
      }
      if (data.childName) {
        where.childName = data.childName;
      }

      // 获取所有完成的测评记录
      const records = await AssessmentRecord.findAll({
        where: {
          ...where,
          status: 'completed'
        },
        order: [['createdAt', 'ASC']],
        limit: data.limit || 12, // 默认获取最近12次
        attributes: [
          'id',
          'recordNo',
          'childName',
          'childAge',
          'createdAt',
          'developmentQuotient',
          'totalScore',
          'maxScore',
          'dimensionScores'
        ]
      });

      // 如果没有记录，返回空数据
      if (records.length === 0) {
        return {
          records: [],
          trends: {
            dates: [],
            dqTrend: [],
            dimensionTrends: {},
            improvements: []
          },
          comparison: {}
        };
      }

      // 处理趋势数据
      const dates = records.map(r => {
        const date = new Date(r.createdAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      });
      
      const dqTrend = records.map(r => r.developmentQuotient || 0);
      
      // 各维度趋势
      const dimensionTrends: Record<string, number[]> = {};
      const dimensions = ['attention', 'memory', 'logic', 'language', 'motor', 'social'];
      
      dimensions.forEach(dim => {
        dimensionTrends[dim] = records.map(r => {
          const scores = r.dimensionScores || {};
          const dimScore = scores[dim] || {};
          return dimScore.score || 0;
        });
      });

      // 计算改进情况
      const improvements = dimensions.map(dim => {
        const trend = dimensionTrends[dim] || [];
        if (trend.length < 2) {
          return {
            dimension: dim,
            improvement: 0,
            trend: 'stable' as const
          };
        }
        const first = trend[0];
        const last = trend[trend.length - 1];
        const improvement = last - first;
        
        return {
          dimension: dim,
          improvement,
          trend: (improvement > 5 ? 'up' : improvement < -5 ? 'down' : 'stable') as ('up' | 'stable' | 'down')
        };
      });

      // 对比分析
      const comparison: any = {};
      
      if (records.length >= 2) {
        const current = records[records.length - 1];
        const previous = records[records.length - 2];
        
        comparison.currentVsPrevious = {
          dqChange: (current.developmentQuotient || 0) - (previous.developmentQuotient || 0),
          dimensionChanges: {}
        };
        
        dimensions.forEach(dim => {
          const currentScore = (current.dimensionScores || {})[dim]?.score || 0;
          const previousScore = (previous.dimensionScores || {})[dim]?.score || 0;
          comparison.currentVsPrevious.dimensionChanges[dim] = currentScore - previousScore;
        });
      }

      // 与同龄平均对比（简化版本，实际应该从数据库查询）
      const currentRecord = records[records.length - 1];
      const currentAge = currentRecord.childAge;
      const currentDQ = currentRecord.developmentQuotient || 0;
      
      // 假设同龄平均DQ（实际应该从数据库计算）
      const averageDQ = 100; // 简化处理
      comparison.vsAgeAverage = {
        dqDiff: currentDQ - averageDQ,
        percentile: currentDQ > averageDQ ? 75 : currentDQ > averageDQ - 10 ? 50 : 25
      };

      return {
        records: records.map(r => ({
          id: r.id,
          recordNo: r.recordNo,
          childName: r.childName,
          childAge: r.childAge,
          assessmentDate: r.createdAt,
          dq: r.developmentQuotient || 0,
          totalScore: r.totalScore || 0,
          maxScore: r.maxScore || 0,
          dimensionScores: r.dimensionScores || {}
        })),
        trends: {
          dates,
          dqTrend,
          dimensionTrends,
          improvements
        },
        comparison
      };
    } catch (error) {
      console.error('获取成长轨迹失败:', error);
      throw error;
    }
  }

  /**
   * 创建成长追踪记录
   */
  async createTrackingRecord(data: {
    recordId: number;
    parentId?: number;
    studentId?: number;
  }): Promise<void> {
    try {
      const currentRecord = await AssessmentRecord.findByPk(data.recordId);
      if (!currentRecord || currentRecord.status !== 'completed') {
        return;
      }

      // 查找上一次记录
      const where: any = {
        status: 'completed'
      };
      
      if (data.parentId) {
        where.parentId = data.parentId;
      }
      if (data.studentId) {
        where.studentId = data.studentId;
      }
      if (data.parentId || data.studentId) {
        where.id = { [Op.ne]: data.recordId };
      }

      const previousRecord = await AssessmentRecord.findOne({
        where,
        order: [['createdAt', 'DESC']]
      });

      // 计算成长数据
      const growthData: any = {
        currentDQ: currentRecord.developmentQuotient || 0,
        currentDate: currentRecord.createdAt
      };

      if (previousRecord) {
        growthData.previousDQ = previousRecord.developmentQuotient || 0;
        growthData.previousDate = previousRecord.createdAt;
        growthData.dqChange = growthData.currentDQ - growthData.previousDQ;
        
        // 计算各维度变化
        const currentScores = currentRecord.dimensionScores || {};
        const previousScores = previousRecord.dimensionScores || {};
        const dimensionChanges: Record<string, number> = {};
        
        ['attention', 'memory', 'logic', 'language', 'motor', 'social'].forEach(dim => {
          const current = currentScores[dim]?.score || 0;
          const previous = previousScores[dim]?.score || 0;
          dimensionChanges[dim] = current - previous;
        });
        
        growthData.dimensionChanges = dimensionChanges;
      }

      // 创建或更新追踪记录
      await AssessmentGrowthTracking.findOrCreate({
        where: {
          recordId: data.recordId
        },
        defaults: {
          recordId: data.recordId,
          parentId: data.parentId,
          studentId: data.studentId,
          previousRecordId: previousRecord?.id,
          growthData
        }
      });
    } catch (error) {
      console.error('创建成长追踪记录失败:', error);
      // 不抛出错误，避免影响主流程
    }
  }
}

export default new GrowthTrackingService();

