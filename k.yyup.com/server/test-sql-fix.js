#!/usr/bin/env node

/**
 * 测试SQL修复效果的快速验证脚本
 * 直接调用any_query工具来验证SQL生成修复
 */

// 使用ts-node来运行TypeScript文件
const path = require('path');

async function testSQLFix() {
  console.log('🔧 开始测试SQL生成修复效果...\n');

  try {
    // 模拟AI工具调用请求
    const testRequest = {
      userInput: "查询每个班级的班主任信息，包括教师姓名和工号",
      parameters: {},
      intent: "data_query"
    };

    console.log('📝 测试请求:', JSON.stringify(testRequest, null, 2));
    console.log('\n' + '='.repeat(50));

    // 调用any_query工具
    const tool = new AnyQueryTool();
    console.log('🚀 调用any_query工具生成SQL...');

    const result = await tool.execute(testRequest.parameters, testRequest);

    console.log('\n✅ 工具调用成功！');
    console.log('📊 生成结果:', JSON.stringify(result, null, 2));

    // 检查生成的SQL是否包含修复内容
    if (result.sql) {
      console.log('\n🔍 SQL分析:');
      console.log('生成的SQL:', result.sql);

      // 检查是否正确处理了teachers表的name字段问题
      if (result.sql.includes('JOIN users') || result.sql.includes('JOIN u')) {
        console.log('✅ 修复成功: SQL正确包含了JOIN users表');
      } else {
        console.log('❌ 修复失败: SQL没有包含JOIN users表');
      }

      // 检查是否还在使用错误的teachers.name
      if (result.sql.includes('teachers.name') || result.sql.includes('ht.name')) {
        console.log('❌ 问题存在: SQL仍在使用不存在的teachers.name字段');
      } else {
        console.log('✅ 修复成功: SQL没有使用错误的teachers.name字段');
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testSQLFix().then(() => {
  console.log('\n🎉 SQL修复测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 测试过程中发生错误:', error);
  process.exit(1);
});