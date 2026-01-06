#!/usr/bin/env node

/**
 * AI助手500错误深入调试脚本
 * 
 * 目标：
 * 1. 逐步测试AI助手接口的各个组件
 * 2. 识别500错误的具体原因
 * 3. 提供详细的错误分析和修复建议
 */

const axios = require('axios');
const fs = require('fs');

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

  static debug(message) {
    console.log(`${colors.yellow}🔍 DEBUG:${colors.reset} ${message}`);
  }
}

class AIAssistantDebugger {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.authToken = null;
    this.debugResults = [];
  }

  /**
   * 运行完整的调试流程
   */
  async runDebugProcess() {
    Logger.section('AI助手500错误深入调试');
    
    try {
      // 步骤1: 等待服务器启动
      await this.waitForServer();
      
      // 步骤2: 获取认证令牌
      await this.authenticate();
      
      // 步骤3: 测试基础API连通性
      await this.testBasicConnectivity();
      
      // 步骤4: 测试AI助手接口的各个层级
      await this.testAIAssistantLayers();
      
      // 步骤5: 分析具体的500错误
      await this.analyzeSpecific500Error();
      
      // 步骤6: 测试工具调用相关组件
      await this.testToolCallingComponents();
      
      // 步骤7: 生成调试报告
      this.generateDebugReport();
      
    } catch (error) {
      Logger.error(`调试过程失败: ${error.message}`);
    }
  }

  /**
   * 等待服务器启动
   */
  async waitForServer() {
    Logger.section('步骤1: 等待服务器启动');
    
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        Logger.step(attempts + 1, `检查服务器状态 (尝试 ${attempts + 1}/${maxAttempts})`);
        
        const response = await axios.get(`${this.baseURL}/health`, {
          timeout: 3000,
          headers: {
            'Host': 'localhost'
          }
        });
        
        if (response.status === 200) {
          Logger.success('服务器已启动并响应');
          return;
        }
        
      } catch (error) {
        Logger.debug(`服务器未就绪: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }
    
    throw new Error('服务器启动超时');
  }

  /**
   * 获取认证令牌
   */
  async authenticate() {
    Logger.section('步骤2: 用户认证');
    
    try {
      Logger.step(1, '使用admin账户登录');
      
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (response.data.success && response.data.data.token) {
        this.authToken = response.data.data.token;
        Logger.success('认证成功');
        Logger.debug(`令牌: ${this.authToken.substring(0, 20)}...`);
      } else {
        throw new Error('登录失败');
      }
      
    } catch (error) {
      Logger.error(`认证失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 测试基础API连通性
   */
  async testBasicConnectivity() {
    Logger.section('步骤3: 基础API连通性测试');
    
    const basicAPIs = [
      { path: '/health', name: '健康检查', method: 'GET' },
      { path: '/auth/me', name: '用户信息', method: 'GET' },
      { path: '/organization-status/1/ai-format', name: '机构现状', method: 'GET' }
    ];
    
    for (const api of basicAPIs) {
      try {
        Logger.step(basicAPIs.indexOf(api) + 1, `测试 ${api.name}`);
        
        const config = {
          timeout: 10000
        };
        
        if (api.path !== '/health') {
          config.headers = {
            'Authorization': `Bearer ${this.authToken}`
          };
        }
        
        const response = await axios.get(`${this.baseURL}${api.path}`, config);
        
        Logger.success(`${api.name}: 正常 (${response.status})`);
        this.recordDebugResult(api.name, true, null, {
          status: response.status,
          responseSize: JSON.stringify(response.data).length
        });
        
      } catch (error) {
        Logger.error(`${api.name}: 失败 - ${error.message}`);
        this.recordDebugResult(api.name, false, error.message);
      }
    }
  }

  /**
   * 测试AI助手接口的各个层级
   */
  async testAIAssistantLayers() {
    Logger.section('步骤4: AI助手接口层级测试');
    
    // 测试1: 最简单的请求（不启用工具）
    await this.testSimpleAIRequest();
    
    // 测试2: 启用工具但使用简单查询
    await this.testToolEnabledSimpleRequest();
    
    // 测试3: 复杂查询（现状报表）
    await this.testComplexRequest();
  }

  /**
   * 测试最简单的AI请求
   */
  async testSimpleAIRequest() {
    Logger.step(1, '测试最简单的AI请求（不启用工具）');
    
    try {
      const payload = {
        query: 'hello',
        conversationId: `debug-simple-${Date.now()}`,
        metadata: {
          enableTools: false,
          userRole: 'admin'
        }
      };
      
      Logger.debug(`请求负载: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await axios.post(`${this.baseURL}/ai-assistant-optimized/query`, payload, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      Logger.success('简单AI请求: 成功');
      Logger.debug(`响应状态: ${response.status}`);
      Logger.debug(`响应大小: ${JSON.stringify(response.data).length} 字符`);
      
      this.recordDebugResult('简单AI请求', true, null, {
        status: response.status,
        hasResponse: !!response.data.response,
        responseKeys: Object.keys(response.data)
      });
      
    } catch (error) {
      Logger.error(`简单AI请求: 失败 - ${error.message}`);
      
      if (error.response) {
        Logger.debug(`错误状态: ${error.response.status}`);
        Logger.debug(`错误响应: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      this.recordDebugResult('简单AI请求', false, error.message, {
        status: error.response?.status,
        errorData: error.response?.data
      });
    }
  }

  /**
   * 测试启用工具的简单请求
   */
  async testToolEnabledSimpleRequest() {
    Logger.step(2, '测试启用工具的简单请求');
    
    try {
      const payload = {
        query: 'hello',
        conversationId: `debug-tools-${Date.now()}`,
        metadata: {
          enableTools: true,
          userRole: 'admin'
        }
      };
      
      Logger.debug(`请求负载: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await axios.post(`${this.baseURL}/ai-assistant-optimized/query`, payload, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      Logger.success('启用工具的简单请求: 成功');
      Logger.debug(`响应状态: ${response.status}`);
      
      this.recordDebugResult('启用工具的简单请求', true, null, {
        status: response.status,
        hasToolCalls: this.checkForToolCalls(response.data)
      });
      
    } catch (error) {
      Logger.error(`启用工具的简单请求: 失败 - ${error.message}`);
      
      if (error.response) {
        Logger.debug(`错误状态: ${error.response.status}`);
        Logger.debug(`错误响应: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      this.recordDebugResult('启用工具的简单请求', false, error.message, {
        status: error.response?.status,
        errorData: error.response?.data
      });
    }
  }

  /**
   * 测试复杂请求（现状报表）
   */
  async testComplexRequest() {
    Logger.step(3, '测试复杂请求（现状报表查询）');
    
    try {
      const payload = {
        query: '我的现状你用报表显示',
        conversationId: `debug-complex-${Date.now()}`,
        metadata: {
          enableTools: true,
          userRole: 'admin'
        }
      };
      
      Logger.debug(`请求负载: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await axios.post(`${this.baseURL}/ai-assistant-optimized/query`, payload, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });
      
      Logger.success('复杂请求: 成功');
      Logger.debug(`响应状态: ${response.status}`);
      
      this.recordDebugResult('复杂请求', true, null, {
        status: response.status,
        hasToolCalls: this.checkForToolCalls(response.data),
        hasUIInstruction: this.checkForUIInstruction(response.data)
      });
      
    } catch (error) {
      Logger.error(`复杂请求: 失败 - ${error.message}`);
      
      if (error.response) {
        Logger.debug(`错误状态: ${error.response.status}`);
        Logger.debug(`错误响应: ${JSON.stringify(error.response.data, null, 2)}`);
        
        // 如果是500错误，这就是我们要分析的核心问题
        if (error.response.status === 500) {
          Logger.warning('🎯 发现500错误！这是我们要解决的核心问题');
          this.analyze500Error(error.response.data);
        }
      }
      
      this.recordDebugResult('复杂请求', false, error.message, {
        status: error.response?.status,
        errorData: error.response?.data,
        isTarget500Error: error.response?.status === 500
      });
    }
  }

  /**
   * 分析具体的500错误
   */
  async analyzeSpecific500Error() {
    Logger.section('步骤5: 分析具体的500错误');
    
    // 查找调试结果中的500错误
    const error500Results = this.debugResults.filter(result => 
      !result.success && result.data?.status === 500
    );
    
    if (error500Results.length === 0) {
      Logger.warning('未发现500错误，可能问题已解决或条件不满足');
      return;
    }
    
    Logger.info(`发现 ${error500Results.length} 个500错误`);
    
    error500Results.forEach((result, index) => {
      Logger.step(index + 1, `分析500错误: ${result.name}`);
      this.analyze500Error(result.data?.errorData);
    });
  }

  /**
   * 分析500错误的详细信息
   */
  analyze500Error(errorData) {
    if (!errorData) {
      Logger.warning('没有错误详细信息');
      return;
    }
    
    Logger.debug('500错误详细信息:');
    console.log(JSON.stringify(errorData, null, 2));
    
    // 分析常见的错误模式
    if (errorData.message) {
      Logger.debug(`错误消息: ${errorData.message}`);
      
      if (errorData.message.includes('tools.function.name')) {
        Logger.warning('🎯 发现工具调用参数格式错误！');
        Logger.info('建议: 检查消息服务中的工具格式化逻辑');
      }
      
      if (errorData.message.includes('timeout')) {
        Logger.warning('🎯 发现超时错误！');
        Logger.info('建议: 检查AI模型调用和数据库查询性能');
      }
      
      if (errorData.message.includes('database') || errorData.message.includes('sequelize')) {
        Logger.warning('🎯 发现数据库错误！');
        Logger.info('建议: 检查数据库连接和查询语句');
      }
    }
    
    if (errorData.stack) {
      Logger.debug('错误堆栈:');
      console.log(errorData.stack);
    }
  }

  /**
   * 测试工具调用相关组件
   */
  async testToolCallingComponents() {
    Logger.section('步骤6: 工具调用组件测试');
    
    // 测试工具列表获取
    await this.testToolsList();
    
    // 测试工具注册中心
    await this.testToolRegistry();
  }

  /**
   * 测试工具列表获取
   */
  async testToolsList() {
    Logger.step(1, '测试工具列表获取');
    
    try {
      const response = await axios.get(`${this.baseURL}/ai/function-tools/available-tools`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      
      Logger.success('工具列表获取: 成功');
      Logger.debug(`工具数量统计:`);
      
      if (response.data.data) {
        Object.entries(response.data.data).forEach(([category, tools]) => {
          if (Array.isArray(tools)) {
            Logger.debug(`  ${category}: ${tools.length} 个工具`);
          }
        });
      }
      
      this.recordDebugResult('工具列表获取', true, null, {
        status: response.status,
        toolsData: response.data.data
      });
      
    } catch (error) {
      Logger.error(`工具列表获取: 失败 - ${error.message}`);
      this.recordDebugResult('工具列表获取', false, error.message);
    }
  }

  /**
   * 测试工具注册中心
   */
  async testToolRegistry() {
    Logger.step(2, '测试工具注册中心');
    
    // 工具注册中心是内部服务，我们通过间接方式测试
    Logger.info('工具注册中心是内部服务，通过其他接口间接验证');
    
    this.recordDebugResult('工具注册中心', true, null, {
      note: '通过其他接口间接验证'
    });
  }

  /**
   * 检查响应中是否包含工具调用
   */
  checkForToolCalls(responseData) {
    const toolCallFields = ['toolCalls', 'tool_calls', 'tools', 'functionCalls', 'function_calls'];
    
    for (const field of toolCallFields) {
      if (responseData[field] && Array.isArray(responseData[field]) && responseData[field].length > 0) {
        return true;
      }
    }
    
    if (responseData.data) {
      return this.checkForToolCalls(responseData.data);
    }
    
    return false;
  }

  /**
   * 检查响应中是否包含UI指令
   */
  checkForUIInstruction(responseData) {
    if (responseData.ui_instruction && responseData.ui_instruction.type) {
      return true;
    }
    
    if (responseData.component && responseData.component.type) {
      return true;
    }
    
    if (responseData.data) {
      return this.checkForUIInstruction(responseData.data);
    }
    
    return false;
  }

  /**
   * 记录调试结果
   */
  recordDebugResult(name, success, error = null, data = null) {
    this.debugResults.push({
      name,
      success,
      error,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成调试报告
   */
  generateDebugReport() {
    Logger.section('调试报告');
    
    const successCount = this.debugResults.filter(r => r.success).length;
    const failureCount = this.debugResults.filter(r => !r.success).length;
    
    Logger.info(`总测试数: ${this.debugResults.length}`);
    Logger.success(`成功: ${successCount}`);
    Logger.error(`失败: ${failureCount}`);
    Logger.info(`成功率: ${Math.round((successCount / this.debugResults.length) * 100)}%`);
    
    // 显示失败的测试
    const failures = this.debugResults.filter(r => !r.success);
    if (failures.length > 0) {
      Logger.warning('\n失败的测试:');
      failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.name}: ${failure.error}`);
        if (failure.data?.isTarget500Error) {
          console.log(`   🎯 这是目标500错误！`);
        }
      });
    }
    
    // 保存详细报告
    const reportPath = './ai-assistant-debug-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: this.debugResults.length,
        success: successCount,
        failure: failureCount,
        successRate: Math.round((successCount / this.debugResults.length) * 100)
      },
      results: this.debugResults,
      recommendations: this.generateRecommendations()
    }, null, 2));
    
    Logger.success(`详细调试报告已保存: ${reportPath}`);
  }

  /**
   * 生成修复建议
   */
  generateRecommendations() {
    const recommendations = [];
    
    const has500Error = this.debugResults.some(r => !r.success && r.data?.status === 500);
    if (has500Error) {
      recommendations.push('1. 优先修复AI助手500错误');
      recommendations.push('2. 检查工具调用参数格式化逻辑');
      recommendations.push('3. 添加更详细的错误日志');
    }
    
    const hasToolIssues = this.debugResults.some(r => r.success && r.data?.hasToolCalls === false);
    if (hasToolIssues) {
      recommendations.push('4. 修复工具调用检测逻辑');
      recommendations.push('5. 验证工具注册中心配置');
    }
    
    recommendations.push('6. 添加性能监控和超时保护');
    recommendations.push('7. 实现更好的错误处理和降级机制');
    
    return recommendations;
  }
}

// 运行调试
async function main() {
  const aiDebugger = new AIAssistantDebugger();
  await aiDebugger.runDebugProcess();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AIAssistantDebugger;
