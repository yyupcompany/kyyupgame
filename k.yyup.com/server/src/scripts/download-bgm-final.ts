#!/usr/bin/env ts-node
/**
 * 游戏BGM最终解决方案
 * 策略：使用多个免费音乐源尝试下载
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const BGM_DIR = path.join(__dirname, '../../../uploads/games/audio/bgm');

if (!fs.existsSync(BGM_DIR)) {
  fs.mkdirSync(BGM_DIR, { recursive: true });
}

// BGM配置
interface BGMConfig {
  filename: string;
  name: string;
  style: string;
  urls: string[]; // 多个备选下载地址
}

const BGM_CONFIGS: BGMConfig[] = [
  {
    filename: 'fruit-memory-bgm.mp3',
    name: '水果记忆',
    style: '轻快活泼',
    urls: [
      'https://www.bensound.com/bensound-music/bensound-littleidea.mp3',
      'https://www.bensound.com/bensound-music/bensound-ukulele.mp3'
    ]
  },
  {
    filename: 'princess-garden-bgm.mp3',
    name: '公主花园',
    style: '梦幻柔和',
    urls: [
      'https://www.bensound.com/bensound-music/bensound-dreams.mp3',
      'https://www.bensound.com/bensound-music/bensound-sunny.mp3'
    ]
  },
  {
    filename: 'animal-observer-bgm.mp3',
    name: '动物观察',
    style: '自然欢快',
    urls: [
      'https://www.bensound.com/bensound-music/bensound-happyrock.mp3',
      'https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3'
    ]
  },
  {
    filename: 'princess-memory-bgm.mp3',
    name: '公主记忆',
    style: '优雅梦幻',
    urls: [
      'https://www.bensound.com/bensound-music/bensound-littleidea.mp3',
      'https://www.bensound.com/bensound-music/bensound-sunny.mp3'
    ]
  },
  {
    filename: 'dinosaur-memory-bgm.mp3',
    name: '恐龙记忆',
    style: '冒险史诗',
    urls: [
      'https://www.bensound.com/bensound-music/bensound-epic.mp3',
      'https://www.bensound.com/bensound-music/bensound-actionable.mp3'
    ]
  },
  {
    filename: 'color-sorting-bgm.mp3',
    name: '颜色分类',
    style: '轻快明亮',
    urls: [
      'https://www.bensound.com/bensound-music/bensound-buddy.mp3',
      'https://www.bensound.com/bensound-music/bensound-happiness.mp3'
    ]
  },
  {
    filename: 'dollhouse-bgm.mp3',
    name: '娃娃屋',
    style: '温馨柔和',
    urls: [
      'https://www.bensound.com/bensound-music/bensound-relaxing.mp3',
      'https://www.bensound.com/bensound-music/bensound-sweet.mp3'
    ]
  }
];

/**
 * 下载文件
 */
function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          
          // 检查文件大小（至少要有100KB）
          const stats = fs.statSync(dest);
          if (stats.size > 100 * 1024) {
            resolve(true);
          } else {
            fs.unlinkSync(dest);
            resolve(false);
          }
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // 处理重定向
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(dest);
          downloadFile(redirectUrl, dest).then(resolve);
        } else {
          file.close();
          fs.unlinkSync(dest);
          resolve(false);
        }
      } else {
        file.close();
        fs.unlinkSync(dest);
        resolve(false);
      }
    });
    
    request.on('error', () => {
      file.close();
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      resolve(false);
    });
    
    request.setTimeout(60000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      resolve(false);
    });
  });
}

/**
 * 下载BGM
 */
async function downloadBGM(config: BGMConfig): Promise<boolean> {
  const filepath = path.join(BGM_DIR, config.filename);
  
  // 如果文件已存在，跳过
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    if (stats.size > 100 * 1024) {
      console.log(`⏭️  跳过：${config.name}（已存在，${(stats.size / 1024 / 1024).toFixed(1)}MB）`);
      return true;
    } else {
      // 文件太小，可能是错误文件，删除重试
      fs.unlinkSync(filepath);
    }
  }
  
  console.log(`\n📥 下载：${config.name}（${config.style}）`);
  
  // 尝试所有URL
  for (let i = 0; i < config.urls.length; i++) {
    const url = config.urls[i];
    console.log(`   尝试源 ${i + 1}/${config.urls.length}...`);
    
    const success = await downloadFile(url, filepath);
    
    if (success) {
      const stats = fs.statSync(filepath);
      console.log(`   ✅ 成功：${(stats.size / 1024 / 1024).toFixed(1)}MB`);
      return true;
    }
  }
  
  console.log(`   ❌ 所有源都失败`);
  return false;
}

/**
 * 主函数
 */
async function main() {
  console.log('🎵 开始下载游戏BGM（Bensound免费音乐）...\n');
  console.log(`📁 输出目录：${BGM_DIR}\n`);
  console.log('⚠️  Bensound音乐需要署名（已在游戏关于页面添加）\n');
  console.log('='.repeat(60));
  
  let success = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const config of BGM_CONFIGS) {
    const result = await downloadBGM(config);
    
    if (result) {
      const filepath = path.join(BGM_DIR, config.filename);
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > 1 * 1024 * 1024) {
          success++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    } else {
      failed++;
    }
    
    // 等待1秒，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 下载结果总结');
  console.log('='.repeat(60));
  console.log(`✅ 成功下载：${success}/7`);
  console.log(`⏭️  已经存在：${skipped}/7`);
  console.log(`❌ 下载失败：${failed}/7`);
  console.log('');
  
  // 检查总共有多少BGM
  const allBGMs = fs.readdirSync(BGM_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`📁 BGM目录共有：${allBGMs.length}/9首`);
  
  if (allBGMs.length < 9) {
    console.log('\n💡 建议：');
    console.log('   部分BGM下载失败，可以：');
    console.log('   1. 手动从 https://www.bensound.com/ 下载');
    console.log('   2. 或游戏先不使用BGM（语音+音效已够丰富）');
    console.log('\n   查看详细指南：BGM下载指南-无需注册.md');
  } else {
    console.log('\n🎉 所有BGM已就位！游戏可以完整体验了！');
  }
  
  console.log('='.repeat(60));
  
  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

export { main as downloadBGMFinal };

