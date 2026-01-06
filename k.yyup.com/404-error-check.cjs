const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class System404ErrorChecker {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.errors = [];
    this.networkErrors = [];
    this.screenshots = [];
    this.checkedUrls = new Set();
  }

  async init() {
    this.browser = await chromium.launch({ 
      headless: true, 
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true
    });
    this.page = await this.context.newPage();

    // Monitor network requests for 404 errors
    this.page.on('response', async (response) => {
      if (response.status() === 404) {
        this.networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString(),
          page: this.page.url()
        });
        console.log(`❌ 404 Network Error: ${response.url()}`);
      }
    });

    // Monitor console errors
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
  }

  async login() {
    console.log('🔐 Logging in to the system...');
    await this.page.goto('http://k.yyup.cc');
    await this.page.waitForLoadState('networkidle');

    // Check if already logged in
    if (this.page.url().includes('/dashboard') || this.page.url().includes('/principal')) {
      console.log('✅ Already logged in');
      return;
    }

    // Wait for login form
    await this.page.waitForSelector('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]', { timeout: 10000 });
    
    // Fill login form
    const usernameField = await this.page.locator('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]').first();
    await usernameField.fill('admin');
    
    const passwordField = await this.page.locator('input[type="password"], input[placeholder*="密码"]').first();
    await passwordField.fill('admin123');
    
    // Submit login
    const loginButton = await this.page.locator('button[type="submit"], button:has-text("登录"), button:has-text("登陆")').first();
    await loginButton.click();
    
    // Wait for navigation after login
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('✅ Login successful');
  }

  async takeScreenshot(name, description) {
    const screenshotPath = `/home/devbox/project/screenshots/404-check-${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.screenshots.push({
      name,
      description,
      path: screenshotPath,
      timestamp: new Date().toISOString()
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }

  async checkPageFor404(url, description) {
    if (this.checkedUrls.has(url)) {
      console.log(`⏭️ Skipping already checked: ${url}`);
      return;
    }

    this.checkedUrls.add(url);
    console.log(`🔍 Checking: ${description} - ${url}`);
    
    try {
      const response = await this.page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      
      if (response && response.status() === 404) {
        this.errors.push({
          type: 'Page 404',
          url,
          description,
          status: response.status(),
          timestamp: new Date().toISOString()
        });
        await this.takeScreenshot(`404-page-${description.replace(/\s+/g, '-')}`, `404 Error on ${description}`);
        console.log(`❌ 404 Error: ${description}`);
      } else if (response && response.status() >= 400) {
        this.errors.push({
          type: 'HTTP Error',
          url,
          description,
          status: response.status(),
          timestamp: new Date().toISOString()
        });
        console.log(`⚠️ HTTP Error ${response.status()}: ${description}`);
      } else {
        console.log(`✅ OK: ${description}`);
      }

      // Check for error content on the page
      const errorIndicators = [
        'text=404',
        'text="Not Found"',
        'text="页面不存在"',
        'text="未找到页面"',
        '.error-page',
        '[class*="error"]'
      ];

      for (const indicator of errorIndicators) {
        const errorElement = await this.page.locator(indicator).first();
        if (await errorElement.isVisible().catch(() => false)) {
          this.errors.push({
            type: 'Content Error',
            url,
            description,
            indicator,
            timestamp: new Date().toISOString()
          });
          await this.takeScreenshot(`content-error-${description.replace(/\s+/g, '-')}`, `Content Error on ${description}`);
          console.log(`❌ Content Error: ${description} (${indicator})`);
          break;
        }
      }

    } catch (error) {
      this.errors.push({
        type: 'Navigation Error',
        url,
        description,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`❌ Navigation Error: ${description} - ${error.message}`);
    }

    await this.page.waitForTimeout(1000);
  }

  async testCRUDOperations(basePath, entityName) {
    console.log(`\n🔧 Testing CRUD operations for ${entityName}...`);
    
    // Test LIST (Read)
    await this.checkPageFor404(`http://k.yyup.cc${basePath}`, `${entityName} List Page`);
    
    // Test CREATE
    await this.checkPageFor404(`http://k.yyup.cc${basePath}/create`, `${entityName} Create Page`);
    await this.checkPageFor404(`http://k.yyup.cc${basePath}/add`, `${entityName} Add Page`);
    await this.checkPageFor404(`http://k.yyup.cc${basePath}/new`, `${entityName} New Page`);
    
    // Test EDIT/UPDATE (with common ID patterns)
    const testIds = ['1', '123', 'edit'];
    for (const id of testIds) {
      await this.checkPageFor404(`http://k.yyup.cc${basePath}/${id}`, `${entityName} Detail Page (ID: ${id})`);
      await this.checkPageFor404(`http://k.yyup.cc${basePath}/${id}/edit`, `${entityName} Edit Page (ID: ${id})`);
      await this.checkPageFor404(`http://k.yyup.cc${basePath}/edit/${id}`, `${entityName} Edit Page Alt (ID: ${id})`);
    }
  }

  async runComprehensiveCheck() {
    console.log('🚀 Starting comprehensive 404 error check...\n');

    // Create screenshots directory
    const screenshotsDir = '/home/devbox/project/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await this.init();
    await this.login();

    // 1. Dashboard Pages
    console.log('\n📊 Testing Dashboard Pages...');
    await this.checkPageFor404('http://k.yyup.cc/dashboard', 'Main Dashboard');
    await this.checkPageFor404('http://k.yyup.cc/principal/dashboard', 'Principal Dashboard');
    await this.checkPageFor404('http://k.yyup.cc/dashboard/analytics', 'Analytics Dashboard');
    await this.checkPageFor404('http://k.yyup.cc/dashboard/performance', 'Performance Dashboard');
    await this.checkPageFor404('http://k.yyup.cc/dashboard/statistics', 'Statistics Dashboard');

    // 2. User Management
    console.log('\n👥 Testing User Management...');
    await this.testCRUDOperations('/admin/users', 'User Management');
    await this.testCRUDOperations('/admin/roles', 'Role Management');
    await this.testCRUDOperations('/admin/permissions', 'Permission Management');
    await this.checkPageFor404('http://k.yyup.cc/system/users', 'System Users');
    await this.checkPageFor404('http://k.yyup.cc/system/roles', 'System Roles');

    // 3. Student Management
    console.log('\n👨‍🎓 Testing Student Management...');
    await this.testCRUDOperations('/students', 'Student Management');
    await this.testCRUDOperations('/student', 'Student Alt');
    await this.checkPageFor404('http://k.yyup.cc/student/analytics', 'Student Analytics');
    await this.checkPageFor404('http://k.yyup.cc/student/detail', 'Student Detail');
    await this.checkPageFor404('http://k.yyup.cc/student/growth', 'Student Growth');

    // 4. Teacher Management
    console.log('\n👩‍🏫 Testing Teacher Management...');
    await this.testCRUDOperations('/teachers', 'Teacher Management');
    await this.testCRUDOperations('/teacher', 'Teacher Alt');
    await this.checkPageFor404('http://k.yyup.cc/teacher/performance', 'Teacher Performance');
    await this.checkPageFor404('http://k.yyup.cc/teacher/evaluation', 'Teacher Evaluation');
    await this.checkPageFor404('http://k.yyup.cc/teacher/development', 'Teacher Development');
    await this.checkPageFor404('http://k.yyup.cc/teacher/customers', 'Teacher Customers');

    // 5. Class Management
    console.log('\n🏫 Testing Class Management...');
    await this.testCRUDOperations('/classes', 'Class Management');
    await this.testCRUDOperations('/class', 'Class Alt');
    await this.checkPageFor404('http://k.yyup.cc/class/analytics', 'Class Analytics');
    await this.checkPageFor404('http://k.yyup.cc/class/optimization', 'Class Optimization');
    await this.checkPageFor404('http://k.yyup.cc/class/smart-management', 'Smart Class Management');

    // 6. Activity Management
    console.log('\n🎯 Testing Activity Management...');
    await this.testCRUDOperations('/activities', 'Activity Management');
    await this.testCRUDOperations('/activity', 'Activity Alt');
    await this.checkPageFor404('http://k.yyup.cc/activity/create', 'Activity Create');
    await this.checkPageFor404('http://k.yyup.cc/activity/analytics', 'Activity Analytics');
    await this.checkPageFor404('http://k.yyup.cc/activity/evaluation', 'Activity Evaluation');
    await this.checkPageFor404('http://k.yyup.cc/activity/plan', 'Activity Plan');

    // 7. Enrollment Management
    console.log('\n📝 Testing Enrollment Management...');
    await this.testCRUDOperations('/enrollment', 'Enrollment Management');
    await this.testCRUDOperations('/enrollment-plan', 'Enrollment Plan');
    await this.checkPageFor404('http://k.yyup.cc/enrollment-plan/statistics', 'Enrollment Statistics');
    await this.checkPageFor404('http://k.yyup.cc/enrollment-plan/quota-manage', 'Quota Management');
    await this.checkPageFor404('http://k.yyup.cc/enrollment/automated-follow-up', 'Automated Follow-up');

    // 8. Parent Management
    console.log('\n👪 Testing Parent Management...');
    await this.testCRUDOperations('/parents', 'Parent Management');
    await this.testCRUDOperations('/parent', 'Parent Alt');
    await this.checkPageFor404('http://k.yyup.cc/parent/communication', 'Parent Communication');
    await this.checkPageFor404('http://k.yyup.cc/parent/feedback', 'Parent Feedback');

    // 9. AI Assistant
    console.log('\n🤖 Testing AI Assistant...');
    await this.checkPageFor404('http://k.yyup.cc/ai', 'AI Assistant');
    await this.checkPageFor404('http://k.yyup.cc/ai/chat', 'AI Chat');
    await this.checkPageFor404('http://k.yyup.cc/ai/assistant', 'AI Assistant Page');

    // 10. System Settings and Logs
    console.log('\n⚙️ Testing System Settings...');
    await this.testCRUDOperations('/system', 'System Management');
    await this.checkPageFor404('http://k.yyup.cc/system/settings', 'System Settings');
    await this.checkPageFor404('http://k.yyup.cc/system/logs', 'System Logs');
    await this.checkPageFor404('http://k.yyup.cc/system/backup', 'System Backup');
    await this.checkPageFor404('http://k.yyup.cc/system/maintenance', 'System Maintenance');

    // 11. Marketing and Analytics
    console.log('\n📈 Testing Marketing and Analytics...');
    await this.testCRUDOperations('/marketing', 'Marketing Management');
    await this.checkPageFor404('http://k.yyup.cc/analytics', 'Analytics');
    await this.checkPageFor404('http://k.yyup.cc/principal/marketing-analysis', 'Marketing Analysis');

    // 12. Customer Management
    console.log('\n👥 Testing Customer Management...');
    await this.testCRUDOperations('/customer', 'Customer Management');
    await this.checkPageFor404('http://k.yyup.cc/principal/customer-pool', 'Customer Pool');

    // 13. Application Management
    console.log('\n📋 Testing Application Management...');
    await this.testCRUDOperations('/application', 'Application Management');
    await this.checkPageFor404('http://k.yyup.cc/application/review', 'Application Review');
    await this.checkPageFor404('http://k.yyup.cc/application/interview', 'Application Interview');

    console.log('\n✅ Comprehensive 404 check completed!');
    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecked: this.checkedUrls.size,
        pageErrors: this.errors.length,
        networkErrors: this.networkErrors.length,
        screenshots: this.screenshots.length
      },
      pageErrors: this.errors,
      networkErrors: this.networkErrors,
      screenshots: this.screenshots,
      checkedUrls: Array.from(this.checkedUrls)
    };

    const reportPath = '/home/devbox/project/404-error-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable report
    let humanReport = `# 404 Error Check Report
Generated: ${new Date().toISOString()}

## Summary
- Total URLs Checked: ${report.summary.totalChecked}
- Page Errors Found: ${report.summary.pageErrors}
- Network 404 Errors: ${report.summary.networkErrors}
- Screenshots Taken: ${report.summary.screenshots}

## Page Errors
`;

    if (this.errors.length === 0) {
      humanReport += 'No page errors found! ✅\n\n';
    } else {
      this.errors.forEach((error, index) => {
        humanReport += `${index + 1}. **${error.type}**: ${error.description}
   - URL: ${error.url}
   - Status: ${error.status || 'N/A'}
   - Timestamp: ${error.timestamp}
   ${error.error ? `- Error: ${error.error}` : ''}
   ${error.indicator ? `- Indicator: ${error.indicator}` : ''}

`;
      });
    }

    humanReport += `## Network 404 Errors
`;

    if (this.networkErrors.length === 0) {
      humanReport += 'No network 404 errors found! ✅\n\n';
    } else {
      this.networkErrors.forEach((error, index) => {
        humanReport += `${index + 1}. **${error.status}**: ${error.url}
   - Page: ${error.page}
   - Timestamp: ${error.timestamp}

`;
      });
    }

    const humanReportPath = '/home/devbox/project/404-error-report.md';
    fs.writeFileSync(humanReportPath, humanReport);

    console.log(`\n📊 Report generated:`);
    console.log(`- JSON Report: ${reportPath}`);
    console.log(`- Human Report: ${humanReportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`- Total URLs Checked: ${report.summary.totalChecked}`);
    console.log(`- Page Errors: ${report.summary.pageErrors}`);
    console.log(`- Network 404 Errors: ${report.summary.networkErrors}`);
    console.log(`- Screenshots: ${report.summary.screenshots}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the comprehensive check
async function main() {
  const checker = new System404ErrorChecker();
  try {
    await checker.runComprehensiveCheck();
  } catch (error) {
    console.error('Error during 404 check:', error);
    await checker.cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = System404ErrorChecker;