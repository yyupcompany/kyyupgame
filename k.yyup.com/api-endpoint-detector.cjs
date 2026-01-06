#!/usr/bin/env node

/**
 * API端点检测脚本
 * 通过分析代码来检测前后端API端点的匹配情况
 */

const fs = require('fs');
const path = require('path');

// 存储检测结果
const analysisResult = {
  frontendEndpoints: new Set(),
  backendEndpoints: new Set(),
  missingInBackend: new Set(),
  missingInFrontend: new Set(),
  matchedEndpoints: new Set(),
  issues: []
};

// 正则表达式模式
const endpointPatterns = {
  // 前端API调用模式
  frontend: {
    requestCall: /request\(\s*{\s*url\s*:\s*['"`]([^'"`]+)['"`]/g,
    getCall: /get\(\s*['"`]([^'"`]+)['"`]/g,
    postCall: /post\(\s*['"`]([^'"`]+)['"`]/g,
    putCall: /put\(\s*['"`]([^'"`]+)['"`]/g,
    deleteCall: /delete\(\s*['"`]([^'"`]+)['"`]/g,
    endpointConstant: /ENDPOINTS\s*=\s*{([^}]+)}/gs,
    endpointDefinition: /(['"`])([^'"`]+)\1\s*:\s*['"`]([^'"`]+)['"`]/g
  },

  // 后端路由定义模式
  backend: {
    routerGet: /router\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
    routerPost: /router\.post\s*\(\s*['"`]([^'"`]+)['"`]/g,
    routerPut: /router\.put\s*\(\s*['"`]([^'"`]+)['"`]/g,
    routerDelete: /router\.delete\s*\(\s*['"`]([^'"`]+)['"`]/g,
    routerUse: /router\.use\s*\(\s*['"`]([^'"`]+)['"`]/g,
    expressRoute: /(app|router)\.(get|post|put|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]/g
  }
};

/**
 * 扫描前端API端点
 */
function scanFrontendEndpoints() {
  const frontendDir = path.join(__dirname, 'client/src/api');

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        scanFile(filePath, 'frontend');
      }
    }
  }

  scanDirectory(frontendDir);
}

/**
 * 扫描后端API端点
 */
function scanBackendEndpoints() {
  const backendDir = path.join(__dirname, 'server/src/routes');

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        scanFile(filePath, 'backend');
      }
    }
  }

  scanDirectory(backendDir);
}

/**
 * 扫描单个文件中的API端点
 */
function scanFile(filePath, type) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const patterns = endpointPatterns[type];

    if (type === 'frontend') {
      // 扫描端点常量定义
      const endpointMatches = content.match(endpointPatterns.frontend.endpointConstant);
      if (endpointMatches) {
        for (const match of endpointMatches) {
          const endpointDefs = match.match(endpointPatterns.frontend.endpointDefinition);
          if (endpointDefs) {
            for (const def of endpointDefs) {
              const endpointValue = def[3];
              if (endpointValue && endpointValue.startsWith('auth')) {
                analysisResult.frontendEndpoints.add(`/api/${endpointValue}`);
              }
            }
          }
        }
      }

      // 扫描直接的API调用
      Object.values(patterns).forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const endpoint = match[1];
          if (endpoint && (endpoint.includes('auth') || endpoint.includes('users'))) {
            // 标准化端点路径
            const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
            analysisResult.frontendEndpoints.add(normalizedEndpoint);
          }
        }
      });
    } else if (type === 'backend') {
      // 扫描路由定义
      Object.values(patterns).forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const endpoint = match[1] || match[3];
          if (endpoint && !endpoint.includes(':') && !endpoint.includes('*')) {
            // 标准化端点路径
            const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            if (normalizedEndpoint.includes('auth') || normalizedEndpoint.includes('users')) {
              analysisResult.backendEndpoints.add(normalizedEndpoint);
            }
          }
        }
      });
    }
  } catch (error) {
    console.error(`扫描文件失败 ${filePath}:`, error.message);
  }
}

/**
 * 对比前后端端点
 */
function compareEndpoints() {
  const frontend = Array.from(analysisResult.frontendEndpoints);
  const backend = Array.from(analysisResult.backendEndpoints);

  console.log('\n=== 前端调用的API端点 ===');
  frontend.forEach(endpoint => {
    console.log(`  ${endpoint}`);
  });

  console.log('\n=== 后端定义的API端点 ===');
  backend.forEach(endpoint => {
    console.log(`  ${endpoint}`);
  });

  // 检查前端调用但后端未定义的端点
  frontend.forEach(endpoint => {
    const found = backend.some(backendEndpoint => {
      // 简单匹配，忽略一些差异
      return backendEndpoint === endpoint ||
             backendEndpoint === endpoint.replace('/api', '') ||
             endpoint.includes(backendEndpoint) ||
             backendEndpoint.includes(endpoint.replace('/api', ''));
    });

    if (!found) {
      analysisResult.missingInBackend.add(endpoint);
    } else {
      analysisResult.matchedEndpoints.add(endpoint);
    }
  });

  // 检查后端定义但前端未调用的端点
  backend.forEach(endpoint => {
    const found = frontend.some(frontendEndpoint => {
      return frontendEndpoint === endpoint ||
             frontendEndpoint === `/api${endpoint}` ||
             endpoint.includes(frontendEndpoint.replace('/api', '')) ||
             frontendEndpoint.includes(endpoint);
    });

    if (!found) {
      analysisResult.missingInFrontend.add(endpoint);
    }
  });
}

/**
 * 生成检测报告
 */
function generateReport() {
  console.log('\n🔍 API端点检测报告');
  console.log('='.repeat(60));

  console.log(`\n📊 统计信息:`);
  console.log(`  - 前端调用端点数: ${analysisResult.frontendEndpoints.size}`);
  console.log(`  - 后端定义端点数: ${analysisResult.backendEndpoints.size}`);
  console.log(`  - 匹配端点数: ${analysisResult.matchedEndpoints.size}`);
  console.log(`  - 后端缺失端点数: ${analysisResult.missingInBackend.size}`);
  console.log(`  - 前端未调用端点数: ${analysisResult.missingInFrontend.size}`);

  if (analysisResult.missingInBackend.size > 0) {
    console.log(`\n❌ 后端缺失的API端点 (${analysisResult.missingInBackend.size}):`);
    analysisResult.missingInBackend.forEach(endpoint => {
      console.log(`  - ${endpoint}`);
      analysisResult.issues.push({
        type: 'missing_backend',
        endpoint,
        severity: 'high'
      });
    });
  }

  if (analysisResult.missingInFrontend.size > 0) {
    console.log(`\n⚠️  前端未调用的API端点 (${analysisResult.missingInFrontend.size}):`);
    analysisResult.missingInFrontend.forEach(endpoint => {
      console.log(`  - ${endpoint}`);
      analysisResult.issues.push({
        type: 'missing_frontend',
        endpoint,
        severity: 'low'
      });
    });
  }

  // 生成详细报告文件
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      frontendEndpoints: analysisResult.frontendEndpoints.size,
      backendEndpoints: analysisResult.backendEndpoints.size,
      matchedEndpoints: analysisResult.matchedEndpoints.size,
      missingInBackend: analysisResult.missingInBackend.size,
      missingInFrontend: analysisResult.missingInFrontend.size,
      totalIssues: analysisResult.issues.length
    },
    details: {
      frontendEndpoints: Array.from(analysisResult.frontendEndpoints),
      backendEndpoints: Array.from(analysisResult.backendEndpoints),
      matchedEndpoints: Array.from(analysisResult.matchedEndpoints),
      missingInBackend: Array.from(analysisResult.missingInBackend),
      missingInFrontend: Array.from(analysisResult.missingInFrontend)
    },
    issues: analysisResult.issues,
    recommendations: generateRecommendations()
  };

  const reportPath = path.join(__dirname, 'API_ENDPOINT_DETECTION_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已生成: ${reportPath}`);
}

/**
 * 生成修复建议
 */
function generateRecommendations() {
  const recommendations = [];

  if (analysisResult.missingInBackend.size > 0) {
    recommendations.push({
      priority: 'high',
      category: '后端API缺失',
      description: '需要实现前端调用但后端缺失的API端点',
      action: '创建对应的控制器和路由文件',
      endpoints: Array.from(analysisResult.missingInBackend)
    });
  }

  if (analysisResult.missingInFrontend.size > 0) {
    recommendations.push({
      priority: 'low',
      category: '前端API调用缺失',
      description: '后端已定义但前端未调用的API端点',
      action: '检查是否需要在前端添加对应的API调用',
      endpoints: Array.from(analysisResult.missingInFrontend)
    });
  }

  recommendations.push({
    priority: 'medium',
    category: 'API文档完善',
    description: '为所有API端点添加完整的Swagger文档',
    action: '补充@swagger注释，包括参数、响应示例等'
  });

  return recommendations;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始API端点检测...');

  try {
    scanFrontendEndpoints();
    console.log('✅ 前端API端点扫描完成');

    scanBackendEndpoints();
    console.log('✅ 后端API端点扫描完成');

    compareEndpoints();
    console.log('✅ 端点对比完成');

    generateReport();
    console.log('✅ 报告生成完成');

  } catch (error) {
    console.error('❌ 检测过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行检测
if (require.main === module) {
  main();
}

module.exports = {
  scanFrontendEndpoints,
  scanBackendEndpoints,
  compareEndpoints,
  generateReport
};