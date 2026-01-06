#!/usr/bin/env node

/**
 * 修复使用 mock 变量的代码
 * 
 * 功能：
 * 1. 查找所有使用 mock 变量但变量已被注释的情况
 * 2. 将这些使用改为返回空数组或空对象
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '../server/src/controllers');

class MockUsageFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
  }

  async run() {
    console.log('🔧 修复 mock 变量使用\n');
    console.log('=' .repeat(50) + '\n');

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
  }

  async fixFile(filename) {
    const filePath = path.join(controllersDir, filename);
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;
      let modified = false;

      // 查找所有被注释的 mock 变量名
      const commentedMockPattern = /\/\/ const (mock\w+) =/g;
      const commentedMocks = [];
      let match;
      
      while ((match = commentedMockPattern.exec(content)) !== null) {
        commentedMocks.push(match[1]);
      }

      if (commentedMocks.length === 0) {
        return; // 没有被注释的 mock 变量
      }

      // 对每个被注释的 mock 变量，查找其使用并替换
      commentedMocks.forEach(mockVar => {
        // 替换 data: mockVar
        const dataPattern = new RegExp(`data:\\s*${mockVar}\\b`, 'g');
        if (dataPattern.test(content)) {
          content = content.replace(dataPattern, 'data: []');
          modified = true;
        }

        // 替换 mockVar.length
        const lengthPattern = new RegExp(`${mockVar}\\.length`, 'g');
        if (lengthPattern.test(content)) {
          content = content.replace(lengthPattern, '0');
          modified = true;
        }

        // 替换 ApiResponse.success(res, mockVar, ...)
        const successPattern = new RegExp(
          `ApiResponse\\.(success|ok)\\(res,\\s*${mockVar}\\b`,
          'g'
        );
        if (successPattern.test(content)) {
          content = content.replace(successPattern, 'ApiResponse.$1(res, []');
          modified = true;
        }

        // 替换 return mockVar
        const returnPattern = new RegExp(`return\\s+${mockVar}\\b`, 'g');
        if (returnPattern.test(content)) {
          content = content.replace(returnPattern, 'return []');
          modified = true;
        }
      });

      if (modified && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        this.fixedFiles.push(filename);
        console.log(`✅ ${filename} (修复了 ${commentedMocks.length} 个 mock 变量)`);
      }

    } catch (error) {
      this.errors.push({ file: filename, message: error.message });
      console.log(`❌ ${filename}: ${error.message}`);
    }
  }
}

// 运行修复
const fixer = new MockUsageFixer();
fixer.run().catch(console.error);

