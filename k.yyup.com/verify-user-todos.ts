/**
 * 验证用户ID和待办事项匹配情况
 */

import { Sequelize, QueryTypes } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  database: process.env.DB_NAME || 'kargerdensales',
  logging: true,
  timezone: '+08:00',
  // 添加SSL配置
  dialectOptions: {
    ssl: {
      require: false,
      rejectUnauthorized: false
    }
  }
});

async function verifyUserTodos() {
  try {
    console.log('🔍 开始验证用户ID和待办事项匹配情况...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 查询admin用户的详细信息
    const [adminUser] = await sequelize.query(`
      SELECT id, username, realName, role, isAdmin FROM users WHERE username = 'admin'
    `, { type: QueryTypes.SELECT });

    console.log('👤 Admin用户信息:', adminUser);

    if (!adminUser) {
      console.error('❌ 没有找到admin用户');
      return;
    }

    const adminUserId = (adminUser as any).id;
    console.log(`📋 Admin用户ID: ${adminUserId}`);

    // 2. 查询该用户的待办事项总数
    const [totalCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM todos WHERE user_id = ?
    `, { replacements: [adminUserId], type: QueryTypes.SELECT });

    console.log(`📊 用户 ${adminUserId} 的待办事项总数:`, (totalCount as any).total);

    // 3. 查询待办事项详情（前5条）
    const [todos] = await sequelize.query(`
      SELECT id, title, status, priority, due_date, created_at FROM todos
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, { replacements: [adminUserId], type: QueryTypes.SELECT });

    console.log('📝 前5条待办事项:');
    if (Array.isArray(todos)) {
      (todos as any[]).forEach((todo, index) => {
        console.log(`  ${index + 1}. ${todo.title} - 状态: ${todo.status} - 优先级: ${todo.priority}`);
      });
    } else {
      console.log('  查询结果格式异常:', todos);
    }

    // 4. 按状态统计
    const [statusStats] = await sequelize.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM todos
      WHERE user_id = ?
      GROUP BY status
    `, { replacements: [adminUserId], type: QueryTypes.SELECT });

    console.log('📈 状态统计:');
    (statusStats as any[]).forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count} 条`);
    });

    // 5. 检查是否有其他用户的数据
    const [allUsersTodoCount] = await sequelize.query(`
      SELECT
        u.username,
        u.id as user_id,
        COUNT(t.id) as todo_count
      FROM users u
      LEFT JOIN todos t ON u.id = t.user_id
      GROUP BY u.id, u.username
      ORDER BY todo_count DESC
    `, { type: QueryTypes.SELECT });

    console.log('👥 所有用户的待办事项统计:');
    (allUsersTodoCount as any[]).forEach(userStat => {
      console.log(`  ${userStat.username} (ID: ${userStat.user_id}): ${userStat.todo_count} 条待办事项`);
    });

    console.log('\n✅ 验证完成！');
    return {
      adminUserId,
      totalTodos: (totalCount as any).total,
      todos: todos as any[],
      statusStats: statusStats as any[],
      allUsersStats: allUsersTodoCount as any[]
    };

  } catch (error) {
    console.error('❌ 验证失败:', error);
    throw error;
  }
}

// 运行验证
verifyUserTodos()
  .then((result) => {
    console.log('\n🎯 验证结果总结:');
    console.log('- Admin用户ID:', result.adminUserId);
    console.log('- 总待办事项:', result.totalTodos);
    console.log('- 状态统计:', result.statusStats.length, '种状态');
    console.log('- 所有用户:', result.allUsersStats.length, '个用户');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 验证过程出错:', error);
    process.exit(1);
  });