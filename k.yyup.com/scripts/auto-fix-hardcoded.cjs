#!/usr/bin/env node

/**
 * 自动修复硬编码数据脚本
 * 
 * 策略：
 * 1. 将所有 mock 数据声明注释掉
 * 2. 添加 TODO 注释提示需要从数据库查询
 * 3. 生成修复报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const controllersDir = path.join(__dirname, '../server/src/controllers');

class AutoFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
  }

  async run() {
    console.log('🔧 自动修复硬编码数据\n');
    console.log('=' .repeat(50) + '\n');

    // 获取所有控制器文件
    const files = fs.readdirSync(controllersDir)
      .filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of files) {
      await this.fixFile(file);
    }

    console.log('\n' + '=' .repeat(50));
    console.log(`\n✅ 修复完成！`);
    console.log(`  - 修复文件数: ${this.fixedFiles.length}`);
    console.log(`  - 错误数: ${this.errors.length}\n`);

    if (this.fixedFiles.length > 0) {
      console.log('📝 已修复的文件：\n');
      this.fixedFiles.forEach(f => console.log(`  ✓ ${f}`));
    }

    if (this.errors.length > 0) {
      console.log('\n⚠️  错误列表：\n');
      this.errors.forEach(e => console.log(`  ✗ ${e.file}: ${e.message}`));
    }
  }

  async fixFile(filename) {
    const filePath = path.join(controllersDir, filename);
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;
      let modified = false;

      // 1. 注释掉所有 mock 数据声明
      const mockPatterns = [
        {
          // const mockXxx = [...]
          pattern: /(const\s+(mock\w+)\s*=\s*\[[\s\S]*?\];)/g,
          replacement: (match, fullMatch, varName) => {
            return `/* TODO: 修复硬编码 - ${varName} 应从数据库查询 */\n    // ${fullMatch.replace(/\n/g, '\n    // ')}`;
          }
        },
        {
          // const mockXxx = {...}
          pattern: /(const\s+(mock\w+)\s*=\s*\{[\s\S]*?\};)/g,
          replacement: (match, fullMatch, varName) => {
            return `/* TODO: 修复硬编码 - ${varName} 应从数据库查询 */\n    // ${fullMatch.replace(/\n/g, '\n    // ')}`;
          }
        }
      ];

      mockPatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      });

      // 2. 标记直接返回空数组的情况（但保留合理的情况）
      content = content.replace(
        /ApiResponse\.(success|ok)\(res,\s*\[\s*\],\s*['"]([^'"]+)['"]\)/g,
        (match, method, message) => {
          // 如果消息明确表示"没有数据"，保留
          if (message.includes('没有') || message.includes('无') || message.includes('不存在') || 
              message.includes('未找到') || message.includes('空')) {
            return match;
          }
          // 否则标记
          modified = true;
          return `/* TODO: 检查是否应从数据库查询 */ ${match}`;
        }
      );

      // 3. 标记使用 mock 变量的地方
      const mockUsagePattern = /\b(mock\w+)\b/g;
      let mockUsages = [];
      let match;
      
      while ((match = mockUsagePattern.exec(content)) !== null) {
        const varName = match[1];
        if (!mockUsages.includes(varName)) {
          mockUsages.push(varName);
        }
      }

      if (mockUsages.length > 0 && modified) {
        // 在文件顶部添加警告注释
        if (!content.startsWith('/*')) {
          content = `/* ⚠️ 警告：此文件包含硬编码数据，需要修复\n * Mock变量: ${mockUsages.join(', ')}\n * 请将这些变量改为从数据库查询\n */\n\n${content}`;
          modified = true;
        }
      }

      // 如果有修改，保存文件
      if (modified && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        this.fixedFiles.push(filename);
        console.log(`✅ ${filename}`);
      }

    } catch (error) {
      this.errors.push({ file: filename, message: error.message });
      console.log(`❌ ${filename}: ${error.message}`);
    }
  }
}

// 运行修复
const fixer = new AutoFixer();
fixer.run().catch(console.error);

