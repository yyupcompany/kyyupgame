/**
 * 测试新的豆包模型 doubao-seedream-4-5-251128
 */

const { Sequelize } = require('sequelize');
const https = require('https');
const { URL } = require('url');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

/**
 * 直接调用豆包API测试图片生成
 */
async function testDoubaoImageGeneration() {
  try {
    console.log('🚀 开始测试豆包新模型 doubao-seedream-4-5-251128...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 获取新模型配置
    const [modelConfig] = await sequelize.query(`
      SELECT name, display_name, provider, endpoint_url, api_key, model_parameters
      FROM ai_model_config
      WHERE name = 'doubao-seedream-4-5-251128'
    `);

    if (modelConfig.length === 0) {
      console.error('❌ 未找到新模型配置');
      return;
    }

    const config = modelConfig[0];
    console.log('📋 新模型配置:');
    console.log(`   名称: ${config.name}`);
    console.log(`   显示: ${config.display_name}`);
    console.log(`   端点: ${config.endpoint_url}`);
    console.log(`   密钥: ${config.api_key.substring(0, 10)}...\n`);

    // 构建请求数据 - 新模型要求至少3686400像素
    const requestData = JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt: '新鲜的红苹果，卡通风格，明亮饱和色彩，圆润光滑，带叶子，Q版可爱，透明背景PNG，高清晰度，1920x1920',
      n: 1,
      size: '1920x1920', // 1920x1920 = 3686400像素，符合最小要求
      quality: 'standard',
      style: 'natural'
    });

    console.log('🎨 调用豆包文生图API...');
    console.log(`   模型: doubao-seedream-4-5-251128`);
    console.log(`   提示词: 新鲜的红苹果，卡通风格...`);
    console.log(`   尺寸: 1920x1920 (3686400像素 - 符合最小要求)\n`);

    const startTime = Date.now();

    // 发送HTTP请求
    const result = await makeHttpRequest(config.endpoint_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`,
        'Accept-Charset': 'utf-8',
        'User-Agent': 'KindergartenAI/1.0'
      },
      data: requestData
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️  调用耗时: ${duration}ms\n`);

    if (result.success) {
      const response = JSON.parse(result.data);
      console.log('✅ API调用成功!');
      console.log('📊 响应数据:');
      console.log(JSON.stringify(response, null, 2));

      if (response.data && response.data.length > 0) {
        const imageUrl = response.data[0].url;
        console.log(`\n🖼️  图片生成成功!`);
        console.log(`   URL: ${imageUrl}`);
        console.log(`   模型: doubao-seedream-4-5-251128`);

        // 测试图片URL是否可访问
        console.log('\n🔗 验证图片URL可访问性...');
        await testImageUrl(imageUrl);
      } else {
        console.log('⚠️  未返回图片数据');
      }
    } else {
      console.error('❌ API调用失败:');
      console.error(`   状态码: ${result.statusCode}`);
      console.error(`   错误: ${result.error}`);
      if (result.data) {
        console.error('   响应内容:', result.data);
        try {
          const errorResponse = JSON.parse(result.data);
          console.error('   错误详情:', JSON.stringify(errorResponse, null, 2));
        } catch (e) {
          console.error('   响应原文:', result.data);
        }
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

/**
 * 发送HTTP请求
 */
function makeHttpRequest(url, options) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const client = urlObj.protocol === 'https:' ? https : require('http');

    const req = client.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        statusCode: 0
      });
    });

    if (options.data) {
      req.write(options.data);
    }

    req.end();
  });
}

/**
 * 测试图片URL是否可访问
 */
async function testImageUrl(imageUrl) {
  try {
    const urlObj = new URL(imageUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 10000
    };

    const client = urlObj.protocol === 'https:' ? https : require('http');

    const req = client.request(options, (res) => {
      console.log(`   HTTP状态: ${res.statusCode}`);
      console.log(`   内容类型: ${res.headers['content-type'] || '未知'}`);
      console.log(`   内容长度: ${res.headers['content-length'] || '未知'}`);

      if (res.statusCode === 200) {
        console.log('✅ 图片URL可正常访问');
      } else {
        console.log('⚠️  图片URL返回异常状态码');
      }

      req.destroy();
    });

    req.on('error', (error) => {
      console.log(`❌ 图片URL访问失败: ${error.message}`);
    });

    req.on('timeout', () => {
      console.log('⏰ 图片URL访问超时');
      req.destroy();
    });

    req.setTimeout(10000);
    req.end();
  } catch (error) {
    console.log(`❌ 图片URL测试失败: ${error.message}`);
  }
}

// 运行测试
testDoubaoImageGeneration();