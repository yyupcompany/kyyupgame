#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROUTES_DIR = '/home/zhgue/kyyupgame/k.yyup.com/server/src/routes';

// 统计信息
const stats = {
  totalProcessed: 0,
  fixedNoAuth: 0,
  fixedCommentedAuth: 0,
  fixedImportPaths: 0,
  fixedIndividualAuth: 0,
  errors: []
};

// 修复单个路由文件
function fixRouteFile(filePath) {
  const fileName = path.basename(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  console.log(`\n🔧 正在修复: ${fileName}`);

  let hasChanges = false;
  const changes = [];

  // 1. 修复导入路径
  if (content.includes("from '../middleware/auth'")) {
    content = content.replace(
      "from '../middleware/auth'",
      "from '../middlewares/auth.middleware'"
    );
    changes.push('修复导入路径: ../middleware/auth -> ../middlewares/auth.middleware');
    hasChanges = true;
  }

  if (content.includes("from '../middleware/authMiddleware'")) {
    content = content.replace(
      "from '../middleware/authMiddleware'",
      "from '../middlewares/auth.middleware'"
    );
    changes.push('修复导入路径: ../middleware/authMiddleware -> ../middlewares/auth.middleware');
    hasChanges = true;
  }

  // 2. 替换 authenticate 为 verifyToken
  if (content.includes('authenticate') && !content.includes('verifyToken')) {
    // 检查是否在导入语句中
    const importMatch = content.match(/import\s*\{[^}]*authenticate[^}]*\}/);
    if (importMatch) {
      content = content.replace(/authenticate/g, 'verifyToken');
      changes.push('替换: authenticate -> verifyToken');
      hasChanges = true;
    }
  }

  // 3. 添加缺少的导入
  if (!content.includes('import') || !content.includes('verifyToken')) {
    // 在文件开头添加导入
    const importLine = "import { verifyToken, checkPermission } from '../middlewares/auth.middleware';\n";

    // 找到第一个import语句的位置
    const importMatch = content.match(/^import.*$/m);
    if (importMatch) {
      content = importLine + content;
      changes.push('添加认证中间件导入');
      hasChanges = true;
    } else {
      // 如果没有其他import，在Router导入后添加
      const routerMatch = content.match(/import.*Router.*from.*express/);
      if (routerMatch) {
        const lines = content.split('\n');
        const insertIndex = lines.findIndex(line => line.includes('express')) + 1;
        lines.splice(insertIndex, 0, '', importLine);
        content = lines.join('\n');
        changes.push('添加认证中间件导入');
        hasChanges = true;
      }
    }
  }

  // 4. 恢复被注释的全局认证
  const commentedAuthMatch = content.match(/^(\/\/\s*)router\.use\(verifyToken\);?$/m);
  if (commentedAuthMatch) {
    content = content.replace(/^(\/\/\s*)router\.use\(verifyToken\);?$/m, 'router.use(verifyToken);');
    changes.push('恢复被注释的全局认证');
    hasChanges = true;
  }

  // 5. 添加全局认证（如果没有）
  const hasGlobalAuth = content.includes('router.use(verifyToken)') && !content.includes('// router.use(verifyToken)');
  const hasAnyAuth = content.includes('verifyToken') || content.includes('checkPermission');

  if (hasAnyAuth && !hasGlobalAuth) {
    // 在router定义后添加全局认证
    const routerDefinitionMatch = content.match(/const router = Router\(\);?\s*\n/);
    if (routerDefinitionMatch) {
      const insertPosition = content.indexOf(routerDefinitionMatch[0]) + routerDefinitionMatch[0].length;
      content = content.slice(0, insertPosition) +
                '\n// 全局认证中间件 - 所有路由都需要认证\nrouter.use(verifyToken);\n' +
                content.slice(insertPosition);
      changes.push('添加全局认证中间件');
      hasChanges = true;
    }
  }

  // 6. 移除单独的verifyToken中间件（保留checkPermission）
  const lines = content.split('\n');
  const modifiedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检查是否是路由定义行
    const routeMatch = line.match(/^\s*router\.(get|post|put|delete|patch)\s*\([^)]*\)/);
    if (routeMatch) {
      // 获取完整的路由定义（可能跨越多行）
      let fullRouteLine = line;
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(')') && !lines[j].includes('=>')) {
        fullRouteLine += '\n' + lines[j];
        j++;
      }
      if (j < lines.length) {
        fullRouteLine += '\n' + lines[j];
      }

      // 移除verifyToken，保留checkPermission
      if (fullRouteLine.includes('verifyToken') && !fullRouteLine.includes('checkPermission')) {
        // 只有verifyToken的情况
        const cleanedRoute = fullRouteLine.replace(/,\s*verifyToken/g, '');
        modifiedLines.push(cleanedRoute);
        changes.push('移除单独的verifyToken中间件（使用全局认证）');
        hasChanges = true;
        i = j; // 跳过已处理的行
        continue;
      }
    }

    modifiedLines.push(line);
  }

  if (hasChanges) {
    content = modifiedLines.join('\n');
  }

  // 7. 确保有导出语句
  if (!content.includes('export default')) {
    content += '\nexport default router;';
    changes.push('添加默认导出');
    hasChanges = true;
  }

  // 8. 统一格式化
  // 确保全局认证后有正确的换行
  content = content.replace(/router\.use\(verifyToken\);(\s*)/g, 'router.use(verifyToken);\n\n');

  // 保存文件
  if (hasChanges) {
    // 创建备份
    const backupPath = filePath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, originalContent);

    // 保存修复后的文件
    fs.writeFileSync(filePath, content);

    console.log(`✅ 修复完成，共 ${changes.length} 项修改:`);
    changes.forEach(change => console.log(`   - ${change}`));
    console.log(`   📁 备份文件: ${path.basename(backupPath)}`);

    // 更新统计
    if (changes.some(c => c.includes('添加认证中间件导入'))) stats.fixedNoAuth++;
    if (changes.some(c => c.includes('恢复被注释的全局认证'))) stats.fixedCommentedAuth++;
    if (changes.some(c => c.includes('修复导入路径'))) stats.fixedImportPaths++;
    if (changes.some(c => c.includes('移除单独的verifyToken'))) stats.fixedIndividualAuth++;

    return true;
  } else {
    console.log(`ℹ️  无需修复`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🚀 开始自动修复路由文件权限配置...\n');

  // 获取所有路由文件
  const files = fs.readdirSync(ROUTES_DIR)
    .filter(file => file.endsWith('.routes.ts') || file.endsWith('.routes.js'))
    .filter(file => !file.includes('.backup') && !file.includes('.bak'))
    .filter(file => !['index.ts', 'add-permission.ts', 'fix-permissions.ts', 'api.ts', 'ai.ts'].includes(file))
    .filter(file => !file.includes('ROUTES_')) // 排除报告文件
    .filter(file => file !== 'routes-auth-analysis-report.txt' && file !== 'fix-routes-auth.cjs');

  console.log(`📊 共找到 ${files.length} 个路由文件需要处理\n`);

  // 询问修复模式
  const args = process.argv.slice(2);
  const mode = args[0] || 'all';

  let filesToFix = files;

  if (mode === 'no-auth') {
    // 只修复完全没有认证的文件
    console.log('🔍 筛选完全没有认证的文件...');
    filesToFix = files.filter(file => {
      const content = fs.readFileSync(path.join(ROUTES_DIR, file), 'utf8');
      return !content.includes('verifyToken') && !content.includes('authenticate');
    });
    console.log(`找到 ${filesToFix.length} 个需要修复的文件\n`);
  } else if (mode === 'commented') {
    // 只修复被注释的文件
    console.log('🔍 筛选全局认证被注释的文件...');
    filesToFix = files.filter(file => {
      const content = fs.readFileSync(path.join(ROUTES_DIR, file), 'utf8');
      return content.includes('// router.use(verifyToken)');
    });
    console.log(`找到 ${filesToFix.length} 个需要修复的文件\n`);
  } else if (mode === 'sample') {
    // 修复前5个文件作为示例
    filesToFix = files.slice(0, 5);
    console.log(`📝 示例模式：只修复前 5 个文件\n`);
  }

  // 处理每个文件
  for (const file of filesToFix) {
    stats.totalProcessed++;
    try {
      fixRouteFile(path.join(ROUTES_DIR, file));
    } catch (error) {
      console.error(`❌ 修复 ${file} 时出错:`, error.message);
      stats.errors.push(`${file}: ${error.message}`);
    }
  }

  // 输出总结
  console.log('\n📈 修复总结:');
  console.log(`├── 处理文件数: ${stats.totalProcessed}`);
  console.log(`├── 修复无认证: ${stats.fixedNoAuth}`);
  console.log(`├── 恢复注释认证: ${stats.fixedCommentedAuth}`);
  console.log(`├── 修复导入路径: ${stats.fixedImportPaths}`);
  console.log(`├── 优化单独认证: ${stats.fixedIndividualAuth}`);
  console.log(`└── 错误数: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    stats.errors.forEach(error => console.log(`   - ${error}`));
  }

  console.log('\n🎯 下一步建议:');
  console.log('1. 运行测试确保修复没有破坏功能');
  console.log('2. 检查权限代码是否正确应用');
  console.log('3. 清理备份文件（如果确认修复成功）');
  console.log('\n💡 清理备份文件命令:');
  console.log(`find ${ROUTES_DIR} -name "*.backup.*" -delete`);
}

// 运行修复
if (require.main === module) {
  console.log('使用方法:');
  console.log('node fix-routes-auth.cjs [模式]');
  console.log('\n可用模式:');
  console.log('  all       - 修复所有文件（默认）');
  console.log('  no-auth   - 只修复完全没有认证的文件');
  console.log('  commented - 只修复全局认证被注释的文件');
  console.log('  sample    - 示例模式，只修复前5个文件');
  console.log('');

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    process.exit(0);
  }

  main();
}

module.exports = { fixRouteFile };