#!/usr/bin/env node

/**
 * 任务中心修复验证脚本
 * 验证硬编码用户ID问题是否已修复
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 任务中心修复验证');
console.log('═══════════════════════════════════════════════════════════\n');

const apiFilePath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/api/task-center.ts';

// 读取文件
const content = fs.readFileSync(apiFilePath, 'utf-8');

// 验证项
const checks = {
  hasUserStoreImport: content.includes('import { useUserStore }'),
  noHardcodedId: !content.includes('queryParams.assignee_id = 121'),
  hasCorrectCode: content.includes('userStore.user?.id'),
  hasGetTasksFunction: content.includes('export const getTasks')
};

let allPassed = true;

// 检查1: 是否导入了useUserStore
console.log('✅ 检查1: useUserStore导入');
if (checks.hasUserStoreImport) {
  console.log('   ✅ 已正确导入 useUserStore\n');
} else {
  console.log('   ❌ 未导入 useUserStore\n');
  allPassed = false;
}

// 检查2: 是否移除了硬编码ID
console.log('✅ 检查2: 硬编码用户ID');
if (checks.noHardcodedId) {
  console.log('   ✅ 已移除硬编码用户ID (121)\n');
} else {
  console.log('   ❌ 仍然存在硬编码用户ID\n');
  allPassed = false;
}

// 检查3: 是否使用了正确的代码
console.log('✅ 检查3: 正确的用户ID获取');
if (checks.hasCorrectCode) {
  console.log('   ✅ 使用 userStore.user?.id 获取用户ID\n');
} else {
  console.log('   ❌ 未使用正确的方式获取用户ID\n');
  allPassed = false;
}

// 检查4: 函数是否存在
console.log('✅ 检查4: getTasks函数');
if (checks.hasGetTasksFunction) {
  console.log('   ✅ getTasks函数存在\n');
} else {
  console.log('   ❌ getTasks函数不存在\n');
  allPassed = false;
}

// 显示修复后的代码
console.log('═══════════════════════════════════════════════════════════');
console.log('📝 修复后的代码片段');
console.log('═══════════════════════════════════════════════════════════\n');

const lines = content.split('\n');
let startPrinting = false;
let printedLines = 0;

for (let i = 0; i < lines.length && printedLines < 15; i++) {
  if (lines[i].includes('export const getTasks')) {
    startPrinting = true;
  }
  
  if (startPrinting) {
    console.log(`${i + 1}: ${lines[i]}`);
    printedLines++;
    
    if (printedLines >= 20) {
      console.log('   ... (省略)');
      break;
    }
  }
}

console.log('\n═══════════════════════════════════════════════════════════');

// 最终结果
console.log('\n📊 验证结果\n');

if (allPassed) {
  console.log('✅ 所有检查通过！');
  console.log('✅ 硬编码用户ID问题已成功修复');
  console.log('✅ 任务中心页面错误修复验收通过\n');
  process.exit(0);
} {
  console.log('❌ 部分检查失败');
  console.log('❌ 请检查上述失败项\n');
  process.exit(1);
}
