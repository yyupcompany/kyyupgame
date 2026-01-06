#!/usr/bin/env node

/**
 * 测试工具选择优先级修复效果
 * 验证简单查询是否优先使用read_data_record
 */

const ToolSelectionValidatorService = require('./dist/services/ai/tools/core/tool-selection-validator.service').default;

async function testToolSelectionPriority() {
  console.log('🎯 开始测试工具选择优先级修复效果...\n');

  const validator = ToolSelectionValidatorService;

  // 测试用例：简单实体查询
  const testCases = [
    {
      query: '查询所有班级',
      expectedTool: 'read_data_record',
      description: '简单班级查询应该优先使用read_data_record'
    },
    {
      query: '查询所有学生',
      expectedTool: 'read_data_record',
      description: '简单学生查询应该优先使用read_data_record'
    },
    {
      query: '查询所有教师',
      expectedTool: 'read_data_record',
      description: '简单教师查询应该优先使用read_data_record'
    },
    {
      query: '查询所有活动',
      expectedTool: 'read_data_record',
      description: '简单活动查询应该优先使用read_data_record'
    },
    {
      query: '查询所有男生',
      expectedTool: 'any_query',
      description: '包含过滤条件的查询应该使用any_query'
    },
    {
      query: '按年龄排序查询学生',
      expectedTool: 'any_query',
      description: '包含排序的查询应该使用any_query'
    },
    {
      query: '统计学生数量',
      expectedTool: 'any_query',
      description: '包含统计的查询应该使用any_query'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  console.log('📋 测试用例执行结果:\n');

  for (const testCase of testCases) {
    try {
      const analysis = validator.analyzeQuery(testCase.query);
      const isCorrect = analysis.appropriateTools.includes(testCase.expectedTool);

      if (isCorrect) {
        console.log(`✅ ${testCase.description}`);
        console.log(`   查询: "${testCase.query}"`);
        console.log(`   推荐工具: ${analysis.appropriateTools.join(', ')}`);
        console.log(`   分析原因: ${analysis.reason}\n`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.description}`);
        console.log(`   查询: "${testCase.query}"`);
        console.log(`   期望工具: ${testCase.expectedTool}`);
        console.log(`   实际推荐: ${analysis.appropriateTools.join(', ')}`);
        console.log(`   分析原因: ${analysis.reason}\n`);
      }
    } catch (error) {
      console.log(`💥 ${testCase.description} - 测试执行失败`);
      console.log(`   错误: ${error.message}\n`);
    }
  }

  console.log('🎯 测试结果总结:');
  console.log(`通过测试: ${passedTests}/${totalTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！工具选择优先级修复成功！');
  } else {
    console.log('\n⚠️ 部分测试失败，需要进一步调整工具选择逻辑');
  }

  // 验证权重配置
  console.log('\n📊 验证权重配置:');
  const { TOOL_SELECTION_CONFIG } = require('./dist/services/ai/tools/config/tool-groups.config');
  console.log(`read_data_record权重: ${TOOL_SELECTION_CONFIG.toolWeights.read_data_record}`);
  console.log(`any_query权重: ${TOOL_SELECTION_CONFIG.toolWeights.any_query}`);

  const weightDifference = TOOL_SELECTION_CONFIG.toolWeights.read_data_record - TOOL_SELECTION_CONFIG.toolWeights.any_query;
  if (weightDifference > 0) {
    console.log(`✅ 权重差: ${weightDifference} (read_data_record优先级更高)`);
  } else {
    console.log(`❌ 权重配置有问题: read_data_record应该比any_query权重更高`);
  }
}

// 运行测试
testToolSelectionPriority().then(() => {
  console.log('\n🎉 工具选择优先级测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 测试过程中发生错误:', error);
  process.exit(1);
});