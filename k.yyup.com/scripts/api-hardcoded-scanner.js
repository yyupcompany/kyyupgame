#!/usr/bin/env node

/**
 * API硬编码扫描工具
 * 用于检测前端代码中的硬编码API调用，确保使用统一的端点配置
 */

const fs = require('fs');
const path = require('path');

class APIHardcodedScanner {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.excludeDirs = options.excludeDirs || [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.vscode',
      'scripts',
      'coverage',
      'server',
      'test',
      'tests'
    ];

    // 需要扫描的文件扩展名
    this.scanExtensions = options.scanExtensions || ['.vue', '.js', '.ts', '.jsx', '.tsx'];

    // 硬编码API模式
    this.hardcodedPatterns = [
      // REST API模式
      /['"`]\/api\/[a-zA-Z0-9\-\/\{\}]*['"`]/g,
      // Fetch/axios调用中的API
      /(?:fetch|axios|request|get|post|put|delete|patch)\s*\(\s*['"`]\/api\/[a-zA-Z0-9\-\/\{\}]*['"`]/g,
      // import中的API路径
      /import.*from\s+['"`]\/api\/[a-zA-Z0-9\-\/\{\}]*['"`]/g,
      // 模板字符串中的API
      /`\/api\/[a-zA-Z0-9\-\/\{\}]*`/g
    ];

    // 合法的端点导入模式（排除误报）
    this.excludePatterns = [
      /import.*from\s+['"`]@\/api\/endpoints\/['"`]/,
      /import.*from\s+['"`]@\/api\/modules\/['"`]/,
      /ENDPOINTS\s*=\s*{[\s\S]*?}/
    ];

    this.results = {
      totalFiles: 0,
      scannedFiles: 0,
      issues: [],
      summary: {
        byFile: {},
        byType: {
          'rest-api': 0,
          'fetch-call': 0,
          'import': 0,
          'template-string': 0
        }
      }
    };
  }

  /**
   * 执行扫描
   */
  async scan() {
    console.log('🔍 开始扫描前端硬编码API...\n');
    console.log(`📁 扫描目录: ${this.rootDir}`);
    console.log(`🚫 排除目录: ${this.excludeDirs.join(', ')}\n`);

    // 递归扫描所有文件
    await this.scanDirectory(this.rootDir);

    // 生成报告
    this.generateReport();
  }

  /**
   * 递归扫描目录
   */
  async scanDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // 跳过排除的目录
          if (this.excludeDirs.some(exclude => fullPath.includes(exclude))) {
            continue;
          }
          // 递归扫描子目录
          await this.scanDirectory(fullPath);
        } else if (entry.isFile()) {
          // 扫描文件
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  跳过目录 ${dir}: ${error.message}`);
    }
  }

  /**
   * 扫描单个文件
   */
  async scanFile(filePath) {
    // 只扫描指定扩展名的文件
    const ext = path.extname(filePath);
    if (!this.scanExtensions.includes(ext)) {
      return;
    }

    this.results.totalFiles++;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.results.scannedFiles++;

      // 检查是否应该排除此文件
      const shouldExclude = this.excludePatterns.some(pattern =>
        pattern.test(content)
      );

      if (shouldExclude) {
        return;
      }

      // 扫描硬编码API
      this.scanHardcodedAPIs(filePath, content);

    } catch (error) {
      console.warn(`⚠️  扫描文件失败 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 扫描硬编码API调用
   */
  scanHardcodedAPIs(filePath, content) {
    const lines = content.split('\n');
    const fileIssues = [];

    lines.forEach((line, index) => {
      // 检查各种硬编码模式
      this.hardcodedPatterns.forEach((pattern, patternIndex) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // 进一步过滤，避免误报
            if (this.isValidHardcodedAPI(match, content)) {
              const issue = {
                line: index + 1,
                content: line.trim(),
                match: match,
                type: this.getIssueType(patternIndex),
                severity: this.getSeverity(match),
                suggestion: this.getSuggestion(match)
              };

              fileIssues.push(issue);
              this.results.summary.byType[issue.type]++;
            }
          });
        }
      });
    });

    if (fileIssues.length > 0) {
      this.results.issues.push({
        file: path.relative(this.rootDir, filePath),
        issues: fileIssues
      });

      this.results.summary.byFile[path.relative(this.rootDir, filePath)] = fileIssues.length;
    }
  }

  /**
   * 验证是否为有效的硬编码API
   */
  isValidHardcodedAPI(match, content) {
    // 排除注释中的API
    const lineWithMatch = content.split('\n').find(line => line.includes(match));
    if (lineWithMatch && lineWithMatch.trim().startsWith('//')) {
      return false;
    }

    // 排除已经使用端点常量的情况
    const endpointsPattern = /ENDPOINTS\.[A-Z_]+/;
    if (lineWithMatch && endpointsPattern.test(lineWithMatch)) {
      return false;
    }

    // 确保是API路径
    return match.includes('/api/');
  }

  /**
   * 获取问题类型
   */
  getIssueType(patternIndex) {
    const types = ['rest-api', 'fetch-call', 'import', 'template-string'];
    return types[patternIndex] || 'unknown';
  }

  /**
   * 获取严重程度
   */
  getSeverity(match) {
    // 确定严重程度
    if (match.includes('fetch') || match.includes('axios')) {
      return 'high';
    } else if (match.includes('import')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 获取修复建议
   */
  getSuggestion(match) {
    const apiPath = match.replace(/['"`]/g, '');

    // 尝试提供具体的端点建议
    if (apiPath.includes('/auth/')) {
      return '使用 AUTH_ENDPOINTS 常量替换';
    } else if (apiPath.includes('/marketing/')) {
      return '使用 MARKETING_ENDPOINTS 常量替换';
    } else if (apiPath.includes('/activities/')) {
      return '使用 ACTIVITY_ENDPOINTS 常量替换';
    } else if (apiPath.includes('/users/')) {
      return '使用 USER_ENDPOINTS 常量替换';
    } else {
      return '使用相应的端点常量替换';
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 扫描结果统计:');
    console.log(`总文件数: ${this.results.totalFiles}`);
    console.log(`已扫描文件: ${this.results.scannedFiles}`);
    console.log(`发现问题文件: ${this.results.issues.length}`);
    console.log(`总问题数: ${this.results.issues.reduce((sum, file) => sum + file.issues.length, 0)}\n`);

    // 按类型统计
    console.log('📈 问题类型分布:');
    Object.entries(this.results.summary.byType).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`  ${type}: ${count}`);
      }
    });

    // 详细问题列表
    if (this.results.issues.length > 0) {
      console.log('\n🚨 发现的硬编码API问题:');

      this.results.issues.forEach(fileResult => {
        console.log(`\n📄 ${fileResult.file} (${fileResult.issues.length} 个问题)`);

        fileResult.issues.forEach(issue => {
          const severityIcon = this.getSeverityIcon(issue.severity);
          console.log(`  ${severityIcon} 行 ${issue.line}: ${issue.match}`);
          console.log(`    💡 建议: ${issue.suggestion}`);
          console.log(`    📝 代码: ${issue.content.substring(0, 100)}${issue.content.length > 100 ? '...' : ''}`);
        });
      });

      // 生成修复建议
      this.generateFixSuggestions();
    } else {
      console.log('\n✅ 未发现硬编码API问题！');
    }

    // 保存详细报告
    this.saveDetailedReport();
  }

  /**
   * 获取严重程度图标
   */
  getSeverityIcon(severity) {
    const icons = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    return icons[severity] || '⚪';
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions() {
    console.log('\n🔧 自动修复建议:');

    const suggestions = [
      '1. 将硬编码的API路径替换为对应的端点常量',
      '2. 在组件顶部导入正确的端点配置',
      '3. 使用统一的request工具而不是直接的fetch调用',
      '4. 确保所有API调用都经过错误处理',
      '5. 考虑使用TypeScript类型检查提高代码质量'
    ];

    suggestions.forEach(suggestion => {
      console.log(`  ${suggestion}`);
    });

    console.log('\n📚 参考文档:');
    console.log('  API端点配置: client/src/api/endpoints/');
    console.log('  请求工具: client/src/utils/request.ts');
    console.log('  TypeScript类型: client/src/api/types/');
  }

  /**
   * 保存详细报告
   */
  saveDetailedReport() {
    const reportPath = path.join(this.rootDir, 'api-hardcoded-scan-report.json');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.results.totalFiles,
        scannedFiles: this.results.scannedFiles,
        issueFiles: this.results.issues.length,
        totalIssues: this.results.issues.reduce((sum, file) => sum + file.issues.length, 0)
      },
      issuesByType: this.results.summary.byType,
      details: this.results.issues
    };

    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 详细报告已保存: ${reportPath}`);
    } catch (error) {
      console.warn(`⚠️  保存报告失败: ${error.message}`);
    }
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    rootDir: args[0] || path.join(__dirname, '../client'),
    excludeDirs: ['node_modules', 'dist', 'build', '.git', '.vscode', 'scripts', 'coverage', 'server', 'test', 'tests']
  };

  const scanner = new APIHardcodedScanner(options);
  scanner.scan().catch(error => {
    console.error('❌ 扫描失败:', error);
    process.exit(1);
  });
}

module.exports = APIHardcodedScanner;