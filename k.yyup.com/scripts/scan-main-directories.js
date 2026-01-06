#!/usr/bin/env node

/**
 * 主要目录硬编码颜色扫描脚本
 * 专门扫描 center、teacher-center 和 parent-center 三个核心业务目录
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const PROJECT_ROOT = path.join(__dirname, '..');

// 主要扫描目录 - 您指定的三个核心目录
const MAIN_DIRECTORIES = [
  'client/src/pages/center',
  'client/src/pages/teacher-center',
  'client/src/pages/parent-center',
  // 同时扫描对应的组件目录
  'client/src/components/centers',
  'client/src/components/teacher-center',
  'client/src/components/parent-center'
];

// 颜色正则表达式
const COLOR_PATTERNS = [
  // HEX颜色
  /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?![0-9a-fA-F])/g,

  // RGB颜色
  /rgba?\(\s*(\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?(?:\s*,\s*[\d.]+\s*)?)\)/gi,

  // HSL颜色
  /hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?(?:\s*,\s*[\d.]+\s*)?\)/gi,

  // 常见的颜色关键词
  /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/gi,

  // CSS颜色函数
  /(?:rgb|rgba|hsl|hsla)\s*\([^)]+\)/gi,
];

// 需要排除的文件和目录
const EXCLUDE_PATTERNS = [
  /\.git\//,
  /node_modules\//,
  /dist\//,
  /build\//,
  /coverage\//,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.map$/,
  /\.lock$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.env/,
  /\.log$/,
  /\.tmp/
];

// 需要排除的注释行
const COMMENT_PATTERNS = [
  /\/\/.*$/,
  /\/\*[\s\S]*?\*\//g,
  /<!--[\\s\\S]*?-->/g,
  /\/\*\*\s*[\s\S]*?\s*\*\*\//g,
  /\/\*\s*\*[\s\S]*?\s*\//g
];

// 已知的设计变量和CSS类（用于减少误报）
const DESIGN_TOKENS = [
  /--primary-color/,
  /--secondary-color/,
  /--success-color/,
  /--warning-color/,
  /--error-color/,
  /--info-color/,
  /--text-color/,
  /--background-color/,
  /--border-color/,
  /--shadow-color/,
  /--accent-/,
  /--theme-/,
  /\.el-/, // Element Plus组件类
  /color-/,  // 工具类
  /bg-/,     // 背景类
  /text-/    // 文本类
];

class MainDirectoryScanner {
  constructor() {
    this.results = {
      scannedDirectories: [],
      totalFiles: 0,
      filesWithColors: [],
      totalColors: 0,
      colorStats: {},
      directoryStats: {},
      problematicFiles: []
    };
  }

  // 扫描单个文件
  async scanFile(filePath, directoryName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);

      // 只扫描小于5MB的文件
      if (stats.size > 5 * 1024 * 1024) {
        return;
      }

      let fileHasColors = false;
      const fileColors = [];
      const lines = content.split('\n');

      lines.forEach((line, lineNum) => {
        // 移除注释后再扫描
        const cleanLine = this.removeComments(line);

        if (this.containsHardcodedColors(cleanLine)) {
          const colors = this.extractColors(cleanLine);

          if (colors.length > 0) {
            fileHasColors = true;
            fileColors.push({
              line: lineNum + 1,
              content: line.trim(),
              colors: colors
            });
          }
        }
      });

      if (fileHasColors) {
        // 更新目录统计
        if (!this.results.directoryStats[directoryName]) {
          this.results.directoryStats[directoryName] = {
            files: 0,
            colors: 0,
            fileList: []
          };
        }
        this.results.directoryStats[directoryName].files++;
        this.results.directoryStats[directoryName].colors += fileColors.length;
        this.results.directoryStats[directoryName].fileList.push({
          path: path.relative(PROJECT_ROOT, filePath),
          lineCount: lines.length,
          colors: fileColors
        });

        // 更新总体统计
        this.results.totalFiles++;
        this.results.filesWithColors.push({
          path: path.relative(PROJECT_ROOT, filePath),
          directory: directoryName,
          lineCount: lines.length,
          colors: fileColors
        });

        // 统计颜色
        fileColors.forEach(item => {
          item.colors.forEach(color => {
            this.results.totalColors++;
            this.results.colorStats[color] = (this.results.colorStats[color] || 0) + 1;
          });
        });
      }

    } catch (error) {
      console.warn(`无法读取文件: ${filePath}`, error.message);
    }
  }

  // 移除注释
  removeComments(text) {
    return text
      .replace(/\/\/.*$/gm, '') // 单行注释
      .replace(/\/\*[\s\S]*?\*\//g, '') // 多行注释
      .replace(/<!--[\\s\\S]*?-->/g, '') // HTML注释
      .replace(/\/\*\*\s*[\s\S]*?\s*\*\*\//g, ''); // 文档注释
  }

  // 检查是否包含硬编码颜色
  containsHardcodedColors(text) {
    // 检查是否匹配颜色模式且不是设计变量
    return COLOR_PATTERNS.some(pattern => {
      const matches = text.match(pattern);
      return matches && !matches.some(match =>
        DESIGN_TOKENS.some(token => {
          const tokenStr = typeof token === 'string' ? token : token.toString();
          return text.toLowerCase().includes(tokenStr.toLowerCase());
        })
      );
    });
  }

  // 提取颜色
  extractColors(text) {
    const colors = [];

    COLOR_PATTERNS.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        colors.push(...matches);
      }
    });

    // 去重
    return [...new Set(colors)];
  }

  // 扫描目录
  async scanDirectory(dirPath, directoryName) {
    try {
      if (!fs.existsSync(dirPath)) {
        console.log(`⚠️ 目录不存在: ${dirPath}`);
        return;
      }

      console.log(`📂 扫描目录: ${dirPath}`);
      this.results.scannedDirectories.push(directoryName);

      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        // 跳过排除的文件和目录
        if (this.shouldExclude(fullPath)) {
          continue;
        }

        if (stat.isDirectory()) {
          await this.scanDirectory(fullPath, directoryName);
        } else if (this.isTextFile(fullPath)) {
          await this.scanFile(fullPath, directoryName);
        }
      }
    } catch (error) {
      console.warn(`无法扫描目录: ${dirPath}`, error.message);
    }
  }

  // 检查是否应该排除
  shouldExclude(filePath) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    return EXCLUDE_PATTERNS.some(pattern => pattern.test(relativePath));
  }

  // 检查是否是文本文件
  isTextFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const textExtensions = [
      '.vue', '.js', '.ts', '.jsx', '.tsx',
      '.css', '.scss', '.sass', '.less',
      '.html', '.htm', '.xml', '.json',
      '.md', '.txt', '.yml', '.yaml'
    ];
    return textExtensions.includes(ext);
  }

  // 生成详细报告
  generateDetailedReport() {
    let report = `\n🎯 主要目录硬编码颜色扫描报告
===========================================

📊 扫描统计
- 扫描目录数: ${this.results.scannedDirectories.length}
- 扫描目录: ${this.results.scannedDirectories.join(', ')}
- 发现硬编码颜色的文件总数: ${this.results.totalFiles}
- 硬编码颜色总数: ${this.results.totalColors}
- 平均每文件颜色数: ${this.results.totalFiles > 0 ? (this.results.totalColors / this.results.totalFiles).toFixed(1) : 0}

`;

    // 按目录统计
    report += `\n📁 分目录统计
----------------\n`;

    Object.entries(this.results.directoryStats).forEach(([dirName, stats]) => {
      report += `
🎯 ${dirName}
   📄 文件数: ${stats.files}
   🎨 颜色总数: ${stats.colors}
   📈 平均每文件: ${stats.files > 0 ? (stats.colors / stats.files).toFixed(1) : 0}个颜色
`;
    });

    // 最严重的问题文件
    report += `\n🚨 最严重的问题文件 (颜色数量最多的前10个)
---------------------------------------------\n`;

    const sortedFiles = this.results.filesWithColors
      .map(file => ({
        ...file,
        totalColors: file.colors.reduce((sum, item) => sum + item.colors.length, 0)
      }))
      .sort((a, b) => b.totalColors - a.totalColors)
      .slice(0, 10);

    sortedFiles.forEach((file, index) => {
      report += `
${index + 1}. 📄 ${file.path}
   📁 目录: ${file.directory}
   🎨 颜色数: ${file.totalColors}
   📏 行数: ${file.lineCount}
`;
    });

    // 颜色使用统计
    report += `\n🎨 颜色使用统计 (前20个)
------------------------\n`;

    const sortedColors = Object.entries(this.results.colorStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);

    sortedColors.forEach(([color, count], index) => {
      report += `${index + 1}. ${color}: ${count}次\n`;
    });

    // 详细文件列表
    report += `\n📄 详细文件列表
================\n`;

    Object.entries(this.results.directoryStats).forEach(([dirName, stats]) => {
      report += `\n🎯 ${dirName} 目录 (${stats.files}个文件):\n`;

      stats.fileList
        .sort((a, b) => b.colors.length - a.colors.length)
        .slice(0, 5) // 每个目录只显示前5个最严重的文件
        .forEach(file => {
          const colorCount = file.colors.reduce((sum, item) => sum + item.colors.length, 0);
          report += `   📄 ${file.path} (${colorCount}个颜色)\n`;
          file.colors.slice(0, 3).forEach(item => {
            report += `      第${item.line}行: ${item.colors.join(', ')}\n`;
          });
          if (file.colors.length > 3) {
            report += `      ... 还有${file.colors.length - 3}个颜色\n`;
          }
        });

      if (stats.fileList.length > 5) {
        report += `   ... 还有${stats.fileList.length - 5}个文件\n`;
      }
    });

    report += `\n💡 修复建议
==========
1. 优先处理颜色数量最多的文件
2. 将硬编码颜色替换为设计令牌变量
3. 使用现有的 --primary-color, --success-color 等变量
4. 建立团队颜色使用规范

🔧 建议的变量映射
===============
常见硬编码颜色 → 设计令牌变量
#409eff → var(--primary-color)
#ffffff → var(--bg-color) 或 var(--text-on-primary)
#f5f7fa → var(--bg-hover)
#303133 → var(--text-primary)
#606266 → var(--text-regular)
#dcdfe6 → var(--border-color)
#67c23a → var(--success-color)
#e6a23c → var(--warning-color)
#f56c6c → var(--danger-color)
#909399 → var(--info-color)
`;

    console.log(report);

    // 保存详细报告到文件
    const reportFile = path.join(__dirname, '..', 'main-directories-color-report.md');
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 详细报告已保存到: ${reportFile}`);

    return report;
  }

  // 生成简洁报告
  generateSummaryReport() {
    const summary = `
🎯 主要目录颜色扫描摘要
========================

📊 总体统计
- 扫描目录: ${this.results.scannedDirectories.length}个
- 问题文件: ${this.results.totalFiles}个
- 硬编码颜色: ${this.results.totalColors}个

📁 各目录情况
${Object.entries(this.results.directoryStats).map(([dir, stats]) =>
  `- ${dir}: ${stats.files}个文件, ${stats.colors}个颜色`
).join('\n')}

🚨 需要重点关注
- 平均每个文件有${this.results.totalFiles > 0 ? (this.results.totalColors / this.results.totalFiles).toFixed(1) : 0}个硬编码颜色
- 建议优先处理颜色数量最多的文件
`;

    console.log(summary);
    return summary;
  }

  // 运行扫描
  async run() {
    console.log('🎯 开始扫描主要业务目录的硬编码颜色...');
    console.log(`📁 项目根目录: ${PROJECT_ROOT}`);
    console.log(`📂 主要目录: center, teacher-center, parent-center\n`);

    const startTime = Date.now();

    for (const dirPath of MAIN_DIRECTORIES) {
      const directoryName = path.basename(dirPath);
      await this.scanDirectory(path.join(PROJECT_ROOT, dirPath), directoryName);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️ 扫描完成，耗时: ${duration}秒`);

    // 生成报告
    this.generateSummaryReport();
    this.generateDetailedReport();
  }
}

// 运行扫描
const scanner = new MainDirectoryScanner();
scanner.run().catch(error => {
  console.error('扫描失败:', error);
  process.exit(1);
});