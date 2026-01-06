#!/usr/bin/env node

/**
 * Swagger文档自动更新脚本
 * 
 * 功能：
 * 1. 扫描所有路由文件
 * 2. 生成最新的swagger文档
 * 3. 验证文档完整性
 * 4. 备份旧文档并更新
 */

const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始更新Swagger API文档...');

// Swagger配置
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '幼儿园管理系统 API',
      version: '1.0.0',
      description: '幼儿园管理系统的完整API文档，包含所有业务模块的接口说明',
      contact: {
        name: 'API Support',
        email: 'support@kindergarten.com',
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境',
      },
      {
        url: process.env.SERVER_URL || 'https://shlxlyzagqnc.sealoshzh.site',
        description: '生产环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token认证',
        },
      },
    },
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

try {
  // 1. 扫描路由文件
  console.log('📁 扫描路由文件...');
  const routesDir = path.join(__dirname, '../src/routes');
  const routeFiles = [];
  
  function scanDirectory(dir, basePath = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const relativePath = path.join(basePath, file);
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (file.endsWith('.routes.ts')) {
        routeFiles.push(relativePath);
      }
    });
  }
  
  scanDirectory(routesDir);
  console.log(`📄 找到 ${routeFiles.length} 个路由文件`);

  // 2. 生成swagger文档
  console.log('🔄 生成Swagger文档...');
  const specs = swaggerJsdoc(options);
  
  // 3. 验证文档完整性
  console.log('✅ 验证文档完整性...');
  const pathCount = Object.keys(specs.paths || {}).length;
  const componentCount = Object.keys(specs.components?.schemas || {}).length;
  
  console.log(`📊 API路径数量: ${pathCount}`);
  console.log(`📋 组件数量: ${componentCount}`);
  
  // 检查核心API是否存在
  const coreApis = ['/api/users', '/api/students', '/api/teachers', '/api/parents'];
  const missingApis = coreApis.filter(api => !specs.paths[api]);
  
  if (missingApis.length > 0) {
    console.warn('⚠️ 缺失核心API:', missingApis);
  } else {
    console.log('✅ 所有核心API都已包含');
  }

  // 4. 备份旧文档
  const swaggerPath = path.join(__dirname, '../swagger.json');
  if (fs.existsSync(swaggerPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, `../swagger-backup-${timestamp}.json`);
    fs.copyFileSync(swaggerPath, backupPath);
    console.log(`💾 旧文档已备份: ${path.basename(backupPath)}`);
  }

  // 5. 保存新文档
  fs.writeFileSync(swaggerPath, JSON.stringify(specs, null, 2));
  console.log('💾 新文档已保存: swagger.json');

  // 6. 生成统计报告
  const report = {
    timestamp: new Date().toISOString(),
    routeFiles: routeFiles.length,
    apiPaths: pathCount,
    components: componentCount,
    coreApisComplete: missingApis.length === 0,
    missingApis: missingApis,
    samplePaths: Object.keys(specs.paths || {}).slice(0, 10)
  };

  fs.writeFileSync(
    path.join(__dirname, '../swagger-update-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n🎉 Swagger文档更新完成！');
  console.log('📖 访问地址: http://localhost:3000/api-docs');
  console.log('📄 JSON规范: http://localhost:3000/api-docs.json');
  
} catch (error) {
  console.error('❌ 更新Swagger文档失败:', error.message);
  process.exit(1);
}
