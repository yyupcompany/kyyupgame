/**
 * 为 dashboard 添加 todo 种子数据
 * 用于测试 dashboard 的待办事项功能
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

async function seedDashboardTodos() {
  try {
    console.log('🚀 开始为 dashboard 添加 todo 种子数据...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 获取第一个用户（通常是管理员）
    const [users] = await sequelize.query(`
      SELECT id FROM users LIMIT 1
    `, { type: QueryTypes.SELECT });

    if (!users || (users as any[]).length === 0) {
      console.error('❌ 没有找到用户，请先创建用户');
      process.exit(1);
    }

    const userId = (users as any).id;
    console.log(`📝 为用户 ID: ${userId} 添加待办事项...`);

    // 检查是否已有 todo 数据
    const [existingCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM todos WHERE user_id = ?
    `, { replacements: [userId], type: QueryTypes.SELECT });

    if ((existingCount as any).count > 0) {
      console.log(`⚠️  用户已有 ${(existingCount as any).count} 条待办事项，跳过添加`);
      process.exit(0);
    }

    // 创建待办事项数据
    const todos = [
      {
        title: '审核新入园申请',
        description: '审核本周收到的新入园申请材料，需要检查证件完整性',
        priority: 2,
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        userId,
        notify: true,
        notifyTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        tags: JSON.stringify(['入园审核', '高优先级'])
      },
      {
        title: '制定暑期计划',
        description: '制定暑期托管班的详细安排和课程表',
        priority: 3,
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        userId,
        notify: true,
        notifyTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        tags: JSON.stringify(['暑期计划', '课程安排'])
      },
      {
        title: '采购教学用品',
        description: '为新学期采购必要的教学用品和玩具',
        priority: 3,
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId,
        notify: false,
        tags: JSON.stringify(['采购', '教学用品'])
      },
      {
        title: '准备家长会议',
        description: '准备下周的家长会议资料和演讲稿',
        priority: 2,
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId,
        notify: true,
        notifyTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        tags: JSON.stringify(['家长会', '重要'])
      },
      {
        title: '更新班级环境布置',
        description: '更新主题墙内容，展示幼儿作品',
        priority: 4,
        status: 'pending',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        userId,
        notify: false,
        tags: JSON.stringify(['环境布置', '班级'])
      }
    ];

    // 批量插入待办事项
    for (const todo of todos) {
      await sequelize.query(`
        INSERT INTO todos (title, description, priority, status, due_date, user_id, notify, notify_time, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          todo.title, todo.description, todo.priority, todo.status,
          todo.dueDate, todo.userId, todo.notify, todo.notifyTime, todo.tags
        ]
      });
    }

    console.log(`✅ 成功添加 ${todos.length} 条待办事项`);
    console.log('\n📋 添加的待办事项：');
    todos.forEach((todo, index) => {
      console.log(`  ${index + 1}. ${todo.title} (${todo.status})`);
    });

    console.log('\n🎉 dashboard todo 种子数据添加完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加种子数据时发生错误:', error);
    process.exit(1);
  }
}

seedDashboardTodos();

