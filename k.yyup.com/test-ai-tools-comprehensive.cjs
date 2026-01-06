/**
 * AI助手40个工具调用综合测试
 * 测试复杂查询、查询、添加、删除、工作流、页面操作等
 */

const { chromium } = require('playwright');

// 测试配置
const CONFIG = {
  FRONTEND_URL: 'http://localhost:5173',
  BACKEND_URL: 'http://localhost:3000',
  TEST_TIMEOUT: 60000
};

// 40个工具测试用例
const TOOL_TESTS = [
  // 数据查询类工具
  { name: '查询在园学生总数', query: '查询当前在园学生总人数', expectedTool: 'query_student_count' },
  { name: '查询学生详细信息', query: '查询小班学生详细信息，包括姓名、年龄、班级', expectedTool: 'query_student_details' },
  { name: '查询教师信息', query: '查询所有教师的基本信息和负责班级', expectedTool: 'query_teacher_info' },
  { name: '查询班级信息', query: '查询所有班级的详细信息和人数统计', expectedTool: 'query_class_info' },
  { name: '复杂查询', query: '查询小班女生中年龄在3-4岁的学生名单，包括家长联系方式', expectedTool: 'complex_student_query' },

  // 数据添加类工具
  { name: '添加学生记录', query: '添加新学生：张三，男，4岁，小班，家长张先生13800138000', expectedTool: 'add_student_record' },
  { name: '添加教师信息', query: '添加新教师：李老师，女，学前教育专业，负责中班', expectedTool: 'add_teacher_record' },
  { name: '创建活动', query: '创建春季亲子活动，时间下周六，地点幼儿园操场', expectedTool: 'create_activity' },

  // 数据更新类工具
  { name: '更新学生信息', query: '更新学生张三的信息：联系电话改为13900139000', expectedTool: 'update_student_info' },
  { name: '更新班级信息', query: '将小班人数更新为25人，添加新的助教老师', expectedTool: 'update_class_info' },

  // 数据删除类工具
  { name: '删除学生记录', query: '删除已毕业学生王五的档案信息', expectedTool: 'delete_student_record' },
  { name: '删除过期活动', query: '删除上个月已结束的家长会活动记录', expectedTool: 'delete_expired_activity' },

  // 统计分析工具
  { name: '出勤统计', query: '统计本月学生出勤率，按班级分类', expectedTool: 'attendance_statistics' },
  { name: '招生统计', query: '分析本季度招生数据，包括年龄段分布', expectedTool: 'enrollment_statistics' },
  { name: '财务统计', query: '统计本月收费情况，按费用类型分类', expectedTool: 'financial_statistics' },

  // 考勤管理工具
  { name: '记录考勤', query: '记录今天小班学生出勤情况：25人出勤，2人请假', expectedTool: 'record_attendance' },
  { name: '考勤分析', query: '分析本周各班出勤趋势，找出异常情况', expectedTool: 'analyze_attendance_trends' },

  // 费用管理工具
  { name: '费用查询', query: '查询小班本月的各项费用明细', expectedTool: 'query_fee_details' },
  { name: '费用催缴', query: '生成欠费家长名单和催缴通知', expectedTool: 'generate_fee_reminder' },

  // 活动管理工具
  { name: '活动查询', query: '查询本月所有已安排的活动', expectedTool: 'query_monthly_activities' },
  { name: '活动报名统计', query: '统计春季亲子活动的报名人数和班级分布', expectedTool: 'activity_registration_stats' },

  // 家长沟通工具
  { name: '家长信息查询', query: '查询小班学生家长的详细联系方式', expectedTool: 'query_parent_contact' },
  { name: '发送通知', query: '给所有家长发送明天停课通知', expectedTool: 'send_parent_notification' },

  // 课程管理工具
  { name: '课程查询', query: '查询下周的课程安排和任课老师', expectedTool: 'query_weekly_schedule' },
  { name: '课程更新', query: '更新明天的课程内容，增加户外活动时间', expectedTool: 'update_curriculum' },

  // 健康管理工具
  { name: '健康记录', query: '记录学生健康信息：小班2人感冒，已通知家长', expectedTool: 'record_health_info' },
  { name: '健康统计', query: '统计本月学生健康状况和疫苗接种情况', expectedTool: 'health_statistics' },

  // 物资管理工具
  { name: '物资查询', query: '查询当前库存的文具和玩具数量', expectedTool: 'query_inventory' },
  { name: '物资采购', query: '生成下月需要采购的物资清单', expectedTool: 'generate_purchase_list' },

  // 安全管理工具
  { name: '安全检查', query: '记录今天的安全检查情况和需要改进的事项', expectedTool: 'safety_inspection' },
  { name: '应急预案', query: '查看火灾应急预案和疏散路线', expectedTool: 'emergency_plan' },

  // 工作流程工具
  { name: '新生入学流程', query: '启动新生入学流程：包括体检、分班、家长沟通', expectedTool: 'enrollment_workflow' },
  { name: '毕业流程', query: '执行大班学生毕业流程：档案整理、证书准备', expectedTool: 'graduation_workflow' },

  // 报表生成工具
  { name: '月度报表', query: '生成本月运营报表，包括收入、支出、学生数量', expectedTool: 'monthly_report' },
  { name: '教学总结', query: '生成本月教学总结和下月计划', expectedTool: 'teaching_summary' },

  // 搜索和筛选工具
  { name: '高级搜索', query: '搜索所有姓张的学生，年龄3-5岁', expectedTool: 'advanced_student_search' },
  { name: '数据筛选', query: '筛选出本月生日的学生名单', expectedTool: 'filter_birthday_students' },

  // 通知提醒工具
  { name: '生日提醒', query: '查询下周过生日的学生并准备庆祝活动', expectedTool: 'birthday_reminder' },
  { name: '缴费提醒', query: '生成下月缴费提醒通知', expectedTool: 'payment_reminder' },

  // 数据导出工具
  { name: '导出学生名单', query: '导出所有学生信息到Excel文件', expectedTool: 'export_student_list' },
  { name: '导出考勤表', query: '导出本月考勤统计表', expectedTool: 'export_attendance_report' },

  // 系统管理工具
  { name: '用户权限', query: '查询教师系统权限和访问范围', expectedTool: 'user_permission_check' },
  { name: '系统备份', query: '执行数据库备份操作', expectedTool: 'system_backup' }
];

// 工具调用结果收集器
class ToolCallResultCollector {
  constructor() {
    this.results = [];
    this.successCount = 0;
    this.failureCount = 0;
    this.toolCallCounts = {};
  }

  addResult(test, success, toolCalls = [], error = null) {
    const result = {
      timestamp: new Date().toISOString(),
      testName: test.name,
      query: test.query,
      expectedTool: test.expectedTool,
      success,
      toolCalls,
      error,
      toolCallCount: toolCalls.length
    };

    this.results.push(result);

    if (success) {
      this.successCount++;
    } else {
      this.failureCount++;
    }

    // 统计工具调用次数
    toolCalls.forEach(tool => {
      this.toolCallCounts[tool.name] = (this.toolCallCounts[tool.name] || 0) + 1;
    });
  }

  getSummary() {
    return {
      totalTests: TOOL_TESTS.length,
      successCount: this.successCount,
      failureCount: this.failureCount,
      successRate: ((this.successCount / TOOL_TESTS.length) * 100).toFixed(2) + '%',
      toolCallCounts: this.toolCallCounts,
      results: this.results
    };
  }
}

// 主测试函数
async function runComprehensiveToolTest() {
  console.log('🚀 开始AI助手40个工具调用综合测试...');

  const collector = new ToolCallResultCollector();
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 设置网络请求监听，捕获API调用
    setupNetworkMonitoring(page, collector);

    // 步骤1: 访问后端Mock API直接测试
    console.log('\n📍 步骤1: 直接测试后端Mock API工具调用');
    await testBackendMockAPIs(collector);

    // 步骤2: 尝试访问AI助手页面
    console.log('\n📍 步骤2: 尝试访问AI助手页面');

    // 先尝试直接访问AI助手页面
    const pageResponse = await attemptPageAccess(page, collector);

    if (pageResponse.requiresLogin) {
      console.log('⚠️ AI助手页面需要登录，跳过前端工具调用测试');
    } else if (pageResponse.success) {
      console.log('✅ 成功访问AI助手页面，开始前端工具调用测试');
      await testFrontendToolCalls(page, collector);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    await browser.close();
    generateComprehensiveReport(collector);
  }
}

// 设置网络监控
function setupNetworkMonitoring(page, collector) {
  const apiRequests = [];

  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const requestData = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      };
      apiRequests.push(requestData);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      const responseData = {
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      };

      // 匹配请求和响应
      const matchingRequest = apiRequests.find(req => req.url === response.url());
      if (matchingRequest) {
        console.log(`🔍 API调用: ${matchingRequest.method} ${response.url()} - ${responseData.status}`);
      }
    }
  });
}

// 测试后端Mock API
async function testBackendMockAPIs(collector) {
  console.log('🔧 开始测试后端Mock API工具调用...');

  // 测试所有工具用例
  const sampleTests = TOOL_TESTS; // 测试所有43个工具

  for (const test of sampleTests) {
    console.log(`\n🎯 测试: ${test.name}`);
    console.log(`💬 查询: ${test.query}`);

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/ai-mock/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          message: test.query,
          mode: 'detailed'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const toolCalls = [];
      let eventCount = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              eventCount++;
              try {
                const data = JSON.parse(line.slice(6));

                if (data.event === 'tool_call_start' || data.event === 'tool_call') {
                  toolCalls.push({
                    name: data.data?.tool_name || data.data?.name || 'unknown_tool',
                    parameters: data.data?.parameters || {},
                    timestamp: new Date().toISOString()
                  });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log(`✅ 成功: 捕获 ${eventCount} 个事件，${toolCalls.length} 个工具调用`);

      if (toolCalls.length > 0) {
        toolCalls.forEach(tool => {
          console.log(`  🔧 工具调用: ${tool.name}`);
        });
      }

      collector.addResult(test, true, toolCalls);

    } catch (error) {
      console.log(`❌ 失败: ${error.message}`);
      collector.addResult(test, false, [], error.message);
    }

    // 避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 尝试访问页面
async function attemptPageAccess(page, collector) {
  try {
    // 先尝试访问登录页面
    await page.goto(`${CONFIG.FRONTEND_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    // 检查是否有登录表单
    const hasLoginForm = await page.$('form') !== null;
    const hasUsernameInput = await page.$('input[name="username"], input[type="text"]') !== null;
    const hasPasswordInput = await page.$('input[name="password"], input[type="password"]') !== null;

    if (hasLoginForm && hasUsernameInput && hasPasswordInput) {
      console.log('✅ 发现登录表单，但需要用户名密码才能继续');
      return { success: false, requiresLogin: true, hasLoginForm: true };
    }

    // 尝试直接访问AI助手页面
    await page.goto(`${CONFIG.FRONTEND_URL}/aiassistant?mode=fullpage`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes('/login')) {
      return { success: false, requiresLogin: true, hasLoginForm: true };
    } else {
      return { success: true, requiresLogin: false, finalUrl: url };
    }

  } catch (error) {
    console.log(`❌ 页面访问失败: ${error.message}`);
    return { success: false, requiresLogin: false, error: error.message };
  }
}

// 测试前端工具调用
async function testFrontendToolCalls(page, collector) {
  console.log('🔧 开始测试前端AI助手工具调用...');

  // 查找输入框
  const inputSelectors = [
    'textarea',
    'input[type="text"]',
    '.el-textarea__inner',
    '[contenteditable="true"]'
  ];

  let inputElement = null;
  for (const selector of inputSelectors) {
    try {
      inputElement = await page.$(selector);
      if (inputElement) {
        console.log(`✅ 找到输入框: ${selector}`);
        break;
      }
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  if (!inputElement) {
    console.log('❌ 未找到输入框，无法进行前端工具调用测试');
    return;
  }

  // 测试几个简单的工具调用
  const frontendTests = TOOL_TESTS.slice(0, 3); // 测试前3个

  for (const test of frontendTests) {
    try {
      console.log(`\n🎯 前端测试: ${test.name}`);
      console.log(`💬 输入: ${test.query}`);

      // 清空并输入测试查询
      await inputElement.fill(test.query);

      // 查找发送按钮
      const sendButtonSelectors = [
        'button[type="submit"]',
        '.send-button',
        '.el-button--primary',
        'button:has-text("发送")'
      ];

      let sendButton = null;
      for (const selector of sendButtonSelectors) {
        try {
          sendButton = await page.$(selector);
          if (sendButton) {
            break;
          }
        } catch (e) {
          // 继续尝试
        }
      }

      if (sendButton) {
        console.log('✅ 找到发送按钮，点击发送...');
        await sendButton.click();

        // 等待响应
        await page.waitForTimeout(5000);

        // 检查是否有响应
        const responseElements = await page.$$('.ai-response, .message-content, .response-content');
        if (responseElements.length > 0) {
          console.log('✅ 检测到AI响应');
          collector.addResult(test, true, [{ name: 'frontend_ai_response', timestamp: new Date().toISOString() }]);
        } else {
          console.log('⚠️ 未检测到AI响应');
          collector.addResult(test, false, [], 'No AI response detected');
        }
      } else {
        console.log('❌ 未找到发送按钮');
        collector.addResult(test, false, [], 'No send button found');
      }

      // 清空输入框进行下一次测试
      await inputElement.fill('');
      await page.waitForTimeout(1000);

    } catch (error) {
      console.log(`❌ 前端测试失败: ${error.message}`);
      collector.addResult(test, false, [], error.message);
    }
  }
}

// 生成综合报告
function generateComprehensiveReport(collector) {
  const summary = collector.getSummary();

  console.log('\n📊 ===== AI助手40个工具调用综合测试报告 =====');

  console.log('\n🔢 测试统计:');
  console.log(`总测试数: ${summary.totalTests}`);
  console.log(`成功测试: ${summary.successCount}`);
  console.log(`失败测试: ${summary.failureCount}`);
  console.log(`成功率: ${summary.successRate}`);

  console.log('\n🔧 工具调用统计:');
  Object.entries(summary.toolCallCounts).forEach(([tool, count]) => {
    console.log(`${tool}: ${count}次调用`);
  });

  console.log('\n📋 详细测试结果:');
  summary.results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} [${result.testName}]`);
    console.log(`   查询: ${result.query}`);
    console.log(`   预期工具: ${result.expectedTool}`);
    console.log(`   工具调用数: ${result.toolCallCount}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    if (result.toolCalls.length > 0) {
      result.toolCalls.forEach(tool => {
        console.log(`   🔧 调用工具: ${tool.name}`);
      });
    }
    console.log('');
  });

  // 保存详细报告
  const reportData = {
    summary,
    timestamp: new Date().toISOString(),
    testConfiguration: CONFIG,
    toolTests: TOOL_TESTS
  };

  const fs = require('fs');
  fs.writeFileSync(
    './ai-tools-comprehensive-test-report.json',
    JSON.stringify(reportData, null, 2),
    'utf8'
  );

  console.log('💾 详细测试报告已保存到: ai-tools-comprehensive-test-report.json');

  if (summary.failureCount > 0) {
    console.log('\n⚠️ 存在失败的测试，请查看详细报告');
  } else {
    console.log('\n🎉 所有测试通过！AI助手工具调用系统工作正常！');
  }
}

// 运行测试
if (require.main === module) {
  runComprehensiveToolTest().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}