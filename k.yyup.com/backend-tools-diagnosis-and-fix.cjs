#!/usr/bin/env node

/**
 * 后端工具调用问题诊断和修复脚本
 * 
 * 基于测试结果，诊断并修复以下问题：
 * 1. AI助手优化查询500错误
 * 2. 统一智能接口404错误
 * 3. Function Tools工具列表返回0个工具
 * 4. 工具调用检测失败
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

  static fix(message) {
    console.log(`${colors.bright}${colors.green}🔧 修复:${colors.reset} ${message}`);
  }
}

class BackendToolsDiagnoser {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.authToken = null;
    this.issues = [];
    this.fixes = [];
  }

  /**
   * 运行诊断和修复
   */
  async runDiagnosisAndFix() {
    Logger.section('后端工具调用问题诊断和修复');
    
    try {
      // 步骤1: 获取认证令牌
      await this.authenticate();
      
      // 步骤2: 诊断路由问题
      await this.diagnoseRoutes();
      
      // 步骤3: 诊断工具注册问题
      await this.diagnoseToolRegistry();
      
      // 步骤4: 诊断AI助手优化接口问题
      await this.diagnoseAIAssistantOptimized();
      
      // 步骤5: 诊断工具调用格式问题
      await this.diagnoseToolCallFormat();
      
      // 步骤6: 生成修复建议
      this.generateFixRecommendations();
      
    } catch (error) {
      Logger.error(`诊断执行失败: ${error.message}`);
    }
  }

  /**
   * 获取认证令牌
   */
  async authenticate() {
    Logger.section('步骤1: 用户认证');
    
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (response.data.success && response.data.data.token) {
        this.authToken = response.data.data.token;
        Logger.success('认证成功');
      } else {
        throw new Error('登录失败');
      }
      
    } catch (error) {
      Logger.error(`认证失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 诊断路由问题
   */
  async diagnoseRoutes() {
    Logger.section('步骤2: 路由诊断');
    
    const routes = [
      { path: '/ai-assistant-optimized/query', method: 'POST', name: 'AI助手优化查询' },
      { path: '/ai/unified-intelligence/stream', method: 'POST', name: '统一智能接口' },
      { path: '/ai/function-tools', method: 'POST', name: 'Function Tools' },
      { path: '/ai/function-tools/available-tools', method: 'GET', name: 'Function Tools工具列表' },
      { path: '/organization-status/1/ai-format', method: 'GET', name: '机构现状API' }
    ];
    
    for (const route of routes) {
      try {
        Logger.step(routes.indexOf(route) + 1, `检查路由: ${route.name}`);
        
        let response;
        if (route.method === 'GET') {
          response = await axios.get(`${this.baseURL}${route.path}`, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
        } else {
          response = await axios.post(`${this.baseURL}${route.path}`, {
            query: 'test',
            conversationId: 'test'
          }, {
            headers: { 
              'Authorization': `Bearer ${this.authToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
        }
        
        Logger.success(`${route.name}: 路由存在 (${response.status})`);
        
      } catch (error) {
        if (error.response?.status === 404) {
          Logger.error(`${route.name}: 路由不存在 (404)`);
          this.issues.push({
            type: 'route_missing',
            route: route.path,
            name: route.name,
            method: route.method
          });
        } else if (error.response?.status === 500) {
          Logger.warning(`${route.name}: 路由存在但有内部错误 (500)`);
          this.issues.push({
            type: 'route_error',
            route: route.path,
            name: route.name,
            error: error.message
          });
        } else {
          Logger.warning(`${route.name}: ${error.message}`);
        }
      }
    }
  }

  /**
   * 诊断工具注册问题
   */
  async diagnoseToolRegistry() {
    Logger.section('步骤3: 工具注册诊断');
    
    try {
      Logger.step(1, '检查Function Tools工具列表');
      
      const response = await axios.get(`${this.baseURL}/ai/function-tools/available-tools`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      
      Logger.info('响应结构:', Object.keys(response.data));
      Logger.info('响应内容:', JSON.stringify(response.data, null, 2));
      
      // 分析工具数量
      let totalTools = 0;
      if (response.data.data && typeof response.data.data === 'object') {
        Object.values(response.data.data).forEach(category => {
          if (Array.isArray(category)) {
            totalTools += category.length;
          }
        });
      }
      
      if (totalTools === 0) {
        Logger.error('工具注册问题: 没有发现任何工具');
        this.issues.push({
          type: 'no_tools_registered',
          description: 'Function Tools工具列表返回0个工具',
          response: response.data
        });
      } else {
        Logger.success(`发现 ${totalTools} 个注册工具`);
      }
      
    } catch (error) {
      Logger.error(`工具注册诊断失败: ${error.message}`);
      this.issues.push({
        type: 'tool_registry_error',
        error: error.message
      });
    }
  }

  /**
   * 诊断AI助手优化接口问题
   */
  async diagnoseAIAssistantOptimized() {
    Logger.section('步骤4: AI助手优化接口诊断');
    
    const testCases = [
      { query: '你好', description: '简单查询', expectError: false },
      { query: '我的现状你用报表显示', description: '现状报表查询', expectError: true }
    ];
    
    for (const testCase of testCases) {
      try {
        Logger.step(testCases.indexOf(testCase) + 1, `测试: ${testCase.description}`);
        
        const response = await axios.post(`${this.baseURL}/ai-assistant-optimized/query`, {
          query: testCase.query,
          conversationId: `diagnosis-${Date.now()}`,
          metadata: {
            enableTools: false, // 先测试不启用工具的情况
            userRole: 'admin'
          }
        }, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        Logger.success(`${testCase.description}: 调用成功 (${response.status})`);
        
        // 现在测试启用工具的情况
        try {
          const toolResponse = await axios.post(`${this.baseURL}/ai-assistant-optimized/query`, {
            query: testCase.query,
            conversationId: `diagnosis-tools-${Date.now()}`,
            metadata: {
              enableTools: true,
              userRole: 'admin'
            }
          }, {
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });
          
          Logger.success(`${testCase.description} (启用工具): 调用成功`);
          
        } catch (toolError) {
          Logger.error(`${testCase.description} (启用工具): 调用失败 - ${toolError.message}`);
          this.issues.push({
            type: 'ai_assistant_tool_error',
            query: testCase.query,
            error: toolError.message,
            status: toolError.response?.status
          });
        }
        
      } catch (error) {
        Logger.error(`${testCase.description}: 调用失败 - ${error.message}`);
        this.issues.push({
          type: 'ai_assistant_error',
          query: testCase.query,
          error: error.message,
          status: error.response?.status
        });
      }
    }
  }

  /**
   * 诊断工具调用格式问题
   */
  async diagnoseToolCallFormat() {
    Logger.section('步骤5: 工具调用格式诊断');
    
    try {
      Logger.step(1, '分析工具调用格式问题');
      
      // 基于之前的测试结果，我们知道主要问题是tools.function.name参数缺失
      Logger.info('已知问题: AI工具调用时缺少tools.function.name参数');
      
      this.issues.push({
        type: 'tool_call_format_error',
        description: 'AI工具调用参数格式错误',
        details: 'tools.function.name参数缺失',
        impact: '所有依赖工具调用的查询都会失败'
      });
      
      Logger.warning('工具调用格式问题已记录');
      
    } catch (error) {
      Logger.error(`工具调用格式诊断失败: ${error.message}`);
    }
  }

  /**
   * 生成修复建议
   */
  generateFixRecommendations() {
    Logger.section('修复建议');
    
    Logger.info(`发现 ${this.issues.length} 个问题，生成修复建议:`);
    
    this.issues.forEach((issue, index) => {
      console.log(`\n${colors.yellow}问题 ${index + 1}:${colors.reset} ${issue.type}`);
      
      switch (issue.type) {
        case 'route_missing':
          Logger.fix(`添加缺失的路由: ${issue.method} ${issue.route}`);
          this.fixes.push({
            type: 'add_route',
            route: issue.route,
            method: issue.method,
            name: issue.name
          });
          break;
          
        case 'route_error':
          Logger.fix(`修复路由内部错误: ${issue.route}`);
          Logger.info(`错误详情: ${issue.error}`);
          this.fixes.push({
            type: 'fix_route_error',
            route: issue.route,
            error: issue.error
          });
          break;
          
        case 'no_tools_registered':
          Logger.fix('修复工具注册问题');
          Logger.info('建议检查工具注册中心的初始化逻辑');
          this.fixes.push({
            type: 'fix_tool_registration',
            description: '检查并修复工具注册中心'
          });
          break;
          
        case 'ai_assistant_tool_error':
          Logger.fix('修复AI助手工具调用问题');
          Logger.info(`查询: ${issue.query}`);
          Logger.info(`错误: ${issue.error}`);
          this.fixes.push({
            type: 'fix_ai_tool_calling',
            query: issue.query,
            error: issue.error
          });
          break;
          
        case 'tool_call_format_error':
          Logger.fix('修复工具调用参数格式');
          Logger.info('需要修复消息服务中的工具格式化逻辑');
          this.fixes.push({
            type: 'fix_tool_format',
            file: 'server/src/services/ai/message.service.ts',
            description: '修复工具参数格式化逻辑'
          });
          break;
          
        default:
          Logger.warning(`未知问题类型: ${issue.type}`);
      }
    });
    
    // 保存诊断报告
    const reportPath = path.join(__dirname, 'backend-tools-diagnosis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        issueTypes: [...new Set(this.issues.map(i => i.type))]
      },
      issues: this.issues,
      fixes: this.fixes,
      recommendations: [
        '1. 优先修复工具调用参数格式问题',
        '2. 检查并修复缺失的路由',
        '3. 验证工具注册中心的初始化',
        '4. 测试修复后的完整工具调用链路'
      ]
    }, null, 2));
    
    Logger.success(`诊断报告已保存: ${reportPath}`);
    
    // 生成修复优先级
    Logger.section('修复优先级');
    Logger.info('🔥 高优先级: 工具调用参数格式问题');
    Logger.info('🔶 中优先级: 缺失的路由问题');
    Logger.info('🔷 低优先级: 工具注册中心问题');
  }
}

// 运行诊断
async function main() {
  const diagnoser = new BackendToolsDiagnoser();
  await diagnoser.runDiagnosisAndFix();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BackendToolsDiagnoser;
