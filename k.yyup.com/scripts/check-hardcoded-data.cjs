#!/usr/bin/env node

/**
 * 后端硬编码数据检测脚本
 * 
 * 功能：
 * 1. 扫描所有后端控制器文件
 * 2. 检测返回硬编码数据而不是从数据库查询的情况
 * 3. 生成详细的检测报告
 * 
 * 使用方法：
 * node scripts/check-hardcoded-data.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  controllersDir: path.join(__dirname, '../server/src/controllers'),
  outputFile: path.join(__dirname, '../server/hardcoded-data-report.md'),
  excludeFiles: ['index.ts', 'base.controller.ts'],
};

// 检测模式
const PATTERNS = {
  // Mock 数据声明
  mockDeclaration: /const\s+(mock\w+|.*Data|.*List|.*Templates)\s*=\s*\[/gi,
  
  // 直接返回数组字面量
  directArrayReturn: /ApiResponse\.(success|ok)\(res,\s*\[[\s\S]*?\{/g,
  
  // Mock 相关注释
  mockComment: /\/\/.*?(mock|硬编码|临时数据|测试数据|假数据)/gi,
  
  // 数据库查询
  dbQuery: /(await\s+\w+\.(findAll|findOne|findByPk|findAndCountAll|create|update|destroy|count|query))/gi,
  
  // Sequelize 导入
  sequelizeImport: /from\s+['"]\.\.\/models/g,
};

// 严重程度
const SEVERITY = {
  HIGH: '🔴 高',
  MEDIUM: '🟡 中',
  LOW: '🟢 低',
};

class HardcodedDataChecker {
  constructor() {
    this.results = [];
    this.stats = {
      totalFiles: 0,
      scannedFiles: 0,
      issuesFound: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
    };
  }

  /**
   * 扫描所有控制器文件
   */
  async scanControllers() {
    console.log('🔍 开始扫描后端控制器文件...\n');
    
    const files = fs.readdirSync(CONFIG.controllersDir);
    this.stats.totalFiles = files.length;

    for (const file of files) {
      if (!file.endsWith('.ts') || CONFIG.excludeFiles.includes(file)) {
        continue;
      }

      const filePath = path.join(CONFIG.controllersDir, file);
      await this.scanFile(filePath, file);
      this.stats.scannedFiles++;
    }

    console.log(`\n✅ 扫描完成！共扫描 ${this.stats.scannedFiles} 个文件\n`);
  }

  /**
   * 扫描单个文件
   */
  async scanFile(filePath, fileName) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    console.log(`📄 扫描: ${fileName}`);

    // 检测 Mock 数据声明
    const mockDeclarations = this.findMockDeclarations(content, lines, fileName);
    
    // 检测直接返回数组
    const directReturns = this.findDirectArrayReturns(content, lines, fileName);
    
    // 检测 Mock 注释
    const mockComments = this.findMockComments(content, lines, fileName);

    // 分析严重程度
    const hasDbQuery = PATTERNS.dbQuery.test(content);
    const hasSequelizeImport = PATTERNS.sequelizeImport.test(content);

    // 合并所有检测结果
    const allIssues = [...mockDeclarations, ...directReturns, ...mockComments];

    if (allIssues.length > 0) {
      allIssues.forEach(issue => {
        issue.severity = this.determineSeverity(issue, hasDbQuery, hasSequelizeImport);
        this.updateStats(issue.severity);
      });

      this.results.push({
        file: fileName,
        filePath,
        hasDbQuery,
        hasSequelizeImport,
        issues: allIssues,
      });

      console.log(`  ⚠️  发现 ${allIssues.length} 个问题`);
    } else {
      console.log(`  ✅ 未发现问题`);
    }
  }

  /**
   * 查找 Mock 数据声明
   */
  findMockDeclarations(content, lines, fileName) {
    const issues = [];
    const regex = new RegExp(PATTERNS.mockDeclaration.source, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const variableName = match[1];
      
      // 获取完整的数据声明（尝试找到对应的结束括号）
      const startIndex = match.index;
      let endIndex = startIndex;
      let bracketCount = 1;
      let inString = false;
      let stringChar = '';
      
      for (let i = startIndex + match[0].length; i < content.length && bracketCount > 0; i++) {
        const char = content[i];
        
        if (!inString) {
          if (char === '"' || char === "'" || char === '`') {
            inString = true;
            stringChar = char;
          } else if (char === '[') {
            bracketCount++;
          } else if (char === ']') {
            bracketCount--;
            if (bracketCount === 0) {
              endIndex = i;
              break;
            }
          }
        } else {
          if (char === stringChar && content[i - 1] !== '\\') {
            inString = false;
          }
        }
      }

      const dataSnippet = content.substring(startIndex, Math.min(endIndex + 1, startIndex + 200));
      const dataSize = this.estimateDataSize(content.substring(startIndex, endIndex + 1));

      issues.push({
        type: 'Mock数据声明',
        lineNumber,
        variableName,
        snippet: dataSnippet + (endIndex - startIndex > 200 ? '...' : ''),
        dataSize,
      });
    }

    return issues;
  }

  /**
   * 查找直接返回数组的情况
   */
  findDirectArrayReturns(content, lines, fileName) {
    const issues = [];
    const regex = new RegExp(PATTERNS.directArrayReturn.source, 'g');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const snippet = match[0].substring(0, 150) + '...';

      issues.push({
        type: '直接返回数组',
        lineNumber,
        snippet,
      });
    }

    return issues;
  }

  /**
   * 查找 Mock 相关注释
   */
  findMockComments(content, lines, fileName) {
    const issues = [];
    const regex = new RegExp(PATTERNS.mockComment.source, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const comment = match[0].trim();

      issues.push({
        type: 'Mock注释',
        lineNumber,
        comment,
      });
    }

    return issues;
  }

  /**
   * 估算数据大小
   */
  estimateDataSize(dataString) {
    const objectCount = (dataString.match(/\{/g) || []).length;
    return objectCount > 1 ? `约 ${objectCount} 个对象` : '1个对象';
  }

  /**
   * 判断严重程度
   */
  determineSeverity(issue, hasDbQuery, hasSequelizeImport) {
    // 如果只是注释，严重程度低
    if (issue.type === 'Mock注释') {
      return SEVERITY.LOW;
    }

    // 如果有数据库查询，可能是降级或默认值，严重程度中
    if (hasDbQuery || hasSequelizeImport) {
      return SEVERITY.MEDIUM;
    }

    // 如果没有数据库查询，直接返回硬编码数据，严重程度高
    if (issue.type === 'Mock数据声明' && issue.dataSize && issue.dataSize.includes('个对象')) {
      const count = parseInt(issue.dataSize);
      if (count > 3) {
        return SEVERITY.HIGH;
      }
    }

    return SEVERITY.MEDIUM;
  }

  /**
   * 更新统计
   */
  updateStats(severity) {
    this.stats.issuesFound++;
    if (severity === SEVERITY.HIGH) this.stats.highSeverity++;
    else if (severity === SEVERITY.MEDIUM) this.stats.mediumSeverity++;
    else if (severity === SEVERITY.LOW) this.stats.lowSeverity++;
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📝 生成报告...\n');

    let report = '# 后端硬编码数据检测报告\n\n';
    report += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
    report += '## 📊 统计概览\n\n';
    report += `- 总文件数: ${this.stats.totalFiles}\n`;
    report += `- 扫描文件数: ${this.stats.scannedFiles}\n`;
    report += `- 发现问题: ${this.stats.issuesFound}\n`;
    report += `- 高严重程度: ${this.stats.highSeverity}\n`;
    report += `- 中严重程度: ${this.stats.mediumSeverity}\n`;
    report += `- 低严重程度: ${this.stats.lowSeverity}\n\n`;

    if (this.results.length === 0) {
      report += '## ✅ 未发现硬编码数据问题\n\n';
      report += '所有控制器都正确使用数据库查询返回数据。\n';
    } else {
      report += '## 🔍 详细问题列表\n\n';

      // 按严重程度排序
      const sortedResults = this.results.sort((a, b) => {
        const maxSeverityA = Math.max(...a.issues.map(i => this.severityToNumber(i.severity)));
        const maxSeverityB = Math.max(...b.issues.map(i => this.severityToNumber(i.severity)));
        return maxSeverityB - maxSeverityA;
      });

      sortedResults.forEach((result, index) => {
        report += `### ${index + 1}. ${result.file}\n\n`;
        report += `**文件路径**: \`${result.filePath}\`\n\n`;
        report += `**数据库查询**: ${result.hasDbQuery ? '✅ 有' : '❌ 无'}\n\n`;
        report += `**Sequelize导入**: ${result.hasSequelizeImport ? '✅ 有' : '❌ 无'}\n\n`;
        report += `**问题数量**: ${result.issues.length}\n\n`;

        result.issues.forEach((issue, issueIndex) => {
          report += `#### 问题 ${issueIndex + 1}: ${issue.type}\n\n`;
          report += `- **严重程度**: ${issue.severity}\n`;
          report += `- **行号**: ${issue.lineNumber}\n`;
          
          if (issue.variableName) {
            report += `- **变量名**: \`${issue.variableName}\`\n`;
          }
          
          if (issue.dataSize) {
            report += `- **数据规模**: ${issue.dataSize}\n`;
          }
          
          if (issue.comment) {
            report += `- **注释**: ${issue.comment}\n`;
          }
          
          if (issue.snippet) {
            report += `\n**代码片段**:\n\n\`\`\`typescript\n${issue.snippet}\n\`\`\`\n\n`;
          }
        });

        report += '---\n\n';
      });
    }

    report += '## 💡 建议\n\n';
    report += '1. **高严重程度**: 应立即修复，将硬编码数据改为从数据库查询\n';
    report += '2. **中严重程度**: 检查是否为合理的降级或默认值，如果不是应修复\n';
    report += '3. **低严重程度**: 可能是配置或枚举值，需要人工判断是否需要修复\n\n';

    fs.writeFileSync(CONFIG.outputFile, report, 'utf-8');
    console.log(`✅ 报告已生成: ${CONFIG.outputFile}\n`);
  }

  /**
   * 严重程度转数字（用于排序）
   */
  severityToNumber(severity) {
    if (severity === SEVERITY.HIGH) return 3;
    if (severity === SEVERITY.MEDIUM) return 2;
    if (severity === SEVERITY.LOW) return 1;
    return 0;
  }

  /**
   * 运行检测
   */
  async run() {
    console.log('🚀 后端硬编码数据检测工具\n');
    console.log('=' .repeat(50) + '\n');

    await this.scanControllers();
    this.generateReport();

    console.log('=' .repeat(50));
    console.log('\n📊 检测完成！\n');
    console.log(`总问题数: ${this.stats.issuesFound}`);
    console.log(`  - 🔴 高严重程度: ${this.stats.highSeverity}`);
    console.log(`  - 🟡 中严重程度: ${this.stats.mediumSeverity}`);
    console.log(`  - 🟢 低严重程度: ${this.stats.lowSeverity}\n`);
  }
}

// 运行检测
const checker = new HardcodedDataChecker();
checker.run().catch(console.error);

