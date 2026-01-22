const fs = require('fs');
const path = require('path');

const REPORT_FILE = '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/STATS_CARDS_LAYOUT_REPORT.md';

// 扫描的三个目录
const SCAN_DIRS = [
  '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers',
  '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/teacher-center',
  '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center'
];

let totalFiles = 0;
let filesWithCards = 0;
let filesMissingGrid = [];

// 扫描目录
function scanDirectory(dir, categoryName) {
  console.log(`\n扫描 ${categoryName}...`);
  const results = [];

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      // 跳过components和duplicates-backup目录
      if (stat.isDirectory()) {
        if (file !== 'components' && file !== 'duplicates-backup' && !file.startsWith('mobile')) {
          walkDir(filePath);
        }
        continue;
      }

      // 只处理Vue文件
      if (!file.endsWith('.vue')) continue;

      totalFiles++;
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative('/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages', filePath);

      // 检查是否包含stats-cards或StatCard
      if (content.includes('stats-cards') || content.includes('StatCard')) {
        filesWithCards++;

        // 提取style部分
        const styleMatch = content.match(/<style[^>]*scoped[^>]*>([\s\S]*?)<\/style>/);
        let hasGridLayout = false;
        let statsCardsHasDisplay = false;

        if (styleMatch) {
          const styleContent = styleMatch[1];

          // 检查是否有display: grid
          if (styleContent.includes('display: grid') || styleContent.includes('display:grid')) {
            hasGridLayout = true;
          }

          // 检查.stats-cards是否有display属性
          const statsCardsMatch = styleContent.match(/\.stats-cards\s*\{([^}]+)\}/);
          if (statsCardsMatch) {
            const statsCardsContent = statsCardsMatch[1];
            if (statsCardsContent.includes('display:')) {
              statsCardsHasDisplay = true;
            }
          }
        }

        // 如果有stats-cards但没有display属性
        if (content.includes('stats-cards') && !statsCardsHasDisplay) {
          filesMissingGrid.push({
            category: categoryName,
            path: relativePath,
            fullPath: filePath
          });
          results.push({
            path: relativePath,
            fullPath: filePath,
            style: styleMatch ? styleMatch[1] : 'No style found'
          });
        }
      }
    }
  }

  walkDir(dir);
  return results;
}

// 扫描所有目录
const allResults = {};
SCAN_DIRS.forEach(dir => {
  const categoryName = path.basename(dir);
  allResults[categoryName] = scanDirectory(dir, categoryName);
});

// 生成报告
let report = '# PC端卡片布局检测报告\n\n';
report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

report += '## 检测统计\n\n';
report += `- 总文件数: ${totalFiles}\n`;
report += `- 包含卡片的文件: ${filesWithCards}\n`;
report += `- 需要修复的文件: ${filesMissingGrid.length}\n\n`;

// 详细结果
report += '## 需要修复的文件列表\n\n';

Object.keys(allResults).forEach(category => {
  const results = allResults[category];
  if (results.length === 0) {
    report += `### ${category} 目录\n\n`;
    report += '✅ 无需修复的文件\n\n';
    return;
  }

  report += `### ${category} 目录 (${results.length}个)\n\n`;

  results.forEach((result, index) => {
    report += `#### ${index + 1}. \`${path.basename(result.path)}\`\n\n`;
    report += `**路径**: \`${result.path}\`\n\n`;

    // 显示stats-cards相关的样式
    const statsCardsMatch = result.style.match(/\.stats-cards\s*\{[^}]*\}/);
    if (statsCardsMatch) {
      report += '**当前样式**:\n';
      report += '```scss\n';
      report += statsCardsMatch[0];
      report += '\n```\n\n';
    } else {
      report += '**当前状态**: 未找到 `.stats-cards` 样式定义\n\n';
    }

    report += '**问题描述**:\n';
    report += '- 缺少 `display: grid` 布局\n';
    report += '- 建议添加 grid 布局以实现响应式卡片排列\n\n';

    report += '---\n\n';
  });
});

// 修复方案
report += '## 建议修复方案\n\n';
report += '为所有缺失 grid 布局的 `.stats-cards` 添加以下样式：\n\n';
report += '```scss\n';
report += '.stats-cards {\n';
report += '  display: grid;\n';
report += '  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n';
report += '  gap: var(--spacing-lg, 16px);\n';
report += '  margin-bottom: var(--spacing-lg, 24px);\n';
report += '  /* 保留原有的其他属性 */\n';
report += '}\n';
report += '```\n\n';

report += '## 自动修复命令\n\n';
report += '可以运行以下脚本自动修复所有文件：\n\n';
report += '```bash\n';
report += 'node /persistent/home/zhgue/kyyupgame/k.yyup.com/client/fix-grid-layout.js\n';
report += '```\n';

// 写入报告
fs.writeFileSync(REPORT_FILE, report, 'utf-8');

console.log('\n✅ 检测完成!');
console.log(`📊 总文件数: ${totalFiles}`);
console.log(`📋 包含卡片的文件: ${filesWithCards}`);
console.log(`⚠️  需要修复的文件: ${filesMissingGrid.length}`);
console.log(`📄 报告已生成: ${REPORT_FILE}`);

// 输出需要修复的文件列表
if (filesMissingGrid.length > 0) {
  console.log('\n需要修复的文件:');
  filesMissingGrid.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.path}`);
  });
}
