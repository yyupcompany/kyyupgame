const OSS = require('ali-oss');
require('dotenv').config();

const client = new OSS({
  region: process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou',
  accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
  bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder',
});

async function detailedEducationCheck() {
  try {
    console.log('📚 详细教育资源分析报告\n');

    // 获取所有测评音频
    console.log('🎵 测评音频资源详细列表:');
    const audioResult = await client.list({
      prefix: 'kindergarten/system/education/assessment/audio/',
      'max-keys': 1000
    });

    if (audioResult.objects) {
      const audioFiles = audioResult.objects.filter(o => !o.name.endsWith('/'));
      console.log(`总计: ${audioFiles.length} 个音频文件\n`);

      // 按年龄段分类
      const ageGroups = {};
      audioFiles.forEach(obj => {
        const filename = obj.name.split('/').pop();
        const match = filename.match(/q\d+_(\w+)_(\d+)-(\d+)/);
        if (match) {
          const [, type, minAge, maxAge] = match;
          const ageGroup = `${minAge}-${maxAge}个月`;
          if (!ageGroups[ageGroup]) ageGroups[ageGroup] = [];
          ageGroups[ageGroup].push({
            id: filename.split('_')[0],
            type: type,
            size: (obj.size / 1024).toFixed(1)
          });
        }
      });

      Object.keys(ageGroups).sort().forEach(ageGroup => {
        console.log(`  📊 ${ageGroup}个月 (${ageGroups[ageGroup].length}个文件):`);
        ageGroups[ageGroup].forEach(file => {
          console.log(`     - ${file.id} (${file.type}) - ${file.size}KB`);
        });
      });
    }

    // 获取所有测评图片
    console.log('\n🖼️ 测评图片资源详细列表:');
    const imageResult = await client.list({
      prefix: 'kindergarten/system/education/assessment/images/',
      'max-keys': 1000
    });

    if (imageResult.objects) {
      const imageFiles = imageResult.objects.filter(o => !o.name.endsWith('/'));
      console.log(`总计: ${imageFiles.length} 个图片文件\n`);

      // 按年龄段分类
      const ageGroups = {};
      imageFiles.forEach(obj => {
        const filename = obj.name.split('/').pop();
        const match = filename.match(/q\d+_(\w+)_(\d+)-(\d+)_\d+/);
        if (match) {
          const [, type, minAge, maxAge] = match;
          const ageGroup = `${minAge}-${maxAge}个月`;
          if (!ageGroups[ageGroup]) ageGroups[ageGroup] = [];
          ageGroups[ageGroup].push({
            id: filename.split('_')[0],
            type: type,
            size: (obj.size / 1024).toFixed(1)
          });
        }
      });

      Object.keys(ageGroups).sort().forEach(ageGroup => {
        console.log(`  📊 ${ageGroup}个月 (${ageGroups[ageGroup].length}个文件):`);
        ageGroups[ageGroup].forEach(file => {
          console.log(`     - ${file.id} (${file.type}) - ${file.size}KB`);
        });
      });
    }

    // 获取活动资源
    console.log('\n🎯 活动资源详细列表:');
    const activityResult = await client.list({
      prefix: 'kindergarten/system/education/activities/',
      'max-keys': 1000
    });

    if (activityResult.objects) {
      const activityFiles = activityResult.objects.filter(o => !o.name.endsWith('/'));
      console.log(`总计: ${activityFiles.length} 个活动文件\n`);

      activityFiles.forEach(obj => {
        const filename = obj.name.split('/').pop();
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        const size = (obj.size / 1024).toFixed(1);
        console.log(`  📸 ${nameWithoutExt.replace(/_/g, ' ')} - ${size}KB`);
      });
    }

    // 分析内容用途
    console.log('\n📋 内容用途分析:');
    console.log('🧠 儿童发展测评系统:');
    console.log('  - 运动能力测评 (motor): 评估儿童大肌肉和小肌肉发展');
    console.log('  - 社交能力测评 (social): 评估儿童社交互动和情感发展');
    console.log('  - 年龄段覆盖: 24-72个月 (2-6岁)');
    console.log('  - 测评形式: 音频提问 + 图片展示');

    console.log('\n🎨 幼儿园活动素材:');
    console.log('  - 秋季出游活动');
    console.log('  - 家庭运动会');
    console.log('  - 水果采摘活动');
    console.log('  - 手工制作工坊');
    console.log('  - 春季野餐活动');
    console.log('  - 冬季节日活动');

    console.log('\n💾 存储统计:');
    const totalAudioSize = audioResult?.objects?.filter(o => !o.name.endsWith('/')).reduce((sum, o) => sum + o.size, 0) || 0;
    const totalImageSize = imageResult?.objects?.filter(o => !o.name.endsWith('/')).reduce((sum, o) => sum + o.size, 0) || 0;
    const totalActivitySize = activityResult?.objects?.filter(o => !o.name.endsWith('/')).reduce((sum, o) => sum + o.size, 0) || 0;

    console.log(`  - 测评音频总大小: ${(totalAudioSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - 测评图片总大小: ${(totalImageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - 活动资源总大小: ${(totalActivitySize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - 总计: ${((totalAudioSize + totalImageSize + totalActivitySize) / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

detailedEducationCheck();