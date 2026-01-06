#!/usr/bin/env node

/**
 * 前端页面与测试用例开发完成度比对脚本
 * 
 * 功能：
 * 1. 扫描所有前端页面组件
 * 2. 检查对应的测试文件是否存在
 * 3. 分析测试覆盖率和完成度
 * 4. 生成详细的比对报告
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DevelopmentCompletenessChecker {
  constructor() {
    this.srcDir = path.join(__dirname, '../src');
    this.testDir = path.join(__dirname, '../tests/unit');
    this.results = {
      pages: [],
      components: [],
      summary: {
        totalFiles: 0,
        testedFiles: 0,
        untestedFiles: 0,
        completionRate: 0
      }
    };
  }

  /**
   * 主执行函数
   */
  async run() {
    console.log('🔍 开始检查前端页面与测试用例开发完成度...\n');
    
    try {
      // 扫描页面文件
      await this.scanPages();
      
      // 扫描组件文件
      await this.scanComponents();
      
      // 生成报告
      this.generateReport();
      
      // 保存结果到文件
      await this.saveResults();
      
      console.log('✅ 检查完成！报告已生成。');
      
    } catch (error) {
      console.error('❌ 检查过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 扫描页面文件
   */
  async scanPages() {
    console.log('📄 扫描页面文件...');
    
    const pagePatterns = [
      'src/pages/**/*.vue',
      'src/views/**/*.vue'
    ];
    
    for (const pattern of pagePatterns) {
      const files = await glob(pattern, { cwd: path.dirname(this.srcDir) });

      for (const file of files) {
        const fullPath = path.join(path.dirname(this.srcDir), file);
        const relativePath = path.relative(this.srcDir, fullPath);
        
        const pageInfo = await this.analyzeFile(fullPath, relativePath, 'page');
        this.results.pages.push(pageInfo);
      }
    }
  }

  /**
   * 扫描组件文件
   */
  async scanComponents() {
    console.log('🧩 扫描组件文件...');
    
    const componentPatterns = [
      'src/components/**/*.vue'
    ];
    
    for (const pattern of componentPatterns) {
      const files = await glob(pattern, { cwd: path.dirname(this.srcDir) });

      for (const file of files) {
        const fullPath = path.join(path.dirname(this.srcDir), file);
        const relativePath = path.relative(this.srcDir, fullPath);
        
        const componentInfo = await this.analyzeFile(fullPath, relativePath, 'component');
        this.results.components.push(componentInfo);
      }
    }
  }

  /**
   * 分析单个文件
   */
  async analyzeFile(filePath, relativePath, type) {
    const fileName = path.basename(filePath, '.vue');
    const dirPath = path.dirname(relativePath);
    
    // 查找对应的测试文件
    const possibleTestPaths = this.generateTestPaths(dirPath, fileName);
    const testFile = this.findTestFile(possibleTestPaths);
    
    // 分析源文件
    const sourceAnalysis = await this.analyzeSourceFile(filePath);
    
    // 分析测试文件（如果存在）
    let testAnalysis = null;
    if (testFile) {
      testAnalysis = await this.analyzeTestFile(testFile);
    }
    
    // 计算完成度
    const completeness = this.calculateCompleteness(sourceAnalysis, testAnalysis);
    
    return {
      type,
      name: fileName,
      path: relativePath,
      sourceFile: filePath,
      testFile,
      sourceAnalysis,
      testAnalysis,
      completeness,
      hasTest: !!testFile,
      issues: this.identifyIssues(sourceAnalysis, testAnalysis)
    };
  }

  /**
   * 生成可能的测试文件路径
   */
  generateTestPaths(dirPath, fileName) {
    const testPaths = [];
    
    // 直接对应路径
    testPaths.push(path.join(this.testDir, dirPath, `${fileName}.test.ts`));
    testPaths.push(path.join(this.testDir, dirPath, `${fileName}.test.js`));
    
    // 页面测试路径
    if (dirPath.includes('pages')) {
      testPaths.push(path.join(this.testDir, 'pages', path.basename(dirPath), `${fileName}.test.ts`));
    }
    
    // 组件测试路径
    if (dirPath.includes('components')) {
      testPaths.push(path.join(this.testDir, 'components', path.basename(dirPath), `${fileName}.test.ts`));
    }
    
    return testPaths;
  }

  /**
   * 查找测试文件
   */
  findTestFile(possiblePaths) {
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        return testPath;
      }
    }
    return null;
  }

  /**
   * 分析源文件
   */
  async analyzeSourceFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      return {
        exists: true,
        size: content.length,
        methods: this.extractMethods(content),
        computed: this.extractComputed(content),
        props: this.extractProps(content),
        emits: this.extractEmits(content),
        components: this.extractComponents(content),
        complexity: this.calculateComplexity(content)
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * 分析测试文件
   */
  async analyzeTestFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      return {
        exists: true,
        size: content.length,
        testCases: this.extractTestCases(content),
        describes: this.extractDescribes(content),
        mocks: this.extractMocks(content),
        coverage: this.estimateCoverage(content)
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * 提取方法
   */
  extractMethods(content) {
    const methodRegex = /(?:function\s+|const\s+\w+\s*=\s*(?:async\s+)?(?:function|\()|(\w+)\s*\([^)]*\)\s*{)/g;
    const methods = [];
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      if (match[1]) {
        methods.push(match[1]);
      }
    }
    
    return methods;
  }

  /**
   * 提取计算属性
   */
  extractComputed(content) {
    const computedRegex = /computed:\s*{([^}]+)}/s;
    const match = content.match(computedRegex);
    
    if (match) {
      const computedContent = match[1];
      const propRegex = /(\w+)\s*[:()]/g;
      const computed = [];
      let propMatch;
      
      while ((propMatch = propRegex.exec(computedContent)) !== null) {
        computed.push(propMatch[1]);
      }
      
      return computed;
    }
    
    return [];
  }

  /**
   * 提取属性
   */
  extractProps(content) {
    const propsRegex = /props:\s*(?:\[([^\]]+)\]|{([^}]+)})/s;
    const match = content.match(propsRegex);
    
    if (match) {
      if (match[1]) {
        // 数组形式
        return match[1].split(',').map(p => p.trim().replace(/['"]/g, ''));
      } else if (match[2]) {
        // 对象形式
        const propsContent = match[2];
        const propRegex = /(\w+)\s*:/g;
        const props = [];
        let propMatch;
        
        while ((propMatch = propRegex.exec(propsContent)) !== null) {
          props.push(propMatch[1]);
        }
        
        return props;
      }
    }
    
    return [];
  }

  /**
   * 提取事件
   */
  extractEmits(content) {
    const emitRegex = /\$emit\(['"]([^'"]+)['"]/g;
    const emits = [];
    let match;
    
    while ((match = emitRegex.exec(content)) !== null) {
      if (!emits.includes(match[1])) {
        emits.push(match[1]);
      }
    }
    
    return emits;
  }

  /**
   * 提取组件
   */
  extractComponents(content) {
    const componentRegex = /components:\s*{([^}]+)}/s;
    const match = content.match(componentRegex);
    
    if (match) {
      const componentsContent = match[1];
      const compRegex = /(\w+)/g;
      const components = [];
      let compMatch;
      
      while ((compMatch = compRegex.exec(componentsContent)) !== null) {
        components.push(compMatch[1]);
      }
      
      return components;
    }
    
    return [];
  }

  /**
   * 计算复杂度
   */
  calculateComplexity(content) {
    let complexity = 1; // 基础复杂度
    
    // 条件语句
    const conditions = (content.match(/if\s*\(|else\s+if\s*\(|switch\s*\(/g) || []).length;
    complexity += conditions;
    
    // 循环语句
    const loops = (content.match(/for\s*\(|while\s*\(|do\s*{/g) || []).length;
    complexity += loops;
    
    // 三元运算符
    const ternary = (content.match(/\?[^:]*:/g) || []).length;
    complexity += ternary;
    
    return complexity;
  }

  /**
   * 提取测试用例
   */
  extractTestCases(content) {
    const testRegex = /(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const testCases = [];
    let match;
    
    while ((match = testRegex.exec(content)) !== null) {
      testCases.push(match[1]);
    }
    
    return testCases;
  }

  /**
   * 提取describe块
   */
  extractDescribes(content) {
    const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const describes = [];
    let match;
    
    while ((match = describeRegex.exec(content)) !== null) {
      describes.push(match[1]);
    }
    
    return describes;
  }

  /**
   * 提取Mock
   */
  extractMocks(content) {
    const mockRegex = /(?:vi\.mock|jest\.mock|mock|stub)\s*\(/g;
    const mocks = (content.match(mockRegex) || []).length;
    
    return mocks;
  }

  /**
   * 估算覆盖率
   */
  estimateCoverage(content) {
    const testCaseCount = this.extractTestCases(content).length;
    const mockCount = this.extractMocks(content);
    
    // 简单的覆盖率估算
    let coverage = 0;
    if (testCaseCount > 0) coverage += 30;
    if (testCaseCount > 5) coverage += 20;
    if (testCaseCount > 10) coverage += 20;
    if (mockCount > 0) coverage += 15;
    if (content.includes('expect')) coverage += 15;
    
    return Math.min(coverage, 100);
  }

  /**
   * 计算完成度
   */
  calculateCompleteness(sourceAnalysis, testAnalysis) {
    if (!sourceAnalysis.exists) return 0;
    if (!testAnalysis || !testAnalysis.exists) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // 基础测试存在 (30分)
    if (testAnalysis.testCases.length > 0) score += 30;
    
    // 测试用例数量 (20分)
    const testCaseRatio = Math.min(testAnalysis.testCases.length / Math.max(sourceAnalysis.methods.length, 1), 1);
    score += testCaseRatio * 20;
    
    // Mock使用 (15分)
    if (testAnalysis.mocks > 0) score += 15;
    
    // 覆盖率估算 (20分)
    score += (testAnalysis.coverage / 100) * 20;
    
    // 复杂度匹配 (15分)
    const complexityRatio = Math.min(testAnalysis.testCases.length / sourceAnalysis.complexity, 1);
    score += complexityRatio * 15;
    
    return Math.round(score);
  }

  /**
   * 识别问题
   */
  identifyIssues(sourceAnalysis, testAnalysis) {
    const issues = [];
    
    if (!sourceAnalysis.exists) {
      issues.push('源文件不存在或无法读取');
      return issues;
    }
    
    if (!testAnalysis || !testAnalysis.exists) {
      issues.push('缺少测试文件');
      return issues;
    }
    
    if (testAnalysis.testCases.length === 0) {
      issues.push('没有测试用例');
    }
    
    if (sourceAnalysis.methods.length > 0 && testAnalysis.testCases.length < sourceAnalysis.methods.length) {
      issues.push(`方法测试覆盖不足 (${testAnalysis.testCases.length}/${sourceAnalysis.methods.length})`);
    }
    
    if (sourceAnalysis.complexity > 10 && testAnalysis.testCases.length < 5) {
      issues.push('复杂组件测试用例不足');
    }
    
    if (testAnalysis.mocks === 0 && sourceAnalysis.components.length > 0) {
      issues.push('可能需要Mock外部依赖');
    }
    
    return issues;
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 生成开发完成度报告...\n');

    const allFiles = [...this.results.pages, ...this.results.components];

    // 计算统计数据
    this.results.summary.totalFiles = allFiles.length;
    this.results.summary.testedFiles = allFiles.filter(f => f.hasTest).length;
    this.results.summary.untestedFiles = this.results.summary.totalFiles - this.results.summary.testedFiles;
    this.results.summary.completionRate = this.results.summary.totalFiles > 0
      ? Math.round((this.results.summary.testedFiles / this.results.summary.totalFiles) * 100)
      : 0;

    // 打印总体统计
    this.printSummary();

    // 打印详细信息
    this.printDetailedReport();

    // 打印问题汇总
    this.printIssuesSummary(allFiles);

    // 打印建议
    this.printRecommendations(allFiles);
  }

  /**
   * 打印总体统计
   */
  printSummary() {
    console.log('='.repeat(60));
    console.log('📈 总体统计');
    console.log('='.repeat(60));
    console.log(`总文件数: ${this.results.summary.totalFiles}`);
    console.log(`已测试文件: ${this.results.summary.testedFiles}`);
    console.log(`未测试文件: ${this.results.summary.untestedFiles}`);
    console.log(`测试覆盖率: ${this.results.summary.completionRate}%`);
    console.log();

    // 分类统计
    console.log('📄 页面文件统计:');
    const testedPages = this.results.pages.filter(p => p.hasTest).length;
    console.log(`  总数: ${this.results.pages.length}`);
    console.log(`  已测试: ${testedPages}`);
    console.log(`  覆盖率: ${this.results.pages.length > 0 ? Math.round((testedPages / this.results.pages.length) * 100) : 0}%`);
    console.log();

    console.log('🧩 组件文件统计:');
    const testedComponents = this.results.components.filter(c => c.hasTest).length;
    console.log(`  总数: ${this.results.components.length}`);
    console.log(`  已测试: ${testedComponents}`);
    console.log(`  覆盖率: ${this.results.components.length > 0 ? Math.round((testedComponents / this.results.components.length) * 100) : 0}%`);
    console.log();
  }

  /**
   * 打印详细报告
   */
  printDetailedReport() {
    console.log('='.repeat(60));
    console.log('📋 详细报告');
    console.log('='.repeat(60));

    // 高完成度文件
    const highCompleteness = [...this.results.pages, ...this.results.components]
      .filter(f => f.completeness >= 80)
      .sort((a, b) => b.completeness - a.completeness);

    if (highCompleteness.length > 0) {
      console.log('✅ 高完成度文件 (≥80%):');
      highCompleteness.forEach(file => {
        console.log(`  ${file.name} (${file.type}) - ${file.completeness}%`);
        if (file.testAnalysis) {
          console.log(`    测试用例: ${file.testAnalysis.testCases.length}个`);
        }
      });
      console.log();
    }

    // 中等完成度文件
    const mediumCompleteness = [...this.results.pages, ...this.results.components]
      .filter(f => f.completeness >= 50 && f.completeness < 80)
      .sort((a, b) => b.completeness - a.completeness);

    if (mediumCompleteness.length > 0) {
      console.log('⚠️  中等完成度文件 (50-79%):');
      mediumCompleteness.forEach(file => {
        console.log(`  ${file.name} (${file.type}) - ${file.completeness}%`);
        if (file.issues.length > 0) {
          console.log(`    问题: ${file.issues.join(', ')}`);
        }
      });
      console.log();
    }

    // 低完成度文件
    const lowCompleteness = [...this.results.pages, ...this.results.components]
      .filter(f => f.completeness < 50)
      .sort((a, b) => a.completeness - b.completeness);

    if (lowCompleteness.length > 0) {
      console.log('❌ 低完成度文件 (<50%):');
      lowCompleteness.forEach(file => {
        console.log(`  ${file.name} (${file.type}) - ${file.completeness}%`);
        console.log(`    路径: ${file.path}`);
        if (file.issues.length > 0) {
          console.log(`    问题: ${file.issues.join(', ')}`);
        }
      });
      console.log();
    }
  }

  /**
   * 打印问题汇总
   */
  printIssuesSummary(allFiles) {
    console.log('='.repeat(60));
    console.log('🚨 问题汇总');
    console.log('='.repeat(60));

    const issueStats = {};
    allFiles.forEach(file => {
      file.issues.forEach(issue => {
        issueStats[issue] = (issueStats[issue] || 0) + 1;
      });
    });

    const sortedIssues = Object.entries(issueStats)
      .sort((a, b) => b[1] - a[1]);

    if (sortedIssues.length > 0) {
      sortedIssues.forEach(([issue, count]) => {
        console.log(`  ${issue}: ${count}个文件`);
      });
    } else {
      console.log('  🎉 没有发现问题！');
    }
    console.log();
  }

  /**
   * 打印建议
   */
  printRecommendations(allFiles) {
    console.log('='.repeat(60));
    console.log('💡 改进建议');
    console.log('='.repeat(60));

    const untestedFiles = allFiles.filter(f => !f.hasTest);
    const lowCoverageFiles = allFiles.filter(f => f.hasTest && f.completeness < 50);

    if (untestedFiles.length > 0) {
      console.log('1. 优先为以下文件创建测试:');
      untestedFiles.slice(0, 5).forEach(file => {
        console.log(`   - ${file.name} (${file.type})`);
      });
      if (untestedFiles.length > 5) {
        console.log(`   ... 还有 ${untestedFiles.length - 5} 个文件`);
      }
      console.log();
    }

    if (lowCoverageFiles.length > 0) {
      console.log('2. 改进以下文件的测试覆盖率:');
      lowCoverageFiles.slice(0, 5).forEach(file => {
        console.log(`   - ${file.name}: 当前${file.completeness}%`);
      });
      console.log();
    }

    console.log('3. 通用建议:');
    console.log('   - 为复杂组件增加更多测试用例');
    console.log('   - 使用Mock来隔离外部依赖');
    console.log('   - 测试边缘情况和错误处理');
    console.log('   - 定期运行测试确保代码质量');
    console.log();
  }

  /**
   * 保存结果到文件
   */
  async saveResults() {
    const reportPath = path.join(__dirname, '../test-results/development-completeness-report.json');
    const htmlReportPath = path.join(__dirname, '../test-results/development-completeness-report.html');

    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 保存JSON报告
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 JSON报告已保存: ${reportPath}`);

    // 生成HTML报告
    const htmlContent = this.generateHtmlReport();
    fs.writeFileSync(htmlReportPath, htmlContent);
    console.log(`🌐 HTML报告已保存: ${htmlReportPath}`);
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport() {
    const allFiles = [...this.results.pages, ...this.results.components];

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>前端开发完成度报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #ffc107, #dc3545); transition: width 0.3s; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .status-high { color: #28a745; font-weight: bold; }
        .status-medium { color: #ffc107; font-weight: bold; }
        .status-low { color: #dc3545; font-weight: bold; }
        .issues { font-size: 0.9em; color: #666; }
        .type-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .type-page { background: #e3f2fd; color: #1976d2; }
        .type-component { background: #f3e5f5; color: #7b1fa2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 前端开发完成度报告</h1>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.totalFiles}</div>
                <div class="stat-label">总文件数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.testedFiles}</div>
                <div class="stat-label">已测试文件</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.completionRate}%</div>
                <div class="stat-label">测试覆盖率</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.results.summary.completionRate}%"></div>
                </div>
            </div>
        </div>

        <h2>📋 详细列表</h2>
        <table>
            <thead>
                <tr>
                    <th>文件名</th>
                    <th>类型</th>
                    <th>完成度</th>
                    <th>测试用例数</th>
                    <th>问题</th>
                </tr>
            </thead>
            <tbody>
                ${allFiles.map(file => `
                    <tr>
                        <td>${file.name}</td>
                        <td><span class="type-badge type-${file.type}">${file.type === 'page' ? '页面' : '组件'}</span></td>
                        <td class="${file.completeness >= 80 ? 'status-high' : file.completeness >= 50 ? 'status-medium' : 'status-low'}">${file.completeness}%</td>
                        <td>${file.testAnalysis ? file.testAnalysis.testCases.length : 0}</td>
                        <td class="issues">${file.issues.join(', ') || '无'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <p style="text-align: center; color: #666; margin-top: 30px;">
            报告生成时间: ${new Date().toLocaleString('zh-CN')}
        </p>
    </div>
</body>
</html>`;
  }
}

// 主程序入口
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new DevelopmentCompletenessChecker();
  checker.run().catch(console.error);
}

export default DevelopmentCompletenessChecker;
