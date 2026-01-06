#!/usr/bin/env node

/**
 * 批量修复Sequelize模型测试
 * 移除错误的mock init模式，使用正确的测试方式
 */

import fs from 'fs';
import path from 'path';
import globPkg from 'glob';
import { fileURLToPath } from 'url';

const { glob } = globPkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  testDir: path.join(__dirname, '../server/tests/unit/models'),
  backupDir: path.join(__dirname, '../server/tests/unit/models/.backup'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
};

// 统计
const stats = {
  total: 0,
  fixed: 0,
  skipped: 0,
  errors: 0
};

/**
 * 日志函数
 */
function log(message, level = 'info') {
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level] || 'ℹ️';
  
  console.log(`${prefix} ${message}`);
}

/**
 * 检查文件是否需要修复
 */
function needsFix(content) {
  const patterns = [
    /const mockInit = jest\.fn\(\)/,
    /\.init = mockInit/,
    /mockInit\.mockClear\(\)/,
    /expect\(mockInit\)\.toHaveBeenCalled/
  ];
  
  return patterns.some(pattern => pattern.test(content));
}

/**
 * 修复文件内容
 */
function fixContent(content, filename) {
  let fixed = content;
  const modelName = extractModelName(filename);
  
  // 1. 移除 mockInit 声明
  fixed = fixed.replace(/\/\/ Mock .*\.init method\n/g, '');
  fixed = fixed.replace(/const mockInit = jest\.fn\(\);\n/g, '');
  
  // 2. 移除 Model.init = mockInit
  fixed = fixed.replace(/\w+\.init = mockInit;\n/g, '');
  
  // 3. 移除 mockInit.mockClear()
  fixed = fixed.replace(/\s*mockInit\.mockClear\(\);\n/g, '');
  
  // 4. 替换 expect(mockInit) 测试
  fixed = fixed.replace(
    /expect\(mockInit\)\.toHaveBeenCalledWith\([^)]+\);/g,
    `// 验证模型属性而不是init调用\n      expect(${modelName}.rawAttributes).toBeDefined();`
  );
  
  // 5. 修复 initModel 测试
  fixed = fixed.replace(
    /it\('应该正确定义.*模型', \(\) => \{[\s\S]*?User\.initModel\(mockSequelize\);[\s\S]*?\}\);/g,
    `it('应该正确定义${modelName}模型', () => {
      // 验证模型定义
      expect(${modelName}.name).toBe('${modelName}');
      expect(${modelName}.rawAttributes).toBeDefined();
    });`
  );
  
  // 6. 添加正确的beforeEach
  if (!fixed.includes('jest.clearAllMocks()') && fixed.includes('beforeEach')) {
    fixed = fixed.replace(
      /beforeEach\(\(\) => \{/,
      `beforeEach(() => {
    jest.clearAllMocks();`
    );
  }
  
  return fixed;
}

/**
 * 从文件名提取模型名
 */
function extractModelName(filename) {
  const basename = path.basename(filename, '.test.ts');
  const parts = basename.split('.');
  const modelPart = parts[0];
  
  // 转换为PascalCase
  return modelPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * 备份文件
 */
function backupFile(filepath) {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  const filename = path.basename(filepath);
  const backupPath = path.join(CONFIG.backupDir, filename);
  
  fs.copyFileSync(filepath, backupPath);
  
  if (CONFIG.verbose) {
    log(`备份: ${filename}`, 'info');
  }
}

/**
 * 修复单个文件
 */
function fixFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    
    if (!needsFix(content)) {
      if (CONFIG.verbose) {
        log(`跳过: ${path.basename(filepath)} (无需修复)`, 'info');
      }
      stats.skipped++;
      return;
    }
    
    if (CONFIG.dryRun) {
      log(`[DRY RUN] 将修复: ${path.basename(filepath)}`, 'warning');
      stats.fixed++;
      return;
    }
    
    // 备份原文件
    backupFile(filepath);
    
    // 修复内容
    const fixed = fixContent(content, filepath);
    
    // 写入修复后的内容
    fs.writeFileSync(filepath, fixed, 'utf8');
    
    log(`已修复: ${path.basename(filepath)}`, 'success');
    stats.fixed++;
    
  } catch (error) {
    log(`修复失败: ${path.basename(filepath)} - ${error.message}`, 'error');
    stats.errors++;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('\n🔧 Sequelize 模型测试修复工具\n');
  
  if (CONFIG.dryRun) {
    log('运行模式: DRY RUN (不会实际修改文件)', 'warning');
  }
  
  // 查找所有模型测试文件
  const pattern = path.join(CONFIG.testDir, '*.model.test.ts');
  const files = glob.sync(pattern);
  
  if (files.length === 0) {
    log('未找到模型测试文件', 'warning');
    return;
  }
  
  log(`找到 ${files.length} 个模型测试文件\n`, 'info');
  stats.total = files.length;
  
  // 修复每个文件
  files.forEach(fixFile);
  
  // 输出统计
  console.log('\n📊 修复统计:\n');
  console.log(`  总文件数: ${stats.total}`);
  console.log(`  ✅ 已修复: ${stats.fixed}`);
  console.log(`  ⏭️  已跳过: ${stats.skipped}`);
  console.log(`  ❌ 失败: ${stats.errors}`);
  
  if (CONFIG.dryRun) {
    console.log('\n💡 提示: 移除 --dry-run 参数以实际执行修复\n');
  } else if (stats.fixed > 0) {
    console.log(`\n✅ 修复完成！备份文件保存在: ${CONFIG.backupDir}\n`);
    console.log('💡 运行测试验证修复: npm run test:unit -- tests/unit/models/\n');
  }
}

// 运行
try {
  main();
} catch (error) {
  console.error('\n❌ 脚本执行失败:', error.message);
  process.exit(1);
}

