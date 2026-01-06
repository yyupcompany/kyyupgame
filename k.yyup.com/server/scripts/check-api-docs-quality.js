#!/usr/bin/env node

/**
 * API文档质量检查脚本
 * 
 * 功能：
 * 1. 检查swagger文档完整性
 * 2. 验证核心API覆盖率
 * 3. 检查文档与路由文件同步性
 * 4. 生成质量报告
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始检查API文档质量...');

try {
  // 1. 读取swagger文档
  const swaggerPath = path.join(__dirname, '../swagger.json');
  if (!fs.existsSync(swaggerPath)) {
    throw new Error('swagger.json文件不存在');
  }

  const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  console.log('📖 已加载swagger文档');

  // 2. 扫描路由文件
  console.log('📁 扫描路由文件...');
  const routesDir = path.join(__dirname, '../src/routes');
  const routeFiles = [];
  
  function scanRoutes(dir, basePath = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const relativePath = path.join(basePath, file);
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanRoutes(fullPath, relativePath);
      } else if (file.endsWith('.routes.ts')) {
        routeFiles.push({
          file: relativePath,
          path: fullPath
        });
      }
    });
  }
  
  scanRoutes(routesDir);

  // 3. 分析路由文件中的API定义
  console.log('🔍 分析路由文件...');
  const routeAnalysis = [];
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;
  const swaggerCommentRegex = /\/\*\*[\s\S]*?@swagger[\s\S]*?\*\//g;

  routeFiles.forEach(({ file, path: filePath }) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const routes = [];
    const swaggerComments = [];
    
    // 提取路由定义
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2]
      });
    }
    
    // 提取swagger注释
    const commentMatches = content.match(swaggerCommentRegex);
    if (commentMatches) {
      swaggerComments.push(...commentMatches);
    }
    
    routeAnalysis.push({
      file,
      routes: routes.length,
      swaggerComments: swaggerComments.length,
      hasDocumentation: swaggerComments.length > 0
    });
  });

  // 4. 核心API检查
  console.log('✅ 检查核心API...');
  const coreApis = [
    { path: '/api/users', name: '用户管理' },
    { path: '/api/students', name: '学生管理' },
    { path: '/api/teachers', name: '教师管理' },
    { path: '/api/parents', name: '家长管理' },
    { path: '/api/classes', name: '班级管理' },
    { path: '/api/auth/login', name: '用户登录' },
    { path: '/api/auth/logout', name: '用户登出' }
  ];

  const coreApiStatus = coreApis.map(api => ({
    ...api,
    exists: !!swagger.paths[api.path],
    methods: swagger.paths[api.path] ? Object.keys(swagger.paths[api.path]) : []
  }));

  // 5. 生成质量报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalRouteFiles: routeFiles.length,
      totalApiPaths: Object.keys(swagger.paths || {}).length,
      totalComponents: Object.keys(swagger.components?.schemas || {}).length,
      documentedRouteFiles: routeAnalysis.filter(r => r.hasDocumentation).length,
      documentationCoverage: Math.round((routeAnalysis.filter(r => r.hasDocumentation).length / routeFiles.length) * 100)
    },
    coreApiStatus: {
      total: coreApis.length,
      available: coreApiStatus.filter(api => api.exists).length,
      missing: coreApiStatus.filter(api => !api.exists),
      complete: coreApiStatus.filter(api => !api.exists).length === 0
    },
    routeFileAnalysis: routeAnalysis,
    recommendations: []
  };

  // 6. 生成建议
  if (report.summary.documentationCoverage < 80) {
    report.recommendations.push('建议提高路由文件的swagger注释覆盖率');
  }

  if (!report.coreApiStatus.complete) {
    report.recommendations.push('建议完善核心API的swagger文档');
  }

  if (report.summary.totalApiPaths < 500) {
    report.recommendations.push('API路径数量较少，建议检查swagger配置');
  }

  // 7. 输出报告
  console.log('\n📊 API文档质量报告');
  console.log('='.repeat(50));
  console.log(`📁 路由文件总数: ${report.summary.totalRouteFiles}`);
  console.log(`📄 API路径总数: ${report.summary.totalApiPaths}`);
  console.log(`📋 组件总数: ${report.summary.totalComponents}`);
  console.log(`📝 已文档化文件: ${report.summary.documentedRouteFiles}/${report.summary.totalRouteFiles} (${report.summary.documentationCoverage}%)`);
  
  console.log('\n🎯 核心API状态:');
  coreApiStatus.forEach(api => {
    const status = api.exists ? '✅' : '❌';
    const methods = api.methods.length > 0 ? ` [${api.methods.join(', ')}]` : '';
    console.log(`${status} ${api.name}: ${api.path}${methods}`);
  });

  if (report.recommendations.length > 0) {
    console.log('\n💡 改进建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  // 8. 保存详细报告
  fs.writeFileSync(
    path.join(__dirname, '../api-docs-quality-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 详细报告已保存: api-docs-quality-report.json');
  
  // 9. 返回状态码
  const isHealthy = report.coreApiStatus.complete && report.summary.documentationCoverage >= 70;
  if (isHealthy) {
    console.log('\n🎉 API文档质量良好！');
    process.exit(0);
  } else {
    console.log('\n⚠️ API文档需要改进');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ 检查API文档质量失败:', error.message);
  process.exit(1);
}
