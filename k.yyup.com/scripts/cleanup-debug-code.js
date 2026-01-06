#!/usr/bin/env node

/**
 * 生产环境调试代码清理脚本
 * Production Debug Code Cleanup Script
 *
 * 自动清理生产环境中的调试代码和注释
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 配置
const CONFIG = {
  // 项目根目录
  rootDir: path.resolve(__dirname, '..'),
  // 源码目录
  srcDir: 'client/src',
  // 要排除的目录
  excludeDirs: [
    'node_modules',
    'dist',
    'build',
    '.git',
    '__tests__',
    'test',
    'tests',
    'coverage',
    '.nyc_output'
  ],
  // 要排除的文件模式
  excludeFiles: [
    '*.test.js',
    '*.test.ts',
    '*.spec.js',
    '*.spec.ts',
    '*.d.ts',
    'cleanup-debug-code.js'
  ],
  // 调试代码模式
  debugPatterns: [
    // console.log, console.debug, console.info, console.warn
    /console\.(log|debug|info|warn)\s*\([^)]*\)[;]?[\s\S]*?$/gm,
    // debugger语句
    /\bdebugger\b[;]?$/gm,
    // 开发环境相关的console
    /if\s*\(\s*process\.env\.NODE_ENV\s*!==\s*['"]production['"]\s*\)\s*{[\s\S]*?console\.[^;]*;[\s\S]*?}/gm,
    // 带环境判断的console
    /if\s*\(\s*process\.env\.DEV\s*\)\s*{[\s\S]*?console\.[^;]*;[\s\S]*?}/gm,
    // 常见的调试注释
    /\/\/\s*(TODO|FIXME|HACK|XXX):.*$/gm,
    /\/\*[\s\S]*?(TODO|FIXME|HACK|XXX)[\s\S]*?\*\//gm,
    // 调试变量
    /const\s+(debug|DEBUG|temp|tmp)\s*=.*$/gm,
    /let\s+(debug|DEBUG|temp|tmp)\s*=.*$/gm,
    /var\s+(debug|DEBUG|temp|tmp)\s*=.*$/gm
  ],
  // 生产环境保留的调试模式（error级别）
  keepPatterns: [
    // console.error 通常需要保留
    /console\.error\s*\([^)]*\)/,
    // 错误处理相关的debugger
    /debugger;\s*\/\/\s*error\s*handling/
  ]
};

// 统计信息
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  removedLines: 0,
  removedChars: 0,
  errors: 0
};

// 日志工具
const log = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  success: (msg, ...args) => console.log(`[SUCCESS] ${msg}`, ...args)
};

// 检查是否应该排除文件
function shouldExcludeFile(filePath) {
  const relativePath = path.relative(CONFIG.rootDir, filePath);

  // 检查目录
  for (const excludeDir of CONFIG.excludeDirs) {
    if (relativePath.includes(excludeDir)) {
      return true;
    }
  }

  // 检查文件模式
  for (const excludePattern of CONFIG.excludeFiles) {
    if (relativePath.endsWith(excludePattern.replace('*', ''))) {
      return true;
    }
  }

  return false;
}

// 检查是否应该保留某行
function shouldKeepLine(line) {
  for (const pattern of CONFIG.keepPatterns) {
    if (pattern.test(line)) {
      return true;
    }
  }
  return false;
}

// 清理单个文件
function cleanupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let removedLines = 0;
    let removedChars = 0;
    const originalLength = content.length;

    // 按行处理
    const lines = content.split('\n');
    const cleanedLines = lines.map((line, index) => {
      // 检查是否应该保留该行
      if (shouldKeepLine(line)) {
        return line;
      }

      // 应用调试代码模式
      let cleanedLine = line;
      let modified = false;

      for (const pattern of CONFIG.debugPatterns) {
        const before = cleanedLine;
        cleanedLine = cleanedLine.replace(pattern, '');
        if (before !== cleanedLine) {
          modified = true;
        }
      }

      if (modified) {
        removedLines++;
        // 如果行变空了，返回空字符串
        if (cleanedLine.trim() === '') {
          return '';
        }
        return cleanedLine;
      }

      return line;
    });

    // 重新组合内容
    newContent = cleanedLines.join('\n');

    // 清理多余的空行
    newContent = newContent.replace(/\n{3,}/g, '\n\n');

    // 检查是否有变化
    if (newContent !== content) {
      removedChars = originalLength - newContent.length;

      // 备份原文件
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, content);

      // 写入清理后的内容
      fs.writeFileSync(filePath, newContent);

      log.info(`清理文件: ${path.relative(CONFIG.rootDir, filePath)}`);
      log.info(`  - 移除行数: ${removedLines}`);
      log.info(`  - 移除字符数: ${removedChars}`);
      log.info(`  - 备份文件: ${backupPath}`);

      stats.modifiedFiles++;
      stats.removedLines += removedLines;
      stats.removedChars += removedChars;

      return true;
    }

    return false;
  } catch (error) {
    log.error(`清理文件失败: ${filePath}`, error);
    stats.errors++;
    return false;
  }
}

// 查找需要清理的文件
function findFilesToCleanup() {
  const pattern = path.join(CONFIG.rootDir, CONFIG.srcDir, '**/*.{js,ts,vue,jsx,tsx}');
  const files = glob.sync(pattern, { nodir: true });

  return files.filter(file => {
    // 只处理源码文件
    const ext = path.extname(file);
    return ['.js', '.ts', '.vue', '.jsx', '.tsx'].includes(ext) &&
           !shouldExcludeFile(file);
  });
}

// 主函数
function main() {
  log.info('开始清理生产环境调试代码...');
  log.info(`项目根目录: ${CONFIG.rootDir}`);
  log.info(`源码目录: ${CONFIG.srcDir}`);

  // 检查目录是否存在
  const srcDirPath = path.join(CONFIG.rootDir, CONFIG.srcDir);
  if (!fs.existsSync(srcDirPath)) {
    log.error(`源码目录不存在: ${srcDirPath}`);
    process.exit(1);
  }

  // 查找文件
  const files = findFilesToCleanup();
  stats.totalFiles = files.length;

  log.info(`找到 ${stats.totalFiles} 个文件需要检查`);

  if (files.length === 0) {
    log.warn('没有找到需要清理的文件');
    return;
  }

  // 清理文件
  let processedCount = 0;
  for (const file of files) {
    cleanupFile(file);
    processedCount++;

    // 显示进度
    if (processedCount % 10 === 0) {
      log.info(`进度: ${processedCount}/${stats.totalFiles}`);
    }
  }

  // 输出统计信息
  log.success('清理完成！');
  log.info('统计信息:');
  log.info(`  - 总文件数: ${stats.totalFiles}`);
  log.info(`  - 修改文件数: ${stats.modifiedFiles}`);
  log.info(`  - 移除行数: ${stats.removedLines}`);
  log.info(`  - 移除字符数: ${stats.removedChars}`);
  log.info(`  - 错误数: ${stats.errors}`);

  // 清理备份文件（可选）
  const { cleanupBackups = false } = process.argv.slice(2).reduce((acc, arg) => {
    if (arg === '--cleanup-backups') {
      acc.cleanupBackups = true;
    }
    return acc;
  }, {});

  if (cleanupBackups && stats.modifiedFiles > 0) {
    log.info('清理备份文件...');
    const files = findFilesToCleanup();
    let cleanedBackups = 0;

    for (const file of files) {
      const backupPath = `${file}.backup`;
      if (fs.existsSync(backupPath)) {
        try {
          fs.unlinkSync(backupPath);
          cleanedBackups++;
        } catch (error) {
          log.error(`删除备份文件失败: ${backupPath}`, error);
        }
      }
    }

    log.info(`清理了 ${cleanedBackups} 个备份文件`);
  }

  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    config: CONFIG
  };

  const reportPath = path.join(CONFIG.rootDir, 'cleanup-debug-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.info(`生成报告: ${reportPath}`);
}

// 处理命令行参数
function showHelp() {
  console.log(`
生产环境调试代码清理脚本

用法:
  node cleanup-debug-code.js [选项]

选项:
  --cleanup-backups  清理备份文件
  --help            显示帮助信息

示例:
  node cleanup-debug-code.js                    # 清理调试代码
  node cleanup-debug-code.js --cleanup-backups  # 清理调试代码并删除备份文件
  `);
}

// 检查参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// 运行主程序
if (require.main === module) {
  main();
}

module.exports = {
  CONFIG,
  cleanupFile,
  findFilesToCleanup,
  shouldExcludeFile,
  shouldKeepLine
};