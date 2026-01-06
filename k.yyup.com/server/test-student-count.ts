/**
 * 测试"查询在园人数"功能
 */

async function testStudentCount() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 测试：查询在园人数');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // 1. 测试静态导入
    console.log('\n📦 [测试1] 测试静态导入 getSequelize 和 initDatabase...');
    const { getSequelize, initDatabase } = await import('./src/config/database');
    console.log('✅ [测试1] 静态导入成功');
    console.log('📋 [测试1] getSequelize类型:', typeof getSequelize);
    console.log('📋 [测试1] initDatabase类型:', typeof initDatabase);

    if (typeof getSequelize !== 'function') {
      throw new Error('getSequelize 不是函数');
    }

    // 2. 初始化数据库
    console.log('\n📦 [测试2] 初始化数据库...');
    await initDatabase();
    console.log('✅ [测试2] 数据库初始化成功');

    // 3. 测试调用 getSequelize
    console.log('\n📦 [测试3] 测试调用 getSequelize()...');
    const sequelize = getSequelize();
    console.log('✅ [测试3] getSequelize() 调用成功');
    console.log('📋 [测试3] Sequelize实例:', sequelize.constructor.name);
    
    // 4. 测试SQL查询
    console.log('\n📦 [测试4] 测试SQL查询在园人数...');
    const { QueryTypes } = await import('sequelize');
    const sql = 'SELECT COUNT(*) as total FROM students WHERE status = "active"';
    console.log('📝 [测试4] SQL:', sql);

    const results: any = await sequelize.query(sql, {
      type: QueryTypes.SELECT
    });

    console.log('✅ [测试4] SQL查询成功');
    console.log('📊 [测试4] 查询结果:', results);
    console.log('📊 [测试4] 在园人数:', results[0]?.total || 0);

    // 5. 测试 any_query 工具
    console.log('\n📦 [测试5] 测试 any_query 工具...');
    const anyQueryModule = await import('./src/services/ai/tools/database-query/any-query.tool');
    console.log('✅ [测试5] any_query 工具导入成功');
    console.log('📋 [测试5] 导出内容:', Object.keys(anyQueryModule));

    const anyQueryTool = anyQueryModule.default;
    console.log('📋 [测试5] 工具名称:', anyQueryTool.name);
    console.log('📋 [测试5] 工具描述:', anyQueryTool.description.substring(0, 100) + '...');

    // 6. 测试工具执行
    console.log('\n📦 [测试6] 测试工具执行...');
    const toolResult = await anyQueryTool.implementation({
      userQuery: '查询在园人数',
      queryType: 'statistical',
      expectedFormat: 'summary'
    });

    console.log('✅ [测试6] 工具执行完成');
    console.log('📊 [测试6] 工具结果:', JSON.stringify(toolResult, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 所有测试通过！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('❌ 错误堆栈:', error.stack);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ 测试失败');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

// 运行测试
testStudentCount();

