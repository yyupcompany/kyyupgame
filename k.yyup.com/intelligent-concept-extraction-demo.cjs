/**
 * 智能概念提取演示脚本
 * 演示基于豆包1.6 Flash的智能概念提取功能
 */

require('dotenv').config();

async function demonstrateIntelligentConceptExtraction() {
  try {
    console.log('🧠 豆包1.6 Flash智能概念提取演示\n');

    // 动态导入智能概念提取服务
    const { intelligentConceptExtraction } = await import('./server/src/services/memory/intelligent-concept-extraction.service');

    console.log('📋 测试案例 1: 教育管理相关文本');
    console.log('=' .repeat(60));

    const testText1 = `我想了解如何提高幼儿园班级管理效率。作为一名幼儿教师，我需要掌握科学的管理方法，
包括日常活动安排、幼儿行为引导、家园沟通技巧等方面的内容。希望能得到实用且可操作的建议。`;

    console.log('📝 原始文本:');
    console.log(testText1);
    console.log('\n🚀 开始智能概念提取...\n');

    const startTime1 = Date.now();
    const result1 = await intelligentConceptExtraction.extractConceptsIntelligently(testText1, {
      domain: 'education',
      userId: 'demo-user-001'
    });
    const duration1 = Date.now() - startTime1;

    console.log('✅ 提取完成，耗时:', duration1 + 'ms');
    console.log('\n📊 提取结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 领域: ${result1.domain}`);
    console.log(`💭 情感: ${result1.sentiment}`);
    console.log(`📝 摘要: ${result1.summary}`);
    console.log(`🔑 关键主题: ${result1.keyTopics.join(', ')}`);
    console.log(`🧠 概念数量: ${result1.concepts.length}`);

    console.log('\n📚 详细概念:');
    result1.concepts.forEach((concept, index) => {
      console.log(`\n${index + 1}. ${concept.name}`);
      console.log(`   📝 描述: ${concept.description}`);
      console.log(`   🏷️  分类: ${concept.category}`);
      console.log(`   🎯 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
      console.log(`   ⭐ 重要性: ${concept.importance}`);
      if (concept.relationships.length > 0) {
        console.log(`   🔗 关联: ${concept.relationships.join(', ')}`);
      }
      if (concept.examples.length > 0) {
        console.log(`   💡 示例: ${concept.examples.join(', ')}`);
      }
    });

    console.log('\n\n📋 测试案例 2: 技术相关文本');
    console.log('=' .repeat(60));

    const testText2 = `我们计划引入人工智能技术来优化教学管理流程。通过机器学习算法分析学生学习数据，
可以为个性化教育提供数据支持。同时，利用大数据技术可以帮助教师更好地了解每个学生的学习特点和需求。`;

    console.log('📝 原始文本:');
    console.log(testText2);
    console.log('\n🚀 开始智能概念提取...\n');

    const startTime2 = Date.now();
    const result2 = await intelligentConceptExtraction.extractConceptsIntelligently(testText2, {
      domain: 'technology',
      userId: 'demo-user-001',
      previousConcepts: result1.concepts.map(c => c.name)
    });
    const duration2 = Date.now() - startTime2;

    console.log('✅ 提取完成，耗时:', duration2 + 'ms');
    console.log('\n📊 提取结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 领域: ${result2.domain}`);
    console.log(`💭 情感: ${result2.sentiment}`);
    console.log(`📝 摘要: ${result2.summary}`);
    console.log(`🔑 关键主题: ${result2.keyTopics.join(', ')}`);
    console.log(`🧠 概念数量: ${result2.concepts.length}`);

    console.log('\n📚 详细概念:');
    result2.concepts.forEach((concept, index) => {
      console.log(`\n${index + 1}. ${concept.name}`);
      console.log(`   📝 描述: ${concept.description}`);
      console.log(`   🏷️  分类: ${concept.category}`);
      console.log(`   🎯 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
      console.log(`   ⭐ 重要性: ${concept.importance}`);
    });

    console.log('\n\n📋 测试案例 3: 批量概念提取');
    console.log('=' .repeat(60));

    const batchTexts = [
      '幼儿心理健康教育是幼儿园工作的重要组成部分',
      '游戏化教学能够有效提高儿童的学习兴趣和参与度',
      '家园合作是促进幼儿全面发展的关键因素'
    ];

    console.log('📝 批量文本数量:', batchTexts.length);
    console.log('\n🚀 开始批量智能概念提取...\n');

    const startTime3 = Date.now();
    const batchResults = await intelligentConceptExtraction.batchExtractConcepts(batchTexts, {
      domain: 'education',
      userId: 'demo-user-001'
    });
    const duration3 = Date.now() - startTime3;

    console.log('✅ 批量提取完成，总耗时:', duration3 + 'ms');
    console.log('平均每个文本耗时:', Math.round(duration3 / batchTexts.length) + 'ms');

    console.log('\n📊 批量提取结果:');
    batchResults.forEach((result, index) => {
      console.log(`\n文本 ${index + 1}:`);
      console.log(`  - 概念数量: ${result.concepts.length}`);
      console.log(`  - 主要概念: ${result.concepts.slice(0, 3).map(c => c.name).join(', ')}`);
      console.log(`  - 摘要: ${result.summary.substring(0, 50)}...`);
    });

    console.log('\n\n📋 测试案例 4: 概念合并');
    console.log('=' .repeat(60));

    console.log('🚀 开始概念合并...\n');

    const mergedResult = intelligentConceptExtraction.mergeConceptResults([result1, result2, ...batchResults]);

    console.log('✅ 概念合并完成');
    console.log('\n📊 合并后统计:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🧠 总概念数量: ${mergedResult.concepts.length}`);
    console.log(`🎯 合并后领域: ${mergedResult.domain}`);
    console.log(`💭 合并后情感: ${mergedResult.sentiment}`);
    console.log(`🔑 总关键主题: ${mergedResult.keyTopics.length}个`);
    console.log(`📝 综合摘要长度: ${mergedResult.summary.length}字符`);

    console.log('\n🏆 高置信度概念 (置信度 > 0.8):');
    const highConfidenceConcepts = mergedResult.concepts
      .filter(c => c.confidence > 0.8)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    highConfidenceConcepts.forEach((concept, index) => {
      console.log(`${index + 1}. ${concept.name} (${(concept.confidence * 100).toFixed(1)}%) - ${concept.category}`);
    });

    console.log('\n🎖️ 高重要性概念:');
    const highImportanceConcepts = mergedResult.concepts
      .filter(c => c.importance === 'high')
      .slice(0, 5);

    highImportanceConcepts.forEach((concept, index) => {
      console.log(`${index + 1}. ${concept.name} (${concept.importance}) - ${concept.category}`);
    });

    console.log('\n✅ 智能概念提取演示完成!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 关键特性展示:');
    console.log('   🚀 基于豆包1.6 Flash的快速智能提取');
    console.log('   🧠 自动概念分类和置信度评估');
    console.log('   🔗 概念关系识别');
    console.log('   📊 情感分析和领域识别');
    console.log('   🔄 批量处理和概念合并');
    console.log('   ⚡ 高性能处理能力');

    console.log('\n📈 性能统计:');
    console.log(`   ⏱️  单文本处理: ${duration1}ms, ${duration2}ms`);
    console.log(`   📦 批量处理: ${duration3}ms (${batchTexts.length}个文本)`);
    console.log(`   🧠 概念提取: ${mergedResult.concepts.length}个高质量概念`);

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
    console.error('详细错误:', error);
  }
}

demonstrateIntelligentConceptExtraction();