console.log('🧠 六维记忆系统概念定义机制详解（修正版）\n');

console.log('📝 当前的概念提取实现（基于代码分析）:');
console.log('=' .repeat(60));

// 修正后的概念提取逻辑（基于实际代码）
function simulateCorrectConceptExtraction(userMessage) {
  console.log(`\n🔍 分析用户消息: "${userMessage}"`);

  // 第1步：正确的关键词提取（基于实际代码逻辑）
  console.log('\n📊 第1步：关键词提取（实际代码逻辑）');
  // 修正：正确的正则表达式应该分割单词，而不是匹配整个句子
  const keywords = userMessage.match(/[A-Za-z\u4e00-\u9fa5]{2,}/g) || [];
  const uniqueKeywords = [...new Set(keywords)].slice(0, 5);

  console.log('   提取的关键词:');
  uniqueKeywords.forEach((keyword, index) => {
    console.log(`   ${index + 1}. "${keyword}"`);
  });

  // 第2步：检查是否已存在
  console.log('\n🔍 第2步：检查概念库中是否已存在');
  // 模拟一些已存在的教育概念
  const existingConcepts = ['班级管理', '幼儿园', '教学', '管理', '技巧'];

  uniqueKeywords.forEach(keyword => {
    if (existingConcepts.includes(keyword)) {
      console.log(`   ⚠️  "${keyword}" - 已存在，跳过创建`);
    } else {
      console.log(`   ✅ "${keyword}" - 新概念，将创建`);
    }
  });

  // 第3步：创建新概念（当前简化实现）
  console.log('\n🏗️  第3步：创建新的语义概念（当前简化实现）');
  const newConcepts = uniqueKeywords.filter(keyword => !existingConcepts.includes(keyword));

  newConcepts.forEach(concept => {
    console.log(`   📝 创建概念:`);
    console.log(`      名称: "${concept}"`);
    console.log(`      描述: "自动提取的概念: ${concept}"`);
    console.log(`      分类: "auto_extracted"`);
    console.log(`      关系: [] (暂无关联)`);
  });

  return {
    extracted: uniqueKeywords,
    new: newConcepts,
    existing: uniqueKeywords.filter(keyword => existingConcepts.includes(keyword))
  };
}

// 演示正确的概念提取
console.log('🎯 修正后的概念提取演示:');
console.log('-'.repeat(40));

// 案例1：教育相关消息 - 修正正则表达式后的效果
const result1 = simulateCorrectConceptExtraction('我想了解幼儿园班级管理的最佳实践');

// 案例2：复杂句子
const result2 = simulateCorrectConceptExtraction('如何使用AI技术提升教学效果和学习质量');

// 案例3：包含数字和英文的消息
const result3 = simulateCorrectConceptExtraction('请帮我设计一个适合5岁儿童的数学游戏活动');

console.log('\n📊 概念提取的触发时机:');
console.log('=' .repeat(40));

console.log('\n🔄 每当用户发送消息时都会触发概念提取:');
console.log('   1. 用户消息 → recordConversation()');
console.log('   2. 记录到情节记忆后 → extractConcepts(message)');
console.log('   3. 分析文本 → 提取关键词 → 创建新概念');

console.log('\n📚 语义记忆表结构（基于代码分析）:');
console.log('   ```sql');
console.log('   CREATE TABLE semantic_memories (');
console.log('     id VARCHAR(255) PRIMARY KEY,');
console.log('     name VARCHAR(255) NOT NULL,           -- 概念名称');
console.log('     description TEXT,                      -- 概念描述');
console.log('     category VARCHAR(100),                  -- 概念分类');
console.log('     relationships JSON,                   -- 概念关系');
console.log('     embedding JSON,                        -- 向量嵌入');
console.log('     metadata JSON,                        -- 元数据');
console.log('     user_id VARCHAR(255),                   -- 用户ID');
console.log('     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
console.log('     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
console.log('   );');
console.log('   ```');

console.log('\n🔍 概念检索机制（基于search方法）:');
console.log('=' .repeat(40));

function demonstrateConceptSearch(query) {
  console.log(`\n🔍 用户查询: "${query}"`);

  // 第1步：向量化查询
  console.log('   🧠 生成查询向量...');

  // 第2步：数据库搜索（基于实际search方法）
  console.log('   📊 数据库搜索条件:');
  console.log('   ```sql');
  console.log('   SELECT * FROM semantic_memories');
  console.log('   WHERE (name LIKE ? OR description LIKE ?)');
  console.log('   LIMIT ?');
  console.log('   ```');

  // 第3步：模拟搜索结果
  const mockResults = [
    { name: '班级管理', description: '幼儿园班级组织与管理的最佳实践和方法', similarity: 0.95 },
    { name: '教学', description: '自动提取的概念: 教学', similarity: 0.87 },
    { name: '管理', description: '自动提取的概念: 管理', similarity: 0.82 }
  ];

  console.log('   📋 搜索结果:');
  mockResults.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.name} (相似度: ${result.similarity})`);
    console.log(`      描述: ${result.description}`);
  });

  return mockResults;
}

// 演示概念检索
const searchResults = demonstrateConceptSearch('班级管理技巧');

console.log('\n🎯 概念在学习过程中的作用:');
console.log('=' .repeat(40));

console.log('\n🧠 记忆上下文构建中的概念应用:');
console.log('   ```typescript');
console.log('   // 从getMemoryContext方法中可以看到');
console.log('   context += "\\n[关键概念]\\n";');
console.log('   const topConcepts = concepts.slice(0, 10);');
console.log('   for (const concept of topConcepts) {');
console.log('     context += `- ${concept.name}: ${concept.description.substring(0, 100)}\\n`;');
console.log('   }');
console.log('   ```');

console.log('\n💡 概念系统的工作流程总结:');
console.log('   1. 🎯 提取阶段：正则表达式 → 关键词 → 去重 → 限制数量');
console.log('   2. 🏗️  创建阶段：检查已存在 → 创建新概念 → 存储到数据库');
console.log('   3. 🔍 检索阶段：用户查询 → 向量搜索 → 相似度排序');
console.log('   4. 📝 应用阶段：构建上下文 → 提供给AI模型');

console.log('\n⚡ 当前实现的优缺点:');
console.log('   ✅ 优点:');
console.log('      • 自动化：无需人工维护概念库');
console.log('      • 实时性：每条消息都能即时提取');
console.log('      • 个性化：每个用户有独立的概念空间');
console.log('      • 扩展性：支持任意领域概念');

console.log('\n   ⚠️ 当前限制:');
console.log('      • 精度：正则表达式可能提取噪音');
console.log('      • 关系：暂不建立概念间的关系');
console.log('      • 分类：统一标记为"auto_extracted"');
console.log('      • 描述：简单的重复格式');

console.log('\n🚀 未来改进方向:');
console.log('   • 🤖 集成LLM：使用GPT等模型进行智能概念提取');
console.log('   • 🧠 NLP技术：词性标注、命名实体识别');
console.log('   • 📊 统计学习：基于使用频率优化概念权重');
console.log('   • 🔗 关系图：构建概念间的语义关系网络');

console.log('\n✅ 六维记忆系统概念定义机制详解完成!');