/**
 * notification 模块API模拟数据
 * 自动生成于 5/29/2025, 12:01:09 AM
 */

/**
 * getNotificationList 的模拟数据
 */
export const getNotificationListMock = {};

/**
 * getNotificationDetail 的模拟数据
 */
export const getNotificationDetailMock = {};

/**
 * createNotification 的模拟数据
 */
export const createNotificationMock = {};

/**
 * updateNotification 的模拟数据
 */
export const updateNotificationMock = {};

/**
 * deleteNotification 的模拟数据
 */
export const deleteNotificationMock = {};

/**
 * sendNotification 的模拟数据
 */
export const sendNotificationMock = {};

/**
 * getNotificationReadStatus 的模拟数据
 */
export const getNotificationReadStatusMock = {};

/**
 * cancelNotification 的模拟数据
 */
export const cancelNotificationMock = {};

/**
 * uploadNotificationAttachments 的模拟数据
 */
export const uploadNotificationAttachmentsMock = {};

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
        case 'getNotificationList':
          resolve(getNotificationListMock);
          break;
        case 'getNotificationDetail':
          resolve(getNotificationDetailMock);
          break;
        case 'createNotification':
          resolve(createNotificationMock);
          break;
        case 'updateNotification':
          resolve(updateNotificationMock);
          break;
        case 'deleteNotification':
          resolve(deleteNotificationMock);
          break;
        case 'sendNotification':
          resolve(sendNotificationMock);
          break;
        case 'getNotificationReadStatus':
          resolve(getNotificationReadStatusMock);
          break;
        case 'cancelNotification':
          resolve(cancelNotificationMock);
          break;
        case 'uploadNotificationAttachments':
          resolve(uploadNotificationAttachmentsMock);
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
