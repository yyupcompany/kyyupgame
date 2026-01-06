'use strict';

/**
 * 集团管理演示数据种子文件
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. 创建演示集团（童心幼教集团）
    await queryInterface.bulkInsert('groups', [
      {
        id: 1,
        name: '童心幼教集团',
        code: 'TONGXIN001',
        type: 1, // 教育集团
        legal_person: '王小明',
        registered_capital: 50000000.00,
        business_license: '91110000MA01234567',
        established_date: '2015-03-15',
        address: '北京市朝阳区建国路88号',
        phone: '010-65432100',
        email: 'contact@tongxin-edu.com',
        website: 'https://www.tongxin-edu.com',
        logo_url: 'https://example.com/logos/tongxin.png',
        brand_name: '童心幼教',
        slogan: '用心呵护每一个童年',
        description: '童心幼教集团成立于2015年，是一家专业的幼儿教育集团，拥有多家直营、加盟和合营园所。',
        vision: '成为中国最受信赖的幼儿教育品牌',
        culture: '爱心、专业、创新、卓越',
        chairman: '王小明',
        ceo: '李晓红',
        investor_id: null,
        kindergarten_count: 0,
        total_students: 0,
        total_teachers: 0,
        total_classes: 0,
        total_capacity: 0,
        status: 1,
        creator_id: null,
        created_at: now,
        updated_at: now
      }
    ], {});

    console.log('✅ 演示集团数据创建成功');

    console.log('\n📊 演示数据统计:');
    console.log('- 创建了 1 个演示集团（童心幼教集团）');
    console.log('\n💡 提示: 可以通过以下SQL查询验证:');
    console.log('   SELECT * FROM groups;');
  },

  async down(queryInterface, Sequelize) {
    // 删除演示集团
    await queryInterface.bulkDelete('groups', {
      id: [1]
    }, {});

    console.log('✅ 演示数据已删除');
  }
};

