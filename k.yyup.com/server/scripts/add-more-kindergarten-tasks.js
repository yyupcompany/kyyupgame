/**
 * 添加更多幼儿园任务数据
 * 丰富任务中心的内容
 */

const { Sequelize } = require('sequelize');
const config = require('../src/config/database');

// 创建数据库连接
const sequelize = new Sequelize(config.development);

async function addMoreTasks() {
  try {
    console.log('📝 添加更多幼儿园任务...');

    // 获取现有用户
    const [users] = await sequelize.query(`
      SELECT id, username, role
      FROM users
      WHERE role IN ('admin', 'teacher')
      ORDER BY id ASC
    `);

    console.log(`👥 找到 ${users.length} 个用户`);
    users.forEach(user => {
      console.log(`   ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.role}`);
    });

    if (users.length < 2) {
      console.log('❌ 用户数据不足，至少需要2个用户');
      return;
    }

    const assignees = users.slice(1); // 使用除第一个外的所有用户作为接收者
    const creator = users[0]; // 第一个用户作为创建者

    console.log(`👤 使用创建者: ${creator.username} (ID: ${creator.id})`);
    console.log(`👥 分配给 ${assignees.length} 个接收者`);
    assignees.forEach((assignee, index) => {
      console.log(`   ${index + 1}. ${assignee.username} (ID: ${assignee.id})`);
    });

    // 更多真实幼儿园任务
    const additionalTasks = [
      // 幼儿发展评估类
      {
        title: '完成3月份幼儿发展评估',
        description: '对本班幼儿进行月度发展评估：1) 语言表达能力评估；2) 社会性发展观察；3) 大肌肉和小肌肉发展记录；4) 认知能力发展情况；5) 艺术表现能力评价。需要为每个幼儿填写详细的评估表。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天后
        creator_id: creator.id,
        assignee_id: assignees[0].id,
        progress: 70,
        type: 'assessment'
      },
      {
        title: '制定个别化教育计划',
        description: '为有特殊需要的幼儿制定IEP：1) 识别需要特别支持的幼儿；2) 设定具体的教育目标；3) 制定干预策略；4) 设计评估方法；5) 与家长沟通计划内容。',
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
        creator_id: creator.id,
        assignee_id: assignees[1].id,
        progress: 25,
        type: 'iep'
      },

      // 家园沟通类
      {
        title: '家访安排和准备',
        description: '本月家访计划：1) 确定需要家访的幼儿家庭；2) 与家长预约家访时间；3) 准备家访内容和材料；4) 设计家访记录表；5) 制定后续跟进计划。重点关注新生家庭和有特殊情况的幼儿。',
        priority: 'medium',
        status: 'in_progress',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10天后
        creator_id: creator.id,
        assignee_id: assignees[2].id,
        progress: 40,
        type: 'home_visit'
      },
      {
        title: '家长微信群管理',
        description: '优化家长微信群沟通：1) 每日发布幼儿活动照片；2) 分享育儿知识和技巧；3) 及时回复家长咨询；4) 发布重要通知和提醒；5) 维护群内良好氛围。',
        priority: 'low',
        status: 'completed',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
        creator_id: creator.id,
        assignee_id: assignees[3].id,
        progress: 100,
        type: 'communication'
      },

      // 课程实施类
      {
        title: '科学领域活动实施',
        description: '本周科学主题活动"植物的生长"：1) 准备种植材料和工具；2) 设计观察记录表；3) 引导幼儿进行科学探究；4) 记录幼儿的发现和问题；5) 总结活动效果。',
        priority: 'medium',
        status: 'in_progress',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 明天
        creator_id: creator.id,
        assignee_id: assignees[4].id,
        progress: 60,
        type: 'curriculum'
      },
      {
        title: '艺术区域材料更新',
        description: '美术区域材料补充：1) 采购春季主题美术材料；2) 制作手工范例；3) 整理现有美术用品；4) 设计创意美术活动；5) 展示幼儿美术作品。',
        priority: 'low',
        status: 'pending',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5天后
        creator_id: creator.id,
        assignee_id: assignees[0].id,
        progress: 30,
        type: 'art'
      },

      // 行政管理类
      {
        title: '月度工作总结报告',
        description: '撰写3月份工作总结：1) 教学工作完成情况；2) 幼儿发展进步情况；3) 家园共育工作开展情况；4) 安全卫生工作总结；5) 下月工作计划要点。',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8天后
        creator_id: creator.id,
        assignee_id: assignees[1].id,
        progress: 15,
        type: 'report'
      },
      {
        title: '班级物品采购申请',
        description: '申请班级教学物品补充：1) 列出需要采购的物品清单；2) 填写采购申请表；3) 说明物品用途和数量；4) 预算价格估算；5) 提交园长审批。',
        priority: 'low',
        status: 'in_progress',
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4天后
        creator_id: creator.id,
        assignee_id: assignees[2].id,
        progress: 50,
        type: 'procurement'
      },

      // 专业成长类
      {
        title: '观摩优秀教师课堂',
        description: '安排优秀教师观摩学习：1) 确定观摩对象和时间；2) 准备观摩记录表；3) 重点观察教学方法和师幼互动；4) 记录观摩心得；5) 制定改进计划。',
        priority: 'low',
        status: 'pending',
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12天后
        creator_id: creator.id,
        assignee_id: assignees[3].id,
        progress: 0,
        type: 'observation'
      },
      {
        title: '阅读专业书籍心得',
        description: '本月阅读《3-6岁儿童学习与发展指南》：1) 深入学习各领域发展目标；2) 结合班级实际进行反思；3) 撰写读书心得2000字；4) 在教研活动中分享；5) 制定实践应用计划。',
        priority: 'low',
        status: 'in_progress',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15天后
        creator_id: creator.id,
        assignee_id: assignees[4].id,
        progress: 35,
        type: 'reading'
      }
    ];

    console.log(`📝 准备插入 ${additionalTasks.length} 个额外任务...`);

    // 插入额外任务
    for (let i = 0; i < additionalTasks.length; i++) {
      const task = additionalTasks[i];
      // 确保有分配者，如果没有则使用创建者
      const assigneeId = assignees[i % assignees.length]?.id || creator.id;

      await sequelize.query(`
        INSERT INTO tasks (
          title, description, priority, status, due_date,
          creator_id, assignee_id, progress, type,
          created_at, updated_at
        ) VALUES (
          :title, :description, :priority, :status, :due_date,
          :creator_id, :assignee_id, :progress, :type,
          NOW(), NOW()
        )
      `, {
        replacements: {
          ...task,
          creator_id: creator.id,
          assignee_id: assigneeId
        }
      });
    }

    console.log('✅ 额外任务添加完成！');

    // 显示最新的任务统计
    const [stats] = await sequelize.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM tasks
      GROUP BY status
      ORDER BY status
    `);

    const [typeStats] = await sequelize.query(`
      SELECT
        type,
        COUNT(*) as count
      FROM tasks
      WHERE type IS NOT NULL
      GROUP BY type
      ORDER BY count DESC
    `);

    console.log('\n📊 最新任务统计：');
    console.log('状态分布：');
    stats.forEach(stat => {
      const statusText = {
        'pending': '待处理',
        'in_progress': '进行中',
        'completed': '已完成',
        'overdue': '已逾期'
      }[stat.status] || stat.status;
      console.log(`   ${statusText}: ${stat.count} 个`);
    });

    console.log('\n任务类型分布：');
    typeStats.forEach(stat => {
      const typeText = {
        'teaching': '教学',
        'environment': '环境',
        'activity': '活动',
        'health': '健康',
        'safety': '安全',
        'parent': '家长工作',
        'documentation': '文档',
        'training': '培训',
        'research': '教研',
        'daily': '日常',
        'management': '管理',
        'festival': '节日',
        'assessment': '评估',
        'iep': '个别化教育',
        'home_visit': '家访',
        'communication': '沟通',
        'curriculum': '课程',
        'art': '艺术',
        'report': '报告',
        'procurement': '采购',
        'observation': '观摩',
        'reading': '阅读'
      }[stat.type] || stat.type;
      console.log(`   ${typeText}: ${stat.count} 个`);
    });

    // 显示一些高优先级的待处理任务
    const [urgentTasks] = await sequelize.query(`
      SELECT title, due_date, assignee_id
      FROM tasks
      WHERE priority = 'high' AND status IN ('pending', 'in_progress')
      ORDER BY due_date ASC
      LIMIT 5
    `);

    if (urgentTasks.length > 0) {
      console.log('\n🔥 紧急待处理任务：');
      urgentTasks.forEach(task => {
        const dueDate = new Date(task.due_date).toLocaleDateString('zh-CN');
        console.log(`   ${task.title} (截止: ${dueDate})`);
      });
    }

  } catch (error) {
    console.error('❌ 添加任务失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
addMoreTasks();