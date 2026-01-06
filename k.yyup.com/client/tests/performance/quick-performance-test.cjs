/**
 * 快速性能测试 - 只测试关键页面
 */

const { PagePerformanceTest } = require('./page-performance-test.cjs');

class QuickPerformanceTest extends PagePerformanceTest {
  constructor() {
    super();
    
    // 关键页面列表
    this.keyPages = [
      { name: 'Login', path: '/login', module: '用户认证' },
      { name: 'Dashboard', path: '/dashboard', module: '仪表板' },
      { name: 'AICenter', path: '/centers/AICenter', module: '中心页面' },
      { name: 'ActivityCenter', path: '/centers/ActivityCenter', module: '中心页面' },
      { name: 'EnrollmentCenter', path: '/centers/EnrollmentCenter', module: '中心页面' },
      { name: 'TeachingCenter', path: '/centers/TeachingCenter', module: '中心页面' },
      { name: 'SystemCenter', path: '/centers/SystemCenter', module: '中心页面' },
      { name: 'StudentList', path: '/education/students', module: '教育管理' },
      { name: 'TeacherList', path: '/education/teachers', module: '教育管理' },
      { name: 'ClassList', path: '/education/classes', module: '教育管理' }
    ];
  }

  /**
   * 加载页面配置 - 覆盖父类方法，只返回关键页面
   */
  loadPageConfigs() {
    console.log(`✅ 快速测试模式：测试 ${this.keyPages.length} 个关键页面`);
    return this.keyPages;
  }

  /**
   * 运行快速测试
   */
  async runQuickTest() {
    return await this.run();
  }
}

module.exports = { QuickPerformanceTest };

// 如果直接运行此文件
if (require.main === module) {
  const test = new QuickPerformanceTest();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  if (args.includes('--headless')) {
    test.config.headless = true;
  }
  if (args.includes('--headed')) {
    test.config.headless = false;
  }
  
  test.runQuickTest()
    .then(() => {
      console.log('\n✅ 快速测试完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 测试失败:', error);
      process.exit(1);
    });
}

