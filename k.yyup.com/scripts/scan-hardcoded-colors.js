#!/usr/bin/env node

/**
 * 硬编码颜色扫描脚本
 * 扫描项目中的硬编码颜色值，包括hex、rgb、rgba、hsl、hsla等格式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置扫描目录
const PROJECT_ROOT = path.join(__dirname, '..');
const SCAN_DIRS = [
  'client/src',
  'server/src'
];

// 颜色正则表达式
const COLOR_PATTERNS = [
  // HEX颜色
  /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?![0-9a-fA-F])/g,

  // RGB颜色
  /rgba?\(\s*(\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?(?:\s*,\s*[\d.]+\s*)?)\)/gi,

  // HSL颜色
  /hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?(?:\s*,\s*[\d.]+\s*)?\)/gi,

  // 常见的颜色关键词（可以根据需要添加）
  /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/gi,

  // CSS颜色函数
  /(?:rgb|rgba|hsl|hsla)\s*\([^)]+\)/gi,

  // 3位和6位HEX（已包含在第一个模式中）
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
  /<!--[\s\S]*?-->/g,
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

class ColorScanner {
  constructor() {
    this.results = {
      files: 0,
      totalColors: 0,
      filesWithColors: [],
      colorStats: {},
      suspiciousFiles: []
    };
  }

  // 扫描单个文件
  async scanFile(filePath) {
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
        this.results.files++;
        this.results.filesWithColors.push({
          path: path.relative(PROJECT_ROOT, filePath),
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
      .replace(/<!--[\s\S]*?-->/g, '') // HTML注释
      .replace(/\/\*\*\s*[\s\S]*?\s*\*\*\//g, ''); // 文档注释
  }

  // 检查是否包含硬编码颜色
  containsHardcodedColors(text) {
    // 检查是否匹配颜色模式且不是设计变量
    return COLOR_PATTERNS.some(pattern => {
      const matches = text.match(pattern);
      return matches && !matches.some(match =>
        DESIGN_TOKENS.some(token => {
          // 确保 token 是字符串类型
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
  async scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        // 跳过排除的文件和目录
        if (this.shouldExclude(fullPath)) {
          continue;
        }

        if (stat.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (this.isTextFile(fullPath)) {
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`无法扫描目录: ${dir}`, error.message);
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

  // 生成报告
  generateReport() {
    const report = `
🎨 硬编码颜色扫描报告
========================

📊 扫描统计
- 扫描文件总数: ${this.results.files}
- 发现硬编码颜色的文件数: ${this.results.filesWithColors.length}
- 硬编码颜色总数: ${this.results.totalColors}
- 发现问题的文件: ${this.results.suspiciousFiles.length}

🎨 颜�要关注的文件 (${this.results.filesWithColors.length}个):
${this.results.filesWithColors.map(file => `
📄 ${file.path} (${file.lineCount}行)
${file.colors.slice(0, 5).map(item =>
  `   第${item.line}行: ${item.colors.join(', ')}`
).join('\n')}
${file.colors.length > 5 ? `   ... 还有${file.colors.length - 5}个颜色` : ''}
`).join('\n')}

🎨 颜�要修复的文件 (${this.results.suspiciousFiles.length}个):
${this.results.suspiciousFiles.length > 0 ?
  this.results.suspiciousFiles.map(file =>
    `🚨 ${file}`
  ).join('\n') :
  '✅ 未发现需要特别关注的文件'
}

📈 颜色使用统计:
${Object.entries(this.results.colorStats)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20)
  .map(([color, count]) =>
    `${color}: ${count}次`
  ).join('\n')}

💡 修复建议:
1. 将硬编码颜色替换为CSS变量
2. 在主题文件中定义颜色变量
3. 使用语义化的颜色名称
4. 保持颜色一致性

🔍 建议的CSS变量命名:
- --color-primary: 主色调
- --color-secondary: 次色调
- --color-success: 成功色
- --color-warning: 警告色
- --color-danger: 危险色
- --color-info: 信息色
- --color-text: 文本颜色
- --color-bg: 背景颜色
- --color-border: 边框颜色
`;

    console.log(report);

    // 保存详细报告到文件
    const reportFile = path.join(__dirname, '..', 'color-scan-report.md');
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 详细报告已保存到: ${reportFile}`);
  }

  // 运行扫描
  async run() {
    console.log('🔍 开始扫描硬编码颜色...');
    console.log(`📁 项目根目录: ${PROJECT_ROOT}`);

    const startTime = Date.now();

    for (const dir of SCAN_DIRS) {
      const fullPath = path.join(PROJECT_ROOT, dir);
      if (fs.existsSync(fullPath)) {
        console.log(`📂 扫描目录: ${fullPath}`);
        await this.scanDirectory(fullPath);
      } else {
        console.log(`⚠️ 目录不存在: ${fullPath}`);
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️ 扫描完成，耗时: ${duration}秒`);
    this.generateReport();
  }
}

// 运行扫描
const scanner = new ColorScanner();
scanner.run().catch(error => {
  console.error('扫描失败:', error);
  process.exit(1);
});