const { chromium } = require('playwright');

async function inspectLoginPage() {
  console.log('🔍 详细检查登录页面信息...');

  const browser = await chromium.launch({ headless: false }); // 暂时用有头模式查看

  try {
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(3000);

    // 截图保存
    await page.screenshot({ path: 'login-page-screenshot.png', fullPage: true });
    console.log('📸 登录页面截图已保存到 login-page-screenshot.png');

    // 获取页面HTML内容
    const pageContent = await page.content();
    const fs = require('fs');
    fs.writeFileSync('login-page-content.html', pageContent);
    console.log('📄 登录页面HTML已保存到 login-page-content.html');

    // 查找所有文本内容
    const allText = await page.evaluate(() => {
      return document.body.innerText;
    });

    console.log('\n📝 页面完整文本内容:');
    console.log('=' .repeat(50));
    console.log(allText);
    console.log('=' .repeat(50));

    // 查找可能包含账号信息的元素
    const usefulInfo = await page.evaluate(() => {
      const results = [];

      // 查找所有可能包含提示信息的元素
      const elements = document.querySelectorAll('*');

      elements.forEach(el => {
        const text = el.textContent?.trim();
        const tagName = el.tagName.toLowerCase();
        const className = el.className;
        const id = el.id;

        if (text && text.length > 5 && text.length < 200 &&
            (text.includes('test') ||
             text.includes('demo') ||
             text.includes('admin') ||
             text.includes('123') ||
             text.includes('默认') ||
             text.includes('账号') ||
             text.includes('密码') ||
             text.includes('用户') ||
             text.includes('提示'))) {

          results.push({
            tag: tagName,
            className: className,
            id: id,
            text: text,
            visible: el.offsetWidth > 0 && el.offsetHeight > 0
          });
        }
      });

      return results;
    });

    if (usefulInfo.length > 0) {
      console.log('\n💡 发现有用信息:');
      usefulInfo.forEach((info, index) => {
        console.log(`\n${index + 1}. 元素信息:`);
        console.log(`   标签: ${info.tag}`);
        console.log(`   类名: ${info.className}`);
        console.log(`   ID: ${info.id}`);
        console.log(`   可见: ${info.visible}`);
        console.log(`   文本: ${info.text}`);
      });
    }

    // 查找表单结构
    const formInfo = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const results = [];

      forms.forEach((form, formIndex) => {
        const inputs = form.querySelectorAll('input');
        const buttons = form.querySelectorAll('button, .el-button');

        const formData = {
          index: formIndex,
          action: form.action,
          method: form.method,
          inputs: [],
          buttons: []
        };

        inputs.forEach(input => {
          formData.inputs.push({
            type: input.type,
            name: input.name,
            placeholder: input.placeholder,
            required: input.required,
            id: input.id,
            className: input.className
          });
        });

        buttons.forEach(button => {
          formData.buttons.push({
            type: button.type,
            text: button.textContent?.trim(),
            className: button.className,
            id: button.id
          });
        });

        results.push(formData);
      });

      return results;
    });

    console.log('\n📋 表单结构分析:');
    formInfo.forEach((form, index) => {
      console.log(`\n表单 ${index + 1}:`);
      console.log(`  Action: ${form.action}`);
      console.log(`  Method: ${form.method}`);
      console.log(`  输入字段: ${form.inputs.length}`);
      form.inputs.forEach(input => {
        console.log(`    - ${input.type}: ${input.placeholder || input.name || input.id}`);
      });
      console.log(`  按钮: ${form.buttons.length}`);
      form.buttons.forEach(button => {
        console.log(`    - ${button.text || button.type}: ${button.className}`);
      });
    });

    // 尝试点击注册按钮
    const registerButton = await page.$('button:has-text("注册"), a:has-text("注册"), .register-btn');
    if (registerButton) {
      console.log('\n🔘 发现注册按钮，尝试点击...');
      await registerButton.click();
      await page.waitForTimeout(3000);

      // 检查是否跳转到注册页面
      const currentUrl = page.url();
      if (currentUrl.includes('register') || currentUrl.includes('signup')) {
        console.log('✅ 成功跳转到注册页面:', currentUrl);
        await page.screenshot({ path: 'register-page-screenshot.png', fullPage: true });
        console.log('📸 注册页面截图已保存到 register-page-screenshot.png');
      }
    }

  } catch (error) {
    console.error('❌ 检查登录页面时出错:', error);
  } finally {
    await browser.close();
  }
}

// 运行检查
inspectLoginPage();