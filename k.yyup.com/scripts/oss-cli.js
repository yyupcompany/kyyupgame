#!/usr/bin/env node

/**
 * 阿里云 OSS CLI 工具
 * 用于诊断和管理 OSS 文件
 */

const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const args = process.argv.slice(2);
const command = args[0];

// 从环境变量读取配置
const config = {
  region: process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou',
  accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
  bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder'
};

async function diagnose() {
  console.log('\n🔍 OSS 诊断工具\n');
  console.log('='.repeat(60));
  
  console.log('\n📋 当前配置:');
  console.log(`  Bucket: ${config.bucket}`);
  console.log(`  Region: ${config.region}`);
  console.log(`  Access Key ID: ${config.accessKeyId ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`  Access Key Secret: ${config.accessKeySecret ? '✅ 已配置' : '❌ 未配置'}`);
  
  if (!config.accessKeyId || !config.accessKeySecret) {
    console.log('\n❌ 错误: Access Key 未配置');
    console.log('\n📝 请在 server/.env 中配置以下变量:');
    console.log('  SYSTEM_OSS_ACCESS_KEY_ID=your-key-id');
    console.log('  SYSTEM_OSS_ACCESS_KEY_SECRET=your-key-secret');
    process.exit(1);
  }
  
  console.log('\n🔗 测试连接...');
  
  try {
    const client = new OSS(config);
    const result = await client.list({ 'max-keys': 1 });
    console.log('✅ 连接成功！\n');
    
    // 获取完整统计
    await listAllFiles();
  } catch (error) {
    console.log(`❌ 连接失败: ${error.message}\n`);
    console.log('💡 可能的原因:');
    console.log('  1. Access Key ID 或 Secret 不正确');
    console.log('  2. Access Key 已被禁用或删除');
    console.log('  3. 网络连接问题');
    process.exit(1);
  }
}

async function listAllFiles() {
  console.log('📊 扫描 OSS 文件...\n');
  
  try {
    const client = new OSS(config);
    let marker = '';
    let allObjects = [];
    let pageCount = 0;
    
    do {
      pageCount++;
      process.stdout.write(`\r  加载第 ${pageCount} 页...`);
      
      const result = await client.list({
        marker: marker,
        'max-keys': 1000
      });
      
      allObjects = allObjects.concat(result.objects || []);
      marker = result.nextMarker;
      
      if (!marker) break;
    } while (marker);
    
    console.log(`\r✅ 共加载 ${allObjects.length} 个文件\n`);
    
    // 统计信息
    const stats = {
      totalFiles: allObjects.length,
      totalSize: 0,
      byType: {},
      byDirectory: {}
    };
    
    allObjects.forEach(obj => {
      stats.totalSize += obj.size;
      
      const ext = obj.name.split('.').pop()?.toLowerCase() || 'unknown';
      stats.byType[ext] = (stats.byType[ext] || 0) + 1;
      
      const dir = obj.name.split('/')[0] || 'root';
      stats.byDirectory[dir] = (stats.byDirectory[dir] || 0) + 1;
    });
    
    // 显示统计
    console.log('📈 统计信息:');
    console.log('='.repeat(60));
    console.log(`总文件数: ${stats.totalFiles}`);
    console.log(`总大小: ${formatSize(stats.totalSize)}`);
    console.log(`目录数: ${Object.keys(stats.byDirectory).length}`);
    console.log(`文件类型: ${Object.keys(stats.byType).length}`);
    
    console.log('\n📁 按目录统计:');
    console.log('-'.repeat(60));
    Object.entries(stats.byDirectory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([dir, count]) => {
        const pct = ((count / stats.totalFiles) * 100).toFixed(1);
        console.log(`  ${dir.padEnd(25)} : ${count.toString().padStart(5)} 个 (${pct}%)`);
      });
    
    console.log('\n📄 按文件类型统计:');
    console.log('-'.repeat(60));
    Object.entries(stats.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const pct = ((count / stats.totalFiles) * 100).toFixed(1);
        console.log(`  ${type.padEnd(15)} : ${count.toString().padStart(5)} 个 (${pct}%)`);
      });
    
  } catch (error) {
    console.error(`❌ 扫描失败: ${error.message}`);
    process.exit(1);
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 显示帮助
function showHelp() {
  console.log(`
阿里云 OSS CLI 工具

用法:
  node scripts/oss-cli.js [命令]

命令:
  diagnose    诊断 OSS 连接并显示统计信息
  help        显示帮助信息

示例:
  node scripts/oss-cli.js diagnose
  node scripts/oss-cli.js help
  `);
}

// 主程序
if (command === 'diagnose') {
  diagnose();
} else if (command === 'help' || command === '--help' || command === '-h') {
  showHelp();
} else if (!command) {
  diagnose();
} else {
  console.log(`❌ 未知命令: ${command}\n`);
  showHelp();
  process.exit(1);
}

