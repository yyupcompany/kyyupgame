/**
 * 高级概念提取示例
 * 演示智能概念提取服务的高级用法和复杂场景
 */

import { intelligentConceptExtraction } from '../../server/src/services/memory/intelligent-concept-extraction.service';
import { SixDimensionMemorySystem } from '../../server/src/services/memory/six-dimension-memory.service';

/**
 * 高级示例1: 多轮对话概念累积
 */
async function multiTurnConversationConceptAccumulation() {
  console.log('🔄 多轮对话概念累积示例\n');

  const userId = 'advanced-user-001';
  const conversationId = 'multi-turn-conversation';
  const memorySystem = new SixDimensionMemorySystem();

  // 模拟多轮对话
  const conversation = [
    '我想了解幼儿园班级管理的基本原则',
    '特别是如何处理孩子之间的冲突',
    '还有怎样与家长进行有效沟通',
    '希望了解一些实际的管理技巧和方法',
    '这些方法在不同年龄段的孩子中有什么差异'
  ];

  console.log('📝 开始多轮对话...');

  for (let i = 0; i < conversation.length; i++) {
    const message = conversation[i];
    console.log(`\n--- 第${i + 1}轮对话 ---`);
    console.log('用户:', message);

    try {
      // 记录对话（自动触发概念提取）
      await memorySystem.recordConversation('user', message, {
        userId,
        conversationId,
        sessionId: `session-${i}`,
        turnNumber: i + 1
      });

      // 获取当前的概念状态
      const currentConcepts = await memorySystem.searchConcepts('班级管理', 20, userId);
      console.log(`当前已提取概念数: ${currentConcepts.length}`);

      // 显示最新提取的高置信度概念
      const newConcepts = currentConcepts.filter(c =>
        c.metadata?.extractedAt &&
        new Date(c.metadata.extractedAt).getTime() > Date.now() - 10000 // 最近10秒
      );

      if (newConcepts.length > 0) {
        console.log('🆕 新提取的概念:');
        newConcepts.forEach(concept => {
          console.log(`  • ${concept.name} (${concept.category}) - 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
        });
      }

      // 模拟AI回复
      const aiResponse = `关于${message.substring(0, 20)}...，我建议您可以考虑以下几个方面...`;
      await memorySystem.recordConversation('assistant', aiResponse, {
        userId,
        conversationId,
        sessionId: `session-${i}`,
        turnNumber: i + 1
      });

      // 添加延迟模拟真实对话节奏
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`第${i + 1}轮对话处理失败:`, error.message);
    }
  }

  // 分析最终的概念网络
  console.log('\n📊 最终概念网络分析:');
  const finalConcepts = await memorySystem.searchConcepts('', 50, userId);

  // 按类别分组概念
  const conceptsByCategory = finalConcepts.reduce((acc, concept) => {
    const category = concept.category || '未分类';
    if (!acc[category]) acc[category] = [];
    acc[category].push(concept);
    return acc;
  }, {} as Record<string, any[]>);

  Object.entries(conceptsByCategory).forEach(([category, concepts]) => {
    console.log(`\n🏷️  ${category} (${concepts.length}个概念):`);
    concepts.forEach(concept => {
      const confidence = (concept.confidence * 100).toFixed(1);
      const importance = concept.metadata?.importance || 'medium';
      console.log(`    • ${concept.name} - 置信度: ${confidence}%, 重要性: ${importance}`);
    });
  });

  // 构建完整的记忆上下文
  const memoryContext = await memorySystem.getMemoryContext(userId, '班级管理', {
    timeWindow: 1, // 1小时内的记忆
    maxConversations: 20,
    conceptLimit: 30
  });

  console.log('\n🧠 记忆上下文摘要:');
  console.log(`  • 总记忆数: ${memoryContext.totalMemories}`);
  console.log(`  • 相关对话: ${memoryContext.recentConversations.length}条`);
  console.log(`  • 关联概念: ${memoryContext.relevantConcepts.length}个`);
  console.log(`  • 上下文相关性: ${(memoryContext.relevanceScore * 100).toFixed(1)}%`);
  console.log(`  • 摘要: ${memoryContext.summary}`);
}

/**
 * 高级示例2: 跨领域概念关联分析
 */
async function crossDomainConceptAssociation() {
  console.log('\n🔗 跨领域概念关联分析示例\n');

  // 跨领域文本样本
  const crossDomainTexts = [
    {
      domain: 'education',
      text: '我们计划引入游戏化教学方法来提升幼儿的学习兴趣和参与度',
      context: { userId: 'edu-user-001', domain: 'education' }
    },
    {
      domain: 'technology',
      text: '通过人工智能技术分析学生的学习行为数据，可以为个性化教育提供支持',
      context: { userId: 'tech-user-001', domain: 'technology' }
    },
    {
      domain: 'management',
      text: '建立科学的教师评估体系有助于提升整体教学质量和管理水平',
      context: { userId: 'mgmt-user-001', domain: 'management' }
    },
    {
      domain: 'psychology',
      text: '了解儿童心理发展规律对设计合适的教育活动至关重要',
      context: { userId: 'psych-user-001', domain: 'psychology' }
    }
  ];

  console.log('📊 分析跨领域概念提取结果:');

  const allResults = [];

  for (const sample of crossDomainTexts) {
    console.log(`\n--- ${sample.domain.toUpperCase()} 领域 ---`);
    console.log('文本:', sample.text);

    try {
      const result = await intelligentConceptExtraction.extractConceptsIntelligently(
        sample.text,
        sample.context
      );

      allResults.push(result);

      console.log(`🎯 识别领域: ${result.domain}`);
      console.log(`💭 情感倾向: ${result.sentiment}`);
      console.log(`🔑 关键主题: ${result.keyTopics.join(', ')}`);
      console.log(`🧠 概念数量: ${result.concepts.length}`);

      // 显示高置信度概念
      const highConfidenceConcepts = result.concepts.filter(c => c.confidence > 0.8);
      if (highConfidenceConcepts.length > 0) {
        console.log('⭐ 高置信度概念:');
        highConfidenceConcepts.forEach(concept => {
          console.log(`    • ${concept.name} (${concept.category}) - ${(concept.confidence * 100).toFixed(1)}%`);
          if (concept.relationships.length > 0) {
            console.log(`      关联: ${concept.relationships.join(', ')}`);
          }
        });
      }

    } catch (error) {
      console.error(`❌ ${sample.domain}领域分析失败:`, error.message);
    }
  }

  // 分析跨领域概念关联
  console.log('\n🔍 跨领域概念关联分析:');

  const mergedResult = intelligentConceptExtraction.mergeConceptResults(allResults);
  const conceptMap = new Map<string, any[]>();

  // 构建概念到领域的映射
  allResults.forEach((result, index) => {
    const domain = crossDomainTexts[index].domain;
    result.concepts.forEach(concept => {
      if (!conceptMap.has(concept.name)) {
        conceptMap.set(concept.name, []);
      }
      conceptMap.get(concept.name).push({
        domain,
        confidence: concept.confidence,
        category: concept.category,
        importance: concept.importance
      });
    });
  });

  // 识别跨领域共享概念
  console.log('\n🌐 跨领域共享概念:');
  conceptMap.forEach((occurrences, conceptName) => {
    if (occurrences.length > 1) {
      console.log(`\n📌 ${conceptName} (出现在${occurrences.length}个领域):`);
      occurrences.forEach(occ => {
        console.log(`    • ${occ.domain}: 置信度${(occ.confidence * 100).toFixed(1)}%, ${occ.category}, 重要性${occ.importance}`);
      });

      // 计算概念的平均置信度
      const avgConfidence = occurrences.reduce((sum, occ) => sum + occ.confidence, 0) / occurrences.length;
      console.log(`    📊 平均置信度: ${(avgConfidence * 100).toFixed(1)}%`);
    }
  });

  // 显示最终合并结果
  console.log('\n🎯 合并后的核心概念:');
  mergedResult.concepts
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10)
    .forEach((concept, index) => {
      console.log(`${index + 1}. ${concept.name} - ${(concept.confidence * 100).toFixed(1)}% (${concept.category})`);
    });
}

/**
 * 高级示例3: 动态上下文感知的概念提取
 */
async function dynamicContextAwareExtraction() {
  console.log('\n🧠 动态上下文感知概念提取示例\n');

  const userId = 'context-aware-user';
  const memorySystem = new SixDimensionMemorySystem();

  // 第一阶段：建立基础上下文
  console.log('📚 第一阶段：建立教育背景上下文');

  const backgroundTexts = [
    '我是一名幼儿园教师，有5年的教学经验',
    '主要担任中班的教学工作，班级有25个孩子',
    '我对蒙台梭利教育法比较熟悉',
    '学校最近在推广STEM教育理念'
  ];

  for (const text of backgroundTexts) {
    await memorySystem.recordConversation('user', text, {
      userId,
      conversationId: 'background',
      sessionId: 'background-session'
    });

    console.log('✅ 背景信息已记录:', text.substring(0, 30) + '...');
  }

  // 获取已建立的概念
  const existingConcepts = await memorySystem.searchConcepts('', 30, userId);
  const existingConceptNames = existingConcepts.map(c => c.name);

  console.log(`📋 已建立背景概念: ${existingConceptNames.length}个`);
  console.log('   ' + existingConceptNames.slice(0, 8).join(', ') + (existingConceptNames.length > 8 ? '...' : ''));

  // 第二阶段：基于上下文的智能提取
  console.log('\n🎯 第二阶段：基于上下文的智能概念提取');

  const queryText = '我想知道如何将游戏化学习应用到日常教学中';

  console.log('📝 查询文本:', queryText);

  // 构建增强的上下文
  const enhancedContext = {
    userId,
    domain: 'education',
    previousConcepts: existingConceptNames,
    userProfile: {
      role: '幼儿园教师',
      experience: '5年',
      specialization: '中班教学',
      familiarity: ['蒙台梭利', 'STEM教育']
    }
  };

  try {
    // 带上下文的概念提取
    const contextAwareResult = await intelligentConceptExtraction.extractConceptsIntelligently(
      queryText,
      enhancedContext
    );

    // 无上下文的概念提取（作为对比）
    const baselineResult = await intelligentConceptExtraction.extractConceptsIntelligently(
      queryText,
      { userId: 'baseline-user' }
    );

    console.log('\n📊 对比分析结果:');

    console.log('\n--- 基于上下文的提取 ---');
    console.log(`🎯 识别领域: ${contextAwareResult.domain}`);
    console.log(`🧠 概念数量: ${contextAwareResult.concepts.length}`);
    console.log(`🔑 关键主题: ${contextAwareResult.keyTopics.join(', ')}`);
    contextAwareResult.concepts.forEach((concept, index) => {
      console.log(`${index + 1}. ${concept.name} - ${(concept.confidence * 100).toFixed(1)}% (${concept.category})`);
    });

    console.log('\n--- 基础提取（无上下文） ---');
    console.log(`🎯 识别领域: ${baselineResult.domain}`);
    console.log(`🧠 概念数量: ${baselineResult.concepts.length}`);
    console.log(`🔑 关键主题: ${baselineResult.keyTopics.join(', ')}`);
    baselineResult.concepts.forEach((concept, index) => {
      console.log(`${index + 1}. ${concept.name} - ${(concept.confidence * 100).toFixed(1)}% (${concept.category})`);
    });

    // 分析上下文带来的改进
    console.log('\n📈 上下文带来的改进分析:');
    console.log(`• 概念数量变化: ${baselineResult.concepts.length} → ${contextAwareResult.concepts.length}`);
    console.log(`• 领域识别: ${baselineResult.domain} → ${contextAwareResult.domain}`);
    console.log(`• 关键主题数量: ${baselineResult.keyTopics.length} → ${contextAwareResult.keyTopics.length}`);

    // 检查是否有与背景概念相关的提取
    const contextRelatedConcepts = contextAwareResult.concepts.filter(concept =>
      existingConceptNames.some(existing =>
        concept.name.toLowerCase().includes(existing.toLowerCase()) ||
        existing.toLowerCase().includes(concept.name.toLowerCase()) ||
        concept.relationships.some(rel => existingConceptNames.includes(rel))
      )
    );

    if (contextRelatedConcepts.length > 0) {
      console.log(`\n🔗 与背景相关的概念 (${contextRelatedConcepts.length}个):`);
      contextRelatedConcepts.forEach(concept => {
        console.log(`  • ${concept.name} - ${(concept.confidence * 100).toFixed(1)}%`);
        concept.relationships.forEach(rel => {
          if (existingConceptNames.includes(rel)) {
            console.log(`    ↳ 关联到: ${rel}`);
          }
        });
      });
    }

  } catch (error) {
    console.error('❌ 上下文感知提取失败:', error.message);
  }
}

/**
 * 高级示例4: 实时概念质量监控和调整
 */
async function realTimeConceptQualityMonitoring() {
  console.log('\n📊 实时概念质量监控和调整示例\n');

  const userId = 'quality-monitor-user';
  const testTexts = [
    '幼儿园班级管理需要考虑很多因素',
    '游戏化教学可以提高孩子的学习兴趣',
    '家园沟通对孩子的成长非常重要',
    '教师专业发展是教育质量的关键',
    '个性化教育是未来的发展趋势'
  ];

  const qualityMetrics = [];
  let totalProcessingTime = 0;

  console.log('🔄 开始批量概念质量监控...');

  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    console.log(`\n--- 处理文本 ${i + 1}/${testTexts.length} ---`);
    console.log('📝 文本:', text);

    const startTime = Date.now();

    try {
      const result = await intelligentConceptExtraction.extractConceptsIntelligently(text, {
        userId,
        previousConcepts: qualityMetrics.flatMap(m => m.concepts).map(c => c.name)
      });

      const processingTime = Date.now() - startTime;
      totalProcessingTime += processingTime;

      // 计算质量指标
      const avgConfidence = result.concepts.reduce((sum, c) => sum + c.confidence, 0) / result.concepts.length;
      const highImportanceCount = result.concepts.filter(c => c.importance === 'high').length;
      const relationshipCount = result.concepts.reduce((sum, c) => sum + c.relationships.length, 0);

      const qualityScore = (
        (avgConfidence * 0.4) +                    // 平均置信度权重40%
        (result.concepts.length / 10 * 0.2) +      // 概念数量权重20%
        (highImportanceCount / result.concepts.length * 0.2) + // 高重要性比例权重20%
        (Math.min(relationshipCount / 5, 1) * 0.2) // 关系数量权重20%
      );

      const metrics = {
        textIndex: i + 1,
        text: text.substring(0, 30) + '...',
        processingTime,
        conceptCount: result.concepts.length,
        avgConfidence,
        highImportanceCount,
        relationshipCount,
        qualityScore,
        domain: result.domain,
        sentiment: result.sentiment
      };

      qualityMetrics.push(metrics);

      console.log(`⏱️  处理时间: ${processingTime}ms`);
      console.log(`🧠 概念数量: ${result.concepts.length}`);
      console.log(`📊 平均置信度: ${(avgConfidence * 100).toFixed(1)}%`);
      console.log(`⭐ 高重要性概念: ${highImportanceCount}个`);
      console.log(`🔗 关系数量: ${relationshipCount}个`);
      console.log(`📈 质量评分: ${(qualityScore * 100).toFixed(1)}%`);
      console.log(`🎯 识别领域: ${result.domain}`);
      console.log(`💭 情感倾向: ${result.sentiment}`);

      // 实时质量预警
      if (qualityScore < 0.6) {
        console.log('⚠️  质量预警: 概念提取质量较低，建议优化');
      }
      if (processingTime > 3000) {
        console.log('⚠️  性能预警: 处理时间过长，建议检查网络或API状态');
      }

    } catch (error) {
      console.error(`❌ 文本 ${i + 1} 处理失败:`, error.message);
    }
  }

  // 生成质量报告
  console.log('\n📊 批量处理质量报告');
  console.log('='.repeat(50));

  const avgProcessingTime = totalProcessingTime / testTexts.length;
  const avgQualityScore = qualityMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / qualityMetrics.length;
  const totalConcepts = qualityMetrics.reduce((sum, m) => sum + m.conceptCount, 0);

  console.log(`📈 整体统计:`);
  console.log(`  • 平均处理时间: ${avgProcessingTime.toFixed(0)}ms`);
  console.log(`  • 平均质量评分: ${(avgQualityScore * 100).toFixed(1)}%`);
  console.log(`  • 总概念数量: ${totalConcepts}个`);
  console.log(`  • 平均每文本概念数: ${(totalConcepts / testTexts.length).toFixed(1)}个`);

  // 按质量评分排序
  const sortedByQuality = [...qualityMetrics].sort((a, b) => b.qualityScore - a.qualityScore);

  console.log(`\n🏆 质量排名 (前3名):`);
  sortedByQuality.slice(0, 3).forEach((metric, index) => {
    console.log(`${index + 1}. "${metric.text}" - ${(metric.qualityScore * 100).toFixed(1)}%`);
  });

  // 领域分布统计
  const domainStats = qualityMetrics.reduce((acc, metric) => {
    if (!acc[metric.domain]) {
      acc[metric.domain] = { count: 0, avgQuality: 0, totalQuality: 0 };
    }
    acc[metric.domain].count++;
    acc[metric.domain].totalQuality += metric.qualityScore;
    acc[metric.domain].avgQuality = acc[metric.domain].totalQuality / acc[metric.domain].count;
    return acc;
  }, {} as Record<string, any>);

  console.log(`\n🎯 领域分布统计:`);
  Object.entries(domainStats).forEach(([domain, stats]: [string, any]) => {
    console.log(`  • ${domain}: ${stats.count}次, 平均质量${(stats.avgQuality * 100).toFixed(1)}%`);
  });

  // 性能优化建议
  console.log(`\n💡 性能优化建议:`);
  if (avgProcessingTime > 2000) {
    console.log('  • 建议启用批量处理以减少平均处理时间');
  }
  if (avgQualityScore < 0.7) {
    console.log('  • 建议调整提示词参数以提高概念提取质量');
  }
  if (totalConcepts / testTexts.length < 3) {
    console.log('  • 建议增加上下文信息以提取更多相关概念');
  }
}

/**
 * 高级示例5: 智能概念去重和合并策略
 */
async function intelligentConceptDeduplicationAndMerging() {
  console.log('\n🔀 智能概念去重和合并策略示例\n');

  // 模拟从多个来源提取的相似概念
  const multipleSources = [
    {
      source: 'education-textbook',
      concepts: [
        { name: '班级管理', description: '幼儿园班级的组织和管理工作', category: '教育管理', confidence: 0.9, relationships: ['教学活动', '幼儿行为'], examples: ['晨间管理', '活动安排'], importance: 'high' },
        { name: '游戏化学习', description: '通过游戏方式进行教学', category: '教学方法', confidence: 0.85, relationships: ['学习兴趣', '参与度'], examples: ['角色扮演', '益智游戏'], importance: 'high' },
        { name: '家园沟通', description: '幼儿园与家庭的交流合作', category: '家园协作', confidence: 0.88, relationships: ['家长', '学生发展'], examples: ['家长会', '联系册'], importance: 'high' }
      ]
    },
    {
      source: 'teacher-experience',
      concepts: [
        { name: '班级管理', description: '管理幼儿园班级日常事务', category: '管理方法', confidence: 0.82, relationships: ['纪律管理', '时间安排'], examples: ['排队管理', '作息管理'], importance: 'high' },
        { name: '游戏教学', description: '运用游戏元素进行教学', category: '教学策略', confidence: 0.79, relationships: ['趣味性', '学习效果'], examples: ['数学游戏', '语言游戏'], importance: 'medium' },
        { name: '家校合作', description: '学校和家庭之间的教育合作', category: '合作关系', confidence: 0.86, relationships: ['教育理念', '成长记录'], examples: ['家访', '成长档案'], importance: 'high' }
      ]
    },
    {
      source: 'research-paper',
      concepts: [
        { name: '班级管理策略', description: '科学的班级组织与管理方法', category: '教育研究', confidence: 0.91, relationships: ['管理理论', '实践应用'], examples: ['分层管理', '民主管理'], importance: 'high' },
        { name: '游戏化教育', description: '将游戏机制融入教育过程', category: '教育创新', confidence: 0.87, relationships: ['动机理论', '认知发展'], examples: ['积分系统', '成就机制'], importance: 'high' },
        { name: '家园共育', description: '家庭和幼儿园共同参与教育', category: '教育理念', confidence: 0.89, relationships: ['教育一致性', '环境融合'], examples: ['亲子活动', '教育讲座'], importance: 'high' }
      ]
    }
  ];

  console.log('📚 多来源概念提取结果:');

  multipleSources.forEach((source, index) => {
    console.log(`\n--- 来源 ${index + 1}: ${source.source} ---`);
    source.concepts.forEach((concept, conceptIndex) => {
      console.log(`${conceptIndex + 1}. ${concept.name} - ${(concept.confidence * 100).toFixed(1)}% (${concept.category})`);
      console.log(`   ${concept.description}`);
      if (concept.relationships.length > 0) {
        console.log(`   关联: ${concept.relationships.join(', ')}`);
      }
    });
  });

  // 智能去重和合并
  console.log('\n🔄 执行智能去重和合并...');

  const conceptMap = new Map<string, any[]>();

  // 首先按相似度分组概念
  multipleSources.forEach(source => {
    source.concepts.forEach(concept => {
      // 查找相似概念（基于名称相似度）
      let foundGroup = false;

      for (const [key, existingConcepts] of conceptMap.entries()) {
        const similarity = calculateConceptSimilarity(concept.name, key);
        if (similarity > 0.7) { // 相似度阈值
          existingConcepts.push({ ...concept, source: source.source });
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        conceptMap.set(concept.name, [{ ...concept, source: source.source }]);
      }
    });
  });

  // 合并每个概念组
  const mergedConcepts = [];

  conceptMap.forEach((conceptGroup, representativeName) => {
    console.log(`\n🔗 合并概念组: "${representativeName}" (${conceptGroup.length}个相似概念)`);

    // 选择最佳名称（基于置信度和频率）
    const bestConcept = conceptGroup.reduce((best, current) => {
      const bestScore = best.confidence * (conceptGroup.filter(c => c.name === best.name).length);
      const currentScore = current.confidence * (conceptGroup.filter(c => c.name === current.name).length);
      return currentScore > bestScore ? current : best;
    });

    // 合并描述
    const descriptions = conceptGroup.map(c => c.description);
    const mergedDescription = mergeDescriptions(descriptions);

    // 合并关系（去重）
    const allRelationships = conceptGroup.flatMap(c => c.relationships);
    const uniqueRelationships = [...new Set(allRelationships)];

    // 合并示例（去重）
    const allExamples = conceptGroup.flatMap(c => c.examples || []);
    const uniqueExamples = [...new Set(allExamples)];

    // 计算合并后的置信度（加权平均）
    const mergedConfidence = conceptGroup.reduce((sum, c) => sum + c.confidence, 0) / conceptGroup.length;

    // 确定最佳分类（基于出现频率和置信度）
    const categoryScores = {};
    conceptGroup.forEach(c => {
      if (!categoryScores[c.category]) categoryScores[c.category] = { count: 0, totalConfidence: 0 };
      categoryScores[c.category].count++;
      categoryScores[c.category].totalConfidence += c.confidence;
    });

    const bestCategory = Object.entries(categoryScores).reduce((best, [category, scores]: [string, any]) => {
      const bestScore = categoryScores[best[0]].count * categoryScores[best[0]].totalConfidence;
      const currentScore = scores.count * scores.totalConfidence;
      return currentScore > bestScore ? category : best[0];
    }, Object.keys(categoryScores)[0]);

    const mergedConcept = {
      name: bestConcept.name,
      description: mergedDescription,
      category: bestCategory,
      confidence: mergedConfidence,
      relationships: uniqueRelationships,
      examples: uniqueExamples,
      importance: bestConcept.importance,
      sources: conceptGroup.map(c => c.source),
      originalConcepts: conceptGroup.length
    };

    mergedConcepts.push(mergedConcept);

    console.log(`  ✅ 最佳名称: ${mergedConcept.name}`);
    console.log(`  📝 合并描述: ${mergedConcept.description.substring(0, 60)}...`);
    console.log(`  🏷️  最终分类: ${mergedConcept.category}`);
    console.log(`  🎯 合并置信度: ${(mergedConcept.confidence * 100).toFixed(1)}%`);
    console.log(`  🔗 关系数量: ${mergedConcept.relationships.length}个`);
    console.log(`  📚 来源数量: ${mergedConcept.sources.length}个`);
  });

  // 最终结果统计
  console.log('\n📊 合并结果统计:');
  const originalConceptCount = multipleSources.reduce((sum, source) => sum + source.concepts.length, 0);
  const reductionRate = ((originalConceptCount - mergedConcepts.length) / originalConceptCount * 100).toFixed(1);

  console.log(`  • 原始概念数: ${originalConceptCount}个`);
  console.log(`  • 合并后概念数: ${mergedConcepts.length}个`);
  console.log(`  • 去重率: ${reductionRate}%`);

  console.log('\n🏆 最终高质量概念列表:');
  mergedConcepts
    .sort((a, b) => b.confidence - a.confidence)
    .forEach((concept, index) => {
      console.log(`${index + 1}. ${concept.name}`);
      console.log(`   📝 ${concept.description}`);
      console.log(`   🏷️  ${concept.category} - 置信度: ${(concept.confidence * 100).toFixed(1)}%`);
      console.log(`   🔗 关系: ${concept.relationships.join(', ')}`);
      if (concept.examples.length > 0) {
        console.log(`   📚 示例: ${concept.examples.slice(0, 3).join(', ')}`);
      }
      console.log(`   📊 来源: ${concept.sources.join(', ')}`);
      console.log('');
    });
}

/**
 * 计算概念名称相似度（简化版本）
 */
function calculateConceptSimilarity(name1: string, name2: string): number {
  const words1 = name1.toLowerCase().split('');
  const words2 = name2.toLowerCase().split('');

  let commonChars = 0;
  const minLength = Math.min(words1.length, words2.length);

  for (let i = 0; i < minLength; i++) {
    if (words1.includes(words2[i])) commonChars++;
  }

  return commonChars / Math.max(words1.length, words2.length);
}

/**
 * 合并多个描述
 */
function mergeDescriptions(descriptions: string[]): string {
  // 简单的描述合并策略：选择最长且包含关键信息的描述
  return descriptions.reduce((best, current) => {
    return current.length > best.length ? current : best;
  });
}

/**
 * 主函数：运行所有高级示例
 */
async function runAllAdvancedExamples() {
  console.log('🎯 六维记忆系统高级概念提取示例集合');
  console.log('='.repeat(60));

  try {
    await multiTurnConversationConceptAccumulation();
    await crossDomainConceptAssociation();
    await dynamicContextAwareExtraction();
    await realTimeConceptQualityMonitoring();
    await intelligentConceptDeduplicationAndMerging();

    console.log('\n🎉 所有高级示例运行完成!');
    console.log('\n💡 高级特性总结:');
    console.log('   • 多轮对话中的概念累积和学习');
    console.log('   • 跨领域概念关联和知识网络构建');
    console.log('   • 动态上下文感知的智能概念提取');
    console.log('   • 实时质量监控和性能优化');
    console.log('   • 智能概念去重和合并策略');
    console.log('   • 多来源知识融合和置信度计算');

  } catch (error) {
    console.error('❌ 高级示例运行失败:', error);
  }
}

// 如果直接运行此文件，执行所有示例
if (require.main === module) {
  runAllAdvancedExamples();
}

export {
  multiTurnConversationConceptAccumulation,
  crossDomainConceptAssociation,
  dynamicContextAwareExtraction,
  realTimeConceptQualityMonitoring,
  intelligentConceptDeduplicationAndMerging,
  runAllAdvancedExamples
};