/**
 * 简化版幼儿园任务添加脚本
 */

const { Sequelize } = require('sequelize');
const config = require('../src/config/database');

const sequelize = new Sequelize(config.development);

async function addSimpleTasks() {
  try {
    console.log('📝 添加更多幼儿园任务...');

    const simpleTasks = [
      {
        title: '完成4月教学计划制定',
        description: '根据幼儿发展情况制定4月份详细教学计划，包括五大领域的活动设计',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date('2025-11-05'),
        creator_id: 9,
        assignee_id: 121,
        progress: 60,
        type: 'teaching'
      },
      {
        title: '春季安全教育主题课',
        description: '开展春季安全教育活动，包括交通安全、户外安全等内容',
        priority: 'medium',
        status: 'pending',
        due_date: new Date('2025-11-03'),
        creator_id: 9,
        assignee_id: 275,
        progress: 20,
        type: 'safety'
      },
      {
        title: '家长会准备工作',
        description: '准备月度家长会，整理幼儿成长档案和作品集',
        priority: 'medium',
        status: 'in_progress',
        due_date: new Date('2025-11-04'),
        creator_id: 9,
        assignee_id: 276,
        progress: 45,
        type: 'parent'
      },
      {
        title: '区域材料更新',
        description: '更新班级各区域材料，投放春季主题相关教具',
        priority: 'low',
        status: 'pending',
        due_date: new Date('2025-11-07'),
        creator_id: 9,
        assignee_id: 277,
        progress: 10,
        type: 'environment'
      },
      {
        title: '幼儿发展评估',
        description: '完成本月幼儿发展评估记录，重点关注语言和社会性发展',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date('2025-11-02'),
        creator_id: 9,
        assignee_id: 121,
        progress: 75,
        type: 'assessment'
      },
      {
        title: '健康检查记录',
        description: '记录幼儿健康状况，跟踪季节性疾病预防情况',
        priority: 'medium',
        status: 'completed',
        due_date: new Date('2025-10-28'),
        creator_id: 9,
        assignee_id: 275,
        progress: 100,
        type: 'health'
      },
      {
        title: '手工活动材料准备',
        description: '准备春季主题手工活动材料，包括彩纸、剪刀、胶水等',
        priority: 'low',
        status: 'in_progress',
        due_date: new Date('2025-11-01'),
        creator_id: 9,
        assignee_id: 276,
        progress: 80,
        type: 'art'
      },
      {
        title: '户外活动器械检查',
        description: '检查幼儿园户外活动器械的安全性，做好维护记录',
        priority: 'high',
        status: 'completed',
        due_date: new Date('2025-10-27'),
        creator_id: 9,
        assignee_id: 277,
        progress: 100,
        type: 'safety'
      }
    ];

    console.log(`📝 准备插入 ${simpleTasks.length} 个任务...`);

    for (const task of simpleTasks) {
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

    console.log('✅ 任务添加完成！');

    // 显示统计
    const [stats] = await sequelize.query(`
      SELECT status, COUNT(*) as count FROM tasks GROUP BY status
    `);

    console.log('\n📊 任务统计：');
    stats.forEach(stat => {
      const statusText = {
        'pending': '待处理',
        'in_progress': '进行中',
        'completed': '已完成',
        'overdue': '已逾期'
      }[stat.status] || stat.status;
      console.log(`   ${statusText}: ${stat.count} 个`);
    });

    const total = await sequelize.query('SELECT COUNT(*) as total FROM tasks');
    console.log(`\n📈 总任务数: ${total[0][0].total} 个`);

  } catch (error) {
    console.error('❌ 添加任务失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

addSimpleTasks();