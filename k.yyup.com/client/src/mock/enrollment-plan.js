/**
 * enrollment-plan 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getEnrollmentPlanList 的模拟数据
 */
export const getEnrollmentPlanListMock = 68;

/**
 * getEnrollmentPlanDetail 的模拟数据
 */
export const getEnrollmentPlanDetailMock = {
      "code": 200,
      "message": "success",
      "data": {}
    };

/**
 * createEnrollmentPlan 的模拟数据
 */
export const createEnrollmentPlanMock = "mock-string-857";

/**
 * updateEnrollmentPlan 的模拟数据
 */
export const updateEnrollmentPlanMock = {
      "code": 200,
      "message": "success",
      "data": {
      "code": 200,
      "message": "success",
      "data": {}
    }
    };

/**
 * deleteEnrollmentPlan 的模拟数据
 */
export const deleteEnrollmentPlanMock = {
      "code": 200,
      "message": "success",
      "data": {
      "code": 200,
      "message": "success",
      "data": {}
    }
    };

/**
 * updateEnrollmentPlanStatus 的模拟数据
 */
export const updateEnrollmentPlanStatusMock = {
      "code": 200,
      "message": "success",
      "data": {
      "code": 200,
      "message": "success",
      "data": {}
    }
    };

/**
 * getEnrollmentAnalytics 的模拟数据
 */
export const getEnrollmentAnalyticsMock = {
      "code": 200,
      "message": "success",
      "data": {
      "code": 200,
      "message": "success",
      "data": {}
    }
    };

/**
 * exportEnrollmentPlanData 的模拟数据
 */
export const exportEnrollmentPlanDataMock = {
      "code": 200,
      "message": "success",
      "data": {
      "code": 200,
      "message": "success",
      "data": {}
    }
    };

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
        case 'getEnrollmentPlanList':
          resolve(getEnrollmentPlanListMock);
          break;
        case 'getEnrollmentPlanDetail':
          resolve(getEnrollmentPlanDetailMock);
          break;
        case 'createEnrollmentPlan':
          resolve(createEnrollmentPlanMock);
          break;
        case 'updateEnrollmentPlan':
          resolve(updateEnrollmentPlanMock);
          break;
        case 'deleteEnrollmentPlan':
          resolve(deleteEnrollmentPlanMock);
          break;
        case 'updateEnrollmentPlanStatus':
          resolve(updateEnrollmentPlanStatusMock);
          break;
        case 'getEnrollmentAnalytics':
          resolve(getEnrollmentAnalyticsMock);
          break;
        case 'exportEnrollmentPlanData':
          resolve(exportEnrollmentPlanDataMock);
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
