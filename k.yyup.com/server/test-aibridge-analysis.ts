/**
 * 测试AIBridge分析功能
 * 验证修改后的AI分析功能是否正常工作
 */

import 'dotenv/config';
import { aiBridgeService } from './src/services/aibridge.service';

async function testAIAnalysis() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 [测试] 开始测试AI分析功能');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 模拟一个文档分析的提示词
    const testPrompt = `
请分析以下幼儿园教师教案内容，并给出评分和建议：

教案主题：春天来了
适合年龄：4-5岁
活动目标：
1. 认识春天的基本特征
2. 培养观察自然的能力
3. 发展语言表达能力

活动内容：
1. 春天图片展示和讨论
2. 户外寻找春天
3. 制作春天手工作品
4. 学唱春天歌曲

请从教学目标、活动设计、适宜性、创新性四个维度进行评分（满分100分），并提供改进建议。
请以JSON格式返回结果，包含：score（总分）、grade（等级）、categoryScores（各维度分数）、suggestions（建议）。
    `;

    console.log('📝 [测试] 发送分析请求...');
    const startTime = Date.now();

    // 调用AI分析功能
    const result = await aiBridgeService.analyze(testPrompt, {
      model: 'doubao-seed-1-6-flash-250715',
      temperature: 0.3,
      maxTokens: 2000
    });

    const duration = Date.now() - startTime;

    console.log('✅ [测试] AI分析成功！');
    console.log(`⏱️  耗时: ${duration} ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 分析结果:');
    console.log(result);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 尝试解析结果
    try {
      const parsedResult = aiBridgeService.parseResult(result);
      console.log('🔍 解析后的结构化结果:');
      console.log(JSON.stringify(parsedResult, null, 2));
    } catch (parseError) {
      console.log('⚠️  结果解析失败，但原始结果可用');
    }

  } catch (error: any) {
    console.error('❌ [测试] AI分析失败:');
    console.error('错误类型:', error?.name);
    console.error('错误信息:', error?.message || error);

    if (error?.errors && Array.isArray(error.errors)) {
      console.error('子错误详情:');
      error.errors.forEach((subErr: any, idx: number) => {
        console.error(`  [${idx + 1}]`, subErr?.message || subErr);
      });
    }
  } finally {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  }
}

// 执行测试
void testAIAnalysis();