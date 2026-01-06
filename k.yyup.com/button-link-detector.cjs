#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * 自动化按钮检测脚本
 * 用于检测所有侧边栏页面中的按钮和链接
 */

class ButtonLinkDetector {
  constructor() {
    this.pagesDir = path.join(__dirname, 'client/src/pages/centers');
    this.routerFiles = [
      path.join(__dirname, 'client/src/router/index.ts'),
      path.join(__dirname, 'client/src/router/dynamic-routes.ts'),
      path.join(__dirname, 'client/src/router/optimized-routes.ts')
    ];
    this.serverRoutesDir = path.join(__dirname, 'server/src/routes');
    this.clientApiDir = path.join(__dirname, 'client/src/api');

    this.results = {
      scannedFiles: [],
      buttonLinks: [],
      routeLinks: [],
      apiEndpoints: [],
      componentImports: [],
      issues: []
    };

    // 路由缓存
    this.routePaths = new Set();
    this.apiRoutes = new Set();
    this.componentPaths = new Map();
  }

  /**
   * 初始化检测器
   */
  async init() {
    console.log('🚀 初始化按钮检测脚本...');

    // 检查必要的目录
    if (!fs.existsSync(this.pagesDir)) {
      console.error(`❌ 页面目录不存在: ${this.pagesDir}`);
      process.exit(1);
    }

    console.log(`📁 扫描页面目录: ${this.pagesDir}`);
    console.log(`📁 扫描服务端路由目录: ${this.serverRoutesDir}`);
  }

  /**
   * 获取所有Vue文件
   */
  getAllVueFiles() {
    const pattern = path.join(this.pagesDir, '**/*.vue');
    const files = glob.sync(pattern);
    console.log(`📄 找到 ${files.length} 个Vue文件`);
    return files;
  }

  /**
   * 提取路由配置中的路径
   */
  extractRoutePaths() {
    console.log('🔍 提取路由配置路径...');

    this.routerFiles.forEach(routerFile => {
      if (!fs.existsSync(routerFile)) return;

      const content = fs.readFileSync(routerFile, 'utf8');

      // 提取路径定义
      const pathMatches = content.match(/path:\s*['"`]([^'"`]+)['"`]/g);
      if (pathMatches) {
        pathMatches.forEach(match => {
          const pathMatch = match.match(/path:\s*['"`]([^'"`]+)['"`]/);
          if (pathMatch) {
            this.routePaths.add(pathMatch[1]);
          }
        });
      }

      // 提取重定向路径
      const redirectMatches = content.match(/redirect:\s*['"`]([^'"`]+)['"`]/g);
      if (redirectMatches) {
        redirectMatches.forEach(match => {
          const redirectMatch = match.match(/redirect:\s*['"`]([^'"`]+)['"`]/);
          if (redirectMatch) {
            this.routePaths.add(redirectMatch[1]);
          }
        });
      }
    });

    console.log(`✅ 提取到 ${this.routePaths.size} 个路由路径`);
  }

  /**
   * 提取后端API路由
   */
  extractApiRoutes() {
    console.log('🔍 提取后端API路由...');

    if (!fs.existsSync(this.serverRoutesDir)) {
      console.warn(`⚠️ 服务端路由目录不存在: ${this.serverRoutesDir}`);
      return;
    }

    const routeFiles = glob.sync(path.join(this.serverRoutesDir, '**/*.ts'));

    routeFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      // 提取Express路由定义
      const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
      if (routeMatches) {
        routeMatches.forEach(match => {
          const apiMatch = match.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
          if (apiMatch) {
            this.apiRoutes.add(apiMatch[2]);
          }
        });
      }

      // 提取 app.use 路由挂载
      const useMatches = content.match(/app\.use\s*\(\s*['"`]([^'"`]+)['"`]/g);
      if (useMatches) {
        useMatches.forEach(match => {
          const useMatch = match.match(/app\.use\s*\(\s*['"`]([^'"`]+)['"`]/);
          if (useMatch) {
            this.apiRoutes.add(useMatch[1]);
          }
        });
      }
    });

    console.log(`✅ 提取到 ${this.apiRoutes.size} 个API路由`);
  }

  /**
   * 扫描单个Vue文件
   */
  scanVueFile(filePath) {
    const relativePath = path.relative(this.pagesDir, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    const fileResult = {
      path: relativePath,
      fullPath: filePath,
      buttons: [],
      links: [],
      routes: [],
      apis: [],
      imports: [],
      issues: []
    };

    // 提取按钮元素
    const buttonPatterns = [
      /<el-button[^>]*@click="([^"]+)"[^>]*>/g,
      /<button[^>]*@click="([^"]+)"[^>]*>/g,
      /<[^>]*@click="([^"]+)"[^>]*>/g,
      /v-btn[^>]*@click="([^"]+)"[^>]*>/g
    ];

    buttonPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        fileResult.buttons.push({
          type: 'button',
          handler: match[1],
          line: this.getLineNumber(content, match.index),
          context: this.getContext(content, match.index, 100)
        });
      }
    });

    // 提取链接元素
    const linkPatterns = [
      /<el-link[^>]*:to="([^"]+)"[^>]*>/g,
      /<router-link[^>]*:to="([^"]+)"[^>]*>/g,
      /<a[^>]*href="([^"]+)"[^>]*>/g
    ];

    linkPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        fileResult.links.push({
          type: 'link',
          target: match[1],
          line: this.getLineNumber(content, match.index),
          context: this.getContext(content, match.index, 100)
        });
      }
    });

    // 提取路由跳转
    const routePatterns = [
      /router\.push\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /router\.push\s*\(\s*\{[^}]*path:\s*['"`]([^'"`]+)['"`]/g,
      /\$router\.push\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /router\.replace\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /this\.\$router\.push\s*\(\s*['"`]([^'"`]+)['"`]/g
    ];

    routePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        fileResult.routes.push({
          type: 'router-push',
          path: match[1],
          line: this.getLineNumber(content, match.index),
          context: this.getContext(content, match.index, 100)
        });
      }
    });

    // 提取API调用
    const apiPatterns = [
      /await\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\.([^.(]+)\s*\(/g,
      /([a-zA-Z_$][a-zA-Z0-9_$]*)\.([^.(]+)\s*\(\s*{/g,
      /['"`](\/api\/[^'"`]+)['"`]/g
    ];

    apiPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[0].includes('/api/')) {
          fileResult.apis.push({
            type: 'api-call',
            endpoint: match[1],
            line: this.getLineNumber(content, match.index),
            context: this.getContext(content, match.index, 100)
          });
        }
      }
    });

    // 提取动态导入
    const importPatterns = [
      /import\s*\(\s*['"`]([^'"`]+\.vue)['"`]\s*\)/g,
      /component:\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /async\s+component:\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]/g
    ];

    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        fileResult.imports.push({
          type: 'dynamic-import',
          path: match[1],
          line: this.getLineNumber(content, match.index),
          context: this.getContext(content, match.index, 100)
        });
      }
    });

    // 验证提取的内容
    this.validateFileContent(fileResult);

    return fileResult;
  }

  /**
   * 验证文件内容
   */
  validateFileContent(fileResult) {
    // 验证路由路径
    fileResult.routes.forEach(route => {
      const path = this.extractRoutePath(route.path);
      if (!this.routePaths.has(path)) {
        fileResult.issues.push({
          type: 'missing-route',
          severity: 'error',
          message: `路由路径 "${path}" 在路由配置中未找到`,
          line: route.line,
          context: route.context
        });
      }
    });

    // 验证API端点
    fileResult.apis.forEach(api => {
      const endpoint = this.extractApiEndpoint(api.endpoint);
      if (!this.apiRoutes.has(endpoint)) {
        fileResult.issues.push({
          type: 'missing-api',
          severity: 'warning',
          message: `API端点 "${endpoint}" 在后端路由中未找到`,
          line: api.line,
          context: api.context
        });
      }
    });

    // 验证组件导入
    fileResult.imports.forEach(imp => {
      const componentPath = this.resolveComponentPath(imp.path, fileResult.path);
      if (!fs.existsSync(componentPath)) {
        fileResult.issues.push({
          type: 'missing-component',
          severity: 'error',
          message: `组件文件 "${componentPath}" 不存在`,
          line: imp.line,
          context: imp.context
        });
      }
    });
  }

  /**
   * 提取路由路径
   */
  extractRoutePath(routeString) {
    // 简单提取路径，去除查询参数和哈希
    const pathMatch = routeString.match(/['"`]([^'"`?#]+)['"`]/);
    return pathMatch ? pathMatch[1] : routeString;
  }

  /**
   * 提取API端点
   */
  extractApiEndpoint(apiString) {
    const pathMatch = apiString.match(/['"`](\/api\/[^'"`]+)['"`]/);
    return pathMatch ? pathMatch[1] : apiString;
  }

  /**
   * 解析组件路径
   */
  resolveComponentPath(importPath, currentFile) {
    // 处理相对路径
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const currentDir = path.dirname(currentFile);
      return path.join(this.pagesDir, currentDir, importPath);
    }

    // 处理绝对路径（@/ 等）
    if (importPath.startsWith('@/')) {
      return path.join(__dirname, 'client/src', importPath.slice(2));
    }

    // 默认情况
    return path.join(this.pagesDir, importPath);
  }

  /**
   * 获取行号
   */
  getLineNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }

  /**
   * 获取上下文
   */
  getContext(content, index, length = 100) {
    const start = Math.max(0, index - length);
    const end = Math.min(content.length, index + length);
    return content.substring(start, end).replace(/\s+/g, ' ');
  }

  /**
   * 运行检测
   */
  async run() {
    console.log('🔍 开始按钮和链接检测...\n');

    await this.init();
    this.extractRoutePaths();
    this.extractApiRoutes();

    const vueFiles = this.getAllVueFiles();

    if (vueFiles.length === 0) {
      console.log('⚠️ 没有找到Vue文件');
      return;
    }

    console.log('\n📋 扫描结果:\n');

    let totalButtons = 0;
    let totalLinks = 0;
    let totalRoutes = 0;
    let totalApis = 0;
    let totalImports = 0;
    let totalIssues = 0;

    vueFiles.forEach((file, index) => {
      const result = this.scanVueFile(file);
      this.results.scannedFiles.push(result);

      totalButtons += result.buttons.length;
      totalLinks += result.links.length;
      totalRoutes += result.routes.length;
      totalApis += result.apis.length;
      totalImports += result.imports.length;
      totalIssues += result.issues.length;

      // 显示文件扫描结果
      console.log(`${index + 1}. ${result.path}`);
      console.log(`   📱 按钮: ${result.buttons.length}`);
      console.log(`   🔗 链接: ${result.links.length}`);
      console.log(`   🛤️  路由: ${result.routes.length}`);
      console.log(`   🔌 API: ${result.apis.length}`);
      console.log(`   📦 导入: ${result.imports.length}`);

      if (result.issues.length > 0) {
        console.log(`   ❌ 问题: ${result.issues.length}`);
        result.issues.forEach(issue => {
          console.log(`      - [${issue.severity.toUpperCase()}] 第${issue.line}行: ${issue.message}`);
        });
      }

      console.log('');
    });

    // 生成总结报告
    this.generateSummary(totalButtons, totalLinks, totalRoutes, totalApis, totalImports, totalIssues);

    // 生成详细报告
    this.generateDetailedReport();
  }

  /**
   * 生成总结报告
   */
  generateSummary(totalButtons, totalLinks, totalRoutes, totalApis, totalImports, totalIssues) {
    console.log('📊 检测总结:');
    console.log('='.repeat(50));
    console.log(`📄 扫描文件: ${this.results.scannedFiles.length}`);
    console.log(`📱 按钮总数: ${totalButtons}`);
    console.log(`🔗 链接总数: ${totalLinks}`);
    console.log(`🛤️  路由跳转: ${totalRoutes}`);
    console.log(`🔌 API调用: ${totalApis}`);
    console.log(`📦 组件导入: ${totalImports}`);
    console.log(`❌ 问题总数: ${totalIssues}`);
    console.log('');

    if (totalIssues > 0) {
      const errorIssues = this.results.scannedFiles.reduce((sum, file) =>
        sum + file.issues.filter(i => i.severity === 'error').length, 0);
      const warningIssues = this.results.scannedFiles.reduce((sum, file) =>
        sum + file.issues.filter(i => i.severity === 'warning').length, 0);

      console.log(`⚠️ 错误: ${errorIssues}`);
      console.log(`⚠️ 警告: ${warningIssues}`);
      console.log('');
    }
  }

  /**
   * 生成详细报告文件
   */
  generateDetailedReport() {
    const reportPath = path.join(__dirname, 'button-link-detection-report.md');

    let report = `# 按钮和链接检测报告\n\n`;
    report += `生成时间: ${new Date().toLocaleString()}\n\n`;

    // 执行摘要
    report += `## 📊 执行摘要\n\n`;
    report += `- 扫描文件数: ${this.results.scannedFiles.length}\n`;
    report += `- 检测路径: ${this.pagesDir}\n\n`;

    // 路由配置
    report += `## 🛤️ 路由配置 (${this.routePaths.size}个)\n\n`;
    report += `<details>\n<summary>点击展开路由列表</summary>\n\n`;
    Array.from(this.routePaths).sort().forEach(route => {
      report += `- \`${route}\`\n`;
    });
    report += `\n</details>\n\n`;

    // API路由
    report += `## 🔌 API路由 (${this.apiRoutes.size}个)\n\n`;
    report += `<details>\n<summary>点击展开API列表</summary>\n\n`;
    Array.from(this.apiRoutes).sort().forEach(api => {
      report += `- \`${api}\`\n`;
    });
    report += `\n</details>\n\n`;

    // 文件详情
    report += `## 📄 文件详情\n\n`;

    this.results.scannedFiles.forEach(file => {
      report += `### ${file.path}\n\n`;

      if (file.buttons.length > 0) {
        report += `#### 📱 按钮 (${file.buttons.length}个)\n\n`;
        file.buttons.forEach(btn => {
          report += `- 第${btn.line}行: \`${btn.handler}\`\n`;
        });
        report += `\n`;
      }

      if (file.links.length > 0) {
        report += `#### 🔗 链接 (${file.links.length}个)\n\n`;
        file.links.forEach(link => {
          report += `- 第${link.line}行: \`${link.target}\`\n`;
        });
        report += `\n`;
      }

      if (file.routes.length > 0) {
        report += `#### 🛤️ 路由跳转 (${file.routes.length}个)\n\n`;
        file.routes.forEach(route => {
          report += `- 第${route.line}行: \`${route.path}\`\n`;
        });
        report += `\n`;
      }

      if (file.apis.length > 0) {
        report += `#### 🔌 API调用 (${file.apis.length}个)\n\n`;
        file.apis.forEach(api => {
          report += `- 第${api.line}行: \`${api.endpoint}\`\n`;
        });
        report += `\n`;
      }

      if (file.imports.length > 0) {
        report += `#### 📦 组件导入 (${file.imports.length}个)\n\n`;
        file.imports.forEach(imp => {
          report += `- 第${imp.line}行: \`${imp.path}\`\n`;
        });
        report += `\n`;
      }

      if (file.issues.length > 0) {
        report += `#### ❌ 问题 (${file.issues.length}个)\n\n`;
        file.issues.forEach(issue => {
          const emoji = issue.severity === 'error' ? '🔴' : '🟡';
          report += `- ${emoji} **${issue.severity.toUpperCase()}** - 第${issue.line}行: ${issue.message}\n`;
          report += `  \`\`\`javascript\n  ${issue.context}\n  \`\`\`\n\n`;
        });
      }
    });

    // 问题汇总
    const allIssues = this.results.scannedFiles.flatMap(file => file.issues);
    if (allIssues.length > 0) {
      report += `## ❌ 问题汇总\n\n`;

      const errors = allIssues.filter(i => i.severity === 'error');
      const warnings = allIssues.filter(i => i.severity === 'warning');

      if (errors.length > 0) {
        report += `### 🔴 错误 (${errors.length}个)\n\n`;
        errors.forEach((issue, index) => {
          report += `${index + 1}. **${issue.path}** - 第${issue.line}行: ${issue.message}\n`;
          report += `   \`\`\`javascript\n   ${issue.context}\n   \`\`\`\n\n`;
        });
      }

      if (warnings.length > 0) {
        report += `### 🟡 警告 (${warnings.length}个)\n\n`;
        warnings.forEach((issue, index) => {
          report += `${index + 1}. **${issue.path}** - 第${issue.line}行: ${issue.message}\n`;
          report += `   \`\`\`javascript\n   ${issue.context}\n   \`\`\`\n\n`;
        });
      }
    }

    report += `---\n`;
    report += `*报告由按钮链接检测脚本自动生成*\n`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`📄 详细报告已生成: ${reportPath}`);
  }
}

// 运行检测
if (require.main === module) {
  const detector = new ButtonLinkDetector();
  detector.run().catch(error => {
    console.error('❌ 检测过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = ButtonLinkDetector;