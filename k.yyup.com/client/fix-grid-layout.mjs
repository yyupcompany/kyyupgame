import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXES = [
  {
    file: '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/teacher-center/activities/index.vue',
    oldPattern: /\.stats-cards\s*\{\s*margin-bottom:\s*var\(--spacing-xl\);\s*/,
    newStyle: '.stats-cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: var(--spacing-lg);\n  margin-bottom: var(--spacing-xl);\n'
  },
  {
    file: '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/teacher-center/dashboard/index-original.vue',
    oldPattern: /\.stats-cards\s*\{\s*margin-bottom:\s*var\(--spacing-xl\);\s*\}/,
    newStyle: '.stats-cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: var(--spacing-lg);\n  margin-bottom: var(--spacing-xl);\n}'
  }
];

console.log('开始修复卡片布局...\n');

FIXES.forEach((fix, index) => {
  try {
    console.log(`${index + 1}. 修复文件: ${fix.file}`);

    if (!fs.existsSync(fix.file)) {
      console.log(`   ⚠️  文件不存在，跳过\n`);
      return;
    }

    let content = fs.readFileSync(fix.file, 'utf-8');

    // 检查是否已经包含grid布局
    if (content.includes('.stats-cards') && content.includes('display: grid')) {
      console.log(`   ✅ 已经包含grid布局，无需修复\n`);
      return;
    }

    // 应用修复
    const newContent = content.replace(fix.oldPattern, fix.newStyle);

    if (newContent !== content) {
      // 创建备份
      const backupFile = fix.file + '.backup-' + Date.now();
      fs.writeFileSync(backupFile, content, 'utf-8');
      console.log(`   📦 已创建备份: ${path.basename(backupFile)}`);

      // 写入修复后的内容
      fs.writeFileSync(fix.file, newContent, 'utf-8');
      console.log(`   ✅ 修复成功\n`);
    } else {
      console.log(`   ⚠️  未匹配到需要修复的内容\n`);
    }
  } catch (error) {
    console.error(`   ❌ 修复失败: ${error.message}\n`);
  }
});

console.log('✅ 所有修复完成!');
console.log('\n建议:');
console.log('1. 检查修复后的文件是否正常显示');
console.log('2. 运行 npm run lint 检查代码格式');
console.log('3. 提交代码前测试页面显示效果');
