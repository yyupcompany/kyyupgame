#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 递归遍历目录
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (file.match(/\.(vue|ts|js|tsx|jsx)$/)) {
      callback(filePath);
    }
  }
}

// 修复文件中的图标组件
function fixToUnifiedIcon(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let hasChanges = false;

  // 将 LucideIcon 替换为 UnifiedIcon
  if (modifiedContent.includes('LucideIcon')) {
    modifiedContent = modifiedContent.replace(/LucideIcon/g, 'UnifiedIcon');
    hasChanges = true;
    console.log(`🔄 ${filePath}: 将 LucideIcon 替换为 UnifiedIcon`);
  }

  // 如果有修改，写回文件
  if (hasChanges) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`💾 ${filePath}: 已保存修改`);
  }
}

// 主函数
function main() {
  // 项目根目录的 client/src
  const srcDir = path.join(__dirname, '..', 'client', 'src');

  console.log('🚀 开始将 LucideIcon 修复为 UnifiedIcon...\n');

  if (!fs.existsSync(srcDir)) {
    console.error(`❌ 错误：目录不存在: ${srcDir}`);
    process.exit(1);
  }

  walkDir(srcDir, (filePath) => {
    fixToUnifiedIcon(filePath);
  });

  console.log('\n✨ UnifiedIcon 修复完成！');
  console.log('\n📝 接下来需要手动检查：');
  console.log('1. 确认 UnifiedIcon 组件已正确导入');
  console.log('2. 检查图标大小是否合适');
  console.log('3. 测试页面显示是否正常');
}

// 检查是否直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixToUnifiedIcon };