#!/usr/bin/env node
/**
 * 使用豆包SeedDream 4.5模型批量生成游戏背景图并上传到OSS
 * 为不同游戏主题生成高质量的背景图素材
 */

const { Sequelize } = require('sequelize');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 导入OSS服务
const { SystemOSSService } = require('./dist/services/system-oss.service');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

const SYSTEM_ADMIN_USER_ID = 1;

// 背景图生成配置
const BACKGROUND_CONFIGS = [
  // 水果记忆游戏背景
  {
    category: 'fruit-memory',
    name: 'fruit-garden',
    filename: 'fruit-garden-bg.jpg',
    prompt: '温馨的果园场景，清晨阳光，各种果树环绕，绿色草地，鲜花盛开，梦幻卡通风格，色彩明亮，适合儿童游戏，高质量，1920x1920分辨率',
    description: '水果记忆游戏 - 果园场景背景'
  },
  {
    category: 'fruit-memory',
    name: 'fruit-market',
    filename: 'fruit-market-bg.jpg',
    prompt: '热闹的水果市场场景，彩色遮阳棚，各种水果摊位，人们正在挑选水果，活力四射，卡通插画风格，温馨欢快，1920x1920分辨率',
    description: '水果记忆游戏 - 市场场景背景'
  },
  {
    category: 'fruit-memory',
    name: 'magic-forest',
    filename: 'magic-forest-bg.jpg',
    prompt: '神秘的魔法森林，巨大果树，发光水果，小精灵飞舞，魔法光芒，梦幻紫色调，奇幻氛围，1920x1920分辨率',
    description: '水果记忆游戏 - 魔法森林背景'
  },

  // 公主花园找不同背景
  {
    category: 'princess-garden',
    name: 'magic-castle',
    filename: 'magic-castle-bg.jpg',
    prompt: '梦幻的粉色城堡，周围有彩虹和蝴蝶，魔法氛围，童话风格，温馨浪漫，天空有星星和月亮，适合女孩游戏，1920x1920分辨率',
    description: '公主花园 - 魔法城堡背景'
  },
  {
    category: 'princess-garden',
    name: 'flower-garden',
    filename: 'flower-garden-bg.jpg',
    prompt: '美丽的公主花园，玫瑰花海，薰衣草田，向日葵，蝴蝶飞舞，梦幻粉色调，浪漫温馨，童话城堡风格，1920x1920分辨率',
    description: '公主花园 - 花海背景'
  },
  {
    category: 'princess-garden',
    name: 'fairy-pond',
    filename: 'fairy-pond-bg.jpg',
    prompt: '神秘的精灵池塘，水面如镜，荷花盛开，发光仙子，魔法倒影，梦幻蓝紫色调，童话氛围，1920x1920分辨率',
    description: '公主花园 - 精灵池塘背景'
  },

  // 太空寻宝背景
  {
    category: 'space-treasure',
    name: 'galaxy-stars',
    filename: 'galaxy-bg.jpg',
    prompt: '浩瀚的银河系，无数星星闪烁，深蓝紫色宇宙，星云和星系，科幻感，充满探索氛围，高清宇宙场景，1920x1920分辨率',
    description: '太空寻宝 - 银河背景'
  },
  {
    category: 'space-treasure',
    name: 'space-station',
    filename: 'space-station-bg.jpg',
    prompt: '未来派太空站，金属质感，控制面板，观察窗看到地球，科技感强烈，蓝色调，精密设计，未来科技场景，1920x1920分辨率',
    description: '太空寻宝 - 空间站背景'
  },
  {
    category: 'space-treasure',
    name: 'alien-planet',
    filename: 'alien-planet-bg.jpg',
    prompt: '神秘的外星星球，奇异植物，两个月亮，紫色天空，外星地貌，充满探索和冒险氛围，科幻奇幻，1920x1920分辨率',
    description: '太空寻宝 - 外星背景'
  }
];

// 本地临时目录
const TEMP_DIR = path.join(__dirname, 'temp-backgrounds');
const GAME_IMAGES_DIR = path.join(__dirname, 'uploads/games/images/backgrounds');

// 确保目录存在
function ensureDirectories() {
  [TEMP_DIR, GAME_IMAGES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  console.log('✅ 目录创建完成');
}

/**
 * 下载图片到本地
 */
function downloadImage(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TEMP_DIR, filename);
    const file = fs.createWriteStream(filePath);

    https.get(imageUrl, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', reject);
  });
}

/**
 * 上传图片到OSS (真实实现)
 */
async function uploadToOSS(filePath, ossKey) {
  try {
    // 使用项目的OSS服务
    const ossService = new SystemOSSService();

    if (!ossService.client) {
      throw new Error('OSS服务未初始化');
    }

    // 读取文件内容
    const fileContent = fs.readFileSync(filePath);

    // 上传到OSS
    const result = await ossService.uploadFile(fileContent, ossKey);

    if (!result.url) {
      throw new Error('上传失败：未返回URL');
    }

    console.log(`   ✅ OSS上传成功: ${result.url}`);
    return result.url;
  } catch (error) {
    throw new Error(`OSS上传失败: ${error.message}`);
  }
}

/**
 * 调用豆包API生成图片
 */
function generateImageWithDoubao(prompt) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt: prompt,
      n: 1,
      size: '1920x1920', // 新模型要求3686400+像素
      quality: 'high',
      style: 'natural'
    });

    const options = {
      hostname: 'ark.cn-beijing.volces.com',
      port: 443,
      path: '/api/v3/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ffb6e528-e998-4ebf-b601-38a8a33c2365`,
        'Accept-Charset': 'utf-8',
        'User-Agent': 'KindergartenAI/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求错误:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.setTimeout(60000); // 60秒超时
    req.write(requestData);
    req.end();
  });
}

/**
 * 生成单个背景图
 */
async function generateBackground(config) {
  try {
    console.log(`\n🎨 生成背景图: ${config.name}`);
    console.log(`   类别: ${config.category}`);
    console.log(`   描述: ${config.description}`);
    console.log(`   提示词: ${config.prompt.substring(0, 100)}...`);

    // 使用豆包模型生成图片
    const result = await generateImageWithDoubao(config.prompt);

    if (!result || !result.data || result.data.length === 0) {
      throw new Error('生成失败：未返回有效图片数据');
    }

    const imageUrl = result.data[0].url;
    console.log(`   📥 生成成功: ${imageUrl.substring(0, 80)}...`);
    console.log(`   📏 图片尺寸: ${result.data[0].size}`);

    // 下载到本地
    console.log('   💾 下载图片...');
    const downloadedPath = await downloadImage(imageUrl, `temp-${config.filename}`);

    // 构建OSS路径
    const ossKey = `games/backgrounds/${config.category}/${config.filename}`;
    console.log(`   📤 上传到OSS: ${ossKey}`);

    // 上传到OSS
    const ossUrl = await uploadToOSS(downloadedPath, ossKey);

    // 保存本地备份
    const localBackupPath = path.join(GAME_IMAGES_DIR, config.category, config.filename);
    if (!fs.existsSync(path.join(GAME_IMAGES_DIR, config.category))) {
      fs.mkdirSync(path.join(GAME_IMAGES_DIR, config.category), { recursive: true });
    }
    fs.copyFileSync(downloadedPath, localBackupPath);

    // 清理临时文件
    fs.unlinkSync(downloadedPath);

    console.log(`   ✅ 背景图生成完成!`);
    console.log(`   📍 OSS地址: ${ossUrl}`);
    console.log(`   💾 本地备份: ${localBackupPath}`);

    return {
      success: true,
      config: config,
      ossUrl: ossUrl,
      localPath: localBackupPath,
      originalUrl: imageUrl,
      generationInfo: {
        model: result.model,
        size: result.data[0].size,
        usage: result.usage
      }
    };

  } catch (error) {
    console.error(`   ❌ 生成失败: ${config.name} - ${error.message}`);
    return {
      success: false,
      config: config,
      error: error.message
    };
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始批量生成游戏背景图...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 确保目录存在
    ensureDirectories();

    console.log(`📋 背景图生成清单: ${BACKGROUND_CONFIGS.length} 张\n`);
    console.log('⚡ 使用模型: doubao-seedream-4-5-251128 (1920x1920)\n');

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    const results = [];

    // 逐个生成背景图
    for (let i = 0; i < BACKGROUND_CONFIGS.length; i++) {
      const config = BACKGROUND_CONFIGS[i];
      const progress = Math.round(((i + 1) / BACKGROUND_CONFIGS.length) * 100);

      console.log(`${'='.repeat(60)}`);
      console.log(`🔄 ${progress}% - 正在处理: ${config.name}`);
      console.log(`${'='.repeat(60)}`);

      const result = await generateBackground(config);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      // 短暂延迟，避免API限制
      if (i < BACKGROUND_CONFIGS.length - 1) {
        console.log('⏳ 等待5秒后继续下一个...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 背景图生成完成！');
    console.log(`   ✅ 成功生成: ${successCount} 张`);
    console.log(`   ❌ 失败: ${errorCount} 张`);
    console.log(`   ⏱️ 总耗时: ${Math.floor(totalTime / 60)} 分 ${totalTime % 60} 秒`);
    console.log(`   ⚡ 平均耗时: ${(totalTime / BACKGROUND_CONFIGS.length).toFixed(1)} 秒/张`);
    console.log('='.repeat(60));

    // 生成清单文件
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalImages: BACKGROUND_CONFIGS.length,
      successCount: successCount,
      errorCount: errorCount,
      categories: {
        'fruit-memory': 3,
        'princess-garden': 3,
        'space-treasure': 3
      },
      model: 'doubao-seedream-4-5-251128',
      resolution: '1920x1920',
      results: results
    };

    fs.writeFileSync(
      path.join(GAME_IMAGES_DIR, 'backgrounds-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('\n✅ 背景图清单已生成: uploads/games/images/backgrounds-manifest.json');

    // 显示成功生成的背景图
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log('\n📋 成功生成的背景图列表:');
      successfulResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.config.name} - ${result.ossUrl}`);
      });
    }

  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行
if (require.main === module) {
  main();
}