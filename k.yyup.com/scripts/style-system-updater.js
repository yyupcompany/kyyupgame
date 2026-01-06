#!/usr/bin/env node

/**
 * 现代化样式系统更新工具
 *
 * 功能：
 * 1. 扫描硬编码样式值
 * 2. 自动替换为CSS变量
 * 3. 生成样式变量定义
 * 4. 验证替换结果
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// 颜色映射表 - 硬编码颜色 -> CSS变量
const COLOR_MAPPING = {
  // 主色调
  '#409eff': 'var(--primary-color)',
  '#1890ff': 'var(--primary-color)',
  '#3b82f6': 'var(--primary-color)',
  '#667eea': 'var(--primary-color)',
  '#6366f1': 'var(--primary-color)',

  // 成功色
  '#67c23a': 'var(--success-color)',
  '#52c41a': 'var(--success-color)',
  '#10b981': 'var(--success-color)',
  '#22c55e': 'var(--success-color)',

  // 警告色
  '#e6a23c': 'var(--warning-color)',
  '#f59e0b': 'var(--warning-color)',
  '#ffc107': 'var(--warning-color)',
  '#fbbf24': 'var(--warning-color)',

  // 危险色
  '#f56c6c': 'var(--danger-color)',
  '#ef4444': 'var(--danger-color)',
  '#dc3545': 'var(--danger-color)',
  '#e53e3e': 'var(--danger-color)',

  // 文本色
  '#333333': 'var(--text-primary)',
  '#333': 'var(--text-primary)',
  '#666666': 'var(--text-secondary)',
  '#666': 'var(--text-secondary)',
  '#999999': 'var(--text-tertiary)',
  '#999': 'var(--text-tertiary)',
  '#1f2937': 'var(--text-primary)',
  '#6b7280': 'var(--text-secondary)',
  '#9ca3af': 'var(--text-tertiary)',

  // 背景色
  '#ffffff': 'var(--bg-white)',
  '#fff': 'var(--bg-white)',
  '#f5f5f5': 'var(--bg-gray)',
  '#f0f0f0': 'var(--bg-gray-light)',
  '#f8f9fa': 'var(--bg-gray-light)',
  '#fafbfc': 'var(--bg-gray-light)',

  // 边框色
  '#e4e7ed': 'var(--border-color)',
  '#dcdfe6': 'var(--border-color)',
  '#e5e7eb': 'var(--border-color)',
  '#d1d5db': 'var(--border-color)',

  // 阴影色
  'rgba(0, 0, 0, 0.1)': 'var(--shadow-light)',
  'rgba(0, 0, 0, 0.15)': 'var(--shadow-medium)',
  'rgba(0, 0, 0, 0.2)': 'var(--shadow-heavy)',
  'rgba(0, 0, 0, 0.05)': 'var(--shadow-lighter)',
};

// 尺寸映射表
const SIZE_MAPPING = {
  '4px': 'var(--spacing-xs)',
  '8px': 'var(--spacing-sm)',
  '12px': 'var(--spacing-md)',
  '16px': 'var(--spacing-lg)',
  '20px': 'var(--spacing-xl)',
  '24px': 'var(--spacing-2xl)',
  '32px': 'var(--spacing-3xl)',

  '12px': 'var(--text-sm)',
  '14px': 'var(--text-base)',
  '16px': 'var(--text-lg)',
  '18px': 'var(--text-xl)',
  '20px': 'var(--text-2xl)',
  '24px': 'var(--text-3xl)',
};

class StyleSystemUpdater {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      colorsReplaced: 0,
      sizesReplaced: 0,
      errors: []
    };
  }

  // 扫描并替换硬编码样式
  async updateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let modified = false;

      // 替换硬编码颜色
      Object.entries(COLOR_MAPPING).forEach(([hardcoded, variable]) => {
        const regex = new RegExp(this.escapeRegExp(hardcoded), 'g');
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, variable);
          this.stats.colorsReplaced++;
          modified = true;
        }
      });

      // 替换硬编码尺寸
      Object.entries(SIZE_MAPPING).forEach(([hardcoded, variable]) => {
        const regex = new RegExp(`\\b${this.escapeRegExp(hardcoded)}\\b`, 'g');
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, variable);
          this.stats.sizesReplaced++;
          modified = true;
        }
      });

      // 保存修改后的文件
      if (modified) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        this.stats.filesModified++;
        console.log(`✅ 已更新: ${path.relative(PROJECT_ROOT, filePath)}`);
      }

      this.stats.filesProcessed++;

    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
      console.log(`❌ 处理失败: ${filePath} - ${error.message}`);
    }
  }

  // 转义正则表达式特殊字符
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 扫描目录
  async scanDirectory(dir, extensions = ['.vue', '.scss', '.css', '.ts', '.js']) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️ 目录不存在: ${dir}`);
      return;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 跳过node_modules等目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          await this.scanDirectory(fullPath, extensions);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        await this.updateFile(fullPath);
      }
    }
  }

  // 生成CSS变量定义文件
  generateCSSVariables() {
    const cssVars = `
/* 自动生成的CSS变量定义文件 */
:root {
  /* 主色调 */
  --primary-color: #409eff;
  --primary-color-rgb: 64, 158, 255;

  /* 功能色 */
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;

  /* 文本色 */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --text-inverse: #ffffff;

  /* 背景色 */
  --bg-white: #ffffff;
  --bg-gray: #f5f5f5;
  --bg-gray-light: #f8f9fa;
  --bg-dark: #1f2937;

  /* 边框色 */
  --border-color: #e4e7ed;
  --border-light: #f0f0f0;
  --border-dark: #dcdfe6;

  /* 阴影 */
  --shadow-lighter: rgba(0, 0, 0, 0.05);
  --shadow-light: rgba(0, 0, 0, 0.1);
  --shadow-medium: rgba(0, 0, 0, 0.15);
  --shadow-heavy: rgba(0, 0, 0, 0.2);

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* 字体大小 */
  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 20px;
  --text-3xl: 24px;
}

/* 暗色主题 */
[data-theme="dark"] {
  --text-primary: #ffffff;
  --text-secondary: #e5e7eb;
  --text-tertiary: #9ca3af;

  --bg-white: #1f2937;
  --bg-gray: #374151;
  --bg-gray-light: #4b5563;
  --bg-dark: #111827;

  --border-color: #4b5563;
  --border-light: #374151;
  --border-dark: #6b7280;
}
`;

    const outputPath = path.join(PROJECT_ROOT, 'client/src/styles/generated-variables.css');
    fs.writeFileSync(outputPath, cssVars, 'utf8');
    console.log(`📝 CSS变量文件已生成: ${outputPath}`);
  }

  // 显示报告
  showReport() {
    console.log(`
🎨 样式系统更新报告
=====================
📊 处理统计:
- 处理文件数: ${this.stats.filesProcessed}
- 修改文件数: ${this.stats.filesModified}
- 替换颜色数: ${this.stats.colorsReplaced}
- 替换尺寸数: ${this.stats.sizesReplaced}
- 错误数: ${this.stats.errors.length}

${this.stats.errors.length > 0 ? `
❌ 错误列表:
${this.stats.errors.map(e => `  ${e.file}: ${e.error}`).join('\n')}
` : '✅ 没有错误'}

💡 后续步骤:
1. 在主样式文件中导入生成的CSS变量
2. 检查组件样式是否正确显示
3. 测试主题切换功能
4. 根据需要调整变量值
`);
  }

  // 运行更新
  async run() {
    console.log('🚀 开始更新样式系统...\n');

    const startTime = Date.now();

    // 扫描并更新文件
    const scanDirs = [
      'client/src/components',
      'client/src/pages',
      'client/src/layouts'
    ];

    for (const dir of scanDirs) {
      const fullPath = path.join(PROJECT_ROOT, dir);
      console.log(`📂 扫描目录: ${dir}`);
      await this.scanDirectory(fullPath);
    }

    // 生成CSS变量文件
    this.generateCSSVariables();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️ 完成，耗时: ${duration}秒\n`);
    this.showReport();
  }
}

// 运行更新
const updater = new StyleSystemUpdater();
updater.run().catch(console.error);