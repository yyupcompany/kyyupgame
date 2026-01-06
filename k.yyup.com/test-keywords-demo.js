#!/usr/bin/env node

/**
 * 关键词检测演示
 * 展示工具选择验证器如何处理院长的实际说话方式
 */

// 模拟工具选择验证器的核心逻辑
class ToolSelectionValidatorDemo {

  /**
   * 检测是否为UI组件渲染请求
   */
  isUIComponentRequest(query) {
    console.log(`🎨 [检测] 分析查询: "${query}"`);

    // 🎯 老百姓/院长的实际需求关键词 - 这是用户明确要求可视化展示
    const realWorldPatterns = [
      // 📊 报表/图表相关需求
      /我要.*报表/,
      /给我.*报表/,
      /生成.*报表/,
      /创建.*报表/,
      /做.*报表/,
      /我要.*图表/,
      /给我.*图表/,
      /生成.*图表/,
      /创建.*图表/,
      /做.*图表/,
      /显示.*图表/,
      /展示.*图表/,

      // 📋 表格相关需求
      /我要.*表格/,
      /给我.*表格/,
      /生成.*表格/,
      /创建.*表格/,
      /做.*表格/,
      /表格显示/,
      /表格展示/,
      /用表格.*显示/,
      /用表格.*展示/,

      // 📝 任务/待办相关需求
      /我要.*任务/,
      /给我.*任务/,
      /显示.*任务/,
      /展示.*任务/,
      /我要.*待办/,
      /给我.*待办/,
      /显示.*待办/,
      /展示.*待办/,
      /任务列表/,
      /待办列表/,

      // 📈 统计/数据展示需求
      /我要.*统计/,
      /给我.*统计/,
      /统计.*显示/,
      /统计.*展示/,
      /数据.*显示/,
      /数据.*展示/,
      /我要.*数据/,
      /给我.*数据/,

      // 🎯 可视化/界面需求
      /我要.*界面/,
      /给我.*界面/,
      /界面显示/,
      /界面展示/,
      /我要.*页面/,
      /给我.*页面/,
      /页面显示/,
      /页面展示/,

      // 🔧 功能性需求
      /我要.*看板/,
      /给我.*看板/,
      /显示.*看板/,
      /展示.*看板/,
      /我要.*面板/,
      /给我.*面板/,
      /显示.*面板/,
      /展示.*面板/,

      // 📄 列表显示需求
      /用列表.*显示/,
      /用列表.*展示/,
      /列表显示/,
      /列表展示/
    ];

    // 检查是否包含实际需求关键词
    const hasRealWorldRequest = realWorldPatterns.some(pattern => pattern.test(query));

    if (hasRealWorldRequest) {
      console.log(`✅ [结果] 发现可视化需求关键词 → 应该调用 render_component`);
      return true;
    }

    // ❌ 以下情况是普通数据查询，应该使用Markdown格式回答
    const dataQueryPatterns = [
      /查询.*有多少/,
      /查询.*多少个/,
      /统计.*数量/,
      /统计.*总数/,
      /有多少.*学生/,
      /有多少.*老师/,
      /有多少.*班级/,
      /多少个.*学生/,
      /多少个.*老师/,
      /多少个.*班级/,
      /查询.*信息/,
      /查询.*数据/,
      /显示.*信息/,
      /显示.*数据/,

      // 简单的统计查询
      /学生总数/,
      /老师总数/,
      /班级总数/,
      /幼儿园.*情况/,
      /基本.*情况/,
      /总体.*情况/,
      /检查.*有多少/,
      /检查.*多少个/
    ];

    const hasDataQuery = dataQueryPatterns.some(pattern => pattern.test(query));

    if (hasDataQuery) {
      console.log(`❌ [结果] 发现数据查询关键词 → 应该使用 Markdown 格式回复`);
      return false;
    }

    // 默认情况：不是明确的可视化需求
    console.log(`❌ [结果] 未发现明确需求 → 应该使用 Markdown 格式回复`);
    return false;
  }

  // 演示特定查询
  demonstrateQuery(query) {
    console.log('\n' + '='.repeat(80));
    console.log(`📝 用户查询: "${query}"`);
    console.log('='.repeat(80));

    const shouldUseComponent = this.isUIComponentRequest(query);

    console.log(`\n🎯 决策结果:`);
    if (shouldUseComponent) {
      console.log(`✅ 调用 render_component 工具`);
      console.log(`📋 推荐组件类型: data-table（数据表格）`);
      console.log(`🎨 前端将渲染为可交互的Vue组件`);
    } else {
      console.log(`❌ 不调用 render_component 工具`);
      console.log(`📝 使用 Markdown 格式回复`);
      console.log(`🔤 前端将显示为格式化文本`);
    }

    console.log(`\n💡 院长意图理解: ${this.getIntentExplanation(query, shouldUseComponent)}`);
  }

  // 解释用户意图
  getIntentExplanation(query, shouldUseComponent) {
    if (shouldUseComponent) {
      if (query.includes('报表')) return '院长想要查看报表格式的数据展示';
      if (query.includes('表格')) return '院长想要表格形式的数据展示';
      if (query.includes('图表')) return '院长想要图表形式的数据展示';
      if (query.includes('列表')) return '院长想要列表形式的数据展示';
      if (query.includes('看板') || query.includes('面板')) return '院长想要仪表板形式的数据展示';
      if (query.includes('界面') || query.includes('页面')) return '院长想要专门的界面来查看数据';
      return '院长想要可视化的数据展示';
    } else {
      if (query.includes('多少') || query.includes('数量')) return '院长只是想知道数量统计';
      if (query.includes('查询') || query.includes('检查')) return '院长只是想查询基本信息';
      if (query.includes('情况')) return '院长只是想了解总体情况';
      return '院长只是想获取基本数据信息';
    }
  }
}

// 演示查询列表
const demoQueries = [
  {
    query: '检查我有多少班级',
    expectation: '纯数据查询，不应该调用render_component',
    category: '数据查询'
  },
  {
    query: '检查我有多少班级，用列表显示出来',
    expectation: '明确要求列表显示，应该调用render_component',
    category: '可视化需求'
  },
  {
    query: '给我一个学生报表',
    expectation: '明确要求报表，应该调用render_component',
    category: '可视化需求'
  },
  {
    query: '查询有多少个老师',
    expectation: '纯数据查询，不应该调用render_component',
    category: '数据查询'
  },
  {
    query: '我要一个教师表格显示',
    expectation: '明确要求表格，应该调用render_component',
    category: '可视化需求'
  },
  {
    query: '做一个活动统计图表',
    expectation: '明确要求图表，应该调用render_component',
    category: '可视化需求'
  },
  {
    query: '显示我的待办任务列表',
    expectation: '明确要求任务列表，应该调用render_component',
    category: '可视化需求'
  },
  {
    query: '我们幼儿园的基本情况',
    expectation: '一般性查询，不应该调用render_component',
    category: '数据查询'
  }
];

// 运行演示
function runDemo() {
  console.log('🎯 院长查询关键词检测演示');
  console.log('=' .repeat(80));
  console.log('这个演示展示了工具选择验证器如何理解院长的实际说话方式');
  console.log('基于修改后的关键词匹配逻辑来决定是否调用render_component工具\n');

  const validator = new ToolSelectionValidatorDemo();

  // 按类别分组展示
  const categories = {
    '数据查询': demoQueries.filter(q => q.category === '数据查询'),
    '可视化需求': demoQueries.filter(q => q.category === '可视化需求')
  };

  Object.entries(categories).forEach(([category, queries]) => {
    console.log(`\n🔍 ${category.toUpperCase()}`);
    console.log('-'.repeat(80));

    queries.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.query}`);
      console.log(`   期望: ${item.expectation}`);

      validator.demonstrateQuery(item.query);
    });
  });

  // 总结
  console.log('\n' + '='.repeat(80));
  console.log('📊 演示总结');
  console.log('='.repeat(80));
  console.log('✅ 修复效果:');
  console.log('   1. 能正确识别"用列表显示"这样的可视化需求');
  console.log('   2. 能区分纯数据查询和可视化展示需求');
  console.log('   3. 基于老百姓的实际说话方式，而非技术术语');
  console.log('   4. 避免过度调用render_component工具');

  console.log('\n🎯 关键改进:');
  console.log('   - 添加了"用列表显示"、"用表格显示"等关键词');
  console.log('   - 区分"检查有多少"（数据查询）vs"用列表显示"（可视化需求）');
  console.log('   - 支持院长的自然表达方式');

  console.log('\n💡 实际效果:');
  console.log('   院长说"检查我有多少班级" → Markdown回复');
  console.log('   院长说"检查我有多少班级，用列表显示出来" → render_component调用');
  console.log('   这样既满足了可视化需求，又避免了不必要的组件渲染');
}

// 运行演示
runDemo();