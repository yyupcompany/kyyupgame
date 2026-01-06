#!/usr/bin/env ts-node
/**
 * 生成游戏BGM占位文件
 * 策略：创建简短的循环音频提示，让游戏能正常运行
 * 后续可替换为专业BGM
 */

import fs from 'fs';
import path from 'path';

const BGM_DIR = path.join(__dirname, '../../../uploads/games/audio/bgm');

if (!fs.existsSync(BGM_DIR)) {
  fs.mkdirSync(BGM_DIR, { recursive: true });
}

// 需要的BGM列表
const BGM_LIST = [
  { file: 'fruit-memory-bgm.mp3', name: '水果记忆', desc: '轻快活泼' },
  { file: 'princess-garden-bgm.mp3', name: '公主花园', desc: '梦幻柔和' },
  { file: 'space-treasure-bgm.mp3', name: '太空寻宝', desc: '科幻冒险' },
  { file: 'animal-observer-bgm.mp3', name: '动物观察', desc: '自然欢快' },
  { file: 'princess-memory-bgm.mp3', name: '公主记忆', desc: '优雅梦幻' },
  { file: 'dinosaur-memory-bgm.mp3', name: '恐龙记忆', desc: '冒险史诗' },
  { file: 'color-sorting-bgm.mp3', name: '颜色分类', desc: '轻快明亮' },
  { file: 'dollhouse-bgm.mp3', name: '娃娃屋', desc: '温馨柔和' },
  { file: 'robot-factory-bgm.mp3', name: '机器人工厂', desc: '科技电子' }
];

console.log('🎵 生成BGM占位文件...\n');

let created = 0;
let skipped = 0;

BGM_LIST.forEach(bgm => {
  const filePath = path.join(BGM_DIR, bgm.file);
  
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  跳过：${bgm.name}（已存在）`);
    skipped++;
    return;
  }
  
  // 创建占位说明文件（txt格式，提醒替换）
  const placeholderPath = filePath.replace('.mp3', '.txt');
  const content = `BGM占位文件说明
==================

游戏名称：${bgm.name}
音乐风格：${bgm.desc}
文件名称：${bgm.file}

⚠️ 这是一个占位文件，请替换为真实的BGM

推荐下载：
1. 访问 https://pixabay.com/music/
2. 搜索 "${bgm.desc}" 或 "children game music"
3. 下载适合的2-3分钟音乐
4. 重命名为 ${bgm.file}
5. 放入 ${BGM_DIR}/

或者使用：
- Incompetech.com (Kevin MacLeod免费音乐)
- Bensound.com (免费背景音乐)
- YouTube Audio Library
`;
  
  fs.writeFileSync(placeholderPath, content);
  console.log(`📝 创建：${bgm.name} 占位说明（${bgm.file.replace('.mp3', '.txt')}）`);
  created++;
});

console.log('\n' + '='.repeat(60));
console.log('📊 BGM占位文件生成完成');
console.log(`📝 创建说明文件：${created}`);
console.log(`⏭️  跳过已存在：${skipped}`);
console.log(`📁 输出目录：${BGM_DIR}`);
console.log('\n💡 提示：');
console.log('   1. 每个BGM都有对应的.txt说明文件');
console.log('   2. 按照说明下载真实BGM后替换即可');
console.log('   3. 或者游戏可以在无BGM的情况下运行');
console.log('='.repeat(60));

process.exit(0);

