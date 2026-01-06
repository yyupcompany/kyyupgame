#!/usr/bin/env node

/**
 * 🔧 API路径前缀统一修复脚本
 * 
 * 功能：扫描所有前端API调用，统一添加 /api 前缀
 * 使用：node scripts/fix-api-prefix.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 配置
const CLIENT_API_DIR = path.join(__dirname, '../client/src/api');
const DRY_RUN = process.argv.includes('--dry-run'); // 是否为预览模式

// 需要添加 /api 前缀的路径模式（排除已有/api的）
const API_PATH_PATTERNS = [
  // request.get/post/put/delete/patch 调用
  /request\.(get|post|put|delete|patch)\(['"`](\/(?!api\/)[\w\-\/{}:]+)['"`]/g,
  
  // requestFunc 调用中的 url 字段
  /url:\s*['"`](\/(?!api\/)[\w\-\/{}:]+)['"`]/g,
  
  // smartRequest 相关调用
  /smart(Get|Post|Put|Delete|Patch)\(['"`](\/(?!api\/)[\w\-\/{}:]+)['"`]/g,
];

// 排除的路径（不需要添加前缀的）
const EXCLUDE_PATTERNS = [
  /^\/$/,  // 根路径
  /^\/static\//,  // 静态资源
  /^\/assets\//,  // 静态资源
  /^\/public\//,  // 公共资源
  /^\/uploads\//,  // 上传文件
  /^\/api\//,  // 已有/api前缀
];

// 统计信息
const stats = {
  filesScanned: 0,
  filesModified: 0,
  pathsFixed: 0,
  errors: []
};

/**
 * 检查路径是否需要添加前缀
 */
function shouldAddPrefix(path) {
  return !EXCLUDE_PATTERNS.some(pattern => pattern.test(path));
}

/**
 * 修复文件中的API路径
 */
function fixApiPaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let fixCount = 0;

    // 应用所有匹配模式
    API_PATH_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match, method, apiPath) => {
          // 检查是否需要添加前缀
          if (shouldAddPrefix(apiPath)) {
            modified = true;
            fixCount++;
            
            // 根据不同的匹配模式构造替换字符串
            if (match.includes('url:')) {
              return `url: '/api${apiPath}'`;
            } else if (match.includes('smart')) {
              return match.replace(apiPath, `/api${apiPath}`);
            } else {
              return `request.${method}('/api${apiPath}'`;
            }
          }
          return match;
        });
      }
    });

    // 如果文件被修改，保存或显示
    if (modified) {
      stats.filesModified++;
      stats.pathsFixed += fixCount;

      if (DRY_RUN) {
        console.log(`\n📝 [预览] ${path.relative(CLIENT_API_DIR, filePath)}`);
        console.log(`   修复 ${fixCount} 个API路径`);
      } else {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ ${path.relative(CLIENT_API_DIR, filePath)} - 修复 ${fixCount} 个路径`);
      }
    }

    stats.filesScanned++;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ 处理失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始扫描API文件...\n');
  console.log(`📂 目录: ${CLIENT_API_DIR}`);
  console.log(`🔍 模式: ${DRY_RUN ? '预览模式（不修改文件）' : '修复模式'}\n`);

  // 查找所有API文件
  const apiFiles = glob.sync('**/*.{ts,js}', {
    cwd: CLIENT_API_DIR,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts']
  });

  console.log(`📄 找到 ${apiFiles.length} 个API文件\n`);

  // 处理每个文件
  apiFiles.forEach(fixApiPaths);

  // 显示统计信息
  console.log('\n' + '='.repeat(60));
  console.log('📊 统计报告');
  console.log('='.repeat(60));
  console.log(`扫描文件数: ${stats.filesScanned}`);
  console.log(`修改文件数: ${stats.filesModified}`);
  console.log(`修复路径数: ${stats.pathsFixed}`);
  console.log(`错误数量: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${path.relative(CLIENT_API_DIR, file)}: ${error}`);
    });
  }

  if (DRY_RUN) {
    console.log('\n💡 提示: 使用 node scripts/fix-api-prefix.js 执行实际修复');
  } else {
    console.log('\n✅ 修复完成！');
  }

  console.log('='.repeat(60) + '\n');
}

// 执行脚本
main();
