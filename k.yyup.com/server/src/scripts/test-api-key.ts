/**
 * 测试 Doubao API 密钥是否有效
 */

import https from 'https';
import { sequelize } from '../init';
import AIModelConfig from '../models/ai-model-config.model';

async function testAPIKey() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 获取深度思考模型配置
    const model = await AIModelConfig.findOne({
      where: { name: 'doubao-seed-1-6-thinking-250615' },
      attributes: ['name', 'apiKey', 'endpointUrl'],
      raw: true
    }) as any;

    if (!model) {
      console.log('❌ 未找到模型配置');
      process.exit(1);
    }

    const API_KEY = model.apiKey;
    const ENDPOINT = model.endpointUrl;

    console.log('\n🧪 测试 Doubao API 密钥...');
    console.log('模型:', model.name);
    console.log('端点:', ENDPOINT);
    console.log('密钥长度:', API_KEY?.length || 0);
    console.log('密钥预览:', API_KEY?.substring(0, 30) + '...');

    if (!API_KEY) {
      console.log('\n❌ API 密钥为空！');
      process.exit(1);
    }

    const testData = {
      model: model.name,
      messages: [
        { role: 'user', content: '你好' }
      ],
      max_tokens: 10
    };

    const url = new URL(ENDPOINT);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log('\n📊 响应状态码:', res.statusCode);
          console.log('📝 响应内容:', data.substring(0, 500));

          if (res.statusCode === 200) {
            console.log('\n✅ API 密钥有效！');
            resolve(data);
          } else if (res.statusCode === 401) {
            console.log('\n❌ API 密钥无效或格式不正确！');
            console.log('💡 建议：请检查火山引擎控制台中的 API 密钥是否有效');
            reject(new Error('401 Unauthorized'));
          } else {
            console.log('\n⚠️  其他错误:', res.statusCode);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('\n❌ 请求失败:', error.message);
        reject(error);
      });

      req.write(JSON.stringify(testData));
      req.end();
    });
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

testAPIKey()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
