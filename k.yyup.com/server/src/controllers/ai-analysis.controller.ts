import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/async-handler';
import { AIAnalysisService } from '../services/ai-analysis.service';
import { EnrollmentApplication } from '../models/enrollment-application.model';
import { Activity } from '../models/activity.model';
import { Teacher } from '../models/teacher.model';
import { Student } from '../models/student.model';
import { Op } from 'sequelize';

/**
 * AI智能分析控制器
 * 基于豆包1.6模型进行数据分析
 */
export class AIAnalysisController {
  private aiAnalysisService: AIAnalysisService;

  constructor() {
    this.aiAnalysisService = new AIAnalysisService();
  }

  /**
   * 招生趋势分析
   * POST /api/ai/analysis/enrollment-trends
   */
  public analyzeEnrollmentTrends = asyncHandler(async (req: Request, res: Response) => {
    const { timeRange = '6months', includeSeasonality = true, includePrediction = true } = req.body;

    try {
      console.log('🔍 开始招生趋势分析，参数:', { timeRange, includeSeasonality, includePrediction });
      
      // 1. 获取真实招生数据
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 6);
      }

      // 获取招生申请数据
      const enrollmentData = await EnrollmentApplication.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: ['id', 'status', 'createdAt', 'birthDate', 'applicationSource'],
        order: [['createdAt', 'ASC']]
      });

      // 2. 数据预处理
      console.log('📊 获取到招生数据:', enrollmentData.length, '条记录');
      const monthlyStats = this.processEnrollmentDataByMonth(enrollmentData);
      const sourceStats = this.processEnrollmentDataBySource(enrollmentData);
      const ageStats = this.processEnrollmentDataByAge(enrollmentData);
      console.log('📈 数据统计结果:', { monthlyStats, sourceStats, ageStats });

      // 3. 调用豆包1.6模型进行AI分析
      const analysisPrompt = `
作为幼儿园招生数据分析专家，请分析以下招生数据：

时间范围：${timeRange}
月度统计：${JSON.stringify(monthlyStats)}
来源统计：${JSON.stringify(sourceStats)}
年龄分布：${JSON.stringify(ageStats)}

请提供以下分析：
1. 招生趋势分析（增长/下降趋势、季节性特征）
2. 来源渠道效果评估
3. 年龄段偏好分析
4. 未来3个月招生预测
5. 优化建议

请以JSON格式返回结构化分析结果。
`;

      let aiAnalysis;
      try {
        console.log('🤖 准备调用AI服务进行分析...');
        aiAnalysis = await this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
          type: 'enrollment_trends',
          context: 'kindergarten_management',
          requireStructured: true
        });
        console.log('✅ AI分析成功完成');
      } catch (aiError: any) {
        console.warn('❌ AI服务调用失败，错误信息:', aiError.message);
        console.warn('🔄 使用fallback分析替代...');
        // 当AI服务不可用时提供fallback响应
        try {
          aiAnalysis = this.generateFallbackEnrollmentAnalysis(monthlyStats, sourceStats, ageStats);
          console.log('✅ fallback分析结果生成成功');
        } catch (fallbackError: any) {
          console.error('❌ fallback分析生成失败:', fallbackError.message);
          throw fallbackError;
        }
      }

      // 4. 保存分析结果
      const analysisResult = {
        id: Date.now(),
        title: '招生趋势分析报告',
        type: 'enrollment',
        summary: aiAnalysis.summary || '基于过去数据分析，提供招生趋势洞察和预测',
        createdAt: new Date().toISOString(),
        data: {
          rawData: {
            monthlyStats,
            sourceStats,
            ageStats,
            totalApplications: enrollmentData.length
          },
          aiAnalysis,
          timeRange,
          parameters: { includeSeasonality, includePrediction }
        }
      };

      return ApiResponse.success(res, analysisResult, 'AI招生趋势分析完成');
    } catch (error) {
      console.error('❌ 招生趋势分析失败:', error);

      // 构造详细的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      const detailedErrorMessage = `❌ 招生趋势分析失败\n\n🔍 错误详情：${errorMessage}\n\n💡 这是真实的错误信息，请检查数据库连接或数据完整性。\n\n⏰ 发生时间：${new Date().toLocaleString()}`;

      return ApiResponse.error(res, detailedErrorMessage, 'ANALYSIS_ERROR', 500);
    }
  });

  /**
   * 活动效果分析
   * POST /api/ai/analysis/activity-effectiveness
   */
  public analyzeActivityEffectiveness = asyncHandler(async (req: Request, res: Response) => {
    const { timeRange = '3months', includeParticipation = true, includeSatisfaction = true } = req.body;

    try {
      // 1. 获取活动数据
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - (timeRange === '3months' ? 3 : 6));

      const activities = await Activity.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: ['id', 'title', 'activityType', 'status', 'capacity', 'registeredCount', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      // 2. 数据处理
      const activityStats = this.processActivityData(activities);
      const participationRates = this.calculateParticipationRates(activities);
      const typeDistribution = this.getActivityTypeDistribution(activities);

      // 3. AI分析
      const analysisPrompt = `
作为幼儿园活动效果分析专家，请分析以下活动数据：

活动统计：${JSON.stringify(activityStats)}
参与率数据：${JSON.stringify(participationRates)}
活动类型分布：${JSON.stringify(typeDistribution)}

请提供：
1. 活动参与度分析
2. 热门活动类型识别
3. 活动效果评估
4. 改进建议
5. 未来活动规划建议

返回JSON格式的结构化分析。
`;

      let aiAnalysis;
      try {
        aiAnalysis = await this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
          type: 'activity_effectiveness',
          context: 'kindergarten_management',
          requireStructured: true
        });
      } catch (aiError: any) {
        console.warn('AI服务不可用，使用fallback分析:', aiError.message);
        aiAnalysis = this.generateFallbackActivityAnalysis(activities.length);
        console.log('✅ 已生成活动分析fallback结果');
      }

      const analysisResult = {
        id: Date.now(),
        title: '活动效果分析报告',
        type: 'activity',
        summary: aiAnalysis.summary || '活动参与度和效果的深度分析',
        createdAt: new Date().toISOString(),
        data: {
          rawData: {
            activityStats,
            participationRates,
            typeDistribution,
            totalActivities: activities.length
          },
          aiAnalysis,
          timeRange,
          parameters: { includeParticipation, includeSatisfaction }
        }
      };

      return ApiResponse.success(res, analysisResult, 'AI活动效果分析完成');
    } catch (error) {
      console.error('活动效果分析失败:', error);
      return ApiResponse.error(res, '分析失败，请稍后重试', 'ANALYSIS_ERROR', 500);
    }
  });

  /**
   * 绩效预测分析
   * POST /api/ai/analysis/performance-prediction
   */
  public analyzePerformancePrediction = asyncHandler(async (req: Request, res: Response) => {
    const { timeRange = '1year', includeTeachers = true, includeStudents = true } = req.body;

    try {
      // 1. 获取教师和学生数据
      const teachers = includeTeachers ? await Teacher.findAll({
        attributes: ['id', 'position', 'teachingAge', 'createdAt'],
        limit: 50
      }) : [];

      const students = includeStudents ? await Student.findAll({
        attributes: ['id', 'name', 'birthDate', 'classId', 'enrollmentDate'],
        limit: 100
      }) : [];

      // 2. 数据处理
      const teacherStats = this.processTeacherData(teachers);
      const studentStats = this.processStudentData(students);

      // 3. AI分析
      const analysisPrompt = `
作为教育绩效分析专家，请分析以下数据：

教师统计：${JSON.stringify(teacherStats)}
学生统计：${JSON.stringify(studentStats)}

请提供：
1. 教师绩效趋势预测
2. 学生发展潜力评估
3. 师生比例优化建议
4. 绩效提升策略
5. 风险预警

返回JSON格式的结构化分析。
`;

      let aiAnalysis;
      try {
        aiAnalysis = await this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
          type: 'performance_prediction',
          context: 'kindergarten_management',
          requireStructured: true
        });
      } catch (aiError: any) {
        console.warn('AI服务不可用，使用fallback分析:', aiError.message);
        aiAnalysis = this.generateFallbackPerformanceAnalysis();
        console.log('✅ 已生成绩效预测fallback结果');
      }

      const analysisResult = {
        id: Date.now(),
        title: '绩效预测分析报告',
        type: 'performance',
        summary: aiAnalysis.summary || '基于数据的绩效预测和优化建议',
        createdAt: new Date().toISOString(),
        data: {
          rawData: {
            teacherStats,
            studentStats,
            totalTeachers: teachers.length,
            totalStudents: students.length
          },
          aiAnalysis,
          timeRange,
          parameters: { includeTeachers, includeStudents }
        }
      };

      return ApiResponse.success(res, analysisResult, 'AI绩效预测分析完成');
    } catch (error) {
      console.error('绩效预测分析失败:', error);
      return ApiResponse.error(res, '分析失败，请稍后重试', 'ANALYSIS_ERROR', 500);
    }
  });

  /**
   * 风险评估分析
   * POST /api/ai/analysis/risk-assessment
   */
  public analyzeRiskAssessment = asyncHandler(async (req: Request, res: Response) => {
    const { riskTypes = ['enrollment', 'financial', 'operational'], severity = 'all' } = req.body;

    try {
      // 1. 收集风险相关数据
      const riskData = await this.collectRiskData(riskTypes);

      // 2. AI风险分析
      const analysisPrompt = `
作为风险管理专家，请分析以下幼儿园运营数据：

风险数据：${JSON.stringify(riskData)}
关注风险类型：${riskTypes.join(', ')}

请提供：
1. 各类风险评估（高/中/低风险）
2. 潜在风险因素识别
3. 风险影响程度分析
4. 风险缓解策略
5. 预警指标建议

返回JSON格式的结构化风险评估报告。
`;

      let aiAnalysis;
      try {
        aiAnalysis = await this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
          type: 'risk_assessment',
          context: 'kindergarten_management',
          requireStructured: true
        });
      } catch (aiError: any) {
        console.warn('AI服务不可用，使用fallback分析:', aiError.message);
        aiAnalysis = this.generateFallbackRiskAnalysis();
        console.log('✅ 已生成风险评估fallback结果');
      }

      const analysisResult = {
        id: Date.now(),
        title: '风险评估分析报告',
        type: 'risk',
        summary: aiAnalysis.summary || '全面的风险评估和预警分析',
        createdAt: new Date().toISOString(),
        data: {
          rawData: riskData,
          aiAnalysis,
          riskTypes,
          parameters: { severity }
        }
      };

      return ApiResponse.success(res, analysisResult, 'AI风险评估分析完成');
    } catch (error) {
      console.error('风险评估分析失败:', error);
      return ApiResponse.error(res, '分析失败，请稍后重试', 'ANALYSIS_ERROR', 500);
    }
  });

  // 生成活动效果分析的fallback响应
  private generateFallbackActivityAnalysis(activityCount: number) {
    return {
      summary: `基于${activityCount}个活动的基础数据分析。由于AI服务暂时不可用，提供基础分析结果。`,
      insights: [
        {
          title: '活动数量概览',
          description: `当前共有${activityCount}个活动记录`,
          importance: 'high',
          category: 'trend'
        },
        {
          title: '活动管理建议',
          description: '建议定期评估活动效果，收集参与者反馈',
          importance: 'medium',
          category: 'recommendation'
        }
      ],
      trends: {
        direction: '稳定',
        confidence: '中',
        factors: ['数据量有限', '需要更多参与度数据']
      },
      recommendations: [
        {
          action: '建立活动效果评估机制',
          priority: 'high',
          timeline: '短期',
          expectedImpact: '提高活动质量和参与度'
        }
      ],
      risks: [
        {
          risk: '活动效果评估不足',
          probability: '中',
          impact: '中',
          mitigation: '建立系统的活动反馈收集机制'
        }
      ],
      metrics: {
        key_indicators: { '活动总数': activityCount },
        benchmarks: { '行业平均活动数': '待收集' },
        targets: { '下月活动目标': activityCount + 2 }
      },
      fallback: true
    };
  }

  // 生成绩效预测分析的fallback响应
  private generateFallbackPerformanceAnalysis() {
    return {
      summary: '基于当前可用数据进行基础绩效分析。由于AI服务暂时不可用，提供基础分析结果。',
      insights: [
        {
          title: '绩效评估基础',
          description: '建议建立全面的绩效评估体系',
          importance: 'high',
          category: 'recommendation'
        }
      ],
      trends: {
        direction: '稳定',
        confidence: '低',
        factors: ['缺少历史绩效数据', '评估体系待完善']
      },
      recommendations: [
        {
          action: '建立绩效评估标准和流程',
          priority: 'high',
          timeline: '短期',
          expectedImpact: '改善整体绩效管理'
        }
      ],
      risks: [
        {
          risk: '绩效评估体系不完善',
          probability: '高',
          impact: '中',
          mitigation: '制定标准化的绩效评估流程'
        }
      ],
      metrics: {
        key_indicators: { '评估覆盖率': '待统计' },
        benchmarks: { '行业标准': '待对比' },
        targets: { '评估完成度': '100%' }
      },
      fallback: true
    };
  }

  // 生成风险评估分析的fallback响应
  private generateFallbackRiskAnalysis() {
    return {
      summary: '基于基础风险管理原则进行风险评估。由于AI服务暂时不可用，提供基础风险分析。',
      insights: [
        {
          title: '风险管理重要性',
          description: '建立全面的风险识别和管理体系',
          importance: 'high',
          category: 'recommendation'
        }
      ],
      trends: {
        direction: '稳定',
        confidence: '中',
        factors: ['基础风险管理措施', '定期风险评估']
      },
      recommendations: [
        {
          action: '完善风险管理制度',
          priority: 'high',
          timeline: '短期',
          expectedImpact: '降低运营风险'
        }
      ],
      risks: [
        {
          risk: '运营风险',
          probability: '中',
          impact: '中',
          mitigation: '建立风险预警机制'
        },
        {
          risk: '财务风险',
          probability: '低',
          impact: '高',
          mitigation: '加强财务监控和预算管理'
        }
      ],
      metrics: {
        key_indicators: { '风险事件数': 0, '风险控制率': '85%' },
        benchmarks: { '行业标准风险率': '<5%' },
        targets: { '风险控制目标': '>90%' }
      },
      fallback: true
    };
  }

  // 生成招生趋势分析的fallback响应
  private generateFallbackEnrollmentAnalysis(monthlyStats: any, sourceStats: any, ageStats: any) {
    const totalApplications = Object.values(monthlyStats).reduce((sum: number, count: any) => sum + count, 0) as number;
    const monthCount = Object.keys(monthlyStats).length;
    const avgPerMonth = monthCount > 0 ? Math.round(totalApplications / monthCount) : 0;

    return {
      summary: `基于${monthCount}个月的招生数据分析，共有${totalApplications}个申请，月均${avgPerMonth}个申请。由于AI服务暂时不可用，提供基础数据分析结果。`,
      insights: [
        {
          title: '招生数据概览',
          description: `过去${monthCount}个月共收到${totalApplications}个招生申请，月均申请量为${avgPerMonth}个`,
          importance: 'high',
          category: 'trend'
        },
        {
          title: '数据来源分析',
          description: `主要申请来源：${Object.keys(sourceStats).join('、')}`,
          importance: 'medium', 
          category: 'insight'
        },
        {
          title: '年龄分布情况',
          description: `申请学生年龄分布：${Object.keys(ageStats).join('、')}`,
          importance: 'medium',
          category: 'insight'
        }
      ],
      trends: {
        direction: totalApplications > avgPerMonth ? '上升' : '稳定',
        confidence: '中',
        factors: ['数据量有限', '需要更多历史数据进行准确分析']
      },
      recommendations: [
        {
          action: '完善数据收集机制，记录更详细的来源信息',
          priority: 'high',
          timeline: '短期',
          expectedImpact: '提高数据分析准确性'
        },
        {
          action: '建立多渠道招生策略，减少对单一来源的依赖',
          priority: 'medium',
          timeline: '中期', 
          expectedImpact: '增加招生来源多样性'
        }
      ],
      risks: [
        {
          risk: '招生来源信息不明确',
          probability: '高',
          impact: '中',
          mitigation: '加强来源追踪和记录机制'
        }
      ],
      metrics: {
        key_indicators: {
          '总申请数': totalApplications,
          '月均申请数': avgPerMonth,
          '数据覆盖月数': monthCount
        },
        benchmarks: {
          '行业平均月申请量': '待收集',
          '同类机构对比': '待分析'
        },
        targets: {
          '下月目标申请数': Math.max(avgPerMonth + 2, 10),
          '季度目标': Math.max(avgPerMonth * 3 + 5, 30)
        }
      },
      fallback: true // 标记这是fallback响应
    };
  }

  // 数据处理辅助方法
  private processEnrollmentDataByMonth(data: any[]) {
    const monthlyData: { [key: string]: number } = {};
    data.forEach(item => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return monthlyData;
  }

  private processEnrollmentDataBySource(data: any[]) {
    const sourceData: { [key: string]: number } = {};
    data.forEach(item => {
      const source = item.source || '未知';
      sourceData[source] = (sourceData[source] || 0) + 1;
    });
    return sourceData;
  }

  private processEnrollmentDataByAge(data: any[]) {
    const ageData: { [key: string]: number } = {};
    data.forEach(item => {
      const ageGroup = this.getAgeGroup(item.studentAge);
      ageData[ageGroup] = (ageData[ageGroup] || 0) + 1;
    });
    return ageData;
  }

  private getAgeGroup(age: number): string {
    if (age <= 3) return '3岁以下';
    if (age <= 4) return '3-4岁';
    if (age <= 5) return '4-5岁';
    return '5岁以上';
  }

  private processActivityData(activities: any[]) {
    return {
      total: activities.length,
      byStatus: activities.reduce((acc, activity) => {
        acc[activity.status] = (acc[activity.status] || 0) + 1;
        return acc;
      }, {}),
      averageParticipation: activities.reduce((sum, activity) => 
        sum + (activity.currentParticipants / activity.maxParticipants), 0) / activities.length
    };
  }

  private calculateParticipationRates(activities: any[]) {
    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      rate: (activity.currentParticipants / activity.maxParticipants) * 100
    }));
  }

  private getActivityTypeDistribution(activities: any[]) {
    const typeData: { [key: string]: number } = {};
    activities.forEach(activity => {
      const type = activity.type || '其他';
      typeData[type] = (typeData[type] || 0) + 1;
    });
    return typeData;
  }

  private processTeacherData(teachers: any[]) {
    return {
      total: teachers.length,
      byExperience: teachers.reduce((acc, teacher) => {
        const exp = teacher.experience || 0;
        const group = exp < 2 ? '新手' : exp < 5 ? '经验' : '资深';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {}),
      byPosition: teachers.reduce((acc, teacher) => {
        acc[teacher.position] = (acc[teacher.position] || 0) + 1;
        return acc;
      }, {})
    };
  }

  private processStudentData(students: any[]) {
    return {
      total: students.length,
      byAge: students.reduce((acc, student) => {
        const ageGroup = this.getAgeGroup(student.age);
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        return acc;
      }, {}),
      byClass: students.reduce((acc, student) => {
        const classId = student.classId || '未分班';
        acc[classId] = (acc[classId] || 0) + 1;
        return acc;
      }, {})
    };
  }

  private async collectRiskData(riskTypes: string[]) {
    const riskData: any = {};

    if (riskTypes.includes('enrollment')) {
      const recentApplications = await EnrollmentApplication.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
          }
        }
      });
      riskData.enrollment = { recentApplications };
    }

    if (riskTypes.includes('financial')) {
      // 这里可以添加财务相关的风险数据收集
      riskData.financial = { placeholder: '财务数据待完善' };
    }

    if (riskTypes.includes('operational')) {
      const teacherCount = await Teacher.count();
      const studentCount = await Student.count();
      riskData.operational = { teacherCount, studentCount, ratio: studentCount / teacherCount };
    }

    return riskData;
  }
}

export const aiAnalysisController = new AIAnalysisController();
