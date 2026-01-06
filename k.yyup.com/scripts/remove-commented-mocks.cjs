#!/usr/bin/env node

/**
 * 移除已注释的 mock 代码
 * 
 * 功能：
 * 1. 移除所有被注释的 mock 数据声明
 * 2. 移除 TODO 注释
 * 3. 清理空行
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '../server/src/controllers');

class MockRemover {
  constructor() {
    this.cleanedFiles = [];
    this.errors = [];
  }

  async run() {
    console.log('🧹 清理已注释的 mock 代码\n');
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

      // 1. 移除文件顶部的警告注释
      if (content.startsWith('/* ⚠️ 警告：此文件包含硬编码数据')) {
        content = content.replace(/^\/\* ⚠️ 警告：[\s\S]*?\*\/\n\n/, '');
        modified = true;
      }

      // 2. 移除 TODO 注释块和被注释的 mock 代码
      content = content.replace(/\/\* TODO: 修复硬编码[\s\S]*?\*\/\n\s*\/\/ const mock[\s\S]*?\/\/ \};?\n/g, '');
      modified = true;

      // 3. 移除单行 TODO 注释
      content = content.replace(/\/\* TODO: 检查是否应从数据库查询 \*\/ /g, '');
      
      // 4. 清理多余的空行（超过2个连续空行）
      content = content.replace(/\n{3,}/g, '\n\n');

      // 5. 移除被注释的 mock 变量声明（单独的）
      content = content.replace(/\s*\/\/ const mock\w+ = [\s\S]*?\/\/ \};?\n/g, '\n');

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
const remover = new MockRemover();
remover.run().catch(console.error);

