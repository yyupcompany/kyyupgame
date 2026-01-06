const https = require('https');
const http = require('http');

const gameBackgrounds = [
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/princess-garden-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/space-treasure-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/animal-observer-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/princess-memory-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/dinosaur-memory-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/fruit-sequence-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/dollhouse-tidy-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/robot-factory-bg.jpg',
  'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/images/color-sorting-bg.jpg'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, (response) => {
      resolve({
        url,
        status: response.statusCode,
        success: response.statusCode === 200
      });
    });

    request.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        success: false
      });
    });

    request.setTimeout(5000, () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false
      });
    });
  });
}

async function checkAllBackgrounds() {
  console.log('🔍 检查游戏背景图片HTTP访问状态...\n');

  let successCount = 0;
  let failCount = 0;

  for (const url of gameBackgrounds) {
    const result = await checkUrl(url);
    const gameName = url.split('/').pop().replace('-bg.jpg', '');

    if (result.success) {
      console.log(`✅ ${gameName}: HTTP ${result.status}`);
      successCount++;
    } else {
      console.log(`❌ ${gameName}: ${result.status}`);
      failCount++;
    }
  }

  console.log(`\n📊 总计: ${successCount}个成功, ${failCount}个失败`);

  if (successCount === gameBackgrounds.length) {
    console.log('🎉 所有背景图片都可以访问！');
  } else {
    console.log('⚠️  部分背景图片无法访问，可能需要重新上传');
  }
}

checkAllBackgrounds().catch(console.error);