#!/usr/bin/env node

/**
 * 最终清理所有 mock 代码
 * 
 * 功能：
 * 1. 完全移除所有被注释的 mock 代码块
 * 2. 移除相关的 TODO 注释
 * 3. 清理多余的空行
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '../server/src/controllers');

class FinalCleaner {
  constructor() {
    this.cleanedFiles = [];
    this.errors = [];
  }

  async run() {
    console.log('🧹 最终清理所有 mock 代码\n');
    console.log('=' .repeat(50) + '\n');

    const files = fs.readdirSync(controllersDir)
      .filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of files) {
      await this.cleanFile(file);
    }

    console.log('\n' + '=' .repeat(50));
    console.log(`\n✅ 清理完成！`);
    console.log(`  - 清理文件数: ${this.cleanedFiles.length}`);
    console.log(`  - 错误数: ${this.errors.length}\n`);

    if (this.cleanedFiles.length > 0) {
      console.log('📝 已清理的文件：\n');
      this.cleanedFiles.forEach(f => console.log(`  ✓ ${f}`));
    }
  }

  async cleanFile(filename) {
    const filePath = path.join(controllersDir, filename);
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;
      let modified = false;

      // 1. 移除 TODO 注释行
      content = content.replace(/\s*\/\* TODO: 修复硬编码.*?\*\/\n/g, '');
      
      // 2. 移除被注释的 mock 变量声明（多行）
      // 匹配 // const mockXxx = [ ... // ];
      content = content.replace(/\s*\/\/ const mock\w+ = \[[\s\S]*?\/\/ \];?\n/g, '\n');
      
      // 3. 移除被注释的 mock 变量声明（单行对象）
      // 匹配 // const mockXxx = { ... };
      content = content.replace(/\s*\/\/ const mock\w+ = \{[\s\S]*?\/\/ \};?\n/g, '\n');
      
      // 4. 移除单独的注释行（如果数据库查询失败，返回模拟数据）
      content = content.replace(/\s*\/\/ 如果数据库查询失败，返回模拟数据\n/g, '');
      content = content.replace(/\s*\/\/ 返回模拟数据\n/g, '');
      
      // 5. 清理多余的空行（超过2个连续空行）
      content = content.replace(/\n{3,}/g, '\n\n');
      
      // 6. 移除文件顶部的警告注释
      if (content.startsWith('/* ⚠️ 警告')) {
        content = content.replace(/^\/\* ⚠️ 警告[\s\S]*?\*\/\n+/, '');
        modified = true;
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        this.cleanedFiles.push(filename);
        console.log(`✅ ${filename}`);
        modified = true;
      }

    } catch (error) {
      this.errors.push({ file: filename, message: error.message });
      console.log(`❌ ${filename}: ${error.message}`);
    }
  }
}

// 运行清理
const cleaner = new FinalCleaner();
cleaner.run().catch(console.error);

