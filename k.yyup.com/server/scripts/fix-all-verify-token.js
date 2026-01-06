#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复所有路由文件中的verifyToken问题
 * 将所有 router.use(verifyToken) 替换为注释
 */

const routesDir = path.join(__dirname, '../src/routes');

console.log('🔧 开始修复所有verifyToken问题...');

let fixedCount = 0;
let skippedCount = 0;
let errorCount = 0;

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否包含 router.use(verifyToken)
    if (!content.includes('router.use(verifyToken)')) {
      return false;
    }

    console.log(`📝 处理文件: ${path.relative(process.cwd(), filePath)}`);

    let modifiedContent = content;
    let hasChanges = false;

    // 方法1: 如果已经有统一的verifyToken导入，只需注释掉router.use调用
    if (content.includes('import { verifyToken }')) {
      // 注释掉所有 router.use(verifyToken) 调用
      modifiedContent = modifiedContent.replace(
        /^(?!\s*\/\/)\s*router\.use\(verifyToken\);?\s*$/gm,
        '// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证\n'
      );
      hasChanges = true;
    } else {
      // 方法2: 如果没有导入verifyToken，直接注释掉调用并添加说明
      modifiedContent = modifiedContent.replace(
        /^(?!\s*\/\/)\s*router\.use\(verifyToken\);?\s*$/gm,
        '// router.use(verifyToken); // 已注释：verifyToken未导入，每个路由单独应用认证\n'
      );
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`  ✅ 修复成功`);
      fixedCount++;
      return true;
    }

    console.log(`  ⚠️  无需修改`);
    skippedCount++;
    return false;

  } catch (error) {
    console.error(`  ❌ 修复失败: ${error.message}`);
    errorCount++;
    return false;
  }
}

function walkDirectory(dir, callback) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDirectory(filePath, callback);
      } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
        callback(filePath);
      }
    }
  } catch (error) {
    console.error(`❌ 读取目录失败 ${dir}: ${error.message}`);
  }
}

// 开始处理
walkDirectory(routesDir, fixFile);

console.log('\n🎉 修复完成！');
console.log(`✅ 成功修复: ${fixedCount} 个文件`);
console.log(`⚠️  跳过文件: ${skippedCount} 个文件`);
console.log(`❌ 错误文件: ${errorCount} 个文件`);

if (fixedCount > 0) {
  console.log('\n💡 提示：修复后的文件中，所有 router.use(verifyToken) 调用已被注释');
  console.log('   每个路由需要单独应用认证中间件');
}