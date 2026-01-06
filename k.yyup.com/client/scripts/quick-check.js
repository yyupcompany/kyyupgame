#!/usr/bin/env node

/**
 * 快速检查前端页面与测试用例开发完成度
 * 简化版本，只显示关键统计信息
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuickChecker {
  constructor() {
    this.srcDir = path.join(__dirname, '../src');
    this.testDir = path.join(__dirname, '../tests/unit');
  }

  async run() {
    console.log('🔍 快速检查前端开发完成度...\n');
    
    try {
      // 扫描源文件
      const sourceFiles = await this.scanSourceFiles();
      
      // 检查测试文件
      const testResults = await this.checkTestFiles(sourceFiles);
      
      // 显示结果
      this.displayResults(testResults);
      
    } catch (error) {
      console.error('❌ 检查过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  async scanSourceFiles() {
    const patterns = [
      'src/pages/**/*.vue',
      'src/views/**/*.vue',
      'src/components/**/*.vue'
    ];
    
    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: path.dirname(this.srcDir) });
      files.push(...matches);
    }
    
    return files.map(file => ({
      path: file,
      name: path.basename(file, '.vue'),
      type: file.includes('/pages/') || file.includes('/views/') ? 'page' : 'component',
      fullPath: path.join(path.dirname(this.srcDir), file)
    }));
  }

  async checkTestFiles(sourceFiles) {
    const results = {
      total: sourceFiles.length,
      tested: 0,
      untested: 0,
      pages: { total: 0, tested: 0 },
      components: { total: 0, tested: 0 },
      testedFiles: [],
      untestedFiles: []
    };

    for (const file of sourceFiles) {
      const hasTest = this.findTestFile(file);
      
      if (file.type === 'page') {
        results.pages.total++;
        if (hasTest) results.pages.tested++;
      } else {
        results.components.total++;
        if (hasTest) results.components.tested++;
      }

      if (hasTest) {
        results.tested++;
        results.testedFiles.push(file);
      } else {
        results.untested++;
        results.untestedFiles.push(file);
      }
    }

    return results;
  }

  findTestFile(file) {
    const relativePath = path.relative(this.srcDir, file.fullPath);
    const dirPath = path.dirname(relativePath);
    const fileName = file.name;
    
    const possiblePaths = [
      path.join(this.testDir, dirPath, `${fileName}.test.ts`),
      path.join(this.testDir, dirPath, `${fileName}.test.js`),
      path.join(this.testDir, 'pages', path.basename(dirPath), `${fileName}.test.ts`),
      path.join(this.testDir, 'components', path.basename(dirPath), `${fileName}.test.ts`)
    ];
    
    return possiblePaths.some(testPath => fs.existsSync(testPath));
  }

  displayResults(results) {
    const coverageRate = results.total > 0 ? Math.round((results.tested / results.total) * 100) : 0;
    const pagesCoverageRate = results.pages.total > 0 ? Math.round((results.pages.tested / results.pages.total) * 100) : 0;
    const componentsCoverageRate = results.components.total > 0 ? Math.round((results.components.tested / results.components.total) * 100) : 0;

    console.log('📊 快速统计结果');
    console.log('='.repeat(50));
    console.log(`📁 总文件数: ${results.total}`);
    console.log(`✅ 已测试: ${results.tested} (${coverageRate}%)`);
    console.log(`❌ 未测试: ${results.untested}`);
    console.log();
    
    console.log('📄 页面文件:');
    console.log(`   总数: ${results.pages.total}`);
    console.log(`   已测试: ${results.pages.tested} (${pagesCoverageRate}%)`);
    console.log();
    
    console.log('🧩 组件文件:');
    console.log(`   总数: ${results.components.total}`);
    console.log(`   已测试: ${results.components.tested} (${componentsCoverageRate}%)`);
    console.log();

    // 显示测试覆盖率进度条
    this.displayProgressBar('总体覆盖率', coverageRate);
    this.displayProgressBar('页面覆盖率', pagesCoverageRate);
    this.displayProgressBar('组件覆盖率', componentsCoverageRate);
    console.log();

    // 显示已测试的文件（前10个）
    if (results.testedFiles.length > 0) {
      console.log('✅ 已测试文件 (前10个):');
      results.testedFiles.slice(0, 10).forEach(file => {
        console.log(`   ${file.name} (${file.type})`);
      });
      if (results.testedFiles.length > 10) {
        console.log(`   ... 还有 ${results.testedFiles.length - 10} 个文件`);
      }
      console.log();
    }

    // 显示未测试的文件（前10个）
    if (results.untestedFiles.length > 0) {
      console.log('❌ 未测试文件 (前10个):');
      results.untestedFiles.slice(0, 10).forEach(file => {
        console.log(`   ${file.name} (${file.type})`);
      });
      if (results.untestedFiles.length > 10) {
        console.log(`   ... 还有 ${results.untestedFiles.length - 10} 个文件`);
      }
      console.log();
    }

    // 给出建议
    this.displayRecommendations(results, coverageRate);
  }

  displayProgressBar(label, percentage) {
    const barLength = 30;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    let color = '';
    if (percentage >= 80) color = '\x1b[32m'; // 绿色
    else if (percentage >= 50) color = '\x1b[33m'; // 黄色
    else color = '\x1b[31m'; // 红色
    
    console.log(`${label}: ${color}${bar}\x1b[0m ${percentage}%`);
  }

  displayRecommendations(results, coverageRate) {
    console.log('💡 建议:');
    console.log('='.repeat(50));
    
    if (coverageRate < 20) {
      console.log('🚨 测试覆盖率极低，建议：');
      console.log('   1. 优先为核心页面创建测试');
      console.log('   2. 为主要组件添加基础测试');
      console.log('   3. 建立测试编写规范');
    } else if (coverageRate < 50) {
      console.log('⚠️  测试覆盖率偏低，建议：');
      console.log('   1. 继续为重要功能添加测试');
      console.log('   2. 提升现有测试的质量');
      console.log('   3. 定期运行测试确保质量');
    } else if (coverageRate < 80) {
      console.log('👍 测试覆盖率良好，建议：');
      console.log('   1. 为剩余文件补充测试');
      console.log('   2. 增加边缘情况测试');
      console.log('   3. 优化测试性能');
    } else {
      console.log('🎉 测试覆盖率优秀！建议：');
      console.log('   1. 保持现有测试质量');
      console.log('   2. 持续优化测试效率');
      console.log('   3. 分享测试最佳实践');
    }
    
    console.log();
    console.log('📋 下一步行动:');
    console.log(`   运行完整检查: npm run check:completeness`);
    console.log(`   查看详细报告: test-results/development-completeness-report.html`);
  }
}

// 主程序入口
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new QuickChecker();
  checker.run().catch(console.error);
}

export default QuickChecker;
