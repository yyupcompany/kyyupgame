const OSS = require('ali-oss');
require('dotenv').config();

const client = new OSS({
  region: process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou',
  accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
  bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder',
});

async function checkEducationContent() {
  try {
    console.log('📚 检查教育资源内容...\n');

    // 检查测评音频
    console.log('🎵 测评音频资源 (前10个):');
    const audioResult = await client.list({
      prefix: 'kindergarten/system/education/assessment/audio/',
      'max-keys': 10
    });

    if (audioResult.objects && audioResult.objects.length > 0) {
      audioResult.objects.forEach((obj, index) => {
        if (!obj.name.endsWith('/')) {
          const filename = obj.name.split('/').pop();
          console.log(`  ${index + 1}. ${filename} (${(obj.size / 1024).toFixed(1)}KB)`);
        }
      });
    }

    // 检查测评图片
    console.log('\n🖼️ 测评图片资源 (前10个):');
    const imageResult = await client.list({
      prefix: 'kindergarten/system/education/assessment/images/',
      'max-keys': 10
    });

    if (imageResult.objects && imageResult.objects.length > 0) {
      imageResult.objects.forEach((obj, index) => {
        if (!obj.name.endsWith('/')) {
          const filename = obj.name.split('/').pop();
          console.log(`  ${index + 1}. ${filename} (${(obj.size / 1024).toFixed(1)}KB)`);
        }
      });
    }

    // 检查活动资源
    console.log('\n🎯 活动资源:');
    const activityResult = await client.list({
      prefix: 'kindergarten/system/education/activities/',
      'max-keys': 10
    });

    if (activityResult.objects && activityResult.objects.length > 0) {
      activityResult.objects.forEach((obj, index) => {
        if (!obj.name.endsWith('/')) {
          const filename = obj.name.split('/').pop();
          console.log(`  ${index + 1}. ${filename} (${(obj.size / 1024).toFixed(1)}KB)`);
        }
      });
    }

    console.log('\n📊 统计信息:');
    console.log(`  - 测评音频总数: ${audioResult.objects?.filter(o => !o.name.endsWith('/')).length || 0} 个文件`);
    console.log(`  - 测评图片总数: ${imageResult.objects?.filter(o => !o.name.endsWith('/')).length || 0} 个文件`);
    console.log(`  - 活动资源总数: ${activityResult.objects?.filter(o => !o.name.endsWith('/')).length || 0} 个文件`);

    // 检查具体的文件内容类型
    console.log('\n🔍 详细分析:');

    // 分析音频文件类型
    if (audioResult.objects) {
      const audioFiles = audioResult.objects.filter(o => !o.name.endsWith('/'));
      const mp3Count = audioFiles.filter(o => o.name.endsWith('.mp3')).length;
      const txtCount = audioFiles.filter(o => o.name.endsWith('.txt')).length;
      console.log(`  - 测评音频: MP3文件 ${mp3Count} 个, 文本文件 ${txtCount} 个`);
    }

    // 分析图片文件类型
    if (imageResult.objects) {
      const imageFiles = imageResult.objects.filter(o => !o.name.endsWith('/'));
      const jpgCount = imageFiles.filter(o => o.name.endsWith('.jpg')).length;
      const pngCount = imageFiles.filter(o => o.name.endsWith('.png')).length;
      console.log(`  - 测评图片: JPG文件 ${jpgCount} 个, PNG文件 ${pngCount} 个`);
    }

  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

checkEducationContent();