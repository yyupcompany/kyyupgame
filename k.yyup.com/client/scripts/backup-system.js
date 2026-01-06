#!/usr/bin/env node

/**
 * 自动备份系统 - 在修复前创建备份
 * Auto Backup System - Create backups before fixing
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 备份目录
const BACKUP_DIR = './backups';

// 创建备份目录
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 创建备份目录: ${BACKUP_DIR}`);
  }
}

// 创建备份
function createBackup(filePath) {
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(BACKUP_DIR, relativePath);
    const backupDir = path.dirname(backupPath);
    
    // 创建备份目录结构
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // 复制文件
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ 已备份: ${relativePath}`);
    
    return backupPath;
  } catch (error) {
    console.error(`❌ 备份失败: ${filePath}`, error.message);
    return null;
  }
}

// 批量备份文件
function backupFiles(filePaths) {
  ensureBackupDir();
  
  const backupInfo = {
    timestamp: new Date().toISOString(),
    files: [],
    totalFiles: filePaths.length,
    successCount: 0,
    failCount: 0
  };
  
  console.log(`🔄 开始备份 ${filePaths.length} 个文件...\n`);
  
  filePaths.forEach(filePath => {
    const backupPath = createBackup(filePath);
    if (backupPath) {
      backupInfo.files.push({
        original: filePath,
        backup: backupPath,
        size: fs.statSync(filePath).size
      });
      backupInfo.successCount++;
    } else {
      backupInfo.failCount++;
    }
  });
  
  // 保存备份信息
  const backupInfoPath = path.join(BACKUP_DIR, 'backup-info.json');
  fs.writeFileSync(backupInfoPath, JSON.stringify(backupInfo, null, 2));
  
  console.log(`\n📊 备份完成:`);
  console.log(`   成功: ${backupInfo.successCount} 个`);
  console.log(`   失败: ${backupInfo.failCount} 个`);
  console.log(`   备份信息: ${backupInfoPath}`);
  
  return backupInfo;
}

// 恢复备份
function restoreBackup(backupInfo) {
  console.log(`🔄 开始恢复备份...\n`);
  
  let restoredCount = 0;
  let failedCount = 0;
  
  backupInfo.files.forEach(({ original, backup }) => {
    try {
      fs.copyFileSync(backup, original);
      console.log(`✅ 已恢复: ${path.relative(process.cwd(), original)}`);
      restoredCount++;
    } catch (error) {
      console.error(`❌ 恢复失败: ${original}`, error.message);
      failedCount++;
    }
  });
  
  console.log(`\n📊 恢复完成:`);
  console.log(`   成功: ${restoredCount} 个`);
  console.log(`   失败: ${failedCount} 个`);
  
  return restoredCount > 0;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'restore') {
    // 恢复模式
    const backupInfoPath = path.join(BACKUP_DIR, 'backup-info.json');
    if (fs.existsSync(backupInfoPath)) {
      const backupInfo = JSON.parse(fs.readFileSync(backupInfo, 'utf8'));
      restoreBackup(backupInfo);
    } else {
      console.log('❌ 没有找到备份信息文件');
    }
  } else {
    console.log('用法:');
    console.log('  node backup-system.js [restore]');
    console.log('  node backup-system.js <file1> <file2> ... - 备份指定文件');
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { backupFiles, restoreBackup, createBackup };