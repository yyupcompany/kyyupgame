/**
 * 端到端测试脚本 - 测试 any_query 工具的完整流程
 */

import { QueryTypes } from 'sequelize';

async function testDatabaseImport() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 [测试1] 测试动态导入 database.ts');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 方法1: 导入整个模块
    console.log('📦 [方法1] 导入整个模块...');
    const databaseModule: any = await import('./src/config/database');
    console.log('✅ [方法1] 模块导入成功');
    console.log('📋 [方法1] 模块内容:', Object.keys(databaseModule));
    console.log('📋 [方法1] getSequelize类型:', typeof databaseModule.getSequelize);

    // 检查 default 导出
    if (databaseModule.default) {
      console.log('📋 [方法1] default 导出存在');
      console.log('📋 [方法1] default 类型:', typeof databaseModule.default);
      console.log('📋 [方法1] default 内容:', Object.keys(databaseModule.default));

      // 检查 default 中是否有 getSequelize
      if (databaseModule.default.getSequelize) {
        console.log('📋 [方法1] default.getSequelize 类型:', typeof databaseModule.default.getSequelize);
      }
    }

    // 尝试调用
    if (typeof databaseModule.getSequelize === 'function') {
      console.log('✅ [方法1] getSequelize 是函数，尝试调用...');
      const sequelize = databaseModule.getSequelize();
      console.log('✅ [方法1] getSequelize() 调用成功');
      console.log('📋 [方法1] Sequelize实例:', sequelize.constructor.name);
    } else {
      console.log('❌ [方法1] getSequelize 不是函数');
      console.log('📋 [方法1] getSequelize 实际值:', databaseModule.getSequelize);
    }

  } catch (error) {
    console.error('❌ [方法1] 失败:', error);
  }

  console.log('');

  try {
    // 方法2: 解构导入
    console.log('📦 [方法2] 解构导入...');
    const { getSequelize } = await import('./src/config/database');
    console.log('✅ [方法2] 解构导入成功');
    console.log('📋 [方法2] getSequelize类型:', typeof getSequelize);

    // 尝试调用
    if (typeof getSequelize === 'function') {
      console.log('✅ [方法2] getSequelize 是函数，尝试调用...');
      const sequelize = getSequelize();
      console.log('✅ [方法2] getSequelize() 调用成功');
      console.log('📋 [方法2] Sequelize实例:', sequelize.constructor.name);
    } else {
      console.log('❌ [方法2] getSequelize 不是函数');
      console.log('📋 [方法2] getSequelize 实际值:', getSequelize);
    }

  } catch (error) {
    console.error('❌ [方法2] 失败:', error);
  }

  console.log('');

  try {
    // 方法3: 直接导入 getSequelize
    console.log('📦 [方法3] 直接从源文件导入...');
    const { getSequelize: directGetSequelize } = require('./src/config/database');
    console.log('✅ [方法3] 直接导入成功');
    console.log('📋 [方法3] getSequelize类型:', typeof directGetSequelize);

    if (typeof directGetSequelize === 'function') {
      console.log('✅ [方法3] getSequelize 是函数');
    } else {
      console.log('❌ [方法3] getSequelize 不是函数');
    }

  } catch (error) {
    console.error('❌ [方法3] 失败:', error);
  }

  console.log('');
}

async function testSQLQuery() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 [测试2] 测试SQL查询执行（使用.ts扩展名）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    console.log('📦 [SQL] 导入 database.ts...');
    const databaseModule = await import('./src/config/database.ts');
    console.log('✅ [SQL] 模块导入成功');
    console.log('📋 [SQL] 模块内容:', Object.keys(databaseModule));
    console.log('📋 [SQL] getSequelize类型:', typeof databaseModule.getSequelize);

    if (typeof databaseModule.getSequelize !== 'function') {
      throw new Error('getSequelize 不是函数');
    }

    const sequelize = databaseModule.getSequelize();
    console.log('✅ [SQL] getSequelize() 调用成功');

    const sql = "SELECT COUNT(*) as total FROM students WHERE status = 'active'";
    console.log('📝 [SQL] 执行查询:', sql);

    const results = await sequelize.query(sql, {
      type: QueryTypes.SELECT
    });

    console.log('✅ [SQL] 查询成功');
    console.log('📊 [SQL] 结果:', results);

  } catch (error) {
    console.error('❌ [SQL] 失败:', error);
    console.error('❌ [SQL] 错误堆栈:', error.stack);
  }

  console.log('');
}

async function testAnyQueryTool() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 [测试3] 测试 any_query 工具');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // 导入工具
    const toolModule = await import('./src/services/ai/tools/database-query/any-query.tool');
    console.log('✅ [工具] 模块导入成功');
    console.log('📋 [工具] 导出内容:', Object.keys(toolModule));
    
    // 检查是否有默认导出
    if (toolModule.default) {
      console.log('📋 [工具] 默认导出类型:', typeof toolModule.default);
      console.log('📋 [工具] 默认导出内容:', Object.keys(toolModule.default));
    }
    
  } catch (error) {
    console.error('❌ [工具] 失败:', error);
  }
  
  console.log('');
}

async function runAllTests() {
  console.log('');
  console.log('🚀 开始端到端测试...');
  console.log('');
  
  await testDatabaseImport();
  await testSQLQuery();
  await testAnyQueryTool();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 所有测试完成');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  process.exit(0);
}

// 运行测试
runAllTests().catch(error => {
  console.error('💥 测试失败:', error);
  process.exit(1);
});

