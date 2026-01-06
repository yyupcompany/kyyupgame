const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function validateUser121() {
  let connection;
  
  try {
    console.log('🔍 开始验证异常用户121...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    // 1. 检查用户121的详细信息
    console.log('
=== 1. 用户121详细信息 ===');
    const [userInfo] = await connection.execute(
      'SELECT id, username, email, role, status, created_at, updated_at FROM users WHERE id = 121'
    );
    
    if (userInfo.length > 0) {
      const user = userInfo[0];
      console.log('用户信息：');
      console.log(`  ID: ${user.id}`);
      console.log(`  用户名: ${user.username}`);
      console.log(`  邮箱: ${user.email}`);
      console.log(`  角色: ${user.role}`);
      console.log(`  状态: ${user.status}`);
      console.log(`  注册时间: ${user.created_at}`);
      console.log(`  更新时间: ${user.updated_at}`);
    } else {
      console.log('❌ 用户121不存在！');
      return;
    }
    
    // 2. 检查该用户在所有AI表中的数据分布
    console.log('
=== 2. 用户121的AI数据分布 ===');
    
    const aiTables = [
      'ai_conversations', 'ai_messages', 'ai_user_relations', 
      'ai_memories', 'ai_model_usage', 'ai_user_permissions'
    ];
    
    for (const tableName of aiTables) {
      try {
        const [countResult] = await connection.execute(
          `SELECT COUNT(*) as count FROM \`${tableName}\` WHERE external_user_id = 121`
        );
        const count = countResult[0].count;
        if (count > 0) {
          console.log(`  ${tableName}: ${count.toLocaleString()} 条记录`);
        }
      } catch (error) {
        // 有些表可能字段名不同，忽略错误
      }
    }
    
    // 3. 分析用户121的对话模式
    console.log('
=== 3. 用户121对话模式分析 ===');
    
    const [conversationStats] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as daily_conversations,
        SUM(message_count) as daily_messages,
        AVG(message_count) as avg_messages_per_conv
      FROM ai_conversations 
      WHERE external_user_id = 121
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 10
    `);
    
    console.log('最近10天的对话模式：');
    conversationStats.forEach(stat => {
      console.log(`  ${stat.date}: ${stat.daily_conversations}个对话, ${stat.daily_messages}条消息, 平均${stat.avg_messages_per_conv?.toFixed(1) || 0}条/对话`);
    });
    
    // 4. 检查是否为测试/机器人行为
    console.log('
=== 4. 异常行为检测 ===');
    
    // 检查创建频率
    const [frequencyCheck] = await connection.execute(`
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as count
      FROM ai_conversations 
      WHERE external_user_id = 121
      GROUP BY HOUR(created_at)
      ORDER BY count DESC
      LIMIT 5
    `);
    
    console.log('创建时间分布（TOP 5小时）：');
    frequencyCheck.forEach(item => {
      console.log(`  ${item.hour}:00 - ${item.count}个对话`);
    });
    
    // 检查消息内容模式
    const [messagePattern] = await connection.execute(`
      SELECT 
        role,
        COUNT(*) as count,
        AVG(CHAR_LENGTH(content)) as avg_length
      FROM ai_messages m
      JOIN ai_conversations c ON m.conversation_id = c.id
      WHERE c.external_user_id = 121
      GROUP BY role
    `);
    
    console.log('消息模式分析：');
    messagePattern.forEach(pattern => {
      console.log(`  ${pattern.role}: ${pattern.count}条消息, 平均长度${Math.round(pattern.avg_length)}字符`);
    });
    
    // 5. 检查用户权限和活动
    console.log('
=== 5. 用户权限和活动检查 ===');
    
    // 检查用户角色权限
    const [userRoles] = await connection.execute(`
      SELECT r.name, r.description 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = 121
    `);
    
    console.log('用户角色：');
    userRoles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`);
    });
    
    // 检查最近登录活动
    const [loginActivity] = await connection.execute(`
      SELECT login_time, ip_address, user_agent
      FROM user_login_logs 
      WHERE user_id = 121
      ORDER BY login_time DESC
      LIMIT 5
    `);
    
    if (loginActivity.length > 0) {
      console.log('最近登录活动：');
      loginActivity.forEach(login => {
        console.log(`  ${login.login_time}: ${login.ip_address} - ${login.user_agent?.substring(0, 50)}...`);
      });
    } else {
      console.log('  无登录记录');
    }
    
    // 6. 决策建议
    console.log('
=== 6. 决策建议 ===');
    
    // 计算关键指标
    const [keyMetrics] = await connection.execute(`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN message_count = 0 THEN 1 END) as empty_conversations,
        COUNT(CASE WHEN message_count > 0 THEN 1 END) as valid_conversations,
        MAX(created_at) as latest_activity,
        MIN(created_at) as earliest_activity
      FROM ai_conversations 
      WHERE external_user_id = 121
    `);
    
    const metrics = keyMetrics[0];
    const emptyRate = (metrics.empty_conversations / metrics.total_conversations * 100);
    const isActiveRecently = new Date(metrics.latest_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    console.log('关键指标：');
    console.log(`  总对话数: ${metrics.total_conversations}`);
    console.log(`  空对话率: ${emptyRate.toFixed(1)}%`);
    console.log(`  最近活动: ${metrics.latest_activity}`);
    console.log(`  7天内活跃: ${isActiveRecently ? '是' : '否'}`);
    
    // 基于分析给出建议
    console.log('\n🎯 建议：');
    
    if (user.username === 'admin' && user.email === 'admin@test.com') {
      console.log('✅ 这是系统管理员账号，行为异常可能是测试或系统问题');
      console.log('🔧 建议：');
      console.log('  1. 检查系统是否有自动创建对话的bug');
      console.log('  2. 考虑为管理员设置单独的测试环境');
      console.log('  3. 限制管理员账号在生产环境的自动操作');
    } else if (emptyRate > 90) {
      console.log('⚠️  该用户存在严重的空对话问题，可能是机器人或异常');
      console.log('🔧 建议：');
      console.log('  1. 暂时限制该用户的对话创建权限');
      console.log('  2. 要求用户验证身份');
      console.log('  3. 清理该用户的空对话数据');
    } else if (!isActiveRecently) {
      console.log('ℹ️  该用户最近不活跃，可以安全清理历史数据');
      console.log('🔧 建议：');
      console.log('  1. 清理30天前的空对话');
      console.log('  2. 保留近期的有效对话');
    } else {
      console.log('ℹ️  该用户行为相对正常，按正常用户处理');
      console.log('🔧 建议：');
      console.log('  1. 应用标准的数据清理策略');
      console.log('  2. 监控后续使用情况');
    }
    
    console.log('\n✅ 用户121验证完成！');
    
  } catch (error) {
    console.error('❌ 用户验证失败：', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行验证
validateUser121();