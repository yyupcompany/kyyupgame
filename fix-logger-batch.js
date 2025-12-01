const fs = require('fs');
const path = require('path');

// 第三批：修复下一组文件
const filesToFix = [
  '/persistent/home/zhgue/kyyupgame/k.yyup.com/server/src/controllers/ai-bridge.controller.ts',
  '/persistent/home/zhgue/kyyupgame/k.yyup.com/server/src/controllers/ai-chat.controller.ts',
  '/persistent/home/zhgue/kyyupgame/k.yyup.com/server/src/controllers/ai-conversation.controller.ts',
];

console.log(`准备修复 ${filesToFix.length} 个文件...\n`);

let totalFixes = 0;

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  文件不存在: ${path.basename(file)}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  // 修复1: )CallingLogger => );\n      CallingLogger
  const matches1 = content.match(/\)CallingLogger/g);
  if (matches1) {
    content = content.replace(/\)CallingLogger/g, ');\n      CallingLogger');
    fixCount += matches1.length;
  }

  // 修复2: )res\. => );\n      res.
  const matches2 = content.match(/\)res\./g);
  if (matches2) {
    content = content.replace(/\)res\./g, ');\n      res.');
    fixCount += matches2.length;
  }

  // 修复3: try {const => try {\n      const
  const matches3 = content.match(/try \{const /g);
  if (matches3) {
    content = content.replace(/try \{const /g, 'try {\n      const ');
    fixCount += matches3.length;
  }

  // 修复4: await db.query(; => await db.query(
  const matches4 = content.match(/await db\.query\(\s*;/g);
  if (matches4) {
    content = content.replace(/await db\.query\(\s*;/g, 'await db.query(');
    fixCount += matches4.length;
  }

  // 修复5: [; => [
  const matches5 = content.match(/\[\s*;/g);
  if (matches5) {
    content = content.replace(/\[\s*;/g, '[');
    fixCount += matches5.length;
  }

  // 修复6: getActivityStatistics(; => getActivityStatistics(
  const matches6 = content.match(/\.getActivityStatistics\(\s*;/g);
  if (matches6) {
    content = content.replace(/\.getActivityStatistics\(\s*;/g, '.getActivityStatistics(');
    fixCount += matches6.length;
  }

  // 修复7: updateActivityStatus(; => updateActivityStatus(
  const matches7 = content.match(/\.updateActivityStatus\(\s*;/g);
  if (matches7) {
    content = content.replace(/\.updateActivityStatus\(\s*;/g, '.updateActivityStatus(');
    fixCount += matches7.length;
  }

  // 修复8: getLatestShareByUser(; => getLatestShareByUser(
  const matches8 = content.match(/\.getLatestShareByUser\(\s*;/g);
  if (matches8) {
    content = content.replace(/\.getLatestShareByUser\(\s*;/g, '.getLatestShareByUser(');
    fixCount += matches8.length;
  }

  // 修复9: ) {const => ) {\n      const
  const matches9 = content.match(/\) \{const /g);
  if (matches9) {
    content = content.replace(/\) \{const /g, ') {\n      const ');
    fixCount += matches9.length;
  }

  // 修复10: ]if => ]\n      if
  const matches10 = content.match(/\]if /g);
  if (matches10) {
    content = content.replace(/\]if /g, ']\n      if ');
    fixCount += matches10.length;
  }

  // 修复11: executeDirectAction(; => executeDirectAction(
  const matches11 = content.match(/\.executeDirectAction\(\s*;/g);
  if (matches11) {
    content = content.replace(/\.executeDirectAction\(\s*;/g, '.executeDirectAction(');
    fixCount += matches11.length;
  }

  // 修复12: callAIWithLimitedContext(; => callAIWithLimitedContext(
  const matches12 = content.match(/\.callAIWithLimitedContext\(\s*;/g);
  if (matches12) {
    content = content.replace(/\.callAIWithLimitedContext\(\s*;/g, '.callAIWithLimitedContext(');
    fixCount += matches12.length;
  }

  // 修复13: buildDynamicContext(; => buildDynamicContext(
  const matches13 = content.match(/\.buildDynamicContext\(\s*;/g);
  if (matches13) {
    content = content.replace(/\.buildDynamicContext\(\s*;/g, '.buildDynamicContext(');
    fixCount += matches13.length;
  }

  // 修复14: .map(match =>; => .map(match =>
  const matches14 = content.match(/\.map\(match =>\s*;/g);
  if (matches14) {
    content = content.replace(/\.map\(match =>\s*;/g, '.map(match =>');
    fixCount += matches14.length;
  }

  // 修复15: )const => );\n        const
  const matches15 = content.match(/\)const /g);
  if (matches15) {
    content = content.replace(/\)const /g, ');\n        const ');
    fixCount += matches15.length;
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ 修复了 ${path.basename(file)}: ${fixCount} 处问题`);
    totalFixes += fixCount;
  } else {
    console.log(`○ ${path.basename(file)}: 无需修复`);
  }
});

console.log(`\n总计修复: ${totalFixes} 处问题`);
console.log('\n请手动检查这些文件并运行编译测试！');
