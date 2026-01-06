#!/usr/bin/env node

/**
 * 简化的工具选择验证器测试
 * 直接测试工具选择逻辑，不依赖API调用
 */

// 直接复制工具选择验证器的核心逻辑进行测试

/**
 * 工具选择验证器类
 */
class ToolSelectionValidatorService {
  static instance;

  static getInstance() {
    if (!ToolSelectionValidatorService.instance) {
      ToolSelectionValidatorService.instance = new ToolSelectionValidatorService();
    }
    return ToolSelectionValidatorService.instance;
  }

  /**
   * 分析查询，判断应该使用的工具
   */
  analyzeQuery(query) {
    console.log(`🔍 [工具选择验证] 开始分析查询: "${query}"`);

    // 🆕 第一步：检测是否为UI组件渲染请求
    if (this.isUIComponentRequest(query)) {
      console.log(`✅ [工具选择验证] 检测到UI组件渲染请求`);
      return {
        hasFilters: false,
        hasSorting: false,
        hasStatistics: false,
        hasJoin: false,
        hasComplexConditions: false,
        appropriateTools: ['render_component'],
        reason: '用户明确要求生成UI组件，应该使用render_component工具'
      };
    }

    // 检测过滤条件
    const filterPatterns = [
      /过滤|筛选|条件/,
      /性别.*[男女]/,
      /年龄.*\d+/,
      /班级.*[大中小]/,
      /状态.*[在职|请假|离职]/,
      /[男女]生/,
      /大班|中班|小班/,
      /在职|请假|离职/
    ];
    const hasFilters = filterPatterns.some(pattern => pattern.test(query));

    // 检测排序要求
    const sortingPatterns = [
      /排序|从高到低|从低到高|升序|降序/,
      /按.*排序/,
      /按.*从/,
      /最新|最旧|最多|最少/
    ];
    const hasSorting = sortingPatterns.some(pattern => pattern.test(query));

    // 检测统计计算
    const statsPatterns = [
      /统计|求和|平均|最大|最小|总数|数量/,
      /有多少|多少个|共.*个/,
      /占比|百分比|比例/
    ];
    const hasStatistics = statsPatterns.some(pattern => pattern.test(query));

    // 检测多表关联
    const joinPatterns = [
      /及其|和|关联|对应|对应的/,
      /学生.*班级|班级.*学生/,
      /教师.*课程|课程.*教师/
    ];
    const hasJoin = joinPatterns.some(pattern => pattern.test(query));

    // 检测复杂条件
    const complexPatterns = [
      /且|和|或|非|不是/,
      /既.*又|既.*也/
    ];
    const hasComplexConditions = complexPatterns.some(pattern => pattern.test(query));

    // 默认使用数据查询工具
    let appropriateTools = [];
    let reason = '';

    if (hasFilters || hasSorting || hasStatistics || hasJoin || hasComplexConditions) {
      appropriateTools = ['any_query'];
      reason = '查询包含过滤、排序、统计或复杂条件，必须使用any_query';
    } else {
      appropriateTools = ['read_data_record'];
      reason = '简单实体查询：优先使用read_data_record，失败后自动回退到any_query';
    }

    const result = {
      hasFilters,
      hasSorting,
      hasStatistics,
      hasJoin,
      hasComplexConditions,
      appropriateTools,
      reason
    };

    console.log(`✅ [工具选择验证] 分析结果:`, {
      hasFilters,
      hasSorting,
      hasStatistics,
      hasJoin,
      hasComplexConditions,
      appropriateTools,
      reason
    });

    return result;
  }

  /**
   * 检测是否为UI组件渲染请求
   */
  isUIComponentRequest(query) {
    console.log(`🎨 [工具选择验证] 检测UI组件渲染请求: "${query}"`);

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
      /展示.*面板/
    ];

    // 检查是否包含实际需求关键词
    const hasRealWorldRequest = realWorldPatterns.some(pattern => pattern.test(query));

    if (hasRealWorldRequest) {
      console.log(`✅ [工具选择验证] 发现用户实际可视化需求 - 应该使用render_component`);
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
      /总体.*情况/
    ];

    const hasDataQuery = dataQueryPatterns.some(pattern => pattern.test(query));

    if (hasDataQuery) {
      console.log(`❌ [工具选择验证] 发现普通数据查询 - 应该使用Markdown格式回答`);
      return false;
    }

    // 默认情况：不是明确的可视化需求
    console.log(`❌ [工具选择验证] 不是明确的可视化需求，使用Markdown格式`);
    return false;
  }
}

// 测试用例 - 基于院长/老百姓的实际说话方式
const testCases = [
  {
    name: '普通查询测试 - 不应调用render_component',
    query: '查询一下我们幼儿园有多少个孩子、多少个老师',
    expectRenderComponent: false,
    description: '用户只是查询统计数据，应该使用Markdown回复'
  },
  {
    name: '明确报表需求 - 应该调用render_component',
    query: '我要一个学生报表，显示所有学生的信息',
    expectRenderComponent: true,
    description: '院长明确要求报表，应该调用render_component'
  },
  {
    name: '明确表格需求 - 应该调用render_component',
    query: '给我做一个学生表格，显示所有学生',
    expectRenderComponent: true,
    description: '院长明确要求表格展示，应该调用render_component'
  },
  {
    name: '明确图表需求 - 应该调用render_component',
    query: '我要一个图表显示学生年龄分布',
    expectRenderComponent: true,
    description: '院长明确要求图表，应该调用render_component'
  },
  {
    name: '明确任务列表需求 - 应该调用render_component',
    query: '给我显示待办任务列表',
    expectRenderComponent: true,
    description: '院长明确要求任务列表，应该调用render_component'
  },
  {
    name: '简单统计查询 - 不应调用render_component',
    query: '有多少个学生',
    expectRenderComponent: false,
    description: '简单统计查询，使用Markdown回复'
  },
  {
    name: '数据查询 - 不应调用render_component',
    query: '查询学生信息',
    expectRenderComponent: false,
    description: '普通数据查询，使用Markdown回复'
  },
  {
    name: '看板需求 - 应该调用render_component',
    query: '我要一个数据看板',
    expectRenderComponent: true,
    description: '明确要求看板，应该调用render_component'
  },
  {
    name: '面板需求 - 应该调用render_component',
    query: '给我显示统计面板',
    expectRenderComponent: true,
    description: '明确要求面板，应该调用render_component'
  },
  {
    name: '界面需求 - 应该调用render_component',
    query: '我要一个管理界面',
    expectRenderComponent: true,
    description: '明确要求界面，应该调用render_component'
  }
];

class ToolSelectorTest {
  constructor() {
    this.testResults = [];
    this.validator = ToolSelectionValidatorService.getInstance();
  }

  // 运行单个测试
  runTest(testCase) {
    console.log(`\n🧪 开始测试: ${testCase.name}`);
    console.log(`📝 查询内容: ${testCase.query}`);
    console.log(`🎯 期望结果: ${testCase.expectRenderComponent ? '应该调用' : '不应该调用'} render_component`);

    try {
      // 分析查询
      const analysis = this.validator.analyzeQuery(testCase.query);

      // 检查是否推荐render_component
      const actualRenderComponent = analysis.appropriateTools.includes('render_component');
      const passed = actualRenderComponent === testCase.expectRenderComponent;

      this.testResults.push({
        testCase: testCase.name,
        query: testCase.query,
        expectRenderComponent: testCase.expectRenderComponent,
        actual: {
          renderComponent: actualRenderComponent,
          appropriateTools: analysis.appropriateTools,
          reason: analysis.reason
        },
        success: passed,
        description: testCase.description
      });

      console.log(`${passed ? '✅ 测试通过' : '❌ 测试失败'}`);
      console.log(`📊 分析结果: ${analysis.reason}`);
      console.log(`🔧 推荐工具: [${analysis.appropriateTools.join(', ')}]`);

      if (!passed) {
        console.log(`💡 失败原因: 期望${testCase.expectRenderComponent ? '调用' : '不调用'}render_component，实际${actualRenderComponent ? '调用' : '未调用'}`);
      }

    } catch (error) {
      console.error(`❌ 测试执行失败: ${error.message}`);
      this.testResults.push({
        testCase: testCase.name,
        query: testCase.query,
        error: error.message,
        success: false
      });
    }
  }

  // 运行所有测试
  runAllTests() {
    console.log('🎯 工具选择验证器测试开始');
    console.log('=' .repeat(60));

    for (const testCase of testCases) {
      this.runTest(testCase);
    }

    this.printSummary();
  }

  // 打印测试总结
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果总结');
    console.log('='.repeat(60));

    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;

    console.log(`✅ 通过: ${passed}/${total}`);
    console.log(`❌ 失败: ${total - passed}/${total}`);
    console.log(`📈 通过率: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\n📋 详细结果:');
    this.testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.testCase}`);
      if (result.success) {
        console.log(`   ✅ 通过`);
      } else {
        console.log(`   ❌ 失败 - ${result.error || result.reason || '未知原因'}`);
      }
      console.log(`   查询: ${result.query}`);
      console.log(`   期望: ${result.expectRenderComponent ? '调用render_component' : '不调用render_component'}`);

      if (result.actual) {
        console.log(`   实际: ${result.actual.renderComponent ? '调用render_component' : '未调用render_component'}`);
        console.log(`   推荐工具: [${result.actual.appropriateTools.join(', ')}]`);
        console.log(`   原因: ${result.actual.reason}`);
      }
    });

    // 验证修复效果
    console.log('\n🎯 修复效果验证:');

    const componentRequests = this.testResults.filter(r =>
      r.expectRenderComponent === true
    );
    const componentRequestsPassed = componentRequests.filter(r => r.success).length;

    const dataQueries = this.testResults.filter(r =>
      r.expectRenderComponent === false
    );
    const dataQueriesPassed = dataQueries.filter(r => r.success).length;

    console.log(`组件需求测试通过: ${componentRequestsPassed}/${componentRequests.length}`);
    console.log(`数据查询测试通过: ${dataQueriesPassed}/${dataQueries.length}`);

    if (componentRequestsPassed === componentRequests.length &&
        dataQueriesPassed === dataQueries.length) {
      console.log('🎉 修复成功！工具选择验证器能正确识别院长的实际需求');
    } else {
      console.log('⚠️ 修复未完全成功，仍需要进一步优化');
    }
  }
}

// 运行测试
async function main() {
  const tester = new ToolSelectorTest();

  try {
    tester.runAllTests();
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
main().catch(console.error);