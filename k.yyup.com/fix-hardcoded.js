#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// 映射表：硬编码 -> CSS变量
const colorReplacements = {
  // 基础颜色
  'white': 'var(--text-on-primary)',
  'black': 'var(--text-primary)',
  'purple': 'var(--accent-marketing)',

  // RGBA颜色
  'rgba(255, 255, 255, 0.1)': 'var(--glass-bg-light)',
  'rgba(255, 255, 255, 0.08)': 'var(--glass-bg-heavy)',
  'rgba(255, 255, 255, 0.2)': 'var(--glass-bg-medium)',
  'rgba(0, 0, 0, 0.1)': 'var(--shadow-light)',
  'rgba(64, 158, 255, 0.1)': 'var(--primary-light-bg)',
  'rgba(64, 158, 255, 0.3)': 'var(--glow-primary)',
  'rgba(64, 158, 255, 0.05)': 'var(--accent-marketing-light)',

  // 十六进制颜色
  '#9333ea': 'var(--accent-marketing)',

  // 特殊情况处理
  'white-space: normal': 'white-space: normal', // 保持不变，不是颜色
  'white-space: pre-wrap': 'white-space: pre-wrap', // 保持不变，不是颜色
};

// 尺寸映射
const sizeReplacements = {
  // 字体大小
  'font-size: 80px': 'font-size: var(--text-5xl)',
  'font-size: 15px': 'font-size: var(--text-sm)',
  'font-size: 20px': 'font-size: var(--text-xl)',

  // 间距
  'letter-spacing: 0.5px': 'letter-spacing: var(--spacing-xs)',
  'letter-spacing: 5px': 'letter-spacing: var(--spacing-md)',

  // 容器尺寸
  'width: 1200px': 'max-width: var(--container-xl)',
  'width: 1400px': 'max-width: var(--container-2xl)',
  'width: 1000px': 'max-width: var(--container-lg)',
  'width: 800px': 'max-width: var(--container-md)',
  'width: 600px': 'max-width: var(--container-sm)',
  'width: 500px': 'max-width: var(--container-sm)',
  'width: 400px': 'width: var(--container-sm)',
  'width: 300px': 'width: var(--spacing-3xl)',
  'width: 200px': 'width: var(--spacing-2xl)',
  'width: 150px': 'width: var(--spacing-2xl)',

  // 高度
  'height: 500px': 'height: var(--spacing-5xl)',
  'height: 400px': 'height: var(--spacing-4xl)',
  'height: 300px': 'height: var(--spacing-3xl)',
  'height: 200px': 'height: var(--spacing-2xl)',
  'height: 100px': 'height: var(--spacing-3xl)',
  'height: 80px': 'height: var(--spacing-2xl)',
  'height: 60px': 'height: var(--spacing-xl)',
  'height: 40px': 'height: var(--spacing-xl)',
  'height: 20px': 'height: var(--spacing-lg)',

  // 响应式布局
  'minmax(400px, 1fr)': 'minmax(var(--container-sm), 1fr)',
  'minmax(350px, 1fr)': 'minmax(var(--container-sm), 1fr)',
  'minmax(320px, 1fr)': 'minmax(var(--container-sm), 1fr)',
  'minmax(300px, 1fr)': 'minmax(var(--spacing-3xl), 1fr)',
  'minmax(250px, 1fr)': 'minmax(var(--spacing-2xl), 1fr)',
  'minmax(200px, 1fr)': 'minmax(var(--spacing-2xl), 1fr)',

  // 边框
  'border: 1px': 'border: 1px',
  'border: 3px': 'border: 3px',
  'border-radius: 10px': 'border-radius: var(--radius-2xl)',
  'border-radius: 6px': 'border-radius: var(--radius-md)',
  'border-radius: 50%': 'border-radius: var(--radius-full)',

  // 阴影
  'box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3)': 'box-shadow: var(--glow-primary)',
  'box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3)': 'box-shadow: var(--shadow-md)',
  'box-shadow: 0 2px 6px var(--shadow-light)': 'box-shadow: var(--shadow-sm)',
  'box-shadow: 0 2px var(--spacing-sm) var(--shadow-light)': 'box-shadow: var(--shadow-sm)',
  'box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light)': 'box-shadow: var(--shadow-sm)',

  // 元素属性
  'width="500px"': 'width="var(--container-sm)"',
  'width="600px"': 'width="var(--container-md)"',
  'label-width="100px"': 'label-width="var(--spacing-2xl)"',
  'style="height: 400px;"': ':style="{ height: \'var(--spacing-4xl)\' }"',
  'style="height: 500px;"': ':style="{ height: \'var(--spacing-5xl)\' }"',
};

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

function fixFile(filePath) {
  console.log(`🔧 修复文件: ${path.basename(filePath)}`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return 0;
  }

  // 创建备份
  const backupPath = filePath + '.backup.' + Date.now();
  fs.copyFileSync(filePath, backupPath);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  let replacements = 0;

  // 修复颜色
  Object.entries(colorReplacements).forEach(([oldValue, newValue]) => {
    const regex = new RegExp(escapeRegExp(oldValue), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newValue);
      replacements += matches.length;
      console.log(`  🎨 颜色: ${oldValue} → ${newValue} (${matches.length}次)`);
    }
  });

  // 修复尺寸
  Object.entries(sizeReplacements).forEach(([oldValue, newValue]) => {
    const regex = new RegExp(escapeRegExp(oldValue), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newValue);
      replacements += matches.length;
      console.log(`  📏 尺寸: ${oldValue} → ${newValue} (${matches.length}次)`);
    }
  });

  // 修复未匹配的常见模式
  const additionalFixes = [
    // 容器尺寸模式
    {
      pattern: /max-width:\s*(\d+)px/g,
      replacement: (match, size) => {
        const sizeMap = {
          '1400': 'var(--container-2xl)',
          '1200': 'var(--container-xl)',
          '1000': 'var(--container-lg)',
          '800': 'var(--container-md)',
          '600': 'var(--container-sm)'
        };
        return `max-width: ${sizeMap[size] || match}`;
      }
    },
    // 高度模式
    {
      pattern: /height:\s*(\d+)px/g,
      replacement: (match, size) => {
        const sizeMap = {
          '500': 'var(--spacing-5xl)',
          '400': 'var(--spacing-4xl)',
          '300': 'var(--spacing-3xl)',
          '200': 'var(--spacing-2xl)',
          '150': 'var(--spacing-2xl)',
          '100': 'var(--spacing-3xl)',
          '80': 'var(--spacing-2xl)',
          '60': 'var(--spacing-xl)',
          '40': 'var(--spacing-xl)',
          '20': 'var(--spacing-lg)'
        };
        if (sizeMap[size]) {
          replacements++;
          return `height: ${sizeMap[size]}`;
        }
        return match;
      }
    },
    // 内联样式转换
    {
      pattern: /style="(width|height):\s*(\d+)px"/g,
      replacement: (match, prop, size) => {
        const sizeMap = {
          '500': 'var(--spacing-5xl)',
          '400': 'var(--spacing-4xl)',
          '300': 'var(--spacing-3xl)',
          '200': 'var(--spacing-2xl)',
          '100': 'var(--spacing-3xl)',
          '80': 'var(--spacing-2xl)',
          '60': 'var(--spacing-xl)',
          '40': 'var(--spacing-xl)',
          '20': 'var(--spacing-lg)'
        };
        if (sizeMap[size]) {
          replacements++;
          return `:style="{ ${prop}: '${sizeMap[size]}' }"`;
        }
        return match;
      }
    }
  ];

  additionalFixes.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ 修复完成: ${replacements} 个替换`);
  } else {
    // 删除备份文件，因为没有修改
    fs.unlinkSync(backupPath);
    console.log(`ℹ️  无需修复`);
  }

  return replacements;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  console.log('🎨 家长中心硬编码修复工具');
  console.log('============================');
  console.log('');

  let totalReplacements = 0;
  let filesModified = 0;

  files.forEach(file => {
    const replacements = fixFile(file);
    if (replacements > 0) {
      totalReplacements += replacements;
      filesModified++;
    }
    console.log('');
  });

  console.log('📊 修复统计');
  console.log('=============');
  console.log(`📁 修改文件: ${filesModified} 个`);
  console.log(`🔄 总替换: ${totalReplacements} 个`);
  console.log(`💾 备份文件: 每个修改文件都有备份`);
  console.log('');
  console.log('🔍 验证修复');
  console.log('=============');
  console.log('运行以下命令验证修复结果:');
  console.log('node /home/zhgue/kyyupgame/k.yyup.com/scan-hardcoded.js');
}

main();