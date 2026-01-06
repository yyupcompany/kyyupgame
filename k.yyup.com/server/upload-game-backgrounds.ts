import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Jimp from 'jimp';
import type { Image } from 'jimp';
import { SystemOSSService } from './src/services/system-oss.service';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

interface GameBackground {
  gameKey: string;
  fileName: string;
  gradient: {
    type: 'linear' | 'radial';
    colors: string[];
    direction?: number;
  };
  overlays?: {
    type: 'circles' | 'squares' | 'stars' | 'hearts';
    color: string;
    count: number;
  }[];
}

const gameBackgrounds: GameBackground[] = [
  {
    gameKey: 'princess-garden',
    fileName: 'princess-garden-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#ff9a9e', '#fecfef', '#fecfef'],
      direction: 135
    },
    overlays: [
      { type: 'hearts', color: 'rgba(255, 255, 255, 0.3)', count: 15 },
      { type: 'circles', color: 'rgba(255, 255, 255, 0.1)', count: 8 }
    ]
  },
  {
    gameKey: 'space-treasure',
    fileName: 'space-treasure-bg.jpg',
    gradient: {
      type: 'radial',
      colors: ['#667eea', '#764ba2']
    },
    overlays: [
      { type: 'stars', color: 'rgba(255, 255, 255, 0.6)', count: 20 },
      { type: 'circles', color: 'rgba(255, 255, 255, 0.1)', count: 5 }
    ]
  },
  {
    gameKey: 'animal-observer',
    fileName: 'animal-observer-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#f093fb', '#f5576c'],
      direction: 45
    },
    overlays: [
      { type: 'circles', color: 'rgba(255, 255, 255, 0.2)', count: 12 }
    ]
  },
  {
    gameKey: 'princess-memory',
    fileName: 'princess-memory-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#4facfe', '#00f2fe'],
      direction: 90
    },
    overlays: [
      { type: 'hearts', color: 'rgba(255, 255, 255, 0.3)', count: 10 },
      { type: 'squares', color: 'rgba(255, 255, 255, 0.1)', count: 6 }
    ]
  },
  {
    gameKey: 'dinosaur-memory',
    fileName: 'dinosaur-memory-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#43e97b', '#38f9d7'],
      direction: 180
    },
    overlays: [
      { type: 'circles', color: 'rgba(255, 255, 255, 0.2)', count: 8 }
    ]
  },
  {
    gameKey: 'fruit-sequence',
    fileName: 'fruit-sequence-bg.jpg',
    gradient: {
      type: 'radial',
      colors: ['#fa709a', '#fee140']
    },
    overlays: [
      { type: 'circles', color: 'rgba(255, 255, 255, 0.3)', count: 10 }
    ]
  },
  {
    gameKey: 'dollhouse-tidy',
    fileName: 'dollhouse-tidy-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#30cfd0', '#330867'],
      direction: 270
    },
    overlays: [
      { type: 'squares', color: 'rgba(255, 255, 255, 0.2)', count: 8 }
    ]
  },
  {
    gameKey: 'robot-factory',
    fileName: 'robot-factory-bg.jpg',
    gradient: {
      type: 'radial',
      colors: ['#a8edea', '#fed6e3']
    },
    overlays: [
      { type: 'squares', color: 'rgba(255, 255, 255, 0.3)', count: 12 }
    ]
  },
  {
    gameKey: 'color-sorting',
    fileName: 'color-sorting-bg.jpg',
    gradient: {
      type: 'linear',
      colors: ['#ff9a56', '#ff6a88'],
      direction: 60
    },
    overlays: [
      { type: 'circles', color: 'rgba(255, 255, 255, 0.2)', count: 15 }
    ]
  }
];

async function generateBackgroundImage(gameBg: GameBackground): Promise<Buffer> {
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
  if (gameBg.overlays) {
    for (const overlay of gameBg.overlays) {
      for (let i = 0; i < overlay.count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 30 + 10;
        const color = Jimp.cssColorToHex(overlay.color);

        switch (overlay.type) {
          case 'circles':
            drawCircle(image, x, y, size, color);
            break;
          case 'squares':
            drawSquare(image, x, y, size, color);
            break;
          case 'stars':
            drawStar(image, x, y, size, color);
            break;
          case 'hearts':
            drawHeart(image, x, y, size, color);
            break;
        }
      }
    }
  }

  // 添加轻微的纹理效果
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const size = Math.random() * 2 + 1;
    const color = 0x88FFFFFF; // 半透明白色
    drawSquare(image, x, y, size, color);
  }

  return await image.getBufferAsync('image/jpeg');
}

function interpolateColor(colors: number[], ratio: number): number {
  const index = ratio * (colors.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const localRatio = index - lowerIndex;

  if (lowerIndex === upperIndex) {
    return colors[lowerIndex];
  }

  return interpolateColors(colors[lowerIndex], colors[upperIndex], localRatio);
}

function interpolateColors(color1: number, color2: number, ratio: number): number {
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

function drawCircle(image: Image, x: number, y: number, radius: number, color: number): void {
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

function drawSquare(image: Image, x: number, y: number, size: number, color: number): void {
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const px = Math.floor(x - size/2 + dx);
      const py = Math.floor(y - size/2 + dy);
      if (px >= 0 && px < image.width && py >= 0 && py < image.height) {
        image.setPixelColor(color, px, py);
      }
    }
  }
}

function drawStar(image: Image, x: number, y: number, size: number, color: number): void {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size / 2;

  let rot = Math.PI / 2 * 3;
  let px = x;
  let py = y;
  const step = Math.PI / spikes;

  const points: [number, number][] = [];

  for (let i = 0; i < spikes; i++) {
    px = x + Math.cos(rot) * outerRadius;
    py = y + Math.sin(rot) * outerRadius;
    points.push([Math.floor(px), Math.floor(py)]);
    rot += step;

    px = x + Math.cos(rot) * innerRadius;
    py = y + Math.sin(rot) * innerRadius;
    points.push([Math.floor(px), Math.floor(py)]);
    rot += step;
  }

  // 简单的星形填充
  for (let i = 0; i < points.length; i++) {
    const nextIndex = (i + 1) % points.length;
    drawLine(image, points[i][0], points[i][1], points[nextIndex][0], points[nextIndex][1], color);
  }
}

function drawHeart(image: Image, x: number, y: number, size: number, color: number): void {
  // 简化的心形 - 使用两个圆形和一个三角形
  const radius = size / 2;

  // 左圆形
  drawCircle(image, x - radius/2, y - radius/2, radius/2, color);
  // 右圆形
  drawCircle(image, x + radius/2, y - radius/2, radius/2, color);
  // 下三角形
  const trianglePoints: [number, number][] = [
    [x - radius, y],
    [x + radius, y],
    [x, y + radius]
  ];

  for (let i = 0; i < trianglePoints.length; i++) {
    const nextIndex = (i + 1) % trianglePoints.length;
    drawLine(image, trianglePoints[i][0], trianglePoints[i][1], trianglePoints[nextIndex][0], trianglePoints[nextIndex][1], color);
  }
}

function drawLine(image: Image, x1: number, y1: number, x2: number, y2: number, color: number): void {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = (x1 < x2) ? 1 : -1;
  const sy = (y1 < y2) ? 1 : -1;
  let err = dx - dy;

  let px = x1;
  let py = y1;

  while (true) {
    if (px >= 0 && px < image.width && py >= 0 && py < image.height) {
      image.setPixelColor(color, px, py);
    }

    if ((px === x2) && (py === y2)) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      px += sx;
    }
    if (e2 < dx) {
      err += dx;
      py += sy;
    }
  }
}

async function uploadGameBackgrounds(): Promise<void> {
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

    // 验证上传结果
    console.log('\n🔍 验证上传结果...');
    const checkResult = await service.listFiles('games/images', { maxKeys: 20 });

    const uploadedBgFiles = checkResult.files.filter(file =>
      file.name.includes('-bg.jpg')
    );

    console.log(`✅ 找到背景图文件: ${uploadedBgFiles.length}个`);
    uploadedBgFiles.forEach(file => {
      console.log(`  - ${file.name}`);
    });

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