import { Request, Response } from 'express';
import { BusinessCenterService } from '../services/business-center.service';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 业务中心控制器
 * 处理业务中心相关的API请求
 */
export class BusinessCenterController {

  /**
   * 获取业务中心概览数据
   * GET /api/business-center/overview
   */
  static async getOverview(req: Request, res: Response) {
    try {
      console.log('🏢 业务中心概览数据请求');
      
      const data = await BusinessCenterService.getOverview();
      
      ApiResponse.success(res, data, '获取业务中心概览数据成功');
    } catch (error) {
      console.error('❌ 获取业务中心概览数据失败:', error);
      ApiResponse.handleError(res, error, '获取业务中心概览数据失败');
    }
  }

  /**
   * 获取业务流程时间线数据
   * GET /api/business-center/timeline
   */
  static async getTimeline(req: Request, res: Response) {
    try {
      console.log('📋 业务流程时间线数据请求');
      
      const timelineItems = await BusinessCenterService.getBusinessTimeline();
      
      ApiResponse.success(res, { timelineItems }, '获取业务流程时间线数据成功');
    } catch (error) {
      console.error('❌ 获取业务流程时间线数据失败:', error);
      ApiResponse.handleError(res, error, '获取业务流程时间线数据失败');
    }
  }

  /**
   * 获取招生进度数据
   * GET /api/business-center/enrollment-progress
   */
  static async getEnrollmentProgress(req: Request, res: Response) {
    try {
      console.log('🎯 招生进度数据请求');
      
      const progressData = await BusinessCenterService.getEnrollmentProgress();
      
      ApiResponse.success(res, progressData, '获取招生进度数据成功');
    } catch (error) {
      console.error('❌ 获取招生进度数据失败:', error);
      ApiResponse.handleError(res, error, '获取招生进度数据失败');
    }
  }

  /**
   * 获取业务中心统计数据
   * GET /api/business-center/statistics
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      console.log('📊 业务中心统计数据请求');
      
      const overview = await BusinessCenterService.getOverview();
      
      // 提取关键统计指标
      const statistics = {
        teachingCenter: {
          totalPlans: overview.teachingCenter.total_plans,
          activePlans: overview.teachingCenter.active_plans,
          achievementRate: overview.teachingCenter.overall_achievement_rate,
          completionRate: overview.teachingCenter.overall_completion_rate
        },
        enrollment: {
          target: overview.enrollment.target,
          current: overview.enrollment.current,
          completionRate: Math.round((overview.enrollment.current / overview.enrollment.target) * 100),
          applications: overview.enrollment.applications
        },
        personnel: {
          teachers: overview.personnel.teachers,
          students: overview.personnel.students,
          classes: overview.personnel.classes,
          parents: overview.personnel.parents
        },
        activities: {
          total: overview.activities.total,
          ongoing: overview.activities.ongoing,
          completed: overview.activities.completed,
          upcoming: overview.activities.upcoming
        },
        system: overview.system
      };
      
      ApiResponse.success(res, statistics, '获取业务中心统计数据成功');
    } catch (error) {
      console.error('❌ 获取业务中心统计数据失败:', error);
      ApiResponse.handleError(res, error, '获取业务中心统计数据失败');
    }
  }

  /**
   * 获取业务中心仪表板数据（聚合接口）
   * GET /api/business-center/dashboard
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      console.log('📊 业务中心仪表板数据请求');
      
      const startTime = Date.now();
      
      // 并行获取所有需要的数据
      const [overview, timeline, enrollmentProgress] = await Promise.all([
        BusinessCenterService.getOverview(),
        BusinessCenterService.getBusinessTimeline(),
        BusinessCenterService.getEnrollmentProgress()
      ]);
      
      const responseTime = Date.now() - startTime;
      
      const dashboardData = {
        overview,
        timeline,
        enrollmentProgress,
        meta: {
          responseTime,
          lastUpdated: new Date().toISOString(),
          dataVersion: '1.0'
        }
      };
      
      console.log(`✅ 业务中心仪表板数据获取完成，耗时: ${responseTime}ms`);
      
      ApiResponse.success(res, dashboardData, '获取业务中心仪表板数据成功');
    } catch (error) {
      console.error('❌ 获取业务中心仪表板数据失败:', error);
      ApiResponse.handleError(res, error, '获取业务中心仪表板数据失败');
    }
  }

  /**
   * 获取教学中心集成数据
   * GET /api/business-center/teaching-integration
   */
  static async getTeachingIntegration(req: Request, res: Response) {
    try {
      console.log('📚 教学中心集成数据请求');

      const overview = await BusinessCenterService.getOverview();
      const teachingData = overview.teachingCenter;

      // 格式化教学中心数据用于业务中心展示
      const integrationData = {
        summary: {
          totalPlans: teachingData.total_plans || 0,
          activePlans: teachingData.active_plans || 0,
          completedPlans: (teachingData as any).completed_plans || 0,
          achievementRate: teachingData.overall_achievement_rate || 0,
          completionRate: teachingData.overall_completion_rate || 0
        },
        progress: {
          totalSessions: (teachingData as any).total_sessions || 0,
          completedSessions: (teachingData as any).completed_sessions || 0,
          confirmedSessions: (teachingData as any).confirmed_sessions || 0,
          plansWithMedia: (teachingData as any).plans_with_media || 0
        },
        status: 'active',
        lastUpdated: new Date().toISOString()
      };

      ApiResponse.success(res, integrationData, '获取教学中心集成数据成功');
    } catch (error) {
      console.error('❌ 获取教学中心集成数据失败:', error);
      ApiResponse.handleError(res, error, '获取教学中心集成数据失败');
    }
  }

  /**
   * 获取UI配置数据
   * GET /api/business-center/ui-config
   */
  static async getUIConfig(req: Request, res: Response) {
    try {
      console.log('🎨 UI配置数据请求');

      // 这里需要调用BusinessCenterService的getUIConfig方法，但它是私有的
      // 我们需要创建一个公共方法或者复制逻辑

      // 暂时返回默认配置，后续可以优化
      const uiConfig = {
        progressColors: {
          excellent: 90,  // 优秀阈值
          good: 70,        // 良好阈值
          warning: 50      // 警告阈值
        },
        milestones: {
          default: [25, 50, 75, 100]  // 默认里程碑百分比
        },
        colors: {
          excellent: '#67c23a',  // 绿色
          good: '#e6a23c',        // 橙色
          warning: '#f56c6c',     // 红色
          default: '#909399'      // 灰色
        }
      };

      ApiResponse.success(res, uiConfig, '获取UI配置数据成功');
    } catch (error) {
      console.error('❌ 获取UI配置数据失败:', error);
      ApiResponse.handleError(res, error, '获取UI配置数据失败');
    }
  }
}
