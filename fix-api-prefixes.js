#!/usr/bin/env node

/**
 * 批量修复前端 API 调用缺少 /api 前缀的问题
 *
 * 使用方法:
 * node fix-api-prefixes.js --dry-run  # 预览模式，只生成报告不修改文件
 * node fix-api-prefixes.js --fix      # 执行修复
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 使用 bash find 命令查找文件
function findFiles(dir, extensions) {
  try {
    const extPattern = extensions.map(ext => `-name "${ext}"`).join(' -o ');
    const cmd = `find "${dir}" -type f \\( ${extPattern} \\) ! -name "*.old"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('查找文件失败:', error.message);
    return [];
  }
}

// 配置
const CONFIG = {
  srcDir: '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src',
  // 需要添加 /api 前缀的端点模式
  patterns: [
    // 中心类端点
    { pattern: /(['"`])\/(activity-center|teaching-center)\//g, replacement: "$1/api/$2/" },
    { pattern: /(['"`])\/(activity-center|teaching-center)['"`]/g, replacement: "$1/api/$2" },

    // 营销相关
    { pattern: /(['"`])\/marketing\//g, replacement: "$1/api/marketing/" },

    // 资源端点（复数形式）
    { pattern: /(['"`])\/activities['"`]?/g, replacement: "$1/api/activities" },
    { pattern: /(['"`])\/activities\//g, replacement: "$1/api/activities/" },
    { pattern: /(['"`])\/classes['"`]?/g, replacement: "$1/api/classes" },
    { pattern: /(['"`])\/classes\//g, replacement: "$1/api/classes/" },
    { pattern: /(['"`])\/statistics['"`]?/g, replacement: "$1/api/statistics" },
    { pattern: /(['"`])\/statistics\//g, replacement: "$1/api/statistics/" },
    { pattern: /(['"`])\/users['"`]?/g, replacement: "$1/api/users" },
    { pattern: /(['"`])\/users\//g, replacement: "$1/api/users/" },
    { pattern: /(['"`])\/roles['"`]?/g, replacement: "$1/api/roles" },
    { pattern: /(['"`])\/roles\//g, replacement: "$1/api/roles/" },
    { pattern: /(['"`])\/script-templates['"`]?/g, replacement: "$1/api/script-templates" },
    { pattern: /(['"`])\/script-templates\//g, replacement: "$1/api/script-templates/" },
  ],

  // 不应该修复的上下文（排除这些模式）
  excludePatterns: [
    // 路由相关
    /router\.(push|replace|go)/,
    /path:\s*['"`]\/(?!api)/,
    /redirect:\s*['"`]\/(?!api)/,
    /to=['"`]\/(?!api)/,
    /index=['"`]\/(?!api)/,

    // 外部 URL
    /https?:\/\//,
    /\/\/[^/]/,

    // 静态资源
    /\/assets\//,
    /\/images\//,
    /\/icons\//,

    // 已经有 /api 前缀
    /\/api\//,
  ],

  // 只在特定的函数调用中修复
  validContexts: [
    'request.get',
    'request.post',
    'request.put',
    'request.delete',
    'request.patch',
    'request.del',
    'axios.get',
    'axios.post',
    'axios.put',
    'axios.delete',
    'axios.patch',
    'fetch(',
    'cachedGet',
    'cachedPost',
    'api.get',
    'api.post',
    'api.put',
    'api.delete',
  ],
};

// 统计数据
const stats = {
  totalFiles: 0,
  filesWithIssues: 0,
  totalIssues: 0,
  filesToFix: [],
  issuesByPattern: {},
  skippedFiles: [],
};

/**
 * 检查字符串是否应该被排除
 */
function shouldExclude(line, patterns) {
  for (const pattern of patterns) {
    if (pattern.test(line)) {
      return true;
    }
  }
  return false;
}

/**
 * 检查是否在有效的 API 调用上下文中
 */
function isValidContext(content, matchIndex) {
  // 向前查找最近的函数调用
  const before = content.substring(0, matchIndex);
  const lines = before.split('\n');
  const lastLine = lines[lines.length - 1];

  // 检查是否包含有效的上下文关键字
  for (const context of CONFIG.validContexts) {
    if (lastLine.includes(context)) {
      return true;
    }
  }

  return false;
}

/**
 * 扫描文件中的问题
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, lineIndex) => {
    // 先检查是否应该排除这一行
    if (shouldExclude(line, CONFIG.excludePatterns)) {
      return;
    }

    // 检查每个模式
    CONFIG.patterns.forEach((patternObj, patternIndex) => {
      const matches = line.matchAll(patternObj.pattern);

      for (const match of matches) {
        const issue = {
          line: lineIndex + 1,
          column: match.index + 1,
          match: match[0],
          pattern: patternIndex,
          suggestion: match[0].replace(patternObj.pattern, patternObj.replacement),
        };

        issues.push(issue);
      }
    });
  });

  return issues;
}

/**
 * 修复文件中的问题
 */
function fixFile(filePath, issues) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // 按行号倒序处理，避免位置偏移
  const sortedIssues = [...issues].sort((a, b) => b.line - a.line);

  const lines = content.split('\n');

  sortedIssues.forEach((issue) => {
    const lineIndex = issue.line - 1;
    const patternObj = CONFIG.patterns[issue.pattern];

    if (patternObj) {
      const newLine = lines[lineIndex].replace(
        patternObj.pattern,
        patternObj.replacement
      );

      if (newLine !== lines[lineIndex]) {
        lines[lineIndex] = newLine;
        modified = true;
      }
    }
  });

  if (modified) {
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
}

/**
 * 生成报告
 */
function generateReport() {
  const reportPath = '/persistent/home/zhgue/kyyupgame/api-prefix-fix-report.md';

  let report = `# API 前缀修复报告

生成时间: ${new Date().toLocaleString('zh-CN')}
扫描目录: ${CONFIG.srcDir}

## 统计摘要

- **总文件数**: ${stats.totalFiles}
- **包含问题的文件数**: ${stats.filesWithIssues}
- **总问题数**: ${stats.totalIssues}
- **已修复文件数**: ${stats.filesToFix.length}
- **跳过的文件数**: ${stats.skippedFiles.length}

## 修复模式统计

`;

  // 按模式统计
  const patternStats = {};
  stats.filesToFix.forEach((file) => {
    file.issues.forEach((issue) => {
      const patternName = `Pattern ${issue.pattern}`;
      if (!patternStats[patternName]) {
        patternStats[patternName] = 0;
      }
      patternStats[patternName]++;
    });
  });

  Object.entries(patternStats).forEach(([name, count]) => {
    report += `- **${name}**: ${count} 个问题\n`;
  });

  report += `\n## 需要修复的文件列表\n\n`;

  // 按文件分组
  stats.filesToFix.forEach((file, index) => {
    report += `### ${index + 1}. ${file.path}\n\n`;
    report += `**问题数量**: ${file.issues.length}\n\n`;
    report += `| 行号 | 列号 | 原内容 | 修复后 |\n`;
    report += `|------|------|--------|--------|\n`;

    file.issues.forEach((issue) => {
      report += `| ${issue.line} | ${issue.column} | \`${issue.match}\` | \`${issue.suggestion}\` |\n`;
    });

    report += `\n`;
  });

  if (stats.skippedFiles.length > 0) {
    report += `## 跳过的文件\n\n`;
    stats.skippedFiles.forEach((file) => {
      report += `- ${file}\n`;
    });
    report += `\n`;
  }

  report += `## 修复说明\n\n`;
  report += `### 修复的端点类型\n\n`;
  report += `1. **中心类端点**: \`/activity-center/*\` → \`/api/activity-center/*\`\n`;
  report += `2. **中心类端点**: \`/teaching-center/*\` → \`/api/teaching-center/*\`\n`;
  report += `3. **营销端点**: \`/marketing/*\` → \`/api/marketing/*\`\n`;
  report += `4. **资源端点**: \`/activities\` → \`/api/activities\`\n`;
  report += `5. **资源端点**: \`/classes\` → \`/api/classes\`\n`;
  report += `6. **资源端点**: \`/statistics\` → \`/api/statistics\`\n`;
  report += `7. **资源端点**: \`/users\` → \`/api/users\`\n`;
  report += `8. **资源端点**: \`/roles\` → \`/api/roles\`\n`;
  report += `9. **资源端点**: \`/script-templates\` → \`/api/script-templates\`\n\n`;

  report += `### 排除的内容\n\n`;
  report += `- 已有 \`/api\` 前缀的路径\n`;
  report += `- 完整的外部 URL（如 \`https://...\`）\n`;
  report += `- 路由路径（如 \`router.push('/xxx')\`）\n`;
  report += `- 前端内部路径（如 \`/assets/...\`）\n\n`;

  report += `### 建议的后续步骤\n\n`;
  report += `1. 审查此报告，确认所有修复都是正确的\n`;
  report += `2. 运行测试套件确保没有破坏任何功能\n`;
  report += `3. 提交代码前进行代码审查\n`;
  report += `4. 部署到测试环境进行验证\n`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`报告已生成: ${reportPath}`);
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fixMode = args.includes('--fix');

  if (!dryRun && !fixMode) {
    console.log('使用方法:');
    console.log('  node fix-api-prefixes.js --dry-run  # 预览模式，只生成报告不修改文件');
    console.log('  node fix-api-prefixes.js --fix      # 执行修复');
    process.exit(1);
  }

  console.log(`模式: ${dryRun ? '预览（不修改文件）' : '修复模式'}`);
  console.log(`扫描目录: ${CONFIG.srcDir}`);
  console.log('');

  // 查找所有文件
  const files = findFiles(CONFIG.srcDir, ['*.vue', '*.ts', '*.js']);

  stats.totalFiles = files.length;
  console.log(`找到 ${files.length} 个文件\n`);

  // 扫描每个文件
  files.forEach((filePath) => {
    try {
      const issues = scanFile(filePath);

      if (issues.length > 0) {
        stats.filesWithIssues++;
        stats.totalIssues += issues.length;

        const fileData = {
          path: filePath,
          relativePath: path.relative(CONFIG.srcDir, filePath),
          issues: issues,
        };

        stats.filesToFix.push(fileData);

        if (fixMode) {
          const fixed = fixFile(filePath, issues);
          if (fixed) {
            console.log(`✓ 已修复: ${fileData.relativePath} (${issues.length} 个问题)`);
          }
        } else {
          console.log(`发现: ${fileData.relativePath} (${issues.length} 个问题)`);
        }
      }
    } catch (error) {
      stats.skippedFiles.push(filePath);
      console.error(`跳过文件: ${filePath} - ${error.message}`);
    }
  });

  console.log(`\n扫描完成!`);
  console.log(`总问题数: ${stats.totalIssues}`);
  console.log(`影响文件数: ${stats.filesWithIssues}`);

  // 生成报告
  generateReport();

  if (dryRun) {
    console.log(`\n这是预览模式，没有修改任何文件。`);
    console.log(`如果确认无误，请运行: node fix-api-prefixes.js --fix`);
  }
}

// 运行
try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
