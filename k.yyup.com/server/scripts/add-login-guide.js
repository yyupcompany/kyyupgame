const mysql = require('mysql2/promise');

async function addLoginPageGuide() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'kindergarten_management'
    });

    console.log('✅ 数据库连接成功');

    // 检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'page_guides'"
    );

    if (tables.length === 0) {
      console.log('❌ page_guides 表不存在，请先运行数据库迁移');
      return;
    }

    console.log('✅ page_guides 表存在');

    // 插入登录页面说明文档
    const loginPageGuide = {
      page_path: '/login',
      page_name: '用户登录',
      page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户登录页面，这是进入系统的安全入口。请使用您的账号和密码登录，系统支持多种用户角色（园长、教师、招生专员等），登录后您将根据权限访问相应的功能模块，开始您的智能招生管理之旅。',
      category: '认证页面',
      importance: 9,
      related_tables: JSON.stringify(['users', 'user_sessions', 'login_logs']),
      context_prompt: '用户正在登录页面，准备进入系统。用户可能需要了解登录流程、忘记密码处理、账号权限说明等。请提供友好的登录指导。',
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    // 插入注册页面说明文档
    const registerPageGuide = {
      page_path: '/register',
      page_name: '用户注册',
      page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户注册页面，这是创建新账户的地方。请填写准确的个人信息和联系方式，选择合适的用户角色，我们将为您创建专属账户，让您快速开始使用我们的智能招生管理功能。',
      category: '认证页面',
      importance: 8,
      related_tables: JSON.stringify(['users', 'user_profiles', 'registration_logs']),
      context_prompt: '用户正在注册页面，准备创建新账户。用户可能需要了解注册流程、角色权限、信息填写要求等。请提供详细的注册指导。',
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    // 使用 REPLACE INTO 来插入或更新数据
    const insertSql = `
      REPLACE INTO page_guides (
        page_path, page_name, page_description, category, importance, 
        related_tables, context_prompt, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    console.log('📝 插入登录页面说明文档...');
    await connection.execute(insertSql, [
      loginPageGuide.page_path,
      loginPageGuide.page_name,
      loginPageGuide.page_description,
      loginPageGuide.category,
      loginPageGuide.importance,
      loginPageGuide.related_tables,
      loginPageGuide.context_prompt,
      loginPageGuide.is_active,
      loginPageGuide.created_at,
      loginPageGuide.updated_at
    ]);

    console.log('📝 插入注册页面说明文档...');
    await connection.execute(insertSql, [
      registerPageGuide.page_path,
      registerPageGuide.page_name,
      registerPageGuide.page_description,
      registerPageGuide.category,
      registerPageGuide.importance,
      registerPageGuide.related_tables,
      registerPageGuide.context_prompt,
      registerPageGuide.is_active,
      registerPageGuide.created_at,
      registerPageGuide.updated_at
    ]);

    // 查询确认
    console.log('🔍 查询确认数据...');
    const [results] = await connection.execute(
      "SELECT page_path, page_name, category FROM page_guides WHERE page_path IN ('/login', '/register')"
    );

    console.log('✅ 插入的页面说明文档:');
    results.forEach(row => {
      console.log(`  - ${row.page_path}: ${row.page_name} (${row.category})`);
    });

    console.log('✅ 登录页面说明文档添加完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 数据库连接已关闭');
    }
  }
}

// 执行脚本
addLoginPageGuide();
