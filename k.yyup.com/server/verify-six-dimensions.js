/**
 * 验证六维记忆系统的完整性
 */

const mysql = require('mysql2/promise');

async function verifySixDimensions() {
  console.log('🧠 验证六维记忆系统完整性...\n');

  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('✅ 数据库连接成功\n');

    // 定义六个维度
    const dimensions = [
      { name: 'core_memories', label: '核心记忆', description: '用户基本信息和偏好' },
      { name: 'episodic_memories', label: '情节记忆', description: '具体事件和交互历史' },
      { name: 'semantic_memories', label: '语义记忆', description: '知识和概念理解' },
      { name: 'procedural_memories', label: '程序记忆', description: '操作技能和流程' },
      { name: 'resource_memories', label: '资源记忆', description: '文件和资源引用' },
      { name: 'knowledge_vault', label: '知识库', description: '领域知识存储' }
    ];

    console.log('📊 六维记忆系统状态检查:\n');

    let totalRecords = 0;
    let availableDimensions = 0;

    for (const dimension of dimensions) {
      try {
        // 检查表是否存在
        const [tables] = await connection.execute(
          "SHOW TABLES LIKE ?", 
          [dimension.name]
        );

        if (tables.length === 0) {
          console.log(`❌ ${dimension.label} (${dimension.name}): 表不存在`);
          continue;
        }

        // 检查记录数量
        const [count] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${dimension.name}`
        );

        const recordCount = count[0].count;
        totalRecords += recordCount;

        if (recordCount > 0) {
          availableDimensions++;
          
          // 获取最新记录
          const [recent] = await connection.execute(
            `SELECT id, user_id, created_at FROM ${dimension.name} ORDER BY created_at DESC LIMIT 1`
          );

          console.log(`✅ ${dimension.label} (${dimension.name}): ${recordCount} 条记录`);
          console.log(`   最新记录: ID=${recent[0].id}, 用户=${recent[0].user_id}, 时间=${recent[0].created_at}`);
          console.log(`   描述: ${dimension.description}\n`);
        } else {
          console.log(`⚠️  ${dimension.label} (${dimension.name}): 0 条记录`);
          console.log(`   描述: ${dimension.description}\n`);
        }

      } catch (error) {
        console.log(`❌ ${dimension.label} (${dimension.name}): 检查失败 - ${error.message}\n`);
      }
    }

    // 总结报告
    console.log('📋 六维记忆系统总结报告:');
    console.log(`   总维度数: 6`);
    console.log(`   可用维度: ${availableDimensions}`);
    console.log(`   总记录数: ${totalRecords}`);
    console.log(`   完整性: ${Math.round((availableDimensions / 6) * 100)}%`);

    if (availableDimensions === 6) {
      console.log('\n🎉 六维记忆系统完全可用！');
    } else if (availableDimensions >= 4) {
      console.log('\n⚠️  六维记忆系统部分可用，建议完善剩余维度');
    } else {
      console.log('\n❌ 六维记忆系统需要修复');
    }

    // 测试创建记忆
    console.log('\n🧪 测试记忆创建功能...');
    
    try {
      // 测试创建核心记忆
      await connection.execute(
        'INSERT INTO core_memories (user_id, persona_value, persona_limit, human_value, human_limit, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          'test-user-123',
          '我是YY-AI智能助手，专业的幼儿园管理顾问。',
          2000,
          '测试用户，用于验证六维记忆系统功能。',
          2000,
          JSON.stringify({ source: 'verification-test' })
        ]
      );
      console.log('✅ 核心记忆创建测试成功');

      // 测试创建情节记忆
      await connection.execute(
        'INSERT INTO episodic_memories (user_id, event_type, summary, details, actor, tree_path, occurred_at, created_at, updated_at, metadata) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), ?)',
        [
          'test-user-123',
          'verification',
          '六维记忆系统验证测试',
          '这是一个用于验证六维记忆系统功能的测试事件',
          'system',
          JSON.stringify(['test', 'verification']),
          JSON.stringify({ source: 'verification-test' })
        ]
      );
      console.log('✅ 情节记忆创建测试成功');

      // 测试创建语义记忆
      await connection.execute(
        'INSERT INTO semantic_memories (user_id, name, description, category, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [
          'test-user-123',
          '六维记忆系统',
          '一个先进的记忆管理系统，包含六个不同的记忆维度',
          'system-concept',
          JSON.stringify({ source: 'verification-test' })
        ]
      );
      console.log('✅ 语义记忆创建测试成功');

      console.log('\n🎉 记忆创建功能测试完成！');

    } catch (error) {
      console.log(`❌ 记忆创建测试失败: ${error.message}`);
    }

    // 清理测试数据
    try {
      await connection.execute('DELETE FROM core_memories WHERE user_id = ?', ['test-user-123']);
      await connection.execute('DELETE FROM episodic_memories WHERE user_id = ?', ['test-user-123']);
      await connection.execute('DELETE FROM semantic_memories WHERE user_id = ?', ['test-user-123']);
      console.log('🧹 测试数据清理完成');
    } catch (error) {
      console.log(`⚠️  测试数据清理失败: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔚 数据库连接已关闭');
    }
  }
}

// 运行验证
verifySixDimensions().then(() => {
  console.log('\n✅ 六维记忆系统验证完成');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ 验证失败:', error);
  process.exit(1);
});
