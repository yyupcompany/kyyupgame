/**
 * 为不同角色用户添加 todo 测试数据
 * 支持 admin 和 teacher 角色的待办事项创建
 */

import { Sequelize, QueryTypes } from 'sequelize';

// 使用正确的数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  database: process.env.DB_NAME || 'kargerdensales',
  logging: true,
  timezone: '+08:00',
});

async function seedMultiRoleTodos() {
  try {
    console.log('🚀 开始为不同角色添加 todo 种子数据...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 先确保用户存在，如果不存在则创建
    console.log('👤 检查并创建基础用户...');

    // 定义基础用户
    const targetUsers = [
      { username: 'admin', realName: '系统管理员', role: 'admin', password: '123456', isAdmin: 1 },
      { username: 'teacher', realName: '测试教师', role: 'teacher', password: '123456', isAdmin: 0 },
      { username: 'test_parent', realName: '测试家长', role: 'parent', password: '123456', isAdmin: 0 }
    ];

    const createdUsers = [];

    for (const userTemplate of targetUsers) {
      // 检查用户是否存在
      const [existingUser] = await sequelize.query(`
        SELECT id, username, realName, role, isAdmin FROM users WHERE username = ?
      `, { replacements: [userTemplate.username], type: QueryTypes.SELECT });

      if (existingUser) {
        console.log(`✅ 用户 ${userTemplate.username} 已存在`);
        createdUsers.push(existingUser);
      } else {
        console.log(`➕ 创建用户 ${userTemplate.username}...`);

        // 创建新用户
        const [insertResult] = await sequelize.query(`
          INSERT INTO users (username, password, realName, role, isAdmin, email, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, {
          replacements: [
            userTemplate.username,
            userTemplate.password, // 注意：实际生产环境应该使用加密密码
            userTemplate.realName,
            userTemplate.role,
            userTemplate.isAdmin,
            `${userTemplate.username}@kindergarten.com`,
            'active'
          ]
        });

        console.log(`✅ 成功创建用户 ${userTemplate.username}`);

        // 获取刚创建的用户信息
        const [newUser] = await sequelize.query(`
          SELECT id, username, realName, role, isAdmin FROM users WHERE username = ?
        `, { replacements: [userTemplate.username], type: QueryTypes.SELECT });

        createdUsers.push(newUser);
      }
    }

    const users = createdUsers;

    console.log(`📝 找到 ${(users as any[]).length} 个用户:`);
    (users as any[]).forEach(user => {
      console.log(`  - ${user.username} (${user.realName || user.username}) - ${user.role}`);
    });

    // 为不同角色定义待办事项模板
    const todoTemplates = {
      admin: [
        {
          title: '审批新教师入职申请',
          description: '审核人事部提交的新教师入职材料，包括资质证书和背景调查',
          priority: 1, // 高优先级
          status: 'pending',
          dueDays: 2,
          tags: ['人事管理', '重要审批']
        },
        {
          title: '制定下学期招生计划',
          description: '根据今年招生情况和市场分析，制定下学期的招生目标和策略',
          priority: 2,
          status: 'in_progress',
          dueDays: 7,
          tags: ['招生规划', '学期计划']
        },
        {
          title: '检查园区安全设施',
          description: '全面检查消防设施、监控设备和户外玩具的安全性',
          priority: 1,
          status: 'pending',
          dueDays: 3,
          tags: ['安全管理', '园区检查']
        },
        {
          title: '筹备家长开放日活动',
          description: '组织本月的家长开放日活动，准备展示材料和互动环节',
          priority: 3,
          status: 'pending',
          dueDays: 10,
          tags: ['家长活动', '开放日']
        },
        {
          title: '审核财务报表',
          description: '审核本月财务收支报表，确认预算执行情况',
          priority: 2,
          status: 'pending',
          dueDays: 5,
          tags: ['财务管理', '月度报表']
        }
      ],
      teacher: [
        {
          title: '准备下周课程计划',
          description: '根据教学大纲，准备下周各科目的详细课程计划和教具',
          priority: 2,
          status: 'pending',
          dueDays: 4,
          tags: ['教学计划', '课程准备']
        },
        {
          title: '更新学生成长档案',
          description: '记录本月学生的学习进展和行为表现，更新个人成长档案',
          priority: 3,
          status: 'in_progress',
          dueDays: 6,
          tags: ['学生管理', '成长记录']
        },
        {
          title: '组织班级主题活动',
          description: '策划并组织"春天的发现"主题活动，准备相关材料',
          priority: 3,
          status: 'pending',
          dueDays: 8,
          tags: ['班级活动', '主题活动']
        },
        {
          title: '与家长沟通学生情况',
          description: '与几位家长单独沟通学生近期表现和学习建议',
          priority: 2,
          status: 'pending',
          dueDays: 3,
          tags: ['家长沟通', '学生反馈']
        },
        {
          title: '整理教室环境布置',
          description: '根据春季主题更新教室环境布置，展示学生作品',
          priority: 4,
          status: 'pending',
          dueDays: 7,
          tags: ['环境布置', '教室管理']
        }
      ],
      test_parent: [
        {
          title: '参加家长会',
          description: '参加月底的家长会，了解孩子在校表现',
          priority: 2,
          status: 'pending',
          dueDays: 12,
          tags: ['家长会', '学校活动']
        },
        {
          title: '准备亲子运动会服装',
          description: '为下个月的亲子运动会准备运动服装和用品',
          priority: 3,
          status: 'pending',
          dueDays: 15,
          tags: ['亲子活动', '运动会']
        },
        {
          title: '阅读家庭教育书籍',
          description: '阅读老师推荐的家庭教育书籍，提升育儿知识',
          priority: 4,
          status: 'pending',
          dueDays: 20,
          tags: ['家庭教育', '学习提升']
        }
      ]
    };

    // 为每个用户创建待办事项
    let totalCreated = 0;
    for (const user of users as any[]) {
      const userRole = user.username; // 使用用户名作为角色标识
      const templates = todoTemplates[userRole] || todoTemplates['teacher']; // 默认使用教师模板

      console.log(`\n📋 为用户 ${user.username} 创建待办事项...`);

      // 检查用户是否已有待办事项
      const [existingCount] = await sequelize.query(`
        SELECT COUNT(*) as count FROM todos WHERE user_id = ?
      `, { replacements: [user.id], type: QueryTypes.SELECT });

      if ((existingCount as any).count > 0) {
        console.log(`⚠️  用户 ${user.username} 已有 ${(existingCount as any).count} 条待办事项，跳过创建`);
        continue;
      }

      // 创建待办事项
      for (const template of templates) {
        const dueDate = new Date(Date.now() + template.dueDays * 24 * 60 * 60 * 1000);

        await sequelize.query(`
          INSERT INTO todos (
            title, description, priority, status, due_date, user_id,
            notify, notify_time, tags, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, {
          replacements: [
            template.title,
            template.description,
            template.priority,
            template.status,
            dueDate,
            user.id,
            true, // 开启提醒
            new Date(dueDate.getTime() - 24 * 60 * 60 * 1000), // 提前1天提醒
            JSON.stringify(template.tags)
          ]
        });

        console.log(`  ✅ 创建: ${template.title}`);
        totalCreated++;
      }
    }

    console.log(`\n🎉 成功创建 ${totalCreated} 条待办事项！`);

    // 显示统计信息
    console.log('\n📊 创建统计:');
    for (const user of users as any[]) {
      const [count] = await sequelize.query(`
        SELECT COUNT(*) as count FROM todos WHERE user_id = ?
      `, { replacements: [user.id], type: QueryTypes.SELECT });
      console.log(`  ${user.username}: ${(count as any).count} 条待办事项`);
    }

    console.log('\n🎯 测试说明:');
    console.log('1. 使用 admin/123456 登录，可以看到管理员的待办事项');
    console.log('2. 使用 teacher/123456 登录，可以看到教师的待办事项');
    console.log('3. 使用 test_parent/123456 登录，可以看到家长的待办事项');
    console.log('4. 访问 http://localhost:5173/todo 查看待办事项列表');

    process.exit(0);
  } catch (error) {
    console.error('❌ 添加种子数据时发生错误:', error);
    process.exit(1);
  }
}

seedMultiRoleTodos();