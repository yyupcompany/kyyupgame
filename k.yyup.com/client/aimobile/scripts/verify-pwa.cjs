/**
 * PWA功能和离线缓存策略验证脚本
 *
 * 验证修复后的PWA配置是否正常工作
 * 检查Service Worker配置、API端点使用、缓存策略等
 */

const fs = require('fs');
const path = require('path');

/**
 * 配置文件路径
 */
const CONFIG_PATHS = {
  SW_CONFIG: path.join(__dirname, '../pwa/sw-endpoints.config.ts'),
  SW_MAIN: path.join(__dirname, '../pwa/sw.js'),
  MOBILE_CONFIG: path.join(__dirname, '../config/mobile.config.ts'),
  ENDPOINTS: path.join(__dirname, '../api/endpoints.ts'),
  CLIENT: path.join(__dirname, '../api/client.ts')
};

/**
 * 验证结果
 */
const verificationResults = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * 记录验证结果
 */
function logResult(category, message, passed = true) {
  const result = {
    category,
    message,
    timestamp: new Date().toISOString()
  };

  if (passed) {
    verificationResults.passed.push(result);
    console.log(`✅ [${category}] ${message}`);
  } else {
    verificationResults.failed.push(result);
    console.error(`❌ [${category}] ${message}`);
  }
}

/**
 * 记录警告
 */
function logWarning(category, message) {
  const result = {
    category,
    message,
    timestamp: new Date().toISOString()
  };

  verificationResults.warnings.push(result);
  console.warn(`⚠️  [${category}] ${message}`);
}

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logResult('文件系统', `${description} 存在: ${filePath}`);
    return true;
  } else {
    logResult('文件系统', `${description} 不存在: ${filePath}`, false);
    return false;
  }
}

/**
 * 验证Service Worker配置文件
 */
function verifySWConfig() {
  console.log('\n🔍 验证Service Worker配置文件...');

  try {
    const swConfigContent = fs.readFileSync(CONFIG_PATHS.SW_CONFIG, 'utf8');

    // 检查是否导入了统一端点
    if (swConfigContent.includes('from \'@/api/endpoints\'')) {
      logResult('SW配置', '已导入统一API端点配置');
    } else {
      logResult('SW配置', '未导入统一API端点配置', false);
    }

    // 检查是否使用了端点常量
    const endpointUsages = [
      'AUTH_ENDPOINTS.USER_INFO',
      'DASHBOARD_ENDPOINTS.STATS',
      'STUDENT_ENDPOINTS.BASE',
      'CLASS_ENDPOINTS.BASE',
      'ACTIVITY_ENDPOINTS.BASE'
    ];

    endpointUsages.forEach(usage => {
      if (swConfigContent.includes(usage)) {
        logResult('SW配置', `使用端点常量: ${usage}`);
      } else {
        logResult('SW配置', `未使用端点常量: ${usage}`, false);
      }
    });

    // 检查环境变量使用
    if (swConfigContent.includes('process.env.VITE_API_BASE_URL')) {
      logResult('SW配置', '使用环境变量管理API基础路径');
    } else {
      logWarning('SW配置', '建议使用环境变量管理API基础路径');
    }

  } catch (error) {
    logResult('SW配置', `读取配置文件失败: ${error.message}`, false);
  }
}

/**
 * 验证Service Worker主文件
 */
function verifySWMain() {
  console.log('\n🔍 验证Service Worker主文件...');

  try {
    const swContent = fs.readFileSync(CONFIG_PATHS.SW_MAIN, 'utf8');

    // 检查是否使用了SW_CONFIG
    if (swContent.includes('SW_CONFIG.ENDPOINTS')) {
      logResult('SW主文件', '使用SW_CONFIG.ENDPOINTS配置');
    } else {
      logResult('SW主文件', '未使用SW_CONFIG.ENDPOINTS配置', false);
    }

    // 检查是否消除了硬编码API端点
    const hardcodedPatterns = [
      '/api/auth/user',
      '/api/dashboard/stats',
      '/api/students',
      '/api/classes',
      '/api/activities'
    ];

    let hasHardcoded = false;
    hardcodedPatterns.forEach(pattern => {
      if (swContent.includes(`'${pattern}'`) || swContent.includes(`"${pattern}"`)) {
        logWarning('SW主文件', `发现硬编码API端点: ${pattern}`);
        hasHardcoded = true;
      }
    });

    if (!hasHardcoded) {
      logResult('SW主文件', '已消除所有硬编码API端点');
    }

    // 检查缓存配置
    if (swContent.includes('SW_CONFIG.CACHE.VERSION')) {
      logResult('SW主文件', '使用配置中的缓存版本');
    } else {
      logWarning('SW主文件', '建议使用配置中的缓存版本');
    }

    // 检查离线页面配置
    if (swContent.includes('SW_CONFIG.ENDPOINTS.OFFLINE_PAGE')) {
      logResult('SW主文件', '使用配置中的离线页面路径');
    } else {
      logWarning('SW主文件', '建议使用配置中的离线页面路径');
    }

  } catch (error) {
    logResult('SW主文件', `读取主文件失败: ${error.message}`, false);
  }
}

/**
 * 验证Mobile配置
 */
function verifyMobileConfig() {
  console.log('\n🔍 验证Mobile配置文件...');

  try {
    const mobileConfigContent = fs.readFileSync(CONFIG_PATHS.MOBILE_CONFIG, 'utf8');

    // 检查API配置接口
    if (mobileConfigContent.includes('api:')) {
      logResult('Mobile配置', '包含API配置接口');
    } else {
      logResult('Mobile配置', '缺少API配置接口', false);
    }

    // 检查环境变量使用
    const envUsages = [
      'VITE_API_BASE_URL',
      'VITE_API_TIMEOUT',
      'VITE_API_RETRY_ATTEMPTS',
      'VITE_API_RETRY_DELAY'
    ];

    envUsages.forEach(envVar => {
      if (mobileConfigContent.includes(envVar)) {
        logResult('Mobile配置', `使用环境变量: ${envVar}`);
      } else {
        logWarning('Mobile配置', `建议使用环境变量: ${envVar}`);
      }
    });

  } catch (error) {
    logResult('Mobile配置', `读取配置文件失败: ${error.message}`, false);
  }
}

/**
 * 验证端点配置
 */
function verifyEndpoints() {
  console.log('\n🔍 验证端点配置文件...');

  try {
    const endpointsContent = fs.readFileSync(CONFIG_PATHS.ENDPOINTS, 'utf8');

    // 检查是否导入了统一端点
    if (endpointsContent.includes('from \'@/api/endpoints\'')) {
      logResult('端点配置', '已导入统一API端点配置');
    } else {
      logResult('端点配置', '未导入统一API端点配置', false);
    }

    // 检查端点类别定义
    if (endpointsContent.includes('MOBILE_ENDPOINT_CATEGORIES')) {
      logResult('端点配置', '已定义端点类别');
    } else {
      logResult('端点配置', '未定义端点类别', false);
    }

    // 检查缓存策略
    if (endpointsContent.includes('MOBILE_CACHE_STRATEGIES')) {
      logResult('端点配置', '已定义缓存策略');
    } else {
      logResult('端点配置', '未定义缓存策略', false);
    }

    // 检查工具函数
    if (endpointsContent.includes('MobileEndpointUtils')) {
      logResult('端点配置', '已定义端点工具函数');
    } else {
      logResult('端点配置', '未定义端点工具函数', false);
    }

  } catch (error) {
    logResult('端点配置', `读取配置文件失败: ${error.message}`, false);
  }
}

/**
 * 验证API客户端
 */
function verifyApiClient() {
  console.log('\n🔍 验证API客户端文件...');

  try {
    const clientContent = fs.readFileSync(CONFIG_PATHS.CLIENT, 'utf8');

    // 检查是否使用了mobile配置
    if (clientContent.includes('mobileConfig.api')) {
      logResult('API客户端', '使用mobile配置');
    } else {
      logResult('API客户端', '未使用mobile配置', false);
    }

    // 检查是否使用了统一端点
    if (clientContent.includes('MOBILE_API_ENDPOINTS')) {
      logResult('API客户端', '使用统一端点配置');
    } else {
      logResult('API客户端', '未使用统一端点配置', false);
    }

    // 检查缓存策略应用
    if (clientContent.includes('MobileEndpointUtils.getEndpointCategory')) {
      logResult('API客户端', '应用端点分类和缓存策略');
    } else {
      logWarning('API客户端', '建议应用端点分类和缓存策略');
    }

  } catch (error) {
    logResult('API客户端', `读取客户端文件失败: ${error.message}`, false);
  }
}

/**
 * 验证缓存策略完整性
 */
function verifyCacheStrategies() {
  console.log('\n🔍 验证缓存策略完整性...');

  // 检查是否有不同层级的缓存策略
  const expectedStrategies = ['CORE', 'BUSINESS', 'EXTENDED', 'SYSTEM'];

  try {
    const endpointsContent = fs.readFileSync(CONFIG_PATHS.ENDPOINTS, 'utf8');

    expectedStrategies.forEach(strategy => {
      if (endpointsContent.includes(`${strategy}:`)) {
        logResult('缓存策略', `已定义${strategy}缓存策略`);
      } else {
        logResult('缓存策略', `未定义${strategy}缓存策略`, false);
      }
    });

    // 检查缓存策略属性
    const requiredProperties = ['ttl', 'strategy'];

    requiredProperties.forEach(prop => {
      if (endpointsContent.includes(`${prop}:`)) {
        logResult('缓存策略', `缓存策略包含${prop}属性`);
      } else {
        logWarning('缓存策略', `缓存策略建议包含${prop}属性`);
      }
    });

  } catch (error) {
    logResult('缓存策略', `验证缓存策略失败: ${error.message}`, false);
  }
}

/**
 * 生成验证报告
 */
function generateReport() {
  console.log('\n📊 生成验证报告...');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: verificationResults.passed.length + verificationResults.failed.length + verificationResults.warnings.length,
      passed: verificationResults.passed.length,
      failed: verificationResults.failed.length,
      warnings: verificationResults.warnings.length,
      success: verificationResults.failed.length === 0
    },
    details: verificationResults
  };

  // 保存报告到文件
  const reportPath = path.join(__dirname, '../reports/pwa-verification-report.json');

  // 确保报告目录存在
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📋 验证报告已保存到: ${reportPath}`);

  // 打印摘要
  console.log(`\n📈 验证摘要:`);
  console.log(`   总计: ${report.summary.total} 项`);
  console.log(`   ✅ 通过: ${report.summary.passed} 项`);
  console.log(`   ❌ 失败: ${report.summary.failed} 项`);
  console.log(`   ⚠️  警告: ${report.summary.warnings} 项`);
  console.log(`   🎯 结果: ${report.summary.success ? '成功' : '需要修复'}`);

  return report;
}

/**
 * 主验证函数
 */
async function main() {
  console.log('🚀 开始PWA功能和离线缓存策略验证...\n');

  // 检查所有文件是否存在
  let allFilesExist = true;
  Object.entries(CONFIG_PATHS).forEach(([key, path]) => {
    if (!checkFileExists(path, key)) {
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.error('\n❌ 部分必要文件不存在，请检查项目结构');
    return generateReport();
  }

  // 执行各项验证
  verifySWConfig();
  verifySWMain();
  verifyMobileConfig();
  verifyEndpoints();
  verifyApiClient();
  verifyCacheStrategies();

  // 生成最终报告
  const report = generateReport();

  // 根据结果决定退出码
  if (report.summary.success) {
    console.log('\n🎉 PWA功能验证通过！所有硬编码API端点已成功修复。');
    process.exit(0);
  } else {
    console.log('\n⚠️  PWA功能验证发现问题，请查看详细报告进行修复。');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('验证过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = {
  main,
  verifySWConfig,
  verifySWMain,
  verifyMobileConfig,
  verifyEndpoints,
  verifyApiClient,
  verifyCacheStrategies,
  generateReport
};