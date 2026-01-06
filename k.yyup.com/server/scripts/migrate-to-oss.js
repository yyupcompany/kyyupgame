/**
 * 批量迁移本地图片到OSS脚本
 * 将项目中的本地图片资源批量上传到阿里云OSS
 */

const fs = require('fs');
const path = require('path');
const OSS = require('ali-oss');
const colors = require('colors');

// OSS配置
const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || 'kyyup-oss'
};

// 创建OSS客户端
const client = new OSS(ossConfig);

// 本地图片目录
const localDirs = [
  'src/assets/images/games',
  'src/assets/images/activities',
  'src/assets/images/avatars',
  'src/assets/images/icons',
  'src/assets/images/backgrounds',
  'src/assets/images/uploads'
];

// 支持的图片格式
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

// 上传统计
let stats = {
  total: 0,
  uploaded: 0,
  skipped: 0,
  failed: 0,
  errors: []
};

/**
 * 获取OSS路径
 * @param localPath 本地路径
 * @returns OSS路径
 */
function getOSSPath(localPath) {
  // 移除src/assets/images前缀
  const relativePath = localPath.replace(/.*src\/assets\/images\//, '');
  return `images/${relativePath}`;
}

/**
 * 检查文件是否为图片
 * @param filePath 文件路径
 * @returns 是否为图片
 */
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(ext);
}

/**
 * 递归获取目录下所有图片文件
 * @param dir 目录路径
 * @returns 图片文件列表
 */
function getAllImageFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    console.log(`⚠️  目录不存在: ${dir}`);
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllImageFiles(fullPath));
    } else if (stat.isFile() && isImageFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 上传单个文件到OSS
 * @param localPath 本地文件路径
 * @param ossPath OSS文件路径
 * @returns Promise
 */
async function uploadToOSS(localPath, ossPath) {
  try {
    // 检查OSS上是否已存在
    const exists = await client.head(ossPath);
    if (exists) {
      console.log(`⏭️  跳过已存在文件: ${ossPath}`);
      stats.skipped++;
      return true;
    }
  } catch (error) {
    // 文件不存在，继续上传
  }

  try {
    const result = await client.put(ossPath, localPath);
    console.log(`✅ 上传成功: ${ossPath}`);
    stats.uploaded++;
    return result;
  } catch (error) {
    console.error(`❌ 上传失败: ${localPath} -> ${ossPath}`, error.message);
    stats.failed++;
    stats.errors.push({
      file: localPath,
      path: ossPath,
      error: error.message
    });
    return false;
  }
}

/**
 * 批量上传文件
 * @param files 文件列表
 */
async function uploadFiles(files) {
  console.log(`📤 开始批量上传 ${files.length} 个文件...`);

  // 分批处理，避免并发过多
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map(file => {
      const ossPath = getOSSPath(file);
      return uploadToOSS(file, ossPath);
    }));

    // 显示进度
    const progress = Math.round((i + batch.length) / files.length * 100);
    console.log(`📈 进度: ${progress}% (${i + batch.length}/${files.length})`);
  }
}

/**
 * 生成图片路径映射文件
 */
function generateImageMap(files) {
  const imageMap = {};

  files.forEach(localPath => {
    const relativePath = localPath.replace(/.*src\/assets\/images\//, '');
    const category = relativePath.split('/')[0];
    const filename = relativePath.split('/').slice(1).join('/');
    const ossUrl = `${client.options.bucket}.${client.options.endpoint}/${relativePath}`.replace('https://', 'https://');

    if (!imageMap[category]) {
      imageMap[category] = {};
    }

    imageMap[category][filename] = ossUrl;
  });

  const outputPath = path.join(__dirname, 'image-oss-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(imageMap, null, 2));
  console.log(`📄 图片映射文件已生成: ${outputPath}`);
}

/**
 * 生成迁移报告
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    config: ossConfig,
    stats: stats,
    summary: {
      success: stats.uploaded > 0,
      successRate: stats.total > 0 ? (stats.uploaded / stats.total * 100).toFixed(2) + '%' : '0%',
      hasErrors: stats.failed > 0
    }
  };

  const reportPath = path.join(__dirname, `oss-migration-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📋 迁移报告:');
  console.log(`   总文件数: ${stats.total}`);
  console.log(`   上传成功: ${stats.uploaded}`);
  console.log(`   跳过文件: ${stats.skipped}`);
  console.log(`   失败文件: ${stats.failed}`);
  console.log(`   成功率: ${report.summary.successRate}`);
  console.log(`   报告文件: ${reportPath}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    stats.errors.forEach(error => {
      console.log(`   ${error.file}: ${error.error}`);
    });
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始OSS图片迁移...\n');

  // 检查配置
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
    console.error('❌ OSS配置不完整，请检查环境变量');
    process.exit(1);
  }

  try {
    // 测试OSS连接
    await client.listBuckets();
    console.log('✅ OSS连接成功\n');
  } catch (error) {
    console.error('❌ OSS连接失败:', error.message);
    process.exit(1);
  }

  // 收集所有图片文件
  const allFiles = [];
  for (const dir of localDirs) {
    console.log(`📁 扫描目录: ${dir}`);
    const files = getAllImageFiles(dir);
    allFiles.push(...files);
    console.log(`   找到 ${files.length} 个图片文件`);
  }

  stats.total = allFiles.length;

  if (allFiles.length === 0) {
    console.log('⚠️  没有找到图片文件，退出');
    return;
  }

  console.log(`\n📊 总共找到 ${allFiles.length} 个图片文件\n`);

  // 开始上传
  await uploadFiles(allFiles);

  // 生成映射文件
  generateImageMap(allFiles);

  // 生成报告
  generateReport();

  if (stats.failed === 0) {
    console.log('\n🎉 所有文件迁移完成！');
  } else {
    console.log('\n⚠️  迁移完成，但有部分文件失败，请查看报告');
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('🚨 迁移失败:', error);
    process.exit(1);
  });
}

module.exports = { main, uploadToOSS, getAllImageFiles };