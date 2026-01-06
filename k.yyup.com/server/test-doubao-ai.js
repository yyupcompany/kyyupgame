/**
 * 测试doubao AI调用
 * 验证配置是否正确工作
 */

const { aiBridgeService } = require('./src/services/ai/bridge/ai-bridge.service');

async function testDoubaoAI() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 开始测试doubao AI调用');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const testPrompt = '请简单介绍一下春天的特点，适合幼儿园教学。';

    console.log('📝 测试提示词:', testPrompt);
    console.log('⏱️  开始调用AI...');

    const startTime = Date.now();

    // 测试数据库配置的doubao模型
    const response = await aiBridgeService.generateChatCompletion({
      model: 'default', // 使用默认模型（应该是我们配置的doubao flash）
      messages: [
        {
          role: 'system',
          content: '你是一个专业的幼儿园教师，擅长用简单易懂的语言向小朋友解释自然现象。'
        },
        {
          role: 'user',
          content: testPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const duration = Date.now() - startTime;

    console.log('✅ AI调用成功！');
    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 AI回复:');
    console.log(response.choices[0]?.message?.content || '无回复内容');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 显示token使用情况
    if (response.usage) {
      console.log('📊 Token使用情况:');
      console.log(`  - 输入token: ${response.usage.prompt_tokens}`);
      console.log(`  - 输出token: ${response.usage.completion_tokens}`);
      console.log(`  - 总计token: ${response.usage.total_tokens}`);
    }

    console.log('🎉 doubao AI测试通过！');

  } catch (error) {
    console.error('❌ AI调用失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);

    // 提供具体的解决建议
    if (error.message.includes('API Key 未配置') || error.message.includes('401')) {
      console.log('');
      console.log('💡 解决建议:');
      console.log('1. 检查 .env 文件中的 AIBRIDGE_API_KEY 是否正确设置');
      console.log('2. 确保API密钥有效且有足够权限');
      console.log('3. 重启服务器重新加载环境变量');
    } else if (error.message.includes('503') || error.message.includes('服务暂时不可用')) {
      console.log('');
      console.log('💡 解决建议:');
      console.log('1. 检查网络连接');
      console.log('2. 确认API端点URL是否正确');
      console.log('3. 稍后重试');
    }

    process.exit(1);
  }
}

// 执行测试
if (require.main === module) {
  testDoubaoAI();
}

module.exports = { testDoubaoAI };