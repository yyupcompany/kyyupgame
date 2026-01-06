import { test, expect } from '@playwright/test';

test('Verify dark mode card styles', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:5173/Login');

  // Login with admin credentials
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();

  // Navigate to dashboard
  await page.goto('http://localhost:5173/dashboard');

  // Switch to dark mode
  // 假设页面上有一个暗黑模式开关的选择器，比如 .theme-switcher 或 #dark-mode-toggle
  // 这里需要根据实际页面结构调整选择器
  await page.locator('.theme-switcher').click();

  // Wait for dark mode to be applied
  await page.waitForSelector('body.dark');

  // Check the four cards
  const cards = await page.locator('.card');
  const cardCount = await cards.count();
  expect(cardCount).toBe(4);

  // Verify each card has dark background and proper border
  for (let i = 0; i < cardCount; i++) {
    const card = cards.nth(i);

    // Get background color
    const backgroundColor = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    console.log(`Card ${i+1} background color: ${backgroundColor}`);

    // Get border color
    const borderColor = await card.evaluate((el) => getComputedStyle(el).borderColor);
    console.log(`Card ${i+1} border color: ${borderColor}`);

    // Verify background is dark (approximate check)
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)'); // Not white
    expect(parseInt(backgroundColor.slice(4, -1).split(',')[0])).toBeLessThan(128); // R value < 128 (dark)

    // Verify border is not hard-coded white
    expect(borderColor).not.toBe('rgb(255, 255, 255)'); // Not white

    // You can add more specific checks based on your expected dark mode colors
  }
});
