/**
 * 调试模型ID传递问题
 */

const { UnifiedAICallerService } = require('./server/dist/services/ai/tools/core/unified-ai-caller.service');

async function testModelIdPassing() {
  try {
    console.log('🔍 开始调试模型ID传递问题...');

    // 测试1: 直接调用callFlash
    console.log('\n📋 测试1: 直接调用UnifiedAICallerService.callFlash');
    const response1 = await UnifiedAICallerService.callFlash({
      messages: [
        { role: 'system', content: '你是一个测试助手' },
        { role: 'user', content: '测试消息' }
      ],
      userId: 1
    });
    console.log('✅ 测试1成功');

  } catch (error) {
    console.error('❌ 测试1失败:', error.message);
    if (error.message.includes('250715')) {
      console.log('🎯 发现问题! 模型ID被截断为250715');
    }
  }

  try {
    // 测试2: 传入明确指定完整模型名称
    console.log('\n📋 测试2: 传入完整模型名称');
    const response2 = await UnifiedAICallerService.callFlash({
      messages: [
        { role: 'system', content: '你是一个测试助手' },
        { role: 'user', content: '测试消息' }
      ],
      userId: 1,
      model: 'doubao-seed-1-6-flash-250715'  // 明确指定完整模型名
    });
    console.log('✅ 测试2成功');

  } catch (error) {
    console.error('❌ 测试2失败:', error.message);
    if (error.message.includes('250715') && !error.message.includes('doubao')) {
      console.log('🎯 发现问题! 即使传入完整模型名，仍被截断为250715');
    }
  }
}

testModelIdPassing().then(() => {
  console.log('\n🏁 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('💥 测试脚本错误:', error);
  process.exit(1);
});