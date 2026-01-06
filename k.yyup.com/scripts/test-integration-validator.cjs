#!/usr/bin/env node

/**
 * 测试集成验证器
 * 检查所有测试用例是否正确集成到测试脚本中
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestIntegrationValidator {
  constructor() {
    this.issues = [];
    this.testDirectories = [];
    this.testFiles = [];
  }

  /**
   * 运行验证
   */
  async validate() {
    console.log('🔍 开始验证测试集成...\n');

    try {
      // 1. 扫描测试目录
      await this.scanTestDirectories();

      // 2. 检查测试文件
      await this.checkTestFiles();

      // 3. 验证测试脚本配置
      await this.validateTestScripts();

      // 4. 检查测试覆盖率配置
      await this.checkCoverageConfig();

      // 5. 生成报告
      await this.generateReport();

      if (this.issues.length === 0) {
        console.log('✅ 测试集成验证通过！');
        process.exit(0);
      } else {
        console.log(`❌ 发现 ${this.issues.length} 个问题`);
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ 验证失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 扫描测试目录
   */
  async scanTestDirectories() {
    console.log('📁 扫描测试目录...');

    const testDirs = [
      './server/tests',
      './server/APItest',
      './client/tests',
      './client/全站评测目录',
      './tests'
    ];

    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.testDirectories.push(dir);
        console.log(`  ✅ 发现: ${dir}`);
        
        // 递归扫描测试文件
        this.scanTestFiles(dir);
      } else {
        console.log(`  ⚠️ 不存在: ${dir}`);
      }
    });

    console.log(`📊 总计发现 ${this.testDirectories.length} 个测试目录，${this.testFiles.length} 个测试文件\n`);
  }

  /**
   * 递归扫描测试文件
   */
  scanTestFiles(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
          this.scanTestFiles(fullPath);
        } else if (stat.isFile() && this.isTestFile(item)) {
          this.testFiles.push(fullPath);
        }
      });
    } catch (error) {
      console.warn(`扫描目录失败: ${dir} - ${error.message}`);
    }
  }

  /**
   * 判断是否为测试文件
   */
  isTestFile(filename) {
    const testPatterns = [
      /\.test\.(js|ts|mjs|cjs)$/,
      /\.spec\.(js|ts|mjs|cjs)$/,
      /test.*\.(js|ts|mjs|cjs)$/,
      /.*test\.(js|ts|mjs|cjs)$/
    ];

    return testPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * 检查测试文件
   */
  async checkTestFiles() {
    console.log('📝 检查测试文件...');

    const filesByType = {
      unit: [],
      integration: [],
      e2e: [],
      comprehensive: [],
      other: []
    };

    this.testFiles.forEach(file => {
      if (file.includes('/unit/') || file.includes('unit.')) {
        filesByType.unit.push(file);
      } else if (file.includes('/integration/') || file.includes('integration.')) {
        filesByType.integration.push(file);
      } else if (file.includes('/e2e/') || file.includes('e2e.')) {
        filesByType.e2e.push(file);
      } else if (file.includes('/comprehensive/') || file.includes('comprehensive.')) {
        filesByType.comprehensive.push(file);
      } else {
        filesByType.other.push(file);
      }
    });

    console.log('📊 测试文件分类:');
    Object.entries(filesByType).forEach(([type, files]) => {
      console.log(`  ${type}: ${files.length} 个文件`);
    });

    // 检查是否有孤立的测试文件
    this.checkOrphanedTests(filesByType);

    console.log('');
  }

  /**
   * 检查孤立的测试文件
   */
  checkOrphanedTests(filesByType) {
    // 检查是否有测试文件但没有对应的测试脚本
    const orphanedDirs = [];

    this.testDirectories.forEach(dir => {
      const hasTestFiles = this.testFiles.some(file => file.startsWith(dir));
      if (hasTestFiles) {
        // 检查是否有对应的package.json和测试脚本
        const packageJsonPath = path.join(dir, '../package.json');
        if (!fs.existsSync(packageJsonPath)) {
          orphanedDirs.push(dir);
        }
      }
    });

    if (orphanedDirs.length > 0) {
      this.issues.push({
        type: 'orphaned_tests',
        message: '发现孤立的测试目录（没有对应的package.json）',
        details: orphanedDirs
      });
    }
  }

  /**
   * 验证测试脚本配置
   */
  async validateTestScripts() {
    console.log('⚙️ 验证测试脚本配置...');

    const packageJsonFiles = [
      './package.json',
      './server/package.json',
      './client/package.json',
      './server/APItest/package.json'
    ];

    packageJsonFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.validatePackageJson(file);
      } else {
        this.issues.push({
          type: 'missing_package_json',
          message: `缺少package.json文件: ${file}`
        });
      }
    });

    console.log('');
  }

  /**
   * 验证单个package.json文件
   */
  validatePackageJson(file) {
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf8'));
      const scripts = content.scripts || {};

      console.log(`  📄 检查: ${file}`);

      // 检查基本测试脚本
      const requiredScripts = ['test'];
      const recommendedScripts = ['test:unit', 'test:integration', 'test:coverage'];

      requiredScripts.forEach(script => {
        if (!scripts[script]) {
          this.issues.push({
            type: 'missing_test_script',
            message: `${file} 缺少必需的测试脚本: ${script}`
          });
        } else {
          console.log(`    ✅ ${script}: ${scripts[script]}`);
        }
      });

      recommendedScripts.forEach(script => {
        if (!scripts[script]) {
          console.log(`    ⚠️ 建议添加: ${script}`);
        } else {
          console.log(`    ✅ ${script}: ${scripts[script]}`);
        }
      });

    } catch (error) {
      this.issues.push({
        type: 'invalid_package_json',
        message: `无法解析package.json: ${file} - ${error.message}`
      });
    }
  }

  /**
   * 检查测试覆盖率配置
   */
  async checkCoverageConfig() {
    console.log('📈 检查测试覆盖率配置...');

    const configFiles = [
      './test-integration-config.js',
      './server/jest.config.js',
      './client/vitest.config.ts',
      './test-config/jest.config.base.cjs'
    ];

    configFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`  ✅ 发现配置文件: ${file}`);
      } else {
        console.log(`  ⚠️ 配置文件不存在: ${file}`);
      }
    });

    // 检查覆盖率目录
    const coverageDirs = [
      './server/coverage',
      './client/coverage',
      './server/APItest/coverage'
    ];

    console.log('  📁 覆盖率目录:');
    coverageDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`    ✅ ${dir}`);
      } else {
        console.log(`    ⚠️ ${dir} (将在测试运行时创建)`);
      }
    });

    console.log('');
  }

  /**
   * 生成报告
   */
  async generateReport() {
    console.log('📊 生成验证报告...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        testDirectories: this.testDirectories.length,
        testFiles: this.testFiles.length,
        issues: this.issues.length
      },
      testDirectories: this.testDirectories,
      testFiles: this.testFiles,
      issues: this.issues,
      recommendations: this.generateRecommendations()
    };

    // 保存报告
    const reportPath = './test-results/test-integration-validation-report.json';
    
    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ 验证报告已保存: ${reportPath}`);

    // 显示摘要
    console.log('\n📋 验证摘要:');
    console.log(`  测试目录: ${report.summary.testDirectories}`);
    console.log(`  测试文件: ${report.summary.testFiles}`);
    console.log(`  发现问题: ${report.summary.issues}`);

    if (this.issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.message}`);
        if (issue.details) {
          console.log(`     详情: ${JSON.stringify(issue.details, null, 2)}`);
        }
      });
    }

    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('\n💡 建议:');
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.testFiles.length === 0) {
      recommendations.push('项目中没有发现测试文件，建议添加单元测试');
    }

    if (!fs.existsSync('./test-integration-config.js')) {
      recommendations.push('建议创建统一的测试集成配置文件');
    }

    if (this.issues.some(issue => issue.type === 'missing_test_script')) {
      recommendations.push('补充缺少的测试脚本配置');
    }

    if (this.issues.some(issue => issue.type === 'orphaned_tests')) {
      recommendations.push('为孤立的测试目录添加相应的测试脚本配置');
    }

    return recommendations;
  }
}

// 运行验证
if (require.main === module) {
  const validator = new TestIntegrationValidator();
  validator.validate().catch(error => {
    console.error('验证器失败:', error);
    process.exit(1);
  });
}

module.exports = TestIntegrationValidator;
