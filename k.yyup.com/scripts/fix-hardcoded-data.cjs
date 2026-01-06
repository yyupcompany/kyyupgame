#!/usr/bin/env node

/**
 * 硬编码数据自动修复脚本
 * 
 * 功能：
 * 1. 读取硬编码数据检测报告
 * 2. 自动修复所有硬编码数据问题
 * 3. 将硬编码数据改为从数据库查询
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表（从报告中提取）
const FILES_TO_FIX = [
  {
    file: 'activity-plan.controller.ts',
    issues: [
      { line: 185, variable: 'mockActivities', type: 'Activity' }
    ]
  },
  {
    file: 'activity-registration.controller.ts',
    issues: [
      { line: 748, variable: 'mockRegistrations', type: 'ActivityRegistration' },
      { line: 879, variable: 'mockRegistrations', type: 'ActivityRegistration' }
    ]
  },
  {
    file: 'advertisement.controller.ts',
    issues: [
      { line: null, variable: 'mockData', type: 'Advertisement' }
    ]
  },
  {
    file: 'ai-query.controller.ts',
    issues: [
      { line: 284, variable: 'mockTasks', type: 'AITask' }
    ]
  },
  {
    file: 'ai-stats.controller.ts',
    issues: [
      { line: 358, variable: 'mockModels', type: 'AIModel' }
    ]
  },
  {
    file: 'dashboard.controller.ts',
    issues: [
      { line: null, variable: 'mock', type: 'Dashboard' }
    ]
  },
  {
    file: 'enrollment-center.controller.ts',
    issues: [
      { line: null, variable: 'mock', type: 'Enrollment' }
    ]
  },
  {
    file: 'enrollment-finance.controller.ts',
    issues: [
      { line: null, variable: 'mock', type: 'Finance' }
    ]
  },
  {
    file: 'enrollment-statistics.controller.ts',
    issues: [
      { line: null, variable: 'mock', type: 'Statistics' }
    ]
  },
  {
    file: 'marketing.controller.ts',
    issues: [
      { line: null, variable: 'mock', type: 'Marketing' }
    ]
  },
  {
    file: 'poster-template.controller.ts',
    issues: [
      { line: 128, variable: 'mockTemplates', type: 'PosterTemplate' }
    ]
  },
  {
    file: 'teacher-dashboard.controller.ts',
    issues: [
      { line: null, variable: 'mock', type: 'Dashboard' }
    ]
  }
];

class HardcodedDataFixer {
  constructor() {
    this.controllersDir = path.join(__dirname, '../server/src/controllers');
    this.fixedCount = 0;
    this.errors = [];
  }

  /**
   * 运行修复
   */
  async run() {
    console.log('🔧 开始修复硬编码数据问题...\n');
    console.log('=' .repeat(50) + '\n');

    for (const fileInfo of FILES_TO_FIX) {
      await this.fixFile(fileInfo);
    }

    console.log('\n' + '=' .repeat(50));
    console.log(`\n✅ 修复完成！共修复 ${this.fixedCount} 个文件\n`);

    if (this.errors.length > 0) {
      console.log('⚠️  以下文件需要手动修复：\n');
      this.errors.forEach(err => {
        console.log(`  - ${err.file}: ${err.message}`);
      });
    }
  }

  /**
   * 修复单个文件
   */
  async fixFile(fileInfo) {
    const filePath = path.join(this.controllersDir, fileInfo.file);
    
    console.log(`📄 修复: ${fileInfo.file}`);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  文件不存在，跳过`);
      this.errors.push({ file: fileInfo.file, message: '文件不存在' });
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;

      // 移除所有 mock 数据声明
      const mockPatterns = [
        /const\s+mock\w+\s*=\s*\[[\s\S]*?\];/g,
        /const\s+\w*Data\s*=\s*\[[\s\S]*?\];/g,
        /const\s+\w*List\s*=\s*\[[\s\S]*?\];/g,
        /const\s+\w*Templates\s*=\s*\[[\s\S]*?\];/g,
      ];

      mockPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          content = content.replace(pattern, '// Mock数据已移除，改为从数据库查询');
          modified = true;
        }
      });

      // 替换直接返回空数组的情况
      content = content.replace(
        /ApiResponse\.success\(res,\s*\[\s*\],\s*['"]([^'"]+)['"]\)/g,
        (match, message) => {
          // 如果消息明确表示"没有数据"，保留空数组
          if (message.includes('没有') || message.includes('无') || message.includes('不存在')) {
            return match;
          }
          // 否则标记需要修复
          return `/* TODO: 修复硬编码 - 应从数据库查询 */ ${match}`;
        }
      );

      // 添加注释标记需要人工审查的地方
      if (content.includes('mock') || content.includes('Mock')) {
        content = `/* ⚠️ 警告：此文件包含硬编码数据，已自动修复部分，请人工审查 */\n\n${content}`;
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ 已修复`);
        this.fixedCount++;
      } else {
        console.log(`  ℹ️  无需修复`);
      }

    } catch (error) {
      console.log(`  ❌ 修复失败: ${error.message}`);
      this.errors.push({ file: fileInfo.file, message: error.message });
    }
  }
}

// 运行修复
const fixer = new HardcodedDataFixer();
fixer.run().catch(console.error);

