/**
 * API 客户端工具类
 */

const axios = require('axios');
const config = require('../config/test-config');

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (request) => {
        console.log(`[API Request] ${request.method.toUpperCase()} ${request.url}`);
        return request;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const safeErrorData = error.response?.data ?
          (typeof error.response.data === 'object' ? '[Object]' : error.response.data) :
          undefined;
        console.error('[API Response Error]', error.response?.status, safeErrorData);
        return Promise.reject(error);
      }
    );
  }

  // 设置认证Token
  setToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // 清除Token
  clearToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // 通用请求方法
  async request(method, url, data = null, params = null) {
    try {
      const config = {
        method,
        url,
        params
      };

      if (data) {
        config.data = data;
      }

      const response = await this.client(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message || error.message
        };
      } else if (error.request) {
        throw {
          status: 0,
          message: '网络请求失败',
          originalError: error
        };
      } else {
        throw {
          status: 0,
          message: error.message,
          originalError: error
        };
      }
    }
  }

  // GET 请求
  async get(url, params = null) {
    return this.request('GET', url, null, params);
  }

  // POST 请求
  async post(url, data = null) {
    return this.request('POST', url, data);
  }

  // PUT 请求
  async put(url, data = null) {
    return this.request('PUT', url, data);
  }

  // DELETE 请求
  async delete(url) {
    return this.request('DELETE', url);
  }

  // 认证相关API
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      return response.data;
    }
    throw new Error('登录失败');
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  // 用户相关API
  async getUserProfile() {
    return this.get('/auth/profile');
  }

  // 活动相关API
  async getActivities(params = {}) {
    return this.get('/activities', params);
  }

  async createActivity(activityData) {
    return this.post('/activities', activityData);
  }

  async getActivityDetail(activityId) {
    return this.get(`/activities/${activityId}`);
  }

  async updateActivity(activityId, activityData) {
    return this.put(`/activities/${activityId}`, activityData);
  }

  async deleteActivity(activityId) {
    return this.delete(`/activities/${activityId}`);
  }

  // 报名相关API
  async createRegistration(registrationData) {
    return this.post('/activity-registrations', registrationData);
  }

  async getRegistrations(params = {}) {
    return this.get('/activity-registrations', params);
  }

  async getRegistrationDetail(registrationId) {
    return this.get(`/activity-registrations/${registrationId}`);
  }

  async updateRegistration(registrationId, registrationData) {
    return this.put(`/activity-registrations/${registrationId}`, registrationData);
  }

  async deleteRegistration(registrationId) {
    return this.delete(`/activity-registrations/${registrationId}`);
  }

  // 团购相关API
  async createGroupBuy(groupBuyData) {
    return this.post('/marketing/group-buy', groupBuyData);
  }

  async getGroupBuys(params = {}) {
    return this.get('/marketing/group-buy', params);
  }

  async getGroupBuyDetail(groupBuyId) {
    return this.get(`/marketing/group-buy/${groupBuyId}`);
  }

  async joinGroupBuy(groupBuyId, joinData) {
    return this.post(`/marketing/group-buy/${groupBuyId}/join`, joinData);
  }

  async getGroupBuyMembers(groupBuyId, params = {}) {
    return this.get(`/marketing/group-buy/${groupBuyId}/members`, params);
  }

  // 积攒活动相关API
  async createCollectActivity(collectData) {
    return this.post('/marketing/collect-activity', collectData);
  }

  async helpCollect(helpData) {
    return this.post('/marketing/collect-activity/help', helpData);
  }

  async getCollectActivities(params = {}) {
    return this.get('/marketing/collect-activity', params);
  }

  async getCollectActivityDetail(collectId) {
    return this.get(`/marketing/collect-activity/${collectId}`);
  }

  // 支付相关API
  async createOrder(orderData) {
    return this.post('/payment/order', orderData);
  }

  async initiatePayment(paymentData) {
    return this.post('/payment/pay', paymentData);
  }

  async getOrders(params = {}) {
    return this.get('/payment/orders', params);
  }

  async getOrderDetail(orderId) {
    return this.get(`/payment/orders/${orderId}`);
  }

  async confirmOfflinePayment(orderId, paymentProof) {
    return this.post('/payment/offline/confirm', { orderId, paymentProof });
  }

  async cancelOfflinePayment(orderId, reason) {
    return this.post('/payment/offline/cancel', { orderId, reason });
  }

  async getPendingOfflinePayments(params = {}) {
    return this.get('/payment/offline/pending', params);
  }

  // 阶梯奖励相关API
  async createTieredReward(rewardData) {
    return this.post('/marketing/tiered-reward', rewardData);
  }

  async getTieredRewards(params = {}) {
    return this.get('/marketing/tiered-reward', params);
  }

  async getActivityTieredRewards(activityId, type) {
    return this.get(`/marketing/tiered-reward/activity/${activityId}`, { type });
  }

  async getUserRewardRecords(params = {}) {
    return this.get('/marketing/tiered-reward/my-records', params);
  }

  async useReward(recordId) {
    return this.post(`/marketing/tiered-reward/use/${recordId}`);
  }

  async getRewardStatistics(activityId) {
    return this.get(`/marketing/tiered-reward/statistics/${activityId}`);
  }

  // 通知相关API
  async getNotifications(params = {}) {
    return this.get('/notifications', params);
  }

  async markNotificationAsRead(notificationId) {
    return this.put(`/notifications/${notificationId}/read`);
  }

  // 健康检查API
  async healthCheck() {
    return this.get('/health');
  }
}

module.exports = ApiClient;