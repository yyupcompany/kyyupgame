const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const { SystemOSSService } = require('./src/services/system-oss.service');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const gameBackgrounds = [
  {
    gameKey: 'princess-garden',
    fileName: 'princess-garden-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#ff9a9e', '#fecfef', '#fecfef'],
      direction: 135
    }
  },
  {
    gameKey: 'space-treasure',
    fileName: 'space-treasure-bg.jpg',
    gradient: {
      type: 'radial',
      colors: ['#667eea', '#764ba2']
    }
  },
  {
    gameKey: 'animal-observer',
    fileName: 'animal-observer-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#f093fb', '#f5576c'],
      direction: 45
    }
  },
  {
    gameKey: 'princess-memory',
    fileName: 'princess-memory-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#4facfe', '#00f2fe'],
      direction: 90
    }
  },
  {
    gameKey: 'dinosaur-memory',
    fileName: 'dinosaur-memory-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#43e97b', '#38f9d7'],
      direction: 180
    }
  },
  {
    gameKey: 'fruit-sequence',
    fileName: 'fruit-sequence-bg.jpg',
    gradient: {
      type: 'radial',
      colors: ['#fa709a', '#fee140']
    }
  },
  {
    gameKey: 'dollhouse-tidy',
    fileName: 'dollhouse-tidy-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#30cfd0', '#330867'],
      direction: 270
    }
  },
  {
    gameKey: 'robot-factory',
    fileName: 'robot-factory-bg.jpg',
    gradient: {
      type: 'radial',
      colors: ['#a8edea', '#fed6e3']
    }
  },
  {
    gameKey: 'color-sorting',
    fileName: 'color-sorting-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#ff9a56', '#ff6a88'],
      direction: 60
    }
  }
];

async function generateBackgroundImage(gameBg) {
  const width = 800;
  const height = 600;
  const image = await Jimp.create(width, height);

  // 解析颜色
  const colors = gameBg.gradient.colors.map(color => Jimp.cssColorToHex(color));

  // 创建渐变背景
  if (gameBg.gradient.type === 'linear') {
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const color = interpolateColor(colors, ratio);
      for (let x = 0; x < width; x++) {
        image.setPixelColor(color, x, y);
      }
    }
  } else {
    // 径向渐变
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const ratio = Math.min(distance / maxDistance, 1);
        const color = interpolateColor(colors, ratio);
        image.setPixelColor(color, x, y);
      }
    }
  }

  // 添加装饰性覆盖层
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 30 + 10;
    const color = Jimp.cssColorToHex('rgba(255, 255, 255, 0.3)');
    drawCircle(image, x, y, size, color);
  }

  return await image.getBufferAsync('image/jpeg');
}

function interpolateColor(colors, ratio) {
  const index = ratio * (colors.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const localRatio = index - lowerIndex;

  if (lowerIndex === upperIndex) {
    return colors[lowerIndex];
  }

  return interpolateColors(colors[lowerIndex], colors[upperIndex], localRatio);
}

function interpolateColors(color1, color2, ratio) {
  const r1 = (color1 >> 16) & 0xFF;
  const g1 = (color1 >> 8) & 0xFF;
  const b1 = color1 & 0xFF;

  const r2 = (color2 >> 16) & 0xFF;
  const g2 = (color2 >> 8) & 0xFF;
  const b2 = color2 & 0xFF;

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return (r << 16) | (g << 8) | b;
}

function drawCircle(image, x, y, radius, color) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);
        if (px >= 0 && px < image.width && py >= 0 && py < image.height) {
          image.setPixelColor(color, px, py);
        }
      }
    }
  }
}

async function uploadGameBackgrounds() {
  console.log('🎨 开始生成并上传游戏背景图...');

  const service = new SystemOSSService();

  if (!service.isAvailable()) {
    console.error('❌ OSS服务不可用');
    return;
  }

  const uploadDir = './temp-backgrounds';

  // 确保临时目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    for (const gameBg of gameBackgrounds) {
      console.log(`🖼️  生成 ${gameBg.fileName}...`);

      // 生成背景图片
      const imageBuffer = await generateBackgroundImage(gameBg);

      // 保存到临时文件（用于调试）
      const tempFilePath = path.join(uploadDir, gameBg.fileName);
      fs.writeFileSync(tempFilePath, imageBuffer);

      // 上传到OSS
      console.log(`⬆️  上传 ${gameBg.fileName} 到OSS...`);
      const result = await service.uploadSystemFile(
        imageBuffer,
        'games',
        'images',
        gameBg.fileName,
        {
          contentType: 'image/jpeg',
          isPublic: true
        }
      );

      console.log(`✅ ${gameBg.fileName} 上传成功: ${result.url}`);
    }

    console.log('\n🎉 所有游戏背景图生成并上传完成！');

  } catch (error) {
    console.error('❌ 上传过程中出错:', error);
  } finally {
    // 清理临时文件
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
      console.log('🧹 清理临时文件完成');
    }
  }
}

// 运行上传脚本
uploadGameBackgrounds().catch(console.error);