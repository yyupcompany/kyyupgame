/**
 * marketing 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getMarketingActivityList 的模拟数据
 */
export const getMarketingActivityListMock = {};

/**
 * getMarketingActivityDetail 的模拟数据
 */
export const getMarketingActivityDetailMock = {};

/**
 * createMarketingActivity 的模拟数据
 */
export const createMarketingActivityMock = {};

/**
 * updateMarketingActivity 的模拟数据
 */
export const updateMarketingActivityMock = {};

/**
 * deleteMarketingActivity 的模拟数据
 */
export const deleteMarketingActivityMock = {};

/**
 * updateMarketingActivityStatus 的模拟数据
 */
export const updateMarketingActivityStatusMock = {};

/**
 * updateMarketingActivityResults 的模拟数据
 */
export const updateMarketingActivityResultsMock = {};

/**
 * getMarketingChannelList 的模拟数据
 */
export const getMarketingChannelListMock = {};

/**
 * createMarketingChannel 的模拟数据
 */
export const createMarketingChannelMock = {};

/**
 * updateMarketingChannel 的模拟数据
 */
export const updateMarketingChannelMock = {};

/**
 * deleteMarketingChannel 的模拟数据
 */
export const deleteMarketingChannelMock = {};

/**
 * getMarketingAnalytics 的模拟数据
 */
export const getMarketingAnalyticsMock = {};

/**
 * exportMarketingActivityData 的模拟数据
 */
export const exportMarketingActivityDataMock = {};

/**
 * exportMarketingAnalyticsReport 的模拟数据
 */
export const exportMarketingAnalyticsReportMock = {};

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
        case 'getMarketingActivityList':
          resolve(getMarketingActivityListMock);
          break;
        case 'getMarketingActivityDetail':
          resolve(getMarketingActivityDetailMock);
          break;
        case 'createMarketingActivity':
          resolve(createMarketingActivityMock);
          break;
        case 'updateMarketingActivity':
          resolve(updateMarketingActivityMock);
          break;
        case 'deleteMarketingActivity':
          resolve(deleteMarketingActivityMock);
          break;
        case 'updateMarketingActivityStatus':
          resolve(updateMarketingActivityStatusMock);
          break;
        case 'updateMarketingActivityResults':
          resolve(updateMarketingActivityResultsMock);
          break;
        case 'getMarketingChannelList':
          resolve(getMarketingChannelListMock);
          break;
        case 'createMarketingChannel':
          resolve(createMarketingChannelMock);
          break;
        case 'updateMarketingChannel':
          resolve(updateMarketingChannelMock);
          break;
        case 'deleteMarketingChannel':
          resolve(deleteMarketingChannelMock);
          break;
        case 'getMarketingAnalytics':
          resolve(getMarketingAnalyticsMock);
          break;
        case 'exportMarketingActivityData':
          resolve(exportMarketingActivityDataMock);
          break;
        case 'exportMarketingAnalyticsReport':
          resolve(exportMarketingAnalyticsReportMock);
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
