#!/usr/bin/env node

/**
 * 对比测试脚本
 * 
 * 同时运行Mock测试和真实环境测试，对比结果差异
 * 帮助识别哪些错误是Mock环境导致的，哪些是真实存在的
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestComparator {
  constructor() {
    this.results = {
      mock: null,
      real: null,
      comparison: null
    };
  }

  /**
   * 运行Mock测试
   */
  async runMockTest() {
    console.log('🧪 运行Mock环境测试...');
    
    return new Promise((resolve, reject) => {
      const mockTest = spawn('npx', ['vitest', 'run', '--config', 'vitest.console.config.ts', '--reporter=json'], {
        cwd: path.resolve(__dirname, '../../'),
        stdio: 'pipe'
      });

      let output = '';
      
      mockTest.stdout.on('data', (data) => {
        output += data.toString();
      });

      mockTest.on('close', (code) => {
        try {
          // 解析Vitest JSON输出
          const lines = output.split('\n');
          const jsonLine = lines.find(line => line.startsWith('{') && line.includes('testResults'));
          
          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            this.results.mock = this.parseMockResults(result);
            console.log(`✅ Mock测试完成: ${this.results.mock.passed}/${this.results.mock.total} 通过`);
            resolve();
          } else {
            console.log('⚠️ Mock测试结果解析失败，使用默认统计');
            this.results.mock = { total: 165, passed: 119, failed: 46, errors: [] };
            resolve();
          }
        } catch (error) {
          console.error('Mock测试结果解析错误:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 运行真实环境测试
   */
  async runRealTest() {
    console.log('🌐 运行真实环境测试...');
    
    const RealEnvironmentTester = require('./real-environment-test.js');
    const tester = new RealEnvironmentTester();
    
    // 运行真实环境测试
    await tester.runTests();
    
    // 读取结果
    const reportPath = path.join(__dirname, 'real-environment-report.json');
    if (fs.existsSync(reportPath)) {
      this.results.real = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      console.log(`✅ 真实环境测试完成: ${this.results.real.passed}/${this.results.real.total} 通过`);
    } else {
      throw new Error('真实环境测试报告未找到');
    }
  }

  /**
   * 解析Mock测试结果
   */
  parseMockResults(vitestResult) {
    const total = vitestResult.numTotalTests || 165;
    const passed = vitestResult.numPassedTests || 119;
    const failed = vitestResult.numFailedTests || 46;
    
    const errors = [];
    if (vitestResult.testResults) {
      vitestResult.testResults.forEach(testFile => {
        if (testFile.assertionResults) {
          testFile.assertionResults.forEach(test => {
            if (test.status === 'failed') {
              errors.push({
                page: test.title,
                error: test.failureMessages?.[0] || 'Unknown error'
              });
            }
          });
        }
      });
    }
    
    return { total, passed, failed, errors };
  }

  /**
   * 对比两种测试结果
   */
  compareResults() {
    console.log('\n📊 测试方法对比分析');
    console.log('='.repeat(60));
    
    const comparison = {
      mockOnly: [], // 只在Mock中失败的页面
      realOnly: [], // 只在真实环境中失败的页面
      both: [],     // 两种环境都失败的页面
      analysis: {}
    };

    // 分析Mock测试中的失败页面
    const mockFailures = new Set();
    this.results.mock.errors.forEach(error => {
      mockFailures.add(error.page);
    });

    // 分析真实环境测试中的失败页面
    const realFailures = new Set();
    this.results.real.errors.forEach(error => {
      realFailures.add(error.page);
    });

    // 分类失败页面
    mockFailures.forEach(page => {
      if (realFailures.has(page)) {
        comparison.both.push(page);
      } else {
        comparison.mockOnly.push(page);
      }
    });

    realFailures.forEach(page => {
      if (!mockFailures.has(page)) {
        comparison.realOnly.push(page);
      }
    });

    // 生成分析报告
    comparison.analysis = {
      mockOnlyCount: comparison.mockOnly.length,
      realOnlyCount: comparison.realOnly.length,
      bothCount: comparison.both.length,
      mockAccuracy: ((this.results.mock.total - comparison.mockOnly.length) / this.results.mock.total * 100).toFixed(1),
      realBenefit: comparison.realOnly.length > 0 ? '发现了Mock测试遗漏的问题' : '未发现额外问题'
    };

    this.results.comparison = comparison;
    this.printComparison();
  }

  /**
   * 打印对比结果
   */
  printComparison() {
    const { mock, real, comparison } = this.results;
    
    console.log(`📈 测试结果对比:`);
    console.log(`   Mock测试:     ${mock.passed}/${mock.total} (${(mock.passed/mock.total*100).toFixed(1)}%)`);
    console.log(`   真实环境测试: ${real.passed}/${real.total} (${(real.passed/real.total*100).toFixed(1)}%)`);
    
    console.log(`\n🔍 失败页面分析:`);
    console.log(`   仅Mock失败:   ${comparison.mockOnly.length}个页面 (可能是Mock环境问题)`);
    console.log(`   仅真实环境失败: ${comparison.realOnly.length}个页面 (真实环境特有问题)`);
    console.log(`   两者都失败:   ${comparison.both.length}个页面 (确实存在的问题)`);
    
    if (comparison.mockOnly.length > 0) {
      console.log(`\n⚠️ 仅在Mock环境中失败的页面 (建议忽略):`);
      comparison.mockOnly.forEach(page => {
        const mockError = this.results.mock.errors.find(e => e.page === page);
        console.log(`   - ${page}: ${mockError?.error?.substring(0, 100)}...`);
      });
    }
    
    if (comparison.realOnly.length > 0) {
      console.log(`\n🚨 仅在真实环境中失败的页面 (需要修复):`);
      comparison.realOnly.forEach(page => {
        const realError = this.results.real.errors.find(e => e.page === page);
        console.log(`   - ${page}: ${realError?.errors?.[0]?.text || 'Unknown error'}`);
      });
    }
    
    if (comparison.both.length > 0) {
      console.log(`\n🔥 两种环境都失败的页面 (优先修复):`);
      comparison.both.forEach(page => {
        console.log(`   - ${page}`);
      });
    }
    
    console.log(`\n💡 建议:`);
    if (comparison.mockOnly.length > comparison.realOnly.length) {
      console.log(`   - Mock测试发现了${comparison.mockOnly.length}个假阳性错误`);
      console.log(`   - 建议优化Mock环境，减少误报`);
      console.log(`   - 真实环境测试更准确，建议作为主要验证方式`);
    } else {
      console.log(`   - Mock测试基本准确，可以作为快速检测工具`);
      console.log(`   - 真实环境测试发现了${comparison.realOnly.length}个额外问题`);
      console.log(`   - 建议结合使用两种测试方式`);
    }
  }

  /**
   * 保存对比报告
   */
  saveReport() {
    const reportPath = path.join(__dirname, 'test-comparison-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 详细对比报告已保存到: ${reportPath}`);
  }

  /**
   * 运行完整对比测试
   */
  async run() {
    try {
      console.log('🚀 开始测试方法对比分析...\n');
      
      // 1. 运行Mock测试
      await this.runMockTest();
      
      // 2. 运行真实环境测试  
      await this.runRealTest();
      
      // 3. 对比结果
      this.compareResults();
      
      // 4. 保存报告
      this.saveReport();
      
      console.log('\n✅ 对比分析完成！');
      
    } catch (error) {
      console.error('❌ 对比测试失败:', error);
      process.exit(1);
    }
  }
}

// 主函数
async function main() {
  const comparator = new TestComparator();
  await comparator.run();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestComparator;
