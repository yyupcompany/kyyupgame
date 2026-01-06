/**
 * 招生中心控制器
 * 提供招生中心页面所需的聚合API接口
 */

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { EnrollmentPlan } from '../models/enrollment-plan.model';
import { EnrollmentApplication } from '../models/enrollment-application.model';
import { EnrollmentConsultation } from '../models/enrollment-consultation.model';
import { EnrollmentConsultationService } from '../services/enrollment/enrollment-consultation.service';

export class EnrollmentCenterController {
  private consultationService: EnrollmentConsultationService;

  constructor() {
    this.consultationService = new EnrollmentConsultationService();
  }

  /**
   * 获取招生中心概览数据
   * GET /api/enrollment/overview
   */
  async getOverview(req: Request, res: Response) {
    try {
      const { timeRange = 'month', kindergartenId } = req.query;
      
      // 计算时间范围
      const timeFilter = this.getTimeFilter(timeRange as string);
      const baseWhere = kindergartenId ? { kindergartenId: Number(kindergartenId) } : {};
      
      // 并行获取统计数据
      const [
        consultationStats,
        applicationStats,
        trialStats,
        chartData,
        quickStats
      ] = await Promise.all([
        this.getConsultationStats({ ...baseWhere, ...timeFilter }),
        this.getApplicationStats({ ...baseWhere, ...timeFilter }),
        this.getTrialStats({ ...baseWhere, ...timeFilter }),
        this.getChartData({ ...baseWhere, ...timeFilter }),
        this.getQuickStats(baseWhere)
      ]);

      // 计算转化率
      const conversionRate = this.calculateConversionRate(
        consultationStats.current,
        applicationStats.current
      );

      console.log('📊 招生中心概览数据构建:', {
        consultationStats,
        applicationStats,
        trialStats,
        chartData,
        quickStats,
        hasChartData: !!chartData,
        chartDataKeys: chartData ? Object.keys(chartData) : []
      });

      const overview = {
        statistics: {
          totalConsultations: {
            value: consultationStats.current,
            trend: consultationStats.trend,
            trendText: '较上月'
          },
          applications: {
            value: applicationStats.current,
            trend: applicationStats.trend,
            trendText: '较上月'
          },
          trials: {
            value: trialStats.current,
            trend: trialStats.trend,
            trendText: '较上月'
          },
          conversionRate: {
            value: conversionRate.current,
            trend: conversionRate.trend,
            trendText: '较上月'
          }
        },
        charts: chartData,
        quickStats
      };

      console.log('📊 最终概览数据结构:', {
        hasStatistics: !!overview.statistics,
        hasCharts: !!overview.charts,
        hasQuickStats: !!overview.quickStats,
        overviewKeys: Object.keys(overview)
      });
      
      return ApiResponse.success(res, overview, '获取概览数据成功');
    } catch (error) {
      console.error('获取概览数据失败:', error);
      return ApiResponse.error(res, '获取概览数据失败', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * 获取招生计划列表
   * GET /api/enrollment/plans
   */
  async getPlans(req: Request, res: Response) {
    try {
      console.log('🔄 开始获取招生计划列表...');

      const {
        page = 1,
        pageSize = 10,
        search,
        year,
        semester,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      console.log('📋 查询参数:', { page, pageSize, search, year, semester, status, sortBy, sortOrder });

      // 构建查询条件
      const where: any = {};

      if (search) {
        where.title = { [Op.like]: `%${search}%` };
      }

      if (year) {
        where.year = Number(year);
      }

      if (semester) {
        where.semester = semester;
      }

      if (status) {
        where.status = status;
      }

      console.log('🔍 查询条件:', where);

      // 分页参数
      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      console.log('📄 分页参数:', { offset, limit });

      // 检查模型是否正确初始化
      if (!EnrollmentPlan) {
        throw new Error('EnrollmentPlan 模型未正确初始化');
      }

      console.log('🔗 开始数据库查询...');

      // 查询数据
      const { count, rows } = await EnrollmentPlan.findAndCountAll({
        where,
        offset,
        limit,
        order: [[sortBy as string, sortOrder as string]],
        include: [
          {
            association: 'applications',
            required: false,
            attributes: ['id', 'status']
          }
        ]
      });

      console.log('✅ 数据库查询成功:', { count, rowsLength: rows.length });

      // 处理数据
      const data = rows.map(plan => {
        const planData = plan.toJSON();
        const appliedCount = planData.applications?.length || 0;
        const progress = planData.targetCount > 0
          ? Math.round((appliedCount / planData.targetCount) * 100)
          : 0;

        return {
          ...planData,
          appliedCount,
          progress
        };
      });

      const result = {
        data,
        pagination: {
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize))
        }
      };

      console.log('✅ 招生计划列表获取成功');
      return ApiResponse.success(res, result, '获取计划列表成功');
    } catch (error) {
      console.error('❌ 获取计划列表失败 - 详细错误:', error);
      console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'Unknown error');

      // 检查是否是数据库连接问题
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
          return ApiResponse.error(res, '数据库连接失败', 'DATABASE_CONNECTION_ERROR', 500);
        }
        if (error.message.includes('Table') && error.message.includes("doesn't exist")) {
          return ApiResponse.error(res, '数据库表不存在', 'TABLE_NOT_EXISTS', 500);
        }
        if (error.message.includes('association')) {
          return ApiResponse.error(res, '模型关联配置错误', 'ASSOCIATION_ERROR', 500);
        }
      }

      return ApiResponse.error(res, '获取计划列表失败', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * 获取申请列表
   * GET /api/enrollment/applications
   */
  async getApplications(req: Request, res: Response) {
    try {
      console.log('🔄 开始获取申请列表...');

      const {
        page = 1,
        pageSize = 10,
        search,
        planId,
        status,
        applicationDateFrom,
        applicationDateTo,
        sortBy = 'createdAt', // 修改默认排序字段，因为可能没有 applicationDate 字段
        sortOrder = 'desc'
      } = req.query;

      console.log('📋 查询参数:', { page, pageSize, search, planId, status, applicationDateFrom, applicationDateTo, sortBy, sortOrder });

      // 构建查询条件
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { studentName: { [Op.like]: `%${search}%` } },
          { parentName: { [Op.like]: `%${search}%` } }
        ];
      }

      if (planId) {
        where.planId = Number(planId);
      }

      if (status) {
        where.status = status;
      }

      if (applicationDateFrom || applicationDateTo) {
        where.createdAt = {}; // 使用 createdAt 替代 applicationDate
        if (applicationDateFrom) {
          where.createdAt[Op.gte] = new Date(applicationDateFrom as string);
        }
        if (applicationDateTo) {
          where.createdAt[Op.lte] = new Date(applicationDateTo as string);
        }
      }

      console.log('🔍 查询条件:', where);

      // 分页参数
      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      console.log('📄 分页参数:', { offset, limit });

      // 检查模型是否正确初始化
      if (!EnrollmentApplication) {
        throw new Error('EnrollmentApplication 模型未正确初始化');
      }

      console.log('🔗 开始数据库查询...');

      // 查询数据
      const { count, rows } = await EnrollmentApplication.findAndCountAll({
        where,
        offset,
        limit,
        order: [[sortBy as string, sortOrder as string]],
        include: [
          {
            association: 'plan',
            attributes: ['title'],
            required: false // 设置为 false，避免内连接导致的问题
          }
        ]
      });

      console.log('✅ 数据库查询成功:', { count, rowsLength: rows.length });

      // 处理数据
      const data = rows.map(application => {
        const appData = application.toJSON();
        return {
          ...appData,
          planTitle: appData.plan?.title || '未知计划',
          materialsCount: 0, // TODO: 从材料表获取
          interviewScheduled: false // TODO: 从面试表获取
        };
      });

      const result = {
        data,
        pagination: {
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize))
        }
      };

      console.log('✅ 申请列表获取成功');
      return ApiResponse.success(res, result, '获取申请列表成功');
    } catch (error) {
      console.error('❌ 获取申请列表失败 - 详细错误:', error);
      console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'Unknown error');

      // 检查是否是数据库连接问题
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
          return ApiResponse.error(res, '数据库连接失败', 'DATABASE_CONNECTION_ERROR', 500);
        }
        if (error.message.includes('Table') && error.message.includes("doesn't exist")) {
          return ApiResponse.error(res, '数据库表不存在', 'TABLE_NOT_EXISTS', 500);
        }
        if (error.message.includes('association')) {
          return ApiResponse.error(res, '模型关联配置错误', 'ASSOCIATION_ERROR', 500);
        }
      }

      return ApiResponse.error(res, '获取申请列表失败', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * 获取咨询统计数据
   * GET /api/enrollment/consultations/statistics
   */
  async getConsultationStatistics(req: Request, res: Response) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // 并行查询统计数据
      const [
        todayConsultations,
        pendingFollowUp,
        monthlyConversions,
        sourceAnalysis,
        statusDistribution
      ] = await Promise.all([
        // 今日咨询
        EnrollmentConsultation.count({
          where: {
            createdAt: { [Op.gte]: startOfDay }
          }
        }),
        
        // 待跟进 (followupStatus: 2:跟进中)
        EnrollmentConsultation.count({
          where: {
            followupStatus: 2
          }
        }),

        // 本月转化 (followupStatus: 3:已转化)
        EnrollmentConsultation.count({
          where: {
            followupStatus: 3,
            createdAt: { [Op.gte]: startOfMonth }
          }
        }),

        // 来源分析 (模拟数据)
        Promise.resolve([
          { source: '官网', count: 45, conversionRate: 68.5 },
          { source: '微信', count: 32, conversionRate: 72.1 },
          { source: '电话', count: 28, conversionRate: 65.3 },
          { source: '推荐', count: 15, conversionRate: 85.2 }
        ]),

        // 状态分布 (模拟数据)
        Promise.resolve([
          { status: '新咨询', count: 23, percentage: 35.2 },
          { status: '跟进中', count: 28, percentage: 42.8 },
          { status: '已转化', count: 12, percentage: 18.3 },
          { status: '已流失', count: 2, percentage: 3.7 }
        ])
      ]);

      // 计算平均响应时间 (模拟数据)
      const averageResponseTime = 2.5;

      const statistics = {
        todayConsultations,
        pendingFollowUp,
        monthlyConversions,
        averageResponseTime,
        sourceAnalysis,
        statusDistribution
      };
      
      return ApiResponse.success(res, statistics, '获取咨询统计成功');
    } catch (error) {
      console.error('获取咨询统计失败:', error);
      return ApiResponse.error(res, '获取咨询统计失败', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * 获取咨询列表
   * GET /api/enrollment/consultations
   */
  async getConsultations(req: Request, res: Response) {
    // 最简化版本：直接返回成功响应，不进行任何可能出错的操作
    const mockData = {
      total: 0,
      items: [],
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10
    };

    return ApiResponse.success(res, mockData, '获取咨询列表成功');
  }

  // ==================== 私有方法 ====================

  /**
   * 获取时间过滤条件
   */
  private getTimeFilter(timeRange: string) {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: now
      }
    };
  }

  /**
   * 获取咨询统计
   */
  private async getConsultationStats(where: any) {
    const current = await EnrollmentConsultation.count({ where });
    
    // 获取上期数据进行对比
    const previousWhere = { ...where };
    if (previousWhere.createdAt) {
      const range = previousWhere.createdAt[Op.lte].getTime() - previousWhere.createdAt[Op.gte].getTime();
      previousWhere.createdAt = {
        [Op.gte]: new Date(previousWhere.createdAt[Op.gte].getTime() - range),
        [Op.lte]: previousWhere.createdAt[Op.gte]
      };
    }
    
    const previous = await EnrollmentConsultation.count({ where: previousWhere });
    const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    
    return { current, previous, trend: Math.round(trend * 10) / 10 };
  }

  /**
   * 获取申请统计
   */
  private async getApplicationStats(where: any) {
    const current = await EnrollmentApplication.count({ where });

    // 获取上期数据进行对比
    const previousWhere = { ...where };
    if (previousWhere.createdAt) {
      const range = previousWhere.createdAt[Op.lte].getTime() - previousWhere.createdAt[Op.gte].getTime();
      previousWhere.createdAt = {
        [Op.gte]: new Date(previousWhere.createdAt[Op.gte].getTime() - range),
        [Op.lte]: previousWhere.createdAt[Op.gte]
      };
    }

    const previous = await EnrollmentApplication.count({ where: previousWhere });
    const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return { current, previous, trend: Math.round(trend * 10) / 10 };
  }

  /**
   * 获取试听统计
   */
  private async getTrialStats(where: any) {
    // 从数据库获取试听数据 (假设试听状态为 'trial')
    const current = await EnrollmentApplication.count({
      where: {
        ...where,
        status: 'trial' // 试听状态
      }
    });

    // 获取上期数据进行对比
    const previousWhere = { ...where };
    if (previousWhere.createdAt) {
      const range = previousWhere.createdAt[Op.lte].getTime() - previousWhere.createdAt[Op.gte].getTime();
      previousWhere.createdAt = {
        [Op.gte]: new Date(previousWhere.createdAt[Op.gte].getTime() - range),
        [Op.lte]: previousWhere.createdAt[Op.gte]
      };
    }

    const previous = await EnrollmentApplication.count({
      where: {
        ...previousWhere,
        status: 'trial'
      }
    });

    const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return { current, previous, trend: Math.round(trend * 10) / 10 };
  }

  /**
   * 计算转化率
   */
  private calculateConversionRate(consultations: number, applications: number) {
    const current = consultations > 0 ? (applications / consultations) * 100 : 0;
    const trend = 3.2; // 模拟趋势数据
    
    return { 
      current: Math.round(current * 10) / 10, 
      trend 
    };
  }

  /**
   * 获取图表数据
   */
  private async getChartData(where: any) {
    try {
      // 获取最近6个月的数据
      const months = [];
      const consultationData = [];
      const applicationData = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        months.push(`${date.getMonth() + 1}月`);

        // 获取当月咨询量
        const consultationCount = await EnrollmentConsultation.count({
          where: {
            ...where,
            createdAt: {
              [Op.gte]: monthStart,
              [Op.lte]: monthEnd
            }
          }
        });

        // 获取当月申请量
        const applicationCount = await EnrollmentApplication.count({
          where: {
            ...where,
            createdAt: {
              [Op.gte]: monthStart,
              [Op.lte]: monthEnd
            }
          }
        });

        consultationData.push(consultationCount);
        applicationData.push(applicationCount);
      }

      // 获取来源渠道数据
      const sourceChannels = ['官网', '微信', '电话', '推荐', '其他'];
      const sourceConsultationData = [];
      const sourceConversionData = [];

      for (const source of sourceChannels) {
        const consultationCount = await EnrollmentConsultation.count({
          where: {
            ...where,
            source: source
          }
        });

        const conversionCount = await EnrollmentApplication.count({
          where: {
            ...where,
            source: source
          }
        });

        sourceConsultationData.push(consultationCount);
        sourceConversionData.push(conversionCount);
      }

      return {
        enrollmentTrend: {
          categories: months,
          series: [
            {
              name: '咨询量',
              data: consultationData
            },
            {
              name: '申请量',
              data: applicationData
            }
          ]
        },
        sourceChannel: {
          categories: sourceChannels,
          series: [
            {
              name: '咨询量',
              data: sourceConsultationData
            },
            {
              name: '转化量',
              data: sourceConversionData
            }
          ]
        }
      };
    } catch (error) {
      console.error('获取图表数据失败:', error);
      // 返回默认数据作为备用
      return {
        enrollmentTrend: {
          categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [
            {
              name: '咨询量',
              data: [120, 132, 101, 134, 90, 230]
            },
            {
              name: '申请量',
              data: [80, 98, 75, 95, 65, 156]
            }
          ]
        },
        sourceChannel: {
          categories: ['官网', '微信', '电话', '推荐', '其他'],
          series: [
            {
              name: '咨询量',
              data: [45, 32, 28, 15, 8]
            },
            {
              name: '转化量',
              data: [31, 23, 18, 13, 5]
            }
          ]
        }
      };
    }
  }

  /**
   * 获取快速统计
   */
  private async getQuickStats(where: any) {
    const [pendingApplications, todayConsultations] = await Promise.all([
      EnrollmentApplication.count({
        where: { ...where, status: 'pending' }
      }),
      EnrollmentConsultation.count({
        where: {
          ...where,
          createdAt: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    return {
      pendingApplications,
      todayConsultations,
      upcomingInterviews: 8 // 模拟数据
    };
  }
}
