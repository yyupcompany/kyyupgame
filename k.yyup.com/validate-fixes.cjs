const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class FixValidationTester {
  constructor() {
    this.baseURL = 'http://localhost:5173';
    this.testPages = [
      { name: '仪表盘', path: '/dashboard', key: 'dashboard' },
      { name: '用户管理', path: '/system/user', key: 'userManagement' },
      { name: '角色管理', path: '/system/role', key: 'roleManagement' },
      { name: '菜单管理', path: '/system/menu', key: 'menuManagement' },
      { name: '部门管理', path: '/system/dept', key: 'deptManagement' }
    ];
    
    this.validationResults = {
      beforeFix: {},
      afterFix: {},
      improvements: {},
      summary: {
        totalErrorsBefore: 0,
        totalErrorsAfter: 0,
        improvementRate: 0,
        fixedPages: 0,
        remainingIssues: []
      }
    };
  }

  async loadPreviousReport() {
    try {
      const reportContent = await fs.readFile('./test-group1-report.json', 'utf8');
      const report = JSON.parse(reportContent);
      
      // 提取之前的错误数据
      Object.entries(report.pages).forEach(([key, page]) => {
        this.validationResults.beforeFix[key] = {
          consoleErrors: page.consoleErrors.length,
          apiErrors: page.apiErrors.length,
          layoutIssues: page.layoutIssues.length,
          dataIssues: page.dataIssues.length,
          total: page.consoleErrors.length + page.apiErrors.length + 
                 page.layoutIssues.length + page.dataIssues.length
        };
        this.validationResults.summary.totalErrorsBefore += this.validationResults.beforeFix[key].total;
      });
      
      console.log(`加载了之前的测试报告，总错误数: ${this.validationResults.summary.totalErrorsBefore}`);
    } catch (error) {
      console.log('没有找到之前的测试报告，将进行全新测试');
    }
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    this.page.setDefaultTimeout(30000);
    
    // 错误收集器
    this.currentErrors = {
      console: [],
      api: [],
      page: []
    };
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.currentErrors.console.push({
          text: msg.text(),
          location: msg.location()
        });
      }
    });
    
    this.page.on('pageerror', error => {
      this.currentErrors.page.push({
        message: error.message,
        stack: error.stack
      });
    });
    
    this.page.on('response', response => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        this.currentErrors.api.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
  }

  async login() {
    console.log('正在登录...');
    await this.page.goto(`${this.baseURL}/login`, { waitUntil: 'networkidle0' });
    await this.page.type('input[placeholder*="账号"]', 'admin');
    await this.page.type('input[placeholder*="密码"]', 'admin123');
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('登录成功');
  }

  async validatePage(pageInfo) {
    console.log(`\n验证页面: ${pageInfo.name}`);
    
    // 重置错误收集器
    this.currentErrors = {
      console: [],
      api: [],
      page: []
    };
    
    try {
      await this.page.goto(`${this.baseURL}${pageInfo.path}`, { 
        waitUntil: 'networkidle0',
        timeout: 20000 
      });
      
      await this.page.waitForTimeout(3000);
      
      // 检查页面基本功能
      const functionalityCheck = await this.page.evaluate(() => {
        const checks = {
          hasContent: false,
          hasInteractiveElements: false,
          hasData: false,
          loadingComplete: true
        };
        
        // 检查内容
        const mainContent = document.querySelector('.main-content, .content, main, .el-main');
        checks.hasContent = mainContent && mainContent.children.length > 0;
        
        // 检查交互元素
        const buttons = document.querySelectorAll('button:not([disabled])');
        checks.hasInteractiveElements = buttons.length > 0;
        
        // 检查数据
        const tables = document.querySelectorAll('table tbody tr, .el-table__row');
        checks.hasData = tables.length > 0;
        
        // 检查加载状态
        const loadingMasks = document.querySelectorAll('.el-loading-mask:not(.is-fullscreen)');
        checks.loadingComplete = loadingMasks.length === 0;
        
        return checks;
      });
      
      // 记录结果
      this.validationResults.afterFix[pageInfo.key] = {
        consoleErrors: this.currentErrors.console.length,
        apiErrors: this.currentErrors.api.length,
        pageErrors: this.currentErrors.page.length,
        functionalityCheck: functionalityCheck,
        total: this.currentErrors.console.length + 
               this.currentErrors.api.length + 
               this.currentErrors.page.length
      };
      
      // 计算改进
      if (this.validationResults.beforeFix[pageInfo.key]) {
        const before = this.validationResults.beforeFix[pageInfo.key].total;
        const after = this.validationResults.afterFix[pageInfo.key].total;
        const improvement = before > 0 ? ((before - after) / before * 100).toFixed(2) : 0;
        
        this.validationResults.improvements[pageInfo.key] = {
          before: before,
          after: after,
          improvementRate: `${improvement}%`,
          status: after === 0 ? '✅ 完全修复' : '⚠️ 部分修复'
        };
        
        if (after === 0) {
          this.validationResults.summary.fixedPages++;
        }
      }
      
      this.validationResults.summary.totalErrorsAfter += 
        this.validationResults.afterFix[pageInfo.key].total;
      
      // 记录剩余问题
      if (this.currentErrors.console.length > 0 || 
          this.currentErrors.api.length > 0 || 
          this.currentErrors.page.length > 0) {
        this.validationResults.summary.remainingIssues.push({
          page: pageInfo.name,
          issues: {
            console: this.currentErrors.console,
            api: this.currentErrors.api,
            page: this.currentErrors.page
          }
        });
      }
      
      // 截图
      await this.page.screenshot({ 
        path: `./validation-screenshots/${pageInfo.key}-after.png`,
        fullPage: true 
      });
      
    } catch (error) {
      console.error(`验证页面失败: ${error.message}`);
      this.validationResults.afterFix[pageInfo.key] = {
        error: error.message,
        total: 999 // 表示验证失败
      };
    }
  }

  async generateValidationReport() {
    // 计算总体改进率
    if (this.validationResults.summary.totalErrorsBefore > 0) {
      const improvement = (
        (this.validationResults.summary.totalErrorsBefore - 
         this.validationResults.summary.totalErrorsAfter) / 
        this.validationResults.summary.totalErrorsBefore * 100
      ).toFixed(2);
      this.validationResults.summary.improvementRate = `${improvement}%`;
    }
    
    const report = {
      validationTime: new Date().toISOString(),
      summary: this.validationResults.summary,
      pageDetails: this.validationResults.improvements,
      remainingIssues: this.validationResults.summary.remainingIssues,
      recommendations: this.generateRecommendations()
    };
    
    await fs.writeFile(
      './validation-report.json',
      JSON.stringify(report, null, 2)
    );
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.validationResults.summary.totalErrorsAfter === 0) {
      recommendations.push('🎉 所有错误已完全修复！可以继续处理下一组页面。');
    } else {
      recommendations.push('还有一些问题需要进一步处理：');
      
      // 分析剩余问题类型
      const remainingTypes = new Set();
      this.validationResults.summary.remainingIssues.forEach(issue => {
        if (issue.issues.console.length > 0) remainingTypes.add('控制台错误');
        if (issue.issues.api.length > 0) remainingTypes.add('API错误');
        if (issue.issues.page.length > 0) remainingTypes.add('页面错误');
      });
      
      remainingTypes.forEach(type => {
        recommendations.push(`- 需要进一步修复${type}`);
      });
      
      recommendations.push('- 可能需要手动检查和调试特定问题');
      recommendations.push('- 某些问题可能需要后端配合解决');
    }
    
    return recommendations;
  }

  async run() {
    console.log('开始验证修复效果...\n');
    
    // 创建截图目录
    await fs.mkdir('./validation-screenshots', { recursive: true });
    
    // 加载之前的报告
    await this.loadPreviousReport();
    
    // 初始化浏览器
    await this.init();
    await this.login();
    
    // 验证每个页面
    for (const pageInfo of this.testPages) {
      await this.validatePage(pageInfo);
    }
    
    // 生成验证报告
    const report = await this.generateValidationReport();
    
    // 打印结果
    console.log('\n=== 验证结果摘要 ===');
    console.log(`修复前错误总数: ${report.summary.totalErrorsBefore}`);
    console.log(`修复后错误总数: ${report.summary.totalErrorsAfter}`);
    console.log(`总体改进率: ${report.summary.improvementRate}`);
    console.log(`完全修复的页面: ${report.summary.fixedPages}/5`);
    
    console.log('\n=== 各页面改进详情 ===');
    Object.entries(report.pageDetails).forEach(([key, detail]) => {
      console.log(`${key}: ${detail.before} → ${detail.after} (${detail.improvementRate}) ${detail.status}`);
    });
    
    if (report.recommendations.length > 0) {
      console.log('\n=== 建议 ===');
      report.recommendations.forEach(rec => console.log(rec));
    }
    
    console.log('\n详细报告已保存: validation-report.json');
    
    await this.browser.close();
    return report;
  }
}

// 执行验证
const validator = new FixValidationTester();
validator.run().catch(console.error);