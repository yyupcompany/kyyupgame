'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('activity_templates', [
      {
        id: 1,
        name: '亲子运动会',
        description: '增进亲子关系的体育活动模板，包含多种运动项目和亲子互动环节',
        category: '体育活动',
        coverImage: '/templates/sports.svg',
        usageCount: 15,
        templateData: JSON.stringify({
          duration: 120, // 活动时长（分钟）
          maxParticipants: 50,
          ageRange: '3-6岁',
          materials: ['运动器材', '奖品', '音响设备'],
          activities: [
            { name: '亲子接力赛', duration: 30 },
            { name: '投篮比赛', duration: 20 },
            { name: '拔河比赛', duration: 25 },
            { name: '颁奖仪式', duration: 15 }
          ],
          requirements: ['室外场地', '天气良好', '安全措施'],
          objectives: ['增进亲子关系', '锻炼身体', '培养团队精神']
        }),
        status: 'active',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: '科学实验课',
        description: '培养孩子科学兴趣的实验活动，通过简单有趣的实验激发探索欲',
        category: '教育活动',
        coverImage: '/templates/science.svg',
        usageCount: 23,
        templateData: JSON.stringify({
          duration: 90,
          maxParticipants: 20,
          ageRange: '4-6岁',
          materials: ['实验器材', '安全护具', '实验材料'],
          activities: [
            { name: '彩虹实验', duration: 25 },
            { name: '火山爆发', duration: 30 },
            { name: '磁铁探索', duration: 20 },
            { name: '成果展示', duration: 15 }
          ],
          requirements: ['实验室', '安全设备', '专业指导'],
          objectives: ['培养科学兴趣', '提高观察能力', '学习科学知识']
        }),
        status: 'active',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: '艺术创作坊',
        description: '发挥创意的艺术创作活动，让孩子在创作中表达自我',
        category: '艺术活动',
        coverImage: '/templates/art.svg',
        usageCount: 18,
        templateData: JSON.stringify({
          duration: 100,
          maxParticipants: 25,
          ageRange: '3-6岁',
          materials: ['画笔', '颜料', '画纸', '手工材料'],
          activities: [
            { name: '自由绘画', duration: 35 },
            { name: '手工制作', duration: 40 },
            { name: '作品展示', duration: 25 }
          ],
          requirements: ['美术教室', '充足光线', '清洁设施'],
          objectives: ['培养创造力', '提高审美能力', '增强自信心']
        }),
        status: 'active',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: '节日庆典',
        description: '传统节日庆祝活动模板，传承文化，增强节日氛围',
        category: '节日活动',
        coverImage: '/templates/festival.svg',
        usageCount: 31,
        templateData: JSON.stringify({
          duration: 150,
          maxParticipants: 100,
          ageRange: '3-6岁',
          materials: ['装饰用品', '服装道具', '音响设备', '节日用品'],
          activities: [
            { name: '开场表演', duration: 20 },
            { name: '传统游戏', duration: 45 },
            { name: '文化展示', duration: 40 },
            { name: '集体合影', duration: 15 },
            { name: '节日聚餐', duration: 30 }
          ],
          requirements: ['大型场地', '舞台设备', '安全保障'],
          objectives: ['传承文化', '增强归属感', '促进交流']
        }),
        status: 'active',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('activity_templates', null, {});
  }
};
