const fs = require('fs');
const path = require('path');

console.log('🔧 修复静态菜单权限配置...');
console.log('');

const staticMenuPath = path.join(__dirname, 'client/src/config/static-menu.ts');

// 创建备份
function createBackup(filePath) {
    if (fs.existsSync(filePath)) {
        const backupPath = filePath + '.backup.' + Date.now();
        fs.copyFileSync(filePath, backupPath);
        console.log(`✅ 已备份: ${backupPath}`);
        return true;
    }
    return false;
}

// 修复静态菜单权限
function fixStaticMenuPermissions(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 修复家长中心主菜单
        const parentCenterMenuRegex = /(id:\s*'parent-center'[\s\S]*?)roles:\s*\[['"]parent['"]\]/g;
        if (parentCenterMenuRegex.test(content)) {
            content = content.replace(parentCenterMenuRegex, '$1roles: [\'parent\', \'admin\']');
            modified = true;
            console.log(`✅ 已修复家长中心主菜单权限`);
        }

        // 修复家长中心子菜单 - 使用更精确的正则表达式
        const parentChildMenus = [
          'parent-dashboard',
          'parent-children',
          'parent-activities',
          'parent-assessment',
          'parent-communication'
        ];

        parentChildMenus.forEach(menuId => {
          const childMenuRegex = new RegExp(`(id:\\s*'${menuId}'[\\s\\S]*?)roles:\\s*\\[['"]parent['"]\\]`, 'g');
          if (childMenuRegex.test(content)) {
            content = content.replace(childMenuRegex, `$1roles: ['parent', 'admin']`);
            modified = true;
            console.log(`✅ 已修复 ${menuId} 菜单权限`);
          }
        });

        // 检查修复结果
        const adminParentCount = (content.match(/roles:\s*\['parent',\s*'admin'\]/g) || []).length;
        console.log(`📊 修复后权限配置数量: ${adminParentCount}`);

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`🔧 已修复: ${filePath}`);
          return true;
        } else {
          console.log(`⚠️ 无需修复: ${filePath}`);
          return false;
        }

    } catch (error) {
        console.error(`❌ 修复失败 ${filePath}:`, error.message);
        return false;
    }
}

// 执行修复
console.log(`📁 处理文件: client/src/config/static-menu.ts`);

if (createBackup(staticMenuPath)) {
  if (fixStaticMenuPermissions(staticMenuPath)) {
    console.log(`\n✅ 静态菜单权限修复完成！`);
    console.log(`\n🔄 建议重启前端服务以应用更改:`);
    console.log(`   npm run start:frontend`);
    console.log(`\n🧪 测试方法:`);
    console.log(`   1. 使用admin账号登录系统`);
    console.log(`   2. 访问 http://localhost:5173/parent-center/dashboard`);
    console.log(`   3. 验证其他家长中心页面也能正常访问`);
  } else {
    console.log(`\n⚠️ 静态菜单权限无需修复，配置可能已经是正确的。`);
  }
} else {
  console.log(`\n❌ 静态菜单文件不存在或无法访问`);
}

console.log(`\n💡 如果遇到问题，可以使用备份文件恢复:`);
console.log(`   cp client/src/config/static-menu.ts.backup.* client/src/config/static-menu.ts`);