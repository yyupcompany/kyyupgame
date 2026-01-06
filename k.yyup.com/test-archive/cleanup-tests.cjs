#!/usr/bin/env node

/**
 * 测试文件清理脚本
 * 按照 docs/COMPREHENSIVE_TEST_DOCUMENTATION.md 文档保留正式测试，删除散布的临时测试文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.preservedPaths = new Set();
    this.toDelete = [];
    this.stats = {
      preserved: 0,
      deleted: 0,
      errors: 0
    };
    
    // 根据文档定义需要保留的测试目录和文件
    this.definePreservedPaths();
  }

  /**
   * 定义需要保留的测试路径（基于文档）
   */
  definePreservedPaths() {
    const preservedPaths = [
      // client/tests/ 目录结构（文档中定义的正式测试）
      'client/tests/',
      'client/tests/setup.ts',
      'client/tests/setup/',
      'client/tests/mocks/',
      'client/tests/unit/',
      'client/tests/integration/',
      'client/tests/e2e/',
      'client/tests/utils/',
      
      // 测试配置文件
      'client/vitest.config.ts',
      'client/playwright.config.ts',
      
      // 文档中提到的测试相关文档
      'client/tests/README.md',
      'docs/COMPREHENSIVE_TEST_DOCUMENTATION.md',
      
      // 保留 server/tests 目录（后端测试）
      'server/tests/',
      
      // 保留根目录的 tests 目录中的正式测试
      'tests/ai-assistant/',
      'tests/centers/',
      'tests/frontend/',
      'tests/integration/',
      'tests/performance/',
      'tests/deployment/'
    ];

    // 将路径标准化并添加到保留集合
    preservedPaths.forEach(p => {
      const fullPath = path.resolve(this.projectRoot, p);
      this.preservedPaths.add(fullPath);
    });
  }

  /**
   * 扫描所有测试文件
   */
  scanAllTestFiles() {
    console.log('🔍 扫描所有测试文件...\n');
    
    try {
      // 查找所有测试相关文件（排除保留目录）
      const findCommand = `find . -maxdepth 1 -type f \\( -name "*.test.*" -o -name "*.spec.*" -o -name "test-*" -o -name "*-test.*" -o -name "debug-*" -o -name "check-*" -o -name "verify-*" -o -name "analyze-*" \\)`;
      
      const result = execSync(findCommand, { encoding: 'utf8' });
      const allTestFiles = result.trim().split('\n').filter(file => file.length > 0);
      
      console.log(`📁 在根目录找到 ${allTestFiles.length} 个测试相关文件`);
      
      // 分类文件
      allTestFiles.forEach(file => {
        const fullPath = path.resolve(this.projectRoot, file);
        
        if (this.shouldPreserve(fullPath)) {
          this.stats.preserved++;
        } else {
          this.toDelete.push(fullPath);
        }
      });
      
      console.log(`✅ 需要保留: ${this.stats.preserved} 个文件`);
      console.log(`❌ 需要删除: ${this.toDelete.length} 个文件\n`);
      
    } catch (error) {
      console.error('扫描文件时出错:', error.message);
    }
  }

  /**
   * 判断文件是否应该保留
   */
  shouldPreserve(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // 保留 client/tests/ 下的所有测试文件
    if (relativePath.startsWith('client/tests/')) {
      return true;
    }
    
    // 保留 server/tests/ 下的所有测试文件
    if (relativePath.startsWith('server/tests/')) {
      return true;
    }
    
    // 保留 tests/ 下的正式测试目录
    if (relativePath.startsWith('tests/ai-assistant/') ||
        relativePath.startsWith('tests/centers/') ||
        relativePath.startsWith('tests/frontend/') ||
        relativePath.startsWith('tests/integration/') ||
        relativePath.startsWith('tests/performance/') ||
        relativePath.startsWith('tests/deployment/')) {
      return true;
    }
    
    // 保留测试配置文件
    if (relativePath === 'client/vitest.config.ts' ||
        relativePath === 'client/playwright.config.ts' ||
        relativePath === 'playwright.config.ts' ||
        relativePath === 'vitest.config.ts') {
      return true;
    }
    
    return false;
  }

  /**
   * 显示将要删除的文件列表
   */
  showDeletionList() {
    if (this.toDelete.length === 0) {
      console.log('✅ 没有需要删除的文件');
      return;
    }
    
    console.log('📋 将要删除的文件列表:');
    console.log('=' .repeat(50));
    
    this.toDelete.forEach((file, index) => {
      const relativePath = path.relative(this.projectRoot, file);
      console.log(`${index + 1}. ${relativePath}`);
    });
    
    console.log('=' .repeat(50));
    console.log(`总计: ${this.toDelete.length} 个文件\n`);
  }

  /**
   * 执行删除操作
   */
  async executeCleanup(dryRun = true) {
    if (this.toDelete.length === 0) {
      console.log('✅ 没有需要删除的文件');
      return;
    }
    
    if (dryRun) {
      console.log('🔍 预览模式 - 不会实际删除文件');
      this.showDeletionList();
      return;
    }
    
    console.log('🗑️  开始删除文件...\n');
    
    for (const filePath of this.toDelete) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.stats.deleted++;
          const relativePath = path.relative(this.projectRoot, filePath);
          console.log(`✅ 已删除: ${relativePath}`);
        }
      } catch (error) {
        this.stats.errors++;
        const relativePath = path.relative(this.projectRoot, filePath);
        console.error(`❌ 删除失败: ${relativePath} - ${error.message}`);
      }
    }
    
    console.log('\n📊 清理统计:');
    console.log(`✅ 成功删除: ${this.stats.deleted} 个文件`);
    console.log(`❌ 删除失败: ${this.stats.errors} 个文件`);
    console.log(`📁 保留文件: ${this.stats.preserved} 个文件`);
  }

  /**
   * 运行清理流程
   */
  async run() {
    console.log('🧹 测试文件清理工具');
    console.log('📋 基于 docs/COMPREHENSIVE_TEST_DOCUMENTATION.md 保留正式测试\n');
    
    this.scanAllTestFiles();
    
    // 默认预览模式
    await this.executeCleanup(true);
    
    console.log('\n💡 如需实际执行删除，请运行:');
    console.log('   node cleanup-tests.cjs --execute');
  }
}

// 主程序
async function main() {
  const cleanup = new TestCleanup();
  
  const args = process.argv.slice(2);
  const shouldExecute = args.includes('--execute');
  
  if (shouldExecute) {
    console.log('⚠️  实际删除模式 - 将删除文件！\n');
    cleanup.scanAllTestFiles();
    await cleanup.executeCleanup(false);
  } else {
    await cleanup.run();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestCleanup;
