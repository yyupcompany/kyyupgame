#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 扫描配置
const SCAN_CONFIG = {
  clientDir: path.join(__dirname, 'client/src'),
  excludeDirs: [
    'node_modules',
    'dist',
    '.git',
    'coverage',
    '.nuxt',
    'server'
  ],
  fileExtensions: ['.vue', '.js', '.ts', '.jsx', '.tsx'],

  // 需要扫描的模式
  patterns: {
    // 按钮点击事件但函数为空或只有注释
    emptyClickHandlers: [
      /@click\s*=\s*["'][^"']*["']/g,
      /@click\s*=\s*\{[^}]*\}/g,
      /onclick\s*=\s*["'][^"']*["']/g,
      /\.on\s*\(\s*['"]click['"][^)]*\)\s*\{[^}]*\}/g
    ],

    // 函数定义但为空或只有TODO注释
    emptyFunctions: [
      /(?:const|function|let|var)\s+\w+\s*\([^)]*\)\s*=>\s*\{\s*\}[^;]*$/gm,
      /(?:const|function|let|var)\s+\w+\s*\([^)]*\)\s*\{\s*\/\/[^}]*TODO[^}]*\}/gm,
      /function\s+\w+\s*\([^)]*\)\s*\{\s*\}[^;]*$/gm,
      /function\s+\w+\s*\([^)]*\)\s*\{\s*\/\/[^}]*TODO[^}]*\}/gm,
      /\w+\s*\([^)]*\)\s*\{\s*\}[^;]*$/gm,
      /\w+\s*\([^)]*\)\s*\{\s*\/\/[^}]*TODO[^}]*\}/gm
    ],

    // 按钮有 disabled 属性但没有说明原因
    disabledButtons: [
      /<[^>]*disabled[^>]*>[\s\S]*?<\/[^>]*>/gi
    ],

    // 路由跳转但路径不存在或为空
    emptyRoutes: [
      /router\.push\(['"`]([^'"`]*)['"`]\)/g,
      /\$router\.push\(['"`]([^'"`]*)['"`]\)/g,
      /to\s*=\s*['"`]([^'"`]*)['"`]/g
    ],

    // API调用但函数未实现
    emptyApiCalls: [
      /(?:await\s+)?(?:\w+\.)?\w+\s*\([^)]*\)\s*;?\s*\/\/[^]*TODO[^]*/gm,
      /(?:await\s+)?(?:\w+\.)?\w+\s*\([^)]*\)\s*;?\s*console\.log\([^)]*\)/gm
    ],

    // 表单提交但处理函数为空
    emptyFormHandlers: [
      /@submit\s*=\s*["'][^"']*["']/g,
      /@submit\.prevent\s*=\s*["'][^"']*["']/g,
      /onsubmit\s*=\s*["'][^"']*["']/g
    ],

    // 弹窗和对话框但内容为空
    emptyDialogs: [
      /<el-dialog[^>]*>[\s\S]*?<\/el-dialog>/gi,
      /<el-drawer[^>]*>[\s\S]*?<\/el-drawer>/gi
    ]
  }
};

// 扫描结果
const scanResults = {
  summary: {
    totalFiles: 0,
    scannedFiles: 0,
    issues: {
      emptyClickHandlers: 0,
      emptyFunctions: 0,
      disabledButtons: 0,
      emptyRoutes: 0,
      emptyApiCalls: 0,
      emptyFormHandlers: 0,
      emptyDialogs: 0
    }
  },
  details: {
    emptyClickHandlers: [],
    emptyFunctions: [],
    disabledButtons: [],
    emptyRoutes: [],
    emptyApiCalls: [],
    emptyFormHandlers: [],
    emptyDialogs: []
  }
};

// 工具函数
function shouldExcludeDir(dirPath) {
  return SCAN_CONFIG.excludeDirs.some(exclude => dirPath.includes(exclude));
}

function isValidFile(filePath) {
  return SCAN_CONFIG.fileExtensions.some(ext => filePath.endsWith(ext));
}

function getRelativePath(fullPath) {
  return path.relative(__dirname, fullPath);
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = getRelativePath(filePath);

    console.log(`🔍 扫描文件: ${relativePath}`);

    // 扫描空点击处理器
    if (SCAN_CONFIG.patterns.emptyClickHandlers) {
      SCAN_CONFIG.patterns.emptyClickHandlers.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          scanResults.details.emptyClickHandlers.push({
            file: relativePath,
            line: getLineNumber(content, match.index),
            code: match[0].trim(),
            context: getContext(content, match.index)
          });
          scanResults.summary.issues.emptyClickHandlers++;
        });
      });
    }

    // 扫描空函数
    if (SCAN_CONFIG.patterns.emptyFunctions) {
      SCAN_CONFIG.patterns.emptyFunctions.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          scanResults.details.emptyFunctions.push({
            file: relativePath,
            line: getLineNumber(content, match.index),
            code: match[0].trim(),
            context: getContext(content, match.index)
          });
          scanResults.summary.issues.emptyFunctions++;
        });
      });
    }

    // 扫描禁用的按钮
    if (SCAN_CONFIG.patterns.disabledButtons) {
      SCAN_CONFIG.patterns.disabledButtons.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          // 检查是否是因为loading或权限而禁用
          const isReasonableDisabled = match[0].includes(':loading') ||
                                     match[0].includes(':disabled') ||
                                     match[0].includes('v-if') ||
                                     match[0].includes('v-show');

          if (!isReasonableDisabled) {
            scanResults.details.disabledButtons.push({
              file: relativePath,
              line: getLineNumber(content, match.index),
              code: match[0].trim(),
              context: getContext(content, match.index)
            });
            scanResults.summary.issues.disabledButtons++;
          }
        });
      });
    }

    // 扫描空路由
    if (SCAN_CONFIG.patterns.emptyRoutes) {
      SCAN_CONFIG.patterns.emptyRoutes.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          const routePath = match[1];
          if (!routePath || routePath === '#' || routePath === '/') {
            scanResults.details.emptyRoutes.push({
              file: relativePath,
              line: getLineNumber(content, match.index),
              code: match[0].trim(),
              context: getContext(content, match.index)
            });
            scanResults.summary.issues.emptyRoutes++;
          }
        });
      });
    }

    // 扫描空API调用
    if (SCAN_CONFIG.patterns.emptyApiCalls) {
      SCAN_CONFIG.patterns.emptyApiCalls.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          scanResults.details.emptyApiCalls.push({
            file: relativePath,
            line: getLineNumber(content, match.index),
            code: match[0].trim(),
            context: getContext(content, match.index)
          });
          scanResults.summary.issues.emptyApiCalls++;
        });
      });
    }

    // 扫描空表单处理器
    if (SCAN_CONFIG.patterns.emptyFormHandlers) {
      SCAN_CONFIG.patterns.emptyFormHandlers.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          scanResults.details.emptyFormHandlers.push({
            file: relativePath,
            line: getLineNumber(content, match.index),
            code: match[0].trim(),
            context: getContext(content, match.index)
          });
          scanResults.summary.issues.emptyFormHandlers++;
        });
      });
    }

    // 扫描空对话框
    if (SCAN_CONFIG.patterns.emptyDialogs) {
      SCAN_CONFIG.patterns.emptyDialogs.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          // 检查对话框是否确实为空
          const dialogContent = match[0];
          const hasContent = dialogContent.includes('<el-') ||
                          dialogContent.includes('<div>') ||
                          dialogContent.includes('<span>') ||
                          dialogContent.includes('{{');

          if (!hasContent || dialogContent.length < 200) {
            scanResults.details.emptyDialogs.push({
              file: relativePath,
              line: getLineNumber(content, match.index),
              code: dialogContent.substring(0, 100) + '...',
              context: getContext(content, match.index)
            });
            scanResults.summary.issues.emptyDialogs++;
          }
        });
      });
    }

  } catch (error) {
    console.error(`❌ 扫描文件失败 ${filePath}:`, error.message);
  }
}

function getLineNumber(content, index) {
  const lines = content.substring(0, index).split('\n');
  return lines.length;
}

function getContext(content, index, contextLines = 3) {
  const lines = content.split('\n');
  const targetLine = getLineNumber(content, index) - 1;
  const start = Math.max(0, targetLine - contextLines);
  const end = Math.min(lines.length, targetLine + contextLines + 1);

  return lines.slice(start, end).map((line, i) => {
    const lineNumber = start + i + 1;
    const isTargetLine = lineNumber === targetLine + 1;
    return `${isTargetLine ? '➜️' : '  '} ${lineNumber}: ${line}`;
  }).join('\n');
}

function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory() && !shouldExcludeDir(itemPath)) {
        scanDirectory(itemPath);
      } else if (stat.isFile() && isValidFile(itemPath)) {
        scanResults.summary.totalFiles++;
        // 只扫描.vue文件
        if (itemPath.endsWith('.vue')) {
          scanResults.summary.scannedFiles++;
          scanFile(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ 扫描目录失败 ${dirPath}:`, error.message);
  }
}

function generateReport() {
  const totalIssues = Object.values(scanResults.summary.issues).reduce((sum, count) => sum + count, 0);

  console.log('\n' + '='.repeat(80));
  console.log('🔍 前端未实现功能扫描报告');
  console.log('='.repeat(80));

  console.log('\n📊 扫描统计:');
  console.log(`  总文件数: ${scanResults.summary.totalFiles}`);
  console.log(`  已扫描文件: ${scanResults.summary.scannedFiles}`);
  console.log(`  发现问题总数: ${totalIssues}`);

  console.log('\n📋 问题分类统计:');
  Object.entries(scanResults.summary.issues).forEach(([type, count]) => {
    if (count > 0) {
      const typeNames = {
        emptyClickHandlers: '空点击处理器',
        emptyFunctions: '空函数定义',
        disabledButtons: '禁用按钮',
        emptyRoutes: '空路由跳转',
        emptyApiCalls: '空API调用',
        emptyFormHandlers: '空表单处理器',
        emptyDialogs: '空对话框'
      };
      console.log(`  ${typeNames[type] || type}: ${count} 个`);
    }
  });

  // 详细报告
  if (totalIssues > 0) {
    console.log('\n🔧 详细问题列表:');

    Object.entries(scanResults.details).forEach(([type, issues]) => {
      if (issues.length > 0) {
        const typeNames = {
          emptyClickHandlers: '🖱️ 空点击处理器',
          emptyFunctions: '⚙️ 空函数定义',
          disabledButtons: '🚫 禁用按钮',
          emptyRoutes: '🛤️ 空路由跳转',
          emptyApiCalls: '🌐 空API调用',
          emptyFormHandlers: '📝 空表单处理器',
          emptyDialogs: '💬 空对话框'
        };

        console.log(`\n${typeNames[type] || type} (${issues.length} 个):`);
        console.log('-'.repeat(60));

        issues.slice(0, 10).forEach((issue, index) => {
          console.log(`\n${index + 1}. 📁 ${issue.file}:${issue.line}`);
          console.log(`   💻 代码: ${issue.code.substring(0, 80)}${issue.code.length > 80 ? '...' : ''}`);
          console.log(`   📝 上下文:\n${issue.context.split('\n').slice(0, 5).join('\n')}`);
        });

        if (issues.length > 10) {
          console.log(`\n   ... 还有 ${issues.length - 10} 个类似问题`);
        }
      }
    });
  }

  console.log('\n💡 建议修复优先级:');
  console.log('  🔥 高优先级: 空点击处理器、空函数定义');
  console.log('  ⚠️ 中优先级: 空API调用、空表单处理器');
  console.log('  💡 低优先级: 空对话框、禁用按钮');

  console.log('\n✅ 扫描完成！');

  // 生成JSON报告
  const reportData = {
    scanTime: new Date().toISOString(),
    summary: scanResults.summary,
    details: scanResults.details
  };

  const reportPath = path.join(__dirname, 'unimplemented-features-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
}

// 主程序
function main() {
  console.log('🚀 开始扫描前端未实现功能...');
  console.log(`📂 扫描目录: ${SCAN_CONFIG.clientDir}`);

  scanDirectory(SCAN_CONFIG.clientDir);
  generateReport();
}

// 运行扫描
main();