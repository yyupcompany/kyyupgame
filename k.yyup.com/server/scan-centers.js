const { Sequelize } = require('sequelize');
require('dotenv').config();

// 数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function scanCenters() {
  try {
    console.log('🔍 扫描数据库中的中心内容...\n');

    // 查询所有动态权限
    const [permissions] = await sequelize.query(`
      SELECT
        id,
        name,
        description,
        category,
        path,
        icon,
        parent_id,
        sort_order,
        is_active
      FROM permissions
      WHERE is_active = 1
      AND (name LIKE '%中心%' OR path LIKE '%center%' OR description LIKE '%中心%')
      ORDER BY category, sort_order
    `);

    // 查询所有路由
    const [routes] = await sequelize.query(`
      SELECT
        id,
        name,
        path,
        component_path,
        parent_id,
        icon,
        sort_order,
        is_active
      FROM dynamic_routes
      WHERE is_active = 1
      AND (name LIKE '%中心%' OR path LIKE '%center%' OR component_path LIKE '%center%')
      ORDER BY sort_order
    `);

    console.log('📋 权限中心内容分析:');
    console.log('========================');

    // 按类别分组
    const centerCategories = {};

    permissions.forEach(perm => {
      if (perm.name.includes('中心') || perm.description.includes('中心')) {
        const category = perm.category || '未分类';
        if (!centerCategories[category]) {
          centerCategories[category] = {
            permissions: [],
            routes: []
          };
        }
        centerCategories[category].permissions.push(perm);
      }
    });

    routes.forEach(route => {
      if (route.name.includes('中心') || route.path.includes('center')) {
        // 找到对应的权限类别
        const matchingPerm = permissions.find(p =>
          p.path && route.path.includes(p.path.replace('/api/', ''))
        );

        const category = matchingPerm ? matchingPerm.category : '未分类';
        if (!centerCategories[category]) {
          centerCategories[category] = {
            permissions: [],
            routes: []
          };
        }
        centerCategories[category].routes.push(route);
      }
    });

    // 输出分析结果
    Object.keys(centerCategories).sort().forEach(category => {
      const data = centerCategories[category];
      console.log(`\n🏢 ${category}类中心:`);
      console.log(`   权限数量: ${data.permissions.length}`);
      console.log(`   路由数量: ${data.routes.length}`);

      console.log('   📋 具体中心:');
      data.permissions.forEach(perm => {
        console.log(`     - ${perm.name} (${perm.path || '无路径'})`);
      });
    });

    // 查询所有页面和子页面关系
    console.log('\n\n📄 页面层级关系分析:');
    console.log('====================');

    const [pages] = await sequelize.query(`
      SELECT
        p1.name as parent_name,
        p1.path as parent_path,
        p2.name as child_name,
        p2.path as child_path,
        p2.description as child_description
      FROM dynamic_routes p1
      LEFT JOIN dynamic_routes p2 ON p1.id = p2.parent_id
      WHERE p1.is_active = 1
        AND p2.is_active = 1
        AND (p1.name LIKE '%中心%' OR p2.name LIKE '%中心%')
      ORDER BY p1.sort_order, p2.sort_order
    `);

    const parentPages = {};
    pages.forEach(page => {
      if (!parentPages[page.parent_name]) {
        parentPages[page.parent_name] = {
          path: page.parent_path,
          children: []
        };
      }
      if (page.child_name) {
        parentPages[page.parent_name].children.push({
          name: page.child_name,
          path: page.child_path,
          description: page.child_description
        });
      }
    });

    Object.keys(parentPages).forEach(parentName => {
      const parent = parentPages[parentName];
      console.log(`\n📁 ${parentName} (${parent.path})`);
      if (parent.children.length > 0) {
        console.log('   子页面:');
        parent.children.forEach(child => {
          console.log(`     - ${child.name} (${child.path})`);
        });
      } else {
        console.log('   (无子页面)');
      }
    });

    // 统计分析
    console.log('\n\n📊 统计分析:');
    console.log('============');
    console.log(`总权限数量: ${permissions.length}`);
    console.log(`总路由数量: ${routes.length}`);
    console.log(`涉及中心类别: ${Object.keys(centerCategories).length} 个`);

    // 建议分类
    console.log('\n\n💡 分类建议:');
    console.log('============');

    // 主要业务中心
    const mainBusinessCenters = [
      '招生中心', '学生中心', '教师中心', '家长中心',
      '课程中心', '财务中心', '活动中心'
    ];

    // 支撑功能中心
    const supportCenters = [
      '系统中心', '报表中心', '监控中心', '数据中心',
      '设置中心', '工具中心', '通知中心'
    ];

    // 扩展功能中心
    const extensionCenters = [
      '营销中心', '客服中心', '分析中心', '智能中心',
      'AI中心', '开发中心', '测试中心'
    ];

    console.log('\n🎯 主要业务中心 (应该保留并优化):');
    mainBusinessCenters.forEach(center => {
      const found = permissions.find(p => p.name.includes(center));
      if (found) {
        console.log(`   ✅ ${center} - 已存在`);
      } else {
        console.log(`   ➕ ${center} - 建议添加`);
      }
    });

    console.log('\n🔧 支撑功能中心 (可以整合):');
    supportCenters.forEach(center => {
      const found = permissions.find(p => p.name.includes(center));
      if (found) {
        console.log(`   ✅ ${center} - 已存在`);
      } else {
        console.log(`   ➕ ${center} - 建议添加`);
      }
    });

    console.log('\n🚀 扩展功能中心 (可选增强):');
    extensionCenters.forEach(center => {
      const found = permissions.find(p => p.name.includes(center));
      if (found) {
        console.log(`   ✅ ${center} - 已存在`);
      } else {
        console.log(`   ➕ ${center} - 建议添加`);
      }
    });

    console.log('\n🎨 层级结构建议:');
    console.log('================');
    console.log('📊 仪表板 (Dashboard)');
    console.log('├── 🎓 招生中心 (Enrollment)');
    console.log('│   ├── 招生计划');
    console.log('│   ├── 申请管理');
    console.log('│   ├── 面试安排');
    console.log('│   └── 录取通知');
    console.log('├── 👥 学生中心 (Students)');
    console.log('│   ├── 学生档案');
    console.log('│   ├── 班级管理');
    console.log('│   ├── 考勤管理');
    console.log('│   └── 成绩管理');
    console.log('├── 👨‍🏫 教师中心 (Teachers)');
    console.log('│   ├── 教师档案');
    console.log('│   ├── 课程安排');
    console.log('│   ├── 教学评估');
    console.log('│   └── 考勤记录');
    console.log('├── 👨‍👩 家长中心 (Parents)');
    console.log('│   ├── 家长信息');
    console.log('│   ├── 联系记录');
    console.log('│   ├── 反馈管理');
    console.log('│   └── 沟通记录');
    console.log('├── 📚 课程中心 (Curriculum)');
    console.log('│   ├── 课程设置');
    console.log('│   ├── 教学计划');
    console.log('│   ├── 课程评估');
    console.log('│   └── 资源管理');
    console.log('├── 🎯 活动中心 (Activities)');
    console.log('│   ├── 活动计划');
    console.log('│   ├── 活动报名');
    console.log('│   ├── 活动评估');
    console.log('│   └── 照片管理');
    console.log('├── 💰 财务中心 (Finance)');
    console.log('│   ├── 收费管理');
    console.log('│   ├── 费用设置');
    console.log('│   ├── 发票管理');
    console.log('│   └── 财务报表');
    console.log('├── 📈 报表中心 (Reports)');
    console.log('│   ├── 招生报表');
    console.log('│   ├── 财务报表');
    console.log('│   ├── 学生报表');
    console.log('│   └── 教师报表');
    console.log('├── ⚙️ 系统中心 (System)');
    console.log('│   ├── 用户管理');
    console.log('│   ├── 角色权限');
    console.log('│   ├── 系统设置');
    console.log('│   └── 日志管理');
    console.log('└── 🤖 AI中心 (AI Assistant)');
    console.log('    ├── 智能问答');
    console.log('    ├── 数据分析');
    console.log('    ├── 智能推荐');
    console.log('    └── 自动化工具');

  } catch (error) {
    console.error('❌ 扫描失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

scanCenters();