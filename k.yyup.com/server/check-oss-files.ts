import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

import { SystemOSSService } from './src/services/system-oss.service';

async function checkGameImages() {
  try {
    const service = new SystemOSSService();
    console.log('🔍 OSS服务状态:', service.isAvailable() ? '✅ 可用' : '❌ 不可用');

    if (!service.isAvailable()) {
      console.log('❌ OSS服务未配置');
      return;
    }

    console.log('📦 存储桶信息:', (service as any).bucket, (service as any).region);

    // 检查games/images目录下的文件
    const result = await service.listFiles('games/images', { maxKeys: 100 });
    console.log(`\n📁 games目录下的文件 (${result.files.length}个):`);

    if (result.files.length === 0) {
      console.log('  - 没有找到任何文件');
    } else {
      result.files.forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });
    }

    // 特别检查背景图
    const bgImages = result.files.filter(file =>
      file.name.includes('bg') ||
      file.name.includes('background') ||
      file.name.includes('-bg.') ||
      file.name.includes('-background.') ||
      file.name.endsWith('-bg.jpg')
    );
    console.log(`\n🎨 找到背景图文件: ${bgImages.length}个`);
    bgImages.forEach(file => {
      console.log(`  - ${file.name}`);
      console.log(`    URL: ${file.url}`);
    });

    // 检查特定游戏背景图
    const expectedBgImages = [
      'princess-garden-bg.jpg',
      'space-treasure-bg.jpg',
      'animal-observer-bg.jpg',
      'princess-memory-bg.jpg',
      'dinosaur-memory-bg.jpg',
      'fruit-sequence-bg.jpg',
      'dollhouse-tidy-bg.jpg',
      'robot-factory-bg.jpg',
      'color-sorting-bg.jpg'
    ];

    console.log(`\n🎯 检查预期背景图文件:`);
    expectedBgImages.forEach(bgName => {
      const exists = result.files.some(file => file.name.includes(bgName));
      console.log(`  - ${bgName}: ${exists ? '✅ 存在' : '❌ 缺失'}`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', (error as Error).message);
  }
}

checkGameImages();