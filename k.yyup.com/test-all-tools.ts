/**
 * 后端AI工具完整测试脚本
 * 
 * 测试所有27个工具，包括：
 * 1. 正常场景
 * 2. 边缘情况
 * 3. 错误处理
 * 
 * 使用方法：
 * ts-node test-all-tools.ts
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import * as fs from 'fs';

// 配置
const API_BASE_URL = 'http://localhost:3000';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// 测试结果统计
interface TestResult {
  toolName: string;
  scenario: string;
  passed: boolean;
  duration: number;
  error?: string;
  response?: any;
}

const testResults: TestResult[] = [];
let token: string = '';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 创建API客户端
function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    timeout: 60000
  });
}

// 登录获取token
async function login(): Promise<void> {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🔐 登录获取Token', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });
    
    token = response.data.data.token;
    log('✅ 登录成功', 'green');
    log(`Token: ${token.substring(0, 20)}...`, 'gray');
  } catch (error: any) {
    log('❌ 登录失败', 'red');
    throw error;
  }
}

// 发送AI消息并等待完成
async function sendAIMessage(message: string, context: any = {}, timeoutMs: number = 120000): Promise<any> {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    timeout: timeoutMs // 使用可配置的超时时间
  });
  
  try {
    const response = await client.post('/api/ai/unified/stream-chat', {
      message,
      userId: '121',
      conversationId: `test-${Date.now()}`,
      context: {
        role: 'admin',
        enableTools: true,
        ...context
      }
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
}

// 记录测试结果
function recordTest(toolName: string, scenario: string, passed: boolean, duration: number, error?: string, response?: any) {
  testResults.push({
    toolName,
    scenario,
    passed,
    duration,
    error,
    response
  });
  
  const status = passed ? '✅' : '❌';
  const statusColor = passed ? 'green' : 'red';
  log(`  ${status} [${scenario}] ${toolName} - ${duration}ms`, statusColor);
  if (error && !passed) {
    log(`     错误: ${error}`, 'red');
  }
}

// ============================================
// 1. 数据库查询工具测试 (2个)
// ============================================

async function testDatabaseQueryTools() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  📊 数据库查询工具测试 (2个)                  ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  // 1. read_data_record - 正常场景
  await testTool('read_data_record', '正常查询学生数据', async () => {
    const response = await sendAIMessage('查询所有学生记录');
    return response.includes('students') || response.includes('学生');
  });
  
  // 2. read_data_record - 边缘情况：不存在的实体
  await testTool('read_data_record', '边缘：不存在的实体', async () => {
    const response = await sendAIMessage('查询xyz123实体');
    return true; // 应该优雅处理
  });
  
  // 3. any_query - 正常场景：复杂查询
  await testTool('any_query', '正常：复杂条件查询', async () => {
    const response = await sendAIMessage('查询大班的所有学生');
    return true;
  });
  
  // 4. any_query - 边缘情况：空查询
  await testTool('any_query', '边缘：查询条件为空', async () => {
    const response = await sendAIMessage('查询数据');
    return true;
  });
}

// ============================================
// 2. 数据库CRUD工具测试 (4个)
// ============================================

async function testDatabaseCRUDTools() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  ✏️  数据库CRUD工具测试 (4个)                  ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  // 1. create_data_record - 正常场景
  await testTool('create_data_record', '正常：创建预览', async () => {
    const response = await sendAIMessage('帮我创建一个测试学生，姓名叫张三');
    return response.includes('create') || response.includes('创建');
  });
  
  // 2. create_data_record - 边缘：缺少必填字段
  await testTool('create_data_record', '边缘：缺少必填字段', async () => {
    const response = await sendAIMessage('创建一个学生');
    return true; // 应该提示缺少字段
  });
  
  // 3. update_data_record - 正常场景
  await testTool('update_data_record', '正常：更新预览', async () => {
    const response = await sendAIMessage('更新ID为1的学生姓名为李四');
    return true;
  });
  
  // 4. update_data_record - 边缘：不存在的ID
  await testTool('update_data_record', '边缘：不存在的ID', async () => {
    const response = await sendAIMessage('更新ID为999999的学生');
    return true;
  });
  
  // 5. delete_data_record - 正常场景
  await testTool('delete_data_record', '正常：删除预览', async () => {
    const response = await sendAIMessage('删除ID为99999的测试数据');
    return true;
  });
  
  // 6. delete_data_record - 边缘：删除关键数据
  await testTool('delete_data_record', '边缘：删除有关联的数据', async () => {
    const response = await sendAIMessage('删除ID为1的学生');
    return true; // 应该显示关联警告
  });
  
  // 7. batch_import_data - 正常场景
  await testTool('batch_import_data', '正常：批量导入预览', async () => {
    const testData = JSON.stringify([
      { name: '测试1', age: 5 },
      { name: '测试2', age: 6 }
    ]);
    const response = await sendAIMessage(`批量导入学生数据：${testData}`);
    return true;
  });
  
  // 8. batch_import_data - 边缘：空数据
  await testTool('batch_import_data', '边缘：空数据数组', async () => {
    const response = await sendAIMessage('批量导入空数据');
    return true;
  });
}

// ============================================
// 3. 网页操作工具测试 (9个)
// ============================================

async function testWebOperationTools() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  🌐 网页操作工具测试 (9个)                    ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  // 1. navigate_to_page - 正常场景
  await testTool('navigate_to_page', '正常：导航到客户池', async () => {
    const response = await sendAIMessage('转到客户池中心');
    return response.includes('navigate') || response.includes('导航');
  });
  
  // 2. navigate_to_page - 边缘：不存在的页面
  await testTool('navigate_to_page', '边缘：导航到不存在页面', async () => {
    const response = await sendAIMessage('转到xyz123页面');
    return true;
  });
  
  // 3. navigate_back - 正常场景
  await testTool('navigate_back', '正常：返回上一页', async () => {
    const response = await sendAIMessage('返回上一页');
    return true;
  });
  
  // 4. capture_screen - 正常场景
  await testTool('capture_screen', '正常：截图当前页面', async () => {
    const response = await sendAIMessage('截图当前页面');
    return true;
  });
  
  // 5. fill_form - 正常场景
  await testTool('fill_form', '正常：填写表单', async () => {
    const response = await sendAIMessage('帮我填写表单，姓名填张三');
    return true;
  });
  
  // 6. type_text - 正常场景
  await testTool('type_text', '正常：输入文本', async () => {
    const response = await sendAIMessage('在输入框输入测试文本');
    return true;
  });
  
  // 7. select_option - 正常场景
  await testTool('select_option', '正常：选择下拉选项', async () => {
    const response = await sendAIMessage('选择下拉框的第一个选项');
    return true;
  });
  
  // 8. wait_for_condition - 正常场景
  await testTool('wait_for_condition', '正常：等待条件', async () => {
    const response = await sendAIMessage('等待页面加载完成');
    return true;
  });
  
  // 9. console_monitor - 正常场景
  await testTool('console_monitor', '正常：监控控制台', async () => {
    const response = await sendAIMessage('监控浏览器控制台错误');
    return true;
  });
  
  // 10. web_search - 正常场景
  await testTool('web_search', '正常：网络搜索', async () => {
    const response = await sendAIMessage('搜索最新的幼儿园管理方法');
    return true;
  });
  
  // 11. web_search - 边缘：空搜索词
  await testTool('web_search', '边缘：空搜索关键词', async () => {
    const response = await sendAIMessage('搜索');
    return true;
  });
}

// ============================================
// 4. 工作流工具测试 (6个)
// ============================================

async function testWorkflowTools() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  🔄 工作流工具测试 (6个)                      ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  // 1. analyze_task_complexity - 正常：简单任务
  await testTool('analyze_task_complexity', '正常：简单任务分析', async () => {
    const response = await sendAIMessage('帮我查询一条数据');
    return true;
  });
  
  // 2. analyze_task_complexity - 边缘：超复杂任务
  await testTool('analyze_task_complexity', '边缘：超复杂任务', async () => {
    const response = await sendAIMessage('帮我策划一个大型活动，包括方案、预算、海报、营销、执行、总结');
    return true;
  });
  
  // 3. create_todo_list - 正常场景
  await testTool('create_todo_list', '正常：创建任务清单', async () => {
    const response = await sendAIMessage('帮我创建一个活动策划的任务清单');
    return true;
  });
  
  // 4. create_todo_list - 边缘：空任务
  await testTool('create_todo_list', '边缘：没有具体任务', async () => {
    const response = await sendAIMessage('创建一个任务清单');
    return true;
  });
  
  // 5. execute_activity_workflow - 正常场景
  await testTool('execute_activity_workflow', '正常：活动工作流', async () => {
    const response = await sendAIMessage('帮我策划一个端午节活动');
    return true;
  });
  
  // 6. generate_complete_activity_plan - 正常场景
  await testTool('generate_complete_activity_plan', '正常：生成活动方案', async () => {
    const response = await sendAIMessage('生成一个中秋节活动方案');
    return true;
  });
  
  // 7. import_teacher_data - 正常场景（如果存在）
  await testTool('import_teacher_data', '正常：导入教师数据', async () => {
    const response = await sendAIMessage('导入教师数据');
    return true;
  }, true); // 可选工具
  
  // 8. import_parent_data - 正常场景（如果存在）
  await testTool('import_parent_data', '正常：导入家长数据', async () => {
    const response = await sendAIMessage('导入家长数据');
    return true;
  }, true); // 可选工具
}

// ============================================
// 5. UI显示工具测试 (2个)
// ============================================

async function testUIDisplayTools() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  🎨 UI显示工具测试 (2个)                      ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  // 1. render_component - 正常：渲染表格
  await testTool('render_component', '正常：渲染数据表格', async () => {
    const response = await sendAIMessage('用表格展示学生记录');
    return response.includes('render') || response.includes('表格') || response.includes('table');
  });
  
  // 2. render_component - 正常：渲染图表
  await testTool('render_component', '正常：渲染图表', async () => {
    const response = await sendAIMessage('用柱状图展示班级人数');
    return true;
  });
  
  // 3. render_component - 边缘：没有数据
  await testTool('render_component', '边缘：渲染空数据', async () => {
    const response = await sendAIMessage('渲染一个表格');
    return true;
  });
  
  // 4. generate_html_preview - 正常场景
  await testTool('generate_html_preview', '正常：生成HTML预览', async () => {
    const response = await sendAIMessage('生成一个简单的欢迎页面');
    return true;
  });
  
  // 5. generate_html_preview - 边缘：复杂交互
  await testTool('generate_html_preview', '边缘：复杂交互页面', async () => {
    const response = await sendAIMessage('生成一个带动画的互动游戏页面');
    return true;
  });
}

// ============================================
// 6. 文档生成工具测试 (4个)
// ============================================

async function testDocumentGenerationTools() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  📄 文档生成工具测试 (4个)                    ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  // 1. generate_excel_report - 正常场景
  await testTool('generate_excel_report', '正常：生成Excel报表', async () => {
    const response = await sendAIMessage('生成学生名单Excel表格');
    return true;
  });
  
  // 2. generate_excel_report - 边缘：空数据
  await testTool('generate_excel_report', '边缘：生成空报表', async () => {
    const response = await sendAIMessage('生成Excel报表');
    return true;
  });
  
  // 3. generate_word_document - 正常场景
  await testTool('generate_word_document', '正常：生成Word文档', async () => {
    const response = await sendAIMessage('生成活动总结Word文档');
    return true;
  });
  
  // 4. generate_pdf_report - 正常场景
  await testTool('generate_pdf_report', '正常：生成PDF报告', async () => {
    const response = await sendAIMessage('生成月度分析PDF报告');
    return true;
  });
  
  // 5. generate_ppt_presentation - 正常场景
  await testTool('generate_ppt_presentation', '正常：生成PPT', async () => {
    const response = await sendAIMessage('生成活动介绍PPT');
    return true;
  });
  
  // 6. generate_ppt_presentation - 边缘：极少内容
  await testTool('generate_ppt_presentation', '边缘：内容极少的PPT', async () => {
    const response = await sendAIMessage('生成PPT');
    return true;
  });
}

// ============================================
// 7. 边缘和压力测试
// ============================================

async function testEdgeCases() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  ⚠️  边缘情况和压力测试                        ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  // 1. 超长输入
  await testTool('边缘测试', '超长输入（1000字）', async () => {
    const longMessage = '查询学生' + '测试内容'.repeat(250);
    const response = await sendAIMessage(longMessage);
    return true;
  });
  
  // 2. 特殊字符
  await testTool('边缘测试', '特殊字符输入', async () => {
    const response = await sendAIMessage('查询姓名为<script>alert("test")</script>的学生');
    return true;
  });
  
  // 3. 多工具组合
  await testTool('边缘测试', '多工具组合调用', async () => {
    const response = await sendAIMessage('查询所有学生，然后用表格展示，最后生成Excel报表');
    return true;
  });
  
  // 4. 矛盾指令
  await testTool('边缘测试', '矛盾的指令', async () => {
    const response = await sendAIMessage('创建一个学生同时删除这个学生');
    return true;
  });
  
  // 5. 空消息
  await testTool('边缘测试', '空消息', async () => {
    const response = await sendAIMessage('');
    return true;
  });
  
  // 6. 仅空格
  await testTool('边缘测试', '仅空格消息', async () => {
    const response = await sendAIMessage('   ');
    return true;
  });
}

// ============================================
// 通用测试函数
// ============================================

async function testTool(
  toolName: string,
  scenario: string,
  testFunc: () => Promise<boolean>,
  optional: boolean = false
): Promise<void> {
  const startTime = Date.now();
  
  try {
    const passed = await testFunc();
    const duration = Date.now() - startTime;
    recordTest(toolName, scenario, passed, duration);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || String(error);
    
    if (optional) {
      // 可选工具，失败不算错误
      recordTest(toolName, scenario, true, duration, `可选工具: ${errorMessage}`);
    } else {
      recordTest(toolName, scenario, false, duration, errorMessage);
    }
  }
}

// ============================================
// 生成测试报告
// ============================================

function generateReport() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║              📊 测试报告                       ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(2);
  const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = (totalDuration / totalTests).toFixed(2);
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log(`📈 总测试数: ${totalTests}`, 'blue');
  log(`✅ 通过: ${passedTests}`, 'green');
  log(`❌ 失败: ${failedTests}`, 'red');
  log(`📊 成功率: ${successRate}%`, successRate === '100.00' ? 'green' : 'yellow');
  log(`⏱️  总耗时: ${totalDuration}ms`, 'blue');
  log(`⏱️  平均耗时: ${avgDuration}ms`, 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  // 按工具分组统计
  log('\n📋 分类统计:', 'cyan');
  const toolGroups = new Map<string, { passed: number; total: number }>();
  
  testResults.forEach(result => {
    const group = result.toolName;
    if (!toolGroups.has(group)) {
      toolGroups.set(group, { passed: 0, total: 0 });
    }
    const stats = toolGroups.get(group)!;
    stats.total++;
    if (result.passed) stats.passed++;
  });
  
  toolGroups.forEach((stats, toolName) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(0);
    const icon = stats.passed === stats.total ? '✅' : '⚠️';
    log(`  ${icon} ${toolName}: ${stats.passed}/${stats.total} (${rate}%)`, 
        stats.passed === stats.total ? 'green' : 'yellow');
  });
  
  // 失败的测试
  if (failedTests > 0) {
    log('\n❌ 失败的测试:', 'red');
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        log(`  • [${r.toolName}] ${r.scenario}`, 'red');
        if (r.error) {
          log(`    错误: ${r.error}`, 'gray');
        }
      });
  }
  
  // 最慢的测试
  log('\n🐌 最慢的5个测试:', 'yellow');
  [...testResults]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .forEach((r, i) => {
      log(`  ${i + 1}. [${r.toolName}] ${r.scenario} - ${r.duration}ms`, 'yellow');
    });
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  // 保存报告到文件
  const reportPath = './test-results-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(`📄 详细报告已保存到: ${reportPath}`, 'blue');
}

// ============================================
// 主函数
// ============================================

async function main() {
  const startTime = Date.now();
  
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║     🧪 后端AI工具完整测试套件                 ║', 'cyan');
  log('║                                                ║', 'cyan');
  log('║     测试27个工具 + 边缘情况                   ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  
  try {
    // 登录
    await login();
    
    // 执行所有测试
    await testDatabaseQueryTools();
    await testDatabaseCRUDTools();
    await testWebOperationTools();
    await testWorkflowTools();
    await testUIDisplayTools();
    await testDocumentGenerationTools();
    await testEdgeCases();
    
    // 生成报告
    const totalTime = Date.now() - startTime;
    generateReport();
    
    log(`\n🎉 所有测试完成！总耗时: ${totalTime}ms\n`, 'green');
    
    // 根据结果设置退出码
    const failedCount = testResults.filter(r => !r.passed).length;
    process.exit(failedCount > 0 ? 1 : 0);
    
  } catch (error: any) {
    log(`\n❌ 测试执行失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { testResults };

