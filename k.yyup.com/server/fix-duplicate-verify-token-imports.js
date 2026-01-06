const fs = require('fs');
const path = require('path');

/**
 * 批量修复路由文件中的 verifyToken 重复导入问题
 */

const routesDir = path.join(__dirname, 'src/routes');

function fixDuplicateVerifyTokenImports() {
  console.log('🔧 开始修复路由文件中的 verifyToken 重复导入问题...\n');

  const files = fs.readdirSync(routesDir);
  let fixedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    if (!file.endsWith('.routes.ts')) return;

    const filePath = path.join(routesDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');

      // 查找重复的 verifyToken 导入
      const importRegex = /import\s*{\s*verifyToken[^}]*}\s*from\s*['"][^'"]*['"];?/g;
      const imports = content.match(importRegex) || [];

      if (imports.length > 1) {
        console.log(`🔍 发现重复导入: ${file}`);
        console.log(`   导入数量: ${imports.length}`);

        // 保留第一个导入，删除其他的
        const firstImport = imports[0];
        const otherImports = imports.slice(1);

        let newContent = content;
        otherImports.forEach(imp => {
          newContent = newContent.replace(imp, '');
        });

        // 清理多余的空行
        newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');

        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent);
          console.log(`   ✅ 已修复`);
          fixedCount++;
        }
      } else if (imports.length === 1) {
        // 检查是否是错误的导入路径
        const importStatement = imports[0];
        if (importStatement.includes('../middleware/') && !importStatement.includes('auth-middleware')) {
          console.log(`🔍 发现错误导入路径: ${file}`);
          console.log(`   错误导入: ${importStatement.trim()}`);

          // 修复导入路径
          const correctedImport = importStatement.replace('../middleware/', '../middlewares/');
          let newContent = content.replace(importStatement, correctedImport);

          if (newContent !== content) {
            fs.writeFileSync(filePath, newContent);
            console.log(`   ✅ 已修复导入路径`);
            fixedCount++;
          }
        }
      }

    } catch (error) {
      console.error(`❌ 处理文件失败 ${file}:`, error.message);
      errorCount++;
    }
  });

  console.log(`\n📊 修复完成统计:`);
  console.log(`   ✅ 修复文件数: ${fixedCount}`);
  console.log(`   ❌ 错误文件数: ${errorCount}`);
  console.log(`   📁 总文件数: ${files.filter(f => f.endsWith('.routes.ts')).length}`);
}

fixDuplicateVerifyTokenImports();