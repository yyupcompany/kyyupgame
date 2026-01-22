/**
 * 综合测试：检查所有侧边栏页面
 */
const { chromium } = require('playwright');

const teacherMenus = [
  '/teacher-center/dashboard',
  '/teacher-center/notifications',
  '/teacher-center/tasks',
  '/teacher-center/activities',
  '/teacher-center/enrollment',
  '/teacher-center/teaching',
  '/teacher-center/customer-tracking',
  '/teacher-center/creative-curriculum',
  '/teacher-center/performance-rewards',
];

const parentMenus = [
  '/parent-center/dashboard',
  '/parent-center/children',
  '/parent-center/child-growth',
  '/parent-center/assessment',
  '/parent-center/games',
  '/parent-center/ai-assistant',
  '/parent-center/activities',
  '/parent-center/communication',
  '/parent-center/photo-album',
  '/parent-center/kindergarten-rewards',
  '/parent-center/notifications',
];

async function testSidebarPages() {
  console.log('🔄 启动浏览器...');
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allResults = { teacher: [], parent: [] };

  // 测试教师端
  console.log('\n👨‍🏫 教师登录...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.click('button:has-text("教师")');
  await page.waitForTimeout(3000);

  console.log('\n========== 教师端页面测试 ==========');
  for (const path of teacherMenus) {
    const name = path.split('/').pop();
    try {
      await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      const isEmpty = bodyText.trim().length < 30;
      const hasError = bodyText.includes('404') || bodyText.includes('不存在');

      if (isEmpty || hasError) {
        console.log(`  ❌ ${name}: 空页面或错误`);
        allResults.teacher.push({ name, status: 'error' });
      } else {
        console.log(`  ✅ ${name}: 正常`);
        allResults.teacher.push({ name, status: 'success' });
      }
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message.substring(0, 50)}`);
      allResults.teacher.push({ name, status: 'error', error: error.message });
    }
  }

  // 测试家长端
  console.log('\n👨‍👩‍👧 家长登录...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.click('button:has-text("家长")');
  await page.waitForTimeout(3000);

  console.log('\n========== 家长端页面测试 ==========');
  for (const path of parentMenus) {
    const name = path.split('/').pop();
    try {
      await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      const isEmpty = bodyText.trim().length < 30;
      const hasError = bodyText.includes('404') || bodyText.includes('不存在');

      if (isEmpty || hasError) {
        console.log(`  ❌ ${name}: 空页面或错误`);
        allResults.parent.push({ name, status: 'error' });
      } else {
        console.log(`  ✅ ${name}: 正常`);
        allResults.parent.push({ name, status: 'success' });
      }
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message.substring(0, 50)}`);
      allResults.parent.push({ name, status: 'error', error: error.message });
    }
  }

  // 总结
  console.log('\n\n========== 测试总结 ==========');
  const teacherSuccess = allResults.teacher.filter(r => r.status === 'success').length;
  const parentSuccess = allResults.parent.filter(r => r.status === 'success').length;
  console.log(`教师端: ${teacherSuccess}/${teacherMenus.length} 页面正常`);
  console.log(`家长端: ${parentSuccess}/${parentMenus.length} 页面正常`);

  if (teacherSuccess < teacherMenus.length) {
    console.log('\n教师端异常页面:');
    allResults.teacher.filter(r => r.status === 'error').forEach(r => {
      console.log(`  - ${r.name}`);
    });
  }

  if (parentSuccess < parentMenus.length) {
    console.log('\n家长端异常页面:');
    allResults.parent.filter(r => r.status === 'error').forEach(r => {
      console.log(`  - ${r.name}`);
    });
  }

  await browser.close();
  console.log('\n🎉 测试完成');
}

testSidebarPages().catch(console.error);
