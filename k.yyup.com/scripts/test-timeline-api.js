#!/usr/bin/env node

/**
 * 活动中心Timeline API测试脚本
 * 
 * 用途：验证Timeline API是否正常工作
 * 使用：node scripts/test-timeline-api.js
 */

const http = require('http');

// API配置
const API_HOST = 'localhost';
const API_PORT = 3000;
const API_PATH = '/api/centers/activity/timeline';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// 测试API
function testTimelineAPI() {
  return new Promise((resolve, reject) => {
    logSection('🚀 开始测试Timeline API');
    log(`📡 请求地址: http://${API_HOST}:${API_PORT}${API_PATH}`, 'cyan');
    
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_PATH,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          logSection('📊 API响应结果');
          log(`状态码: ${res.statusCode}`, res.statusCode === 200 ? 'green' : 'red');
          log(`响应成功: ${response.success}`, response.success ? 'green' : 'red');
          
          if (response.success && response.data) {
            logSection('✅ Timeline数据验证');
            
            const timelineItems = response.data;
            log(`Timeline流程数量: ${timelineItems.length}`, 'green');
            
            if (timelineItems.length === 8) {
              log('✓ 流程数量正确（8个）', 'green');
            } else {
              log(`✗ 流程数量错误（期望8个，实际${timelineItems.length}个）`, 'red');
            }
            
            // 验证每个流程
            logSection('📋 流程详情');
            timelineItems.forEach((item, index) => {
              console.log(`\n${index + 1}. ${item.title} (${item.id})`);
              log(`   状态: ${item.status}`, 'cyan');
              log(`   进度: ${item.progress}%`, 'cyan');
              log(`   图标: ${item.icon}`, 'cyan');
              log(`   描述: ${item.description}`, 'cyan');
              
              // 验证统计数据
              if (item.stats) {
                log(`   统计数据:`, 'yellow');
                Object.entries(item.stats).forEach(([key, value]) => {
                  log(`     - ${key}: ${value}`, 'yellow');
                });
              }
              
              // 验证操作按钮
              if (item.actions && item.actions.length > 0) {
                log(`   操作按钮: ${item.actions.length}个`, 'blue');
              }
            });
            
            // 数据质量检查
            logSection('🔍 数据质量检查');
            
            let hasRealData = true;
            let issues = [];
            
            // 检查是否有模拟数据
            timelineItems.forEach(item => {
              if (item.stats) {
                // 检查浏览量和分享次数是否是整数倍（可能是模拟数据）
                if (item.stats.totalViews && item.stats.publishedActivities) {
                  const ratio = item.stats.totalViews / item.stats.publishedActivities;
                  if (ratio === 150) {
                    issues.push(`${item.title}: totalViews可能是模拟数据（每个活动150次浏览）`);
                    hasRealData = false;
                  }
                }
                
                if (item.stats.totalShares && item.stats.publishedActivities) {
                  const ratio = item.stats.totalShares / item.stats.publishedActivities;
                  if (ratio === 50) {
                    issues.push(`${item.title}: totalShares可能是模拟数据（每个活动50次分享）`);
                    hasRealData = false;
                  }
                }
                
                // 检查平均评分是否是固定值
                if (item.stats.averageRating === 4.6) {
                  issues.push(`${item.title}: averageRating可能是模拟数据（固定值4.6）`);
                  hasRealData = false;
                }
                
                // 检查ROI是否是固定值
                if (item.stats.averageROI === 2.5) {
                  issues.push(`${item.title}: averageROI可能是模拟数据（固定值2.5）`);
                  hasRealData = false;
                }
              }
            });
            
            if (hasRealData && issues.length === 0) {
              log('✓ 所有数据都是真实数据', 'green');
            } else {
              log('✗ 发现可能的模拟数据:', 'red');
              issues.forEach(issue => {
                log(`  - ${issue}`, 'yellow');
              });
            }
            
            // 总结
            logSection('📝 测试总结');
            if (response.success && timelineItems.length === 8 && hasRealData) {
              log('✅ Timeline API测试通过！', 'green');
              log('所有数据都是真实的，可以正常使用。', 'green');
            } else {
              log('⚠️  Timeline API测试部分通过', 'yellow');
              if (!response.success) {
                log('- API响应失败', 'red');
              }
              if (timelineItems.length !== 8) {
                log('- 流程数量不正确', 'red');
              }
              if (!hasRealData) {
                log('- 存在模拟数据', 'yellow');
              }
            }
            
            resolve(response);
          } else {
            log('✗ API响应数据为空', 'red');
            reject(new Error('API响应数据为空'));
          }
        } catch (error) {
          log(`✗ 解析响应失败: ${error.message}`, 'red');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      logSection('❌ API请求失败');
      log(`错误信息: ${error.message}`, 'red');
      
      if (error.code === 'ECONNREFUSED') {
        log('\n💡 提示:', 'yellow');
        log('  1. 请确保后端服务已启动', 'yellow');
        log('  2. 运行命令: cd server && npm run dev', 'yellow');
        log('  3. 确认服务运行在 http://localhost:3000', 'yellow');
      }
      
      reject(error);
    });

    req.end();
  });
}

// 主函数
async function main() {
  try {
    await testTimelineAPI();
    process.exit(0);
  } catch (error) {
    console.error('\n测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
main();

