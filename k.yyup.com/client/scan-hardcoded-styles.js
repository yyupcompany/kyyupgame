#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 硬编码样式模式
const hardcodedPatterns = [
  // 内联样式中的硬编码值
  { pattern: /style="[^"]*\d+px[^"]*"/g, type: 'inline-style-px' },
  { pattern: /style="[^"]*(?:margin|padding|width|height|top|left|right|bottom):\s*\d+(?:px)?[^"]*"/g, type: 'inline-style-spacing' },
  { pattern: /style="[^"]*font-size:\s*\d+(?:px|rem|em)[^"]*"/g, type: 'inline-style-font' },
  
  // CSS 中的硬编码值
  { pattern: /(?:margin|padding)(?:-(?:top|right|bottom|left))?:\s*\d+px/g, type: 'css-spacing-px' },
  { pattern: /(?:width|height|min-width|min-height|max-width|max-height):\s*\d+px/g, type: 'css-size-px' },
  { pattern: /font-size:\s*\d+(?:px|rem)/g, type: 'css-font-size' },
  { pattern: /line-height:\s*\d+(?:px)?/g, type: 'css-line-height' },
  { pattern: /border-radius:\s*\d+px/g, type: 'css-border-radius' },
  { pattern: /gap:\s*\d+px/g, type: 'css-gap' },
  { pattern: /(?:top|right|bottom|left):\s*\d+px/g, type: 'css-position' },
  
  // 颜色硬编码
  { pattern: /#[0-9a-fA-F]{3,6}(?:\s|;|,|\))/g, type: 'color-hex' },
  { pattern: /rgba?\([^)]+\)/g, type: 'color-rgba' },
  
  // 特定数值
  { pattern: /z-index:\s*\d+/g, type: 'z-index' },
  { pattern: /opacity:\s*0?\.\d+/g, type: 'opacity' },
];

// 应该忽略的模式
const ignorePatterns = [
  // Element Plus 组件属性
  /el-col.*:span="\d+"/,
  /el-col.*:xs="\d+"/,
  /el-col.*:sm="\d+"/,
  /el-col.*:md="\d+"/,
  /el-col.*:lg="\d+"/,
  /width="\d+"/, // 表格列宽
  /min-width="\d+"/, // 表格最小列宽
  /:min="\d+"/, // 数字输入框最小值
  /:max="\d+"/, // 数字输入框最大值
  /label-width="\d+px"/, // 表单标签宽度
  
  // 常见的合理硬编码
  /opacity:\s*[01](?:\.0)?/, // opacity: 0 或 1
  /z-index:\s*(?:9999|1000|100|10|1|0)/, // 常见的 z-index 值
  /(?:margin|padding):\s*0/, // margin/padding: 0
  /line-height:\s*1(?:\.\d)?/, // line-height: 1.x
];

// 扫描文件
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, lineIndex) => {
    hardcodedPatterns.forEach(({ pattern, type }) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        // 检查是否应该忽略
        const shouldIgnore = ignorePatterns.some(ignorePattern => 
          ignorePattern.test(line)
        );
        
        if (!shouldIgnore) {
          // 提取更多上下文
          const startPos = Math.max(0, match.index - 20);
          const endPos = Math.min(line.length, match.index + match[0].length + 20);
          const context = line.substring(startPos, endPos).trim();
          
          issues.push({
            line: lineIndex + 1,
            column: match.index + 1,
            type,
            match: match[0],
            context
          });
        }
      }
    });
  });
  
  return issues;
}

// 获取所有需要扫描的文件
function getAllFiles() {
  const patterns = [
    'src/pages/**/*.vue',
    'src/components/**/*.vue',
    'src/layouts/**/*.vue',
    'src/views/**/*.vue'
  ];
  
  let files = [];
  patterns.forEach(pattern => {
    files = files.concat(glob.sync(pattern, { cwd: '/home/devbox/project/client' }));
  });
  
  return files.map(file => path.join('/home/devbox/project/client', file));
}

// 生成报告
function generateReport(results) {
  console.log('\n' + colors.blue + '=== 硬编码样式扫描报告 ===' + colors.reset + '\n');
  
  const totalFiles = results.length;
  const filesWithIssues = results.filter(r => r.issues.length > 0).length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  
  console.log(`扫描文件总数: ${totalFiles}`);
  console.log(`存在问题的文件: ${colors.yellow}${filesWithIssues}${colors.reset}`);
  console.log(`发现问题总数: ${colors.red}${totalIssues}${colors.reset}\n`);
  
  // 按类型统计
  const issuesByType = {};
  results.forEach(result => {
    result.issues.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    });
  });
  
  console.log(colors.blue + '问题类型分布:' + colors.reset);
  Object.entries(issuesByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  console.log('');
  
  // 详细报告
  results
    .filter(r => r.issues.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length)
    .forEach(({ file, issues }) => {
      const relativeFile = path.relative('/home/devbox/project/client', file);
      console.log(`\n${colors.yellow}📄 ${relativeFile}${colors.reset} (${issues.length} 个问题)`);
      
      // 按行号排序
      issues.sort((a, b) => a.line - b.line).forEach(issue => {
        console.log(`  ${colors.red}行 ${issue.line}:${issue.column}${colors.reset} [${issue.type}]`);
        console.log(`    匹配: ${issue.match}`);
        console.log(`    上下文: ...${issue.context}...`);
      });
    });
}

// 生成 JSON 报告
function generateJsonReport(results, outputPath) {
  const report = {
    scanDate: new Date().toISOString(),
    summary: {
      totalFiles: results.length,
      filesWithIssues: results.filter(r => r.issues.length > 0).length,
      totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0)
    },
    issuesByType: {},
    files: results
      .filter(r => r.issues.length > 0)
      .map(({ file, issues }) => ({
        file: path.relative('/home/devbox/project/client', file),
        issueCount: issues.length,
        issues: issues
      }))
  };
  
  // 统计问题类型
  results.forEach(result => {
    result.issues.forEach(issue => {
      report.issuesByType[issue.type] = (report.issuesByType[issue.type] || 0) + 1;
    });
  });
  
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n${colors.green}JSON 报告已生成: ${outputPath}${colors.reset}`);
}

// 主函数
function main() {
  console.log(colors.blue + '开始扫描硬编码样式...' + colors.reset);
  
  const files = getAllFiles();
  const results = [];
  
  files.forEach(file => {
    const issues = scanFile(file);
    results.push({ file, issues });
  });
  
  generateReport(results);
  generateJsonReport(results, '/home/devbox/project/client/hardcoded-styles-report.json');
  
  // 生成修复建议
  console.log(`\n${colors.green}=== 修复建议 ===${colors.reset}\n`);
  console.log('1. 将像素值替换为 CSS 变量:');
  console.log('   - 间距: var(--spacing-xs/sm/md/lg/xl)');
  console.log('   - 圆角: var(--radius-sm/md/lg/xl)');
  console.log('   - 字体: var(--text-xs/sm/base/lg/xl/2xl)');
  console.log('\n2. 将颜色值替换为主题变量:');
  console.log('   - 主色: var(--primary-color)');
  console.log('   - 文字: var(--text-primary/secondary/muted)');
  console.log('   - 背景: var(--bg-primary/secondary/card)');
  console.log('\n3. 使用全局样式类替代内联样式');
  console.log('\n4. 考虑将组件特定的样式提取到 scoped style 中');
}

// 运行脚本
main();