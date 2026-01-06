#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API调用扫描器
class APIRouteScannerTool {
  constructor() {
    this.frontendAPIcalls = new Set();
    this.backendRoutes = new Set();
    this.mismatches = [];
    this.warnings = [];
  }

  // 扫描前端API调用
  scanFrontendAPICalls() {
    console.log('🔍 扫描前端API调用...');
    
    // 扫描主要目录
    const foldersToScan = [
      path.join(__dirname, 'client/src/pages'),
      path.join(__dirname, 'client/src/components'),
      path.join(__dirname, 'client/src/api'),
      path.join(__dirname, 'client/src/composables')
    ];

    foldersToScan.forEach(folder => {
      if (fs.existsSync(folder)) {
        this.scanDirectoryForAPICalls(folder);
      }
    });

    console.log(`✅ 找到 ${this.frontendAPIcalls.size} 个前端API调用`);
  }

  // 递归扫描目录
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

  // 从文件中提取API调用
  extractAPICallsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 匹配API调用模式
      const patterns = [
        // request.get/post/put/del patterns
        /(?:request\.|get\(|post\(|put\(|del\()['"`]([^'"`]+)['"`]/g,
        // fetch patterns
        /fetch\(['"`]([^'"`]+)['"`]/g,
        // axios patterns
        /axios\.(?:get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
        // endpoint constants usage
        /[A-Z_]+_ENDPOINTS\.[\w_]+/g,
        // service module calls
        /[a-zA-Z]+Api\.[a-zA-Z]+\(/g
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1]) {
            // 清理和标准化API路径
            let apiPath = match[1];
            if (apiPath.startsWith('/api/')) {
              apiPath = apiPath.substring(4); // 移除 /api/ 前缀
            } else if (apiPath.startsWith('/')) {
              apiPath = apiPath.substring(1); // 移除 / 前缀
            }
            
            // 过滤掉无效路径
            if (this.isValidAPIPath(apiPath)) {
              this.frontendAPIcalls.add(apiPath);
            }
          }
        }
      });
    } catch (error) {
      this.warnings.push(`读取文件失败: ${filePath} - ${error.message}`);
    }
  }

  // 验证API路径有效性
  isValidAPIPath(path) {
    // 过滤掉明显不是API路径的内容
    const invalidPatterns = [
      /^https?:\/\//, // URL
      /^[\w-]+$/, // 单个词
      /^\d+$/, // 纯数字
      /^[a-zA-Z]:\\/, // Windows路径
      /^\.\.?\//, // 相对路径
      /\.(js|ts|vue|css|html|png|jpg|jpeg|gif|svg)$/, // 文件扩展名
    ];

    return !invalidPatterns.some(pattern => pattern.test(path)) && 
           path.length > 2 && 
           path.includes('/');
  }

  // 扫描后端路由
  scanBackendRoutes() {
    console.log('🔍 扫描后端路由...');
    
    const routesDir = path.join(__dirname, 'server/src/routes');
    if (fs.existsSync(routesDir)) {
      this.scanDirectoryForRoutes(routesDir);
    }

    // 检查主路由入口文件
    const mainRoutesFile = path.join(__dirname, 'server/src/routes/index.ts');
    if (fs.existsSync(mainRoutesFile)) {
      this.extractRoutesFromMainFile(mainRoutesFile);
    }

    console.log(`✅ 找到 ${this.backendRoutes.size} 个后端路由`);
  }

  // 递归扫描路由目录
  scanDirectoryForRoutes(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.scanDirectoryForRoutes(filePath);
      } else if (file.match(/\.routes?\.(ts|js)$/) || file === 'index.ts') {
        this.extractRoutesFromFile(filePath);
      }
    });
  }

  // 从路由文件中提取路由
  extractRoutesFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 匹配路由定义模式
      const patterns = [
        // Express router patterns
        /router\.(?:get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
        // app.use patterns
        /app\.use\(['"`]([^'"`]+)['"`]/g,
        // Route definitions in modules
        /['"`]([a-zA-Z0-9\-_\/]+)['"`]\s*:/g
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1] && match[1] !== '/') {
            let route = match[1];
            // 标准化路由
            if (route.startsWith('/')) {
              route = route.substring(1);
            }
            if (this.isValidAPIPath(route)) {
              this.backendRoutes.add(route);
            }
          }
        }
      });
    } catch (error) {
      this.warnings.push(`读取路由文件失败: ${filePath} - ${error.message}`);
    }
  }

  // 从主路由文件提取路由
  extractRoutesFromMainFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 查找 app.use 路由挂载
      const usePattern = /app\.use\(['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = usePattern.exec(content)) !== null) {
        if (match[1] && match[1] !== '/') {
          let route = match[1];
          if (route.startsWith('/')) {
            route = route.substring(1);
          }
          this.backendRoutes.add(route);
        }
      }
    } catch (error) {
      this.warnings.push(`读取主路由文件失败: ${filePath} - ${error.message}`);
    }
  }

  // 比较前后端路由匹配
  compareRoutes() {
    console.log('🔄 比较前后端路由匹配...');
    
    const frontendPaths = Array.from(this.frontendAPIcalls);
    const backendPaths = Array.from(this.backendRoutes);
    
    // 检查前端调用是否有对应的后端路由
    frontendPaths.forEach(frontendPath => {
      const matched = backendPaths.some(backendPath => {
        return this.isRouteMatch(frontendPath, backendPath);
      });
      
      if (!matched) {
        this.mismatches.push({
          type: 'missing_backend',
          frontend: frontendPath,
          backend: null,
          severity: 'high'
        });
      }
    });

    // 检查后端路由是否被前端使用
    backendPaths.forEach(backendPath => {
      const matched = frontendPaths.some(frontendPath => {
        return this.isRouteMatch(frontendPath, backendPath);
      });
      
      if (!matched && !this.isInternalRoute(backendPath)) {
        this.mismatches.push({
          type: 'unused_backend',
          frontend: null,
          backend: backendPath,
          severity: 'low'
        });
      }
    });
  }

  // 检查路由是否匹配
  isRouteMatch(frontendPath, backendPath) {
    // 完全匹配
    if (frontendPath === backendPath) return true;
    
    // 前缀匹配
    if (frontendPath.startsWith(backendPath + '/')) return true;
    if (backendPath.startsWith(frontendPath + '/')) return true;
    
    // 去除参数匹配
    const cleanFrontend = frontendPath.replace(/\/:[^\/]+/g, '');
    const cleanBackend = backendPath.replace(/\/:[^\/]+/g, '');
    if (cleanFrontend === cleanBackend) return true;
    
    return false;
  }

  // 检查是否为内部路由
  isInternalRoute(route) {
    const internalPatterns = [
      /^health$/,
      /^docs$/,
      /^api$/,
      /^swagger/,
      /^static/
    ];
    
    return internalPatterns.some(pattern => pattern.test(route));
  }

  // 生成报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_frontend_calls: this.frontendAPIcalls.size,
        total_backend_routes: this.backendRoutes.size,
        total_mismatches: this.mismatches.length,
        warnings: this.warnings.length
      },
      frontend_api_calls: Array.from(this.frontendAPIcalls).sort(),
      backend_routes: Array.from(this.backendRoutes).sort(),
      mismatches: this.mismatches,
      warnings: this.warnings
    };

    // 写入JSON报告
    const reportPath = path.join(__dirname, 'api-route-scan-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 生成Markdown报告
    this.generateMarkdownReport(report);
    
    return report;
  }

  // 生成Markdown报告
  generateMarkdownReport(report) {
    const mdContent = `# API路由扫描报告

## 📊 扫描统计

- **前端API调用**: ${report.summary.total_frontend_calls} 个
- **后端路由**: ${report.summary.total_backend_routes} 个  
- **路由不匹配**: ${report.summary.total_mismatches} 个
- **警告**: ${report.summary.warnings} 个

## ❌ 路由不匹配问题

### 缺失的后端路由 (${report.mismatches.filter(m => m.type === 'missing_backend').length})

${report.mismatches.filter(m => m.type === 'missing_backend').map(m => 
  `- \`${m.frontend}\` - 前端调用但后端缺失`
).join('\n')}

### 未使用的后端路由 (${report.mismatches.filter(m => m.type === 'unused_backend').length})

${report.mismatches.filter(m => m.type === 'unused_backend').map(m => 
  `- \`${m.backend}\` - 后端存在但前端未使用`
).join('\n')}

## ✅ 所有前端API调用

${report.frontend_api_calls.map(api => `- \`${api}\``).join('\n')}

## 🔧 所有后端路由

${report.backend_routes.map(route => `- \`${route}\``).join('\n')}

## ⚠️ 警告信息

${report.warnings.map(warning => `- ${warning}`).join('\n')}

---
生成时间: ${report.timestamp}
`;

    const mdPath = path.join(__dirname, 'api-route-scan-report.md');
    fs.writeFileSync(mdPath, mdContent);
  }

  // 运行完整扫描
  async run() {
    console.log('🚀 开始API路由扫描...\n');
    
    this.scanFrontendAPICalls();
    this.scanBackendRoutes();
    this.compareRoutes();
    
    const report = this.generateReport();
    
    console.log('\n📋 扫描完成!');
    console.log(`📁 报告已保存: api-route-scan-report.json 和 api-route-scan-report.md`);
    console.log(`\n📊 扫描结果:`);
    console.log(`   前端API调用: ${report.summary.total_frontend_calls}`);
    console.log(`   后端路由: ${report.summary.total_backend_routes}`);
    console.log(`   不匹配问题: ${report.summary.total_mismatches}`);
    
    if (report.summary.total_mismatches > 0) {
      console.log(`\n❌ 发现 ${report.summary.total_mismatches} 个路由不匹配问题`);
      const missingBackend = report.mismatches.filter(m => m.type === 'missing_backend').length;
      const unusedBackend = report.mismatches.filter(m => m.type === 'unused_backend').length;
      console.log(`   缺失后端路由: ${missingBackend}`);
      console.log(`   未使用后端路由: ${unusedBackend}`);
    } else {
      console.log(`\n✅ 所有路由匹配正常!`);
    }
    
    return report;
  }
}

// 运行扫描
const scanner = new APIRouteScannerTool();
scanner.run().catch(console.error);