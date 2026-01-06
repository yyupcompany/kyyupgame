/**
 * class 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getClassList 的模拟数据
 */
export const getClassListMock = 40;

/**
 * getClassDetail 的模拟数据
 */
export const getClassDetailMock = {
      "code": 200,
      "message": "success",
      "data": {}
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
        case 'getClassList':
          resolve(getClassListMock);
          break;
        case 'getClassDetail':
          resolve(getClassDetailMock);
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
