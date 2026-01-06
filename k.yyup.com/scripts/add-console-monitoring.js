#!/usr/bin/env node

/**
 * 批量添加控制台错误检测到测试文件
 * 用法: node scripts/add-console-monitoring.js [pattern] [dry-run]
 * 示例: node scripts/add-console-monitoring.js "tests/unit/*.test.ts" --dry-run
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const PATTERN = process.argv[2] || 'tests/unit/*.test.ts';
const IS_DRY_RUN = process.argv.includes('--dry-run');

console.log('🚀 开始批量添加控制台错误检测...');
console.log(`📁 搜索模式: ${PATTERN}`);
console.log(`🔍 预览模式: ${IS_DRY_RUN ? '是' : '否'}`);

// 检查文件是否已经有控制台错误检测
function hasConsoleMonitoring(content) {
  return content.includes('startConsoleMonitoring') ||
         content.includes('expectNoConsoleErrors') ||
         content.includes('consoleMonitoring');
}

// 检查文件是否已经导入了beforeEach/afterEach
function hasHooks(content) {
  return content.includes('beforeEach') || content.includes('afterEach');
}

// 生成控制台错误检测导入语句
function generateImport() {
  return `import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';`;
}

// 生成beforeEach/afterEach代码
function generateHooks() {
  return `  beforeEach(() => {
    startConsoleMonitoring()
    vi.clearAllMocks()
  })

  afterEach(() => {
    expectNoConsoleErrors()
    stopConsoleMonitoring()
  })`;
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    if (hasConsoleMonitoring(content)) {
      console.log(`⏭️  跳过已有控制台检测: ${path.relative(process.cwd(), filePath)}`);
      return { skipped: true, modified: false };
    }

    const lines = content.split('\n');
    const importLineIndex = lines.findIndex(line =>
      line.includes('import') && line.includes('vitest')
    );

    if (importLineIndex === -1) {
      console.log(`⚠️  无法找到vitest导入: ${path.relative(process.cwd(), filePath)}`);
      return { skipped: true, modified: false };
    }

    // 添加控制台监控导入
    lines.splice(importLineIndex + 1, 0, generateImport());

    // 查找主要的describe块
    let mainDescribeIndex = -1;
    let braceCount = 0;
    let inDescribe = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('describe(') && !line.includes('//')) {
        if (!inDescribe) {
          mainDescribeIndex = i;
          inDescribe = true;
        }
      }

      if (inDescribe) {
        braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

        if (braceCount > 0 && line.includes('{') && line.includes(')') && line.includes('describe')) {
          // 在describe块的开始添加hooks
          const indent = line.match(/^(\s*)/)[1];
          const hooks = generateHooks().split('\n').map(hookLine =>
            hookLine ? indent + '  ' + hookLine : hookLine
          ).join('\n');

          lines.splice(i + 1, 0, hooks);
          break;
        }
      }
    }

    const newContent = lines.join('\n');

    if (IS_DRY_RUN) {
      console.log(`📝 将修改: ${path.relative(process.cwd(), filePath)}`);
      return { skipped: false, modified: true };
    } else {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ 已修改: ${path.relative(process.cwd(), filePath)}`);
      return { skipped: false, modified: true };
    }

  } catch (error) {
    console.log(`❌ 处理失败: ${path.relative(process.cwd(), filePath)} - ${error.message}`);
    return { skipped: true, modified: false, error: error.message };
  }
}

// 主函数
async function main() {
  try {
    const files = await glob(PATTERN);
    console.log(`📊 找到 ${files.length} 个测试文件`);

    const stats = {
      total: files.length,
      processed: 0,
      modified: 0,
      skipped: 0,
      errors: 0
    };

    for (const file of files) {
      const result = processFile(file);

      stats.processed++;

      if (result.error) {
        stats.errors++;
      } else if (result.skipped) {
        stats.skipped++;
      } else if (result.modified) {
        stats.modified++;
      }
    }

    console.log('\n📈 处理完成统计:');
    console.log(`   总文件数: ${stats.total}`);
    console.log(`   已处理: ${stats.processed}`);
    console.log(`   已修改: ${stats.modified}`);
    console.log(`   已跳过: ${stats.skipped}`);
    console.log(`   错误数: ${stats.errors}`);

    if (!IS_DRY_RUN && stats.modified > 0) {
      console.log(`\n✨ 成功为 ${stats.modified} 个文件添加了控制台错误检测！`);
    } else if (IS_DRY_RUN) {
      console.log(`\n🔍 预览模式：将修改 ${stats.modified} 个文件。使用 --dry-run=false 实际应用更改。`);
    }

  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

// 检查依赖
if (!fs.existsSync('node_modules/glob')) {
  console.log('📦 安装依赖...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
}

main();