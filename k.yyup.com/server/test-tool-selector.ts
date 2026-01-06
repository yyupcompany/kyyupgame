/**
 * 工具选择器测试脚本
 * 测试查询特征分析和工具选择逻辑
 */

import { ToolSelectorService } from './src/services/ai/tools/core/tool-selector.service';

async function testToolSelector() {
  const selector = new ToolSelectorService();

  // 测试用例
  const testCases = [
    // ========== 数据查询测试 ==========
    {
      name: '复杂查询1：有过滤+排序',
      query: '查询所有男生，按年龄排序',
      expectedTools: ['any_query']
    },
    {
      name: '复杂查询2：有过滤+统计',
      query: '统计所有在职教师的数量',
      expectedTools: ['any_query']
    },
    {
      name: '复杂查询3：有关联',
      query: '查询学生及其班级信息',
      expectedTools: ['any_query']
    },
    {
      name: '简单查询：无过滤、排序、统计',
      query: '查询所有学生',
      expectedTools: ['read_data_record', 'any_query']
    },

    // ========== 导航工具测试（新增）==========
    {
      name: '导航工具1：转到页面',
      query: '转到客户池中心',
      expectedTools: ['navigate_to_page'],
      description: '用户明确要求导航到页面，应该使用navigate_to_page而不是render_component'
    },
    {
      name: '导航工具2：打开页面',
      query: '打开活动管理页面',
      expectedTools: ['navigate_to_page'],
      description: '用户明确要求打开页面，应该使用navigate_to_page'
    },
    {
      name: '导航工具3：进入页面',
      query: '进入招生管理',
      expectedTools: ['navigate_to_page'],
      description: '用户明确要求进入页面，应该使用navigate_to_page'
    },
    {
      name: '导航工具4：页面操作',
      query: '在活动页面创建新活动',
      expectedTools: ['navigate_to_page'],
      description: '用户要求在页面上进行操作，应该先导航到页面'
    },
    {
      name: '导航工具5：填写表单',
      query: '填写学生信息表',
      expectedTools: ['navigate_to_page'],
      description: '用户要求填写表单，应该使用navigate_to_page工具'
    },

    // ========== 渲染工具测试（新增）==========
    {
      name: '渲染工具1：显示图表',
      query: '显示学生人数统计图表',
      expectedTools: ['render_component'],
      description: '用户明确要求显示图表，应该使用render_component'
    },
    {
      name: '渲染工具2：展示表格',
      query: '展示学生列表表格',
      expectedTools: ['render_component'],
      description: '用户明确要求展示表格，应该使用render_component'
    },
    {
      name: '渲染工具3：用柱状图展示',
      query: '用柱状图展示各班级人数',
      expectedTools: ['render_component'],
      description: '用户明确要求用图表展示数据，应该使用render_component'
    },
    {
      name: '渲染工具4：显示统计卡片',
      query: '显示总学生数',
      expectedTools: ['render_component'],
      description: '用户明确要求显示统计数据，应该使用render_component'
    },

    // ========== 区分测试（关键）==========
    {
      name: '区分测试1：导航vs渲染 - 导航优先',
      query: '导航到学生管理页面',
      expectedTools: ['navigate_to_page'],
      description: '用户明确说"导航"，应该使用navigate_to_page而不是render_component'
    },
    {
      name: '区分测试2：导航vs渲染 - 渲染优先',
      query: '显示学生管理数据',
      expectedTools: ['render_component'],
      description: '用户明确说"显示"，应该使用render_component而不是navigate_to_page'
    },
    {
      name: '区分测试3：查询vs渲染 - 只查询',
      query: '查询学生数据',
      expectedTools: ['any_query', 'read_data_record'],
      description: '用户只是查询数据，没有明确要求显示图表，应该使用any_query而不是render_component'
    }
  ];

  console.log('🧪 开始工具选择器测试\n');

  let passCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 测试: ${testCase.name}`);
    console.log(`   查询: "${testCase.query}"`);
    if ((testCase as any).description) {
      console.log(`   说明: ${(testCase as any).description}`);
    }

    try {
      const selectedTools = await selector.selectToolsByFunction({
        query: testCase.query,
        userRole: 'admin',
        userId: 1,
        conversationId: 'test-' + Date.now(),
        maxTools: 3
      });

      console.log(`   ✅ 选择的工具: ${selectedTools.join(', ')}`);

      // 验证结果
      const hasExpectedTool = testCase.expectedTools.some(tool =>
        selectedTools.includes(tool)
      );

      if (hasExpectedTool) {
        console.log(`   ✅ 验证通过 - 包含期望工具: ${testCase.expectedTools.join(', ')}`);
        passCount++;
      } else {
        console.log(`   ❌ 验证失败 - 期望包含: ${testCase.expectedTools.join(', ')}`);
        failCount++;
      }
    } catch (error) {
      console.error(`   ❌ 错误:`, error);
      failCount++;
    }
  }

  // 输出统计信息
  console.log('\n\n' + '='.repeat(60));
  console.log(`📊 测试统计: 总计 ${testCases.length} 个测试`);
  console.log(`   ✅ 通过: ${passCount}`);
  console.log(`   ❌ 失败: ${failCount}`);
  console.log('='.repeat(60));

  console.log('\n\n🎉 测试完成');
}

// 运行测试
testToolSelector().catch(console.error);

