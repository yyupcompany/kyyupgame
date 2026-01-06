const mysql = require('mysql2/promise');
require('dotenv').config();

async function initRemotePageGuides() {
  let connection;
  
  try {
    console.log('🔗 连接远程数据库...');
    console.log('数据库配置:');
    console.log('- Host:', process.env.DB_HOST);
    console.log('- Port:', process.env.DB_PORT);
    console.log('- Database:', process.env.DB_NAME);
    console.log('- User:', process.env.DB_USER);
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    });

    console.log('✅ 远程数据库连接成功');

    // 检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'page_guides'"
    );

    if (tables.length === 0) {
      console.log('❌ page_guides 表不存在，请先运行数据库迁移');
      return;
    }

    console.log('✅ page_guides 表存在');

    // 页面说明文档数据
    const pageGuides = [
      {
        page_path: '/login',
        page_name: '用户登录',
        page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户登录页面，这是进入系统的安全入口。请使用您的账号和密码登录，系统支持多种用户角色（园长、教师、招生专员等），登录后您将根据权限访问相应的功能模块，开始您的智能招生管理之旅。',
        category: '认证页面',
        importance: 9,
        related_tables: JSON.stringify(['users', 'user_sessions', 'login_logs']),
        context_prompt: '用户正在登录页面，准备进入系统。用户可能需要了解登录流程、忘记密码处理、账号权限说明等。请提供友好的登录指导。'
      },
      {
        page_path: '/register',
        page_name: '用户注册',
        page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户注册页面，这是创建新账户的地方。请填写准确的个人信息和联系方式，选择合适的用户角色，我们将为您创建专属账户，让您快速开始使用我们的智能招生管理功能。',
        category: '认证页面',
        importance: 8,
        related_tables: JSON.stringify(['users', 'user_profiles', 'registration_logs']),
        context_prompt: '用户正在注册页面，准备创建新账户。用户可能需要了解注册流程、角色权限、信息填写要求等。请提供详细的注册指导。'
      },
      {
        page_path: '/dashboard',
        page_name: '数据概览',
        page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是数据概览页面，这是系统的主仪表板，为您提供幼儿园运营的全局数据概览。在这里您可以查看关键指标、趋势分析、进行快速操作，全面掌握幼儿园的运营状况。',
        category: '仪表板',
        importance: 9,
        related_tables: JSON.stringify(['students', 'teachers', 'activities', 'enrollment_applications', 'classes']),
        context_prompt: '用户正在主仪表板页面，这里显示幼儿园的整体运营数据。用户可能需要了解总体情况、查看关键指标或进行快速操作。'
      },
      {
        page_path: '/centers/dashboard',
        page_name: '仪表板中心',
        page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        category: '中心页面',
        importance: 9,
        related_tables: JSON.stringify(['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics']),
        context_prompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。'
      },
      {
        page_path: '/centers/activity',
        page_name: '活动中心',
        page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是活动中心页面，这是招生环节非常重要的功能模块。我们为您提供全方位的活动管理解决方案，在这里您可以统一管理所有活动相关的功能，包括活动策划、活动发布、报名管理、签到统计、效果分析等，让每一场活动都能发挥最大的招生价值。',
        category: '中心页面',
        importance: 9,
        related_tables: JSON.stringify(['activities', 'activity_registrations', 'activity_templates', 'activity_evaluations', 'activity_checkins']),
        context_prompt: '用户正在活动中心页面，这是一个综合性的活动管理平台。用户可能需要查看活动数据、管理活动、分析活动效果等。请根据用户的具体问题，结合活动相关的数据库信息提供专业建议。'
      },
      {
        page_path: '/centers/enrollment',
        page_name: '招生中心',
        page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是招生中心页面，这是幼儿园招生工作的核心平台。在这里您可以管理招生计划、处理入园申请、提供咨询服务、分析招生数据，我们整合了招生全流程功能，为您提供一站式的智能招生解决方案，让招生工作更高效、更精准。',
        category: '中心页面',
        importance: 10,
        related_tables: JSON.stringify(['enrollment_plans', 'enrollment_applications', 'enrollment_consultations', 'enrollment_statistics']),
        context_prompt: '用户正在招生中心页面，这是招生工作的核心管理平台。用户可能需要查看招生数据、管理招生计划、处理申请等。请结合招生相关数据提供专业指导。'
      }
    ];

    console.log('📝 开始插入页面说明文档数据...');

    // 使用 REPLACE INTO 来插入或更新数据
    const insertSql = `
      REPLACE INTO page_guides (
        page_path, page_name, page_description, category, importance, 
        related_tables, context_prompt, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    for (const guide of pageGuides) {
      await connection.execute(insertSql, [
        guide.page_path,
        guide.page_name,
        guide.page_description,
        guide.category,
        guide.importance,
        guide.related_tables,
        guide.context_prompt,
        1 // is_active
      ]);
      console.log(`✅ 插入页面说明文档: ${guide.page_path} - ${guide.page_name}`);
    }

    // 查询确认
    console.log('🔍 查询确认数据...');
    const [results] = await connection.execute(
      "SELECT page_path, page_name, category, importance FROM page_guides ORDER BY category, importance DESC, page_path"
    );

    console.log('✅ 已插入的页面说明文档:');
    results.forEach(row => {
      console.log(`  - ${row.page_path}: ${row.page_name} (${row.category}, 重要性: ${row.importance})`);
    });

    console.log('✅ 远程页面说明文档初始化完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 数据库连接已关闭');
    }
  }
}

// 执行脚本
initRemotePageGuides();
