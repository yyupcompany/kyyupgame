/**
 * 测试脚本：对比三种AI调用模式
 *
 * 用途：
 * 1. Flash快速模式（temperature=0.1）：快速工具调用、数据查询、简单任务
 * 2. Thinking深度模式（temperature=0.7）：复杂推理、深度分析、创意生成
 * 3. Flash思考模式（temperature=0.7 + think=true）：Flash速度 + 思考能力
 */

import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';
import { AiBridgeMessageRole } from './src/services/ai/bridge/ai-bridge.types';

async function testFlashVsThinking() {
  console.log('🧪 开始测试三种AI调用模式\n');

  // 测试场景1：简单数据查询（适合Flash）
  console.log('=' .repeat(80));
  console.log('📊 场景1：简单数据查询 - 适合Flash模型');
  console.log('=' .repeat(80));

  const simpleQuery = '统计一下系统中有多少个学生？';

  try {
    console.log('\n🚀 使用Flash模型（temperature=0.1）:');
    const startFlash = Date.now();
    const flashResponse = await aiBridgeService.generateFastChatCompletion({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个数据查询助手，快速准确地回答用户的查询问题。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: simpleQuery
        }
      ]
    });
    const flashTime = Date.now() - startFlash;
    console.log(`✅ Flash响应时间: ${flashTime}ms`);
    console.log(`📝 Flash回答: ${flashResponse.choices[0]?.message?.content?.substring(0, 200)}...`);
  } catch (error: any) {
    console.error('❌ Flash模型调用失败:', error.message);
  }

  // 测试场景2：复杂推理任务（适合Thinking）
  console.log('\n' + '='.repeat(80));
  console.log('🧠 场景2：复杂推理任务 - 适合Thinking模型');
  console.log('=' .repeat(80));

  const complexQuery = `
分析一下幼儿园招生策略：
1. 当前市场竞争环境
2. 目标家长群体特征
3. 差异化竞争优势
4. 具体招生方案建议
请给出详细的分析和建议。
  `.trim();

  try {
    console.log('\n🧠 使用Thinking模型（temperature=0.7）:');
    const startThinking = Date.now();
    const thinkingResponse = await aiBridgeService.generateThinkingChatCompletion({
      model: 'doubao-seed-1-6-thinking-250615',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个幼儿园招生策略专家，擅长市场分析和策略规划。请进行深度思考和分析。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: complexQuery
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
    const thinkingTime = Date.now() - startThinking;
    console.log(`✅ Thinking响应时间: ${thinkingTime}ms`);
    console.log(`📝 Thinking回答: ${thinkingResponse.choices[0]?.message?.content?.substring(0, 300)}...`);
  } catch (error: any) {
    console.error('❌ Thinking模型调用失败:', error.message);
  }

  // 测试场景3：Flash思考模式
  console.log('\n' + '='.repeat(80));
  console.log('💡 场景3：Flash思考模式 - Flash + Think参数');
  console.log('=' .repeat(80));

  const flashThinkQuery = '分析一下如何优化幼儿园的课程设置？';

  try {
    console.log('\n💡 使用Flash思考模式（temperature=0.7 + think=true）:');
    const startFlashThink = Date.now();
    const flashThinkResponse = await aiBridgeService.generateFlashWithThink({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个幼儿园课程设计专家，请进行思考后给出建议。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: flashThinkQuery
        }
      ]
    });
    const flashThinkTime = Date.now() - startFlashThink;
    console.log(`✅ Flash思考模式响应时间: ${flashThinkTime}ms`);
    console.log(`📝 Flash思考回答: ${flashThinkResponse.choices[0]?.message?.content?.substring(0, 300)}...`);
  } catch (error: any) {
    console.error('❌ Flash思考模式调用失败:', error.message);
  }

  // 测试场景4：三种模式对比同一问题
  console.log('\n' + '='.repeat(80));
  console.log('⚖️  场景4：三种模式对比 - Flash vs Flash+Think vs Thinking');
  console.log('=' .repeat(80));

  const comparisonQuery = '如何提高幼儿园的教学质量？';

  try {
    console.log('\n🚀 Flash快速模式（temperature=0.1）:');
    const flashComp = await aiBridgeService.generateFastChatCompletion({
      messages: [
        {
          role: 'user' as AiBridgeMessageRole,
          content: comparisonQuery
        }
      ]
    });
    console.log(`📝 ${flashComp.choices[0]?.message?.content?.substring(0, 200)}...`);

    console.log('\n💡 Flash思考模式（temperature=0.7 + think=true）:');
    const flashThinkComp = await aiBridgeService.generateFlashWithThink({
      messages: [
        {
          role: 'user' as AiBridgeMessageRole,
          content: comparisonQuery
        }
      ]
    });
    console.log(`📝 ${flashThinkComp.choices[0]?.message?.content?.substring(0, 200)}...`);

    console.log('\n🧠 Thinking深度模式（Thinking模型 + temperature=0.7）:');
    const thinkingComp = await aiBridgeService.generateThinkingChatCompletion({
      messages: [
        {
          role: 'user' as AiBridgeMessageRole,
          content: comparisonQuery
        }
      ]
    });
    console.log(`📝 ${thinkingComp.choices[0]?.message?.content?.substring(0, 200)}...`);
  } catch (error: any) {
    console.error('❌ 对比测试失败:', error.message);
  }

  // 总结
  console.log('\n' + '='.repeat(80));
  console.log('📋 三种模式使用建议总结');
  console.log('=' .repeat(80));
  console.log(`
🚀 Flash快速模式（generateFastChatCompletion）:
   - 模型: doubao-seed-1-6-flash-250715
   - Temperature: 0.1（低温度，确定性输出）
   - Max Tokens: 1024（快速响应）
   - Think参数: ❌ 无
   - 适用场景：
     ✅ 工具调用和Function Calling
     ✅ 数据库查询和CRUD操作
     ✅ 简单问答和状态检查
     ✅ 快速响应场景
   - 响应时间: 通常 < 2秒
   - 成本: 💰 低

💡 Flash思考模式（generateFlashWithThink）:
   - 模型: doubao-seed-1-6-flash-250715
   - Temperature: 0.7（中等温度，支持思考）
   - Max Tokens: 2000（适中）
   - Think参数: ✅ true
   - 适用场景：
     ✅ 需要Flash速度但又需要思考的场景
     ✅ 中等复杂度的分析任务
     ✅ 快速策略建议
     ✅ 平衡速度和深度的场景
   - 响应时间: 通常 1-3秒
   - 成本: 💰💰 中等

🧠 Thinking深度模式（generateThinkingChatCompletion）:
   - 模型: doubao-seed-1-6-thinking-250615
   - Temperature: 0.7（中等温度，平衡创造性）
   - Max Tokens: 4000（支持复杂推理）
   - Think参数: ❌ 无（模型内置思考能力）
   - 适用场景：
     ✅ 复杂推理和深度分析
     ✅ 策略规划和方案设计
     ✅ 创意生成和内容创作
     ✅ 深度对话和咨询
   - 响应时间: 通常 2-5秒
   - 成本: 💰💰💰 较高

💡 选择建议：
   - 需要快速、确定的答案 → 🚀 Flash快速模式
   - 需要Flash速度 + 一定思考 → 💡 Flash思考模式
   - 需要深度思考和分析 → 🧠 Thinking深度模式
   - 不确定 → 先用Flash快速，不满意用Flash思考，还不满意用Thinking深度
  `);
}

// 运行测试
testFlashVsThinking()
  .then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });

