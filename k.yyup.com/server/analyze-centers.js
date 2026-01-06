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

async function analyzeCenters() {
  try {
    console.log('🔍 分析数据库中的中心内容...\n');

    // 查询所有包含"中心"的权限
    const [centers] = await sequelize.query(`
      SELECT id, name, chinese_name, path, icon, parent_id, sort, description
      FROM permissions
      WHERE status = 1
      AND (name LIKE '%中心%' OR chinese_name LIKE '%中心%' OR description LIKE '%中心%')
      ORDER BY sort
    `);

    console.log('🏢 权限表中的中心内容:');
    console.log('=====================');
    console.log(`总共找到 ${centers.length} 个中心相关权限\n`);

    // 分析顶级中心
    const topLevelCenters = centers.filter(c => !c.parent_id || c.parent_id === 0);
    console.log('📊 顶级中心 (一级菜单):');
    console.log('========================');
    topLevelCenters.forEach(center => {
      console.log(`📁 ${center.chinese_name || center.name}`);
      console.log(`   路径: ${center.path}`);
      console.log(`   图标: ${center.icon}`);
      console.log(`   描述: ${center.description || '无描述'}`);
      console.log(`   排序: ${center.sort}`);

      // 查找子页面
      const [children] = await sequelize.query(`
        SELECT id, name, chinese_name, path, icon, sort, description
        FROM permissions
        WHERE parent_id = ${center.id} AND status = 1
        ORDER BY sort
      `);

      if (children.length > 0) {
        console.log(`   子页面 (${children.length}个):`);
        for (const child of children) {
          console.log(`     - ${child.chinese_name || child.name} (${child.path})`);
          if (child.description) {
            console.log(`       描述: ${child.description}`);
          }
        }
      } else {
        console.log('   (无子页面)');
      }
      console.log('---');
    });

    // 分析子级中心
    const childCenters = centers.filter(c => c.parent_id && c.parent_id !== 0);
    if (childCenters.length > 0) {
      console.log('\n📋 子级中心 (二级菜单):');
      console.log('========================');
      childCenters.forEach(center => {
        console.log(`📄 ${center.chinese_name || center.name}`);
        console.log(`   路径: ${center.path}`);
        console.log(`   父级ID: ${center.parent_id}`);
        console.log(`   描述: ${center.description || '无描述'}`);
        console.log('---');
      });
    }

    // 统计各类中心
    console.log('\n📈 中心分类统计:');
    console.log('==================');

    const categories = {
      '招生相关': [],
      '学生相关': [],
      '教师相关': [],
      '家长相关': [],
      '课程相关': [],
      '活动相关': [],
      '财务相关': [],
      '系统相关': [],
      '报表相关': [],
      '营销相关': [],
      '其他': []
    };

    centers.forEach(center => {
      const name = (center.chinese_name || center.name).toLowerCase();
      if (name.includes('招生') || name.includes('enroll')) {
        categories['招生相关'].push(center);
      } else if (name.includes('学生') || name.includes('student')) {
        categories['学生相关'].push(center);
      } else if (name.includes('教师') || name.includes('teacher')) {
        categories['教师相关'].push(center);
      } else if (name.includes('家长') || name.includes('parent')) {
        categories['家长相关'].push(center);
      } else if (name.includes('课程') || name.includes('course') || name.includes('curriculum')) {
        categories['课程相关'].push(center);
      } else if (name.includes('活动') || name.includes('activity')) {
        categories['活动相关'].push(center);
      } else if (name.includes('财务') || name.includes('finance') || name.includes('payment')) {
        categories['财务相关'].push(center);
      } else if (name.includes('系统') || name.includes('system') || name.includes('设置') || name.includes('setting')) {
        categories['系统相关'].push(center);
      } else if (name.includes('报表') || name.includes('report') || name.includes('dashboard')) {
        categories['报表相关'].push(center);
      } else if (name.includes('营销') || name.includes('marketing') || name.includes('广告')) {
        categories['营销相关'].push(center);
      } else {
        categories['其他'].push(center);
      }
    });

    Object.keys(categories).forEach(category => {
      if (categories[category].length > 0) {
        console.log(`\n🏷️  ${category} (${categories[category].length}个):`);
        categories[category].forEach(center => {
          console.log(`   - ${center.chinese_name || center.name}`);
        });
      }
    });

    // 查询所有权限统计
    const [totalPermissions] = await sequelize.query(`
      SELECT COUNT(*) as total FROM permissions WHERE status = 1
    `);

    console.log('\n📊 总体统计:');
    console.log('=============');
    console.log(`中心相关权限: ${centers.length} 个`);
    console.log(`总权限数量: ${totalPermissions[0].total} 个`);
    console.log(`中心占比: ${((centers.length / totalPermissions[0].total) * 100).toFixed(1)}%`);

    // 生成优化建议
    console.log('\n💡 优化建议:');
    console.log('=============');

    console.log('\n🎯 建议的核心业务中心 (保留并优化):');
    const coreCenters = [
      { name: '招生中心', desc: '招生计划、申请管理、面试安排、录取通知' },
      { name: '学生中心', desc: '学生档案、班级管理、考勤、成绩' },
      { name: '教师中心', desc: '教师档案、课程安排、教学评估' },
      { name: '家长中心', desc: '家长信息、联系记录、反馈管理' },
      { name: '活动中心', desc: '活动计划、报名、评估、照片管理' },
      { name: '财务中心', desc: '收费管理、费用设置、发票、报表' }
    ];

    coreCenters.forEach(center => {
      const exists = centers.find(c =>
        (c.chinese_name || c.name).includes(center.name)
      );
      console.log(`   ${exists ? '✅' : '➕'} ${center.name} - ${center.desc}`);
    });

    console.log('\n🔧 建议的支撑功能中心 (可以整合):');
    const supportCenters = [
      { name: '系统中心', desc: '用户管理、角色权限、系统设置、日志' },
      { name: '报表中心', desc: '各类统计报表、数据分析、图表展示' },
      { name: 'AI中心', desc: '智能问答、数据分析、自动化工具' }
    ];

    supportCenters.forEach(center => {
      const exists = centers.find(c =>
        (c.chinese_name || c.name).includes(center.name)
      );
      console.log(`   ${exists ? '✅' : '➕'} ${center.name} - ${center.desc}`);
    });

    console.log('\n🎨 理想的中心层级结构:');
    console.log('=======================');
    console.log('📊 仪表板 (Dashboard)');
    console.log('├── 🎓 招生中心');
    console.log('│   ├── 招生计划管理');
    console.log('│   ├── 申请管理');
    console.log('│   ├── 面试安排');
    console.log('│   └── 录取通知');
    console.log('├── 👥 学生中心');
    console.log('│   ├── 学生档案');
    console.log('│   ├── 班级管理');
    console.log('│   ├── 考勤管理');
    console.log('│   └── 成绩管理');
    console.log('├── 👨‍🏫 教师中心');
    console.log('│   ├── 教师档案');
    console.log('│   ├── 课程安排');
    console.log('│   ├── 教学评估');
    console.log('│   └── 考勤记录');
    console.log('├── 👨‍👩 家长中心');
    console.log('│   ├── 家长信息');
    console.log('│   ├── 联系记录');
    console.log('│   ├── 反馈管理');
    console.log('│   └── 沟通记录');
    console.log('├── 🎯 活动中心');
    console.log('│   ├── 活动计划');
    console.log('│   ├── 活动报名');
    console.log('│   ├── 活动评估');
    console.log('│   └── 照片管理');
    console.log('├── 💰 财务中心');
    console.log('│   ├── 收费管理');
    console.log('│   ├── 费用设置');
    console.log('│   ├── 发票管理');
    console.log('│   └── 财务报表');
    console.log('├── 📈 报表中心');
    console.log('│   ├── 招生报表');
    console.log('│   ├── 财务报表');
    console.log('│   ├── 学生报表');
    console.log('│   └── 教师报表');
    console.log('├── ⚙️ 系统中心');
    console.log('│   ├── 用户管理');
    console.log('│   ├── 角色权限');
    console.log('│   ├── 系统设置');
    console.log('│   └── 日志管理');
    console.log('└── 🤖 AI中心');
    console.log('    ├── 智能问答');
    console.log('    ├── 数据分析');
    console.log('    ├── 智能推荐');
    console.log('    └── 自动化工具');

    console.log('\n🔍 发现的问题:');
    console.log('=============');
    if (topLevelCenters.length > 10) {
      console.log('⚠️  顶级中心过多，建议整合减少到8-10个核心中心');
    }
    if (childCenters.length > 30) {
      console.log('⚠️  子页面过多，建议优化层级结构');
    }

    const duplicateNames = [];
    centers.forEach(center => {
      const name = center.chinese_name || center.name;
      if (duplicateNames.includes(name)) {
        console.log(`⚠️  发现重复名称: ${name}`);
      } else {
        duplicateNames.push(name);
      }
    });

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

analyzeCenters();