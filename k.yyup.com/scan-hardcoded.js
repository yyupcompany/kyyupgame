#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const files = [
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/Start.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/index.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/games/AttentionGame.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/games/MemoryGame.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/games/LogicGame.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/Report.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/Doing.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/GrowthTrajectory.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/components/GameComponent.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/activities/index.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/ai-assistant/index.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/children/FollowUp.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/children/index.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/children/Growth.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/share-stats/index.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/communication/smart-hub.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/games/index.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/profile/index.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/feedback/ParentFeedback.vue',
  '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/dashboard/index.vue'
];

const regexPatterns = {
  hexColor: /#[0-9a-fA-F]{3,6}(?!\w)/g,
  rgbColor: /rgba?\([^)]+\)/g,
  hardcodedSize: /\b\d+px\b/g,
  hardcodedRem: /\b\d+rem\b/g,
  hardcodedEm: /\b\d+em\b/g,
  hardcodedColorWords: /\b(white|black|gray|grey|red|blue|green|yellow|purple|orange|pink|indigo|cyan|teal|lime|amber|brown|slate|zinc|neutral|stone|rose|violet|fuchsia)\b/gi,
  hardcodedWidth: /\bwidth:\s*\d+px\b/gi,
  hardcodedHeight: /\bheight:\s*\d+px\b/gi,
  hardcodedMaxWidth: /\bmax-width:\s*\d+px\b/gi,
  hardcodedMaxHeight: /\bmax-height:\s*\d+px\b/gi,
  hardcodedMinWidth: /\bmin-width:\s*\d+px\b/gi,
  hardcodedMinHeight: /\bmin-height:\s*\d+px\b/gi,
  hardcodedMargin: /\bmargin:\s*\d+px\b/gi,
  hardcodedPadding: /\bpadding:\s*\d+px\b/gi,
  hardcodedBorderRadius: /\bborder-radius:\s*\d+px\b/gi,
  hardcodedBorder: /\bborder:\s*\d+px\b/gi,
  hardcodedBoxShadow: /\bbox-shadow:[^;]+/g
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, lineNum) => {
    Object.entries(regexPatterns).forEach(([type, regex]) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        // Skip if it's already a CSS variable
        if (match[0].includes('var(')) continue;

        issues.push({
          type,
          line: lineNum + 1,
          content: line.trim(),
          match: match[0],
          severity: getSeverity(type)
        });
      }
    });
  });

  return issues;
}

function getSeverity(type) {
  const highSeverity = ['hexColor', 'rgbColor', 'hardcodedColorWords'];
  const mediumSeverity = ['hardcodedSize', 'hardcodedRem', 'hardcodedEm', 'hardcodedWidth', 'hardcodedHeight', 'hardcodedMaxWidth', 'hardcodedMaxHeight', 'hardcodedMinWidth', 'hardcodedMinHeight', 'hardcodedMargin', 'hardcodedPadding', 'hardcodedBorderRadius', 'hardcodedBorder', 'hardcodedBoxShadow'];

  if (highSeverity.includes(type)) return 'high';
  if (mediumSeverity.includes(type)) return 'medium';
  return 'low';
}

function main() {
  console.log('🎨 家长中心硬编码检测报告');
  console.log('=====================================');
  console.log('');

  const allIssues = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const issues = analyzeFile(file);
      if (issues.length > 0) {
        console.log(`📄 ${path.basename(file)} - 发现 ${issues.length} 个问题`);
        issues.forEach(issue => {
          console.log(`  ${issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'} Line ${issue.line}: ${issue.match}`);
          console.log(`    ${issue.content}`);
        });
        console.log('');
        allIssues.push(...issues);
      } else {
        console.log(`✅ ${path.basename(file)} - 无硬编码问题`);
        console.log('');
      }
    } else {
      console.log(`❌ 文件不存在: ${file}`);
      console.log('');
    }
  });

  // 统计报告
  console.log('📊 统计汇总');
  console.log('=============');
  console.log(`🔴 高严重性问题: ${allIssues.filter(i => i.severity === 'high').length}`);
  console.log(`🟡 中严重性问题: ${allIssues.filter(i => i.severity === 'medium').length}`);
  console.log(`🟢 低严重性问题: ${allIssues.filter(i => i.severity === 'low').length}`);
  console.log(`📋 总计: ${allIssues.length} 个硬编码问题`);

  // 按类型统计
  const typeStats = {};
  allIssues.forEach(issue => {
    typeStats[issue.type] = (typeStats[issue.type] || 0) + 1;
  });

  console.log('');
  console.log('🏷️  按类型统计:');
  Object.entries(typeStats).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

main();