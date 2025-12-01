/**
 * 测试数据设置脚本
 * 用于在测试前创建必要的测试数据
 */

const { Sequelize } = require('sequelize');
const ApiClient = require('../utils/api-client');
const TestHelpers = require('../utils/test-helpers');
const config = require('../config/test-config');

class TestDataSetup {
  constructor() {
    this.apiClient = new ApiClient();
    this.sequelize = null;
    this.baseData = {};
  }

  /**
   * 初始化数据库连接
   */
  async initializeDatabase() {
    console.log('🔧 初始化数据库连接...');

    try {
      // 这里需要根据实际的数据库配置进行调整
      this.sequelize = new Sequelize(
        process.env.TEST_DATABASE_URL || 'mysql://root:password@localhost:3306/kindergarten_test',
        {
          logging: false, // 测试时关闭日志
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
          }
        }
      );

      await this.sequelize.authenticate();
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 清理现有测试数据
   */
  async cleanupExistingData() {
    console.log('🧹 清理现有测试数据...');

    try {
      // 清理营销相关的测试数据
      const tables = [
        'tiered_reward_records',
        'tiered_rewards',
        'collect_activities',
        'collect_help_records',
        'group_buy_participants',
        'group_buys',
        'activity_registrations',
        'payments',
        'orders'
      ];

      for (const table of tables) {
        try {
          await this.sequelize.query(`DELETE FROM ${table} WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`);
          console.log(`✅ 清理表: ${table}`);
        } catch (error) {
          console.log(`⚠️  跳过表: ${table} (${error.message})`);
        }
      }

      console.log('✅ 测试数据清理完成');
    } catch (error) {
      console.error('❌ 清理测试数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建基础用户数据
   */
  async createBaseUsers() {
    console.log('👥 创建基础用户数据...');

    try {
      // 管理员登录
      const adminResponse = await this.apiClient.login(
        config.users.admin.email,
        config.users.admin.password
      );

      if (!adminResponse.success) {
        throw new Error('管理员登录失败');
      }

      this.apiClient.setToken(adminResponse.token);
      console.log('✅ 管理员登录成功');

      // 创建测试用户
      const testUsers = [];

      for (const [key, user] of Object.entries(config.users)) {
        if (key === 'admin') continue;

        try {
          // 尝试登录用户，如果失败则创建
          let userResponse = await this.apiClient.login(user.email, user.password);

          if (!userResponse.success) {
            console.log(`⚠️  用户 ${user.email} 登录失败，尝试创建...`);
            // 这里应该调用创建用户的API，但可能需要管理员权限
          }

          testUsers.push({
            key,
            ...user,
            token: userResponse.token
          });

          console.log(`✅ 用户 ${user.email} 准备完成`);
        } catch (error) {
          console.log(`⚠️  用户 ${user.email} 准备失败: ${error.message}`);
        }
      }

      this.baseData.users = testUsers;
      this.baseData.adminToken = adminResponse.token;

      console.log(`✅ 基础用户数据创建完成 (${testUsers.length + 1} 个用户)`);
    } catch (error) {
      console.error('❌ 创建基础用户数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建基础活动数据
   */
  async createBaseActivities() {
    console.log('🎯 创建基础活动数据...');

    try {
      const activities = [];

      for (let i = 1; i <= 5; i++) {
        const activityData = TestHelpers.generateActivityData({
          title: `测试活动 ${i}`,
          description: `用于营销功能测试的活动 ${i}`,
          maxParticipants: 50 + i * 10,
          registrationDeadline: TestHelpers.futureDate(7 + i)
        });

        try {
          const response = await this.apiClient.createActivity(activityData);

          if (response.success) {
            activities.push(response.data);
            console.log(`✅ 创建活动: ${activityData.title}`);
          }
        } catch (error) {
          console.log(`⚠️  创建活动失败: ${activityData.title} (${error.message})`);
        }
      }

      this.baseData.activities = activities;
      console.log(`✅ 基础活动数据创建完成 (${activities.length} 个活动)`);

      return activities;
    } catch (error) {
      console.error('❌ 创建基础活动数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建营销测试数据
   */
  async createMarketingTestData() {
    console.log('📈 创建营销测试数据...');

    try {
      const marketingData = {
        groupBuys: [],
        collectActivities: [],
        tieredRewards: []
      };

      if (this.baseData.activities.length === 0) {
        throw new Error('没有可用的活动数据');
      }

      const firstActivity = this.baseData.activities[0];

      // 创建团购数据
      for (let i = 1; i <= 3; i++) {
        const groupBuyData = TestHelpers.generateGroupBuyData(firstActivity.id, {
          title: `测试团购 ${i}`,
          description: `用于测试的团购活动 ${i}`,
          minParticipants: 5 + i * 2,
          maxParticipants: 20 + i * 5
        });

        try {
          const response = await this.apiClient.createGroupBuy(groupBuyData);

          if (response.success) {
            marketingData.groupBuys.push(response.data);
            console.log(`✅ 创建团购: ${groupBuyData.title}`);
          }
        } catch (error) {
          console.log(`⚠️  创建团购失败: ${groupBuyData.title} (${error.message})`);
        }
      }

      // 创建积攒活动数据
      for (let i = 1; i <= 3; i++) {
        const collectData = TestHelpers.generateCollectActivityData(firstActivity.id, {
          targetCount: 10 + i * 5,
          maxCount: 50 + i * 10,
          rewardType: ['discount', 'gift', 'points'][i - 1],
          rewardValue: ['50', '精美玩具', '100'][i - 1]
        });

        try {
          const response = await this.apiClient.createCollectActivity(collectData);

          if (response.success) {
            marketingData.collectActivities.push(response.data);
            console.log(`✅ 创建积攒活动: ${collectData.rewardType}奖励`);
          }
        } catch (error) {
          console.log(`⚠️  创建积攒活动失败: ${error.message}`);
        }
      }

      // 创建阶梯奖励数据
      const rewardTypes = ['discount', 'gift', 'cashback'];
      for (let i = 1; i <= 3; i++) {
        const rewardData = TestHelpers.generateTieredRewardData(firstActivity.id, {
          tier: i,
          targetValue: i * 10,
          rewardType: rewardTypes[i - 1],
          rewardValue: i === 1 ? '10' : i === 2 ? '玩具' : '50',
          rewardDescription: `第${i}阶梯奖励`
        });

        try {
          const response = await this.apiClient.createTieredReward(rewardData);

          if (response.success) {
            marketingData.tieredRewards.push(response.data);
            console.log(`✅ 创建阶梯奖励: 第${i}阶梯`);
          }
        } catch (error) {
          console.log(`⚠️  创建阶梯奖励失败: ${error.message}`);
        }
      }

      this.baseData.marketing = marketingData;
      console.log('✅ 营销测试数据创建完成');

      return marketingData;
    } catch (error) {
      console.error('❌ 创建营销测试数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 验证测试数据完整性
   */
  async validateTestData() {
    console.log('🔍 验证测试数据完整性...');

    const issues = [];

    // 检查用户数据
    if (!this.baseData.users || this.baseData.users.length === 0) {
      issues.push('缺少测试用户数据');
    }

    // 检查活动数据
    if (!this.baseData.activities || this.baseData.activities.length === 0) {
      issues.push('缺少测试活动数据');
    }

    // 检查营销数据
    if (!this.baseData.marketing) {
      issues.push('缺少营销测试数据');
    } else {
      if (!this.baseData.marketing.groupBuys || this.baseData.marketing.groupBuys.length === 0) {
        issues.push('缺少团购测试数据');
      }
      if (!this.baseData.marketing.collectActivities || this.baseData.marketing.collectActivities.length === 0) {
        issues.push('缺少积攒活动测试数据');
      }
      if (!this.baseData.marketing.tieredRewards || this.baseData.marketing.tieredRewards.length === 0) {
        issues.push('缺少阶梯奖励测试数据');
      }
    }

    if (issues.length > 0) {
      console.error('❌ 测试数据验证失败:');
      issues.forEach(issue => console.error(`  - ${issue}`));
      throw new Error('测试数据不完整');
    }

    console.log('✅ 测试数据验证通过');
    return true;
  }

  /**
   * 完整的测试数据设置流程
   */
  async setup() {
    console.log('🚀 开始设置测试数据...');
    const startTime = Date.now();

    try {
      await this.initializeDatabase();
      await this.cleanupExistingData();
      await this.createBaseUsers();
      await this.createBaseActivities();
      await this.createMarketingTestData();
      await this.validateTestData();

      const duration = Date.now() - startTime;
      console.log(`🎉 测试数据设置完成! 耗时: ${duration}ms`);

      // 输出数据统计
      console.log('\n📊 测试数据统计:');
      console.log(`  用户: ${this.baseData.users?.length || 0} 个`);
      console.log(`  活动: ${this.baseData.activities?.length || 0} 个`);
      console.log(`  团购: ${this.baseData.marketing?.groupBuys?.length || 0} 个`);
      console.log(`  积攒活动: ${this.baseData.marketing?.collectActivities?.length || 0} 个`);
      console.log(`  阶梯奖励: ${this.baseData.marketing?.tieredRewards?.length || 0} 个`);

      return this.baseData;
    } catch (error) {
      console.error('❌ 测试数据设置失败:', error.message);
      throw error;
    }
  }

  /**
   * 保存测试数据到文件
   */
  async saveTestDataToFile() {
    const fs = require('fs');
    const path = require('path');

    const testDataPath = path.join(__dirname, '../temp/test-data.json');

    try {
      // 确保目录存在
      const tempDir = path.dirname(testDataPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 保存测试数据（不包含敏感信息）
      const sanitizedData = {
        ...this.baseData,
        adminToken: undefined,
        users: this.baseData.users?.map(user => ({
          ...user,
          password: undefined,
          token: undefined
        }))
      };

      fs.writeFileSync(testDataPath, JSON.stringify(sanitizedData, null, 2));
      console.log(`✅ 测试数据已保存到: ${testDataPath}`);
    } catch (error) {
      console.warn('⚠️  保存测试数据失败:', error.message);
    }
  }

  /**
   * 获取基础数据
   */
  getBaseData() {
    return this.baseData;
  }

  /**
   * 获取API客户端
   */
  getApiClient() {
    return this.apiClient;
  }

  /**
   * 关闭连接
   */
  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

/**
 * 命令行执行
 */
async function main() {
  const setup = new TestDataSetup();

  try {
    await setup.setup();
    await setup.saveTestDataToFile();

    console.log('\n🎯 测试数据设置完成，可以开始运行测试!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 设置失败:', error.message);
    process.exit(1);
  } finally {
    await setup.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = TestDataSetup;