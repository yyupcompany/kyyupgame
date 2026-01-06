/**
 * 快速测试脚本 - 测试API频率限制修复
 */

const DynamicErrorMonitor = require('./dynamic-error-monitor.cjs');

class QuickTest {
  constructor() {
    this.monitor = new DynamicErrorMonitor();
    // 只测试几个关键页面
    this.monitor.testRoutes = [
      '/dashboard',
      '/system/users',
      '/student'
    ];
  }

  async runQuickTest() {
    console.log('🚀 开始快速测试...');
    
    try {
      const result = await this.monitor.runFullTest();
      
      console.log('\n🎯 快速测试结果:');
      console.log(`- 总页面数: ${result.summary.totalPages}`);
      console.log(`- 成功页面: ${result.summary.successfulPages}`);
      console.log(`- 失败页面: ${result.summary.failedPages}`);
      console.log(`- API调用数: ${result.summary.totalApiCalls}`);
      console.log(`- 平均加载时间: ${Math.round(result.summary.averageLoadTime)}ms`);
      
      // 检查API频率限制问题
      const rateLimitErrors = result.pageResults
        .flatMap(page => page.errors)
        .filter(error => error.message && error.message.includes('429'));
      
      console.log(`- API频率限制错误: ${rateLimitErrors.length}`);
      
      if (rateLimitErrors.length > 0) {
        console.log('⚠️ 仍有API频率限制问题，需要进一步优化');
      } else {
        console.log('✅ API频率限制问题已解决');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 快速测试失败:', error);
      throw error;
    }
  }
}

// 运行快速测试
if (require.main === module) {
  const test = new QuickTest();
  
  test.runQuickTest()
    .then(() => {
      console.log('✅ 快速测试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 快速测试失败:', error);
      process.exit(1);
    });
}

module.exports = QuickTest;