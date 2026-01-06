#!/usr/bin/env python3

import os
import re

parent_center_path = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center'

pages_to_fix = [
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
]

print(f'🔧 开始修复 {len(pages_to_fix)} 个页面...\n')

fixed_count = 0
error_count = 0

for index, page in enumerate(pages_to_fix):
    file_path = os.path.join(parent_center_path, page)
    
    try:
        if not os.path.exists(file_path):
            print(f'⚠️ {index + 1}. {page} - 文件不存在')
            error_count += 1
            continue
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        if 'UnifiedCenterLayout' in content:
            print(f'✅ {index + 1}. {page} - 已使用UnifiedCenterLayout')
            fixed_count += 1
            continue
        
        # 替换硬编码的颜色值
        content = re.sub(r'#[0-9a-fA-F]{6}', 'var(--color-primary-500)', content, flags=re.IGNORECASE)
        content = re.sub(r'rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)', 'var(--color-primary-500)', content)
        content = re.sub(r'rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)', 'var(--color-primary-500)', content)
        
        # 替换硬编码的px值
        def replace_px(match):
            px = int(match.group(1))
            if px <= 4:
                return ': var(--spacing-xs)'
            elif px <= 8:
                return ': var(--spacing-sm)'
            elif px <= 12:
                return ': var(--spacing-md)'
            elif px <= 16:
                return ': var(--spacing-lg)'
            elif px <= 20:
                return ': var(--spacing-xl)'
            elif px <= 24:
                return ': var(--spacing-2xl)'
            else:
                return match.group(0)
        
        content = re.sub(r':\s*(\d+)px', replace_px, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ {index + 1}. {page} - 已修复')
            fixed_count += 1
        else:
            print(f'⚠️ {index + 1}. {page} - 无需修复')
    
    except Exception as e:
        print(f'❌ {index + 1}. {page} - 错误: {str(e)}')
        error_count += 1

print(f'\n📊 修复完成:')
print(f'  ✅ 成功: {fixed_count}')
print(f'  ❌ 失败: {error_count}')
print(f'  📝 总计: {len(pages_to_fix)}')

