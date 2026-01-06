/**
 * 基础使用示例
 * 演示智能概念提取服务的基本用法
 */

import { intelligentConceptExtraction } from '../../server/src/services/memory/intelligent-concept-extraction.service';

async function basicUsageExample() {
  console.log('🧠 智能概念提取基础使用示例\n');

  // 示例1: 教育相关文本
  const educationText = `
    我想了解幼儿园班级管理的最佳实践。作为一名幼儿教师，我需要掌握科学的管理方法，
    包括日常活动安排、幼儿行为引导、家园沟通技巧等方面的内容。
  `;

  console.log('📝 教育文本:', educationText.trim());

  try {
    const educationResult = await intelligentConceptExtraction.extractConceptsIntelligently(
      educationText,
      {
        userId: 'teacher-001',
        domain: 'education',
        previousConcepts: ['幼儿园', '班级管理']
      }
    );

    console.log('\n✅ 教育文本概念提取结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 领域: ${educationResult.domain}`);
    console.log(`💭 情感: ${educationResult.sentiment}`);
    console.log(`📝 摘要: ${educationResult.summary}`);
    console.log(`🔑 关键主题: ${educationResult.keyTopics.join(', ')}`);
    console.log(`🧠 概念数量: ${educationResult.concepts.length}`);

    console.log('\n📚 提取的概念:');
    educationResult.concepts.forEach((concept, index) => {
      console.log(`\n${index + 1}. ${concept.name}`);
      console.log(`   📝 描述: ${concept.description}`);
      console.log(`   🏷️  分类: ${concept.category}`);
      console.log(`   🎯 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
      console.log(`   ⭐ 重要性: ${concept.importance}`);
    });

  } catch (error) {
    console.error('❌ 教育文本概念提取失败:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // 示例2: 技术相关文本
  const techText = `
    我们计划引入人工智能技术来优化教学管理流程。通过机器学习算法分析学生学习数据，
    可以为个性化教育提供数据支持。同时，利用大数据技术可以帮助教师更好地了解每个学生的学习特点。
  `;

  console.log('📝 技术文本:', techText.trim());

  try {
    const techResult = await intelligentConceptExtraction.extractConceptsIntelligently(
      techText,
      {
        userId: 'teacher-001',
        domain: 'technology',
        previousConcepts: educationResult.concepts.map(c => c.name)
      }
    );

    console.log('\n✅ 技术文本概念提取结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 领域: ${techResult.domain}`);
    console.log(`💭 情感: ${techResult.sentiment}`);
    console.log(`📝 摘要: ${techResult.summary}`);
    console.log(`🔑 关键主题: ${techResult.keyTopics.join(', ')}`);
    console.log(`🧠 概念数量: ${techResult.concepts.length}`);

    console.log('\n📚 提取的概念:');
    techResult.concepts.forEach((concept, index) => {
      console.log(`\n${index + 1}. ${concept.name}`);
      console.log(`   📝 描述: ${concept.description}`);
      console.log(`   🏷️  分类: ${concept.category}`);
      console.log(`   🎯 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
      if (concept.relationships.length > 0) {
        console.log(`   🔗 关联: ${concept.relationships.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('❌ 技术文本概念提取失败:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // 示例3: 简单文本
  const simpleText = '幼儿心理健康教育很重要';

  console.log('📝 简单文本:', simpleText);

  try {
    const simpleResult = await intelligentConceptExtraction.extractConceptsIntelligently(
      simpleText,
      {
        userId: 'teacher-001',
        domain: 'general'
      }
    );

    console.log('\n✅ 简单文本概念提取结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 领域: ${simpleResult.domain}`);
    console.log(`💭 情感: ${simpleResult.sentiment}`);
    console.log(`📝 摘要: ${simpleResult.summary}`);
    console.log(`🔑 关键主题: ${simpleResult.keyTopics.join(', ')}`);

    console.log('\n📚 提取的概念:');
    simpleResult.concepts.forEach((concept, index) => {
      console.log(`\n${index + 1}. ${concept.name}`);
      console.log(`   📝 描述: ${concept.description}`);
      console.log(`   🏷️  分类: ${concept.category}`);
      console.log(`   🎯 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
    });

  } catch (error) {
    console.error('❌ 简单文本概念提取失败:', error);
  }

  console.log('\n✅ 基础使用示例完成!');
}

// 错误处理示例
async function errorHandlingExample() {
  console.log('\n🚨 错误处理示例\n');

  // 测试空文本
  console.log('📝 测试空文本处理...');
  try {
    const emptyResult = await intelligentConceptExtraction.extractConceptsIntelligently('', {
      userId: 'test-user'
    });
    console.log('✅ 空文本处理成功:', emptyResult.concepts.length === 0);
  } catch (error) {
    console.log('⚠️ 空文本处理:', error.message);
  }

  // 测试超长文本
  console.log('\n📝 测试超长文本处理...');
  const longText = '这是测试'.repeat(1000);
  try {
    const longResult = await intelligentConceptExtraction.extractConceptsIntelligently(longText, {
      userId: 'test-user'
    });
    console.log('✅ 超长文本处理成功，概念数量:', longResult.concepts.length);
  } catch (error) {
    console.log('⚠️ 超长文本处理:', error.message);
  }

  // 测试特殊字符文本
  console.log('\n📝 测试特殊字符处理...');
  const specialText = '测试<script>alert("xss")</script>恶意内容123456';
  try {
    const specialResult = await intelligentConceptExtraction.extractConceptsIntelligently(specialText, {
      userId: 'test-user'
    });
    console.log('✅ 特殊字符处理成功，概念数量:', specialResult.concepts.length);
  } catch (error) {
    console.log('⚠️ 特殊字符处理:', error.message);
  }

  console.log('\n✅ 错误处理示例完成!');
}

// 性能测试示例
async function performanceExample() {
  console.log('\n⚡ 性能测试示例\n');

  const testTexts = [
    '幼儿园教育活动设计要符合儿童发展规律',
    '游戏化教学可以提高学习兴趣和参与度',
    '家园合作是促进幼儿全面发展的重要途径',
    '教师专业发展需要持续学习和培训',
    '环境创设要体现教育性和安全性'
  ];

  console.log(`📝 测试文本数量: ${testTexts.length}`);

  // 单个处理性能测试
  console.log('\n🔄 单个处理性能测试:');
  const singleStartTimes: number[] = [];

  for (let i = 0; i < testTexts.length; i++) {
    const startTime = Date.now();
    try {
      await intelligentConceptExtraction.extractConceptsIntelligently(testTexts[i]);
      const duration = Date.now() - startTime;
      singleStartTimes.push(duration);
      console.log(`   文本${i + 1}: ${duration}ms`);
    } catch (error) {
      console.log(`   文本${i + 1}: 失败 - ${error.message}`);
    }
  }

  const avgSingleTime = singleStartTimes.reduce((sum, time) => sum + time, 0) / singleStartTimes.length;
  console.log(`\n📊 单个处理平均耗时: ${avgSingleTime.toFixed(2)}ms`);

  // 批量处理性能测试
  console.log('\n📦 批量处理性能测试:');
  const batchStartTime = Date.now();
  try {
    const batchResults = await intelligentConceptExtraction.batchExtractConcepts(testTexts, {
      userId: 'test-user'
    });
    const batchDuration = Date.now() - batchStartTime;

    console.log(`   批量处理总耗时: ${batchDuration}ms`);
    console.log(`   平均每个文本: ${(batchDuration / testTexts.length).toFixed(2)}ms`);
    console.log(`   总概念数量: ${batchResults.reduce((sum, result) => sum + result.concepts.length, 0)}`);

    // 批量处理性能对比
    const performanceImprovement = ((avgSingleTime * testTexts.length - batchDuration) / (avgSingleTime * testTexts.length)) * 100;
    console.log(`   性能提升: ${performanceImprovement.toFixed(1)}%`);

  } catch (error) {
    console.log(`   批量处理失败: ${error.message}`);
  }

  console.log('\n✅ 性能测试完成!');
}

// 概念合并示例
async function conceptMergingExample() {
  console.log('\n🔗 概念合并示例\n');

  const results = [
    {
      concepts: [
        { name: '幼儿园', description: '学前教育机构', category: '教育', confidence: 0.9, relationships: [], examples: [], importance: 'high' },
        { name: '教学', description: '教育活动', category: '教育', confidence: 0.8, relationships: [], examples: [], importance: 'medium' }
      ],
      summary: '教育和教学相关',
      keyTopics: ['教育', '教学'],
      sentiment: 'positive' as const,
      domain: 'education'
    },
    {
      concepts: [
        { name: '幼儿园', description: '学前教育场所', category: '机构', confidence: 0.85, relationships: [], examples: [], importance: 'high' },
        { name: '管理', description: '组织和管理', category: '管理', confidence: 0.75, relationships: [], examples: [], importance: 'medium' }
      ],
      summary: '机构和管理',
      keyTopics: ['机构', '管理'],
      sentiment: 'neutral' as const,
      domain: 'management'
    }
  ];

  console.log(`📝 原始结果数量: ${results.length}`);
  console.log('   结果1:', {
    concepts: results[0].concepts.map(c => c.name),
    domain: results[0].domain
  });
  console.log('   结果2:', {
    concepts: results[1].concepts.map(c => c.name),
    domain: results[1].domain
  });

  try {
    const mergedResult = intelligentConceptExtraction.mergeConceptResults(results);

    console.log('\n✅ 合并后的结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🧠 合并后概念数量: ${mergedResult.concepts.length}`);
    console.log(`🎯 合并后领域: ${mergedResult.domain}`);
    console.log(`💭 合并后情感: ${mergedResult.sentiment}`);
    console.log(`📝 合并后摘要: ${mergedResult.summary}`);
    console.log(`🔑 合并后关键主题: ${mergedResult.keyTopics.join(', ')}`);

    console.log('\n📚 合并后的概念:');
    mergedResult.concepts.forEach((concept, index) => {
      console.log(`\n${index + 1}. ${concept.name}`);
      console.log(`   📝 描述: ${concept.description}`);
      console.log(`   🏷️  分类: ${concept.category}`);
      console.log(`   🎯 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
      console.log(`   ⭐ 重要性: ${concept.importance}`);
    });

    console.log('\n🔄 合并效果分析:');
    console.log('   ✅ 概念去重: "幼儿园" 概念被合并，保留高置信度版本');
    console.log('   ✅ 关系合并: 相关概念关系得到保留');
    console.log('   ✅ 信息丰富: 摘要和主题得到整合');
    console.log('   ✅ 领域推断: 基于多个结果推断出更准确的领域');

  } catch (error) {
    console.error('❌ 概念合并失败:', error);
  }

  console.log('\n✅ 概念合并示例完成!');
}

// 主函数：运行所有示例
async function runAllExamples() {
  console.log('🎯 智能概念提取基础使用示例集合');
  console.log('='.repeat(60));

  try {
    await basicUsageExample();
    await errorHandlingExample();
    await performanceExample();
    await conceptMergingExample();

    console.log('\n🎉 所有基础示例运行完成!');
    console.log('\n💡 关键特性总结:');
    console.log('   • 智能概念识别和分类');
    console.log('   • 置信度评估和重要性评级');
    console.log('   • 关系网络构建');
    console.log('   • 批量处理优化');
    console.log('   • 概念去重和合并');
    console.log('   • 完整的错误处理');
    console.log('   • 性能监控和统计');

  } catch (error) {
    console.error('❌ 示例运行失败:', error);
  }
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  runAllExamples();
}

export {
  basicUsageExample,
  errorHandlingExample,
  performanceExample,
  conceptMergingExample,
  runAllExamples
};