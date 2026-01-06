'use strict';

/**
 * 童心幼教集团分园演示数据种子文件
 * 创建一个集团下的多个分园，包括直营、加盟和合营园所
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 创建演示分园数据
    await queryInterface.bulkInsert('kindergartens', [
      {
        id: 1,
        name: '童心总园',
        code: 'TONGXIN-HQ-001',
        type: 1, // 直营
        level: 1,
        address: '北京市朝阳区建国路88号',
        longitude: 116.4519,
        latitude: 39.9075,
        phone: '010-65432100',
        email: 'hq@tongxin-edu.com',
        principal: '王小红',
        established_date: '2015-03-15',
        area: 5000,
        building_area: 3500,
        class_count: 12,
        teacher_count: 45,
        student_count: 360,
        description: '童心幼教集团总部园所，拥有先进的教学设施和专业的教师队伍',
        features: '国际化教学、双语教育、艺术特色',
        philosophy: '用心呵护每一个童年',
        fee_description: '月费3000-5000元',
        status: 1,
        group_id: 1,
        group_role: 1,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        name: '童心一分园',
        code: 'TONGXIN-BR-001',
        type: 1, // 直营
        level: 1,
        address: '北京市朝阳区三里屯路50号',
        longitude: 116.4456,
        latitude: 39.9456,
        phone: '010-65432101',
        email: 'br1@tongxin-edu.com',
        principal: '李晓芳',
        established_date: '2017-09-01',
        area: 3500,
        building_area: 2500,
        class_count: 8,
        teacher_count: 30,
        student_count: 240,
        description: '童心幼教集团直营分园，秉承总园教学理念',
        features: '科学启蒙、音乐教育、户外活动',
        philosophy: '快乐学习，健康成长',
        fee_description: '月费2800-4500元',
        status: 1,
        group_id: 1,
        group_role: 3,
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        name: '童心二分园',
        code: 'TONGXIN-BR-002',
        type: 1, // 直营
        level: 1,
        address: '北京市朝阳区亮马河路30号',
        longitude: 116.4678,
        latitude: 39.9234,
        phone: '010-65432102',
        email: 'br2@tongxin-edu.com',
        principal: '张丽娜',
        established_date: '2018-06-15',
        area: 4000,
        building_area: 2800,
        class_count: 9,
        teacher_count: 35,
        student_count: 270,
        description: '童心幼教集团直营分园，致力于儿童全面发展',
        features: '体能训练、创意美术、阅读启蒙',
        philosophy: '每个孩子都是独特的',
        fee_description: '月费2900-4800元',
        status: 1,
        group_id: 1,
        group_role: 3,
        created_at: now,
        updated_at: now
      },
      {
        id: 4,
        name: '童心加盟园（浦东）',
        code: 'TONGXIN-FRAN-001',
        type: 2, // 加盟
        level: 1,
        address: '上海市浦东新区世纪大道100号',
        longitude: 121.5033,
        latitude: 31.2304,
        phone: '021-50000001',
        email: 'fran1@tongxin-edu.com',
        principal: '陈建华',
        established_date: '2019-03-01',
        area: 3000,
        building_area: 2200,
        class_count: 7,
        teacher_count: 25,
        student_count: 210,
        description: '童心幼教集团加盟园，采用集团统一的教学体系',
        features: '国际课程、双语教学、家园互动',
        philosophy: '培养国际化小公民',
        fee_description: '月费3200-5200元',
        status: 1,
        group_id: 1,
        group_role: 4,
        created_at: now,
        updated_at: now
      },
      {
        id: 5,
        name: '童心加盟园（南京）',
        code: 'TONGXIN-FRAN-002',
        type: 2, // 加盟
        level: 1,
        address: '江苏省南京市鼓楼区中山路200号',
        longitude: 118.7969,
        latitude: 32.0603,
        phone: '025-80000001',
        email: 'fran2@tongxin-edu.com',
        principal: '王美玲',
        established_date: '2019-09-15',
        area: 2800,
        building_area: 2000,
        class_count: 6,
        teacher_count: 22,
        student_count: 180,
        description: '童心幼教集团加盟园，提供优质的学前教育服务',
        features: '蒙氏教育、艺术培养、科学探索',
        philosophy: '开启智慧之门',
        fee_description: '月费2800-4500元',
        status: 1,
        group_id: 1,
        group_role: 4,
        created_at: now,
        updated_at: now
      },
      {
        id: 6,
        name: '童心合营园（杭州）',
        code: 'TONGXIN-COOP-001',
        type: 3, // 合营
        level: 1,
        address: '浙江省杭州市西湖区文一路300号',
        longitude: 120.1551,
        latitude: 30.2875,
        phone: '0571-80000001',
        email: 'coop1@tongxin-edu.com',
        principal: '李国强',
        established_date: '2020-01-10',
        area: 3200,
        building_area: 2300,
        class_count: 7,
        teacher_count: 26,
        student_count: 210,
        description: '童心幼教集团合营园，与当地优质教育机构合作',
        features: '融合教育、多元文化、创新教学',
        philosophy: '多元融合，共同成长',
        fee_description: '月费3000-5000元',
        status: 1,
        group_id: 1,
        group_role: 3,
        created_at: now,
        updated_at: now
      }
    ], {});

    console.log('✅ 演示分园数据创建成功');

    console.log('\n📊 演示数据统计:');
    console.log('- 创建了 1 个总园');
    console.log('- 创建了 2 个直营分园');
    console.log('- 创建了 2 个加盟园');
    console.log('- 创建了 1 个合营园');
    console.log('- 总计 6 个园所');
    console.log('\n💡 提示: 可以通过以下SQL查询验证:');
    console.log('   SELECT id, name, type, group_id FROM kindergartens WHERE group_id = 1;');
  },

  async down(queryInterface, Sequelize) {
    // 删除演示分园
    await queryInterface.bulkDelete('kindergartens', {
      group_id: 1
    }, {});

    console.log('✅ 演示分园数据已删除');
  }
};

