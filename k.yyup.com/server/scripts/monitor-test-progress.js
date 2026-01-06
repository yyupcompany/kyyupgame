#!/usr/bin/env node

/**
 * AI字典关键词测试进度监控脚本
 * 实时监控测试进度并生成中间报告
 */

const fs = require('fs');
const path = require('path');

// 配置
const OUTPUT_FILE = './reports/ai-dictionary-test-results-full.json';
const PROGRESS_FILE = './reports/ai-dictionary-test-progress.json';
const MONITOR_INTERVAL = 10000; // 10秒检查一次

/**
 * 分析当前进度
 */
function analyzeProgress() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return {
      status: 'not_started',
      message: '测试尚未开始或结果文件不存在'
    };
  }
  
  try {
    const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
    const data = JSON.parse(content);
    
    const progress = {
      status: 'running',
      timestamp: new Date().toISOString(),
      totalKeywords: data.totalKeywords || 762,
      testedKeywords: data.results ? data.results.length : 0,
      successRate: 0,
      failureRate: 0,
      permissionIssues: 0,
      estimatedTimeRemaining: 0,
      currentBatch: 0,
      summary: {
        successful: 0,
        failed: 0,
        permissionIssues: 0,
        systemSensitive: 0
      }
    };
    
    if (data.results && data.results.length > 0) {
      progress.summary.successful = data.results.filter(r => r.success).length;
      progress.summary.failed = data.results.filter(r => !r.success).length;
      progress.summary.permissionIssues = data.results.filter(r => r.permissionIssue).length;
      progress.summary.systemSensitive = data.results.filter(r => r.systemSensitive).length;
      
      progress.successRate = (progress.summary.successful / progress.testedKeywords * 100).toFixed(1);
      progress.failureRate = (progress.summary.failed / progress.testedKeywords * 100).toFixed(1);
      progress.permissionIssues = progress.summary.permissionIssues;
      
      // 估算剩余时间
      if (data.totalTime && progress.testedKeywords > 0) {
        const avgTimePerKeyword = data.totalTime / progress.testedKeywords;
        const remainingKeywords = progress.totalKeywords - progress.testedKeywords;
        progress.estimatedTimeRemaining = Math.round(avgTimePerKeyword * remainingKeywords / 1000); // 秒
      }
      
      progress.currentBatch = Math.ceil(progress.testedKeywords / 10);
    }
    
    // 检查是否完成
    if (progress.testedKeywords >= progress.totalKeywords) {
      progress.status = 'completed';
    }
    
    return progress;
    
  } catch (error) {
    return {
      status: 'error',
      message: `解析结果文件失败: ${error.message}`
    };
  }
}

/**
 * 格式化时间
 */
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分`;
  }
}

/**
 * 显示进度
 */
function displayProgress(progress) {
  console.clear();
  console.log('================================================================================');
  console.log('🔍 AI字典关键词测试进度监控');
  console.log('================================================================================');
  console.log('');
  
  if (progress.status === 'not_started') {
    console.log('⏳ 测试尚未开始...');
    return;
  }
  
  if (progress.status === 'error') {
    console.log(`❌ 错误: ${progress.message}`);
    return;
  }
  
  const progressPercent = (progress.testedKeywords / progress.totalKeywords * 100).toFixed(1);
  const progressBar = '█'.repeat(Math.floor(progressPercent / 2)) + '░'.repeat(50 - Math.floor(progressPercent / 2));
  
  console.log(`📊 总体进度: ${progress.testedKeywords}/${progress.totalKeywords} (${progressPercent}%)`);
  console.log(`[${progressBar}]`);
  console.log('');
  
  console.log(`📦 当前批次: ${progress.currentBatch}/77`);
  console.log(`✅ 成功: ${progress.summary.successful} (${progress.successRate}%)`);
  console.log(`❌ 失败: ${progress.summary.failed} (${progress.failureRate}%)`);
  console.log(`🔒 权限问题: ${progress.summary.permissionIssues}`);
  console.log(`🔐 系统敏感: ${progress.summary.systemSensitive}`);
  console.log('');
  
  if (progress.estimatedTimeRemaining > 0) {
    console.log(`⏱️  预计剩余时间: ${formatTime(progress.estimatedTimeRemaining)}`);
  }
  
  console.log(`🕐 最后更新: ${new Date(progress.timestamp).toLocaleString()}`);
  
  if (progress.status === 'completed') {
    console.log('');
    console.log('🎉 测试已完成！');
    console.log('');
    console.log('📋 最终统计:');
    console.log(`   总关键词: ${progress.totalKeywords}`);
    console.log(`   成功: ${progress.summary.successful} (${progress.successRate}%)`);
    console.log(`   失败: ${progress.summary.failed} (${progress.failureRate}%)`);
    console.log(`   权限问题: ${progress.summary.permissionIssues}`);
    console.log('');
    console.log('💾 详细结果请查看: ./reports/ai-dictionary-test-results-full.json');
  }
}

/**
 * 保存进度
 */
function saveProgress(progress) {
  const progressDir = path.dirname(PROGRESS_FILE);
  if (!fs.existsSync(progressDir)) {
    fs.mkdirSync(progressDir, { recursive: true });
  }
  
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * 主监控循环
 */
async function monitor() {
  console.log('🚀 开始监控AI字典关键词测试进度...');
  console.log('按 Ctrl+C 退出监控');
  console.log('');
  
  const monitorLoop = setInterval(() => {
    const progress = analyzeProgress();
    displayProgress(progress);
    saveProgress(progress);
    
    if (progress.status === 'completed') {
      console.log('✅ 测试完成，监控结束');
      clearInterval(monitorLoop);
      process.exit(0);
    }
  }, MONITOR_INTERVAL);
  
  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n\n👋 监控已停止');
    clearInterval(monitorLoop);
    process.exit(0);
  });
}

if (require.main === module) {
  monitor().catch(console.error);
}
