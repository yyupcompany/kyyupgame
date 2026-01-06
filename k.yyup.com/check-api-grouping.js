#!/usr/bin/env node

/**
 * 检查991个API端点的分组情况
 * 分析哪些API被正确分组,哪些在"其他"分组
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// API分组规则 (从 determineApiGroup 方法复制 - 优化版)
function determineApiGroup(path) {
  const pathLower = path.toLowerCase();

  // 🚫 排除备份表API (不应该被AI调用)
  if (pathLower.includes('-backup-')) {
    return '数据备份'; // 特殊分组,不会被AI使用
  }

  // 🎯 核心业务分组
  if (pathLower.includes('/student')) return '学生管理';
  if (pathLower.includes('/teacher')) return '教师管理';
  if (pathLower.includes('/class')) return '班级管理';
  if (pathLower.includes('/activity') || pathLower.includes('/registration')) return '活动管理';
  if (pathLower.includes('/parent')) return '家长管理';
  if (pathLower.includes('/enrollment') || pathLower.includes('/admission')) return '招生管理';

  // 🎯 新增业务分组
  if (pathLower.includes('/customer-pool') || pathLower.includes('/customer_pool')) return '客户池管理';
  if (pathLower.includes('/principal')) return '园长中心';
  if (pathLower.includes('/poster')) return '海报管理';
  if (pathLower.includes('/performance')) return '绩效管理';
  if (pathLower.includes('/marketing') || pathLower.includes('/channel') || pathLower.includes('/conversion')) return '营销管理';
  if (pathLower.includes('/kindergarten')) return '幼儿园管理';
  if (pathLower.includes('/notification') || pathLower.includes('/notice')) return '通知管理';
  if (pathLower.includes('/schedule')) return '日程管理';

  // 🎯 系统功能分组
  if (pathLower.includes('/dashboard') || pathLower.includes('/stat')) return '系统统计';
  if (pathLower.includes('/user') || pathLower.includes('/role') || pathLower.includes('/permission')) return '用户权限';
  if (pathLower.includes('/task') || pathLower.includes('/todo')) return '任务管理';
  if (pathLower.includes('/auth') || pathLower.includes('/login') || pathLower.includes('/logout')) return '认证授权';
  if (pathLower.includes('/system') || pathLower.includes('/admin') || pathLower.includes('/setup')) return '系统管理';
  if (pathLower.includes('-log') || pathLower.includes('/log')) return '日志管理';
  if (pathLower.includes('/ai') || pathLower.includes('/memor')) return 'AI服务';

  return '其他';
}

async function checkApiGrouping() {
  log('\n🔍 开始检查API分组情况\n', 'cyan');
  log('='.repeat(80), 'blue');

  // 读取Swagger文档
  const swaggerPath = path.join(__dirname, 'server', 'swagger.json');
  
  if (!fs.existsSync(swaggerPath)) {
    log('\n❌ Swagger文档不存在: ' + swaggerPath, 'red');
    return;
  }

  const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
  const swaggerDoc = JSON.parse(swaggerContent);

  if (!swaggerDoc.paths) {
    log('\n❌ Swagger文档格式错误', 'red');
    return;
  }

  // 统计数据
  const groupStats = {};
  const apisByGroup = {};
  const ungroupedApis = [];
  let totalApis = 0;

  // 分析每个API端点
  Object.entries(swaggerDoc.paths).forEach(([path, methods]) => {
    Object.keys(methods).forEach(method => {
      if (method === 'parameters') return; // 跳过parameters字段

      totalApis++;
      const group = determineApiGroup(path);

      // 统计分组
      if (!groupStats[group]) {
        groupStats[group] = 0;
        apisByGroup[group] = [];
      }
      groupStats[group]++;
      apisByGroup[group].push({
        path,
        method: method.toUpperCase(),
        summary: methods[method].summary || ''
      });

      // 记录未分组的API
      if (group === '其他') {
        ungroupedApis.push({
          path,
          method: method.toUpperCase(),
          summary: methods[method].summary || ''
        });
      }
    });
  });

  // 输出统计结果
  log('\n📊 API分组统计\n', 'cyan');
  log(`总API端点数: ${totalApis}`, 'blue');
  log(`分组数量: ${Object.keys(groupStats).length}`, 'blue');
  log('');

  // 按数量排序
  const sortedGroups = Object.entries(groupStats).sort((a, b) => b[1] - a[1]);

  log('分组详情:', 'yellow');
  sortedGroups.forEach(([group, count], index) => {
    const percentage = ((count / totalApis) * 100).toFixed(2);
    const color = group === '其他' ? 'red' : 'green';
    log(`${index + 1}. ${group}: ${count} 个 (${percentage}%)`, color);
  });

  // 输出未分组的API
  if (ungroupedApis.length > 0) {
    log('\n⚠️ 未分组的API (在"其他"分组中):\n', 'yellow');
    
    // 按路径前缀分组显示
    const pathPrefixes = {};
    ungroupedApis.forEach(api => {
      const prefix = api.path.split('/')[1] || 'root';
      if (!pathPrefixes[prefix]) {
        pathPrefixes[prefix] = [];
      }
      pathPrefixes[prefix].push(api);
    });

    Object.entries(pathPrefixes).forEach(([prefix, apis]) => {
      log(`  /${prefix}/ (${apis.length} 个):`, 'cyan');
      apis.slice(0, 5).forEach(api => {
        log(`    ${api.method} ${api.path}`, 'white');
        if (api.summary) {
          log(`      → ${api.summary}`, 'blue');
        }
      });
      if (apis.length > 5) {
        log(`    ... 还有 ${apis.length - 5} 个`, 'yellow');
      }
      log('');
    });
  }

  // 输出每个分组的API示例
  log('\n📋 各分组API示例:\n', 'cyan');
  sortedGroups.forEach(([group, count]) => {
    if (group === '其他') return; // 跳过"其他"分组

    log(`${group} (${count} 个):`, 'green');
    const apis = apisByGroup[group];
    apis.slice(0, 3).forEach(api => {
      log(`  ${api.method} ${api.path}`, 'white');
      if (api.summary) {
        log(`    → ${api.summary}`, 'blue');
      }
    });
    if (apis.length > 3) {
      log(`  ... 还有 ${apis.length - 3} 个`, 'yellow');
    }
    log('');
  });

  // 分析未分组API的路径模式
  log('\n🔍 未分组API路径模式分析:\n', 'cyan');
  const pathPatterns = {};
  ungroupedApis.forEach(api => {
    const segments = api.path.split('/').filter(s => s);
    if (segments.length > 0) {
      const pattern = segments[0];
      if (!pathPatterns[pattern]) {
        pathPatterns[pattern] = 0;
      }
      pathPatterns[pattern]++;
    }
  });

  const sortedPatterns = Object.entries(pathPatterns).sort((a, b) => b[1] - a[1]);
  sortedPatterns.forEach(([pattern, count]) => {
    log(`  /${pattern}/... : ${count} 个API`, 'yellow');
  });

  // 建议新增的分组
  log('\n💡 建议新增的API分组:\n', 'cyan');
  const suggestions = [];

  sortedPatterns.forEach(([pattern, count]) => {
    if (count >= 5) { // 如果某个路径模式有5个以上的API
      let groupName = '';
      let keywords = [];

      switch(pattern) {
        case 'api':
          // 跳过,这是通用前缀
          break;
        case 'kindergarten':
        case 'kindergartens':
          groupName = '幼儿园管理';
          keywords = ['kindergarten', '幼儿园', '园所'];
          break;
        case 'notification':
        case 'notifications':
          groupName = '通知管理';
          keywords = ['notification', '通知', '消息'];
          break;
        case 'schedule':
        case 'schedules':
          groupName = '日程管理';
          keywords = ['schedule', '日程', '排班', '课表'];
          break;
        case 'attendance':
          groupName = '考勤管理';
          keywords = ['attendance', '考勤', '出勤', '签到'];
          break;
        case 'health':
          groupName = '健康管理';
          keywords = ['health', '健康', '体检', '疫苗'];
          break;
        case 'fee':
        case 'fees':
        case 'payment':
          groupName = '费用管理';
          keywords = ['fee', 'payment', '费用', '缴费', '收费'];
          break;
        case 'meal':
        case 'meals':
          groupName = '餐饮管理';
          keywords = ['meal', '餐饮', '食谱', '营养'];
          break;
        case 'asset':
        case 'assets':
          groupName = '资产管理';
          keywords = ['asset', '资产', '设备', '物资'];
          break;
        default:
          if (count >= 10) {
            groupName = `${pattern}管理`;
            keywords = [pattern];
          }
      }

      if (groupName) {
        suggestions.push({
          groupName,
          pattern,
          count,
          keywords
        });
      }
    }
  });

  if (suggestions.length > 0) {
    suggestions.forEach((suggestion, index) => {
      log(`${index + 1}. ${suggestion.groupName}`, 'green');
      log(`   路径模式: /${suggestion.pattern}/...`, 'blue');
      log(`   API数量: ${suggestion.count} 个`, 'blue');
      log(`   建议关键词: ${suggestion.keywords.join(', ')}`, 'yellow');
      log('');
    });
  } else {
    log('  暂无建议 (未分组API数量较少)', 'yellow');
  }

  // 保存分析结果
  const resultFile = path.join(__dirname, 'api-grouping-analysis.json');
  const analysisResult = {
    timestamp: new Date().toISOString(),
    totalApis,
    groupCount: Object.keys(groupStats).length,
    groupStats,
    ungroupedCount: ungroupedApis.length,
    ungroupedPercentage: ((ungroupedApis.length / totalApis) * 100).toFixed(2) + '%',
    pathPatterns,
    suggestions
  };

  fs.writeFileSync(resultFile, JSON.stringify(analysisResult, null, 2));
  log(`\n💾 分析结果已保存到: ${resultFile}`, 'cyan');

  log('\n' + '='.repeat(80), 'blue');
  log('\n✅ 分析完成!\n', 'green');
}

// 运行检查
checkApiGrouping().catch(error => {
  log(`\n❌ 分析失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

