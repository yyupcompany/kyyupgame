import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:5173/notifications', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// 测试明亮主题
await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'light');
  document.body.setAttribute('data-theme', 'light');
  document.body.className = 'theme-workbench theme-light';
});
await page.waitForTimeout(500);

const lightVars = await page.evaluate(() => ({
  '--primary-color': getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
  '--bg-primary': getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
  '--text-primary': getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
}));
console.log('明亮主题 (light):', JSON.stringify(lightVars, null, 2));

// 测试暗黑主题
await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.className = 'theme-workbench theme-dark';
});
await page.waitForTimeout(500);

const darkVars = await page.evaluate(() => ({
  '--primary-color': getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
  '--bg-primary': getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
  '--text-primary': getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
}));
console.log('\n暗黑主题 (dark):', JSON.stringify(darkVars, null, 2));

// 测试明亮玻璃台主题
await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'glass-light');
  document.body.setAttribute('data-theme', 'glass-light');
  document.body.className = 'theme-workbench';
});
await page.waitForTimeout(500);

const glassLightVars = await page.evaluate(() => ({
  '--primary-color': getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
  '--bg-primary': getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
  '--text-primary': getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
}));
console.log('\n明亮玻璃台主题 (glass-light):', JSON.stringify(glassLightVars, null, 2));

// 测试暗黑玻璃台主题
await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'glass-dark');
  document.body.setAttribute('data-theme', 'glass-dark');
  document.body.className = 'theme-workbench';
});
await page.waitForTimeout(500);

const glassDarkVars = await page.evaluate(() => ({
  '--primary-color': getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
  '--bg-primary': getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
  '--text-primary': getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
}));
console.log('\n暗黑玻璃台主题 (glass-dark):', JSON.stringify(glassDarkVars, null, 2));

await browser.close();
console.log('\n✅ 测试完成');
