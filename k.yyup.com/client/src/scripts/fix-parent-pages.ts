/**
 * 修复家长端页面脚本
 * 为所有页面添加UnifiedCenterLayout并替换硬编码值
 */

import * as fs from 'fs';
import * as path from 'path';

const parentCenterPath = path.join(__dirname, '../pages/parent-center');

// 需要修复的页面列表
const pagesToFix = [
  'activities/index.vue',
  'ai-assistant/index.vue',
  'assessment/Academic.vue',
  'assessment/Doing.vue',
  'assessment/GrowthTrajectory.vue',
  'assessment/Report.vue',
  'assessment/SchoolReadiness.vue',
  'assessment/Start.vue',
  'assessment/components/GameComponent.vue',
  'assessment/games/AttentionGame.vue',
  'assessment/games/LogicGame.vue',
  'assessment/games/MemoryGame.vue',
  'assessment/index.vue',
  'children/FollowUp.vue',
  'children/Growth.vue',
  'children/index.vue',
  'communication/smart-hub.vue',
  'feedback/ParentFeedback.vue',
  'games/achievements.vue',
  'games/components/GameCard.vue',
  'games/index.vue',
  'games/play/AnimalObserver.vue',
  'games/play/ColorSorting.vue',
  'games/play/DinosaurMemory.vue',
  'games/play/DollhouseTidy.vue',
  'games/play/FruitSequence.vue',
  'games/play/PrincessGarden.vue',
  'games/play/PrincessMemory.vue',
  'games/play/RobotFactory.vue',
  'games/play/SpaceTreasure.vue',
  'games/records.vue',
  'profile/index.vue',
  'share-stats/index.vue'
];

console.log(`🔧 开始修复 ${pagesToFix.length} 个页面...\n`);

let fixedCount = 0;
let errorCount = 0;

pagesToFix.forEach((page, index) => {
  const filePath = path.join(parentCenterPath, page);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${index + 1}. ${page} - 文件不存在`);
      errorCount++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // 检查是否已经使用了UnifiedCenterLayout
    if (content.includes('UnifiedCenterLayout')) {
      console.log(`✅ ${index + 1}. ${page} - 已使用UnifiedCenterLayout`);
      fixedCount++;
      return;
    }

    // 替换硬编码的颜色值
    content = content.replace(/#[0-9a-fA-F]{6}/g, (match) => {
      // 根据颜色值映射到设计令牌
      const colorMap: { [key: string]: string } = {
        '#FF0000': 'var(--color-danger-500)',
        '#00FF00': 'var(--color-success-500)',
        '#0000FF': 'var(--color-primary-500)',
        '#FFFF00': 'var(--color-warning-500)',
        '#FF6B6B': 'var(--color-danger-300)',
        '#51CF66': 'var(--color-success-300)',
        '#4ECDC4': 'var(--color-info-300)',
      };
      return colorMap[match.toUpperCase()] || match;
    });

    // 替换硬编码的rgb颜色值
    content = content.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, 
      'var(--color-primary-500)');

    // 替换硬编码的px值为设计令牌
    content = content.replace(/(\d+)px/g, (match, num) => {
      const px = parseInt(num);
      if (px === 4) return 'var(--spacing-xs)';
      if (px === 8) return 'var(--spacing-sm)';
      if (px === 12) return 'var(--spacing-md)';
      if (px === 16) return 'var(--spacing-lg)';
      if (px === 20) return 'var(--spacing-xl)';
      if (px === 24) return 'var(--spacing-2xl)';
      if (px === 32) return 'var(--spacing-3xl)';
      return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${index + 1}. ${page} - 已修复`);
      fixedCount++;
    } else {
      console.log(`⚠️ ${index + 1}. ${page} - 无需修复`);
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${page} - 错误: ${error}`);
    errorCount++;
  }
});

console.log(`\n📊 修复完成:`);
console.log(`  ✅ 成功: ${fixedCount}`);
console.log(`  ❌ 失败: ${errorCount}`);
console.log(`  📝 总计: ${pagesToFix.length}`);

