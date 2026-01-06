#!/usr/bin/env ts-node

/**
 * 多租户目录结构迁移脚本
 * 将现有文件迁移到新的 system/ 和 rent/ 目录结构
 */

import { config } from 'dotenv';
import OSS from 'ali-oss';
import path from 'path';

// 加载环境变量
config();

// OSS配置
const BUCKET = process.env.SYSTEM_OSS_BUCKET || 'systemkarder';
const REGION = process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou';
const ACCESS_KEY_ID = process.env.SYSTEM_OSS_ACCESS_KEY_ID;
const ACCESS_KEY_SECRET = process.env.SYSTEM_OSS_ACCESS_KEY_SECRET;

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function colorLog(color: string, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message: string) {
  colorLog('blue', `[INFO] ${message}`);
}

function logSuccess(message: string) {
  colorLog('green', `[SUCCESS] ${message}`);
}

function logError(message: string) {
  colorLog('red', `[ERROR] ${message}`);
}

function logWarning(message: string) {
  colorLog('yellow', `[WARNING] ${message}`);
}

// 初始化OSS客户端
let client: OSS;
try {
  if (ACCESS_KEY_ID && ACCESS_KEY_SECRET) {
    client = new OSS({
      region: REGION,
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
      bucket: BUCKET,
    });
    logSuccess('OSS客户端初始化成功');
  } else {
    logError('OSS配置缺失');
    process.exit(1);
  }
} catch (error) {
  logError(`OSS客户端初始化失败: ${error}`);
  process.exit(1);
}

// 迁移单个目录
async function migrateDirectory(sourcePrefix: string, targetPrefix: string): Promise<void> {
  try {
    logInfo(`  迁移目录: ${sourcePrefix} -> ${targetPrefix}`);

    // 列出源目录文件
    const result = await client.list({
      prefix: sourcePrefix,
      'max-keys': 1000,
    });

    if (!result.objects || result.objects.length === 0) {
      logWarning(`    源目录不存在或为空: ${sourcePrefix}`);
      return;
    }

    logInfo(`    找到 ${result.objects.length} 个文件`);

    // 迁移每个文件
    let successCount = 0;
    let failCount = 0;

    for (const object of result.objects) {
      if (object.name.endsWith('/')) {
        continue; // 跳过目录本身
      }

      const targetPath = object.name.replace(sourcePrefix, targetPrefix);

      try {
        await client.copy(targetPath, object.name);
        successCount++;

        if (successCount % 10 === 0) {
          logInfo(`    已迁移: ${successCount}/${result.objects.length}`);
        }
      } catch (error) {
        failCount++;
        logError(`    迁移失败: ${object.name} - ${error}`);
      }
    }

    logSuccess(`    迁移完成: 成功 ${successCount}, 失败 ${failCount}`);
  } catch (error) {
    logError(`    目录迁移失败: ${error}`);
  }
}

// 创建租户目录结构
async function createTenantDirectories(phoneNumber: string): Promise<void> {
  try {
    logInfo(`  创建租户目录: ${phoneNumber}`);

    const directories = [
      'user-uploads/images',
      'user-uploads/documents',
      'user-uploads/videos',
      'user-uploads/audio',
      'tenant-data/logos',
      'tenant-data/attachments'
    ];

    for (const dir of directories) {
      const ossPath = `kindergarten/rent/${phoneNumber}/${dir}/.gitkeep`;
      try {
        await client.put(ossPath, Buffer.from(''));
        logInfo(`    ✅ 创建目录: rent/${phoneNumber}/${dir}`);
      } catch (error) {
        logError(`    ❌ 创建目录失败: ${dir} - ${error}`);
      }
    }
  } catch (error) {
    logError(`  创建租户目录失败: ${error}`);
  }
}

// 验证迁移结果
async function verifyMigration(): Promise<void> {
  try {
    logInfo('验证迁移结果...');

    // 检查系统目录
    logInfo('  🎮 系统游戏文件:');
    const gamesResult = await client.list({
      prefix: 'kindergarten/system/games/',
      'max-keys': 5,
    });
    if (gamesResult.objects && gamesResult.objects.length > 0) {
      gamesResult.objects.forEach((obj, index) => {
        logInfo(`    ${index + 1}. ${obj.name}`);
      });
    } else {
      logWarning('    未找到系统游戏文件');
    }

    logInfo('  📚 系统教育文件:');
    const educationResult = await client.list({
      prefix: 'kindergarten/system/education/',
      'max-keys': 5,
    });
    if (educationResult.objects && educationResult.objects.length > 0) {
      educationResult.objects.forEach((obj, index) => {
        logInfo(`    ${index + 1}. ${obj.name}`);
      });
    } else {
      logWarning('    未找到系统教育文件');
    }

    logInfo('  🤖 系统开发文件:');
    const devResult = await client.list({
      prefix: 'kindergarten/system/development/',
      'max-keys': 5,
    });
    if (devResult.objects && devResult.objects.length > 0) {
      devResult.objects.forEach((obj, index) => {
        logInfo(`    ${index + 1}. ${obj.name}`);
      });
    } else {
      logWarning('    未找到系统开发文件');
    }

    logInfo('  🏢 租户目录:');
    const rentResult = await client.list({
      prefix: 'kindergarten/rent/',
      'max-keys': 5,
    });
    if (rentResult.objects && rentResult.objects.length > 0) {
      rentResult.objects.forEach((obj, index) => {
        logInfo(`    ${index + 1}. ${obj.name}`);
      });
    } else {
      logWarning('    未找到租户目录');
    }
  } catch (error) {
    logError(`验证失败: ${error}`);
  }
}

// 主迁移函数
async function main() {
  logInfo('🏗️ 开始迁移到多租户目录结构...');
  logInfo(`目标存储桶: ${BUCKET} (${REGION})`);

  try {
    // 1. 迁移系统文件到新的 system/ 目录
    logInfo('📦 迁移系统文件到新目录结构...');

    // 迁移游戏资源
    logInfo('  🎮 迁移游戏资源...');
    await migrateDirectory('kindergarten/games/audio/bgm/', 'kindergarten/system/games/audio/bgm/');
    await migrateDirectory('kindergarten/games/audio/sfx/', 'kindergarten/system/games/audio/sfx/');
    await migrateDirectory('kindergarten/games/images/', 'kindergarten/system/games/images/');

    // 迁移教育资源
    logInfo('  📚 迁移教育资源...');
    await migrateDirectory('kindergarten/education/assessment/audio/', 'kindergarten/system/education/assessment/audio/');
    await migrateDirectory('kindergarten/education/assessment/images/', 'kindergarten/system/education/assessment/images/');
    await migrateDirectory('kindergarten/education/activities/', 'kindergarten/system/education/activities/');

    // 迁移开发资源
    logInfo('  🤖 迁移开发资源...');
    await migrateDirectory('kindergarten/development/icons/', 'kindergarten/system/development/icons/');

    // 2. 创建租户目录结构
    logInfo('🏢 创建租户目录结构...');

    // 创建rent根目录
    try {
      await client.put('kindergarten/rent/.gitkeep', Buffer.from(''));
      logInfo('  ✅ 创建rent根目录');
    } catch (error) {
      logError(`  ❌ 创建rent根目录失败: ${error}`);
    }

    // 创建示例租户目录
    const testPhoneNumbers = ['13800138000', '13900139000', '15000150000'];

    for (const phone of testPhoneNumbers) {
      await createTenantDirectories(phone);
    }

    // 3. 验证迁移结果
    logInfo('');
    await verifyMigration();

    logInfo('');
    logSuccess('✅ 多租户目录结构迁移完成！');
    logInfo('');
    logInfo('📊 新目录结构:');
    logInfo('systemkarder/kindergarten/');
    logInfo('├── system/                    # 系统文件目录');
    logInfo('│   ├── games/                # 游戏资源');
    logInfo('│   │   ├── audio/bgm/         # 游戏BGM');
    logInfo('│   │   ├── audio/sfx/         # 游戏音效');
    logInfo('│   │   └── images/            # 游戏图片');
    logInfo('│   ├── education/            # 教育资源');
    logInfo('│   │   ├── assessment/       # 测评资源');
    logInfo('│   │   └── activities/        # 活动资源');
    logInfo('│   └── development/          # 开发资源');
    logInfo('│       └── icons/            # AI图标');
    logInfo('└── rent/                     # 租户目录');
    logInfo('    └── {phone_number}/       # 手机号租户目录');
    logInfo('        ├── user-uploads/     # 用户上传文件');
    logInfo('        └── tenant-data/       # 租户专用数据');

  } catch (error) {
    logError(`迁移失败: ${error}`);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    logError(`脚本执行失败: ${error}`);
    process.exit(1);
  });
}