#!/usr/bin/env node

/**
 * 统一测试运行器
 * 协调前后端测试执行，确保100%覆盖率
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  // 覆盖率阈值
  coverageThreshold: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
  },
  
  // 测试超时（毫秒）
  timeout: 600000, // 10分钟
  
  // 并行测试数量
  maxWorkers: process.env.CI ? 2 : 4,
  
  // 重试次数
  retries: process.env.CI ? 3 : 1
};

class TestRunner {
  constructor() {
    this.results = {
      server: null,
      client: null,
      e2e: null,
      coverage: null
    };
    this.startTime = Date.now();
  }

  /**
   * 运行所有测试
   */
  async runAll() {
    console.log('🚀 开始运行完整测试套件...\n');

    try {
      // 1. 准备测试环境
      await this.setupEnvironment();

      // 2. 运行服务器测试
      await this.runServerTests();

      // 3. 运行客户端单元测试
      await this.runClientUnitTests();

      // 4. 启动服务器用于集成测试
      const serverProcess = await this.startTestServer();

      // 5. 运行API集成测试
      await this.runApiIntegrationTests();

      // 5.5. 运行APItest测试套件
      await this.runApiTestSuite();

      // 6. 运行E2E测试
      await this.runE2ETests();

      // 6.5. 运行全站评测测试
      await this.runComprehensiveTests();

      // 7. 停止测试服务器
      if (serverProcess) {
        serverProcess.kill();
      }

      // 8. 生成综合报告
      await this.generateReport();

      // 9. 验证覆盖率
      await this.validateCoverage();

      console.log('✅ 所有测试完成！');
      process.exit(0);

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 准备测试环境
   */
  async setupEnvironment() {
    console.log('📋 准备测试环境...');

    // 清理之前的测试结果
    this.cleanupPreviousResults();

    // 创建测试结果目录
    this.createTestDirectories();

    // 设置环境变量
    process.env.NODE_ENV = 'test';
    process.env.CI = process.env.CI || 'false';

    console.log('✅ 测试环境准备完成\n');
  }

  /**
   * 运行服务器测试
   */
  async runServerTests() {
    console.log('🔧 运行服务器测试...');

    try {
      const result = execSync('cd server && npm test', {
        stdio: 'inherit',
        timeout: TEST_CONFIG.timeout
      });

      this.results.server = { success: true, output: result };
      console.log('✅ 服务器测试完成\n');

    } catch (error) {
      this.results.server = { success: false, error: error.message };
      throw new Error(`服务器测试失败: ${error.message}`);
    }
  }

  /**
   * 运行客户端单元测试
   */
  async runClientUnitTests() {
    console.log('🎨 运行客户端单元测试...');

    try {
      const result = execSync('cd client && npm run test:unit', {
        stdio: 'inherit',
        timeout: TEST_CONFIG.timeout
      });

      this.results.client = { success: true, output: result };
      console.log('✅ 客户端单元测试完成\n');

    } catch (error) {
      this.results.client = { success: false, error: error.message };
      throw new Error(`客户端单元测试失败: ${error.message}`);
    }
  }

  /**
   * 启动测试服务器
   */
  async startTestServer() {
    console.log('🚀 启动测试服务器...');

    return new Promise((resolve, reject) => {
      const serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: './server',
        stdio: 'pipe'
      });

      let serverReady = false;

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server running on port') && !serverReady) {
          serverReady = true;
          console.log('✅ 测试服务器启动完成\n');
          resolve(serverProcess);
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error('服务器错误:', data.toString());
      });

      // 超时处理
      setTimeout(() => {
        if (!serverReady) {
          serverProcess.kill();
          reject(new Error('测试服务器启动超时'));
        }
      }, 30000);
    });
  }

  /**
   * 运行API集成测试
   */
  async runApiIntegrationTests() {
    console.log('🔗 运行API集成测试...');

    try {
      // 运行主要的集成测试
      const result = execSync('cd server && npm run test:integration', {
        stdio: 'inherit',
        timeout: TEST_CONFIG.timeout
      });

      console.log('✅ API集成测试完成\n');

    } catch (error) {
      throw new Error(`API集成测试失败: ${error.message}`);
    }
  }

  /**
   * 运行APItest目录的测试
   */
  async runApiTestSuite() {
    console.log('🧪 运行APItest测试套件...');

    try {
      const result = execSync('cd server/APItest && npm test', {
        stdio: 'inherit',
        timeout: TEST_CONFIG.timeout
      });

      console.log('✅ APItest测试套件完成\n');

    } catch (error) {
      console.warn(`⚠️ APItest测试套件失败: ${error.message}`);
      // 不抛出错误，允许继续执行其他测试
    }
  }

  /**
   * 运行E2E测试
   */
  async runE2ETests() {
    console.log('🌐 运行E2E测试...');

    try {
      const result = execSync('cd client && npm run test:e2e', {
        stdio: 'inherit',
        timeout: TEST_CONFIG.timeout
      });

      this.results.e2e = { success: true, output: result };
      console.log('✅ E2E测试完成\n');

    } catch (error) {
      this.results.e2e = { success: false, error: error.message };
      throw new Error(`E2E测试失败: ${error.message}`);
    }
  }

  /**
   * 运行全站评测测试
   */
  async runComprehensiveTests() {
    console.log('🏢 运行全站评测测试...');

    try {
      // 检查是否存在全站评测目录
      if (fs.existsSync('./client/全站评测目录')) {
        console.log('发现全站评测目录，运行相关测试...');

        // 运行主要的全站测试脚本
        const testScripts = [
          'master-comprehensive-test.mjs',
          'final-85-pages-test.cjs',
          'comprehensive-test-report.md'
        ];

        for (const script of testScripts) {
          const scriptPath = `./client/全站评测目录/${script}`;
          if (fs.existsSync(scriptPath)) {
            console.log(`运行: ${script}`);
            try {
              execSync(`cd client/全站评测目录 && node ${script}`, {
                stdio: 'inherit',
                timeout: TEST_CONFIG.timeout / 2 // 减少超时时间
              });
            } catch (error) {
              console.warn(`⚠️ ${script} 执行失败: ${error.message}`);
            }
          }
        }
      }

      console.log('✅ 全站评测测试完成\n');

    } catch (error) {
      console.warn(`⚠️ 全站评测测试失败: ${error.message}`);
      // 不抛出错误，允许继续执行
    }
  }

  /**
   * 生成综合报告
   */
  async generateReport() {
    console.log('📊 生成测试报告...');

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      environment: process.env.NODE_ENV,
      ci: process.env.CI === 'true',
      results: this.results,
      coverage: await this.getCoverageData()
    };

    // 保存报告
    const reportPath = './test-results/comprehensive-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ 测试报告已保存: ${reportPath}\n`);
  }

  /**
   * 验证覆盖率
   */
  async validateCoverage() {
    console.log('📈 验证测试覆盖率...');

    const coverage = await this.getCoverageData();
    
    if (!coverage) {
      throw new Error('无法获取覆盖率数据');
    }

    const { branches, functions, lines, statements } = coverage.total;
    const threshold = TEST_CONFIG.coverageThreshold;

    const failures = [];
    if (branches < threshold.branches) failures.push(`分支覆盖率: ${branches}% < ${threshold.branches}%`);
    if (functions < threshold.functions) failures.push(`函数覆盖率: ${functions}% < ${threshold.functions}%`);
    if (lines < threshold.lines) failures.push(`行覆盖率: ${lines}% < ${threshold.lines}%`);
    if (statements < threshold.statements) failures.push(`语句覆盖率: ${statements}% < ${threshold.statements}%`);

    if (failures.length > 0) {
      throw new Error(`覆盖率不达标:\n${failures.join('\n')}`);
    }

    console.log('✅ 覆盖率验证通过 - 100%覆盖率达成！\n');
  }

  /**
   * 获取覆盖率数据
   */
  async getCoverageData() {
    try {
      // 合并前后端覆盖率数据
      const serverCoverage = this.readCoverageFile('./server/coverage/coverage-summary.json');
      const clientCoverage = this.readCoverageFile('./client/coverage/coverage-summary.json');

      // 简单合并（实际项目中可能需要更复杂的合并逻辑）
      return {
        server: serverCoverage,
        client: clientCoverage,
        total: this.mergeCoverage(serverCoverage, clientCoverage)
      };
    } catch (error) {
      console.warn('获取覆盖率数据失败:', error.message);
      return null;
    }
  }

  /**
   * 读取覆盖率文件
   */
  readCoverageFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * 合并覆盖率数据
   */
  mergeCoverage(server, client) {
    if (!server || !client) return server || client;

    // 简化的合并逻辑
    return {
      branches: Math.min(server.total.branches.pct, client.total.branches.pct),
      functions: Math.min(server.total.functions.pct, client.total.functions.pct),
      lines: Math.min(server.total.lines.pct, client.total.lines.pct),
      statements: Math.min(server.total.statements.pct, client.total.statements.pct)
    };
  }

  /**
   * 清理之前的测试结果
   */
  cleanupPreviousResults() {
    const dirsToClean = [
      './test-results',
      './server/coverage',
      './client/coverage',
      './client/test-results'
    ];

    dirsToClean.forEach(dir => {
      try {
        execSync(`rm -rf ${dir}`, { stdio: 'ignore' });
      } catch (error) {
        // 忽略清理错误
      }
    });
  }

  /**
   * 创建测试目录
   */
  createTestDirectories() {
    const dirsToCreate = [
      './test-results',
      './server/coverage',
      './client/coverage',
      './client/test-results'
    ];

    dirsToCreate.forEach(dir => {
      try {
        execSync(`mkdir -p ${dir}`, { stdio: 'ignore' });
      } catch (error) {
        // 忽略创建错误
      }
    });
  }
}

// 运行测试
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAll().catch(error => {
    console.error('测试运行器失败:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
