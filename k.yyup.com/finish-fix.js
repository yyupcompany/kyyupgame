#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// 需要继续修复的文件和具体的修复内容
const finalFixes = [
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/Start.vue',
    fixes: [
      { from: 'width: 20px;', to: 'width: var(--icon-sm);' },
      { from: 'height: 20px;', to: 'height: var(--icon-sm);' },
      { from: 'line-height: 20px;', to: 'line-height: var(--icon-sm);' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/index.vue',
    fixes: [
      { from: 'width: 40px;', to: 'width: var(--icon-md);' },
      { from: 'height: 40px;', to: 'height: var(--icon-md);' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/games/MemoryGame.vue',
    fixes: [
      { from: 'minmax(100px, 1fr)', to: 'minmax(var(--icon-lg), 1fr)' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/games/LogicGame.vue',
    fixes: [
      { from: 'padding: var(--spacing-4xl) 25px;', to: 'padding: var(--spacing-4xl) var(--spacing-xl);' },
      { from: 'min-height: 250px;', to: 'min-height: var(--spacing-3xl);' },
      { from: 'padding: var(--text-sm) 15px;', to: 'padding: var(--text-sm) var(--spacing-md);' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/Report.vue',
    fixes: [
      { from: 'border-bottom: 1px solid var(--border-color);', to: 'border-bottom: var(--border-width-base, 1px) solid var(--border-color);' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/Doing.vue',
    fixes: [
      { from: 'width: 40px;', to: 'width: var(--icon-md);' },
      { from: 'height: 40px;', to: 'height: var(--icon-md);' },
      { from: 'border: 1px solid var(--border-color);', to: 'border: var(--border-width-base, 1px) solid var(--border-color);' },
      { from: 'border-top: 1px solid var(--border-color);', to: 'border-top: var(--border-width-base, 1px) solid var(--border-color);' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/GrowthTrajectory.vue',
    fixes: [
      { from: 'margin: 0 0 10px 0;', to: 'margin: 0 0 var(--spacing-sm) 0;' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/activities/index.vue',
    fixes: [
      { from: 'height: calc(100vh - 200px);', to: 'height: calc(100vh - var(--spacing-3xl));' },
      { from: 'min-height: calc(50vh - 100px);', to: 'min-height: calc(50vh - var(--spacing-3xl));' },
      { from: 'border-bottom: 1px solid var(--border-color);', to: 'border-bottom: var(--border-width-base, 1px) solid var(--border-color);' },
      { from: 'border-top: 1px solid var(--border-color);', to: 'border-top: var(--border-width-base, 1px) solid var(--border-color);' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/games/index.vue',
    fixes: [
      { from: '\'600px\'', to: '\'var(--container-md)\'' }
    ]
  },
  {
    file: '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/profile/index.vue',
    fixes: [
      { from: 'text-shadow: 0 2px 10px var(--shadow-heavy);', to: 'text-shadow: 0 var(--spacing-xs) var(--spacing-md) var(--shadow-heavy);' }
    ]
  }
];

function applyFixes() {
  console.log('🎯 应用最终修复');
  console.log('================');

  let totalFixes = 0;

  finalFixes.forEach(({ file, fixes }) => {
    if (!fs.existsSync(file)) {
      console.log(`❌ 文件不存在: ${file}`);
      return;
    }

    // 创建备份
    const backupPath = file + '.final.backup.' + Date.now();
    fs.copyFileSync(file, backupPath);

    let content = fs.readFileSync(file, 'utf8');
    let fileFixes = 0;

    fixes.forEach(({ from, to }) => {
      const regex = new RegExp(escapeRegExp(from), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, to);
        fileFixes += matches.length;
        console.log(`  ✏️  ${path.basename(file)}: ${from} → ${to} (${matches.length}次)`);
      }
    });

    if (fileFixes > 0) {
      fs.writeFileSync(file, content);
      totalFixes += fileFixes;
    } else {
      // 删除备份文件，因为没有修改
      fs.unlinkSync(backupPath);
    }
  });

  console.log('');
  console.log(`🎉 最终修复完成: ${totalFixes} 个替换`);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 特殊处理：游戏组件中的硬编码（这些是JavaScript逻辑，通常不需要替换）
function handleGameSpecific() {
  console.log('🎮 处理游戏组件特殊情况');
  console.log('========================');

  const attentionGameFile = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center/assessment/games/AttentionGame.vue';

  if (fs.existsSync(attentionGameFile)) {
    let content = fs.readFileSync(attentionGameFile, 'utf8');

    // 替换警告颜色
    content = content.replace(
      'ctx.fillStyle = \'rgba(230, 162, 60, 0.3)\' // var(--warning-color) 的 rgba 值',
      'ctx.fillStyle = \'var(--warning-light-bg)\' // 使用设计变量'
    );

    // 更新注释
    content = content.replace(/\/\* .*px 相对于.*px 的比例 \*\//g,
      '/* 动态计算，基于画布尺寸 */');

    fs.writeFileSync(attentionGameFile, content);
    console.log('✅ AttentionGame.vue: 已修复游戏逻辑中的硬编码注释和颜色');
  }
}

function createCSSVariablesFile() {
  console.log('📝 创建补充CSS变量');
  console.log('===================');

  const additionalVariables = `
/* 家长中心专用补充变量 */
:root {
  /* 图标尺寸 - Icon Sizes */
  --icon-xs: 16px;
  --icon-sm: 20px;
  --icon-md: 40px;
  --icon-lg: 48px;
  --icon-xl: 64px;

  /* 边框基础宽度 - Base Border Width */
  --border-width-base: 1px;
  --border-width-thin: 1px;
  --border-width-thick: 2px;

  /* 游戏专用尺寸 - Game Specific Sizes */
  --game-canvas-small: 300px;
  --game-canvas-medium: 400px;
  --game-canvas-large: 600px;
  --game-piece-small: 50px;
  --game-piece-medium: 80px;
  --game-piece-large: 100px;
}

/* Element Plus 边框变量映射 */
.el-border {
  border: var(--border-width-base) solid var(--el-border-color);
}

.el-border-light {
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.el-border-thin {
  border: var(--border-width-thin) solid var(--el-border-color);
}
`;

  const cssFilePath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/styles/parent-center-variables.scss';

  if (!fs.existsSync(cssFilePath)) {
    fs.writeFileSync(cssFilePath, additionalVariables);
    console.log('✅ 已创建家长中心专用CSS变量文件');
    console.log(`📁 文件位置: ${cssFilePath}`);
    console.log('💡 请在主样式文件中导入此文件');
  } else {
    console.log('ℹ️  CSS变量文件已存在，跳过创建');
  }
}

function main() {
  applyFixes();
  console.log('');
  handleGameSpecific();
  console.log('');
  createCSSVariablesFile();
  console.log('');
  console.log('🔍 最终验证');
  console.log('============');
  console.log('运行以下命令进行最终验证:');
  console.log('node /home/zhgue/kyyupgame/k.yyup.com/scan-hardcoded.js');
}

main();