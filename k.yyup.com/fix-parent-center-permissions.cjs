const fs = require('fs');
const path = require('path');

console.log('🔧 修复家长中心权限配置...');
console.log('');

// 要修复的文件列表
const filesToFix = [
    'client/src/router/parent-center-routes.ts',
    'client/src/router/mobile/parent-center-routes.ts',
    'client/src/router/optimized-routes.ts'
];

// 备份函数
function createBackup(filePath) {
    if (fs.existsSync(filePath)) {
        const backupPath = filePath + '.backup.' + Date.now();
        fs.copyFileSync(filePath, backupPath);
        console.log(`✅ 已备份: ${backupPath}`);
        return true;
    }
    return false;
}

// 修复权限配置
function fixPermissions(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 统计原始配置
        const originalParentCount = (content.match(/roles:\s*\[['"]parent['"]\]/g) || []).length;
        console.log(`📊 原始parent角色配置数量: ${originalParentCount}`);

        // 替换策略1: 只允许parent -> 允许parent和admin
        const regex1 = /roles:\s*\[['"]parent['"]\]/g;
        if (regex1.test(content)) {
            content = content.replace(regex1, "roles: ['parent', 'admin']");
            modified = true;
        }

        // 替换策略2: 替换permissions数组中的parent
        const regex2 = /roles:\s*\(\['parent'\]\)/g;
        if (regex2.test(content)) {
            content = content.replace(regex2, "roles: ['parent', 'admin']");
            modified = true;
        }

        // 修复后的统计
        const fixedCount = (content.match(/roles:\s*\['parent',\s*'admin'\]/g) || []).length;
        console.log(`✨ 修复后权限配置数量: ${fixedCount}`);

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
let totalFixed = 0;
let totalBackup = 0;

for (const file of filesToFix) {
    console.log(`\n📁 处理文件: ${file}`);

    const fullPath = path.join(__dirname, file);

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ 文件不存在: ${file}`);
        continue;
    }

    // 创建备份
    if (createBackup(fullPath)) {
        totalBackup++;

        // 修复权限
        if (fixPermissions(fullPath)) {
            totalFixed++;
        }
    }
}

console.log(`\n📋 修复总结:`);
console.log(`   备份文件数: ${totalBackup}`);
console.log(`   修复文件数: ${totalFixed}`);
console.log(`   处理文件数: ${filesToFix.length}`);

if (totalFixed > 0) {
    console.log(`\n✅ 修复完成！现在管理员也可以访问家长中心了。`);
    console.log(`\n🔄 建议重启前端服务以应用更改:`);
    console.log(`   npm run start:frontend`);
    console.log(`\n🧪 测试方法:`);
    console.log(`   1. 使用admin账号登录系统`);
    console.log(`   2. 访问 http://localhost:5173/parent-center/dashboard`);
    console.log(`   3. 验证其他家长中心页面也能正常访问`);
} else {
    console.log(`\n⚠️ 没有文件需要修复，权限配置可能已经是正确的。`);
}

console.log(`\n💡 如果遇到问题，可以使用备份文件恢复:`);
console.log(`   find . -name "*.backup.*" -exec cp {} {} \\;`);