/**
 * activity 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getActivityList 的模拟数据
 */
export const getActivityListMock = 71;

/**
 * getActivityDetail 的模拟数据
 */
export const getActivityDetailMock = {};

/**
 * createActivity 的模拟数据
 */
export const createActivityMock = "mock-string-774";

/**
 * updateActivity 的模拟数据
 */
export const updateActivityMock = {};

/**
 * deleteActivity 的模拟数据
 */
export const deleteActivityMock = {};

/**
 * updateActivityStatus 的模拟数据
 */
export const updateActivityStatusMock = {};

/**
 * batchDeleteActivities 的模拟数据
 */
export const batchDeleteActivitiesMock = {};

/**
 * uploadActivityCover 的模拟数据
 */
export const uploadActivityCoverMock = {};

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
        case 'getActivityList':
          resolve(getActivityListMock);
          break;
        case 'getActivityDetail':
          resolve(getActivityDetailMock);
          break;
        case 'createActivity':
          resolve(createActivityMock);
          break;
        case 'updateActivity':
          resolve(updateActivityMock);
          break;
        case 'deleteActivity':
          resolve(deleteActivityMock);
          break;
        case 'updateActivityStatus':
          resolve(updateActivityStatusMock);
          break;
        case 'batchDeleteActivities':
          resolve(batchDeleteActivitiesMock);
          break;
        case 'uploadActivityCover':
          resolve(uploadActivityCoverMock);
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
