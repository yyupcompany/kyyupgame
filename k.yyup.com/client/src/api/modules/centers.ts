import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// 向后兼容
const requestFunc = request.request;

// API端点常量
export const CENTERS_ENDPOINTS = {
  SYSTEM_OVERVIEW: `${API_PREFIX}/centers/system/overview`,
  ACTIVITY_OVERVIEW: `${API_PREFIX}/centers/activity/overview`,
  TEACHER_OVERVIEW: `${API_PREFIX}/centers/teacher/overview`,
  ANALYTICS_OVERVIEW: `${API_PREFIX}/centers/analytics/overview`,
  MEDIA_OVERVIEW: `${API_PREFIX}/centers/media/overview`,
  INSPECTION_OVERVIEW: `${API_PREFIX}/centers/inspection/overview`,
  DASHBOARD_OVERVIEW: `${API_PREFIX}/centers/dashboard/overview`
} as const;

// 集合API接口类型定义
export interface SystemOverviewResponse {
  success: boolean;
  message: string;
  data: {
    userStats: {
      totalUsers: number;
      activeUsers: number;
      adminUsers: number;
      inactiveUsers: number;
      userGrowth: number;
      userActivityRate: number;
    };
    recentLogs: any[];
    systemNotifications: {
      unreadNotifications: number;
      totalNotifications: number;
      recentNotifications: any[];
    };
    timestamp: string;
  };
}

export interface ActivityOverviewResponse {
  success: boolean;
  message: string;
  data: {
    activityStats: {
      totalActivities: number;
      publishedActivities: number;
      ongoingActivities: number;
      completedActivities: number;
      participationRate: number;
    };
    recentActivities: any[];
    registrationStats: {
      totalRegistrations: number;
      pendingRegistrations: number;
      approvedRegistrations: number;
      rejectedRegistrations: number;
      conversionRate: number;
    };
    timestamp: string;
  };
}

export interface TeacherOverviewResponse {
  success: boolean;
  message: string;
  data: {
    teacherTasks: {
      pendingTasks: number;
      completedTasks: number;
      totalTasks: number;
      recentTasks: any[];
    };
    teacherNotifications: {
      unreadNotifications: number;
      totalNotifications: number;
      recentNotifications: any[];
    };
    teacherActivities: {
      createdActivities: number;
      participatedActivities: number;
      recentActivities: any[];
    };
    timestamp: string;
  };
}

export interface AnalyticsOverviewResponse {
  success: boolean;
  message: string;
  data: {
    systemAnalytics: {
      userMetrics: {
        totalUsers: number;
        newUsers: number;
        userGrowthRate: number;
      };
      systemMetrics: {
        totalLogs: number;
        avgDailyLogs: number;
      };
      performanceMetrics: {
        avgResponseTime: number;
        systemUptime: number;
      };
    };
    activityAnalytics: {
      activityMetrics: {
        totalActivities: number;
        newActivities: number;
        activityGrowthRate: number;
      };
      participationMetrics: {
        totalRegistrations: number;
        avgRegistrationsPerActivity: number;
      };
      engagementMetrics: {
        participationRate: number;
        completionRate: number;
      };
    };
    userAnalytics: {
      engagementMetrics: {
        weeklyActiveUsers: number;
        weeklyNewUsers: number;
        userRetentionRate: number;
      };
      notificationMetrics: {
        totalNotifications: number;
        avgNotificationsPerUser: number;
      };
      activityMetrics: {
        loginFrequency: number;
        avgSessionDuration: number;
      };
    };
    timestamp: string;
  };
}

export interface MediaOverviewResponse {
  success: boolean;
  message: string;
  data: {
    mediaStats: {
      totalMedia: number;
      publishedMedia: number;
      videoMedia: number;
      imageMedia: number;
      publishRate: number;
    };
    recentMedia: any[];
    videoStats: {
      totalVideos: number;
      completedVideos: number;
      processingVideos: number;
      pendingVideos: number;
      completionRate: number;
    };
    timestamp: string;
  };
}

export interface InspectionOverviewResponse {
  success: boolean;
  message: string;
  data: {
    inspectionStats: {
      totalPlans: number;
      activePlans: number;
      completedTasks: number;
      completionRate: number;
    };
    recentTasks: any[];
    planStats: {
      totalPlans: number;
      activePlans: number;
      completedPlans: number;
      pendingPlans: number;
      activeRate: number;
    };
    timestamp: string;
  };
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    dashboardStats: {
      totalUsers: number;
      totalActivities: number;
      totalNotifications: number;
      systemHealth: number;
      activeUsers: number;
    };
    recentActivities: any[];
    quickActions: Array<{
      id: string;
      title: string;
      icon: string;
      type: string;
    }>;
    timestamp: string;
  };
}

/**
 * 集合API模块 - 用于性能优化的中心页面数据获取
 * 将多个单独API调用合并为单个集合API调用
 */
export const centersAPI = {
  /**
   * 获取系统中心总览数据
   */
  getSystemOverview: (): Promise<SystemOverviewResponse> => {
    return request.get(CENTERS_ENDPOINTS.SYSTEM_OVERVIEW);
  },

  /**
   * 获取活动中心总览数据
   */
  getActivityOverview: (): Promise<ActivityOverviewResponse> => {
    return request.get(CENTERS_ENDPOINTS.ACTIVITY_OVERVIEW);
  },

  /**
   * 获取教师中心总览数据
   */
  getTeacherOverview: (): Promise<TeacherOverviewResponse> => {
    return requestFunc({
      url: CENTERS_ENDPOINTS.TEACHER_OVERVIEW,
      method: 'GET'
    });
  },

  /**
   * 获取分析中心总览数据
   */
  getAnalyticsOverview: (): Promise<AnalyticsOverviewResponse> => {
    return requestFunc({
      url: CENTERS_ENDPOINTS.ANALYTICS_OVERVIEW,
      method: 'GET'
    });
  },

  /**
   * 获取媒体中心总览数据
   */
  getMediaOverview: (): Promise<MediaOverviewResponse> => {
    return requestFunc({
      url: CENTERS_ENDPOINTS.MEDIA_OVERVIEW,
      method: 'GET'
    });
  },

  /**
   * 获取检查中心总览数据
   */
  getInspectionOverview: (): Promise<InspectionOverviewResponse> => {
    return requestFunc({
      url: CENTERS_ENDPOINTS.INSPECTION_OVERVIEW,
      method: 'GET'
    });
  },

  /**
   * 获取工作台总览数据
   */
  getDashboardOverview: (): Promise<DashboardOverviewResponse> => {
    return requestFunc({
      url: CENTERS_ENDPOINTS.DASHBOARD_OVERVIEW,
      method: 'GET'
    });
  },

  /**
   * 批量获取多个中心数据（并行调用）
   */
  getAllCentersOverview: async () => {
    const [systemData, activityData, teacherData, analyticsData] = await Promise.all([
      centersAPI.getSystemOverview(),
      centersAPI.getActivityOverview(),
      centersAPI.getTeacherOverview(),
      centersAPI.getAnalyticsOverview()
    ]);

    return {
      system: systemData,
      activity: activityData,
      teacher: teacherData,
      analytics: analyticsData
    };
  },

  /**
   * 批量获取所有核心业务中心数据（包括新增的集合API）
   */
  getAllCoreCentersOverview: async () => {
    const [
      systemData,
      activityData,
      teacherData,
      analyticsData,
      mediaData,
      inspectionData,
      dashboardData
    ] = await Promise.all([
      centersAPI.getSystemOverview(),
      centersAPI.getActivityOverview(),
      centersAPI.getTeacherOverview(),
      centersAPI.getAnalyticsOverview(),
      centersAPI.getMediaOverview(),
      centersAPI.getInspectionOverview(),
      centersAPI.getDashboardOverview()
    ]);

    return {
      system: systemData,
      activity: activityData,
      teacher: teacherData,
      analytics: analyticsData,
      media: mediaData,
      inspection: inspectionData,
      dashboard: dashboardData
    };
  },

  /**
   * 获取核心业务模块集合数据（用户指定的优先模块）
   */
  getPriorityCentersOverview: async () => {
    const [
      dashboardData,
      activityData,
      mediaData,
      inspectionData
    ] = await Promise.all([
      centersAPI.getDashboardOverview(),
      centersAPI.getActivityOverview(),
      centersAPI.getMediaOverview(),
      centersAPI.getInspectionOverview()
    ]);

    return {
      dashboard: dashboardData,
      activity: activityData,
      media: mediaData,
      inspection: inspectionData
    };
  }
};

export default centersAPI;