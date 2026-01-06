/**
 * 对比测试：Flash 0.1 vs Flash 0.7 + think: true
 * 
 * 测试目标：
 * 1. 对比响应速度
 * 2. 验证是否真的进行了思考（think）
 * 3. 对比工具调用的准确性
 * 4. 对比返回内容的质量
 */

import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';
import { AiBridgeMessageRole } from './src/services/ai/bridge/ai-bridge.types';

// 定义测试用的工具
const TEST_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'query_student_count',
      description: '查询学生总数',
      parameters: {
        type: 'object',
        properties: {
          grade: {
            type: 'string',
            description: '年级（可选），如：小班、中班、大班'
          },
          status: {
            type: 'string',
            description: '学生状态（可选），如：在读、毕业'
          }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'query_teacher_info',
      description: '查询教师信息',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '教师姓名'
          }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_activity',
      description: '创建活动',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '活动标题'
          },
          date: {
            type: 'string',
            description: '活动日期'
          },
          description: {
            type: 'string',
            description: '活动描述'
          }
        },
        required: ['title', 'date']
      }
    }
  }
];

async function testFlash01VsFlash07Think() {
  console.log('🧪 开始对比测试：Flash 0.1 vs Flash 0.7 + think: true\n');
  console.log('=' .repeat(100));

  // 测试场景1：简单工具调用
  console.log('\n📊 测试场景1：简单工具调用 - "查询学生总数"');
  console.log('=' .repeat(100));

  const simpleQuery = '帮我查询一下系统中有多少个学生？';

  try {
    // 测试1: Flash 0.1（无think）
    console.log('\n🚀 配置1: Flash 0.1（无think参数）');
    console.log('   - Model: doubao-seed-1-6-flash-250715');
    console.log('   - Temperature: 0.1');
    console.log('   - Think: ❌ 无');
    
    const start1 = Date.now();
    const response1 = await aiBridgeService.generateFastChatCompletion({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个幼儿园管理助手，可以调用工具来帮助用户查询信息。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: simpleQuery
        }
      ],
      tools: TEST_TOOLS,
      tool_choice: 'auto'
    });
    const time1 = Date.now() - start1;

    console.log(`\n✅ 响应时间: ${time1}ms`);
    console.log(`📝 响应内容:`);
    console.log(`   - Finish Reason: ${response1.choices[0]?.finish_reason}`);
    console.log(`   - Message Content: ${response1.choices[0]?.message?.content || '(无文本内容)'}`);
    console.log(`   - Tool Calls: ${response1.choices[0]?.message?.tool_calls ? '✅ 有' : '❌ 无'}`);
    
    if (response1.choices[0]?.message?.tool_calls) {
      console.log(`   - 调用的工具:`);
      response1.choices[0].message.tool_calls.forEach((call: any, index: number) => {
        console.log(`     ${index + 1}. ${call.function.name}`);
        console.log(`        参数: ${call.function.arguments}`);
      });
    }

    // 测试2: Flash 0.7 + think: true
    console.log('\n💡 配置2: Flash 0.7 + think: true');
    console.log('   - Model: doubao-seed-1-6-flash-250715');
    console.log('   - Temperature: 0.7');
    console.log('   - Think: ✅ true');
    
    const start2 = Date.now();
    const response2 = await aiBridgeService.generateFlashWithThink({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个幼儿园管理助手，可以调用工具来帮助用户查询信息。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: simpleQuery
        }
      ],
      tools: TEST_TOOLS,
      tool_choice: 'auto'
    });
    const time2 = Date.now() - start2;

    console.log(`\n✅ 响应时间: ${time2}ms`);
    console.log(`📝 响应内容:`);
    console.log(`   - Finish Reason: ${response2.choices[0]?.finish_reason}`);
    console.log(`   - Message Content: ${response2.choices[0]?.message?.content || '(无文本内容)'}`);
    console.log(`   - Tool Calls: ${response2.choices[0]?.message?.tool_calls ? '✅ 有' : '❌ 无'}`);
    
    if (response2.choices[0]?.message?.tool_calls) {
      console.log(`   - 调用的工具:`);
      response2.choices[0].message.tool_calls.forEach((call: any, index: number) => {
        console.log(`     ${index + 1}. ${call.function.name}`);
        console.log(`        参数: ${call.function.arguments}`);
      });
    }

    // 对比总结
    console.log('\n📊 场景1对比总结:');
    console.log(`   - 速度差异: ${time2 - time1}ms (${time2 > time1 ? 'Flash 0.7更慢' : 'Flash 0.7更快'})`);
    console.log(`   - Flash 0.1 响应时间: ${time1}ms`);
    console.log(`   - Flash 0.7+think 响应时间: ${time2}ms`);
    console.log(`   - 速度比: ${(time2 / time1).toFixed(2)}x`);

  } catch (error: any) {
    console.error('❌ 测试场景1失败:', error.message);
  }

  // 测试场景2：复杂工具调用
  console.log('\n\n' + '='.repeat(100));
  console.log('📊 测试场景2：复杂工具调用 - "创建一个亲子活动"');
  console.log('=' .repeat(100));

  const complexQuery = '帮我创建一个亲子活动，主题是"春游踏青"，时间定在下周六，活动内容包括户外游戏和野餐。';

  try {
    // 测试1: Flash 0.1
    console.log('\n🚀 配置1: Flash 0.1（无think参数）');
    const start3 = Date.now();
    const response3 = await aiBridgeService.generateFastChatCompletion({
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个幼儿园管理助手，可以调用工具来帮助用户创建活动。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: complexQuery
        }
      ],
      tools: TEST_TOOLS,
      tool_choice: 'auto'
    });
    const time3 = Date.now() - start3;

    console.log(`\n✅ 响应时间: ${time3}ms`);
    console.log(`📝 响应内容:`);
    console.log(`   - Tool Calls: ${response3.choices[0]?.message?.tool_calls ? '✅ 有' : '❌ 无'}`);
    
    if (response3.choices[0]?.message?.tool_calls) {
      response3.choices[0].message.tool_calls.forEach((call: any, index: number) => {
        console.log(`   ${index + 1}. 工具: ${call.function.name}`);
        console.log(`      参数: ${call.function.arguments}`);
      });
    }

    // 测试2: Flash 0.7 + think
    console.log('\n💡 配置2: Flash 0.7 + think: true');
    const start4 = Date.now();
    const response4 = await aiBridgeService.generateFlashWithThink({
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是一个幼儿园管理助手，可以调用工具来帮助用户创建活动。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: complexQuery
        }
      ],
      tools: TEST_TOOLS,
      tool_choice: 'auto'
    });
    const time4 = Date.now() - start4;

    console.log(`\n✅ 响应时间: ${time4}ms`);
    console.log(`📝 响应内容:`);
    console.log(`   - Tool Calls: ${response4.choices[0]?.message?.tool_calls ? '✅ 有' : '❌ 无'}`);
    
    if (response4.choices[0]?.message?.tool_calls) {
      response4.choices[0].message.tool_calls.forEach((call: any, index: number) => {
        console.log(`   ${index + 1}. 工具: ${call.function.name}`);
        console.log(`      参数: ${call.function.arguments}`);
      });
    }

    // 对比总结
    console.log('\n📊 场景2对比总结:');
    console.log(`   - Flash 0.1 响应时间: ${time3}ms`);
    console.log(`   - Flash 0.7+think 响应时间: ${time4}ms`);
    console.log(`   - 速度差异: ${time4 - time3}ms`);
    console.log(`   - 速度比: ${(time4 / time3).toFixed(2)}x`);

  } catch (error: any) {
    console.error('❌ 测试场景2失败:', error.message);
  }

  // 最终总结
  console.log('\n\n' + '='.repeat(100));
  console.log('📋 最终对比总结');
  console.log('=' .repeat(100));
  console.log(`
🚀 Flash 0.1（无think参数）:
   - 特点: 快速、确定、稳定
   - 适合: 工具调用、数据查询
   - 优势: 响应速度快
   - 劣势: 缺少思考过程

💡 Flash 0.7 + think: true:
   - 特点: 有思考过程、更灵活
   - 适合: 需要思考的工具调用
   - 优势: 可能有更好的推理
   - 劣势: 响应速度可能较慢

🎯 结论:
   - 如果API支持think参数，Flash 0.7+think可能会展示思考过程
   - 如果API不支持think参数，两者主要差异在temperature
   - 实际效果需要根据API文档和测试结果判断
  `);
}

// 运行测试
testFlash01VsFlash07Think()
  .then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });

