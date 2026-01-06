/**
 * 幼儿园任务中心数据脚本
 * 创建真实的幼儿园园长给老师们发送的任务
 */

const { Sequelize } = require('sequelize');
const config = require('../src/config/database');

// 创建数据库连接
const sequelize = new Sequelize(config.development);

async function clearAndCreateTasks() {
  try {
    console.log('🗑️  开始清理现有任务数据...');

    // 清理现有任务数据
    await sequelize.query('DELETE FROM tasks');
    console.log('✅ 现有任务数据已清理');

    // 获取现有用户数据
    const [users] = await sequelize.query(`
      SELECT id, username, email, role
      FROM users
      WHERE role IN ('admin', 'teacher')
      ORDER BY role DESC, id ASC
      LIMIT 10
    `);

    if (users.length === 0) {
      console.log('❌ 没有找到管理员或教师用户，请先创建用户');
      return;
    }

    console.log('👥 找到用户：');
    users.forEach(user => {
      console.log(`   ${user.role === 'admin' ? '👑 园长' : '👩‍🏫 老师'}: ${user.username} (ID: ${user.id})`);
    });

    const admin = users.find(u => u.role === 'admin') || users[0];
    const teachers = users.filter(u => u.role === 'teacher');

    if (teachers.length === 0) {
      console.log('⚠️  没有找到教师用户，将使用所有用户作为任务接收者');
    }

    // 创建真实幼儿园任务数据
    const tasks = [
      // 教学准备类任务
      {
        title: '准备春季学期教学计划',
        description: '请各位老师根据春季学期主题"春天来了"，制定详细的教学计划和活动安排。重点关注：1) 春季主题的五大领域活动设计；2) 区域材料的准备和更新；3) 家园共育活动计划。请在下周五前提交。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
        creator_id: admin.id,
        assignee_id: teachers[0]?.id || users[1]?.id,
        progress: 60,
        type: 'teaching'
      },
      {
        title: '更新班级环境布置',
        description: '春季主题环境创设：1) 更新主题墙内容，展示幼儿春季作品；2) 调整区域材料柜，投放春季相关材料；3) 设计自然角，种植小植物；4) 准备家长园地春季宣传内容。',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5天后
        creator_id: admin.id,
        assignee_id: teachers[1]?.id || users[2]?.id,
        progress: 0,
        type: 'environment'
      },
      {
        title: '组织春季亲子运动会策划',
        description: '策划4月份春季亲子运动会：1) 制定活动方案和安全预案；2) 设计适合各年龄段的亲子游戏；3) 准备运动器材和奖品；4) 安排家长志愿者工作。需要考虑到场地安全和参与度。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天后
        creator_id: admin.id,
        assignee_id: teachers[2]?.id || users[0]?.id,
        progress: 30,
        type: 'activity'
      },

      // 安全卫生类任务
      {
        title: '春季传染病预防工作',
        description: '春季是传染病高发期，请做好以下工作：1) 加强晨检和午检工作；2) 教室每日通风消毒；3) 幼儿个人卫生教育；4) 与家长沟通预防措施。重点关注手足口病和流感预防。',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
        creator_id: admin.id,
        assignee_id: teachers[0]?.id || users[1]?.id,
        progress: 80,
        type: 'health'
      },
      {
        title: '检查教室安全隐患',
        description: '月度安全检查：1) 检查电器线路和插座安全；2) 检查家具稳固性，无尖锐角；3) 清理地面障碍物；4) 检查玩具和教具的安全性；5) 更新安全检查记录表。',
        priority: 'medium',
        status: 'completed',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前（已完成）
        creator_id: admin.id,
        assignee_id: teachers[1]?.id || users[2]?.id,
        progress: 100,
        type: 'safety'
      },

      // 家园共育类任务
      {
        title: '准备家长开放日活动',
        description: '3月份家长开放日准备：1) 设计开放日活动流程；2) 准备展示幼儿作品的区域；3) 安排家长观摩的活动内容；4) 准备家长反馈问卷；5) 制定活动接待方案。',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10天后
        creator_id: admin.id,
        assignee_id: teachers[2]?.id || users[0]?.id,
        progress: 20,
        type: 'parent'
      },
      {
        title: '完善幼儿成长档案',
        description: '更新幼儿成长档案：1) 记录本月幼儿发展情况；2) 添加幼儿作品照片；3) 填写教师观察记录；4) 准备家长沟通要点。重点关注幼儿的个体差异和发展进步。',
        priority: 'medium',
        status: 'in_progress',
        due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6天后
        creator_id: admin.id,
        assignee_id: teachers[0]?.id || users[1]?.id,
        progress: 45,
        type: 'documentation'
      },

      // 专业发展类任务
      {
        title: '参加幼教培训课程',
        description: '本周六参加区教育局组织的"游戏化教学"专题培训：1) 准备学习笔记；2) 参与互动讨论；3) 培训后提交心得体会；4) 在教研活动中分享学习成果。',
        priority: 'low',
        status: 'pending',
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4天后
        creator_id: admin.id,
        assignee_id: teachers[1]?.id || users[2]?.id,
        progress: 0,
        type: 'training'
      },
      {
        title: '教研活动主题准备',
        description: '本月在教研活动中分享"如何有效进行个别化指导"：1) 准备实际案例；2) 制作PPT演示文稿；3) 准备互动环节设计；4) 整理相关理论资料。',
        priority: 'low',
        status: 'pending',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15天后
        creator_id: admin.id,
        assignee_id: teachers[2]?.id || users[0]?.id,
        progress: 10,
        type: 'research'
      },

      // 日常管理类任务
      {
        title: '制定下周食谱计划',
        description: '营养师配合制定营养均衡的食谱：1) 考虑季节性食材；2) 满足幼儿营养需求；3) 考虑食物搭配和多样性；4) 特别关注过敏体质幼儿；5) 与厨房沟通食材采购计划。',
        priority: 'medium',
        status: 'completed',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前（已完成）
        creator_id: admin.id,
        assignee_id: teachers[0]?.id || users[1]?.id,
        progress: 100,
        type: 'daily'
      },
      {
        title: '整理班级物品清单',
        description: '季度物品盘点：1) 清点教具和玩具数量；2) 检查物品损坏情况；3) 列出需要补充的物品清单；4) 整理图书区书籍；5) 清理过期物品。',
        priority: 'low',
        status: 'in_progress',
        due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8天后
        creator_id: admin.id,
        assignee_id: teachers[1]?.id || users[2]?.id,
        progress: 55,
        type: 'management'
      },
      {
        title: '准备清明节主题活动',
        description: '传统文化教育：1) 设计适合幼儿的清明节活动方案；2) 准备相关故事和绘本；3) 安排手工活动（如制作青团、纸花等）；4) 与家长沟通节日意义；5) 确保活动的教育价值和安全性。',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12天后
        creator_id: admin.id,
        assignee_id: teachers[2]?.id || users[0]?.id,
        progress: 15,
        type: 'festival'
      }
    ];

    console.log(`📝 准备插入 ${tasks.length} 个任务...`);

    // 插入任务数据
    for (const task of tasks) {
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

    console.log('✅ 任务数据创建完成！');

    // 显示创建的任务统计
    const [stats] = await sequelize.query(`
      SELECT
        status,
        priority,
        type,
        COUNT(*) as count
      FROM tasks
      GROUP BY status, priority, type
      ORDER BY status, priority, type
    `);

    console.log('\n📊 任务统计：');
    console.log('状态分布：');
    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat.status] = (statusStats[stat.status] || 0) + parseInt(stat.count);
    });
    Object.entries(statusStats).forEach(([status, count]) => {
      const statusText = {
        'pending': '待处理',
        'in_progress': '进行中',
        'completed': '已完成',
        'overdue': '已逾期'
      }[status] || status;
      console.log(`   ${statusText}: ${count} 个`);
    });

    console.log('\n优先级分布：');
    const priorityStats = {};
    stats.forEach(stat => {
      priorityStats[stat.priority] = (priorityStats[stat.priority] || 0) + parseInt(stat.count);
    });
    Object.entries(priorityStats).forEach(([priority, count]) => {
      const priorityText = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
      }[priority] || priority;
      console.log(`   ${priorityText}: ${count} 个`);
    });

  } catch (error) {
    console.error('❌ 创建任务数据失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
clearAndCreateTasks();