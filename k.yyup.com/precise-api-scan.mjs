#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PreciseAPIScanner {
  constructor() {
    this.frontendEndpoints = new Set();
    this.backendRoutes = new Set();
    this.actualAPICalls = new Set();
    this.mismatches = [];
  }

  // 扫描前端API端点定义
  scanFrontendEndpoints() {
    console.log('🔍 扫描前端API端点定义...');
    
    const endpointsDir = path.join(__dirname, 'client/src/api/endpoints');
    if (fs.existsSync(endpointsDir)) {
      this.scanEndpointsDirectory(endpointsDir);
    }
    
    console.log(`✅ 找到 ${this.frontendEndpoints.size} 个前端API端点定义`);
  }

  // 扫描端点目录
  scanEndpointsDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      if (file.endsWith('.ts') && file !== 'index.ts') {
        const filePath = path.join(dir, file);
        this.extractEndpointsFromFile(filePath);
      }
    });
  }

  // 从端点文件提取API端点
  extractEndpointsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 匹配端点定义模式：ENDPOINT_NAME: `${API_PREFIX}/path`
      const endpointPattern = /(\w+):\s*`\${[^}]+}\/([^`]+)`/g;
      let match;
      
      while ((match = endpointPattern.exec(content)) !== null) {
        const endpointPath = match[2];
        if (endpointPath && !endpointPath.includes('${')) {
          this.frontendEndpoints.add(endpointPath);
        }
      }

      // 匹配函数式端点：(id) => `${API_PREFIX}/path/${id}`
      const functionEndpointPattern = /`\${[^}]+}\/([^`]*)\${[^}]+}[^`]*`/g;
      while ((match = functionEndpointPattern.exec(content)) !== null) {
        const basePath = match[1];
        if (basePath) {
          this.frontendEndpoints.add(basePath.replace(/\/$/, '') + '/:id');
        }
      }
      
    } catch (error) {
      console.warn(`读取端点文件失败: ${filePath} - ${error.message}`);
    }
  }

  // 扫描实际API调用
  scanActualAPICalls() {
    console.log('🔍 扫描实际API调用...');
    
    const dirsToScan = [
      path.join(__dirname, 'client/src/api/modules'),
      path.join(__dirname, 'client/src/pages'),
      path.join(__dirname, 'client/src/components'),
      path.join(__dirname, 'client/src/composables')
    ];

    dirsToScan.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.scanDirectoryForAPICalls(dir);
      }
    });

    console.log(`✅ 找到 ${this.actualAPICalls.size} 个实际API调用`);
  }

  // 递归扫描API调用
  scanDirectoryForAPICalls(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.scanDirectoryForAPICalls(filePath);
      } else if (file.match(/\.(vue|ts|js)$/)) {
        this.extractAPICallsFromFile(filePath);
      }
    });
  }

  // 提取API调用
  extractAPICallsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 匹配request.get/post/put/del等调用
      const requestPatterns = [
        /request\.(?:get|post|put|del)\(\s*([A-Z_]+_ENDPOINTS\.[A-Z_]+)/g,
        /(?:get|post|put|del)\(\s*([A-Z_]+_ENDPOINTS\.[A-Z_]+)/g
      ];

      requestPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          this.actualAPICalls.add(match[1]);
        }
      });

    } catch (error) {
      console.warn(`读取文件失败: ${filePath} - ${error.message}`);
    }
  }

  // 扫描后端路由
  scanBackendRoutes() {
    console.log('🔍 扫描后端路由...');
    
    const mainRoutesFile = path.join(__dirname, 'server/src/routes/index.ts');
    if (fs.existsSync(mainRoutesFile)) {
      this.extractBackendRoutes(mainRoutesFile);
    }

    console.log(`✅ 找到 ${this.backendRoutes.size} 个后端路由`);
  }

  // 提取后端路由
  extractBackendRoutes(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 匹配router.use路由注册
      const routePattern = /router\.use\(['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = routePattern.exec(content)) !== null) {
        let route = match[1];
        if (route && route !== '/' && !route.startsWith('/api')) {
          // 移除前导斜杠
          if (route.startsWith('/')) {
            route = route.substring(1);
          }
          this.backendRoutes.add(route);
        }
      }
      
    } catch (error) {
      console.warn(`读取路由文件失败: ${filePath} - ${error.message}`);
    }
  }

  // 检查关键API端点
  checkCriticalEndpoints() {
    console.log('🔍 检查关键API端点...');
    
    const criticalEndpoints = [
      // 认证相关
      'auth/login',
      'auth/logout', 
      'auth/refresh-token',
      'auth/verify',
      
      // 仪表盘
      'dashboard/stats',
      'dashboard/overview',
      'dashboard/todos',
      'dashboard/schedules',
      
      // 用户管理
      'users',
      'roles', 
      'permissions',
      
      // 学生管理
      'students',
      'teachers',
      'classes',
      'parents',
      
      // 活动管理
      'activities',
      'enrollment-plans',
      'enrollment-applications',
      
      // AI功能
      'ai',
      'ai/memory',
      'ai/conversation',
      'ai/models'
    ];

    const missingCritical = [];
    const existingCritical = [];

    criticalEndpoints.forEach(endpoint => {
      const hasBackend = this.backendRoutes.has(endpoint);
      const hasFrontend = this.frontendEndpoints.has(endpoint);
      
      if (hasBackend && hasFrontend) {
        existingCritical.push(endpoint);
      } else if (!hasBackend) {
        missingCritical.push({ endpoint, type: 'backend' });
      } else if (!hasFrontend) {
        missingCritical.push({ endpoint, type: 'frontend' });
      }
    });

    return { missingCritical, existingCritical };
  }

  // 生成精确报告
  generatePreciseReport() {
    const { missingCritical, existingCritical } = this.checkCriticalEndpoints();
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        frontend_endpoints: this.frontendEndpoints.size,
        backend_routes: this.backendRoutes.size,
        actual_api_calls: this.actualAPICalls.size,
        critical_missing: missingCritical.length,
        critical_existing: existingCritical.length
      },
      frontend_endpoints: Array.from(this.frontendEndpoints).sort(),
      backend_routes: Array.from(this.backendRoutes).sort(),
      actual_api_calls: Array.from(this.actualAPICalls).sort(),
      critical_analysis: {
        missing: missingCritical,
        existing: existingCritical
      }
    };

    // 检查匹配情况
    const frontendArray = Array.from(this.frontendEndpoints);
    const backendArray = Array.from(this.backendRoutes);
    
    const missingInBackend = frontendArray.filter(fe => 
      !backendArray.some(be => this.isRouteMatch(fe, be))
    );
    
    const unusedInBackend = backendArray.filter(be => 
      !frontendArray.some(fe => this.isRouteMatch(fe, be)) && 
      !this.isInternalRoute(be)
    );

    report.analysis = {
      missing_in_backend: missingInBackend,
      unused_in_backend: unusedInBackend
    };

    return report;
  }

  // 路由匹配检查
  isRouteMatch(frontend, backend) {
    if (frontend === backend) return true;
    if (frontend.startsWith(backend + '/')) return true;
    if (backend.startsWith(frontend + '/')) return true;
    
    // 处理参数路由
    const cleanFrontend = frontend.replace(/\/:[^\/]+/g, '');
    const cleanBackend = backend.replace(/\/:[^\/]+/g, '');
    return cleanFrontend === cleanBackend;
  }

  // 内部路由检查
  isInternalRoute(route) {
    const internalPatterns = [
      'health', 'docs', 'test', 'cache', 'version',
      'api', 'examples', 'errors'
    ];
    return internalPatterns.includes(route);
  }

  // 生成Markdown报告
  generateMarkdownReport(report) {
    const mdContent = `# 精确API路由扫描报告

## 📊 扫描统计

- **前端API端点定义**: ${report.summary.frontend_endpoints} 个
- **后端路由注册**: ${report.summary.backend_routes} 个
- **关键端点缺失**: ${report.summary.critical_missing} 个
- **关键端点正常**: ${report.summary.critical_existing} 个

## 🚨 关键问题分析

### ❌ 缺失的关键端点

${report.critical_analysis.missing.map(item => 
  `- \`${item.endpoint}\` - 缺失${item.type === 'backend' ? '后端路由' : '前端端点'}`
).join('\n') || '无'}

### ✅ 正常的关键端点

${report.critical_analysis.existing.map(endpoint => 
  `- \`${endpoint}\``
).join('\n')}

## 📋 路由匹配分析

### 前端定义但后端缺失 (${report.analysis.missing_in_backend.length})

${report.analysis.missing_in_backend.map(endpoint => 
  `- \`${endpoint}\``
).join('\n') || '无'}

### 后端存在但前端未使用 (${report.analysis.unused_in_backend.length})

${report.analysis.unused_in_backend.map(route => 
  `- \`${route}\``
).join('\n') || '无'}

## 📁 所有前端API端点

${report.frontend_endpoints.map(endpoint => `- \`${endpoint}\``).join('\n')}

## 🔧 所有后端路由

${report.backend_routes.map(route => `- \`${route}\``).join('\n')}

---
生成时间: ${report.timestamp}
`;

    const mdPath = path.join(__dirname, 'precise-api-scan-report.md');
    fs.writeFileSync(mdPath, mdContent);
  }

  // 运行扫描
  async run() {
    console.log('🚀 开始精确API路由扫描...\n');
    
    this.scanFrontendEndpoints();
    this.scanActualAPICalls();
    this.scanBackendRoutes();
    
    const report = this.generatePreciseReport();
    
    // 保存报告
    const jsonPath = path.join(__dirname, 'precise-api-scan-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    this.generateMarkdownReport(report);
    
    console.log('\n📋 精确扫描完成!');
    console.log(`📁 报告已保存: precise-api-scan-report.json 和 precise-api-scan-report.md`);
    console.log(`\n📊 扫描结果:`);
    console.log(`   前端API端点: ${report.summary.frontend_endpoints}`);
    console.log(`   后端路由: ${report.summary.backend_routes}`);
    console.log(`   关键端点缺失: ${report.summary.critical_missing}`);
    console.log(`   关键端点正常: ${report.summary.critical_existing}`);
    
    if (report.summary.critical_missing > 0) {
      console.log(`\n❌ 发现 ${report.summary.critical_missing} 个关键端点问题`);
      report.critical_analysis.missing.forEach(item => {
        console.log(`   ${item.endpoint} - 缺失${item.type === 'backend' ? '后端路由' : '前端端点'}`);
      });
    } else {
      console.log(`\n✅ 所有关键端点都正常!`);
    }
    
    return report;
  }
}

// 运行扫描
const scanner = new PreciseAPIScanner();
scanner.run().catch(console.error);