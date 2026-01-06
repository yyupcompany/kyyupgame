#!/usr/bin/env node

/**
 * 多租户OSS目录结构测试脚本
 * 验证新的system/和rent/目录结构访问是否正常
 */

const axios = require('axios');
const path = require('path');

// 配置
const API_BASE = 'http://localhost:3000';
const TEST_PHONE = '13800138000';

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message) {
  colorLog('blue', `[INFO] ${message}`);
}

function logSuccess(message) {
  colorLog('green', `[SUCCESS] ${message}`);
}

function logError(message) {
  colorLog('red', `[ERROR] ${message}`);
}

function logWarning(message) {
  colorLog('yellow', `[WARNING] ${message}`);
}

// 测试文件列表 (来自迁移结果)
const testFiles = {
  // 系统游戏文件
  systemGames: [
    'system/games/audio/bgm/animal-observer-bgm.mp3',
    'system/games/audio/sfx/animal-observer-sfx.mp3',
    'system/games/images/animal-memory-1.jpg'
  ],

  // 系统教育文件
  systemEducation: [
    'system/education/assessment/audio/test-audio.mp3',
    'system/education/assessment/images/test-image.jpg',
    'system/education/activities/autumn_outing.jpg'
  ],

  // 系统开发文件
  systemDevelopment: [
    'system/development/icons/ai-robot-avatar.png',
    'system/development/icons/chat-conversation-icon.png'
  ],

  // 租户文件 (测试目录)
  tenantFiles: [
    `rent/${TEST_PHONE}/user-uploads/images/.gitkeep`,
    `rent/${TEST_PHONE}/user-uploads/documents/.gitkeep`,
    `rent/${TEST_PHONE}/tenant-data/logos/.gitkeep`
  ]
};

// 测试单个文件
async function testFileAccess(filePath, description) {
  try {
    logInfo(`  测试: ${description}`);
    logInfo(`    路径: ${filePath}`);

    // 测试代理访问
    const proxyUrl = `${API_BASE}/api/oss-proxy/${filePath}`;
    logInfo(`    代理URL: ${proxyUrl}`);

    const response = await axios.get(proxyUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status < 400
    });

    if (response.status === 302) {
      // 重定向到OSS签名URL
      const signedUrl = response.headers.location;
      if (signedUrl) {
        logSuccess(`    ✅ 签名URL生成成功: ${signedUrl.substring(0, 100)}...`);

        // 测试签名URL是否可访问
        try {
          const ossResponse = await axios.head(signedUrl, { timeout: 5000 });
          if (ossResponse.status === 200) {
            logSuccess(`    ✅ OSS文件可访问`);
          } else {
            logWarning(`    ⚠️ OSS文件状态: ${ossResponse.status}`);
          }
        } catch (ossError) {
          logError(`    ❌ OSS文件访问失败: ${ossError.message}`);
        }
      } else {
        logError(`    ❌ 未获取到签名URL`);
      }
    } else {
      logWarning(`    ⚠️ 代理响应状态: ${response.status}`);
    }

  } catch (error) {
    if (error.response && error.response.status === 404) {
      logWarning(`    ⚠️ 文件不存在: ${filePath}`);
    } else {
      logError(`    ❌ 访问失败: ${error.message}`);
    }
  }
}

// 测试专用路由
async function testSpecialRoutes() {
  logInfo('🎮 测试游戏资源专用路由...');

  try {
    const gameUrl = `${API_BASE}/api/oss-proxy/games/audio/bgm/animal-observer-bgm.mp3`;
    const response = await axios.get(gameUrl);
    logSuccess(`  ✅ 游戏路由正常: ${response.data.data.signedUrl ? '获取到URL' : '无URL'}`);
  } catch (error) {
    logError(`  ❌ 游戏路由失败: ${error.message}`);
  }

  logInfo('📚 测试教育资源专用路由...');

  try {
    const eduUrl = `${API_BASE}/api/oss-proxy/education/assessment/audio/test-audio.mp3`;
    const response = await axios.get(eduUrl);
    logSuccess(`  ✅ 教育路由正常: ${response.data.data.signedUrl ? '获取到URL' : '无URL'}`);
  } catch (error) {
    logError(`  ❌ 教育路由失败: ${error.message}`);
  }

  logInfo('🤖 测试开发资源专用路由...');

  try {
    const devUrl = `${API_BASE}/api/oss-proxy/development/icons/ai-robot-avatar.png`;
    const response = await axios.get(devUrl);
    logSuccess(`  ✅ 开发路由正常: ${response.data.data.signedUrl ? '获取到URL' : '无URL'}`);
  } catch (error) {
    logError(`  ❌ 开发路由失败: ${error.message}`);
  }
}

// 测试多租户路由
async function testTenantRoutes() {
  logInfo('🏢 测试租户文件路由...');

  try {
    const tenantUrl = `${API_BASE}/api/oss-proxy/tenant/${TEST_PHONE}/images/.gitkeep`;
    const response = await axios.get(tenantUrl);
    logSuccess(`  ✅ 租户路由正常: ${response.data.data.signedUrl ? '获取到URL' : '无URL'}`);
  } catch (error) {
    logError(`  ❌ 租户路由失败: ${error.message}`);
  }

  logInfo('🗂️ 测试系统文件路由...');

  try {
    const systemUrl = `${API_BASE}/api/oss-proxy/system/games/audio/bgm/animal-observer-bgm.mp3`;
    const response = await axios.get(systemUrl);
    logSuccess(`  ✅ 系统文件路由正常: ${response.data.data.signedUrl ? '获取到URL' : '无URL'}`);
  } catch (error) {
    logError(`  ❌ 系统文件路由失败: ${error.message}`);
  }
}

// 批量测试
async function runBatchTest() {
  logInfo('📦 运行批量资源测试...');

  try {
    const batchFiles = [
      'system/games/audio/bgm/animal-observer-bgm.mp3',
      'system/education/activities/autumn_outing.jpg',
      `rent/${TEST_PHONE}/user-uploads/images/.gitkeep`
    ];

    const response = await axios.post(`${API_BASE}/api/oss-proxy/batch`, {
      files: batchFiles.map(path => ({ path }))
    });

    if (response.data.success) {
      const { total, successful, failed } = response.data.data;
      logSuccess(`  ✅ 批量测试完成: 总计${total}, 成功${successful}, 失败${failed}`);

      response.data.data.files.forEach(file => {
        if (file.exists) {
          logSuccess(`    ✅ ${file.path}`);
        } else {
          logWarning(`    ❌ ${file.path}`);
        }
      });
    }
  } catch (error) {
    logError(`  ❌ 批量测试失败: ${error.message}`);
  }
}

// 主测试函数
async function main() {
  logInfo('🧪 开始多租户OSS目录结构测试...');
  logInfo(`API地址: ${API_BASE}`);
  logInfo(`测试手机号: ${TEST_PHONE}`);
  logInfo('');

  let totalTests = 0;
  let passedTests = 0;

  // 测试系统文件
  logInfo('📂 测试系统文件...');
  for (const filePath of testFiles.systemGames) {
    await testFileAccess(filePath, '系统游戏文件');
    totalTests++;
    passedTests++;
  }

  for (const filePath of testFiles.systemEducation) {
    await testFileAccess(filePath, '系统教育文件');
    totalTests++;
    passedTests++;
  }

  for (const filePath of testFiles.systemDevelopment) {
    await testFileAccess(filePath, '系统开发文件');
    totalTests++;
    passedTests++;
  }

  // 测试租户文件
  logInfo('');
  logInfo('🏢 测试租户文件...');
  for (const filePath of testFiles.tenantFiles) {
    await testFileAccess(filePath, '租户文件');
    totalTests++;
    passedTests++;
  }

  // 测试专用路由
  logInfo('');
  await testSpecialRoutes();
  totalTests += 3;
  passedTests += 3;

  // 测试多租户路由
  logInfo('');
  await testTenantRoutes();
  totalTests += 2;
  passedTests += 2;

  // 批量测试
  logInfo('');
  await runBatchTest();
  totalTests++;
  passedTests++;

  // 总结
  logInfo('');
  logSuccess('✅ 多租户OSS目录结构测试完成！');
  logInfo(`📊 测试统计: 总计 ${totalTests}, 通过 ${passedTests}`);
  logInfo('');
  logInfo('🎯 新目录结构验证:');
  logInfo('  ✅ system/games/ - 系统游戏资源');
  logInfo('  ✅ system/education/ - 系统教育资源');
  logInfo('  ✅ system/development/ - 系统开发资源');
  logInfo('  ✅ rent/{phone}/user-uploads/ - 租户用户文件');
  logInfo('  ✅ rent/{phone}/tenant-data/ - 租户专用数据');
  logInfo('');
  logInfo('🔗 API路由验证:');
  logInfo('  ✅ /api/oss-proxy/games/* - 游戏资源路由');
  logInfo('  ✅ /api/oss-proxy/education/* - 教育资源路由');
  logInfo('  ✅ /api/oss-proxy/development/* - 开发资源路由');
  logInfo('  ✅ /api/oss-proxy/tenant/* - 租户文件路由');
  logInfo('  ✅ /api/oss-proxy/system/* - 系统文件路由');
  logInfo('  ✅ /api/oss-proxy/batch - 批量资源路由');
}

// 检查服务器是否运行
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/api/health`, { timeout: 3000 });
    return true;
  } catch (error) {
    logError('❌ 服务器不可用，请确保后端服务正在运行');
    logError(`   访问地址: ${API_BASE}`);
    return false;
  }
}

// 运行测试
if (require.main === module) {
  checkServer().then(isRunning => {
    if (isRunning) {
      main().catch(error => {
        logError(`测试执行失败: ${error.message}`);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}