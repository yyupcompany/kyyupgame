/**
 * 修复待办事项的userId，确保与admin用户ID匹配
 * 用于解决待办事项显示为0的问题
 */

import { Sequelize, QueryTypes } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'kindergarten',
  logging: false,
  timezone: '+08:00',
});

async function fixTodoUserId() {
  try {
    console.log('🔧 开始修复待办事项的userId...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 查找admin用户
    const [adminUsers] = await sequelize.query(`
      SELECT id, username, email FROM users WHERE username = 'admin' LIMIT 1
    `, { type: QueryTypes.SELECT });

    if (!adminUsers || !(adminUsers as any).id) {
      console.error('❌ 未找到admin用户，请先创建admin用户');
      process.exit(1);
    }

    const adminUserId = (adminUsers as any).id;
    console.log(`✅ 找到admin用户，ID: ${adminUserId}, username: ${(adminUsers as any).username}`);

    // 2. 查询所有待办事项
    const [allTodos] = await sequelize.query(`
      SELECT id, title, user_id, status FROM todos WHERE deleted_at IS NULL
    `, { type: QueryTypes.SELECT });

    const todos = allTodos as any[];
    console.log(`📋 找到 ${todos.length} 条待办事项`);

    if (todos.length === 0) {
      console.log('⚠️  没有待办事项需要修复');
      process.exit(0);
    }

    // 3. 统计需要修复的待办事项
    const todosToFix = todos.filter(t => t.user_id !== adminUserId);
    console.log(`🔍 需要修复的待办事项: ${todosToFix.length} 条`);

    if (todosToFix.length === 0) {
      console.log('✅ 所有待办事项的userId都已正确，无需修复');
      process.exit(0);
    }

    // 4. 显示需要修复的待办事项
    console.log('\n📝 需要修复的待办事项列表:');
    todosToFix.forEach((todo, index) => {
      console.log(`  ${index + 1}. ID: ${todo.id}, 标题: ${todo.title}, 当前userId: ${todo.user_id} -> 应改为: ${adminUserId}`);
    });

    // 5. 更新所有待办事项的userId为admin用户ID
    const [updateResult] = await sequelize.query(`
      UPDATE todos 
      SET user_id = ?, updated_at = NOW()
      WHERE user_id != ? AND deleted_at IS NULL
    `, {
      replacements: [adminUserId, adminUserId],
      type: QueryTypes.UPDATE
    });

    console.log(`\n✅ 成功修复 ${todosToFix.length} 条待办事项的userId`);

    // 6. 验证修复结果
    const [verifyTodos] = await sequelize.query(`
      SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND deleted_at IS NULL
    `, {
      replacements: [adminUserId],
      type: QueryTypes.SELECT
    });

    console.log(`\n✅ 验证结果: admin用户现在有 ${(verifyTodos as any).count} 条待办事项`);

    console.log('\n🎉 修复完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    process.exit(1);
  }
}

fixTodoUserId();





