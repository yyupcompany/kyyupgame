/**
 * 检查并重置任务数据
 */

const { Sequelize } = require('sequelize');
const config = require('../src/config/database');

const sequelize = new Sequelize(config.development);

async function checkAndResetTasks() {
  try {
    console.log('🔍 检查当前任务数据...');

    // 检查当前任务数量和内容
    const [currentTasks] = await sequelize.query(`
      SELECT id, title, status, priority, created_at
      FROM tasks
      ORDER BY id ASC
    `);

    console.log(`\n📊 当前数据库中有 ${currentTasks.length} 个任务:`);
    currentTasks.forEach((task, index) => {
      console.log(`${index + 1}. [${task.id}] ${task.title} (${task.status}, ${task.priority})`);
    });

    if (currentTasks.length > 0) {
      console.log('\n🗑️  彻底清空所有任务数据...');

      // 彻底删除所有任务数据
      await sequelize.query('DELETE FROM tasks');

      console.log('✅ 所有任务数据已清空');
    } else {
      console.log('✅ 任务表已经是空的');
    }

    console.log('\n📝 创建纯净的幼儿园任务数据...');

    // 创建纯净的幼儿园任务数据
    const kindergartenTasks = [
      {
        title: '准备春季学期教学计划',
        description: '请根据春季学期主题"春天来了"，制定详细的教学计划和活动安排。重点关注：1) 春季主题的五大领域活动设计；2) 区域材料的准备和更新；3) 家园共育活动计划。请在下周五前提交。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date('2025-11-05'),
        creator_id: 9,
        assignee_id: 121,
        progress: 60,
        type: 'teaching'
      },
      {
        title: '更新班级环境布置',
        description: '春季主题环境创设：1) 更新主题墙内容，展示幼儿春季作品；2) 调整区域材料柜，投放春季相关材料；3) 设计自然角，种植小植物；4) 准备家长园地春季宣传内容。',
        priority: 'medium',
        status: 'pending',
        due_date: new Date('2025-11-03'),
        creator_id: 9,
        assignee_id: 275,
        progress: 0,
        type: 'environment'
      },
      {
        title: '组织春季亲子运动会策划',
        description: '策划4月份春季亲子运动会：1) 制定活动方案和安全预案；2) 设计适合各年龄段的亲子游戏；3) 准备运动器材和奖品；4) 安排家长志愿者工作。需要考虑到场地安全和参与度。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date('2025-11-12'),
        creator_id: 9,
        assignee_id: 276,
        progress: 30,
        type: 'activity'
      },
      {
        title: '春季传染病预防工作',
        description: '春季是传染病高发期，请做好以下工作：1) 加强晨检和午检工作；2) 教室每日通风消毒；3) 幼儿个人卫生教育；4) 与家长沟通预防措施。重点关注手足口病和流感预防。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date('2025-11-01'),
        creator_id: 9,
        assignee_id: 121,
        progress: 80,
        type: 'health'
      },
      {
        title: '家长会准备工作',
        description: '准备月度家长会：1) 整理幼儿成长档案和作品集；2) 准备幼儿发展情况汇报；3) 设计家长互动环节；4) 准备家长反馈问卷；5) 安排会议场地和材料。',
        priority: 'medium',
        status: 'pending',
        due_date: new Date('2025-11-04'),
        creator_id: 9,
        assignee_id: 275,
        progress: 20,
        type: 'parent'
      },
      {
        title: '幼儿发展评估记录',
        description: '完成本月幼儿发展评估：1) 语言表达能力评估；2) 社会性发展观察记录；3) 大肌肉和小肌肉发展情况；4) 认知能力发展评价；5) 艺术表现能力记录。为每个幼儿填写详细评估表。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date('2025-11-02'),
        creator_id: 9,
        assignee_id: 276,
        progress: 75,
        type: 'assessment'
      },
      {
        title: '安全检查和隐患排查',
        description: '月度安全检查：1) 检查电器线路和插座安全性；2) 检查家具稳固性，确保无尖锐角；3) 清理地面障碍物；4) 检查玩具和教具安全性；5) 更新安全检查记录表。',
        priority: 'medium',
        status: 'completed',
        due_date: new Date('2025-10-28'),
        creator_id: 9,
        assignee_id: 277,
        progress: 100,
        type: 'safety'
      },
      {
        title: '区域材料更新补充',
        description: '更新班级各区域材料：1) 投放春季主题相关教具；2) 补充美工区材料；3) 更新图书区春季绘本；4) 准备科学探究材料；5) 整理建构区积木。',
        priority: 'low',
        status: 'pending',
        due_date: new Date('2025-11-06'),
        creator_id: 9,
        assignee_id: 121,
        progress: 10,
        type: 'materials'
      },
      {
        title: '健康观察记录表填写',
        description: '日常健康工作：1) 记录幼儿每日健康状况；2) 跟踪季节性疾病预防情况；3) 记录服药幼儿情况；4) 与家长沟通健康注意事项；5) 更新健康档案。',
        priority: 'medium',
        status: 'completed',
        due_date: new Date('2025-10-27'),
        creator_id: 9,
        assignee_id: 275,
        progress: 100,
        type: 'health_daily'
      },
      {
        title: '手工活动材料准备',
        description: '准备春季手工活动：1) 采购彩纸、剪刀、胶水等材料；2) 制作手工范例；3) 设计适合各年龄段的手工活动；4) 准备展示区域；5) 制定安全操作规范。',
        priority: 'low',
        status: 'in_progress',
        due_date: new Date('2025-11-01'),
        creator_id: 9,
        assignee_id: 276,
        progress: 80,
        type: 'art'
      },
      {
        title: '户外活动场地检查',
        description: '户外安全检查：1) 检查操场器械安全性；2) 清理场地障碍物；3) 检查地面平整度；4) 准备防晒和急救用品；5) 制定户外活动安全预案。',
        priority: 'high',
        status: 'completed',
        due_date: new Date('2025-10-26'),
        creator_id: 9,
        assignee_id: 277,
        progress: 100,
        type: 'outdoor_safety'
      },
      {
        title: '教师培训课程参与',
        description: '专业发展培训：1) 参加区教育局"游戏化教学"培训；2) 准备学习笔记和资料；3) 参与培训互动讨论；4) 撰写培训心得体会；5) 在教研活动中分享学习成果。',
        priority: 'low',
        status: 'pending',
        due_date: new Date('2025-11-08'),
        creator_id: 9,
        assignee_id: 121,
        progress: 0,
        type: 'training'
      }
    ];

    console.log(`📝 创建 ${kindergartenTasks.length} 个纯净的幼儿园任务...`);

    // 插入新的任务数据
    for (const task of kindergartenTasks) {
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
        replacements: task
      });
    }

    console.log('✅ 纯净任务数据创建完成！');

    // 验证创建结果
    const [newTasks] = await sequelize.query(`
      SELECT id, title, status, priority, type, created_at
      FROM tasks
      ORDER BY id ASC
    `);

    console.log(`\n📊 验证：数据库中现有 ${newTasks.length} 个任务:`);
    newTasks.forEach((task, index) => {
      console.log(`${index + 1}. [${task.id}] ${task.title} (${task.status}, ${task.priority})`);
    });

    // 显示统计信息
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

    console.log('\n📈 任务状态统计：');
    stats.forEach(stat => {
      const statusText = {
        'pending': '待处理',
        'in_progress': '进行中',
        'completed': '已完成'
      }[stat.status] || stat.status;
      console.log(`   ${statusText}: ${stat.count} 个`);
    });

    console.log('\n📚 任务类型统计：');
    typeStats.forEach(stat => {
      const typeText = {
        'teaching': '教学',
        'environment': '环境',
        'activity': '活动',
        'health': '健康',
        'parent': '家长工作',
        'assessment': '评估',
        'safety': '安全',
        'materials': '材料',
        'health_daily': '日常健康',
        'art': '艺术',
        'outdoor_safety': '户外安全',
        'training': '培训'
      }[stat.type] || stat.type;
      console.log(`   ${typeText}: ${stat.count} 个`);
    });

    console.log('\n🎉 任务数据重置完成！现在数据库中只有纯净的幼儿园任务数据。');

  } catch (error) {
    console.error('❌ 重置任务数据失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
checkAndResetTasks();