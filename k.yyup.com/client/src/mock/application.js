/**
 * application 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getApplicationList 的模拟数据
 */
export const getApplicationListMock = 14;

/**
 * getApplicationDetail 的模拟数据
 */
export const getApplicationDetailMock = {};

/**
 * reviewApplication 的模拟数据
 */
export const reviewApplicationMock = {};

/**
 * batchReviewApplications 的模拟数据
 */
export const batchReviewApplicationsMock = {};

/**
 * getApplicationHistory 的模拟数据
 */
export const getApplicationHistoryMock = {};

/**
 * sendAdmissionNotice 的模拟数据
 */
export const sendAdmissionNoticeMock = {};

/**
 * uploadApplicationAttachments 的模拟数据
 */
export const uploadApplicationAttachmentsMock = {};

/**
 * approveApplication 的模拟数据
 */
export const approveApplicationMock = true;

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
        case 'getApplicationList':
          resolve(getApplicationListMock);
          break;
        case 'getApplicationDetail':
          resolve(getApplicationDetailMock);
          break;
        case 'reviewApplication':
          resolve(reviewApplicationMock);
          break;
        case 'batchReviewApplications':
          resolve(batchReviewApplicationsMock);
          break;
        case 'getApplicationHistory':
          resolve(getApplicationHistoryMock);
          break;
        case 'sendAdmissionNotice':
          resolve(sendAdmissionNoticeMock);
          break;
        case 'uploadApplicationAttachments':
          resolve(uploadApplicationAttachmentsMock);
          break;
        case 'approveApplication':
          resolve(approveApplicationMock);
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
