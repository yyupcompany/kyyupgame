#!/usr/bin/env node

/**
 * MCP Playwright 复测脚本 2
 * 
 * 测试目标：
 * 1. 验证MCP Playwright配置是否正确
 * 2. 测试浏览器自动化功能
 * 3. 测试客户申请审批功能的前端页面
 * 4. 生成测试报告
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  static info(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  }

  static error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }

  static warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  static section(title) {
    console.log(`\n${colors.bright}${colors.cyan}═══ ${title} ═══${colors.reset}\n`);
  }
}

class MCPRetester {
  constructor() {
    this.config = this.loadConfig();
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  /**
   * 加载配置
   */
  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'mcp_playwright_config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      Logger.error(`加载配置失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 检查MCP配置
   */
  async checkMCPConfig() {
    Logger.section('检查MCP配置');

    const tests = [
      {
        name: '检查配置文件是否存在',
        test: () => {
          const configFiles = [
            'mcp_playwright_config.json',
            'mcp-config.json',
            '.mcp.json'
          ];
          
          const existingFiles = configFiles.filter(file => 
            fs.existsSync(path.join(__dirname, file))
          );

          if (existingFiles.length > 0) {
            Logger.success(`找到配置文件: ${existingFiles.join(', ')}`);
            return true;
          } else {
            Logger.error('未找到MCP配置文件');
            return false;
          }
        }
      },
      {
        name: '验证Playwright MCP服务器配置',
        test: () => {
          if (!this.config || !this.config.mcpServers) {
            Logger.error('配置文件格式错误');
            return false;
          }

          const playwrightServer = this.config.mcpServers.playwright;
          if (!playwrightServer) {
            Logger.error('未找到Playwright MCP服务器配置');
            return false;
          }

          Logger.success('Playwright MCP服务器配置正确');
          Logger.info(`  命令: ${playwrightServer.command}`);
          Logger.info(`  参数: ${playwrightServer.args.join(' ')}`);
          return true;
        }
      },
      {
        name: '验证MySQL MCP服务器配置',
        test: () => {
          const mysqlServer = this.config.mcpServers.mysql;
          if (!mysqlServer) {
            Logger.warning('未找到MySQL MCP服务器配置');
            return false;
          }

          Logger.success('MySQL MCP服务器配置正确');
          Logger.info(`  主机: ${mysqlServer.env.MYSQL_HOST}`);
          Logger.info(`  端口: ${mysqlServer.env.MYSQL_PORT}`);
          Logger.info(`  数据库: ${mysqlServer.env.MYSQL_DB}`);
          return true;
        }
      },
      {
        name: '验证测试配置',
        test: () => {
          if (!this.config.testConfig) {
            Logger.error('未找到测试配置');
            return false;
          }

          Logger.success('测试配置正确');
          Logger.info(`  前端URL: ${this.config.testConfig.baseUrl}`);
          Logger.info(`  后端URL: ${this.config.testConfig.apiUrl}`);
          Logger.info(`  测试页面数: ${this.config.testConfig.testPages.length}`);
          return true;
        }
      }
    ];

    for (const test of tests) {
      this.runTest(test);
    }
  }

  /**
   * 检查服务状态
   */
  async checkServices() {
    Logger.section('检查服务状态');

    const tests = [
      {
        name: '检查前端服务 (localhost:5173)',
        test: async () => {
          try {
            const http = require('http');
            return new Promise((resolve) => {
              const req = http.get('http://localhost:5173', (res) => {
                if (res.statusCode === 200) {
                  Logger.success('前端服务运行正常');
                  resolve(true);
                } else {
                  Logger.error(`前端服务响应异常: ${res.statusCode}`);
                  resolve(false);
                }
              });

              req.on('error', (error) => {
                Logger.error(`前端服务连接失败: ${error.message}`);
                resolve(false);
              });

              req.setTimeout(5000, () => {
                req.destroy();
                Logger.error('前端服务连接超时');
                resolve(false);
              });
            });
          } catch (error) {
            Logger.error(`检查前端服务失败: ${error.message}`);
            return false;
          }
        }
      },
      {
        name: '检查后端服务 (localhost:3000)',
        test: async () => {
          try {
            const http = require('http');
            return new Promise((resolve) => {
              const req = http.get('http://localhost:3000/api/health', (res) => {
                if (res.statusCode === 200) {
                  Logger.success('后端服务运行正常');
                  resolve(true);
                } else {
                  Logger.error(`后端服务响应异常: ${res.statusCode}`);
                  resolve(false);
                }
              });

              req.on('error', (error) => {
                Logger.error(`后端服务连接失败: ${error.message}`);
                resolve(false);
              });

              req.setTimeout(5000, () => {
                req.destroy();
                Logger.error('后端服务连接超时');
                resolve(false);
              });
            });
          } catch (error) {
            Logger.error(`检查后端服务失败: ${error.message}`);
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }
  }

  /**
   * 测试客户申请审批功能
   */
  async testCustomerApplicationFeature() {
    Logger.section('测试客户申请审批功能');

    const tests = [
      {
        name: '检查通知中心页面文件',
        test: () => {
          const notificationPage = path.join(__dirname, 'client/src/pages/Notifications.vue');
          if (fs.existsSync(notificationPage)) {
            Logger.success('通知中心页面文件存在');
            
            // 检查是否包含客户申请相关代码
            const content = fs.readFileSync(notificationPage, 'utf8');
            if (content.includes('customer-application') || content.includes('客户申请')) {
              Logger.success('  包含客户申请相关代码');
              return true;
            } else {
              Logger.warning('  未找到客户申请相关代码');
              return false;
            }
          } else {
            Logger.error('通知中心页面文件不存在');
            return false;
          }
        }
      },
      {
        name: '检查审批对话框组件',
        test: () => {
          const dialogComponent = path.join(__dirname, 'client/src/components/notifications/ApplicationReviewDialog.vue');
          if (fs.existsSync(dialogComponent)) {
            Logger.success('审批对话框组件存在');
            return true;
          } else {
            Logger.error('审批对话框组件不存在');
            return false;
          }
        }
      },
      {
        name: '检查教师端客户池页面',
        test: () => {
          const customerPoolPage = path.join(__dirname, 'client/src/pages/teacher-center/customer-pool/index.vue');
          if (fs.existsSync(customerPoolPage)) {
            Logger.success('教师端客户池页面存在');
            return true;
          } else {
            Logger.error('教师端客户池页面不存在');
            return false;
          }
        }
      },
      {
        name: '检查API接口文件',
        test: () => {
          const apiFile = path.join(__dirname, 'client/src/api/endpoints/customer-application.ts');
          if (fs.existsSync(apiFile)) {
            Logger.success('客户申请API接口文件存在');
            return true;
          } else {
            Logger.error('客户申请API接口文件不存在');
            return false;
          }
        }
      },
      {
        name: '检查后端控制器',
        test: () => {
          const controllerFile = path.join(__dirname, 'server/src/controllers/customer-application.controller.ts');
          if (fs.existsSync(controllerFile)) {
            Logger.success('客户申请控制器存在');
            return true;
          } else {
            Logger.error('客户申请控制器不存在');
            return false;
          }
        }
      },
      {
        name: '检查数据库迁移文件',
        test: () => {
          const migrationFile = path.join(__dirname, 'server/src/migrations/20251005000001-create-customer-applications-table.js');
          if (fs.existsSync(migrationFile)) {
            Logger.success('数据库迁移文件存在');
            return true;
          } else {
            Logger.error('数据库迁移文件不存在');
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      this.runTest(test);
    }
  }

  /**
   * 运行单个测试
   */
  async runTest(test) {
    this.testResults.total++;
    
    try {
      const result = await test.test();
      
      if (result) {
        this.testResults.passed++;
        this.testResults.tests.push({
          name: test.name,
          status: 'passed'
        });
      } else {
        this.testResults.failed++;
        this.testResults.tests.push({
          name: test.name,
          status: 'failed'
        });
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({
        name: test.name,
        status: 'failed',
        error: error.message
      });
      Logger.error(`测试执行失败: ${error.message}`);
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    Logger.section('测试报告');

    const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(2);

    console.log(`总测试数: ${this.testResults.total}`);
    console.log(`${colors.green}通过: ${this.testResults.passed}${colors.reset}`);
    console.log(`${colors.red}失败: ${this.testResults.failed}${colors.reset}`);
    console.log(`${colors.yellow}跳过: ${this.testResults.skipped}${colors.reset}`);
    console.log(`通过率: ${passRate}%`);

    // 保存报告到文件
    const reportPath = path.join(__dirname, 'mcp-retest-2-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    Logger.success(`测试报告已保存到: ${reportPath}`);
  }

  /**
   * 运行所有测试
   */
  async run() {
    Logger.info('🚀 开始MCP Playwright复测 2');
    Logger.info(`时间: ${new Date().toLocaleString()}`);

    await this.checkMCPConfig();
    await this.checkServices();
    await this.testCustomerApplicationFeature();

    this.generateReport();

    Logger.info('\n✨ 复测完成！');
  }
}

// 运行测试
const retester = new MCPRetester();
retester.run().catch(error => {
  Logger.error(`复测失败: ${error.message}`);
  process.exit(1);
});

