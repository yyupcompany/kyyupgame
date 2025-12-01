import { aiBridgeService } from './unified-tenant-system/server/src/services/ai/bridge/ai-bridge.service';

async function testAIBridgeFix() {
  try {
    console.log('🧪 测试AI Bridge修复效果...\n');

    // 测试analyze方法
    console.log('📝 测试analyze方法...');
    const result = await aiBridgeService.analyze(
      '你好，请简单介绍一下自己',
      {
        type: 'general',
        context: '测试AI模型调用',
        requireStructured: false
      }
    );

    console.log('✅ AI Bridge 调用成功！');
    console.log('📥 响应结果:', result);

  } catch (error) {
    console.log('❌ AI Bridge 调用失败:', error.message);
    console.log('错误详情:', error);
  }
}

testAIBridgeFix();