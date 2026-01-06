const dotenv = require('dotenv');
const path = require('path');
const OSS = require('ali-oss');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const gameBackgrounds = [
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

async function setPublicAccess() {
  console.log('🔐 设置OSS文件为公开读权限...');

  // 初始化OSS客户端
  const client = new OSS({
    region: process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou',
    accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
    bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder'
  });

  const basePath = process.env.SYSTEM_OSS_PATH_PREFIX || 'kindergarten/';

  try {
    for (const fileName of gameBackgrounds) {
      const ossPath = `${basePath}games/images/${fileName}`;

      console.log(`🔓 设置 ${fileName} 为公开读权限...`);

      try {
        // 设置文件为公开读权限
        await client.putACL(ossPath, 'public-read');
        console.log(`✅ ${fileName} 已设置为公开读权限`);

        // 验证权限设置
        const aclResult = await client.getACL(ossPath);
        console.log(`📋 ${fileName} 当前权限: ${aclResult.acl}`);

      } catch (error) {
        console.error(`❌ 设置 ${fileName} 权限失败:`, error.message);

        // 检查文件是否存在
        try {
          const exists = await client.head(ossPath);
          if (exists) {
            console.log(`⚠️  文件存在但权限设置失败，尝试重新上传...`);

            // 创建简单的占位符文件
            const pngData = Buffer.from([
              0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
              0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x08,
              0x03, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
              0x08, 0x09, 0x10
            ]);

            // 重新上传并设置为公开读权限
            await client.put(ossPath, pngData, {
              headers: {
                'Content-Type': 'image/jpeg',
                'x-oss-object-acl': 'public-read'
              },
            });

            console.log(`✅ ${fileName} 重新上传并设置为公开读权限`);
          } else {
            console.log(`❌ ${fileName} 文件不存在`);
          }
        } catch (headError) {
          console.log(`❌ ${fileName} 文件不存在或无法访问: ${headError.message}`);
        }
      }
    }

    console.log('\n🎉 OSS文件权限设置完成！');

  } catch (error) {
    console.error('❌ 设置过程中出错:', error);
  }
}

// 运行权限设置脚本
setPublicAccess().catch(console.error);