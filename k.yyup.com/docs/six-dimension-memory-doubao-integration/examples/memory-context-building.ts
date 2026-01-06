/**
 * 记忆上下文构建示例
 * 演示六维记忆系统如何构建智能化的AI对话上下文
 */

import { SixDimensionMemorySystem } from '../../server/src/services/memory/six-dimension-memory.service';
import { aiBridgeService } from '../../server/src/services/ai/bridge/ai-bridge.service';

/**
 * 基础记忆上下文构建示例
 */
async function basicMemoryContextBuilding() {
  console.log('🧠 基础记忆上下文构建示例\n');

  const userId = 'context-demo-user';
  const memorySystem = new SixDimensionMemorySystem();

  // 1. 模拟用户对话历史
  console.log('📝 模拟用户对话历史...');

  const conversationHistory = [
    {
      actor: 'user' as const,
      message: '我是一名幼儿园老师，想了解如何管理班级',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
    },
    {
      actor: 'assistant' as const,
      message: '班级管理是幼儿教育中的重要环节，包括日常活动安排、行为引导、家园沟通等方面。',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000)
    },
    {
      actor: 'user' as const,
      message: '特别是如何处理孩子之间的冲突问题',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1小时前
    },
    {
      actor: 'assistant' as const,
      message: '处理孩子冲突需要采用积极引导的方法，教会孩子们表达情感和解决问题的技巧。',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1000)
    },
    {
      actor: 'user' as const,
      message: '还有怎样与家长进行有效沟通',
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
    }
  ];

  // 记录对话历史
  for (const conversation of conversationHistory) {
    await memorySystem.recordConversation(
      conversation.actor,
      conversation.message,
      {
        userId,
        conversationId: 'class-management-conv',
        sessionId: 'session-001',
        timestamp: conversation.timestamp
      }
    );
  }

  console.log(`✅ 已记录 ${conversationHistory.length} 条对话`);

  // 2. 构建基础记忆上下文
  console.log('\n🔧 构建记忆上下文...');

  const context = await memorySystem.getMemoryContext(userId, '班级管理', {
    timeWindow: 24, // 24小时内的记忆
    maxConversations: 10,
    conceptLimit: 20
  });

  console.log('📊 记忆上下文统计:');
  console.log(`  • 用户ID: ${context.userId}`);
  console.log(`  • 总记忆数: ${context.totalMemories}`);
  console.log(`  • 最近对话: ${context.recentConversations.length}条`);
  console.log(`  • 相关概念: ${context.relevantConcepts.length}个`);
  console.log(`  • 关键实体: ${context.keyEntities.length}个`);
  console.log(`  • 程序性记忆: ${context.proceduralContext.length}个`);
  console.log(`  • 资源链接: ${context.resourceLinks.length}个`);
  console.log(`  • 知识要点: ${context.knowledgeHighlights.length}个`);
  console.log(`  • 相关性评分: ${(context.relevanceScore * 100).toFixed(1)}%`);

  // 3. 显示详细的上下文内容
  console.log('\n📋 详细上下文内容:');

  console.log('\n💬 最近对话:');
  context.recentConversations.forEach((conv, index) => {
    const timeStr = new Date(conv.occurred_at).toLocaleTimeString();
    console.log(`${index + 1}. [${conv.actor}] ${timeStr} - ${conv.summary.substring(0, 50)}...`);
  });

  console.log('\n🧠 相关概念:');
  context.relevantConcepts.slice(0, 5).forEach((concept, index) => {
    console.log(`${index + 1}. ${concept.name} (${concept.category}) - 置信度: ${concept.confidence?.toFixed(2)}`);
  });

  console.log('\n🎯 上下文摘要:');
  console.log(context.summary);

  return context;
}

/**
 * 增强记忆上下文构建示例
 */
async function enhancedMemoryContextBuilding() {
  console.log('\n🚀 增强记忆上下文构建示例\n');

  const userId = 'enhanced-context-user';
  const memorySystem = new SixDimensionMemorySystem();

  // 1. 建立丰富的用户背景
  console.log('👤 建立用户背景信息...');

  const userProfile = {
    role: '幼儿园教师',
    experience: '5年',
    age_group: '3-4岁中班',
    class_size: 25,
    specialization: '蒙台梭利教育法',
    challenges: ['班级管理', '家园沟通', '个别化教育'],
    interests: ['游戏化教学', 'STEM教育', '儿童心理学']
  };

  // 存储用户档案到核心记忆
  await memorySystem.storeMemory('core', {
    name: '用户档案',
    entity_type: 'user_profile',
    attributes: userProfile,
    importance: 'high'
  }, {
    userId,
    tags: ['profile', 'background']
  });

  // 2. 记录专业知识和经验
  console.log('📚 记录专业知识...');

  const professionalKnowledge = [
    {
      type: 'procedural',
      name: '班级管理流程',
      steps: ['晨间接待', '活动安排', '行为观察', '冲突处理', '家园沟通'],
      category: '管理流程',
      best_practices: ['建立规则', '正面强化', '一致性执行']
    },
    {
      type: 'resource',
      name: '教学资源库',
      resources: [
        { title: '蒙台梭利教具使用指南', type: 'document', url: '/resources/montessori-guide.pdf' },
        { title: '游戏化教学案例集', type: 'video', url: '/resources/gamification-videos/' },
        { title: '家长沟通模板', type: 'template', url: '/templates/parent-communication/' }
      ],
      category: '教学资源'
    },
    {
      type: 'knowledge',
      name: '教育理论知识',
      topics: ['皮亚杰认知发展理论', '维果茨基社会学习理论', '多元智能理论'],
      applications: ['个别化教学', '合作学习', '差异化指导'],
      category: '理论基础'
    }
  ];

  for (const knowledge of professionalKnowledge) {
    await memorySystem.storeMemory(knowledge.type, knowledge, {
      userId,
      tags: [knowledge.category, 'professional'],
      priority: 'high'
    });
  }

  console.log(`✅ 已记录 ${professionalKnowledge.length} 类专业知识`);

  // 3. 模拟详细的多轮对话
  console.log('\n💬 记录详细对话历史...');

  const detailedConversations = [
    {
      topic: '班级管理挑战',
      messages: [
        '我班上有几个特别活跃的孩子，总是打断别人说话',
        '尝试了表扬安静行为的方法，效果不太好',
        '想知道一些更有效的课堂管理策略'
      ]
    },
    {
      topic: '家园沟通困难',
      messages: [
        '有些家长对孩子的在园表现不太关心',
        '发送的联系册经常没有回复',
        '如何提高家长的参与度和配合度'
      ]
    },
    {
      topic: '个别化教育',
      messages: [
        '班里有发展迟缓的孩子，需要特别关注',
        '如何在集体教学中照顾到个体差异',
        '怎样设计适合不同能力水平的活动'
      ]
    }
  ];

  for (const topic of detailedConversations) {
    for (const message of topic.messages) {
      await memorySystem.recordConversation('user', message, {
        userId,
        conversationId: `topic-${topic.topic.replace(/\s+/g, '-')}`,
        sessionId: 'detailed-session',
        topic: topic.topic,
        metadata: { category: 'professional_challenge' }
      });
    }
  }

  console.log(`✅ 已记录 ${detailedConversations.length} 个话题的详细对话`);

  // 4. 构建增强的记忆上下文
  console.log('\n🔧 构建增强记忆上下文...');

  const enhancedContext = await memorySystem.getMemoryContext(userId, '课堂管理', {
    timeWindow: 7 * 24, // 一周内
    maxConversations: 20,
    conceptLimit: 30,
    includeProcedural: true,
    includeResources: true,
    includeKnowledge: true,
    relevanceThreshold: 0.3
  });

  // 5. 分析增强上下文的构成
  console.log('\n📊 增强上下文构成分析:');
  console.log(`  • 🎯 相关性评分: ${(enhancedContext.relevanceScore * 100).toFixed(1)}%`);
  console.log(`  • 💬 对话记录: ${enhancedContext.recentConversations.length}条`);
  console.log(`  • 🧠 语义概念: ${enhancedContext.relevantConcepts.length}个`);
  console.log(`  • 👥 核心实体: ${enhancedContext.keyEntities.length}个`);
  console.log(`  • ⚙️  程序性记忆: ${enhancedContext.proceduralContext.length}个`);
  console.log(`  • 📚 资源记忆: ${enhancedContext.resourceLinks.length}个`);
  console.log(`  • 💡 知识要点: ${enhancedContext.knowledgeHighlights.length}个`);

  // 6. 显示各类记忆的详细内容
  console.log('\n🧠 语义概念分析:');
  const conceptCategories = enhancedContext.relevantConcepts.reduce((acc, concept) => {
    const category = concept.category || '未分类';
    if (!acc[category]) acc[category] = [];
    acc[category].push(concept);
    return acc;
  }, {} as Record<string, any[]>);

  Object.entries(conceptCategories).forEach(([category, concepts]) => {
    console.log(`\n  📂 ${category} (${concepts.length}个):`);
    concepts.slice(0, 3).forEach(concept => {
      console.log(`    • ${concept.name} - 置信度: ${((concept.confidence || 0) * 100).toFixed(1)}%`);
    });
  });

  console.log('\n⚙️  程序性记忆:');
  enhancedContext.proceduralContext.slice(0, 3).forEach((proc, index) => {
    console.log(`${index + 1}. ${proc.name}`);
    if (proc.attributes?.steps) {
      console.log(`   步骤: ${proc.attributes.steps.slice(0, 3).join(' → ')}...`);
    }
  });

  console.log('\n📚 可用资源:');
  enhancedContext.resourceLinks.slice(0, 3).forEach((resource, index) => {
    console.log(`${index + 1}. ${resource.name} (${resource.attributes?.type})`);
    if (resource.attributes?.url) {
      console.log(`   链接: ${resource.attributes.url}`);
    }
  });

  console.log('\n💡 知识要点:');
  enhancedContext.knowledgeHighlights.slice(0, 3).forEach((knowledge, index) => {
    console.log(`${index + 1}. ${knowledge.name}`);
    if (knowledge.attributes?.topics) {
      console.log(`   涵盖: ${knowledge.attributes.topics.slice(0, 3).join(', ')}`);
    }
  });

  return enhancedContext;
}

/**
 * AI对话增强示例
 */
async function aiConversationEnhancement() {
  console.log('\n🤖 AI对话增强示例\n');

  const userId = 'ai-enhanced-user';
  const memorySystem = new SixDimensionMemorySystem();

  // 1. 准备丰富的记忆背景
  console.log('📚 准备用户记忆背景...');

  // 用户背景
  await memorySystem.storeMemory('core', {
    name: '教师背景',
    entity_type: 'teacher_profile',
    attributes: {
      experience: '3年',
      grade: '大班',
      class_size: 28,
      strengths: ['创意教学', '音乐教育'],
      challenges: ['班级纪律', '家长沟通']
    }
  }, { userId, tags: ['profile'] });

  // 专业方法
  await memorySystem.storeMemory('procedural', {
    name: '创意音乐教学流程',
    steps: ['热身活动', '节奏训练', '歌曲学习', '创作游戏', '放松整理'],
    best_practices: ['循序渐进', '多感官参与', '积极鼓励'],
    category: '教学方法'
  }, { userId, tags: ['teaching_method'] });

  // 近期对话
  const recentConversations = [
    '我想在音乐课上增加一些创意元素',
    '孩子们对传统的音乐教学有点厌倦',
    '希望能找到新的教学方法来激发兴趣'
  ];

  for (const message of recentConversations) {
    await memorySystem.recordConversation('user', message, {
      userId,
      conversationId: 'music-teaching-conv'
    });
  }

  console.log('✅ 记忆背景准备完成');

  // 2. 构建AI对话上下文
  console.log('\n🔧 构建AI对话上下文...');

  const memoryContext = await aiBridgeService.buildMemoryContext(userId, '创意音乐教学');

  console.log('📝 生成的记忆上下文:');
  console.log('=' .repeat(50));
  console.log(memoryContext);
  console.log('=' .repeat(50));

  // 3. 使用记忆上下文进行AI对话
  console.log('\n💬 AI对话演示...');

  const userQuery = '请给我一些关于大班创意音乐教学的具体建议';

  try {
    // 构建带记忆上下文的AI对话
    const aiResponse = await aiBridgeService.generateFastChatCompletion({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system',
          content: `你是一位经验丰富的幼儿教育专家，特别是音乐教育领域。根据以下用户的历史对话和相关记忆，为用户提供个性化的建议：

${memoryContext}

请基于用户的背景和过往讨论，提供具体、实用的建议。`
        },
        {
          role: 'user',
          content: userQuery
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiMessage = aiResponse.choices?.[0]?.message?.content || '';

    console.log('\n👤 用户问题:', userQuery);
    console.log('\n🤖 AI增强回复:');
    console.log(aiMessage);

    // 4. 记录新的对话并更新记忆
    await memorySystem.recordConversation('user', userQuery, {
      userId,
      conversationId: 'music-teaching-enhanced',
      metadata: { context_enhanced: true }
    });

    await memorySystem.recordConversation('assistant', aiMessage, {
      userId,
      conversationId: 'music-teaching-enhanced',
      metadata: { context_enhanced: true }
    });

    console.log('\n✅ 对话已记录，记忆上下文已更新');

    // 5. 分析对话质量
    const updatedContext = await memorySystem.getMemoryContext(userId, '音乐教学');
    console.log('\n📊 对话后记忆状态:');
    console.log(`  • 总记忆数: ${updatedContext.totalMemories}`);
    console.log(`  • 相关对话: ${updatedContext.recentConversations.length}条`);
    console.log(`  • 相关概念: ${updatedContext.relevantConcepts.length}个`);

    // 检查AI回复是否考虑了用户背景
    const hasBackgroundReference = aiMessage.toLowerCase().includes('大班') ||
                                   aiMessage.toLowerCase().includes('3年') ||
                                   aiMessage.toLowerCase().includes('28个');

    if (hasBackgroundReference) {
      console.log('✅ AI成功考虑了用户背景信息');
    } else {
      console.log('⚠️  AI可能未充分利用用户背景信息');
    }

  } catch (error) {
    console.error('❌ AI对话增强失败:', error.message);
  }
}

/**
 * 上下文优化和性能测试
 */
async function contextOptimizationAndPerformance() {
  console.log('\n⚡ 记忆上下文优化和性能测试\n');

  const userId = 'performance-test-user';
  const memorySystem = new SixDimensionMemorySystem();

  // 1. 创建大量测试数据
  console.log('📊 创建测试数据...');

  const testData = {
    conversations: 100,
    concepts: 200,
    resources: 50,
    procedures: 30
  };

  // 批量创建对话记录
  for (let i = 0; i < testData.conversations; i++) {
    const topics = ['班级管理', '教学方法', '家园沟通', '儿童发展', '课程设计'];
    const topic = topics[i % topics.length];

    await memorySystem.recordConversation('user', `关于${topic}的问题 ${i + 1}`, {
      userId,
      conversationId: `bulk-conv-${Math.floor(i / 5)}`,
      sessionId: `session-${i}`,
      metadata: { topic, index: i }
    });

    if (i % 2 === 0) {
      await memorySystem.recordConversation('assistant', `关于${topic}的建议 ${i + 1}`, {
        userId,
        conversationId: `bulk-conv-${Math.floor(i / 5)}`,
        sessionId: `session-${i}`,
        metadata: { topic, index: i }
      });
    }
  }

  console.log(`✅ 已创建 ${testData.conversations} 条对话记录`);

  // 2. 批量创建概念
  const conceptCategories = ['教育管理', '教学方法', '心理学', '儿童发展', '课程设计'];
  for (let i = 0; i < testData.concepts; i++) {
    const category = conceptCategories[i % conceptCategories.length];
    await memorySystem.storeMemory('semantic', {
      name: `概念${i + 1}`,
      description: `关于${category}的重要概念`,
      category,
      confidence: Math.random() * 0.4 + 0.6 // 0.6-1.0
    }, {
      userId,
      tags: [category, 'auto-generated']
    });
  }

  console.log(`✅ 已创建 ${testData.concepts} 个概念`);

  // 3. 性能测试不同的上下文配置
  console.log('\n🚀 测试不同上下文配置的性能...');

  const configurations = [
    { name: '最小配置', timeWindow: 1, maxConversations: 5, conceptLimit: 10 },
    { name: '标准配置', timeWindow: 24, maxConversations: 20, conceptLimit: 30 },
    { name: '完整配置', timeWindow: 168, maxConversations: 50, conceptLimit: 100 },
    { name: '高性能配置', timeWindow: 12, maxConversations: 15, conceptLimit: 25 }
  ];

  const performanceResults = [];

  for (const config of configurations) {
    console.log(`\n--- ${config.name} ---`);

    const startTime = Date.now();

    try {
      const context = await memorySystem.getMemoryContext(userId, '教学', {
        timeWindow: config.timeWindow,
        maxConversations: config.maxConversations,
        conceptLimit: config.conceptLimit,
        relevanceThreshold: 0.5
      });

      const processingTime = Date.now() - startTime;

      const result = {
        config: config.name,
        processingTime,
        totalMemories: context.totalMemories,
        conversations: context.recentConversations.length,
        concepts: context.relevantConcepts.length,
        relevanceScore: context.relevanceScore,
        contextLength: JSON.stringify(context).length
      };

      performanceResults.push(result);

      console.log(`⏱️  处理时间: ${processingTime}ms`);
      console.log(`📊 总记忆数: ${result.totalMemories}`);
      console.log(`💬 对话数: ${result.conversations}`);
      console.log(`🧠 概念数: ${result.concepts}`);
      console.log(`🎯 相关性: ${(result.relevanceScore * 100).toFixed(1)}%`);
      console.log(`📏 上下文大小: ${(result.contextLength / 1024).toFixed(1)}KB`);

    } catch (error) {
      console.error(`❌ ${config.name}测试失败:`, error.message);
    }
  }

  // 4. 性能分析和建议
  console.log('\n📈 性能分析报告:');
  console.log('=' .repeat(60));

  const avgProcessingTime = performanceResults.reduce((sum, r) => sum + r.processingTime, 0) / performanceResults.length;
  const fastestConfig = performanceResults.reduce((fastest, current) =>
    current.processingTime < fastest.processingTime ? current : fastest
  );
  const richestConfig = performanceResults.reduce((richest, current) =>
    current.concepts > richest.concepts ? current : richest
  );

  console.log(`📊 统计信息:`);
  console.log(`  • 平均处理时间: ${avgProcessingTime.toFixed(0)}ms`);
  console.log(`  • 最快配置: ${fastestConfig.config} (${fastestConfig.processingTime}ms)`);
  console.log(`  • 最丰富配置: ${richestConfig.config} (${richestConfig.concepts}个概念)`);

  console.log(`\n💡 性能优化建议:`);
  performanceResults.forEach(result => {
    const efficiency = result.concepts / (result.processingTime / 1000); // 概念数/秒
    let recommendation = '';

    if (result.processingTime > 1000) {
      recommendation = ' ⚠️  处理时间较长，建议减少timeWindow或maxConversations';
    } else if (result.concepts < 10) {
      recommendation = ' ⚠️  概念数量较少，可能影响上下文丰富度';
    } else if (result.contextLength > 100 * 1024) {
      recommendation = ' ⚠️  上下文过大，可能影响AI处理效率';
    } else if (efficiency > 50) {
      recommendation = ' ✅ 高效配置，性能和内容平衡良好';
    }

    console.log(`  • ${result.config}: ${efficiency.toFixed(1)} 概念/秒${recommendation}`);
  });

  // 5. 推荐最佳配置
  console.log(`\n🎯 推荐配置（基于性能和质量平衡）:`);

  const balancedScore = performanceResults.map(r => ({
    config: r.config,
    score: (r.concepts / 10) * 0.4 + // 概念数量权重40%
           (1000 / Math.max(r.processingTime, 100)) * 0.3 + // 性能权重30%
           (r.relevanceScore * 0.3) // 相关性权重30%
  })).sort((a, b) => b.score - a.score)[0];

  const bestConfig = performanceResults.find(r => r.config === balancedScore.config);
  if (bestConfig) {
    console.log(`  • 配置名称: ${bestConfig.config}`);
    console.log(`  • 处理时间: ${bestConfig.processingTime}ms`);
    console.log(`  • 概念数量: ${bestConfig.concepts}个`);
    console.log(`  • 综合评分: ${balancedScore.score.toFixed(2)}`);
    console.log(`  • 建议参数: timeWindow=${bestConfig.config === '最小配置' ? 6 : bestConfig.config === '标准配置' ? 24 : 12}小时`);
  }
}

/**
 * 记忆上下文应用场景示例
 */
async function memoryContextUseCases() {
  console.log('\n🎯 记忆上下文应用场景示例\n');

  const scenarios = [
    {
      name: '新用户首次咨询',
      description: '为新用户提供个性化的指导',
      userId: 'new-user-scenario',
      setup: async (memorySystem: SixDimensionMemorySystem) => {
        // 建立新用户档案
        await memorySystem.storeMemory('core', {
          name: '新用户背景',
          entity_type: 'new_teacher',
          attributes: {
            experience: '应届毕业生',
            grade: '小班',
            concerns: ['课堂管理', '教学设计', '家长沟通']
          }
        }, { userId: 'new-user-scenario' });
      },
      query: '我是一名新老师，第一次带小班，很紧张，请给我一些建议'
    },
    {
      name: '专业发展咨询',
      description: '基于教师经验提供进阶建议',
      userId: 'experienced-teacher-scenario',
      setup: async (memorySystem: SixDimensionMemorySystem) => {
        // 建立资深教师档案
        await memorySystem.storeMemory('core', {
          name: '资深教师背景',
          entity_type: 'experienced_teacher',
          attributes: {
            experience: '8年',
            specializations: ['蒙台梭利', '瑞吉欧', '华德福'],
            achievements: ['优秀教师', '教学创新奖'],
            current_goal: '提升教学研究能力'
          }
        }, { userId: 'experienced-teacher-scenario' });

        // 记录专业发展对话
        const professionalTopics = [
          '如何开展教学研究',
          '教学论文写作技巧',
          '参与教研活动的策略',
          '指导新教师的方法'
        ];

        for (const topic of professionalTopics) {
          await memorySystem.recordConversation('user', `我想了解${topic}`, {
            userId: 'experienced-teacher-scenario',
            conversationId: 'professional-development',
            metadata: { topic, category: 'professional_growth' }
          });
        }
      },
      query: '我想在教学研究方面有所突破，应该如何着手？'
    },
    {
      name: '问题解决咨询',
      description: '针对具体教学问题提供解决方案',
      userId: 'problem-solving-scenario',
      setup: async (memorySystem: SixDimensionMemorySystem) => {
        // 记录具体问题对话
        const problemConversations = [
          {
            topic: '注意力不集中',
            messages: [
              '班上有几个孩子总是坐不住',
              '上课时经常离开座位',
              '尝试了提醒和表扬，效果不佳'
            ]
          },
          {
            topic: '分离焦虑',
            messages: [
              '新入园的孩子哭闹严重',
              '家长也很焦虑',
              '如何帮助孩子适应幼儿园生活'
            ]
          }
        ];

        for (const problem of problemConversations) {
          for (const message of problem.messages) {
            await memorySystem.recordConversation('user', message, {
              userId: 'problem-solving-scenario',
              conversationId: `problem-${problem.topic}`,
              metadata: { topic: problem.topic, category: 'classroom_problem' }
            });
          }
        }
      },
      query: '班上有个孩子特别调皮，影响了其他孩子，怎么办？'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);
    console.log(`📝 场景描述: ${scenario.description}`);

    const memorySystem = new SixDimensionMemorySystem();
    const userId = scenario.userId;

    // 设置场景
    await scenario.setup(memorySystem);

    // 构建记忆上下文
    const context = await memorySystem.getMemoryContext(userId);

    console.log(`📊 记忆状态: ${context.totalMemories}条记忆, ${context.relevantConcepts.length}个概念`);
    console.log(`🎯 相关性评分: ${(context.relevanceScore * 100).toFixed(1)}%`);

    // 显示上下文摘要
    if (context.summary) {
      console.log(`📋 上下文摘要: ${context.summary}`);
    }

    console.log(`💬 用户问题: ${scenario.query}`);

    // 模拟AI回复（基于上下文的增强建议）
    try {
      const memoryContext = await aiBridgeService.buildMemoryContext(userId);

      console.log(`\n🤖 基于记忆上下文的建议:`);
      console.log(`[上下文增强回复] 根据${context.recentConversations.length}条历史对话和${context.relevantConcepts.length}个相关概念，为用户提供个性化建议...`);

      if (context.keyEntities.length > 0) {
        console.log(`✅ 已考虑用户背景: ${context.keyEntities[0].name}`);
      }

      if (context.proceduralContext.length > 0) {
        console.log(`✅ 已参考专业方法: ${context.proceduralContext[0].name}`);
      }

    } catch (error) {
      console.log(`❌ 上下文增强失败: ${error.message}`);
    }

    console.log(''); // 空行分隔
  }
}

/**
 * 主函数：运行所有记忆上下文示例
 */
async function runAllMemoryContextExamples() {
  console.log('🎯 六维记忆系统上下文构建示例集合');
  console.log('='.repeat(60));

  try {
    await basicMemoryContextBuilding();
    await enhancedMemoryContextBuilding();
    await aiConversationEnhancement();
    await contextOptimizationAndPerformance();
    await memoryContextUseCases();

    console.log('\n🎉 所有记忆上下文示例运行完成!');
    console.log('\n💡 核心功能总结:');
    console.log('   • 多维度记忆数据整合（对话、概念、程序、资源、知识）');
    console.log('   • 智能上下文构建和相关性评分');
    console.log('   • AI对话增强和个性化建议');
    console.log('   • 性能优化和配置调优');
    console.log('   • 多场景应用和问题解决支持');

  } catch (error) {
    console.error('❌ 记忆上下文示例运行失败:', error);
  }
}

// 如果直接运行此文件，执行所有示例
if (require.main === module) {
  runAllMemoryContextExamples();
}

export {
  basicMemoryContextBuilding,
  enhancedMemoryContextBuilding,
  aiConversationEnhancement,
  contextOptimizationAndPerformance,
  memoryContextUseCases,
  runAllMemoryContextExamples
};