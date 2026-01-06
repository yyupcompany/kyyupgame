/**
 * principal 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getPrincipalDashboardStats 的模拟数据
 */
export const getPrincipalDashboardStatsMock = {
  success: true,
  code: 200,
  data: {
    totalStudents: 248,
    totalClasses: 12,
    totalTeachers: 24,
    totalActivities: 15,
    pendingApplications: 8,
    enrollmentRate: 0.85,
    teacherAttendanceRate: 0.95,
    studentAttendanceRate: 0.92,
    studentTrend: 12,
    classTrend: 5,
    applicationTrend: -3,
    enrollmentTrend: 18,
    monthlyStats: {
      newStudents: 24,
      graduateStudents: 16,
      newTeachers: 2,
      avgClassSize: 20.6,
      satisfactionRate: 0.94
    },
    recentActivities: [
      {
        id: '1',
        title: '春季亲子运动会',
        type: 'event',
        status: 'completed',
        date: '2025-07-01',
        participants: 156
      },
      {
        id: '2',
        title: '新教师入职培训',
        type: 'training',
        status: 'ongoing',
        date: '2025-07-04',
        participants: 8
      }
    ]
  },
  message: '获取园长仪表盘统计数据成功'
};

/**
 * getCampusOverview 的模拟数据
 */
export const getCampusOverviewMock = {};

/**
 * getApprovalList 的模拟数据
 */
export const getApprovalListMock = {};

/**
 * handleApproval 的模拟数据
 */
export const handleApprovalMock = {};

/**
 * getImportantNotices 的模拟数据
 */
export const getImportantNoticesMock = {};

/**
 * publishNotice 的模拟数据
 */
export const publishNoticeMock = {};

/**
 * getPrincipalSchedule 的模拟数据
 */
export const getPrincipalScheduleMock = {};

/**
 * createPrincipalSchedule 的模拟数据
 */
export const createPrincipalScheduleMock = {};

/**
 * 模拟API响应
 * @param {string} apiName - API名称
 * @param {any} params - API参数
 * @returns {Promise<any>} 模拟响应
 */
export const mockResponse = (apiName, params = {}) => {
  // 模拟网络延迟
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 300) + 100; // 100-400ms延迟
    setTimeout(() => {
      switch (apiName) {
        case 'getPrincipalDashboardStats':
          resolve(getPrincipalDashboardStatsMock);
          break;
        case 'getCampusOverview':
          resolve(getCampusOverviewMock);
          break;
        case 'getApprovalList':
          resolve(getApprovalListMock);
          break;
        case 'handleApproval':
          resolve(handleApprovalMock);
          break;
        case 'getImportantNotices':
          resolve(getImportantNoticesMock);
          break;
        case 'publishNotice':
          resolve(publishNoticeMock);
          break;
        case 'getPrincipalSchedule':
          resolve(getPrincipalScheduleMock);
          break;
        case 'createPrincipalSchedule':
          resolve(createPrincipalScheduleMock);
          break;
        default:
          resolve({
            code: 404,
            message: `未找到API: ${apiName}`,
            data: null
          });
      }
    }, delay);
  });
};
