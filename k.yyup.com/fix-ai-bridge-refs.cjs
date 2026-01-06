#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 要修复的文件列表
const filesToFix = [
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/assessment/parent-assistant.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/assessment/assessment-report.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/ai-optimized-query.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/ai/video.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/ai/message.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/ai/viral-referral-system.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/ai/multimodal.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/ai/auto-image-generation.service.ts',
  '/home/zhgue/kyyupgame/k.yyup.com/server/src/services/ai/tools/document-generation/index.ts'
];

console.log('🔧 开始修复 aiBridgeService 引用...\n');

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 替换导入语句
  content = content.replace(/import \{ aiBridgeService \} from/g, 'import { AIBridgeService } from');

  // 替换使用
  content = content.replace(/aiBridgeService\./g, 'AIBridgeService.');

  // 替换动态导入中的变量名
  content = content.replace(/const \{ aiBridgeService \} = await import/g, 'const { AIBridgeService } = await import');

  fs.writeFileSync(filePath, content);
  console.log(`✅ 已修复: ${path.basename(filePath)}`);
});

console.log('\n✨ 所有文件修复完成！');
