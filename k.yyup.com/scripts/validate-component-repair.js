#!/usr/bin/env node

/**
 * UI组件修复验证脚本
 * 用于验证组件是否符合修复标准
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 配置选项
const config = {
  // 项目根目录
  projectRoot: path.resolve(__dirname, '..'),

  // 客户端源码目录
  srcDir: 'client/src',

  // 必需导入的样式文件
  requiredImports: [
    '@/styles/design-tokens.scss',
    '@/styles/list-components-optimization.scss'
  ],

  // 检查的文件模式
  filePatterns: [
    '**/*.vue'
  ],

  // 忽略的目录
  ignoreDirs: [
    'node_modules',
    '.git',
    'dist',
    'build'
  ]
};

// 验证结果统计
let stats = {
  totalFiles: 0,
  passedFiles: 0,
  failedFiles: 0,
  warnings: 0,
  errors: 0
};

/**
 * 验证样式导入
 */
function validateStyleImports(content, filePath) {
  const issues = [];

  for (const importPath of config.requiredImports) {
    if (!content.includes(importPath)) {
      issues.push({
        type: 'error',
        message: `缺少必需导入: ${importPath}`,
        file: filePath,
        line: findLineNumber(content, importPath) || 1
      });
    }
  }

  return issues;
}

/**
 * 验证设计令牌使用
 */
function validateDesignTokens(content, filePath) {
  const issues = [];

  // 硬编码颜色模式
  const hardcodedColors = [
    /#[0-9a-fA-F]{6}\b/g,  // #ffffff
    /#[0-9a-fA-F]{3}\b/g,  // #fff
    /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, // rgb(255, 255, 255)
    /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g // rgba(255, 255, 255, 0.5)
  ];

  // 硬编码尺寸模式
  const hardcodedSizes = [
    /\b\d+px\b/g,  // 16px
    /\b\d+rem\b/g, // 1rem
    /\b\d+em\b/g   // 1em
  ];

  // 检查硬编码颜色
  hardcodedColors.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      // 排除注释中的内容
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
          return;
        }
        const lineMatches = line.match(pattern);
        if (lineMatches) {
          issues.push({
            type: 'warning',
            message: `发现硬编码颜色值: ${lineMatches.join(', ')}`,
            file: filePath,
            line: index + 1
          });
        }
      });
    }
  });

  // 检查硬编码尺寸（在style标签中）
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    const styleContent = styleMatch[1];
    hardcodedSizes.forEach(pattern => {
      const matches = styleContent.match(pattern);
      if (matches) {
        issues.push({
          type: 'warning',
          message: `发现硬编码尺寸值: ${matches.join(', ')}`,
          file: filePath,
          line: findLineNumber(content, matches[0]) || 1
        });
      }
    });
  }

  return issues;
}

/**
 * 验证图标使用
 */
function validateIconUsage(content, filePath) {
  const issues = [];

  // 检查是否使用了Element Plus图标
  if (content.includes('@element-plus/icons-vue')) {
    issues.push({
      type: 'error',
      message: '使用了Element Plus图标，需要替换为UnifiedIcon',
      file: filePath,
      line: findLineNumber(content, '@element-plus/icons-vue') || 1
    });
  }

  // 检查UnifiedIcon使用是否正确
  if (content.includes('UnifiedIcon')) {
    // 检查是否有UnifiedIcon组件导入
    if (!content.includes("import UnifiedIcon") && !content.includes("components['UnifiedIcon']")) {
      issues.push({
        type: 'error',
        message: '使用了UnifiedIcon但未导入组件',
        file: filePath,
        line: findLineNumber(content, 'UnifiedIcon') || 1
      });
    }

    // 检查UnifiedIcon是否正确使用name属性
    const iconMatches = content.match(/<UnifiedIcon[^>]*>/g);
    if (iconMatches) {
      iconMatches.forEach(match => {
        if (!match.includes('name=')) {
          issues.push({
            type: 'error',
            message: 'UnifiedIcon缺少name属性',
            file: filePath,
            line: findLineNumber(content, match) || 1
          });
        }
      });
    }
  }

  return issues;
}

/**
 * 验证响应式设计
 */
function validateResponsiveDesign(content, filePath) {
  const issues = [];

  // 检查是否有媒体查询
  if (content.includes('@media')) {
    // 检查是否使用了设计令牌断点
    const mediaMatches = content.match(/@media[^{]*max-width[^}]*}/g);
    if (mediaMatches) {
      mediaMatches.forEach(match => {
        // 检查是否使用了硬编码断点
        if (match.match(/\b\d+px\b/)) {
          issues.push({
            type: 'warning',
            message: '媒体查询使用了硬编码断点，建议使用设计令牌',
            file: filePath,
            line: findLineNumber(content, match) || 1
          });
        }
      });
    }
  } else {
    // 对于可能需要响应式的组件给出提醒
    if (content.includes('el-table') || content.includes('table')) {
      issues.push({
        type: 'info',
        message: '包含表格组件，建议添加响应式设计',
        file: filePath,
        line: 1
      });
    }
  }

  return issues;
}

/**
 * 验证CSS类命名
 */
function validateCSSClassNaming(content, filePath) {
  const issues = [];

  // 检查style标签中的CSS类命名
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    const styleContent = styleMatch[1];

    // 检查是否有BEM命名规范
    const classMatches = styleContent.match(/\.[a-zA-Z][a-zA-Z0-9_-]*\s*{/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const className = match.replace(/[.{\s]/g, '');

        // 检查是否使用了合理的命名规范
        if (className.includes('_') && !className.includes('__') && !className.includes('--')) {
          issues.push({
            type: 'warning',
            message: `CSS类名建议使用BEM命名规范: ${className}`,
            file: filePath,
            line: findLineNumber(content, match) || 1
          });
        }
      });
    }
  }

  return issues;
}

/**
 * 查找行号
 */
function findLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return null;
}

/**
 * 验证单个文件
 */
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // 执行各项验证
    issues.push(...validateStyleImports(content, filePath));
    issues.push(...validateDesignTokens(content, filePath));
    issues.push(...validateIconUsage(content, filePath));
    issues.push(...validateResponsiveDesign(content, filePath));
    issues.push(...validateCSSClassNaming(content, filePath));

    // 统计结果
    const fileStats = {
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length
    };

    stats.errors += fileStats.errors;
    stats.warnings += fileStats.warnings;

    return {
      filePath,
      issues,
      stats: fileStats,
      passed: fileStats.errors === 0
    };
  } catch (error) {
    return {
      filePath,
      issues: [{
        type: 'error',
        message: `读取文件失败: ${error.message}`,
        file: filePath,
        line: 1
      }],
      stats: { errors: 1, warnings: 0, info: 0 },
      passed: false
    };
  }
}

/**
 * 递归查找文件
 */
function findFiles(dir, patterns, ignoreDirs = []) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 检查是否应该忽略
        if (ignoreDirs.includes(item)) {
          continue;
        }
        traverse(fullPath);
      } else if (stat.isFile()) {
        // 检查文件是否匹配模式
        const matches = patterns.some(pattern => {
          const regex = new RegExp(
            pattern
              .replace(/\*\*/g, '.*')
              .replace(/\*/g, '[^/]*')
              .replace(/\?/g, '[^/]')
          );
          return regex.test(fullPath);
        });

        if (matches) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * 生成报告
 */
function generateReport(results) {
  console.log('\n' + chalk.blue.bold('='.repeat(60)));
  console.log(chalk.blue.bold('           UI组件修复验证报告'));
  console.log(chalk.blue.bold('='.repeat(60)));

  // 总体统计
  console.log('\n' + chalk.yellow.bold('📊 总体统计:'));
  console.log(`  总文件数: ${stats.totalFiles}`);
  console.log(`  通过文件: ${chalk.green(stats.passedFiles)}`);
  console.log(`  失败文件: ${chalk.red(stats.failedFiles)}`);
  console.log(`  错误数量: ${chalk.red(stats.errors)}`);
  console.log(`  警告数量: ${chalk.yellow(stats.warnings)}`);

  // 详细结果
  console.log('\n' + chalk.yellow.bold('📋 详细结果:'));

  results.forEach(result => {
    const status = result.passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    const fileName = path.relative(process.cwd(), result.filePath);

    console.log(`\n${status} ${fileName}`);

    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        const icon = issue.type === 'error' ? '🔴' :
                    issue.type === 'warning' ? '🟡' : '🔵';
        const type = chalk.bold(issue.type.toUpperCase());
        const line = issue.line ? `:${issue.line}` : '';

        console.log(`   ${icon} [${type}] ${issue.message}${line}`);
      });
    }
  });

  // 修复建议
  if (stats.errors > 0 || stats.warnings > 0) {
    console.log('\n' + chalk.yellow.bold('💡 修复建议:'));

    if (stats.errors > 0) {
      console.log('\n🔴 错误修复:');
      console.log('  1. 添加必需的样式导入语句');
      console.log('  2. 替换Element Plus图标为UnifiedIcon');
      console.log('  3. 确保UnifiedIcon组件正确导入和使用');
    }

    if (stats.warnings > 0) {
      console.log('\n🟡 警告优化:');
      console.log('  1. 使用CSS变量替换硬编码颜色和尺寸');
      console.log('  2. 使用设计令牌断点替换硬编码断点');
      console.log('  3. 采用BEM命名规范命名CSS类');
    }
  }

  // 总结
  console.log('\n' + chalk.blue.bold('📝 总结:'));
  if (stats.errors === 0) {
    console.log(chalk.green('  ✅ 所有组件都通过了验证！'));
  } else {
    console.log(chalk.red(`  ❌ 发现 ${stats.errors} 个错误，需要修复`));
  }

  if (stats.warnings > 0) {
    console.log(chalk.yellow(`  ⚠️  发现 ${stats.warnings} 个警告，建议优化`));
  }

  console.log('\n' + chalk.blue.bold('='.repeat(60)));
}

/**
 * 主函数
 */
function main() {
  console.log(chalk.blue.bold('🔍 开始验证UI组件修复情况...'));

  const srcPath = path.join(config.projectRoot, config.srcDir);

  if (!fs.existsSync(srcPath)) {
    console.error(chalk.red(`❌ 源码目录不存在: ${srcPath}`));
    process.exit(1);
  }

  // 查找所有Vue文件
  const files = findFiles(srcPath, config.filePatterns, config.ignoreDirs);
  stats.totalFiles = files.length;

  if (files.length === 0) {
    console.log(chalk.yellow('⚠️  未找到任何Vue文件'));
    return;
  }

  console.log(chalk.blue(`📁 找到 ${files.length} 个Vue文件`));

  // 验证每个文件
  const results = files.map(filePath => {
    const result = validateFile(filePath);
    if (result.passed) {
      stats.passedFiles++;
    } else {
      stats.failedFiles++;
    }
    return result;
  });

  // 生成报告
  generateReport(results);

  // 设置退出码
  process.exit(stats.errors > 0 ? 1 : 0);
}

// 检查是否安装了chalk
try {
  require('chalk');
} catch (error) {
  console.error('❌ 请先安装依赖: npm install chalk');
  process.exit(1);
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  validateFile,
  validateStyleImports,
  validateDesignTokens,
  validateIconUsage,
  validateResponsiveDesign,
  validateCSSClassNaming
};