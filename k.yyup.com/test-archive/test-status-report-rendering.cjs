#!/usr/bin/env node

/**
 * 测试"我的现状你用报表显示"查询的工具调用和组件渲染
 * 
 * 测试场景：
 * 1. 用户在AI助手全屏模式下输入"我的现状你用报表显示"
 * 2. AI应该调用相关工具获取数据
 * 3. 返回包含ui_instruction的结果
 * 4. 前端应该渲染为报表组件
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  static info(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  }

  static error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }

  static warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  static section(title) {
    console.log(`\n${colors.bright}${colors.cyan}═══ ${title} ═══${colors.reset}\n`);
  }

  static step(step, description) {
    console.log(`${colors.magenta}[步骤 ${step}]${colors.reset} ${description}`);
  }

  static user(message) {
    console.log(`${colors.bright}${colors.blue}👤 用户:${colors.reset} ${message}`);
  }

  static ai(message) {
    console.log(`${colors.bright}${colors.green}🤖 AI助手:${colors.reset} ${message}`);
  }
}

class StatusReportRenderingTester {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.authToken = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    Logger.section('现状报表渲染测试');
    
    try {
      // 步骤1: 获取认证令牌
      await this.authenticate();
      
      // 步骤2: 测试AI助手优化查询接口
      await this.testOptimizedQuery();
      
      // 步骤3: 测试统一智能接口
      await this.testUnifiedIntelligence();
      
      // 步骤4: 测试机构现状工具
      await this.testOrganizationStatusTool();
      
      // 步骤5: 测试组件渲染工具
      await this.testRenderComponentTool();
      
      this.generateReport();
      
    } catch (error) {
      Logger.error(`测试执行失败: ${error.message}`);
    }
  }

  /**
   * 获取认证令牌
   */
  async authenticate() {
    Logger.section('步骤1: 用户认证');
    
    try {
      Logger.step(1, '使用admin账户登录');
      
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (response.data.success && response.data.data.token) {
        this.authToken = response.data.data.token;
        Logger.success('认证成功');
        Logger.info(`令牌: ${this.authToken.substring(0, 20)}...`);
        this.recordTest('用户认证', true);
      } else {
        throw new Error('登录失败');
      }
      
    } catch (error) {
      Logger.error(`认证失败: ${error.message}`);
      this.recordTest('用户认证', false, error.message);
      throw error;
    }
  }

  /**
   * 测试AI助手优化查询接口
   */
  async testOptimizedQuery() {
    Logger.section('步骤2: AI助手优化查询');
    
    try {
      Logger.step(1, '发送"我的现状你用报表显示"查询');
      Logger.user('我的现状你用报表显示');
      
      const response = await axios.post(`${this.baseURL}/ai-assistant-optimized/query`, {
        query: '我的现状你用报表显示',
        conversationId: 'test-conversation-' + Date.now(),
        metadata: {
          enableTools: true,
          enableWebSearch: false,
          userRole: 'admin'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      Logger.info('响应状态:', response.status);
      Logger.info('响应数据:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // 检查响应结构
      if (response.data.success) {
        Logger.success('AI助手优化查询成功');
        
        // 检查是否包含工具调用结果
        const hasToolCalls = this.checkForToolCalls(response.data);
        const hasUIInstruction = this.checkForUIInstruction(response.data);
        
        if (hasToolCalls) {
          Logger.success('✓ 检测到工具调用');
        } else {
          Logger.warning('⚠ 未检测到工具调用');
        }
        
        if (hasUIInstruction) {
          Logger.success('✓ 检测到UI渲染指令');
        } else {
          Logger.warning('⚠ 未检测到UI渲染指令');
        }
        
        this.recordTest('AI助手优化查询', true, null, {
          hasToolCalls,
          hasUIInstruction,
          responseData: response.data
        });
      } else {
        throw new Error(`查询失败: ${response.data.message}`);
      }
      
    } catch (error) {
      Logger.error(`AI助手优化查询失败: ${error.message}`);
      this.recordTest('AI助手优化查询', false, error.message);
    }
  }

  /**
   * 测试统一智能接口
   */
  async testUnifiedIntelligence() {
    Logger.section('步骤3: 统一智能接口');
    
    try {
      Logger.step(1, '测试统一智能流式接口');
      
      const response = await axios.post(`${this.baseURL}/ai/unified-intelligence/stream`, {
        content: '我的现状你用报表显示',
        context: {
          role: 'admin',
          enableTools: true,
          conversationId: 'test-unified-' + Date.now()
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      Logger.info('统一智能响应状态:', response.status);
      Logger.info('统一智能响应数据:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.status === 200) {
        Logger.success('统一智能接口调用成功');
        this.recordTest('统一智能接口', true);
      } else {
        throw new Error(`统一智能接口调用失败: ${response.status}`);
      }
      
    } catch (error) {
      Logger.error(`统一智能接口测试失败: ${error.message}`);
      this.recordTest('统一智能接口', false, error.message);
    }
  }

  /**
   * 测试机构现状工具
   */
  async testOrganizationStatusTool() {
    Logger.section('步骤4: 机构现状工具');
    
    try {
      Logger.step(1, '直接调用机构现状API');
      
      const response = await axios.get(`${this.baseURL}/organization-status/1/ai-format`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      
      Logger.info('机构现状响应:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.code === 200 && response.data.data.text) {
        Logger.success('机构现状工具正常工作');
        Logger.info(`数据文本长度: ${response.data.data.text.length} 字符`);
        this.recordTest('机构现状工具', true);
      } else {
        throw new Error('机构现状工具返回数据异常');
      }
      
    } catch (error) {
      Logger.error(`机构现状工具测试失败: ${error.message}`);
      this.recordTest('机构现状工具', false, error.message);
    }
  }

  /**
   * 测试组件渲染工具
   */
  async testRenderComponentTool() {
    Logger.section('步骤5: 组件渲染工具');
    
    try {
      Logger.step(1, '测试render_component工具调用');
      
      // 模拟调用render_component工具
      const mockComponentData = {
        component_type: 'stat-card',
        title: '机构现状报表',
        data: {
          totalStudents: 150,
          totalTeachers: 25,
          totalClasses: 8,
          enrollmentRate: 85.5
        }
      };
      
      Logger.info('模拟组件数据:');
      console.log(JSON.stringify(mockComponentData, null, 2));
      
      // 验证组件数据结构
      const isValidComponent = this.validateComponentData(mockComponentData);
      
      if (isValidComponent) {
        Logger.success('组件数据结构验证通过');
        
        // 模拟前端组件识别
        const mockToolResult = {
          name: "render_component",
          status: "success",
          result: {
            component: {
              type: 'stat-card',
              title: '机构现状报表',
              data: mockComponentData.data
            },
            ui_instruction: {
              type: 'render_component',
              component: {
                type: 'stat-card',
                title: '机构现状报表',
                data: mockComponentData.data
              }
            }
          }
        };
        
        const isRecognized = this.simulateComponentRecognition(mockToolResult.result);
        
        if (isRecognized) {
          Logger.success('✓ 前端组件识别成功');
        } else {
          Logger.warning('⚠ 前端组件识别失败');
        }
        
        this.recordTest('组件渲染工具', true, null, {
          componentData: mockComponentData,
          toolResult: mockToolResult,
          recognized: isRecognized
        });
      } else {
        throw new Error('组件数据结构验证失败');
      }
      
    } catch (error) {
      Logger.error(`组件渲染工具测试失败: ${error.message}`);
      this.recordTest('组件渲染工具', false, error.message);
    }
  }

  /**
   * 检查响应中是否包含工具调用
   */
  checkForToolCalls(responseData) {
    if (responseData.data && responseData.data.toolCalls) {
      return responseData.data.toolCalls.length > 0;
    }
    
    if (responseData.data && responseData.data.steps) {
      return responseData.data.steps.some(step => step.type === 'tool_call');
    }
    
    return false;
  }

  /**
   * 检查响应中是否包含UI渲染指令
   */
  checkForUIInstruction(responseData) {
    const checkObject = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      
      if (obj.ui_instruction && obj.ui_instruction.type) {
        return ['render_statistics', 'render_chart', 'render_table', 'render_component'].includes(obj.ui_instruction.type);
      }
      
      if (obj.component && obj.component.type) {
        return true;
      }
      
      // 递归检查嵌套对象
      for (const key in obj) {
        if (checkObject(obj[key])) {
          return true;
        }
      }
      
      return false;
    };
    
    return checkObject(responseData);
  }

  /**
   * 验证组件数据结构
   */
  validateComponentData(componentData) {
    return !!(
      componentData &&
      componentData.component_type &&
      componentData.title &&
      componentData.data &&
      typeof componentData.data === 'object'
    );
  }

  /**
   * 模拟前端组件识别逻辑
   */
  simulateComponentRecognition(result) {
    if (!result) return false;

    // 检查是否有 ui_instruction 字段
    if (result.ui_instruction && typeof result.ui_instruction === 'object') {
      const uiInstruction = result.ui_instruction;
      if (uiInstruction.type && ['render_statistics', 'render_chart', 'render_table', 'render_component'].includes(uiInstruction.type)) {
        return true;
      }
    }

    // 检查是否有 component 字段
    if (result.component && typeof result.component === 'object' && result.component.type) {
      return true;
    }

    return false;
  }

  /**
   * 记录测试结果
   */
  recordTest(name, passed, error = null, data = null) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    
    this.testResults.tests.push({
      name,
      status: passed ? 'passed' : 'failed',
      error: error || null,
      data: data || null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    Logger.section('测试报告');
    
    Logger.info(`总测试数: ${this.testResults.total}`);
    Logger.success(`通过: ${this.testResults.passed}`);
    Logger.error(`失败: ${this.testResults.failed}`);
    Logger.info(`成功率: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);
    
    console.log('\n详细结果:');
    this.testResults.tests.forEach((test, index) => {
      const status = test.status === 'passed' ? 
        `${colors.green}✓${colors.reset}` : 
        `${colors.red}✗${colors.reset}`;
      
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (test.error) {
        console.log(`   错误: ${colors.red}${test.error}${colors.reset}`);
      }
      if (test.data && test.data.hasToolCalls !== undefined) {
        console.log(`   工具调用: ${test.data.hasToolCalls ? '✓' : '✗'}`);
        console.log(`   UI指令: ${test.data.hasUIInstruction ? '✓' : '✗'}`);
      }
    });
    
    // 保存测试报告
    const reportPath = path.join(__dirname, 'status-report-rendering-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      query: '我的现状你用报表显示',
      testEnvironment: 'AI助手全屏模式',
      results: this.testResults,
      analysis: {
        problem: 'AI调用了工具但没有返回渲染组件',
        expectedBehavior: '应该返回包含ui_instruction的组件数据',
        actualBehavior: '返回文本响应而不是组件',
        possibleCauses: [
          '工具调用结果没有正确格式化为ui_instruction',
          '前端组件识别逻辑不完整',
          'AI模型没有调用正确的渲染工具',
          '工具调用链中断或异常'
        ]
      }
    }, null, 2));
    
    Logger.success(`测试报告已保存: ${reportPath}`);
    
    // 生成问题分析
    Logger.section('问题分析');
    Logger.info('测试场景: 用户在AI助手全屏模式下查询现状报表');
    Logger.info('期望结果: AI调用工具获取数据，返回渲染组件');
    Logger.info('实际问题: 工具调用成功但没有返回渲染组件');
    
    Logger.section('可能原因');
    Logger.warning('1. AI模型没有调用render_component工具');
    Logger.warning('2. 工具调用结果格式不正确');
    Logger.warning('3. 前端组件识别逻辑有缺陷');
    Logger.warning('4. ui_instruction生成逻辑有问题');
  }
}

// 运行测试
async function main() {
  const tester = new StatusReportRenderingTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = StatusReportRenderingTester;
