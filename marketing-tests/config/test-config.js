/**
 * 测试配置文件
 */

module.exports = {
  // API 配置
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    retries: 3
  },

  // 测试数据
  testData: {
    activities: [
      {
        title: '春季亲子活动',
        description: '适合家长和孩子一起参加的春季户外活动',
        startDate: '2024-08-01T09:00:00Z',
        endDate: '2024-08-01T17:00:00Z',
        maxParticipants: 50,
        fee: 299.00,
        type: 'outdoor'
      },
      {
        title: '暑期手工班',
        description: '培养孩子动手能力的暑期手工课程',
        startDate: '2024-07-15T14:00:00Z',
        endDate: '2024-08-15T16:00:00Z',
        maxParticipants: 30,
        fee: 199.00,
        type: 'indoor'
      }
    ],

    groupBuySettings: {
      minParticipants: 3,
      maxParticipants: 20,
      discountRate: 0.8, // 8折
      durationHours: 72
    },

    collectSettings: {
      targetCount: 20,
      maxCount: 100,
      deadlineHours: 48,
      rewardType: 'discount',
      rewardValue: '50'
    },

    tieredRewards: [
      {
        tier: 1,
        targetValue: 10,
        rewardType: 'discount',
        rewardValue: '10',
        rewardDescription: '满10人享9折优惠'
      },
      {
        tier: 2,
        targetValue: 20,
        rewardType: 'gift',
        rewardValue: '玩具小汽车',
        rewardDescription: '满20人送精美玩具'
      },
      {
        tier: 3,
        targetValue: 30,
        rewardType: 'free',
        rewardValue: '1',
        rewardDescription: '满30人免1人费用'
      }
    ]
  },

  // 测试用户
  users: {
    admin: {
      email: 'admin@test.com',
      password: 'admin123',
      token: null
    },
    teacher: {
      email: 'teacher@test.com',
      password: 'teacher123',
      token: null
    },
    parent1: {
      email: 'parent1@test.com',
      password: 'parent123',
      token: null,
      childName: '小明',
      phone: '13800138001'
    },
    parent2: {
      email: 'parent2@test.com',
      password: 'parent123',
      token: null,
      childName: '小红',
      phone: '13800138002'
    }
  },

  // 支付测试配置
  payment: {
    offlinePayment: {
      contact: '财务办公室电话：010-12345678',
      location: '幼儿园财务办公室（1号楼101室）',
      deadlineHours: 72
    },
    onlinePayment: {
      wechat: {
        appId: 'test_wechat_app_id',
        mchId: 'test_mch_id'
      },
      alipay: {
        appId: 'test_alipay_app_id'
      }
    }
  },

  // 错误场景配置
  errorScenarios: {
    invalidActivity: '活动不存在或已结束',
    insufficientPermission: '权限不足',
    duplicateRegistration: '用户已报名此活动',
    paymentFailed: '支付处理失败',
    expiredOrder: '订单已过期',
    invalidToken: 'Token无效或已过期'
  }
};