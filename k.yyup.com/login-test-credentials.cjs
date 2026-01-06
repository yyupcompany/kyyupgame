const { chromium } = require('playwright');
const fs = require('fs');

// 常见的测试用户名和密码组合
const testCredentials = [
  { username: 'admin', password: 'admin123' },
  { username: 'admin', password: '123456' },
  { username: 'admin', password: 'password' },
  { username: 'admin', password: 'admin' },
  { username: 'test', password: '123456' },
  { username: 'demo', password: '123456' },
  { username: 'root', password: 'admin' },
  { username: 'administrator', password: 'admin123' }
];

async function testLoginCredentials() {
  console.log('🔍 开始测试登录凭据...');

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    for (const credentials of testCredentials) {
      console.log(`\n🔑 测试凭据: ${credentials.username} / ${credentials.password}`);

      try {
        // 访问登录页面
        await page.goto('http://localhost:5173/login', {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        await page.waitForTimeout(1000);

        // 填写凭据
        await page.fill('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]', credentials.username);
        await page.fill('input[type="password"]', credentials.password);

        // 点击登录按钮
        const loginButton = await page.$('button[type="submit"], .el-button--primary, button:has-text("登录")');
        if (loginButton) {
          await loginButton.click();
        } else {
          await page.keyboard.press('Enter');
        }

        // 等待登录结果
        await page.waitForTimeout(3000);

        // 检查登录是否成功
        const currentUrl = page.url();
        const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
        const hasDashboard = await page.$('.dashboard, .main-content, .app-main') !== null;

        const loginSuccess = hasSidebar || hasDashboard || !currentUrl.includes('login');

        if (loginSuccess) {
          console.log(`✅ 登录成功！使用凭据: ${credentials.username} / ${credentials.password}`);
          console.log(`   最终URL: ${currentUrl}`);
          console.log(`   有侧边栏: ${hasSidebar}`);
          console.log(`   有仪表板: ${hasDashboard}`);

          // 保存成功的凭据
          const successInfo = {
            username: credentials.username,
            password: credentials.password,
            loginTime: new Date().toISOString(),
            finalUrl: currentUrl
          };

          fs.writeFileSync('successful-login-credentials.json', JSON.stringify(successInfo, null, 2));
          console.log('💾 凭据已保存到 successful-login-credentials.json');

          return credentials;
        } else {
          console.log(`❌ 登录失败`);

          // 检查是否有错误提示
          const errorElement = await page.$('.el-message--error, .error-message, .login-error');
          if (errorElement) {
            const errorText = await errorElement.textContent();
            console.log(`   错误信息: ${errorText}`);
          }
        }

      } catch (error) {
        console.log(`❌ 测试凭据时出错: ${error.message}`);
      }
    }

    console.log('\n🚫 所有测试凭据都失败了');
    return null;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return null;
  } finally {
    await browser.close();
  }
}

// 运行测试
testLoginCredentials().then(successfulCredentials => {
  if (successfulCredentials) {
    console.log(`\n🎉 找到有效凭据: ${successfulCredentials.username} / ${successfulCredentials.password}`);
  } else {
    console.log('\n💡 建议:');
    console.log('1. 检查数据库中是否有用户数据');
    console.log('2. 检查后端认证服务是否正常');
    console.log('3. 检查登录API端点是否正确');
  }
});