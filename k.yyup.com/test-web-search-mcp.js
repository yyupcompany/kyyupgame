/**
 * 使用MCP测试网络搜索功能
 * 测试AIBridge集成的火山引擎融合搜索
 */

import axios from 'axios';

// 配置
const CONFIG = {
  backend: {
    url: 'http://localhost:3000',
    timeout: 60000
  },
  auth: {
    username: 'admin',
    password: 'admin123'
  },
  search: {
    queries: [
      '2025年幼儿园招生政策',
      '幼儿园教育改革最新动态',
      '学前教育发展趋势'
    ]
  }
};

/**
 * 日志工具
 */
class Logger {
  static info(message, data = null) {
    console.log(`\n📘 [INFO] ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }

  static success(message, data = null) {
    console.log(`\n✅ [SUCCESS] ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }

  static error(message, error = null) {
    console.error(`\n❌ [ERROR] ${message}`);
    if (error) {
      console.error('错误详情:', error.message || error);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
    }
  }

  static warn(message, data = null) {
    console.warn(`\n⚠️  [WARN] ${message}`);
    if (data) console.warn(JSON.stringify(data, null, 2));
  }
}

/**
 * 网络搜索测试类
 */
class WebSearchTester {
  constructor() {
    this.token = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * 登录获取token
   */
  async login() {
    Logger.info('开始登录系统...');

    try {
      const response = await axios.post(
        `${CONFIG.backend.url}/api/auth/login`,
        {
          username: CONFIG.auth.username,
          password: CONFIG.auth.password
        },
        {
          timeout: CONFIG.backend.timeout
        }
      );

      if (response.data && response.data.success && response.data.data && response.data.data.token) {
        this.token = response.data.data.token;
        Logger.success('登录成功', {
          token: this.token.substring(0, 20) + '...',
          user: response.data.data.user.username
        });
        return true;
      } else {
        throw new Error('登录响应中没有token');
      }
    } catch (error) {
      Logger.error('登录失败', error);
      return false;
    }
  }

  /**
   * 测试网络搜索API
   */
  async testWebSearchAPI(query) {
    Logger.info(`测试网络搜索: "${query}"`);
    this.testResults.total++;

    try {
      const startTime = Date.now();

      // 调用统一智能API，启用网络搜索
      const response = await axios.post(
        `${CONFIG.backend.url}/api/ai/unified/unified-chat`,
        {
          message: query,
          enableWebSearch: true,
          context: {
            enableWebSearch: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          timeout: CONFIG.backend.timeout
        }
      );

      const duration = Date.now() - startTime;

      // 验证响应
      if (!response.data) {
        throw new Error('响应数据为空');
      }

      // 调试：打印响应结构
      Logger.info('API响应结构', {
        success: response.data.success,
        hasData: !!response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : []
      });

      if (!response.data.success) {
        throw new Error(`搜索失败: ${response.data.message || '未知错误'}`);
      }

      const aiResponse = response.data.data;

      // 验证AI响应结构
      const validations = [
        { check: !!aiResponse, message: 'AI响应数据存在' },
        { check: !!aiResponse.message, message: '包含响应消息' }
      ];

      let allValid = true;
      for (const validation of validations) {
        if (!validation.check) {
          Logger.error(`验证失败: ${validation.message}`);
          allValid = false;
        }
      }

      if (!allValid) {
        throw new Error('AI响应验证失败');
      }

      // 检查是否包含搜索结果
      const hasToolExecutions = aiResponse.tool_executions && aiResponse.tool_executions.length > 0;
      const hasWebSearch = hasToolExecutions &&
                          aiResponse.tool_executions.some(t => t.tool_name === 'web_search' || t.tool_name === 'search_web');
      const messageContainsSearch = aiResponse.message &&
                                   (aiResponse.message.includes('搜索') ||
                                    aiResponse.message.includes('查询') ||
                                    aiResponse.message.includes('http'));

      // 记录成功
      this.testResults.passed++;
      this.testResults.details.push({
        query,
        status: 'passed',
        duration,
        hasToolExecutions,
        hasWebSearch,
        messageContainsSearch,
        responseLength: aiResponse.message?.length || 0,
        toolCount: aiResponse.tool_executions?.length || 0
      });

      Logger.success(`搜索成功`, {
        查询: query,
        耗时: `${duration}ms`,
        响应长度: aiResponse.message?.length || 0,
        工具调用数: aiResponse.tool_executions?.length || 0,
        包含网络搜索: hasWebSearch ? '是' : '否',
        消息包含搜索内容: messageContainsSearch ? '是' : '否',
        响应预览: aiResponse.message?.substring(0, 150) + '...'
      });

      return true;
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({
        query,
        status: 'failed',
        error: error.message
      });

      Logger.error(`搜索失败: "${query}"`, error);
      return false;
    }
  }

  /**
   * 测试AIBridge服务状态
   */
  async testAIBridgeStatus() {
    Logger.info('检查AIBridge服务状态...');

    try {
      const response = await axios.get(
        `${CONFIG.backend.url}/api/ai/models`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          timeout: CONFIG.backend.timeout
        }
      );

      if (response.data && response.data.success) {
        const models = response.data.data;
        const searchModel = models.find(m => m.name === 'volcano-fusion-search');

        if (searchModel) {
          Logger.success('找到搜索模型配置', {
            名称: searchModel.name,
            显示名: searchModel.displayName,
            状态: searchModel.status,
            能力: searchModel.capabilities
          });
          return true;
        } else {
          Logger.warn('未找到搜索模型配置');
          return false;
        }
      }
    } catch (error) {
      Logger.error('检查AIBridge状态失败', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 开始网络搜索功能测试');
    console.log('='.repeat(60));

    // 1. 登录
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      Logger.error('登录失败，终止测试');
      return;
    }

    // 2. 检查AIBridge状态
    await this.testAIBridgeStatus();

    // 3. 测试网络搜索
    for (const query of CONFIG.search.queries) {
      await this.testWebSearchAPI(query);
      // 等待1秒避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. 输出测试报告
    this.printTestReport();
  }

  /**
   * 打印测试报告
   */
  printTestReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试报告');
    console.log('='.repeat(60));

    console.log(`\n总测试数: ${this.testResults.total}`);
    console.log(`✅ 通过: ${this.testResults.passed}`);
    console.log(`❌ 失败: ${this.testResults.failed}`);
    console.log(`成功率: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);

    console.log('\n详细结果:');
    this.testResults.details.forEach((detail, index) => {
      console.log(`\n${index + 1}. ${detail.query}`);
      console.log(`   状态: ${detail.status === 'passed' ? '✅ 通过' : '❌ 失败'}`);
      if (detail.status === 'passed') {
        console.log(`   耗时: ${detail.duration}ms`);
        console.log(`   响应长度: ${detail.responseLength}字符`);
        console.log(`   工具调用数: ${detail.toolCount}`);
        console.log(`   包含网络搜索: ${detail.hasWebSearch ? '是' : '否'}`);
        console.log(`   消息包含搜索内容: ${detail.messageContainsSearch ? '是' : '否'}`);
      } else {
        console.log(`   错误: ${detail.error}`);
      }
    });

    console.log('\n' + '='.repeat(60));
  }
}

/**
 * 主函数
 */
async function main() {
  const tester = new WebSearchTester();

  try {
    await tester.runAllTests();
  } catch (error) {
    Logger.error('测试过程中发生错误', error);
    process.exit(1);
  }
}

// 运行测试
main();

export { WebSearchTester, CONFIG };

