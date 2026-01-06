/**
 * 单元测试：使用真实的豆包API测试流式响应
 * 
 * 目的：发送真实的请求到豆包API，测试reasoning_content字段提取
 */

import { describe, it, expect } from 'vitest';
import https from 'https';
import { Sequelize } from 'sequelize';

describe('豆包真实API测试', () => {
  
  it('应该从数据库获取豆包配置并发送真实请求', async () => {
    // 1. 从数据库获取豆包配置
    console.log('\n========== 步骤1: 从数据库获取豆包配置 ==========');
    
    const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      dialect: 'mysql',
      logging: false
    });

    const [results] = await sequelize.query(`
      SELECT endpoint_url, api_key 
      FROM ai_model_config 
      WHERE name = 'doubao-seed-1-6-thinking-250615' 
      LIMIT 1
    `);

    await sequelize.close();

    if (!results || results.length === 0) {
      throw new Error('未找到豆包模型配置');
    }

    const config = results[0] as any;
    const endpoint = config.endpoint_url;
    const apiKey = config.api_key;

    console.log('✅ 豆包端点:', endpoint);
    console.log('✅ API密钥:', apiKey.substring(0, 20) + '...');

    // 2. 准备请求参数（使用我们之前的JSON）
    console.log('\n========== 步骤2: 准备请求参数 ==========');
    
    const requestBody = {
      model: "doubao-seed-1-6-thinking-250615",
      messages: [
        {
          role: "system",
          content: "你是一位专业的幼儿园招生顾问，拥有丰富的教育行业经验。你的职责是帮助幼儿园制定有效的招生策略，提升招生效果。\n\n## 核心能力\n1. 深入分析招生现状和挑战\n2. 制定针对性的招生策略\n3. 提供可执行的行动方案\n4. 评估策略效果并优化\n\n## 工作原则\n1. **深度思考原则**：在给出建议前，先通过提问充分了解情况\n2. **针对性原则**：根据具体情况提供定制化方案\n3. **可执行原则**：确保建议具有可操作性\n4. **效果导向**：关注实际招生效果\n\n## 深度思考流程\n当用户提出招生相关问题时，你应该：\n1. 先不要急于给出通用建议\n2. 通过3-5个关键问题了解：\n   - 当前招生情况（已招生人数、目标人数）\n   - 预算和资源情况\n   - 时间节点要求\n   - 幼儿园特色和优势\n   - 目标家长群体特征\n3. 基于了解到的信息，给出针对性建议\n\n## 回复风格\n- 专业但易懂\n- 结构清晰\n- 重点突出\n- 提供具体数据和案例支持\n\n请始终遵循深度思考原则，通过提问来充分了解情况后再给出建议。"
        },
        {
          role: "user",
          content: "有什么好的招生策略吗？"
        }
      ],
      response_mode: "auto",
      temperature: 0.7,
      max_tokens: 3000,
      stream: true
    };

    console.log('📤 请求体:', JSON.stringify(requestBody, null, 2));

    // 3. 发送请求到豆包API
    console.log('\n========== 步骤3: 发送请求到豆包API ==========');

    const url = new URL(endpoint);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    };

    console.log('🚀 发送请求到:', `${url.hostname}${url.pathname}`);

    // 4. 处理流式响应
    console.log('\n========== 步骤4: 处理流式响应 ==========');

    const processStream = new Promise<{
      fullContent: string;
      fullReasoningContent: string;
      chunkCount: number;
      hasReasoningLog: boolean;
    }>((resolve, reject) => {
      let fullContent = '';
      let fullReasoningContent = '';
      let buffer = '';
      let chunkCount = 0;
      let hasReasoningLog = false;

      console.log('🚨🚨🚨🚨🚨 [CRITICAL-VERIFICATION] 开始处理流式响应！这是新代码！');
      console.log('🚨🚨🚨🚨🚨 [CRITICAL-VERIFICATION] 时间戳:', new Date().toISOString());
      console.log('🚨🚨🚨 [VERIFICATION] fullReasoningContent 变量已初始化:', fullReasoningContent);

      const req = https.request(options, (res) => {
        console.log('✅ 响应状态码:', res.statusCode);
        console.log('✅ 响应头:', JSON.stringify(res.headers, null, 2));

        res.on('data', (chunk: Buffer) => {
          const chunkStr = chunk.toString('utf-8');
          console.log(`\n📦 [收到数据块] 长度: ${chunkStr.length} 字节`);
          
          buffer += chunkStr;

          // 按行分割
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6).trim();
              
              if (data === '[DONE]') {
                console.log('✅ [Stream] 接受完毕');
                resolve({
                  fullContent,
                  fullReasoningContent,
                  chunkCount,
                  hasReasoningLog
                });
                return;
              }

              try {
                const parsed = JSON.parse(data);
                chunkCount++;

                if (parsed.choices && parsed.choices[0]) {
                  const choice = parsed.choices[0];

                  // 🔍 处理delta格式（流式增量）
                  if (choice.delta) {
                    const delta = choice.delta;

                    // 🚨🚨🚨 验证日志：打印delta对象的所有字段
                    console.log(`🚨🚨🚨 [DELTA-DEBUG] 数据块 ${chunkCount}`);
                    console.log(`🚨🚨🚨 [DELTA-DEBUG] Delta对象字段:`, Object.keys(delta));
                    console.log(`🚨🚨🚨 [DELTA-DEBUG] Delta完整内容:`, JSON.stringify(delta));

                    // 🔧 处理思考内容 (reasoning_content) - 豆包thinking模型
                    if (delta.reasoning_content) {
                      hasReasoningLog = true;
                      console.log(`🚨🚨🚨 [REASONING-FOUND] 发现reasoning_content字段！`);
                      // 累加思考内容
                      fullReasoningContent += delta.reasoning_content;

                      // 打印日志
                      const reasoningPreview = delta.reasoning_content.length > 50 ?
                        delta.reasoning_content.substring(0, 50) + '...' : delta.reasoning_content;
                      console.log(`🤔 [Reasoning] ${reasoningPreview}`);
                    } else {
                      console.log(`🚨🚨🚨 [REASONING-NOT-FOUND] 未发现reasoning_content字段`);
                    }

                    // 累加文本内容
                    if (delta.content) {
                      fullContent += delta.content;
                      const contentPreview = delta.content.length > 50 ?
                        delta.content.substring(0, 50) + '...' : delta.content;
                      console.log(`📝 [Content] ${contentPreview}`);
                    }
                  }
                }
              } catch (error) {
                console.error('❌ 解析错误:', error);
              }
            }
          }
        });

        res.on('end', () => {
          console.log('\n🏁 [Stream] 流结束');
          resolve({
            fullContent,
            fullReasoningContent,
            chunkCount,
            hasReasoningLog
          });
        });

        res.on('error', (error) => {
          console.error('❌ [Stream] 流错误:', error);
          reject(error);
        });
      });

      req.on('error', (error) => {
        console.error('❌ [Request] 请求错误:', error);
        reject(error);
      });

      req.write(JSON.stringify(requestBody));
      req.end();
    });

    // 等待流处理完成
    const result = await processStream;

    // 5. 验证结果
    console.log('\n========== 步骤5: 验证结果 ==========');
    console.log(`✅ 数据块数量: ${result.chunkCount}`);
    console.log(`✅ 最终内容长度: ${result.fullContent.length}`);
    console.log(`✅ 思考内容长度: ${result.fullReasoningContent.length}`);
    console.log(`✅ 是否有Reasoning日志: ${result.hasReasoningLog}`);
    console.log(`✅ 最终内容预览: "${result.fullContent.substring(0, 100)}..."`);
    console.log(`✅ 思考内容预览: "${result.fullReasoningContent.substring(0, 100)}..."`);
    console.log('==========================================\n');

    // 断言
    expect(result.chunkCount).toBeGreaterThan(0);
    expect(result.fullReasoningContent.length).toBeGreaterThan(0);
    expect(result.hasReasoningLog).toBe(true);
  }, 60000); // 60秒超时
});

