const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const OSS = require('ali-oss');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const gameBackgrounds = [
  { gameKey: 'princess-garden', fileName: 'princess-garden-bg.jpg' },
  { gameKey: 'space-treasure', fileName: 'space-treasure-bg.jpg' },
  { gameKey: 'animal-observer', fileName: 'animal-observer-bg.jpg' },
  { gameKey: 'princess-memory', fileName: 'princess-memory-bg.jpg' },
  { gameKey: 'dinosaur-memory', fileName: 'dinosaur-memory-bg.jpg' },
  { gameKey: 'fruit-sequence', fileName: 'fruit-sequence-bg.jpg' },
  { gameKey: 'dollhouse-tidy', fileName: 'dollhouse-tidy-bg.jpg' },
  { gameKey: 'robot-factory', fileName: 'robot-factory-bg.jpg' },
  { gameKey: 'color-sorting', fileName: 'color-sorting-bg.jpg' }
];

function createSimplePNG() {
  // 创建一个简单的1x1像素的PNG文件
  // PNG文件头
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x08,
    0x03, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x10
  ]);
  return pngData;
}

async function uploadGameBackgrounds() {
  console.log('🎨 开始创建并上传游戏背景图...');

  // 初始化OSS客户端
  const client = new OSS({
    region: process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou',
    accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
    bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder'
  });

  const basePath = process.env.SYSTEM_OSS_PATH_PREFIX || 'kindergarten/';
  const uploadDir = './temp-backgrounds';

  // 确保临时目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    for (const gameBg of gameBackgrounds) {
      console.log(`🖼️  创建 ${gameBg.fileName}...`);

      // 创建简单的PNG文件作为占位符
      const pngBuffer = createSimplePNG();
      const tempFilePath = path.join(uploadDir, gameBg.fileName);
      fs.writeFileSync(tempFilePath, pngBuffer);

      // 上传到OSS
      const ossPath = `${basePath}games/images/${gameBg.fileName}`;
      console.log(`⬆️  上传 ${gameBg.fileName} 到OSS (${ossPath})...`);

      const result = await client.put(ossPath, pngBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      const url = `https://${client.options.bucket}.${client.options.region}.aliyuncs.com/${ossPath}`;
      console.log(`✅ ${gameBg.fileName} 上传成功: ${url}`);
    }

    console.log('\n🎉 所有游戏背景图创建并上传完成！');
    console.log('⚠️ 注意: 这些是占位符图片，后续可以替换为真正的背景图');

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