#!/usr/bin/env node

/**
 * 快速系统检查工具 (CommonJS版本)
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
          '3. 运行自动修复工具: node kindergarten-test-fixer.js'
        ]
      });
    }
    
    if (!results.services.frontend.running) {
      results.recommendations.push({
        priority: 'high',
        action: '启动前端服务',
        description: '前端服务未运行，用户无法访问系统',
        steps: [
          '1. cd client',
          '2. npm install (如果是第一次)',
          '3. npm run dev',
          '4. 等待服务启动在 http://localhost:5173'
        ]
      });
    }
    
    if (!results.services.backend.running) {
      results.recommendations.push({
        priority: 'medium',
        action: '启动后端服务',
        description: '后端服务未运行，前端可能无法获取数据',
        steps: [
          '1. cd server',
          '2. npm install (如果是第一次)',
          '3. npm run dev',
          '4. 等待服务启动在 http://localhost:3000'
        ]
      });
    }
    
    if (results.components.missing.length > 0) {
      results.recommendations.push({
        priority: 'high',
        action: '创建缺失的组件',
        description: `${results.components.missing.length} 个中心组件缺失，会导致页面404错误`,
        steps: [
          '1. node kindergarten-test-fixer.js (自动修复)',
          '2. 或手动创建缺失组件',
          '3. 重新启动前端服务测试'
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
    
    if (results.components.missing.length > 0) {
      console.log(`\n❌ 缺失的中心组件:`);
      results.components.missing.forEach((comp, index) => {
        console.log(`      ${index + 1}. ${comp}`);
      });
    }
    
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
        console.log(`\n   ${index + 1}. ${rec.action} (优先级: ${rec.priority})`);
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
      
      // 分析问题
      IssueAnalyzer.analyzeIssues();
      
      // 生成报告
      ReportGenerator.printConsoleReport();
      
      Logger.success('快速检查完成！');
      
      // 返回检查结果
      return {
        success: results.issues.filter(i => i.severity === 'critical').length === 0,
        issueCount: results.issues.length,
        recommendations: results.recommendations.length,
        servicesRunning: results.services.frontend.running && results.services.backend.running,
        componentsComplete: results.components.missing.length === 0
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
      if (result.servicesRunning && result.componentsComplete) {
        Logger.success('🎉 系统状态完美！可以开始完整测试');
        console.log('\n建议运行：');
        console.log('  node kindergarten-test-fixer.js    # 完整自动化测试');
      } else {
        Logger.success('✅ 未发现关键问题，但有一些建议优化');
        console.log('\n建议依次执行：');
        if (!result.servicesRunning) {
          console.log('  1. 启动前后端服务');
        }
        if (!result.componentsComplete) {
          console.log('  2. node kindergarten-test-fixer.js --fix-only  # 修复缺失组件');
        }
        console.log('  3. node kindergarten-test-fixer.js             # 完整测试');
      }
      process.exit(0);
    } else {
      Logger.warning(`⚠️ 发现 ${result.issueCount} 个问题，建议先修复再进行测试`);
      console.log('\n优先执行：');
      console.log('  node kindergarten-test-fixer.js --fix-only  # 自动修复问题');
      process.exit(1);
    }
  } catch (error) {
    Logger.error(`检查失败: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行
if (require.main === module) {
  main();
}

module.exports = { QuickChecker, ServiceChecker, FileChecker, CONFIG };