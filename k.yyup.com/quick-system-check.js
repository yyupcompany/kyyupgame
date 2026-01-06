#!/usr/bin/env node

/**
 * 快速系统检查工具
 * 
 * 这是一个轻量级的系统状态检查工具，用于：
 * 1. 检查前后端服务状态
 * 2. 验证关键组件是否存在
 * 3. 快速诊断常见问题
 * 4. 生成简要的状态报告
 */

const fs = require('fs').promises;
const path = require('path');
const http = require('http');

// 配置
const CONFIG = {
  project: {
    path: 'F:\\kyyup730\\lazy-ai-substitute-project',
    frontend: { port: 5173, url: 'http://localhost:5173' },
    backend: { port: 3000, url: 'http://localhost:3000' }
  },
  centers: [
    'DashboardCenter.vue',
    'EnrollmentCenter.vue', 
    'ActivityCenter.vue',
    'PersonnelCenter.vue',
    'MarketingCenter.vue',
    'AICenter.vue',
    'SystemCenter.vue',
    'CustomerPoolCenter.vue',
    'TaskCenter.vue',
    'AnalyticsCenter.vue'
  ],
  criticalFiles: [
    'client/src/router/index.ts',
    'client/src/router/dynamic-routes.ts',
    'client/src/App.vue',
    'client/src/main.ts',
    'server/src/index.ts',
    'server/src/app.ts',
    'package.json'
  ]
};

let results = {
  timestamp: new Date().toISOString(),
  services: { frontend: null, backend: null },
  components: { total: 0, existing: 0, missing: [] },
  files: { total: 0, existing: 0, missing: [] },
  issues: [],
  recommendations: []
};

/**
 * 日志工具
 */
class Logger {
  static colors = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', 
    yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m'
  };
  
  static log(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    const levelColors = {
      info: this.colors.cyan,
      success: this.colors.green, 
      warning: this.colors.yellow,
      error: this.colors.red,
      debug: this.colors.blue
    };
    
    const icons = { info: 'ℹ️ ', success: '✅', warning: '⚠️ ', error: '❌', debug: '🐛' };
    
    console.log(`${levelColors[level]}${icons[level]} [${timestamp}] ${message}${this.colors.reset}`);
  }
  
  static info(msg) { this.log('info', msg); }
  static success(msg) { this.log('success', msg); }
  static warning(msg) { this.log('warning', msg); }
  static error(msg) { this.log('error', msg); }
  static debug(msg) { this.log('debug', msg); }
}

/**
 * 服务检查器
 */
class ServiceChecker {
  /**
   * 检查端口是否开放
   */
  static checkPort(port, host = 'localhost') {
    return new Promise((resolve) => {
      const req = http.request({
        host: host,
        port: port,
        method: 'GET',
        timeout: 3000
      }, (res) => {
        resolve({
          running: true,
          status: res.statusCode,
          message: `Service responding on port ${port}`
        });
      });
      
      req.on('error', () => {
        resolve({
          running: false,
          status: null,
          message: `No service on port ${port}`
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          running: false,
          status: null,
          message: `Timeout checking port ${port}`
        });
      });
      
      req.end();
    });
  }
  
  /**
   * 检查前端服务
   */
  static async checkFrontend() {
    Logger.info('检查前端服务...');
    const result = await this.checkPort(CONFIG.project.frontend.port);
    
    results.services.frontend = {
      port: CONFIG.project.frontend.port,
      running: result.running,
      status: result.status,
      url: CONFIG.project.frontend.url,
      message: result.message
    };
    
    if (result.running) {
      Logger.success(`前端服务正常 (端口 ${CONFIG.project.frontend.port})`);
    } else {
      Logger.warning(`前端服务未运行 (端口 ${CONFIG.project.frontend.port})`);
      results.issues.push({
        type: 'service',
        severity: 'high',
        message: '前端服务未启动',
        recommendation: '运行 "cd client && npm run dev" 启动前端服务'
      });
    }
    
    return result;
  }
  
  /**
   * 检查后端服务
   */
  static async checkBackend() {
    Logger.info('检查后端服务...');
    const result = await this.checkPort(CONFIG.project.backend.port);
    
    results.services.backend = {
      port: CONFIG.project.backend.port,
      running: result.running,
      status: result.status,
      url: CONFIG.project.backend.url,
      message: result.message
    };
    
    if (result.running) {
      Logger.success(`后端服务正常 (端口 ${CONFIG.project.backend.port})`);
    } else {
      Logger.warning(`后端服务未运行 (端口 ${CONFIG.project.backend.port})`);
      results.issues.push({
        type: 'service',
        severity: 'medium',
        message: '后端服务未启动',
        recommendation: '运行 "cd server && npm run dev" 启动后端服务'
      });
    }
    
    return result;
  }
}

/**
 * 文件检查器
 */
class FileChecker {
  /**
   * 检查关键文件是否存在
   */
  static async checkCriticalFiles() {
    Logger.info('检查关键文件...');
    
    results.files.total = CONFIG.criticalFiles.length;
    
    for (const file of CONFIG.criticalFiles) {
      const filePath = path.join(CONFIG.project.path, file);
      
      try {
        await fs.access(filePath);
        results.files.existing++;
        Logger.debug(`✓ ${file}`);
      } catch (error) {
        results.files.missing.push(file);
        Logger.warning(`✗ 缺失关键文件: ${file}`);
        
        results.issues.push({
          type: 'file',
          severity: 'high',
          message: `关键文件缺失: ${file}`,
          recommendation: `检查文件是否被误删或路径是否正确: ${filePath}`
        });
      }
    }
    
    const existingPercent = ((results.files.existing / results.files.total) * 100).toFixed(1);
    
    if (results.files.missing.length === 0) {
      Logger.success(`所有关键文件存在 (${results.files.total}/${results.files.total})`);
    } else {
      Logger.warning(`文件完整性: ${existingPercent}% (${results.files.existing}/${results.files.total})`);
    }
  }
  
  /**
   * 检查中心组件是否存在
   */
  static async checkCenterComponents() {
    Logger.info('检查中心组件...');
    
    const componentDir = path.join(CONFIG.project.path, 'client/src/pages/centers');
    results.components.total = CONFIG.centers.length;
    
    for (const component of CONFIG.centers) {
      const componentPath = path.join(componentDir, component);
      
      try {
        await fs.access(componentPath);
        results.components.existing++;
        Logger.debug(`✓ ${component}`);
      } catch (error) {
        results.components.missing.push(component);
        Logger.warning(`✗ 缺失组件: ${component}`);
        
        results.issues.push({
          type: 'component',
          severity: 'critical',
          message: `中心组件缺失: ${component}`,
          recommendation: `使用自动化工具创建组件: node kindergarten-test-fixer.js --center=${component.replace('.vue', '')}`
        });
      }
    }
    
    const existingPercent = ((results.components.existing / results.components.total) * 100).toFixed(1);
    
    if (results.components.missing.length === 0) {
      Logger.success(`所有中心组件存在 (${results.components.total}/${results.components.total})`);
    } else {
      Logger.warning(`组件完整性: ${existingPercent}% (${results.components.existing}/${results.components.total})`);
    }
  }
  
  /**
   * 检查目录结构
   */
  static async checkDirectoryStructure() {
    Logger.info('检查项目目录结构...');
    
    const requiredDirs = [
      'client',
      'server', 
      'client/src',
      'client/src/pages',
      'client/src/pages/centers',
      'client/src/router',
      'server/src'
    ];
    
    let missingDirs = [];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(CONFIG.project.path, dir);
      
      try {
        const stat = await fs.stat(dirPath);
        if (stat.isDirectory()) {
          Logger.debug(`✓ ${dir}/`);
        } else {
          missingDirs.push(dir);
          Logger.warning(`✗ ${dir} 不是目录`);
        }
      } catch (error) {
        missingDirs.push(dir);
        Logger.warning(`✗ 缺失目录: ${dir}`);
        
        results.issues.push({
          type: 'directory',
          severity: 'high',
          message: `必需目录缺失: ${dir}`,
          recommendation: `创建目录: mkdir -p "${dirPath}"`
        });
      }
    }
    
    if (missingDirs.length === 0) {
      Logger.success('项目目录结构完整');
    } else {
      Logger.warning(`目录结构问题: ${missingDirs.length} 个目录缺失`);
    }
  }
}

/**
 * 问题分析器
 */
class IssueAnalyzer {
  /**
   * 分析问题并生成建议
   */
  static analyzeIssues() {
    Logger.info('分析检测到的问题...');
    
    const issueStats = {
      critical: results.issues.filter(i => i.severity === 'critical').length,
      high: results.issues.filter(i => i.severity === 'high').length,
      medium: results.issues.filter(i => i.severity === 'medium').length,
      low: results.issues.filter(i => i.severity === 'low').length
    };
    
    // 生成总体建议
    if (issueStats.critical > 0) {
      results.recommendations.push({
        priority: 'immediate',
        action: '立即修复关键问题',
        description: `发现 ${issueStats.critical} 个关键问题，系统可能无法正常运行`,
        steps: [
          '1. 优先修复缺失的核心组件',
          '2. 确保关键文件存在',
          '3. 检查项目目录结构'
        ]
      });
    }
    
    if (!results.services.frontend.running) {
      results.recommendations.push({
        priority: 'high',
        action: '启动前端服务',
        description: '前端服务未运行，用户无法访问系统',
        steps: [
          '1. 打开终端，进入项目根目录',
          '2. 运行: cd client',
          '3. 运行: npm install (如果是第一次)',
          '4. 运行: npm run dev',
          '5. 等待服务启动，通常在 http://localhost:5173'
        ]
      });
    }
    
    if (!results.services.backend.running) {
      results.recommendations.push({
        priority: 'medium',
        action: '启动后端服务',
        description: '后端服务未运行，前端可能无法获取数据',
        steps: [
          '1. 打开新的终端，进入项目根目录',
          '2. 运行: cd server',
          '3. 运行: npm install (如果是第一次)',
          '4. 运行: npm run dev',
          '5. 等待服务启动，通常在 http://localhost:3000'
        ]
      });
    }
    
    if (results.components.missing.length > 0) {
      results.recommendations.push({
        priority: 'high',
        action: '创建缺失的组件',
        description: `${results.components.missing.length} 个中心组件缺失，会导致页面404错误`,
        steps: [
          '1. 运行自动修复工具: node kindergarten-test-fixer.js',
          '2. 或手动创建缺失组件',
          '3. 检查路由配置是否正确',
          '4. 重新启动前端服务'
        ]
      });
    }
    
    Logger.info(`问题分析完成: 关键 ${issueStats.critical}, 高 ${issueStats.high}, 中 ${issueStats.medium}, 低 ${issueStats.low}`);
  }
}

/**
 * 报告生成器
 */
class ReportGenerator {
  /**
   * 生成控制台报告
   */
  static printConsoleReport() {
    console.log('\n' + '='.repeat(80));
    console.log('                        快速系统检查报告');
    console.log('='.repeat(80));
    
    // 服务状态
    console.log('\n📡 服务状态:');
    console.log(`   前端服务: ${results.services.frontend.running ? '✅ 运行中' : '❌ 未运行'} (端口 ${results.services.frontend.port})`);
    console.log(`   后端服务: ${results.services.backend.running ? '✅ 运行中' : '❌ 未运行'} (端口 ${results.services.backend.port})`);
    
    // 文件状态
    console.log(`\n📁 文件完整性:`);
    console.log(`   关键文件: ${results.files.existing}/${results.files.total} (${((results.files.existing / results.files.total) * 100).toFixed(1)}%)`);
    console.log(`   中心组件: ${results.components.existing}/${results.components.total} (${((results.components.existing / results.components.total) * 100).toFixed(1)}%)`);
    
    // 问题汇总
    if (results.issues.length > 0) {
      console.log(`\n⚠️  发现问题 (${results.issues.length} 个):`);
      
      const groupedIssues = {
        critical: results.issues.filter(i => i.severity === 'critical'),
        high: results.issues.filter(i => i.severity === 'high'), 
        medium: results.issues.filter(i => i.severity === 'medium'),
        low: results.issues.filter(i => i.severity === 'low')
      };
      
      Object.entries(groupedIssues).forEach(([severity, issues]) => {
        if (issues.length > 0) {
          const icon = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
          };
          
          console.log(`\n   ${icon[severity]} ${severity.toUpperCase()} (${issues.length}):`);
          issues.forEach((issue, index) => {
            console.log(`      ${index + 1}. ${issue.message}`);
          });
        }
      });
    } else {
      console.log('\n✅ 未发现问题，系统状态良好！');
    }
    
    // 修复建议
    if (results.recommendations.length > 0) {
      console.log(`\n🔧 修复建议:`);
      results.recommendations.forEach((rec, index) => {
        console.log(`\n   ${index + 1}. ${rec.action} (${rec.priority})`);
        console.log(`      ${rec.description}`);
        rec.steps.forEach(step => {
          console.log(`      ${step}`);
        });
      });
    }
    
    console.log('\n='.repeat(80));
    console.log(`生成时间: ${results.timestamp}`);
    console.log('='.repeat(80) + '\n');
  }
  
  /**
   * 生成JSON报告
   */
  static async generateJSONReport() {
    const reportPath = path.join(CONFIG.project.path, `quick-check-report-${Date.now()}.json`);
    
    try {
      await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf8');
      Logger.success(`JSON报告已生成: ${reportPath}`);
      return reportPath;
    } catch (error) {
      Logger.error(`JSON报告生成失败: ${error.message}`);
      return null;
    }
  }
  
  /**
   * 生成简单的HTML报告
   */
  static async generateHTMLReport() {
    const reportPath = path.join(CONFIG.project.path, `quick-check-report-${Date.now()}.html`);
    
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>快速系统检查报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin: 20px 0; }
        .section h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .status-item { display: flex; justify-content: space-between; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .status-running { background: #d4edda; color: #155724; }
        .status-stopped { background: #f8d7da; color: #721c24; }
        .issue-item { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; }
        .issue-critical { border-left-color: #dc3545; background: #f8d7da; }
        .issue-high { border-left-color: #fd7e14; background: #fff3cd; }
        .recommendation { background: #d1ecf1; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #e9ecef; padding: 15px; text-align: center; border-radius: 4px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007acc; }
        .timestamp { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
        ol { padding-left: 20px; }
        ul { padding-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 快速系统检查报告</h1>
            <p>幼儿园管理系统状态诊断</p>
        </div>

        <div class="section">
            <h3>📊 系统概览</h3>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${results.services.frontend.running ? '✅' : '❌'}</div>
                    <div>前端服务</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${results.services.backend.running ? '✅' : '❌'}</div>
                    <div>后端服务</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${results.components.existing}/${results.components.total}</div>
                    <div>中心组件</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${results.issues.length}</div>
                    <div>发现问题</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>📡 服务状态</h3>
            <div class="status-item ${results.services.frontend.running ? 'status-running' : 'status-stopped'}">
                <span>前端服务 (端口 ${results.services.frontend.port})</span>
                <span>${results.services.frontend.running ? '运行中' : '未运行'}</span>
            </div>
            <div class="status-item ${results.services.backend.running ? 'status-running' : 'status-stopped'}">
                <span>后端服务 (端口 ${results.services.backend.port})</span>
                <span>${results.services.backend.running ? '运行中' : '未运行'}</span>
            </div>
        </div>

        <div class="section">
            <h3>📁 文件完整性</h3>
            <p><strong>关键文件:</strong> ${results.files.existing}/${results.files.total} (${((results.files.existing / results.files.total) * 100).toFixed(1)}%)</p>
            <p><strong>中心组件:</strong> ${results.components.existing}/${results.components.total} (${((results.components.existing / results.components.total) * 100).toFixed(1)}%)</p>
            
            ${results.components.missing.length > 0 ? `
            <p><strong>缺失组件:</strong></p>
            <ul>
                ${results.components.missing.map(comp => `<li>${comp}</li>`).join('')}
            </ul>
            ` : '<p>✅ 所有组件都存在</p>'}
        </div>

        ${results.issues.length > 0 ? `
        <div class="section">
            <h3>⚠️ 发现的问题 (${results.issues.length} 个)</h3>
            ${results.issues.map(issue => `
                <div class="issue-item issue-${issue.severity}">
                    <strong>${issue.type.toUpperCase()} - ${issue.severity.toUpperCase()}</strong><br>
                    ${issue.message}<br>
                    <small><strong>建议:</strong> ${issue.recommendation}</small>
                </div>
            `).join('')}
        </div>
        ` : `
        <div class="section">
            <h3>✅ 系统状态</h3>
            <p>未发现问题，系统状态良好！</p>
        </div>
        `}

        ${results.recommendations.length > 0 ? `
        <div class="section">
            <h3>🔧 修复建议</h3>
            ${results.recommendations.map((rec, index) => `
                <div class="recommendation">
                    <strong>${index + 1}. ${rec.action} (${rec.priority})</strong><br>
                    <p>${rec.description}</p>
                    <ol>
                        ${rec.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="timestamp">
            报告生成时间: ${results.timestamp}
        </div>
    </div>
</body>
</html>
    `;
    
    try {
      await fs.writeFile(reportPath, html, 'utf8');
      Logger.success(`HTML报告已生成: ${reportPath}`);
      return reportPath;
    } catch (error) {
      Logger.error(`HTML报告生成失败: ${error.message}`);
      return null;
    }
  }
}

/**
 * 主检查器
 */
class QuickChecker {
  async run() {
    try {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                      快速系统状态检查                          ║
║                    幼儿园管理系统诊断工具                       ║
║                                                                ║
║  🎯 检查项目:                                                   ║
║     • 前后端服务运行状态                                        ║
║     • 关键文件和组件完整性                                      ║
║     • 项目目录结构                                              ║
║     • 常见问题诊断                                              ║
╚════════════════════════════════════════════════════════════════╝
      `);
      
      Logger.info('开始快速系统检查...');
      
      // 并行检查服务状态
      await Promise.all([
        ServiceChecker.checkFrontend(),
        ServiceChecker.checkBackend()
      ]);
      
      // 检查文件和组件
      await FileChecker.checkCriticalFiles();
      await FileChecker.checkCenterComponents();
      await FileChecker.checkDirectoryStructure();
      
      // 分析问题
      IssueAnalyzer.analyzeIssues();
      
      // 生成报告
      ReportGenerator.printConsoleReport();
      
      // 生成文件报告
      await Promise.all([
        ReportGenerator.generateJSONReport(),
        ReportGenerator.generateHTMLReport()
      ]);
      
      Logger.success('快速检查完成！');
      
      // 返回检查结果
      return {
        success: results.issues.filter(i => i.severity === 'critical').length === 0,
        issueCount: results.issues.length,
        recommendations: results.recommendations.length
      };
      
    } catch (error) {
      Logger.error(`检查过程出错: ${error.message}`);
      throw error;
    }
  }
}

/**
 * 主入口
 */
async function main() {
  const checker = new QuickChecker();
  
  try {
    const result = await checker.run();
    
    if (result.success) {
      Logger.success('🎉 系统状态良好，可以开始测试！');
      process.exit(0);
    } else {
      Logger.warning(`⚠️ 发现 ${result.issueCount} 个问题，建议先修复后再进行完整测试`);
      process.exit(1);
    }
  } catch (error) {
    Logger.error(`检查失败: ${error.message}`);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
快速系统检查工具

用法：
  node quick-system-check.js [选项]

选项：
  --help, -h     显示此帮助信息
  --json         只输出JSON格式结果
  --quiet        静默模式，只显示错误

示例：
  node quick-system-check.js              # 完整检查
  node quick-system-check.js --json       # JSON格式输出
  node quick-system-check.js --quiet      # 静默检查
  `);
  process.exit(0);
}

// 如果直接运行
if (require.main === module) {
  main();
}

module.exports = { QuickChecker, ServiceChecker, FileChecker, CONFIG };