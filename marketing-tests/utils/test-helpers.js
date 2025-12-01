/**
 * 测试辅助工具
 */

const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class TestHelpers {
  /**
   * 生成唯一的测试数据
   */
  static generateUniqueSuffix() {
    return `_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成测试活动数据
   */
  static generateTestActivity(overrides = {}) {
    const suffix = this.generateUniqueSuffix();
    return {
      title: `测试活动${suffix}`,
      description: '这是一个用于测试的活动',
      startDate: moment().add(1, 'days').toISOString(),
      endDate: moment().add(1, 'days').add(2, 'hours').toISOString(),
      maxParticipants: 30,
      fee: 299.00,
      type: 'outdoor',
      location: '测试场地',
      requirements: '无特殊要求',
      status: 'active',
      ...overrides
    };
  }

  /**
   * 生成测试用户数据
   */
  static generateTestUser(overrides = {}) {
    const suffix = this.generateUniqueSuffix();
    return {
      name: `测试用户${suffix}`,
      email: `test${suffix}@example.com`,
      phone: `138${Math.random().toString().substr(2, 8)}`,
      role: 'parent',
      ...overrides
    };
  }

  /**
   * 生成团购数据
   */
  static generateGroupBuyData(activityId, overrides = {}) {
    return {
      activityId,
      minParticipants: 3,
      maxParticipants: 20,
      originalPrice: 299.00,
      groupPrice: 239.20, // 8折
      durationHours: 72,
      description: '测试团购活动',
      ...overrides
    };
  }

  /**
   * 生成积攒活动数据
   */
  static generateCollectActivityData(activityId, overrides = {}) {
    return {
      activityId,
      targetCount: 20,
      maxCount: 100,
      deadlineHours: 48,
      rewardType: 'discount',
      rewardValue: '50',
      description: '测试积攒活动',
      ...overrides
    };
  }

  /**
   * 生成订单数据
   */
  static generateOrderData(activityId, overrides = {}) {
    return {
      activityId,
      type: 'registration',
      originalAmount: 299.00,
      discountAmount: 0,
      paymentMethod: 'offline',
      offlinePaymentContact: '测试联系方式',
      offlinePaymentLocation: '测试支付地点',
      offlinePaymentDeadline: moment().add(3, 'days').toISOString(),
      remark: '测试订单',
      ...overrides
    };
  }

  /**
   * 生成阶梯奖励数据
   */
  static generateTieredRewardData(activityId, overrides = {}) {
    return {
      activityId,
      type: 'registration',
      tier: 1,
      targetValue: 10,
      rewardType: 'discount',
      rewardValue: '10',
      rewardDescription: '满10人享9折优惠',
      ...overrides
    };
  }

  /**
   * 等待指定时间
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 重试函数
   */
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) {
          break;
        }
        console.log(`重试第 ${attempt} 次，失败原因: ${error.message}`);
        await this.wait(delay);
      }
    }

    throw lastError;
  }

  /**
   * 验证响应结构
   */
  static validateApiResponse(response, expectedFields = []) {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('message');

    if (response.success) {
      expect(response).toHaveProperty('data');

      // 验证指定字段
      expectedFields.forEach(field => {
        if (field.includes('.')) {
          // 处理嵌套字段
          const [parent, child] = field.split('.');
          expect(response.data).toHaveProperty(parent);
          expect(response.data[parent]).toHaveProperty(child);
        } else {
          expect(response.data).toHaveProperty(field);
        }
      });
    }
  }

  /**
   * 验证分页响应
   */
  static validatePaginatedResponse(response) {
    this.validateApiResponse(response);

    if (response.success) {
      const data = response.data;
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('pageSize');
      expect(Array.isArray(data.items)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.page).toBe('number');
      expect(typeof data.pageSize).toBe('number');
    }
  }

  /**
   * 验证错误响应
   */
  static validateErrorResponse(response, expectedStatus = null, expectedMessage = null) {
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('message');

    if (expectedStatus) {
      expect(response.status).toBe(expectedStatus);
    }

    if (expectedMessage) {
      expect(response.message).toContain(expectedMessage);
    }
  }

  /**
   * 创建测试套件的基础数据
   */
  static async createBaseTestData(apiClient) {
    const baseData = {};

    try {
      // 创建测试活动
      const activityData = this.generateTestActivity();
      const activityResponse = await apiClient.createActivity(activityData);
      this.validateApiResponse(activityResponse, ['id', 'title']);
      baseData.activity = activityResponse.data;

      // 创建多个测试用户
      const users = [];
      for (let i = 0; i < 5; i++) {
        const userData = this.generateTestUser({
          email: `testuser${i}${this.generateUniqueSuffix()}@example.com`
        });
        users.push(userData);
      }
      baseData.users = users;

      return baseData;
    } catch (error) {
      console.error('创建基础测试数据失败:', error);
      throw error;
    }
  }

  /**
   * 清理测试数据
   */
  static async cleanupTestData(apiClient, baseData) {
    const errors = [];

    try {
      // 清理活动
      if (baseData.activity?.id) {
        try {
          await apiClient.deleteActivity(baseData.activity.id);
        } catch (error) {
          errors.push(`删除活动失败: ${error.message}`);
        }
      }

      // 清理团购
      if (baseData.groupBuy?.id) {
        try {
          // 这里应该有删除团购的API
          // await apiClient.deleteGroupBuy(baseData.groupBuy.id);
        } catch (error) {
          errors.push(`删除团购失败: ${error.message}`);
        }
      }

      // 清理订单
      if (baseData.orders?.length) {
        for (const order of baseData.orders) {
          try {
            // 这里应该有删除订单的API
            // await apiClient.deleteOrder(order.id);
          } catch (error) {
            errors.push(`删除订单失败: ${error.message}`);
          }
        }
      }

      if (errors.length > 0) {
        console.warn('清理测试数据时出现警告:', errors);
      }

    } catch (error) {
      console.error('清理测试数据失败:', error);
      throw error;
    }
  }

  /**
   * 随机选择数组中的元素
   */
  static randomChoice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 生成随机数字
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成随机金额
   */
  static randomAmount(min, max, decimals = 2) {
    return Number((Math.random() * (max - min) + min).toFixed(decimals));
  }

  /**
   * 生成未来的时间
   */
  static futureDate(days = 1) {
    return moment().add(days, 'days').toISOString();
  }

  /**
   * 生成过去的时间
   */
  static pastDate(days = 1) {
    return moment().subtract(days, 'days').toISOString();
  }

  /**
   * 验证日期格式
   */
  static isValidDate(dateString) {
    return moment(dateString).isValid();
  }

  /**
   * 格式化日期
   */
  static formatDate(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(dateString).format(format);
  }

  /**
   * 计算两个日期之间的差值
   */
  static dateDiff(date1, date2, unit = 'days') {
    return moment(date1).diff(moment(date2), unit);
  }
}

module.exports = TestHelpers;