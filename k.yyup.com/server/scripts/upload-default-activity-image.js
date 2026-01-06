/**
 * 上传默认活动图片到OSS
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// OSS配置
const OSS = require('ali-oss');
const { v4: uuidv4 } = require('uuid');

const client = new OSS({
  accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
  region: process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou',
  bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder',
});

async function uploadDefaultActivityImage() {
  try {
    console.log('🚀 开始上传默认活动图片...');

    // 检查是否已有默认图片
    const defaultImageName = 'default-activity-image.jpg';
    const defaultImagePath = path.join(__dirname, 'default-activity-image.jpg');

    try {
      // 检查本地是否存在默认图片
      if (!fs.existsSync(defaultImagePath)) {
        console.log('⚠️  本地默认图片不存在，将创建一个占位符图片');

        // 创建一个简单的1x1像素的透明PNG作为占位符
        const placeholderPNG = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        );

        fs.writeFileSync(defaultImagePath, placeholderPNG);
        console.log('✅ 已创建占位符图片');
      }

      // 上传到OSS
      const result = await client.put(
        `kindergarten/default-activity-image.jpg`,
        defaultImagePath
      );

      // 注意：OSS配置不允许设置public-read ACL，使用默认权限

      console.log('✅ 默认活动图片上传成功');
      console.log(`📁 OSS URL: ${result.url}`);
      console.log(`🔗 访问地址: https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/default-activity-image.jpg`);

      // 清理本地临时文件
      if (fs.existsSync(defaultImagePath)) {
        fs.unlinkSync(defaultImagePath);
        console.log('🧹 已清理本地临时文件');
      }

      return result.url;

    } catch (error) {
      console.error('❌ 上传失败:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('❌ OSS配置错误:', error.message);
    console.log('💡 请检查以下环境变量:');
    console.log('   - SYSTEM_OSS_ACCESS_KEY_ID');
    console.log('   - SYSTEM_OSS_ACCESS_KEY_SECRET');
    console.log('   - SYSTEM_OSS_REGION');
    console.log('   - SYSTEM_OSS_BUCKET');
  }
}

// 执行上传
if (require.main === module) {
  uploadDefaultActivityImage().catch(console.error);
}