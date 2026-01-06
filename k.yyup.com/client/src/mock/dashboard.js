/**
 * dashboard 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getDashboardStats 的模拟数据
 */
export const getDashboardStatsMock = {};

/**
 * getEnrollmentTrends 的模拟数据
 */
export const getEnrollmentTrendsMock = {};

/**
 * getActivityData 的模拟数据
 */
export const getActivityDataMock = {};

/**
 * getRecentActivities 的模拟数据
 */
export const getRecentActivitiesMock = {};

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
        case 'getDashboardStats':
          resolve(getDashboardStatsMock);
          break;
        case 'getEnrollmentTrends':
          resolve(getEnrollmentTrendsMock);
          break;
        case 'getActivityData':
          resolve(getActivityDataMock);
          break;
        case 'getRecentActivities':
          resolve(getRecentActivitiesMock);
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
