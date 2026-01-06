/**
 * 为用户ID 1 创建AI记忆测试数据
 */

const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize(
  'kargerdensales',
  'root', 
  'pwk5ls7j',
  {
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: false
  }
);

async function createMemoriesForUser1() {
  try {
    console.log('🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('📝 为用户ID 1 创建AI记忆数据...');
    
    const testMemories = [
      {
        external_user_id: 1,
        conversation_id: 'admin-conv-1',
        content: '用户询问: 你好，我想了解一下幼儿园的AI记忆管理功能\n\nAI回复: 您好！AI记忆管理功能可以帮助系统记住您的偏好和需求，提供更个性化的服务。系统会自动保存重要的对话内容，并进行智能分析和分类。',
        memory_type: 'short_term',
        importance: 0.9,
        created_at: new Date()
      },
      {
        external_user_id: 1,
        conversation_id: 'admin-conv-2',
        content: '用户询问: 请介绍一下数据可视化功能\n\nAI回复: 我们的数据可视化功能包括记忆类型分布图、重要性分析图表、时间趋势图等。您可以直观地看到AI记忆的统计信息，包括总记忆数、平均重要性、今日新增等关键指标。',
        memory_type: 'short_term',
        importance: 0.8,
        created_at: new Date(Date.now() - 60000) // 1分钟前
      },
      {
        external_user_id: 1,
        conversation_id: 'admin-conv-3',
        content: '用户询问: 系统的招生管理功能如何使用？\n\nAI回复: 招生管理功能包括招生计划制定、申请审核、面试安排、录取通知等完整流程。您可以通过系统跟踪每个申请的状态，生成招生报告，并进行数据分析。',
        memory_type: 'long_term',
        importance: 0.7,
        created_at: new Date(Date.now() - 120000) // 2分钟前
      },
      {
        external_user_id: 1,
        conversation_id: 'admin-conv-4',
        content: '用户询问: 如何管理教师和班级信息？\n\nAI回复: 系统提供完整的教师管理功能，包括教师档案、班级分配、课程安排等。您可以查看每个教师的详细信息，管理班级学生名单，安排教学任务。',
        memory_type: 'short_term',
        importance: 0.6,
        created_at: new Date(Date.now() - 180000) // 3分钟前
      },
      {
        external_user_id: 1,
        conversation_id: 'admin-conv-5',
        content: '用户询问: 活动管理功能有哪些特色？\n\nAI回复: 活动管理功能支持活动策划、报名管理、签到统计、效果评估等。系统可以自动生成活动报告，分析参与度和满意度，帮助优化未来的活动安排。',
        memory_type: 'working',
        importance: 0.5,
        created_at: new Date(Date.now() - 240000) // 4分钟前
      }
    ];

    // 插入记忆数据
    for (const memory of testMemories) {
      await sequelize.query(`
        INSERT INTO ai_memories (external_user_id, conversation_id, content, memory_type, importance, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          memory.external_user_id,
          memory.conversation_id,
          memory.content,
          memory.memory_type,
          memory.importance,
          memory.created_at
        ]
      });
    }

    console.log(`✅ 成功为用户ID 1 创建了 ${testMemories.length} 条记忆数据`);

    // 验证数据
    console.log('🔍 验证创建的数据...');
    const [results] = await sequelize.query(`
      SELECT 
        id,
        external_user_id,
        conversation_id,
        content,
        importance,
        memory_type,
        created_at
      FROM ai_memories 
      WHERE external_user_id = 1
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    console.log('📊 用户ID 1 的记忆数据:');
    results.forEach((memory, index) => {
      console.log(`${index + 1}. [${memory.memory_type}] ${memory.content.substring(0, 50)}... (重要性: ${memory.importance})`);
    });

    await sequelize.close();
    console.log('🔚 数据库连接已关闭');
    console.log('🎉 任务完成！现在可以访问 http://k.yyup.cc/ai/memory 查看数据');

  } catch (error) {
    console.error('❌ 操作失败:', error);
    await sequelize.close();
  }
}

// 运行脚本
createMemoriesForUser1();
