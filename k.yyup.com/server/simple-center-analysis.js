const { Sequelize } = require('sequelize');
require('dotenv').config();

// 数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    dialect: 'mysql',
    logging: false
  }
);

async function simpleCenterAnalysis() {
  try {
    console.log('🔍 分析数据库中的中心内容...\n');

    // 查询所有权限（包含中心信息）
    const [allPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, path, icon, parent_id, sort, description
      FROM permissions
      WHERE status = 1
      ORDER BY parent_id ASC, sort ASC
    `);

    console.log('📊 权限表总览:');
    console.log('================');
    console.log(`总权限数量: ${allPermissions.length}`);

    // 筛选包含"中心"的权限
    const centerPermissions = allPermissions.filter(p =>
      (p.name && p.name.includes('中心')) ||
      (p.chinese_name && p.chinese_name.includes('中心')) ||
      (p.description && p.description.includes('中心'))
    );

    console.log(`中心相关权限: ${centerPermissions.length}\n`);

    // 分析顶级中心（parent_id为null或0）
    const topLevelCenters = centerPermissions.filter(p => !p.parent_id || p.parent_id === 0);
    const childCenters = centerPermissions.filter(p => p.parent_id && p.parent_id !== 0);

    console.log('📁 顶级中心 (一级菜单):');
    console.log('========================');
    console.log(`数量: ${topLevelCenters.length}`);

    const allChildren = [];

    for (let i = 0; i < topLevelCenters.length; i++) {
      const center = topLevelCenters[i];
      console.log(`\n${i + 1}. ${center.chinese_name || center.name}`);
      console.log(`   路径: ${center.path || '无路径'}`);
      console.log(`   图标: ${center.icon || '无图标'}`);
      console.log(`   排序: ${center.sort}`);
      console.log(`   ID: ${center.id}`);

      // 查找该中心的直接子页面
      const children = allPermissions.filter(p => p.parent_id === center.id);

      if (children.length > 0) {
        console.log(`   子页面 (${children.length}个):`);
        children.forEach((child, index) => {
          console.log(`     ${index + 1}. ${child.chinese_name || child.name} (${child.path})`);
          allChildren.push(child);
        });
      } else {
        console.log('   (无子页面)');
      }
    }

    console.log('\n📄 子级中心 (二级菜单):');
    console.log('========================');
    console.log(`数量: ${childCenters.length}`);

    if (childCenters.length > 0) {
      for (let i = 0; i < childCenters.length; i++) {
        const center = childCenters[i];
        console.log(`${i + 1}. ${center.chinese_name || center.name}`);
        console.log(`   路径: ${center.path}`);
        console.log(`   父级ID: ${center.parent_id}`);
        console.log(`   ID: ${center.id}`);
      }
    } else {
      console.log('(无子级中心)');
    }

    // 分类统计
    console.log('\n📈 中心分类统计:');
    console.log('==================');

    const categories = {};

    centerPermissions.forEach(center => {
      const name = (center.chinese_name || center.name || '');
      let category = '其他';

      if (name.includes('招生') || name.includes('Enroll')) {
        category = '招生相关';
      } else if (name.includes('学生') || name.includes('Student')) {
        category = '学生相关';
      } else if (name.includes('教师') || name.includes('Teacher')) {
        category = '教师相关';
      } else if (name.includes('家长') || name.includes('Parent')) {
        category = '家长相关';
      } else if (name.includes('课程') || name.includes('Course') || name.includes('Curriculum')) {
        category = '课程相关';
      } else if (name.includes('活动') || name.includes('Activity')) {
        category = '活动相关';
      } else if (name.includes('财务') || name.includes('Finance') || name.includes('Payment')) {
        category = '财务相关';
      } else if (name.includes('系统') || name.includes('System') || name.includes('设置') || name.includes('Setting')) {
        category = '系统相关';
      } else if (name.includes('报表') || name.includes('Report') || name.includes('Dashboard')) {
        category = '报表相关';
      } else if (name.includes('营销') || name.includes('Marketing') || name.includes('广告')) {
        category = '营销相关';
      } else if (name.includes('AI') || name.includes('智能')) {
        category = 'AI相关';
      }

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(center);
    });

    Object.keys(categories).forEach(category => {
      console.log(`\n🏷️  ${category} (${categories[category].length}个):`);
      categories[category].forEach(center => {
        console.log(`   - ${center.chinese_name || center.name}`);
      });
    });

    // 生成建议
    console.log('\n💡 优化建议:');
    console.log('=============');

    console.log('\n🎯 建议保留的核心业务中心 (8个):');
    const recommendedCore = [
      '招生中心', '学生中心', '教师中心', '家长中心',
      '活动中心', '财务中心', '课程中心', '报表中心'
    ];

    recommendedCore.forEach(name => {
      const exists = centerPermissions.find(c =>
        (c.chinese_name || c.name) === name
      );
      console.log(`   ${exists ? '✅' : '➕'} ${name}`);
    });

    console.log('\n🔧 建议的支撑功能中心 (3个):');
    const recommendedSupport = [
      '系统中心', 'AI中心', '营销中心'
    ];

    recommendedSupport.forEach(name => {
      const exists = centerPermissions.find(c =>
        (c.chinese_name || c.name).includes(name.replace('中心', ''))
      );
      console.log(`   ${exists ? '✅' : '➕'} ${name}`);
    });

    console.log('\n🎨 理想的中心结构:');
    console.log('==================');
    console.log('📊 仪表板');
    console.log('├── 🎓 招生中心 (招生计划 → 申请管理 → 面试安排 → 录取通知)');
    console.log('├── 👥 学生中心 (学生档案 → 班级管理 → 考勤管理 → 成绩管理)');
    console.log('├── 👨‍🏫 教师中心 (教师档案 → 课程安排 → 教学评估)');
    console.log('├── 👨‍👩 家长中心 (家长信息 → 联系记录 → 反馈管理)');
    console.log('├── 📚 课程中心 (课程设置 → 教学计划 → 资源管理)');
    console.log('├── 🎯 活动中心 (活动计划 → 报名管理 → 照片管理)');
    console.log('├── 💰 财务中心 (收费管理 → 费用设置 → 财务报表)');
    console.log('├── 📈 报表中心 (各类统计报表 → 数据分析)');
    console.log('├── ⚙️ 系统中心 (用户管理 → 权限设置 → 系统配置)');
    console.log('└── 🤖 AI中心 (智能问答 → 数据分析 → 自动化工具)');

    // 问题检测
    console.log('\n🔍 检测到的问题:');
    console.log('==================');

    if (topLevelCenters.length > 12) {
      console.log(`⚠️  顶级中心过多 (${topLevelCenters.length}个)，建议减少到8-10个`);
    }

    if (topLevelCenters.length < 6) {
      console.log(`⚠️  顶级中心过少 (${topLevelCenters.length}个)，建议增加到8-10个`);
    }

    // 检查是否有重复或相似的名称
    const nameMap = {};
    centerPermissions.forEach(center => {
      const name = (center.chinese_name || center.name).trim();
      if (nameMap[name]) {
        console.log(`⚠️  发现重复或相似名称: ${name}`);
      }
      nameMap[name] = true;
    });

    console.log('\n📋 总结:');
    console.log('=========');
    console.log(`✅ 当前顶级中心: ${topLevelCenters.length}个`);
    console.log(`✅ 当前子级中心: ${childCenters.length}个`);
    console.log(`✅ 建议优化后: 8个核心中心 + 3个支撑中心`);
    console.log(`✅ 这样可以大幅简化侧边栏，提升用户体验`);

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await sequelize.close();
  }
}

simpleCenterAnalysis();