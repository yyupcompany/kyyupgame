/**
 * 直接测试Flash服务
 * 绕过数据库，直接测试AI模型调用
 */

import 'dotenv/config';
import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';

async function testFlashDirect() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 [测试] 直接测试Flash服务');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const testPrompt = `
请分析以下幼儿园教师教案内容，并给出评分和建议：

教案主题：春天来了
适合年龄：4-5岁
活动目标：
1. 认识春天的基本特征
2. 培养观察自然的能力
3. 发展语言表达能力

请从教学目标、活动设计、适宜性、创新性四个维度进行评分（满分100分），并提供改进建议。
请以JSON格式返回结果，包含：score（总分）、grade（等级）、categoryScores（各维度分数）、suggestions（建议）。
    `;

    console.log('📝 [测试] 调用Flash模型...');

    // 使用环境变量中的API配置直接调用
    const response = await aiBridgeService.generateChatCompletion({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的幼儿园教育专家，擅长分析和评估教师教案。请以JSON格式返回分析结果。'
        },
        {
          role: 'user',
          content: testPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }, {
      endpointUrl: process.env.AIBRIDGE_BASE_URL || 'https://api.doubao.com/v1',
      apiKey: process.env.AIBRIDGE_API_KEY || ''
    });

    const result = response.choices[0]?.message?.content || '';

    console.log('✅ [测试] Flash服务调用成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 分析结果:');
    console.log(result);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 尝试解析JSON结果
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        console.log('🔍 解析后的结构化结果:');
        console.log(JSON.stringify(parsedResult, null, 2));
      }
    } catch (parseError) {
      console.log('⚠️  结果解析失败，但原始结果可用');
    }

  } catch (error: any) {
    console.error('❌ [测试] Flash服务调用失败:');
    console.error('错误类型:', error?.name);
    console.error('错误信息:', error?.message || error);

    if (error.message.includes('API Key 未配置')) {
      console.log('');
      console.log('💡 提示：需要配置 AIBRIDGE_API_KEY 环境变量');
      console.log('   请在 .env 文件中添加有效的API密钥');
    }
  } finally {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  }
}

// 执行测试
void testFlashDirect();